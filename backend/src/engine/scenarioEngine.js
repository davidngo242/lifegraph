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
  if (eligible.length) {
    return personalizeScenario(eligible[0], character);
  }
  if (character.active_dilemma && !character.active_dilemma.is_resolved) {
    return adaptDilemmaToScenario(character.active_dilemma, character);
  }
  return null;
}

export function adaptDilemmaToScenario(dilemma, character) {
  if (!dilemma) return null;
  const age = Number(character?.age ?? 0);
  const theme = age <= 5 ? 'nursery' : age <= 17 ? 'school' : age <= 35 ? 'office' : age <= 55 ? 'cafe' : 'artisan';
  const sceneName = age <= 5 ? 'Căn phòng ấu thơ' : age <= 17 ? 'Lớp học & Sân trường' : age <= 35 ? 'Không gian công sở' : 'Phòng khách gia đình';

  const hotspots = (dilemma.options || []).slice(0, 3).map((opt, idx) => {
    const clueId = `clue_${opt.id}`;
    return {
      id: `hs_dilemma_${opt.id}`,
      label: opt.action_title || opt.label || `Gợi ý ${idx + 1}`,
      icon: idx === 0 ? 'star' : idx === 1 ? 'heart' : 'sparkles',
      position_x: idx === 0 ? 250 : idx === 1 ? 500 : 750,
      npc_role: idx === 0 ? 'manager' : idx === 1 ? 'friend' : 'parent',
      dialogue: {
        speaker: opt.action_title || opt.label,
        text: opt.consequence_hint || opt.description || 'Một hướng đi với những thách thức và phần thưởng riêng biệt.',
        granted_knowledge: clueId
      }
    };
  });

  return {
    id: dilemma.id,
    title: dilemma.title || 'Ngã Rẽ Vận Mệnh Thường Niên',
    description: dilemma.narrative || dilemma.description || 'Đối mặt với ngã rẽ cuộc đời trong năm nay.',
    location_id: 'decision_stage',
    scenes: [{
      id: `scene_${dilemma.id}`,
      name: sceneName,
      background_theme: theme,
      hotspots
    }],
    mind_stage: {
      whispers: {
        rational: dilemma.internal_voices?.rational || "Hãy suy xét cẩn trọng về nguồn lực và tính toán bước đi tiếp theo.",
        empathy: dilemma.internal_voices?.heart || "Lắng nghe trực giác và trân trọng cảm xúc của những người xung quanh.",
        instinct: dilemma.internal_voices?.instinct || "Hành động dứt khoát, nắm bắt cơ hội trước khi thời cơ trôi qua.",
        dilemma_prompt: dilemma.narrative || dilemma.description
      }
    },
    choices: (dilemma.options || []).map((opt, idx) => ({
      id: opt.id,
      title: opt.action_title || opt.label,
      stance: idx === 0 ? 'Lý trí' : idx === 1 ? 'Thích ứng' : 'Cân bằng',
      description: opt.consequence_hint || opt.label,
      cost_ap: opt.cost_ap || 0,
      check: {
        type: 'D20',
        stat: opt.cost_ap > 0 ? 'VITALITY' : 'IQ',
        target_dc: 10 + idx,
        bonus_traits: []
      },
      outcomes: {
        success: {
          narration: `Bạn đã thực hiện quyết định: "${opt.action_title || opt.label}". ${opt.consequence_hint || ''}`,
          effects: opt.effects || {}
        },
        failure: {
          narration: `Dù gặp một vài trở ngại ban đầu, bạn vẫn kiên định với ngã rẽ: "${opt.action_title || opt.label}".`,
          effects: opt.effects || {}
        }
      }
    }))
  };
}

export function getNextScenarioAge(character) {
  if (!character || character.is_deceased) return null;
  for (let age = Number(character.age ?? 0) + 1; age <= 120; age++) {
    if (getCurrentScenarioForCharacter({ ...character, age })) return age;
  }
  return null;
}

