// Kiểm tra getNodesForState. Chạy: node tools/test_life_tree_nodes.mjs (Node >= 22.18, hoặc thêm --experimental-strip-types)
import assert from 'node:assert/strict';
import { getNodesForState, getBaseNodes } from '../frontend/app/lib/lifeTreeNodes.ts';
import { ALL_UNLOCKED } from '../frontend/app/lib/unlocks.ts';

const bt = { id: 'b', title: 'Đột phá', description: 'd' };
const run = (age, character = {}, breakthroughAction = null) => getNodesForState({ character, characterAge: age, breakthroughAction, unlocks: ALL_UNLOCKED });
const ids = (ns) => ns.map(n => n.id);
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok  ' + name); };

t('tuổi 3, không trọng tâm: 5 nút nền + đột phá', () => {
  assert.deepEqual(ids(run(3, {}, bt)), ['cuddle_parents', 'toy_brain', 'sunbath', 'toddler_walk', 'eat_grow', 'breakthrough']);
});
t('tuổi 10, không trọng tâm', () => {
  assert.deepEqual(ids(run(10, {}, bt)), ['school_study', 'help_chores', 'play_sports', 'explore_nature', 'talk_parents', 'breakthrough']);
});
t('tuổi 30, không trọng tâm: giữ nguyên hành vi cũ', () => {
  assert.deepEqual(ids(run(30, {}, bt)), ['work_ot', 'study_specialty', 'expand_network', 'stock_trading', 'restore_vitality', 'breakthrough']);
  assert.deepEqual(run(30, { year_focus: null }), getBaseNodes({ character: { year_focus: null }, characterAge: 30, unlocks: ALL_UNLOCKED }));
});
t('cast vắng hoặc year_focus lạ: vẫn như cũ', () => {
  assert.deepEqual(ids(run(30, { year_focus: 'xyz', cast: [] })), ids(run(30)));
});
t('tuổi 3 bỏ qua trọng tâm', () => assert.deepEqual(ids(run(3, { year_focus: 'career' })), ids(run(3))));
t('nút làm việc chỉ có khi sự nghiệp (hoặc chưa chọn)', () => {
  assert.ok(ids(run(30, { year_focus: 'career' })).includes('work_ot'));
  for (const f of ['family', 'health', 'learning', 'experience']) {
    const i = ids(run(30, { year_focus: f }));
    assert.ok(!i.includes('work_ot') && !i.includes('stock_trading'), f);
  }
});
t('mỗi trọng tâm: nút trọng tâm + tối đa 2 nền', () => {
  assert.deepEqual(ids(run(30, { year_focus: 'family' })), ['expand_network', 'talk_parents', 'family_meal', 'restore_vitality', 'study_specialty']);
  assert.deepEqual(ids(run(30, { year_focus: 'health' })), ['restore_vitality', 'health_checkup', 'study_specialty', 'expand_network']);
  assert.deepEqual(ids(run(30, { year_focus: 'learning' })), ['study_specialty', 'restore_vitality', 'expand_network']);
  assert.deepEqual(ids(run(30, { year_focus: 'experience' })), ['explore_nature', 'expand_network', 'restore_vitality', 'study_specialty']);
});
t('đột phá luôn được giữ', () => assert.ok(ids(run(30, { year_focus: 'health' }, bt)).includes('breakthrough')));
t('tuổi học trò theo trọng tâm', () => assert.deepEqual(ids(run(10, { year_focus: 'learning' })), ['school_study', 'play_sports', 'talk_parents']));
t('nút NPC nóng chỉ khi có memory', () => {
  const cast = [{ id: 'a', name: 'An', memory: '' }, { id: 'b', name: 'Bình', memory: ['nợ cũ'] }];
  assert.ok(ids(run(30, { cast })).includes('npc_meet:b'));
  assert.ok(!ids(run(30, { cast: [cast[0]] })).some(i => i.startsWith('npc_meet')));
  assert.equal(run(30, { cast }).find(x => x.id === 'npc_meet:b').title, 'Gặp Bình');
});
console.log(`\n${n} test pass`);
