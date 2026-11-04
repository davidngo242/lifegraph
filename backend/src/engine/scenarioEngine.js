// backend/src/engine/scenarioEngine.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateContentPack } from '../content/validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKS_DIR = path.resolve(__dirname, '../content/packs');

let loadedPacks = [];
let scenarioIndex = new Map();

export function loadAllContentPacks() {
  loadedPacks = [];
  scenarioIndex.clear();

  if (!fs.existsSync(PACKS_DIR)) {
    console.warn(`[ScenarioEngine] Packs dir not found at ${PACKS_DIR}`);
    return;
  }

  const files = fs.readdirSync(PACKS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const filePath = path.join(PACKS_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const pack = JSON.parse(raw);
      const validation = validateContentPack(pack);
      if (validation.valid) {
        loadedPacks.push(pack);
        pack.scenarios.forEach(sc => {
          scenarioIndex.set(sc.id, { ...sc, pack_id: pack.pack_id, pack_name: pack.name });
        });
        console.log(`[ScenarioEngine] Loaded content pack: ${pack.name} (${pack.scenarios.length} scenarios)`);
      } else {
        console.error(`[ScenarioEngine] Failed to validate ${file}:`, validation.errors);
      }
    } catch (err) {
      console.error(`[ScenarioEngine] Error loading ${file}:`, err);
    }
  }
}

// Initial load
loadAllContentPacks();

export function getScenarioById(scenarioId) {
  if (scenarioIndex.size === 0) loadAllContentPacks();
  return scenarioIndex.get(scenarioId) || null;
}

function isResolved(character, scenario) {
  const flags = new Set(character.hidden_flags ?? []);
  return Boolean(character.scenario_resolutions?.[scenario.id]) ||
    flags.has(`scenario_resolved:${scenario.id}`) ||
    scenario.choices.some(choice => flags.has(`choice:${choice.id}`));
}

export function getCurrentScenarioForCharacter(character) {
  if (!character || character.is_deceased) return null;
  if (!scenarioIndex.size) loadAllContentPacks();
  const age = Number(character.age ?? 0);
  const flags = new Set(character.hidden_flags ?? []);
  // Older builds wrote this career flag for every childhood outcome.
  if (!character.scenario_resolutions?.scenario_career_crossroads_28 &&
      !scenarioIndex.get('scenario_career_crossroads_28')?.choices.some(c => flags.has(`choice:${c.id}`))) {
    flags.delete('career_crossroads_resolved');
  }
  const eligible = [...scenarioIndex.values()].filter(sc =>
    age >= (sc.prerequisites?.min_age ?? 0) && age <= (sc.prerequisites?.max_age ?? 120) &&
    (sc.prerequisites?.required_flags ?? []).every(f => flags.has(f)) &&
    !(sc.prerequisites?.excluded_flags ?? []).some(f => flags.has(f)) && !isResolved(character, sc));
  const pinned = [...flags].find(f => typeof f === 'string' && f.startsWith('active_scenario:'))?.slice(16);
  eligible.sort((a, b) => Number(b.id === pinned) - Number(a.id === pinned) ||
    (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id));
  return eligible.length ? personalizeScenario(eligible[0], character) : null;
}

export function getNextScenarioAge(character) {
  if (!character || character.is_deceased) return null;
  for (let age = Number(character.age ?? 0) + 1; age <= 120; age++) {
    if (getCurrentScenarioForCharacter({ ...character, age })) return age;
  }
  return null;
}

function personalizeScenario(scenario, character) {
  const cloned = JSON.parse(JSON.stringify(scenario));
  cloned.scenes.forEach(scene => {
    scene.name = scene.name?.replace(/\bAn\b/g, character.name ?? 'Nhân vật');
    scene.hotspots.forEach(h => {
      if (h.dialogue?.speaker === 'An') h.dialogue.speaker = character.name;
    });
  });
  return cloned;
}

function living(character) {
  if (!character || character.is_deceased) throw new Error('Kiếp sống đã kết thúc. Hãy chọn tái sinh hoặc người kế thừa.');
}
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const stateOf = c => Object.fromEntries(['cash', 'vitality', 'burnout', 'karma', 'action_points'].map(k => [k, c[k] ?? 0]));
function npcFor(npcs, hotspot) {
  return npcs.find(n => n.status !== 'deceased' &&
    (n.scenario_key === hotspot.id || n.name === hotspot.dialogue?.speaker));
}

