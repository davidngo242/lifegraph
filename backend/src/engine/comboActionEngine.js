// backend/src/engine/comboActionEngine.js
import { awardLifeExp } from './rpgProgressionEngine.js';

export const COMBO_DEFINITIONS = [
  {
    id: 'combo_mind_body',
    name: 'Thân Tâm Hợp Nhất',
    icon: '🧘',
    triggers: ['wellness', 'family_meal'],
    description: 'Bữa cơm ấm áp cùng gia đình kết hợp dưỡng sinh thanh tịnh, tái tạo 100% sinh lực.',
    apply(character) {
      character.burnout = Math.max(0, (character.burnout || 0) - 35);
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 15);
      character.karma = Math.min(100, (character.karma || 100) + 10);
      awardLifeExp(character, 40, "Kích hoạt Combo: Thân Tâm Hợp Nhất");
      return '-35 Stress, +15 Sinh lực, +10 Karma';
    }
  },
  {
    id: 'combo_diligent_scholar',
    name: 'Đèn Sách Khắc Khổ',
    icon: '📚',
    triggers: ['overtime', 'study'],
    description: 'Ngày cày cuốc kiếm tiền, đêm miệt mài học hỏi rèn chí lớn.',
    apply(character) {
      character.cash = (Number(character.cash) || 0) + 600;
      character.burnout = Math.min(100, (character.burnout || 0) + 10);
      character.hidden_flags = character.hidden_flags || [];
      if (!character.hidden_flags.includes('diligent_scholar_combo')) {
        character.hidden_flags.push('diligent_scholar_combo');
      }
      awardLifeExp(character, 50, "Kích hoạt Combo: Đèn Sách Khắc Khổ");
      return '+$600 Thù lao, +50 EXP, +10 Stress';
    }
  },
  {
    id: 'combo_holistic_balance',
    name: 'Thân Tâm Khang Kiện',
    icon: '🌿',
    triggers: ['wellness', 'study'],
    description: 'Vừa bồi dưỡng thể chất vừa mở mang trí tuệ, tạo thế cân bằng kiệt xuất.',
    apply(character) {
      character.burnout = Math.max(0, (character.burnout || 0) - 20);
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 10);
      awardLifeExp(character, 35, "Kích hoạt Combo: Thân Tâm Khang Kiện");
      return '-20 Stress, +10 Sinh lực, +35 EXP';
    }
  },
  {
    id: 'combo_diplomatic_dynamo',
    name: 'Chiến Binh Ngoại Giao',
    icon: '🤝',
    triggers: ['network', 'family_mentorship'],
    description: 'Kết hợp lời khuyên phụ mẫu với mạng lưới quan hệ xã hội mở rộng.',
    apply(character) {
      character.karma = Math.min(100, (character.karma || 100) + 15);
      awardLifeExp(character, 45, "Kích hoạt Combo: Chiến Binh Ngoại Giao");
      return '+15 Karma, +45 EXP, Mối quan hệ thăng hoa';
    }
  },
  {
    id: 'combo_child_prodigy',
    name: 'Ấu Nhi Xuất Chúng',
    icon: '🌟',
    triggers: ['child_study', 'child_chores'],
    description: 'Vừa học bài chăm chỉ vừa biết phụ việc giúp đỡ người thân.',
    apply(character) {
      character.karma = Math.min(100, (character.karma || 100) + 12);
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 5);
      awardLifeExp(character, 30, "Kích hoạt Combo: Ấu Nhi Xuất Chúng");
      return '+12 Karma, +5 Sinh lực, Phụ mẫu tự hào';
    }
  }
];

export function recordAndCheckCombo(character, actionTag) {
  if (!character) return null;
  character.annual_actions = character.annual_actions || [];
  character.annual_combos_triggered = character.annual_combos_triggered || [];

  character.annual_actions.push(actionTag);

  for (const combo of COMBO_DEFINITIONS) {
    if (character.annual_combos_triggered.includes(combo.id)) continue;

    const allPresent = combo.triggers.every(t => character.annual_actions.includes(t));
    if (allPresent) {
      character.annual_combos_triggered.push(combo.id);
      const deltaMsg = combo.apply(character);
      
      const historyLog = character.history_log || [];
      historyLog.push({
        age: character.age,
        event: `⚡ KÍCH HOẠT COMBO: ${combo.name}`,
        choice: `${combo.description} (${deltaMsg})`
      });
      character.history_log = historyLog;

      return {
        id: combo.id,
        name: combo.name,
        icon: combo.icon,
        description: combo.description,
        delta: deltaMsg
      };
    }
  }

  return null;
}

export function resetAnnualActions(character) {
  if (!character) return;
  character.annual_actions = [];
  character.annual_combos_triggered = [];
}
