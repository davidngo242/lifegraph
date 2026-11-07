'use client';

import React from 'react';
import {
  BookOpen,
  History,
  Target,
  Sparkles,
  Milestone
} from 'lucide-react';
import NarrativeFeed from './NarrativeFeed';
import Tooltip from './Tooltip';

interface MultiTabSidebarProps {
  character: any;
  visuals?: any;
  playerAccount?: any;
  netWorth: number;
  aspiration?: any;
  annualDigest?: any;
  history: any[];
  assets?: any[];
  relationships?: any[];
  onOpenAssets: () => void;
  onOpenFamily: () => void;
  onOpenKarmaSanctum: () => void;
  onOpenAspirationUpgrade?: () => void;
  onFamilyMeal?: () => void;
  onFamilyMentorship?: () => void;
  onHealthCheckup?: () => void;
  onLaunchMiniGame?: (type: any) => void;
  onUnlockSkill?: (skillId: string) => Promise<void>;
  onNpcInteract?: (npcId: string, actionType: 'socialize' | 'gift' | 'request_favor') => Promise<void>;
  isLoading?: boolean;
}

export default function MultiTabSidebar({
  character,
  annualDigest,
  history = [],
  assets = [],
  relationships = [],
  onOpenAssets,
  onOpenFamily,
  onLaunchMiniGame,
  isLoading = false
}: MultiTabSidebarProps) {
  if (!character) return null;

  const age = character.age ?? 0;
  const nationality = character.nationality || "Việt Nam";

  return (
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-3 md:p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6.5rem)] overflow-hidden transition-colors duration-200">
      
      {/* Streamlined Life Chronicle Header Bar (Zero Duplicate Tabs) */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] shadow-inner shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
            <BookOpen className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                Nhật Ký Hành Trình Cuộc Đời
              </h4>
              {history.length > 0 && (
                <span className="text-[10px] font-sans tabular-nums px-2 py-0.2 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 font-bold shrink-0">
                  {history.length} sự kiện
                </span>
              )}
            </div>
            <p className="text-[10.5px] text-[var(--text-secondary)] truncate">
              Dòng chảy sự kiện, bước ngoặt &amp; biến cố thường niên
            </p>
          </div>
        </div>
      </div>

      {/* Dedicated Story & Event Stream Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5 space-y-3 min-h-[320px]">
        <NarrativeFeed
          history={history}
          assets={assets}
          relationships={relationships}
          currentAge={age}
          annualDigest={annualDigest}
          nationality={nationality}
          onLaunchMiniGame={onLaunchMiniGame}
          onOpenAssets={onOpenAssets}
          onOpenFamily={onOpenFamily}
        />
      </div>
    </div>
  );
}
