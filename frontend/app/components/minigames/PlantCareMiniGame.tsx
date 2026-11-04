'use client';

import React, { useState, useEffect } from 'react';
import { Droplets, Sun, Bug, Sparkles, CheckCircle2, AlertCircle, X, ArrowRight, Play, Heart } from 'lucide-react';

interface PlantCareMiniGameProps {
  targetLevel?: number;
  onComplete: (result: {
    status: 'success' | 'fair' | 'fail';
    score: number;
    summary: string;
  }) => void;
  onClose: () => void;
}

export default function PlantCareMiniGame({
  targetLevel = 1,
  onComplete,
  onClose
}: PlantCareMiniGameProps) {
  const [stage, setStage] = useState<'briefing' | 'playing' | 'result'>('briefing');
  const initialTime = targetLevel === 1 ? 15 : targetLevel === 2 ? 12 : 10;
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [waterLevel, setWaterLevel] = useState<number>(55); // Ideal: 35-75%
  const [sunOn, setSunOn] = useState<boolean>(true);
  const [bugs, setBugs] = useState<{ id: number; x: number; y: number }[]>([]);
  const [plantGrowth, setPlantGrowth] = useState<number>(25); // 0 to 100
  const [status, setStatus] = useState<'success' | 'fair' | 'fail'>('fair');

  const drainMultiplier = targetLevel === 1 ? 1.0 : targetLevel === 2 ? 1.4 : 1.9;
  const bugChance = targetLevel === 1 ? 0.28 : targetLevel === 2 ? 0.42 : 0.55;
  const maxBugs = targetLevel === 1 ? 3 : targetLevel === 2 ? 5 : 6;

  // Keyboard controls listener
  useEffect(() => {
    if (stage !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleWater();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSunOn(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage]);

  // Countdown timer in playing stage
  useEffect(() => {
    if (stage !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, plantGrowth]);

  // Physics simulation loop (water drainage, bug spawns, plant growth)
  useEffect(() => {
    if (stage !== 'playing') return;

    const loop = setInterval(() => {
      // Water consumption
      const drainBase = sunOn ? 3.0 : 1.2;
      setWaterLevel(w => Math.max(0, Math.round((w - (drainBase * drainMultiplier)) * 10) / 10));

      // Spawn bugs occasionally
      if (Math.random() < bugChance && bugs.length < maxBugs) {
        setBugs(b => [...b, { id: Date.now(), x: 25 + Math.random() * 50, y: 35 + Math.random() * 30 }]);
      }

      // Calculate growth ticks
      setPlantGrowth(g => {
        const isGoodWater = waterLevel >= 35 && waterLevel <= 75;
        let delta = 0;
        if (isGoodWater && sunOn) delta += 3.5;
        else if (isGoodWater) delta += 1.8;
        else delta -= 2.2; // Drowned or parched

        const bugPenalty = bugs.length * 3;
        delta -= bugPenalty;

        return Math.max(0, Math.min(100, Math.round((g + delta) * 10) / 10));
      });
    }, 450);

    return () => clearInterval(loop);
  }, [stage, sunOn, waterLevel, bugs, bugChance, drainMultiplier, maxBugs]);

  const handleWater = () => {
    if (stage !== 'playing') return;
    setWaterLevel(w => Math.min(100, w + 16));
  };

  const handleSquashBug = (id: number) => {
    if (stage !== 'playing') return;
    setBugs(b => b.filter(bug => bug.id !== id));
    setPlantGrowth(g => Math.min(100, g + 6));
  };

  const finishGame = () => {
    let finalStatus: 'success' | 'fair' | 'fail' = 'fair';
    if (plantGrowth >= 70) finalStatus = 'success';
    else if (plantGrowth >= 40) finalStatus = 'fair';
    else finalStatus = 'fail';

    setStatus(finalStatus);
    setStage('result');
  };

  const handleReturnToLife = () => {
    const summary =
      status === 'success'
        ? "Cây non xanh tốt trổ hoa rực rỡ, hun đúc tính kiên nhẫn và lòng trắc ẩn (+15 Sinh Lực, +20 Karma, cờ Mát Tay)."
        : status === 'fair'
        ? "Cây non sinh trưởng bình an dù trải qua vài đợt sâu bọ (+8 Sinh Lực, +10 Karma)."
        : "Cây non bị héo úng vì thiếu săn sóc chu đáo (-5 Sinh Lực).";

    onComplete({
      status,
      score: Math.round(plantGrowth),
      summary
    });
  };

  const isIdealWater = waterLevel >= 35 && waterLevel <= 75;
  const plantColor = plantGrowth >= 70 ? '#10b981' : plantGrowth >= 40 ? '#84cc16' : '#eab308';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-24 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ================================================================ */}
        {/* PHASE 1: BRIEFING & TUTORIAL SCREEN */}
        {/* ================================================================ */}
        {stage === 'briefing' && (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-emerald-500/20">
              🌱
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-sans tabular-nums px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Tuổi Thơ (6–12 Tuổi)
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Ươm Mầm Cây Xanh Đầu Đời</h3>
            <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
              Bạn được cha mẹ tặng một chậu hạt giống nhỏ. Hãy chăm chút độ ẩm, ánh sáng và bắt sâu để rèn luyện sự nhẫn nại và tình yêu thiên nhiên thuở thiếu thời.
            </p>

            {/* How to play card */}
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 text-left space-y-2.5 text-xs">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5 normal-case text-[12px] tracking-normal">
                <Sparkles className="w-4 h-4" /> Hướng Dẫn & Thao Tác:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="font-semibold text-white flex items-center gap-1.5 mb-0.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" /> Tưới Nước:
                  </div>
                  <span className="text-[12px] text-slate-400">Nhấn nút hoặc bấm <strong className="text-amber-300 font-sans tabular-nums">[Space]</strong> / <strong className="text-amber-300 font-sans tabular-nums">[W]</strong>. Duy trì độ ẩm 35%–75%.</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="font-semibold text-white flex items-center gap-1.5 mb-0.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Ánh Sáng:
                  </div>
                  <span className="text-[12px] text-slate-400">Bật/tắt nắng bằng phím <strong className="text-amber-300 font-sans tabular-nums">[S]</strong>. Nắng giúp cây quang hợp lớn nhanh.</span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[12px] text-slate-300 flex items-center gap-2">
                <Bug className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Nhấp chuột trực tiếp vào con sâu bọ để bắt sâu bảo vệ tán lá non!</span>
              </div>
            </div>

            {/* Stakes card */}
            <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 mb-5 text-xs text-left grid grid-cols-2 gap-3">
              <div>
                <span className="text-emerald-400 font-bold block mb-0.5">🌟 Thành Công (≥70%):</span>
                <span className="text-[12px] text-slate-400">+15 Sinh lực, +20 Karma, Cờ &quot;Mát Tay Nuôi Dưỡng&quot;.</span>
              </div>
              <div>
                <span className="text-rose-400 font-bold block mb-0.5">⚠️ Thất Bại (&lt;40%):</span>
                <span className="text-[12px] text-slate-400">-5 Sinh lực, cờ thờ ơ vô tâm.</span>
              </div>
            </div>

            {/* Ready Button */}
            <button
              onClick={() => {
                setTimeLeft(15);
                setWaterLevel(55);
                setPlantGrowth(25);
                setBugs([]);
                setStage('playing');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Ươm Mầm (15 Giây)</span>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 2: ACTIVE GAMEPLAY */}
        {/* ================================================================ */}
        {stage === 'playing' && (
          <div className="flex flex-col">
            {/* Top Timer Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-medium border border-emerald-500/20">
                🌱 Vườn Ươm Thiếu Thời
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

            {/* Growth Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Độ Lớn Của Cây:</span>
                <span className="font-sans tabular-nums font-bold text-emerald-400">{Math.round(plantGrowth)}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${plantGrowth}%` }}
                />
              </div>
            </div>

            {/* Visual Greenhouse Garden Canvas */}
            <div className="relative h-48 w-full bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col items-center justify-end p-4 mb-4 overflow-hidden select-none">
              {/* Sun Light Element */}
              <div
                className={`absolute top-3 right-3 p-2 rounded-full border transition-all duration-300 ${
                  sunOn
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-110'
                    : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50'
                }`}
              >
                <Sun className={`w-5 h-5 ${sunOn ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
              </div>

              {/* Crawling Bugs on screen */}
              {bugs.map(bug => (
                <button
                  key={bug.id}
                  onClick={() => handleSquashBug(bug.id)}
                  style={{ top: `${bug.y}%`, left: `${bug.x}%` }}
                  title="Nhấp để bắt sâu!"
                  className="absolute p-1.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:scale-125 transition animate-bounce z-10"
                >
                  <Bug className="w-4 h-4" />
                </button>
              ))}

              {/* Plant Visual Graphic */}
              <div className="flex flex-col items-center z-0 transition-transform duration-300" style={{ transform: `scale(${0.6 + (plantGrowth / 100) * 0.7})` }}>
                {plantGrowth >= 70 ? (
                  <div className="text-5xl animate-bounce">🌺</div>
                ) : plantGrowth >= 40 ? (
                  <div className="text-4xl">🌿</div>
                ) : (
                  <div className="text-3xl">🌱</div>
                )}
                {/* Pot Base */}
                <div className="w-16 h-8 bg-amber-900/80 border border-amber-700/60 rounded-b-xl mt-1 shadow-md" />
              </div>

              {/* Status Hint overlay */}
              <div className="absolute bottom-2 left-3 text-[12px] text-slate-400">
                {!isIdealWater ? (
                  <span className="text-rose-400 font-semibold">⚠️ Độ ẩm không tốt ({Math.round(waterLevel)}%)</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">✨ Độ ẩm lý tưởng! Cây đang lớn</span>
                )}
              </div>
            </div>

            {/* Water Gauge Meter */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 mb-4">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" /> Độ ẩm đất:
                </span>
                <span className="font-sans tabular-nums font-bold text-sky-400">{Math.round(waterLevel)}%</span>
              </div>
              <div className="relative h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                {/* Ideal Zone background (35% to 75%) */}
                <div className="absolute top-0 bottom-0 left-[35%] right-[25%] bg-emerald-500/30" />
                <div
                  className={`h-full transition-all duration-200 ${
                    isIdealWater ? 'bg-sky-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${waterLevel}%` }}
                />
              </div>
              <div className="flex justify-between text-[12px] text-slate-500 mt-1">
                <span>0% (Khô cằn)</span>
                <span className="text-emerald-400 font-medium">Vùng tốt (35%–75%)</span>
                <span>100% (Úng nước)</span>
              </div>
            </div>

            {/* Interactive Control Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleWater}
                className="py-3 px-4 rounded-xl bg-sky-600/30 hover:bg-sky-600/40 border border-sky-500/50 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-md shadow-sky-950/40"
              >
                <Droplets className="w-4 h-4 text-sky-400" />
                <span>Tưới Nước (+16%)</span>
                <span className="hidden sm:inline text-[12px] font-sans tabular-nums text-sky-300 bg-sky-950 px-1.5 py-0.5 rounded">[Space]</span>
              </button>

              <button
                onClick={() => setSunOn(prev => !prev)}
                className={`py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition ${
                  sunOn
                    ? 'bg-amber-600/30 hover:bg-amber-600/40 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Nắng: {sunOn ? 'Đang Bật' : 'Tắt Nắng'}</span>
                <span className="hidden sm:inline text-[12px] font-sans tabular-nums bg-slate-900 px-1.5 py-0.5 rounded">[S]</span>
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
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/20'
                  : status === 'fair'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-amber-500/20'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-rose-500/20'
              }`}
            >
              {status === 'success' ? '🌺' : status === 'fair' ? '🌿' : '🥀'}
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {status === 'success'
                ? "Hoa Đơm Bông Rực Rỡ!"
                : status === 'fair'
                ? "Mầm Cây Phát Triển Bình Ổn"
                : "Mầm Cây Bị Héo Khô"}
            </h3>

            <div className="font-sans tabular-nums text-sm text-slate-300 mb-3">
              Độ lớn cuối cùng: <strong className="text-white font-bold">{Math.round(plantGrowth)}%</strong>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 mb-5 max-w-md leading-relaxed">
              {status === 'success'
                ? "Chăm sóc chu đáo giúp mầm cây nở hoa tuyệt đẹp! Bạn nhận được cờ ẩn 'Mát Tay Nuôi Dưỡng', bồi dưỡng tính kiên nhẫn sâu sắc cho cả cuộc đời."
                : status === 'fair'
                ? "Mầm cây xanh tốt vừa độ dù trải qua đôi chút sâu rầy. Bạn hiểu được giá trị của việc kiên trì."
                : "Cây non không thể sống sót do thiếu nước hoặc sâu hại tàn phá. Bạn rút ra bài học sâu sắc về sự chú tâm."}
            </p>

            <button
              onClick={handleReturnToLife}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2"
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

