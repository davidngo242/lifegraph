// backend/src/content/validator.js

const SEED_DICTIONARIES = ['era', 'family_state', 'fate_thread', 'temperament', 'cast_roles'];

/** Validate the life-seed dictionaries (content/seeds/*.json). `dicts` is an array of parsed files. */
export function validateSeedDictionaries(dicts) {
  const errors = [];
  const byName = {};
  for (const d of Array.isArray(dicts) ? dicts : []) {
    const path = `Seed[${d?.dictionary ?? 'unnamed'}]`;
    if (!d || !SEED_DICTIONARIES.includes(d.dictionary)) { errors.push(`${path}: Unknown dictionary name.`); continue; }
    if (byName[d.dictionary]) errors.push(`${path}: Duplicate dictionary.`);
    byName[d.dictionary] = d;
    if (!Array.isArray(d.values) || d.values.length === 0) { errors.push(`${path}: values must be a non-empty array.`); continue; }
    const ids = new Set();
    d.values.forEach((v, i) => {
      if (!v?.id || typeof v.id !== 'string') errors.push(`${path}.values[${i}]: Missing id.`);
      else if (ids.has(v.id)) errors.push(`${path}.values[${i}]: Duplicate id '${v.id}'.`);
      else ids.add(v.id);
      if (!v?.label) errors.push(`${path}.values[${i}]: Missing label.`);
      if (!(Number(v?.weight) > 0)) errors.push(`${path}.values[${i}]: weight must be a positive number.`);
    });
  }
  for (const name of SEED_DICTIONARIES) if (!byName[name]) errors.push(`Missing seed dictionary '${name}'.`);
  if (byName.era) {
    for (const required of ['any', 'lang_hau_chien'])
      if (!byName.era.values?.some(v => v.id === required)) errors.push(`Seed[era]: must contain '${required}'.`);
    for (const v of byName.era.values ?? []) {
      if (!Array.isArray(v.names?.surnames) || !v.names.surnames.length || !Array.isArray(v.names?.given) || !v.names.given.length)
        errors.push(`Seed[era].${v.id}: names.surnames and names.given are required.`);
    }
  }
  const roles = new Set((byName.cast_roles?.values ?? []).map(v => v.id));
  for (const v of byName.cast_roles?.values ?? []) {
    for (const k of ['traits', 'goals', 'secrets'])
      if (!Array.isArray(v[k]) || !v[k].length) errors.push(`Seed[cast_roles].${v.id}: ${k} must be a non-empty array.`);
  }
  for (const v of byName.fate_thread?.values ?? []) {
    if (v.cast_secret && (!roles.has(v.cast_secret.role) || !v.cast_secret.secret))
      errors.push(`Seed[fate_thread].${v.id}: cast_secret needs a known role and a secret.`);
  }
  return { valid: errors.length === 0, errors };
}

/** Optional storylet fields: era, requires_npc, fate_thread, min_quality, weight, cooldown_years, group, locks, unlocks. */
function validateStoryletFields(sc, scPath, errors) {
  const p = sc.prerequisites ?? {};
  const strArray = v => Array.isArray(v) && v.every(x => typeof x === 'string');
  if (p.era !== undefined && !(strArray(p.era) && p.era.length)) errors.push(`${scPath}: prerequisites.era must be a non-empty string array.`);
  if (p.fate_thread !== undefined && typeof p.fate_thread !== 'string') errors.push(`${scPath}: prerequisites.fate_thread must be a string.`);
  if (p.requires_npc !== undefined) {
    const r = p.requires_npc;
    if (!r || typeof r !== 'object' || typeof r.role !== 'string' || (r.memory_has !== undefined && typeof r.memory_has !== 'string'))
      errors.push(`${scPath}: prerequisites.requires_npc must be {role: string, memory_has?: string}.`);
  }
  const mq = p.min_quality;
  if (mq !== undefined && (!mq || typeof mq !== 'object' || Array.isArray(mq) || !Object.values(mq).every(Number.isFinite)))
    errors.push(`${scPath}: prerequisites.min_quality must map names to numbers.`);
  if (sc.weight !== undefined && !(Number.isFinite(sc.weight) && sc.weight > 0)) errors.push(`${scPath}: weight must be a positive number.`);
  if (sc.cooldown_years !== undefined && !(Number.isInteger(sc.cooldown_years) && sc.cooldown_years >= 0)) errors.push(`${scPath}: cooldown_years must be a non-negative integer.`);
  if (sc.group !== undefined && typeof sc.group !== 'string') errors.push(`${scPath}: group must be a string.`);
  for (const k of ['locks', 'unlocks'])
    if (sc[k] !== undefined && !strArray(sc[k])) errors.push(`${scPath}: ${k} must be a string array.`);
}

