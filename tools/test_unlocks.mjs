// Kiểm tra biên getUnlocks. Chạy: node tools/test_unlocks.mjs (Node >= 22.18, hoặc thêm --experimental-strip-types)
import assert from 'node:assert/strict';
import { getUnlocks, ALL_UNLOCKED } from '../frontend/app/lib/unlocks.ts';

const g = (age, rc = 0, lineage = []) => getUnlocks({ age }, { reincarnation_count: rc }, lineage);
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok  ' + name); };

t('age 17: chỉ lõi', () => {
  const u = g(17);
  for (const k of ['assets', 'careers', 'overtime', 'network', 'gamble', 'pets', 'skillTree', 'aspiration', 'transhumanism']) assert.equal(u[k], false, k);
  assert.equal(u.core, true);
  assert.equal(u.breakthrough, true);
});
t('age 18: tài sản/nghề/mạng/cược mở, còn lại khoá', () => {
  const u = g(18);
  for (const k of ['assets', 'careers', 'overtime', 'network', 'gamble']) assert.equal(u[k], true, k);
  for (const k of ['pets', 'skillTree', 'aspiration', 'transhumanism']) assert.equal(u[k], false, k);
});
t('kiếp 1 (count=0) vẫn khoá pet/skill/khát vọng', () => assert.equal(g(30, 0).pets, false));
t('count=1 mở pet/skill/khát vọng, chưa mở đột phá', () => {
  const u = g(10, 1);
  assert.deepEqual([u.pets, u.skillTree, u.aspiration, u.transhumanism], [true, true, true, false]);
  assert.equal(u.assets, false);
});
t('tiền nhân demo không tính', () => {
  assert.equal(g(20, 0, [{ is_demo: true }]).pets, false);
  assert.equal(g(20, 0, [{ id: 'founder_gen_1' }]).pets, false);
});
t('tiền nhân thật mở pet/skill/khát vọng', () => assert.equal(g(20, 0, [{ id: 'x' }]).skillTree, true));
t('age 59 khoá siêu nhân hoá, 60 mở', () => {
  assert.equal(g(59).transhumanism, false);
  assert.equal(g(60).transhumanism, true);
});
t('đột phá luôn mở (cột mốc theo tuổi từ sơ sinh)', () => { for (const a of [0, 5, 17, 40]) assert.equal(g(a).breakthrough, true); });
t('count=2 mở siêu nhân hoá ở mọi tuổi', () => assert.equal(g(5, 2).transhumanism, true));
t('thiếu dữ liệu không ném lỗi', () => {
  const u = getUnlocks(null, undefined);
  assert.equal(u.assets, false);
  assert.equal(u.core, true);
});
t('ALL_UNLOCKED mở hết', () => assert.ok(Object.values(ALL_UNLOCKED).every(Boolean)));
console.log(`\n${n} test pass`);
