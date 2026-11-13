import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContentPack } from '../src/content/validator.js';
import { getCurrentScenarioForCharacter, resolveMindStageChoice, registerContentPack, fillNames } from '../src/engine/scenarioEngine.js';

const legacy = (age, extra = {}) => ({ id: 'nc_legacy', name: 'QA', age, cash: 100, vitality: 60, max_vitality: 100, burnout: 0, karma: 50, action_points: 10, hidden_flags: ['scenario_resolved:scenario_legacy_golden_years'], knowledge_base: [], innate_traits: [], ...extra });
const withCast = (age, extra = {}) => legacy(age, { cast: [
  { id: 'c1', role: 'mentor', name: 'Thầy Bảy' }, { id: 'c2', role: 'friend', name: 'Tư Còi' }, { id: 'c3', role: 'friend', name: 'Hai Lúa' },
  { id: 'c4', role: 'rival', name: 'Ba <Hổ>{x}' }], ...extra });
const scene = id => [{ id: `${id}_s`, name: 'Nhà {mentor}', background_theme: 'office', hotspots: [{ id: `${id}_h`, label: 'Gặp {friend}', icon: 'star', position_x: 1, dialogue: { speaker: 'a', text: '{rival} nói: {unknown} {love}.' } }] }];
const choice = id => ({ id, title: 'Nhờ {mentor}', stance: 's', description: '{family}', cost_ap: 0, outcomes: { success: { narration: '{creditor_or_benefactor} và {friend} gật đầu', effects: {} } } });
const sc = (id, age, prerequisites, extra = {}) => ({
  id, arc_id: 'nc', stage: 1, title: `T {mentor} ${id}`, description: 'D {love}', location_id: 'x', priority: 10,
  prerequisites: { min_age: age, max_age: age, ...prerequisites }, scenes: scene(id), choices: [choice(`${id}_c`)], ...extra
});
const reg = (id, scenarios) => { const pack = { pack_id: id, name: id, version: '1', description: 'x', scenarios }; assert.equal(validateContentPack(pack).valid, true); registerContentPack(pack); };

test('names: substituted from cast (first match), neutral fallback for legacy, unknown braces untouched', () => {
  reg('nc_names', [sc('nc_name_1', 101, {})]);
  const s = getCurrentScenarioForCharacter(withCast(101));
  assert.equal(s.title, 'T Thầy Bảy nc_name_1');
  assert.equal(s.description, 'D người thương');
  assert.equal(s.scenes[0].name, 'Nhà Thầy Bảy');
  assert.equal(s.scenes[0].hotspots[0].label, 'Gặp Tư Còi');
  assert.equal(s.scenes[0].hotspots[0].dialogue.text, 'Ba Hổx nói: {unknown} người thương.');
  assert.equal(s.choices[0].title, 'Nhờ Thầy Bảy');
  const l = getCurrentScenarioForCharacter(legacy(101));
  assert.equal(l.title, 'T người thầy nc_name_1');
  assert.equal(l.choices[0].description, 'người thân');
  assert.equal(fillNames('{}{ mentor}{a b}', {}), '{}{ mentor}{a b}');
  assert.equal(fillNames(undefined, {}), undefined);
});

test('names: outcome narration is personalised after a choice', () => {
  reg('nc_names_out', [sc('nc_name_2', 102, {})]);
  const c = withCast(102, { hidden_flags: ['scenario_resolved:scenario_legacy_golden_years', 'active_scenario:nc_name_2'] });
  const r = resolveMindStageChoice(c, 'nc_name_2_c', 0, [], 'nc_name_2');
  assert.equal(r.narration, 'người chủ nợ và Tư Còi gật đầu');
  assert.equal(r.choice_title, 'Nhờ Thầy Bảy');
  assert.equal(c.history_log[0].event, 'T Thầy Bảy nc_name_2');
});

test('validator warns (not errors) on unknown placeholders', () => {
  const v = validateContentPack({ pack_id: 'w', name: 'w', version: '1', scenarios: [sc('nc_warn', 40, {}, { description: '{boss} {mentor}' })] });
  assert.equal(v.valid, true);
  assert.ok(v.warnings.some(w => w.includes('{boss}')));
});

