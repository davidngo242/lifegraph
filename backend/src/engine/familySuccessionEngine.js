/**
 * familySuccessionEngine.js
 * LifeGraph v0.1 Prototype - Family Agency & Multi-Generation Succession Engine
 * 
 * Core Design:
 * 1. Children & Spouses are not passive stat modifiers: they have distinct life goals, trust, and memories.
 * 2. Succession is an agreement, not an automatic button: heirs evaluate debts, estate value, and personal autonomy.
 * 3. Generation transition seamlessly preserves lineage, transfers remaining debts & assets, and launches Gen 2 at their real chronological age.
 */

import crypto from 'crypto';

export const CHILD_GOALS = {
  ACADEMIC_PASSION: {
    id: 'ACADEMIC_PASSION',
    name: 'Theo Đuổi Học Thuật',
    description: 'Ước mơ nghiên cứu và giảng dạy, không mặn mà kinh doanh gia đình.',
    prefersBusiness: false,
    idealWill: 'Cấp học bổng / di sản tiền mặt'
  },
  ENTREPRENEUR: {
    id: 'ENTREPRENEUR',
    name: 'Khởi Nghiệp Độc Lập',
    description: 'Muốn tự lập công ty riêng, tìm kiếm vốn hạt giống từ gia đình.',
    prefersBusiness: false,
    idealWill: 'Vốn khởi nghiệp riêng'
  },
  BUSINESS_SUCCESSOR: {
    id: 'BUSINESS_SUCCESSOR',
    name: 'Kế Thừa Cơ Nghiệp',
    description: 'Sẵn sàng tiếp quản xưởng nghề / cơ nghiệp của cha mẹ.',
    prefersBusiness: true,
    idealWill: 'Tiếp quản sản nghiệp & quyền điều hành'
  },
  ARTIST: {
    id: 'ARTIST',
    name: 'Sáng Tạo Nghệ Thuật',
    description: 'Yêu tự do và cái đẹp, sợ hãi áp lực nợ nần và sổ sách kế toán.',
    prefersBusiness: false,
    idealWill: 'Tự do sáng tạo & tài sản an toàn'
  },
  STABLE_CAREER: {
    id: 'STABLE_CAREER',
    name: 'Công Chức Ổn Định',
    description: 'Muốn cuộc sống an yên, sợ rủi ro và các khoản nợ lớn.',
    prefersBusiness: false,
    idealWill: 'Bất động sản an cư'
  }
};

/**
 * Sinh ngẫu nhiên một người con mới khi sinh con
 */
export function generateChild({ birthYear, parentSurname = 'Trần', gender = null, childIndex = 1 }) {
  const isMale = gender ? (gender === 'MALE') : (Math.random() > 0.5);
  const maleNames = ['Minh', 'Khoa', 'Duy', 'Hải', 'Tuấn', 'Quân', 'Bảo', 'Long'];
  const femaleNames = ['Linh', 'Trang', 'Hà', 'Phương', 'Mai', 'An', 'Vy', 'Châu'];
  const chosenName = isMale 
    ? maleNames[Math.floor(Math.random() * maleNames.length)] 
    : femaleNames[Math.floor(Math.random() * femaleNames.length)];

  const goalKeys = Object.keys(CHILD_GOALS);
  const chosenGoalKey = goalKeys[Math.floor(Math.random() * goalKeys.length)];

  const traitPool = ['DILIGENT', 'PRIDEFUL', 'INDEPENDENT', 'RESILIENT', 'SENSITIVE', 'AMBITIOUS'];
  const shuffledTraits = [...traitPool].sort(() => 0.5 - Math.random());

  return {
    id: crypto.randomUUID(),
    full_name: `${parentSurname} ${chosenName}`,
    gender: isMale ? 'MALE' : 'FEMALE',
    birth_year: birthYear,
    age: 0,
    trust: 60, // Điểm niềm tin ban đầu
    personal_goal: chosenGoalKey,
    traits: shuffledTraits.slice(0, 2),
    is_heir: childIndex === 1, // Mặc định con đầu là ứng viên thừa kế
    hidden_memories: [],
    relationship_status: 'CLOSE' // 'CLOSE' | 'NEUTRAL' | 'ESTRANGED'
  };
}

/**
 * Cập nhật tuổi và sự phát triển của các thành viên gia đình qua từng năm tick
 */
