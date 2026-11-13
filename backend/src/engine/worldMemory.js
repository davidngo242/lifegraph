// Doors (irreversible forks), per-bloodline world memory and the epitaph summary (Emergent life, Đợt 4).
// character.doors: {door_id: {open, label, age, persists?, inherited?}}. Legacy shape {door_id: boolean} is migrated on read/write.
// character.world_memory: {bloodline_id, generation, npc_memories[], doors{}, inherited_knowledge[]} carried by /rebirth and /rebirth/heir.
import { loadSeedDictionaries } from '../content/seeds.js';
import { addCastMemory } from './npcEngine.js';

export const PERSISTENT_TAGS = ['grudge', 'debt', 'benefactor'];
export const WORLD_NPC_MEMORY_MAX = 24;
export const EPITAPH_SUMMARY_MAX = 200; // same as the shared-lineage epitaph limit; never exceed it
const LEGACY_FLAG_KNOWLEDGE = { early_will_established: 'di_chuc_gia_toc', written_memoir: 'hoi_ky_tien_nhan', mentored_heir: 'loi_day_tien_nhan' };

const humanize = id => String(id).replace(/[_-]+/g, ' ').trim();
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

/** Return doors in the current shape without touching the input. Legacy booleans get age null (unknown). */
export function normalizeDoors(doors) {
  const out = {};
  if (!isObj(doors)) return out;
  for (const [id, v] of Object.entries(doors)) {
    if (isObj(v)) out[id] = { ...v, open: v.open !== false, label: typeof v.label === 'string' && v.label ? v.label : humanize(id), age: Number.isFinite(v.age) ? v.age : null };
    else out[id] = { open: v !== false, label: humanize(id), age: null };
  }
  return out;
}

/** Apply locks/unlocks of a scenario and of the chosen choice, with label + age. `persist_doors` marks doors that outlive this life. */
export function applyDoors(character, scenario, choice) {
  const locks = [...(scenario.locks ?? []), ...(choice?.locks ?? [])];
  const unlocks = [...(scenario.unlocks ?? []), ...(choice?.unlocks ?? [])];
  if (!locks.length && !unlocks.length) return;
  const labels = { ...(scenario.door_labels ?? {}), ...(choice?.door_labels ?? {}) };
  const persist = new Set([...(scenario.persist_doors ?? []), ...(choice?.persist_doors ?? [])]);
  const doors = normalizeDoors(character.doors);
  const set = (id, open) => {
    doors[id] = { ...(doors[id] ?? {}), open, label: labels[id] ?? doors[id]?.label ?? humanize(id), age: character.age ?? 0 };
    if (persist.has(id)) doors[id].persists = true;
  };
  for (const id of locks) set(id, false);
  for (const id of unlocks) set(id, true);
  character.doors = doors;
}

const tagsOf = m => (m?.tags ?? [m?.tag]).filter(Boolean);
const isPersistent = m => m?.persist === true || tagsOf(m).some(t => PERSISTENT_TAGS.includes(t));

/** Knowledge a life leaves behind: `legacy:<tag>` flags, will/memoir flags, plus everything it inherited itself. */
export function collectInheritedKnowledge(parent) {
  const out = new Set(parent?.world_memory?.inherited_knowledge ?? []);
  for (const f of parent?.hidden_flags ?? []) {
    if (typeof f !== 'string') continue;
    if (f.startsWith('legacy:') && f.length > 7) out.add(f.slice(7));
    else if (LEGACY_FLAG_KNOWLEDGE[f]) out.add(LEGACY_FLAG_KNOWLEDGE[f]);
  }
  return [...out].filter(k => typeof k === 'string' && k).map(k => k.slice(0, 60)).slice(-32);
}

