'use client';

import React from 'react';
import { Users, Zap } from 'lucide-react';

interface NPCDialogCardProps {
  dilemma: any;
  characterVisuals: any;
  characterName: string;
  characterAge: number;
  actionPoints: number;
  onSelectOption: (optionId: string) => void;
  isLoading: boolean;
}

export default function NPCDialogCard({
  dilemma,
  characterVisuals,
  characterName,
  characterAge,
  actionPoints,
  onSelectOption,
  isLoading
}: NPCDialogCardProps) {
  const npc = dilemma.active_npc || { name: "Người lạ", role: "Nhân vật bí ẩn", affinity: 50 };
  const affinityColor = npc.affinity >= 60 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : npc.affinity <= -20 ? "text-rose-400 bg-rose-500/10 border-rose-500/30" : "text-amber-400 bg-amber-500/10 border-amber-500/30";

  return (
    <div className="bg-slate-900/95 border border-indigo-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[11px] font-sans font-medium tracking-wide uppercase px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Tương Tác Trực Diện
        </span>
      </div>

      {/* Split Duel Faces Header */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
        {/* Left Side: Player */}
        <div className="flex items-center gap-3 pr-3 border-r border-slate-800">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 shrink-0 bg-slate-900 shadow-md">
            <img src={characterVisuals?.portrait_url} alt="You" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-sans text-indigo-400 font-bold uppercase truncate">BẠN</div>
            <div className="text-sm font-bold text-white truncate">{characterName}</div>
            <div className="text-[11px] text-slate-400 font-sans">{characterAge} tuổi</div>
          </div>
        </div>

        {/* Right Side: NPC */}
        <div className="flex items-center gap-3 pl-1">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-indigo-500/50 shrink-0 bg-indigo-950/40 flex items-center justify-center text-indigo-300 font-bold text-xl shadow-md font-sans">
            {npc.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-sans text-slate-400 truncate">{npc.role}</div>
            <div className="text-sm font-bold text-white truncate">{npc.name}</div>
            <span className={`text-[10px] font-sans px-2 py-0.5 rounded-md border inline-block mt-0.5 ${affinityColor}`}>
              Thiện cảm: <span className="font-mono">{npc.affinity > 0 ? `+${npc.affinity}` : npc.affinity}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Title & Cinematic Narrative */}
      <h2 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">
        {dilemma.title}
      </h2>

      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6 text-slate-200 text-sm md:text-base leading-relaxed font-serif italic">
        "{dilemma.narrative}"
      </div>

      {/* Options */}
      <div className="space-y-3">
        {dilemma.options.map((option: any) => {
          const hasAP = actionPoints >= (option.cost_ap || 1);
          const isDisabled = !hasAP || isLoading;

          return (
            <button
              key={option.id}
              disabled={isDisabled}
              onClick={() => onSelectOption(option.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                isDisabled
                  ? 'bg-slate-950/40 border-slate-800/40 opacity-40 cursor-not-allowed'
                  : 'bg-slate-800/40 hover:bg-slate-800/90 border-slate-700 hover:border-indigo-400 active:scale-[0.99]'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                    {option.action_title || option.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">
                    {option.consequence_hint || option.effects_hint}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-amber-400/30" /> {option.cost_ap || 1} AP
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
