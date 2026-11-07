// frontend/app/utils/traitUtils.ts
// Comprehensive Localized Genetics & Trait Dictionary with Categories and Visual Cues

export interface FormattedTrait {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: 'buff' | 'curse' | 'rare' | 'special';
  badgeStyle: string;
  pillColor: string;
}

const TRAIT_REGISTRY: Record<string, { name: string; desc: string; icon: string; category: 'buff' | 'curse' | 'rare' | 'special' }> = {
  // 1. Trí tuệ & Học thuật (Intellect & Talents)
  thiên_tài_toán_học: {
    name: "Thiên Tài Toán Học",
    desc: "Tư duy logic & giải thuật đỉnh cao",
    icon: "🧠",
    category: "buff"
  },
  math_prodigy: {
    name: "Toán Học Trừu Tượng",
    desc: "Tư duy thuật toán, buff công nghệ & tài chính",
    icon: "💻",
    category: "buff"
  },
  trí_nhớ_siêu_phàm: {
    name: "Trí Nhớ Siêu Phàm",
    desc: "Học ngoại ngữ & chuyên môn nhanh gấp đôi",
    icon: "📚",
    category: "buff"
  },
  photographic_memory: {
    name: "Ký Ức Chụp Ảnh",
    desc: "Ký ức quang học, auto-pass thi cử",
    icon: "📷",
    category: "buff"
  },
  bộ_não_kỹ_thuật: {
    name: "Bộ Não Kỹ Thuật",
    desc: "Sáng chế & am hiểu cơ khí từ thơ bé",
    icon: "⚙️",
    category: "buff"
  },
  code_whisperer: {
    name: "Lập Trình Viên Thiên Bẩm",
    desc: "+35% Thu nhập ngành AI & phần mềm",
    icon: "⌨️",
    category: "buff"
  },
  tư_duy_chiến_lược: {
    name: "Tư Duy Chiến Lược",
    desc: "Nhìn thấu đại cục và bài toán dài hạn",
    icon: "♟️",
    category: "buff"
  },

  // 2. Thể chất, Sinh lực & Trường thọ (Physical & Longevity)
  khỏe_mạnh_vô_song: {
    name: "Khung Xương Kim Cương",
    desc: "+15 Max HP & Dẻo dai phi thường",
    icon: "⚡",
    category: "buff"
  },
  iron_constitution: {
    name: "Thể Lực Bất Khuất",
    desc: "Giảm 40% suy thoái sinh học sau tuổi 60",
    icon: "🛡️",
    category: "buff"
  },
  gen_trường_thọ_bách_niên: {
    name: "Trường Thọ Bách Niên",
    desc: "+20 Max Sinh Lực & Chậm lão hóa tự nhiên",
    icon: "🌿",
    category: "rare"
  },
  longevity_ancestry: {
    name: "Gia Tộc Trường Thọ",
    desc: "Lùi mốc tử thần từ 70 lên 75 tuổi",
    icon: "⏳",
    category: "rare"
  },
  thể_chất_vận_động_viên: {
    name: "Phản Xạ Điền Kinh",
    desc: "Né tránh va chạm nguy hiểm, tốc độ vượt trội",
    icon: "🏃",
    category: "buff"
  },
  chuyển_hóa_trao_đổi_chất_vàng: {
    name: "Trao Đổi Chất Vàng",
    desc: "Vóc dáng săn chắc, huyết áp luôn ổn định",
    icon: "✨",
    category: "buff"
  },
  gan_thận_thanh_lọc_tự_nhiên: {
    name: "Bộ Lọc Tự Nhiên",
    desc: "Kháng độc tố và chuyển hóa nhanh",
    icon: "💧",
    category: "buff"
  },

  // 3. Tâm lý, Bản lĩnh & Cảm xúc (Mental & Emotional)
  tâm_lý_thép: {
    name: "Tâm Lý Thép",
    desc: "Giảm 40% tích tụ Burnout trước khủng hoảng",
    icon: "🗿",
    category: "buff"
  },
  resilient_spirit: {
    name: "Tâm Thế Bình Thản",
    desc: "Giảm 35% tích tụ áp lực tinh thần",
    icon: "🕊️",
    category: "buff"
  },
  stoic_zen: {
    name: "Khắc Kỷ Tịnh Tâm",
    desc: "Giảm 50% kiệt sức khi làm việc áp lực cao",
    icon: "🧘",
    category: "buff"
  },
  ý_chí_bất_khuất: {
    name: "Ý Chí Bất Khuất",
    desc: "Càng nghịch cảnh càng bùng nổ sức bật",
    icon: "🔥",
    category: "buff"
  },

  // 4. Tài chính, Thương trường & Ngoại giao (Wealth & Social)
  trực_giác_kinh_doanh: {
    name: "Trực Giác Kinh Doanh",
    desc: "Bản năng ngửi thấy dòng tiền chuẩn xác",
    icon: "🪙",
    category: "buff"
  },
  market_intuition: {
    name: "Trực Giác Thị Trường",
    desc: "+20% Lợi nhuận danh mục đầu tư",
    icon: "📈",
    category: "buff"
  },
  negotiation_shark: {
    name: "Cá Mập Đàm Phán",
    desc: "Giảm 15% giá khi thâu tóm tài sản lớn",
    icon: "🦈",
    category: "buff"
  },
  phong_thái_lãnh_đạo: {
    name: "Khí Chất Lãnh Đạo",
    desc: "Uy thế tự nhiên, thuyết phục đám đông",
    icon: "👑",
    category: "buff"
  },
  charismatic_orator: {
    name: "Hùng Biện Truyền Cảm",
    desc: "+35% Đàm phán và mở rộng nhân mạch",
    icon: "🎙️",
    category: "buff"
  },
  thấu_cảm_xã_hội: {
    name: "Trí Tuệ Cảm Xúc (EQ)",
    desc: "Đọc vị tâm lý người khác, kết nối sâu sắc",
    icon: "🤝",
    category: "buff"
  },
  ngoại_hình_xuất_chúng: {
    name: "Dung Mạo Xuất Chúng",
    desc: "Sức hút tự nhiên trong mọi giao tiếp xã hội",
    icon: "✨",
    category: "buff"
  },
  polyglot_tongue: {
    name: "Đa Ngôn Ngữ Siêu Tốc",
    desc: "Thông thạo ngoại ngữ, lợi thế thương mại",
    icon: "🌐",
    category: "buff"
  },
  green_thumb: {
    name: "Đôi Tay Ươm Mầm",
    desc: "+30% Lợi tức nông nghiệp & sinh thái",
    icon: "🌱",
    category: "buff"
  },
  empathic_healer: {
    name: "Trái Tim Thấu Cảm",
    desc: "+25% Hảo cảm gia đình & hồi phục nhanh",
    icon: "💖",
    category: "buff"
  },
  culinary_artist: {
    name: "Nghệ Nhân Ẩm Thực",
    desc: "Vị giác nhạy bén, mở lối chuỗi F&B",
    icon: "🍳",
    category: "buff"
  },
  tâm_hồn_nghệ_sĩ: {
    name: "Tâm Hồn Nghệ Sĩ",
    desc: "Trực giác thẩm mỹ và mỹ cảm tinh tế",
    icon: "🎨",
    category: "buff"
  },
  óc_nghệ_thuật: {
    name: "Óc Nghệ Thuật",
    desc: "Năng khiếu sáng tạo nghệ thuật vượt trội",
    icon: "🎭",
    category: "buff"
  },
  giọng_nói_truyền_cảm: {
    name: "Giọng Nói Truyền Cảm",
    desc: "Âm sắc lôi cuốn, truyền cảm hứng tự nhiên",
    icon: "🎶",
    category: "buff"
  },

  // 5. Đột biến Hiếm & Tiên Thiên (Rare & Legendary)
  giác_ngộ_tâm_linh_tiên_thiên: {
    name: "Căn Duyên Giác Ngộ",
    desc: "Linh hồn thiện căn, +25 Karma khởi đầu",
    icon: "🪷",
    category: "rare"
  },
  mắt_nhìn_xuyên_thị_trường: {
    name: "Nhãn Quan Đầu Tư",
    desc: "Dự cảm chuẩn xác bong bóng tài sản",
    icon: "👁️",
    category: "rare"
  },
  gen_ngủ_ngắn_sleepless: {
    name: "Hội Chứng Ngủ Ngắn DEC2",
    desc: "Chỉ cần 4 tiếng ngủ, sở hữu thêm +1 AP/năm",
    icon: "⚡",
    category: "rare"
  },
  creative_maverick: {
    name: "Tư Duy Đột Phá",
    desc: "Nhân đôi điểm thành tựu khi đột phá RPG",
    icon: "💡",
    category: "rare"
  },
  huyết_thống_trâm_anh: {
    name: "Huyết Thống Trâm Anh",
    desc: "Khí chất quý tộc dòng dõi lâu đời",
    icon: "⚜️",
    category: "rare"
  },

  // 6. Khiếm khuyết & Thách thức Sinh tồn (Curses & Genetic Challenges)
  hệ_miễn_dịch_yếu: {
    name: "Hệ Miễn Dịch Nhạy Cảm",
    desc: "-10 Max HP, thể trạng mong manh từ bé",
    icon: "🤧",
    category: "curse"
  },
  dễ_nghiện_ngập: {
    name: "Dopamine Bốc Đồng",
    desc: "Dễ bị lôi kéo vào cám dỗ chi tiêu bốc đồng",
    icon: "🎲",
    category: "curse"
  },
  tiền_sử_tim_mạch_di_truyền: {
    name: "Tim Mạch Nhạy Cảm",
    desc: "Dễ tăng huyết áp khi gặp cú sốc tâm lý",
    icon: "💓",
    category: "curse"
  },
  tâm_trí_u_uất: {
    name: "Thể Tạng U Uất",
    desc: "Burnout tích lũy nhanh hơn 20% khi thất bại",
    icon: "🌧️",
    category: "curse"
  },
  hội_chứng_mất_ngủ_kinh_niên: {
    name: "Mất Ngủ Kinh Niên",
    desc: "Khó vào giấc ngủ sâu, hồi phục kém",
    icon: "🌙",
    category: "curse"
  },
  cận_thị_bẩm_sinh: {
    name: "Thị Lực Kém Bẩm Sinh",
    desc: "Mắt kém từ nhỏ, cần đeo kính điều chỉnh",
    icon: "👓",
    category: "curse"
  }
};

