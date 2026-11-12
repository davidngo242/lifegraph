import test from 'node:test';
import assert from 'node:assert/strict';
import { getScenarioById, resolveMindStageChoice } from '../src/engine/scenarioEngine.js';
import { processPassivePhase } from '../src/engine/tickEngine.js';
import { getCountryBigData } from '../src/data/countryBigData.js';
import { getCountryData, COUNTRY_DATA } from '../src/data/countryData.js';
import { sessionContext, getSessionData } from '../src/db/db.js';

test('Scenario: scenario_infancy_fever_crisis structure, hotspots, and choice resolution', () => {
  const scenario = getScenarioById('scenario_infancy_fever_crisis');
  assert.ok(scenario, 'scenario_infancy_fever_crisis must exist in pack');
  assert.equal(scenario.id, 'scenario_infancy_fever_crisis');
  assert.equal(scenario.arc_id, 'arc_infancy');
  assert.equal(scenario.prerequisites.min_age, 1);
  assert.equal(scenario.prerequisites.max_age, 5);
  assert.deepEqual(scenario.prerequisites.required_flags, ['childhood_fever_experienced']);
  assert.deepEqual(scenario.prerequisites.excluded_flags, ['infancy_fever_crisis_resolved']);

  // Scenes and Hotspots check
  assert.equal(scenario.scenes.length, 1);
  const hotspots = scenario.scenes[0].hotspots;
  assert.equal(hotspots.length, 3);
  const hsIds = hotspots.map(h => h.id);
  assert.ok(hsIds.includes('hs_fever_cloth'));
  assert.ok(hsIds.includes('hs_doctor_clinic'));
  assert.ok(hsIds.includes('hs_mother_prayer'));

  // Choices check
  assert.equal(scenario.choices.length, 3);
  const choiceIds = scenario.choices.map(c => c.id);
  assert.ok(choiceIds.includes('CHOICE_FEVER_COOL_DOWN'));
  assert.ok(choiceIds.includes('CHOICE_RUSH_HOSPITAL'));
  assert.ok(choiceIds.includes('CHOICE_IMMUNE_FIGHT'));

  // Test resolve CHOICE_FEVER_COOL_DOWN
  const char1 = {
    id: 'char_fever_1',
    age: 2,
    vitality: 50,
    max_vitality: 100,
    karma: 40,
    cash: 200,
    action_points: 2,
    knowledge_base: ['infant_emergency_fever_patch'],
    innate_traits: [],
    hidden_flags: ['childhood_fever_experienced']
  };
  const res1 = resolveMindStageChoice(char1, 'CHOICE_FEVER_COOL_DOWN', 0, [], 'scenario_infancy_fever_crisis');
  assert.ok(['success', 'failure'].includes(res1.outcome_key));
  assert.ok([2, 5].includes(res1.effects.vitality_delta));
  assert.ok([2, 5].includes(res1.effects.karma_delta));

  // Test resolve CHOICE_RUSH_HOSPITAL
  const char2 = {
    id: 'char_fever_2',
    age: 2,
    vitality: 40,
    max_vitality: 100,
    karma: 40,
    cash: 200,
    action_points: 2,
    knowledge_base: ['infant_pediatric_guidance'],
    innate_traits: [],
    hidden_flags: ['childhood_fever_experienced']
  };
  const res2 = resolveMindStageChoice(char2, 'CHOICE_RUSH_HOSPITAL', 0, [], 'scenario_infancy_fever_crisis');
  assert.ok(['success', 'failure'].includes(res2.outcome_key));
  assert.equal(res2.effects.cash_delta, -50);
  assert.ok([5, 10].includes(res2.effects.vitality_delta));
  assert.ok([5, 10].includes(res2.effects.karma_delta));

  // Test resolve CHOICE_IMMUNE_FIGHT
  const char3 = {
    id: 'char_fever_3',
    age: 2,
    vitality: 45,
    max_vitality: 100,
    karma: 40,
    cash: 200,
    action_points: 1,
    knowledge_base: [],
    innate_traits: [],
    hidden_flags: ['childhood_fever_experienced']
  };
  const res3 = resolveMindStageChoice(char3, 'CHOICE_IMMUNE_FIGHT', 0, [], 'scenario_infancy_fever_crisis');
  assert.ok(['success', 'failure'].includes(res3.outcome_key));
  assert.ok([-5, 8].includes(res3.effects.vitality_delta));
  assert.equal(res3.effects.karma_delta, 5);
});