export function updateFamilyAnnualTick(family, currentYear) {
  if (!family) return { family: { spouse: null, children: [] }, familyEvents: [] };

  const familyEvents = [];
  const updatedFamily = { ...family };

  // 1. Cập nhật bạn đời
  if (updatedFamily.spouse && updatedFamily.spouse.status === 'ALIVE') {
    updatedFamily.spouse.age = currentYear - updatedFamily.spouse.birth_year;
    // Tự nhiên giảm nhẹ trust nếu có nhiều ký ức tiêu cực
    const negCount = (updatedFamily.spouse.hidden_memories || []).filter(m => m.type === 'NEGATIVE').length;
    if (negCount > 2 && Math.random() < 0.2) {
      updatedFamily.spouse.trust = Math.max(0, updatedFamily.spouse.trust - 2);
    }
  }

  // 2. Cập nhật các con
  if (Array.isArray(updatedFamily.children)) {
    updatedFamily.children = updatedFamily.children.map(child => {
      const c = { ...child };
      c.age = currentYear - c.birth_year;

      // Cập nhật trạng thái quan hệ dựa trên trust
      if (c.trust >= 70) c.relationship_status = 'CLOSE';
      else if (c.trust >= 40) c.relationship_status = 'NEUTRAL';
      else c.relationship_status = 'ESTRANGED';

      // Sự kiện trưởng thành ở tuổi 18
      if (c.age === 18) {
        familyEvents.push({
          type: 'CHILD_ADULT',
          childId: c.id,
          name: c.full_name,
          message: `${c.full_name} đã tròn 18 tuổi và bước vào đời với định hướng "${CHILD_GOALS[c.personal_goal]?.name || c.personal_goal}".`
        });
      }

      return c;
    });
  }

  return { family: updatedFamily, familyEvents };
}

/**
 * Đánh giá mức độ đồng thuận thừa kế của người thừa kế (Heir Willingness Evaluation)
 */
export function evaluateHeirWillingness(child, estate, debts = []) {
  if (!child) return { willingness: 0, status: 'NO_HEIR', reasons: ['Chưa chỉ định người thừa kế.'] };

  let score = child.trust; // Nền tảng là niềm tin tình thân
  const reasons = [];

  // 1. Đánh giá gánh nặng nợ nần
  let totalOverdue = 0;
  let totalDebt = 0;
  for (const d of debts) {
    if (d.status !== 'SETTLED') {
      totalDebt += Number(d.principal) || 0;
      totalOverdue += Number(d.overdue_amount) || 0;
    }
  }

  if (totalOverdue > 15000) {
    score -= 35;
    reasons.push('Hoảng sợ trước khoản nợ quá hạn khổng lồ ($' + totalOverdue.toLocaleString() + ').');
  } else if (totalDebt > 50000) {
    score -= 15;
    reasons.push('Lo ngại gánh nặng nợ vay ($' + totalDebt.toLocaleString() + ').');
  }

  // 2. Đánh giá sự hòa hợp mục tiêu cá nhân
  const goal = CHILD_GOALS[child.personal_goal];
  const hasBusinessAsset = Array.isArray(estate.assets) && estate.assets.some(a => a.type === 'BUSINESS' || a.category === 'BUSINESS');

  if (hasBusinessAsset) {
    if (goal?.prefersBusiness) {
      score += 25;
      reasons.push(`Đam mê kinh doanh phù hợp hoàn hảo với cơ nghiệp gia đình (${goal.name}).`);
    } else {
      score -= 20;
      reasons.push(`Có ước mơ riêng (${goal?.name || child.personal_goal}), sợ bị trói buộc vào cơ nghiệp.`);
    }
  } else {
    // Không có cơ nghiệp doanh nghiệp, chỉ có nhà/tiền
    score += 10;
    reasons.push('Tài sản thừa kế linh hoạt, dễ tiếp nhận.');
  }

  // 3. Đánh giá tính cách
  if (child.traits?.includes('PRIDEFUL')) {
    score -= 10;
    reasons.push('Tính cách tự tôn cao, không muốn mang tiếng ỷ lại vào cha mẹ.');
  }
  if (child.traits?.includes('RESILIENT') || child.traits?.includes('DILIGENT')) {
    score += 15;
    reasons.push('Kiên cường và chăm chỉ, có tinh thần gánh vác.');
  }

  // 4. Giới hạn điểm 0 - 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  let status = 'RELUCTANT';
  if (score >= 75) status = 'ENTHUSIASTIC';     // Vui vẻ tiếp nhận trọng trách
  else if (score >= 50) status = 'CONDITIONAL'; // Nhận nhưng kèm điều kiện thỏa hiệp
  else if (score >= 30) status = 'RELUCTANT';   // Miễn cưỡng, có thể bỏ dở
  else status = 'REFUSE';                       // Từ chối tiếp quản

  return {
    childId: child.id,
    childName: child.full_name,
    age: child.age,
    willingnessScore: score,
    status,
    reasons
  };
}

/**
 * Thiết lập hoặc cập nhật Di chúc (Will & Testament)
 */
export function createOrUpdateWill({
  primaryHeirId,
  businessSuccessorId = null,
  cashDistribution = {}, // { childId: percentage }
  sellBusinessOnSuccession = false,
  note = ''
}) {
  return {
    primaryHeirId,
    businessSuccessorId: businessSuccessorId || primaryHeirId,
    cashDistribution,
    sellBusinessOnSuccession,
    note,
    updated_at: new Date().toISOString()
  };
}

