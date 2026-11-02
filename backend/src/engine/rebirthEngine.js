import crypto from 'crypto';
import { getCountryBigData, generateCulturallyAuthenticName, extractFamilySurname } from '../data/countryBigData.js';

// Country Tier Distribution: T1 (15%), T2 (60%), T3 (25%)
const COUNTRIES = {
  T1: [
    { id: "T1_Norway", name: "Na Uy", flag: "🇳🇴", safety: 95, economic_score: 90, cities: ["Oslo (Quận Frogner)", "Bergen (Khu phố cổ Bryggen)"] },
    { id: "T1_Japan", name: "Nhật Bản", flag: "🇯🇵", safety: 92, economic_score: 85, cities: ["Tokyo (Quận Shibuya)", "Osaka (Quận Chuo)", "Kyoto (Quận Nakagyo)"] },
    { id: "T1_Switzerland", name: "Thụy Sĩ", flag: "🇨🇭", safety: 96, economic_score: 95, cities: ["Zurich (Quận Altstadt)", "Geneva (Quận Eaux-Vives)"] },
    { id: "T1_USA", name: "Hoa Kỳ", flag: "🇺🇸", safety: 75, economic_score: 92, cities: ["New York (Manhattan)", "San Francisco (Silicon Valley)", "Los Angeles (Beverly Hills)"] }
  ],
  T2: [
    { id: "T2_Vietnam", name: "Việt Nam", flag: "🇻🇳", safety: 85, economic_score: 68, cities: ["Hà Nội (Quận Ba Đình)", "TP. Hồ Chí Minh (Quận 1)", "Đà Nẵng (Quận Hải Châu)"] },
    { id: "T2_Thailand", name: "Thái Lan", flag: "🇹🇭", safety: 78, economic_score: 65, cities: ["Bangkok (Quận Sukhumvit)", "Chiang Mai (Nimman)"] },
    { id: "T2_Brazil", name: "Brazil", flag: "🇧🇷", safety: 60, economic_score: 62, cities: ["São Paulo (Paulista)", "Rio de Janeiro (Copacabana)"] },
    { id: "T2_Poland", name: "Ba Lan", flag: "🇵🇱", safety: 82, economic_score: 75, cities: ["Warsaw (Quận Mokotów)", "Kraków (Khu phố Stare Miasto)"] }
  ],
  T3: [
    { id: "T3_Syria", name: "Syria", flag: "🇸🇾", safety: 20, economic_score: 15, cities: ["Damascus (Khu phố cổ Bab Touma)", "Aleppo (Quận Al-Jamiliyah)"] },
    { id: "T3_Haiti", name: "Haiti", flag: "🇭🇹", safety: 25, economic_score: 18, cities: ["Port-au-Prince (Pétion-Ville)"] },
    { id: "T3_Somalia", name: "Somalia", flag: "🇸🇴", safety: 18, economic_score: 12, cities: ["Mogadishu (Waberi)"] }
  ]
};

// Family Background Distribution: Siêu giàu 1%, Trung lưu 30%, Nghèo khó 50%, Mồ côi 19%
const FAMILY_BACKGROUNDS = [
  {
    type: "super_rich",
    name: "Gia tộc tài phiệt / Trâm anh thế phiệt",
    prob: 0.01,
    starting_endowment: 250000,
    family_wealth: 95,
    flag: "born_with_silver_spoon"
  },
  {
    type: "middle_class",
    name: "Gia đình công chức / Trí thức trung lưu",
    prob: 0.30,
    starting_endowment: 12000,
    family_wealth: 60,
    flag: "stable_nurture"
  },
  {
    type: "poor",
    name: "Gia đình nông dân nghèo / Lao động chân tay",
    prob: 0.50,
    starting_endowment: 800,
    family_wealth: 20,
    flag: "poverty_grit"
  },
  {
    type: "orphan",
    name: "Mồ côi / Lớn lên từ mái ấm tình thương",
    prob: 0.19,
    starting_endowment: 0,
    family_wealth: 5,
    flag: "orphan_lone_wolf"
  }
];

