import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-lhc4-'));
process.env.DATABASE_URL = ''; process.env.GEMINI_API_KEY = '';
const { validateContentPack } = await import('../src/content/validator.js');

const pack = JSON.parse(fs.readFileSync(new URL('../src/content/packs/pack_lang_hau_chien_4.json', import.meta.url)));
const pack1 = JSON.parse(fs.readFileSync(new URL('../src/content/packs/pack_lang_hau_chien_1.json', import.meta.url)));
const EFFECT_KEYS = ['cash_delta', 'vitality_delta', 'burnout_delta', 'karma_delta'];
const PLACEHOLDERS = ['{mentor}', '{rival}', '{love}', '{creditor_or_benefactor}', '{friend}', '{family}'];

test('lang_hau_chien_4 pack is valid with 11 unique storylets', () => {
  const v = validateContentPack(pack);
  assert.deepEqual(v.errors, []);
  assert.deepEqual(v.warnings, []);
  assert.equal(pack.pack_id, 'pack_lang_hau_chien_4');
  assert.equal(pack.scenarios.length, 11);
  const ids = pack.scenarios.map(s => s.id);
  assert.equal(new Set(ids).size, 11);
  assert.ok(ids.every(i => i.startsWith('lhc4_')));
  const all = [...pack.scenarios, ...pack1.scenarios];
  assert.equal(new Set(all.map(s => s.id)).size, all.length);
  const choiceIds = all.flatMap(s => s.choices.map(c => c.id));
  assert.equal(new Set(choiceIds).size, choiceIds.length);
});

test('every storylet has era, 3 choices, known effect keys', () => {
  for (const s of pack.scenarios) {
    assert.deepEqual(s.prerequisites.era, ['lang_hau_chien'], s.id);
    assert.equal(s.choices.length, 3, s.id);
    assert.ok(s.prerequisites.min_age <= s.prerequisites.max_age, s.id);
    for (const c of s.choices) for (const o of Object.values(c.outcomes))
      for (const k of Object.keys(o.effects)) assert.ok(EFFECT_KEYS.includes(k), `${s.id}/${c.id}/${k}`);
  }
  assert.equal(pack.scenarios.filter(s => s.prerequisites.min_age >= 50).length, 7);
});

test('4 cross-life stories require an inherited: flag; doors are defined consistently', () => {
  const cross = pack.scenarios.filter(s => (s.prerequisites.required_flags ?? []).some(f => f.startsWith('inherited:')));
  assert.equal(cross.length, 4);
  const doorIds = new Set(pack1.scenarios.flatMap(s => [...(s.locks ?? []), ...(s.unlocks ?? [])]));
  for (const s of pack.scenarios) for (const c of [s, ...s.choices])
    for (const d of [...(c.locks ?? []), ...(c.unlocks ?? [])]) { assert.ok(d.startsWith('l4_'), d); doorIds.add(d); }
  for (const s of pack.scenarios)
    for (const d of [...(s.prerequisites.doors_closed ?? []), ...(s.prerequisites.doors_open ?? [])]) assert.ok(doorIds.has(d), `${s.id} -> ${d}`);
  assert.ok(pack.scenarios.some(s => s.prerequisites.doors_closed?.length));
});

test('at least 2 irreversible choices and 7 stories use name placeholders', () => {
  assert.ok(pack.scenarios.flatMap(s => s.choices).filter(c => c.irreversible).length >= 2);
  const withName = pack.scenarios.filter(s => PLACEHOLDERS.some(p => JSON.stringify(s).includes(p)));
  assert.ok(withName.length >= 7);
});
