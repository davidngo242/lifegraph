import { getRandom } from './rng.js';
import crypto from 'crypto';
import { loadSeedDictionaries } from '../content/seeds.js';

export function initializeStartingNpcs(character) {
  const npcs = [];

  // Starting childhood / youth friend or mentor
  npcs.push({
    id: crypto.randomUUID(),
    character_id: character.id,
    name: "Lê Hoàng",
    role: "Bạn nối khố / Đồng nghiệp đầu đời",
    status: "alive",
    affinity: 75,
    memory_notes: "Cùng nhau lớn lên và chia sẻ từng chiếc bánh mì thời thiếu thốn.",
    last_encountered_age: character.age,
    avatar_color: "#38bdf8"
  });

  if (character.background_type === "super_rich") {
    npcs.push({
      id: crypto.randomUUID(),
      character_id: character.id,
      name: "Trần Hùng",
      role: "Quản gia gia tộc / Người giám sát",
      status: "alive",
      affinity: 40,
      memory_notes: "Luôn nghiêm khắc theo dõi từng bước đi và tài chính của bạn.",
      last_encountered_age: character.age,
      avatar_color: "#fbbf24"
    });
  } else {
    npcs.push({
      id: crypto.randomUUID(),
      character_id: character.id,
      name: "Bác Ba 'Cơm Tấm'",
      role: "Ân nhân xóm nghèo",
      status: "alive",
      affinity: 85,
      memory_notes: "Từng cho bạn ăn nợ nhiều tháng liền khi gia đình khánh kiệt.",
      last_encountered_age: character.age,
      avatar_color: "#34d399"
    });
  }

  return npcs;
}

// ---------------------------------------------------------------------------
// Cast: 6-8 persistent NPCs per life, generated from the life seed (character.cast).
// Entry: {id, role, name, trait, goal, secret, memory:[{age, tag, text}]}.
// ---------------------------------------------------------------------------
export const CAST_MEMORY_MAX = 12;

const pick = (arr) => arr[Math.min(arr.length - 1, Math.floor(getRandom() * arr.length))];

export function generateCast(lifeSeed) {
  const d = loadSeedDictionaries();
  const era = d.era.find(e => e.id === lifeSeed.era) ?? d.era.find(e => e.id === 'any');
  const fate = d.fate_thread.find(f => f.id === lifeSeed.fate_thread);
  const roles = ['mentor', 'rival', 'love', 'creditor_or_benefactor', 'friend', 'family'];
  if (getRandom() < 0.5) roles.push('friend');
  if (getRandom() < 0.5) roles.push('family');
  const used = new Set();
  const counts = {};
  return roles.map(role => {
    const def = d.cast_roles.find(r => r.id === role);
    let name;
    do { name = `${pick(era.names.surnames)} ${pick(era.names.given)}`; } while (used.has(name));
    used.add(name);
    counts[role] = (counts[role] ?? 0) + 1;
    const npc = { id: `cast_${role}_${counts[role]}`, role, name, trait: pick(def.traits), goal: pick(def.goals), secret: pick(def.secrets), memory: [] };
    if (fate?.cast_secret?.role === role && counts[role] === 1) npc.secret = fate.cast_secret.secret;
    if (role === 'creditor_or_benefactor') npc.stance = lifeSeed.family_state === 'no_nan' ? 'creditor' : (getRandom() < 0.5 ? 'creditor' : 'benefactor');
    if (role === 'family' && lifeSeed.family_state === 'con_nuoi' && counts[role] === 1) npc.secret = 'không cùng huyết thống với bạn và chưa từng nói ra';
    return npc;
  });
}

/** Append a memory to the first cast member with that role; keep at most CAST_MEMORY_MAX by folding old ones into a summary. */
export function addCastMemory(character, role, { tag, text = '' }, age = character.age ?? 0) {
  const npc = (character.cast ?? []).find(n => n.role === role);
  if (!npc || !tag) return null;
  npc.memory ??= [];
  npc.memory.push({ age, tag, text });
  while (npc.memory.length > CAST_MEMORY_MAX) {
    const [a, b, ...rest] = npc.memory;
    const tags = [...new Set([...(a.tags ?? [a.tag]), ...(b.tags ?? [b.tag])])];
    const count = (a.count ?? 1) + (b.count ?? 1);
    npc.memory = [{ age: b.age, tag: 'tom_tat', tags, count, text: `Nhiều chuyện cũ (${count} việc): ${tags.join(', ')}` }, ...rest];
  }
  return npc;
}