// BigData Bộ Gen Mã Di Truyền & Tố Chất Tiên Thiên (Hereditary Genome Database)
export const GENETICS_BIGDATA = [
  // 1. Trí Tuệ & Tư Duy Não Bộ (Cognitive & Intellectual Traits)
  {
    id: "thiên_tài_toán_học",
    name: "Thiên tài toán học & logic",
    desc: "Tư duy trừu tượng nhạy bén, tiếp thu khoa học, tài chính và phân tích dữ liệu siêu tốc",
    category: "intellect",
    rarity: "rare",
    effects: { math_prodigy: true, study_bonus: 0.25, karma_delta: 5 }
  },
  {
    id: "trí_nhớ_siêu_phàm",
    name: "Trí nhớ siêu phàm (Eidetic Memory)",
    desc: "Bộ não ghi nhớ hình ảnh tuyệt đối, học ngoại ngữ và chuyên môn nhanh gấp đôi",
    category: "intellect",
    rarity: "rare",
    effects: { memory_prodigy: true, learning_speed: 2.0 }
  },
  {
    id: "tư_duy_chiến_lược",
    name: "Tư duy chiến lược bàn cờ",
    desc: "Nhìn trước nhiều nước cờ trong kinh doanh và đàm phán, giảm 50% nguy cơ thua lỗ",
    category: "intellect",
    rarity: "uncommon",
    effects: { strategy_vision: true }
  },
  {
    id: "bộ_não_kỹ_thuật",
    name: "Bộ não kỹ thuật & sáng chế",
    desc: "Thấu hiểu máy móc, điện toán và công nghệ tự động hóa, dễ thăng tiến ngành công nghệ cao",
    category: "intellect",
    rarity: "uncommon",
    effects: { tech_prodigy: true }
  },
  {
    id: "trực_giác_kinh_doanh",
    name: "Trực giác kinh doanh nhạy bén",
    desc: "Bản năng ngửi thấy dòng tiền, dự cảm chính xác chu kỳ thị trường và tài sản sinh lời",
    category: "wealth",
    rarity: "rare",
    effects: { trade_prodigy: true, investment_boost: 0.15 }
  },
  {
    id: "tư_duy_triết_học",
    name: "Tư duy triết học & bản thể",
    desc: "Sâu sắc nội tâm, trực giác minh triết, ngộ tính cao, tích lũy Karma nhanh hơn 30%",
    category: "intellect",
    rarity: "uncommon",
    effects: { karma_rate: 1.3 }
  },

  // 2. Thể Chất, Sinh Lý & Tuổi Thọ (Physical & Longevity Traits)
  {
    id: "khỏe_mạnh_vô_song",
    name: "Khung xương kim cương",
    desc: "Cơ địa dẻo dai bẩm sinh, +15 Max Sinh Lực, đề kháng vượt trội với biến đổi thời tiết",
    category: "physical",
    rarity: "rare",
    effects: { max_vitality_delta: 15, disease_resistance: 0.4 }
  },
  {
    id: "gen_trường_thọ_bách_niên",
    name: "Gen trường thọ bách niên (FOX03)",
    desc: "Tế bào làm chậm quá trình lão hóa sau tuổi 60, kéo dài tuổi thọ sinh học, +20 Max Sinh Lực",
    category: "physical",
    rarity: "legendary",
    effects: { max_vitality_delta: 20, aging_drag_reduction: 0.5 }
  },
  {
    id: "phục_hồi_thần_tốc",
    name: "Tốc độ phục hồi thần tốc",
    desc: "Khả năng tái tạo năng lượng cực nhanh khi dưỡng sinh, xóa tan kiệt quệ sau nghỉ ngơi",
    category: "physical",
    rarity: "uncommon",
    effects: { recovery_rate: 1.5 }
  },
  {
    id: "thể_chất_vận_động_viên",
    name: "Phản xạ thần kinh vận động đỉnh cao",
    desc: "Tốc độ phản xạ thần kinh < 150ms, giảm tỷ lệ chấn thương và tăng cường sức bền",
    category: "physical",
    rarity: "uncommon",
    effects: { reflex_bonus: true, accident_protection: 0.5 }
  },
  {
    id: "thể_trạng_kháng_độc",
    name: "Hệ lọc nội tạng kháng độc tố",
    desc: "Gan mật và phổi khỏe mạnh, giảm thiểu tác hại từ khói bụi đô thị và ô nhiễm môi trường",
    category: "physical",
    rarity: "uncommon",
    effects: { toxin_resistance: true }
  },
  {
    id: "chuyển_hóa_trao_đổi_chất_vàng",
    name: "Trao đổi chất vàng (Metabolism)",
    desc: "Cơ thể tự duy trì vóc dáng săn chắc, huyết áp ổn định suốt thời thanh xuân và trung niên",
    category: "physical",
    rarity: "common",
    effects: { blood_pressure_stable: true }
  },

  // 3. Tâm Lý, Thần Kinh & Cảm Xúc (Mental & Emotional Resilience)
  {
    id: "tâm_lý_thép",
    name: "Tâm lý thép & khắc kỷ",
    desc: "Tích tụ Burnout chậm hơn 40% trước các biến cố phá sản, tang tóc và khủng hoảng",
    category: "mental",
    rarity: "rare",
    effects: { burnout_resistance: 0.4 }
  },
  {
    id: "tâm_hồn_nghệ_sĩ",
    name: "Tâm hồn nghệ sĩ & mỹ cảm",
    desc: "Trực giác thẩm mỹ nhạy cảm, bộc lộ năng khiếu hội họa, âm nhạc, văn học từ thơ bé",
    category: "creative",
    rarity: "uncommon",
    effects: { art_prodigy: true }
  },
  {
    id: "óc_nghệ_thuật",
    name: "Óc nghệ thuật tinh tế",
    desc: "Khả năng cảm thụ cái đẹp và sáng tạo nghệ thuật vượt trội",
    category: "creative",
    rarity: "common",
    effects: { art_prodigy: true }
  },
  {
    id: "ý_chí_bất_khuất",
    name: "Ý chí sinh tồn bất khuất",
    desc: "Càng bị dồn vào đường cùng càng bùng nổ sức mạnh ý chí, không bao giờ bỏ cuộc",
    category: "mental",
    rarity: "uncommon",
    effects: { crisis_grit: true }
  },
  {
    id: "thấu_cảm_xã_hội",
    name: "Trí tuệ cảm xúc (EQ) & thấu cảm",
    desc: "Khả năng đọc vị cảm xúc và tâm lý người khác, dễ xây dựng mạng lưới quan hệ sâu sắc",
    category: "social",
    rarity: "uncommon",
    effects: { eq_boost: true, network_discount: 0.25 }
  },
  {
    id: "phong_thái_lãnh_đạo",
    name: "Khí chất lãnh đạo bẩm sinh",
    desc: "Uy thế đĩnh đạc tự nhiên, thuyết phục đám đông và đàm phán thương vụ lớn dễ dàng",
    category: "social",
    rarity: "rare",
    effects: { leadership_charisma: true }
  },

  // 4. Ngoại Hình & Sức Hút Xã Hội (Aesthetic & Social Charisma)
  {
    id: "ngoại_hình_xuất_chúng",
    name: "Dung mạo khuynh thành / tuấn tú",
    desc: "Tỷ lệ gương mặt vàng thu hút ánh nhìn, luôn tạo ấn tượng tốt đẹp trong mọi giao tiếp xã hội",
    category: "social",
    rarity: "rare",
    effects: { charm_bonus: 0.3 }
  },
  {
    id: "giọng_nói_truyền_cảm",
    name: "Chất giọng thôi miên truyền cảm",
    desc: "Âm sắc trầm ấm có lực truyền cảm hứng mạnh mẽ, hỗ trợ nghề diễn thuyết, kinh doanh",
    category: "social",
    rarity: "common",
    effects: { voice_persuasion: true }
  },

  // 5. Khiếm Khuyết & Nguy Cơ Di Truyền (Genetic Vulnerabilities / Drawbacks)
  {
    id: "hệ_miễn_dịch_yếu",
    name: "Hệ miễn dịch nhạy cảm",
    desc: "Thể trạng mong manh từ thuở bé, -10 Max Sinh Lực, dễ cảm mạo theo mùa",
    category: "curse",
    rarity: "common",
    effects: { max_vitality_delta: -10 }
  },
  {
    id: "dễ_nghiện_ngập",
    name: "Thụ thể Dopamine bốc đồng",
    desc: "Dễ bị lôi kéo vào cám dỗ, cờ bạc lướt sóng hoặc thói quen tiêu xài bốc đồng khi căng thẳng",
    category: "curse",
    rarity: "common",
    effects: { addiction_vulnerability: true }
  },
  {
    id: "tiền_sử_tim_mạch_di_truyền",
    name: "Tiền sử tim mạch di truyền",
    desc: "Huyết áp dễ tăng vọt khi gặp cú sốc tinh thần, cần kiểm soát chỉ số tim mạch cẩn thận",
    category: "curse",
    rarity: "uncommon",
    effects: { bp_spike_risk: true }
  },
  {
    id: "tâm_trí_u_uất",
    name: "Thể tạng u uất nhạy cảm",
    desc: "Dễ chìm vào suy nghĩ tiêu cực khi gặp thất bại, Burnout tích lũy nhanh hơn 20%",
    category: "curse",
    rarity: "common",
    effects: { burnout_rate: 1.2 }
  },
  {
    id: "hội_chứng_mất_ngủ_kinh_niên",
    name: "Mất ngủ kinh niên bẩm sinh",
    desc: "Khó vào giấc ngủ sâu, khiến năng lượng hồi phục kém hơn người bình thường",
    category: "curse",
    rarity: "common",
    effects: { sleep_disorder: true }
  },
  {
    id: "cận_thị_bẩm_sinh",
    name: "Thị lực kém bẩm sinh",
    desc: "Mắt kém từ nhỏ, cần đeo kính điều chỉnh và chăm sóc thị lực thường xuyên",
    category: "curse",
    rarity: "common",
    effects: { eyesight_flaw: true }
  },

  // 6. Đột Biến Hiếm & Huyết Thống Thần Kỳ (Rare & Legendary Mutations)
  {
    id: "mắt_nhìn_xuyên_thị_trường",
    name: "Nhãn quan đầu tư xuyên thấu",
    desc: "Đột biến quý hiếm: Dự cảm chính xác đỉnh bong bóng tài sản trước khi đổ vỡ",
    category: "rare",
    rarity: "legendary",
    effects: { market_insight: true, investment_boost: 0.3 }
  },
  {
    id: "giác_ngộ_tâm_linh_tiên_thiên",
    name: "Căn duyên giác ngộ tiên thiên",
    desc: "Linh hồn mang theo phước đức lớn từ tiền kiếp, khởi đầu kiếp người với +25 Karma vĩnh cửu",
    category: "rare",
    rarity: "legendary",
    effects: { starting_karma: 25 }
  },
  {
    id: "gen_ngủ_ngắn_sleepless",
    name: "Hội chứng ngủ ngắn gen DEC2",
    desc: "Chỉ cần 4 tiếng ngủ mỗi đêm là hồi phục 100% năng lượng, sở hữu thêm +1 Điểm Hành Động (AP)",
    category: "rare",
    rarity: "legendary",
    effects: { bonus_ap: 1 }
  },
  {
    id: "huyết_thống_trâm_anh",
    name: "Huyết thống trâm anh di truyền",
    desc: "Thừa hưởng khí chất quý tộc của dòng dõi lâu đời, được giới thượng lưu nể trọng",
    category: "rare",
    rarity: "rare",
    effects: { prestige_boost: true }
  }
];

