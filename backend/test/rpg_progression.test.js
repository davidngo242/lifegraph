import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initRpgState,
  awardLifeExp,
  unlockSkill,
  interactNpc,
  getLevelInfo,
  SKILL_TREE,
  LEVEL_TIERS
} from '../src/engine/rpgProgressionEngine.js';
import { processPassivePhase, calculateMaxVitality } from '../src/engine/tickEngine.js';

test('RPG Engine: Initialization, Leveling, and SP rewards', () => {
  const character = {
    id: 'test_char_1',
    age: 20,
    action_points: 3,
    cash: 5000,
    vitality: 80,
    max_vitality: 100,
    burnout: 10,
    karma: 50
  };

  initRpgState(character);
  assert.equal(character.life_level, 1);
  assert.equal(character.life_exp, 0);
  assert.equal(character.skill_points, 1);
  assert.equal(character.social_links.length, 4);

  // Award 250 EXP -> Levels up to Lv 2, earns +1 SP (total 2 SP)
  const result1 = awardLifeExp(character, 250, "Cày cuốc chăm chỉ");
  assert.equal(result1.leveledUp, true);
  assert.equal(character.life_level, 2);
  assert.equal(character.skill_points, 2);

  // Award 600 EXP -> Levels up to Lv 4 (each Novice tier level needs 250 EXP)
  const result2 = awardLifeExp(character, 600, "Dự án lớn");
  assert.equal(result2.leveledUp, true);
  assert.equal(character.life_level, 4);
  assert.equal(character.skill_points, 4);
});

test('RPG Engine: Skill Tree unlock prerequisites and SP deduction', () => {
  const character = {
    id: 'test_char_2',
    life_level: 5,
    life_exp: 100,
    skill_points: 3,
    unlocked_skills: [],
    action_points: 3,
    vitality: 80,
    max_vitality: 100
  };

  // Try unlocking Tier 2 without Tier 1 -> should fail
  const failRes = unlockSkill(character, 'negotiation_master');
  assert.equal(failRes.success, false);
  assert.match(failRes.error, /tiền đề/);

  // Unlock Tier 1 (market_sense_1, cost 1 SP)
  const ok1 = unlockSkill(character, 'market_sense_1');
  assert.equal(ok1.success, true);
  assert.equal(character.skill_points, 2);
  assert.ok(character.unlocked_skills.includes('market_sense_1'));

  // Unlock Tier 2 (negotiation_master, cost 2 SP)
  const ok2 = unlockSkill(character, 'negotiation_master');
  assert.equal(ok2.success, true);
  assert.equal(character.skill_points, 0);
  assert.ok(character.unlocked_skills.includes('negotiation_master'));

  // Try unlocking Tier 3 with 0 SP -> should fail
  const failSp = unlockSkill(character, 'capital_engine');
  assert.equal(failSp.success, false);
  assert.match(failSp.error, /Không đủ Điểm Kỹ Năng/);
});

test('RPG Engine: NPC Social Links interaction and leveling', () => {
  const character = {
    id: 'test_char_3',
    life_level: 2,
    life_exp: 0,
    skill_points: 1,
    action_points: 3,
    cash: 2000,
    burnout: 30,
    karma: 50,
    unlocked_skills: []
  };
  initRpgState(character);

  const mentor = character.social_links.find(n => n.archetype === 'mentor');
  assert.ok(mentor);
  assert.equal(mentor.linkLevel, 1);

  // Socialize action
  const initialExp = mentor.linkExp;
  const socRes = interactNpc(character, mentor.id, 'socialize');
  assert.equal(socRes.success, true);
  assert.equal(character.action_points, 2);
  assert.ok(mentor.linkExp > initialExp);

  // Gift action
  const giftRes = interactNpc(character, mentor.id, 'gift');
  assert.equal(giftRes.success, true);
  assert.equal(character.action_points, 1);
  assert.equal(character.cash, 1500); // $500 gift cost
});

test('RPG Engine: Passive Tick wirings (Capital Engine, Stoic Mind, Encyclopedic Brain, Transcendence)', async () => {
  const character = {
    id: 'test_char_4',
    age: 30,
    cash: 10000,
    vitality: 80,
    max_vitality: 100,
    burnout: 20,
    karma: 50,
    action_points: 2,
    unlocked_skills: [
      'capital_engine',
      'stoic_mind',
      'encyclopedic_brain',
      'transcendence_sage'
    ],
    hidden_flags: [],
    household: { parents_status: 'alive' }
  };

  const assets = [];
  const relationships = [];

  const { updatedCharacter, passiveSummary } = await processPassivePhase(character, assets, relationships);

  // Capital Engine: +$25,000 passive yield
  assert.equal(updatedCharacter.cash, 35000); // 10000 + 25000
  assert.equal(passiveSummary.annual_digest.cash_flow.capital_engine_bonus, 25000);

  // Encyclopedic Brain: +25 Karma annual buff
  assert.equal(updatedCharacter.karma, 75); // 50 + 25

  // Transcendence Sage: +15 max vitality cap
  const baseCap = calculateMaxVitality(31, null, false);
  const transCap = calculateMaxVitality(31, null, true);
  assert.equal(transCap, baseCap + 15);
  assert.equal(updatedCharacter.max_vitality, transCap);
});
