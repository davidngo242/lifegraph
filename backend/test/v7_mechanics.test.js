import test from 'node:test';
import assert from 'node:assert/strict';
import { recordAndCheckCombo, resetAnnualActions } from '../src/engine/comboActionEngine.js';
import { getBreakthroughForAge, executeBreakthroughAction } from '../src/engine/breakthroughEngine.js';
import { evaluateIncomingNpcEvent } from '../src/engine/incomingSocialEngine.js';
import { processPassivePhase } from '../src/engine/tickEngine.js';
import { setRngStateResolver } from '../src/engine/rng.js';

test('Combo Engine: records actions and triggers Thân Tâm Khang Kiện combo', () => {
  const character = {
    vitality: 50,
    burnout: 30,
    annual_actions_taken: []
  };

  const c1 = recordAndCheckCombo(character, 'wellness');
  assert.equal(c1, null);

  const c2 = recordAndCheckCombo(character, 'study');
  assert.ok(c2);
  assert.equal(c2.id, 'combo_holistic_balance');
  assert.equal(c2.name, 'Thân Tâm Khang Kiện');
  assert.equal(character.vitality, 60); // +10
  assert.equal(character.burnout, 10); // -20
  assert.ok(character.life_exp >= 35); // +35

  // Reset annual actions
  resetAnnualActions(character);
  assert.deepEqual(character.annual_actions_taken, []);
});

test('Breakthrough Engine: generates age-appropriate 2-AP breakthrough and executes', () => {
  const character = {
    age: 26,
    cash: 50000000,
    vitality: 80,
    action_points: 2,
    hidden_flags: [],
    life_exp: 0
  };

  const action = getBreakthroughForAge(character.age);
  assert.ok(action);
  assert.equal(action.costAp, 2);
  assert.ok(action.title);

  // Execute
  const result = executeBreakthroughAction(character);
  assert.ok(result.actionTitle);
  assert.ok(typeof result.isSuccess === 'boolean');
  assert.ok(result.message);
  assert.equal(character.action_points, 0); // Consumed 2 AP
  assert.ok(character.life_exp > 0); // Rewarded life exp
});

test('Incoming Social Engine: generates valid NPC event with options and effects', () => {
  const character = {
    age: 25,
    name: 'Minh',
    cash: 10000000,
    vitality: 60,
    karma: 20
  };
  const relationships = [
    { id: 'rel_parent_1', name: 'Mẹ', type: 'mother', status: 'alive' }
  ];

  let event = null;
  for (let i = 0; i < 50; i++) {
    event = evaluateIncomingNpcEvent(character, relationships);
    if (event) break;
  }
  if (event) {
    assert.ok(event.id);
    assert.ok(event.options.length > 0);
    const opt = event.options[0];
    assert.ok(opt.label);
    if (opt.effect) {
      const msg = opt.effect(character);
      assert.ok(typeof msg === 'string');
    }
  }
});

test('Dynamic AP Economy: unused AP converts to vitality gain, burnout relief and converted_ap_notice', async (t) => {
  // Cố định seed: pha cuối năm có sự kiện ngẫu nhiên (vd. cha/mẹ qua đời) làm test chập chờn khi không seed.
  const rngState = { seed: 2, n: 0 };
  setRngStateResolver(() => rngState);
  t.after(() => setRngStateResolver(null));
  const character = {
    age: 25,
    cash: 5000,
    vitality: 70,
    max_vitality: 100,
    burnout: 40,
    action_points: 3,
    hidden_flags: [],
    household: { parents_status: 'alive' }
  };

  const { updatedCharacter, passiveSummary } = await processPassivePhase(character, [], []);

  assert.equal(passiveSummary.unused_ap_converted, 3);
  assert.equal(passiveSummary.unused_ap_vitality_gain, 6); // 3 * 2
  assert.equal(passiveSummary.unused_ap_burnout_relief, 15); // 3 * 5
  assert.ok(passiveSummary.converted_ap_notice);
  assert.ok(passiveSummary.converted_ap_notice.includes('Chuyển hóa 3 AP dư thành Dưỡng Sinh: +6 HP & -15% Burnout'));
  assert.ok(passiveSummary.annual_digest.family_events.some(e => e.includes('Chuyển hóa 3 AP dư')));

  // Vitality and Burnout updated correctly (burnout accounts for -4 annual passive recovery + -15 AP relief)
  assert.equal(updatedCharacter.vitality, 76); // 70 + 6
  assert.equal(updatedCharacter.burnout, 21); // 40 - 4 (annual passive) - 15 (AP conversion)

  // When AP is 0
  const charZeroAp = {
    age: 25,
    cash: 5000,
    vitality: 70,
    max_vitality: 100,
    burnout: 40,
    action_points: 0,
    hidden_flags: [],
    household: { parents_status: 'alive' }
  };
  const resZero = await processPassivePhase(charZeroAp, [], []);
  assert.equal(resZero.passiveSummary.unused_ap_converted, 0);
  assert.equal(resZero.passiveSummary.converted_ap_notice, null);
});