export const GENETICS_POOL = GENETICS_BIGDATA;

// Localized Names Dictionary by Country
export const NAMES_BY_COUNTRY = {
  "Việt Nam": [
    "Nguyễn Văn An", "Trần Minh Quân", "Lê Bảo Long", "Phạm Hải Đăng",
    "Hoàng Quốc Bảo", "Đỗ Tuấn Khang", "Vũ Hoàng Nam", "Bùi Trọng Nghĩa",
    "Nguyễn Hoàng Yến", "Trần Thảo Linh", "Lê Thanh Trúc", "Đặng Ngọc Mai"
  ],
  "Ba Lan": [
    "Jakub Kowalski", "Kacper Wiśniewski", "Mikołaj Lewandowski", "Szymon Dąbrowski",
    "Jan Zieliński", "Aleksander Woźniak", "Filip Mazur", "Michał Kaczmarek",
    "Zofia Kamińska", "Julia Wójcik", "Lena Szymańska", "Maja Kozłowska"
  ],
  "Nhật Bản": [
    "Ren Takahashi", "Haruto Sato", "Yuto Tanaka", "Kaito Yamamoto",
    "Sota Kobayashi", "Riku Watanabe", "Hayato Nakamura", "Daiki Ito",
    "Aoi Suzuki", "Hina Watanabe", "Sakura Ito", "Yui Nakamura"
  ],
  "Hoa Kỳ": [
    "Ethan Walker", "James Miller", "Alexander Hayes", "Liam Johnson",
    "Benjamin Clark", "Lucas Anderson", "Mason Wright", "Oliver Davis",
    "Olivia Smith", "Sophia Davis", "Charlotte Brown", "Emma Wilson"
  ],
  "Na Uy": [
    "Henrik Hansen", "Magnus Olsen", "Lars Johansen", "Jonas Pedersen",
    "Tobias Moen", "Eirik Dahl", "Sander Berg", "Kristian Haugen",
    "Ingrid Berg", "Astrid Larsen", "Nora Haugen", "Emilie Nilsen"
  ],
  "Thụy Sĩ": [
    "Lukas Meier", "Noah Schmid", "Matteo Bernasconi", "Elias Weber",
    "Julian Fontana", "David Frei", "Samuel Keller", "Luca Rossi",
    "Leonie Keller", "Mia Gerber", "Sophie Müller", "Elena Bianchi"
  ],
  "Thái Lan": [
    "Somchai Prasert", "Kittisak Wattana", "Thanawat Suksom", "Chayanin Boonsri",
    "Phurinat Saetang", "Natthanan Chaiyasit", "Krittin Saelim", "Wichai Rattana",
    "Nattaporn Rattanaporn", "Pornpimol Saetang", "Apinya Chaiyasit", "Kanya Siriporn"
  ],
  "Brazil": [
    "Lucas Silva", "Gabriel Santos", "Matheus Oliveira", "Thiago Costa",
    "Rafael Lima", "Felipe Alves", "Rodrigo Ferreira", "Bruno Carvalho",
    "Isabella Souza", "Sophia Pereira", "Beatriz Rodrigues", "Mariana Gomes"
  ],
  "Syria": [
    "Omar Al-Dimashqi", "Tariq Al-Halabi", "Zayd Mansoor", "Kareem Haddad",
    "Bashir Kabbani", "Samir Nader", "Youssef Shammas", "Mustafa Barakat",
    "Layla Al-Khatib", "Fatima Al-Sayed", "Noor Shammas", "Mariam Al-Halabi"
  ],
  "Haiti": [
    "Jean-Baptiste Louverture", "Pierre Celestin", "Dieudonné Francois", "Fabrice Augustin",
    "Emmanuel Duval", "Jacques Toussaint", "Ronaldo Saint-Fort", "Gaston Philippe",
    "Marie Joseph", "Guerline Michel", "Rose-Merline Jean", "Nathalie Belizaire"
  ],
  "Somalia": [
    "Abdi Hassan", "Mohamed Farah", "Warsame Gedi", "Guled Osman",
    "Dahir Duale", "Hassan Shire", "Liban Ali", "Khadar Barre",
    "Amina Jama", "Halima Warsame", "Fadumo Shire", "Sahra Nuur"
  ]
};

export function generateLocalizedName(countryName = "Việt Nam", lineageParent = null, gender = null) {
  const chosenGender = gender || (Math.random() < 0.5 ? 'male' : 'female');
  let surname = null;
  if (lineageParent && lineageParent.name) {
    surname = extractFamilySurname(lineageParent.name, countryName);
  }
  return generateCulturallyAuthenticName(countryName, 'character', chosenGender, surname);
}

