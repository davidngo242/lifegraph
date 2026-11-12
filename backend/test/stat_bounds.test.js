import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-bounds-'));
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = directory;
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || ''; process.env.GEMINI_API_KEY = '';
const { app } = await import('../src/index.js');
const db = await import('../src/db/db.js');
const { CASH_FLOOR, applyDelta, setStat, spendCapped } = await import('../src/engine/core/stats.js');
let server, base;
before(async () => {
  await db.initDb(); server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api/game`;
});
after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });

async function request(session, route, body) {
  const response = await fetch(base + route, { method: 'POST',
    headers: { 'x-session-id': session, 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) });
  return response.status;
}
async function seed(session, fields) {
  assert.equal(await request(session, '/start', {}), 200);
  return db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter(); return db.updateCharacter(c.id, { ...c, ...fields });
  });
}
async function read(session) {
  return db.sessionContext.run({ sessionId: session }, () => db.getLatestCharacter());
}
// Deterministic PRNG so failures reproduce.
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const CALLS = [
  ['/action/family', { action_type: 'date' }], ['/action/family', { action_type: 'marry' }], ['/action/family', { action_type: 'have_child' }],
  ['/action/family', { action_type: 'family_meal' }], ['/action/family', { action_type: 'gift_parent' }], ['/action/family', { action_type: 'family_mentorship' }],
  ['/action/senior', { action_type: 'write_memoir' }], ['/action/senior', { action_type: 'early_estate_will' }], ['/action/senior', { action_type: 'grandchild_mentorship' }],
  ['/action/debt-relief', { relief_type: 'family_soft_loan' }], ['/action/debt-relief', { relief_type: 'liquidate_personal_items' }],
  ['/action/wellness', { action_type: 'medical_checkup' }], ['/action/wellness', { action_type: 'meditation_retreat' }],
  ['/action/overtime', {}], ['/action/study', {}], ['/action/network', {}], ['/action/gamble', {}],
  ['/action/annual-focus', { focus_type: 'hustle' }], ['/action/annual-focus', { focus_type: 'study' }], ['/action/annual-focus', { focus_type: 'wellness' }],
  ['/blessing', { blessing_type: 'benefactor_grace' }], ['/blessing', { blessing_type: 'vitality_shield' }],
  ['/action/skill-train', { skill_id: 'finance' }], ['/action/skill-train', { skill_id: 'coding' }],
  ['/action/minigame-result', { minigame_id: 'negotiation_duel', outcome: 'success', score: 9e9 }],
  ['/action/minigame-result', { minigame_id: 'survival_escape', outcome: 'failure', score: -9e9 }],
  ['/action/rpg-active-perk', { perk_type: 'zen_meditation' }], ['/action/rpg-active-perk', { perk_type: 'stock_trading' }], ['/action/rpg-active-perk', { perk_type: 'vip_networking' }],
  ['/action/childhood', { action_id: 'help_chores' }], ['/action/childhood', { action_id: 'sunbath' }], ['/action/childhood', { action_id: 'teen_part_time' }],
  ['/action/childhood', { action_id: 'thoi_noi_coin' }], ['/action/childhood', { action_id: 'play_friends' }],
  ['/action/custom-resolve', { user_action_text: 'x'.repeat(40), cost_ap: 1 }],
  ['/action/sell-asset', { asset_id: 'nonexistent', cost_ap: 1 }], ['/action/upgrade-housing', { housing_id: 'villa', target_tier: 5 }],
  ['/transhumanism', {}], ['/tick', {}], ['/tick', { choice_id: 'x' }],
];
const EXTREME = {
  cash: [-250000, -1, 0, 1, 5, 1e6, 1e12],
  vitality: [0, 1, 10, 50, 100],
  karma: [0, 1, 50, 99, 100],
  burnout: [0, 1, 50, 99, 100],
  age: [3, 8, 14, 19, 30, 45, 62, 75, 90]
};

function assertBounds(c, label) {
  const maxV = Math.max(100, Number(c.max_vitality) || 100);
  assert.ok(Number.isFinite(c.vitality) && c.vitality >= 0 && c.vitality <= maxV, `${label}: vitality ${c.vitality} not in [0,${maxV}]`);
  assert.ok(Number.isFinite(c.burnout) && c.burnout >= 0 && c.burnout <= 100, `${label}: burnout ${c.burnout}`);
  // tickEngine deliberately credits +120 karma to a child who dies (karmaReimbursed); a deceased record is exempt from the upper bound.
  assert.ok(Number.isFinite(c.karma) && c.karma >= 0 && (c.is_deceased || c.karma <= 100), `${label}: karma ${c.karma}`);
  assert.ok(Number.isFinite(c.cash) && c.cash >= CASH_FLOOR, `${label}: cash ${c.cash} below floor`);
}

test('fuzz: extreme stats through API handlers never leave the shared bounds', async () => {
  const rnd = mulberry(20261112);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  for (let i = 0; i < 160; i++) {
    const session = `qa_bounds_${i}`;
    const [route, body] = CALLS[i % CALLS.length];
    const start = { cash: pick(EXTREME.cash), vitality: pick(EXTREME.vitality), karma: pick(EXTREME.karma), burnout: pick(EXTREME.burnout), age: pick(EXTREME.age), action_points: 5 };
    await seed(session, start);
    const status = await request(session, route, body);
    assert.ok(status < 500, `${route} ${JSON.stringify(body)} from ${JSON.stringify(start)} -> HTTP ${status}`);
    assertBounds(await read(session), `${route} ${JSON.stringify(body)} from ${JSON.stringify(start)}`);
  }
});

test('core stats helpers hold the bounds', () => {
  const c = { cash: 10, vitality: 50, max_vitality: 80, karma: 50, burnout: 50, hidden_flags: [] };
  applyDelta(c, { vitality: 1e9, karma: 1e9, burnout: -1e9, cash: -1e12 });
  assert.deepEqual([c.vitality, c.karma, c.burnout, c.cash], [80, 100, 0, CASH_FLOOR]);
  applyDelta(c, { vitality: -1e9, karma: -1e9, burnout: 1e9, cash: NaN });
  assert.deepEqual([c.vitality, c.karma, c.burnout], [0, 0, 100]);
  setStat(c, 'vitality', 9999); assert.equal(c.vitality, 80);
  const d = { cash: 100, hidden_flags: [] };
  assert.equal(spendCapped(d, 500), 100); assert.equal(d.cash, 0);
  d.cash = -50; assert.equal(spendCapped(d, 10), 0); assert.equal(d.cash, -50);
});
