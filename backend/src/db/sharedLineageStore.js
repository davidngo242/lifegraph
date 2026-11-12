// Kho lưu Bia Tưởng Niệm chung. Postgres khi có DATABASE_URL, ngược lại shared_lineage.json trong DATA_DIR (như accounts).
// Mọi thao tác kiểm tra+ghi đều nguyên tử: bộ nhớ (đồng bộ, không await giữa kiểm tra và ghi) hoặc Postgres (giao dịch + khoá tư vấn theo tài khoản).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { getStorageHandle } from './db.js';

export const REPORT_HIDE_THRESHOLD = 3;
export const BLESSING_CAP = 3;           // tổng +Karma khởi đầu tối đa từ tiền nhân nhận nuôi
export const ADOPT_DAILY_CAP = 3;

const FILE = path.join(getStorageHandle().dataDir, 'shared_lineage.json');
let mem = { memorials: [], incense: [], adoptions: [], reports: [] };

function load() {
  mem = { memorials: [], incense: [], adoptions: [], reports: [] };
  try {
    if (!fs.existsSync(FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    for (const k of Object.keys(mem)) if (Array.isArray(parsed?.[k])) mem[k] = parsed[k];
  } catch (err) {
    console.warn('[SharedLineage] Không đọc được shared_lineage.json:', err.message);
  }
}
function save() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(mem), { encoding: 'utf-8', mode: 0o600 });
  fs.chmodSync(tmp, 0o600);
  fs.renameSync(tmp, FILE);
}
load();
/** Chỉ dùng cho test: đọc lại từ đĩa. */
export async function reloadForTest() { load(); }

const usePg = () => !!getStorageHandle().pool;
/** Ngày theo giờ Việt Nam (UTC+7) để "mỗi ngày" khớp với người chơi. */
export const today = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
const newId = () => 'sm_' + crypto.randomBytes(8).toString('hex');

/** Hình công khai: KHÔNG bao giờ có account_id / source_id / số báo cáo. */
function toPublic(row, viewerId, flags = {}) {
  const out = {
    id: row.id,
    display_name: row.display_name,
    ancestor_name: row.ancestor_name,
    nationality: row.nationality,
    age: Number(row.age),
    cause_of_passing: row.cause_of_passing,
    aspiration_title: row.aspiration_title,
    epitaph: row.epitaph,
    incense_count: Number(row.incense_count),
    adopt_count: Number(row.adopt_count),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    mine: !!viewerId && row.account_id === viewerId,
    incensed_today: !!flags.incensed,
    adopted: !!flags.adopted,
  };
  return out;
}

async function tx(fn) {
  const { pool } = getStorageHandle();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { /* ignore */ }
    throw err;
  } finally {
    client.release();
  }
}
const lockAccount = (client, accountId) => client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['sl:' + accountId]);

// ---------------------------------------------------------------- publish
export async function publishMemorial(m) {
  const row = { id: newId(), account_id: m.accountId, source_id: m.sourceId, display_name: m.displayName, ancestor_name: m.ancestorName,
    nationality: m.nationality, age: m.age, cause_of_passing: m.cause, aspiration_title: m.aspiration, epitaph: m.epitaph,
    incense_count: 0, adopt_count: 0, report_count: 0, status: 'active', created_at: new Date().toISOString() };
  if (usePg()) {
    const { pool } = getStorageHandle();
    const r = await pool.query(`INSERT INTO shared_memorials (id, account_id, source_id, display_name, ancestor_name, nationality, age, cause_of_passing, aspiration_title, epitaph, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (account_id, source_id) DO NOTHING RETURNING *`,
      [row.id, row.account_id, row.source_id, row.display_name, row.ancestor_name, row.nationality, row.age, row.cause_of_passing, row.aspiration_title, row.epitaph, row.created_at]);
    return r.rowCount === 1 ? { memorial: toPublic(r.rows[0], m.accountId) } : { error: 'duplicate' };
  }
  if (mem.memorials.some(x => x.account_id === m.accountId && x.source_id === m.sourceId)) return { error: 'duplicate' };
  mem.memorials.push(row); save();
  return { memorial: toPublic(row, m.accountId) };
}

