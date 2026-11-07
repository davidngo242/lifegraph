/**
 * LifeGraph 2.0 - Global Country BigData Engine
 * Comprehensive multi-national datasets for Names, Lineage, Currencies, Cities, Family Culture & Asset Markets.
 */

export const COUNTRY_BIGDATA = {
  "thái lan": {
    id: "T2_Thailand",
    name: "Thái Lan",
    aliases: ["thái lan", "thailand", "thai", "th"],
    flag: "🇹🇭",
    tier: "T2",
    safety: 78,
    economic_score: 65,
    healthcare: {"infant_survival_rate":98.6,"emergency_quality":"tier2_accessible","clinic_cost_factor":0.7,"description":"Hệ thống y tế công cộng và du lịch y tế phát triển nhanh"},
    currency: { code: "THB", symbol: "฿", rate_to_usd: 36, name: "Baht Thái" },
    cities: [
      "Bangkok (Quận Sukhumvit)",
      "Bangkok (Quận Silom)",
      "Chiang Mai (Nimman)",
      "Phuket (Patong Beach)",
      "Pattaya (Chonburi)"
    ],
    name_order: "western", // Given + Surname
    surnames: [
      "Rattanakorn", "Sukhumvit", "Jaidee", "Siriporn", "Wongsuwan",
      "Chareonrat", "Thanathorn", "Kitiyakara", "Boonmee", "Prasertkul",
      "Kongsuk", "Saelim", "Suwannarat", "Chaimongkol", "Phromthep"
    ],
    male_given_names: [
      "Somchai", "Thanakorn", "Kittisak", "Arthit", "Chaiwat",
      "Prasert", "Ananda", "Nattawut", "Prawit", "Tawan",
      "Chanon", "Kasem", "Surachai", "Phuwadol", "Teerapat"
    ],
    female_given_names: [
      "Apinya", "Sirilak", "Kanya", "Nattaporn", "Ploy",
      "Malee", "Supaporn", "Chonlada", "Sunisa", "Warunee",
      "Pitchapa", "Kannika", "Chutimon", "Pimchanok", "Lalisa"
    ],
    family_jobs: {
      poor: {
        father: "Chủ xe ẩm thực đường phố / Tài xế xe Tuk Tuk",
        mother: "Nhân viên massage cổ truyền / Buôn bán nhỏ Chatuchak",
        vibe: "Gia đình bình dân gắn bó, sùng bái Phật giáo và tương thân tương ái."
      },
      middle: {
        father: "Kỹ sư công nghệ Bangkok / Quản lý xuất nhập khẩu",
        mother: "Giảng viên Đại học Chulalongkorn / Dược sĩ",
        vibe: "Gia đình trung lưu nề nếp tại Bangkok, chú trọng lễ nghĩa và học vấn."
      },
      rich: {
        father: "Chủ tịch tập đoàn thương mại & bán lẻ Thái Lan",
        mother: "Phu nhân quý tộc / Nhà bảo trợ nghệ thuật",
        vibe: "Hào môn vọng tộc thân cận hoàng gia, sở hữu chuỗi khách sạn và đồn điền."
      }
    },
    housing: {
      slum: { name: "Phòng trọ hẻm lao động Khlong Toei, Bangkok", tier: 1 },
      middle: { name: "Nhà phố liền kề Sukhumvit, Bangkok", tier: 3 },
      rich: { name: "Penthouse ven sông Chao Phraya, Bangkok", tier: 5 }
    },
    assets: {
      m1_savings: "Tiền Gửi Tiết Kiệm Ngân Hàng Kasikornbank (KBank)",
      m2_gold: "Vàng Thỏi Trú Ẩn Phố Yaowarat Bangkok (Chuẩn Vàng 96.5%)",
      m3_index_etf: "Chứng Chỉ Quỹ Chỉ Số SET50 Index Bangkok",
      g1_tech_stocks: "Cổ Phiếu Viễn Thông & Bán Lẻ CP All / True Corp",
      g2_franchise_cafe: "Nhượng Quyền Chuỗi Cafe Amazon Trạm Xăng Thái Lan",
      g3_suburban_land: "Đất Đồn Điền Sầu Riêng & Nghỉ Dưỡng Chiang Mai",
      p1_rental_condo: "Căn Hộ Condominium Cao Cấp Sukhumvit Bangkok",
      p2_shophouse: "Nhà Phố Thương Mại Shophouse Chợ Đêm Patong Phuket",
      p3_pharmacy_chain: "Chuỗi Thảo Dược & Spa Trị Liệu Hoàng Gia Thái",
      l1_office_tower: "Tòa Nhà Cao Ốc Văn Phòng Silom Financial Center",
      l2_beach_resort: "Khu Resort Nghỉ Dưỡng 5 Sao Bãi Biển Koh Samui",
      l3_pre_ipo_startup: "Cổ Phần Startup Thương Mại Điện Tử & Fintech ASEAN",
      d1_hotel_5star: "Tổ Hợp Khách Sạn Sang Trọng Siam Paragon Bangkok",
      d2_sovereign_debt: "Trái Phiếu Chính Phủ Hoàng Gia Thái Lan (Royal Thai Bond)",
      d3_family_trust: "Quỹ Tín Thác Gia Tộc & Đồn Điền Cao Su Xuất Khẩu"
    }
  },

  "việt nam": {
    id: "T2_Vietnam",
    name: "Việt Nam",
    aliases: ["việt nam", "vietnam", "vn"],
    flag: "🇻🇳",
    tier: "T2",
    safety: 85,
    economic_score: 68,
    healthcare: {"infant_survival_rate":98.8,"emergency_quality":"tier2_accessible","clinic_cost_factor":0.6,"description":"Mạng lưới trạm y tế và viện nhi tuyến trung ương dễ tiếp cận"},
    currency: { code: "VND", symbol: "₫", rate_to_usd: 25000, name: "Việt Nam Đồng" },
    cities: [
      "Hà Nội (Quận Ba Đình)",
      "TP. Hồ Chí Minh (Quận 1)",
      "Đà Nẵng (Quận Hải Châu)",
      "Hải Phòng (Quận Hồng Bàng)",
      "Cần Thơ (Quận Ninh Kiều)",
      "Nha Trang (Đường Trần Phú Ven Biển)",
      "Huế (Khu Cố Đô Vỹ Dạ)"
    ],
    name_order: "eastern", // Surname + Given
    surnames: [
      "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh",
      "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"
    ],
    male_given_names: [
      "Tuấn Khang", "Minh Quân", "Hải Đăng", "Bảo Long", "Gia Huy",
      "Trọng Nghĩa", "Hoàng Nam", "Khánh An", "Quốc Bảo", "Đăng Khoa",
      "Minh Khôi", "Anh Dũng", "Thiên Ân", "Văn An", "Đức Trí"
    ],
    female_given_names: [
      "Thanh Trúc", "Ngọc Mai", "Hoàng Yến", "Thảo Linh", "Khánh Vy",
      "Phương Thảo", "Bảo Châu", "Minh Anh", "Hương Giang", "Nhã Uyên",
      "Tú Anh", "Ánh Dương", "Gia Linh", "Diệu Nhi", "Bích Ngọc"
    ],
    family_jobs: {
      poor: {
        father: "Ngư dân bám biển miền Trung / Thợ cơ khí xưởng máy / Tài xế xe ôm công nghệ",
        mother: "Buôn gánh bán bưng chợ nổi miền Tây / Công nhân may xuất khẩu / Nội trợ đảm đang",
        vibe: "Gia đình cần lao chất phác, đùm bọc qua muôn vàn gian khó mưu sinh."
      },
      middle: {
        father: "Kỹ sư cầu đường / Giáo viên THPT chuyên / Chuyên viên công nghệ Đà Nẵng",
        mother: "Dược sĩ nhà thuốc tư nhân / Bác sĩ đa khoa bệnh viện tỉnh / Kế toán trưởng",
        vibe: "Gia đình trí thức nề nếp gia phong, coi trọng hiếu đạo và học vấn đèn sách."
      },
      rich: {
        father: "Chủ tịch tập đoàn địa ốc & chuỗi khu nghỉ dưỡng / Doanh nhân xuất khẩu nông sản Tây Nguyên",
        mother: "Nhà đầu tư bất động sản / Chủ chuỗi thẩm mỹ viện cao cấp / Phu nhân hào môn",
        vibe: "Hào môn danh gia vọng tộc trải khắp ba miền, sở hữu cơ nghiệp đồn điền và bất động sản nghìn tỷ."
      }
    },
    housing: {
      slum: { name: "Phòng trọ / Mái ấm bình dân ven kênh", tier: 1 },
      middle: { name: "Nhà phố gia đình trung tâm thành thị", tier: 3 },
      rich: { name: "Biệt thự dinh thự hào môn ven sông", tier: 5 }
    },
    assets: {
      m1_savings: "Tiền Gửi Tiết Kiệm Vietcombank / BIDV Kỳ Hạn 1 Năm",
      m2_gold: "Vàng Miếng SJC 9999 Bảo An Quốc Gia",
      m3_index_etf: "Chứng Chỉ Quỹ Chỉ Số VN30 Index ETF",
      g1_tech_stocks: "Cổ Phiếu Công Nghệ Viễn Thông FPT / Viettel Post",
      g2_franchise_cafe: "Nhượng Quyền Chuỗi Cà Phê Muối & Trà Sữa Đô Thị",
      g3_suburban_land: "Đất Vườn Sầu Riêng Xuất Khẩu Đắk Lắk Tây Nguyên",
      p1_rental_condo: "Căn Hộ Nghỉ Dưỡng Biển Mỹ Khê Đà Nẵng / Nha Trang",
      p2_shophouse: "Nhà Phố Mặt Tiền Shophouse Khu Đô Thị Mới Thủ Thiêm",
      p3_pharmacy_chain: "Chuỗi Nhà Thuốc Bán Lẻ Dược Phẩm Long Châu",
      l1_office_tower: "Tòa Cao Ốc Văn Phòng Hạng A Landmark 81",
      l2_beach_resort: "Biệt Thự Biển Nghỉ Dưỡng Vinpearl Phú Quốc / Nha Trang",
      l3_pre_ipo_startup: "Cổ Phần Doanh Nghiệp Công Nghệ Kỳ Lân Pre-IPO",
      d1_hotel_5star: "Tổ Hợp Khách Sạn & Trung Tâm Hội Nghị Quốc Tế Hà Nội",
      d2_sovereign_debt: "Trái Phiếu Chính Phủ Việt Nam Kho Bạc Nhà Nước",
      d3_family_trust: "Quỹ Tín Thác Gia Tộc & Bất Động Sản Di Sản Vĩnh Viễn"
    }
  },

  "hoa kỳ": {
    id: "T1_USA",
    name: "Hoa Kỳ",
    aliases: ["hoa kỳ", "mỹ", "usa", "us", "united states"],
    flag: "🇺🇸",
    tier: "T1",
    safety: 75,
    economic_score: 92,
    healthcare: {"infant_survival_rate":99.4,"emergency_quality":"tier1_worldclass","clinic_cost_factor":2,"description":"Hệ thống bệnh viện kỹ thuật cao nhưng chi phí bảo hiểm đắt đỏ"},
    currency: { code: "USD", symbol: "$", rate_to_usd: 1.0, name: "Đô La Mỹ" },
    cities: [
      "New York (Manhattan)",
      "San Francisco (Silicon Valley)",
      "Los Angeles (Beverly Hills)",
      "Chicago (The Loop)",
      "Austin (Texas)"
    ],
    name_order: "western",
    surnames: [
      "Miller", "Johnson", "Smith", "Davis", "Wilson",
      "Anderson", "Taylor", "Thomas", "Clark", "Hayes",
      "Walker", "Harris", "Robinson", "Lewis", "Morgan"
    ],
    male_given_names: [
      "Ethan", "James", "Alexander", "Liam", "Benjamin",
      "Lucas", "Oliver", "Mason", "Henry", "William",
      "Jack", "Samuel", "Noah", "Leo", "Daniel"
    ],
    female_given_names: [
      "Olivia", "Sophia", "Charlotte", "Emma", "Ava",
      "Mia", "Isabella", "Harper", "Evelyn", "Abigail",
      "Emily", "Chloe", "Grace", "Ella", "Scarlett"
    ],
    family_jobs: {
      poor: {
        father: "Nhân viên vận chuyển kho bãi Amazon / Thợ sửa máy",
        mother: "Thu ngân siêu thị Walmart / Trợ tá y tế",
        vibe: "Gia đình lao động chăm chỉ, nuôi giấc mơ Mỹ giữa áp lực hóa đơn."
      },
      middle: {
        father: "Kỹ sư phần mềm Big Tech / Luật sư công",
        mother: "Bác sĩ nhi khoa / Chuyên viên phân tích tài chính",
        vibe: "Gia đình trí thức ngoại ô, coi trọng thể thao và học bổng đại học."
      },
      rich: {
        father: "Giám đốc điều hành Quỹ Phòng hộ Wall Street",
        mother: "Chủ tịch Quỹ Từ thiện / Luật sư doanh nghiệp",
        vibe: "Gia tộc tinh hoa Bờ Đông, mạng lưới quan hệ Ivy League sâu rộng."
      }
    },
    housing: {
      slum: { name: "Căn hộ Studio thuê khu Queens, New York", tier: 1 },
      middle: { name: "Biệt thự sân vườn ngoại ô Westchester, New York", tier: 3 },
      rich: { name: "Penthouse Thượng Lưu Central Park West, Manhattan", tier: 5 }
    },
    assets: {
      m1_savings: "Trái Phiếu Kho Bạc Mỹ Ngắn Hạn US Treasury 1-Year",
      m2_gold: "Vàng Thỏi Đúc American Gold Eagle US Mint",
      m3_index_etf: "Quỹ Chỉ Số Vanguard S&P 500 ETF (VOO)",
      g1_tech_stocks: "Cổ Phiếu Siêu Trí Tuệ Silicon Valley (NVIDIA & Apple)",
      g2_franchise_cafe: "Nhượng Quyền Chuỗi Cà Phê Starbucks Flagship",
      g3_suburban_land: "Trang Trại Đất Nông Nghiệp & Năng Lượng Gió Texas",
      p1_rental_condo: "Căn Hộ Condominium Cao Cấp Manhattan New York",
      p2_shophouse: "Nhà Phố Thương Mại Rodeo Drive Beverly Hills",
      p3_pharmacy_chain: "Chuỗi Nhà Thuốc Bán Lẻ CVS Health Hoa Kỳ",
      l1_office_tower: "Tòa Nhà Văn Phòng Phố Tài Chính Wall Street New York",
      l2_beach_resort: "Khu Biệt Thự Nghỉ Dưỡng Núi Tuyết Aspen Colorado",
      l3_pre_ipo_startup: "Cổ Phần Startup AI San Francisco Pre-IPO",
      d1_hotel_5star: "Tổ Hợp Khách Sạn Sòng Bạc Hạng Sang Las Vegas Strip",
      d2_sovereign_debt: "Trái Phiếu Kho Bạc Mỹ Dài Hạn 30-Year US Bond",
      d3_family_trust: "Quỹ Tín Thác Gia Tộc Độc Lập Bang Delaware"
    }
  },

  "nhật bản": {
    id: "T1_Japan",
    name: "Nhật Bản",
    aliases: ["nhật bản", "nhật", "japan", "jp"],
    flag: "🇯🇵",
    tier: "T1",
    safety: 92,
    economic_score: 85,
    healthcare: {"infant_survival_rate":99.8,"emergency_quality":"tier1_worldclass","clinic_cost_factor":1.2,"description":"Mạng lưới y tế cộng đồng và chăm sóc bà mẹ trẻ em chuẩn mực"},
    currency: { code: "JPY", symbol: "¥", rate_to_usd: 150, name: "Yên Nhật" },
    cities: [
      "Tokyo (Quận Shibuya)",
      "Tokyo (Quận Minato)",
      "Osaka (Quận Chuo)",
      "Kyoto (Quận Nakagyo)",
      "Yokohama (Nishi-ku)"
    ],
    name_order: "western", // Given + Surname in Latin representation
    surnames: [
      "Takahashi", "Sato", "Tanaka", "Yamamoto", "Kobayashi",
      "Watanabe", "Nakamura", "Ito", "Saito", "Suzuki",
      "Matsumoto", "Inoue", "Kimura", "Hayashi", "Shimizu"
    ],
    male_given_names: [
      "Ren", "Haruto", "Yuto", "Kaito", "Sota",
      "Riku", "Hayato", "Daiki", "Kenji", "Kazuki",
      "Takumi", "Shinji", "Shota", "Ryota", "Kota"
    ],
    female_given_names: [
      "Aoi", "Hina", "Sakura", "Yui", "Mei",
      "Rin", "Mio", "Akari", "Nanami", "Koharu",
      "Hana", "Misaki", "Yuka", "Ayaka", "Asuka"
    ],
    family_jobs: {
      poor: {
        father: "Nhân viên hợp đồng xưởng lắp ráp / Shipper",
        mother: "Thu ngân cửa hàng tiện lợi Konbini / Nội trợ",
        vibe: "Gia đình căn cơ tiết kiệm, chấp hành nghiêm ngặt văn hóa cộng đồng."
      },
      middle: {
        father: "Salaryman cấp quản lý tập đoàn Keiretsu Tokyo",
        mother: "Giáo viên trường trung học / Nghiên cứu sinh",
        vibe: "Gia phong kỷ luật truyền thống, rèn luyện tính tự giác từ nhỏ."
      },
      rich: {
        father: "Chủ tịch tập đoàn công nghiệp Zaibatsu lâu đời",
        mother: "Phu nhân gia tộc danh gia / Nghệ nhân Trà đạo",
        vibe: "Gia tộc quý tộc lâu đời Tokyo, gắn liền với di sản và truyền thống."
      }
    },
    housing: {
      slum: { name: "Căn hộ 1DK chật hẹp ngoại ô Adachi, Tokyo", tier: 1 },
      middle: { name: "Căn hộ chung cư Mansion hiện đại Setagaya, Tokyo", tier: 3 },
      rich: { name: "Biệt thự truyền thống sân vườn cổ thụ Minato, Tokyo", tier: 5 }
    },
    assets: {
      m1_savings: "Tiền Gửi Tiết Kiệm Ngân Hàng Mitsubishi UFJ (MUFG)",
      m2_gold: "Vàng Thỏi Đúc Tanaka Kikinzoku Tiêu Chuẩn Nhật Bản",
      m3_index_etf: "Chứng Chỉ Quỹ Chỉ Số Nikkei 225 Index ETF",
      g1_tech_stocks: "Cổ Phiếu Bán Dẫn & Tự Động Hóa Tokyo Electron",
      g2_franchise_cafe: "Nhượng Quyền Cửa Hàng Tiện Lợi 7-Eleven Japan",
      g3_suburban_land: "Đất Vườn Ngoại Ô Đón Tàu Cao Tốc Shinkansen Chiba",
      p1_rental_condo: "Căn Hộ Studio Cho Thuê Quận Shibuya, Tokyo",
      p2_shophouse: "Nhà Phố Thương Mại Phố Cổ Shinsaibashi Osaka",
      p3_pharmacy_chain: "Chuỗi Nhà Thuốc Dược Mỹ Phẩm Matsumoto Kiyoshi",
      l1_office_tower: "Tòa Cao Ốc Văn Phòng Khu Roppongi Hills Tokyo",
      l2_beach_resort: "Khu Nghỉ Dưỡng Onsen Suối Khoáng Truyền Thống Kyoto",
      l3_pre_ipo_startup: "Cổ Phần Quỹ Đầu Tư Robot & Trí Tuệ Nhân Tạo SoftBank",
      d1_hotel_5star: "Khách Sạn Lịch Sử Imperial Hotel Tokyo Hạng Sang",
      d2_sovereign_debt: "Trái Phiếu Chính Phủ Nhật Bản (Japanese Gov Bond JGB)",
      d3_family_trust: "Quỹ Tín Thác Bảo Tồn Di Sản Gia Tộc Zaibatsu"
    }
  },

  "ba lan": {
    id: "T2_Poland",
    name: "Ba Lan",
    aliases: ["ba lan", "poland", "pl"],
    flag: "🇵🇱",
    tier: "T2",
    safety: 82,
    economic_score: 75,
    healthcare: {"infant_survival_rate":99.2,"emergency_quality":"tier2_accessible","clinic_cost_factor":0.8,"description":"Hệ thống bảo hiểm y tế toàn dân NFZ và trạm xá châu Âu"},
    currency: { code: "PLN", symbol: "zł", rate_to_usd: 4.0, name: "Złoty Ba Lan" },
    cities: [
      "Warsaw (Quận Mokotów)",
      "Warsaw (Quận Śródmieście)",
      "Kraków (Khu phố Stare Miasto)",
      "Wrocław (Khu phố cổ)",
      "Gdańsk (Khu cảng)"
    ],
    name_order: "western",
    surnames: [
      "Kowalski", "Wiśniewski", "Lewandowski", "Dąbrowski", "Zieliński",
      "Szymański", "Woźniak", "Kozłowski", "Jankowski", "Mazur",
      "Wójcik", "Kaczmarek", "Piotrowski", "Grabowski", "Pawłowski"
    ],
    male_given_names: [
      "Jakub", "Kacper", "Mikołaj", "Jan", "Filip",
      "Szymon", "Aleksander", "Michał", "Piotr", "Mateusz",
      "Antoni", "Wojciech", "Stanisław", "Adam", "Bartosz"
    ],
    female_given_names: [
      "Zofia", "Julia", "Lena", "Maja", "Hanna",
      "Alicja", "Maria", "Aleksandra", "Oliwia", "Natalia",
      "Wiktoria", "Emilia", "Antonina", "Laura", "Pola"
    ],
    family_jobs: {
      poor: {
        father: "Thợ cơ khí đường sắt / Công nhân mỏ than",
        mother: "Công nhân chế biến thực phẩm / May mặc",
        vibe: "Gia đình Ba Lan sùng đạo Thiên Chúa, kiên cường vượt khó."
      },
      middle: {
        father: "Lập trình viên phần mềm Warsaw / Kỹ sư cơ điện",
        mother: "Bác sĩ bệnh viện công / Kế toán viên",
        vibe: "Gia đình trí thức Đông Âu, trân trọng văn hóa đọc và âm nhạc Chopin."
      },
      rich: {
        father: "Nhà sáng lập tập đoàn phát triển game & công nghệ",
        mother: "Chủ sở hữu chuỗi trung tâm thương mại / Luật sư",
        vibe: "Gia tộc danh giá hậu duệ quý tộc Szlachta Ba Lan."
      }
    },
    housing: {
      slum: { name: "Căn hộ chung cư cũ thời hậu chiến Praga, Warsaw", tier: 1 },
      middle: { name: "Căn hộ hiện đại ven công viên Mokotów, Warsaw", tier: 3 },
      rich: { name: "Biệt thự phong cách cổ điển Wilanów, Warsaw", tier: 5 }
    },
    assets: {
      m1_savings: "Tiền Gửi Tiết Kiệm Ngân Hàng PKO Bank Polski",
      m2_gold: "Vàng Thỏi Trú Ẩn Quốc Gia Mennica Polska",
      m3_index_etf: "Chứng Chỉ Quỹ Chỉ Số WIG20 Index Warsaw",
      g1_tech_stocks: "Cổ Phiếu Studio Game Quốc Tế CD Projekt Red",
      g2_franchise_cafe: "Nhượng Quyền Chuỗi Cửa Hàng Tiện Lợi Żabka",
      g3_suburban_land: "Đất Trang Trại & Khu Hậu Cần Ngoại Ô Kraków",
      p1_rental_condo: "Căn Hộ Chung Cư Trung Tâm Śródmieście Warsaw",
      p2_shophouse: "Nhà Phố Thương Mại Phố Cổ Rynek Wrocław",
      p3_pharmacy_chain: "Chuỗi Nhà Thuốc Bán Lẻ DOZ Apteka Ba Lan",
      l1_office_tower: "Tòa Nhà Văn Phòng Warsaw Spire Business Center",
      l2_beach_resort: "Khu Biệt Thự Nghỉ Dưỡng Núi Tuyết Zakopane Tatra",
      l3_pre_ipo_startup: "Cổ Phần Startup Trí Tuệ Nhân Tạo Warsaw Pre-IPO",
      d1_hotel_5star: "Khách Sạn Lịch Sử Hạng Sang Hotel Bristol Warsaw",
      d2_sovereign_debt: "Trái Phiếu Kho Bạc Nhà Nước Ba Lan (Treasury Bond)",
      d3_family_trust: "Quỹ Tín Thác Di Sản Dòng Dõi Quý Tộc Warsaw"
    }
  },

  "haiti": {
    id: "T3_Haiti",
    name: "Haiti",
    aliases: ["haiti", "ht"],
    flag: "🇭🇹",
    tier: "T3",
    safety: 25,
    economic_score: 18,
    healthcare: {"infant_survival_rate":93.8,"emergency_quality":"tier3_crisis_strained","clinic_cost_factor":0.4,"description":"Cơ sở hạ tầng y tế nghèo nàn, phụ thuộc viện trợ quốc tế"},
    currency: { code: "HTG", symbol: "G", rate_to_usd: 132, name: "Gourde Haiti" },
    cities: [
      "Port-au-Prince (Pétion-Ville)",
      "Port-au-Prince (Delmas)",
      "Cap-Haïtien",
      "Jacmel"
    ],
    name_order: "western",
    surnames: [
      "Saint-Fort", "Pierre", "Jean", "Baptiste", "Hyppolite",
      "Celestin", "Chery", "Francois", "Joseph", "Auguste",
      "Noel", "Dorval", "Toussaint", "Dessalines", "Lafontant"
    ],
    male_given_names: [
      "Arthur", "Ronald", "Frantz", "Dieudonne", "Jude",
      "Jean-Baptiste", "Alexandre", "Jacques", "Samuel", "Michel",
      "Yves", "Wilner", "Rene", "Gervais", "Pierre-Louis"
    ],
    female_given_names: [
      "Rose-Merline", "Florence", "Fabienne", "Mirlande", "Marie-Ange",
      "Nathalie", "Judith", "Kettly", "Chantal", "Guerda",
      "Mireille", "Claudette", "Esther", "Yvrose", "Danielle"
    ],
    family_jobs: {
      poor: {
        father: "Thợ cơ khí đường phố / Buôn bán vỉa hè",
        mother: "Bán than củi / Đan lát thủ công chợ trời",
        vibe: "Gia đình nghèo nàn kiên cường, đùm bọc nhau giữa bất ổn xã hội."
      },
      middle: {
        father: "Bác sĩ hội chữ thập đỏ / Công chức bưu chính",
        mother: "Giáo viên tiểu học / Y tá tình nguyện",
        vibe: "Gia đình trí thức hiếm hoi nỗ lực giữ gìn học vấn cho con cái."
      },
      rich: {
        father: "Thương nhân xuất nhập khẩu nông sản / Cảng biển",
        mother: "Chủ hãng xuất khẩu cà phê / Dược phẩm tư nhân",
        vibe: "Tầng lớp thượng lưu Pétion-Ville, nhà kiên cố có lính canh bảo vệ."
      }
    },
    housing: {
      slum: { name: "Lán tôn vách đất khu ổ chuột Cité Soleil, Port-au-Prince", tier: 1 },
      middle: { name: "Nhà bê tông kiên cố có rào chắn Delmas, Port-au-Prince", tier: 3 },
      rich: { name: "Biệt thự đồi Pétion-Ville có đội bảo an riêng", tier: 5 }
    },
    assets: {
      m1_savings: "Kho Dự Trữ Lương Thực & Nước Ngọt Khẩn Cấp",
      m2_gold: "Vàng Lá Đúc Quốc Tế Chống Lạm Phát & Chiến Tranh",
      m3_index_etf: "Ngoại Tệ Tiền Mặt USD Dự Trữ An Toàn",
      g1_tech_stocks: "Hệ Thống Trạm Phát Năng Lượng Mặt Trời Độc Lập",
      g2_franchise_cafe: "Đoàn Xe Tải Vận Chuyển Hàng Thiết Yếu Đa Địa Hình",
      g3_suburban_land: "Đồn Điền Trồng Cây Cà Phê & Cacao Xuất Khẩu",
      p1_rental_condo: "Khu Nhà An Toàn Cho Thuê Nhân Viên Quốc Tế Pétion-Ville",
      p2_shophouse: "Cửa Hàng Lương Thực & Thiết Bị Liên Lạc Vệ Tinh",
      p3_pharmacy_chain: "Trạm Y Tế & Kho Dược Phẩm Kháng Sinh Khẩn Cấp",
      l1_office_tower: "Tòa Nhà Cho Thuê Phái Đoàn Ngoại Giao & Tổ Chức Phi Chính Phủ",
      l2_beach_resort: "Khu Đất Bãi Biển Hoang Sơ Tiềm Năng Du Lịch Jacmel",
      l3_pre_ipo_startup: "Hệ Thống Thanh Toán Tiền Điện Tử Chống Lạm Phát",
      d1_hotel_5star: "Khu Nghỉ Dưỡng Biệt Lập Hạng Sang Cho Chuyên Gia Quốc Tế",
      d2_sovereign_debt: "Tài Khoản Ngoại Tệ Thanh Toán Quốc Tế Hải Ngoại",
      d3_family_trust: "Thị Thực Định Cư Tị Nạn & Quỹ Tài Sản An Toàn Nước Ngoài"
    }
  },

  "na uy": {
    id: "T1_Norway",
    name: "Na Uy",
    aliases: ["na uy", "norway", "no"],
    flag: "🇳🇴",
    tier: "T1",
    safety: 95,
    economic_score: 90,
    healthcare: {"infant_survival_rate":99.8,"emergency_quality":"tier1_worldclass","clinic_cost_factor":1.3,"description":"Y tế phúc lợi Bắc Âu chất lượng cao và miễn phí cho trẻ nhỏ"},
    currency: { code: "NOK", symbol: "kr", rate_to_usd: 10.8, name: "Krone Na Uy" },
    cities: [
      "Oslo (Quận Frogner)",
      "Oslo (Quận Aker Brygge)",
      "Bergen (Khu phố cổ Bryggen)",
      "Tromsø",
      "Stavanger"
    ],
    name_order: "western",
    surnames: [
      "Hansen", "Johansen", "Olsen", "Larsen", "Andersen",
      "Nilsen", "Pedersen", "Kristiansen", "Karlsen", "Haugen",
      "Bakke", "Lund", "Moe", "Halvorsen", "Solberg"
    ],
    male_given_names: [
      "Henrik", "Magnus", "Jonas", "Tobias", "Emil",
      "Mathias", "Lukas", "Oliver", "Sander", "Håkon",
      "Aksel", "Jakob", "Sverre", "Eirik", "Oskar"
    ],
    female_given_names: [
      "Nora", "Emma", "Maja", "Astrid", "Ingrid",
      "Sofie", "Thea", "Ida", "Sara", "Linnea",
      "Frida", "Ella", "Sigrid", "Silje", "Tuva"
    ],
    family_jobs: {
      poor: {
        father: "Thủy thủ tàu đánh cá Bắc Cực / Nhân viên bảo trì cảng",
        mother: "Y tá trung tâm điều dưỡng / Đầu bếp căng tin",
        vibe: "Gia đình Bắc Âu tự do, gần gũi thiên nhiên và có phúc lợi cao."
      },
      middle: {
        father: "Kỹ sư dầu khí Equinor / Nhà hải dương học",
        mother: "Kiến trúc sư môi trường / Chuyên viên khí hậu",
        vibe: "Gia đình tiến bộ, đam mê trượt tuyết mùa đông và lối sống Friluftsliv."
      },
      rich: {
        father: "Chủ hãng vận tải biển toàn cầu / Cổ đông năng lượng xanh",
        mother: "Giám đốc Quỹ Di sản Văn hóa / Luật sư hàng hải",
        vibe: "Tầng lớp thượng lưu Oslo, sở hữu du thuyền vượt biển và đảo tư nhân."
      }
    },
    housing: {
      slum: { name: "Căn hộ nhỏ ngoại ô Tøyen, Oslo", tier: 1 },
      middle: { name: "Nhà gỗ hiện đại hướng vịnh Fjord, Bergen", tier: 3 },
      rich: { name: "Biệt thự siêu sang ven biển Frogner, Oslo", tier: 5 }
    },
    assets: {
      m1_savings: "Tiền Gửi Tiết Kiệm Ngân Hàng DNB Bank ASA Na Uy",
      m2_gold: "Vàng Thỏi Đúc Ngân Hàng Trung Ương Norges Bank",
      m3_index_etf: "Chứng Chỉ Quỹ Chỉ Số Oslo Børs OBX Index",
      g1_tech_stocks: "Cổ Phiếu Năng Lượng Xanh & Dầu Khí Equinor",
      g2_franchise_cafe: "Nhượng Quyền Chuỗi Trang Trại Nuôi Cá Hồi Fjord",
      g3_suburban_land: "Khu Đất Rừng Thông & Năng Lượng Gió Bắc Cực",
      p1_rental_condo: "Căn Hộ Condominium Cao Cấp Cảng Aker Brygge Oslo",
      p2_shophouse: "Nhà Phố Thương Mại Phố Đi Bộ Karl Johans Gate",
      p3_pharmacy_chain: "Chuỗi Chăm Sóc Sức Khỏe & Dược Phẩm Apotek 1",
      l1_office_tower: "Tòa Cao Ốc Văn Phòng Phức Hợp Barcode Project Oslo",
      l2_beach_resort: "Khu Nghỉ Dưỡng Ngắm Cực Quang Tromsø Bắc Cực",
      l3_pre_ipo_startup: "Cổ Phần Startup Tàu Ngầm Tự Hành & Hàng Hải Xanh",
      d1_hotel_5star: "Khách Sạn Sang Trọng Grand Hotel Oslo Lịch Sử",
      d2_sovereign_debt: "Trái Phiếu Chính Phủ Na Uy An Toàn Tuyệt Đối (AAA)",
      d3_family_trust: "Quỹ Tín Thác Đầu Tư Tương Tự Quỹ Dầu Mỏ Oljefondet"
    }
  },

  "thụy sĩ": {
    id: "T1_Switzerland",
    name: "Thụy Sĩ",
    aliases: ["thụy sĩ", "switzerland", "ch", "swiss"],
    flag: "🇨🇭",
    tier: "T1",
    safety: 96,
    economic_score: 95,
    healthcare: {"infant_survival_rate":99.8,"emergency_quality":"tier1_worldclass","clinic_cost_factor":1.5,"description":"Hệ thống y tế nhi khoa tiên tiến bậc nhất thế giới"},
    currency: { code: "CHF", symbol: "CHF", rate_to_usd: 0.90, name: "Franc Thụy Sĩ" },
    cities: [
      "Zurich (Quận Altstadt)",
      "Zurich (Bahnhofstrasse)",
      "Geneva (Quận Eaux-Vives)",
      "Basel",
      "Bern"
    ],
    name_order: "western",
    surnames: [
      "Müller", "Meier", "Schmid", "Keller", "Weber",
      "Schneider", "Fischer", "Meyer", "Brunner", "Gerber",
      "Frei", "Huber", "Senn", "Favre", "Bonvin"
    ],
    male_given_names: [
      "Noah", "Luca", "Liam", "Matteo", "Leon",
      "Julian", "David", "Elias", "Gabriel", "Samuel",
      "Nico", "Levin", "Valentin", "Maxime", "Florian"
    ],
    female_given_names: [
      "Mia", "Emma", "Elena", "Sofia", "Laura",
      "Anna", "Lara", "Alina", "Nina", "Leonie",
      "Julia", "Chiara", "Emilia", "Camille", "Sophie"
    ],
    family_jobs: {
      poor: {
        father: "Thợ chế tác kim loại / Nhân viên bảo trì cáp treo Alps",
        mother: "Phục vụ khách sạn trượt tuyết / Bán hàng lưu niệm",
        vibe: "Gia đình lao động vùng núi Alps, coi trọng sự chăm chỉ và trung thực."
      },
      middle: {
        father: "Chuyên viên phân tích tài chính ngân hàng Zurich",
        mother: "Nhà hóa sinh dược phẩm Novartis Basel",
        vibe: "Gia đình trí thức chuẩn mực Thụy Sĩ, đam mê leo núi và du lịch."
      },
      rich: {
        father: "Đối tác quản lý Ngân hàng Tư nhân Geneva",
        mother: "Chủ tịch thương hiệu đồng hồ xa xỉ / Nhà từ thiện",
        vibe: "Gia tộc tài phiệt ẩn dật, tài sản khổng lồ bảo mật tuyệt đối."
      }
    },
    housing: {
      slum: { name: "Căn hộ ngoại ô Oerlikon, Zurich", tier: 1 },
      middle: { name: "Nhà gỗ Chalet hiện đại nhìn ra hồ Geneva", tier: 3 },
      rich: { name: "Lâu đài dinh thự bờ hồ Zurich có bến du thuyền riêng", tier: 5 }
    },
    assets: {
      m1_savings: "Tài Khoản Tiết Kiệm Bảo Mật Ngân Hàng UBS Private Bank",
      m2_gold: "Vàng Thỏi Đúc Thụy Sĩ PAMP Suisse Tinh Khiết 99.99%",
      m3_index_etf: "Chứng Chỉ Quỹ Chỉ Số Bluechip Swiss Market Index (SMI)",
      g1_tech_stocks: "Cổ Phiếu Dược Phẩm & Y Sinh Novartis / Roche",
      g2_franchise_cafe: "Nhượng Quyền Chuỗi Cửa Hàng Chocolate Lindt & Sprüngli",
      g3_suburban_land: "Khu Đất Vườn Nho Thượng Hạng Ven Hồ Geneva",
      p1_rental_condo: "Căn Hộ Hạng Sang Trung Tâm Đại Lộ Bahnhofstrasse Zurich",
      p2_shophouse: "Nhà Phố Thương Mại Quảng Trường Cổ Phố Lucerne",
      p3_pharmacy_chain: "Chuỗi Bán Lẻ Chăm Sóc Sức Khỏe Amavita Thụy Sĩ",
      l1_office_tower: "Tòa Cao Ốc Văn Phòng Prime Tower Tài Chính Zurich",
      l2_beach_resort: "Khu Resort Trượt Tuyết & Spa 5 Sao St. Moritz Alpine",
      l3_pre_ipo_startup: "Cổ Phần Doanh Nghiệp Blockchain Thung Lũng Crypto Zug",
      d1_hotel_5star: "Tổ Hợp Khách Sạn Huyền Thoại Baur au Lac Zurich",
      d2_sovereign_debt: "Trái Phiếu Liên Bang Thụy Sĩ (Swiss Federal Bond) Trú Ẩn",
      d3_family_trust: "Quỹ Tín Thác Ngân Hàng Tư Nhân Geneva Bảo Mật Thế Kỷ"
    }
  },

  "brazil": {
    id: "T2_Brazil",
    name: "Brazil",
    aliases: ["brazil", "br", "brasil"],
    flag: "🇧🇷",
    tier: "T2",
    safety: 60,
    economic_score: 62,
    healthcare: {"infant_survival_rate":97.5,"emergency_quality":"tier2_accessible","clinic_cost_factor":0.8,"description":"Hệ thống y tế công cộng SUS phủ rộng nhưng quá tải ở đô thị"},
    currency: { code: "BRL", symbol: "R$", rate_to_usd: 5.6, name: "Real Brazil" },
    cities: [
      "São Paulo (Quận Paulista)",
      "São Paulo (Quận Jardins)",
      "Rio de Janeiro (Copacabana)",
      "Rio de Janeiro (Ipanema)",
      "Brasília"
    ],
    name_order: "western",
    surnames: [
      "Silva", "Santos", "Oliveira", "Souza", "Rodrigues",
      "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
      "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida"
    ],
    male_given_names: [
      "Gabriel", "Lucas", "Matheus", "Felipe", "Rodrigo",
      "Thiago", "Bruno", "Eduardo", "Rafael", "Leonardo",
      "Gustavo", "Guilherme", "Enzo", "Arthur", "Vinicius"
    ],
    female_given_names: [
      "Isabella", "Julia", "Sophia", "Manuela", "Beatriz",
      "Luiza", "Mariana", "Gabriela", "Larissa", "Camila",
      "Carolina", "Leticia", "Rafaela", "Amanda", "Giovanna"
    ],
    family_jobs: {
      poor: {
        father: "Tài xế giao hàng / Thợ xây dựng Favela",
        mother: "Giúp việc gia đình / Bán hàng rong Copacabana",
        vibe: "Gia đình bình dị yêu bóng đá, chan hòa điệu nhảy Samba giữa gian khó."
      },
      middle: {
        father: "Kiến trúc sư São Paulo / Luật sư tố tụng",
        mother: "Bác sĩ nha khoa / Quản lý marketing",
        vibe: "Gia đình trung lưu đô thị, yêu thích biển và những kỳ nghỉ cuối tuần."
      },
      rich: {
        father: "Chủ đồn điền đậu nành & gia súc Mato Grosso / Trùm nông nghiệp",
        mother: "Chủ thương hiệu thời trang bãi biển / Phu nhân",
        vibe: "Gia tộc đại điền chủ quyền lực, sở hữu phi cơ riêng và bãi đáp trực thăng."
      }
    },
    housing: {
      slum: { name: "Căn nhà gạch thô khu đồi Favela Rocinha, Rio", tier: 1 },
      middle: { name: "Căn hộ chung cư có bảo vệ khu Jardins, São Paulo", tier: 3 },
      rich: { name: "Dinh thự ven biển độc quyền bãi biển Ipanema, Rio", tier: 5 }
    },
    assets: {
      m1_savings: "Tiền Gửi Tiết Kiệm Ngân Hàng Quốc Gia Banco do Brasil",
      m2_gold: "Vàng Thỏi Trú Ẩn Sàn Giao Dịch Hàng Hóa B3 São Paulo",
      m3_index_etf: "Chứng Chỉ Quỹ Chỉ Số Ibovespa Index Brazil",
      g1_tech_stocks: "Cổ Phiếu Năng Lượng & Khai Khoáng Petrobras & Vale",
      g2_franchise_cafe: "Nhượng Quyền Chuỗi Cà Phê Xuất Khẩu Santos Brazil",
      g3_suburban_land: "Trang Trại Đồn Điền Đậu Nành Rộng Lớn Mato Grosso",
      p1_rental_condo: "Căn Hộ Condominium Trung Tâm Đại Lộ Paulista São Paulo",
      p2_shophouse: "Nhà Phố Thương Mại Phố Biển Du Lịch Copacabana Rio",
      p3_pharmacy_chain: "Chuỗi Bán Lẻ Chăm Sóc Sức Khỏe Droga Raia Brazil",
      l1_office_tower: "Tòa Nhà Văn Phòng Hiện Đại Trục Tài Chính Faria Lima",
      l2_beach_resort: "Khu Resort Nghỉ Dưỡng Bãi Biển Thiên Đường Fernando de Noronha",
      l3_pre_ipo_startup: "Cổ Phần Ngân Hàng Số Kỳ Lân Fintech Nubank Pre-IPO",
      d1_hotel_5star: "Khách Sạn Cung Điện Huyền Thoại Copacabana Palace Rio",
      d2_sovereign_debt: "Trái Phiếu Kho Bạc Quốc Gia Brazil (Tesouro Direto)",
      d3_family_trust: "Quỹ Tín Thác Gia Tộc Đồn Điền Nông Nghiệp Xuyên Đại Dương"
    }
  },

  "syria": {
    id: "T3_Syria",
    name: "Syria",
    aliases: ["syria", "syr", "syrian", "cộng hòa ả rập syria"],
    flag: "🇸🇾",
    tier: "T3",
    safety: 20,
    economic_score: 15,
    healthcare: {"infant_survival_rate":94.2,"emergency_quality":"tier3_crisis_strained","clinic_cost_factor":0.5,"description":"Cơ sở hạ tầng y tế chịu ảnh hưởng xung đột, thuốc men khan hiếm"},
    currency: { code: "SYP", symbol: "£S", rate_to_usd: 13000, name: "Bảng Syria (SYP)" },
    cities: [
      "Damascus (Khu phố cổ Bab Touma)",
      "Damascus (Quận Al-Mezzeh)",
      "Aleppo (Khu thành cổ Al-Madina)",
      "Aleppo (Quận Al-Jamiliyah)",
      "Homs (Quận Al-Zahra)"
    ],
    name_order: "western", // Given + Surname
    surnames: [
      "Al-Assad", "Kabbani", "Al-Shami", "Haddad", "Al-Khatib", "Barakat",
      "Al-Halabi", "Makhlouf", "Al-Attar", "Tlass", "Al-Masri", "Najjar"
    ],
    male_given_names: [
      "Youssef", "Omar", "Ahmad", "Tarek", "Kareem", "Zaid",
      "Sami", "Khaled", "Bashir", "Fadi", "Nizar", "Rami"
    ],
    female_given_names: [
      "Nour", "Layla", "Fatima", "Maryam", "Yasmin", "Rania",
      "Aya", "Salma", "Hala", "Reem", "Dina", "Hiba"
    ],
    family_jobs: {
      poor: {
        father: "Thợ thủ công gốm sứ & xà phòng dầu ô liu Aleppo",
        mother: "Dệt may thảm truyền thống Damascus / Nội trợ mưu sinh",
        vibe: "Gia đình kiên cường trong vùng tàn tích chiến sự, gìn giữ nghề cổ truyền muôn đời."
      },
      middle: {
        father: "Bác sĩ ngoại khoa bệnh viện Damascus / Kỹ sư xây dựng tái thiết",
        mother: "Giảng viên Ngôn ngữ Ả Rập Đại học Damascus",
        vibe: "Gia đình trí thức tôn kính cội nguồn văn hóa Levant, kiên trì bám trụ quê hương."
      },
      rich: {
        father: "Thương gia dầu mỏ & xuất khẩu nông sản Levantine / Chủ tịch tập đoàn tái thiết",
        mother: "Nhà sưu tầm cổ vật Damascus / Nhà hảo tâm tái thiết trường học",
        vibe: "Hào môn danh gia sở hữu các dinh thự cổ và mạng lưới giao thương Trung Đông."
      }
    },
    housing: {
      slum: { name: "Nhà gạch tạm cư quận Đông Aleppo", tier: 1 },
      middle: { name: "Căn hộ đá vôi cổ kính quận Bab Touma, Damascus", tier: 3 },
      rich: { name: "Dinh thự cổ Levantine sân vườn đài phun nước Damascus", tier: 5 }
    },
    assets: {
      m1_savings: "Tiền Gửi Tiết Kiệm Ngân Hàng Trung Ương Syria (CBS)",
      m2_gold: "Vàng Thỏi Trú Ẩn Chợ Vàng Al-Buzuriyah Damascus",
      m3_index_etf: "Chứng Chỉ Quỹ Thị Trường Chứng Khoán Damascus (DSE)",
      g1_tech_stocks: "Cổ Phần Công Ty Viễn Thông Syriatel / MTN Syria",
      g2_franchise_cafe: "Chuỗi Quán Trà & Cà Phê Bạch Đậu Khấu Phố Cổ Damascus",
      g3_suburban_land: "Đồn Điền Ô Liu & Cây Ăn Quả Thung Lũng Al-Ghab",
      p1_rental_condo: "Căn Hộ Cho Thuê Trung Tâm Damascus Al-Mezzeh",
      p2_shophouse: "Nhà Phố Thương Mại Chợ Souq Al-Hamidiyah",
      p3_pharmacy_chain: "Chuỗi Dược Phẩm & Xà Phòng Thảo Dược Hào Môn Aleppo",
      l1_office_tower: "Tòa Nhà Văn Phòng Thương Mại & Tái Thiết Homs",
      l2_beach_resort: "Khu Nghỉ Dưỡng Ven Biển Địa Trung Hải Latakia",
      l3_pre_ipo_startup: "Cổ Phần Công Ty Vận Tải & Hậu Cần Xuyên Levant",
      d1_hotel_5star: "Khách Sạn Cổ Kính Hoàng Gia 5 Sao Damascus",
      d2_sovereign_debt: "Trái Phiếu Tái Thiết Cơ Sở Hạ Tầng Quốc Gia Syria",
      d3_family_trust: "Quỹ Tín Thác Gia Tộc & Đồn Điền Ô Liu Ngàn Năm Tuổi"
    }
  }
};

