import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-lhc-'));
process.env.DATABASE_URL = ''; process.env.GEMINI_API_KEY = '';
const { validateContentPack } = await import('../src/content/validator.js');

const pack = JSON.parse(fs.readFileSync(new URL('../src/content/packs/pack_lang_hau_chien_1.json', import.meta.url)));
const EFFECT_KEYS = ['cash_delta', 'vitality_delta', 'burnout_delta', 'karma_delta'];

test('lang_hau_chien_1 pack is valid with 25 unique storylets', () => {
  const v = validateContentPack(pack);
  assert.deepEqual(v.errors, []);
  assert.deepEqual(v.warnings, []);
  assert.equal(pack.scenarios.length, 25);
  assert.equal(new Set(pack.scenarios.map(s => s.id)).size, 25);
  const choiceIds = pack.scenarios.flatMap(s => s.choices.map(c => c.id));
  assert.equal(new Set(choiceIds).size, choiceIds.length);
});

test('every storylet is era-gated, has a hotspot, 3 choices and only known effect keys', () => {
  for (const s of pack.scenarios) {
    assert.deepEqual(s.prerequisites.era, ['lang_hau_chien'], s.id);
    assert.ok(s.scenes[0].hotspots.length >= 1, s.id);
    assert.equal(s.choices.length, 3, s.id);
    assert.ok(s.prerequisites.min_age <= s.prerequisites.max_age, s.id);
    for (const c of s.choices) for (const o of Object.values(c.outcomes))
      for (const k of Object.keys(o.effects)) assert.ok(EFFECT_KEYS.includes(k), `${s.id}/${c.id}/${k}`);
  }
});

test('at least 3 irreversible choices, and required_flags point at real choices', () => {
  const choices = pack.scenarios.flatMap(s => s.choices);
  assert.ok(choices.filter(c => c.irreversible).length >= 3);
  const ids = new Set(choices.map(c => `choice:${c.id}`));
  for (const s of pack.scenarios) for (const f of s.prerequisites.required_flags ?? []) assert.ok(ids.has(f), `${s.id} -> ${f}`);
});