function personalizeScenario(scenario, character) {
  if (!scenario || !character) return scenario;
  const cloned = JSON.parse(JSON.stringify(scenario));
  const charName = character.name ?? 'Nhân vật';
  const isFemale = (character.gender === 'female' || character.gender === 'Nữ');

  // Find real spouse / partner if exists
  const realSpouse = (character.relationships || []).find(r => (r.type === 'spouse' || r.type === 'partner') && r.status !== 'deceased');

  // Safe partner name that NEVER collides with character's name
  let defaultPartnerName = isFemale ? 'Minh Hải' : 'Thanh Mai';
  if (charName.toLowerCase().includes('mai')) {
    defaultPartnerName = isFemale ? 'Đình Trọng' : 'Hà Linh';
  }
  const partnerName = realSpouse?.name || defaultPartnerName;

  // Personalize title & description
  if (cloned.description) {
    cloned.description = cloned.description
      .replace(/\bMai\b/g, partnerName)
      .replace(/\bAn\b/g, charName);
  }

  // Personalize roles
  if (cloned.roles) {
    if (cloned.roles.partner) {
      cloned.roles.partner = cloned.roles.partner.replace(/\bMai\b/g, partnerName);
    }
  }

  cloned.scenes?.forEach(scene => {
    scene.name = scene.name?.replace(/\bAn\b/g, charName).replace(/\bMai\b/g, partnerName);
    scene.hotspots?.forEach(h => {
      if (h.dialogue?.speaker === 'An') h.dialogue.speaker = charName;
      if (h.dialogue?.speaker === 'Mai') h.dialogue.speaker = partnerName;
      if (h.label) h.label = h.label.replace(/\bMai\b/g, partnerName);
      if (h.dialogue?.text) {
        h.dialogue.text = h.dialogue.text
          .replace(/\banh\b/gi, isFemale ? 'em' : 'anh')
          .replace(/\bMai\b/g, partnerName);
      }
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

export function resolveMindStageChoice(character, choiceId, apInvestment = 0, npcs = [], arg4 = null, arg5 = null) {
  living(character);
  if (!Number.isInteger(apInvestment) || apInvestment < 0 || apInvestment > 2) {
    throw new Error('AP đầu tư phải là số nguyên từ 0 đến 2.');
  }

  let safeguardTerm = 'standard';
  let scenarioId = null;
  if (typeof arg4 === 'string') {
    if (['standard', 'deposit', 'time_cap', 'penalty'].includes(arg4)) {
      safeguardTerm = arg4;
      scenarioId = arg5;
    } else {
      scenarioId = arg4;
      safeguardTerm = arg5 || 'standard';
    }
  }

  const scenario = scenarioId ? (getScenarioById(scenarioId) || getCurrentScenarioForCharacter(character)) : getCurrentScenarioForCharacter(character);
  if (!scenario) throw new Error('Không tìm thấy kịch bản khả dụng.');

  // 0. Handle Postpone / Continue Observing
  if (choiceId === 'CHOICE_POSTPONE_OBSERVE') {
    return {
      success: true,
      postponed: true,
      completed: false,
      choice_id: choiceId,
      choice_title: "Trì Hoãn Quyết Định & Tiếp Tục Quan Sát",
      narration: "Bạn quyết định tạm thời giữ nguyên hiện trạng, không vội vàng cam kết khi chưa sẵn sàng. Hãy tiếp tục quan sát và tích lũy thêm trải nghiệm.",
      commitments: character.commitments || [],
      character_state: stateOf(character)
    };
  }

  if (character.scenario_resolutions?.[scenario.id]) {
    if (choiceId && choiceId !== character.scenario_resolutions[scenario.id].choice_id) {
      throw new Error('Kịch bản này đã được hoàn thành với lựa chọn khác.');
    }
    return { ...character.scenario_resolutions[scenario.id], replayed: true };
  }

  const choice = scenario.choices.find(c => c.id === choiceId);
  if (!choice) throw new Error(`Lựa chọn '${choiceId}' không hợp lệ trong kịch bản này.`);

  const before = stateOf(character);
  const cost = Number(choice.cost_ap ?? 0) + Number(apInvestment ?? 0);
  if ((character.action_points ?? 0) < cost) {
    throw new Error(`Cần ${cost} AP để chọn phương án này.`);
  }

  // Calculate missing knowledge penalty
  let missingCount = 0;
  if (Array.isArray(choice.knowledge_requirements) && choice.knowledge_requirements.length > 0) {
    const known = new Set(character.knowledge_base ?? []);
    missingCount = choice.knowledge_requirements.filter(k => !known.has(k)).length;
  }

  let roll = null;
  let tier = 'success';

  if (choice.check) {
    const dc = Number(choice.check.target_dc ?? 12) + (missingCount * 2);
    const d20 = Math.floor(Math.random() * 20) + 1;
    const normalize = t => typeof t === 'string' ? t.toLowerCase().replace(/[\s-]+/g, '_').trim() : '';
    const traits = new Set((character.innate_traits ?? []).map(normalize));
    const traitBonus = [...new Set((choice.check.bonus_traits ?? []).map(normalize))].filter(t => traits.has(t)).length * 2;

    const stat = choice.check.stat;
    const statValue = stat === 'VITALITY' ? (character.vitality ?? 0) :
      (stat === 'EQ' || stat === 'CHARISMA') ? (character.eq ?? character.charisma ?? 100) : (character.iq ?? 100);
    const statBonus = statValue > (stat === 'VITALITY' ? 85 : 110) ? 2 : 1;

    const apBonus = apInvestment * 2;
    const total = d20 + traitBonus + statBonus + apBonus;

    tier = d20 === 20 || total >= dc + 5 ? 'critical_success' : total >= dc ? 'success' : 'failure';
    if (tier === 'critical_success' && !choice.outcomes?.critical_success) tier = 'success';

    roll = {
      d20_base: d20,
      trait_bonus: traitBonus,
      stat_bonus: statBonus,
      ap_bonus: apBonus,
      total_score: total,
      target_dc: dc,
      result_tier: tier
    };
  }

  const outcome = choice.outcomes?.[tier] ?? choice.outcomes?.success ?? {};
  const effects = outcome.effects ?? choice.effects ?? {};

  character.action_points = Math.max(0, (character.action_points ?? 0) - cost);
  if (character.active_dilemma?.id === scenario.id) {
    character.active_dilemma.is_resolved = true;
  }

  if (effects.cash_delta !== undefined) {
    let cashChange = Number(effects.cash_delta);
    if (safeguardTerm === 'deposit' && cashChange > 0) {
      cashChange = Math.round(cashChange * 1.1); // +10% cash bonus when demanding advance deposit
    }
    character.cash = Math.max(0, Number(character.cash ?? 0) + cashChange);
  }

  if (effects.vitality_delta !== undefined) {
    character.vitality = clamp((character.vitality ?? 0) + Number(effects.vitality_delta), 0, character.max_vitality ?? 100);
  }

  if (effects.burnout_delta !== undefined) {
    let burnoutChange = Number(effects.burnout_delta);
    if (safeguardTerm === 'penalty' && burnoutChange > 0) {
      burnoutChange = Math.max(0, Math.round(burnoutChange * 0.7)); // -30% burnout when enforcing penalty clause
    }
    character.burnout = clamp((character.burnout ?? 0) + burnoutChange, 0, 100);
  }

  if (effects.karma_delta !== undefined) {
    character.karma = clamp((character.karma ?? 0) + Number(effects.karma_delta), 0, 100);
  }

  // Handle Delayed Domino Fuses from outcome
  const domino = outcome.delayed_domino || effects.delayed_domino;
  if (domino) {
    character.delayed_flags ??= [];
    character.delayed_flags.push({
      ...domino,
      trigger_at_age: (character.age ?? 28) + (domino.in_years ?? 2)
    });
  }

  const npcUpdates = [];
  for (const [name, delta] of Object.entries(outcome.npc_trust_delta ?? {})) {
    const npc = npcs.find(n => n.name === name && n.status !== 'deceased');
    if (npc) {
      npc.trust = clamp((npc.trust ?? 50) + delta, 0, 100);
      npcUpdates.push(npc);
    }
  }

  character.commitments ??= [];
  const promises = tier === 'failure' ? [] : [...(choice.commitments ?? []), ...(outcome.commitments ?? [])];
  promises.forEach((p, i) => {
    const item = typeof p === 'string' ? { title: p, to_npc: 'Bản thân', due_ticks: 1 } : p;
    const id = `${scenario.id}:${item.id ?? choice.id + ':' + i}`;
    if (!character.commitments.some(c => c.id === id)) {
      character.commitments.push({
        ...item,
        id,
        scenario_id: scenario.id,
        status: 'active',
        created_age: character.age ?? 0,
        due_age: (character.age ?? 0) + (item.due_ticks ?? 1)
      });
    }
  });

  const flags = new Set(character.hidden_flags ?? []);
  flags.add(`choice:${choice.id}`);
  flags.add(`scenario_resolved:${scenario.id}`);
  if (scenario.completion_flag) flags.add(scenario.completion_flag);
  character.hidden_flags = [...flags];

  const narration = outcome.narration ?? choice.description;
  character.history_log ??= [];
  character.history_log.push({
    age: character.age ?? 0,
    scenario_id: scenario.id,
    event: scenario.title,
    choice: choice.title,
    outcome_tier: tier,
    narration,
    roll
  });

  const result = {
    success: true,
    completed: true,
    scenario_id: scenario.id,
    choice_id: choice.id,
    choice_title: choice.title,
    outcome_key: tier,
    narration,
    effects,
    roll,
    npc_updates: npcUpdates,
    changes: Object.fromEntries(Object.keys(before).map(k => [k, { before: before[k], after: stateOf(character)[k] }])),
    commitments: character.commitments,
    character_state: stateOf(character)
  };

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