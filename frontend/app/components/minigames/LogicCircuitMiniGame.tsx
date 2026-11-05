'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Sparkles, CheckCircle2, AlertCircle, X, Play, ArrowRight, ShieldAlert } from 'lucide-react';

interface LogicCircuitMiniGameProps {
  targetLevel?: number;
  onComplete: (result: {
    status: 'success' | 'fair' | 'fail';
    score: number;
    summary: string;
  }) => void;
  onClose: () => void;
}

export default function LogicCircuitMiniGame({
  targetLevel = 1,
  onComplete,
  onClose
}: LogicCircuitMiniGameProps) {
  const [stage, setStage] = useState<'briefing' | 'playing' | 'result'>('briefing');

  // Config by level
  const totalSwitches = targetLevel === 1 ? 4 : targetLevel === 2 ? 6 : 8;
  const initialTime = targetLevel === 1 ? 15 : targetLevel === 2 ? 12 : 9;

  const getTargetConfig = () => {
    if (targetLevel === 1) return [true, false, true, true];
    if (targetLevel === 2) return [true, true, false, true, false, true];
    return [true, false, true, true, false, true, true, false];
  };

  const getInitialSwitches = () => {
    if (targetLevel === 1) return [false, true, false, false];
    if (targetLevel === 2) return [false, false, true, false, true, false];
    return [false, true, false, false, true, false, false, true];
  };

  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [switches, setSwitches] = useState<boolean[]>(getInitialSwitches());
  const [targetConfig] = useState<boolean[]>(getTargetConfig());
  const [status, setStatus] = useState<'success' | 'fair' | 'fail'>('fair');
  const [isPowered, setIsPowered] = useState<boolean>(false);

  const gateNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, totalSwitches);

  // Check circuit connection
  useEffect(() => {
    if (stage !== 'playing') return;

    const matches = switches.every((val, idx) => val === targetConfig[idx]);
    if (matches) {
      setIsPowered(true);
      setTimeout(() => {
        setStatus('success');
        setStage('result');
      }, 500);
    }
  }, [switches, stage, targetConfig]);

  // Countdown timer in playing stage
  useEffect(() => {
    if (stage !== 'playing' || isPowered) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          let correct = 0;
          switches.forEach((val, idx) => {
            if (val === targetConfig[idx]) correct++;
          });
          const passingCount = Math.ceil(totalSwitches * 0.75);
          const finalStatus = correct >= passingCount ? 'fair' : 'fail';
          setStatus(finalStatus);
          setStage('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, isPowered, switches, targetConfig, totalSwitches]);

  const toggleSwitch = (index: number) => {
    if (stage !== 'playing' || isPowered) return;
    setSwitches(prev => {
      const next = [...prev];
      next[index] = !next[index];

      // Level 2 special mechanic: Linked Inverter (Switch C flips Switch D)
      if (targetLevel >= 2 && index === 2 && next.length > 3) {
        next[3] = !next[3];
      }

      // Level 3 special mechanic: Linked Inverter (Switch E flips Switch F)
      if (targetLevel >= 3 && index === 4 && next.length > 5) {
        next[5] = !next[5];
      }

      return next;
    });
  };

  const handleReturnToLife = () => {
    const levelTitle = targetLevel === 1 ? 'Kỹ Sư Tập Sự' : targetLevel === 2 ? 'Chuyên Gia Thuật Toán' : 'Đại Sư Công Nghệ';
    const summary =
      status === 'success'
        ? `Khối vi mạch robot phát sáng rực rỡ! Vượt qua kỳ sát hạch [${levelTitle}] thành công (+100 Điểm Sát Hạch)!`
        : status === 'fair'
        ? `Mạch điện chập chờn nhưng đã hoàn thành phần lớn kết nối logic (+70 Điểm).`
        : `Đoản mạch do đấu nhầm dây. Thi trượt sát hạch [${levelTitle}] (-5 Sinh lực, +10 Burnout).`;

    onComplete({
      status,
      score: status === 'success' ? 100 : status === 'fair' ? 70 : 30,
      summary
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-950 border border-sky-500/40 rounded-3xl p-5 md:p-7 shadow-2xl flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-24 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* PHASE 1: BRIEFING SCREEN */}
        {stage === 'briefing' && (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-sky-500/20">
              🤖
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-sans tabular-nums px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                Kỳ Thi Sát Hạch Cấp {targetLevel}: {targetLevel === 1 ? 'Kỹ Sư Tập Sự' : targetLevel === 2 ? 'Chuyên Gia Thuật Toán' : 'Đại Sư Công Nghệ'}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Đấu Nối Bảng Mạch Logic & AI Robot</h3>
            <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
              {targetLevel === 1
                ? 'Điều khiển 4 cổng công tắc logic để dẫn nguồn năng lượng thắp sáng bóng đèn vi mạch trong 15 giây.'
                : targetLevel === 2
                ? 'Độ khó Tinh Anh: 6 cổng logic và có cổng nghịch đảo đảo chiều (Cổng C liên kết đổi trạng thái Cổng D). Thời gian rút ngắn còn 12 giây!'
                : 'Độ khó Đại Sư: 8 cổng logic phức hợp với 2 cụm cổng liên kết đảo pha. Thời gian siêu tốc 9 giây, đòi hỏi tư duy giải thuật xuất sắc!'}
            </p>

            {/* How to play card */}
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 text-left space-y-2 text-xs">
              <div className="font-bold text-sky-400 flex items-center gap-1.5 normal-case text-[12px] tracking-normal">
                <Sparkles className="w-4 h-4" /> Yêu Cầu & Thử Thách Cấp {targetLevel}:
              </div>
              <p className="text-slate-300 text-[12px]">
                Nhấp vào từng cổng ({gateNames.join(', ')}) để đảo trạng thái (Bật/Tắt). Khi toàn bộ khớp với sơ đồ chuẩn, bóng đèn trung tâm sẽ lập tức phát sáng!
              </p>
              {targetLevel >= 2 && (
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[12px] text-amber-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Cảnh báo cơ chế nâng cao: Có cổng logic nghịch đảo liên kết, bật một cổng có thể ảnh hưởng đến cổng kế bên!</span>
                </div>
              )}
            </div>

            {/* Ready Button */}
            <button
              onClick={() => {
                setTimeLeft(initialTime);
                setSwitches(getInitialSwitches());
                setIsPowered(false);
                setStage('playing');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-sky-500/25 active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Đấu Mạch ({initialTime} Giây)</span>
            </button>
          </div>
        )}

        {/* PHASE 2: ACTIVE GAMEPLAY */}
        {stage === 'playing' && (
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 font-medium border border-sky-500/20 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Bảng Mạch Cấp {targetLevel} ({totalSwitches} Cổng)
              </span>
              <div className="flex items-center gap-2 font-sans tabular-nums">
                <span className="text-slate-400">Thời gian:</span>
                <span className={`px-2.5 py-0.5 rounded font-bold ${
                  timeLeft <= 4 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Circuit Visualization Arena */}
            <div className="relative h-40 w-full bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 mb-3 overflow-hidden select-none">
              <div className="flex flex-col items-center z-10 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 ${
                  isPowered
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_35px_#f59e0b] scale-110'
                    : 'bg-slate-950 text-slate-600 border border-slate-800'
                }`}>
                  {isPowered ? '💡' : '🔌'}
                </div>
                <span className={`text-[12px] font-sans tabular-nums font-bold mt-2 ${isPowered ? 'text-amber-300 animate-bounce' : 'text-slate-500'}`}>
                  {isPowered ? "MẠCH ĐÃ THÔNG NGUỒN!" : "ĐANG CHỜ TÍN HIỆU ĐÚNG..."}
                </span>
              </div>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px]" />
            </div>

            {/* Guide hint */}
            <div className="text-[12px] text-slate-400 mb-2.5 text-center">
              Mục tiêu logic: {gateNames.map((name, idx) => (
                <span key={name} className="font-sans tabular-nums text-sky-300 mr-1.5">
                  [{name}: {targetConfig[idx] ? 'Bật' : 'Tắt'}]
                </span>
              ))}
            </div>

            {/* Interactive Logic Toggle Switches Grid */}
            <div className={`grid gap-2 mb-2 ${totalSwitches === 4 ? 'grid-cols-4' : totalSwitches === 6 ? 'grid-cols-6' : 'grid-cols-4 sm:grid-cols-8'}`}>
              {gateNames.map((name, idx) => {
                const isOn = switches[idx];
                const isTarget = targetConfig[idx];
                const isMatching = isOn === isTarget;

                return (
                  <button
                    key={name}
                    onClick={() => toggleSwitch(idx)}
                    className={`h-16 md:h-20 rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                      isOn
                        ? 'bg-sky-950/80 border-sky-400 shadow-md shadow-sky-950/40 text-sky-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[12px] font-sans tabular-nums font-bold">Cổng {name}</span>
                    <Zap className={`w-4 h-4 ${isOn ? 'text-sky-400 animate-pulse' : 'text-slate-600'}`} />
                    <span className={`text-[12px] font-sans tabular-nums font-bold ${isMatching ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isOn ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PHASE 3: RESULT SCREEN */}
        {stage === 'result' && (
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-lg ${
                status === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/20'
                  : status === 'fair'
                  ? 'bg-sky-500/20 border border-sky-500/40 text-sky-400 shadow-sky-500/20'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-rose-500/20'
              }`}
            >
              {status === 'success' ? '💡' : status === 'fair' ? '🔌' : '💥'}
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {status === 'success'
                ? `Xuất Sắc Thi Đỗ Cấp ${targetLevel}!`
                : status === 'fair'
                ? "Kết Nối Gần Đạt Chuẩn"
                : "Đoản Mạch Thất Bại"}
            </h3>

            <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
              {status === 'success'
                ? `Bạn đã hoàn thành đấu nối toàn bộ ${totalSwitches} cổng logic chuẩn xác trước thời hạn! Bằng cấp chuyên môn chính thức được phê duyệt.`
                : status === 'fair'
                ? "Mạch điện vận hành tạm ổn nhưng chưa đạt sự đồng bộ tuyệt đối để thắp sáng toàn phần."
                : "Thời gian cạn kiệt trước khi khớp mạch. Bạn cần tiếp tục ôn luyện và thi lại lần sau."}
            </p>

            <button
              onClick={handleReturnToLife}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-sky-500/25 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Xác Nhận & Tiếp Tục Cuộc Đời</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

