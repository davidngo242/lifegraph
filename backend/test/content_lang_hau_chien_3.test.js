import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-lhc3-'));
process.env.DATABASE_URL = ''; process.env.GEMINI_API_KEY = '';
const { validateContentPack } = await import('../src/content/validator.js');

const pack = JSON.parse(fs.readFileSync(new URL('../src/content/packs/pack_lang_hau_chien_3.json', import.meta.url)));
const pack1 = JSON.parse(fs.readFileSync(new URL('../src/content/packs/pack_lang_hau_chien_1.json', import.meta.url)));
const EFFECT_KEYS = ['cash_delta', 'vitality_delta', 'burnout_delta', 'karma_delta'];
const PLACEHOLDER = /\{(mentor|rival|love|creditor_or_benefactor|friend|family)\}/;

test('lang_hau_chien_3 pack is valid with 12 unique, era-gated storylets (ids lhc3_)', () => {
  const v = validateContentPack(pack);
  assert.deepEqual(v.errors, []);
  assert.deepEqual(v.warnings, []);
  assert.equal(pack.scenarios.length, 12);
  assert.equal(new Set(pack.scenarios.map(s => s.id)).size, 12);
  const other = new Set(pack1.scenarios.map(s => s.id));
  for (const s of pack.scenarios) {
    assert.ok(s.id.startsWith('lhc3_'), s.id);
    assert.ok(!other.has(s.id), s.id);
    assert.deepEqual(s.prerequisites.era, ['lang_hau_chien'], s.id);
    assert.ok(s.prerequisites.min_age >= 20 && s.prerequisites.max_age <= 50, s.id);
    assert.equal(s.choices.length, 3, s.id);
    for (const c of s.choices) for (const o of Object.values(c.outcomes))
      for (const k of Object.keys(o.effects)) assert.ok(EFFECT_KEYS.includes(k), `${s.id}/${c.id}/${k}`);
  }
  const choiceIds = pack.scenarios.flatMap(s => s.choices.map(c => c.id));
  assert.equal(new Set(choiceIds).size, choiceIds.length);
});

test('at least 3 irreversible choices, name placeholders in 8+ stories', () => {
  const choices = pack.scenarios.flatMap(s => s.choices);
  assert.ok(choices.filter(c => c.irreversible).length >= 3);
  const withName = pack.scenarios.filter(s => PLACEHOLDER.test(JSON.stringify(s)));
  assert.ok(withName.length >= 8, `placeholders in ${withName.length}`);
});

test('door and family_state prerequisites use known ids only', () => {
  const defined = new Set();
  for (const p of [pack1, pack]) for (const s of p.scenarios) {
    for (const d of s.unlocks ?? []) defined.add(d);
    for (const d of s.locks ?? []) defined.add(d);
    for (const c of s.choices) for (const d of [...(c.unlocks ?? []), ...(c.locks ?? [])]) defined.add(d);
  }
  let doorStories = 0, famStories = 0;
  for (const s of pack.scenarios) {
    const p = s.prerequisites;
    const ids = [...(p.doors_open ?? []), ...(p.doors_closed ?? [])];
    if (ids.length) doorStories++;
    for (const d of ids) assert.ok(defined.has(d), `${s.id} -> ${d}`);
    if (p.family_state) famStories++;
  }
  assert.ok(doorStories >= 4);
  assert.ok(famStories >= 2);
});
