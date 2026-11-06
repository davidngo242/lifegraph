/**
 * LifeGraph RPG Progression Engine (ES Module)
 * Manages Life Level, EXP, Tri-Branch Skill Tree, and NPC Social Links.
 */

// Level & Title Progression Configuration
export const LEVEL_TIERS = [
  { minLevel: 1, maxLevel: 10, title: "Kẻ Khởi Đầu", rank: "Novice", expPerLevel: 250 },
  { minLevel: 11, maxLevel: 25, title: "Chuyên Gia Thực Chiến", rank: "Specialist", expPerLevel: 500 },
  { minLevel: 26, maxLevel: 45, title: "Doanh Chủ & Trụ Cột", rank: "Master", expPerLevel: 1000 },
  { minLevel: 46, maxLevel: 70, title: "Tài Phiệt & Đầu Sỏ", rank: "Titan", expPerLevel: 2000 },
  { minLevel: 71, maxLevel: 100, title: "Huyền Thoại Bất Tử", rank: "Living Legend", expPerLevel: 4000 }
];

// Tri-Branch Skill Tree Definitions
export const SKILL_TREE = {
  wealth: {
    id: "wealth",
    name: "Thương Trường & Tài Phiệt",
    icon: "💼",
    description: "Làm chủ dòng tiền, thâu tóm tài sản và tối ưu hóa lợi nhuận đầu tư.",
    skills: [
      {
        id: "market_sense_1",
        tier: 1,
        name: "Mắt Thần Định Giá",
        icon: "👁️",
        costSp: 1,
        requires: null,
        description: "Khứu giác thị trường nhạy bén. Giảm 10% giá mua bất động sản & tăng 15% lợi nhuận lướt sóng.",
        effects: { property_discount: 0.1, asset_profit_bonus: 0.15 }
      },
      {
        id: "negotiation_master",
        tier: 2,
        name: "Đàm Phán Khắc Nghiệt",
        icon: "🤝",
        costSp: 2,
        requires: "market_sense_1",
        description: "Bản lĩnh trên bàn thương thuyết. Cày việc OT nhận thêm +35% thặng dư, tăng thu nhập hàng năm.",
        effects: { overtime_bonus: 0.35, salary_multiplier: 1.25 }
      },
      {
        id: "capital_engine",
        tier: 3,
        name: "Cỗ Máy Dòng Tiền",
        icon: "👑",
        costSp: 3,
        requires: "negotiation_master",
        description: "Tiền tự đẻ ra tiền. Tự động sinh lợi tức thụ động $25,000/năm không tiêu tốn bất kỳ giọt sinh lực nào.",
        effects: { passive_income_annual: 25000 }
      }
    ]
  },
  social: {
    id: "social",
    name: "Uy Quyền & Nhân Mạch",
    icon: "🤝",
    description: "Mở rộng quan hệ quý nhân, thao túng cục diện xã hội và nâng đỡ gia tộc.",
    skills: [
      {
        id: "charisma_magnet",
        tier: 1,
        name: "Hào Quang Cuốn Hút",
        icon: "✨",
        costSp: 1,
        requires: null,
        description: "Khí chất cuốn hút tự nhiên. Tăng gấp đôi tốc độ tăng cấp hảo cảm Social Link với các NPC.",
        effects: { social_link_exp_boost: 2.0, network_cost_discount: 0.5 }
      },
      {
        id: "leverage_power",
        tier: 2,
        name: "Mượn Gió Bẻ Măng",
        icon: "⚖️",
        costSp: 2,
        requires: "charisma_magnet",
        description: "Nhờ cậy quý nhân tháo gỡ bế tắc. Có thể yêu cầu Quý nhân can thiệp xóa nợ xấu hoặc bảo lãnh thăng chức.",
        effects: { unlock_npc_favor: true, crisis_bailout_available: true }
      },
      {
        id: "syndicate_kingmaker",
        tier: 3,
        name: "Đế Chế Nhân Mạch",
        icon: "🏛️",
        costSp: 3,
        requires: "leverage_power",
        description: "Nắm trong tay mạng lưới đầu sỏ. Đời sau thừa hưởng sẵn các mối quan hệ đỡ đầu danh giá từ đời trước.",
        effects: { dynasty_influence_bonus: 50, patron_inheritance: true }
      }
    ]
  },
  sage: {
    id: "sage",
    name: "Tâm Thức & Chân Nhân",
    icon: "🧘",
    description: "Rèn giũa tâm trí thép, trường thọ vô ưu và tích lũy đại phước đức chuyển kiếp.",
    skills: [
      {
        id: "stoic_mind",
        tier: 1,
        name: "Tâm Lý Thép",
        icon: "🛡️",
        costSp: 1,
        requires: null,
        description: "Khắc kỷ vững vàng. Giảm 40% lượng Burnout phải nhận từ công việc và biến cố cuộc sống.",
        effects: { burnout_reduction: 0.4 }
      },
      {
        id: "encyclopedic_brain",
        tier: 2,
        name: "Bách Khoa Toàn Thư",
        icon: "📚",
        costSp: 2,
        requires: "stoic_mind",
        description: "Trí tuệ thông suốt. Tự động nhận điểm tối đa trong các kỳ thi sát hạch và cộng thêm +25 Karma/năm.",
        effects: { academic_mastery: true, karma_annual_buff: 25 }
      },
      {
        id: "transcendence_sage",
        tier: 3,
        name: "Giác Ngộ Niết Bàn",
        icon: "☀️",
        costSp: 3,
        requires: "encyclopedic_brain",
        description: "Thoát ly phàm tục. Gia tăng +15 Thể lực tối đa, kéo dài tuổi thọ và nhân đôi điểm Karma tích lũy khi luân hồi.",
        effects: { max_vitality_bonus: 15, max_lifespan_bonus: 10, rebirth_karma_multiplier: 2.0 }
      }
    ]
  }
};

