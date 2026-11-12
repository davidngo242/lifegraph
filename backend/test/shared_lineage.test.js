import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-sl-'));
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = directory;
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || ''; process.env.GEMINI_API_KEY = '';
const { app } = await import('../src/index.js');
const db = await import('../src/db/db.js');
const { mintSessionId, signAccountToken } = await import('../src/security/securityEngine.js');
let server, root;
before(async () => {
  await db.initDb(); server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  root = `http://127.0.0.1:${server.address().port}/api/game`;
});
after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });

async function call(route, { method, body, account } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (account) headers['x-account-token'] = account.account_token;
  const r = await fetch(root + route, { method: method || (body === undefined ? 'GET' : 'POST'), headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { status: r.status, data, text };
}
const SL = '/shared-lineage';
let n = 0;
// Tạo thẳng trong DB (register qua HTTP bị giới hạn 20/phút/IP, không phải thứ cần kiểm ở đây).
async function makeAccount() {
  const username = `sl_${process.pid}_${Date.now().toString(36)}_${n++}`;
  const a = await db.createAccount({ username, passHash: 'x', salt: 'y', sessionId: mintSessionId() });
  assert.ok(a);
  return { username, session_id: a.session_id, account_token: signAccountToken(a.id, 0) };
}
/** Tạo một bia trong gia phả riêng của tài khoản (server-side, như game.js làm). */
async function seedMemorial(acc, extra = {}) {
  return db.sessionContext.run({ sessionId: acc.session_id }, () => db.addAncestralMemorial({
    generation: 2, name: 'Nguyễn Văn An', nationality: 'Việt Nam', age: 81, status: 'deceased',
    cause_of_passing: 'Tuổi già', max_net_worth: 999999, cash: 123456, karma: 70,
    aspiration_title: 'Người Gieo Mầm', epitaph_quote: 'Sống tử tế.', blessing: 'x', ...extra
  }));
}
async function publish(acc, extra = {}, seed = {}) {
  const m = await seedMemorial(acc, seed);
  const r = await call(SL + '/publish', { account: acc, body: { memorial_id: m.id, consent: true, epitaph: 'Một đời tử tế.', ...extra } });
  return { m, r };
}

test('guests (no account token) and bad tokens get 401 on every route', async () => {
  for (const [route, method] of [['', 'GET'], ['/mine', 'GET'], ['/adopted', 'GET'], ['/publish', 'POST'], ['/sm_0123456789abcdef/incense', 'POST'], ['/sm_0123456789abcdef', 'DELETE']]) {
    assert.equal((await call(SL + route, { method, body: method === 'POST' ? {} : undefined })).status, 401, route);
  }
  assert.equal((await call(SL, { account: { account_token: 'garbage' } })).status, 401);
});

test('publish requires explicit consent, a real own memorial, and is one-per-life', async () => {
  const acc = await makeAccount();
  const m = await seedMemorial(acc);
  assert.equal((await call(SL + '/publish', { account: acc, body: { memorial_id: m.id } })).status, 400);
  assert.equal((await call(SL + '/publish', { account: acc, body: { memorial_id: m.id, consent: 'true' } })).status, 400);
  assert.equal((await call(SL + '/publish', { account: acc, body: { memorial_id: 'not-mine', consent: true } })).status, 404);
  assert.equal((await call(SL + '/publish', { account: acc, body: { consent: true } })).status, 400);
  const ok = await call(SL + '/publish', { account: acc, body: { memorial_id: m.id, consent: true, epitaph: 'Một đời tử tế.' } });
  assert.equal(ok.status, 201);
  assert.match(ok.data.memorial.id, /^sm_[0-9a-f]{16}$/);
  assert.equal(ok.data.memorial.epitaph, 'Một đời tử tế.');
  assert.equal(ok.data.memorial.age, 81);
  const again = await call(SL + '/publish', { account: acc, body: { memorial_id: m.id, consent: true } });
  assert.equal(again.status, 409);
  // cash / net worth never published
  assert.doesNotMatch(ok.text, /999999|123456|max_net_worth|cash/);
});

test('demo founder memorial cannot be published; another account cannot publish my memorial (IDOR)', async () => {
  const a = await makeAccount(); const b = await makeAccount();
  const demo = await db.sessionContext.run({ sessionId: a.session_id }, async () => (await db.getAncestralLineage()).find(i => i.id === 'founder_gen_1'));
  if (demo) assert.equal((await call(SL + '/publish', { account: a, body: { memorial_id: demo.id, consent: true } })).status, 404);
  const m = await seedMemorial(a);
  assert.equal((await call(SL + '/publish', { account: b, body: { memorial_id: m.id, consent: true } })).status, 404);
});

test('XSS / URL / HTML payloads are neutralised in epitaph and name', async () => {
  const acc = await makeAccount();
  const payload = '<img src=x onerror=alert(1)><script>alert(2)</script> xem https://evil.example/a?b=1 và www.evil.com hoặc evil.io/x "q" \'s\' `t`';
  const { r } = await publish(acc, { epitaph: payload }, { name: '<b>Bad</b> http://x.y Name' });
  assert.equal(r.status, 201);
  const out = r.data.memorial;
  for (const field of [out.epitaph, out.ancestor_name]) {
    assert.doesNotMatch(field, /[<>"'`]/);
    assert.doesNotMatch(field, /https?:|www\.|evil|onerror=alert|<script/i);
  }
  const list = await call(SL, { account: acc });
  assert.doesNotMatch(list.text, /<script|<img|evil\./i);
});

test('epitaph length is capped at 200; non-string epitaph rejected', async () => {
  const acc = await makeAccount();
  const { r } = await publish(acc, { epitaph: 'a'.repeat(5000) });
  assert.equal(r.status, 201);
  assert.ok(r.data.memorial.epitaph.length <= 200);
  const acc2 = await makeAccount();
  const m = await seedMemorial(acc2);
  const bad = await call(SL + '/publish', { account: acc2, body: { memorial_id: m.id, consent: true, epitaph: { $ne: 1 } } });
  assert.equal(bad.status, 400);
});

test('profanity filter (with and without diacritics) rejects publish', async () => {
  const acc = await makeAccount();
  const m = await seedMemorial(acc);
  for (const word of ['đụ má mày', 'DU MA may', 'đ.ụ m.á', 'fuck you', 'cặc']) {
    const r = await call(SL + '/publish', { account: acc, body: { memorial_id: m.id, consent: true, epitaph: `xin chào ${word}` } });
    assert.equal(r.status, 422, word);
  }
  const ok = await call(SL + '/publish', { account: acc, body: { memorial_id: m.id, consent: true, epitaph: 'Cô giáo dạy Toán, sống đẹp.' } });
  assert.equal(ok.status, 201);
});

test('publish rate limit per account', async () => {
  const acc = await makeAccount();
  const statuses = [];
  for (let i = 0; i < 7; i++) {
    const m = await seedMemorial(acc);
    statuses.push((await call(SL + '/publish', { account: acc, body: { memorial_id: m.id, consent: true } })).status);
  }
  assert.equal(statuses.filter(s => s === 201).length, 5);
  assert.equal(statuses.filter(s => s === 429).length, 2);
});

test('responses never leak account ids, session ids, tokens or hashes', async () => {
  const a = await makeAccount(); const b = await makeAccount();
  await publish(a);
  const list = await call(SL, { account: b });
  const mine = await call(SL + '/mine', { account: a });
  for (const t of [list.text, mine.text]) {
    assert.ok(!t.includes(a.session_id)); assert.ok(!t.includes(b.session_id));
    assert.doesNotMatch(t, /acc_[0-9a-f]{8}|account_id|session_id|token|pass_hash|salt|"hidden"|source_id/i);
  }
  assert.ok(list.data.items.some(i => i.display_name === a.username.toLowerCase()));
});

test('browse: pagination bounds, sorting, hidden items excluded', async () => {
  const owner = await makeAccount(); const viewer = await makeAccount();
  const ids = [];
  for (let i = 0; i < 3; i++) ids.push((await publish(owner, {}, { name: `Tien Nhan ${i}` })).r.data.memorial.id);
  const all = await call(SL + '?limit=2', { account: viewer });
  assert.equal(all.status, 200);
  assert.equal(all.data.items.length, 2);
  assert.equal(all.data.limit, 2);
  for (const q of ['?limit=-5', '?limit=abc', '?limit=999999', '?offset=-1', '?offset=abc', '?offset=99999999999', '?sort=%27%3BDROP', '?limit[]=1']) {
    const r = await call(SL + q, { account: viewer });
    assert.equal(r.status, 200, q);
    assert.ok(r.data.items.length <= 50, q);
    assert.ok(r.data.limit >= 1 && r.data.limit <= 50, q);
    assert.ok(r.data.offset >= 0, q);
  }
  await call(`${SL}/${ids[0]}/incense`, { account: viewer, body: {} });
  const top = await call(SL + '?sort=incense&limit=50', { account: viewer });
  const mineTop = top.data.items.filter(i => ids.includes(i.id));
  assert.equal(mineTop[0].id, ids[0]);
  assert.equal(mineTop[0].incense_count, 1);
  assert.equal(mineTop[0].incensed_today, true);
  const newest = await call(SL + '?sort=new&limit=50', { account: viewer });
  const times = newest.data.items.map(i => Date.parse(i.created_at));
  assert.deepEqual([...times].sort((x, y) => y - x), times);
});

test('incense: once per memorial per account per day, even under a concurrent race', async () => {
  const owner = await makeAccount(); const viewer = await makeAccount();
  const { r } = await publish(owner); const id = r.data.memorial.id;
  const results = await Promise.all(Array.from({ length: 12 }, () => call(`${SL}/${id}/incense`, { account: viewer, body: {} })));
  assert.equal(results.filter(x => x.status === 200).length, 1);
  assert.equal(results.filter(x => x.status === 409).length, 11);
  const after = (await call(SL + '?limit=50', { account: viewer })).data.items.find(i => i.id === id);
  assert.equal(after.incense_count, 1);
  assert.equal((await call(`${SL}/${id}/incense`, { account: viewer, body: {} })).status, 409);
  assert.equal((await call(`${SL}/${id}/incense`, { account: owner, body: {} })).status, 200);
  assert.equal((await call(`${SL}/sm_ffffffffffffffff/incense`, { account: viewer, body: {} })).status, 404);
  assert.equal((await call(`${SL}/..%2f..%2fx/incense`, { account: viewer, body: {} })).status, 404);
});

test('adopt: not own, once per memorial, double race, capped blessing, no asset transfer', async () => {
  const owner = await makeAccount(); const viewer = await makeAccount();
  const { r } = await publish(owner); const id = r.data.memorial.id;
  assert.equal((await call(`${SL}/${id}/adopt`, { account: owner, body: {} })).status, 403);
  const race = await Promise.all(Array.from({ length: 8 }, () => call(`${SL}/${id}/adopt`, { account: viewer, body: {} })));
  assert.equal(race.filter(x => x.status === 200).length, 1);
  assert.equal(race.filter(x => x.status === 409).length, 7);
  const ok = race.find(x => x.status === 200);
  assert.equal(ok.data.blessing.karma_start_bonus, 1);
  assert.doesNotMatch(ok.text, /cash|asset|net_worth/i);
  const adopted = await call(SL + '/adopted', { account: viewer });
  assert.equal(adopted.data.items.length, 1);
  assert.equal(adopted.data.karma_start_bonus, 1);
  assert.equal(adopted.data.karma_start_bonus_cap, 3);
});

test('adopt blessing is capped and a daily adoption cap blocks farming', async () => {
  const viewer = await makeAccount();
  const ids = [];
  for (let i = 0; i < 5; i++) ids.push((await publish(await makeAccount())).r.data.memorial.id);
  const statuses = [];
  for (const id of ids) statuses.push((await call(`${SL}/${id}/adopt`, { account: viewer, body: {} })).status);
  assert.equal(statuses.filter(s => s === 200).length, 3);
  assert.equal(statuses.filter(s => s === 429).length, 2);
  const adopted = await call(SL + '/adopted', { account: viewer });
  assert.equal(adopted.data.karma_start_bonus, 3);
});

test('report: one per account, cannot report own, auto-hide at 3 distinct reporters', async () => {
  const owner = await makeAccount();
  const [r1, r2, r3] = [await makeAccount(), await makeAccount(), await makeAccount()];
  const { r } = await publish(owner); const id = r.data.memorial.id;
  assert.equal((await call(`${SL}/${id}/report`, { account: owner, body: { reason: 'x' } })).status, 403);
  assert.equal((await call(`${SL}/${id}/report`, { account: r1, body: { reason: 'spam' } })).status, 200);
  for (let i = 0; i < 4; i++) assert.equal((await call(`${SL}/${id}/report`, { account: r1, body: {} })).status, 409);
  const visible = async () => (await call(SL + '?limit=50', { account: r3 })).data.items.some(i => i.id === id);
  assert.equal(await visible(), true);
  assert.equal((await call(`${SL}/${id}/report`, { account: r2, body: {} })).status, 200);
  assert.equal(await visible(), true);
  assert.equal((await call(`${SL}/${id}/report`, { account: r3, body: {} })).status, 200);
  assert.equal(await visible(), false);
  assert.equal((await call(`${SL}/${id}/incense`, { account: r1, body: {} })).status, 404);
  assert.equal((await call(`${SL}/${id}/adopt`, { account: r1, body: {} })).status, 404);
  const mine = await call(SL + '/mine', { account: owner });
  assert.equal(mine.data.items.find(i => i.id === id).status, 'hidden');
  assert.equal((await call(`${SL}/${id}/report`, { account: await makeAccount(), body: {} })).status, 404);
});

test('report abuse: reporting cap per account per hour', async () => {
  const reporter = await makeAccount();
  const statuses = [];
  for (let i = 0; i < 12; i++) {
    const { r } = await publish(await makeAccount());
    statuses.push((await call(`${SL}/${r.data.memorial.id}/report`, { account: reporter, body: {} })).status);
  }
  assert.equal(statuses.filter(s => s === 200).length, 10);
  assert.equal(statuses.filter(s => s === 429).length, 2);
});

test('unpublish/delete: owner only (IDOR), then 404; one publish per life even after unpublish', async () => {
  const owner = await makeAccount(); const other = await makeAccount();
  const m = await seedMemorial(owner);
  const pub = await call(SL + '/publish', { account: owner, body: { memorial_id: m.id, consent: true } });
  const id = pub.data.memorial.id;
  assert.equal((await call(`${SL}/${id}`, { account: other, method: 'DELETE' })).status, 404);
  assert.equal((await call(`${SL}/${id}`, { method: 'DELETE' })).status, 401);
  assert.equal((await call(SL + '?limit=50', { account: other })).data.items.some(i => i.id === id), true);
  assert.equal((await call(`${SL}/${id}`, { account: owner, method: 'DELETE' })).status, 200);
  assert.equal((await call(SL + '?limit=50', { account: other })).data.items.some(i => i.id === id), false);
  assert.equal((await call(`${SL}/${id}`, { account: owner, method: 'DELETE' })).status, 404);
  assert.equal((await call(`${SL}/${id}/incense`, { account: other, body: {} })).status, 404);
  assert.equal((await call(SL + '/publish', { account: owner, body: { memorial_id: m.id, consent: true } })).status, 409);
});

test('logout revokes access to the board', async () => {
  const acc = await makeAccount();
  assert.equal((await call(SL, { account: acc })).status, 200);
  await call('/account-auth/logout', { account: acc, body: {} });
  assert.equal((await call(SL, { account: acc })).status, 401);
});

test('memory-mode persistence survives reload from disk', { skip: !!process.env.TEST_DATABASE_URL }, async () => {
  const acc = await makeAccount();
  const { r } = await publish(acc); const id = r.data.memorial.id;
  await (await import('../src/db/sharedLineageStore.js')).reloadForTest();
  const list = await call(SL + '?limit=50', { account: acc });
  assert.ok(list.data.items.some(i => i.id === id));
  const file = path.join(directory, 'shared_lineage.json');
  assert.equal((fs.statSync(file).mode & 0o777), 0o600);
});