export function executeProceduralRebirth(karmaPerks = {}, lineageParent = null) {
  // 0. CHECK PUNISHMENT REALM: HUNGRY GHOST REALM (Cõi Ngạ Quỷ if total_karma < 0)
  const isHungryGhost = Boolean(karmaPerks.is_hungry_ghost || (karmaPerks.total_karma !== undefined && karmaPerks.total_karma < 0));

  // 1. Roll Nationality Tier
  let countryTier = "T2";
  const tierRoll = Math.random();

  if (isHungryGhost) {
    countryTier = "T3";
  } else if (karmaPerks.lock_t1_t2) {
    countryTier = Math.random() < 0.35 ? "T1" : "T2";
  } else {
    if (tierRoll < 0.15) countryTier = "T1";
    else if (tierRoll < 0.75) countryTier = "T2";
    else countryTier = "T3";
  }

  const countryList = COUNTRIES[countryTier] || COUNTRIES.T3;
  const chosenCountry = countryList[Math.floor(Math.random() * countryList.length)];
  const cities = chosenCountry.cities || [`Thủ đô ${chosenCountry.name}`];
  const chosenCity = cities[Math.floor(Math.random() * cities.length)];

  // 2. Roll Family Background
  let chosenBackground = FAMILY_BACKGROUNDS[2]; // Default poor
  if (isHungryGhost) {
    chosenBackground = {
      type: "orphan",
      name: "Cõi Ngạ Quỷ (Khu Ổ Chuột Đói Nghèo Cùng Cực)",
      prob: 1.0,
      starting_endowment: 0,
      family_wealth: 0,
      flag: "cursed_bloodline"
    };
  } else if (lineageParent) {
    // Inherited background from deceased parent
    if (lineageParent.cash > 1000000) {
      chosenBackground = FAMILY_BACKGROUNDS[0]; // Super rich
    } else if (lineageParent.cash > 50000) {
      chosenBackground = FAMILY_BACKGROUNDS[1]; // Middle class
    } else {
      chosenBackground = FAMILY_BACKGROUNDS[2];
    }
  } else if (karmaPerks.golden_cradle || karmaPerks.guarantee_middle_class) {
    chosenBackground = Math.random() < 0.2 ? FAMILY_BACKGROUNDS[0] : FAMILY_BACKGROUNDS[1];
  } else {
    const bgRoll = Math.random();
    let cumulative = 0;
    for (const bg of FAMILY_BACKGROUNDS) {
      cumulative += bg.prob;
      if (bgRoll <= cumulative) {
        chosenBackground = bg;
        break;
      }
    }
  }

  // Initial Housing by background
  let initialHousing = {
    tier: 1,
    id: "slum_shared",
    name: "Phòng trọ / Mái ấm bình dân",
    address: `Hẻm lao động, ${chosenCity}`,
    status: "rented"
  };
  if (chosenBackground.type === "super_rich") {
    initialHousing = {
      tier: 5,
      id: "grand_manor",
      name: "Dinh thự hào môn tư gia",
      address: `Khu biệt lập VIP, ${chosenCity}`,
      status: "owned"
    };
  } else if (chosenBackground.type === "middle_class") {
    initialHousing = {
      tier: 3,
      id: "townhouse_central",
      name: "Nhà phố gia đình trung tâm",
      address: `Mặt tiền phố thị, ${chosenCity}`,
      status: "owned"
    };
  }

  // 3. Roll Innate Traits from BigData (True Mendelian & Hereditary Genetics)
  let traits = [];

  // A. Karma Perk: Chosen Trait
  if (karmaPerks.chosen_trait) {
    const matched = GENETICS_BIGDATA.find(g => g.id === karmaPerks.chosen_trait);
    if (matched) traits.push(matched);
  }

  // B. Lineage Hereditary Trait (Inherit from parent with 65% probability)
  if (lineageParent && lineageParent.innate_traits && lineageParent.innate_traits.length > 0 && traits.length === 0) {
    const parentPrimaryId = lineageParent.innate_traits[0];
    const parentTrait = GENETICS_BIGDATA.find(g => g.id === parentPrimaryId);
    if (parentTrait && Math.random() < 0.65) {
      traits.push(parentTrait);
    }
  }

  // C. Primary Core Trait (Positive / Talent)
  const positivePool = GENETICS_BIGDATA.filter(t => t.category !== 'curse' && !traits.some(x => x.id === t.id));
  if (traits.length === 0) {
    const primary = positivePool[Math.floor(Math.random() * positivePool.length)];
    traits.push(primary);
  }

  // D. Secondary Trait (Complementary Trait)
  const remainingPositive = positivePool.filter(t => !traits.some(x => x.id === t.id));
  if (traits.length < 2 && remainingPositive.length > 0) {
    const secondary = remainingPositive[Math.floor(Math.random() * remainingPositive.length)];
    traits.push(secondary);
  }

  // E. Tertiary Genetic Feature: 30% chance Drawback (Curse) or 10% chance Rare Mutation
  const rollTertiary = Math.random();
  if (rollTertiary < 0.30) {
    const curses = GENETICS_BIGDATA.filter(t => t.category === 'curse' && !traits.some(x => x.id === t.id));
    if (curses.length > 0) {
      traits.push(curses[Math.floor(Math.random() * curses.length)]);
    }
  } else if (rollTertiary > 0.90) {
    const rareMutations = GENETICS_BIGDATA.filter(t => t.category === 'rare' && !traits.some(x => x.id === t.id));
    if (rareMutations.length > 0) {
      traits.push(rareMutations[Math.floor(Math.random() * rareMutations.length)]);
    }
  }

  // 4. Initial Character Assembly with Strict Patrilineal Lineage
  const gender = karmaPerks.preferred_gender || (Math.random() < 0.5 ? 'male' : 'female');
  let householdContext = null;
  let characterName = "";

  if (chosenBackground.type === "orphan") {
    householdContext = {
      father_name: null,
      mother_name: null,
      family_title: "Mái ấm tình thương / Nhà tình thương bảo trợ xã hội",
      annual_allowance: 0,
      family_vibe: "Thiếu thốn tình thương cha mẹ nhưng trui rèn tính tự lập từ nhỏ.",
      parents_status: "deceased_or_abandoned"
    };
    // Trẻ mồ côi không rõ gốc gác -> random 100% tên mới
    characterName = generateCulturallyAuthenticName(chosenCountry.name, 'orphan', gender);
  } else {
    const countryData = getCountryBigData(chosenCountry.name);

    // Patrilineal Lineage: Xác định Họ của Cha trước
    const fatherName = lineageParent ? lineageParent.name : generateCulturallyAuthenticName(chosenCountry.name, 'father', 'male');
    const childSurname = extractFamilySurname(fatherName, chosenCountry.name);

    // Tên của con: Kế thừa họ của Cha + tên gọi bản địa
    characterName = generateCulturallyAuthenticName(chosenCountry.name, 'child', gender, childSurname);

    // Tạo tên Mẹ với Họ ngoại riêng biệt (không trùng họ cha)
    let motherName = generateCulturallyAuthenticName(chosenCountry.name, 'mother', 'female');
    let motherSurname = extractFamilySurname(motherName, chosenCountry.name);
    if (motherSurname === childSurname && countryData.surnames.length > 1) {
      const otherSurnames = countryData.surnames.filter(s => s !== childSurname);
      const chosenMaidenSurname = otherSurnames[Math.floor(Math.random() * otherSurnames.length)];
      motherName = generateCulturallyAuthenticName(chosenCountry.name, 'mother', 'female', chosenMaidenSurname);
    }

    // Nghề nghiệp & Không khí gia đình theo BigData Quốc gia
    const bgKey = chosenBackground.type === 'super_rich' ? 'rich' : chosenBackground.type === 'middle_class' ? 'middle' : 'poor';
    const localizedJobs = countryData.family_jobs ? countryData.family_jobs[bgKey] : null;

    let annualAllowance = chosenBackground.type === "super_rich" ? 5000 : chosenBackground.type === "middle_class" ? 800 : 100;
    let fatherJob = localizedJobs?.father || "Công nhân xưởng máy / Buôn bán nhỏ";
    let motherJob = localizedJobs?.mother || "Lao động tự do / Nội trợ gia đình";
    let familyVibe = localizedJobs?.vibe || "Gia đình đầm ấm nhưng chật vật mưu sinh.";

    let familyBuff = {
      id: "labor_resilience",
      name: "Gia Phong Cần Lao",
      description: "Tôi luyện tính tự lập (+15% Chống chịu kiệt sức)",
      stat: "resilience",
      bonus: 0.15
    };

    if (chosenBackground.type === "super_rich") {
      familyBuff = {
        id: "patrician_backing",
        name: "Hào Môn Hậu Thuẫn",
        description: "Quan hệ giới tinh hoa (+25% Cơ hội đàm phán & Thương trường)",
        stat: "finance",
        bonus: 0.25
      };
    } else if (chosenBackground.type === "middle_class") {
      familyBuff = {
        id: "intellect_home",
        name: "Gia Giáo Trí Thức",
        description: "Môi trường học tập sớm (+20% EXP kỹ năng Trí Tuệ & Giảm 15% hao hụt sinh lực)",
        stat: "intellect",
        bonus: 0.20
      };
    }

    householdContext = {
      father_name: fatherName,
      father_job: fatherJob,
      father_status: "alive",
      father_age: 28,
      mother_name: motherName,
      mother_job: motherJob,
      mother_status: "alive",
      mother_age: 26,
      annual_allowance: annualAllowance,
      family_vibe: familyVibe,
      family_buff: familyBuff,
      family_meals_available: 1,
      parents_status: "alive",
      marital_status: "happy"
    };
  }

  const name = characterName;

  const initialHiddenFlags = [chosenBackground.flag];
  if (isHungryGhost) {
    initialHiddenFlags.push("chronic_hunger", "hungry_ghost_realm", "cursed_bloodline");
  }
  if (lineageParent) {
    if (lineageParent.cash > 5000000) initialHiddenFlags.push("con_của_đại_gia");
    if (lineageParent.hidden_flags && lineageParent.hidden_flags.includes("high_debt")) initialHiddenFlags.push("gánh_nợ_gia_tộc");
  }

  const startingEndowment = lineageParent 
    ? Math.round(Math.max(0, lineageParent.cash) * 0.7) // 30% inheritance tax
    : (isHungryGhost ? 0 : chosenBackground.starting_endowment);

  const charId = crypto.randomUUID();

  return {
    id: charId,
    name,
    age: 0,
    generation: lineageParent ? (lineageParent.generation || 1) + 1 : 1,
    parent_name: lineageParent ? lineageParent.name : null,
    nationality: chosenCountry.name,
    nationality_code: chosenCountry.id,
    country_flag: chosenCountry.flag,
    country_tier: countryTier,
    current_city: chosenCity,
    housing: initialHousing,
    background: chosenBackground.name,
    background_type: chosenBackground.type,
    household: householdContext,
    innate_traits: traits.map(t => t.id || t),
    traits_detailed: traits,
    personality_flags: [], // Populated during Childhood Milestones
    vitality: (() => {
      let v = 90;
      let mv = 95;
      for (const t of traits) {
        if (t.effects?.max_vitality_delta) {
          mv += t.effects.max_vitality_delta;
          v += t.effects.max_vitality_delta;
        }
      }
      if (karmaPerks.longevity_root) {
        mv += 15;
        v += 15;
      }
      if (isHungryGhost) { v = 45; mv = 60; }
      return Math.min(mv, Math.max(30, v));
    })(),
    max_vitality: (() => {
      let mv = 95;
      for (const t of traits) {
        if (t.effects?.max_vitality_delta) mv += t.effects.max_vitality_delta;
      }
      if (karmaPerks.longevity_root) mv += 15;
      if (isHungryGhost) mv = 60;
      return Math.max(60, Math.min(125, mv));
    })(),
    transhuman_frozen_until_age: null,
    is_transhuman: false,
    cash: householdContext.annual_allowance, // Starting allowance based on family status
    family_endowment: startingEndowment, // Family wealth waiting for adulthood
    burnout: 0,
    karma: 100 + (traits.reduce((sum, t) => sum + (t.effects?.starting_karma || 0), 0)),
    action_points: 3 + (traits.reduce((sum, t) => sum + (t.effects?.bonus_ap || 0), 0)),
    skills: {
      tech_logic: { level: 0, name: "Trí Tuệ & Công Nghệ" },
      finance_market: { level: 0, name: "Tài Chính & Thương Trường" },
      resilience_health: { level: 0, name: "Sinh Lực & Khắc Kỷ" },
      leadership_social: { level: 0, name: "Lãnh Đạo & Ngoại Giao" }
    },
    hidden_flags: initialHiddenFlags,
    delayed_flags: [],
    recent_event_tags: [],
    experienced_scenarios: [],
    timeline_snapshots: [
      {
        age: 0,
        net_worth: 0,
        vitality: 90,
        burnout: 0,
        event: `Chào đời tại ${chosenCountry.name} (${chosenCountry.flag})`
      }
    ],
    global_indices: {
      economy: 65,
      social: 65,
      environment: 65
    },
    history_log: [
      {
        age: 0,
        event: `Chào đời tại ${chosenCountry.name} ${chosenCountry.flag} trong một ${chosenBackground.name.toLowerCase()}.`,
        choice: "Cất tiếng khóc chào đời"
      }
    ],
    is_deceased: false,
    death_cause: "",
    death_age: null,
    created_at: new Date()
  };
}