test('Scenario: scenario_childhood_river_current structure, hotspots, and choice resolution', () => {
  const scenario = getScenarioById('scenario_childhood_river_current');
  assert.ok(scenario, 'scenario_childhood_river_current must exist in pack');
  assert.equal(scenario.id, 'scenario_childhood_river_current');
  assert.equal(scenario.arc_id, 'arc_school_childhood');
  assert.equal(scenario.prerequisites.min_age, 8);
  assert.equal(scenario.prerequisites.max_age, 16);
  assert.deepEqual(scenario.prerequisites.excluded_flags, ['childhood_river_current_resolved']);

  // Scenes and Hotspots check
  assert.equal(scenario.scenes.length, 1);
  const hotspots = scenario.scenes[0].hotspots;
  assert.equal(hotspots.length, 3);
  const hsIds = hotspots.map(h => h.id);
  assert.ok(hsIds.includes('hs_river_flow'));
  assert.ok(hsIds.includes('hs_drowning_friend'));
  assert.ok(hsIds.includes('hs_bamboo_bank'));

  // Choices check
  assert.equal(scenario.choices.length, 3);
  const choiceIds = scenario.choices.map(c => c.id);
  assert.ok(choiceIds.includes('CHOICE_SWIM_RESCUE'));
  assert.ok(choiceIds.includes('CHOICE_BAMBOO_POLE'));
  assert.ok(choiceIds.includes('CHOICE_CALL_VILLAGERS'));

  // Test resolve CHOICE_SWIM_RESCUE
  const charSwim = {
    id: 'char_river_1',
    age: 10,
    vitality: 65,
    max_vitality: 100,
    karma: 50,
    cash: 500,
    action_points: 2,
    knowledge_base: ['river_current_awareness'],
    innate_traits: [],
    hidden_flags: []
  };
  const resSwim = resolveMindStageChoice(charSwim, 'CHOICE_SWIM_RESCUE', 0, [], 'scenario_childhood_river_current');
  assert.ok(['success', 'failure'].includes(resSwim.outcome_key));
  assert.ok([-15, 10].includes(resSwim.effects.vitality_delta));
  assert.ok([10, 20].includes(resSwim.effects.karma_delta));

  // Test resolve CHOICE_BAMBOO_POLE
  const charBamboo = {
    id: 'char_river_2',
    age: 10,
    vitality: 60,
    max_vitality: 100,
    karma: 50,
    cash: 500,
    action_points: 1,
    knowledge_base: ['riverbank_bamboo_grip'],
    innate_traits: [],
    hidden_flags: []
  };
  const resBamboo = resolveMindStageChoice(charBamboo, 'CHOICE_BAMBOO_POLE', 0, [], 'scenario_childhood_river_current');
  assert.ok(['success', 'failure'].includes(resBamboo.outcome_key));
  assert.ok([8, 15].includes(resBamboo.effects.karma_delta));

  // Test resolve CHOICE_CALL_VILLAGERS
  const charCall = {
    id: 'char_river_3',
    age: 10,
    vitality: 60,
    max_vitality: 100,
    karma: 50,
    cash: 500,
    action_points: 1,
    knowledge_base: ['friend_panic_signal'],
    innate_traits: [],
    hidden_flags: []
  };
  const resCall = resolveMindStageChoice(charCall, 'CHOICE_CALL_VILLAGERS', 0, [], 'scenario_childhood_river_current');
  assert.ok(['success', 'failure'].includes(resCall.outcome_key));
  assert.ok([5, 10].includes(resCall.effects.karma_delta));
});

test('Passive childhood health emergency: handles fever and healthcare disparity correctly', async () => {
  const origRandom = Math.random;
  try {
    // 1. Strained / untreated conditions (Tier 3 country, poor family, 0 cash) -> -25 Vitality delta
    Math.random = () => 0.05; // forces fever trigger
    const poorChild = {
      id: 'char_poor_infant',
      age: 2,
      nationality: 'Syria',
      cash: 0,
      vitality: 60,
      max_vitality: 100,
      burnout: 10,
      karma: 40,
      family_background: 'poor',
      household: { annual_allowance: 0 },
      hidden_flags: [],
      innate_traits: []
    };

    const resPoor = await processPassivePhase(poorChild, [], []);
    assert.ok(resPoor.updatedCharacter.hidden_flags.includes('childhood_fever_experienced'));
    assert.equal(resPoor.passiveSummary.vitalityDelta, -25);
    assert.equal(resPoor.updatedCharacter.vitality, 40); // 60 - 25 + 5 (childhood passive event)
    assert.ok(resPoor.passiveSummary.annual_digest.family_events.some(e => e.includes('Hiểm họa nhi khoa')));

    // 2. Supported conditions (weak immune trait + has cash and family support) -> recovers with +2 Vitality, +5 Karma
    Math.random = () => 0.05;
    const supportedChild = {
      id: 'char_supported_infant',
      age: 2,
      nationality: 'Việt Nam',
      cash: 200,
      vitality: 60,
      max_vitality: 100,
      burnout: 10,
      karma: 40,
      family_background: 'middle_class',
      household: { annual_allowance: 50 },
      hidden_flags: [],
      innate_traits: ['weak_immune_system']
    };

    const resSupported = await processPassivePhase(supportedChild, [], []);
    assert.ok(resSupported.updatedCharacter.hidden_flags.includes('childhood_fever_experienced'));
    // 200 initial cash - 24 clinic fee (40 * 0.6 VN clinic_cost_factor) + 50 childhood allowance = 226
    assert.equal(resSupported.updatedCharacter.cash, 226);
    assert.equal(resSupported.passiveSummary.vitalityDelta, 2);
    assert.equal(resSupported.updatedCharacter.vitality, 67); // 60 + 2 + 5 (childhood passive event)
    assert.equal(resSupported.updatedCharacter.karma, 50); // 40 + 5 (clinic recovery) + 5 (childhood event)
    assert.ok(resSupported.passiveSummary.annual_digest.family_events.some(e => e.includes('Sức khỏe ấu thơ')));
  } finally {
    Math.random = origRandom;
  }
});