// ---------------------------------------------------------------- read
export async function listMemorials({ sort, limit, offset, viewerId }) {
  const today_ = today();
  if (usePg()) {
    const { pool } = getStorageHandle();
    const order = sort === 'incense' ? 'm.incense_count DESC, m.created_at DESC, m.id' : 'm.created_at DESC, m.id';
    const rows = (await pool.query(`SELECT m.*,
        EXISTS (SELECT 1 FROM shared_memorial_incense i WHERE i.memorial_id = m.id AND i.account_id = $1 AND i.day = $2) AS incensed,
        EXISTS (SELECT 1 FROM shared_memorial_adoptions a WHERE a.memorial_id = m.id AND a.account_id = $1) AS adopted
      FROM shared_memorials m WHERE m.status = 'active' ORDER BY ${order} LIMIT $3 OFFSET $4`, [viewerId, today_, limit, offset])).rows;
    const total = Number((await pool.query("SELECT COUNT(*) AS c FROM shared_memorials WHERE status = 'active'")).rows[0].c);
    return { items: rows.map(r => toPublic(r, viewerId, r)), total };
  }
  const active = mem.memorials.filter(x => x.status === 'active');
  const cmpNew = (a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0);
  active.sort(sort === 'incense' ? (a, b) => (b.incense_count - a.incense_count) || cmpNew(a, b) : cmpNew);
  const items = active.slice(offset, offset + limit).map(r => toPublic(r, viewerId, {
    incensed: mem.incense.some(i => i.mid === r.id && i.aid === viewerId && i.day === today_),
    adopted: mem.adoptions.some(a => a.mid === r.id && a.aid === viewerId),
  }));
  return { items, total: active.length };
}

export async function listMine(accountId) {
  if (usePg()) {
    const { pool } = getStorageHandle();
    const rows = (await pool.query("SELECT * FROM shared_memorials WHERE account_id = $1 AND status <> 'removed' ORDER BY created_at DESC LIMIT 100", [accountId])).rows;
    return rows.map(r => ({ ...toPublic(r, accountId), status: r.status, source_memorial_id: r.source_id }));
  }
  return mem.memorials.filter(x => x.account_id === accountId && x.status !== 'removed')
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 100)
    .map(r => ({ ...toPublic(r, accountId), status: r.status, source_memorial_id: r.source_id }));
}