// Childhood Fast-Forward Milestones (Ages 6, 12, 18)
// Zero currency mechanics — purely shapes Personality Flags (cynical, empathetic, stoic, rebellious, pragmatic)
export function getChildhoodMilestones(character) {
  const country = character.nationality;

  return [
    {
      age: 6,
      title: "Cột Mốc 6 Tuổi: Cổng Trường Mầm Non & Va Chạm Đầu Đời",
      narrative: `Năm 6 tuổi tại ${country}, trong một buổi tan học, bạn bị nhóm trẻ lớn hơn chặn đường giật mất món đồ chơi yêu thích. Bạn phải đưa ra phản xạ đầu đời.`,
      options: [
        {
          id: "M6_REBEL",
          action_title: "Lao vào cắn trả quyết liệt",
          consequence_hint: "Bị bầm tím mặt mày nhưng không ai dám bắt nạt nữa. Hình thành khí chất Nổi loạn.",
          effects: {
            karma_delta: 0,
            vitality_delta: -5,
            add_personality_flag: "rebellious",
            add_flags: ["child_fighter"]
          }
        },
        {
          id: "M6_STOIC",
          action_title: "Lặng lẽ cắn răng nhẫn nhịn",
          consequence_hint: "Không khóc lóc, quan sát đối thủ và âm thầm rèn luyện. Hình thành khí chất Khắc kỷ.",
          effects: {
            karma_delta: 5,
            burnout_delta: 5,
            add_personality_flag: "stoic",
            add_flags: ["child_stoic"]
          }
        },
        {
          id: "M6_EMPATH",
          action_title: "Chủ động chia kẹo hòa giải",
          consequence_hint: "Biến kẻ thù thành bạn chơi cùng. Hình thành khí chất Thấu cảm xã hội.",
          effects: {
            karma_delta: 15,
            add_personality_flag: "empathetic",
            add_flags: ["child_diplomat"]
          }
        }
      ]
    },
    {
      age: 12,
      title: "Cột Mốc 12 Tuổi: Biến Cố Gia Đình & Cơn Bão Tuổi Dậy Thì",
      narrative: `Năm 12 tuổi, kinh tế gia đình đối mặt biến cố lớn. Tiếng cãi vã của người lớn vang lên mỗi đêm sau những bữa cơm chan nước mắt. Bạn đối diện với sự nghiệt ngã của thực tế.`,
      options: [
        {
          id: "M12_PRAGMATIC",
          action_title: "Đi nhặt ve chai, làm thêm sớm phụ cha mẹ",
          consequence_hint: "Hiểu sâu sắc giá trị đồng tiền mồ hôi nước mắt. Hình thành khí chất Thực dụng.",
          effects: {
            vitality_delta: -5,
            burnout_delta: 10,
            add_personality_flag: "pragmatic",
            add_flags: ["early_survivalist"]
          }
        },
        {
          id: "M12_CYNICAL",
          action_title: "Khép kín tâm hồn, hoài nghi mọi người lớn",
          consequence_hint: "Vùi đầu vào sách vở, tin rằng chỉ có tri thức và bản thân là điểm tựa duy nhất.",
          effects: {
            burnout_delta: 15,
            karma_delta: -5,
            add_personality_flag: "cynical",
            add_flags: ["lone_intellect"]
          }
        },
        {
          id: "M12_EMPATH",
          action_title: "Làm chiếc cầu nối hòa giải trong gia đình",
          consequence_hint: "Chấp nhận gánh nặng tâm lý để giữ gìn mái ấm. Củng cố khí chất Thấu cảm.",
          effects: {
            karma_delta: 20,
            burnout_delta: 15,
            add_personality_flag: "empathetic",
            add_flags: ["family_anchor"]
          }
        }
      ]
    },
    {
      age: 18,
      title: "Cột Mốc 18 Tuổi: Ngã Rẽ Trưởng Thành & Bước Vào Đời",
      narrative: `18 tuổi. Thời niên thiếu chính thức khép lại. Quyền bảo bọc gia đình chấm dứt, tài khoản cá nhân chính thức mở khóa. Đâu là tôn chỉ bước vào thế giới người lớn?`,
      options: [
        {
          id: "M18_PRAGMATIC",
          action_title: "Dấn thân thương trường / Buôn bán tự do",
          consequence_hint: "Bắt đầu bươn chải kiếm tiền ngay lập tức. Tăng cường cờ Thực dụng & Nhạy bén kinh doanh.",
          effects: {
            add_personality_flag: "pragmatic",
            add_flags: ["self_made_hustler"]
          }
        },
        {
          id: "M18_STOIC",
          action_title: "Vào đại học công nghệ / Viện y dược",
          consequence_hint: "Chấp nhận nhiều năm đèn sách gian khổ vì tương lai chuyên gia. Củng cố cờ Khắc kỷ.",
          effects: {
            add_personality_flag: "stoic",
            add_flags: ["academic_path"]
          }
        },
        {
          id: "M18_REBEL",
          action_title: "Tự do phiêu lãng / Sống theo trực giác",
          consequence_hint: "Bất chấp định kiến xã hội, đi tìm lẽ sống riêng. Củng cố cờ Nổi loạn.",
          effects: {
            add_personality_flag: "rebellious",
            add_flags: ["free_spirited"]
          }
        }
      ]
    }
  ];
}

