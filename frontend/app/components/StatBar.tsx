'use client';

import React from 'react';
import { Heart, DollarSign, Sparkles, Zap, AlertTriangle } from 'lucide-react';

interface StatBarProps {
  vitality: number;
  maxVitality?: number;
  cash: number;
  netWorth?: number;
  karma: number;
  actionPoints?: number;
  burnout: number; // Hidden qualitative cue
}

export default function StatBar({
  vitality,
  maxVitality = 100,
  cash,
  netWorth,
  karma,
  burnout
}: StatBarProps) {
  const getStressDescription = () => {
    if (burnout > 80) return { label: "NGUY KỊCH", color: "text-rose-500 animate-pulse font-bold" };
    if (burnout > 60) return { label: "Kiệt quệ", color: "text-orange-400 font-semibold" };
    if (burnout > 35) return { label: "Căng thẳng", color: "text-amber-400" };
    return { label: "Ổn định", color: "text-emerald-400" };
  };

  const stress = getStressDescription();
  const vitalityPercent = Math.max(0, Math.min(100, (vitality / maxVitality) * 100));
  const displayNetWorth = typeof netWorth === 'number' ? netWorth : cash;

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-3">
      {/* 1. Sức sống (Vitality with Max Cap) */}
      <div className="flex items-center gap-3 min-w-[190px] flex-1">
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <Heart className="w-5 h-5 fill-rose-500/30" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-400 mb-1 font-sans">
            <span className="font-semibold tracking-normal text-[12px]">SỨC SỐNG</span>
            <span className="text-slate-200 font-sans tabular-nums font-medium">
              {vitality}<span className="text-slate-500 text-[12px]">/{maxVitality}</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                vitality < 25 ? 'bg-rose-500 animate-pulse' : vitality < 55 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${vitalityPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Tiền mặt (Cash) */}
      <div className="flex items-center gap-3 min-w-[150px]">
        <div className={`p-2.5 rounded-xl border ${
          cash < 0 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[12px] text-slate-400 font-semibold tracking-normal font-sans">TIỀN MẶT</div>
          <div className={`text-base font-sans tabular-nums font-bold ${
            cash < 0 ? 'text-rose-400 tracking-tight' : 'text-slate-100'
          }`}>
            {cash < 0 ? `-$${Math.abs(cash).toLocaleString()}` : `$${cash.toLocaleString()}`}
          </div>
        </div>
      </div>

      {/* 3. Tổng tài sản ròng (Net Worth) */}
      <div className="flex items-center gap-3 min-w-[150px]">
        <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[12px] text-slate-400 font-semibold tracking-normal font-sans">TỔNG TÀI SẢN</div>
          <div className="text-base font-sans tabular-nums font-bold text-teal-300">
            ${displayNetWorth.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 4. Trạng thái tâm lý (Stress) */}
      <div className="flex items-center gap-3 min-w-[130px]">
        <div className={`p-2.5 rounded-xl border ${
          burnout > 80 ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${burnout > 80 ? 'animate-bounce' : ''}`} />
        </div>
        <div>
          <div className="text-[12px] text-slate-400 font-semibold tracking-normal font-sans">TÂM TRÍ</div>
          <div className={`text-sm font-sans font-medium ${stress.color}`}>
            {stress.label}
          </div>
        </div>
      </div>

      {/* 5. Nghiệp lực (Karma) */}
      <div className="flex items-center gap-3 min-w-[120px]">
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[12px] text-slate-400 font-semibold tracking-normal font-sans">NGHIỆP LỰC</div>
          <div className="text-sm font-sans tabular-nums font-bold text-purple-300">
            {karma}
          </div>
        </div>
      </div>
    </div>
  );
}

