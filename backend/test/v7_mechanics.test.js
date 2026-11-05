import test from 'node:test';
import assert from 'node:assert/strict';
import { recordAndCheckCombo, resetAnnualActions } from '../src/engine/comboActionEngine.js';
import { getBreakthroughForAge, executeBreakthroughAction } from '../src/engine/breakthroughEngine.js';
import { evaluateIncomingNpcEvent } from '../src/engine/incomingSocialEngine.js';

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
