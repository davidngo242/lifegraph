import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-lhc5-'));
process.env.DATABASE_URL = ''; process.env.GEMINI_API_KEY = '';
const { validateContentPack } = await import('../src/content/validator.js');

const load = n => JSON.parse(fs.readFileSync(new URL(`../src/content/packs/pack_lang_hau_chien_${n}.json`, import.meta.url)));
const pack = load(5);
const others = [1, 2, 3, 4].map(load);
const EFFECT_KEYS = ['cash_delta', 'vitality_delta', 'burnout_delta', 'karma_delta'];
const CONDITION_KEYS = ['family_state', 'fate_thread', 'requires_npc', 'doors_open', 'doors_closed'];
const inRange = (lo, hi) => pack.scenarios.filter(s => s.prerequisites.min_age >= lo && s.prerequisites.max_age <= hi);

test('lang_hau_chien_5 pack is valid with 20 unique storylets', () => {
  const v = validateContentPack(pack);
  assert.deepEqual(v.errors, []);
  assert.deepEqual(v.warnings, []);
  assert.equal(pack.pack_id, 'pack_lang_hau_chien_5');
  assert.equal(pack.scenarios.length, 20);
  const all = [...pack.scenarios, ...others.flatMap(p => p.scenarios)];
  assert.equal(new Set(all.map(s => s.id)).size, all.length);
  assert.ok(pack.scenarios.every(s => s.id.startsWith('lhc5_')));
  const choiceIds = all.flatMap(s => s.choices.map(c => c.id));
  assert.equal(new Set(choiceIds).size, choiceIds.length);
});

test('every storylet has era, 3 choices, known effect keys and a narrow age window', () => {
  for (const s of pack.scenarios) {
    assert.deepEqual(s.prerequisites.era, ['lang_hau_chien'], s.id);
    assert.equal(s.choices.length, 3, s.id);
    const w = s.prerequisites.max_age - s.prerequisites.min_age;
    assert.ok(w >= 6 && w <= 10, `${s.id} window ${w}`);
    for (const c of s.choices) for (const o of Object.values(c.outcomes))
      for (const k of Object.keys(o.effects)) assert.ok(EFFECT_KEYS.includes(k), `${s.id}/${c.id}/${k}`);
  }
});

test('every storylet is conditional (family_state, fate_thread, requires_npc or doors)', () => {
  for (const s of pack.scenarios)
    assert.ok(CONDITION_KEYS.some(k => s.prerequisites[k] !== undefined), s.id);
});

test('decade counts: 7 for 38-49, 7 for 66-77, 6 for 76-90', () => {
  assert.equal(inRange(38, 49).length, 7);
  assert.equal(inRange(66, 77).length, 7);
  assert.equal(inRange(76, 90).filter(s => s.prerequisites.min_age >= 76).length, 6);
});

test('4 mutually exclusive variant pairs share a group and cannot both qualify', () => {
  const groups = {};
  for (const s of pack.scenarios) (groups[s.group] ??= []).push(s);
  const pairs = Object.values(groups).filter(g => g.length === 2);
  assert.equal(pairs.length, 4);
  for (const [a, b] of pairs) {
    const pa = a.prerequisites, pb = b.prerequisites;
    const fa = pa.family_state, fb = pb.family_state;
    const famDisjoint = fa && fb && !fa.some(x => fb.includes(x));
    const da = pa.doors_open ?? [], db = pb.doors_open ?? [];
    const doorsDisjoint = da.length && db.length && !da.some(d => db.includes(d));
    assert.ok(famDisjoint || doorsDisjoint, `${a.id} vs ${b.id}`);
  }
});

test('3 irreversible choices; door ids are consistent; name placeholders used', () => {
  assert.equal(pack.scenarios.flatMap(s => s.choices).filter(c => c.irreversible).length, 3);
  const defined = new Set(others.flatMap(p => p.scenarios).flatMap(s => s.choices.flatMap(c => [...(c.locks ?? []), ...(c.unlocks ?? [])])));
  for (const s of pack.scenarios) for (const c of s.choices) for (const d of [...(c.locks ?? []), ...(c.unlocks ?? [])]) defined.add(d);
  for (const s of pack.scenarios)
    for (const d of [...(s.prerequisites.doors_open ?? []), ...(s.prerequisites.doors_closed ?? [])]) assert.ok(defined.has(d), `${s.id} -> ${d}`);
  const withName = pack.scenarios.filter(s => /\{(mentor|rival|love|creditor_or_benefactor|friend|family)\}/.test(JSON.stringify(s)));
  assert.ok(withName.length >= 10);
});
