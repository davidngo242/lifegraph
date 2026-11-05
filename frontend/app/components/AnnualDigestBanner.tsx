'use client';

import React from 'react';
import { Newspaper, TrendingUp, TrendingDown, Gamepad2, ChevronRight, X, Sparkles, HeartHandshake } from 'lucide-react';
import { MiniGameType } from './minigames/MiniGameHostModal';
import { formatCurrency } from '../utils/currencyUtils';

export interface AnnualDigestData {
  age_reached: number;
  headline: string;
  cash_flow: {
    asset_yield: number;
    maintenance: number;
    family_cost: number;
    net_change: number;
  };
  family_events: string[];
  childhood_event?: {
    type: string;
    title: string;
    narrative: string;
    effects?: {
      cash_delta?: number;
      karma_delta?: number;
      vitality_delta?: number;
    };
    flag?: string;
  } | null;
  milestone_challenge?: {
    age: number;
    game_type: MiniGameType;
    title: string;
  } | null;
}

interface AnnualDigestBannerProps {
  digest?: AnnualDigestData | null;
  nationality?: string;
  onLaunchMiniGame: (gameType: MiniGameType) => void;
  onClose: () => void;
}

export default function AnnualDigestBanner({
  digest,
  nationality = "Việt Nam",
  onLaunchMiniGame,
  onClose
}: AnnualDigestBannerProps) {
  if (!digest) return null;

  const netChange = digest.cash_flow?.net_change || 0;
  const isPositiveFlow = netChange >= 0;
  const netFormatted = formatCurrency(netChange, nationality);

  return (
    <div className="w-full bg-gradient-to-br from-slate-900/95 via-indigo-950/60 to-slate-900/95 border border-indigo-500/40 rounded-2xl p-3 shadow-xl backdrop-blur-md relative overflow-hidden animate-in slide-in-from-top-1 duration-200 flex flex-col gap-2.5">
      {/* Top Header: Tag, Cash Flow & Close button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12px] font-sans tabular-nums normal-case px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold flex items-center gap-1 shrink-0">
            <Newspaper className="w-3 h-3 text-indigo-400" /> Điểm Tin {digest.age_reached}t
          </span>

          <div className="flex items-center gap-1 text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400">Dòng tiền:</span>
            <span className={`font-bold flex items-center gap-0.5 ${isPositiveFlow ? 'text-teal-300' : 'text-rose-400'}`}>
              {isPositiveFlow ? '+' : ''}{netFormatted.primary}
              {isPositiveFlow ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          title="Đóng điểm tin năm"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Headline */}
      <div className="text-xs font-bold text-white leading-snug">
        {digest.headline}
      </div>

      {/* Milestone Game Button */}
      {digest.milestone_challenge && (
        <button
          onClick={() => onLaunchMiniGame(digest.milestone_challenge!.game_type)}
          className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center justify-between transition active:scale-98 shadow-md"
        >
          <span className="flex items-center gap-1.5 truncate">
            <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Thử Thách ({digest.milestone_challenge.age}t): {digest.milestone_challenge.title}</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      )}

      {/* Childhood Passive Chronicle / Prodigy Event Strip */}
      {digest.childhood_event && (
        <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 bg-indigo-950/40 rounded-xl p-2 border border-indigo-500/20 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5 flex-wrap">
              <span>{digest.childhood_event.title}</span>
              {digest.childhood_event.effects?.cash_delta && (
                <span className="text-[12px] font-sans tabular-nums px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  +{digest.childhood_event.effects.cash_delta} USD
                </span>
              )}
              {digest.childhood_event.effects?.karma_delta && (
                <span className="text-[12px] font-sans tabular-nums px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  +{digest.childhood_event.effects.karma_delta} Karma
                </span>
              )}
            </div>
            <p className="text-[12px] text-slate-300 leading-snug mt-0.5">
              {digest.childhood_event.narrative}
            </p>
          </div>
        </div>
      )}

      {/* Additional Family Events if any and no duplicate with childhood */}
      {!digest.childhood_event && digest.family_events && digest.family_events.length > 0 && (
        <div className="pt-1.5 border-t border-slate-800/60 flex items-center gap-2 text-[12px] text-slate-300">
          <HeartHandshake className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span className="truncate">{digest.family_events[0]}</span>
        </div>
      )}
    </div>
  );
}

