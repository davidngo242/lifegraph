'use client';

import React from 'react';
import { Triangle, DollarSign, Heart, Users, ArrowRight } from 'lucide-react';

interface TrilemmaCardProps {
  dilemma: any;
  characterAge?: number;
  onSelectOption: (optionId: string) => void;
  isLoading: boolean;
}

export default function TrilemmaCard({ dilemma, characterAge, onSelectOption, isLoading }: TrilemmaCardProps) {
  const options = dilemma.trilemma_options || [
    { id: "TRI_A", action_title: "Hy sinh Tài chính", consequence_hint: "Mất tiền để bảo toàn thể xác & người thân.", sacrifice_type: "cash" },
    { id: "TRI_B", action_title: "Hy sinh Thể xác", consequence_hint: "Bán máu cứu vãn vị thế tiền bạc.", sacrifice_type: "vitality" },
    { id: "TRI_C", action_title: "Hy sinh Tình cảm", consequence_hint: "Cắt đứt gia đình để theo đuổi tham vọng.", sacrifice_type: "relationship" }
  ];

  const getSacrificeBadge = (type: string) => {
    if (type === "cash") return { icon: <DollarSign className="w-3.5 h-3.5 text-rose-400" />, label: "Tổn Thất Tiền Bạc", color: "border-rose-500/40 text-rose-300 bg-rose-500/10" };
    if (type === "vitality") return { icon: <Heart className="w-3.5 h-3.5 text-rose-400" />, label: "Tổn Thất Thể Lực", color: "border-amber-500/40 text-amber-300 bg-amber-500/10" };
    return { icon: <Users className="w-3.5 h-3.5 text-rose-400" />, label: "Tổn Thất Nghĩa Tình", color: "border-purple-500/40 text-purple-300 bg-purple-500/10" };
  };

  // Sync Age accurately
  const displayTitle = characterAge
    ? dilemma.title.replace(/Tuổi \d+/i, `Tuổi ${characterAge}`)
    : dilemma.title;

  return (
    <div className="bg-slate-900/95 border border-amber-500/40 rounded-3xl p-4 md:p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl animate-in fade-in duration-200">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-sans font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
          <Triangle className="w-3 h-3 fill-amber-400/30" /> Tam Giác Bất Khả Thi (Trilemma)
        </span>
        {characterAge && (
          <span className="text-xs font-mono font-bold text-amber-400">
            Năm {characterAge} Tuổi
          </span>
        )}
      </div>

      <h2 className="text-base md:text-lg font-bold text-white mb-2 tracking-tight">
        {displayTitle}
      </h2>

      {/* Narrative Quote - Compact & Elegant */}
      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 mb-3 text-slate-200 text-xs md:text-sm leading-relaxed font-serif italic">
        "{dilemma.narrative}"
      </div>

      <div className="text-[10px] font-sans text-slate-400 uppercase tracking-wider mb-2 font-medium flex items-center justify-between">
        <span>Chọn 1 trong 3 con đường (Mỗi lựa chọn phải trả một cái giá đắt):</span>
      </div>

      {/* 3-Column Horizontal Grid - Viewable on 1 screen without scrolling! */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {options.map((opt: any) => {
          const badge = getSacrificeBadge(opt.sacrifice_type);
          return (
            <button
              key={opt.id}
              disabled={isLoading}
              onClick={() => onSelectOption(opt.id)}
              className="text-left p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/90 border-2 border-slate-800/80 hover:border-amber-500/60 transition-all group flex flex-col justify-between min-h-[125px] active:scale-[0.98] shadow-md hover:shadow-amber-500/10"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className={`text-[9px] font-sans font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${badge.color}`}>
                    {badge.icon} {badge.label}
                  </span>
                </div>
                <div className="text-xs md:text-sm font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-2">
                  {opt.action_title}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-slate-300">
                <span className="line-clamp-2">{opt.consequence_hint}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
