import pg from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AsyncLocalStorage } from 'node:async_hooks';
import { executeProceduralRebirth } from '../engine/rebirthEngine.js';
import { initializeStartingNpcs } from '../engine/npcEngine.js';
import { setRngStateResolver, newSeed } from '../engine/rng.js';
import { applyWorldMemory } from '../engine/worldMemory.js';
import { SHARED_LINEAGE_SCHEMA } from './sharedLineageSchema.js';
import { assertNotSandbox, inSandbox } from '../engine/sandbox.js';

const { Pool } = pg;

let pool = null;
let useMock = true;

// =========================================================================
// DISK-BACKED CACHE (PERSISTENT ACROSS SHUTDOWNS / RESTARTS)
// =========================================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.LIFEGRAPH_DATA_DIR || path.resolve(__dirname, '../../data');
const CACHE_FILE = path.join(DATA_DIR, 'sessions_cache.json');

let isDirty = false;
let saveTimeout = null;

export function persistSessionsToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const serialized = JSON.stringify(Array.from(sessions.entries()), null, 2);
    const temporary = CACHE_FILE + '.tmp';
    fs.writeFileSync(temporary, serialized, { encoding: 'utf-8', mode: 0o600 });
    fs.renameSync(temporary, CACHE_FILE);
    isDirty = false;
  } catch (err) {
    console.error('[Storage Cache] Lỗi lưu sessions ra đĩa:', err.message);
  }
}

export function scheduleDiskPersist() {
  isDirty = true;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    persistSessionsToDisk();
  }, 1000);
}

// =========================================================================
// MULTI-SESSION ISOLATION (ASYNC LOCAL STORAGE + IN-MEMORY SESSIONS)
// =========================================================================
export const sessionContext = new AsyncLocalStorage();

export function getCurrentSessionId() {
  const store = sessionContext.getStore();
  return store?.sessionId || 'default';
}

const sessions = new Map();

// Seeded RNG bound to the current session: { seed, n } persists with the session cache.
setRngStateResolver(() => {
  const s = sessions.get(getCurrentSessionId());
  return s ? s.rng : null;
});

// Tự động load cache từ đĩa khi backend khởi động
try {
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const [key, val] of parsed) {
        sessions.set(key, val);
      }
      console.log(`[Storage Cache] Đã phục hồi thành công ${sessions.size} session từ cache đĩa.`);
    }
  }
} catch (err) {
  console.warn('[Storage Cache] Chưa có cache cũ hoặc lỗi đọc cache:', err.message);
}

// Tự động ghi định kỳ nếu có thay đổi
setInterval(() => {
  if (isDirty) {
    persistSessionsToDisk();
  }
}, 10000).unref();

// Đảm bảo lưu toàn vẹn khi tắt tiến trình (Ctrl+C, kill)
process.on('SIGINT', () => {
  persistSessionsToDisk();
  process.exit(0);
});
process.on('SIGTERM', () => {
  persistSessionsToDisk();
  process.exit(0);
});

/** Phiên cũ (tạo trước khi có xác thực chữ ký) còn trong cache và chưa được nhận lại bằng token. */
export function isUnclaimedLegacySession(id) {
  const s = sessions.get(id);
  return !!s && !s.claimed;
}
export function claimSession(id) {
  const s = sessions.get(id);
  if (s) { s.claimed = true; scheduleDiskPersist(); }
}

/**
 * Nhận lại phiên cũ (id thô, chưa có chữ ký) đúng MỘT LẦN.
 * Cache file: dùng cờ `claimed`. Postgres: một câu UPDATE nguyên tử trên player_accounts.claimed
 * (id do server cấp 'g_...' không bao giờ là phiên cũ).
 */
export async function claimLegacySession(id) {
  if (isUnclaimedLegacySession(id)) { claimSession(id); return true; }
  if (useMock || !pool || !id || id.startsWith('g_')) return false;
  try {
    const res = await pool.query('UPDATE player_accounts SET claimed = TRUE WHERE id = $1 AND claimed = FALSE RETURNING id', [id]);
    return res.rowCount === 1;
  } catch (err) {
    console.error('Error claiming legacy session:', err.message);
    return false;
  }
}

// =========================================================================
// ACCOUNTS (tên đăng nhập + mật khẩu -> session_id ổn định)
// Postgres: bảng accounts. Chế độ bộ nhớ: accounts.json trong DATA_DIR (tách khỏi sessions_cache.json).
// =========================================================================
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
let accountsMap = new Map(); // id -> account

