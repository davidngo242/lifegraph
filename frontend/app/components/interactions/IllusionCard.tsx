'use client';

import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, Zap, Compass, Shield, ArrowRight } from 'lucide-react';

interface CopingStrategy {
  id: string;
  title: string;
  desc?: string;
  risk_hint?: string;
}

interface IllusionCardProps {
  dilemma: any;
  onAccept: (strategyId?: string) => void;
  isLoading: boolean;
}

export default function IllusionCard({ dilemma, onAccept, isLoading }: IllusionCardProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const fallbackStrategies: CopingStrategy[] = [
    {
      id: "fight",
      title: "⚔️ Quyết Liệt Đấu Tranh",
      desc: "Dùng trí tuệ, quan hệ và pháp lý để đối đầu trực diện, đòi lại danh dự và lợi ích chính đáng.",
      risk_hint: "Tiêu tốn chi phí đối đầu nhưng có cơ hội lội ngược dòng bảo vệ thành quả."
    },
    {
      id: "pivot",
      title: "💡 Thích Ứng & Đổi Mới (Pivot)",
      desc: "Thần tốc đổi hướng chiến lược, biến nghịch cảnh thành bàn đạp nâng cấp kỹ năng và bứt phá.",
      risk_hint: "Tiêu hao thể lực & năng lượng, nhận +35 EXP Kỹ Năng RPG vĩnh viễn."
    },
    {
      id: "endure",
      title: "🛡️ Nhẫn Nhịn Bảo Toàn",
      desc: dilemma.illusion_data?.button_text || "Nuốt hận bảo toàn lực lượng, tích lũy bài học kinh nghiệm sâu sắc.",
      risk_hint: dilemma.illusion_data?.impact_hint || "Chấp nhận mất mát ngắn hạn, nhận +25 Điểm Phúc Báo Karma vĩnh cửu."
    }
  ];

  const strategies: CopingStrategy[] = Array.isArray(dilemma.coping_strategies) && dilemma.coping_strategies.length > 0
    ? dilemma.coping_strategies
    : fallbackStrategies;

  const handleSelect = (strategyId: string) => {
    setSelectedStrategy(strategyId);
    onAccept(strategyId);
  };

  return (
    <div className="bg-slate-900/95 border-2 border-rose-500/80 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(244,63,94,0.35)] relative overflow-hidden backdrop-blur-xl animate-in fade-in">
      {/* Red/dark ominous pulsing vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(244,63,94,0.25)] pointer-events-none animate-pulse" />

      {/* Top Banner Badges */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="text-[12px] font-sans font-bold tracking-normal normal-case px-3.5 py-1 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/60 flex items-center gap-1.5 animate-pulse">
          <AlertOctagon className="w-4 h-4 text-rose-400" /> ⚡ BIẾN CỐ ĐỘT XUẤT · ĐỐI SÁCH KHỦNG HOẢNG
        </span>
        <span className="text-[11px] font-medium text-rose-300/80 bg-rose-950/60 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
          Quyền Quyết Định Thuộc Về Bạn
        </span>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
        {dilemma.title}
      </h2>

      <div className="p-5 rounded-2xl bg-slate-950/90 border border-rose-500/20 mb-6 text-slate-100 text-sm md:text-base leading-relaxed font-sans italic shadow-inner">
        "{dilemma.narrative}"
      </div>

      {/* Narrative prompt for action */}
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-rose-200 uppercase tracking-wider">
        <Compass className="w-4 h-4 text-rose-400" />
        <span>Lựa chọn đối sách sinh tồn và bản lĩnh vượt qua thử thách:</span>
      </div>

      {/* 3 Strategic Interactive Choices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-2">
        {strategies.map((strat) => {
          const isSelected = selectedStrategy === strat.id;
          let icon = <ShieldAlert className="w-4 h-4 text-rose-400" />;
          let borderAccent = "hover:border-rose-400/80 hover:bg-rose-950/30";
          let badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";

          if (strat.id === 'fight') {
            icon = <Zap className="w-4 h-4 text-amber-400" />;
            borderAccent = "hover:border-amber-400/80 hover:bg-amber-950/30";
            badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
          } else if (strat.id === 'pivot') {
            icon = <Compass className="w-4 h-4 text-cyan-400" />;
            borderAccent = "hover:border-cyan-400/80 hover:bg-cyan-950/30";
            badgeColor = "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
          } else if (strat.id === 'endure') {
            icon = <Shield className="w-4 h-4 text-emerald-400" />;
            borderAccent = "hover:border-emerald-400/80 hover:bg-emerald-950/30";
            badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
          }

          return (
            <button
              key={strat.id}
              disabled={isLoading}
              onClick={() => handleSelect(strat.id)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 group active:scale-[0.98] ${
                isSelected
                  ? 'border-rose-400 bg-rose-900/40 ring-2 ring-rose-400/50 shadow-lg'
                  : `border-slate-800 bg-slate-950/80 ${borderAccent}`
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${badgeColor}`}>
                    {icon}
                    <span>{strat.id === 'fight' ? 'Đấu Tranh' : strat.id === 'pivot' ? 'Thích Ứng' : 'Bảo Toàn'}</span>
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-rose-200 transition">
                  {strat.title}
                </h4>
                {strat.desc && (
                  <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3 line-clamp-3">
                    {strat.desc}
                  </p>
                )}
              </div>

              {strat.risk_hint && (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-sans flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold shrink-0">▸</span>
                  <span>{strat.risk_hint}</span>
                </div>
              )}

              <div className="mt-3 flex items-center justify-end text-xs font-bold text-rose-300 group-hover:translate-x-1 transition-transform">
                <span>Chọn đối sách</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