/**
 * Helper to match country name flexibly against aliases and normalize
 */
export function getCountryBigData(countryName = "Việt Nam") {
  if (!countryName) return COUNTRY_BIGDATA["việt nam"];
  const clean = countryName.toLowerCase().trim();

  // Direct key lookup
  if (COUNTRY_BIGDATA[clean]) return COUNTRY_BIGDATA[clean];

  // Alias scan
  for (const key of Object.keys(COUNTRY_BIGDATA)) {
    const data = COUNTRY_BIGDATA[key];
    if (data.aliases && data.aliases.some(a => clean.includes(a) || a.includes(clean))) {
      return data;
    }
    if (data.name.toLowerCase() === clean) {
      return data;
    }
  }

  // Fallback to Vietnam
  return COUNTRY_BIGDATA["việt nam"];
}

/**
 * Generate fully culturally authentic Name for character or relative
 */
export function generateCulturallyAuthenticName(countryName, role = "character", gender = "male", surnameOverride = null) {
  const country = getCountryBigData(countryName);
  const surname = surnameOverride || country.surnames[Math.floor(Math.random() * country.surnames.length)];
  const givenPool = gender === 'female' ? country.female_given_names : country.male_given_names;
  const given = givenPool[Math.floor(Math.random() * givenPool.length)];

  if (country.name_order === "eastern") {
    // Họ + Tên (Việt Nam)
    return `${surname} ${given}`;
  } else {
    // Tên + Họ (Phương Tây, Thái Lan, Nhật Bản Latin, v.v.)
    return `${given} ${surname}`;
  }
}

/**
 * Extract surname from full name according to country culture
 */
export function extractFamilySurname(fullName, countryName) {
  if (!fullName) return "";
  const country = getCountryBigData(countryName);
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];

  if (country.name_order === "eastern") {
    // Họ là từ đầu tiên (e.g. "Phạm" trong "Phạm Hải Đăng")
    return parts[0];
  } else {
    // Họ là từ cuối cùng (e.g. "Rattanakorn" trong "Somchai Rattanakorn")
    return parts[parts.length - 1];
  }
}
