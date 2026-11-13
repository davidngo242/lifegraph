// Kiểm tra buildLifeTreeMap. Chạy: node tools/test_life_tree_map.mjs (Node >= 22.18, hoặc thêm --experimental-strip-types)
import assert from 'node:assert/strict';
import { buildLifeTreeMap, seasonFromLatestEvent, MAX_MAIN_BRANCHES } from '../frontend/app/lib/lifeTreeMap.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok  ' + name); };
const ids = m => m.branches.map(b => b.id);
const cast = (mem = {}) => [
  { id: 'cast_mentor_1', role: 'mentor', name: 'Bảy', memory: mem.mentor ?? [] },
  { id: 'cast_rival_1', role: 'rival', name: 'Sáu', memory: mem.rival ?? [] },
  { id: 'cast_love_1', role: 'love', name: 'Lụa', memory: mem.love ?? [] },
  { id: 'cast_creditor_or_benefactor_1', role: 'creditor_or_benefactor', name: 'Thìn', stance: 'creditor', memory: [] }
];
const hist = (focus, ages) => ages.map(age => ({ age, focus }));
const lifeA = { age: 30, life_seed: { era: 'lang_hau_chien', family_state: 'no_nan', fate_thread: 'cha_giau_no', temperament: 'nong' },
  cast: cast({ rival: [{ age: 25, tag: 'bi_phan_boi', text: 'bị phản bội' }] }), focus_history: hist('career', [22, 23, 24, 25, 26, 27, 28]) };
const lifeB = { age: 30, life_seed: { era: 'any', family_state: 'danh_gia', fate_thread: 'nguoi_thuong_that_lac', temperament: 'tram' },
  cast: cast({ love: [{ age: 29, tag: 'cuu_giup', text: 'được cứu giúp' }] }), focus_history: hist('family', [20, 21, 22]).concat(hist('learning', [28, 29])) };

t('hai đời khác hạt giống / cast / lịch sử trọng tâm cho tập cành khác nhau', () => {
  const a = buildLifeTreeMap(lifeA), b = buildLifeTreeMap(lifeB);
  assert.notDeepEqual(ids(a), ids(b));
  assert.ok(ids(a).includes('fate:cha_giau_no') && ids(a).includes('focus:career') && ids(a).includes('cast:cast_rival_1'));
  assert.ok(ids(b).includes('focus:family') && ids(b).includes('focus:learning') && ids(b).includes('cast:cast_love_1'));
  assert.notDeepEqual(a.roots.map(r => r.id), b.roots.map(r => r.id));
});
t('rings lấy từ focus_history', () => assert.equal(buildLifeTreeMap(lifeA).rings.length, 7));
t('héo khi không hoạt động quá 8 năm', () => {
  const m = buildLifeTreeMap({ ...lifeA, age: 40 }); // career cuối năm 28: 12 năm
  assert.equal(m.branches.find(b => b.id === 'focus:career').state, 'withered');
  assert.equal(buildLifeTreeMap({ ...lifeA, age: 33 }).branches.find(b => b.id === 'focus:career').state, 'growing');
});
t('sức mạnh nhánh tăng theo số năm trọng tâm, nằm trong 0..1', () => {
  const few = buildLifeTreeMap({ age: 30, focus_history: hist('health', [28]) }).branches[0].strength;
  const many = buildLifeTreeMap({ age: 30, focus_history: hist('health', [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]) }).branches[0].strength;
  assert.ok(many > few && many <= 1 && few >= 0);
});
t('tối đa 6 cành chính, cành định mệnh luôn được giữ', () => {
  const big = { age: 50, life_seed: lifeA.life_seed, focus_history: ['career', 'family', 'health', 'learning', 'experience'].flatMap((f, i) => hist(f, [30 + i, 40 + i, 45 + i])),
    cast: cast({ mentor: [{ age: 40, tag: 'x' }], rival: [{ age: 40, tag: 'x' }], love: [{ age: 40, tag: 'x' }] }) };
  const m = buildLifeTreeMap(big);
  assert.equal(m.branches.length, MAX_MAIN_BRANCHES);
  assert.ok(ids(m).includes('fate:cha_giau_no'));
});
t('cửa đóng thành vết cắt, cửa mở thì không; quả từ lịch sử/cờ/ký ức', () => {
  const m = buildLifeTreeMap({ age: 30, doors: { roi_lang: false, nhan_nuoi: true, phan_boi_ban: { open: false, age: 22 } },
    history_log: [{ age: 18, event: 'Cột Mốc 18 Tuổi: Ngã Rẽ Trưởng Thành' }, { age: 19, event: 'Đi làm' }], hidden_flags: ['written_memoir', 'choice:x'], cast: cast({ mentor: [{ age: 12, tag: 'day_nghe', text: 'dạy nghề' }] }) });
  assert.deepEqual(m.cuts.map(c => c.id).sort(), ['door:phan_boi_ban', 'door:roi_lang']);
  assert.equal(m.cuts.find(c => c.id === 'door:phan_boi_ban').age, 22);
  assert.equal(m.fruits.length, 3);
});
t('nhân vật cũ (không seed/cast/lịch sử) không lỗi, mọi mảng rỗng', () => {
  for (const legacy of [undefined, null, {}, { age: 12 }, { life_seed: null, cast: 'x', focus_history: 5, doors: [], history_log: [null, 3] }]) {
    const m = buildLifeTreeMap(legacy);
    assert.deepEqual([m.roots, m.branches, m.fruits, m.cuts, m.rings], [[], [], [], [], []]);
  }
});
t('mùa theo biến cố, không rõ thì null', () => {
  assert.equal(seasonFromLatestEvent({}, 'Năm 30 tuổi, bạn dồn sức cho sự nghiệp: Cha qua đời.'), 'winter');
  assert.equal(seasonFromLatestEvent({ year_journal: 'Năm 5 tuổi, bạn dành tâm cho gia đình: Em bé chào đời.' }), 'spring');
  assert.equal(seasonFromLatestEvent({}, 'Năm 30 tuổi, bạn dành tâm cho gia đình và một năm trôi qua êm đềm.'), null);
  assert.equal(seasonFromLatestEvent({}), null);
});
console.log(`\n${n} test pass`);
