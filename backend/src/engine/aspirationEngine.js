// Multi-Tier Life Aspiration & Quest Progression Engine (LifeGraph V8.5)
// Supports progressive Tier evolution (Tier 1 -> Tier 2 -> Tier 3 -> Tier 4 Legendary)

export const ASPIRATIONS = [
  // =========================================================================
  // TIER 1: KHỞI ĐẦU & THANH XUÂN (18 - 35 TUỔI)
  // =========================================================================
  {
    id: "first_pot_of_gold",
    tier: 1,
    title: "Đệ Nhất Hũ Vàng",
    icon: "💰",
    target_summary: "Tích lũy vốn tự thân đạt $50.000, không bị âm nợ và sở hữu tối thiểu 1 danh mục tài sản sinh lời đầu tiên.",
    reward_summary: "+40 Karma vĩnh cửu, mở khóa danh hiệu 'Tự Lực Khởi Nghiệp' và nâng trình thử thách Tier 2."
  },
  {
    id: "young_scholar",
    tier: 1,
    title: "Trí Tuệ & Chuyên Môn",
    icon: "🎓",
    target_summary: "Sở hữu cờ Nhạy Bén Tri Thức, đọc sách rèn luyện và duy trì tâm trí ổn định (Burnout < 35).",
    reward_summary: "+40 Karma vĩnh cửu, tăng +15% hiệu quả học tập và nâng trình thử thách Tier 2."
  },
  {
    id: "true_love_knot",
    tier: 1,
    title: "Kết Duyên Tri Kỷ",
    icon: "💍",
    target_summary: "Tìm thấy ý trung nhân, kết hôn trăm năm và đạt độ thấu cảm Affection ≥ 80.",
    reward_summary: "+40 Karma vĩnh cửu, tăng +10 Thể lực mỗi năm và nâng trình thử thách Tier 2."
  },

  // =========================================================================
  // TIER 2: CƠ ĐỒ & TRƯỞNG THÀNH (30 - 55 TUỔI)
  // =========================================================================
  {
    id: "survivor_redemption",
    tier: 2,
    title: "Nghịch Cảnh Trùng Sinh",
    icon: "🔥",
    target_summary: "Vượt qua khởi đầu bĩ cực, xóa sạch nợ nần, sống thọ qua 50 tuổi với gia sản $150.000+.",
    reward_summary: "+50 Karma vĩnh cửu, mở khóa cờ 'Ý Chí Bất Diệt' và nâng trình thử thách Tier 3."
  },
  {
    id: "family_patriarch",
    tier: 2,
    title: "Gia Đạo Viên Mãn",
    icon: "🏡",
    target_summary: "Nuôi dạy 2+ người con thành tài tròn 18 tuổi, duy trì tổ ấm hòa thuận ấm êm.",
    reward_summary: "+60 Karma vĩnh cửu, giảm 30% Thuế Thừa Kế cho đời sau và nâng trình thử thách Tier 3."
  },
  {
    id: "tech_pioneer_unicorn",
    tier: 2,
    title: "Tiên Phong Công Nghệ",
    icon: "🚀",
    target_summary: "Tích lũy tài sản công nghệ đạt $500.000+, sở hữu cờ Kỹ năng Logic/Tech.",
    reward_summary: "+60 Karma vĩnh cửu, mở khóa chiết khấu 20% khi đầu tư BĐS/Cổ phiếu và nâng trình thử thách Tier 3."
  },

  // =========================================================================
  // TIER 3: ĐẠI PHÚ HÀO & KHAI SÁNG (45 - 70 TUỔI)
  // =========================================================================
  {
    id: "wealth_tycoon",
    tier: 3,
    title: "Đế Chế Tài Chính",
    icon: "💎",
    target_summary: "Tích lũy Net Worth $1.500.000+ và sở hữu tối thiểu 3 danh mục tài sản sinh lời.",
    reward_summary: "+80 Karma vĩnh cửu, danh hiệu 'Đại Phú Hào Dòng Tộc' và nâng trình thử thách Huyền Thoại."
  },
  {
    id: "scholar_sage",
    tier: 3,
    title: "Khai Sáng & Đức Hạnh",
    icon: "📜",
    target_summary: "Đạt Karma ≥ 95, sở hữu mạng lưới 3+ NPC tri kỷ và giữ tâm trí bình an (Burnout < 35).",
    reward_summary: "+80 Karma vĩnh cửu, mở khóa miễn phí 1 Perk Luân Hồi kiếp sau và nâng trình thử thách Huyền Thoại."
  },
  {
    id: "community_philanthropist",
    tier: 3,
    title: "Đại Sứ Thiện Nguyện",
    icon: "🤝",
    target_summary: "Có 4+ NPC tri kỷ gắn kết, Net Worth > $800.000 và đóng góp tích cực cho xã hội.",
    reward_summary: "+80 Karma vĩnh cửu, cờ 'Đại Nhân Nghĩa' và nâng trình thử thách Huyền Thoại."
  },

  // =========================================================================
  // TIER 4: DI SẢN THIÊN THU & HUYỀN THOẠI (60+ TUỔI)
  // =========================================================================
  {
    id: "dynasty_legacy",
    tier: 4,
    title: "Gia Tộc Bách Niên Thịnh Vượng",
    icon: "👑",
    target_summary: "Đạt Net Worth $5.000.000+, truyền thừa cho thế hệ tiếp theo, sống thọ trên 75 tuổi.",
    reward_summary: "+120 Karma vĩnh cửu, vĩnh viễn lưu danh 'Thủy Tổ Gia Tộc Huy Hoàng'."
  },
  {
    id: "transhuman_eternal",
    tier: 4,
    title: "Kỷ Nguyên Bất Tử Siêu Nhân",
    icon: "⚡",
    target_summary: "Thực hiện thành công phẫu thuật Transhuman, đóng băng thoái hóa sinh học và chạm mốc 80 tuổi.",
    reward_summary: "+150 Karma vĩnh cửu, phong tặng cờ 'Linh Hồn Bất Tử Kỷ Nguyên'."
  }
];

