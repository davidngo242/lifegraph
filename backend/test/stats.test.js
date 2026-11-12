import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDelta, clampStat, CASH_FLOOR, BANKRUPT_FLAG } from '../src/engine/core/stats.js';

test('clampStat applies shared bounds', () => {
  assert.equal(clampStat('karma', 140), 100);
  assert.equal(clampStat('karma', -5), 0);
  assert.equal(clampStat('burnout', 130), 100);
  assert.equal(clampStat('vitality', 120, { maxVitality: 80 }), 80);
  assert.equal(clampStat('vitality', 2, { vitalityMin: 10 }), 10);
  assert.equal(clampStat('cash', -9e9), CASH_FLOOR);
});
test('applyDelta mutates with bounds and keeps vitalityMin', () => {
  const c = { vitality: 50, max_vitality: 70, cash: 100, karma: 90, burnout: 95, hidden_flags: [] };
  applyDelta(c, { vitality: 40, cash: -50, karma: 30, burnout: 20 });
  assert.deepEqual([c.vitality, c.cash, c.karma, c.burnout], [70, 50, 100, 100]);
  applyDelta(c, { vitality: -100 }, { vitalityMin: 10 });
  assert.equal(c.vitality, 10);
});
test('applyDelta floors debt and logs bankruptcy once', () => {
  const c = { age: 40, vitality: 50, cash: -240000, karma: 50, burnout: 0, hidden_flags: [], history_log: [] };
  const r = applyDelta(c, { cash: -50000 });
  assert.equal(c.cash, CASH_FLOOR); assert.ok(r.bankrupt);
  assert.ok(c.hidden_flags.includes(BANKRUPT_FLAG));
  const again = applyDelta(c, { cash: -1000 });
  assert.equal(again.bankrupt, false); assert.equal(c.history_log.length, 1);
});
