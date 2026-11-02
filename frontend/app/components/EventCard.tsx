'use client';

import React, { useState } from 'react';
import { Zap, Compass, Sparkles, Send, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import Tooltip from './Tooltip';

interface Option {
  id: string;
  action_title?: string;
  label?: string;
  consequence_hint?: string;
  effects_hint?: string;
  risk_percent: number;
  cost_ap: number;
}

interface Dilemma {
  id: string;
  title: string;
  narrative: string;
  options: Option[];
}

interface EventCardProps {
  dilemma: Dilemma | null;
  actionPoints: number;
  characterAge?: number;
  onSelectOption: (optionId: string) => void;
  onCustomResolve?: (actionText: string) => Promise<any>;
  isLoading: boolean;
}

export default function EventCard({
  dilemma,
  actionPoints,
  characterAge,
  onSelectOption,
  onCustomResolve,
  isLoading
}: EventCardProps) {
  const [activeTab, setActiveTab] = useState<'standard' | 'custom'>('standard');
  const [customActionText, setCustomActionText] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [customResult, setCustomResult] = useState<any>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  if (!dilemma) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] text-slate-500 backdrop-blur-md">
        <Compass className="w-7 h-7 animate-spin text-indigo-400/80 mb-2" />
        <p className="text-xs uppercase font-sans font-medium text-slate-400">Đang điều phối bước ngoặt cuộc đời...</p>
      </div>
    );
  }

  const getRiskLabel = (risk: number) => {
    if (risk >= 65) return { text: `${risk}% rủi ro`, color: "text-rose-400 border-rose-500/30 bg-rose-500/10" };
    if (risk >= 35) return { text: `${risk}% rủi ro`, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
    return { text: `An toàn`, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
  };

  const displayTitle = characterAge
    ? dilemma.title.replace(/Tuổi \d+/i, `Tuổi ${characterAge}`)
    : dilemma.title;

  const handleSendCustomAction = async () => {
    if (!customActionText.trim() || isResolving || !onCustomResolve) return;
    if (actionPoints < 1) {
      setResolveError("Cần tối thiểu 1 Điểm Hành Động (AP) để thực hiện quyết định tự do!");
      return;
    }

    try {
      setIsResolving(true);
      setResolveError(null);
      const res = await onCustomResolve(customActionText);
      setCustomResult(res);
    } catch (err: any) {
      setResolveError(err.message || "Phán xử hành động thất bại.");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl relative overflow-hidden backdrop-blur-lg flex flex-col gap-3">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Biến Cố Cuộc Đời
          </span>
          {characterAge !== undefined && (
            <span className="text-xs font-mono font-bold text-amber-400">
              Năm {characterAge} Tuổi
            </span>
          )}
        </div>

        {/* Tab Switcher: Standard Options vs Open-Text AI */}
        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 text-[11px]">
          <button
            onClick={() => { setActiveTab('standard'); setCustomResult(null); }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              activeTab === 'standard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Lựa Chọn Nhanh
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition ${
              activeTab === 'custom'
                ? 'bg-purple-600 text-white shadow-sm font-bold'
                : 'text-purple-300 hover:text-purple-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Tự Do Hành Động</span>
          </button>
        </div>
      </div>

      {/* Atmospheric Title */}
      <h2 className="text-base md:text-lg font-bold text-white tracking-tight leading-snug">
        {displayTitle}
      </h2>

      {/* Narrative Text */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-slate-200 text-xs md:text-sm leading-relaxed font-serif italic">
        "{dilemma.narrative}"
      </div>

      {/* TAB 1: Standard Choice Buttons with Tooltips */}
      {activeTab === 'standard' && (
        <div className="space-y-2">
          {dilemma.options.map((option) => {
            const actionText = option.action_title || option.label || "Hành động";
            const consequence = option.consequence_hint || option.effects_hint || "Hệ quả sẽ được ghi nhận vào dòng thời gian.";
            const risk = getRiskLabel(option.risk_percent);
            const costAp = option.cost_ap !== undefined ? option.cost_ap : 1;
            const hasEnoughAP = actionPoints >= costAp;
            const isDisabled = !hasEnoughAP || isLoading;

            const isDestinyOption = costAp >= 3;
            const isBreakthroughOption = costAp === 2;

            let cardStyle = "bg-slate-950/60 hover:bg-slate-800/90 border-slate-800 hover:border-indigo-400/60";
            if (isDisabled) {
              cardStyle = "bg-slate-950/40 border-slate-800/40 opacity-40 cursor-not-allowed";
            } else if (isDestinyOption) {
              cardStyle = "bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-amber-950/50 hover:from-purple-900/70 hover:to-amber-900/60 border-amber-400/60";
            } else if (isBreakthroughOption) {
              cardStyle = "bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-slate-900/80 hover:from-amber-900/50 hover:to-slate-800/90 border-amber-500/50";
            }

            return (
              <div
                key={option.id}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${cardStyle}`}
              >
                {/* Left: Button Action Title & Consequence Hint */}
                <button
                  disabled={isDisabled}
                  onClick={() => onSelectOption(option.id)}
                  className="flex-1 text-left min-w-0 pr-2 group"
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isDestinyOption && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                        👑 Đổi Đời
                      </span>
                    )}
                    {isBreakthroughOption && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        🌟 Đột Phá
                      </span>
                    )}
                    <span className="text-xs md:text-sm font-bold text-white group-hover:text-indigo-200 transition truncate">
                      {actionText}
                    </span>
                  </div>
                  {consequence && (
                    <div className="text-[10.5px] text-slate-400 group-hover:text-slate-300 font-sans truncate mt-0.5">
                      ↳ {consequence}
                    </div>
                  )}
                </button>

                {/* Right: Info Tooltip + Risk Badge + AP Cost */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Consequence Tooltip */}
                  <Tooltip content={<div className="font-serif italic text-slate-300">{consequence}</div>}>
                    <button className="text-slate-500 hover:text-indigo-300 transition p-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>

                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${risk.color}`}>
                    {risk.text}
                  </span>

                  {/* Ẩn hoàn toàn pill 0 AP nếu không tốn AP */}
                  {costAp > 0 && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border ${
                      !hasEnoughAP
                        ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                        : isDestinyOption
                        ? 'bg-amber-500/20 border-amber-400/60 text-amber-300'
                        : 'bg-slate-900 border-slate-700 text-amber-400'
                    }`}>
                      <Zap className={`w-3 h-3 ${hasEnoughAP ? 'fill-current' : ''}`} />
                      {costAp} AP
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Open-Text Freeform AI Resolution */}
      {activeTab === 'custom' && (
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/40 flex flex-col gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Sinh mệnh nằm trong tay bạn. Bạn sẽ làm gì?
            </span>
            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
              <Zap className="w-3 h-3 fill-amber-400" /> Tiêu hao: 1 AP
            </span>
          </div>

          <textarea
            value={customActionText}
            onChange={(e) => setCustomActionText(e.target.value)}
            disabled={isResolving || !!customResult}
            rows={3}
            placeholder="Mô tả cụ thể hành động của bạn... (Ví dụ: Tôi tìm gặp chủ nợ, xin làm việc không công 6 tháng để trả dần tiền nợ, đồng thời nhờ người thân bảo lãnh...)"
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-purple-400 rounded-xl p-3 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none transition resize-none custom-scrollbar"
          />

          {resolveError && (
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{resolveError}</span>
            </div>
          )}

          {/* AI Resolution Result Card */}
          {customResult && (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/50 flex flex-col gap-2 animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {customResult.resolution_title}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Độ khả thi: {customResult.feasibility_score}%
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-serif italic">
                "{customResult.narrative}"
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-purple-500/20 text-[10px] font-mono flex-wrap">
                {customResult.effects?.cash_delta !== 0 && (
                  <span className={customResult.effects?.cash_delta > 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {customResult.effects?.cash_delta > 0 ? "+" : ""}{customResult.effects?.cash_delta} USD
                  </span>
                )}
                {customResult.effects?.vitality_delta !== 0 && (
                  <span className={customResult.effects?.vitality_delta > 0 ? "text-rose-300" : "text-rose-400 font-bold"}>
                    {customResult.effects?.vitality_delta > 0 ? "+" : ""}{customResult.effects?.vitality_delta} Sinh Lực
                  </span>
                )}
                {customResult.effects?.karma_delta !== 0 && (
                  <span className="text-purple-300 font-bold">
                    +{customResult.effects?.karma_delta} Karma
                  </span>
                )}
                {customResult.effects?.burnout_delta !== 0 && (
                  <span className={customResult.effects?.burnout_delta < 0 ? "text-teal-300" : "text-amber-400"}>
                    {customResult.effects?.burnout_delta > 0 ? "+" : ""}{customResult.effects?.burnout_delta} Burnout
                  </span>
                )}
              </div>
            </div>
          )}

          {!customResult && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 italic">
                Hệ thống AI Judge sẽ phán xét độ khả thi và tự động tính toán hệ quả thực tế.
              </span>
              <button
                disabled={!customActionText.trim() || isResolving || actionPoints < 1}
                onClick={handleSendCustomAction}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-md shadow-purple-600/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isResolving ? (
                  <>
                    <Compass className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Đang Phán Xử...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Hành Động (1 AP)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