function loadAccountsFromDisk() {
  accountsMap = new Map();
  try {
    if (!fs.existsSync(ACCOUNTS_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8'));
    if (Array.isArray(parsed)) for (const a of parsed) accountsMap.set(a.id, a);
  } catch (err) {
    console.warn('[Accounts] Không đọc được accounts.json:', err.message);
  }
}
function saveAccountsToDisk() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temporary = ACCOUNTS_FILE + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(Array.from(accountsMap.values())), { encoding: 'utf-8', mode: 0o600 });
  fs.chmodSync(temporary, 0o600);
  fs.renameSync(temporary, ACCOUNTS_FILE);
}
loadAccountsFromDisk();
/** Chỉ dùng cho test: đọc lại accounts.json từ đĩa. */
export async function reloadAccountsForTest() { loadAccountsFromDisk(); }

const normalizeAccountRow = r => r && ({
  id: r.id, username: r.username, pass_hash: r.pass_hash, salt: r.salt, session_id: r.session_id,
  created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
  token_epoch: Number(r.token_epoch) || 0
});

/** @returns {Promise<object|null>} null nếu tên đã tồn tại. */
export async function createAccount({ username, passHash, salt, sessionId }) {
  const account = { id: 'acc_' + crypto.randomUUID().replace(/-/g, ''), username, pass_hash: passHash, salt, session_id: sessionId, created_at: new Date().toISOString(), token_epoch: 0 };
  if (!useMock && pool) {
    try {
      await pool.query('INSERT INTO accounts (id, username, pass_hash, salt, session_id, created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [account.id, account.username, account.pass_hash, account.salt, account.session_id, account.created_at]);
      return account;
    } catch (err) {
      if (err.code === '23505') return null;
      throw err;
    }
  }
  for (const a of accountsMap.values()) if (a.username === username) return null;
  accountsMap.set(account.id, account);
  saveAccountsToDisk();
  return { ...account };
}

async function findAccount(column, value) {
  if (!useMock && pool) {
    const res = await pool.query(`SELECT * FROM accounts WHERE ${column} = $1`, [value]);
    return normalizeAccountRow(res.rows[0]) ?? null;
  }
  for (const a of accountsMap.values()) if (a[column] === value) return { ...a };
  return null;
}
export const getAccountByUsername = username => findAccount('username', username);
export const getAccountById = id => findAccount('id', id);
export const getAccountBySessionId = sessionId => findAccount('session_id', sessionId);

export async function setAccountSession(accountId, sessionId) {
  if (!useMock && pool) {
    try {
      const res = await pool.query('UPDATE accounts SET session_id = $1 WHERE id = $2', [sessionId, accountId]);
      return res.rowCount === 1;
    } catch (err) {
      if (err.code === '23505') return false;
      throw err;
    }
  }
  const a = accountsMap.get(accountId);
  if (!a) return false;
  for (const o of accountsMap.values()) if (o.id !== accountId && o.session_id === sessionId) return false;
  a.session_id = sessionId; saveAccountsToDisk();
  return true;
}

/** Tăng epoch để thu hồi mọi account token đã cấp (đăng xuất). */
export async function bumpAccountEpoch(accountId) {
  if (!useMock && pool) {
    await pool.query('UPDATE accounts SET token_epoch = token_epoch + 1 WHERE id = $1', [accountId]);
    return;
  }
  const a = accountsMap.get(accountId);
  if (a) { a.token_epoch = (a.token_epoch || 0) + 1; saveAccountsToDisk(); }
}

/** Phiên (của chính id đó) đã có nhân vật chưa. */
export function sessionHasCharacter(sessionId) {
  return sessionContext.run({ sessionId }, async () => !!(await getLatestCharacter()));
}

export function getSessionData(sessionId = null) {
  const id = sessionId || getCurrentSessionId();
  if (!sessions.has(id)) {
    sessions.set(id, {
      claimed: true,
      character: null, // New session begins with NULL character so user lands on Home & spins Gacha!
      assets: [],
      relationships: [],
      npcs: [],
      tickEvents: [],
      currentDilemma: null,
      playerAccount: {
        id: id,
        total_karma: 250,
        unlocked_perks: [],
        reincarnation_count: 0,
        lifetime_stats: {
          total_years_lived: 0,
          max_net_worth: 0,
          total_deaths: 0
        },
        ancestral_lineage: [
          {
            id: "founder_gen_1",
            // Bản ghi MẪU (ví dụ minh hoạ Gia Phả cho người mới) - KHÔNG phải tiền nhân thật của người chơi.
            // Frontend dùng cờ này để gắn nhãn "Gia phả mẫu" và loại khỏi số liệu thống kê thật.
            is_demo: true,
            generation: 1,
            name: "Vũ Chấn Hưng",
            nationality: "Việt Nam",
            age: 76,
            status: "ascended_nirvana",
            cause_of_passing: "Đắc Đạo Niết Bàn (Ascended to Nirvana)",
            max_net_worth: 1850000,
            cash: 240000,
            karma: 95,
            aspiration_title: "Khai Sáng & Đức Hạnh",
            epitaph_quote: "Thân tựa phù vân nơi trần thế, tâm an tĩnh tại giữa hư không. Dòng họ hưng vượng nhờ đức sáng muôn đời.",
            blessing: "+150 Nghiệp Lực Khởi Tổ & Hộ Mệnh Muôn Đời",
            recorded_at: new Date(Date.now() - 86400000 * 7).toISOString()
          }
        ]
      }
    });
  }
  return sessions.get(id);
}

export function seedInitialData(lineageParent = null, karmaPerks = {}) {
  const store = getSessionData();
  // Each new life gets its own seed (fixed seed only honoured under NODE_ENV=test).
  const seed = (process.env.NODE_ENV === 'test' && Number.isInteger(karmaPerks?.rng_seed)) ? (karmaPerks.rng_seed >>> 0) : newSeed();
  store.rng = { seed, n: 0 };
  const freshChar = executeProceduralRebirth(karmaPerks, lineageParent);
  freshChar.rng_seed = seed;
  store.character = freshChar;

  // Assets depending on background
  store.assets = [];
  if (freshChar.background_type === "super_rich") {
    store.assets.push({
      id: crypto.randomUUID(),
      character_id: freshChar.id,
      type: "real_estate",
      name: "Dinh thự gia tộc",
      current_value: 1500000,
      liquidity_status: "locked",
      maintenance_cost_per_tick: 5000
    });
    store.assets.push({
      id: crypto.randomUUID(),
      character_id: freshChar.id,
      type: "stock",
      name: "Cổ phần quỹ tín thác gia đình",
      current_value: 500000,
      liquidity_status: "liquid",
      maintenance_cost_per_tick: 200
    });
  } else if (freshChar.background_type === "middle_class") {
    store.assets.push({
      id: crypto.randomUUID(),
      character_id: freshChar.id,
      type: "real_estate",
      name: "Nhà phố gia đình",
      current_value: 80000,
      liquidity_status: "illiquid",
      maintenance_cost_per_tick: 400
    });
  }

  // Initial Family Relationships (Khởi tạo chuẩn Họ Tên, Quốc Gia & Tuổi Tác thực tế)
  store.relationships = [];
  if (freshChar.background_type !== "orphan" && freshChar.household) {
    if (freshChar.household.father_name) {
      store.relationships.push({
        id: crypto.randomUUID(),
        character_id: freshChar.id,
        type: "father",
        name: freshChar.household.father_name,
        age: (freshChar.age || 0) + (freshChar.household.father_age || 28),
        status: freshChar.household.father_status || "alive",
        affection_level: 85,
        monthly_cost: (freshChar.age || 0) < 18 ? 0 : 200
      });
    }
    if (freshChar.household.mother_name) {
      store.relationships.push({
        id: crypto.randomUUID(),
        character_id: freshChar.id,
        type: "mother",
        name: freshChar.household.mother_name,
        age: (freshChar.age || 0) + (freshChar.household.mother_age || 26),
        status: freshChar.household.mother_status || "alive",
        affection_level: 90,
        monthly_cost: (freshChar.age || 0) < 18 ? 0 : 150
      });
    }
  } else if (lineageParent) {
    store.relationships.push({
      id: crypto.randomUUID(),
      character_id: freshChar.id,
      type: "parent",
      name: lineageParent.name,
      age: (freshChar.age || 0) + 30,
      status: "alive",
      affection_level: 85,
      monthly_cost: (freshChar.age || 0) < 18 ? 0 : 250
    });
  }

  // Initial NPCs with memory tracking
  store.npcs = initializeStartingNpcs(freshChar);
  store.tickEvents = [];
  scheduleDiskPersist();

  return freshChar;
}

/** Cho sharedLineageStore: pool Postgres (null ở chế độ bộ nhớ) và thư mục dữ liệu. */
export function getStorageHandle() { return { pool: useMock ? null : pool, dataDir: DATA_DIR }; }

export async function initDb() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    try {
      pool = new Pool({ connectionString, connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 10000 });
      const client = await pool.connect();
      console.log('✅ [Database] Successfully connected to PostgreSQL.');
      client.release();
      // Persist extensible game state without assuming every runtime field is a SQL column.
      await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
      for (const table of ['characters', 'assets', 'relationships', 'npcs']) {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS state JSONB NOT NULL DEFAULT '{}'::jsonb`);
        // Thứ tự chèn ổn định: kết quả game (RNG có seed) phụ thuộc thứ tự duyệt tài sản/quan hệ/NPC.
        await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS seq BIGSERIAL`);
      }
      await pool.query("ALTER TABLE player_accounts ADD COLUMN IF NOT EXISTS ancestral_lineage JSONB NOT NULL DEFAULT '[]'::jsonb");
      // claimed=false (mặc định cho hàng có sẵn) = phiên cũ chưa được nhận lại bằng token ký.
      await pool.query('ALTER TABLE player_accounts ADD COLUMN IF NOT EXISTS claimed BOOLEAN NOT NULL DEFAULT FALSE');
      await pool.query(`CREATE TABLE IF NOT EXISTS accounts (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        pass_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        session_id VARCHAR(100) NOT NULL UNIQUE,
        token_epoch INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`);
      await pool.query(SHARED_LINEAGE_SCHEMA);
      await pool.query(`CREATE TABLE IF NOT EXISTS whatif_snapshots (
        character_id TEXT NOT NULL,
        player_account_id VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        snap JSONB NOT NULL,
        PRIMARY KEY (character_id, age)
      )`);
      useMock = false;
      return;
    } catch (err) {
      console.warn('⚠️ [Database] Falling back to In-Memory DB Mode:', err.message);
      throw new Error('Configured database is unavailable; refusing to replace saved progress with a temporary session.', { cause: err });
    }
  } else {
    useMock = true;
  }
}

