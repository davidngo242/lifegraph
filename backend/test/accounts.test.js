import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-acc-'));
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = directory;
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || ''; process.env.GEMINI_API_KEY = '';
const { app } = await import('../src/index.js');
const db = await import('../src/db/db.js');
const usePg = !!process.env.TEST_DATABASE_URL;
let server, root;
before(async () => {
  await db.initDb(); server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  root = `http://127.0.0.1:${server.address().port}/api/game`;
});
after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });

async function call(route, { method, body, token, account } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['x-session-token'] = token;
  if (account) headers['x-account-token'] = account;
  const r = await fetch(root + route, { method: method || (body === undefined ? 'GET' : 'POST'), headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { status: r.status, data, text, session: r.headers.get('x-session-token'), sessionId: r.headers.get('x-session-id') };
}
const A = '/account-auth';
let n = 0; const uname = () => `User_${process.pid}_${Date.now().toString(36)}_${n++}`;
async function guestWithCharacter() {
  const g = await call('/state'); assert.equal(g.status, 200);
  const s = await call('/start', { body: {}, token: g.session }); assert.equal(s.status, 200);
  const st = await call('/state', { token: g.session });
  return { token: g.session, sessionId: g.sessionId, character: st.data.character };
}

test('register validates input and never returns or logs hashes', async () => {
  assert.equal((await call(A + '/register', { body: { username: 'ab', password: 'longenough1' } })).status, 400);
  assert.equal((await call(A + '/register', { body: { username: 'x'.repeat(33), password: 'longenough1' } })).status, 400);
  assert.equal((await call(A + '/register', { body: { username: uname(), password: 'short' } })).status, 400);
  assert.equal((await call(A + '/register', { body: { username: 'bad name!', password: 'longenough1' } })).status, 400);
  assert.equal((await call(A + '/register', { body: { username: uname() } })).status, 400);
  const name = uname();
  const r = await call(A + '/register', { body: { username: name, password: 'correct horse' } });
  assert.equal(r.status, 200);
  assert.equal(r.data.username, name.toLowerCase());
  assert.ok(r.data.account_token); assert.ok(r.data.session_token);
  assert.doesNotMatch(r.text, /pass_hash|salt|hash/i);
  const dup = await call(A + '/register', { body: { username: name.toUpperCase(), password: 'another one 1' } });
  assert.equal(dup.status, 409);
});

test('login: right password works, wrong password and unknown user give the same generic error', async () => {
  const name = uname();
  const reg = await call(A + '/register', { body: { username: name, password: 'correct horse' } });
  const ok = await call(A + '/login', { body: { username: name.toUpperCase(), password: 'correct horse' } });
  assert.equal(ok.status, 200); assert.ok(ok.data.account_token);
  assert.equal(ok.data.session_id, reg.data.session_id);
  assert.doesNotMatch(ok.text, /pass_hash|salt/i);
  const bad = await call(A + '/login', { body: { username: name, password: 'wrong password' } });
  const ghost = await call(A + '/login', { body: { username: uname(), password: 'wrong password' } });
  assert.equal(bad.status, 401); assert.equal(ghost.status, 401);
  assert.deepEqual(bad.data, ghost.data);
  assert.equal((await call(A + '/login', { body: { username: name } })).status, 400);
});

test('login rate limit: 10 per minute per IP+username, generic message', async () => {
  const name = uname();
  await call(A + '/register', { body: { username: name, password: 'correct horse' } });
  const statuses = [];
  for (let i = 0; i < 12; i++) statuses.push((await call(A + '/login', { body: { username: name, password: 'nope nope nope' } })).status);
  assert.equal(statuses.filter(s => s === 401).length, 10);
  assert.equal(statuses.filter(s => s === 429).length, 2);
  // even the right password is throttled now, so lockout leaks nothing about correctness
  assert.equal((await call(A + '/login', { body: { username: name, password: 'correct horse' } })).status, 429);
  // a different username from the same IP is unaffected
  const other = uname();
  await call(A + '/register', { body: { username: other, password: 'correct horse' } });
  assert.equal((await call(A + '/login', { body: { username: other, password: 'correct horse' } })).status, 200);
});

test('/me needs a valid account token; logout revokes it', async () => {
  assert.equal((await call(A + '/me')).status, 401);
  assert.equal((await call(A + '/me', { account: 'garbage.token' })).status, 401);
  const name = uname();
  const reg = await call(A + '/register', { body: { username: name, password: 'correct horse' } });
  const me = await call(A + '/me', { account: reg.data.account_token });
  assert.equal(me.status, 200); assert.equal(me.data.username, name.toLowerCase());
  assert.doesNotMatch(me.text, /pass_hash|salt/i);
  assert.equal((await call(A + '/logout', { body: {}, account: reg.data.account_token })).status, 200);
  assert.equal((await call(A + '/me', { account: reg.data.account_token })).status, 401);
  const again = await call(A + '/login', { body: { username: name, password: 'correct horse' } });
  assert.equal((await call(A + '/me', { account: again.data.account_token })).status, 200);
});

test('link-guest keeps guest progress, and another device logging in restores the same game', async () => {
  const guest = await guestWithCharacter();
  const name = uname();
  const reg = await call(A + '/register', { body: { username: name, password: 'correct horse' } });
  assert.equal((await call(A + '/link-guest', { body: {}, token: guest.token })).status, 401, 'needs login');
  const link = await call(A + '/link-guest', { body: {}, token: guest.token, account: reg.data.account_token });
  assert.equal(link.status, 200); assert.equal(link.data.session_id, guest.sessionId);
  // device B: no session at all, logs in
  const login = await call(A + '/login', { body: { username: name, password: 'correct horse' } });
  assert.equal(login.status, 200); assert.equal(login.data.session_id, guest.sessionId);
  assert.equal(login.sessionId, guest.sessionId, 'x-session-id header switched to the account session');
  const state = await call('/state', { token: login.data.session_token });
  assert.equal(state.data.character.id, guest.character.id);
  assert.equal((await call('/state', { token: login.session })).data.character.id, guest.character.id);
});

test('link-guest refuses: already-linked guest, and accounts that already hold progress (unless replace)', async () => {
  const guest = await guestWithCharacter();
  const a = await call(A + '/register', { body: { username: uname(), password: 'correct horse' } });
  const b = await call(A + '/register', { body: { username: uname(), password: 'correct horse' } });
  assert.equal((await call(A + '/link-guest', { body: {}, token: guest.token, account: a.data.account_token })).status, 200);
  assert.equal((await call(A + '/link-guest', { body: {}, token: guest.token, account: b.data.account_token })).status, 409);
  const guest2 = await guestWithCharacter();
  const conflict = await call(A + '/link-guest', { body: {}, token: guest2.token, account: a.data.account_token });
  assert.equal(conflict.status, 409);
  const forced = await call(A + '/link-guest', { body: { replace: true }, token: guest2.token, account: a.data.account_token });
  assert.equal(forced.status, 200); assert.equal(forced.data.session_id, guest2.sessionId);
});

test('guest flow is unchanged: no account needed, state persists per guest token', async () => {
  const g = await guestWithCharacter();
  const again = await call('/state', { token: g.token });
  assert.equal(again.data.character.id, g.character.id);
});

test('accounts persist in storage and reload', async () => {
  const name = uname();
  await call(A + '/register', { body: { username: name, password: 'correct horse' } });
  await db.reloadAccountsForTest();
  assert.equal((await call(A + '/login', { body: { username: name, password: 'correct horse' } })).status, 200);
});

test('legacy claim (postgres): an unclaimed player_accounts row is claimable exactly once', { skip: !usePg }, async () => {
  const pg = (await import('pg')).default;
  const client = new pg.Client({ connectionString: process.env.TEST_DATABASE_URL });
  await client.connect();
  const legacy = 'legacy_pg_' + Date.now();
  try {
    await client.query('INSERT INTO player_accounts (id) VALUES ($1)', [legacy]);
    const prev = process.env.NODE_ENV; process.env.NODE_ENV = 'production';
    try {
      const hs = id => fetch(`${root}/auth/handshake`, { method: 'POST', headers: { 'x-session-id': id, 'Content-Type': 'application/json' }, body: '{}' }).then(r => r.json());
      assert.equal((await hs(legacy)).session_id, legacy);
      assert.notEqual((await hs(legacy)).session_id, legacy);
      const ghost = 'never_existed_' + Date.now();
      assert.notEqual((await hs(ghost)).session_id, ghost);
    } finally { process.env.NODE_ENV = prev; }
  } finally { await client.query('DELETE FROM player_accounts WHERE id=$1', [legacy]); await client.end(); }
});
