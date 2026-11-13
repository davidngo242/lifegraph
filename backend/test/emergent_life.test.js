import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-emergent-'));
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = directory;
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || ''; process.env.GEMINI_API_KEY = '';
const { app } = await import('../src/index.js');
const db = await import('../src/db/db.js');
const { makeClient } = await import('./lib/playLife.js');
const { validateContentPack, validateSeedDictionaries } = await import('../src/content/validator.js');
const { loadSeedDictionaries } = await import('../src/content/seeds.js');
const { addCastMemory, CAST_MEMORY_MAX } = await import('../src/engine/npcEngine.js');
const { getCurrentScenarioForCharacter, getNextScenarioAge, resolveMindStageChoice, registerContentPack } = await import('../src/engine/scenarioEngine.js');

let server, api;
before(async () => {
  await db.initDb(); server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  api = makeClient(`http://127.0.0.1:${server.address().port}/api/game`);
});
after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });

const packsDir = new URL('../src/content/packs/', import.meta.url);
const oldPacks = fs.readdirSync(packsDir).map(f => JSON.parse(fs.readFileSync(new URL(f, packsDir))));
const start = async (session, seed) => (await api(session, '/start', { karma_perks: { rng_seed: seed } })).data.character;

// A tiny era/fate-gated pack. priority 10 so milestone packs (priority >= 90) are unaffected.
const storylet = (id, age, prerequisites, extra = {}) => ({
  id, arc_id: 'test_arc', stage: 1, title: id, location_id: 'x', priority: 10,
  prerequisites: { min_age: age, max_age: age, ...prerequisites },
  scenes: [{ id: `${id}_s`, name: 's', background_theme: 'office', hotspots: [{ id: `${id}_h`, label: 'h', dialogue: { speaker: 'a', text: 't' } }] }],
  choices: [{ id: `${id}_c`, title: 'c', stance: 's', description: 'd', cost_ap: 0, outcomes: { success: { narration: 'n', effects: {} } } }],
  ...extra
});
const testPack = () => ({
  pack_id: 'test_emergent', name: 'Emergent test', version: '1', description: 'x',
  scenarios: Array.from({ length: 30 }, (_, i) => {
    const age = 20 + (i % 15);
    if (i < 10) return storylet(`t_war_${i}`, age, { era: ['lang_hau_chien'] });
    if (i < 15) return storylet(`t_any_${i}`, age, { era: ['any'] });
    if (i < 20) return storylet(`t_fate_${i}`, age, { fate_thread: 'cha_giau_no' });
    if (i < 25) return storylet(`t_npc_${i}`, age, { requires_npc: { role: 'mentor', memory_has: 'da_giup' } });
    return storylet(`t_free_${i}`, age, {}, { weight: 2 });
  })
});

function lifeSequence(base) {
  const c = structuredClone(base); const seq = [];
  for (c.age = 18; c.age <= 40; c.age++) {
    const sc = getCurrentScenarioForCharacter(c);
    seq.push(sc?.id ?? null);
    if (sc) resolveMindStageChoice(c, sc.choices[0].id, 0, [], sc.id);
  }
  return seq;
}
const legacy = (age = 30) => ({ id: 'legacy', name: 'QA', age, cash: 100, vitality: 60, max_vitality: 100, burnout: 0, karma: 50, action_points: 10, hidden_flags: [], knowledge_base: [], innate_traits: [] });

test('seed dictionaries are valid, and the validator rejects broken ones', () => {
  const dir = new URL('../src/content/seeds/', import.meta.url);
  const raw = fs.readdirSync(dir).map(f => JSON.parse(fs.readFileSync(new URL(f, dir))));
  assert.deepEqual(validateSeedDictionaries(raw).errors, []);
  assert.ok(loadSeedDictionaries().era.some(e => e.id === 'lang_hau_chien') && loadSeedDictionaries().era.some(e => e.id === 'any'));
  const broken = structuredClone(raw); broken.find(d => d.dictionary === 'era').values[0].weight = 0; broken.pop();
  assert.ok(validateSeedDictionaries(broken).errors.length >= 2);
});

