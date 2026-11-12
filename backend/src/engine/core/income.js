// Phuong an A (docs/balance-report-2026-11-12.md): base wage by occupation/nationality + living cost by housing tier.
// All tunables live in INCOME_CONFIG. Cash changes are applied by the caller through core/stats.js applyDelta.

export const INCOME_CONFIG = {
  adultAge: 18,
  // Reference yearly wage of a typical employed adult by country tier (USD/yr)
  refWageByCountryTier: { T1: 8000, T2: 5500, T3: 3500 },
  defaultCountryTier: 'T2',
  // Occupation multiplier on the reference wage. First matching pattern wins; unknown named jobs pay 1.0.
  // Students/children labels that linger into adulthood are treated as the default freelance job.
  freelanceMult: 0.67,
  occupationMult: [
    [/khởi nghiệp|kỹ sư|big tech/i, 1.5],
    [/giảng viên/i, 1.1],
    [/ncs|tiến sĩ/i, 0.85],
    [/thừa kế/i, 0.8],
    [/tự do|học sinh|sinh viên|ấu nhi|trẻ|^$/i, null] // null -> freelanceMult
  ],
  // Mild growth with age: +growthPerYear per year since 18, capped at growthCapAge
  growthPerYear: 0.012,
  growthCapAge: 50,
  // Burnout >= threshold cuts wages
  burnoutThreshold: 75,
  burnoutWageMult: 0.6,
  // Retirement taper: from retireAge the wage fades by taperPerYear down to a pension floor (share of full wage)
  retireAge: 65,
  taperPerYear: 0.1,
  // 0.75 keeps a retiree with no assets at net >= 0 in housing tier 1-2 for every occupation (freelance tier 2 is the binding case: 0.67*1.384*0.75*refWage >= 0.68*refWage).
  pensionFloor: 0.75,
  // Living cost = share of the reference wage, by housing tier (60-80%)
  livingCostShareByHousingTier: { 1: 0.6, 2: 0.68, 3: 0.75, 4: 0.8, 5: 0.8 }
};

// Housing may be a tier object ({tier}), a numeric tier, or a legacy string id (e.g. 'villa'). Unknown -> tier 1.
const HOUSING_STRING_TIERS = [
  [/manor|palace|penthouse/i, 5],
  [/villa/i, 4],
  [/luxury|townhouse|condo/i, 3],
  [/rent|apartment|dorm|studio/i, 2],
  [/slum|shared|room|trọ/i, 1]
];
export function resolveHousingTier(housing) {
  if (housing && typeof housing === 'object') return Math.max(1, Math.min(5, Math.round(Number(housing.tier)) || 1));
  if (typeof housing === 'number') return Math.max(1, Math.min(5, Math.round(housing) || 1));
  if (typeof housing === 'string') for (const [re, t] of HOUSING_STRING_TIERS) if (re.test(housing)) return t;
  return 1;
}

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

export function occupationMultiplier(occupation, cfg = INCOME_CONFIG) {
  const text = String(occupation || '').trim();
  for (const [re, mult] of cfg.occupationMult) {
    if (re.test(text)) return mult == null ? cfg.freelanceMult : mult;
  }
  return 1.0;
}

/**
 * Yearly wage and living cost for a character at `age` (the age reached this tick).
 * Returns zeros for minors. Pure function, no mutation.
 */
export function computeAnnualIncome({ age, occupation, housingTier, burnout = 0, countryTier } = {}, cfg = INCOME_CONFIG) {
  const zero = { wage: 0, livingCost: 0, net: 0, refWage: 0, occupationMult: 0 };
  if (!(num(age) >= cfg.adultAge)) return zero;
  const refWage = cfg.refWageByCountryTier[countryTier] ?? cfg.refWageByCountryTier[cfg.defaultCountryTier];
  const mult = occupationMultiplier(occupation, cfg);
  const growth = 1 + cfg.growthPerYear * (Math.min(age, cfg.growthCapAge) - cfg.adultAge);
  const burnoutMult = num(burnout) >= cfg.burnoutThreshold ? cfg.burnoutWageMult : 1;
  const taper = age > cfg.retireAge ? Math.max(cfg.pensionFloor, 1 - (age - cfg.retireAge) * cfg.taperPerYear) : 1;
  const tier = Math.max(1, Math.min(5, Math.round(num(housingTier, 1)) || 1));
  const wage = Math.round(refWage * mult * growth * burnoutMult * taper);
  const livingCost = Math.round(refWage * (cfg.livingCostShareByHousingTier[tier] ?? 0.6));
  return { wage, livingCost, net: wage - livingCost, refWage, occupationMult: mult };
}

// Phuong an B: overtime diminishing returns. `priorCount` = overtime AP already spent this year.
export const OVERTIME_CONFIG = {
  repeatMult: [1, 0.6, 0.35], // 1st, 2nd, 3rd+ overtime AP in the same year
  burnoutThreshold: 70,
  burnoutMult: 0.5            // multiplicative with the repeat multiplier
};
export function overtimeMultiplier(priorCount, burnout, cfg = OVERTIME_CONFIG) {
  const idx = Math.min(Math.max(0, Math.floor(num(priorCount))), cfg.repeatMult.length - 1);
  return cfg.repeatMult[idx] * (num(burnout) >= cfg.burnoutThreshold ? cfg.burnoutMult : 1);
}
