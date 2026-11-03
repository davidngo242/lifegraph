// backend/src/content/validator.js

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
