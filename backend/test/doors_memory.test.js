import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-doors-'));
process.env.NODE_ENV = 'test'; process.env.LIFEGRAPH_DATA_DIR = directory;
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || ''; process.env.GEMINI_API_KEY = '';
const { app } = await import('../src/index.js');
const db = await import('../src/db/db.js');
const { validateContentPack } = await import('../src/content/validator.js');
const { addCastMemory, generateCast } = await import('../src/engine/npcEngine.js');
const { getCurrentScenarioForCharacter, resolveMindStageChoice, registerContentPack } = await import('../src/engine/scenarioEngine.js');
const { normalizeDoors, applyWorldMemory, buildEpitaphSummary, EPITAPH_SUMMARY_MAX } = await import('../src/engine/worldMemory.js');

let server;
before(async () => {
  await db.initDb(); server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
});
after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });

const legacy = (age = 30) => ({ id: 'legacy', name: 'QA', age, cash: 100, vitality: 60, max_vitality: 100, burnout: 0, karma: 50, action_points: 10, hidden_flags: [], knowledge_base: [], innate_traits: [] });
const scene = id => [{ id: `${id}_s`, name: 's', background_theme: 'office', hotspots: [{ id: `${id}_h`, label: 'h', dialogue: { speaker: 'a', text: 't' } }] }];
const sc = (id, age, prerequisites, choices, extra = {}) => ({
  id, arc_id: 'dm', stage: 1, title: id, location_id: 'x', priority: 10, prerequisites: { min_age: age, max_age: age, ...prerequisites }, scenes: scene(id), choices, ...extra
});
const choice = (id, extra = {}) => ({ id, title: id, stance: 's', description: 'd', cost_ap: 0, outcomes: { success: { narration: 'n', effects: {} } }, ...extra });

test('doors: choice locks/unlocks write {open,label,age}; labels, persist flag and irreversible validate', () => {
  const pack = { pack_id: 'dm_doors', name: 'dm', version: '1', description: 'x', scenarios: [
    sc('dm_fork', 40, {}, [
      choice('dm_leave', { irreversible: true, locks: ['roi_lang_cu'], unlocks: ['di_xa'], door_labels: { roi_lang_cu: 'Rời làng cũ', di_xa: 'Đi xa lập nghiệp' }, persist_doors: ['roi_lang_cu'] }),
      choice('dm_stay')
    ])] };
  assert.equal(validateContentPack(pack).valid, true);
  const bad = structuredClone(pack); bad.scenarios[0].choices[0].irreversible = 'yes'; bad.scenarios[0].choices[0].door_labels = { a: 5 };
  assert.equal(validateContentPack(bad).errors.length, 2);
  registerContentPack(pack);
  const c = { ...legacy(40), hidden_flags: ['active_scenario:dm_fork'] };
  resolveMindStageChoice(c, 'dm_leave', 0, [], 'dm_fork');
  assert.deepEqual(c.doors.roi_lang_cu, { open: false, label: 'Rời làng cũ', age: 40, persists: true });
  assert.deepEqual(c.doors.di_xa, { open: true, label: 'Đi xa lập nghiệp', age: 40 });
  const s = { ...legacy(40), hidden_flags: ['active_scenario:dm_fork'] };
  resolveMindStageChoice(s, 'dm_stay', 0, [], 'dm_fork');
  assert.equal(s.doors, undefined, 'a choice without locks leaves doors alone');
});

test('doors: legacy boolean shape migrates on read and on the next write', () => {
  assert.deepEqual(normalizeDoors({ a: false, b: true }), { a: { open: false, label: 'a', age: null }, b: { open: true, label: 'b', age: null } });
  assert.deepEqual(normalizeDoors(null), {}); assert.deepEqual(normalizeDoors([1]), {});
  const c = { ...legacy(40), doors: { roi_lang: false }, hidden_flags: ['active_scenario:dm_fork'] };
  resolveMindStageChoice(c, 'dm_leave', 0, [], 'dm_fork');
  assert.equal(c.doors.roi_lang.open, false);
  assert.equal(c.doors.roi_lang.age, null, 'unknown legacy age stays unknown');
  assert.equal(c.doors.di_xa.open, true);
});

const lifeWithMemories = () => {
  const seed = { era: 'lang_hau_chien', family_state: 'binh_thuong', fate_thread: 'cha_giau_no', temperament: null };
  const parent = { ...legacy(60), id: 'p1', name: 'Nguyễn Văn Cha', generation: 1, life_seed: seed, cast: generateCast(seed), hidden_flags: ['early_will_established', 'legacy:biet_bi_mat_gieng'] };
  addCastMemory(parent, 'rival', { tag: 'grudge', text: 'bị bạn lấy mất ruộng' }, 30);
  addCastMemory(parent, 'creditor_or_benefactor', { tag: 'debt', text: 'còn nợ ba nén bạc' }, 33);
  addCastMemory(parent, 'mentor', { tag: 'da_giup', text: 'chuyện thường' }, 20); // not persistent
  parent.doors = { roi_lang: { open: false, label: 'Rời làng', age: 25, persists: true }, nhan_con: { open: false, label: 'Nhận nuôi', age: 40 } };
  return parent;
};

