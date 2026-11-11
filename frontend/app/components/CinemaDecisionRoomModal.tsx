'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, Film, Sparkles, Compass, Clapperboard, MousePointerClick } from 'lucide-react';
import InteractiveScene2D from './InteractiveScene2D';
import Tooltip from './Tooltip';

interface CinemaDecisionRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  character?: any;
  onScenarioResolved?: (result: any) => void;
  onAdvanceYear?: () => void;
  activeScenario?: any;
}

export default function CinemaDecisionRoomModal({
  isOpen,
  onClose,
  character,
  onScenarioResolved,
  onAdvanceYear,
  activeScenario
}: CinemaDecisionRoomModalProps) {
  if (!isOpen) return null;

  const age = character?.age ?? 25;
  const currentCity = character?.current_city || character?.nationality || "Việt Nam";
  const scenarioTitle = activeScenario?.title || "Phòng Ra Quyết Định · Không Gian Đối Thoại Vận Mệnh";
  const scenarioDesc = activeScenario?.description || "Mỗi ngã rẽ cuộc đời là một thước phim bất khả hồi... Manh mối quá khứ đang soi tỏ bước ngoặt tương lai.";

  const isCrisisScenario = 
    /fever|river|crisis|sinh tử|nguy cấp|đuối nước|cứu hộ/i.test(activeScenario?.id || '') ||
    /fever|river|crisis|sinh tử|nguy cấp|đuối nước|cứu hộ/i.test(activeScenario?.title || '') ||
    /fever|river|crisis|sinh tử|nguy cấp|đuối nước|cứu hộ/i.test(activeScenario?.arc_id || '');

  const modal = (
    <div className="fixed inset-0 z-[60] bg-[var(--bg-canvas)] flex flex-col justify-between overflow-hidden animate-in fade-in duration-300 select-none">
      {/* =========================================================================
          1. TOP CINEMATIC 21:9 LETTERBOX BAR (Hollywood Production Header)
          ========================================================================= */}
      <div className={`relative z-30 ${isCrisisScenario ? 'bg-rose-100 dark:bg-rose-950/40 border-b border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-[var(--bg-header)]/95 border-b border-[var(--border-subtle)]'} backdrop-blur-xl text-[var(--text-primary)] shadow-2xl shrink-0 flex flex-col transition-colors duration-300`}>
        {/* Vintage 35mm Film Reel Perforations Strip */}
        <div className="w-full flex items-center justify-between overflow-hidden opacity-40 py-1 px-2 border-b border-white/5 bg-black/20">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-1 sm:w-3 sm:h-1.5 rounded-[1.5px] bg-black/90 border border-white/10 shrink-0 mx-1 shadow-inner"
            />
          ))}
        </div>

        {/* Main Header Content */}
        <div className="h-14 sm:h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Left: Live Take Indicator & Scenario Title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            {/* Live Camera Recording or Emergency Crisis Badge */}
            {isCrisisScenario ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-700 dark:bg-rose-900/90 border border-rose-400 text-white text-xs font-mono font-bold shadow-[0_0_18px_rgba(244,63,94,0.5)] shrink-0 animate-pulse">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-400 shadow-[0_0_8px_#f43f5e]"></span>
                </span>
                <span className="tracking-wider uppercase font-black text-xs sm:text-xs text-white hidden sm:inline">
                  🚨 TÌNH HUỐNG SINH TỬ NGUY CẤP
                </span>
                <span className="tracking-wider uppercase font-black text-xs text-white sm:hidden">
                  🚨 SINH TỬ
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 dark:bg-rose-950/70 border border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold shadow-[0_0_15px_rgba(244,63,94,0.2)] shrink-0">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
                </span>
                <span className="tracking-widest uppercase font-extrabold text-xs sm:text-xs text-rose-800 dark:text-rose-300 hidden sm:inline">
                  CINEMA 21:9 · LIVE TAKE
                </span>
                <span className="tracking-widest uppercase font-extrabold text-xs text-rose-800 dark:text-rose-300 sm:hidden">
                  21:9
                </span>
              </div>
            )}

            <div className="hidden sm:block h-5 w-px bg-[var(--border-subtle)]" />

            {/* Scenario Title with Artistic Serif & Age Badge */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Tooltip content={scenarioTitle} className="min-w-0">
                <h3 className="font-serif text-xs sm:text-base font-semibold text-[var(--text-primary)] tracking-wide italic leading-tight line-clamp-2 sm:truncate drop-shadow cursor-help">
                  {scenarioTitle}
                </h3>
              </Tooltip>
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs font-sans font-bold text-amber-800 dark:text-amber-300 shrink-0">
                <Sparkles className="w-3 h-3 text-amber-800 dark:text-amber-400" />
                <span>Tuổi {age}</span>
                <span className="text-[var(--text-secondary)]">•</span>
                <Tooltip content={`Đô thị hiện tại: ${currentCity}`}>
                  <span className="text-[var(--text-secondary)] font-normal truncate max-w-[120px] cursor-help">{currentCity}</span>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Right: Return to Cockpit Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-[var(--bg-card-subtle)] hover:bg-[rgba(255,255,255,0.08)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-highlight)] text-xs font-bold flex items-center gap-2 transition active:scale-95 shadow-lg group"
            >
              <ChevronLeft className="w-4 h-4 text-sky-700 dark:text-sky-400 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Trở Về Cockpit</span>
              <span className="sm:hidden">Cockpit</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] group-hover:text-amber-300 transition">
                Esc
              </kbd>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MAIN CINEMATIC VIEWPORT STAGE (Anamorphic Lens & 3D Interactive World)
          ========================================================================= */}
      <div className="flex-1 relative w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-canvas)]">
        {/* Anamorphic Lens Flare Overlay Effects (Top Left Cyan & Top Right Amber) */}
        <div className="absolute top-0 left-0 w-80 sm:w-96 h-28 sm:h-36 bg-gradient-to-br from-cyan-500/15 via-sky-400/5 to-transparent blur-3xl pointer-events-none z-10" />
        <div className="absolute top-1 left-6 w-56 sm:w-72 h-[1.5px] bg-gradient-to-r from-cyan-400/60 via-sky-300/30 to-transparent blur-[0.5px] pointer-events-none z-10" />

        <div className="absolute top-0 right-0 w-80 sm:w-96 h-28 sm:h-36 bg-gradient-to-bl from-amber-500/15 via-yellow-400/5 to-transparent blur-3xl pointer-events-none z-10" />
        <div className="absolute top-1 right-6 w-56 sm:w-72 h-[1.5px] bg-gradient-to-l from-amber-400/60 via-yellow-300/30 to-transparent blur-[0.5px] pointer-events-none z-10" />

        {/* Cinematic Vignette Overlay (Dark edges drawing focus to center stage) */}
        <div
          className="absolute inset-0 pointer-events-none z-20 opacity-0 dark:opacity-100"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.45) 85%, rgba(0, 0, 0, 0.82) 100%)'
          }}
        />

        {/* Stage Content */}
        <div className="relative z-10 max-w-6xl mx-auto p-2 sm:p-4 h-full flex flex-col justify-center">
          <InteractiveScene2D
            character={character}
            onScenarioResolved={(res) => {
              if (onScenarioResolved) onScenarioResolved(res);
            }}
            onAdvanceYear={onAdvanceYear}
            onBackToCockpit={onClose}
          />
        </div>
      </div>

      {/* =========================================================================
          3. BOTTOM CINEMATIC 21:9 LETTERBOX BAR (Director Subtitles & Key Hints)
          ========================================================================= */}
      <div className="relative z-30 bg-[var(--bg-header)]/95 backdrop-blur-xl border-t border-[var(--border-subtle)] text-[var(--text-primary)] shadow-2xl shrink-0 flex flex-col transition-colors duration-200">
        {/* Main Footer Content */}
        <div className="py-2 sm:py-2.5 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          {/* Left / Center: Dramatic Director Subtitle Ticker */}
          <div className="flex items-center gap-2.5 text-center sm:text-left min-w-0 max-w-2xl">
            <Clapperboard className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400 shrink-0 hidden sm:block" />
            <p className="font-serif italic text-xs sm:text-[13px] text-[var(--text-primary)]/90 tracking-wide line-clamp-1">
              "{scenarioDesc}"
            </p>
          </div>

          {/* Right: Intuitive Keyboard Shortcuts & Hotkey Badges */}
          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-sans shrink-0">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-sky-800 dark:text-sky-300 font-bold">
                Esc
              </kbd>
              <span className="hidden sm:inline">Cockpit</span>
            </span>

            <span className="text-[var(--border-subtle)]">•</span>

            <span className="flex items-center gap-1">
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-amber-800 dark:text-amber-300 font-bold">
                <MousePointerClick className="w-3 h-3 text-amber-800 dark:text-amber-400" />
                <span>Hotspot</span>
              </span>
              <span className="hidden md:inline">Manh Mối</span>
            </span>

            <span className="text-[var(--border-subtle)]">•</span>

            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-emerald-800 dark:text-emerald-300 font-bold">
                1, 2, 3
              </kbd>
              <span className="hidden sm:inline">Ngã Rẽ</span>
            </span>
          </div>
        </div>

        {/* Vintage 35mm Film Reel Perforations Strip at Bottom Edge */}
        <div className="w-full flex items-center justify-between overflow-hidden opacity-40 py-1 px-2 border-t border-white/5 bg-black/20">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-1 sm:w-3 sm:h-1.5 rounded-[1.5px] bg-black/90 border border-white/10 shrink-0 mx-1 shadow-inner"
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Render qua portal để thoát khỏi stacking-context của <main> (z-10), nếu không header sticky z-50 sẽ đè lên modal.
  if (typeof document === 'undefined') return modal;
  return createPortal(modal, document.body);
}