test('life_seed and cast: same rng_seed reproduces them, different seeds vary, shape is valid', async () => {
  const a = await start('seed_a', 4242); const b = await start('seed_b', 4242);
  assert.deepEqual(b.life_seed, a.life_seed);
  assert.deepEqual(b.cast.map(({ id, ...n }) => n), a.cast.map(({ id, ...n }) => n));
  const seeds = new Set(), eras = new Set();
  for (let s = 1; s <= 25; s++) {
    const c = await start(`seed_v${s}`, s);
    seeds.add(JSON.stringify(c.life_seed)); eras.add(c.life_seed.era);
    assert.ok(c.cast.length >= 5 && c.cast.length <= 8, 'cast of 5-8');
    for (const role of ['mentor', 'rival', 'love', 'creditor_or_benefactor', 'friend', 'family']) assert.ok(c.cast.some(n => n.role === role), role);
    for (const n of c.cast) assert.ok(n.id && n.name && n.trait && n.goal && n.secret && Array.isArray(n.memory));
    assert.equal(c.year_focus, null);
  }
  assert.ok(seeds.size >= 10, `only ${seeds.size} distinct seeds in 25 lives`);
  assert.ok(eras.has('lang_hau_chien') && !eras.has('any'), 'new lives never draw era any');
  const reread = (await api('seed_a', '/state')).data;
  assert.deepEqual((reread.character ?? reread).life_seed, a.life_seed, 'life_seed persists in the stored character');
});

test('cast memory is capped at 12 and old entries are compressed but stay searchable', () => {
  const c = { age: 10, cast: [{ role: 'mentor', memory: [] }] };
  for (let i = 0; i < 30; i++) addCastMemory(c, 'mentor', { tag: `t${i}`, text: `e${i}` }, i);
  assert.equal(c.cast[0].memory.length, CAST_MEMORY_MAX);
  assert.equal(c.cast[0].memory[0].tag, 'tom_tat');
  assert.ok(c.cast[0].memory[0].tags.includes('t0'));
});

test('old packs load unchanged; new optional fields validate and bad ones are rejected', () => {
  for (const p of oldPacks) assert.equal(validateContentPack(p).valid, true, p.pack_id);
  assert.equal(validateContentPack(testPack()).valid, true);
  const bad = testPack(); bad.scenarios[0].weight = -1; bad.scenarios[1].prerequisites.requires_npc = { memory_has: 'x' }; bad.scenarios[2].cooldown_years = 1.5;
  assert.equal(validateContentPack(bad).errors.length, 3);
  // Legacy character (no life_seed) still gets the same milestone scenarios as before.
  assert.equal(getCurrentScenarioForCharacter(legacy(0)).id, 'scenario_infancy_first_steps');
  assert.equal(getCurrentScenarioForCharacter(legacy(42)).id, 'scenario_midlife_crossroads');
});

test('weighted draw: two life seeds meet different scenarios at the same ages; same seed is stable', () => {
  registerContentPack(testPack());
  const war = { ...legacy(), rng_seed: 11, life_seed: { era: 'lang_hau_chien', fate_thread: 'cha_giau_no' } };
  const plain = { ...legacy(), rng_seed: 22, life_seed: { era: 'any', fate_thread: null } };
  const seqWar = lifeSequence(war), seqPlain = lifeSequence(plain);
  assert.deepEqual(lifeSequence(war), seqWar, 'reproducible');
  assert.notDeepEqual(seqWar, seqPlain);
  assert.ok(seqWar.some(id => id?.startsWith('t_war_')) && !seqWar.some(id => id?.startsWith('t_any_')));
  assert.ok(seqPlain.some(id => id?.startsWith('t_any_')) && !seqPlain.some(id => id?.startsWith('t_war_') || id?.startsWith('t_fate_')));
  // Era-gated storylets never reach a legacy (era any) character without the era; requires_npc needs the memory.
  const c = { ...legacy(25), rng_seed: 5 };
  assert.ok(!/^t_war_|^t_npc_/.test(getCurrentScenarioForCharacter(c)?.id ?? ''));
  c.cast = [{ role: 'mentor', memory: [] }]; addCastMemory(c, 'mentor', { tag: 'da_giup' });
  c.age = 25; // npc storylets sit at ages 25..29
  c.scenario_resolutions = { scenario_career_crossroads_28: {} }; c.hidden_flags = ['career_crossroads_resolved']; // milestone out of the way
  const ids = new Set(); for (let s = 1; s <= 200; s++) { ids.add(getCurrentScenarioForCharacter({ ...c, rng_seed: s })?.id); }
  assert.ok([...ids].some(id => id?.startsWith('t_npc_')));
  // Peeking ahead never changes the pick, and repeated reads agree.
  const before = getCurrentScenarioForCharacter(war)?.id;
  getNextScenarioAge(war);
  assert.equal(getCurrentScenarioForCharacter(war)?.id, before);
  // Pinned scenario still wins.
  const pinned = { ...war, age: 22, hidden_flags: ['active_scenario:t_free_25'] };
  assert.equal(getCurrentScenarioForCharacter(pinned)?.id, getCurrentScenarioForCharacter(pinned)?.id);
});