// Player Account (Meta Progression - Eternal Layer)
export async function getPlayerAccount() {
  if (useMock || !pool) {
    const store = getSessionData();
    return { ...store.playerAccount };
  }
  try {
    const res = await pool.query('SELECT * FROM player_accounts WHERE id = $1', [getCurrentSessionId()]);
    if (res.rows.length === 0) {
      const store = getSessionData();
      await pool.query(
        'INSERT INTO player_accounts (id, total_karma, unlocked_perks, reincarnation_count, lifetime_stats, claimed) VALUES ($1, $2, $3, $4, $5, TRUE)',
        [getCurrentSessionId(), store.playerAccount.total_karma, JSON.stringify(store.playerAccount.unlocked_perks), store.playerAccount.reincarnation_count, JSON.stringify(store.playerAccount.lifetime_stats)]
      );
      return { ...store.playerAccount };
    }
    return res.rows[0];
  } catch (err) {
    console.error('Error fetching player account:', err);
    const store = getSessionData();
    return { ...store.playerAccount };
  }
}

export async function updatePlayerAccount(fields) {
  assertNotSandbox('updatePlayerAccount');
  if (useMock || !pool) {
    const store = getSessionData();
    store.playerAccount = { ...store.playerAccount, ...fields };
    scheduleDiskPersist();
    return { ...store.playerAccount };
  }
  try {
    const setClauses = [];
    const values = [];
    let index = 1;
    for (const [key, value] of Object.entries(fields)) {
      setClauses.push(`${key} = $${index}`);
      values.push(typeof value === 'object' ? JSON.stringify(value) : value);
      index++;
    }
    values.push(getCurrentSessionId());
    const res = await pool.query(`UPDATE player_accounts SET ${setClauses.join(', ')} WHERE id = $${index} RETURNING *`, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error updating player account:', err);
    const store = getSessionData();
    store.playerAccount = { ...store.playerAccount, ...fields };
    scheduleDiskPersist();
    return { ...store.playerAccount };
  }
}

export async function addTotalKarma(deltaKarma) {
  assertNotSandbox('addTotalKarma');
  const account = await getPlayerAccount();
  const newKarma = Math.max(0, (account.total_karma || 0) + deltaKarma);
  return updatePlayerAccount({ total_karma: newKarma });
}

export const AUTHORITATIVE_PERK_COSTS = {
  longevity_root: 80,
  lock_t1_t2: 150,
  guarantee_middle_class: 250,
  golden_cradle: 250,
  choose_trait: 400
};

export async function buyKarmaPerk(perkId, clientCost = null) {
  const authoritativeCost = AUTHORITATIVE_PERK_COSTS[perkId];
  if (!authoritativeCost) {
    return { success: false, message: "Đặc quyền không tồn tại trong danh mục bảo mật của hệ thống." };
  }

  const account = await getPlayerAccount();
  if ((account.total_karma || 0) < authoritativeCost) {
    return { success: false, message: `Không đủ điểm Karma! Cần ${authoritativeCost} KP (Hiện có ${account.total_karma || 0} KP).` };
  }

  const perks = Array.isArray(account.unlocked_perks) ? [...account.unlocked_perks] : [];
  if (!perks.includes(perkId)) {
    perks.push(perkId);
  }

  const updatedKarma = Math.max(0, (account.total_karma || 0) - authoritativeCost);
  await updatePlayerAccount({
    total_karma: updatedKarma,
    unlocked_perks: perks
  });
  return { success: true, total_karma: updatedKarma, unlocked_perks: perks };
}

export async function getAncestralLineage() {
  const account = await getPlayerAccount();
  return account.ancestral_lineage || [];
}

export async function addAncestralMemorial(record) {
  const account = await getPlayerAccount();
  const lineage = Array.isArray(account.ancestral_lineage) ? [...account.ancestral_lineage] : [];
  const item = {
    id: crypto.randomUUID(),
    recorded_at: new Date().toISOString(),
    ...record
  };
  lineage.unshift(item); // Newest on top
  await updatePlayerAccount({ ancestral_lineage: lineage });
  return item;
}

// Current Life (Ephemeral Layer)
export function ensureCharacterSkills(char) {
  if (!char) return char;
  if (char.age < 18 && (Number(char.cash) || 0) < 0) {
    char.cash = 0;
  }
  if (!char.skills || typeof char.skills !== 'object') {
    char.skills = {
      tech_logic: { level: 0, name: "Trí Tuệ & Công Nghệ" },
      finance_market: { level: 0, name: "Tài Chính & Thương Trường" },
      resilience_health: { level: 0, name: "Sinh Lực & Khắc Kỷ" },
      leadership_social: { level: 0, name: "Lãnh Đạo & Ngoại Giao" }
    };
  } else {
    // Ensure all 4 core branches exist
    if (!char.skills.tech_logic) char.skills.tech_logic = { level: 0, name: "Trí Tuệ & Công Nghệ" };
    if (!char.skills.finance_market) char.skills.finance_market = { level: 0, name: "Tài Chính & Thương Trường" };
    if (!char.skills.resilience_health) char.skills.resilience_health = { level: 0, name: "Sinh Lực & Khắc Kỷ" };
    if (!char.skills.leadership_social) char.skills.leadership_social = { level: 0, name: "Lãnh Đạo & Ngoại Giao" };
  }
  return char;
}

const entityTables = new Set(['characters', 'assets', 'relationships', 'npcs']);
const hydrate = row => { if (!row) return null; const { seq, ...rest } = { ...row, ...(row.state ?? {}), id: row.id }; return rest; };
async function ownedRows(table, characterId = null) {
  if (!entityTables.has(table)) throw new Error('Invalid entity table');
  const result = table === 'characters'
    ? await pool.query('SELECT * FROM characters WHERE player_account_id = $1 ORDER BY created_at DESC', [getCurrentSessionId()])
    : await pool.query(`SELECT e.* FROM ${table} e JOIN characters c ON c.id = e.character_id WHERE c.player_account_id = $1 AND e.character_id = $2 ORDER BY e.seq`, [getCurrentSessionId(), characterId]);
  return result.rows.map(hydrate);
}
async function persistEntity(table, id, fields) {
  if (!entityTables.has(table)) throw new Error('Invalid entity table');
  const old = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  if (old.rows[0]) {
    const ownerId = table === 'characters' ? old.rows[0].id : old.rows[0].character_id;
    const owner = await pool.query('SELECT id FROM characters WHERE id = $1 AND player_account_id = $2', [ownerId, getCurrentSessionId()]);
    if (!owner.rows.length) throw new Error('Entity does not belong to this session');
  }
  const entity = { ...hydrate(old.rows[0]), ...fields, id };
  if (table === 'characters') {
    entity.player_account_id = getCurrentSessionId();
    const rngState = sessions.get(getCurrentSessionId())?.rng;
    if (rngState) entity.rng_state = { seed: rngState.seed, n: rngState.n || 0 };
    await getPlayerAccount();
    const res = await pool.query(`INSERT INTO characters (id, player_account_id, name, age, state) VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state, name = EXCLUDED.name, age = EXCLUDED.age, updated_at = NOW()
      WHERE characters.player_account_id = $2 RETURNING *`, [id, getCurrentSessionId(), entity.name ?? 'Nhân vật', entity.age ?? 0, JSON.stringify(entity)]);
    if (!res.rows.length) throw new Error('Character update rejected');
    return hydrate(res.rows[0]);
  }
  if (old.rows.length && entity.character_id !== old.rows[0].character_id) throw new Error('Cannot transfer ownership through an update');
  const owner = await pool.query('SELECT id FROM characters WHERE id = $1 AND player_account_id = $2', [entity.character_id, getCurrentSessionId()]);
  if (!owner.rows.length) throw new Error('Character does not belong to this session');
  const roleColumn = table === 'npcs' ? 'role' : 'type';
  const res = await pool.query(`INSERT INTO ${table} (id, character_id, name, ${roleColumn}, state) VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state WHERE ${table}.character_id = $2 RETURNING *`,
    [id, entity.character_id, entity.name ?? 'Đối tượng', entity[roleColumn] ?? 'other', JSON.stringify(entity)]);
  if (!res.rows.length) throw new Error('Entity update rejected');
  return hydrate(res.rows[0]);
}

export async function getLatestCharacter() {
  if (!useMock && pool) {
    const latest = (await ownedRows('characters'))[0] ?? null;
    // Postgres: khôi phục trạng thái RNG sau khi server khởi động lại (RAM đã mất).
    const store = getSessionData();
    if (latest?.rng_state && typeof latest.rng_state.seed === 'number' && (!store.rng || store.rng.seed !== latest.rng_state.seed))
      store.rng = { seed: latest.rng_state.seed, n: latest.rng_state.n || 0 };
    return ensureCharacterSkills(latest);
  }
  const c = getSessionData().character;
  return c ? ensureCharacterSkills(structuredClone(c)) : null;
}

export async function updateCharacter(id, fields) {
  assertNotSandbox('updateCharacter');
  if (!useMock && pool) return persistEntity('characters', id, fields);
  const store = getSessionData();
  store.character = store.character?.id === id ? { ...store.character, ...fields, id } : { ...fields, id };
  scheduleDiskPersist();
  return structuredClone(store.character);
}

export async function getAssets(characterId) {
  if (!useMock && pool) return ownedRows('assets', characterId);
  return structuredClone(getSessionData().assets.filter(e => e.character_id === characterId));
}

export async function updateAsset(id, fields) {
  if (inSandbox()) return { ...fields, id }; // Nếu như…: mô phỏng, không ghi
  if (!useMock && pool) return persistEntity('assets', id, fields);
  const entity = getSessionData().assets.find(e => e.id === id);
  if (!entity) throw new Error('Không tìm thấy đối tượng thuộc phiên này.');
  Object.assign(entity, fields); scheduleDiskPersist(); return structuredClone(entity);
}

export async function addAsset(fields) {
  assertNotSandbox('addAsset');
  const entity = { ...fields, id: fields.id ?? crypto.randomUUID() };
  if (!useMock && pool) return persistEntity('assets', entity.id, entity);
  const store = getSessionData();
  if (entity.character_id !== store.character?.id) throw new Error('Đối tượng không thuộc kiếp sống hiện tại.');
  if (store.assets.some(e => e.id === entity.id)) throw new Error('Đối tượng đã tồn tại.');
  store.assets.push(entity); scheduleDiskPersist(); return structuredClone(entity);
}

export async function deleteAsset(id) {
  assertNotSandbox('deleteAsset');
  if (!useMock && pool) {
    const res = await pool.query(`DELETE FROM assets a USING characters c WHERE a.id=$1 AND c.id=a.character_id AND c.player_account_id=$2 RETURNING a.*`, [id, getCurrentSessionId()]);
    return hydrate(res.rows[0]);
  }
  const store = getSessionData();
  const index = store.assets.findIndex(a => a.id === id);
  if (index < 0) return null;
  const [asset] = store.assets.splice(index, 1); scheduleDiskPersist(); return asset;
}

export async function addRelationship(fields) {
  assertNotSandbox('addRelationship');
  const entity = { ...fields, id: fields.id ?? crypto.randomUUID() };
  if (!useMock && pool) return persistEntity('relationships', entity.id, entity);
  const store = getSessionData();
  if (entity.character_id !== store.character?.id) throw new Error('Đối tượng không thuộc kiếp sống hiện tại.');
  if (store.relationships.some(e => e.id === entity.id)) throw new Error('Đối tượng đã tồn tại.');
  store.relationships.push(entity); scheduleDiskPersist(); return structuredClone(entity);
}

export async function updateRelationship(id, fields) {
  if (inSandbox()) return { ...fields, id }; // Nếu như…: mô phỏng, không ghi
  if (!useMock && pool) return persistEntity('relationships', id, fields);
  const entity = getSessionData().relationships.find(e => e.id === id);
  if (!entity) throw new Error('Không tìm thấy đối tượng thuộc phiên này.');
  Object.assign(entity, fields); scheduleDiskPersist(); return structuredClone(entity);
}

export async function getRelationships(characterId) {
  if (!useMock && pool) return ownedRows('relationships', characterId);
  return structuredClone(getSessionData().relationships.filter(e => e.character_id === characterId));
}

export async function getNpcs(characterId) {
  if (!useMock && pool) return ownedRows('npcs', characterId);
  return structuredClone(getSessionData().npcs.filter(e => e.character_id === characterId));
}

export async function addNpc(fields) {
  assertNotSandbox('addNpc');
  const entity = { ...fields, id: fields.id ?? crypto.randomUUID() };
  if (!useMock && pool) return persistEntity('npcs', entity.id, entity);
  const store = getSessionData();
  if (entity.character_id !== store.character?.id) throw new Error('Đối tượng không thuộc kiếp sống hiện tại.');
  if (store.npcs.some(e => e.id === entity.id)) throw new Error('Đối tượng đã tồn tại.');
  store.npcs.push(entity); scheduleDiskPersist(); return structuredClone(entity);
}

export async function updateNpc(id, fields) {
  assertNotSandbox('updateNpc');
  if (!useMock && pool) return persistEntity('npcs', id, fields);
  const entity = getSessionData().npcs.find(e => e.id === id);
  if (!entity) throw new Error('Không tìm thấy đối tượng thuộc phiên này.');
  Object.assign(entity, fields); scheduleDiskPersist(); return structuredClone(entity);
}

export async function cacheTickEvent(characterId, tickNumber, eventData) {
  assertNotSandbox('cacheTickEvent');
  if (useMock || !pool) {
    const store = getSessionData();
    store.tickEvents.push({
      id: crypto.randomUUID(),
      character_id: characterId,
      tick_number: tickNumber,
      event_data: eventData,
      created_at: new Date()
    });
    scheduleDiskPersist();
    return;
  }
  await pool.query(
    'INSERT INTO tick_events (character_id, tick_number, event_data) VALUES ($1, $2, $3)',
    [characterId, tickNumber, JSON.stringify(eventData)]
  );
}

export async function startNewRebirthGame(karmaPerks = {}, lineageParent = null) {
  // Deduct karma spent in Karma Shop from eternal player account
  const account = await getPlayerAccount();
  const unlocked = Array.isArray(account.unlocked_perks) ? account.unlocked_perks : [];
  let spentKarma = 0;

  if (karmaPerks.longevity_root && !unlocked.includes('longevity_root')) spentKarma += 80;
  if (karmaPerks.lock_t1_t2 && !unlocked.includes('lock_t1_t2')) spentKarma += 150;
  if ((karmaPerks.guarantee_middle_class || karmaPerks.golden_cradle) && !unlocked.includes('guarantee_middle_class')) spentKarma += 250;
  if (karmaPerks.choose_trait && !unlocked.includes('choose_trait')) spentKarma += 400;

  if ((account.total_karma ?? 0) < spentKarma) throw new Error('Không đủ Karma để mua các đặc quyền đã chọn.');
  const updatedTotalKarma = (account.total_karma ?? 0) - spentKarma;

  // Add perks to account unlocked_perks
  const newUnlockedSet = new Set(unlocked);
  if (karmaPerks.longevity_root) newUnlockedSet.add('longevity_root');
  if (karmaPerks.lock_t1_t2) newUnlockedSet.add('lock_t1_t2');
  if (karmaPerks.guarantee_middle_class) newUnlockedSet.add('guarantee_middle_class');
  if (karmaPerks.choose_trait) newUnlockedSet.add('choose_trait');

  await updatePlayerAccount({
    reincarnation_count: (account.reincarnation_count ?? 0) + 1,
    total_karma: updatedTotalKarma,
    unlocked_perks: Array.from(newUnlockedSet)
  });

  const freshChar = seedInitialData(lineageParent, karmaPerks);
  if (lineageParent) applyWorldMemory(freshChar, lineageParent); // same bloodline: NPC grudges/debts, persistent doors, inherited knowledge
  const store = getSessionData();
  if (!useMock && pool) {
    await updateCharacter(freshChar.id, freshChar);
    for (const asset of store.assets) await addAsset(asset);
    for (const relationship of store.relationships) await addRelationship(relationship);
    for (const npc of store.npcs) await addNpc(npc);
  }
  return {
    character: freshChar,
    assets: store.assets,
    relationships: store.relationships,
    npcs: store.npcs,
    player_account: await getPlayerAccount()
  };
}

export async function resetGame() {
  return seedInitialData();
}

// =========================================================================
// "NẾU NHƯ…" SNAPSHOTS: compact per-year copies of the living character (last N years, never in public API).
// Mock mode: session RAM (+ disk cache). Postgres: table whatif_snapshots.
// =========================================================================
export const WHATIF_KEEP_YEARS = 10;
export async function saveWhatIfSnapshot(characterId, age, snap) {
  assertNotSandbox('saveWhatIfSnapshot');
  if (!useMock && pool) {
    const sid = getCurrentSessionId();
    await pool.query(`INSERT INTO whatif_snapshots (character_id, player_account_id, age, snap) VALUES ($1,$2,$3,$4)
      ON CONFLICT (character_id, age) DO UPDATE SET snap = EXCLUDED.snap`, [characterId, sid, age, JSON.stringify(snap)]);
    await pool.query(`DELETE FROM whatif_snapshots WHERE character_id = $1 AND age NOT IN
      (SELECT age FROM whatif_snapshots WHERE character_id = $1 ORDER BY age DESC LIMIT $2)`, [characterId, WHATIF_KEEP_YEARS]);
    await pool.query('DELETE FROM whatif_snapshots WHERE player_account_id = $1 AND character_id <> $2', [sid, characterId]); // past lives
    return;
  }
  const store = getSessionData();
  const rest = (store.whatif_snaps || []).filter(s => s.character_id === characterId && s.age !== age);
  rest.push({ character_id: characterId, age, snap });
  rest.sort((a, b) => a.age - b.age);
  store.whatif_snaps = rest.slice(-WHATIF_KEEP_YEARS);
  scheduleDiskPersist();
}
export async function listWhatIfAges(characterId) {
  if (!useMock && pool) {
    const r = await pool.query('SELECT age FROM whatif_snapshots WHERE character_id = $1 AND player_account_id = $2 ORDER BY age', [characterId, getCurrentSessionId()]);
    return r.rows.map(x => x.age);
  }
  return (getSessionData().whatif_snaps || []).filter(s => s.character_id === characterId).map(s => s.age);
}
export async function loadWhatIfSnapshot(characterId, age) {
  if (!useMock && pool) {
    const r = await pool.query('SELECT snap FROM whatif_snapshots WHERE character_id = $1 AND player_account_id = $2 AND age = $3', [characterId, getCurrentSessionId(), age]);
    return r.rows[0]?.snap ?? null;
  }
  const hit = (getSessionData().whatif_snaps || []).find(s => s.character_id === characterId && s.age === age);
  return hit ? structuredClone(hit.snap) : null;
}

