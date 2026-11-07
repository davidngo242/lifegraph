import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getCurrentScenarioForCharacter, getScenarioById, resolveMindStageChoice, interactWithHotspot, fulfillCommitment, evaluateCommitments } from '../src/engine/scenarioEngine.js';
import { validateContentPack } from '../src/content/validator.js';
const packs = fs.readdirSync(new URL('../src/content/packs/', import.meta.url)).map(f => JSON.parse(fs.readFileSync(new URL('../src/content/packs/' + f, import.meta.url))));
const scenarios = packs.flatMap(p => p.scenarios);
const fixture = age => ({ id: 'fixture', name: 'QA', age, cash: 1000, vitality: 60, max_vitality: 100, burnout: 40, karma: 50, action_points: 10, hidden_flags: [], knowledge_base: [], innate_traits: [] });
const pin = sc => ({ ...fixture(sc.prerequisites.min_age), hidden_flags: [`active_scenario:${sc.id}`] });

test('all packs validate; every declared outcome changes the expected stats across 2,640 input cases', () => {
  for (const p of packs) assert.equal(validateContentPack(p).valid, true, p.pack_id);
  const random = Math.random;
  let count = 0;
  try {
    for (const sc of scenarios) for (const choice of sc.choices) for (const known of [false, true]) for (const ap of [0, 1, 2]) for (let die = 1; die <= 20; die++) {
      Math.random = () => (die - 0.5) / 20;
      const c = pin(sc);
      if (known) c.knowledge_base = sc.scenes.flatMap(s => s.hotspots.map(h => h.dialogue?.granted_knowledge).filter(Boolean));
      const before = structuredClone(c);
      const result = resolveMindStageChoice(c, choice.id, ap, [], sc.id);
      const effects = choice.outcomes[result.outcome_key].effects ?? {};
      for (const [key, delta] of Object.entries(effects)) {
        const stat = key.replace('_delta', '');
        const hi = stat === 'cash' ? Infinity : stat === 'vitality' ? c.max_vitality : 100;
        assert.equal(c[stat], Math.max(0, Math.min(hi, before[stat] + delta)), `${choice.id}/${die}/${stat}`);
      }
      assert.equal(c.action_points, before.action_points - (choice.cost_ap ?? 0) - ap);
      assert.equal(c.history_log.length, 1);
      assert.ok(c.scenario_resolutions[sc.id]);
      const state = structuredClone(c);
      const retry = resolveMindStageChoice(c, choice.id, ap, [], sc.id);
      assert.equal(retry.replayed, true);
      assert.deepEqual(c, state, 'retry cannot reapply money, AP, promises, or history');
      count++;
    }
    assert.equal(count, 2640);
  } finally { Math.random = random; }
});

test('age selection, exclusions, and completion are explicit rather than filesystem order', () => {
  const cases = [[0, 'scenario_infancy_first_steps'], [6, 'scenario_school_first_decade'], [18, 'scenario_artisan_trial'], [25, 'scenario_career_crossroads_28'], [42, 'scenario_midlife_crossroads'], [56, 'scenario_legacy_golden_years'], [121, null]];
  for (const [age, id] of cases) assert.equal(getCurrentScenarioForCharacter(fixture(age))?.id ?? null, id);
  const c = fixture(28); c.hidden_flags = ['career_crossroads_resolved', 'choice:CHOICE_FIRST_STEPS'];
  assert.equal(getCurrentScenarioForCharacter(c).id, 'scenario_career_crossroads_28', 'old childhood bug must not block adult content');
  c.hidden_flags.push('choice:CHOICE_STAY_CORPORATE');
  assert.notEqual(getCurrentScenarioForCharacter(c)?.id, 'scenario_career_crossroads_28');
});

test('postpone is free and non-terminal; negative/fractional/non-finite AP never mutates state', () => {
  const c = fixture(28); const before = structuredClone(c);
  assert.equal(resolveMindStageChoice(c, 'CHOICE_POSTPONE_OBSERVE').postponed, true);
  assert.deepEqual(c, before);
  for (const ap of [-10, 0.5, NaN, Infinity, '2', 3]) {
    assert.throws(() => resolveMindStageChoice(c, 'CHOICE_STAY_CORPORATE', ap));
    assert.deepEqual(c, before);
  }
});

test('rereading a paid clue is free and AP zero remains zero', () => {
  const c = fixture(28); c.action_points = 1;
  const first = interactWithHotspot(c, 'scene_cafe', 'hs_customer');
  assert.equal(first.ap_remaining, 0);
  const again = interactWithHotspot(c, 'scene_cafe', 'hs_customer');
  assert.equal(again.ap_remaining, 0); assert.equal(again.granted_knowledge, null);
});

test('zero stats, EQ and stable trait IDs are respected', () => {
  const random = Math.random; Math.random = () => 0.5;
  try {
    const c = fixture(28); c.eq = 120; c.innate_traits = ['tâm_lý_thép']; c.vitality = 0; c.karma = 0;
    const result = resolveMindStageChoice(c, 'CHOICE_STAY_CORPORATE');
    assert.equal(result.roll.stat_bonus, 2); assert.equal(result.roll.trait_bonus, 2);
    assert.ok(c.vitality <= 5); assert.ok(c.karma <= 15);
  } finally { Math.random = random; }
});

test('commitments can be fulfilled or broken once, with age zero preserved', () => {
  const c = fixture(0);
  resolveMindStageChoice(c, 'CHOICE_FIRST_STEPS');
  const item = c.commitments[0]; assert.equal(item.created_age, 0); assert.equal(item.due_age, 1);
  const before = c.action_points;
  fulfillCommitment(c, item.id); fulfillCommitment(c, item.id);
  assert.equal(c.action_points, before - 1); assert.equal(item.status, 'fulfilled');
  const other = fixture(0); resolveMindStageChoice(other, 'CHOICE_FIRST_STEPS'); other.age = 1;
  evaluateCommitments(other); evaluateCommitments(other);
  assert.equal(other.commitments[0].status, 'broken'); assert.equal(other.history_log.length, 2);
});

test('validator rejects the ignored legacy schema instead of silently accepting it', () => {
  const pack = structuredClone(packs[0]); pack.scenarios[0].choices[0].outcomes.success = { stat_deltas: { cash: 123 } };
  assert.equal(validateContentPack(pack).valid, false);
});
