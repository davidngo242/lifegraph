import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-test-'));
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = directory;
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || ''; process.env.GEMINI_API_KEY = '';
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
  const input = { minigame_id: 'stock_trader_20yo', outcome: 'success', score: 100, challenge_id: challenge.data.challenge.id };
  assert.equal((await request('qa_mini', '/action/minigame-result', input)).status, 200);
  assert.equal((await request('qa_mini', '/action/minigame-result', input)).status, 409);
});

test('inheritance conserves net estate and does not return parent assets after reload', async () => {
  const parent = await seed('qa_heir', { age: 75, death_age: 75, is_deceased: true, cash: 1000 });
  await db.sessionContext.run({ sessionId: 'qa_heir' }, async () => {
    db.getSessionData().assets = [];
    db.getSessionData().relationships = [];
    for (const a of await db.getAssets(parent.id)) await db.deleteAsset(a.id);
    for (const r of await db.getRelationships(parent.id)) await db.updateRelationship(r.id, { type: 'acquaintance', status: 'deceased' });
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
  await seed('qa_journey', { age: 0, action_points: 3, life_seed: null }); // legacy character: no era storylets
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
    nationality: 'Việt Nam',
    occupation: 'Lao động tự do',
    housing: { tier: 1 },
    cash: 1000,
    vitality: 80,
    burnout: 20,
    karma: 50,
    action_points: 4,
    family_endowment: 0,
    innate_traits: [],
    unlocked_skills: []
  });
  await db.sessionContext.run({ sessionId: 'qa_invested_ap' }, async () => {
    const store = db.getSessionData('qa_invested_ap');
    if (store) {
      store.assets = [];
      store.relationships = [];
    }
    // Chế độ Postgres: xoá tài sản qua tầng DB (RAM không phải nguồn dữ liệu).
    const ch = await db.getLatestCharacter();
    for (const a of await db.getAssets(ch.id)) await db.deleteAsset(a.id);
    for (const r of await db.getRelationships(ch.id)) await db.updateRelationship(r.id, { type: 'acquaintance', monthly_cost: 0, monthly_upkeep: 0 });
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
  assert.equal(res.data.passiveSummary.wageIncome, 3906); // age 23, freelance, Việt Nam (T2)
  assert.equal(res.data.passiveSummary.livingCost, 3300); // housing tier 1
  assert.equal(char.cash, 4606); // 1000 + 3000 (boosted by 2 invested AP) + (3906 - 3300)
  assert.equal(char.karma, 66);
  assert.equal(char.vitality, 72);
  assert.equal(char.burnout, 21); // 20 + 10 (mitigated) - 4 (annual passive) - 5 (1 unused AP)

  const strategicLog = char.history_log.find(l => l.event?.includes('Trợ Lực Chiến Lược') || l.choice?.includes('Trợ lực +2 AP'));
  assert.ok(strategicLog, 'History log should record strategic invested AP');
  assert.ok(strategicLog.choice.includes('Trợ lực +2 AP') || strategicLog.note?.includes('2 AP'));
});

test('Senior AP sinks (write_memoir, grandchild_mentorship, early_estate_will) and 10% reduced inheritance tax', async () => {
  await seed('qa_senior', { age: 50, action_points: 3, cash: 5000, karma: 50 });

  // 1. Write memoir
  const resMemoir = await request('qa_senior', '/action/senior', { action_type: 'write_memoir' });
  assert.equal(resMemoir.status, 200);
  assert.equal(resMemoir.data.character.karma, 75);
  assert.equal(resMemoir.data.character.written_memoir, true);

  // 2. Mentorship
  const resMentor = await request('qa_senior', '/action/senior', { action_type: 'grandchild_mentorship' });
  assert.equal(resMentor.status, 200);
  assert.equal(resMentor.data.character.karma, 85);
  assert.equal(resMentor.data.character.mentored_heir, true);

  // 3. Early Estate Will (costs 2 AP & $1000)
  await db.sessionContext.run({ sessionId: 'qa_senior' }, async () => {
    const c = await db.getLatestCharacter();
    await db.updateCharacter(c.id, { action_points: 2 });
  });
  const resWill = await request('qa_senior', '/action/senior', { action_type: 'early_estate_will' });
  assert.equal(resWill.status, 200);
  assert.equal(resWill.data.character.cash, 4000);
  assert.equal(resWill.data.character.early_will_established, true);

  // 4. Test continue child inheritance tax with early will
  const rels = await db.sessionContext.run({ sessionId: 'qa_senior' }, async () => {
    const c = await db.getLatestCharacter();
    await db.updateCharacter(c.id, { is_deceased: true });
    const child = await db.addRelationship({
      character_id: c.id,
      name: 'Nguyen Van Con',
      type: 'child',
      age: 20,
      status: 'alive'
    });
    return child;
  });

  const resHeir = await request('qa_senior', '/continue-child', { child_id: rels.id });
  assert.equal(resHeir.status, 200);
  assert.equal(resHeir.data.inheritance_summary.has_early_will, true);
  assert.equal(resHeir.data.inheritance_summary.tax_rate, 0.10);
});

test('Debt restructuring relief (family_soft_loan, liquidate_personal_items) when cash < 0', async () => {
  await seed('qa_debt', { age: 25, cash: -2000, burnout: 10 });

  // 1. Family Soft Loan ($3,000)
  const resLoan = await request('qa_debt', '/action/debt-relief', { relief_type: 'family_soft_loan' });
  assert.equal(resLoan.status, 200);
  assert.equal(resLoan.data.character.cash, 1000); // -2000 + 3000

  // 2. Reject if cash >= 0
  const resReject = await request('qa_debt', '/action/debt-relief', { relief_type: 'family_soft_loan' });
  assert.equal(resReject.status, 400);

  // 3. Liquidate personal items ($1,200, +10 Burnout)
  await db.sessionContext.run({ sessionId: 'qa_debt' }, async () => {
    const c = await db.getLatestCharacter();
    await db.updateCharacter(c.id, { cash: -1500, burnout: 20 });
  });
  const resLiquidate = await request('qa_debt', '/action/debt-relief', { relief_type: 'liquidate_personal_items' });
  assert.equal(resLiquidate.status, 200);
  assert.equal(resLiquidate.data.character.cash, -300); // -1500 + 1200
  assert.equal(resLiquidate.data.character.burnout, 30);
});

test('Cycle 4: Genetics Big Data & Hereditary Traits Integration', async () => {
  const { GENETICS_BIGDATA } = await import('../src/engine/rebirthEngine.js');
  const { calculateMaxVitality, evaluateReaperRoll } = await import('../src/engine/tickEngine.js');
  const { checkGeneticAffinity } = await import('../src/engine/skillEngine.js');

  const traitIds = GENETICS_BIGDATA.map(g => g.id);
  const requiredTraits = [
    'math_prodigy', 'market_intuition', 'charismatic_orator', 'iron_constitution',
    'culinary_artist', 'photographic_memory', 'resilient_spirit', 'code_whisperer',
    'polyglot_tongue', 'green_thumb', 'empathic_healer', 'negotiation_shark',
    'stoic_zen', 'creative_maverick', 'longevity_ancestry'
  ];

  for (const tid of requiredTraits) {
    assert.ok(traitIds.includes(tid), `Expected trait ${tid} to be in GENETICS_BIGDATA`);
  }

  // 1. Check iron_constitution slows biological decay after 60
  const standardVit80 = calculateMaxVitality(80, null, false, []);
  const ironVit80 = calculateMaxVitality(80, null, false, ['iron_constitution']);
  assert.ok(ironVit80 > standardVit80, `Expected iron_constitution to preserve more vitality at age 80 (${ironVit80} vs ${standardVit80})`);

  // 2. Check longevity_ancestry extends reaper threshold to 75
  const roll72Standard = evaluateReaperRoll(72, 80, false, []);
  const roll72Ancestry = evaluateReaperRoll(72, 80, false, ['longevity_ancestry']);
  assert.equal(roll72Ancestry.died, false, 'Expected longevity_ancestry to never trigger reaper before 75');

  // 3. Check genetic affinity in skills
  assert.equal(checkGeneticAffinity({ innate_traits: ['code_whisperer'] }, 'tech_logic'), true);
  assert.equal(checkGeneticAffinity({ innate_traits: ['negotiation_shark'] }, 'finance_market'), true);
  assert.equal(checkGeneticAffinity({ innate_traits: ['charismatic_orator'] }, 'leadership_social'), true);
  assert.equal(checkGeneticAffinity({ innate_traits: ['stoic_zen'] }, 'resilience_health'), true);
});

test('Cycle 5: Country Big Data: Syria & Expanded Vietnam', async () => {
  const { getCountryBigData, generateCulturallyAuthenticName } = await import('../src/data/countryBigData.js');

  // 1. Syria Big Data
  const syria = getCountryBigData('Syria');
  assert.equal(syria.id, 'T3_Syria');
  assert.equal(syria.tier, 'T3');
  assert.equal(syria.currency.code, 'SYP');
  assert.equal(syria.currency.symbol, '£S');
  assert.ok(syria.cities.some(c => c.includes('Damascus')));
  assert.ok(syria.cities.some(c => c.includes('Aleppo')));
  assert.ok(syria.cities.some(c => c.includes('Homs')));
  assert.ok(syria.assets.g3_suburban_land.includes('Ô Liu'));

  const syrianName = generateCulturallyAuthenticName('Syria', 'character', 'male');
  assert.ok(syrianName && syrianName.length > 3);

  // 2. Vietnam Expanded Cities & Assets
  const vietnam = getCountryBigData('Việt Nam');
  assert.ok(vietnam.cities.some(c => c.includes('Đà Nẵng')));
  assert.ok(vietnam.cities.some(c => c.includes('Hải Phòng')));
  assert.ok(vietnam.cities.some(c => c.includes('Cần Thơ')));
  assert.ok(vietnam.cities.some(c => c.includes('Nha Trang')));
  assert.ok(vietnam.cities.some(c => c.includes('Huế')));
  assert.ok(vietnam.assets.g2_franchise_cafe.includes('Cà Phê Muối'));
  assert.ok(vietnam.assets.g3_suburban_land.includes('Sầu Riêng'));
  assert.ok(vietnam.assets.p1_rental_condo.includes('Nghỉ Dưỡng Biển'));
});

test('auth: raw unknown session id is rejected, server mints a signed one (production mode)', async () => {
  const prev = process.env.NODE_ENV; process.env.NODE_ENV = 'production';
  try {
    const r = await fetch(`${base}/auth/handshake`, { method: 'POST', headers: { 'x-session-id': 'attacker_guess', 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(r.status, 200);
    const body = await r.json();
    assert.notEqual(body.session_id, 'attacker_guess');
    assert.match(body.session_id, /^g_[a-f0-9]{32}$/);
    assert.ok(r.headers.get('x-session-token').startsWith(body.session_id));
    const r2 = await fetch(`${base}/auth/handshake`, { method: 'POST', headers: { 'x-session-token': r.headers.get('x-session-token'), 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal((await r2.json()).session_id, body.session_id);
  } finally { process.env.NODE_ENV = prev; }
});

test('auth: legacy cached session is claimed exactly once, then raw id is refused', async () => {
  const prev = process.env.NODE_ENV; process.env.NODE_ENV = 'production';
  try {
    const legacy = 'user_legacy_cached_1';
    db.getSessionData(legacy).claimed = false;
    const hs = id => fetch(`${base}/auth/handshake`, { method: 'POST', headers: { 'x-session-id': id, 'Content-Type': 'application/json' }, body: '{}' }).then(async r => ({ body: await r.json(), token: r.headers.get('x-session-token') }));
    const first = await hs(legacy);
    assert.equal(first.body.session_id, legacy);
    const second = await hs(legacy);
    assert.notEqual(second.body.session_id, legacy);
  } finally { process.env.NODE_ENV = prev; }
});
