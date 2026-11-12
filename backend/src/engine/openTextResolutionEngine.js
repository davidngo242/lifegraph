import { getRandom } from './rng.js';
/**
 * openTextResolutionEngine.js
 * LifeGraph V10 - Open-Text Resolution Engine (Hành Động Tự Do & AI Phán Xử)
 * Evaluates custom user-submitted natural language actions against the current game state.
 */

// Delusion / Troll patterns that violate physical reality or break the game world
const DELUSION_PATTERNS = [
  /bay lên trời/i,
  /mọc cánh/i,
  /tôi là chúa/i,
  /tôi là thượng đế/i,
  /hack hệ thống/i,
  /búng tay biến mất/i,
  /thôi miên tất cả/i,
  /du hành thời gian/i,
  /bắn tia laser/i,
  /biến hình/i,
  /tàng hình/i,
  /vô địch thiên hạ/i,
  /cho tôi 1 (tỷ|triệu) đô/i,
  /cho tôi vô hạn tiền/i,
  /ignore (all )?instructions/i,
  /system prompt/i,
  /set cash/i
];

// Aggressive / High-Risk / Crime patterns
const CRIME_PATTERNS = [
  /cướp/i, /giết/i, /chém/i, /đánh bom/i, /ám sát/i, /đốt phá/i, /tống tiền/i, /bắt cóc/i, /buôn ma túy/i
];

// Pragmatic & Business patterns
const BIZ_PATTERNS = [
  /đàm phán/i, /thương lượng/i, /kinh doanh/i, /buôn bán/i, /đầu tư/i, /hùn vốn/i, /vay/i, /hợp đồng/i, /mở rộng/i, /tiết kiệm/i, /tìm việc/i, /làm thêm/i
];

// Diplomatic & Empathic patterns
const DIPLOMATIC_PATTERNS = [
  /xin lỗi/i, /hòa giải/i, /thấu hiểu/i, /chia sẻ/i, /giúp đỡ/i, /nhờ cậy/i, /chân thành/i, /thuyết phục/i, /kết bạn/i, /chăm sóc/i
];

// Stoic & Enduring patterns
const STOIC_PATTERNS = [
  /cắn răng/i, /nhẫn nhịn/i, /chấp nhận/i, /tập trung học/i, /rèn luyện/i, /bỏ qua/i, /tĩnh tâm/i, /ngồi thiền/i, /buông bỏ/i, /rút lui/i
];

/**
 * Custom Action Resolver
 * @param {Object} params
 * @param {Object} params.character Current character state
 * @param {Object} params.dilemma Current dilemma/crisis
 * @param {string} params.userActionText User freeform input text
 * @returns {Promise<Object>} Resolution outcome with feasibility, narrative, and stat deltas
 */