// Initial default NPC roster for a character if not yet created
export function generateDefaultNpcs(nationality = "Việt Nam") {
  const isVN = nationality.toLowerCase().includes("việt");
  return [
    {
      id: "npc_mentor",
      name: isVN ? "GS. Vũ Trọng Khang" : "Dr. Arthur Vance",
      archetype: "mentor",
      role: "Viện Trưởng / Cố Vấn Tối Cao",
      avatar: "👨‍🏫",
      linkLevel: 1,
      linkExp: 30,
      maxExp: 100,
      description: "Học giả uyên bác với mạng lưới quan hệ sâu rộng trong giới học thuật và lãnh đạo.",
      perks: [
        { level: 1, title: "Chỉ Điểm Tri Thức", desc: "+10% Karma khi đọc sách và nghiên cứu." },
        { level: 3, title: "Thư Giới Thiệu Vàng", desc: "Mở khóa học bổng và vị trí việc làm lương cao." },
        { level: 5, title: "Bảo Lãnh Danh Dự", desc: "Cứu nguy khỏi mọi khủng hoảng kiện tụng hoặc phá sản một lần duy nhất." }
      ],
      interactedThisYear: false
    },
    {
      id: "npc_ally",
      name: isVN ? "Trần Đình Khang" : "Liam Sterling",
      archetype: "ally",
      role: "Chiến Hữu / Đồng Sáng Lập",
      avatar: "🧑‍💻",
      linkLevel: 1,
      linkExp: 40,
      maxExp: 100,
      description: "Người bạn chí cốt cùng thời niên thiếu, sẵn sàng chung lưng đấu cật những lúc ngặt nghèo.",
      perks: [
        { level: 1, title: "Chia Ngọt Sẻ Bùi", desc: "Giảm 10 Burnout mỗi khi sum vầy cà phê giao lưu." },
        { level: 3, title: "Hùn Vốn Khởi Nghiệp", desc: "Đóng góp 30% vốn không lãi suất cho các dự án kinh doanh." },
        { level: 5, title: "Tri Kỷ Sinh Tử", desc: "Chia sẻ gánh nặng tài chính và cùng đứng mũi chịu sào trước sóng gió." }
      ],
      interactedThisYear: false
    },
    {
      id: "npc_rival",
      name: isVN ? "Lâm Thế Cường" : "Victor Thorne",
      archetype: "rival",
      role: "Kình Địch Thương Trường",
      avatar: "👔",
      linkLevel: 1,
      linkExp: 10,
      maxExp: 100,
      description: "Đối thủ tài ba luôn so kè từng bước trên con đường công danh, tạo áp lực buộc bạn phải bứt phá.",
      perks: [
        { level: 1, title: "Áp Lực Cạnh Tranh", desc: "+15% EXP nhận được khi hoàn thành các dự án lớn." },
        { level: 3, title: "Hiệp Ước Đình Chiến", desc: "Hợp tác win-win chia sẻ thị phần độc quyền khu vực." },
        { level: 5, title: "Đối Thủ Tương Kính", desc: "Biến thù thành bạn, sáp nhập liên minh tài phiệt hùng mạnh nhất." }
      ],
      interactedThisYear: false
    },
    {
      id: "npc_protege",
      name: isVN ? "Nguyễn Thảo My" : "Elena Rostova",
      archetype: "protege",
      role: "Hậu Bối Xuất Chúng",
      avatar: "👩‍💼",
      linkLevel: 1,
      linkExp: 20,
      maxExp: 100,
      description: "Thế hệ trẻ đầy nhiệt huyết coi bạn là tấm gương sáng để noi theo và cống hiến hết mình.",
      perks: [
        { level: 1, title: "Trợ Lực Trẻ Trung", desc: "Tăng 10% hiệu suất hoàn thành dự án hàng năm." },
        { level: 3, title: "Kế Thừa Tinh Hoa", desc: "Tự động quản lý một phần tài sản kinh doanh thay bạn khi lớn tuổi." },
        { level: 5, title: "Truyền Thừa Ngọn Đuốc", desc: "Kế tục sự nghiệp trọn vẹn và bảo vệ gia sản cho con cháu bạn." }
      ],
      interactedThisYear: false
    }
  ];
}

