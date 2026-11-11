'use client';

import React, { useState } from 'react';
import { Sliders, ArrowRight, Smile, AlertTriangle, DollarSign } from 'lucide-react';

interface SpectrumSliderProps {
  dilemma: any;
  onSubmit: (sliderValue: number) => void;
  isLoading: boolean;
}

export default function SpectrumSlider({ dilemma, onSubmit, isLoading }: SpectrumSliderProps) {
  const [sliderVal, setSliderVal] = useState<number>(50);
  const data = dilemma.spectrum_data || {
    min_label: "Chạy Theo Đam Mê",
    max_label: "Bán Mình Cho Tư Bản",
    impact_metric: "burnout_vs_cash"
  };

  const leftPct = 100 - sliderVal;
  const rightPct = sliderVal;

  // Real-time Consequence Projections
  const projectedCashBonus = Math.round((rightPct / 100) * 9500);
  const projectedBurnoutDelta = Math.round((rightPct / 100) * 40 - (leftPct / 100) * 20);
  const projectedHappinessDelta = Math.round((leftPct / 100) * 25 - (rightPct / 100) * 15);

  const getDecisionSummary = () => {
    if (sliderVal >= 75) return `Quyết liệt: Bán mình cho tư bản (${rightPct}%)`;
    if (sliderVal > 55) return `Nghiêng về thu nhập & cơ hội (${rightPct}%)`;
    if (sliderVal <= 25) return `Thuần khiết: Chạy theo đam mê (${leftPct}%)`;
    if (sliderVal < 45) return `Nghiêng về tự do & đam mê (${leftPct}%)`;
    return `Cân bằng trung dung (50% / 50%)`;
  };

  return (
    <div className="bg-[var(--bg-card-subtle)] border border-indigo-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      
      {/* Header Tag */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-sans tabular-nums tracking-wide normal-case px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" /> Thanh Trượt Đánh Đổi (Spectrum Dilemma)
        </span>
        <span className="text-xs font-sans tabular-nums text-slate-400">
          Tỷ lệ: <strong className="text-sky-700 dark:text-sky-400">{leftPct}%</strong> / <strong className="text-rose-700 dark:text-rose-400">{rightPct}%</strong>
        </span>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
        {dilemma.title}
      </h2>

      <div className="p-4 md:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] mb-5 text-slate-200 text-sm md:text-base leading-relaxed font-sans italic">
        "{dilemma.narrative}"
      </div>

      {/* The Spectrum Slider Box */}
      <div className="p-4 md:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] mb-5">
        <div className="flex justify-between text-xs md:text-sm font-semibold mb-3">
          <span className="text-sky-700 dark:text-sky-400 font-sans flex items-center gap-1.5">
            ◀ {data.min_label} <span className="font-sans tabular-nums text-xs px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">{leftPct}%</span>
          </span>
          <span className="text-rose-700 dark:text-rose-400 font-sans flex items-center gap-1.5">
            <span className="font-sans tabular-nums text-xs px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">{rightPct}%</span> {data.max_label} ▶
          </span>
        </div>

        {/* Custom Range Track: track hiển thị riêng (đủ tương phản mọi theme), input trong suốt cao 44px để chạm dễ trên mobile */}
        <div className="relative flex items-center my-2">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 h-3 rounded-lg border border-[var(--border-subtle)] pointer-events-none"
            style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.55), rgba(244,63,94,0.55))' }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={sliderVal}
            onChange={(e) => setSliderVal(Number(e.target.value))}
            disabled={isLoading}
            aria-label="Thanh trượt đánh đổi"
            className="relative w-full h-11 sm:h-6 bg-transparent appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition"
          />
        </div>

        {/* Live Dynamic Projection Preview (Clean Minimalist Chips) */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[var(--border-subtle)] text-center">
          {/* Thu Nhập / Tiền */}
          <div className="p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex items-center justify-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400 shrink-0" />
            <span className={`font-sans tabular-nums font-bold text-xs ${projectedCashBonus > 3000 ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-300'}`}>
              {projectedCashBonus > 0 ? `+$${projectedCashBonus.toLocaleString()}` : '$0'}
            </span>
          </div>

          {/* Căng Thẳng (Burnout) */}
          <div className="p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400 shrink-0" />
            <span className={`font-sans tabular-nums font-bold text-xs ${projectedBurnoutDelta > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-800 dark:text-emerald-400'}`}>
              {projectedBurnoutDelta > 0 ? `+${projectedBurnoutDelta}% Stress` : `${projectedBurnoutDelta}% Stress`}
            </span>
          </div>

          {/* Hạnh Phúc */}
          <div className="p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex items-center justify-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400 shrink-0" />
            <span className={`font-sans tabular-nums font-bold text-xs ${projectedHappinessDelta >= 0 ? 'text-amber-800 dark:text-amber-300' : 'text-slate-400'}`}>
              {projectedHappinessDelta >= 0 ? `+${projectedHappinessDelta}% Vui vẻ` : `${projectedHappinessDelta}% Vui vẻ`}
            </span>
          </div>
        </div>
      </div>

      {/* Action Confirmation Button with Concise Dynamic Label */}
      <button
        disabled={isLoading}
        onClick={() => onSubmit(sliderVal)}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-sm tracking-wide normal-case transition shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-[0.99] border border-amber-300/40"
      >
        <span>Xác Nhận Quyết Định ({leftPct}% / {rightPct}%)</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

