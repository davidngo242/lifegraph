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
    <div className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 md:px-6 py-1.5 sticky top-[53px] z-40 transition-all duration-300">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-2.5 flex-wrap">
        {/* Left: Quick View Toggle & Cinema Mode */}
        <div className="flex items-center gap-2">
          {/* Nút bật tắt chế độ xem nhanh */}
          <Tooltip
            position="bottom"
            content={
              <div className="p-0.5">
                <div className="font-bold text-sky-300 text-xs">
                  {activeView === 'game' ? 'Chuyển sang Xem Nhanh Gia Phả' : 'Chuyển sang Buồng Lái Kiếp Sống'}
                </div>
                <div className="text-[11px] text-slate-300">
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
                  ? 'bg-slate-950/80 hover:bg-slate-800 border-slate-700/80 text-sky-300 hover:text-white'
                  : 'bg-sky-600/30 border-sky-400/50 text-sky-200 hover:bg-sky-600/40'
              }`}
            >
              {activeView === 'game' ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Chế Độ Xem Nhanh</span>
                  <span className="sm:hidden">Xem Nhanh</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-sky-300" />
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
                <div className="font-bold text-purple-300 text-xs flex items-center gap-1">
                  <span>🎬 Phòng Quyết Định 21:9</span>
                  <kbd className="px-1 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300">[D]</kbd>
                </div>
                <div className="text-[11px] text-slate-300">
                  Mở không gian đối diện ngã rẽ cuộc đời ở định dạng điện ảnh toàn cảnh 21:9.
                </div>
              </div>
            }
          >
            <button
              onClick={onOpenCinema}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/50 text-purple-200 hover:text-white transition active:scale-95"
            >
              <Film className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden md:inline">Phòng Điện Ảnh</span>
              <kbd className="px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-500/40 text-[10px] font-mono text-purple-300 font-bold">
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs transition active:scale-95 group shadow-sm"
          >
            <Keyboard className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />
            <span className="font-medium text-xs hidden lg:inline">Phím Tắt:</span>

            {/* Badges [1], [2], [3], [Space] */}
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-0.5">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-amber-300 font-bold group-hover:border-amber-400/60 shadow-sm">
                  1
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-amber-300 font-bold group-hover:border-amber-400/60 shadow-sm">
                  2
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-amber-300 font-bold group-hover:border-amber-400/60 shadow-sm">
                  3
                </kbd>
                <span className="text-[10px] text-slate-400 hidden xl:inline ml-0.5">Chọn Ngã Rẽ</span>
              </span>

              <span className="text-slate-600 hidden sm:inline">|</span>

              <span className="flex items-center gap-1">
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-emerald-300 font-bold group-hover:border-emerald-400/60 shadow-sm">
                  Space
                </kbd>
                <span className="text-[10px] text-slate-400 hidden xl:inline">Sang Năm</span>
              </span>
            </div>

            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 ml-1">
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
                  <div className="font-bold text-rose-300 text-xs flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    <span>Cảnh Báo Nguy Kịch Sinh Tồn</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    {vitality < 30 && (
                      <div className="text-rose-400 font-semibold">
                        • Sinh Lực cực thấp ({vitality}%): Nguy cơ tử vong cao!
                      </div>
                    )}
                    {burnout > 75 && (
                      <div className="text-amber-400 font-semibold">
                        • Kiệt Sức báo động ({burnout}%): Tinh thần suy sụp!
                      </div>
                    )}
                    <div className="mt-1 text-slate-300">
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
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-200 border border-rose-400/50">
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