test('world_memory: persistent NPC memories, persistent doors and inherited knowledge carry over, bloodline stays', () => {
  const parent = lifeWithMemories();
  const seed2 = { era: 'lang_hau_chien', family_state: 'binh_thuong', fate_thread: null, temperament: null };
  const child = { ...legacy(0), id: 'c1', generation: 2, life_seed: seed2, cast: generateCast(seed2), hidden_flags: [] };
  applyWorldMemory(child, parent);
  const wm = child.world_memory;
  assert.equal(wm.bloodline_id, 'p1');
  assert.deepEqual(wm.npc_memories.map(m => m.tag).sort(), ['debt', 'grudge']);
  const rival = child.cast.find(n => n.role === 'rival').memory;
  assert.ok(rival.some(m => m.tag === 'grudge' && m.lineage && /Từ đời trước/.test(m.text) && /ruộng/.test(m.text)));
  assert.equal(child.cast.find(n => n.role === 'mentor').memory.length, 0, 'non-persistent memory is not carried');
  assert.equal(child.doors.roi_lang.open, false); assert.equal(child.doors.roi_lang.inherited, true);
  assert.equal(child.doors.nhan_con, undefined);
  assert.deepEqual([...wm.inherited_knowledge].sort(), ['biet_bi_mat_gieng', 'di_chuc_gia_toc']);
  assert.ok(child.hidden_flags.includes('inherited:biet_bi_mat_gieng'));
  // Third life: same bloodline, memories are not duplicated.
  const grand = { ...legacy(0), id: 'g1', generation: 3, cast: generateCast(seed2), hidden_flags: [] };
  applyWorldMemory(grand, { ...child, age: 70 });
  assert.equal(grand.world_memory.bloodline_id, 'p1');
  assert.equal(grand.world_memory.npc_memories.length, 2);
  assert.equal(grand.world_memory.generation, 3);
  assert.equal(applyWorldMemory({ id: 'x' }, null).world_memory, undefined);
});

test('world_memory: startNewRebirthGame with a lineage parent carries it into the stored character', async () => {
  const parent = lifeWithMemories();
  const { character } = await db.startNewRebirthGame({ rng_seed: 77 }, parent);
  assert.equal(character.world_memory.bloodline_id, 'p1');
  assert.ok(character.cast.some(n => n.memory.some(m => m.lineage)));
  assert.ok(character.hidden_flags.includes('inherited:di_chuc_gia_toc'));
  const { character: fresh } = await db.startNewRebirthGame({ rng_seed: 78 }, null);
  assert.equal(fresh.world_memory, undefined, 'no parent, no bloodline memory');
});

test('inherited_knowledge feeds required_flags: scenario is eligible only after inheriting', () => {
  registerContentPack({ pack_id: 'dm_inherit', name: 'dm', version: '1', description: 'x', scenarios: [
    sc('dm_secret_well', 22, { required_flags: ['inherited:biet_bi_mat_gieng'] }, [choice('dm_secret_c')], { priority: 95 })] });
  const seed = { era: 'any', family_state: null, fate_thread: null, temperament: null };
  const plain = { ...legacy(22), id: 'n0', cast: generateCast(seed) };
  assert.notEqual(getCurrentScenarioForCharacter(plain)?.id, 'dm_secret_well');
  const heir = applyWorldMemory({ ...legacy(22), id: 'n1', cast: generateCast(seed), hidden_flags: [] }, lifeWithMemories());
  assert.equal(getCurrentScenarioForCharacter(heir)?.id, 'dm_secret_well');
});

test('epitaph summary: lived character -> <=3 sentences within the 200 limit; legacy character is safe', () => {
  const lived = lifeWithMemories();
  lived.focus_history = [{ age: 20, focus: 'career' }, { age: 21, focus: 'career' }, { age: 22, focus: 'family' }];
  lived.history_log = [{ age: 30, scenario_id: 's1', event: 'Mở xưởng nhỏ', outcome_tier: 'success' }];
  const text = buildEpitaphSummary(lived);
  assert.ok(text.length > 20 && text.length <= EPITAPH_SUMMARY_MAX, text);
  assert.ok((text.match(/\./g) ?? []).length <= 3);
  assert.match(text, /sự nghiệp/);
  for (const weird of [legacy(55), {}, null, { name: 5, doors: 'x', focus_history: 'y', history_log: [null, 3], life_seed: { fate_thread: 'zzz' } }, { ...legacy(9), doors: { a: false } }]) {
    const t = buildEpitaphSummary(weird);
    assert.ok(typeof t === 'string' && t.length > 0 && t.length <= EPITAPH_SUMMARY_MAX);
  }
  assert.ok(buildEpitaphSummary({ ...lived, name: 'N'.repeat(400) }).length <= EPITAPH_SUMMARY_MAX);
});