test('cooldown decays a recently seen group; locks/unlocks update doors', () => {
  const a = storylet('cd_a', 50, {}, { group: 'g', cooldown_years: 5, locks: ['roi_lang'], unlocks: ['ve_que'] });
  const b = storylet('cd_b', 51, {}, { group: 'g', cooldown_years: 5 });
  registerContentPack({ pack_id: 'cd', name: 'cd', version: '1', description: 'x', scenarios: [a, b] });
  const target = { ...legacy(50), rng_seed: 1, hidden_flags: ['active_scenario:cd_a'] };
  resolveMindStageChoice(target, 'cd_a_c', 0, [], 'cd_a');
  assert.deepEqual(target.doors, { roi_lang: { open: false, label: 'roi lang', age: 50 }, ve_que: { open: true, label: 've que', age: 50 } }); // Đợt 4 shape
  assert.equal(target.scenario_seen.at(-1).group, 'g');
});

test('POST /year/focus validates the enum; /tick needs no focus, writes the journal and resets focus', async () => {
  const session = 'focus_s'; await start(session, 77);
  for (const bad of ['money', '', 3, undefined]) assert.equal((await api(session, '/year/focus', { focus: bad })).status, 400, String(bad));
  for (const ok of ['career', 'family', 'health', 'learning', 'experience']) {
    const r = await api(session, '/year/focus', { focus: ok });
    assert.equal(r.status, 200); assert.equal(r.data.character.year_focus, ok);
  }
  assert.equal((await api(session, '/year/focus', { focus: null })).data.character.year_focus, null);
  await api(session, '/year/focus', { focus: 'family' });
  const t = await api(session, '/tick', { advance_only: true });
  assert.equal(t.status, 200);
  assert.equal(t.data.character.year_focus, null);
  const line = t.data.passiveSummary.annual_digest.journal_line;
  assert.equal(typeof line, 'string'); assert.match(line, /^Năm \d+ tuổi, bạn dành tâm cho gia đình/);
  assert.equal(t.data.character.year_journal, line);
  const t2 = await api(session, '/tick', { advance_only: true });   // no focus chosen: still works
  assert.equal(t2.status, 200);
  assert.match(t2.data.passiveSummary.annual_digest.journal_line, /^Năm \d+ tuổi, bạn để năm tháng trôi/);
});

test('/tick appends focus_history {age, focus} only for years that had a focus, capped at 120', async () => {
  const session = 'focus_hist_s'; await start(session, 78);
  await api(session, '/year/focus', { focus: 'learning' });
  const t = await api(session, '/tick', { advance_only: true });
  const h = t.data.character.focus_history;
  assert.equal(h.length, 1); assert.equal(h[0].focus, 'learning'); assert.equal(h[0].age, t.data.character.age);
  const t2 = await api(session, '/tick', { advance_only: true });   // no focus: nothing appended
  assert.equal(t2.data.character.focus_history.length, 1);
  const { recordFocusHistory, FOCUS_HISTORY_MAX } = await import('../src/engine/yearJournal.js');
  const c = { age: 1, year_focus: 'career', focus_history: Array.from({ length: FOCUS_HISTORY_MAX }, (_, i) => ({ age: i, focus: 'health' })) };
  recordFocusHistory(c);
  assert.equal(c.focus_history.length, FOCUS_HISTORY_MAX); assert.equal(c.focus_history.at(-1).focus, 'career');
});
