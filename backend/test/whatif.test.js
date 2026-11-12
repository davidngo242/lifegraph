import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-whatif-'));
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = directory;
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || ''; process.env.GEMINI_API_KEY = '';
const { app } = await import('../src/index.js');
const db = await import('../src/db/db.js');
const { runInSandbox } = await import('../src/engine/sandbox.js');
const { getRandom } = await import('../src/engine/rng.js');
const { makeClient } = await import('./lib/playLife.js');
let server, api;
before(async () => {
  await db.initDb(); server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  api = makeClient(`http://127.0.0.1:${server.address().port}/api/game`);
});
after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });

// Starts a life and advances `years` times; returns the last tick payload.
async function live(session, seed, years) {
  const s = await api(session, '/start', { karma_perks: { rng_seed: seed } });
  assert.equal(s.status, 200);
  let last = s.data;
  for (let i = 0; i < years; i++) {
    const r = await api(session, '/tick', { advance_only: true });
    assert.equal(r.status, 200);
    last = r.data;
    if (r.data.is_game_over) break;
  }
  return last;
}
const realState = session => db.sessionContext.run({ sessionId: session }, async () => {
  const c = await db.getLatestCharacter();
  const { whatif_uses, ...rest } = c;
  return {
    character: rest, uses: whatif_uses ?? 0,
    assets: await db.getAssets(c.id), relationships: await db.getRelationships(c.id), npcs: await db.getNpcs(c.id),
    rng: { ...db.getSessionData().rng }
  };
});
const strip = r => { const { uses_left, ...rest } = r; return rest; };

test('snapshots: capped at ~10 years, never in public API responses', async () => {
  const last = await live('wi_snap', 4242, 13);
  assert.ok(!last.is_game_over, 'seed must survive 13 early years');
  const info = await api('wi_snap', '/whatif');
  assert.equal(info.status, 200);
  assert.ok(info.data.ages.length > 0 && info.data.ages.length <= 10, `ages=${info.data.ages.length}`);
  assert.equal(info.data.ages.at(-1), last.character.age);
  assert.equal(info.data.uses_left, 3);
  const state = await api('wi_snap', '/state');
  const blob = JSON.stringify(state.data) + JSON.stringify(last);
  assert.ok(!blob.includes('whatif_snaps') && !blob.includes('"snap"'), 'snapshots must not leak into the API');
});

test('what-if is deterministic and never mutates the real session or its rng', async () => {
  const last = await live('wi_pure', 777, 12);
  const from = last.character.age - 3;
  const before = await realState('wi_pure');
  const a = await api('wi_pure', '/whatif', { from_age: from, alt_action: 'study', years: 3 });
  assert.equal(a.status, 200);
  const b = await api('wi_pure', '/whatif', { from_age: from, alt_action: 'study', years: 3 });
  assert.deepEqual(strip(b.data), strip(a.data), 'same inputs -> same output');
  const after = await realState('wi_pure');
  assert.deepEqual(after.character, before.character);
  assert.deepEqual(after.assets, before.assets);
  assert.deepEqual(after.relationships, before.relationships);
  assert.deepEqual(after.npcs, before.npcs);
  assert.deepEqual(after.rng, before.rng, 'rng counter untouched');
  assert.equal(after.uses, before.uses + 2, 'only the use counter changes');
  // shape: both lines, same ages, cash/vitality/karma/death
  assert.equal(a.data.baseline.timeline[0].age, from);
  for (const k of ['age', 'cash', 'vitality', 'karma']) assert.ok(k in a.data.alt.timeline[0]);
  assert.ok('death' in a.data.alt && 'death' in a.data.baseline);
  assert.notDeepEqual(a.data.alt.timeline, a.data.baseline.timeline, 'a different habit changes the line');
});

test('sandbox uses a private rng stream and blocks real writes', async () => {
  await live('wi_guard', 99, 2);
  const before = await realState('wi_guard');
  const priv = { seed: 5, n: 0 };
  const draws = await db.sessionContext.run({ sessionId: 'wi_guard' }, () => runInSandbox(priv, async () => [getRandom(), getRandom()]));
  assert.equal(priv.n, 2);
  assert.deepEqual((await realState('wi_guard')).rng, before.rng);
  await db.sessionContext.run({ sessionId: 'wi_guard' }, async () => {
    await assert.rejects(() => runInSandbox(priv, () => db.updateCharacter(before.character.id, { cash: 1 })), /Sandbox/);
  });
  assert.equal(draws.length, 2);
});

test('validation, missing snapshot and 3 uses per life', async () => {
  const last = await live('wi_limit', 31, 6);
  const age = last.character.age;
  const bad = [
    {}, { from_age: age, alt_action: 'gamble', years: 2 }, { from_age: age, alt_action: 'study', years: 0 },
    { from_age: age, alt_action: 'study', years: 11 }, { from_age: 'x', alt_action: 'study', years: 2 }, { from_age: age, alt_action: 'study', years: 1.5 }
  ];
  for (const body of bad) assert.equal((await api('wi_limit', '/whatif', body)).status, 400, JSON.stringify(body));
  assert.equal((await api('wi_limit', '/whatif', { from_age: age + 50, alt_action: 'study', years: 2 })).status, 404);
  for (const [i, action] of ['study', 'wellness', 'network'].entries()) {
    const r = await api('wi_limit', '/whatif', { from_age: age, alt_action: action, years: 2 });
    assert.equal(r.status, 200); assert.equal(r.data.uses_left, 2 - i);
  }
  const fourth = await api('wi_limit', '/whatif', { from_age: age, alt_action: 'study', years: 2 });
  assert.equal(fourth.status, 403); assert.equal(fourth.data.uses_left, 0);
});

test('what-if is rate limited per session', async () => {
  await live('wi_rate', 5, 1);
  let last;
  for (let i = 0; i < 25; i++) last = await api('wi_rate', '/whatif', {});
  assert.equal(last.status, 429);
});

test('adult overtime branch earns more cash than baseline and the lines stay aligned', async () => {
  const last = await live('wi_adult', 777, 26);
  assert.ok(!last.is_game_over && last.character.age >= 20);
  const r = await api('wi_adult', '/whatif', { from_age: last.character.age - 2, alt_action: 'overtime', years: 2 });
  assert.equal(r.status, 200);
  assert.ok(r.data.summary.cash_delta > 0, `cash_delta=${r.data.summary.cash_delta}`);
  assert.deepEqual(r.data.alt.timeline.map(p => p.age), r.data.baseline.timeline.map(p => p.age));
});
