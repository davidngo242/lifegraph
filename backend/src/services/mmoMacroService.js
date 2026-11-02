/**
 * mmoMacroService.js
 * LifeGraph V10 - MMO Macro State (Cán Cân Vĩ Mô Dùng Chung)
 * Aggregates collective actions across all active players and broadcasts regional equilibrium.
 */

const GLOBAL_SERVERS = {
  T1: {
    tier_name: "Cõi Phú Quý & Thịnh Vượng (T1)",
    countries: ["Na Uy", "Thụy Sĩ", "Nhật Bản", "Hoa Kỳ"],
    inflation_rate: 22,
    social_unrest: 16,
    environmental_pressure: 42,
    active_players_metric: 1420,
    status_label: "Thịnh Vượng Ổn Định",
    status_color: "emerald"
  },
  T2: {
    tier_name: "Cõi Phát Triển & Cần Lao (T2)",
    countries: ["Việt Nam", "Ba Lan", "Thái Lan", "Brazil"],
    inflation_rate: 38,
    social_unrest: 42,
    environmental_pressure: 64,
    active_players_metric: 3850,
    status_label: "Tăng Trưởng Nóng & Cạnh Tranh",
    status_color: "amber"
  },
  T3: {
    tier_name: "Cõi Khổ Nạn & Sinh Tồn (T3)",
    countries: ["Syria", "Haiti", "Somalia"],
    inflation_rate: 84,
    social_unrest: 88,
    environmental_pressure: 82,
    active_players_metric: 890,
    status_label: "Khủng Hoảng & Bất Ổn Trầm Trọng",
    status_color: "rose"
  }
};

const GLOBAL_BREAKING_NEWS = [
  {
    id: "news_1",
    tier: "T2",
    headline: "Làn sóng đầu tư sản xuất bùng nổ, dòng vốn dịch chuyển mạnh mẽ",
    timestamp: "Vừa xong",
    urgent: false
  },
  {
    id: "news_2",
    tier: "T1",
    headline: "Thị trường công nghệ cao đón làn sóng thâu tóm xuyên quốc gia",
    timestamp: "2 phút trước",
    urgent: false
  },
  {
    id: "news_3",
    tier: "T3",
    headline: "Cảnh báo gián đoạn chuỗi cung ứng lương thực và nhiên liệu mùa đông",
    timestamp: "5 phút trước",
    urgent: true
  }
];

/**
 * Record a player action and subtly perturb regional indices
 */
export function recordPlayerAction(actionType, character = {}) {
  const tier = character.country_tier || "T2";
  const server = GLOBAL_SERVERS[tier];
  if (!server) return;

  // Perturb metrics based on action type
  switch (actionType) {
    case "overtime":
      // More labor production reduces slight inflation, increases slight environmental pressure
      server.inflation_rate = Math.max(10, Math.min(100, +(server.inflation_rate - 0.05).toFixed(2)));
      server.environmental_pressure = Math.max(10, Math.min(100, +(server.environmental_pressure + 0.08).toFixed(2)));
      break;

    case "gamble":
    case "speculate":
      // Speculation boosts inflation and unrest
      server.inflation_rate = Math.max(10, Math.min(100, +(server.inflation_rate + 0.12).toFixed(2)));
      server.social_unrest = Math.max(10, Math.min(100, +(server.social_unrest + 0.06).toFixed(2)));
      break;

    case "buy_asset":
      // Capital inflow drives market momentum
      server.inflation_rate = Math.max(10, Math.min(100, +(server.inflation_rate + 0.08).toFixed(2)));
      break;

    case "wellness":
    case "meditation":
      // Wellness cools down unrest
      server.social_unrest = Math.max(5, Math.min(100, +(server.social_unrest - 0.1).toFixed(2)));
      break;

    case "custom_resolve":
      // Creative custom decisions add subtle equilibrium
      server.social_unrest = Math.max(5, Math.min(100, +(server.social_unrest - 0.05).toFixed(2)));
      break;

    default:
      break;
  }

  // Check if any regional metric crossed crisis threshold (> 85%)
  if (server.social_unrest > 85 && !GLOBAL_BREAKING_NEWS.some(n => n.id === `unrest_crisis_${tier}`)) {
    GLOBAL_BREAKING_NEWS.unshift({
      id: `unrest_crisis_${tier}`,
      tier,
      headline: `🚨 BÁO ĐỘNG ĐỎ (${tier}): Chỉ số bất ổn xã hội chạm đỉnh ${Math.round(server.social_unrest)}%! Khủng hoảng kinh tế toàn vùng kích hoạt.`,
      timestamp: "Khẩn cấp",
      urgent: true
    });
    if (GLOBAL_BREAKING_NEWS.length > 8) GLOBAL_BREAKING_NEWS.pop();
  }
}

/**
 * Retrieve current MMO Macro State and Global News Ticker
 */
export function getMmoMacroState(playerTier = "T2") {
  return {
    servers: GLOBAL_SERVERS,
    player_server: GLOBAL_SERVERS[playerTier] || GLOBAL_SERVERS.T2,
    breaking_news: GLOBAL_BREAKING_NEWS.slice(0, 5),
    synced_at: new Date().toISOString()
  };
}
