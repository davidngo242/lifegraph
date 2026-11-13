import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-lhc2-'));
process.env.DATABASE_URL = ''; process.env.GEMINI_API_KEY = '';
const { validateContentPack } = await import('../src/content/validator.js');

const pack = JSON.parse(fs.readFileSync(new URL('../src/content/packs/pack_lang_hau_chien_2.json', import.meta.url)));
const pack1 = JSON.parse(fs.readFileSync(new URL('../src/content/packs/pack_lang_hau_chien_1.json', import.meta.url)));
const PLACEHOLDERS = ['mentor', 'rival', 'love', 'creditor_or_benefactor', 'friend', 'family'];

test('lang_hau_chien_2 is a valid pack of 12 unique storylets, all era-gated, ages within 0-20', () => {
  const v = validateContentPack(pack);
  assert.deepEqual(v.errors, []);
  assert.equal(pack.scenarios.length, 12);
  assert.equal(new Set(pack.scenarios.map(s => s.id)).size, 12);
  assert.notEqual(pack.pack_id, pack1.pack_id);
  const all = new Set([...pack1.scenarios, ...pack.scenarios].map(s => s.id));
  assert.equal(all.size, 25 + 12);
  for (const s of pack.scenarios) {
    assert.ok(s.id.startsWith('lhc2_'), s.id);
    assert.deepEqual(s.prerequisites.era, ['lang_hau_chien'], s.id);
    assert.ok(s.prerequisites.max_age <= 20, s.id);
    assert.equal(s.choices.length, 3, s.id);
  }
  const choiceIds = pack.scenarios.flatMap(s => s.choices.map(c => c.id));
  assert.equal(new Set(choiceIds).size, choiceIds.length);
});

test('at least 2 irreversible choices, family_state in >=3 storylets, door prerequisites resolve', () => {
  const choices = pack.scenarios.flatMap(s => s.choices);
  assert.ok(choices.filter(c => c.irreversible).length >= 2);
  assert.ok(pack.scenarios.filter(s => s.prerequisites.family_state).length >= 3);
  const known = new Set([...pack1.scenarios.flatMap(s => s.unlocks ?? []), ...choices.flatMap(c => c.unlocks ?? [])]);
  for (const s of pack.scenarios)
    for (const d of [...(s.prerequisites.doors_open ?? []), ...(s.prerequisites.doors_closed ?? [])])
      assert.ok(known.has(d) || d.startsWith('l2_'), `${s.id} -> ${d}`);
  for (const c of choices) for (const d of [...(c.locks ?? []), ...(c.unlocks ?? [])]) assert.ok(d.startsWith('l2_'), d);
});

test('uses only known name placeholders, in at least 8 storylets, with NPC-memory variant pairs', () => {
  let used = 0;
  for (const s of pack.scenarios) {
    const t = JSON.stringify(s);
    for (const m of t.matchAll(/\{([a-z_]+)\}/g)) assert.ok(PLACEHOLDERS.includes(m[1]), `${s.id}: {${m[1]}}`);
    if (/\{[a-z_]+\}/.test(t)) used++;
  }
  assert.ok(used >= 8, `used=${used}`);
  const groups = {};
  for (const s of pack.scenarios) (groups[s.group] ??= []).push(s);
  const pairs = Object.values(groups).filter(g => g.length >= 2 && g.every(s => s.prerequisites.requires_npc?.memory_has));
  assert.ok(pairs.length >= 2);
});

test('effects use only known keys of comparable size', () => {
  const keys = ['cash_delta', 'vitality_delta', 'burnout_delta', 'karma_delta'];
  for (const s of pack.scenarios) for (const c of s.choices) for (const o of Object.values(c.outcomes))
    for (const [k, v] of Object.entries(o.effects)) {
      assert.ok(keys.includes(k), `${s.id}/${k}`);
      assert.ok(Math.abs(v) <= (k === 'cash_delta' ? 250 : 12), `${s.id}/${c.id}/${k}`);
    }
});
