import { getRandom } from './rng.js';
// backend/src/engine/breakthroughEngine.js
import { awardLifeExp } from './rpgProgressionEngine.js';

export function getBreakthroughForAge(age) {
  const numericAge = Number(age ?? 0);
  if (numericAge < 6) {
    return {
      id: 'breakthrough_first_words',
      title: 'Tập Nói & Khám Phá Thần Đồng',
      icon: '🍼',
      costAp: 2,
      costCash: 0,
      description: 'Dành toàn bộ năng lượng tập nói và biểu đạt sớm, kích hoạt tư duy thần đồng từ trong nôi.',
      successRate: 0.85,
      successReward: {
        vitality: 5,
        karma: 15,
        exp: 40,
        flag: 'early_talking_genius',
        message: 'Thần đồng bập bẹ sớm! Cả nhà kinh ngạc về trí tuệ phi thường (+15 Karma, +40 EXP).'
      },
      failureReward: {
        vitality: 2,
        karma: 5,
        exp: 20,
        message: 'Cười đùa bập bẹ đáng yêu, gia đình ngập tràn niềm vui (+5 Karma).'
      }
    };
  }

  if (numericAge <= 17) {
    return {
      id: 'breakthrough_olympiad',
      title: 'Đăng Ký Thi Học Sinh Giỏi Quốc Gia',
      icon: '🏆',
      costAp: 2,
      costCash: 200,
      description: 'Dồn toàn lực ôn luyện tranh giải kỳ thi cấp quốc gia, bước nhảy vọt học vấn.',
      successRate: 0.65,
      successReward: {
        cash: 1200,
        karma: 20,
        exp: 60,
        flag: 'national_olympiad_laureate',
        message: 'Đoạt giải Nhất Quốc Gia! Được tuyên dương toàn trường & nhận học bổng $1,200 (+20 Karma, +60 EXP).'
      },
      failureReward: {
        exp: 30,
        burnout: 10,
        message: 'Thiếu một chút may mắn để đoạt giải, nhưng tôi luyện bản lĩnh phòng thi (+30 EXP, +10 Stress).'
      }
    };
  }

  if (numericAge <= 35) {
    return {
      id: 'breakthrough_angel_investment',
      title: 'Góp Vốn Thiên Thần Dự Án Đột Phá',
      icon: '🚀',
      costAp: 2,
      costCash: 5000,
      description: 'Dồn 2 AP và vốn mỏng rót vào một dự án tiềm năng mở ra cơ hội nhân 5 tài sản.',
      successRate: 0.60,
      successReward: {
        cash: 25000,
        karma: 15,
        exp: 80,
        flag: 'startup_angel_investor',
        message: 'Dự án bùng nổ doanh số! Thu về $25,000 lợi nhuận và tiếng vang lớn trên thương trường (+80 EXP).'
      },
      failureReward: {
        exp: 40,
        burnout: 15,
        message: 'Dự án gặp trục trặc dòng tiền, coi như học phí đắt giá trên thương trường (+40 EXP, +15 Stress).'
      }
    };
  }

  if (numericAge <= 55) {
    return {
      id: 'breakthrough_industry_keynote',
      title: 'Đấu Thầu Hợp Đồng Ngành Trọng Điểm',
      icon: '🏛️',
      costAp: 2,
      costCash: 10000,
      description: 'Dốc toàn bộ uy tín và quan hệ đấu thầu gói thầu then chốt củng cố cơ đồ gia tộc.',
      successRate: 0.68,
      successReward: {
        cash: 60000,
        karma: 25,
        exp: 100,
        flag: 'industry_titan_standing',
        message: 'Thắng thầu vang dội! Ký hợp đồng lớn trị giá $60,000, vị thế chuyên môn vững như bàn thạch (+100 EXP).'
      },
      failureReward: {
        exp: 45,
        burnout: 20,
        message: 'Đối thủ thâu tóm hợp đồng, tạm thời củng cố lại nội bộ (+45 EXP, +20 Stress).'
      }
    };
  }

  return {
    id: 'breakthrough_legacy_endowment',
    title: 'Thành Lập Quỹ Học Bổng Gia Tộc',
    icon: '🌅',
    costAp: 2,
    costCash: 15000,
    description: 'Trích một phần sản nghiệp thành lập quỹ bảo trợ khuyến học, để lại tiếng thơm cho con cháu muôn đời.',
    successRate: 0.90,
    successReward: {
      karma: 40,
      vitality: 10,
      exp: 120,
      flag: 'clan_legacy_endowed',
      message: 'Quỹ học bổng ra mắt trang trọng! Hàng trăm học sinh cơ nhỡ được cưu mang, đại phúc đức gia tộc (+40 Karma, +120 EXP).'
    },
    failureReward: {
      karma: 15,
      exp: 50,
      message: 'Thủ tục pháp lý mất nhiều thời gian, nhưng tâm nguyện thiện lành vẫn được ghi nhận (+15 Karma).'
    }
  };
}

export function executeBreakthroughAction(character) {
  if (!character) throw new Error("Không có nhân vật");
  if ((character.action_points || 0) < 2) {
    throw new Error("Cần tối thiểu 2 AP để thực hiện Hành Động Đột Phá!");
  }

  const action = getBreakthroughForAge(character.age);
  if (action.costCash > 0 && (Number(character.cash) || 0) < action.costCash) {
    throw new Error(`Cần tối thiểu $${action.costCash.toLocaleString()} để thực hiện ${action.title}!`);
  }

  character.action_points -= action.costAp;
  if (action.costCash > 0) {
    character.cash = (Number(character.cash) || 0) - action.costCash;
  }

  const roll = getRandom();
  const isSuccess = roll < action.successRate;
  const outcome = isSuccess ? action.successReward : action.failureReward;

  if (outcome.cash) character.cash = (Number(character.cash) || 0) + outcome.cash;
  if (outcome.vitality) character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + outcome.vitality);
  if (outcome.burnout) character.burnout = Math.min(100, (character.burnout || 0) + outcome.burnout);
  if (outcome.karma) character.karma = Math.min(100, (character.karma || 100) + outcome.karma);
  if (outcome.flag) {
    character.hidden_flags = character.hidden_flags || [];
    if (!character.hidden_flags.includes(outcome.flag)) character.hidden_flags.push(outcome.flag);
  }
  const isMaverick = (character.innate_traits || []).includes('creative_maverick');
  const expGain = outcome.exp ? (isMaverick ? outcome.exp * 2 : outcome.exp) : 0;
  if (expGain > 0) awardLifeExp(character, expGain, action.title);

  const history = character.history_log || [];
  history.push({
    age: character.age,
    event: `🚀 HÀNH ĐỘNG ĐỘT PHÁ: ${action.title}`,
    choice: `${outcome.message} (${isSuccess ? 'THÀNH CÔNG RỰC RỠ' : 'THỬ THÁCH BẢN LĨNH'})`
  });
  character.history_log = history;

  return {
    isSuccess,
    actionTitle: action.title,
    actionIcon: action.icon,
    message: outcome.message,
    deltaSummary: isSuccess ? `+${outcome.exp} EXP · Thành Công` : `+${outcome.exp || 20} EXP · Tích Lũy Kinh Nghiệm`
  };
}
