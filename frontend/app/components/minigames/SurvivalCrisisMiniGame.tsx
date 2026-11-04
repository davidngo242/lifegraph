'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Flame,
  Heart,
  Navigation,
  Compass,
  AlertOctagon,
  Sparkles,
  X,
  Play,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface SurvivalCrisisMiniGameProps {
  nationality?: string;
  currentCity?: string;
  onComplete: (result: {
    status: 'success' | 'fair' | 'fail';
    score: number;
    summary: string;
  }) => void;
  onClose: () => void;
}

interface Checkpoint {
  id: string;
  name: string;
  desc: string;
  icon: string;
  dangerLevel: string;
  actionPrompt: string;
  isCleared: boolean;
}

export default function SurvivalCrisisMiniGame({
  nationality = "Syria",
  currentCity = "Damascus",
  onComplete,
  onClose
}: SurvivalCrisisMiniGameProps) {
  const [stage, setStage] = useState<'briefing' | 'playing' | 'result'>('briefing');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [vitalityLeft, setVitalityLeft] = useState<number>(100);
  const [rescuedFamily, setRescuedFamily] = useState<boolean>(false);
  const [logEvents, setLogEvents] = useState<string[]>([]);
  const [finalStatus, setFinalStatus] = useState<'success' | 'fair' | 'fail'>('fair');
  const [resultSummary, setResultSummary] = useState<string>('');

  const checkpoints: Checkpoint[] = [
    {
      id: "cp1",
      name: "Trạm 1: Ngã Tư Đổ Nát & Tắc Nghẽn",
      desc: `Khu vực trung tâm ${currentCity} bị phong tỏa do biến cố bất ngờ. Cần chọn lộ trình vượt qua an toàn.`,
      icon: "🚧",
      dangerLevel: "Cao",
      actionPrompt: "Vòng Qua Đường Hẻm Cũ",
      isCleared: currentStep > 0
    },
    {
      id: "cp2",
      name: "Trạm 2: Trạm Cứu Trợ & Nhu Yếu Phẩm",
      desc: "Gom túi thuốc men dự phòng và nước sạch thiết yếu cho gia đình trước khi kho hàng đóng cửa.",
      icon: "📦",
      dangerLevel: "Trung Bình",
      actionPrompt: "Gom Túi Y Tế & Nước Sạch",
      isCleared: currentStep > 1
    },
    {
      id: "cp3",
      name: "Trạm 3: Mái Ấm & Người Thân Kẹt Lại",
      desc: "Người thân trong gia đình đang hoảng loạn kẹt ở tầng trên. Bạn có quyết định lao vào giải cứu không?",
      icon: "👨‍👩‍👦",
      dangerLevel: "Cực Nguy Hiểm",
      actionPrompt: "Lao Vào Đưa Người Thân Ra",
      isCleared: currentStep > 2
    },
    {
      id: "cp4",
      name: "Trạm 4: Cổng Sơ Tán An Toàn",
      desc: "Đoàn xe cứu trợ nhân đạo quốc tế chuẩn bị rời đi. Cần vượt qua rào chắn cuối cùng để lên xe.",
      icon: "🛡️",
      dangerLevel: "Cột Mốc Về Đích",
      actionPrompt: "Về Đích Vùng An Toàn",
      isCleared: currentStep > 3
    }
  ];

  // Timer loop in playing stage
  useEffect(() => {
    if (stage !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, currentStep]);

  const handleTimeOut = () => {
    if (currentStep >= 3) {
      finishGame('fair', 60, `Kịp tới vùng an toàn ở những giây cuối cùng nhưng bị kiệt sức!`);
    } else {
      finishGame('fail', 20, `Hết thời gian! Bạn bị mắc kẹt lại giữa tâm chấn biến cố tại ${currentCity}.`);
    }
  };

  const handleAction = (choice: 'careful' | 'rush') => {
    if (currentStep >= checkpoints.length) return;

    let damage = 0;
    let eventText = "";

    if (choice === 'careful') {
      damage = Math.floor(Math.random() * 8) + 5;
      eventText = `Trạm ${currentStep + 1}: Di chuyển thận trọng, né tránh mảnh vỡ an toàn (-${damage} Sinh lực).`;
    } else {
      damage = Math.floor(Math.random() * 20) + 10;
      eventText = `Trạm ${currentStep + 1}: Bứt tốc liều lĩnh qua rào chắn (-${damage} Sinh lực).`;
    }

    const nextVitality = Math.max(0, vitalityLeft - damage);
    setVitalityLeft(nextVitality);
    setLogEvents(prev => [...prev, eventText]);

    if (currentStep === 2) {
      setRescuedFamily(true);
    }

    if (currentStep + 1 >= checkpoints.length) {
      // Completed all
      if (nextVitality >= 50 && timeLeft >= 3) {
        finishGame(
          'success',
          nextVitality,
          `Xuất sắc vượt qua biến cố sinh tồn tại ${currentCity}! Bạn đã bảo vệ trọn vẹn gia đình và gom đủ nhu yếu phẩm.`
        );
      } else {
        finishGame(
          'fair',
          nextVitality,
          `Thoát nạn thành công dù cơ thể chằng chịt vết thương. Cả gia đình đã đến được vùng an toàn.`
        );
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const finishGame = (status: 'success' | 'fair' | 'fail', score: number, summary: string) => {
    setFinalStatus(status);
    setResultSummary(summary);
    setStage('result');
  };

  const handleClaim = () => {
    onComplete({
      status: finalStatus,
      score: vitalityLeft,
      summary: resultSummary
    });
  };

  const activeCheckpoint = checkpoints[Math.min(currentStep, checkpoints.length - 1)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-rose-500/40 rounded-3xl p-5 md:p-8 shadow-2xl flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Red Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-32 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Briefing */}
        {stage === 'briefing' && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl mb-4 shadow-xl shadow-rose-500/20">
              🚨
            </div>
            <div className="text-xs font-sans tabular-nums normal-case tracking-wide text-rose-400 font-bold mb-1">
              Báo Động Sinh Tồn Thực Địa • {currentCity} ({nationality})
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Sơ Tán Khẩn Cấp & Bảo Vệ Người Thân
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-lg mb-6 leading-relaxed">
              Một biến cố thảm họa / xung đột đột ngột ập đến nơi bạn đang sinh sống.
              Bạn chỉ có đúng <strong>15 giây</strong> để đưa ra các quyết định sinh tử qua 4 trạm hiểm nguy, giải cứu người thân và đưa cả nhà lên xe cứu trợ.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-6 text-left text-xs">
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="text-[12px] text-slate-400 normal-case font-bold">Thoát Nạn An Toàn</div>
                <div className="text-emerald-400 font-bold mt-0.5">Vượt 4 Trạm & Thể Lực ≥ 50%</div>
                <div className="text-[12px] text-slate-400 mt-1">↳ +25 Karma, +20 Sinh Lực, cờ 'Chuyên Gia Sinh Tồn'</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="text-[12px] text-slate-400 normal-case font-bold">Mắc Kẹt Nguy Hiểm</div>
                <div className="text-rose-400 font-bold mt-0.5">Hết Giờ Hoặc Thể Lực Tụt 0%</div>
                <div className="text-[12px] text-slate-400 mt-1">↳ -15 Sinh lực, mất mát tài sản tích trữ</div>
              </div>
            </div>

            <button
              onClick={() => setStage('playing')}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs normal-case tracking-normal transition shadow-lg shadow-rose-600/30 active:scale-95 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Chiến Dịch Sơ Tán (15s)</span>
            </button>
          </div>
        )}

        {/* 2. Playing */}
        {stage === 'playing' && (
          <div className="flex flex-col gap-4">
            {/* Top Status Bar: Timer & Vitality */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-sans tabular-nums font-bold text-rose-400">
                  <Heart className="w-4 h-4 text-rose-500 fill-current animate-pulse" />
                  <span>Thể Lực: {vitalityLeft}%</span>
                </div>
                <span className="text-slate-600">|</span>
                <span className="text-[12px] text-slate-400">
                  📍 {currentCity}
                </span>
              </div>

              {/* Big Countdown Badge */}
              <div className={`px-3 py-1 rounded-xl font-sans tabular-nums font-black text-xs border flex items-center gap-1.5 ${
                timeLeft <= 5
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-bounce'
                  : 'bg-slate-900 text-amber-300 border-slate-700'
              }`}>
                <span>⏱️ Còn:</span>
                <span className="text-sm">{timeLeft}s</span>
              </div>
            </div>

            {/* 4-Step Route Progress */}
            <div className="grid grid-cols-4 gap-2">
              {checkpoints.map((cp, idx) => (
                <div
                  key={cp.id}
                  className={`p-2 rounded-xl text-center border text-[12px] transition ${
                    idx === currentStep
                      ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold shadow-md shadow-rose-950'
                      : idx < currentStep
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="text-base mb-0.5">{cp.icon}</div>
                  <div className="truncate">Trạm {idx + 1}</div>
                </div>
              ))}
            </div>

            {/* Active Checkpoint Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
              <div className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                {activeCheckpoint.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white">{activeCheckpoint.name}</h3>
                  <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Mức độ: {activeCheckpoint.dangerLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeCheckpoint.desc}
                </p>
              </div>
            </div>

            {/* Decision Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleAction('careful')}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-left transition active:scale-95 flex flex-col gap-1"
              >
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Di Chuyển Thận Trọng</span>
                </div>
                <div className="text-[12px] text-slate-400">
                  Ít mất máu (-5~8 HP), an toàn cho người thân nhưng tốn thời gian.
                </div>
              </button>

              <button
                onClick={() => handleAction('rush')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-left transition active:scale-95 flex flex-col gap-1 text-white shadow-lg shadow-rose-950/50"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>Bứt Tốc Vượt Rào</span>
                </div>
                <div className="text-[12px] text-rose-200">
                  Tiến thẳng trạm kế ngay lập tức nhưng rủi ro va quẹt (-10~20 HP).
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 3. Result */}
        {stage === 'result' && (
          <div className="flex flex-col items-center text-center py-4">
            <div className={`w-16 h-16 rounded-3xl border flex items-center justify-center text-3xl mb-4 shadow-xl ${
              finalStatus === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/40 shadow-emerald-500/20'
                : finalStatus === 'fair'
                ? 'bg-amber-500/20 border-amber-500/40 shadow-amber-500/20'
                : 'bg-rose-500/20 border-rose-500/40 shadow-rose-500/20'
            }`}>
              {finalStatus === 'success' ? '🛡️' : finalStatus === 'fair' ? '🏃' : '💥'}
            </div>

            <div className="text-xs font-sans tabular-nums normal-case tracking-wide font-bold mb-1">
              {finalStatus === 'success' ? (
                <span className="text-emerald-400">Sinh Tồn Oanh Liệt</span>
              ) : finalStatus === 'fair' ? (
                <span className="text-amber-400">Vượt Qua Thử Thách</span>
              ) : (
                <span className="text-rose-400">Mắc Kẹt Nguy Hiểm</span>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">
              Kết Quả Chiến Dịch Sơ Tán
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
              {resultSummary}
            </p>

            <div className="w-full max-w-md p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-1.5 mb-6">
              <div className="text-[12px] normal-case font-bold text-slate-400 tracking-normal mb-1">Nhật Ký Đường Chạy:</div>
              {logEvents.map((item, idx) => (
                <div key={idx} className="text-slate-300 text-[12px] font-sans tabular-nums">
                  • {item}
                </div>
              ))}
            </div>

            <button
              onClick={handleClaim}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs normal-case tracking-normal transition shadow-lg shadow-rose-600/30 active:scale-95 flex items-center gap-2"
            >
              <span>Ghi Nhận Bản Lĩnh Sống</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

