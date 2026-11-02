/**
 * prototypeTickOrchestrator.js
 * LifeGraph v0.1 Prototype - Annual Tick & Continuous Flow Orchestrator
 * 
 * Manages:
 * - 3-Act Time Progression (Act 1: 18-30, Act 2: 30-50, Act 3: 50-80+)
 * - Income, living costs, and fair debt servicing
 * - Maturing pending consequences (5-year delays)
 * - Family life events (Marriage, Childbirth, Heir coming of age)
 * - Narrative chain node triggering and intelligent auto-pause
 * - Elder mortality & succession readiness
 */

import crypto from 'crypto';
import { getAvailableStoryNodes, resolveStoryDecision } from './storyChainEngine.js';
import { processAnnualDebts, calculateNetWorth, createDebtRecord, DEBT_STATUS } from './fairEconomyEngine.js';
import { generateChild, updateFamilyAnnualTick, evaluateHeirWillingness, createOrUpdateWill, executeSuccession } from './familySuccessionEngine.js';

export const ACTS = {
  ACT_1_YOUTH: {
    id: 'ACT_1_YOUTH',
    name: 'Hồi 1: Tuổi Trẻ & Lập Thân',
    ageRange: '18 - 30 tuổi',
    description: 'Thời kỳ tích lũy kiến thức, chọn ngã rẽ nghề nghiệp và kết duyên.'
  },
  ACT_2_EMPIRE: {
    id: 'ACT_2_EMPIRE',
    name: 'Hồi 2: Cơ Nghiệp & Trọng Trách',
    ageRange: '30 - 50 tuổi',
    description: 'Giai đoạn cao điểm áp lực: sự nghiệp, mua nhà trả góp và nuôi dạy con cái.'
  },
  ACT_3_LEGACY: {
    id: 'ACT_3_LEGACY',
    name: 'Hồi 3: Di Sản & Chuyển Giao',
    ageRange: '50 - 80+ tuổi',
    description: 'Giải quyết nợ nần, chuẩn bị di chúc và chuyển giao thế hệ cho con cái.'
  }
};

/**
 * Khởi tạo một phiên chơi nguyên mẫu 2 thế hệ hoàn chỉnh
 */
export function initPrototypeSession({ playerName = 'Trần Văn An', startYear = 2024 } = {}) {
  const character = {
    id: crypto.randomUUID(),
    name: playerName,
    gender: 'MALE',
    age: 18,
    generation: 1,
    birth_year: startYear - 18,
    cash: 6000,
    burnout: 10,
    action_points: 3,
    max_action_points: 3,
    skills: {
      tech_logic: { level: 1, name: 'Logic & Kỹ thuật' },
      finance_market: { level: 1, name: 'Tài chính & Kinh doanh' },
      creativity: { level: 1, name: 'Sáng tạo & Đổi mới' },
      relationship: { level: 2, name: 'Gia đình & Giao tiếp' }
    },
    traits: ['AMBITIOUS', 'DILIGENT'],
    hidden_flags: [],
    history: [
      {
        year: startYear,
        age: 18,
        event: 'Khởi đầu hành trình',
        choice: 'Bước vào đời ở tuổi 18',
        effects_summary: ['Bắt đầu với $6,000 vốn khởi nghiệp']
      }
    ]
  };

  const family = {
    spouse: null, // Sẽ kích hoạt kết hôn vào khoảng 23-25 tuổi
    children: []
  };

  const debts = [];
  const assets = [
    {
      id: crypto.randomUUID(),
      name: 'Xưởng nghề gia đình (Cơ bản)',
      category: 'BUSINESS',
      type: 'BUSINESS',
      value: 25000,
      current_value: 25000,
      annual_yield: 0.08
    }
  ];

  const pending_consequences = [];
  const dynasty_history = [];

  const sessionState = {
    sessionId: crypto.randomUUID(),
    generation_index: 1,
    current_year: startYear,
    act: 'ACT_1_YOUTH',
    speed: 1, // 0 = PAUSED, 1 = NORMAL (1s/năm), 2 = FAST (0.5s/năm)
    is_paused: false,
    active_story_node: null,
    needs_succession: false,
    is_game_over: false,
    character,
    family,
    assets,
    debts,
    pending_consequences,
    dynasty_history,
    will: null,
    tick_logs: []
  };

  // Tính Net worth ban đầu
  const nw = calculateNetWorth(character, assets, debts);
  sessionState.net_worth = nw.net_worth;
  sessionState.solvency = nw.solvency;

  // Kiểm tra ngay xem có story node đầu đời (Node 1: Ngã rẽ đầu đời)
  const availableNodes = getAvailableStoryNodes(character, sessionState.current_year);
  if (availableNodes.length > 0) {
    sessionState.active_story_node = availableNodes[0];
    sessionState.is_paused = true;
  }

  return sessionState;
}

