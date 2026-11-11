'use client';

import React from 'react';
import { Newspaper, TrendingUp, TrendingDown, Gamepad2, ChevronRight, X, Sparkles, HeartHandshake } from 'lucide-react';
import { MiniGameType } from './minigames/MiniGameHostModal';
import { formatCurrency } from '../utils/currencyUtils';
import Tooltip from './Tooltip';

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
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3 shadow-xl backdrop-blur-md relative overflow-hidden animate-in slide-in-from-top-1 duration-200 flex flex-col gap-2.5 transition-colors">
      {/* Top Header: Tag, Cash Flow & Close button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12px] font-sans tabular-nums normal-case px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 shrink-0">
            <Newspaper className="w-3 h-3 text-amber-800 dark:text-amber-400" /> Điểm Tin {digest.age_reached}t
          </span>

          <div className="flex items-center gap-1 whitespace-nowrap shrink-0 text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
            <span className="text-[var(--text-secondary)]">Dòng tiền:</span>
            <span className={`font-bold flex items-center gap-0.5 whitespace-nowrap ${isPositiveFlow ? 'text-teal-700 dark:text-teal-300' : 'text-rose-700 dark:text-rose-400'}`}>
              {isPositiveFlow ? '+' : ''}{netFormatted.primary}
              {isPositiveFlow ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Đóng" className="p-1 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 inline-flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition shrink-0"
          title="Đóng điểm tin năm"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Headline */}
      <div className="text-xs font-bold text-[var(--text-primary)] leading-snug">
        {digest.headline}
      </div>

      {/* Milestone Game Button */}
      {digest.milestone_challenge && (
        <Tooltip
          content={
            <div className="space-y-0.5">
              <div className="font-bold text-amber-300">🎮 Thử Thách Cột Mốc ({digest.milestone_challenge.age} tuổi)</div>
              <div className="text-slate-200">{digest.milestone_challenge.title}</div>
            </div>
          }
          position="top"
          className="w-full"
        >
          <button
            onClick={() => onLaunchMiniGame(digest.milestone_challenge!.game_type)}
            className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center justify-between transition active:scale-98 shadow-md cursor-pointer"
          >
            <span className="flex items-center gap-1.5 min-w-0">
              <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
              <span className="text-left sm:truncate" title={digest.milestone_challenge.title}>Thử Thách ({digest.milestone_challenge.age}t): {digest.milestone_challenge.title}</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 ml-1" />
          </button>
        </Tooltip>
      )}

      {/* Childhood Passive Chronicle / Prodigy Event Strip */}
      {digest.childhood_event && (
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-start gap-2 bg-[var(--bg-card-subtle)] rounded-xl p-2 border border-[var(--border-subtle)] text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 flex-wrap">
              <span>{digest.childhood_event.title}</span>
              {digest.childhood_event.effects?.cash_delta && (
                <span className="text-[12px] font-sans tabular-nums px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                  +{digest.childhood_event.effects.cash_delta} USD
                </span>
              )}
              {digest.childhood_event.effects?.karma_delta && (
                <span className="text-[12px] font-sans tabular-nums px-1 py-0.2 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold">
                  +{digest.childhood_event.effects.karma_delta} Karma
                </span>
              )}
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] leading-snug mt-0.5">
              {digest.childhood_event.narrative}
            </p>
          </div>
        </div>
      )}

      {/* Additional Family Events if any and no duplicate with childhood */}
      {!digest.childhood_event && digest.family_events && digest.family_events.length > 0 && (
        <Tooltip
          content={
            <div className="text-[var(--text-secondary)] text-xs leading-relaxed">
              {digest.family_events[0]}
            </div>
          }
          position="top"
          className="w-full"
        >
          <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center gap-2 text-[12px] text-[var(--text-secondary)] cursor-help">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{digest.family_events[0]}</span>
          </div>
        </Tooltip>
      )}
    </div>
  );
}