export function validateContentPack(pack) {
  const errors = [];
  const warnings = [];

  if (!pack) {
    return { valid: false, errors: ["Content pack is empty or null."], warnings };
  }

  // Required root fields
  if (!pack.pack_id) errors.push("Missing pack_id.");
  if (!pack.name) errors.push("Missing pack name.");
  if (!pack.version) errors.push("Missing pack version.");
  if (!Array.isArray(pack.scenarios)) {
    errors.push("Scenarios must be an array.");
    return { valid: false, errors, warnings };
  }

  const scenarioIds = new Set();
  const allKnowledgeProvided = new Set();
  const allKnowledgeRequired = new Set();

  pack.scenarios.forEach((sc, idx) => {
    const scPath = `Scenario[${idx}] (${sc.id || 'unnamed'})`;

    if (!sc.id) errors.push(`${scPath}: Missing id.`);
    else if (scenarioIds.has(sc.id)) errors.push(`${scPath}: Duplicate scenario ID '${sc.id}'.`);
    else scenarioIds.add(sc.id);

    if (!sc.title) errors.push(`${scPath}: Missing title.`);
    validateStoryletFields(sc, scPath, errors);
    if (!Array.isArray(sc.scenes) || sc.scenes.length === 0) {
      errors.push(`${scPath}: Must have at least one 2D scene.`);
    } else {
      const sceneIds = new Set();
      sc.scenes.forEach((scene, sIdx) => {
        const scenePath = `${scPath}.Scene[${sIdx}] (${scene.id || 'unnamed'})`;
        if (!scene.id) errors.push(`${scenePath}: Missing scene id.`);
        else if (sceneIds.has(scene.id)) errors.push(`${scenePath}: Duplicate scene id '${scene.id}'.`);
        else sceneIds.add(scene.id);

        if (!Array.isArray(scene.hotspots) || scene.hotspots.length === 0) {
          warnings.push(`${scenePath}: Scene has no interactive hotspots.`);
        } else {
          scene.hotspots.forEach((h, hIdx) => {
            if (h.dialogue?.granted_knowledge) {
              allKnowledgeProvided.add(h.dialogue.granted_knowledge);
            }
          });
        }
      });
    }

    if (!Array.isArray(sc.choices) || sc.choices.length === 0) {
      errors.push(`${scPath}: Scenario must have at least one choice.`);
    } else {
      const choiceIds = new Set();
      sc.choices.forEach((choice, cIdx) => {
        const choicePath = `${scPath}.Choice[${cIdx}] (${choice.id || 'unnamed'})`;
        if (!choice.id) errors.push(`${choicePath}: Missing choice id.`);
        else if (choiceIds.has(choice.id)) errors.push(`${choicePath}: Duplicate choice id '${choice.id}'.`);
        else choiceIds.add(choice.id);

        if (Array.isArray(choice.knowledge_requirements)) {
          choice.knowledge_requirements.forEach(k => allKnowledgeRequired.add(k));
        }

        if (!Number.isInteger(choice.cost_ap ?? 0) || (choice.cost_ap ?? 0) < 0) errors.push(`${choicePath}: Invalid AP cost.`);
        for (const [tier, outcome] of Object.entries(choice.outcomes ?? {})) {
          if (outcome.stat_deltas) errors.push(`${choicePath}.${tier}: Use effects with *_delta keys, not stat_deltas.`);
          for (const [key, value] of Object.entries(outcome.effects ?? {})) {
            if (key === 'delayed_domino') {
              if (typeof value !== 'object' || value === null) {
                errors.push(`${choicePath}.${tier}: delayed_domino must be an object.`);
              }
              continue;
            }
            if (!['cash_delta', 'vitality_delta', 'burnout_delta', 'karma_delta'].includes(key) || !Number.isFinite(value))
              errors.push(`${choicePath}.${tier}: Unsupported or invalid effect '${key}'.`);
          }
        }
        if (choice.check) {
          if (!choice.check.target_dc || choice.check.target_dc < 1) {
            errors.push(`${choicePath}: Target DC must be a positive integer.`);
          }
          if (!choice.outcomes) {
            warnings.push(`${choicePath}: Choice has a check but lacks outcome branch mappings.`);
          }
        }
      });
    }
  });

  // Verify that all required knowledge can actually be discovered
  allKnowledgeRequired.forEach(k => {
    if (!allKnowledgeProvided.has(k)) {
      warnings.push(`Knowledge '${k}' is required by a choice but not granted by any hotspot in this pack.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      pack_id: pack.pack_id,
      version: pack.version,
      scenarios_count: pack.scenarios.length,
      knowledge_nodes: Array.from(allKnowledgeProvided)
    }
  };
}