/**
 * Thực hiện bước nhảy 1 năm (Annual Tick Step)
 */
export function advancePrototypeYear(sessionState) {
  if (sessionState.is_game_over || sessionState.needs_succession) {
    return {
      sessionState,
      events: ['Trò chơi đang tạm dừng để chuẩn bị chuyển giao thế hệ.']
    };
  }

  const events = [];
  sessionState.current_year += 1;
  const currentYear = sessionState.current_year;
  const char = sessionState.character;
  char.age += 1;

  // 1. Cập nhật Hồi (Act)
  if (char.age < 30) {
    sessionState.act = 'ACT_1_YOUTH';
  } else if (char.age < 50) {
    if (sessionState.act === 'ACT_1_YOUTH') {
      events.push(`Bước sang ${ACTS.ACT_2_EMPIRE.name}: Bạn đã bước vào độ tuổi gánh vác cơ nghiệp và gia đình.`);
    }
    sessionState.act = 'ACT_2_EMPIRE';
  } else {
    if (sessionState.act === 'ACT_2_EMPIRE') {
      events.push(`Bước sang ${ACTS.ACT_3_LEGACY.name}: Tóc đã hoa râm, đây là lúc lo việc truyền thừa và an yên.`);
    }
    sessionState.act = 'ACT_3_LEGACY';
  }

  // 2. Tính toán Thu nhập & Chi phí sinh hoạt hàng năm
  let baseSalary = 12000;
  if (char.age >= 25 && char.age < 35) baseSalary = 22000;
  else if (char.age >= 35 && char.age < 55) baseSalary = 38000;
  else if (char.age >= 55 && char.age < 65) baseSalary = 32000;
  else if (char.age >= 65) baseSalary = 14000; // Lương hưu / cổ tức

  // Hệ số chuyên môn từ kỹ năng & cờ
  if (char.hidden_flags?.includes('corporate_specialist_ready')) baseSalary += 10000;
  if (char.hidden_flags?.includes('master_craftsman_reputation')) baseSalary += 8000;
  if (char.hidden_flags?.includes('opted_promotion_accepted')) baseSalary += 15000;

  // Lợi tức từ tài sản kinh doanh
  let assetYieldTotal = 0;
  for (const a of sessionState.assets || []) {
    if (a.annual_yield && a.current_value) {
      assetYieldTotal += Math.round(a.current_value * a.annual_yield);
    }
  }

  // Chi phí sinh hoạt
  let livingCost = 10000;
  if (sessionState.family?.spouse) livingCost += 5000;
  const childCount = (sessionState.family?.children || []).length;
  livingCost += childCount * 4000;
  if (char.hidden_flags?.includes('bought_family_home')) livingCost += 3000; // Chi phí bảo trì nhà

  const netAnnualCashFlow = (baseSalary + assetYieldTotal) - livingCost;
  char.cash = Math.max(0, (char.cash || 0) + netAnnualCashFlow);

  events.push(`Thu nhập: +$${(baseSalary + assetYieldTotal).toLocaleString()} | Sinh hoạt phí: -$${livingCost.toLocaleString()} (Dòng tiền ròng: ${netAnnualCashFlow >= 0 ? '+' : ''}$${netAnnualCashFlow.toLocaleString()})`);

  // 3. Xử lý Trả nợ công bằng (Fair Debts Servicing)
  if (sessionState.debts && sessionState.debts.length > 0) {
    const debtRes = processAnnualDebts(char, sessionState.debts, currentYear);
    sessionState.debts = debtRes.debts;
    for (const log of debtRes.paymentLog) {
      events.push(log.message);
    }
  }

  // 4. Giải quyết các Hậu Quả Chờ đến hạn (Matured Pending Consequences)
  if (sessionState.pending_consequences && sessionState.pending_consequences.length > 0) {
    sessionState.pending_consequences.forEach(pc => {
      if (pc.status === 'PENDING' && currentYear >= pc.due_year) {
        pc.status = 'EXECUTED';
        events.push(`[HỆ QUẢ ĐẾN HẠN] ${pc.title}: ${pc.description}`);

        // Áp dụng effect
        if (pc.effect?.income_boost) {
          char.cash += pc.effect.income_boost;
          events.push(`Nhận khoản tăng thu nhập tích lũy: +$${pc.effect.income_boost.toLocaleString()}`);
        }
        if (pc.effect?.parent_health_delta) {
          events.push('Sức khỏe cha mẹ giảm sút do thiếu người kề cận chăm sóc.');
        }
        if (pc.effect?.flags_add) {
          if (!char.hidden_flags) char.hidden_flags = [];
          char.hidden_flags.push(...pc.effect.flags_add);
        }
        if (pc.effect?.divorce_risk && Math.random() < 0.6) {
          if (sessionState.family?.spouse) {
            sessionState.family.spouse.status = 'SEPARATED';
            char.burnout = Math.min(100, char.burnout + 25);
            events.push('Hôn nhân rạn nứt sâu sắc do nhiều năm xa cách: Bạn và bạn đời quyết định ly thân.');
          }
        }
      }
    });
  }

  // 5. Cập nhật Gia đình (Family Life Events)
  // Kết hôn tự nhiên ở tuổi 24 nếu chưa kết hôn
  if (char.age === 24 && !sessionState.family?.spouse) {
    const spouseNames = char.gender === 'MALE' ? ['Lê Thị Mai', 'Nguyễn Thu Trang', 'Phạm Thảo Vy'] : ['Trần Quốc Tuấn', 'Vũ Minh Khoa'];
    const sName = spouseNames[Math.floor(Math.random() * spouseNames.length)];
    sessionState.family.spouse = {
      name: sName,
      birth_year: currentYear - 23,
      age: 23,
      trust: 75,
      status: 'ALIVE',
      hidden_memories: []
    };
    events.push(`Bạn đã kết hôn với ${sName}! Gia đình nhỏ bắt đầu được xây dựng.`);
  }

  // Sinh con ở tuổi 26 và 29
  if ((char.age === 26 || char.age === 29) && sessionState.family?.spouse && sessionState.family.spouse.status === 'ALIVE') {
    const childIndex = (sessionState.family.children || []).length + 1;
    const newChild = generateChild({
      birthYear: currentYear,
      parentSurname: char.name.split(' ')[0] || 'Trần',
      childIndex
    });
    sessionState.family.children.push(newChild);
    events.push(`Chào đón thành viên mới: Bé ${newChild.full_name} cất tiếng khóc chào đời!`);
  }

  // Cập nhật tuổi & tâm lý các thành viên gia đình
  const familyTick = updateFamilyAnnualTick(sessionState.family, currentYear);
  sessionState.family = familyTick.family;
  for (const fe of familyTick.familyEvents) {
    events.push(fe.message);
  }

  // 6. Kiểm tra Sức khỏe, Lão hóa & Sẵn sàng Chuyển giao Thế hệ
  if (char.age >= 75 || (char.age >= 68 && char.burnout >= 80)) {
    sessionState.needs_succession = true;
    sessionState.is_paused = true;
    events.push(`[DI SẢN TRUYỀN THỪA] Tuổi già và sức lực đã cạn kiệt ở tuổi ${char.age}. Bạn cần kích hoạt chuyển giao thế hệ cho đời con.`);
  }

  // 7. Kiểm tra Kích hoạt Node Truyện Dẫn (Story Chain Trigger) & Tự Động Dừng (Auto-Pause)
  if (!sessionState.active_story_node && !sessionState.needs_succession) {
    const availableNodes = getAvailableStoryNodes(char, currentYear);
    if (availableNodes.length > 0) {
      sessionState.active_story_node = availableNodes[0];
      sessionState.is_paused = true; // TỰ ĐỘNG DỪNG ĐỂ NGƯỜI CHƠI SUY NGẪM LỰA CHỌN
      events.push(`[NGÃ RẼ CUỘC ĐỜI] Đã kích hoạt sự kiện: "${availableNodes[0].title}". Trò chơi tự động tạm dừng để bạn quyết định.`);
    }
  }

  // 8. Tái tính toán Net Worth & Solvency
  const nw = calculateNetWorth(char, sessionState.assets, sessionState.debts);
  sessionState.net_worth = nw.net_worth;
  sessionState.solvency = nw.solvency;

  // Giảm nhẹ burnout tự nhiên nếu nợ không quá hạn
  if (nw.totalOverdue === 0 && char.burnout > 5) {
    char.burnout = Math.max(0, char.burnout - 2);
  }

  // Lưu lịch sử log năm
  sessionState.tick_logs.unshift({
    year: currentYear,
    age: char.age,
    events
  });
  if (sessionState.tick_logs.length > 25) {
    sessionState.tick_logs = sessionState.tick_logs.slice(0, 25);
  }

  return {
    sessionState,
    events
  };
}