export function formatTrait(traitId: string | undefined | null): FormattedTrait {
  if (!traitId) {
    return {
      id: "unknown",
      name: "Tố Chất Bí Ẩn",
      desc: "Tiềm năng chưa khai phá",
      icon: "✨",
      category: "special",
      badgeStyle: "bg-slate-900/80 text-slate-300 border-slate-700/60",
      pillColor: "text-slate-400"
    };
  }

  const cleanId = String(traitId).trim().toLowerCase();
  const entry = TRAIT_REGISTRY[cleanId];

  if (entry) {
    let badgeStyle = "bg-purple-950/60 text-purple-200 border-purple-500/40 shadow-sm";
    let pillColor = "text-purple-300";

    if (entry.category === 'curse') {
      badgeStyle = "bg-rose-950/60 text-rose-300 border-rose-500/40 shadow-sm";
      pillColor = "text-rose-400";
    } else if (entry.category === 'rare') {
      badgeStyle = "bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-sm";
      pillColor = "text-amber-400";
    } else if (entry.category === 'buff') {
      badgeStyle = "bg-indigo-950/60 text-indigo-200 border-indigo-500/40 shadow-sm";
      pillColor = "text-indigo-300";
    }

    return {
      id: cleanId,
      name: entry.name,
      desc: entry.desc,
      icon: entry.icon,
      category: entry.category,
      badgeStyle,
      pillColor
    };
  }

  // Graceful fallback: clean up snake_case or raw strings
  const fallbackName = cleanId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return {
    id: cleanId,
    name: fallbackName,
    desc: "Đặc tính di truyền tự nhiên",
    icon: "🧬",
    category: "buff",
    badgeStyle: "bg-slate-900/80 text-slate-300 border-slate-700/60",
    pillColor: "text-slate-400"
  };
}

