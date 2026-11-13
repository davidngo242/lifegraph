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
const { setRngStateResolver, createRng } = await import(`${root}/engine/rng.js`);
const { executeProceduralRebirth } = await import(`${root}/engine/rebirthEngine.js`);
const { getCurrentScenarioForCharacter, resolveMindStageChoice, registerContentPack } = await import(`${root}/engine/scenarioEngine.js`);

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i < 0 ? dflt : process.argv[i + 1]; };
const LIVES = Number(arg('--lives', 300));
const FORCE_ERA = arg('--era', null); // e.g. lang_hau_chien: measure one era's content (the seed dictionary also draws era 'any', which has no storylets yet)
const POLICY = arg('--policy', 'random'); // random = like a player (random choice per scenario); first = always choice 0
const mix = n => { let h = (n + 0x9E3779B9) >>> 0; h = Math.imul(h ^ (h >>> 16), 0x85EBCA6B); h = Math.imul(h ^ (h >>> 13), 0xC2B2AE35); return (h ^ (h >>> 16)) >>> 0; };
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
  const state = { seed: mix(i + 1), n: 0 }; // well-mixed seeds: consecutive integers give correlated mulberry streams
  setRngStateResolver(() => state);
  const c = executeProceduralRebirth({}, null);
  c.rng_seed = state.seed;
  if (FORCE_ERA) c.life_seed = { ...c.life_seed, era: FORCE_ERA };
  const byAge = {};
  for (c.age = 0; c.age <= MAX_AGE; c.age++) {
    c.action_points = 10;
    const sc = getCurrentScenarioForCharacter(c);
    if (!sc || sc.id.startsWith('dilemma')) continue;
    byAge[c.age] = sc.id;
    const pick = POLICY === 'first' ? 0 : Math.floor(createRng(mix(state.seed ^ c.age)).next() * sc.choices.length);
    resolveMindStageChoice(c, sc.choices[pick].id, 0, [], sc.id);
  }
  lives.push({ byAge, ids: new Set(Object.values(byAge)), seed: c.life_seed });
}

let jac = 0, same = 0, sharedAges = 0, pairs = 0;
const perEra = {}; // pairs of lives of the SAME era (the fair comparison: era-less lives can only meet the old fixed packs)
for (let a = 0; a < lives.length; a++) for (let b = a + 1; b < lives.length; b++) {
  const A = lives[a], B = lives[b];
  const inter = [...A.ids].filter(id => B.ids.has(id)).length;
  const union = A.ids.size + B.ids.size - inter;
  jac += union ? inter / union : 1; pairs++;
  let sa = 0, sm = 0;
  for (const age of Object.keys(A.byAge)) if (age in B.byAge) { sa++; if (A.byAge[age] === B.byAge[age]) sm++; }
  sharedAges += sa; same += sm;
  if (A.seed.era === B.seed.era) { const e = (perEra[A.seed.era] ??= { j: 0, sa: 0, sm: 0, p: 0 }); e.j += union ? inter / union : 1; e.sa += sa; e.sm += sm; e.p++; }
}
const counts = {}; let total = 0;
for (const l of lives) for (const id of l.ids) { counts[id] = (counts[id] ?? 0) + 1; total++; }
const [topId, topN] = Object.entries(counts).sort((x, y) => y[1] - x[1])[0] ?? ['-', 0];

console.log(`lives=${LIVES} pairs=${pairs} demo_pack=${process.argv.includes('--demo-pack')}`);
console.log(`distinct life seeds: ${new Set(lives.map(l => JSON.stringify(l.seed))).size}`);
console.log(`mean scenario-id overlap between two lives (Jaccard): ${(100 * jac / pairs).toFixed(1)}%   [target < 40%]`);
console.log(`same scenario at the same age (among ages both lives met one): ${(100 * same / (sharedAges || 1)).toFixed(1)}%   [target <= 30%]`);
console.log(`largest single-scenario share of encounters: ${topId} ${(100 * topN / total).toFixed(1)}%   [target <= 8%]`);

const eraLives = {}; for (const l of lives) { const e = (eraLives[l.seed.era] ??= { n: 0, met: 0 }); e.n++; e.met += l.ids.size; }
for (const [era, e] of Object.entries(perEra)) console.log(`  era ${era}: ${eraLives[era].n} lives, ${(eraLives[era].met / eraLives[era].n).toFixed(1)} scenarios/life, Jaccard ${(100 * e.j / e.p).toFixed(1)}%, same-age ${(100 * e.sm / (e.sa || 1)).toFixed(1)}%`);
const everyone = Object.entries(counts).filter(([, n]) => n === LIVES).length;
console.log(`scenarios met by 100% of lives: ${everyone}; by >=50%: ${Object.values(counts).filter(n => n >= LIVES / 2).length}; distinct scenarios seen: ${Object.keys(counts).length}; policy=${POLICY}`);

const hist = Object.entries(counts).map(([id, n]) => [id, Math.round(100 * n / LIVES)]).sort((x, y) => y[1] - x[1]);
console.log('met-by-share buckets (% of lives): ' + [[90, 101], [70, 90], [40, 70], [10, 40], [0, 10]].map(([lo, hi]) => `${lo}-${Math.min(hi, 100)}%: ${hist.filter(([, p]) => p >= lo && p < hi).length}`).join('  '));
if (process.argv.includes('--list')) console.log(hist.map(([id, p]) => `${id}:${p}%`).join(' '));

// Stories met per decade (min over lives = "no empty decade" check) and, with --ages, per-age coverage + top story.
const decades = [...Array(9)].map((_, d) => d);
const perDecade = lives.map(l => decades.map(d => Object.keys(l.byAge).filter(a => Math.floor(a / 10) === d).length));
console.log('stories per decade 0-9..80-89 (min/mean over lives): ' + decades.map(d => `${d * 10}s ${Math.min(...perDecade.map(r => r[d]))}/${(perDecade.reduce((s, r) => s + r[d], 0) / lives.length).toFixed(1)}`).join('  '));
const gt90 = Object.values(counts).filter(n => n >= 0.9 * LIVES).length, lt40 = Object.values(counts).filter(n => n < 0.4 * LIVES).length, nd = Object.keys(counts).length;
console.log(`share of distinct scenarios met by >=90% of lives: ${(100 * gt90 / nd).toFixed(0)}% (${gt90}/${nd}); by <40%: ${(100 * lt40 / nd).toFixed(0)}% (${lt40}/${nd})`);
if (process.argv.includes('--ages')) for (let a = 0; a <= MAX_AGE; a++) {
  const c = {}; let n = 0; for (const l of lives) if (l.byAge[a]) { c[l.byAge[a]] = (c[l.byAge[a]] ?? 0) + 1; n++; }
  const top = Object.entries(c).sort((x, y) => y[1] - x[1])[0];
  console.log(`age ${a}: ${(100 * n / LIVES).toFixed(0)}% lives have a scenario, ${Object.keys(c).length} distinct, top ${top?.[0]} ${top ? Math.round(100 * top[1] / n) : 0}%`);
}
