import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-ot-'));
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = directory;
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || ''; process.env.GEMINI_API_KEY = '';
const { app } = await import('../src/index.js');
const db = await import('../src/db/db.js');
const { resolveHousingTier } = await import('../src/engine/core/income.js');
let server, base;
before(async () => {
  await db.initDb(); server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api/game`;
});
after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
async function request(session, route, body) {
  const response = await fetch(base + route, { method: body === undefined ? 'GET' : 'POST',
    headers: { 'x-session-id': session, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
async function seed(session, fields = {}) {
  await request(session, '/start', {});
  return db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter(); return db.updateCharacter(c.id, { ...c, ...fields });
  });
}
const CLEAN = { age: 30, cash: 0, burnout: 0, vitality: 100, skills: {}, innate_traits: [], unlocked_skills: [], active_pledge: null };
// Age 30, no skills/traits/pledge: base = 1500 + 30*120 + [0,800) = [5100, 5900]
const LO = 5100, HI = 5900;
const inRange = (v, mult) => v >= Math.round(LO * mult) - 1 && v <= Math.round(HI * mult) + 1;

test('overtime: 1st AP pays 100%, 2nd 60%, 3rd and later 35%', async () => {
  await seed('ot_dim', { ...CLEAN, action_points: 6 });
  const pays = [];
  for (let i = 0; i < 4; i++) { const r = await request('ot_dim', '/action/overtime', {}); assert.equal(r.status, 200); pays.push(r.data.earnedCash); }
  assert.ok(inRange(pays[0], 1), `1st ${pays[0]}`);
  assert.ok(inRange(pays[1], 0.6), `2nd ${pays[1]}`);
  assert.ok(inRange(pays[2], 0.35), `3rd ${pays[2]}`);
  assert.ok(inRange(pays[3], 0.35), `4th ${pays[3]}`);
});

test('overtime: burnout >= 70 halves the payout (multiplicative with the counter)', async () => {
  await seed('ot_burn', { ...CLEAN, burnout: 70, action_points: 3 });
  const a = await request('ot_burn', '/action/overtime', {});
  assert.ok(inRange(a.data.earnedCash, 0.5), `1st@burnout ${a.data.earnedCash}`);
  const b = await request('ot_burn', '/action/overtime', {});
  assert.ok(inRange(b.data.earnedCash, 0.3), `2nd@burnout ${b.data.earnedCash}`); // 0.6 * 0.5
});

test('overtime: yearly counter resets when the year advances', async () => {
  await seed('ot_reset', { ...CLEAN, action_points: 6 });
  await request('ot_reset', '/action/overtime', {});
  await request('ot_reset', '/action/overtime', {});
  const st = await request('ot_reset', '/state');
  assert.equal(st.data.character.overtime_year_count, 2);
  const t = await request('ot_reset', '/tick', { advance_only: true });
  assert.equal(t.status, 200);
  assert.equal(t.data.character.overtime_year_count, 0);
  await db.sessionContext.run({ sessionId: 'ot_reset' }, async () => {
    const c = await db.getLatestCharacter(); await db.updateCharacter(c.id, { ...c, action_points: 3, burnout: 0, vitality: 100 });
  });
  const r = await request('ot_reset', '/action/overtime', {});
  assert.equal(r.status, 200);
  const age = r.data.character.age;
  assert.ok(r.data.earnedCash >= 1500 + age * 120 - 1 && r.data.earnedCash <= 1500 + age * 120 + 801, `post-reset full pay ${r.data.earnedCash}`);
});

test('housing given as a string maps to a tier instead of silently tier 1', () => {
  assert.equal(resolveHousingTier({ tier: 3 }), 3);
  assert.equal(resolveHousingTier('villa'), 4);
  assert.equal(resolveHousingTier('luxury_villa'), 4);
  assert.equal(resolveHousingTier('luxury_apartment'), 3);
  assert.equal(resolveHousingTier('rental_apartment'), 2);
  assert.equal(resolveHousingTier('grand_manor'), 5);
  assert.equal(resolveHousingTier('slum_shared'), 1);
  assert.equal(resolveHousingTier(undefined), 1);
  assert.equal(resolveHousingTier('???'), 1);
});