export function getCountryFlag(country: string | undefined | null): string {
  if (!country) return "🌐";
  const c = country.toLowerCase();
  if (c.includes("việt nam") || c.includes("vietnam")) return "🇻🇳";
  if (c.includes("nhật") || c.includes("japan")) return "🇯🇵";
  if (c.includes("hoa kỳ") || c.includes("mỹ") || c.includes("usa")) return "🇺🇸";
  if (c.includes("ba lan") || c.includes("poland")) return "🇵🇱";
  if (c.includes("syria")) return "🇸🇾";
  if (c.includes("thái lan") || c.includes("thailand")) return "🇹🇭";
  if (c.includes("na uy") || c.includes("norway")) return "🇳🇴";
  if (c.includes("thụy sĩ") || c.includes("switzerland")) return "🇨🇭";
  if (c.includes("brazil")) return "🇧🇷";
  if (c.includes("haiti")) return "🇭🇹";
  if (c.includes("singapore")) return "🇸🇬";
  return "🌐";
}

export function getCountryTierBadge(tier: string | undefined | null): { label: string; style: string } {
  const t = String(tier || '').toUpperCase();
  if (t.includes('T1')) {
    return {
      label: "Tier 1 · Thịnh Vượng",
      style: "bg-sky-500/15 text-sky-300 border-sky-500/30"
    };
  }
  if (t.includes('T2')) {
    return {
      label: "Tier 2 · Đang Phát Triển",
      style: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    };
  }
  if (t.includes('T3')) {
    return {
      label: "Tier 3 · Khắc Nghiệt",
      style: "bg-rose-500/15 text-rose-300 border-rose-500/30"
    };
  }
  return {
    label: tier || "Quốc Gia",
    style: "bg-slate-800 text-slate-300 border-slate-700"
  };
}
