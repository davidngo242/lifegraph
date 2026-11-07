import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-test-'));
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = directory;
process.env.DATABASE_URL = ''; process.env.GEMINI_API_KEY = '';
const { app } = await import('../src/index.js');
const db = await import('../src/db/db.js');
let server, base;
before(async () => {
  await db.initDb(); server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api/game`;
});
after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
async function request(session, route, body, actionId) {
  const response = await fetch(base + route, { method: body === undefined ? 'GET' : 'POST',
    headers: { 'x-session-id': session, 'Content-Type': 'application/json', ...(actionId ? { 'x-action-id': actionId } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
async function seed(session, fields = {}) {
  const r = await request(session, '/start', {}); assert.equal(r.status, 200);
  return db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter(); return db.updateCharacter(c.id, { ...c, ...fields });
  });
}

test('AP zero, postpone, scene validation and one-time resolution survive HTTP retries', async () => {
  await seed('qa_scenario', { action_points: 0 });
  const current = await request('qa_scenario', '/scenario/current');
  assert.equal(current.data.action_points, 0);
  let r = await request('qa_scenario', '/scenario/resolve-mindstage', { choice_id: 'CHOICE_POSTPONE_OBSERVE', scenario_id: current.data.scenario.id });
  assert.equal(r.status, 200); assert.equal(r.data.postponed, true);
  assert.equal((await request('qa_scenario', '/scenario/transition', { scene_id: 'not-a-scene' })).status, 400);
  const payload = { choice_id: 'CHOICE_FIRST_STEPS', scenario_id: current.data.scenario.id };
  const first = await request('qa_scenario', '/scenario/resolve-mindstage', payload, 'action_12345678');
  const retry = await request('qa_scenario', '/scenario/resolve-mindstage', payload, 'action_12345678');
  assert.equal(first.status, 200); assert.deepEqual(retry.data, first.data);
  const different = await request('qa_scenario', '/scenario/resolve-mindstage', { ...payload, choice_id: 'CHOICE_EARLY_LANGUAGE' }, 'action_12345678');
  assert.equal(different.status, 409);
  const next = await request('qa_scenario', '/scenario/current');
  assert.equal(next.data.scenario, null); assert.ok(next.data.last_resolution);
  assert.equal((await request('qa_scenario', '/scenario/resolve-mindstage', { ...payload, choice_id: 'CHOICE_EARLY_LANGUAGE' })).status, 400);
});

test('separate sessions retain separate characters and active dilemmas', async () => {
  const a = await seed('qa_alice', { name: 'Alice', age: 6 });
  const b = await seed('qa_bob', { name: 'Bob', age: 56 });
  const [sa, sb] = await Promise.all([request('qa_alice', '/state'), request('qa_bob', '/state')]);
  assert.equal(sa.data.character.id, a.id); assert.equal(sb.data.character.id, b.id);
  const aAgain = await request('qa_alice', '/state');
  assert.deepEqual(aAgain.data.dilemma, sa.data.dilemma);
  assert.notEqual(aAgain.data.character.id, sb.data.character.id);
});

test('paying for a clue once persists AP and NPC state correctly', async () => {
  await seed('qa_clue', { age: 28, action_points: 1, hidden_flags: [] });
  const one = await request('qa_clue', '/scenario/interact', { scene_id: 'scene_cafe', hotspot_id: 'hs_customer' });
  const two = await request('qa_clue', '/scenario/interact', { scene_id: 'scene_cafe', hotspot_id: 'hs_customer' });
  assert.equal(one.status, 200); assert.equal(two.status, 200);
  assert.equal(one.data.ap_remaining, 0); assert.equal(two.data.ap_remaining, 0);
  const c = await request('qa_clue', '/scenario/current'); assert.equal(c.data.action_points, 0);
});

test('surrender and minigames do not award the same event twice', async () => {
  await seed('qa_settle', { age: 28 });
  assert.equal((await request('qa_settle', '/rebirth/surrender', {})).status, 200);
  const afterFirst = await request('qa_settle', '/account');
  assert.equal((await request('qa_settle', '/rebirth/surrender', {})).status, 409);
  assert.deepEqual((await request('qa_settle', '/account')).data, afterFirst.data);
  await seed('qa_mini', { age: 20 });
  const challenge = await request('qa_mini', '/action/minigame-start', { minigame_type: 'stock_trader_20yo' });
  assert.equal(challenge.status, 200);
  const input = { minigame_id: 'stock_trader_20yo', outcome: 'success', challenge_id: challenge.data.challenge.id };
  assert.equal((await request('qa_mini', '/action/minigame-result', input)).status, 200);
  assert.equal((await request('qa_mini', '/action/minigame-result', input)).status, 409);
});

test('inheritance conserves net estate and does not return parent assets after reload', async () => {
  const parent = await seed('qa_heir', { age: 75, death_age: 75, is_deceased: true, cash: 1000 });
  await db.sessionContext.run({ sessionId: 'qa_heir' }, async () => {
    db.getSessionData().assets = [];
    db.getSessionData().relationships = [];
    await db.addAsset({ character_id: parent.id, name: 'Factory', type: 'business', current_value: 100000 });
    await db.addRelationship({ character_id: parent.id, name: 'Child', type: 'child', age: 30, status: 'alive' });
  });
  const result = await request('qa_heir', '/rebirth/heir', {});
  assert.equal(result.status, 200, JSON.stringify(result.data));
  const net = result.data.character.cash + result.data.assets.reduce((s, a) => s + a.current_value, 0);
  assert.equal(net, 70700);
  const reloaded = await request('qa_heir', '/state'); assert.equal(reloaded.data.net_worth, 70700);
  assert.equal(reloaded.data.assets.length, 1);
  assert.equal((await request('qa_heir', '/rebirth/heir', {})).status, 409);
});

test('a failed minigame from the actual frontend status vocabulary is accepted once', async () => {
  await seed('qa_mini_fail', { age: 20 });
  const challenge = await request('qa_mini_fail', '/action/minigame-start', { minigame_type: 'stock_trader_20yo' });
  const result = await request('qa_mini_fail', '/action/minigame-result', { minigame_type: 'stock_trader_20yo', status: 'fail', challenge_id: challenge.data.challenge.id });
  assert.equal(result.status, 200); assert.equal(result.data.outcome, 'failure');
});

test('client snapshots cannot overwrite character state', async () => {
  const c = await seed('qa_payload');
  const result = await request('qa_payload', '/rebirth', { character: { ...c, cash: 5000000 } });
  assert.equal(result.status, 400);
  const after = await request('qa_payload', '/state'); assert.equal(after.data.character.cash, c.cash);
});

test('commitment action without a living character returns a clear error', async () => {
  const empty = await request('qa_empty_commitment', '/scenario/commitment', {});
  assert.equal(empty.status, 400);
  assert.equal(empty.data.error, 'Không có kiếp sống đang hoạt động.');
  await seed('qa_dead_commitment', { is_deceased: true });
  const dead = await request('qa_dead_commitment', '/scenario/commitment', {});
  assert.equal(dead.status, 400);
  assert.equal(dead.data.error, empty.data.error);
});

test('the post-scenario journey fulfills a promise, advances years, and opens school', async () => {
  await seed('qa_journey', { age: 0, action_points: 3 });
  const initial = await request('qa_journey', '/scenario/current');
  const resolved = await request('qa_journey', '/scenario/resolve-mindstage', {
    scenario_id: initial.data.scenario.id, choice_id: 'CHOICE_FIRST_STEPS' });
  const commitment = resolved.data.commitments[0];
  const done = await request('qa_journey', '/scenario/commitment', { commitment_id: commitment.id });
  assert.equal(done.status, 200); assert.equal(done.data.commitments[0].status, 'fulfilled');
  const again = await request('qa_journey', '/scenario/commitment', { commitment_id: commitment.id });
  assert.equal(again.data.character_state.action_points, done.data.character_state.action_points);
  const empty = await request('qa_journey', '/scenario/current');
  assert.equal(empty.data.scenario, null); assert.equal(empty.data.next_scenario_age, 6);
  for (let year = 1; year <= 6; year++) {
    const next = await request('qa_journey', '/tick', { advance_only: true });
    assert.equal(next.status, 200); assert.equal(next.data.character.age, year);
  }
  const school = await request('qa_journey', '/scenario/current');
  assert.equal(school.data.scenario.id, 'scenario_school_first_decade');
});

test('concurrent resolution calls return one authoritative reward', async () => {
  await seed('qa_race', { age: 28, cash: 1000, action_points: 3, hidden_flags: [] });
  const body = { scenario_id: 'scenario_career_crossroads_28', choice_id: 'CHOICE_STAY_CORPORATE' };
  const [a, b] = await Promise.all([request('qa_race', '/scenario/resolve-mindstage', body), request('qa_race', '/scenario/resolve-mindstage', body)]);
  assert.equal(a.status, 200); assert.equal(b.status, 200);
  const state = await request('qa_race', '/state');
  assert.equal(state.data.character.history_log.filter(x => x.scenario_id === body.scenario_id).length, 1);
  assert.equal(state.data.character.cash, a.data.character_state.cash);
});

test('a trust fund is released once when advancing through adulthood', async () => {
  await seed('qa_endowment', { age: 17, cash: 1000, family_endowment: 250000 });
  const result = await request('qa_endowment', '/tick', { advance_only: true });
  assert.equal(result.status, 200); assert.equal(result.data.character.age, 18);
  assert.equal(result.data.character.family_endowment, 0);
  const logs = result.data.character.history_log.filter(x => x.event?.includes('Cột Mốc Tuổi 18'));
  assert.equal(logs.length, 1);
  const next = await request('qa_endowment', '/tick', { advance_only: true });
  assert.equal(next.data.character.history_log.filter(x => x.event?.includes('Cột Mốc Tuổi 18')).length, 1);
});


test('invested_ap boosts rewards, mitigates risks and appends strategic log note', async () => {
  await seed('qa_invested_ap', {
    age: 22,
    cash: 1000,
    vitality: 80,
    burnout: 20,
    karma: 50,
    action_points: 4,
    family_endowment: 0
  });
  await db.sessionContext.run({ sessionId: 'qa_invested_ap' }, async () => {
    const store = db.getSessionData('qa_invested_ap');
    if (store) {
      store.assets = [];
      store.relationships = [];
    }
  });

  const customDilemma = {
    id: 'dilemma_investment_test',
    title: 'Thử Thách Đầu Tư Mạo Hiểm',
    type: 'STANDARD',
    options: [
      {
        id: 'opt_high_risk_venture',
        action_title: 'Dốc Vốn Khởi Nghiệp Công Nghệ',
        cost_ap: 1,
        effects: {
          cash_delta: 2000,
          karma_delta: 10,
          vitality_delta: -20,
          burnout_delta: 20
        }
      }
    ]
  };

  const res = await request('qa_invested_ap', '/tick', {
    choice_id: 'opt_high_risk_venture',
    interaction_type: 'STANDARD',
    invested_ap: 2,
    previous_dilemma: customDilemma
  });

  assert.equal(res.status, 200);
  const char = res.data.character;
  assert.equal(char.cash, 4000); // 1000 + 3000 (boosted by 2 invested AP)
  assert.equal(char.karma, 66);
  assert.equal(char.vitality, 72);
  assert.equal(char.burnout, 21); // 20 + 10 (mitigated) - 4 (annual passive) - 5 (1 unused AP)

  const strategicLog = char.history_log.find(l => l.event?.includes('Trợ Lực Chiến Lược') || l.choice?.includes('Trợ lực +2 AP'));
  assert.ok(strategicLog, 'History log should record strategic invested AP');
  assert.ok(strategicLog.choice.includes('Trợ lực +2 AP') || strategicLog.note?.includes('2 AP'));
});
