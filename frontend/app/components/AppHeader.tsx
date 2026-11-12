'use client';

import React, { useState, useEffect } from 'react';
import { Home, Play, Sparkles } from 'lucide-react';
import Tooltip from './Tooltip';
import HeaderMacroWeather from './HeaderMacroWeather';
import UnifiedNotificationCenter from './UnifiedNotificationCenter';
import SystemSettingsPopover from './SystemSettingsPopover';
import AccountModal from './AccountModal';
import { useAccount } from '../hooks/useAccount';

// Slim top navigation (extracted from page.tsx)
export default function AppHeader(props: any) {
  const {
    character, playerAccount, activeView, setActiveView, setShowRebirthModal, setShowKarmaModal,
    emergencyAlerts, handleDismissAlert, activeScenario, dilemma, setShowCinemaDecisionModal,
    setShowEmergencyModal, handleWellness, setShowAssetModal, isPlayingAudio, toggleAudio, audioRef,
    setShowGuideModal, setShowShortcutsModal,
  } = props;
  const account = useAccount();
  const [showAccountModal, setShowAccountModal] = useState(false);
  useEffect(() => { // cho phép Bia Tưởng Niệm chung (khách) mở hộp thoại tài khoản
    const open = () => setShowAccountModal(true);
    window.addEventListener('lifegraph:open-account', open);
    return () => window.removeEventListener('lifegraph:open-account', open);
  }, []);
  return (
  <>
  <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md px-2 sm:px-4 md:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 gap-1.5 sm:gap-3 max-w-full overflow-visible transition-colors duration-250">
    {/* 1. Left Zone: Brand Logo & View Switcher Tabs (Đẩy sát sang trái) */}
    <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink-0 sm:shrink">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-emerald-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shadow-amber-500/25 shrink-0">
          LG
        </div>
        <span className="font-extrabold text-[var(--text-primary)] text-sm md:text-base tracking-tight hidden sm:inline">
          LifeGraph 2.0
        </span>
      </div>

      {/* View Switcher Pills */}
      <div className="flex items-center gap-1 bg-[var(--bg-card-subtle)] p-1 rounded-2xl border border-[var(--border-subtle)] shrink-0 sm:shrink">
        <Tooltip
          position="bottom"
          content="Đại sảnh gia phả tiền nhân"
        >
          <button
            onClick={() => setActiveView('home')}
            className={`min-w-[44px] sm:min-w-0 min-h-[44px] sm:min-h-0 justify-center px-2 sm:px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeView === 'home'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold shadow-md shadow-slate-900/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden lg:inline whitespace-nowrap">Trang Chủ</span>
          </button>
        </Tooltip>

        {character && !character.is_deceased ? (
          <Tooltip
            position="bottom"
            content="Bảng điều khiển kiếp sống hiện tại"
          >
            <button
              onClick={() => setActiveView('game')}
              className={`min-w-[44px] sm:min-w-0 min-h-[44px] sm:min-h-0 justify-center px-2 sm:px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'game'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold shadow-md shadow-slate-900/20'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden lg:inline whitespace-nowrap">Hành Trình</span>
            </button>
          </Tooltip>
        ) : (
          <Tooltip
            position="bottom"
            content="Khởi tạo kiếp sống mới"
          >
            <button
              onClick={() => setShowRebirthModal(true)}
              className={`min-w-[44px] sm:min-w-0 min-h-[44px] sm:min-h-0 justify-center px-2 sm:px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'home'
                  ? 'text-[var(--text-secondary)] hover:text-amber-500 hover:bg-[rgba(255,255,255,0.04)]'
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-slate-950 font-black shadow-md shadow-amber-500/25 hover:opacity-95'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden lg:inline whitespace-nowrap">Tái Sinh</span>
            </button>
          </Tooltip>
        )}
      </div>
    </div>

    {/* 2. Center: Integrated World Weather & Macro Equilibrium HUD */}
    <HeaderMacroWeather
      currentCity={character?.current_city || "Hà Nội"}
      countryName={character?.nationality || "Việt Nam"}
      countryTier={character?.country_tier || "T2"}
    />

    {/* 3. Right Zone: Consolidated Quick Hub (Đền Thờ · Thông Báo · Thiết Lập) */}
    <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink-0 sm:shrink">
      {/* Đền Thờ Nghiệp Quả (Karma Sanctum) */}
      <Tooltip
        position="bottom"
        content="Đền Thờ Nghiệp Quả - Thỉnh phước bảo mạng"
      >
        <button
          onClick={() => setShowKarmaModal(true)}
          className="py-1 px-2.5 sm:px-3 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-400 text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300 fill-amber-400/30 hidden sm:block" />
          <span className="hidden lg:inline whitespace-nowrap">Đền Thờ</span>
          <span className="text-xs font-mono font-bold whitespace-nowrap text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30">
            {playerAccount?.total_karma || 0}
          </span>
        </button>
      </Tooltip>

      {/* Unified Notification Center (Gom SOS, Biến cố 21:9 & Cảnh báo) */}
      <UnifiedNotificationCenter
        alerts={emergencyAlerts}
        onDismiss={handleDismissAlert}
        activeScenario={activeScenario}
        dilemma={dilemma}
        onOpenCinema={() => setShowCinemaDecisionModal(true)}
        onEmergencyRescue={() => setShowEmergencyModal(true)}
        onWellness={handleWellness}
        onOpenAssets={() => setShowAssetModal(true)}
        character={character}
      />

      {/* Unified System Settings Popover (Gom Giao diện Theme, Âm thanh & Cẩm nang [?]) */}
      <SystemSettingsPopover
        isPlayingAudio={isPlayingAudio}
        onTogglePlayAudio={toggleAudio}
        audioRef={audioRef}
        onOpenGuide={() => setShowGuideModal(true)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        username={account.username}
        onOpenAccount={() => setShowAccountModal(true)}
        onLogout={account.logout}
      />
    </div>
  </header>
  <AccountModal
    isOpen={showAccountModal}
    onClose={() => setShowAccountModal(false)}
    hasGuestCharacter={!!character && !account.username}
    onSubmit={account.submit}
    onResolveConflict={account.resolveConflict}
    onCancelConflict={account.cancelConflict}
  />
  </>
  );
}