test('prerequisites: family_state, doors_closed, doors_open, legacy characters', () => {
  reg('nc_prereq', [
    sc('nc_fam', 103, { family_state: ['no_nan'] }),
    sc('nc_closed', 104, { doors_closed: ['d1', 'd2'] }),
    sc('nc_open', 105, { doors_open: ['d3'] }),
    sc('nc_emptyfam', 106, { family_state: [] })
  ]);
  const seeded = (age, fs) => legacy(age, { life_seed: { era: 'any', family_state: fs, fate_thread: null, temperament: null } });
  assert.equal(getCurrentScenarioForCharacter(seeded(103, 'no_nan'))?.id, 'nc_fam');
  assert.equal(getCurrentScenarioForCharacter(seeded(103, 'kha_gia')), null);
  assert.equal(getCurrentScenarioForCharacter(legacy(103)), null);
  assert.equal(getCurrentScenarioForCharacter(legacy(106))?.id, 'nc_emptyfam');

  assert.equal(getCurrentScenarioForCharacter(legacy(104, { doors: { d1: { open: false }, d2: false } }))?.id, 'nc_closed');
  assert.equal(getCurrentScenarioForCharacter(legacy(104, { doors: { d1: { open: false }, d2: { open: true } } })), null);
  assert.equal(getCurrentScenarioForCharacter(legacy(104, { doors: { d1: { open: false } } })), null, 'missing door is not closed');
  assert.equal(getCurrentScenarioForCharacter(legacy(104)), null);

  assert.equal(getCurrentScenarioForCharacter(legacy(105, { doors: { d3: { open: true } } }))?.id, 'nc_open');
  assert.equal(getCurrentScenarioForCharacter(legacy(105, { doors: { d3: true } }))?.id, 'nc_open');
  assert.equal(getCurrentScenarioForCharacter(legacy(105, { doors: { d3: { open: false } } })), null);
  assert.equal(getCurrentScenarioForCharacter(legacy(105)), null, 'missing door counts as not open');

  const bad = { pack_id: 'b', name: 'b', version: '1', scenarios: [sc('nc_bad', 40, { doors_open: 'x' })] };
  assert.equal(validateContentPack(bad).valid, false);
});

test('milestone yield: wins until its group was seen within 12 years, then joins the weighted draw; deterministic', () => {
  reg('nc_yield', [
    sc('nc_milestone', 107, {}, { priority: 95, yields_to_group: 'nc_grp', group: 'nc_ms' }),
    sc('nc_grp_a', 107, {}, { priority: 10, group: 'nc_grp', weight: 1 })
  ]);
  assert.equal(getCurrentScenarioForCharacter(legacy(107))?.id, 'nc_milestone');
  assert.equal(getCurrentScenarioForCharacter(legacy(107, { scenario_seen: [{ id: 'z', group: 'nc_grp', age: 80 }] }))?.id, 'nc_milestone', 'seen 20 years ago');
  const recent = legacy(107, { scenario_seen: [{ id: 'z', group: 'nc_grp', age: 98 }] });
  const picks = new Set();
  for (let seed = 1; seed <= 60; seed++) {
    const c = { ...recent, rng_seed: seed };
    const first = getCurrentScenarioForCharacter(c)?.id;
    assert.equal(getCurrentScenarioForCharacter(structuredClone(c))?.id, first, 'same seed, same pick');
    picks.add(first);
  }
  assert.deepEqual([...picks].sort(), ['nc_grp_a', 'nc_milestone'], 'both can win once yielded');
  const viaLog = legacy(107, { rng_seed: 7, scenario_resolutions: { nc_grp_a: {} }, history_log: [{ scenario_id: 'nc_grp_a', age: 105 }] });
  assert.equal(getCurrentScenarioForCharacter(viaLog)?.id, 'nc_milestone', 'only candidate left once the group member is resolved');
  assert.equal(getCurrentScenarioForCharacter({ ...recent, hidden_flags: ['scenario_resolved:scenario_legacy_golden_years', 'active_scenario:nc_milestone'] })?.id, 'nc_milestone', 'pinned still wins');
});
