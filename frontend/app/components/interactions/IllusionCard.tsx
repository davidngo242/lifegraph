'use client';

import React from 'react';
import { AlertOctagon, ArrowRight } from 'lucide-react';

interface IllusionCardProps {
  dilemma: any;
  onAccept: () => void;
  isLoading: boolean;
}

export default function IllusionCard({ dilemma, onAccept, isLoading }: IllusionCardProps) {
  const data = dilemma.illusion_data || {
    button_text: "Tiếp Nhận Hiện Thực Tàn Khốc",
    impact_hint: "Không có lối thoát nào khác trước dòng chảy nghiệt ngã của số phận."
  };

  return (
    <div className="bg-slate-900/95 border-2 border-rose-500/80 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(244,63,94,0.35)] relative overflow-hidden backdrop-blur-xl animate-in fade-in">
      {/* Red/dark ominous pulsing vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(244,63,94,0.25)] pointer-events-none animate-pulse" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-sans font-bold tracking-wider uppercase px-3.5 py-1 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/60 flex items-center gap-1.5 animate-pulse">
          <AlertOctagon className="w-4 h-4 text-rose-400" /> ⚡ BIẾN CỐ ĐỊNH MỆNH (THE ILLUSION)
        </span>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
        {dilemma.title}
      </h2>

      <div className="p-5 rounded-2xl bg-slate-950/90 border border-rose-500/20 mb-6 text-slate-100 text-sm md:text-base leading-relaxed font-serif italic shadow-inner">
        "{dilemma.narrative}"
      </div>

      {data.impact_hint && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 font-sans flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <span><strong>Hệ quả tất yếu:</strong> {data.impact_hint}</span>
        </div>
      )}

      {/* Single Inevitable Button with Shake */}
      <button
        disabled={isLoading}
        onClick={onAccept}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-800 hover:from-rose-600 hover:to-red-700 text-white font-extrabold text-sm tracking-wide uppercase transition shadow-lg shadow-rose-950/60 flex items-center justify-center gap-2 active:scale-[0.98] animate-shake hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]"
      >
        <span>{data.button_text}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
