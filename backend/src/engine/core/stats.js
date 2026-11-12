// Single source of truth for core-stat bounds and mutation (GD2 "luat loi").
// Every vitality / cash / karma / burnout change that goes through applyDelta or clampStat shares these bounds.

export const CASH_FLOOR = -250000;          // runaway-debt cap ("bankruptcy floor")
export const STAT_MAX = { karma: 100, burnout: 100 };
export const BANKRUPT_FLAG = 'bankruptcy_floor';

const num = (v, fallback = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);

/**
 * Clamp one stat to its shared bound.
 * opts.maxVitality: upper bound for vitality (default 100); opts.vitalityMin: lower bound (default 0, some actions keep 10).
 */
export function clampStat(stat, value, opts = {}) {
  const v = num(value);
  switch (stat) {
    case 'vitality': return Math.max(opts.vitalityMin ?? 0, Math.min(num(opts.maxVitality, 100), v));
    case 'cash': return Math.max(CASH_FLOOR, v);
    case 'karma': return Math.max(0, Math.min(STAT_MAX.karma, v));
    case 'burnout': return Math.max(0, Math.min(STAT_MAX.burnout, v));
    default: return v;
  }
}

/**
 * Apply {vitality, cash, karma, burnout} deltas to a character in place with shared bounds.
 * Returns { character, bankrupt } where bankrupt is true if this call pushed cash onto the floor.
 */
export function applyDelta(character, deltas = {}, opts = {}) {
  const clampOpts = { maxVitality: opts.maxVitality ?? character.max_vitality ?? 100, vitalityMin: opts.vitalityMin ?? 0 };
  for (const stat of ['vitality', 'cash', 'karma', 'burnout']) {
    if (deltas[stat] === undefined || deltas[stat] === null) continue;
    character[stat] = clampStat(stat, num(character[stat], stat === 'karma' ? 50 : 0) + num(deltas[stat]), clampOpts);
  }
  const bankrupt = noteBankruptcy(character);
  return { character, bankrupt };
}

/** Set one stat to an absolute value (resets, starter packs, death) within the shared bounds. */
export function setStat(character, stat, value, opts = {}) {
  character[stat] = clampStat(stat, value, { maxVitality: opts.maxVitality ?? character.max_vitality ?? 100, vitalityMin: opts.vitalityMin ?? 0 });
  if (stat === 'cash') noteBankruptcy(character);
  return character;
}

/** Pay up to `amount` out of positive cash (never creates new debt). Returns the amount actually paid. */
export function spendCapped(character, amount) {
  const paid = Math.min(Math.max(0, num(amount)), Math.max(0, num(character.cash)));
  applyDelta(character, { cash: -paid });
  return paid;
}

/** If cash sits on the floor, set the flag and log a one-time history note. Returns true when newly triggered. */
export function noteBankruptcy(character) {
  const flags = Array.isArray(character.hidden_flags) ? character.hidden_flags : (character.hidden_flags = []);
  if (num(character.cash) > CASH_FLOOR) {
    if (num(character.cash) > 0) { const i = flags.indexOf(BANKRUPT_FLAG); if (i >= 0) flags.splice(i, 1); }
    return false;
  }
  if (flags.includes(BANKRUPT_FLAG)) return false;
  flags.push(BANKRUPT_FLAG);
  character.history_log = Array.isArray(character.history_log) ? character.history_log : [];
  character.history_log.push({
    age: character.age,
    event: 'Phá sản',
    choice: `Nợ chạm trần $${Math.abs(CASH_FLOOR).toLocaleString()}: chủ nợ đóng băng tài khoản, nợ không tăng thêm.`
  });
  return true;
}
