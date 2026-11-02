// Anti-Loop & Vector Similarity Matrix Engine (LifeGraph V5 & V6)
// Provides < 100ms retrieval and maintains 15-tag contextual window & Delayed Domino Fuses
// Enforces Once-in-a-Lifetime guarantees and age-bracket filtering

export function calculateCosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Convert character state to normalized 6D vector for similarity matching
export function stateToVector(character, netWorth) {
  const safeAge = typeof character.age === 'number' ? character.age : 20;
  return [
    Math.min(1, safeAge / 100),
    Math.max(0, Math.min(1, (character.vitality || 50) / 100)),
    Math.max(0, Math.min(1, (netWorth + 10000) / 10000000)),
    Math.max(0, Math.min(1, (character.burnout || 0) / 100)),
    Math.max(0, Math.min(1, (character.karma || 0) / 100)),
    ((character.hidden_flags || []).length) / 10
  ];
}

// Filter viable scenarios based on age, once-in-a-lifetime flags, and recent tags
export function filterViableScenarios(scenarioMatrix, character) {
  const bannedTags = new Set(character.recent_event_tags || []);
  const experiencedIds = new Set(character.experienced_scenarios || []);
  const flags = new Set(character.hidden_flags || []);
  const currentAge = typeof character.age === 'number' ? character.age : 20;

  const viable = scenarioMatrix.filter(s => {
    // 1. Age Range Check
    if (s.min_age !== undefined && currentAge < s.min_age) return false;
    if (s.max_age !== undefined && currentAge > s.max_age) return false;

    // 2. Strict ID deduplication: Never repeat any scenario with an ID that has already been experienced in this lifetime
    if (s.id && experiencedIds.has(s.id)) return false;

    // 3. Parent passing specific protection (Can never repeat and impossible at age 62+)
    if (s.tag === "family_bereavement" || s.id === "ill_parent_passing") {
      if (flags.has("parents_deceased") || flags.has("mother_deceased")) return false;
      if (currentAge >= 62) return false;
    }

    // 4. Spouse passing specific protection
    if (s.tag === "spouse_bereavement" || s.id === "ill_spouse_passing") {
      if (flags.has("spouse_deceased")) return false;
    }

    // 5. Anti-Loop 15-tag contextual window check
    if (bannedTags.has(s.tag)) return false;

    return true;
  });

  return viable;
}

// Record experienced scenario and update anti-loop state
export function recordExperiencedScenario(character, dilemma) {
  if (!character.experienced_scenarios) {
    character.experienced_scenarios = [];
  }
  if (dilemma.id && !character.experienced_scenarios.includes(dilemma.id)) {
    character.experienced_scenarios.push(dilemma.id);
  }

  // Set permanent lifecycle flags
  if (!character.hidden_flags) character.hidden_flags = [];
  if (dilemma.id === "ill_parent_passing" || dilemma.tag === "family_bereavement") {
    if (!character.hidden_flags.includes("parents_deceased")) {
      character.hidden_flags.push("parents_deceased");
    }
  }
  if (dilemma.id === "ill_spouse_passing" || dilemma.tag === "spouse_bereavement") {
    if (!character.hidden_flags.includes("spouse_deceased")) {
      character.hidden_flags.push("spouse_deceased");
    }
  }

  // Update FIFO tag window
  const tag = dilemma.tag || dilemma.event_tag;
  if (tag) {
    character.recent_event_tags = updateEventTagWindow(character, tag);
  }
}

// Check and detonate any Delayed Domino Fuses for current age
export function checkDelayedDominoFuses(character) {
  const delayedFlags = character.delayed_flags || [];
  const triggered = [];
  const remaining = [];

  for (const fuse of delayedFlags) {
    if (character.age >= fuse.trigger_at_age) {
      triggered.push(fuse);
    } else {
      remaining.push(fuse);
    }
  }

  return { triggered, remaining };
}

// Maintain 15-event anti-loop memory window (FIFO)
export function updateEventTagWindow(character, newTag) {
  let windowTags = [...(character.recent_event_tags || [])];
  if (newTag) {
    // If tag already exists, move it to the end
    windowTags = windowTags.filter(t => t !== newTag);
    windowTags.push(newTag);
  }
  // Keep last 15 tags
  while (windowTags.length > 15) {
    windowTags.shift();
  }
  return windowTags;
}