export function interactWithHotspot(character, sceneId, hotspotId, npcs = []) {
  living(character);
  const scenario = getCurrentScenarioForCharacter(character);
  const scene = scenario?.scenes.find(s => s.id === sceneId);
  const hotspot = scene?.hotspots.find(h => h.id === hotspotId);
  if (!hotspot) throw new Error('Điểm tương tác không còn thuộc kịch bản hiện tại. Hãy tải lại cảnh.');
  const dialogue = hotspot.dialogue ?? {};
  character.scenario_interactions ??= [];
  const key = `${scenario.id}:${hotspot.id}`;
  const seen = character.scenario_interactions.includes(key);
  const cost = seen ? 0 : Number(dialogue.cost_ap ?? 0);
  if ((character.action_points ?? 0) < cost) throw new Error(`Cần ${cost} AP. Xem lại manh mối đã biết không tốn AP.`);
  character.action_points = (character.action_points ?? 0) - cost;
  character.knowledge_base ??= [];
  const fresh = dialogue.granted_knowledge && !character.knowledge_base.includes(dialogue.granted_knowledge);
  if (fresh) character.knowledge_base.push(dialogue.granted_knowledge);
  const npc = npcFor(npcs, hotspot);
  if (!seen && npc) {
    npc.affinity = clamp((npc.affinity ?? 50) + (dialogue.affinity_delta ?? 0), -100, 100);
    npc.trust = clamp((npc.trust ?? 50) + (dialogue.trust_delta ?? 0), 0, 100);
  }
  if (!seen) character.scenario_interactions.push(key);
  character.current_scene_id = sceneId;
  return { success: true, speaker: dialogue.speaker ?? hotspot.label, text: dialogue.text ?? '',
    granted_knowledge: fresh ? dialogue.granted_knowledge : null, ap_remaining: character.action_points,
    affected_npc: npc ?? null, knowledge_base: character.knowledge_base, revisited: seen };
}

export function resolveMindStageChoice(character, choiceId, apInvestment = 0, npcs = [], scenarioId = null) {
  living(character);
  if (!Number.isInteger(apInvestment) || apInvestment < 0 || apInvestment > 2)
    throw new Error('AP đầu tư phải là số nguyên từ 0 đến 2.');
  // An explicit instance ID makes retries safe even after the next scenario becomes available.
  const requested = scenarioId ? getScenarioById(scenarioId) : [...scenarioIndex.values()].find(s => s.choices.some(c => c.id === choiceId));
  const previous = requested && character.scenario_resolutions?.[requested.id];
  if (previous) {
    if (previous.choice_id !== choiceId) throw new Error('Kịch bản này đã hoàn thành; không thể chọn lại để nhận thưởng.');
    return { ...JSON.parse(JSON.stringify(previous)), replayed: true, character_state: stateOf(character) };
  }
  const scenario = getCurrentScenarioForCharacter(character);
  if (!scenario) throw new Error('Bạn đã hoàn thành các kịch bản ở giai đoạn này. Hãy thực hiện cam kết hoặc tiến sang năm tiếp theo.');
  if (scenarioId && scenarioId !== scenario.id) throw new Error('Kịch bản đã thay đổi. Hãy tải lại cảnh.');
  if (choiceId === 'CHOICE_POSTPONE_OBSERVE') return {
    success: true, postponed: true, scenario_id: scenario.id, choice_id: choiceId,
    choice_title: 'Tiếp tục quan sát', narration: 'Bạn chưa cam kết. Hãy tìm thêm manh mối trong cảnh.',
    commitments: character.commitments ?? [], character_state: stateOf(character)
  };
  const choice = scenario.choices.find(c => c.id === choiceId);
  if (!choice) throw new Error('Lựa chọn không hợp lệ trong kịch bản hiện tại.');
  const cost = (choice.cost_ap ?? 0) + apInvestment;
  if ((character.action_points ?? 0) < cost) throw new Error(`Cần ${cost} AP, hiện có ${character.action_points ?? 0} AP.`);
  const before = stateOf(character);
  let tier = 'success', roll = null;
  if (choice.check) {
    const missing = (choice.knowledge_requirements ?? []).filter(k => !(character.knowledge_base ?? []).includes(k)).length;
    const dc = choice.check.target_dc + missing * 2;
    const die = Math.floor(Math.random() * 20) + 1;
    const traits = new Set(character.innate_traits ?? []);
    const traitBonus = [...new Set(choice.check.bonus_traits ?? [])].filter(t => traits.has(t)).length * 2;
    const stat = choice.check.stat;
    const statValue = stat === 'VITALITY' ? (character.vitality ?? 0) :
      (stat === 'EQ' || stat === 'CHARISMA') ? (character.eq ?? 100) : (character.iq ?? 100);
    const statBonus = statValue > (stat === 'VITALITY' ? 85 : 110) ? 2 : 1;
    const total = die + traitBonus + statBonus + apInvestment * 2;
    tier = die === 20 || total >= dc + 5 ? 'critical_success' : total >= dc ? 'success' : 'failure';
    // A pack without a distinct critical branch reports an ordinary success, not a phantom tier.
    if (tier === 'critical_success' && !choice.outcomes?.critical_success) tier = 'success';
    roll = { d20_base: die, trait_bonus: traitBonus, stat_bonus: statBonus, ap_bonus: apInvestment * 2,
      total_score: total, target_dc: dc, result_tier: tier };
  }
  const outcome = choice.outcomes?.[tier] ?? choice.outcomes?.success ?? {};
  const effects = outcome.effects ?? choice.effects ?? {};
  character.action_points = (character.action_points ?? 0) - cost;
  if (effects.cash_delta !== undefined) character.cash = Math.max(0, Number(character.cash ?? 0) + effects.cash_delta);
  if (effects.vitality_delta !== undefined) character.vitality = clamp((character.vitality ?? 0) + effects.vitality_delta, 0, character.max_vitality ?? 100);
  if (effects.burnout_delta !== undefined) character.burnout = clamp((character.burnout ?? 0) + effects.burnout_delta, 0, 100);
  if (effects.karma_delta !== undefined) character.karma = clamp((character.karma ?? 0) + effects.karma_delta, 0, 100);
  const npcUpdates = [];
  for (const [name, delta] of Object.entries(outcome.npc_trust_delta ?? {})) {
    const npc = npcs.find(n => n.name === name && n.status !== 'deceased');
    if (npc) { npc.trust = clamp((npc.trust ?? 50) + delta, 0, 100); npcUpdates.push(npc); }
  }
  character.commitments ??= [];
  const promises = tier === 'failure' ? [] : [...(choice.commitments ?? []), ...(outcome.commitments ?? [])];
  promises.forEach((p, i) => {
    const item = typeof p === 'string' ? { title: p, to_npc: 'Bản thân', due_ticks: 1 } : p;
    const id = `${scenario.id}:${item.id ?? choice.id + ':' + i}`;
    if (!character.commitments.some(c => c.id === id)) character.commitments.push({ ...item, id, scenario_id: scenario.id,
      status: 'active', created_age: character.age ?? 0, due_age: (character.age ?? 0) + (item.due_ticks ?? 1) });
  });
  const flags = new Set(character.hidden_flags ?? []);
  flags.add(`choice:${choice.id}`); flags.add(`scenario_resolved:${scenario.id}`);
  if (scenario.completion_flag) flags.add(scenario.completion_flag);
  character.hidden_flags = [...flags];
  const narration = outcome.narration ?? choice.description;
  character.history_log ??= [];
  character.history_log.push({ age: character.age ?? 0, scenario_id: scenario.id, event: scenario.title,
    choice: choice.title, outcome_tier: tier, narration, roll });
  const result = { success: true, completed: true, scenario_id: scenario.id, choice_id: choice.id,
    choice_title: choice.title, outcome_key: tier, narration, effects, roll, npc_updates: npcUpdates,
    changes: Object.fromEntries(Object.keys(before).map(k => [k, { before: before[k], after: stateOf(character)[k] }])),
    commitments: character.commitments, character_state: stateOf(character) };
  character.scenario_resolutions ??= {};
  character.scenario_resolutions[scenario.id] = JSON.parse(JSON.stringify(result));
  return result;
}

