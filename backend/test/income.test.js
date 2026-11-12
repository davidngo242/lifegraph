import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';
const { processPassivePhase } = await import('../src/engine/tickEngine.js');
const { computeAnnualIncome, INCOME_CONFIG } = await import('../src/engine/core/income.js');
const { CASH_FLOOR } = await import('../src/engine/core/stats.js');

const adult = (over = {}) => ({
  age: 29, vitality: 80, max_vitality: 100, cash: 0, burnout: 10, karma: 50, hidden_flags: [], history_log: [],
  action_points: 0, innate_traits: [], unlocked_skills: [], nationality: 'Việt Nam',
  occupation: 'Kỹ sư AI Big Tech', housing: { tier: 1 }, ...over
});
const run = async over => {
  const { updatedCharacter: c, passiveSummary: s } = await processPassivePhase(adult(over), [], []);
  return { c, s };
};

test('adult earns a wage and pays living cost, both surfaced additively', async () => {
  const { c, s } = await run();
  if (c.is_deceased) return;
  assert.ok(s.wageIncome > 0 && s.livingCost > 0);
  assert.equal(s.annual_digest.cash_flow.wage, s.wageIncome);
  assert.equal(s.annual_digest.cash_flow.living_cost, s.livingCost);
  assert.equal(c.cash, s.netPassiveFlow, 'cash change equals reported net flow (no assets, no family)');
  assert.equal(s.netPassiveFlow, s.wageIncome - s.livingCost);
});
test('minor gets no wage and no living cost', async () => {
  const { s } = await run({ age: 14, occupation: 'Học sinh THPT' });
  assert.equal(s.wageIncome, 0);
  assert.equal(s.livingCost, 0);
});
test('burnout >= 75 reduces the wage', () => {
  const ok = computeAnnualIncome({ age: 35, occupation: 'Kỹ sư', burnout: 40 }).wage;
  const burnt = computeAnnualIncome({ age: 35, occupation: 'Kỹ sư', burnout: 80 }).wage;
  assert.equal(burnt, Math.round(ok * INCOME_CONFIG.burnoutWageMult));
});
test('retirement tapers the wage after 65 down to a pension floor', () => {
  const w = a => computeAnnualIncome({ age: a, occupation: 'Kỹ sư' }).wage;
  assert.ok(w(66) < w(64) && w(70) < w(66));
  const floor = computeAnnualIncome({ age: 95, occupation: 'Kỹ sư' }).wage;
  assert.ok(floor > 0 && floor === computeAnnualIncome({ age: 120, occupation: 'Kỹ sư' }).wage);
});
test('living cost is 60-80% of reference wage and rises with housing tier', () => {
  const l = t => computeAnnualIncome({ age: 30, housingTier: t }).livingCost;
  const ref = computeAnnualIncome({ age: 30 }).refWage;
  assert.ok(l(1) >= 0.6 * ref - 1 && l(5) <= 0.8 * ref + 1);
  assert.ok(l(1) < l(2) && l(2) < l(3));
});
test('wage varies by nationality tier and occupation; freelance nets slightly negative in tier 3 housing', () => {
  const rich = computeAnnualIncome({ age: 30, occupation: 'Kỹ sư', countryTier: 'T1' }).wage;
  const poor = computeAnnualIncome({ age: 30, occupation: 'Kỹ sư', countryTier: 'T3' }).wage;
  assert.ok(rich > poor);
  const free = computeAnnualIncome({ age: 18, occupation: 'Lao động tự do', housingTier: 3 });
  assert.ok(free.net < 0 && free.net > -0.3 * free.refWage);
  assert.equal(computeAnnualIncome({ age: 18, occupation: 'Học sinh THPT' }).wage, free.wage, 'lingering student label = freelance');
});
test('debt floor still applies when living cost exceeds wage', async () => {
  const { c } = await run({ cash: CASH_FLOOR + 10, occupation: 'Lao động tự do', housing: { tier: 5 }, burnout: 80 });
  if (c.is_deceased) return;
  assert.ok(c.cash >= CASH_FLOOR);
});
