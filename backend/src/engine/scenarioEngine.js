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

export function getCurrentScenarioForCharacter(character) {
  if (scenarioIndex.size === 0) loadAllContentPacks();

  // Check if character already has an active scenario
  const activeId = character?.hidden_flags?.find(f => typeof f === 'string' && f.startsWith('active_scenario:'))?.split(':')[1];
  if (activeId && scenarioIndex.has(activeId)) {
    return scenarioIndex.get(activeId);
  }

  // Default to Chapter 1 "Giữ nghề hay đổi đời"
  const defaultScenario = scenarioIndex.get('scenario_career_crossroads_28');
  return defaultScenario || Array.from(scenarioIndex.values())[0] || null;
}

export function interactWithHotspot(character, sceneId, hotspotId, npcs = []) {
  const scenario = getCurrentScenarioForCharacter(character);
  if (!scenario) throw new Error("Không tìm thấy kịch bản khả dụng.");

  const scene = scenario.scenes.find(s => s.id === sceneId);
  if (!scene) throw new Error(`Không tìm thấy cảnh 2D: ${sceneId}`);

  const hotspot = scene.hotspots.find(h => h.id === hotspotId);
  if (!hotspot) throw new Error(`Không tìm thấy điểm tương tác: ${hotspotId}`);

  const dialogue = hotspot.dialogue || {};
  const costAp = Number(dialogue.cost_ap || 0);

  if (costAp > 0 && (character.action_points || 0) < costAp) {
    throw new Error(`Bạn cần tối thiểu ${costAp} Điểm Hành Động (AP) để thực hiện hành động này.`);
  }

  // Deduct AP if needed
  if (costAp > 0) {
    character.action_points = Math.max(0, (character.action_points || 3) - costAp);
  }

  // Handle Knowledge Granting
  if (!Array.isArray(character.knowledge_base)) {
    character.knowledge_base = [];
  }
  let newlyDiscoveredKnowledge = null;
  if (dialogue.granted_knowledge && !character.knowledge_base.includes(dialogue.granted_knowledge)) {
    character.knowledge_base.push(dialogue.granted_knowledge);
    newlyDiscoveredKnowledge = dialogue.granted_knowledge;
  }

  // Handle NPC Affinity / Trust Delta
  let affectedNpc = null;
  if (hotspot.npc_role && npcs.length > 0) {
    const roleLower = hotspot.npc_role.toLowerCase();
    const npc = npcs.find(n => n.role?.toLowerCase().includes(roleLower) || n.name?.toLowerCase().includes(roleLower));
    if (npc) {
      if (typeof npc.trust !== 'number') npc.trust = 50;
      if (typeof npc.affinity !== 'number') npc.affinity = 50;

      if (dialogue.affinity_delta) {
        npc.affinity = Math.max(-100, Math.min(100, npc.affinity + dialogue.affinity_delta));
      }
      if (dialogue.trust_delta) {
        npc.trust = Math.max(0, Math.min(100, npc.trust + dialogue.trust_delta));
      }

      if (!Array.isArray(npc.known_facts)) npc.known_facts = [];
      if (dialogue.granted_knowledge && !npc.known_facts.includes(dialogue.granted_knowledge)) {
        npc.known_facts.push(dialogue.granted_knowledge);
      }

      affectedNpc = npc;
    }
  }

  // Handle Scene Position Memory
  character.current_scene_id = sceneId;

  return {
    success: true,
    speaker: dialogue.speaker || hotspot.label,
    text: dialogue.text || "",
    granted_knowledge: newlyDiscoveredKnowledge,
    ap_remaining: character.action_points,
    affected_npc: affectedNpc,
    knowledge_base: character.knowledge_base
  };
}