/**
 * Initialize RPG state on a character if not present
 */
export function initRpgState(character) {
  if (!character) return;
  if (typeof character.life_level === 'undefined') {
    character.life_level = 1;
  }
  character.level = character.life_level;

  if (typeof character.life_exp === 'undefined') {
    character.life_exp = 0;
  }
  character.exp = character.life_exp;

  if (typeof character.skill_points === 'undefined') {
    character.skill_points = 1; // Start with 1 SP bonus
  }
  character.sp = character.skill_points;

  if (!Array.isArray(character.unlocked_skills)) {
    character.unlocked_skills = [];
  }
  if (!Array.isArray(character.social_links) || character.social_links.length === 0) {
    character.social_links = generateDefaultNpcs(character.nationality || "Việt Nam");
  }
}

/**
 * Calculate level tier info
 */
export function getLevelInfo(level = 1) {
  const tier = LEVEL_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel) || LEVEL_TIERS[0];
  const expNeeded = tier.expPerLevel;
  return {
    level,
    title: tier.title,
    rank: tier.rank,
    expNeeded
  };
}

/**
 * Award Life EXP to character, handling level ups and awarding SP
 */
export function awardLifeExp(character, amount = 0, reason = "") {
  initRpgState(character);
  if (amount <= 0) return { leveledUp: false, levelsGained: 0 };

  character.life_exp = (character.life_exp || 0) + amount;
  let leveledUp = false;
  let levelsGained = 0;

  let currentTier = LEVEL_TIERS.find(t => character.life_level >= t.minLevel && character.life_level <= t.maxLevel) || LEVEL_TIERS[0];

  while (character.life_exp >= currentTier.expPerLevel && character.life_level < 100) {
    character.life_exp -= currentTier.expPerLevel;
    character.life_level += 1;
    character.skill_points = (character.skill_points || 0) + 1;
    leveledUp = true;
    levelsGained += 1;

    // Recalculate tier
    currentTier = LEVEL_TIERS.find(t => character.life_level >= t.minLevel && character.life_level <= t.maxLevel) || LEVEL_TIERS[LEVEL_TIERS.length - 1];
  }

  character.level = character.life_level;
  character.exp = character.life_exp;
  character.sp = character.skill_points;

  return {
    leveledUp,
    levelsGained,
    newLevel: character.life_level,
    skillPoints: character.skill_points,
    reason
  };
}

/**
 * Unlock a skill node in the skill tree
 */
export function unlockSkill(character, skillId) {
  initRpgState(character);

  // Find skill in tree
  let foundSkill = null;
  for (const branch of Object.values(SKILL_TREE)) {
    const s = branch.skills.find(sk => sk.id === skillId);
    if (s) {
      foundSkill = s;
      break;
    }
  }

  if (!foundSkill) {
    return { success: false, error: "Kỹ năng không tồn tại trong Cây Kỹ Năng!" };
  }

  if (character.unlocked_skills.includes(skillId)) {
    return { success: false, error: "Kỹ năng này đã được mở khóa trước đó!" };
  }

  if ((character.skill_points || 0) < foundSkill.costSp) {
    return { success: false, error: `Không đủ Điểm Kỹ Năng (SP)! Cần ${foundSkill.costSp} SP, bạn chỉ có ${character.skill_points || 0} SP.` };
  }

  // Check prerequisite
  if (foundSkill.requires && !character.unlocked_skills.includes(foundSkill.requires)) {
    return { success: false, error: "Chưa mở khóa kỹ năng tiền đề cấp trước!" };
  }

  // Deduct SP & Add skill
  character.skill_points -= foundSkill.costSp;
  character.unlocked_skills.push(skillId);

  // Apply instant effects
  if (foundSkill.effects.max_vitality_bonus) {
    character.max_vitality = (character.max_vitality || 100) + foundSkill.effects.max_vitality_bonus;
    character.vitality = Math.min(character.max_vitality, (character.vitality || 80) + foundSkill.effects.max_vitality_bonus);
  }

  return {
    success: true,
    skill: foundSkill,
    remainingSp: character.skill_points,
    message: `Đã mở khóa thành công kỹ năng: [${foundSkill.name}]!`
  };
}

