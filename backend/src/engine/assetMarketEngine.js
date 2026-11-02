// BigData Global Investment & Real Estate Market Engine (LifeGraph V8.6)
// Provides 5 realistic investment tiers localized by Country, City, and Economic Condition

export const HOUSING_TIERS = [
  {
    tier: 1,
    id: "slum_shared",
    name: "Phòng trọ sinh viên thuê chung",
    rent_per_year: 1200,
    min_wealth: 0,
    happiness_bonus: -5,
    health_bonus: -3,
    description: "Không gian chật hẹp, cách âm kém, ẩm thấp nhưng chi phí rẻ mạt."
  },
  {
    tier: 2,
    id: "rental_apartment",
    name: "Căn hộ chung cư 2 phòng ngủ tiện nghi",
    rent_per_year: 7200,
    buy_price: 65000,
    min_wealth: 15000,
    happiness_bonus: +5,
    health_bonus: +2,
    description: "Khu vực dân trí văn minh, gần bệnh viện và trường học, ban công thoáng mát."
  },
  {
    tier: 3,
    id: "townhouse_central",
    name: "Nhà phố thương mại trung tâm thành phố",
    rent_per_year: 24000,
    buy_price: 250000,
    min_wealth: 100000,
    happiness_bonus: +12,
    health_bonus: +5,
    description: "Vị trí đắc địa, mặt tiền sầm uất, an cư vững bền gia tăng vị thế xã hội."
  },
  {
    tier: 4,
    id: "luxury_villa",
    name: "Biệt thự sân vườn sinh thái ven đô",
    rent_per_year: 60000,
    buy_price: 1200000,
    min_wealth: 600000,
    happiness_bonus: +22,
    health_bonus: +12,
    description: "Khu biệt lập an ninh 24/7, hồ bơi riêng, vườn cây thanh lọc không khí giúp trường thọ."
  },
  {
    tier: 5,
    id: "grand_manor",
    name: "Dinh thự hào môn trên đồi cao",
    rent_per_year: 180000,
    buy_price: 6500000,
    min_wealth: 3500000,
    happiness_bonus: +35,
    health_bonus: +20,
    description: "Biểu tượng quyền lực dòng tộc, có bãi đáp trực thăng và hầm trú ẩn công nghệ cao."
  }
];

