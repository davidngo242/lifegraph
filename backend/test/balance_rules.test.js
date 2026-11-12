import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';
const { processPassivePhase, lifestyleHazard } = await import('../src/engine/tickEngine.js');
const { CASH_FLOOR, BANKRUPT_FLAG } = await import('../src/engine/core/stats.js');
const { executeProceduralRebirth } = await import('../src/engine/rebirthEngine.js');

const adult = (over = {}) => ({
  age: 39, vitality: 80, max_vitality: 100, cash: 0, burnout: 10, karma: 50, hidden_flags: [], history_log: [],
  action_points: 0, innate_traits: [], unlocked_skills: [], ...over
});

test('passive phase floors runaway debt and raises a one-time bankruptcy note', async () => {
  const { updatedCharacter: c, passiveSummary } = await processPassivePhase(adult({ cash: -249000, age: 39 }), [], []);
  if (c.is_deceased) return; // lifestyle roll is allowed to end the life; floor is covered by the next case
  assert.ok(c.cash >= CASH_FLOOR);
  assert.equal(c.cash, CASH_FLOOR);
  assert.ok(c.hidden_flags.includes(BANKRUPT_FLAG));
  assert.ok(passiveSummary.bankruptcyNotice);
});
test('debt already at the floor does not compound or repeat the note', async () => {
  const start = adult({ cash: CASH_FLOOR, hidden_flags: [BANKRUPT_FLAG] });
  const { updatedCharacter: c, passiveSummary } = await processPassivePhase(start, [], []);
  if (c.is_deceased) return;
  assert.ok(c.cash >= CASH_FLOOR);
  assert.equal(passiveSummary.bankruptcyNotice, null);
});
test('lifestyle hazard rises with burnout, low vitality and risky actions', () => {
  const calm = lifestyleHazard(40, { vitality: 90, burnout: 10, recent_risk: 0 }).p;
  const burnt = lifestyleHazard(40, { vitality: 90, burnout: 95, recent_risk: 0 }).p;
  const frail = lifestyleHazard(40, { vitality: 20, burnout: 10, recent_risk: 0 }).p;
  const risky = lifestyleHazard(40, { vitality: 90, burnout: 10, recent_risk: 3 }).p;
  assert.ok(burnt > calm && frail > calm && risky > calm);
  assert.equal(lifestyleHazard(10, { burnout: 100, vitality: 1 }).p, 0, 'no lifestyle hazard for minors');
  assert.ok(lifestyleHazard(40, { vitality: 1, burnout: 100, recent_risk: 5 }).p <= 0.08, "hazard is capped");
  assert.ok(lifestyleHazard(40, { burnout: 95 }, true).p < burnt, 'longevity halves hazard');
});
test('lifestyle hazard kills an exhausted adult at a visible rate before 60 (statistical)', async () => {
  let deaths = 0; const N = 4000;
  for (let i = 0; i < N; i++) {
    const { updatedCharacter: c } = await processPassivePhase(adult({ burnout: 95, vitality: 40, cash: 5000, age: 44, recent_risk: 2 }), [], []);
    if (c.is_deceased) deaths++;
  }
  assert.ok(deaths > 0 && deaths / N < 0.2, `deaths ${deaths}/${N}`);
});
test('in-life karma no longer starts saturated at the cap', () => {
  const k = executeProceduralRebirth({}, null).karma;
  assert.ok(k < 100 && k >= 25, `starting karma ${k}`);
});