/**
 * Thực thi Chuyển giao Thế hệ (Dynasty Succession: Gen 1 -> Gen 2)
 */
export function executeSuccession({
  sessionState,
  heirId,
  compromiseType = 'STANDARD' // 'STANDARD' | 'SELL_BIZ_SPLIT' | 'AUTONOMY_SUPPORT'
}) {
  const currentGen = sessionState.character;
  const family = sessionState.family || { children: [], spouse: null };
  const heir = (family.children || []).find(c => c.id === heirId);

  if (!heir) {
    throw new Error('Không tìm thấy người thừa kế hợp lệ để thực thi chuyển giao.');
  }

  // 1. Tạo bản tóm tắt kiếp sống Đời 1 (Generation 1 Chronicle)
  const gen1Chronicle = {
    generation: sessionState.generation_index || 1,
    character_name: currentGen.name,
    final_age: currentGen.age,
    passing_year: sessionState.current_year,
    final_cash: currentGen.cash || 0,
    final_net_worth: sessionState.net_worth || 0,
    burnout: currentGen.burnout || 0,
    heir_name: heir.full_name,
    compromise_chosen: compromiseType,
    major_decisions: (currentGen.history || []).slice(-8),
    key_traits: currentGen.traits || [],
    flags_summary: currentGen.hidden_flags || []
  };

  // 2. Chuyển đổi tài sản & nợ nần
  let transferredCash = Math.max(0, currentGen.cash || 0);
  let transferredAssets = [...(sessionState.assets || [])];
  let transferredDebts = [...(sessionState.debts || [])];

  // Xử lý thỏa hiệp nếu có
  const heirInheritedFlags = ['gen2_successor'];

  if (compromiseType === 'SELL_BIZ_SPLIT') {
    // Bán tài sản kinh doanh thu hồi tiền mặt trừ nợ
    transferredAssets = transferredAssets.filter(a => {
      if (a.type === 'BUSINESS' || a.category === 'BUSINESS') {
        transferredCash += Math.round((a.current_value || a.value || 10000) * 0.85); // Thu 85% thanh lý
        return false;
      }
      return true;
    });
    heirInheritedFlags.push('liquidated_family_biz');
  } else if (compromiseType === 'AUTONOMY_SUPPORT') {
    // Trích 40% tiền cho con tự do lập nghiệp
    heirInheritedFlags.push('freedom_grant_received');
  } else {
    heirInheritedFlags.push('accepted_family_torch');
  }

  // Nếu gánh nợ lớn
  const hasBigOverdue = transferredDebts.some(d => (d.overdue_amount || 0) > 10000);
  if (hasBigOverdue) {
    heirInheritedFlags.push('inherited_crushing_debts');
  }

  // 3. Khởi tạo nhân vật Thế hệ 2 (Gen 2 Character)
  const gen2Character = {
    id: heir.id,
    name: heir.full_name,
    gender: heir.gender,
    age: Math.max(18, heir.age || 25), // Bắt đầu ở độ tuổi thực của con
    generation: (sessionState.generation_index || 1) + 1,
    birth_year: heir.birth_year,
    cash: transferredCash,
    burnout: 15, // Khởi đầu mới với năng lượng trẻ
    action_points: 3,
    max_action_points: 3,
    skills: {
      tech_logic: { level: heir.personal_goal === 'ACADEMIC_PASSION' ? 3 : 1, name: 'Logic & Kỹ thuật' },
      finance_market: { level: heir.personal_goal === 'ENTREPRENEUR' ? 3 : 1, name: 'Tài chính & Thị trường' },
      creativity: { level: heir.personal_goal === 'ARTIST' ? 4 : 1, name: 'Sáng tạo & Nghệ thuật' },
      relationship: { level: 2, name: 'Mối quan hệ & Giao tiếp' }
    },
    traits: [...(heir.traits || []), 'SECOND_GENERATION'],
    hidden_flags: heirInheritedFlags,
    history: [
      {
        year: sessionState.current_year,
        age: heir.age,
        event: `Kế thừa di sản từ ${currentGen.name}`,
        choice: `Bước lên gánh vác thế hệ 2 (${compromiseType})`,
        effects_summary: [
          `Nhận thừa kế $${transferredCash.toLocaleString()}`,
          `${transferredAssets.length} tài sản, ${transferredDebts.length} nghĩa vụ nợ`
        ]
      }
    ]
  };

  // 4. Gia đình mới của Gen 2 (con cái lúc này thành anh/chị/em, Gen 2 có thể lập gia đình riêng sau)
  const gen2Family = {
    spouse: null,
    children: [],
    siblings: (family.children || []).filter(c => c.id !== heir.id)
  };

  return {
    gen1Chronicle,
    newCharacter: gen2Character,
    newFamily: gen2Family,
    transferredAssets,
    transferredDebts,
    newGenerationIndex: (sessionState.generation_index || 1) + 1
  };
}