export async function resolveCustomAction({ character, dilemma, userActionText }) {
  const text = (userActionText || "").trim();
  if (!text) {
    return {
      success: false,
      feasibility_score: 0,
      verdict_type: "invalid",
      resolution_title: "Chưa Có Hành Động",
      narrative: "Bạn đứng chôn chân do dự, không đưa ra bất kỳ quyết định nào.",
      effects: { cash_delta: 0, vitality_delta: 0, burnout_delta: 5, karma_delta: -2 },
      applied_flag: "hesitant_soul"
    };
  }

  const age = Number(character.age ?? 20);
  const cash = Number(character.cash ?? 0);
  const vitality = Number(character.vitality ?? 80);
  const karma = Number(character.karma ?? 50);
  const traits = character.innate_traits || [];

  // 1. Check Delusion / Troll / Prompt Injection
  for (const pattern of DELUSION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        success: true,
        feasibility_score: 5,
        verdict_type: "delusion",
        resolution_title: "Cơn Hoang Tưởng Thực Tại (Ảo Giác Nặng)",
        narrative: `Hành động "${text}" hoàn toàn vi phạm quy luật vật lý và thực tại xã hội. Mọi người xung quanh nhìn bạn bằng ánh mắt kinh hoàng. Bạn bị cưỡng chế đưa vào cơ sở y tế giám sát tâm thần vì biểu hiện phân ly thực tế.`,
        effects: {
          cash_delta: -300,
          vitality_delta: -15,
          burnout_delta: 35,
          karma_delta: -10
        },
        applied_flag: "mental_ward_admission"
      };
    }
  }

  // 2. Check Criminal / Violent Recklessness
  for (const pattern of CRIME_PATTERNS) {
    if (pattern.test(text)) {
      const isLucky = getRandom() < 0.25;
      if (isLucky) {
        return {
          success: true,
          feasibility_score: 35,
          verdict_type: "costly_success",
          resolution_title: "Hành Vi Liều Lĩnh Thoát Hiểm Trong Gang Tấc",
          narrative: `Bạn chọn phương án cực đoan: "${text}". Dù giải quyết được thế bế tắc trước mắt, bạn phải sống trong lo âu tột độ và bị cảnh sát đưa vào diện theo dõi đặc biệt. Lương tâm cắn rứt nặng nề.`,
          effects: {
            cash_delta: Math.round(cash * 0.1),
            vitality_delta: -15,
            burnout_delta: 40,
            karma_delta: -30
          },
          applied_flag: "criminal_underworld_record"
        };
      } else {
        return {
          success: true,
          feasibility_score: 15,
          verdict_type: "disaster",
          resolution_title: "Lưới Trời Lồng Lộng (Hậu Quả Pháp Lý)",
          narrative: `Phương án "${text}" nhanh chóng bị lực lượng chức năng chặn đứng. Bạn bị bắt giữ, phạt tiền nặng nề và phải chịu án kỷ luật nghiêm khắc. Danh tiếng gia tộc sụp đổ hoàn toàn.`,
          effects: {
            cash_delta: -Math.min(cash, 5000),
            vitality_delta: -25,
            burnout_delta: 50,
            karma_delta: -45
          },
          applied_flag: "police_custody_record"
        };
      }
    }
  }

  // 3. Realistic Action Analysis (Heuristic NLP Evaluator)
  let feasibilityScore = 60;
  let category = "pragmatic";

  const isBiz = BIZ_PATTERNS.some(p => p.test(text));
  const isDiplomatic = DIPLOMATIC_PATTERNS.some(p => p.test(text));
  const isStoic = STOIC_PATTERNS.some(p => p.test(text));

  // Trait synergy bonuses
  if (isBiz) {
    category = "business";
    feasibilityScore += 15;
    if (traits.includes("trực_giác_kinh_doanh") || traits.includes("mắt_nhìn_xuyên_thị_trường")) feasibilityScore += 15;
    if (age < 18) feasibilityScore -= 10; // Underage trading friction
  } else if (isDiplomatic) {
    category = "diplomatic";
    feasibilityScore += 12;
    if (traits.includes("thấu_cảm_xã_hội") || traits.includes("phong_thái_lãnh_đạo")) feasibilityScore += 15;
    if (karma > 70) feasibilityScore += 10;
  } else if (isStoic) {
    category = "stoic";
    feasibilityScore += 20;
    if (traits.includes("tâm_lý_thép") || traits.includes("ý_chí_bất_khuất")) feasibilityScore += 15;
  }

  // Length & depth bonus (meaningful sentences score higher)
  if (text.length > 30) feasibilityScore += 10;
  if (text.length > 80) feasibilityScore += 5;
  feasibilityScore = Math.min(95, Math.max(25, feasibilityScore));

  const roll = getRandom() * 100;
  const isSuccess = roll <= feasibilityScore;

  if (isSuccess) {
    let cashDelta = 0;
    let vitDelta = 0;
    let burnoutDelta = -10;
    let karmaDelta = 10;
    let title = "Quyết Định Đột Phá Đầy Thuyết Phục";
    let narrative = `Với ý chí và sự mưu lược độc lập: "${text}", bạn từng bước xoay chuyển tình thế một cách ngoạn mục. Những người xung quanh hoàn toàn bất ngờ trước bản lĩnh xử lý tình huống của bạn.`;

    if (category === "business") {
      const reward = Math.round(Math.max(500, cash * 0.15 + (age * 50)));
      cashDelta = reward;
      burnoutDelta = 5;
      karmaDelta = 8;
      title = "Chiến Thuật Thương Trường Nhạy Bén";
      narrative = `Phương án "${text}" đã mang lại hiệu quả kinh tế rõ rệt. Bạn chớp đúng thời cơ, thu về thặng dư +$${reward.toLocaleString()} USD và khẳng định vị thế tự lập.`;
    } else if (category === "diplomatic") {
      karmaDelta = 20;
      burnoutDelta = -15;
      vitDelta = 5;
      title = "Nghệ Thuật Ngoại Giao & Đắc Nhân Tâm";
      narrative = `Nhờ sự chân thành và thấu cảm: "${text}", nút thắt mâu thuẫn được tháo gỡ êm thấm. Bạn nhận được sự cảm phục từ mọi phía, tích lũy thêm nhiều phước báu.`;
    } else if (category === "stoic") {
      burnoutDelta = -25;
      vitDelta = 10;
      karmaDelta = 15;
      title = "Bản Lĩnh Khắc Kỷ Vượt Qua Bão Giông";
      narrative = `Lấy tĩnh chế động: "${text}". Bạn không để cơn bão cảm xúc cuốn đi, giữ tâm thế vững như bàn thạch và biến khủng hoảng thành cơ hội tôi luyện nội tâm.`;
    }

    return {
      success: true,
      feasibility_score: feasibilityScore,
      verdict_type: "success",
      resolution_title: title,
      narrative,
      effects: {
        cash_delta: cashDelta,
        vitality_delta: vitDelta,
        burnout_delta: burnoutDelta,
        karma_delta: karmaDelta
      },
      applied_flag: `custom_resolved_${category}`
    };
  } else {
    // Partial setback or costly experience
    return {
      success: true,
      feasibility_score: feasibilityScore,
      verdict_type: "costly_success",
      resolution_title: "Thử Nghiệm Gian Nan & Bài Học Đắt Giá",
      narrative: `Bạn quyết tâm thực hiện phương án: "${text}". Dù nỗ lực đáng ghi nhận, thực tế khắt khe hơn dự kiến. Bạn phải trả giá bằng một phần công sức và tài lực, nhưng rút ra bài học xương máu cho tương lai.`,
      effects: {
        cash_delta: -Math.round(Math.min(cash * 0.1, 1000)),
        vitality_delta: -8,
        burnout_delta: 20,
        karma_delta: 5
      },
      applied_flag: "tested_by_reality"
    };
  }
}
