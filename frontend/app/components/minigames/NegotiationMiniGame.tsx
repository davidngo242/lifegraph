'use client';

import React, { useState, useEffect } from 'react';
import {
  Handshake,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Scale,
  Brain,
  Sparkles,
  X,
  Play,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../../utils/currencyUtils';

interface NegotiationMiniGameProps {
  nationality?: string;
  currentCity?: string;
  targetLevel?: number;
  onComplete: (result: {
    status: 'success' | 'fair' | 'fail';
    score: number;
    summary: string;
  }) => void;
  onClose: () => void;
}

interface ArgumentCard {
  id: string;
  title: string;
  desc: string;
  leverageChange: number; // Tác động tới uy thế của bạn (+10 to +30)
  patienceImpact: number; // Ảnh hưởng sự kiên nhẫn đối tác (-5 to -20)
  icon: string;
}

const ROUNDS_DATA: {
  round: number;
  scenario: string;
  cards: ArgumentCard[];
}[] = [
  {
    round: 1,
    scenario: "Vòng 1: Mở Màn - Đối tác ra giá ban đầu rất cứng rắn và nghi ngờ năng lực tài chính của bạn.",
    cards: [
      {
        id: "r1_data",
        title: "Dẫn Chứng Dữ Liệu Thị Trường",
        desc: "Đưa ra bảng thống kê định giá trung bình khu vực để chứng minh mức giá họ đưa ra đang bị thổi phồng 20%.",
        leverageChange: 25,
        patienceImpact: -8,
        icon: "📊"
      },
      {
        id: "r1_charm",
        title: "Thiết Lập Đồng Thuận Cảm Xúc",
        desc: "Khen ngợi uy tín và bày tỏ thiện chí hợp tác dài hạn, kéo đối tác về cùng một chiến tuyến.",
        leverageChange: 15,
        patienceImpact: 5, // tăng kiên nhẫn
        icon: "🤝"
      },
      {
        id: "r1_bluff",
        title: "Tạo Áp Lực Thời Gian (Gấp Rút)",
        desc: "Ám chỉ bạn đang có một lời chào mời khác hấp dẫn hơn ngay trong tuần này.",
        leverageChange: 30,
        patienceImpact: -18,
        icon: "⏳"
      }
    ]
  },
  {
    round: 2,
    scenario: "Vòng 2: Tranh Luận Chi Tiết - Đối tác đòi thêm các điều khoản bảo lãnh và thanh toán tiền mặt ngay.",
    cards: [
      {
        id: "r2_escrow",
        title: "Bảo Lãnh Thanh Toán Ngân Hàng",
        desc: "Đề xuất ký quỹ qua ngân hàng uy tín, giải ngân từng đợt theo tiến độ bàn giao minh bạch.",
        leverageChange: 20,
        patienceImpact: 8,
        icon: "🏦"
      },
      {
        id: "r2_concession",
        title: "Đánh Đổi Điều Khoản Phụ",
        desc: "Chấp nhận hỗ trợ phí sang tên để đổi lấy mức giảm trực tiếp vào giá gốc.",
        leverageChange: 22,
        patienceImpact: -5,
        icon: "📑"
      },
      {
        id: "r2_ultimatum",
        title: "Ra Đòn Ép Giá Quyết Liệt",
        desc: "Tuyên bố đây là giới hạn trần cuối cùng, nếu không đồng ý sẽ lập tức rời bàn đàm phán.",
        leverageChange: 35,
        patienceImpact: -25,
        icon: "⚡"
      }
    ]
  },
  {
    round: 3,
    scenario: "Vòng 3: Chốt Thỏa Thuận - Hai bên đứng trước ranh giới thành bại cuối cùng.",
    cards: [
      {
        id: "r3_handshake",
        title: "Ký Kết Thỏa Thuận Win-Win",
        desc: "Chốt điều khoản cân bằng lợi ích đôi bên, kèm cam kết ưu tiên hợp tác các thương vụ tương lai.",
        leverageChange: 25,
        patienceImpact: 15,
        icon: "🏆"
      },
      {
        id: "r3_squeeze",
        title: "Ép Chiết Khấu Thêm 5%",
        desc: "Tận dụng thế thượng phong để bóp nghẹt biên lợi nhuận của đối tác ở phút chót.",
        leverageChange: 35,
        patienceImpact: -22,
        icon: "💰"
      },
      {
        id: "r3_gift",
        title: "Mở Rộng Mạng Lưới Quan Hệ VIP",
        desc: "Tặng kèm gói tài trợ hoặc kết nối đối tác với các mối quan hệ cấp cao trong danh bạ của bạn.",
        leverageChange: 28,
        patienceImpact: 10,
        icon: "🌟"
      }
    ]
  }
];

export default function NegotiationMiniGame({
  nationality = "Việt Nam",
  currentCity = "Thành phố",
  targetLevel = 1,
  onComplete,
  onClose
}: NegotiationMiniGameProps) {
  const [stage, setStage] = useState<'briefing' | 'playing' | 'result'>('briefing');
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);

  const initialLeverage = targetLevel === 1 ? 35 : targetLevel === 2 ? 25 : 15;
  const initialPatience = targetLevel === 1 ? 80 : targetLevel === 2 ? 60 : 45;
  const patiencePenaltyMultiplier = targetLevel === 1 ? 1 : targetLevel === 2 ? 1.3 : 1.6;
  const targetWinLeverage = targetLevel === 1 ? 65 : targetLevel === 2 ? 75 : 85;
  const targetWinPatience = targetLevel === 1 ? 20 : targetLevel === 2 ? 25 : 30;

  const [myLeverage, setMyLeverage] = useState<number>(initialLeverage);
  const [partnerPatience, setPartnerPatience] = useState<number>(initialPatience);
  const [logHistory, setLogHistory] = useState<string[]>([]);
  const [finalStatus, setFinalStatus] = useState<'success' | 'fair' | 'fail'>('fair');
  const [rewardSummary, setRewardSummary] = useState<string>('');

  const currentRound = ROUNDS_DATA[currentRoundIndex];

  const handleSelectCard = (card: ArgumentCard) => {
    const rawPatienceChange = card.patienceImpact < 0 ? Math.round(card.patienceImpact * patiencePenaltyMultiplier) : card.patienceImpact;
    const nextLeverage = Math.max(0, Math.min(100, myLeverage + card.leverageChange));
    const nextPatience = Math.max(0, Math.min(100, partnerPatience + rawPatienceChange));

    setMyLeverage(nextLeverage);
    setPartnerPatience(nextPatience);

    const logEntry = `Vòng ${currentRoundIndex + 1}: Chọn "${card.title}" ➔ Uy thế: ${nextLeverage}%, Kiên nhẫn đối tác: ${nextPatience}%`;
    setLogHistory(prev => [...prev, logEntry]);

    // Check if partner walked away
    if (nextPatience <= 0) {
      finishGame('fail', nextLeverage, "Đối tác giận dữ đập bàn rời khỏi cuộc đàm phán vì bị ép giá quá mức!");
      return;
    }

    if (currentRoundIndex < ROUNDS_DATA.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
    } else {
      // Completed all 3 rounds
      if (nextLeverage >= targetWinLeverage && nextPatience >= targetWinPatience) {
        finishGame(
          'success',
          nextLeverage,
          `Đàm phán thắng lợi vang dội tại ${currentCity}! Đạt chứng chỉ Ngoại Giao Cấp ${targetLevel} với ${nextLeverage}% uy thế áp đảo!`
        );
      } else if (nextLeverage >= 50 && nextPatience >= 15) {
        finishGame(
          'fair',
          nextLeverage,
          `Thương lượng thành công ở mức giá chấp nhận được. Đôi bên duy trì được hòa khí và sự tôn trọng.`
        );
      } else {
        finishGame(
          'fail',
          nextLeverage,
          `Bị đối tác bắt thóp và dẫn dắt cuộc chơi. Bạn phải chấp nhận điều khoản bất lợi.`
        );
      }
    }
  };

  const finishGame = (status: 'success' | 'fair' | 'fail', score: number, summary: string) => {
    setFinalStatus(status);
    setRewardSummary(summary);
    setStage('result');
  };

  const handleClaim = () => {
    onComplete({
      status: finalStatus,
      score: myLeverage,
      summary: rewardSummary
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-amber-500/40 rounded-3xl p-5 md:p-8 shadow-2xl flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-slate-400 hover:text-white transition z-20 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0 inline-flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/3 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Briefing Stage */}
        {stage === 'briefing' && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-4 shadow-xl shadow-amber-500/20">
              🤝
            </div>
            <div className="text-xs font-sans tabular-nums normal-case tracking-wide text-amber-800 dark:text-amber-400 font-bold mb-1">
              Thử Thách Thương Trường • {currentCity}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Bàn Tròn Thương Lượng & Thao Túng Tâm Lý
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-lg mb-6 leading-relaxed">
              Bạn đang đối đầu với một đối tác kinh doanh lọc lõi trên thương trường {nationality}.
              Mục tiêu của bạn là <strong>gia tăng Uy Thế ({'>'}75%)</strong> để ép giá có lợi nhất, nhưng không được để <strong>Sự Kiên Nhẫn đối tác tụt về 0%</strong> kẻo họ sẽ lật bàn bỏ về!
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-6 text-left text-xs">
              <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                <div className="text-[12px] text-slate-400 normal-case font-bold">Thành Công Vang Dội</div>
                <div className="text-emerald-800 dark:text-emerald-400 font-bold mt-0.5">Uy Thế ≥ 75% & Hòa Khí {'>'} 30%</div>
                <div className="text-[12px] text-slate-400 mt-1">↳ Thưởng +$12.000 tiền mặt & Nhận cờ 'Bậc Thầy Đàm Phán'</div>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                <div className="text-[12px] text-slate-400 normal-case font-bold">Thất Bại Lật Bàn</div>
                <div className="text-rose-700 dark:text-rose-400 font-bold mt-0.5">Kiên Nhẫn Về 0% Hoặc Bị Ép</div>
                <div className="text-[12px] text-slate-400 mt-1">↳ Tăng +15 Burnout và mất cơ hội kinh doanh</div>
              </div>
            </div>

            <button
              onClick={() => setStage('playing')}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-xs normal-case tracking-normal transition shadow-lg shadow-amber-500/25 active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bước Vào Cuộc Đàm Phán</span>
            </button>
          </div>
        )}

        {/* 2. Playing Stage */}
        {stage === 'playing' && (
          <div className="flex flex-col gap-4">
            {/* Round & Context Banner */}
            <div className="flex items-center justify-between gap-2 pr-12 sm:pr-14 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 font-sans tabular-nums font-bold flex items-center justify-center text-xs border border-amber-500/40">
                  {currentRound.round}/3
                </span>
                <span className="text-sm font-bold text-white">Vòng {currentRound.round}: Đấu Trí Thương Mại</span>
              </div>
              <span className="text-[12px] font-sans tabular-nums text-slate-400">
                Địa điểm: <strong className="text-indigo-800 dark:text-indigo-300">{currentCity}</strong>
              </span>
            </div>

            {/* Tension Bars */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
              {/* My Leverage */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-indigo-800 dark:text-indigo-300 font-bold flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" /> Uy Thế Của Bạn
                  </span>
                  <span className="font-sans tabular-nums font-bold text-cyan-700 dark:text-cyan-400">{myLeverage}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[var(--bg-card)] overflow-hidden border border-cyan-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${myLeverage}%` }}
                  />
                </div>
              </div>

              {/* Partner Patience */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5" /> Kiên Nhẫn Đối Tác
                  </span>
                  <span className={`font-sans tabular-nums font-bold ${partnerPatience < 25 ? 'text-rose-700 dark:text-rose-400 animate-pulse' : 'text-amber-800 dark:text-amber-400'}`}>
                    {partnerPatience}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[var(--bg-card)] overflow-hidden border border-amber-500/30">
                  <div
                    className={`h-full transition-all duration-500 ${
                      partnerPatience < 25 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                    }`}
                    style={{ width: `${partnerPatience}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Scenario Prompt */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200">
              {currentRound.scenario}
            </div>

            {/* Argument Cards */}
            <div className="grid grid-cols-1 gap-2.5">
              {currentRound.cards.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-500/50 transition-all duration-200 text-left flex items-start gap-3 active:scale-[0.99] group shadow-sm"
                >
                  <span className="text-2xl shrink-0 p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] group-hover:border-amber-500/40">
                    {card.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-amber-300 transition">
                        {card.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[12px] font-sans tabular-nums">
                        <span className="text-indigo-800 dark:text-indigo-300">+{card.leverageChange}% Uy thế</span>
                        <span className={card.patienceImpact >= 0 ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                          {card.patienceImpact >= 0 ? `+${card.patienceImpact}%` : `${card.patienceImpact}%`} Kiên nhẫn
                        </span>
                      </div>
                    </div>
                    <p className="text-[12px] text-slate-400 leading-snug">
                      {card.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Result Stage */}
        {stage === 'result' && (
          <div className="flex flex-col items-center text-center py-4">
            <div className={`w-16 h-16 rounded-3xl border flex items-center justify-center text-3xl mb-4 shadow-xl ${
              finalStatus === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/40 shadow-emerald-500/20'
                : finalStatus === 'fair'
                ? 'bg-amber-500/20 border-amber-500/40 shadow-amber-500/20'
                : 'bg-rose-500/20 border-rose-500/40 shadow-rose-500/20'
            }`}>
              {finalStatus === 'success' ? '👑' : finalStatus === 'fair' ? '🤝' : '💥'}
            </div>

            <div className="text-xs font-sans tabular-nums normal-case tracking-wide font-bold mb-1">
              {finalStatus === 'success' ? (
                <span className="text-emerald-800 dark:text-emerald-400">Đại Thắng Thương Trường</span>
              ) : finalStatus === 'fair' ? (
                <span className="text-amber-800 dark:text-amber-400">Thương Lượng Thành Công</span>
              ) : (
                <span className="text-rose-700 dark:text-rose-400">Thương Lượng Đổ Bể</span>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">
              Kết Quả Cuộc Đàm Phán Tại {currentCity}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
              {rewardSummary}
            </p>

            <div className="w-full max-w-md p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-left text-xs space-y-1.5 mb-6">
              <div className="text-[12px] normal-case font-bold text-slate-400 tracking-normal mb-1">Nhật Ký Đấu Trí:</div>
              {logHistory.map((item, idx) => (
                <div key={idx} className="text-slate-300 text-[12px] font-sans tabular-nums">
                  • {item}
                </div>
              ))}
            </div>

            <button
              onClick={handleClaim}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs normal-case tracking-normal transition shadow-lg shadow-amber-500/25 active:scale-95 flex items-center gap-2"
            >
              <span>Tiếp Nhận Kết Quả Cuộc Đời</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