// Generate Passive Childhood Chronicle Event (Automatic, No Choice Required)
export function generatePassiveChildhoodEvent(character) {
  const age = Number(character.age ?? 0);
  if (age >= 18) return null;

  const traits = character.innate_traits || [];
  const household = character.household || {
    father_name: "Cha",
    father_job: "Lao động",
    mother_name: "Mẹ",
    mother_job: "Nội trợ",
    annual_allowance: 100
  };

  // 1. Check Prodigy & Genetic Vulnerability Traits (Mã Gen Tiên Thiên)
  // Vulnerabilities & Curses (Tạo chiều sâu và sức nặng sinh tồn ngay từ thơ bé)
  if (traits.includes("hệ_miễn_dịch_yếu") && (age === 4 || age === 7 || age === 11 || age === 15)) {
    return {
      type: "curse_fragile_health",
      title: `🤧 Thể Tạng Mong Manh & Những Đợt Kháng Sinh (${age} Tuổi)`,
      narrative: `Do sở hữu [Hệ miễn dịch nhạy cảm], bạn ốm sốt triền miên mỗi đợt giao mùa. Mẹ thức trắng đêm chườm trán, cho bạn uống từng thìa thuốc đắng. Những ngày nằm viện giúp bạn trân trọng sâu sắc từng giọt sinh lực.`,
      effects: { karma_delta: 10, vitality_delta: -6, cash_delta: -30 },
      flag: "fragile_childhood_resilience"
    };
  }

  if (traits.includes("cận_thị_bẩm_sinh") && (age === 6 || age === 9 || age === 13)) {
    return {
      type: "curse_eyesight",
      title: `👓 Cặp Kính Cận Đầu Đời Cuối Lớp (${age} Tuổi)`,
      narrative: `Mắt mờ dần do [Thị lực kém bẩm sinh], bạn ngồi bàn chót nhìn bảng đen chỉ thấy những vệt phấn nhòe. Bố chắt chiu dành dụm dẫn bạn đi đo mắt, cắt chiếc kính cận đầu tiên. Thế giới bỗng rõ nét lạ kỳ.`,
      effects: { karma_delta: 6, vitality_delta: 0, cash_delta: -50 },
      flag: "child_glasses_lens"
    };
  }

  if (traits.includes("tiền_sử_tim_mạch_di_truyền") && (age === 8 || age === 12 || age === 16)) {
    return {
      type: "curse_cardio",
      title: `💓 Nhịp Tim Hồi Hộp Tuổi Trưởng Thành (${age} Tuổi)`,
      narrative: `Tác động từ [Tiền sử tim mạch di truyền] khiến bạn thường xuyên hụt hơi khi leo cầu thang hoặc tập thể dục gắng sức. Bác sĩ dặn dò bạn phải giữ nhịp thở điều hòa và tránh nóng giận bốc đồng.`,
      effects: { karma_delta: 8, vitality_delta: -4, cash_delta: 0 },
      flag: "childhood_cardio_caution"
    };
  }

  if (traits.includes("tâm_trí_u_uất") && (age === 7 || age === 11 || age === 15)) {
    return {
      type: "curse_melancholy",
      title: `🌧️ Tâm Hồn U Uất & Khung Cửa Sổ Mưa (${age} Tuổi)`,
      narrative: `Thể tạng u uất khiến bạn thu mình trong góc phòng mỗi khi gặp chuyện buồn ở lớp. Nhìn những giọt mưa lăn dài, bạn học cách viết nhật ký để bầu bạn cùng nỗi cô đơn.`,
      effects: { karma_delta: 12, vitality_delta: 0, cash_delta: 0 },
      flag: "childhood_melancholy_diary"
    };
  }

  if (traits.includes("ý_chí_bất_khuất") && (age === 6 || age === 10 || age === 14)) {
    return {
      type: "prodigy_grit",
      title: `🔥 Ý Chí Sắt Đá Trước Nghịch Cảnh (${age} Tuổi)`,
      narrative: `Sở hữu [Ý chí sinh tồn bất khuất], dù bị bạn bè trêu chọc hay kinh tế gia đình khốn đốn, bạn không bao giờ rơi một giọt nước mắt van xin. Bạn âm thầm rèn luyện, biến gian khó thành sức bật kiên cường.`,
      effects: { karma_delta: 18, vitality_delta: 5, cash_delta: 20 },
      flag: "unbroken_will_spirit"
    };
  }

  if (traits.includes("phong_thái_lãnh_đạo") && (age === 7 || age === 11 || age === 15)) {
    return {
      type: "prodigy_leader",
      title: `👑 Uy Tín Thủ Lĩnh Học Đường (${age} Tuổi)`,
      narrative: `Nhờ mang [Khí chất lãnh đạo bẩm sinh], lời nói của bạn luôn có sức nặng tự nhiên. Thầy cô và bạn bè nhất trí bầu bạn làm Đội trưởng/Lớp trưởng chỉ huy các hoạt động phong trào toàn trường.`,
      effects: { karma_delta: 15, vitality_delta: 2, cash_delta: 40 },
      flag: "prodigy_leader"
    };
  }

  if (traits.includes("gen_ngủ_ngắn_sleepless") && (age === 8 || age === 12 || age === 16)) {
    return {
      type: "prodigy_dec2",
      title: `⚡ Đột Biến Gen DEC2: Năng Lượng Bất Tận (${age} Tuổi)`,
      narrative: `Chỉ cần 4 tiếng ngủ mỗi đêm là hồi phục hoàn toàn nhờ [Gen ngủ ngắn DEC2]. Trong khi bạn bè say ngủ, bạn đọc xong hàng chục bộ sách quý, học tập năng suất gấp đôi người thường.`,
      effects: { karma_delta: 12, vitality_delta: 8, cash_delta: 50 },
      flag: "prodigy_dec2_vigorous"
    };
  }

  if (traits.includes("giác_ngộ_tâm_linh_tiên_thiên") && (age === 5 || age === 9 || age === 14)) {
    return {
      type: "prodigy_spiritual",
      title: `🪷 Thiện Căn Sâu Dày & Giác Ngộ Sớm (${age} Tuổi)`,
      narrative: `Mang theo [Căn duyên giác ngộ tiên thiên], bạn có lòng trắc ẩn kỳ lạ với chim muông cây cỏ. Bạn biết gom đồ ăn thừa cho mèo hoang và nhường phần quà của mình cho bạn nhỏ nghèo khó hơn.`,
      effects: { karma_delta: 30, vitality_delta: 5, cash_delta: 0 },
      flag: "prodigy_sacred_merit"
    };
  }

  if (traits.includes("tâm_lý_thép") && (age === 7 || age === 12 || age === 16)) {
    return {
      type: "prodigy_stoic",
      title: `🛡️ Tâm Lý Thép & Điềm Tĩnh Trước Biến Cố (${age} Tuổi)`,
      narrative: `Đối mặt với sự cố giao thông hay kỳ thi tuyển sinh căng thẳng, [Tâm lý thép] giúp bạn duy trì nhịp tim ổn định và cái đầu lạnh, xử lý tình huống chính xác tuyệt đối khiến người lớn ngỡ ngàng.`,
      effects: { karma_delta: 15, vitality_delta: 5, cash_delta: 0 },
      flag: "prodigy_iron_mind"
    };
  }

  if (traits.includes("ngoại_hình_xuất_chúng") && (age === 6 || age === 11 || age === 15)) {
    return {
      type: "prodigy_charm",
      title: `✨ Dung Mạo Khôi Ngô / Khuynh Thành (${age} Tuổi)`,
      narrative: `Nhờ sở hữu [Dung mạo xuất chúng], nụ cười sáng trong của bạn làm bừng sáng mọi nơi bạn đến. Đi chợ cùng mẹ luôn được các cô bác tiểu thương yêu quý tặng thêm quà bánh.`,
      effects: { karma_delta: 12, vitality_delta: 2, cash_delta: 35 },
      flag: "prodigy_stunning_look"
    };
  }

  if (traits.includes("thể_chất_vận_động_viên") && (age === 5 || age === 9 || age === 13)) {
    return {
      type: "prodigy_reflex",
      title: `🏅 Phản Xạ Thần Kinh & Quán Quân Điền Kinh (${age} Tuổi)`,
      narrative: `Với [Phản xạ vận động đỉnh cao], bạn dễ dàng né tránh các va chạm nguy hiểm khi nô đùa và giành huy chương Vàng giải thể thao thiếu niên cấp quận.`,
      effects: { karma_delta: 10, vitality_delta: 12, cash_delta: 80 },
      flag: "prodigy_fast_reflex"
    };
  }

  // Talents bẩm sinh trí tuệ & sáng tạo
  if (traits.includes("thiên_tài_toán_học") && (age === 4 || age === 7 || age === 11)) {
    return {
      type: "prodigy_intellect",
      title: `🧠 Thần Đồng Toán Học & Logic (${age} Tuổi)`,
      narrative: `Nhờ sở hữu tố chất [Thiên tài toán học], bạn giải nhoay nhoáy các bài toán đố hóc búa của anh chị lớn. Cha bạn (${household.father_name || "Cha"}) tự hào mua tặng bạn cuốn bách khoa tri thức đầu tiên.`,
      effects: { karma_delta: 15, vitality_delta: 0, cash_delta: 60 },
      flag: "prodigy_math_genius"
    };
  }

  if (traits.includes("trực_giác_kinh_doanh") && (age === 6 || age === 9 || age === 14)) {
    return {
      type: "prodigy_wealth",
      title: `🪙 Bản Lĩnh Con Buôn Nhí (${age} Tuổi)`,
      narrative: `Bộc lộ máu kinh doanh từ thuở ấu thơ [Trực giác kinh doanh], bạn gom đồ chơi cũ và tranh ảnh chia lại cho bạn bè trong xóm, thu về món tiền đầu đời bỏ heo đất.`,
      effects: { karma_delta: 8, vitality_delta: 0, cash_delta: 150 },
      flag: "prodigy_little_merchant"
    };
  }

  if ((traits.includes("óc_nghệ_thuật") || traits.includes("tâm_hồn_nghệ_sĩ")) && (age === 5 || age === 8 || age === 13)) {
    return {
      type: "prodigy_art",
      title: `🎨 Năng Khiếu Nghệ Thuật Sớm (${age} Tuổi)`,
      narrative: `Tâm hồn nhạy cảm [Tâm hồn nghệ sĩ] giúp bạn vẽ nên bức tranh mái ấm gia đình sống động. Mẹ bạn (${household.mother_name || "Mẹ"}) xúc động lồng khung kính treo trang trọng giữa phòng khách.`,
      effects: { karma_delta: 15, vitality_delta: 5, cash_delta: 0 },
      flag: "prodigy_artistic_soul"
    };
  }

  if (traits.includes("trí_nhớ_siêu_phàm") && (age === 4 || age === 8 || age === 12)) {
    return {
      type: "prodigy_memory",
      title: `📚 Thần Đồng Trí Nhớ Siêu Phàm (${age} Tuổi)`,
      narrative: `Nhờ sở hữu [Trí nhớ siêu phàm], bạn thuộc lòng hàng ngàn từ vựng và kinh sách sau một lần đọc lướt. Thầy cô kinh ngạc khen ngợi bạn trước toàn trường.`,
      effects: { karma_delta: 15, vitality_delta: 0, cash_delta: 60 },
      flag: "prodigy_eidetic_memory"
    };
  }

  if (traits.includes("bộ_não_kỹ_thuật") && (age === 6 || age === 10 || age === 15)) {
    return {
      type: "prodigy_tech",
      title: `⚙️ Thần Đồng Sáng Chế & Cơ Khí (${age} Tuổi)`,
      narrative: `Với tố chất [Bộ não kỹ thuật], bạn tự tháo lắp và sửa chữa thành công đồng hồ cũ cùng đài radio hỏng của gia đình, bộc lộ tài năng kỹ sư sớm.`,
      effects: { karma_delta: 12, vitality_delta: 2, cash_delta: 80 },
      flag: "prodigy_engineer"
    };
  }

  if (traits.includes("gen_trường_thọ_bách_niên") && (age === 5 || age === 10 || age === 16)) {
    return {
      type: "prodigy_longevity",
      title: `🌿 Cốt Cách Trường Thọ Bách Niên (${age} Tuổi)`,
      narrative: `Sở hữu [Gen trường thọ], cơ thể bạn phát triển thanh thoát và tràn đầy sinh khí. Cả năm không bao giờ ốm vặt, năng lượng dồi dào khiến ai cũng trầm trồ.`,
      effects: { karma_delta: 10, vitality_delta: 15, cash_delta: 0 },
      flag: "prodigy_longevity_grace"
    };
  }

  if (traits.includes("mắt_nhìn_xuyên_thị_trường") && (age === 7 || age === 11 || age === 16)) {
    return {
      type: "prodigy_market",
      title: `👁️ Nhãn Quan Đầu Tư Thiên Bẩm (${age} Tuổi)`,
      narrative: `Bộc lộ [Nhãn quan đầu tư xuyên thấu], bạn khuyên cha mẹ tích trữ đúng món hàng khan hiếm ngay trước đợt tăng giá, giúp gia đình thắng lớn một khoản hời.`,
      effects: { karma_delta: 10, vitality_delta: 0, cash_delta: 250 },
      flag: "prodigy_market_oracle"
    };
  }

  if (traits.includes("thấu_cảm_xã_hội") && (age === 6 || age === 9 || age === 14)) {
    return {
      type: "prodigy_social",
      title: `🤝 Thủ Lĩnh Thiếu Nhi Được Yêu Mến (${age} Tuổi)`,
      narrative: `Nhờ [Trí tuệ cảm xúc & thấu cảm], bạn luôn là người đứng ra hòa giải xích mích giữa bạn bè đồng trang lứa, được hàng xóm láng giềng hết mực yêu quý.`,
      effects: { karma_delta: 20, vitality_delta: 5, cash_delta: 40 },
      flag: "prodigy_diplomat"
    };
  }

  if (traits.includes("khỏe_mạnh_vô_song") && (age === 3 || age === 7 || age === 10)) {
    return {
      type: "prodigy_physical",
      title: `🏃 Thể Chất Vàng Bẩm Sinh (${age} Tuổi)`,
      narrative: `Nhờ thể trạng [Khỏe mạnh vô song], bạn chạy nhảy không biết mệt, đạt giải nhất cuộc thi vận động thiếu nhi tại địa phương. Thể chất vượt trội bạn cùng trang lứa.`,
      effects: { karma_delta: 5, vitality_delta: 10, cash_delta: 30 },
      flag: "prodigy_athlete"
    };
  }

  // 2. Household Family Background Events (Biến cố tự nhiên của gia đình)
  const householdPool = [
    {
      title: `👨‍👩‍👧 Ấm Áp Bữa Cơm Gia Đình (${age} Tuổi)`,
      narrative: `Dưới sự chăm sóc của ${household.father_name || "Cha"} và ${household.mother_name || "Mẹ"}, bạn lớn lên trong tình thương ấm áp. Tiền trợ cấp gia đình nuôi nấng bạn khôn lớn từng ngày.`,
      effects: { karma_delta: 5, vitality_delta: 5, cash_delta: household.annual_allowance || 50 }
    },
    {
      title: `📈 Gia Đình Cải Thiện Thu Nhập (${age} Tuổi)`,
      narrative: `Công việc làm ăn của ${household.father_name || "Cha"} (${household.father_job || "gia đình"}) thuận lợi hơn, bữa cơm gia đình có thêm món ngon và bạn được mua thêm quần áo mới.`,
      effects: { karma_delta: 8, vitality_delta: 5, cash_delta: Math.round((household.annual_allowance || 100) * 1.5) }
    },
    {
      title: `🌧️ Thắt Lưng Buộc Bụng (${age} Tuổi)`,
      narrative: `Năm nay kinh tế gia đình gặp chững lại. Nhìn cha mẹ làm việc vất vả, bạn ngoan ngoãn phụ giúp việc nhà và không đòi hỏi mua sắm xa xỉ. Bạn học được bài học đầu đời về sự sẻ chia.`,
      effects: { karma_delta: 10, vitality_delta: 0, cash_delta: Math.round((household.annual_allowance || 100) * 0.5) }
    },
    {
      title: `🎈 Sinh Nhật Tuổi ${age} Đáng Nhớ`,
      narrative: `Cha mẹ tổ chức cho bạn một bữa tiệc sinh nhật giản dị nhưng tràn ngập tiếng cười bên bạn bè hàng xóm. Bạn nhận được những lời chúc phước lành trọn đời.`,
      effects: { karma_delta: 12, vitality_delta: 5, cash_delta: 60 }
    }
  ];

  const picked = householdPool[Math.floor(Math.random() * householdPool.length)];
  return {
    type: "household_chronicle",
    title: picked.title,
    narrative: picked.narrative,
    effects: picked.effects,
    flag: `childhood_year_${age}`
  };
}