export function assignInitialAspiration(character) {
  if (character.background_type === 'super_rich') {
    return 'first_pot_of_gold';
  }
  if (character.background_type === 'orphan') {
    return 'survivor_redemption';
  }
  if ((character.innate_traits || []).includes('thiên_tài_toán_học') || (character.karma || 50) > 60) {
    return 'young_scholar';
  }
  return 'first_pot_of_gold';
}

export function evaluateAspirationProgress(character, assets = [], relationships = []) {
  const aspirationId = character.life_aspiration || 'first_pot_of_gold';
  const totalAssets = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
  const netWorth = (Number(character.cash) || 0) + totalAssets;
  const flags = new Set(character.hidden_flags || []);
  const age = typeof character.age === 'number' ? character.age : 20;

  let progress = 0;
  let milestonesAchieved = [];

  // Dynamic progress evaluation based on specific quest
  switch (aspirationId) {
    case 'first_pot_of_gold': {
      const netWorthScore = Math.min(60, Math.round((netWorth / 50000) * 60));
      const assetScore = assets.length >= 1 ? 25 : 0;
      const debtFreeScore = character.cash >= 0 ? 15 : 0;
      progress = Math.min(100, netWorthScore + assetScore + debtFreeScore);
      if (netWorth >= 50000) milestonesAchieved.push("Đạt cột mốc $50.000 vốn liếng");
      if (assets.length >= 1) milestonesAchieved.push("Sở hữu tài sản sinh lời đầu tiên");
      if (character.cash >= 0) milestonesAchieved.push("Không vướng nợ nần");
      break;
    }
    case 'young_scholar': {
      const acumenScore = (flags.has('intellectual_acumen') || flags.has('logic_genius')) ? 50 : 20;
      const calmScore = (character.burnout || 0) < 35 ? 30 : 10;
      const karmaScore = Math.min(20, Math.round(((character.karma || 50) / 75) * 20));
      progress = Math.min(100, acumenScore + calmScore + karmaScore);
      if (flags.has('intellectual_acumen') || flags.has('logic_genius')) milestonesAchieved.push("Đã khai mở tư duy Nhạy Bén/Logic");
      if ((character.burnout || 0) < 35) milestonesAchieved.push("Tâm trí ổn định không kiệt sức");
      if ((character.karma || 0) >= 75) milestonesAchieved.push("Đức hạnh đạt 75+ Karma");
      break;
    }
    case 'true_love_knot': {
      const spouse = relationships.find(r => r.type === 'spouse');
      const spouseScore = spouse ? 60 : 0;
      const affectionScore = spouse ? Math.min(40, Math.round(((spouse.affection_level || 50) / 80) * 40)) : 0;
      progress = Math.min(100, spouseScore + affectionScore);
      if (spouse) milestonesAchieved.push("Đã kết duyên trăm năm cùng ý trung nhân");
      if (spouse && (spouse.affection_level || 0) >= 80) milestonesAchieved.push("Độ thấu cảm đạt 80+");
      break;
    }
    case 'survivor_redemption': {
      const debtPaidScore = character.cash >= 0 ? 30 : 0;
      const netWorthScore = Math.min(40, Math.round((netWorth / 150000) * 40));
      const ageScore = Math.min(30, Math.round((age / 50) * 30));
      progress = Math.min(100, debtPaidScore + netWorthScore + ageScore);
      if (character.cash >= 0) milestonesAchieved.push("Sạch nợ tài chính");
      if (netWorth >= 150000) milestonesAchieved.push("Tích lũy $150k gia sản");
      if (age >= 50) milestonesAchieved.push("Vượt qua tuổi 50 kiên cường");
      break;
    }
    case 'family_patriarch': {
      const adultChildren = relationships.filter(r => r.type === 'child' && (r.age || 0) >= 18);
      const childrenScore = Math.min(60, adultChildren.length * 30);
      const ageScore = Math.min(40, Math.round((age / 60) * 40));
      progress = Math.min(100, childrenScore + ageScore);
      if (adultChildren.length > 0) milestonesAchieved.push(`Nuôi dạy ${adultChildren.length} con trưởng thành`);
      if (age >= 60) milestonesAchieved.push("Đạt tuổi 60 đề huề");
      break;
    }
    case 'tech_pioneer_unicorn': {
      const netWorthScore = Math.min(60, Math.round((netWorth / 500000) * 60));
      const skillScore = (flags.has('tech_pioneer') || flags.has('logic_genius')) ? 40 : 15;
      progress = Math.min(100, netWorthScore + skillScore);
      if (netWorth >= 500000) milestonesAchieved.push("Gia sản đạt $500.000");
      if (flags.has('tech_pioneer') || flags.has('logic_genius')) milestonesAchieved.push("Sở hữu năng lực công nghệ");
      break;
    }
    case 'wealth_tycoon': {
      const netWorthScore = Math.min(70, Math.round((netWorth / 1500000) * 70));
      const assetScore = Math.min(30, Math.round((assets.length / 3) * 30));
      progress = Math.min(100, netWorthScore + assetScore);
      if (netWorth >= 1500000) milestonesAchieved.push("Đạt cột mốc $1.5 Triệu USD");
      if (assets.length >= 3) milestonesAchieved.push("Sở hữu danh mục 3+ tài sản");
      break;
    }
    case 'scholar_sage': {
      const karmaScore = Math.min(50, Math.round(((character.karma || 50) / 95) * 50));
      const allies = relationships.filter(r => (r.affinity || 0) >= 70);
      const alliesScore = Math.min(25, allies.length * 10);
      const calmScore = (character.burnout || 0) <= 35 ? 25 : 10;
      progress = Math.min(100, karmaScore + alliesScore + calmScore);
      if ((character.karma || 0) >= 95) milestonesAchieved.push("Đạt 95+ Điểm Công Đức (Karma)");
      if (allies.length >= 3) milestonesAchieved.push(`Có ${allies.length} bằng hữu tri kỷ`);
      if ((character.burnout || 0) <= 35) milestonesAchieved.push("Tâm trí tĩnh tại không kiệt sức");
      break;
    }
    case 'community_philanthropist': {
      const netWorthScore = Math.min(50, Math.round((netWorth / 800000) * 50));
      const friends = relationships.filter(r => (r.affinity || 0) >= 60);
      const friendsScore = Math.min(50, friends.length * 12);
      progress = Math.min(100, netWorthScore + friendsScore);
      if (netWorth >= 800000) milestonesAchieved.push("Gia sản vững mạnh $800k");
      if (friends.length >= 4) milestonesAchieved.push(`Kết giao ${friends.length} đối tác tin cậy`);
      break;
    }
    case 'dynasty_legacy': {
      const netWorthScore = Math.min(50, Math.round((netWorth / 5000000) * 50));
      const genScore = (character.generation || 1) >= 2 ? 25 : 10;
      const ageScore = Math.min(25, Math.round((age / 75) * 25));
      progress = Math.min(100, netWorthScore + genScore + ageScore);
      if (netWorth >= 5000000) milestonesAchieved.push("Đạt $5 Triệu USD gia tài");
      if ((character.generation || 1) >= 2) milestonesAchieved.push("Kế thừa thế hệ thứ 2+");
      if (age >= 75) milestonesAchieved.push("Sống thọ qua 75 tuổi");
      break;
    }
    case 'transhuman_eternal': {
      const transhumanScore = character.is_transhuman ? 60 : 0;
      const ageScore = Math.min(40, Math.round((age / 80) * 40));
      progress = Math.min(100, transhumanScore + ageScore);
      if (character.is_transhuman) milestonesAchieved.push("Cấy ghép Transhumanism thành công");
      if (age >= 80) milestonesAchieved.push("Đạt mốc 80 tuổi sinh học");
      break;
    }
    default: {
      progress = 50;
      break;
    }
  }

  const currentMeta = ASPIRATIONS.find(a => a.id === aspirationId) || ASPIRATIONS[0];
  const isCompleted = progress >= 100;

  // Available next tier upgrades
  const availableUpgrades = isCompleted 
    ? ASPIRATIONS.filter(a => a.tier > currentMeta.tier || (a.tier === currentMeta.tier && a.id !== aspirationId))
    : [];

  return {
    aspiration_id: aspirationId,
    tier: currentMeta.tier,
    title: currentMeta.title,
    icon: currentMeta.icon,
    target_summary: currentMeta.target_summary,
    reward_summary: currentMeta.reward_summary,
    progress: Math.min(100, progress),
    is_completed: isCompleted,
    milestones_achieved: milestonesAchieved,
    available_upgrades: availableUpgrades
  };
}
