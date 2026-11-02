import crypto from 'crypto';
import {
  stateToVector,
  calculateCosineSimilarity,
  filterViableScenarios,
  recordExperiencedScenario
} from './antiLoopEngine.js';
import { SCENARIO_MATRIX, generateMillionProceduralScenario } from './scenarioBank.js';

export async function generateDilemma(systemPrompt, character, assets, relationships) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const totalAssets = (assets || []).reduce((sum, a) => sum + Number(a.current_value || 0), 0);
  const netWorth = (Number(character.cash) || 0) + totalAssets;

  // 1. Try Live LLM if API Key is configured
  if (apiKey) {
    try {
      console.log(`🤖 [AI Game Master V5] Calling Gemini API (${model})...`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.92
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const parsed = JSON.parse(candidateText);
          parsed.id = crypto.randomUUID();
          parsed.source = "Gemini Live AI";
          parsed.visual_vibe = determineVisualVibe(character, netWorth);
          const normalized = normalizeInteractionData(parsed);
          recordExperiencedScenario(character, normalized);
          return normalized;
        }
      }
    } catch (err) {
      console.warn('⚠️ [AI Game Master] Gemini fallback to Vector Retrieval Engine:', err.message);
    }
  }

  // 2. Vector Retrieval Engine (< 100ms response time, Age-Gated & Anti-Loop Guaranteed)
  return retrieveVectorScenario(character, netWorth);
}

function retrieveVectorScenario(character, netWorth) {
  const charVector = stateToVector(character, netWorth);
  const bannedTags = new Set(character.recent_event_tags || []);

  // 1. Initialize & Track Sine Wave Pacing System
  if (!character.pacing_state) {
    character.pacing_state = {
      cycle_turn: ((character.age || 18) % 5) + 1,
      turns_since_major: 3
    };
  } else {
    character.pacing_state.cycle_turn = ((character.age || 18) % 5) + 1;
    character.pacing_state.turns_since_major = (character.pacing_state.turns_since_major || 0) + 1;
  }

  const cycleTurn = character.pacing_state.cycle_turn;
  const turnsSinceMajor = character.pacing_state.turns_since_major;

  // Sine Wave Mapping:
  // Turn 1 & 2: Standard (0-1 AP) or Spectrum (Time/Work allocation)
  // Turn 3: Tension / Minor Crisis (Illusion, Spectrum or Standard with tension)
  // Turn 4: Climax (Trilemma - Destiny Event), strictly ensured turnsSinceMajor >= 3
  // Turn 5: Cooldown / Time-Skip (Peaceful reflection & consequence settling)
  let preferredType = "STANDARD";
  if (cycleTurn === 1 || cycleTurn === 2) {
    preferredType = Math.random() < 0.45 ? "SPECTRUM" : "STANDARD";
  } else if (cycleTurn === 3) {
    // Diversify Tension Phase: don't force only ILLUSION, allow variety
    const tensionRand = Math.random();
    preferredType = tensionRand < 0.35 ? "ILLUSION" : tensionRand < 0.70 ? "SPECTRUM" : "STANDARD";
  } else if (cycleTurn === 4 && turnsSinceMajor >= 3 && (character.age || 0) >= 18) {
    preferredType = "TRILEMMA";
  } else if (cycleTurn === 5) {
    preferredType = Math.random() < 0.55 ? "TIME_SKIP" : "STANDARD";
  }

  // Filter out invalid age, recent tags, or once-in-a-lifetime duplicates
  const candidates = filterViableScenarios(SCENARIO_MATRIX, character);

  let chosenScenario = null;

  if (candidates.length > 0) {
    // Rank by Cosine Similarity + Sine Wave Preference + Aspiration Resonance
    let highestScore = -Infinity;

    for (const item of candidates) {
      const baseSim = calculateCosineSimilarity(charVector, item.target_vector);
      // Slight jitter prevents deterministic locks when vectors are close
      const jitter = (Math.random() * 0.10) - 0.05;
      let finalScore = baseSim + jitter;

      // A. Sine Wave Pacing affinity
      if (item.interaction_type === preferredType) {
        finalScore += 0.38;
      } else if (preferredType === "TRILEMMA" && item.interaction_type !== "TRILEMMA") {
        finalScore -= 0.35;
      }

      // B. Aspiration Resonance (+0.45 score bonus for matching aspiration)
      const charAspiration = character.life_aspiration;
      if (charAspiration && item.aspiration_tags) {
        if (
          item.aspiration_tags.includes(charAspiration) ||
          item.aspiration_tags.includes("all") ||
          (charAspiration === "young_scholar" && item.aspiration_tags.includes("scholar_sage")) ||
          (charAspiration === "first_pot_of_gold" && item.aspiration_tags.includes("empire_builder")) ||
          (charAspiration === "survivor_redemption" && item.aspiration_tags.includes("adversity_phoenix"))
        ) {
          finalScore += 0.45;
        }
      }

      if (finalScore > highestScore) {
        highestScore = finalScore;
        chosenScenario = item;
      }
    }
  }

  // If no static scenario matches or all age candidates exhausted, generate procedural scenario
  if (!chosenScenario) {
    chosenScenario = generateMillionProceduralScenario(character, netWorth, bannedTags);
  }

  // If Trilemma triggered, reset turns_since_major to guarantee spacing
  if (chosenScenario.interaction_type === "TRILEMMA") {
    character.pacing_state.turns_since_major = 0;
  }

  // Deep clone and customize with dynamic amounts
  const scale = (r) => Math.round((Math.max(10000, netWorth) * r) / 100) * 100;
  const result = JSON.parse(JSON.stringify(chosenScenario));
  result.id = result.id || crypto.randomUUID();
  result.source = "Million-Vector Engine (<20ms)";
  result.visual_vibe = determineVisualVibe(character, netWorth);

  // Dynamic scale adjustments if Trilemma (Only adjust generic choices, never override authored scholarships or non-cash sacrifices)
  if (result.interaction_type === "TRILEMMA" && result.trilemma_options) {
    result.trilemma_options.forEach(opt => {
      // Only apply cash loss if this option explicitly sacrifices cash
      if (opt.sacrifice_type === "cash" && opt.effects && typeof opt.effects.cash_delta === 'number') {
        const lossCash = Math.max(10000, scale(0.12));
        opt.effects.cash_delta = -lossCash;
      }
    });
  }

  const normalized = normalizeInteractionData(result);
  recordExperiencedScenario(character, normalized);
  return normalized;
}

