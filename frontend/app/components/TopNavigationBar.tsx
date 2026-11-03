'use client';

import React from 'react';
import {
  Compass,
  Users,
  Award,
  Menu as MenuIcon,
  Sparkles,
  RefreshCw,
  Flame,
  Volume2,
  VolumeX
} from 'lucide-react';

export type MainTabType = 'life' | 'relationships' | 'legacy' | 'menu';

interface TopNavigationBarProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  character: any;
  playerAccount?: any;
  aspiration?: any;
  onOpenRebirth?: () => void;
  isPlayingAudio?: boolean;
  onToggleAudio?: () => void;
}

export default function TopNavigationBar({
  activeTab,
  onTabChange,
  character,
  playerAccount,
  aspiration,
  onOpenRebirth,
  isPlayingAudio,
  onToggleAudio
}: TopNavigationBarProps) {
  const isDeceased = character?.is_deceased;
  const age = character?.age ?? 0;
  const name = character?.name || "Lữ khách";
  const city = character?.current_city || character?.nationality || "Việt Nam";

  // Stage display label according to Section 7 & 10
  const getStageBadge = (charAge: number) => {
    if (charAge < 6) return '0–5 tuổi · Ấu thơ';
    if (charAge < 18) return '6–17 tuổi · Trưởng thành';
    if (charAge < 60) return '18+ tuổi · Lập nghiệp';
    return 'Tuổi già · Di sản';
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-3 sm:px-5 py-2.5 flex items-center justify-between sticky top-0 z-40 gap-3 max-w-full">
      {/* 1. Left Brand & Main 4-Tab Navigation */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center font-black text-white text-xs shadow-md shadow-indigo-600/30 shrink-0">
            LG
          </div>
          <span className="font-bold text-white text-sm sm:text-base tracking-tight hidden sm:inline">
            LifeGraph RPG
          </span>
        </div>

        {/* 4 Main Tabs: Cuộc đời | Quan hệ | Di sản | Menu */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => onTabChange('life')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'life'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Cuộc đời</span>
          </button>

          <button
            onClick={() => onTabChange('relationships')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'relationships'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Quan hệ</span>
          </button>

          <button
            onClick={() => onTabChange('legacy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'legacy'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Di sản</span>
          </button>

          <button
            onClick={() => onTabChange('menu')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
              activeTab === 'menu'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Cài đặt hệ thống, âm thanh và hướng dẫn"
          >
            <MenuIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Menu</span>
          </button>
        </nav>
      </div>

      {/* 2. Center: Compact Status Identity (Single Source of Truth) */}
      <div className="flex-1 flex justify-center items-center min-w-0 px-2">
        {character && (
          <div className="flex items-center gap-2 max-w-full text-xs">
            <span className="font-bold text-white truncate">
              {name}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300 font-mono shrink-0">
              {age} tuổi
            </span>
            <span className="text-slate-500 hidden md:inline">·</span>
            <span className="text-slate-400 truncate hidden md:inline max-w-[120px]">
              {city}
            </span>
            <span className="hidden lg:inline text-slate-500">·</span>
            <span className="hidden lg:inline-flex text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-purple-300 font-medium">
              {getStageBadge(age)}
            </span>
          </div>
        )}
      </div>

      {/* 3. Right: Karma/Rebirth or Audio control */}
      <div className="flex items-center gap-2 shrink-0">
        {isDeceased ? (
          <button
            onClick={onOpenRebirth}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-current" />
            <span>Tái sinh</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {/* Karma quick indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Karma:</span>
              <span className="text-white font-bold">{playerAccount?.total_karma ?? character?.karma ?? 0}</span>
            </div>

            {/* Quick sound toggle */}
            {onToggleAudio && (
              <button
                onClick={onToggleAudio}
                className={`p-1.5 rounded-xl border transition ${
                  isPlayingAudio
                    ? 'bg-slate-900 border-indigo-500/50 text-indigo-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isPlayingAudio ? "Tắt âm thanh" : "Bật âm thanh"}
              >
                {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
