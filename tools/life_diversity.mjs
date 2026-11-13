#!/usr/bin/env node
/**
 * tools/life_diversity.mjs - how different are two lives? Simulates N lives in-process (engine only, no HTTP):
 * each life draws its life_seed/cast from its own seeded RNG, then meets one scenario per eligible year and
 * resolves the first choice. Prints, over all life pairs:
 *   - mean overlap of the sets of scenario ids (Jaccard, %)            target < 40
 *   - mean % of shared ages where both lives met the same scenario     (lower = more different)
 *   - the largest share any single scenario has of all encounters      target <= 8
 *
 * Usage: node tools/life_diversity.mjs [--lives 300] [--demo-pack]
 *   --demo-pack adds ~370 SYNTHETIC era/fate-gated storylets so the weighted selector has something to choose
 *   from (the real era content is Phase 5). Without it you measure only the shipped packs.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
process.env.NODE_ENV = 'test';
process.env.LIFEGRAPH_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-diversity-'));
process.env.DATABASE_URL = ''; process.env.GEMINI_API_KEY = '';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'backend', 'src');
const { setRngStateResolver } = await import(`${root}/engine/rng.js`);
const { executeProceduralRebirth } = await import(`${root}/engine/rebirthEngine.js`);
const { getCurrentScenarioForCharacter, resolveMindStageChoice, registerContentPack } = await import(`${root}/engine/scenarioEngine.js`);

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i < 0 ? dflt : process.argv[i + 1]; };
const LIVES = Number(arg('--lives', 300));
const MAX_AGE = 90;

if (process.argv.includes('--demo-pack')) {
  const make = (id, age, prerequisites, extra = {}) => ({
    id, arc_id: 'demo', stage: 1, title: id, location_id: 'demo', priority: 10,
    prerequisites: { min_age: age, max_age: age + 6, ...prerequisites },
    scenes: [{ id: `${id}_s`, name: 's', background_theme: 'office', hotspots: [{ id: `${id}_h`, label: 'h', dialogue: { speaker: 'a', text: 't' } }] }],
    choices: [{ id: `${id}_c`, title: 'c', stance: 's', description: 'd', cost_ap: 0, outcomes: { success: { narration: 'n', effects: {} } } }],
    ...extra
  });
  const scenarios = [];
  for (let age = 7; age <= 80; age++) {
    scenarios.push(make(`demo_${age}_war`, age, { era: ['lang_hau_chien'] }));
    scenarios.push(make(`demo_${age}_any`, age, { era: ['any'] }));
    scenarios.push(make(`demo_${age}_cha`, age, { fate_thread: 'cha_giau_no' }));
    scenarios.push(make(`demo_${age}_tn`, age, { fate_thread: 'tai_nang_yeu_menh' }));
    scenarios.push(make(`demo_${age}_free`, age, {}, { cooldown_years: 3, group: `free_${age % 5}` }));
  }
  registerContentPack({ pack_id: 'demo_synthetic', name: 'Synthetic demo', version: '1', description: 'synthetic', scenarios });
}

const lives = [];
for (let i = 0; i < LIVES; i++) {
  const state = { seed: 100000 + i, n: 0 };
  setRngStateResolver(() => state);
  const c = executeProceduralRebirth({}, null);
  c.rng_seed = state.seed;
  const byAge = {};
  for (c.age = 0; c.age <= MAX_AGE; c.age++) {
    c.action_points = 10;
    const sc = getCurrentScenarioForCharacter(c);
    if (!sc || sc.id.startsWith('dilemma')) continue;
    byAge[c.age] = sc.id;
    resolveMindStageChoice(c, sc.choices[0].id, 0, [], sc.id);
  }
  lives.push({ byAge, ids: new Set(Object.values(byAge)), seed: c.life_seed });
}

let jac = 0, same = 0, sharedAges = 0, pairs = 0;
for (let a = 0; a < lives.length; a++) for (let b = a + 1; b < lives.length; b++) {
  const A = lives[a], B = lives[b];
  const inter = [...A.ids].filter(id => B.ids.has(id)).length;
  const union = A.ids.size + B.ids.size - inter;
  jac += union ? inter / union : 1; pairs++;
  for (const age of Object.keys(A.byAge)) if (age in B.byAge) { sharedAges++; if (A.byAge[age] === B.byAge[age]) same++; }
}
const counts = {}; let total = 0;
for (const l of lives) for (const id of l.ids) { counts[id] = (counts[id] ?? 0) + 1; total++; }
const [topId, topN] = Object.entries(counts).sort((x, y) => y[1] - x[1])[0] ?? ['-', 0];

console.log(`lives=${LIVES} pairs=${pairs} demo_pack=${process.argv.includes('--demo-pack')}`);
console.log(`distinct life seeds: ${new Set(lives.map(l => JSON.stringify(l.seed))).size}`);
console.log(`mean scenario-id overlap between two lives (Jaccard): ${(100 * jac / pairs).toFixed(1)}%   [target < 40%]`);
console.log(`same scenario at the same age (among ages both lives met one): ${(100 * same / (sharedAges || 1)).toFixed(1)}%   [target <= 30%]`);
console.log(`largest single-scenario share of encounters: ${topId} ${(100 * topN / total).toFixed(1)}%   [target <= 8%]`);
