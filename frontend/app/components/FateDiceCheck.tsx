'use client';

import React, { useState, useEffect } from 'react';
import { Dices, Sparkles, Shield, AlertTriangle, CheckCircle2, ChevronRight, X, Flame } from 'lucide-react';

interface FateDiceCheckProps {
  option: any;
  character?: any;
  dilemmaTitle?: string;
  investedAp?: number;
  onComplete: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function FateDiceCheck({
  option,
  character,
  dilemmaTitle,
  investedAp = 0,
  onComplete,
  onCancel,
  isLoading = false
}: FateDiceCheckProps) {
  const [rollState, setRollState] = useState<'ready' | 'rolling' | 'settled'>('ready');
  const [currentDice, setCurrentDice] = useState<number>(12);
  const [finalScore, setFinalScore] = useState<{
    baseRoll: number;
    modifier: number;
    total: number;
    dc: number;
    isSuccess: boolean;
    isCritical: boolean;
  } | null>(null);

  // Compute Difficulty Class (DC) from option risk
  const risk = option?.risk_percent ?? 25;
  const dc = risk >= 60 ? 14 : risk >= 35 ? 12 : 10;

  // Compute stat modifiers from character & invested AP
  const traitsBonus = (character?.innate_traits && character.innate_traits.length > 0) ? 1 : 0;
  const vitalityBonus = (character?.vitality && character.vitality >= 75) ? 1 : 0;
  const effortBonus = (option?.cost_ap && option.cost_ap >= 2) ? 1 : 0;
  const apModifier = (investedAp || 0) * 2;
  const totalModifier = traitsBonus + vitalityBonus + effortBonus + apModifier;

  const startRolling = () => {
    if (rollState !== 'ready') return;
    setRollState('rolling');

    let rollCount = 0;
    const maxRolls = 14;
    const interval = setInterval(() => {
      rollCount++;
      const rand = Math.floor(Math.random() * 20) + 1;
      setCurrentDice(rand);

      if (rollCount >= maxRolls) {
        clearInterval(interval);
        
        // Final Roll determination
        // Bias slightly based on risk
        const finalBase = Math.floor(Math.random() * 20) + 1;
        const total = finalBase + totalModifier;
        const isSuccess = total >= dc;
        const isCritical = finalBase === 20 || total >= dc + 6;

        setCurrentDice(finalBase);
        setFinalScore({
          baseRoll: finalBase,
          modifier: totalModifier,
          total,
          dc,
          isSuccess,
          isCritical
        });
        setRollState('settled');

        // Automatically resolve after showing outcome
        setTimeout(() => {
          onComplete();
        }, 1600);
      }
    }, 70);
  };

  // Auto-start rolling after 1.2s if player doesn't click
  useEffect(() => {
    const timer = setTimeout(() => {
      if (rollState === 'ready') {
        startRolling();
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const actionText = option?.action_title || option?.label || "Quyết định cuộc đời";

  return (
    <div className="relative p-5 md:p-6 rounded-3xl bg-slate-950/95 border border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.25)] backdrop-blur-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
            <Dices className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <span className="text-[12px] normal-case font-sans tabular-nums font-bold tracking-normal text-indigo-300 block">
              Thử Thách Định Mệnh (Fate Skill Check)
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[240px] block">
              {dilemmaTitle || "Ngã rẽ số phận"}
            </span>
          </div>
        </div>

        {rollState === 'ready' && (
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
            title="Đổi ý"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Choice Context Card */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[12px] normal-case font-sans tabular-nums text-amber-400 font-bold block mb-0.5">
            Hành động đã chọn:
          </span>
          <span className="text-sm font-bold text-white block truncate">
            {actionText}
          </span>
          <span className="text-[12px] text-slate-400 font-sans italic line-clamp-1">
            {option?.consequence_hint || option?.effects_hint || "Hệ quả sẽ được ghi vào biên niên sử"}
          </span>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[12px] normal-case font-sans tabular-nums text-slate-400 block font-semibold">Ngưỡng Vượt (DC)</span>
          <span className="text-base font-black font-sans tabular-nums text-amber-300">
            {dc}+
          </span>
        </div>
      </div>

      {/* Center Animated D20 Stage */}
      <div className="flex flex-col items-center justify-center py-4 relative">
        {/* Ambient Ring */}
        <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center relative transition-all duration-500 ${
          rollState === 'settled'
            ? finalScore?.isCritical
              ? 'bg-amber-500/20 ring-4 ring-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.6)]'
              : finalScore?.isSuccess
              ? 'bg-emerald-500/20 ring-4 ring-emerald-400/80 shadow-[0_0_40px_rgba(52,211,153,0.5)]'
              : 'bg-rose-500/20 ring-4 ring-rose-500/70 shadow-[0_0_40px_rgba(244,63,94,0.4)]'
            : 'bg-indigo-950/40 ring-2 ring-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse'
        }`}>
          
          {/* Hexagon Dice Facet */}
          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-300 ${
            rollState === 'rolling'
              ? 'border-indigo-400 bg-slate-900 rotate-12 scale-105'
              : rollState === 'settled'
              ? finalScore?.isCritical
                ? 'border-amber-400 bg-amber-950/80 text-amber-200'
                : finalScore?.isSuccess
                ? 'border-emerald-400 bg-emerald-950/80 text-emerald-200'
                : 'border-rose-400 bg-rose-950/80 text-rose-200'
              : 'border-slate-700 bg-slate-900 text-white'
          }`}>
            <span className="text-3xl md:text-4xl font-black font-sans tabular-nums tracking-tight">
              {currentDice}
            </span>
            <span className="text-[12px] normal-case tracking-normal font-sans tabular-nums text-slate-400 mt-0.5">
              D20
            </span>
          </div>

          {/* Sparkles on Critical */}
          {rollState === 'settled' && finalScore?.isCritical && (
            <div className="absolute -top-2 -right-2 text-amber-300 animate-spin">
              <Sparkles className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Outcome Text Banner */}
        <div className="mt-4 min-h-[44px] flex flex-col items-center justify-center text-center">
          {rollState === 'rolling' && (
            <span className="text-xs font-sans tabular-nums text-indigo-300 animate-pulse flex items-center gap-1.5 font-bold">
              <Dices className="w-3.5 h-3.5 animate-spin" /> Vòng xoay định mệnh đang lắc...
            </span>
          )}

          {rollState === 'settled' && finalScore && (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2">
                {finalScore.isCritical ? (
                  <span className="text-sm font-black text-amber-300 normal-case tracking-wide flex items-center gap-1">
                    👑 ĐẠI THÀNH CÔNG (CRITICAL SUCCESS)!
                  </span>
                ) : finalScore.isSuccess ? (
                  <span className="text-sm font-bold text-emerald-300 normal-case tracking-wide flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> THÀNH CÔNG NGOẠN MỤC!
                  </span>
                ) : (
                  <span className="text-sm font-bold text-rose-300 normal-case tracking-wide flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-400" /> BÀI HỌC GIAN NAN (THẤT THẾ)
                  </span>
                )}
              </div>

              <div className="text-[12px] font-sans tabular-nums text-slate-300 mt-1">
                Điểm xúc xắc: <span className="font-bold text-white">{finalScore.baseRoll}</span>
                {finalScore.modifier > 0 && (
                  <span className="text-emerald-400 font-bold"> + {finalScore.modifier} (Bản Lĩnh{apModifier > 0 ? ' & AP Trợ Lực' : ''})</span>
                )}
                {' '} = <span className="font-extrabold text-white text-xs">{finalScore.total}</span>
                {' '}(Mục tiêu: {finalScore.dc}+)
              </div>
            </div>
          )}

          {rollState === 'ready' && (
            <div className="text-xs text-slate-300">
              Nhấn nút để gieo xúc xắc hoặc tự động lắc sau giây lát...
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Modifier Chips */}
      <div className="flex items-center justify-center gap-2 flex-wrap pt-1 border-t border-slate-800/60 text-[12px] text-slate-400 font-sans tabular-nums">
        <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
          <Shield className="w-3 h-3 text-indigo-400" /> Gen di truyền: +{traitsBonus}
        </span>
        <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
          <Flame className="w-3 h-3 text-emerald-400" /> Thể trạng sung mãn: +{vitalityBonus}
        </span>
        {effortBonus > 0 && (
          <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-slate-300">
            ⚡ AP Tiêu chuẩn: +{effortBonus}
          </span>
        )}
        {apModifier > 0 && (
          <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/40 font-bold animate-pulse">
            ⚡ Trợ lực AP: +{apModifier} điểm gieo quẻ
          </span>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={onComplete}
          disabled={isLoading}
          className="text-xs text-slate-400 hover:text-slate-200 transition underline underline-offset-4"
        >
          Bỏ qua & Thực thi luôn ➔
        </button>

        {rollState === 'ready' && (
          <button
            onClick={startRolling}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition"
          >
            <Dices className="w-4 h-4" />
            <span>LẮC XÚC XẮC NGAY</span>
          </button>
        )}

        {rollState === 'settled' && (
          <button
            onClick={onComplete}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition"
          >
            <span>Xác nhận kết quả</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
}

