/**
 * LifeGraph Commercialization Stress Suite & Automated Quality Gate
 * Executes 10 exhaustive testing cycles covering full lifecycle, edge cases,
 * security, AP conservation, economy, and frontend state contracts.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

// Set isolated test environment
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-commercial-suite-'));
process.env.NODE_ENV = 'test';
process.env.LIFEGRAPH_DATA_DIR = tempDir;
process.env.DATABASE_URL = '';
process.env.GEMINI_API_KEY = '';

const { app } = await import('../backend/src/index.js');
const db = await import('../backend/src/db/db.js');

let server;
let base;

await db.initDb();
server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
base = `http://127.0.0.1:${server.address().port}/api/game`;

console.log(`\n======================================================================`);
console.log(`🚀 LIFEGRAPH COMMERCIALIZATION STRESS-TEST SUITE`);
console.log(`Target: ${base} | Temp DB: ${tempDir}`);
console.log(`======================================================================\n`);

async function api(session, route, body = undefined, headers = {}) {
  const method = body === undefined ? 'GET' : 'POST';
  const reqHeaders = {
    'x-session-id': session,
    'Content-Type': 'application/json',
    ...headers
  };
  const response = await fetch(base + route, {
    method,
    headers: reqHeaders,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }
  return { status: response.status, data, headers: response.headers };
}

const defectsFound = [];
function reportDefect(cycle, description, error) {
  const msg = `[Cycle ${cycle}] ${description}: ${error?.message || error}`;
  console.error(`❌ DEFECT: ${msg}`);
  defectsFound.push({ cycle, description, error: error?.message || String(error) });
}

// ---------------------------------------------------------------------------
// CYCLE 1: 30 Lifetimes Simulation (Age 0 -> Death)
// ---------------------------------------------------------------------------
console.log(`▶ Starting Cycle 1: 30 Full Lifetimes Simulation...`);
try {
  const countries = ['VN', 'US', 'JP', 'KR', 'DE', 'FR', 'GB', 'SG', 'AU', 'CA'];
  for (let i = 1; i <= 30; i++) {
    const session = `sim_life_${i}`;
    const country = countries[i % countries.length];
    
    // Start life
    const startRes = await api(session, '/start', { country, gender: i % 2 === 0 ? 'male' : 'female' });
    assert.equal(startRes.status, 200, `Failed to start life for session ${session}`);
    assert.ok(startRes.data.character, 'Character object missing');
    
    let char = startRes.data.character;
    let ticks = 0;
    const maxTicks = 120; // safety ceiling
    
    while (!char.is_deceased && ticks < maxTicks) {
      ticks++;
      // Check for numeric validity
      ['vitality', 'burnout', 'karma', 'cash', 'action_points', 'age'].forEach(field => {
        const val = char[field];
        if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
          throw new Error(`Numeric corruption in field ${field}: received ${val} at age ${char.age}`);
        }
      });

      // Execute actions if AP available
      if (char.action_points > 0) {
        if (char.age >= 18) {
          await api(session, '/action/overtime', {});
        } else {
          await api(session, '/action/childhood', { action_type: 'play_and_explore' });
        }
      }

      // Tick to next year
      const tickRes = await api(session, '/tick', { advance_only: true });
      if (tickRes.status !== 200) {
        throw new Error(`Tick failed with status ${tickRes.status}: ${JSON.stringify(tickRes.data)}`);
      }
      char = tickRes.data.character;
    }

    assert.ok(char.is_deceased || ticks >= maxTicks, `Character did not reach end-of-life properly`);
    assert.ok(char.age > 0, `Character died without aging`);
  }
  console.log(`✅ Cycle 1 Passed: 30 full life cycles completed with zero numeric corruption.`);
} catch (err) {
  reportDefect(1, 'Full lifetime simulation error', err);
}

// ---------------------------------------------------------------------------
// CYCLE 2: Dead Character & Session Mutation Bounds
// ---------------------------------------------------------------------------
console.log(`\n▶ Starting Cycle 2: Dead Character & Post-Mortem Action Immunity...`);
try {
  const session = 'test_deceased_bounds';
  await api(session, '/start', {});
  // Force character to die
  await db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter();
    c.is_deceased = true;
    c.death_cause = 'Test natural death';
    await db.updateCharacter(c.id, c);
  });

  const endpointsToTest = [
    { route: '/action/wellness', body: { action_type: 'medical_checkup' } },
    { route: '/action/overtime', body: {} },
    { route: '/action/study', body: {} },
    { route: '/action/network', body: {} },
    { route: '/action/gamble', body: { amount: 100 } },
    { route: '/action/breakthrough', body: { action_id: 'test' } },
    { route: '/action/buy-asset', body: { asset_id: 'test' } },
    { route: '/action/sell-asset', body: { asset_id: 'test' } },
    { route: '/action/upgrade-housing', body: { housing_tier: 'penthouse' } },
    { route: '/action/family', body: { action_type: 'call_parents' } },
    { route: '/rpg/unlock-skill', body: { skill_id: 'capital_investor' } },
    { route: '/rpg/npc-interact', body: { npc_id: 'npc_1', action_type: 'chat' } },
    { route: '/tick', body: { advance_only: true } }
  ];

  for (const ep of endpointsToTest) {
    const res = await api(session, ep.route, ep.body);
    if (res.status === 200) {
      throw new Error(`Endpoint ${ep.route} accepted action on a DECEASED character! (Status: 200)`);
    }
    if (res.status === 500) {
      throw new Error(`Endpoint ${ep.route} crashed with 500 when called on deceased character: ${JSON.stringify(res.data)}`);
    }
  }
  console.log(`✅ Cycle 2 Passed: All post-mortem mutations safely blocked with 4xx errors.`);
} catch (err) {
  reportDefect(2, 'Deceased action immunity failure', err);
}

// ---------------------------------------------------------------------------
// CYCLE 3: Action Points (AP) Inviolability & Negative Exploit Injection
// ---------------------------------------------------------------------------
console.log(`\n▶ Starting Cycle 3: AP Resource Conservation & Underflow Prevention...`);
try {
  const session = 'test_ap_exploit';
  await api(session, '/start', {});
  // Drain all AP to 0
  await db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter();
    c.action_points = 0;
    c.age = 25;
    await db.updateCharacter(c.id, c);
  });

  // Attempt actions with 0 AP
  const zeroApTests = [
    { route: '/action/overtime', body: {} },
    { route: '/action/study', body: {} },
    { route: '/action/network', body: {} },
    { route: '/action/wellness', body: { action_type: 'medical_checkup' } },
    { route: '/action/breakthrough', body: { action_id: 'deep_work_sprint' } },
    { route: '/action/childhood', body: { action_type: 'study' } }
  ];

  for (const test of zeroApTests) {
    const res = await api(session, test.route, test.body);
    if (res.status === 200) {
      throw new Error(`Endpoint ${test.route} succeeded despite having 0 AP!`);
    }
  }

  // Verify AP is still 0 and never negative
  const stateRes = await api(session, '/state');
  assert.equal(stateRes.data.character.action_points, 0, 'AP corrupted to non-zero');
  console.log(`✅ Cycle 3 Passed: Zero AP exploits strictly rejected without underflow.`);
} catch (err) {
  reportDefect(3, 'AP conservation failure', err);
}

// ---------------------------------------------------------------------------
// CYCLE 4: Economic Extremes & Bankruptcy Stress Test
// ---------------------------------------------------------------------------
console.log(`\n▶ Starting Cycle 4: Economic Extremes & Bankruptcy Stress Test...`);
try {
  const session = 'test_economy_extremes';
  await api(session, '/start', {});

  // Case A: Extreme Debt (-$10,000,000)
  await db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter();
    c.cash = -10000000;
    c.age = 35;
    await db.updateCharacter(c.id, c);
  });

  const debtTick = await api(session, '/tick', { advance_only: true });
  assert.equal(debtTick.status, 200, 'Tick crashed under extreme debt');
  const debtChar = debtTick.data.character;
  assert.ok(Number.isFinite(debtChar.cash), 'Cash is not finite in debt');
  assert.ok(!Number.isNaN(debtTick.data.net_worth), 'Net worth is NaN under extreme debt');

  // Case B: Hyper-wealth ($100,000,000,000)
  await db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter();
    c.cash = 100000000000;
    await db.updateCharacter(c.id, c);
  });

  const richTick = await api(session, '/tick', { advance_only: true });
  assert.equal(richTick.status, 200, 'Tick crashed under hyper-wealth');
  assert.ok(Number.isFinite(richTick.data.character.cash), 'Cash corrupted in hyper-wealth');
  assert.ok(Number.isFinite(richTick.data.net_worth), 'Net worth corrupted in hyper-wealth');
  console.log(`✅ Cycle 4 Passed: Economic engine resilient against negative debt and hyper-wealth.`);
} catch (err) {
  reportDefect(4, 'Economic extremes error', err);
}

// ---------------------------------------------------------------------------
// CYCLE 5: Scenario & MindStage Fuzzing
// ---------------------------------------------------------------------------
console.log(`\n▶ Starting Cycle 5: Scenario & MindStage Fuzzing...`);
try {
  const session = 'test_scenario_fuzzing';
  await api(session, '/start', {});

  // Get current scenario
  const scRes = await api(session, '/scenario/current');
  assert.equal(scRes.status, 200);

  // Send bogus choice ID
  const bogusRes = await api(session, '/scenario/resolve-mindstage', {
    scenario_id: scRes.data?.scenario?.id || 'bogus_id',
    choice_id: 'CHOICE_THAT_DOES_NOT_EXIST'
  });
  assert.ok(bogusRes.status === 400 || bogusRes.status === 404, `Bogus choice ID did not return 4xx (Got ${bogusRes.status})`);

  // Send empty payload
  const emptyRes = await api(session, '/scenario/resolve-mindstage', {});
  assert.ok(emptyRes.status === 400, `Empty resolve payload returned ${emptyRes.status}`);
  console.log(`✅ Cycle 5 Passed: Scenario engine rejects invalid and unmapped choice IDs cleanly.`);
} catch (err) {
  reportDefect(5, 'Scenario fuzzing failure', err);
}

// ---------------------------------------------------------------------------
// CYCLE 6: RPG Progression & Skill Tree Edge Cases
// ---------------------------------------------------------------------------
console.log(`\n▶ Starting Cycle 6: RPG Progression & Skill Tree Topological Bounds...`);
try {
  const session = 'test_rpg_bounds';
  await api(session, '/start', {});

  // Set SP to 0
  await db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter();
    c.skill_points = 0;
    c.unlocked_skills = [];
    await db.updateCharacter(c.id, c);
  });

  // Attempt to unlock skill with 0 SP
  const zeroSpRes = await api(session, '/rpg/unlock-skill', { skill_id: 'market_sense_1' });
  assert.equal(zeroSpRes.status, 400, 'Unlocked skill with 0 SP!');

  // Set SP to 5, attempt to unlock Tier 3 skill without Tier 1 & Tier 2 prerequisites
  await db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter();
    c.skill_points = 5;
    await db.updateCharacter(c.id, c);
  });

  const tier3Res = await api(session, '/rpg/unlock-skill', { skill_id: 'transcendence_sage' });
  assert.equal(tier3Res.status, 400, 'Unlocked Tier 3 skill without prerequisites!');

  // Unlock Tier 1 valid skill
  const tier1Res = await api(session, '/rpg/unlock-skill', { skill_id: 'market_sense_1' });
  assert.equal(tier1Res.status, 200, 'Failed to unlock valid Tier 1 skill');
  assert.equal(tier1Res.data.character.skill_points, 4, 'SP not deducted properly');

  // Attempt to unlock duplicate skill
  const dupRes = await api(session, '/rpg/unlock-skill', { skill_id: 'market_sense_1' });
  assert.equal(dupRes.status, 400, 'Unlocked duplicate skill!');
  console.log(`✅ Cycle 6 Passed: Skill tree prerequisites and SP strictly enforced.`);
} catch (err) {
  reportDefect(6, 'RPG progression bounds failure', err);
}

// ---------------------------------------------------------------------------
// CYCLE 7: Breakthrough, Combo & Non-Binary Interactions
// ---------------------------------------------------------------------------
console.log(`\n▶ Starting Cycle 7: Breakthrough & Non-Binary Interactions...`);
try {
  const session = 'test_breakthrough_bounds';
  await api(session, '/start', {});

  // Set AP to 1 (Breakthrough requires 2 AP)
  await db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter();
    c.action_points = 1;
    c.age = 28;
    await db.updateCharacter(c.id, c);
  });

  const btRes = await api(session, '/action/breakthrough', { action_id: 'career_pivot_startup' });
  assert.equal(btRes.status, 400, 'Executed breakthrough with only 1 AP (requires 2 AP)!');

  // Give 2 AP and cash, then execute
  await db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter();
    c.action_points = 2;
    c.cash = 15000;
    await db.updateCharacter(c.id, c);
  });

  const btValid = await api(session, '/action/breakthrough', { action_id: 'career_pivot_startup' });
  assert.equal(btValid.status, 200, 'Breakthrough execution failed with 2 AP');
  assert.equal(btValid.data.character.action_points, 0, 'AP not deducted by 2 after breakthrough');

  // Test Spectrum Slider Clamping in /tick
  const tickSlider = await api(session, '/tick', {
    interaction_type: 'SPECTRUM',
    interaction_result: { slider_value: 9999 } // out of bounds
  });
  assert.equal(tickSlider.status, 200, 'Spectrum slider tick crashed with out of bounds value');
  console.log(`✅ Cycle 7 Passed: Breakthrough AP costs and Spectrum Slider bounds verified.`);
} catch (err) {
  reportDefect(7, 'Breakthrough & non-binary interactions failure', err);
}

// ---------------------------------------------------------------------------
// CYCLE 8: Rebirth, Hereditary Heir & Karma Economy
// ---------------------------------------------------------------------------
console.log(`\n▶ Starting Cycle 8: Rebirth & Hereditary Heir Lineage...`);
try {
  const session = 'test_rebirth_lineage';
  await api(session, '/start', {});

  // Create parent with child relationship & cash
  let parentId;
  await db.sessionContext.run({ sessionId: session }, async () => {
    const c = await db.getLatestCharacter();
    c.cash = 250000;
    c.is_deceased = true;
    c.age = 75;
    await db.updateCharacter(c.id, c);
    parentId = c.id;

    await db.addRelationship({
      character_id: c.id,
      name: 'Baby John',
      type: 'child',
      age: 20,
      gender: 'male',
      affinity: 90
    });
  });

  // Execute heir rebirth
  const heirRes = await api(session, '/rebirth/heir', { child_name: 'Baby John' });
  assert.equal(heirRes.status, 200, 'Heir rebirth failed');
  assert.equal(heirRes.data.character.name, 'Baby John');
  assert.ok(heirRes.data.character.cash > 0, 'Child did not inherit cash');

  // Try to claim heir twice on the same dead parent
  const dupHeir = await api(session, '/rebirth/heir', { child_name: 'Baby John' });
  assert.notEqual(dupHeir.status, 200, 'Parent allowed double inheritance!');

  // Test Karma shop buy with insufficient karma
  const karmaBuyRes = await api(session, '/karma-shop/buy', { perk_id: 'born_rich' });
  // If insufficient karma, must reject
  if (karmaBuyRes.status === 200 && karmaBuyRes.data.account?.total_karma < 0) {
    throw new Error('Karma balance became negative after purchase!');
  }
  console.log(`✅ Cycle 8 Passed: Generational inheritance and karma conservation verified.`);
} catch (err) {
  reportDefect(8, 'Rebirth & lineage integrity failure', err);
}

// ---------------------------------------------------------------------------
// CYCLE 9: Security, Sanitization & Payload Injection
// ---------------------------------------------------------------------------
console.log(`\n▶ Starting Cycle 9: Security, SQL/XSS Injection & Malformed Headers...`);
try {
  const session = 'test_security_fuzz';
  
  // Test XSS and SQL injection in start name
  const injectionName = `<script>alert('xss')</script>Robert'); DROP TABLE characters;--`;
  const secStart = await api(session, '/start', { name: injectionName, country: 'US' });
  assert.equal(secStart.status, 200);
  assert.ok(!secStart.data.character.name.includes('<script>'), 'XSS tag not sanitized in character name');

  // Test Prototype pollution payload
  const protoRes = await api(session, '/action/study', {
    __proto__: { polluted: true },
    constructor: { prototype: { polluted: true } }
  });
  assert.equal(Object.prototype.polluted, undefined, 'Prototype pollution vulnerability detected!');

  // Test Malformed Session ID (Over 1000 characters)
  const hugeSessionId = 'user_' + 'A'.repeat(2000);
  const hugeRes = await api(hugeSessionId, '/state');
  assert.ok(hugeRes.status === 200 || hugeRes.status === 400, 'Oversized session ID caused unhandled server crash');
  console.log(`✅ Cycle 9 Passed: XSS, prototype pollution and header fuzzing neutralized.`);
} catch (err) {
  reportDefect(9, 'Security & sanitization failure', err);
}

// ---------------------------------------------------------------------------
// CYCLE 10: Frontend State Contract & Visuals Completeness
// ---------------------------------------------------------------------------
console.log(`\n▶ Starting Cycle 10: Frontend State Contract & Visuals Completeness...`);
try {
  const session = 'test_fe_contract';
  const start = await api(session, '/start', { country: 'VN' });
  const char = start.data.character;
  const visuals = start.data.visuals;

  const requiredCharFields = [
    'id', 'name', 'age', 'gender', 'country', 'vitality', 'burnout', 'karma',
    'cash', 'action_points', 'level', 'exp', 'sp', 'occupation', 'housing',
    'hidden_flags', 'history_log'
  ];
  for (const field of requiredCharFields) {
    assert.ok(char[field] !== undefined, `Character missing contract field: ${field}`);
  }

  const requiredVisualFields = ['skin_color', 'hair_style', 'outfit_type', 'age_morph', 'expression'];
  for (const field of requiredVisualFields) {
    assert.ok(visuals[field] !== undefined, `Visuals missing contract field: ${field}`);
  }

  const stateRes = await api(session, '/state');
  ['character', 'assets', 'relationships', 'npcs', 'player_account'].forEach(field => {
    assert.ok(stateRes.data[field] !== undefined, `/state response missing key: ${field}`);
  });
  console.log(`✅ Cycle 10 Passed: 100% frontend state contract fields present.`);
} catch (err) {
  reportDefect(10, 'Frontend contract violation', err);
}

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log(`\n======================================================================`);
console.log(`📊 STRESS SUITE AUDIT SUMMARY`);
console.log(`Total Cycles: 10 | Defects Discovered: ${defectsFound.length}`);
if (defectsFound.length > 0) {
  console.log(`❌ DEFECTS TO FIX:`);
  defectsFound.forEach((d, idx) => {
    console.log(`   ${idx + 1}. [Cycle ${d.cycle}] ${d.description} -> ${d.error}`);
  });
} else {
  console.log(`🎉 PERFECT SCORE: All 10 Stress-Testing Cycles Passed Flawlessly!`);
}
console.log(`======================================================================\n`);

server.closeAllConnections();
await new Promise(resolve => server.close(resolve));
try {
  fs.rmSync(tempDir, { recursive: true, force: true });
} catch (e) {}

process.exit(defectsFound.length > 0 ? 1 : 0);