/**
 * Xử lý khi người chơi đưa ra quyết định tại Node truyện
 */
export function processPrototypeDecision(sessionState, optionId) {
  const node = sessionState.active_story_node;
  if (!node) {
    throw new Error('Hiện tại không có sự kiện nào đang chờ quyết định.');
  }

  const char = sessionState.character;
  const decisionRes = resolveStoryDecision(char, node, optionId, sessionState.current_year);

  // Cập nhật nhân vật
  sessionState.character = decisionRes.character;
  if (!sessionState.character.history) sessionState.character.history = [];
  sessionState.character.history.push(decisionRes.historyItem);

  // Thêm hậu quả chờ
  if (decisionRes.scheduledConsequence) {
    sessionState.pending_consequences.push(decisionRes.scheduledConsequence);
  }

  // Thêm tài sản mới nếu có
  if (decisionRes.newAsset) {
    sessionState.assets.push({
      id: crypto.randomUUID(),
      ...decisionRes.newAsset
    });
  }

  // Thêm nợ mới nếu có
  if (decisionRes.newDebt) {
    const debtRecord = createDebtRecord({
      ...decisionRes.newDebt,
      start_year: sessionState.current_year
    });
    sessionState.debts.push(debtRecord);
  }

  // Trả bớt nợ nếu có
  if (decisionRes.debtPaydown && decisionRes.debtPaydown > 0) {
    let remainPay = decisionRes.debtPaydown;
    for (const d of sessionState.debts) {
      if (d.principal > 0 && remainPay > 0) {
        const p = Math.min(d.principal, remainPay);
        d.principal -= p;
        remainPay -= p;
        if (d.principal <= 0) d.status = DEBT_STATUS.SETTLED;
      }
    }
  }

  // Cập nhật niềm tin gia đình
  if (decisionRes.familyTrustDelta && sessionState.family?.spouse) {
    sessionState.family.spouse.trust = Math.max(0, Math.min(100, sessionState.family.spouse.trust + decisionRes.familyTrustDelta));
  }

  // Ghi nhận quyết định hoàn tất, giải phóng node và tiếp tục
  sessionState.active_story_node = null;
  sessionState.is_paused = false;

  // Tính lại net worth
  const nw = calculateNetWorth(sessionState.character, sessionState.assets, sessionState.debts);
  sessionState.net_worth = nw.net_worth;
  sessionState.solvency = nw.solvency;

  return {
    sessionState,
    historyItem: decisionRes.historyItem,
    scheduledConsequence: decisionRes.scheduledConsequence
  };
}

