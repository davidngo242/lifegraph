'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Scale, ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle, Sparkles, X, Play } from 'lucide-react';

interface LifeTightropeMiniGameProps {
  targetLevel?: number;
  onComplete: (result: {
    status: 'success' | 'fair' | 'fail';
    score: number;
    summary: string;
  }) => void;
  onClose: () => void;
}

export default function LifeTightropeMiniGame({
  targetLevel = 1,
  onComplete,
  onClose
}: LifeTightropeMiniGameProps) {
  const [stage, setStage] = useState<'briefing' | 'playing' | 'result'>('briefing');
  const [timeLeft, setTimeLeft] = useState(15);
  const [angle, setAngle] = useState(0); // -42 (Left/Family) to +42 (Right/Career)
  const [angularVelocity, setAngularVelocity] = useState(0);
  const [windForce, setWindForce] = useState(0);
  const [currentEvent, setCurrentEvent] = useState<string>("Bắt đầu cân bằng cuộc sống...");
  const [status, setStatus] = useState<'success' | 'fair' | 'fail'>('fair');

  const damping = targetLevel === 1 ? 0.94 : targetLevel === 2 ? 0.91 : 0.88;
  const windMultiplier = targetLevel === 1 ? 1.0 : targetLevel === 2 ? 1.4 : 1.8;
  const eventIntervalMs = targetLevel === 1 ? 2400 : targetLevel === 2 ? 1800 : 1200;

  const angleRef = useRef(0);
  const velRef = useRef(0);
  const gameOverRef = useRef(false);

  useEffect(() => {
    angleRef.current = angle;
    velRef.current = angularVelocity;
  }, [angle, angularVelocity]);

  // Main Physics and Event Loop
  useEffect(() => {
    if (stage !== 'playing') return;

    // Wind gust / event generator
    const eventInterval = setInterval(() => {
      const events = [
        { text: "Con ốm sốt giữa đêm! Gia đình nghiêng nặng!", force: -3.6 * windMultiplier },
        { text: "Khách hàng VIP đòi họp khẩn cấp vào cuối tuần!", force: 3.8 * windMultiplier },
        { text: "Gia đình sum họp ăn tối đầm ấm.", force: -2.2 * windMultiplier },
        { text: "Dự án đến hạn deadline chạy nước rút!", force: 3.5 * windMultiplier },
        { text: "Bình yên tạm thời, giữ vững trọng tâm.", force: 0 },
        { text: "Cha mẹ già nhập viện thăm khám!", force: -3.2 * windMultiplier },
        { text: "Cơ hội thăng tiến đòi hỏi cày thêm giờ!", force: 3.9 * windMultiplier }
      ];
      const picked = events[Math.floor(Math.random() * events.length)];
      setCurrentEvent(picked.text);
      setWindForce(picked.force);
    }, eventIntervalMs);

    // 60FPS Physics Tick
    const physicsInterval = setInterval(() => {
      if (gameOverRef.current) return;

      // Gravity instability + wind force
      let newVel = velRef.current + (angleRef.current * 0.035) + windForce * 0.12;
      newVel *= damping; // Dynamic Damping
      let newAngle = angleRef.current + newVel;

      // Boundary check
      if (Math.abs(newAngle) > 42) {
        gameOverRef.current = true;
        setStatus('fail');
        setStage('result');
        return;
      }

      angleRef.current = newAngle;
      velRef.current = newVel;
      setAngle(newAngle);
      setAngularVelocity(newVel);
    }, 33);

    // 1-second Countdown
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          gameOverRef.current = true;
          const finalAngle = Math.abs(angleRef.current);
          if (finalAngle <= 14) {
            setStatus('success');
          } else if (finalAngle <= 28) {
            setStatus('fair');
          } else {
            setStatus('fail');
          }
          setStage('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(eventInterval);
      clearInterval(physicsInterval);
      clearInterval(timerInterval);
    };
  }, [stage, windForce]);

  // Keyboard controls listener
  useEffect(() => {
    if (stage !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        nudge(-3.2);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        nudge(3.2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage]);

  const nudge = (force: number) => {
    if (stage !== 'playing') return;
    const newVel = velRef.current + force;
    velRef.current = newVel;
    setAngularVelocity(newVel);
  };

  const handleReturnToLife = () => {
    const summary =
      status === 'success'
        ? "Làm chủ trọn vẹn bánh xe cuộc đời! Thanh lọc -40 Burnout, +10 Karma và nhận cờ 'Bậc Thầy Cân Bằng'."
        : status === 'fair'
        ? "Vượt qua chòng chành giữa hai ngả đường đời. Giữ được hòa khí gia đạo (-20 Burnout)."
        : "Áp lực công việc đè nát sự bình yên mái ấm (+25 Burnout, -5 Sinh Lực).";

    onComplete({
      status,
      score: Math.max(0, Math.round(100 - Math.abs(angle) * 2.2)),
      summary
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[var(--bg-card-subtle)] border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[var(--bg-card-subtle)] text-slate-400 hover:text-white hover:bg-slate-700 transition z-20 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0 inline-flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/3 w-80 h-28 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ================================================================ */}
        {/* PHASE 1: BRIEFING & TUTORIAL SCREEN */}
        {/* ================================================================ */}
        {stage === 'briefing' && (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-amber-500/20">
              ⚖️
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-sans tabular-nums px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                Cân Bằng Trung Niên (29–48 Tuổi)
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Thăng Bằng Cuộc Đời</h3>
            <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
              Bạn đang ở độ tuổi chín muồi của sự nghiệp nhưng cũng là lúc gia đình cần bạn nhất. Hãy giữ vững trọng tâm đòn gánh giữa Giông Bão Công Việc và Mái Ấm Gia Đình!
            </p>

            {/* How to play card */}
            <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 mb-4 text-left space-y-2.5 text-xs">
              <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 normal-case text-[12px] tracking-normal">
                <Sparkles className="w-4 h-4" /> Hướng Dẫn & Thao Tác:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                  <div className="font-semibold text-pink-800 dark:text-pink-300 flex items-center gap-1.5 mb-1">
                    <ArrowLeft className="w-3.5 h-3.5 text-pink-700 dark:text-pink-400" /> Nghiêng Về Gia Đình:
                  </div>
                  <span className="text-[12px] text-slate-400">
                    Bấm nút hoặc phím <strong className="text-pink-800 dark:text-pink-300 font-sans tabular-nums">[⬅️ Mũi Tên Trái]</strong> hoặc <strong className="text-pink-800 dark:text-pink-300 font-sans tabular-nums">[A]</strong> để dồn tâm sức cho mái ấm.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                  <div className="font-semibold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5 mb-1">
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" /> Nghiêng Về Sự Nghiệp:
                  </div>
                  <span className="text-[12px] text-slate-400">
                    Bấm nút hoặc phím <strong className="text-cyan-800 dark:text-cyan-300 font-sans tabular-nums">[➡️ Mũi Tên Phải]</strong> hoặc <strong className="text-cyan-800 dark:text-cyan-300 font-sans tabular-nums">[D]</strong> để cày cuốc thăng tiến.
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[12px] text-slate-400">
                💡 <strong>Mẹo:</strong> Đòn bập bênh sẽ rung lắc ngẫu nhiên khi có biến cố gia đình hoặc hạn deadline. Đừng nghiêng quá 42° kẻo ngã!
              </div>
            </div>

            {/* Stakes card */}
            <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3 mb-5 text-xs text-left grid grid-cols-2 gap-3">
              <div>
                <span className="text-emerald-800 dark:text-emerald-400 font-bold block mb-0.5">🌟 Cân Bằng Đỉnh Cao:</span>
                <span className="text-[12px] text-slate-400">Thanh lọc -40 Burnout, +10 Karma, Cờ &quot;Bậc Thầy Cân Bằng&quot;.</span>
              </div>
              <div>
                <span className="text-rose-700 dark:text-rose-400 font-bold block mb-0.5">⚠️ Rơi Khỏi Dây:</span>
                <span className="text-[12px] text-slate-400">Khủng hoảng trung niên: +25 Burnout, -5 Sinh lực.</span>
              </div>
            </div>

            {/* Ready Button */}
            <button
              onClick={() => {
                setTimeLeft(15);
                setAngle(0);
                setAngularVelocity(0);
                setWindForce(0);
                gameOverRef.current = false;
                setStage('playing');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Giữ Thăng Bằng (15 Giây)</span>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 2: ACTIVE GAMEPLAY */}
        {/* ================================================================ */}
        {stage === 'playing' && (
          <div className="w-full flex flex-col items-center">
            {/* Header */}
            <div className="w-full flex items-center justify-between gap-2 pr-12 sm:pr-14 pb-3 border-b border-[var(--border-subtle)] mb-3 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 font-medium border border-amber-500/20">
                ⚖️ Thăng Bằng Cuộc Sống
              </span>
              <div className="flex items-center gap-2 font-sans tabular-nums">
                <span className="text-slate-400">Thời gian:</span>
                <span className={`px-2.5 py-0.5 rounded font-bold ${
                  timeLeft <= 4 ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 animate-pulse' : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                }`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Life Event Announcement */}
            <div className="w-full p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center mb-4 min-h-[44px] flex items-center justify-center">
              <span className="text-xs text-amber-800 dark:text-amber-300 font-medium animate-fadeIn">
                📢 {currentEvent}
              </span>
            </div>

            {/* Tightrope Seesaw Arena */}
            <div className="relative w-full h-56 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden mb-4 select-none">
              {/* Center Pivot Triangle */}
              <div className="absolute bottom-12 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[36px] border-b-amber-500 shadow-lg shadow-amber-500/30" />

              {/* Seesaw Beam */}
              <div
                className="absolute bottom-20 w-80 h-3.5 bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-500 rounded-full shadow-lg transition-transform duration-75 origin-center flex items-center justify-between px-2"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                {/* Left Weight: Family */}
                <div className="relative -top-8 flex flex-col items-center">
                  <span className="text-2xl filter drop-shadow">🏡</span>
                  <span className="text-[12px] font-bold text-pink-800 dark:text-pink-300 bg-[var(--bg-card-subtle)] px-1.5 py-0.5 rounded border border-pink-500/40 whitespace-nowrap">
                    Gia Đình
                  </span>
                </div>

                {/* Center Walker Avatar */}
                <div className="relative -top-10 flex flex-col items-center">
                  <span className="text-3xl filter drop-shadow animate-bounce">🚶‍♂️</span>
                  <span className="w-8 h-1 bg-amber-400 rounded-full" />
                </div>

                {/* Right Weight: Career */}
                <div className="relative -top-8 flex flex-col items-center">
                  <span className="text-2xl filter drop-shadow">💼</span>
                  <span className="text-[12px] font-bold text-cyan-800 dark:text-cyan-300 bg-[var(--bg-card-subtle)] px-1.5 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap">
                    Sự Nghiệp
                  </span>
                </div>
              </div>

              {/* Tilt Angle Readout */}
              <div className="absolute top-2 left-3 text-[12px] font-sans tabular-nums text-slate-400">
                Độ nghiêng: <strong className={Math.abs(angle) > 28 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-800 dark:text-emerald-400'}>
                  {Math.round(angle)}°
                </strong> (Giới hạn: ±42°)
              </div>
            </div>

            {/* Interactive Control Buttons */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button
                onClick={() => nudge(-3.6)}
                className="py-3 px-4 rounded-xl bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/40 text-pink-800 dark:text-pink-200 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-pink-950/40"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Nghiêng Gia Đình</span>
                <span className="hidden sm:inline text-[12px] font-sans tabular-nums text-pink-800 dark:text-pink-300 bg-pink-500/15 dark:bg-pink-950 px-1.5 py-0.5 rounded">[⬅️/A]</span>
              </button>

              <button
                onClick={() => nudge(3.6)}
                className="py-3 px-4 rounded-xl bg-cyan-500/15 dark:bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-800 dark:text-cyan-200 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-cyan-950/40"
              >
                <span>Nghiêng Sự Nghiệp</span>
                <ArrowRight className="w-4 h-4" />
                <span className="hidden sm:inline text-[12px] font-sans tabular-nums text-cyan-800 dark:text-cyan-300 bg-cyan-500/15 dark:bg-cyan-950 px-1.5 py-0.5 rounded">[➡️/D]</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 3: RESULT SCREEN */}
        {/* ================================================================ */}
        {stage === 'result' && (
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-lg ${
                status === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-400 shadow-emerald-500/20'
                  : status === 'fair'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-400 shadow-amber-500/20'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-400 shadow-rose-500/20'
              }`}
            >
              {status === 'success' ? '⚖️' : status === 'fair' ? '🛡️' : '⚠️'}
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {status === 'success'
                ? "Cân Bằng Đỉnh Cao!"
                : status === 'fair'
                ? "Vững Vàng Vượt Bão Giông"
                : "Mất Thăng Bằng Cuộc Đời"}
            </h3>

            <div className="font-sans tabular-nums text-sm text-slate-300 mb-3">
              Điểm số cân bằng: <strong className="text-white font-bold">{Math.max(0, Math.round(100 - Math.abs(angle) * 2.2))}/100</strong>
            </div>

            <p className="text-xs text-slate-300 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3.5 mb-5 max-w-md leading-relaxed">
              {status === 'success'
                ? "Bạn làm chủ thời gian và tâm trí hoàn hảo! Mái ấm ngập tiếng cười mà công danh vẫn rạng rỡ (-40 Burnout, +10 Karma, cờ 'Bậc Thầy Cân Bằng')."
                : status === 'fair'
                ? "Dù có những thời khắc chông chênh dữ dội, bạn vẫn khéo léo chèo lái con thuyền số phận bình yên (-20 Burnout)."
                : "Áp lực quá lớn khiến bạn mất cân bằng, giọt nước tràn ly gây khủng hoảng gia đình và kiệt quệ tâm lý (+25 Burnout, -5 Sinh lực)."}
            </p>

            <button
              onClick={handleReturnToLife}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Tiếp Tục Cuộc Đời</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

