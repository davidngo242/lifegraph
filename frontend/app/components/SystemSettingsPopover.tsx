'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Settings, Volume2, VolumeX, Music, BookOpen, Keyboard, X, Check, UserRound, LogOut } from 'lucide-react';
import Tooltip from './Tooltip';
import type { GameTheme } from './ThemeSwitcher';

interface SystemSettingsPopoverProps {
  isPlayingAudio: boolean;
  onTogglePlayAudio: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  onOpenGuide: () => void;
  onOpenShortcuts: () => void;
  username?: string;
  onOpenAccount: () => void;
  onLogout: () => void;
}

interface ThemeItem {
  id: GameTheme;
  label: string;
  icon: string;
  desc: string;
}

const THEMES: ThemeItem[] = [
  { id: 'daylight', label: 'Ban Ngày', icon: '☀️', desc: 'Sáng ngà thanh lịch, dịu mắt ban ngày' },
  { id: 'obsidian', label: 'Obsidian', icon: '🌙', desc: 'Than chì ấm sâu, chống mỏi mắt' },
  { id: 'sepia', label: 'Sepia', icon: '📜', desc: 'Giấy ngà ấm, chữ nâu đậm, đọc lâu dịu mắt' },
  { id: 'cyberpunk', label: 'Cyber', icon: '⚡', desc: 'Neon tương phản cao huyền bí' },
];

export default function SystemSettingsPopover({
  isPlayingAudio,
  onTogglePlayAudio,
  audioRef,
  onOpenGuide,
  onOpenShortcuts,
  username,
  onOpenAccount,
  onLogout
}: SystemSettingsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<GameTheme>('daylight');
  const [volume, setVolume] = useState<number>(35);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Load initial theme from localStorage
  useEffect(() => {
    try {
      const saved = (localStorage.getItem('lifegraph_theme') as GameTheme) || 'daylight';
      if (['daylight', 'obsidian', 'sepia', 'cyberpunk'].includes(saved)) {
        setCurrentTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
      }
    } catch {
      // Fallback
    }
  }, []);

  // Sync initial audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [audioRef]);

  // Click outside and escape key handling
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectTheme = (newTheme: GameTheme) => {
    setCurrentTheme(newTheme);
    try {
      localStorage.setItem('lifegraph_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    } catch (e) {
      console.warn('Failed to persist theme', e);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <Tooltip position="bottom" content={isOpen ? null : "Thiết lập giao diện, âm thanh & trợ giúp (⚙️)"}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Cài đặt hệ thống"
          className={`min-w-[44px] min-h-[44px] py-1 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm ${
            isOpen
              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/60 shadow-amber-500/10'
              : 'bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Settings className={`w-3.5 h-3.5 ${isOpen ? 'rotate-45 text-amber-700 dark:text-amber-500' : ''} transition-transform duration-200`} />
          <span className="hidden sm:inline font-medium">Thiết Lập</span>
        </button>
      </Tooltip>

      {/* Flyout Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[var(--bg-popover)] border border-[var(--border-highlight)] ring-1 ring-black/10 shadow-2xl shadow-black/40 p-4 z-[120] isolate max-h-[calc(100dvh-5rem)] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4 text-[var(--text-primary)]">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-400">
                <Settings className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Thiết Lập Trò Chơi
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 inline-flex items-center justify-center shrink-0" aria-label="Đóng thiết lập"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 0. Account */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Tài khoản
            </div>
            {username ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 flex items-center gap-1.5 p-2 min-h-[44px] rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)]">
                  <UserRound className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500 shrink-0" />
                  <span className="truncate">{username}</span>
                </div>
                <button
                  onClick={() => { setIsOpen(false); onLogout(); }}
                  className="p-2 min-h-[44px] rounded-xl bg-[var(--bg-card-subtle)] hover:bg-rose-500/15 border border-[var(--border-subtle)] hover:border-rose-500/40 text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400 shrink-0" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsOpen(false); onOpenAccount(); }}
                className="w-full p-2 min-h-[44px] rounded-xl bg-[var(--bg-card-subtle)] hover:bg-amber-500/15 border border-[var(--border-subtle)] hover:border-amber-500/40 text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition"
              >
                <UserRound className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500 shrink-0" />
                <span className="truncate">Tài khoản · Đăng nhập / Đăng ký</span>
              </button>
            )}
          </div>

          {/* 1. Theme Selection */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Giao Diện Thị Giác
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {THEMES.map((t) => {
                const isActive = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    className={`p-2 min-h-[44px] sm:min-h-0 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-800 dark:text-amber-300 font-bold shadow-sm'
                        : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="select-none">{t.icon}</span>
                      <span>{t.label}</span>
                    </span>
                    {isActive && <Check className="w-3 h-3 text-amber-700 dark:text-amber-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Audio & Volume Controls */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Âm Thanh & Nhạc Nền
              </span>
              <kbd className="text-xs font-mono px-1.5 py-0.5 rounded bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                Phím M
              </kbd>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
              <button
                onClick={onTogglePlayAudio}
                className="p-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 inline-flex items-center justify-center rounded-lg bg-[var(--bg-card)] hover:bg-amber-500/15 text-[var(--text-primary)] border border-[var(--border-subtle)] transition shrink-0"
              >
                {isPlayingAudio ? (
                  <Volume2 className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[var(--text-secondary)]" />
                )}
              </button>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-label="Âm lượng nhạc nền" className="w-full accent-amber-500 h-6 sm:h-1.5 bg-[var(--border-subtle)] rounded-lg cursor-pointer"
                />
                <span className="font-mono text-xs font-bold text-[var(--text-secondary)] w-7 text-right">
                  {volume}%
                </span>
              </div>
            </div>
          </div>

          {/* 3. Guide & Shortcuts */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
            <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Trợ Giúp & Hướng Dẫn
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenGuide();
                }}
                className="p-2 min-h-[44px] sm:min-h-0 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-amber-500/15 border border-[var(--border-subtle)] hover:border-amber-500/40 text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500 shrink-0" />
                <span className="truncate">Cẩm Nang [?]</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenShortcuts();
                }}
                className="p-2 min-h-[44px] sm:min-h-0 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-indigo-500/15 border border-[var(--border-subtle)] hover:border-indigo-500/40 text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition"
              >
                <Keyboard className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-500 shrink-0" />
                <span className="truncate">Phím Tắt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
