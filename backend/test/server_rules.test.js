import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-rules-'));
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = directory;
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || ''; process.env.GEMINI_API_KEY = '';
const { app } = await import('../src/index.js');
const db = await import('../src/db/db.js');
const { deriveMinigameOutcome } = await import('../src/engine/core/minigames.js');
let server, base;
before(async () => {
  await db.initDb(); server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api/game`;
});
after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
async function request(session, route, body, headers = {}) {
  const response = await fetch(base + route, { method: body === undefined ? 'GET' : 'POST',
    headers: { 'x-session-id': session, 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
async function seed(session, fields = {}) {
  const r = await request(session, '/start', {}); assert.equal(r.status, 200);
  return db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter(); return db.updateCharacter(c.id, { ...c, ...fields });
  });
}

// ---- step 1/2: action handlers use shared bounds ----
test('overtime/gamble/study/network/wellness go through shared bounds (debt floor, karma cap)', async () => {
  await seed('rules_bounds', { age: 30, action_points: 3, cash: -249999, burnout: 99, karma: 99, vitality: 50, max_vitality: 100 });
  const ot = await request('rules_bounds', '/action/overtime', {});
  assert.equal(ot.status, 200); assert.equal(ot.data.character.burnout, 100);
  assert.ok(ot.data.character.recent_risk >= 1, 'overwork at high burnout records risk');
  await seed('rules_gamble', { age: 30, action_points: 3, cash: 100000, karma: 3 });
  const g = await request('rules_gamble', '/action/gamble', {});
  assert.equal(g.status, 200); assert.ok(g.data.character.recent_risk >= 1);
  assert.ok(g.data.character.karma >= 0 && g.data.character.karma <= 100);
  await seed('rules_study', { age: 30, action_points: 3, cash: 100000, karma: 98 });
  const st = await request('rules_study', '/action/study', {});
  assert.equal(st.data.character.karma, 100);
});

// ---- step 3: minigame judged on the server ----
test('deriveMinigameOutcome downgrades forged success, never upgrades, ignores unknown games', () => {
  assert.equal(deriveMinigameOutcome('plant_care_6yo', 10, 'success').outcome, 'failure');
  assert.equal(deriveMinigameOutcome('plant_care_6yo', 50, 'success').outcome, 'fair');
  assert.equal(deriveMinigameOutcome('plant_care_6yo', 90, 'success').outcome, 'success');
  assert.equal(deriveMinigameOutcome('plant_care_6yo', 90, 'failure').outcome, 'failure');
  assert.equal(deriveMinigameOutcome('stock_trader_20yo', 0, 'fair').outcome, 'fair');
  assert.equal(deriveMinigameOutcome('stock_trader_20yo', -8, 'failure').outcome, 'failure');
  const unknown = deriveMinigameOutcome('brand_new_game', 0, 'success');
  assert.deepEqual([unknown.outcome, unknown.known], ['success', false]);
});
test('minigame-result: low score cannot claim success; missing score counts as 0', async () => {
  await seed('rules_mini', { age: 20 });
  const ch = await request('rules_mini', '/action/minigame-start', { minigame_type: 'stock_trader_20yo' });
  const cash0 = (await request('rules_mini', '/state')).data.character.cash;
  const r = await request('rules_mini', '/action/minigame-result', { minigame_type: 'stock_trader_20yo', outcome: 'success', score: 2, challenge_id: ch.data.challenge.id });
  assert.equal(r.status, 200);
  assert.equal(r.data.client_outcome, 'success'); assert.equal(r.data.outcome, 'fair'); assert.equal(r.data.outcome_adjusted, true);
  assert.ok(r.data.character.cash < cash0 + 15000, 'no success payout');
});
test('minigame-result: honest success with a qualifying score is kept; negative stock profit accepted as failure', async () => {
  await seed('rules_mini_ok', { age: 20 });
  const ch = await request('rules_mini_ok', '/action/minigame-start', { minigame_type: 'stock_trader_20yo' });
  const r = await request('rules_mini_ok', '/action/minigame-result', { minigame_type: 'stock_trader_20yo', outcome: 'success', score: 25, challenge_id: ch.data.challenge.id });
  assert.equal(r.data.outcome, 'success'); assert.equal(r.data.outcome_adjusted, false);
  await seed('rules_mini_neg', { age: 20 });
  const ch2 = await request('rules_mini_neg', '/action/minigame-start', { minigame_type: 'stock_trader_20yo' });
  const r2 = await request('rules_mini_neg', '/action/minigame-result', { minigame_type: 'stock_trader_20yo', status: 'fail', score: -12, challenge_id: ch2.data.challenge.id });
  assert.equal(r2.status, 200); assert.equal(r2.data.outcome, 'failure');
});

// ---- step 4: optimistic concurrency ----
test('state version: returned by /state, bumped per successful POST, 409 on stale header, no header = no check', async () => {
  await seed('rules_ver', { age: 30, action_points: 3, cash: 5000 });
  const v0 = (await request('rules_ver', '/state')).data.version;
  assert.equal(typeof v0, 'number');
  const ok = await request('rules_ver', '/action/study', {}, { 'x-state-version': String(v0) });
  assert.equal(ok.status, 200); assert.equal(ok.data.version, v0 + 1);
  const stale = await request('rules_ver', '/action/study', {}, { 'x-state-version': String(v0) });
  assert.equal(stale.status, 409); assert.equal(stale.data.current_version, v0 + 1); assert.ok(stale.data.error);
  assert.equal((await request('rules_ver', '/state')).data.version, v0 + 1, 'rejected POST does not bump');
  const noHeader = await request('rules_ver', '/action/study', {});
  assert.equal(noHeader.status, 200); assert.equal(noHeader.data.version, v0 + 2);
  const failed = await request('rules_ver', '/action/overtime', {}, { 'x-state-version': String(v0 + 2) });
  assert.ok([200, 400].includes(failed.status));
});

test('buy-asset: server prices from the market catalog, client cost/cash_flow are ignored', async () => {
  await seed('qa_buy_cheat', { age: 30, cash: 5000, action_points: 3 });
  const forged = await request('qa_buy_cheat', '/action/buy-asset', { asset_id: 'm1_savings', name: 'x', type: 'savings', cost: 1, annual_cash_flow: 999999999, ap_cost: 1 });
  assert.equal(forged.status, 200, JSON.stringify(forged.data));
  const bought = forged.data.assets.find(a => a.annual_cash_flow !== undefined && a.current_value === 800);
  assert.ok(bought, 'asset must be valued at catalog price 800');
  assert.ok(bought.annual_cash_flow < 1000, 'cash flow must come from catalog');
  assert.ok(forged.data.character.cash <= 5000 - 800 * 0.5, 'catalog cost must be charged');
  const unknown = await request('qa_buy_cheat', '/action/buy-asset', { name: 'Máy in tiền', type: 'stocks', cost: 1, annual_cash_flow: 1e9 });
  assert.equal(unknown.status, 400);
});

test('debt-relief: family soft loan can only be taken once per life', async () => {
  await seed('qa_soft_loan', { age: 30, cash: -5000 });
  const first = await request('qa_soft_loan', '/action/debt-relief', { relief_type: 'family_soft_loan' });
  assert.equal(first.status, 200, JSON.stringify(first.data));
  const second = await request('qa_soft_loan', '/action/debt-relief', { relief_type: 'family_soft_loan' });
  assert.equal(second.status, 409);
});
