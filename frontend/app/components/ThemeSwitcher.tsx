'use client';

import React, { useState, useEffect } from 'react';
import Tooltip from './Tooltip';

export type GameTheme = 'obsidian' | 'sepia' | 'cyberpunk';

interface ThemeOption {
  id: GameTheme;
  label: string;
  icon: string;
  shortDesc: string;
  desc: string;
  activeColor: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'obsidian',
    label: 'Obsidian',
    icon: '🌙',
    shortDesc: 'Than chì dịu mắt',
    desc: 'Obsidian Night: Nền than chì ấm êm dịu, triệt tiêu ánh sáng chói, chống mỏi mắt khi chơi lâu (Khuyên Dùng)',
    activeColor: 'bg-amber-500/20 text-amber-200 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
  },
  {
    id: 'sepia',
    label: 'Sepia',
    icon: '📜',
    shortDesc: 'Đêm ấm cúng',
    desc: 'Sepia Warmth: Giấy ngà & nâu xám ấm hoài niệm, lọc tối đa ánh sáng xanh, êm ái cho phiên chơi đêm',
    activeColor: 'bg-amber-700/25 text-amber-100 border-amber-600/50 shadow-[0_0_12px_rgba(217,119,6,0.2)]'
  },
  {
    id: 'cyberpunk',
    label: 'Cyber',
    icon: '⚡',
    shortDesc: 'Neon nguyên bản',
    desc: 'Cyber Slate: Phong cách Cyberpunk nguyên bản với viền neon tương phản cao',
    activeColor: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
  }
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<GameTheme>('obsidian');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = (localStorage.getItem('lifegraph_theme') as GameTheme) || 'obsidian';
      if (['obsidian', 'sepia', 'cyberpunk'].includes(saved)) {
        setTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        setTheme('obsidian');
        document.documentElement.setAttribute('data-theme', 'obsidian');
      }
    } catch {
      setTheme('obsidian');
      document.documentElement.setAttribute('data-theme', 'obsidian');
    }
  }, []);

  const handleSelectTheme = (newTheme: GameTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('lifegraph_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    } catch (e) {
      console.warn('Failed to persist theme to localStorage', e);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs opacity-60">
        <span className="px-2 py-0.5 text-xs text-slate-400">🌙 Giao diện</span>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Lựa chọn giao diện thị giác"
      className="flex items-center gap-0.5 p-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] backdrop-blur-md shadow-inner transition-colors duration-200"
    >
      {THEME_OPTIONS.map((item) => {
        const isActive = theme === item.id;
        return (
          <Tooltip key={item.id} position="bottom" content={item.desc}>
            <button
              type="button"
              onClick={() => handleSelectTheme(item.id)}
              aria-pressed={isActive}
              className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border ${
                isActive
                  ? `${item.activeColor} font-bold scale-[1.02]`
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
              }`}
            >
              <span className="text-xs shrink-0 select-none">{item.icon}</span>
              <span className="hidden sm:inline tracking-tight text-[11px] md:text-xs">
                {item.label}
              </span>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
