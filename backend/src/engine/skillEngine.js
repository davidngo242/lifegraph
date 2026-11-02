// Professional Skill & Mastery Engine (LifeGraph 2.0)
// Manages 4 core pillars: Tech & Intellect, Finance & Market, Vitality & Resilience, Leadership & Diplomacy

export const SKILL_DEFINITIONS = {
  tech_logic: {
    id: "tech_logic",
    name: "Trí Tuệ & Công Nghệ",
    description: "Kỹ năng tư duy giải thuật, lập trình hệ thống, tự động hóa và công nghệ cao.",
    icon: "💻",
    default_minigame: "logic_circuit_6yo",
    compatible_traits: ["thiên_tài_toán_học", "bộ_não_kỹ_thuật", "trí_nhớ_siêu_phàm", "tư_duy_chiến_lược"],
    levels: [
      {
        level: 1,
        title: "Kỹ Sư Tập Sự (Novice)",
        tuition: 500,
        perk_title: "+15% Thu Nhập Cày Việc",
        perk_desc: "Tăng 15% thù lao tiền mặt mỗi khi thực hiện hành động Cày Thêm Việc.",
        flag: "tech_master_lv1"
      },
      {
        level: 2,
        title: "Chuyên Gia Thuật Toán (Expert)",
        tuition: 1800,
        perk_title: "+30% Thu Nhập Cày Việc & Kháng Lừa Đảo",
        perk_desc: "Tăng 30% thù lao cày việc; giảm 50% thiệt hại từ bẫy lừa đảo công nghệ/coin đa cấp.",
        flag: "tech_master_lv2"
      },
      {
        level: 3,
        title: "Đại Sư Công Nghệ Cao (Master)",
        tuition: 4500,
        perk_title: "Cổ Tức Tech Hàng Năm & Đột Phá Trilemma",
        perk_desc: "Nhận thụ động +$2,000/năm cổ tức công nghệ và mở khóa các quyết định tối thượng trong Trilemma.",
        flag: "tech_master_lv3"
      }
    ]
  },
  finance_market: {
    id: "finance_market",
    name: "Tài Chính & Thương Trường",
    description: "Kỹ năng đọc biểu đồ thị trường, định giá tài sản, lướt sóng và quản trị danh mục vốn.",
    icon: "📈",
    default_minigame: "stock_trader_20yo",
    compatible_traits: ["trực_giác_kinh_doanh", "mắt_nhìn_xuyên_thị_trường", "tư_duy_chiến_lược"],
    levels: [
      {
        level: 1,
        title: "Nhà Đầu Tư F0 (Novice)",
        tuition: 500,
        perk_title: "Chiết Khấu 10% Mua Tài Sản",
        perk_desc: "Tiết kiệm 10% chi phí khi mua nhà đất hoặc thâu tóm cổ phiếu.",
        flag: "finance_master_lv1"
      },
      {
        level: 2,
        title: "Chuyên Gia Lướt Sóng (Expert)",
        tuition: 1800,
        perk_title: "Chiết Khấu 20% & Tăng 30% Tỷ Lệ Thắng Vận May",
        perk_desc: "Chiết khấu 20% giá tài sản; tăng tỷ lệ sinh lời cao khi Thử Vận May.",
        flag: "finance_master_lv2"
      },
      {
        level: 3,
        title: "Tài Phiệt Quản Trị Vốn (Master)",
        tuition: 4500,
        perk_title: "Miễn Nhiễm Sập Sàn & +15% Lợi Tức Ròng",
        perk_desc: "Miễn nhiễm tổn thất khi xảy ra khủng hoảng sụp đổ thị trường tài chính; tăng +15% giá trị tài sản ròng hàng năm.",
        flag: "finance_master_lv3"
      }
    ]
  },
  resilience_health: {
    id: "resilience_health",
    name: "Sinh Lực & Khắc Kỷ",
    description: "Năng lực kiểm soát thân tâm, dưỡng sinh trường thọ, điều hòa nhịp tim và hóa giải stress.",
    icon: "🧘",
    default_minigame: "cardio_beat_55yo",
    compatible_traits: ["cốt_cách_trường_thọ", "gen_trường_thọ_bách_niên", "khỏe_mạnh_vô_song", "phục_hồi_thần_tốc", "thể_chất_vận_động_viên", "tâm_lý_thép"],
    levels: [
      {
        level: 1,
        title: "Tâm Trí Vững Vàng (Novice)",
        tuition: 500,
        perk_title: "Kháng 20% Tích Lũy Burnout",
        perk_desc: "Giảm 20% lượng Burnout gia tăng từ mọi hoạt động cày việc và biến cố.",
        flag: "resilience_master_lv1"
      },
      {
        level: 2,
        title: "Bậc Thầy Khắc Kỷ (Expert)",
        tuition: 1800,
        perk_title: "Dưỡng Sinh Đột Phá (+10 HP, -15 Burnout)",
        perk_desc: "Mỗi lần Dưỡng Sinh hồi thêm +10 Sinh Lực và thanh lọc thêm -15 Burnout.",
        flag: "resilience_master_lv2"
      },
      {
        level: 3,
        title: "Thân Thể Kim Cương (Master)",
        tuition: 4500,
        perk_title: "+15 Max Sinh Lực Vĩnh Viễn & Kháng Bạo Bệnh",
        perk_desc: "Tăng vĩnh viễn +15 Giới Hạn Sinh Lực; miễn nhiễm nguy cơ tử vong do suy tim đột ngột lúc xế chiều.",
        flag: "resilience_master_lv3"
      }
    ]
  },
  leadership_social: {
    id: "leadership_social",
    name: "Lãnh Đạo & Ngoại Giao",
    description: "Nghệ thuật đàm phán thương trường, xây dựng mạng lưới quan hệ đỉnh cao và hòa giải gia tộc.",
    icon: "🤝",
    default_minigame: "negotiation_duel",
    compatible_traits: ["phong_thái_lãnh_đạo", "thấu_cảm_xã_hội", "ngoại_hình_xuất_chúng", "giọng_nói_truyền_cảm"],
    levels: [
      {
        level: 1,
        title: "Sứ Giả Giao Tiếp (Novice)",
        tuition: 500,
        perk_title: "Giảm 25% Chi Phí Mở Quan Hệ",
        perk_desc: "Tiết kiệm 25% tiền khi thực hiện hành động kết nối mạng lưới ngoại giao.",
        flag: "leadership_master_lv1"
      },
      {
        level: 2,
        title: "Nhà Thuyết Phục Tài Ba (Expert)",
        tuition: 1800,
        perk_title: "Giảm 50% Phí & Kết Thân Đối Tác VIP",
        perk_desc: "Giảm một nửa phí Mở Quan Hệ, tăng 40% khả năng kết nối được các NPC quyền lực.",
        flag: "leadership_master_lv2"
      },
      {
        level: 3,
        title: "Lãnh Tụ Kiệt Xuất (Master)",
        tuition: 4500,
        perk_title: "Hợp Đồng Độc Quyền & Bảo Vệ Gia Tộc",
        perk_desc: "Mở khóa hợp đồng đối tác độc quyền lớn; giảm 70% tổn thất từ các vụ tranh chấp di chúc hoặc đấu tố gia tộc.",
        flag: "leadership_master_lv3"
      }
    ]
  }
};

