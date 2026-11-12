'use client';

import React from 'react';
import {
  Keyboard,
  Eye,
  EyeOff,
  Film,
  BookOpen,
  Volume2,
  VolumeX,
  AlertTriangle,
  HeartPulse,
  Flame,
  Zap,
  Sparkles,
  Command
} from 'lucide-react';
import Tooltip from './Tooltip';

interface CommandBarHUDProps {
  activeView: 'home' | 'game' | 'lineage';
  onToggleQuickView: () => void;
  vitality: number;
  burnout: number;
  actionPoints: number;
  onEmergencyRescue: () => void;
  onOpenCinema: () => void;
  onOpenGuide: () => void;
  onOpenShortcutsHelp: () => void;
  isLoading?: boolean;
}

export default function CommandBarHUD({
  activeView,
  onToggleQuickView,
  vitality,
  burnout,
  actionPoints,
  onEmergencyRescue,
  onOpenCinema,
  onOpenGuide,
  onOpenShortcutsHelp,
  isLoading = false
}: CommandBarHUDProps) {
  const isEmergency = vitality < 30 || burnout > 75;

  return (
    <div className="w-full bg-[var(--bg-card)] backdrop-blur-md border-b border-[var(--border-subtle)] text-[var(--text-primary)] px-3 sm:px-4 md:px-6 py-1.5 sticky top-[53px] z-40 transition-all duration-200">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-2.5 flex-wrap">
        {/* Left: Quick View Toggle & Cinema Mode */}
        <div className="flex items-center gap-2">
          {/* Nút bật tắt chế độ xem nhanh */}
          <Tooltip
            position="bottom"
            content={
              <div className="p-0.5">
                <div className="font-bold text-sky-800 dark:text-sky-300 text-xs">
                  {activeView === 'game' ? 'Chuyển sang Xem Nhanh Gia Phả' : 'Chuyển sang Buồng Lái Kiếp Sống'}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Bật/tắt nhanh giữa góc nhìn buồng lái RPG và cây gia phả tiền nhân.
                </div>
              </div>
            }
          >
            <button
              onClick={onToggleQuickView}
              disabled={isLoading}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition active:scale-95 ${
                activeView === 'game'
                  ? 'bg-[var(--bg-card-subtle)] hover:bg-[rgba(255,255,255,0.06)] border-[var(--border-subtle)] text-sky-800 dark:text-sky-300 hover:text-[var(--text-primary)]'
                  : 'bg-sky-500/20 dark:bg-sky-600/30 border-sky-600/50 dark:border-sky-400/50 text-sky-900 dark:text-sky-200 hover:bg-sky-500/30 dark:hover:bg-sky-600/40'
              }`}
            >
              {activeView === 'game' ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
                  <span className="hidden sm:inline">Chế Độ Xem Nhanh</span>
                  <span className="sm:hidden">Xem Nhanh</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-sky-700 dark:text-sky-300" />
                  <span>Về Buồng Lái</span>
                </>
              )}
            </button>
          </Tooltip>

          {/* Phòng Điện Ảnh 21:9 */}
          <Tooltip
            position="bottom"
            content={
              <div className="p-0.5">
                <div className="font-bold text-amber-800 dark:text-amber-300 text-xs flex items-center gap-1">
                  <span>🎬 Phòng Quyết Định 21:9</span>
                  <kbd className="px-1 py-0.5 rounded bg-[var(--bg-card)] text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)]">[D]</kbd>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Mở không gian đối diện ngã rẽ cuộc đời ở định dạng điện ảnh toàn cảnh 21:9.
                </div>
              </div>
            }
          >
            <button
              onClick={onOpenCinema}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] hover:bg-[rgba(255,255,255,0.06)] text-[var(--text-primary)] transition active:scale-95"
            >
              <Film className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">Phòng Điện Ảnh</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-amber-800 dark:text-amber-400 font-bold">
                D
              </kbd>
            </button>
          </Tooltip>
        </div>

        {/* Center: Keyboard Shortcuts Badges & Cheat-sheet Button */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Trợ giúp phím tắt button with key badges */}
          <button
            onClick={onOpenShortcutsHelp}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[rgba(255,255,255,0.06)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs transition active:scale-95 group shadow-sm"
          >
            <Keyboard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-800 dark:group-hover:text-indigo-300" />
            <span className="font-medium text-xs hidden lg:inline">Phím Tắt:</span>

            {/* Badges [1], [2], [3], [Space] */}
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-0.5">
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-amber-800 dark:text-amber-300 font-bold group-hover:border-amber-400/60 shadow-sm">
                  1
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-amber-800 dark:text-amber-300 font-bold group-hover:border-amber-400/60 shadow-sm">
                  2
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-amber-800 dark:text-amber-300 font-bold group-hover:border-amber-400/60 shadow-sm">
                  3
                </kbd>
                <span className="text-xs text-[var(--text-secondary)] hidden xl:inline ml-0.5">Chọn Ngã Rẽ</span>
              </span>

              <span className="text-slate-500 hidden sm:inline">|</span>

              <span className="flex items-center gap-1">
                <kbd className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-emerald-800 dark:text-emerald-300 font-bold group-hover:border-emerald-400/60 shadow-sm">
                  Space
                </kbd>
                <span className="text-xs text-[var(--text-secondary)] hidden xl:inline">Sang Năm</span>
              </span>
            </div>

            <span className="text-xs font-mono px-1 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 ml-1">
              ?
            </span>
          </button>
        </div>

        {/* Right: Emergency SOS Button (Shown when Vitality < 30 or Burnout > 75) */}
        <div className="flex items-center gap-2">
          {isEmergency && (
            <Tooltip
              position="bottom"
              content={
                <div className="p-0.5 max-w-xs">
                  <div className="font-bold text-rose-800 dark:text-rose-300 text-xs flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
                    <span>Cảnh Báo Nguy Kịch Sinh Tồn</span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                    {vitality < 30 && (
                      <div className="text-rose-700 dark:text-rose-400 font-semibold">
                        • Sinh Lực cực thấp ({vitality}%): Nguy cơ tử vong cao!
                      </div>
                    )}
                    {burnout > 75 && (
                      <div className="text-amber-800 dark:text-amber-400 font-semibold">
                        • Kiệt Sức báo động ({burnout}%): Tinh thần suy sụp!
                      </div>
                    )}
                    <div className="mt-1 text-slate-700 dark:text-slate-300">
                      Bấm để mở phương án Dưỡng Sinh hoặc Thỉnh Phước bảo mạng ngay lập tức.
                    </div>
                  </div>
                </div>
              }
            >
              <button
                onClick={onEmergencyRescue}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-rose-950/60 animate-pulse border border-rose-400"
              >
                <HeartPulse className="w-3.5 h-3.5 animate-bounce" />
                <span className="tracking-wide">CẤP CỨU KHẨN CẤP</span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-200 border border-rose-400/50">
                  {vitality < 30 ? `HP ${vitality}%` : `Burnout ${burnout}%`}
                </span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
