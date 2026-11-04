'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Heart, ShieldAlert, Sparkles, X, Play, ArrowRight } from 'lucide-react';

interface CardioBeatMiniGameProps {
  targetLevel?: number;
  onComplete: (result: {
    status: 'success' | 'fair' | 'fail';
    score: number;
    summary: string;
  }) => void;
  onClose: () => void;
}

export default function CardioBeatMiniGame({
  targetLevel = 1,
  onComplete,
  onClose
}: CardioBeatMiniGameProps) {
  const [stage, setStage] = useState<'briefing' | 'playing' | 'result'>('briefing');
  const [pulseCount, setPulseCount] = useState(0);
  const [targetHits, setTargetHits] = useState(0);
  const [bloodPressure, setBloodPressure] = useState({ sys: 125, dia: 82 });
  const [feedback, setFeedback] = useState<string>("Tập trung bắt nhịp tim khi đỉnh sóng vào vạch xanh!");
  const [feedbackColor, setFeedbackColor] = useState<string>("text-slate-400");
  const [beatPosition, setBeatPosition] = useState(0); // 0% to 100% across ECG line
  const [isBeating, setIsBeating] = useState(false);
  const [status, setStatus] = useState<'success' | 'fair' | 'fail'>('fair');

  const scanSpeed = targetLevel === 1 ? 1.8 : targetLevel === 2 ? 2.6 : 3.5;
  const totalCycles = targetLevel === 1 ? 8 : targetLevel === 2 ? 10 : 12;
  const perfectTolerance = targetLevel === 1 ? 7 : targetLevel === 2 ? 4.5 : 2.5;

  const posRef = useRef(0);
  const totalPulsesRef = useRef(0);
  const hitsRef = useRef(0);
  const gameOverRef = useRef(false);

  // Keyboard shortcut (Space bar) in playing stage
  useEffect(() => {
    if (stage !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        triggerBeat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage]);

  // ECG scan animation loop
  useEffect(() => {
    if (stage !== 'playing') return;

    const scanInterval = setInterval(() => {
      if (gameOverRef.current) return;

      posRef.current += scanSpeed;
      if (posRef.current >= 100) {
        // One pulse cycle completed
        posRef.current = 0;
        totalPulsesRef.current += 1;
        setPulseCount(totalPulsesRef.current);

        // Check if finished cycles
        if (totalPulsesRef.current >= totalCycles) {
          gameOverRef.current = true;
          const hits = hitsRef.current;
          const successReq = Math.ceil(totalCycles * 0.75);
          const fairReq = Math.ceil(totalCycles * 0.45);

          let finalStatus: 'success' | 'fair' | 'fail' = 'fair';
          if (hits >= successReq) finalStatus = 'success';
          else if (hits >= fairReq) finalStatus = 'fair';
          else finalStatus = 'fail';

          setStatus(finalStatus);
          setStage('result');
          return;
        }
      }
      setBeatPosition(posRef.current);
    }, 25);

    return () => clearInterval(scanInterval);
  }, [stage, scanSpeed, totalCycles]);

  const triggerBeat = () => {
    if (stage !== 'playing') return;

    setIsBeating(true);
    setTimeout(() => setIsBeating(false), 180);

    const pos = posRef.current;
    // Peak QRS wave zone is centered around 78%
    if (Math.abs(pos - 78) <= perfectTolerance) {
      // Perfect Beat
      hitsRef.current += 1;
      setTargetHits(Math.round(hitsRef.current));
      setBloodPressure(prev => ({
        sys: Math.max(115, prev.sys - 4),
        dia: Math.max(75, prev.dia - 2)
      }));
      setFeedback("❤️ HOÀN HẢO! Nhịp tim chuẩn xác (120/80)");
      setFeedbackColor("text-emerald-400");
    } else if (Math.abs(pos - 78) <= perfectTolerance + 10) {
      // Good Beat
      hitsRef.current += 0.7;
      setTargetHits(Math.round(hitsRef.current));
      setFeedback("💛 TỐT! Nhịp tim tạm ổn định");
      setFeedbackColor("text-amber-400");
    } else {
      // Missed Beat
      setBloodPressure(prev => ({
        sys: Math.min(175, prev.sys + 7),
        dia: Math.min(105, prev.dia + 4)
      }));
      setFeedback("⚠️ LỆCH NHỊP! Huyết áp tăng vọt!");
      setFeedbackColor("text-rose-400");
    }
  };

  const handleReturnToLife = () => {
    const summary =
      status === 'success'
        ? "Điều hòa nhịp tim và huyết áp thành công vượt qua cơn thắt ngực! (+10 Max Vitality, +15 Sinh Lực, cờ 'Trái Tim Sắt Thép')."
        : status === 'fair'
        ? "Ổn định huyết áp sau cơn hồi hộp tuổi xế chiều (+5 Max Vitality, +8 Sinh Lực)."
        : "Cơn co thắt lồng ngực cấp cứu khẩn cấp (-12 Sinh Lực, -$2.000 viện phí).";

    onComplete({
      status,
      score: Math.min(100, Math.round((hitsRef.current / 10) * 100)),
      summary
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-rose-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/3 w-80 h-28 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ================================================================ */}
        {/* PHASE 1: BRIEFING & TUTORIAL SCREEN */}
        {/* ================================================================ */}
        {stage === 'briefing' && (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-rose-500/20">
              🫀
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-sans tabular-nums px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                Sức Khỏe Tuổi Xế Chiều (49–68 Tuổi)
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Nhịp Đập Tim Mạch</h3>
            <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
              Bước vào tuổi xế chiều, tim mạch bắt đầu xuất hiện những cơn co thắt bất thường. Hãy tập trung bắt nhịp điện tâm đồ ECG để hạ áp suất máu và bảo toàn tuổi thọ!
            </p>

            {/* How to play card */}
            <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-4 text-left space-y-2.5 text-xs">
              <div className="font-bold text-rose-400 flex items-center gap-1.5 normal-case text-[12px] tracking-normal">
                <Sparkles className="w-4 h-4" /> Hướng Dẫn & Thao Tác:
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <span className="text-[12px] text-slate-300">
                  Quan sát đường quét ECG màu đỏ chạy từ trái sang phải. Khi đỉnh sóng chạm vào <strong>Vạch Xanh Chuẩn (Target Zone)</strong>, hãy nhấn nút hoặc bấm phím <strong className="text-amber-300 font-sans tabular-nums">[Space]</strong> để kích nhịp tim hoàn hảo!
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[12px] text-slate-400">
                🩺 <strong>Mục tiêu:</strong> Có tổng cộng 10 nhịp đập. Đạt từ 7 nhịp hoàn hảo trở lên để hạ áp về ngưỡng vàng 120/80 mmHg.
              </div>
            </div>

            {/* Stakes card */}
            <div className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3 mb-5 text-xs text-left grid grid-cols-2 gap-3">
              <div>
                <span className="text-emerald-400 font-bold block mb-0.5">🌟 Nhịp Đập Thép (≥7/10):</span>
                <span className="text-[12px] text-slate-400">+10 Max Vitality, +15 Sinh lực, Cờ &quot;Trái Tim Sắt Thép&quot;.</span>
              </div>
              <div>
                <span className="text-rose-400 font-bold block mb-0.5">⚠️ Rối Loạn Nhịp Tim:</span>
                <span className="text-[12px] text-slate-400">-12 Sinh lực, cấp cứu viện phí -$2.000.</span>
              </div>
            </div>

            {/* Ready Button */}
            <button
              onClick={() => {
                posRef.current = 0;
                totalPulsesRef.current = 0;
                hitsRef.current = 0;
                gameOverRef.current = false;
                setPulseCount(0);
                setTargetHits(0);
                setBloodPressure({ sys: 125, dia: 82 });
                setStage('playing');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-rose-500/25 active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Đo Điện Tâm Đồ (10 Nhịp)</span>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 2: ACTIVE GAMEPLAY */}
        {/* ================================================================ */}
        {stage === 'playing' && (
          <div className="w-full flex flex-col items-center">
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 font-medium border border-rose-500/20 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Máy Theo Dõi Điện Tâm Đồ (ECG)
              </span>
              <div className="flex items-center gap-2 font-sans tabular-nums">
                <span className="text-slate-400">Nhịp tim:</span>
                <span className="px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300">
                  {pulseCount}/10
                </span>
              </div>
            </div>

            {/* Blood Pressure & Target Hits Stats */}
            <div className="w-full grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-slate-400">HUYẾT ÁP (BP)</div>
                  <div className={`text-xl font-sans tabular-nums font-bold ${
                    bloodPressure.sys > 140 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                  }`}>
                    {bloodPressure.sys}/{bloodPressure.dia} <span className="text-xs text-slate-500 font-normal">mmHg</span>
                  </div>
                </div>
                <Heart className={`w-6 h-6 text-rose-500 transition-transform ${isBeating ? 'scale-150' : 'scale-100'}`} />
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-slate-400">NHỊP BẮT CHUẨN</div>
                  <div className="text-xl font-sans tabular-nums font-bold text-amber-300">
                    {targetHits} <span className="text-xs text-slate-500 font-normal">/ 10 nhịp</span>
                  </div>
                </div>
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            {/* ECG Oscilloscope Screen */}
            <div className="relative w-full h-40 bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-hidden mb-4 select-none flex items-center justify-center">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:12px_12px]" />

              {/* Target Zone Box (Green Sweet Spot: 71% to 83%) */}
              <div
                className="absolute top-0 bottom-0 border-x-2 border-dashed border-emerald-400 bg-emerald-500/15 pointer-events-none z-0"
                style={{ left: '71%', width: '12%' }}
              >
                <span className="absolute top-1 left-1 text-[12px] font-sans tabular-nums text-emerald-300 font-bold">
                  TARGET
                </span>
              </div>

              {/* Static Waveform Path Behind */}
              <svg className="w-full h-24 stroke-rose-500/30 fill-none stroke-2 z-0" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M 0,20 L 65,20 L 70,25 L 75,5 L 78,35 L 82,20 L 100,20" />
              </svg>

              {/* Dynamic Scanning Needle & Dot */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-rose-400 shadow-[0_0_12px_#f43f5e] z-10 pointer-events-none"
                style={{ left: `${beatPosition}%` }}
              >
                <div className="w-3 h-3 rounded-full bg-rose-300 -translate-x-[5px] translate-y-16 shadow-[0_0_10px_#fff]" />
              </div>

              {/* Real-time Feedback Toast */}
              <div className="absolute bottom-2 left-3 text-xs font-semibold z-20">
                <span className={feedbackColor}>{feedback}</span>
              </div>
            </div>

            {/* Beat Action Trigger Button */}
            <button
              onClick={triggerBeat}
              className={`w-full py-4 rounded-2xl font-bold text-sm normal-case tracking-normal transition shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
                isBeating
                  ? 'bg-rose-500 text-white shadow-rose-500/40 scale-105'
                  : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-rose-600/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${isBeating ? 'animate-ping' : ''}`} />
              <span>BẮT NHỊP TIM (PULSE BEAT)</span>
              <span className="text-[12px] font-sans tabular-nums bg-slate-950/30 px-2 py-0.5 rounded">[Space]</span>
            </button>
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
              {status === 'success' ? '🫀' : status === 'fair' ? '🩺' : '🚑'}
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {status === 'success'
                ? "Trái Tim Sắt Thép!"
                : status === 'fair'
                ? "Nhịp Tim Ổn Định"
                : "Cơn Co Thắt Cấp Cứu"}
            </h3>

            <div className="font-sans tabular-nums text-sm text-slate-300 mb-3">
              Chỉ số huyết áp: <strong className="text-white font-bold">{bloodPressure.sys}/{bloodPressure.dia} mmHg</strong> (Bắt trúng: {targetHits}/10)
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-2xl p-3.5 mb-5 max-w-md leading-relaxed">
              {status === 'success'
                ? "Điều hòa nhịp tim và huyết áp thành công vượt qua cơn thắt ngực! Bạn nhận cờ ẩn 'Trái Tim Sắt Thép', kéo dài thêm tuổi thọ (+10 Max Vitality, +15 Sinh lực)."
                : status === 'fair'
                ? "Huyết áp ổn định ở ngưỡng an toàn sau những cơn hồi hộp. Tăng thêm tuổi thọ an nhàn (+5 Max Vitality, +8 Sinh lực)."
                : "Rối loạn nhịp tim đột ngột phải nhập viện khẩn cấp! Hao hụt thể lực (-12 Sinh lực) và chi trả -$2.000 viện phí."}
            </p>

            <button
              onClick={handleReturnToLife}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-rose-500/25 active:scale-95 flex items-center justify-center gap-2"
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