// ---------------------------------------------------------------- incense
export async function incense(id, viewerId) {
  const day = today();
  if (usePg()) {
    return tx(async c => {
      const m = (await c.query("SELECT id FROM shared_memorials WHERE id = $1 AND status = 'active' FOR UPDATE", [id])).rows[0];
      if (!m) return { error: 'notfound' };
      const ins = await c.query('INSERT INTO shared_memorial_incense (memorial_id, account_id, day) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [id, viewerId, day]);
      if (ins.rowCount !== 1) return { error: 'duplicate' };
      const up = await c.query('UPDATE shared_memorials SET incense_count = incense_count + 1 WHERE id = $1 RETURNING incense_count', [id]);
      return { incense_count: Number(up.rows[0].incense_count) };
    });
  }
  const m = mem.memorials.find(x => x.id === id && x.status === 'active');
  if (!m) return { error: 'notfound' };
  if (mem.incense.some(i => i.mid === id && i.aid === viewerId && i.day === day)) return { error: 'duplicate' };
  mem.incense = mem.incense.filter(i => i.day === day); // chỉ cần dedupe trong ngày: chặn file phình vô hạn
  mem.incense.push({ mid: id, aid: viewerId, day });
  m.incense_count += 1; save();
  return { incense_count: m.incense_count };
}

// ---------------------------------------------------------------- adopt
const snapshotOf = r => ({ id: r.id, display_name: r.display_name, ancestor_name: r.ancestor_name, nationality: r.nationality, age: Number(r.age),
  cause_of_passing: r.cause_of_passing, aspiration_title: r.aspiration_title, epitaph: r.epitaph });
const bonusFor = count => Math.min(BLESSING_CAP, count);

export async function adopt(id, viewerId) {
  const day = today();
  if (usePg()) {
    return tx(async c => {
      await lockAccount(c, viewerId);
      const m = (await c.query("SELECT * FROM shared_memorials WHERE id = $1 AND status = 'active' FOR UPDATE", [id])).rows[0];
      if (!m) return { error: 'notfound' };
      if (m.account_id === viewerId) return { error: 'own' };
      const dup = await c.query('SELECT 1 FROM shared_memorial_adoptions WHERE memorial_id = $1 AND account_id = $2', [id, viewerId]);
      if (dup.rowCount) return { error: 'duplicate' };
      const today_ = Number((await c.query('SELECT COUNT(*) AS c FROM shared_memorial_adoptions WHERE account_id = $1 AND day = $2', [viewerId, day])).rows[0].c);
      if (today_ >= ADOPT_DAILY_CAP) return { error: 'cap' };
      await c.query('INSERT INTO shared_memorial_adoptions (memorial_id, account_id, day, snapshot) VALUES ($1,$2,$3,$4)', [id, viewerId, day, JSON.stringify(snapshotOf(m))]);
      await c.query('UPDATE shared_memorials SET adopt_count = adopt_count + 1 WHERE id = $1', [id]);
      const total = Number((await c.query('SELECT COUNT(*) AS c FROM shared_memorial_adoptions WHERE account_id = $1', [viewerId])).rows[0].c);
      return { karma_start_bonus: bonusFor(total) };
    });
  }
  const m = mem.memorials.find(x => x.id === id && x.status === 'active');
  if (!m) return { error: 'notfound' };
  if (m.account_id === viewerId) return { error: 'own' };
  if (mem.adoptions.some(a => a.mid === id && a.aid === viewerId)) return { error: 'duplicate' };
  if (mem.adoptions.filter(a => a.aid === viewerId && a.day === day).length >= ADOPT_DAILY_CAP) return { error: 'cap' };
  mem.adoptions.push({ mid: id, aid: viewerId, day, created_at: new Date().toISOString(), snapshot: snapshotOf(m) });
  m.adopt_count += 1; save();
  return { karma_start_bonus: bonusFor(mem.adoptions.filter(a => a.aid === viewerId).length) };
}

export async function listAdopted(accountId) {
  let rows;
  if (usePg()) {
    const { pool } = getStorageHandle();
    rows = (await pool.query('SELECT a.created_at, a.snapshot, m.status FROM shared_memorial_adoptions a LEFT JOIN shared_memorials m ON m.id = a.memorial_id WHERE a.account_id = $1 ORDER BY a.created_at DESC LIMIT 100', [accountId])).rows
      .map(r => ({ adopted_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at, snapshot: r.snapshot, status: r.status }));
  } else {
    rows = mem.adoptions.filter(a => a.aid === accountId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 100)
      .map(a => ({ adopted_at: a.created_at, snapshot: a.snapshot, status: mem.memorials.find(m => m.id === a.mid)?.status }));
  }
  const items = rows.map(r => ({ ...r.snapshot, adopted_at: r.adopted_at, available: r.status === 'active' }));
  return { items, karma_start_bonus: bonusFor(items.length) };
}

// ---------------------------------------------------------------- report / unpublish
export async function report(id, viewerId, reason) {
  if (usePg()) {
    return tx(async c => {
      const m = (await c.query("SELECT * FROM shared_memorials WHERE id = $1 AND status = 'active' FOR UPDATE", [id])).rows[0];
      if (!m) return { error: 'notfound' };
      if (m.account_id === viewerId) return { error: 'own' };
      const ins = await c.query('INSERT INTO shared_memorial_reports (memorial_id, account_id, reason) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [id, viewerId, reason]);
      if (ins.rowCount !== 1) return { error: 'duplicate' };
      const up = await c.query(`UPDATE shared_memorials SET report_count = report_count + 1,
        status = CASE WHEN report_count + 1 >= $2 THEN 'hidden' ELSE status END WHERE id = $1 RETURNING status`, [id, REPORT_HIDE_THRESHOLD]);
      return { hidden: up.rows[0].status === 'hidden' };
    });
  }
  const m = mem.memorials.find(x => x.id === id && x.status === 'active');
  if (!m) return { error: 'notfound' };
  if (m.account_id === viewerId) return { error: 'own' };
  if (mem.reports.some(r => r.mid === id && r.aid === viewerId)) return { error: 'duplicate' };
  mem.reports.push({ mid: id, aid: viewerId, reason });
  m.report_count += 1;
  if (m.report_count >= REPORT_HIDE_THRESHOLD) m.status = 'hidden';
  save();
  return { hidden: m.status === 'hidden' };
}

/** Chủ sở hữu gỡ bia. Chỉ chủ mới thấy bia của mình (kể cả đang bị ẩn); người khác nhận 404. Giữ hàng (status=removed) để "một lần mỗi kiếp". */
export async function unpublish(id, ownerId) {
  if (usePg()) {
    const { pool } = getStorageHandle();
    const r = await pool.query("UPDATE shared_memorials SET status = 'removed' WHERE id = $1 AND account_id = $2 AND status <> 'removed'", [id, ownerId]);
    return r.rowCount === 1;
  }
  const m = mem.memorials.find(x => x.id === id && x.account_id === ownerId && x.status !== 'removed');
  if (!m) return false;
  m.status = 'removed'; save();
  return true;
}