/** Build the child's world_memory from the parent life and attach it to the (already generated) new character. Mutates `child`. */
export function applyWorldMemory(child, parent) {
  if (!parent || !child) return child;
  const prev = parent.world_memory ?? {};
  const generation = parent.generation ?? 1;
  const memories = [...(prev.npc_memories ?? [])];
  const seen = new Set(memories.map(m => `${m.role}|${m.tag}|${m.text}`));
  for (const npc of parent.cast ?? []) {
    for (const m of npc.memory ?? []) {
      if (m.lineage || !isPersistent(m)) continue;
      const tags = tagsOf(m).filter(t => PERSISTENT_TAGS.includes(t) || m.persist === true);
      for (const tag of (tags.length ? tags : [m.tag])) {
        const text = m.tag === 'tom_tat' ? '' : (m.text ?? '');
        const key = `${npc.role}|${tag}|${text}`;
        if (seen.has(key)) continue;
        seen.add(key);
        memories.push({ role: npc.role, npc_name: npc.name, tag, text, life_generation: generation });
      }
    }
  }
  const doors = { ...normalizeDoors(prev.doors) };
  for (const [id, d] of Object.entries(normalizeDoors(parent.doors))) if (d.persists) doors[id] = { ...d, inherited: true };
  const knowledge = collectInheritedKnowledge(parent);

  const world = {
    bloodline_id: prev.bloodline_id ?? parent.id,
    generation: generation + 1,
    npc_memories: memories.slice(-WORLD_NPC_MEMORY_MAX),
    doors: Object.fromEntries(Object.entries(doors).slice(-40)),
    inherited_knowledge: knowledge
  };
  child.world_memory = world;
  child.doors = { ...normalizeDoors(child.doors), ...doors };
  // Re-attach to the same role in the new cast with a one-line lineage note.
  for (const m of world.npc_memories) {
    const note = `Từ đời trước (${m.npc_name ?? 'một người quen'}, đời ${m.life_generation}): ${m.text || humanize(m.tag)}`;
    const npc = addCastMemory(child, m.role, { tag: m.tag, text: note }, 0);
    const added = npc?.memory?.[npc.memory.length - 1];
    if (added && added.tag === m.tag) added.lineage = true;
  }
  const flags = new Set(child.hidden_flags ?? []);
  for (const k of knowledge) flags.add(`inherited:${k}`);
  child.hidden_flags = [...flags];
  return child;
}

const FOCUS_LABEL = { career: 'sự nghiệp', family: 'gia đình', health: 'sức khỏe', learning: 'học hỏi', experience: 'trải nghiệm' };
const stripTail = s => String(s ?? '').replace(/^\s*\[[^\]]*\]\s*/, '').replace(/\s+/g, ' ').replace(/[.:;,\s]+$/, '').trim();

/** Up to 3 Vietnamese sentences (<= EPITAPH_SUMMARY_MAX chars) for the memorial; safe for legacy characters. */
export function buildEpitaphSummary(character) {
  try {
    const c = character ?? {};
    const name = stripTail(c.name) || 'Người này';
    const age = c.death_age ?? c.age;
    const sentences = [age != null ? `${name} đã sống ${age} năm.` : `${name} đã đi hết một đời.`];

    const closed = Object.values(normalizeDoors(c.doors)).filter(d => d.open === false && !d.inherited).map(d => stripTail(d.label)).filter(Boolean);
    const counts = {};
    for (const h of Array.isArray(c.focus_history) ? c.focus_history : []) if (FOCUS_LABEL[h?.focus]) counts[h.focus] = (counts[h.focus] ?? 0) + 1;
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const fate = loadSeedDictionaries().fate_thread.find(f => f.id === c.life_seed?.fate_thread)?.label;
    const log = Array.isArray(c.history_log) ? c.history_log : [];
    const win = [...log].reverse().find(e => e?.scenario_id && (e.outcome_tier === 'success' || e.outcome_tier === 'critical_success') && stripTail(e.event));

    const tail = [];
    if (closed.length) tail.push(`đã khép lại ${closed.slice(0, 2).join(' và ')}`);
    if (win) tail.push(`để lại dấu ấn "${stripTail(win.event)}"`);
    if (top) sentences.push(`Nhiều năm nhất, người dốc lòng cho ${FOCUS_LABEL[top]}${fate ? `, mang theo "${fate}"` : ''}.`);
    else if (fate) sentences.push(`Cả đời mang theo "${fate}".`);
    if (tail.length) sentences.push(`Người ${tail.join(', ')}.`);

    let out = sentences.slice(0, 3);
    while (out.join(' ').length > EPITAPH_SUMMARY_MAX && out.length > 1) out = out.slice(0, -1);
    const text = out.join(' ');
    return text.length > EPITAPH_SUMMARY_MAX ? text.slice(0, EPITAPH_SUMMARY_MAX - 1).trimEnd() + '…' : text;
  } catch {
    return 'Một đời người đã khép lại.';
  }
}