/**
 * Interact with an NPC to build Social Link
 */
export function interactNpc(character, npcId, actionType = "socialize") {
  initRpgState(character);

  const npc = (character.social_links || []).find(n => n.id === npcId);
  if (!npc) {
    return { success: false, error: "Không tìm thấy nhân vật này trong mạng lưới quan hệ!" };
  }

  let expGain = 0;
  let apCost = 1;
  let cashCost = 0;
  let message = "";

  // Check bonuses from unlocked skills
  const hasCharismaBoost = character.unlocked_skills?.includes("charisma_magnet");
  const expMultiplier = hasCharismaBoost ? 2.0 : 1.0;

  if (actionType === "socialize") {
    // Trò chuyện / Cà phê giao lưu (1 AP)
    if ((character.action_points || 0) < apCost) {
      return { success: false, error: "Cần tối thiểu 1 Điểm Hành Động (AP) để giao lưu gặp gỡ!" };
    }
    character.action_points -= apCost;
    expGain = Math.round(35 * expMultiplier);
    character.burnout = Math.max(0, (character.burnout || 0) - 8);
    message = `Bạn đã có buổi gặp gỡ thân tình cùng ${npc.name}. Tình cảm gia tăng (+${expGain} Link EXP), giải tỏa bớt căng thẳng.`;
  } else if (actionType === "gift") {
    // Tặng quà tri ân (1 AP + $500)
    cashCost = 500;
    if ((character.action_points || 0) < apCost) {
      return { success: false, error: "Cần tối thiểu 1 AP để chuẩn bị và trao gửi quà tặng!" };
    }
    if ((character.cash || 0) < cashCost) {
      return { success: false, error: `Không đủ tiền mặt! Cần $${cashCost.toLocaleString()} để chuẩn bị quà tặng sang trọng.` };
    }
    character.action_points -= apCost;
    character.cash -= cashCost;
    expGain = Math.round(65 * expMultiplier);
    message = `Món quà tinh tế đã làm ${npc.name} vô cùng xúc động và trân quý tình bạn (+${expGain} Link EXP).`;
  } else if (actionType === "request_favor") {
    // Kích hoạt đặc quyền theo cấp độ
    if (npc.linkLevel < 3) {
      return { success: false, error: `Cần đạt tối thiểu Cấp 3 Hảo Cảm để nhờ cậy đặc quyền lớn từ ${npc.name}!` };
    }
    if ((character.action_points || 0) < apCost) {
      return { success: false, error: "Cần 1 AP để gặp gỡ trao đổi cậy nhờ quý nhân!" };
    }
    character.action_points -= apCost;

    if (npc.archetype === "mentor") {
      character.karma = Math.min(100, (character.karma || 50) + 18);
      character.cash = (character.cash || 0) + 5000;
      message = `${npc.name} đã dùng uy tín bảo lãnh giúp bạn nhận học bổng / tài trợ nghiên cứu: +$5,000 vốn & +18 Karma!`;
    } else if (npc.archetype === "ally") {
      character.burnout = Math.max(0, (character.burnout || 0) - 30);
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 15);
      message = `Chiến hữu ${npc.name} đã xốc vác hỗ trợ công việc giúp bạn xóa sạch 30 Stress và hồi phục thể lực!`;
    } else if (npc.archetype === "rival") {
      character.cash = (character.cash || 0) + 12000;
      message = `Bạn và kình địch ${npc.name} đã ký kết hiệp ước hợp tác chia sẻ thị phần: +$12,000 doanh thu!`;
    } else {
      character.cash = (character.cash || 0) + 8000;
      message = `Hậu bối ${npc.name} đã xuất sắc hoàn thành dự án kinh doanh giúp bạn: +$8,000 lợi nhuận!`;
    }
  }

  // Update NPC Link Exp and check Level Up
  if (expGain > 0) {
    npc.linkExp = (npc.linkExp || 0) + expGain;
    while (npc.linkExp >= (npc.maxExp || 100) && npc.linkLevel < 5) {
      npc.linkExp -= (npc.maxExp || 100);
      npc.linkLevel += 1;
      npc.maxExp = Math.round(npc.maxExp * 1.5);
      message += ` 🎉 Chúc mừng! Mối quan hệ với ${npc.name} đã chính thức thăng cấp lên CẤP ${npc.linkLevel}!`;
      // Award player character Life Exp
      awardLifeExp(character, 150, `Thăng cấp quan hệ với ${npc.name}`);
    }
  }

  return {
    success: true,
    npc,
    message,
    character
  };
}