// Universal Base BigData Templates
const GLOBAL_MARKET_DATABASE = [
  // =========================================================================
  // TIER 1: TÍCH SẢN VI MÔ ($500 - $5.000)
  // =========================================================================
  {
    id: "m1_savings",
    tier: 1,
    tier_label: "Tích Sản Vi Mô",
    type: "savings",
    icon: "🏦",
    name: "Tiền Gửi Tiết Kiệm Kỳ Hạn 12 Tháng",
    base_cost_usd: 800,
    annual_yield_rate: 0.065, // 6.5%/year
    maintenance_rate: 0,
    ap_cost: 1,
    desc: "Gửi tiết kiệm có kỳ hạn tại ngân hàng thương mại, lãi suất tích lũy an toàn tuyệt đối.",
    risk_level: "Rất thấp"
  },
  {
    id: "m2_gold",
    tier: 1,
    tier_label: "Tích Sản Vi Mô",
    type: "gold",
    icon: "🪙",
    name: "Vàng Vật Chất Tích Trữ",
    base_cost_usd: 2500,
    annual_yield_rate: 0.03, // 3% hedge
    maintenance_rate: 0,
    ap_cost: 1,
    desc: "Vàng miếng hoặc vàng nhẫn chuẩn quốc tế. Hầm trú ẩn chống lạm phát và tiền tệ mất giá.",
    risk_level: "Thấp"
  },
  {
    id: "m3_index_etf",
    tier: 1,
    tier_label: "Tích Sản Vi Mô",
    type: "stocks",
    icon: "📊",
    name: "Chứng Chỉ Quỹ Chỉ Số (Index ETF)",
    base_cost_usd: 4000,
    annual_yield_rate: 0.10, // 10%/year
    maintenance_rate: 0.005,
    ap_cost: 1,
    desc: "Đầu tư vào rổ 50 doanh nghiệp dẫn đầu thị trường chứng khoán, hưởng cổ tức hàng năm.",
    risk_level: "Trung bình"
  },

  // =========================================================================
  // TIER 2: TĂNG TRƯỞNG & KINH DOANH ($5.000 - $50.000)
  // =========================================================================
  {
    id: "g1_tech_stocks",
    tier: 2,
    tier_label: "Tăng Trưởng & Khởi Nghiệp",
    type: "stocks",
    icon: "🚀",
    name: "Cổ Phiếu Công Nghệ & Bán Dẫn",
    base_cost_usd: 12000,
    annual_yield_rate: 0.16, // 16%/year
    maintenance_rate: 0.01,
    ap_cost: 1,
    desc: "Đón đầu làn sóng trí tuệ nhân tạo và tự động hóa, tiềm năng sinh lời đột phá.",
    risk_level: "Khá cao"
  },
  {
    id: "g2_franchise_cafe",
    tier: 2,
    tier_label: "Tăng Trưởng & Khởi Nghiệp",
    type: "business",
    icon: "☕",
    name: "Cửa Hàng Cà Phê Nhượng Quyền",
    base_cost_usd: 28000,
    annual_yield_rate: 0.18,
    maintenance_rate: 0.03,
    ap_cost: 2,
    desc: "Thương hiệu F&B vận hành chuyên nghiệp, tạo dòng tiền thực thu đều đặn hàng quý.",
    risk_level: "Trung bình"
  },
  {
    id: "g3_suburban_land",
    tier: 2,
    tier_label: "Tăng Trưởng & Khởi Nghiệp",
    type: "real_estate",
    icon: "🗺️",
    name: "Đất Nền Ven Đô Đón Sóng Hạ Tầng",
    base_cost_usd: 45000,
    annual_yield_rate: 0.12,
    maintenance_rate: 0.005,
    ap_cost: 2,
    desc: "Khu vực sắp mở rộng đường cao tốc và vành đai, biên độ tăng giá vốn cực lớn.",
    risk_level: "Trung bình"
  },

  // =========================================================================
  // TIER 3: DÒNG TIỀN THỤ ĐỘNG ($50.000 - $300.000)
  // =========================================================================
  {
    id: "p1_rental_condo",
    tier: 3,
    tier_label: "Dòng Tiền Thụ Động",
    type: "real_estate",
    icon: "🏢",
    name: "Căn Hộ Dịch Vụ Cho Thuê Trung Tâm",
    base_cost_usd: 85000,
    annual_yield_rate: 0.085,
    maintenance_rate: 0.012,
    ap_cost: 2,
    desc: "Căn hộ cao cấp cho chuyên gia nước ngoài thuê dài hạn, dòng tiền ròng vững chắc.",
    risk_level: "Thấp"
  },
  {
    id: "p2_shophouse",
    tier: 3,
    tier_label: "Dòng Tiền Thụ Động",
    type: "real_estate",
    icon: "🏬",
    name: "Nhà Phố Thương Mại Shophouse",
    base_cost_usd: 180000,
    annual_yield_rate: 0.095,
    maintenance_rate: 0.015,
    ap_cost: 2,
    desc: "Mặt tiền đại lộ, cho ngân hàng hoặc chuỗi bán lẻ thuê mặt bằng 5-10 năm.",
    risk_level: "Thấp"
  },
  {
    id: "p3_pharmacy_chain",
    tier: 3,
    tier_label: "Dòng Tiền Thụ Động",
    type: "business",
    icon: "💊",
    name: "Chuỗi Nhà Thuốc & Vật Tư Y Tế",
    base_cost_usd: 140000,
    annual_yield_rate: 0.14,
    maintenance_rate: 0.025,
    ap_cost: 2,
    desc: "Nhu cầu chăm sóc sức khỏe thiết yếu không bị ảnh hưởng bởi suy thoái kinh tế.",
    risk_level: "Thấp"
  },

  // =========================================================================
  // TIER 4: THƯỢNG LƯU & QUY MÔ LỚN ($300.000 - $2.000.000)
  // =========================================================================
  {
    id: "l1_office_tower",
    tier: 4,
    tier_label: "Thượng Lưu & Quy Mô Lớn",
    type: "real_estate",
    icon: "🏙️",
    name: "Tòa Nhà Văn Phòng Mini 7 Tầng",
    base_cost_usd: 650000,
    annual_yield_rate: 0.09,
    maintenance_rate: 0.018,
    ap_cost: 2,
    desc: "Tòa nhà văn phòng cho thuê trọn gói, bảo chứng danh vọng và tiềm lực gia tộc.",
    risk_level: "Rất thấp"
  },
  {
    id: "l2_beach_resort",
    tier: 4,
    tier_label: "Thượng Lưu & Quy Mô Lớn",
    type: "real_estate",
    icon: "🏖️",
    name: "Biệt Thự Nghỉ Dưỡng Mặt Biển",
    base_cost_usd: 950000,
    annual_yield_rate: 0.11,
    maintenance_rate: 0.02,
    ap_cost: 2,
    desc: "Tọa lạc tại vịnh biển thiên đường, vừa nghỉ dưỡng gia đình vừa khai thác du lịch VIP.",
    risk_level: "Trung bình"
  },
  {
    id: "l3_pre_ipo_startup",
    tier: 4,
    tier_label: "Thượng Lưu & Quy Mô Lớn",
    type: "business",
    icon: "🦄",
    name: "Cổ Phần Kỳ Lân Công Nghệ Pre-IPO",
    base_cost_usd: 450000,
    annual_yield_rate: 0.22,
    maintenance_rate: 0.01,
    ap_cost: 2,
    desc: "Cổ phần chiến lược trước ngày niêm yết sàn quốc tế, cơ hội nhân tài sản gấp 5 lần.",
    risk_level: "Cao"
  },

  // =========================================================================
  // TIER 5: ĐẾ CHẾ TÀI PHIỆT ($2.000.000 - $25.000.000)
  // =========================================================================
  {
    id: "d1_hotel_5star",
    tier: 5,
    tier_label: "Đế Chế Tài Phiệt",
    type: "real_estate",
    icon: "👑",
    name: "Khách Sạn 5 Sao Trung Tâm Thủ Đô",
    base_cost_usd: 3500000,
    annual_yield_rate: 0.10,
    maintenance_rate: 0.02,
    ap_cost: 2,
    desc: "Biểu tượng uy quyền dòng họ, tiếp đón nguyên thủ và giới siêu giàu toàn cầu.",
    risk_level: "Thấp"
  },
  {
    id: "d2_vc_fund",
    tier: 5,
    tier_label: "Đế Chế Tài Phiệt",
    type: "business",
    icon: "🌐",
    name: "Quỹ Đầu Tư Mạo Hiểm Gia Tộc (Family VC)",
    base_cost_usd: 6000000,
    annual_yield_rate: 0.18,
    maintenance_rate: 0.015,
    ap_cost: 2,
    desc: "Nắm giữ mạng lưới 30 công ty công nghệ cao, chi phối xu hướng kinh tế mới.",
    risk_level: "Trung bình"
  },
  {
    id: "d3_family_trust",
    tier: 5,
    tier_label: "Đế Chế Tài Phiệt",
    type: "business",
    icon: "🛡️",
    name: "Quỹ Tín Thác Gia Tộc Thụy Sĩ (Swiss Trust)",
    base_cost_usd: 12000000,
    annual_yield_rate: 0.075,
    maintenance_rate: 0.008,
    ap_cost: 2,
    desc: "Bảo hộ tài sản tuyệt đối trước mọi biến động chính trị, miễn trừ hoàn toàn thuế thừa kế.",
    risk_level: "An toàn tuyệt đối"
  }
];

import { getCountryBigData } from '../data/countryBigData.js';

// Localize asset names and descriptions according to Character Country
export function getLocalizedMarketAssets(nationality = "Việt Nam", characterCity = "") {
  const countryData = getCountryBigData(nationality);
  const countryAssets = countryData?.assets || {};

  return GLOBAL_MARKET_DATABASE.map(item => {
    let localizedName = countryAssets[item.id] || item.name;
    let localizedDesc = item.desc;

    // Optional dynamic city replacement if asset string mentions city template
    if (characterCity && localizedName.includes("Hà Nội") && countryData.id === "T2_Vietnam") {
      localizedName = localizedName.replace("Hà Nội", characterCity);
    } else if (characterCity && localizedName.includes("Sukhumvit") && countryData.id === "T2_Thailand") {
      localizedName = localizedName.replace("Sukhumvit Bangkok", characterCity);
    }

    const annualYieldCash = Math.round(item.base_cost_usd * item.annual_yield_rate);
    const maintenanceCost = Math.round(item.base_cost_usd * item.maintenance_rate);

    return {
      ...item,
      name: localizedName,
      desc: localizedDesc,
      cost: item.base_cost_usd,
      cash_flow: annualYieldCash,
      maintenance: maintenanceCost
    };
  });
}