/**
 * Determine the minigame type based on skill and character age
 */
export function getExamMinigameType(skillId, age = 25) {
  if (skillId === 'resilience_health') {
    if (age <= 18) return 'plant_care_6yo';
    if (age <= 48) return 'life_tightrope_35yo';
    return 'cardio_beat_55yo';
  }
  const def = SKILL_DEFINITIONS[skillId];
  return def ? def.default_minigame : 'logic_circuit_6yo';
}

/**
 * Check if the character possesses a compatible genetic trait
 */
export function checkGeneticAffinity(character, skillId) {
  const def = SKILL_DEFINITIONS[skillId];
  if (!def || !character?.innate_traits) return false;
  const traits = character.innate_traits;
  return def.compatible_traits.some(ct => traits.includes(ct));
}

/**
 * Calculate actual tuition fee after genetic discount
 */
export function getTuitionFee(character, skillId, targetLevel) {
  const def = SKILL_DEFINITIONS[skillId];
  if (!def) return 0;
  const levelConfig = def.levels.find(l => l.level === targetLevel);
  if (!levelConfig) return 0;

  const baseTuition = levelConfig.tuition;
  const hasAffinity = checkGeneticAffinity(character, skillId);
  // 50% discount if character has genetic affinity
  return hasAffinity ? Math.round(baseTuition * 0.5) : baseTuition;
}