/** True when the cast member of that role remembers `tag` (compressed summaries keep their tags). */
export function castRemembers(npc, tag) {
  return (npc?.memory ?? []).some(m => m.tag === tag || m.tags?.includes(tag));
}

// Check for long-term narrative arc triggers based on active NPCs
export function evaluateNpcLongTermArc(character, npcs) {
  if (!npcs || npcs.length === 0) return null;

  // 1. Kind deed repaid: If broke and have grateful NPC
  const gratefulNpc = npcs.find(n => n.affinity >= 70 && n.status === "alive");
  if (gratefulNpc && (character.cash < 0 || character.hidden_flags.includes("high_debt"))) {
    return {
      npc: gratefulNpc,
      arc_type: "debt_of_gratitude_repaid",
      title: `Ân Nhân Tái Ngộ: ${gratefulNpc.name}`,
      narrative: `Giữa lúc nợ nần bủa vây và bạn đứng trước nguy cơ phá sản, một chiếc xe sang đỗ trước cửa nhà. Bước xuống là ${gratefulNpc.name} (${gratefulNpc.role}) — người từng mang ơn bạn năm xưa, nay đã thành đạt. Người ấy đưa ra một lời đề nghị giải cứu mang tính định đoạt.`,
      options: [
        {
          id: "NPC_A",
          action_title: "Chấp nhận sự trợ giúp chân thành",
          consequence_hint: "Nhận vốn đầu tư lớn, gắn kết nghĩa tình. Rủi ro 10%.",
          risk_percent: 10,
          cost_ap: 2,
          effects: {
            cash_delta: 25000,
            vitality_delta: 5,
            burnout_delta: -25,
            karma_delta: 10,
            add_flags: ["honored_ally"],
            remove_flags: ["high_debt"]
          }
        },
        {
          id: "NPC_B",
          action_title: "Từ chối vì tự trọng cá nhân",
          consequence_hint: "Giữ vững lòng tự ái nhưng tiếp tục bế tắc. Rủi ro 70%.",
          risk_percent: 70,
          cost_ap: 1,
          effects: {
            cash_delta: 0,
            vitality_delta: -10,
            burnout_delta: 15,
            karma_delta: 0,
            add_flags: ["stubborn_pride"],
            remove_flags: []
          }
        }
      ]
    };
  }

  // 2. Vengeance / Grudge Arc: Former enemy returns
  const enemyNpc = npcs.find(n => n.affinity <= -40 && n.status === "alive");
  if (enemyNpc && getRandom() < 0.35) {
    return {
      npc: enemyNpc,
      arc_type: "vengeance_confrontation",
      title: `Bóng Ma Quá Khứ: ${enemyNpc.name}`,
      narrative: `Người từng xem bạn là kẻ thù không đội trời chung — ${enemyNpc.name} (${enemyNpc.role}) — bất ngờ xuất hiện trong một cuộc họp đấu thầu then chốt với tư cách nhà đầu tư đối thủ, ánh mắt sắc lạnh không giấu giếm ý định trả thù.`,
      options: [
        {
          id: "NPC_A",
          action_title: "Đối đầu trực diện, đấu thầu sòng phẳng",
          consequence_hint: "Cạnh tranh sinh tử, tốn kém nguồn lực. Rủi ro 60%.",
          risk_percent: 60,
          cost_ap: 2,
          effects: {
            cash_delta: getRandom() > 0.45 ? 40000 : -20000,
            vitality_delta: -15,
            burnout_delta: 20,
            karma_delta: -5,
            add_flags: ["corporate_rivalry"],
            remove_flags: []
          }
        },
        {
          id: "NPC_B",
          action_title: "Chủ động hòa giải, nhượng bộ",
          consequence_hint: "Hạ mình giữ bình yên, hóa giải ân oán. Rủi ro 25%.",
          risk_percent: 25,
          cost_ap: 1,
          effects: {
            cash_delta: -5000,
            vitality_delta: 5,
            burnout_delta: -10,
            karma_delta: 15,
            add_flags: ["peace_maker"],
            remove_flags: []
          }
        }
      ]
    };
  }

  return null;
}