export function resolveMindStageChoice(character, choiceId, apInvestment = 0, npcs = []) {
  const scenario = getCurrentScenarioForCharacter(character);
  if (!scenario) throw new Error("Không tìm thấy kịch bản khả dụng.");

  const choice = scenario.choices.find(c => c.id === choiceId);
  if (!choice) throw new Error(`Lựa chọn '${choiceId}' không hợp lệ trong tình huống này.`);

  // 1. Verify Knowledge Requirements
  if (Array.isArray(choice.knowledge_requirements) && choice.knowledge_requirements.length > 0) {
    const currentKnowledge = new Set(character.knowledge_base || []);
    const missing = choice.knowledge_requirements.filter(k => !currentKnowledge.has(k));
    if (missing.length > 0) {
      throw new Error(`Bạn chưa có đủ thông tin để đưa ra lựa chọn này. Hãy khám phá thêm manh mối trong các cảnh! (Thiếu: ${missing.join(', ')})`);
    }
  }

  // 2. Verify and Deduct Action Points
  const totalApCost = Number(choice.cost_ap || 0) + Number(apInvestment || 0);
  if ((character.action_points || 0) < totalApCost) {
    throw new Error(`Không đủ Điểm Hành Động. Cần: ${totalApCost} AP, hiện có: ${character.action_points || 0} AP.`);
  }
  character.action_points = Math.max(0, (character.action_points || 0) - totalApCost);

  // 3. Server-side D20 Roll & Bonus Calculation
  let rollBreakdown = null;
  let outcomeKey = "success";

  if (choice.check) {
    const targetDc = Number(choice.check.target_dc || 12);
    // True Server Random D20
    const d20Base = Math.floor(Math.random() * 20) + 1;

    // Trait modifiers
    let traitBonus = 0;
    const characterTraits = Array.isArray(character.innate_traits) ? character.innate_traits : [];
    if (Array.isArray(choice.check.bonus_traits)) {
      choice.check.bonus_traits.forEach(traitName => {
        if (characterTraits.some(t => typeof t === 'string' && t.includes(traitName))) {
          traitBonus += 2;
        }
      });
    }

    // Stat bonus
    let statBonus = 1;
    if (choice.check.stat === "IQ" && (character.iq || 100) > 110) statBonus = 2;
    if (choice.check.stat === "CHARISMA" && (character.eq || 100) > 110) statBonus = 2;
    if (choice.check.stat === "VITALITY" && (character.vitality || 80) > 85) statBonus = 2;

    const apBonus = Number(apInvestment || 0) * 2;
    const totalScore = d20Base + traitBonus + statBonus + apBonus;

    if (d20Base === 20 || totalScore >= targetDc + 5) {
      outcomeKey = "critical_success";
    } else if (totalScore >= targetDc) {
      outcomeKey = "success";
    } else {
      outcomeKey = "failure";
    }

    rollBreakdown = {
      d20_base: d20Base,
      trait_bonus: traitBonus,
      stat_bonus: statBonus,
      ap_bonus: apBonus,
      total_score: totalScore,
      target_dc: targetDc,
      result_tier: outcomeKey
    };
  }

  // 4. Extract and apply outcome effects
  const outcomeData = choice.outcomes?.[outcomeKey] || choice.outcomes?.success || {};
  const effects = outcomeData.effects || choice.effects || {};

  if (effects.cash_delta) {
    character.cash = Math.max(0, Number(character.cash || 0) + Number(effects.cash_delta));
  }
  if (effects.vitality_delta) {
    const maxVit = character.max_vitality || 100;
    character.vitality = Math.max(10, Math.min(maxVit, (character.vitality || 80) + Number(effects.vitality_delta)));
  }
  if (effects.burnout_delta) {
    character.burnout = Math.max(0, Math.min(100, (character.burnout || 0) + Number(effects.burnout_delta)));
  }
  if (effects.karma_delta) {
    character.karma = Math.max(0, Math.min(100, (character.karma || 80) + Number(effects.karma_delta)));
  }

  // 5. Update NPC Trust / Affinity from Outcome
  if (outcomeData.npc_trust_delta && npcs.length > 0) {
    Object.entries(outcomeData.npc_trust_delta).forEach(([npcName, delta]) => {
      const npc = npcs.find(n => n.name.includes(npcName) || n.role.includes(npcName));
      if (npc) {
        if (typeof npc.trust !== 'number') npc.trust = 50;
        npc.trust = Math.max(0, Math.min(100, npc.trust + delta));
      }
    });
  }

  // 6. Record Commitments
  if (!Array.isArray(character.commitments)) character.commitments = [];
  if (Array.isArray(choice.commitments)) {
    choice.commitments.forEach(c => {
      character.commitments.push({
        ...c,
        status: "active",
        created_age: character.age,
        due_age: (character.age || 28) + (c.due_ticks || 1)
      });
    });
  }

  // 7. Record History and Flags
  if (!Array.isArray(character.hidden_flags)) character.hidden_flags = [];
  character.hidden_flags.push(`choice:${choice.id}`);
  character.hidden_flags.push("career_crossroads_resolved");

  if (!Array.isArray(character.history_log)) character.history_log = [];
  character.history_log.push({
    age: character.age || 28,
    event: scenario.title,
    choice: choice.title,
    stance: choice.stance,
    outcome_tier: outcomeKey,
    narration: outcomeData.narration || choice.description,
    roll: rollBreakdown
  });

  return {
    success: true,
    choice_id: choice.id,
    choice_title: choice.title,
    outcome_key: outcomeKey,
    narration: outcomeData.narration || choice.description,
    effects,
    roll: rollBreakdown,
    commitments: character.commitments,
    character_state: {
      cash: character.cash,
      vitality: character.vitality,
      burnout: character.burnout,
      karma: character.karma,
      action_points: character.action_points
    }
  };
}
