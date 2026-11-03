import pg from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AsyncLocalStorage } from 'node:async_hooks';
import { executeProceduralRebirth } from '../engine/rebirthEngine.js';
import { initializeStartingNpcs } from '../engine/npcEngine.js';

const { Pool } = pg;

let pool = null;
let useMock = true;

// =========================================================================
// DISK-BACKED CACHE (PERSISTENT ACROSS SHUTDOWNS / RESTARTS)
// =========================================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const CACHE_FILE = path.join(DATA_DIR, 'sessions_cache.json');

let isDirty = false;
let saveTimeout = null;

export function persistSessionsToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const serialized = JSON.stringify(Array.from(sessions.entries()), null, 2);
    fs.writeFileSync(CACHE_FILE, serialized, 'utf-8');
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

export function getSessionData(sessionId = null) {
  const id = sessionId || getCurrentSessionId();
  if (!sessions.has(id)) {
    sessions.set(id, {
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
  const freshChar = executeProceduralRebirth(karmaPerks, lineageParent);
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

export async function initDb() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    try {
      pool = new Pool({ connectionString, connectionTimeoutMillis: 3000 });
      const client = await pool.connect();
      console.log('✅ [Database] Successfully connected to PostgreSQL.');
      client.release();
      useMock = false;
      return;
    } catch (err) {
      console.warn('⚠️ [Database] Falling back to In-Memory DB Mode:', err.message);
      useMock = true;
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
    const res = await pool.query('SELECT * FROM player_accounts WHERE id = $1', ['primary_player']);
    if (res.rows.length === 0) {
      const store = getSessionData();
      await pool.query(
        'INSERT INTO player_accounts (id, total_karma, unlocked_perks, reincarnation_count, lifetime_stats) VALUES ($1, $2, $3, $4, $5)',
        ['primary_player', store.playerAccount.total_karma, JSON.stringify(store.playerAccount.unlocked_perks), store.playerAccount.reincarnation_count, JSON.stringify(store.playerAccount.lifetime_stats)]
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
    values.push('primary_player');
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

export async function getLatestCharacter() {
  if (useMock || !pool) {
    const store = getSessionData();
    if (!store.character) return null;
    return ensureCharacterSkills({ ...store.character });
  }

  try {
    const res = await pool.query('SELECT * FROM characters ORDER BY created_at DESC LIMIT 1');
    if (res.rows.length === 0) {
      return null;
    }
    return ensureCharacterSkills(res.rows[0]);
  } catch (err) {
    console.error('Error fetching character from PG:', err);
    const store = getSessionData();
    return ensureCharacterSkills(store.character);
  }
}

export async function updateCharacter(id, fields) {
  if (useMock || !pool) {
    const store = getSessionData();
    if (store.character) {
      store.character = {
        ...store.character,
        ...fields
      };
      scheduleDiskPersist();
      return { ...store.character };
    }
    return null;
  }

  const setClauses = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = $${index}`);
    values.push(
      key === 'hidden_flags' || key === 'history_log' || key === 'innate_traits' || key === 'personality_flags' || key === 'global_indices' || key === 'timeline_snapshots' || key === 'recent_event_tags' || key === 'experienced_scenarios'
        ? JSON.stringify(value)
        : value
    );
    index++;
  }
  values.push(id);

  try {
    const res = await pool.query(`UPDATE characters SET ${setClauses.join(', ')} WHERE id = $${index} RETURNING *`, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error updating character in PG:', err);
    const store = getSessionData();
    if (store.character) {
      store.character = { ...store.character, ...fields };
      return { ...store.character };
    }
    return null;
  }
}

export async function getAssets(characterId) {
  if (useMock || !pool) {
    const store = getSessionData();
    return [...store.assets];
  }
  const res = await pool.query('SELECT * FROM assets WHERE character_id = $1', [characterId]);
  return res.rows;
}

export async function updateAsset(id, fields) {
  if (useMock || !pool) {
    const store = getSessionData();
    const asset = store.assets.find(a => a.id === id);
    if (asset) Object.assign(asset, fields);
    scheduleDiskPersist();
    return asset;
  }
  const setClauses = [];
  const values = [];
  let index = 1;
  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = $${index}`);
    values.push(value);
    index++;
  }
  values.push(id);
  const res = await pool.query(`UPDATE assets SET ${setClauses.join(', ')} WHERE id = $${index} RETURNING *`, values);
  return res.rows[0];
}

export async function addAsset(asset) {
  if (useMock || !pool) {
    const store = getSessionData();
    const item = { id: crypto.randomUUID(), ...asset };
    store.assets.push(item);
    scheduleDiskPersist();
    return item;
  }
  const res = await pool.query(
    'INSERT INTO assets (character_id, type, name, current_value, liquidity_status, maintenance_cost_per_tick) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [asset.character_id, asset.type, asset.name, asset.current_value, asset.liquidity_status || 'liquid', asset.maintenance_cost_per_tick || 0]
  );
  return res.rows[0];
}

export async function deleteAsset(id) {
  if (useMock || !pool) {
    const store = getSessionData();
    const index = store.assets.findIndex(a => a.id === id);
    if (index !== -1) {
      const removed = store.assets.splice(index, 1)[0];
      scheduleDiskPersist();
      return removed;
    }
    return null;
  }
  const res = await pool.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}

export async function addRelationship(rel) {
  if (useMock || !pool) {
    const store = getSessionData();
    const item = { id: crypto.randomUUID(), ...rel };
    store.relationships.push(item);
    scheduleDiskPersist();
    return item;
  }
  const res = await pool.query(
    'INSERT INTO relationships (character_id, type, name, affection_level, monthly_cost, inherited_traits) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [rel.character_id, rel.type, rel.name, rel.affection_level || 70, rel.monthly_cost || 0, JSON.stringify(rel.inherited_traits || [])]
  );
  return res.rows[0];
}

export async function updateRelationship(id, fields) {
  if (useMock || !pool) {
    const store = getSessionData();
    const rel = store.relationships.find(r => r.id === id);
    if (rel) Object.assign(rel, fields);
    scheduleDiskPersist();
    return rel;
  }
  const setClauses = [];
  const values = [];
  let index = 1;
  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = $${index}`);
    values.push(typeof value === 'object' ? JSON.stringify(value) : value);
    index++;
  }
  values.push(id);
  const res = await pool.query(`UPDATE relationships SET ${setClauses.join(', ')} WHERE id = $${index} RETURNING *`, values);
  return res.rows[0];
}

export async function getRelationships(characterId) {
  if (useMock || !pool) {
    const store = getSessionData();
    return [...store.relationships];
  }
  const res = await pool.query('SELECT * FROM relationships WHERE character_id = $1', [characterId]);
  return res.rows;
}

export async function getNpcs(characterId) {
  if (useMock || !pool) {
    const store = getSessionData();
    return [...store.npcs];
  }
  const res = await pool.query('SELECT * FROM npcs WHERE character_id = $1', [characterId]);
  return res.rows;
}

export async function addNpc(npc) {
  if (useMock || !pool) {
    const store = getSessionData();
    const item = { id: crypto.randomUUID(), ...npc };
    store.npcs.push(item);
    scheduleDiskPersist();
    return item;
  }
  const res = await pool.query(
    'INSERT INTO npcs (character_id, name, role, status, affinity, memory_notes, avatar_color) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [npc.character_id, npc.name, npc.role, npc.status || 'alive', npc.affinity || 50, npc.memory_notes || '', npc.avatar_color || '#6366f1']
  );
  return res.rows[0];
}

export async function updateNpc(id, fields) {
  if (useMock || !pool) {
    const store = getSessionData();
    const npc = store.npcs.find(n => n.id === id);
    if (npc) Object.assign(npc, fields);
    scheduleDiskPersist();
    return npc;
  }
  const setClauses = [];
  const values = [];
  let index = 1;
  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = $${index}`);
    values.push(value);
    index++;
  }
  values.push(id);
  const res = await pool.query(`UPDATE npcs SET ${setClauses.join(', ')} WHERE id = $${index} RETURNING *`, values);
  return res.rows[0];
}

export async function cacheTickEvent(characterId, tickNumber, eventData) {
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

  const updatedTotalKarma = Math.max(0, (account.total_karma || 0) - spentKarma);

  // Add perks to account unlocked_perks
  const newUnlockedSet = new Set(unlocked);
  if (karmaPerks.longevity_root) newUnlockedSet.add('longevity_root');
  if (karmaPerks.lock_t1_t2) newUnlockedSet.add('lock_t1_t2');
  if (karmaPerks.guarantee_middle_class) newUnlockedSet.add('guarantee_middle_class');
  if (karmaPerks.choose_trait) newUnlockedSet.add('choose_trait');

  await updatePlayerAccount({
    reincarnation_count: (account.reincarnation_count || 1) + 1,
    total_karma: updatedTotalKarma,
    unlocked_perks: Array.from(newUnlockedSet)
  });

  const freshChar = seedInitialData(lineageParent, karmaPerks);
  const store = getSessionData();
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
