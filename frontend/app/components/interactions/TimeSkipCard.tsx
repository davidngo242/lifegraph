'use client';

import React from 'react';
import { FastForward, Clock, Briefcase, Heart, Sparkles } from 'lucide-react';

interface TimeSkipCardProps {
  dilemma: any;
  onContinue: (choice?: 'accumulate' | 'relax') => void;
  isLoading: boolean;
}

export default function TimeSkipCard({ dilemma, onContinue, isLoading }: TimeSkipCardProps) {
  const data = dilemma.time_skip_data || {
    years_jump: 3,
    yearly_income_save: 4000,
    event_summary: "Trôi qua 3 năm bình yên trong công việc và cuộc sống."
  };

  return (
    <div className="bg-slate-900/95 border border-sky-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-sans font-medium tracking-wide uppercase px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1.5">
          <FastForward className="w-3.5 h-3.5 animate-pulse" /> Khoảng Lặng Cuộc Đời (Time Skip)
        </span>
        <span className="text-xs font-sans text-sky-400 font-bold">
          <span className="font-mono">+{data.years_jump || 3}</span> Tuổi trôi qua
        </span>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
        {dilemma.title}
      </h2>

      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 text-slate-200 text-sm md:text-base leading-relaxed font-serif italic">
        "{dilemma.narrative}"
      </div>

      <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/20 text-xs text-sky-300 font-sans mb-6 flex items-center gap-2">
        <Clock className="w-4 h-4 text-sky-400 shrink-0" />
        <span>Giai đoạn bình yên hiếm hoi. Bạn muốn định hình 3 năm này theo hướng nào?</span>
      </div>

      {/* 2 Strategic Paths during Time Skip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        <button
          disabled={isLoading}
          onClick={() => onContinue('accumulate')}
          className="p-4 rounded-2xl bg-slate-950 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500/50 text-left transition active:scale-[0.98] group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-sky-400 font-bold text-sm group-hover:text-sky-300">
              <Briefcase className="w-4 h-4" />
              <span>Cày Tiền & Tích Lũy Kỹ Năng</span>
            </div>
            <p className="text-xs text-slate-400 leading-snug">
              Tập trung làm việc cật lực và học thêm. Thu về thêm thặng dư tiền mặt sau 3 năm.
            </p>
          </div>
          <div className="mt-3 text-[11px] font-mono text-sky-300 font-medium">
            +${((data.yearly_income_save || 3000) * 3).toLocaleString()} tiền tiết kiệm
          </div>
        </button>

        <button
          disabled={isLoading}
          onClick={() => onContinue('relax')}
          className="p-4 rounded-2xl bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 text-left transition active:scale-[0.98] group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-bold text-sm group-hover:text-emerald-300">
              <Heart className="w-4 h-4" />
              <span>Dưỡng Sức & Gắn Kết Mái Ấm</span>
            </div>
            <p className="text-xs text-slate-400 leading-snug">
              Trân trọng từng bữa cơm bên người thân. Thanh lọc hoàn toàn kiệt sức và tăng cường thể chất.
            </p>
          </div>
          <div className="mt-3 text-[11px] font-mono text-emerald-300 font-medium">
            -40 Burnout, +15 Sinh lực, +15 Karma
          </div>
        </button>
      </div>
    </div>
  );
}