test('Passive childhood health emergency: fatal infant illness awards +120 Karma reimbursement & sets is_deceased', async () => {
  const origRandom = Math.random;
  try {
    Math.random = () => 0.05; // forces fever trigger
    const criticallyIllChild = {
      id: 'char_critically_ill',
      age: 3,
      nationality: 'Syria',
      cash: 0,
      vitality: 15,
      max_vitality: 100,
      burnout: 10,
      karma: 30,
      family_background: 'poor',
      household: { annual_allowance: 0 },
      hidden_flags: [],
      innate_traits: []
    };

    const result = await processPassivePhase(criticallyIllChild, [], []);
    // 15 - 25 <= 0 -> infant mortality
    assert.equal(result.updatedCharacter.is_deceased, true);
    assert.equal(result.updatedCharacter.vitality, 0);
    assert.equal(result.updatedCharacter.death_cause, 'Biến chứng viêm phổi cấp tính thuở ấu thơ');
    assert.equal(result.updatedCharacter.death_age, 4);
    assert.equal(result.passiveSummary.died, true);
    assert.equal(result.passiveSummary.karmaReimbursed, 120);
    assert.equal(result.updatedCharacter.karma, 150); // 30 + 120
  } finally {
    Math.random = origRandom;
  }
});

test('Passive family healthcare: triggers fever event for young child (rel.type === child)', async () => {
  const origRandom = Math.random;
  try {
    Math.random = () => 0.05; // triggers child fever risk
    const parentCharacter = {
      id: 'char_parent_test',
      age: 28,
      cash: 500,
      vitality: 80,
      max_vitality: 100,
      burnout: 20,
      karma: 50,
      nationality: 'Việt Nam',
      hidden_flags: [],
      innate_traits: []
    };

    const childRel = {
      id: 'rel_child_baby',
      character_id: parentCharacter.id,
      name: 'Bé Bắp',
      type: 'child',
      age: 3,
      status: 'alive',
      affection_level: 50
    };

    await sessionContext.run({ sessionId: 'session_child_fever_test' }, async () => {
      const store = getSessionData();
      store.character = parentCharacter;
      store.relationships = [childRel];

      const { updatedCharacter, passiveSummary } = await processPassivePhase(parentCharacter, [], [childRel]);
      assert.equal(updatedCharacter.cash, 500 + 871 - 40 - 21); // net 871 (wage 4171 - living 3300, age 29, T2, tier 1); mocked random 0.05 also triggers a rent-hike shock (8% of 500 = 40) and the child clinic fee round(35 * 0.6) = 21
      assert.equal(updatedCharacter.karma, 55); // 50 + 5
      assert.equal(childRel.affection_level, 56); // 50 + 6
      assert.ok(passiveSummary.annual_digest.family_events.some(e => e.includes('Con của bạn (Bé Bắp, 4 tuổi) bị sốt mọc răng/nhiễm lạnh')));
    });
  } finally {
    Math.random = origRandom;
  }
});

test('Country Data: pediatric healthcare statistics are exposed for nations', () => {
  assert.ok(COUNTRY_DATA);
  const vn = getCountryBigData('Việt Nam');
  assert.ok(vn);
  assert.ok(vn.healthcare);
  assert.ok(typeof vn.healthcare.clinic_cost_factor === 'number');
  assert.ok(typeof vn.healthcare.infant_survival_rate === 'number');

  const syria = getCountryData('Syria');
  assert.ok(syria);
  assert.equal(syria.tier, 'T3');
  assert.ok(syria.healthcare);
  assert.ok(syria.healthcare.infant_survival_rate < vn.healthcare.infant_survival_rate);
});