function determineVisualVibe(character, netWorth) {
  if (character.burnout > 80 || character.cash < 0) {
    return {
      background_scene: "rain_glass", // Cold melancholic rain on window
      audio_ambient: "rain_rumble",
      camera_drift: "slow_sink"
    };
  }
  if (netWorth > 1000000) {
    return {
      background_scene: "city_night", // Highrise skyline lights
      audio_ambient: "ambient_city",
      camera_drift: "pan_upward"
    };
  }
  if (character.vitality < 35 || character.age > 70) {
    return {
      background_scene: "golden_sunset", // Twilight of life
      audio_ambient: "wind_chimes",
      camera_drift: "slow_zoom"
    };
  }
  return {
    background_scene: "cyber_dusk",
    audio_ambient: "calm_hum",
    camera_drift: "steady_float"
  };
}

function normalizeInteractionData(data) {
  const type = data.interaction_type || "STANDARD";
  return {
    id: data.id || crypto.randomUUID(),
    interaction_type: type,
    tag: data.tag || data.event_tag || "general_life",
    title: data.title || "Bước Ngoặt Cuộc Đời",
    narrative: data.narrative || "Thời gian lặng lẽ trôi qua mang theo những đổi thay không ngờ.",
    spectrum_data: data.spectrum_data || null,
    illusion_data: data.illusion_data || null,
    trilemma_options: data.trilemma_options || null,
    time_skip_data: data.time_skip_data || null,
    options: data.options || null,
    visual_vibe: data.visual_vibe || { background_scene: "cyber_dusk" },
    source: data.source || "Procedural Engine"
  };
}