export function fulfillCommitment(character, commitmentId, npcs = []) {
  living(character);
  const item = character.commitments?.find(c => c.id === commitmentId);
  if (!item) throw new Error('Không tìm thấy cam kết.');
  if (item.status !== 'active') return { success: true, replayed: true, commitment: item };
  if ((character.age ?? 0) >= item.due_age) throw new Error('Cam kết đã quá hạn.');
  if ((character.action_points ?? 0) < 1) throw new Error('Cần 1 AP để dành thời gian thực hiện cam kết.');
  character.action_points -= 1;
  character.karma = Math.min(100, (character.karma ?? 0) + 5);
  item.status = 'fulfilled'; item.fulfilled_age = character.age;
  const npc = npcs.find(n => n.name === item.to_npc && n.status !== 'deceased');
  if (npc) npc.trust = Math.min(100, (npc.trust ?? 50) + 5);
  character.history_log ??= [];
  character.history_log.push({ age: character.age, event: `Giữ lời hứa: ${item.title}`, choice: 'Dành 1 AP thực hiện (+5 Karma).' });
  return { success: true, commitment: item, npc_updates: npc ? [npc] : [], character_state: stateOf(character) };
}

export function evaluateCommitments(character, npcs = []) {
  for (const item of character.commitments ?? []) {
    if (item.status !== 'active' || (character.age ?? 0) < item.due_age) continue;
    item.status = 'broken'; item.resolved_age = character.age;
    const npc = npcs.find(n => n.name === item.to_npc);
    if (npc) {
      npc.trust = Math.max(0, (npc.trust ?? 50) - (item.consequence_on_break?.trust_penalty ?? 5));
      npc.affinity = Math.max(-100, (npc.affinity ?? 50) - (item.consequence_on_break?.affinity_penalty ?? 0));
    }
    if (item.consequence_on_break?.flag) character.hidden_flags = [...new Set([...(character.hidden_flags ?? []), item.consequence_on_break.flag])];
    character.history_log ??= [];
    character.history_log.push({ age: character.age, event: `Cam kết chưa hoàn thành: ${item.title}`, choice: 'Đã hết hạn; quan hệ thay đổi theo cam kết.' });
  }
}