/**
 * Xử lý lập di chúc
 */
export function setupWill(sessionState, willData) {
  sessionState.will = createOrUpdateWill(willData);
  return sessionState;
}

/**
 * Xử lý thực thi chuyển giao sang Đời 2
 */
export function triggerSuccessionTransfer(sessionState, heirId, compromiseType = 'STANDARD') {
  const result = executeSuccession({
    sessionState,
    heirId,
    compromiseType
  });

  // Lưu lịch sử thế hệ trước
  sessionState.dynasty_history.push(result.gen1Chronicle);

  // Kế thừa nhân vật mới
  sessionState.character = result.newCharacter;
  sessionState.family = result.newFamily;
  sessionState.assets = result.transferredAssets;
  sessionState.debts = result.transferredDebts;
  sessionState.generation_index = result.newGenerationIndex;

  // Đặt lại cờ trạng thái
  sessionState.needs_succession = false;
  sessionState.is_paused = false;
  sessionState.active_story_node = null;

  // Kiểm tra story node khả dụng cho Đời 2
  const availableNodes = getAvailableStoryNodes(sessionState.character, sessionState.current_year);
  if (availableNodes.length > 0) {
    sessionState.active_story_node = availableNodes[0];
    sessionState.is_paused = true;
  }

  // Tính lại Net worth
  const nw = calculateNetWorth(sessionState.character, sessionState.assets, sessionState.debts);
  sessionState.net_worth = nw.net_worth;
  sessionState.solvency = nw.solvency;

  return {
    sessionState,
    gen1Chronicle: result.gen1Chronicle
  };
}
