'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Volume1, Sliders, Music } from 'lucide-react';
import Tooltip from './Tooltip';

interface AudioVolumeControlProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export default function AudioVolumeControl({ isPlaying, onTogglePlay, audioRef }: AudioVolumeControlProps) {
  const [volume, setVolume] = useState<number>(35); // 0 to 100
  const [showSlider, setShowSlider] = useState<boolean>(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol / 100;
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Audio Pill Button with Custom Tooltip */}
      <Tooltip
        position="bottom"
        align="right"
        content={
          <div className="p-0.5">
            <div className="font-bold text-amber-600 dark:text-amber-300 text-xs flex items-center justify-between gap-2 mb-0.5">
              <span className="flex items-center gap-1">
                <Music className="w-3.5 h-3.5" /> {isPlaying ? `Nhạc Nền Đang Phát (${volume}%)` : "Nhạc Nền Tắt"}
              </span>
              <kbd className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                M
              </kbd>
            </div>
            <div className="text-[10px] text-slate-300">
              {isPlaying ? "Bấm để tạm dừng âm thanh (hoặc nhấn phím M)." : "Bấm để bật âm nhạc thiền định (hoặc nhấn phím M)."}
            </div>
          </div>
        }
      >
        <div className={`flex items-center rounded-xl border text-xs font-sans transition-all shadow-sm ${
          isPlaying
            ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 shadow-indigo-500/10'
            : 'bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
        }`}>
          {/* Toggle Play/Pause Icon Button */}
          <button
            onClick={onTogglePlay}
            className="p-2 hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
          >
            {isPlaying ? (
              volume > 50 ? (
                <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              ) : (
                <Volume1 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              )
            ) : (
              <VolumeX className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
            <span className="hidden sm:inline font-medium text-[12px]">
              {isPlaying ? `${volume}%` : 'Nhạc Tắt'}
            </span>
            <kbd className="hidden lg:inline text-[9px] font-mono px-1 py-0.2 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold ml-0.5">
              M
            </kbd>
          </button>

          {/* Volume Slider Popover Toggle */}
          <button
            onClick={() => setShowSlider(!showSlider)}
            className="px-2 py-2 border-l border-[var(--border-subtle)] hover:text-[var(--text-primary)] transition"
          >
            <Sliders className="w-3 h-3 opacity-80" />
          </button>
        </div>
      </Tooltip>

      {/* Floating Volume Slider Popover */}
      {showSlider && (
        <div className="absolute top-11 right-0 w-48 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between text-[12px] text-[var(--text-secondary)] mb-2">
            <span className="flex items-center gap-1 text-[var(--text-primary)] font-medium">
              <Music className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Âm Lượng
            </span>
            <span className="font-sans tabular-nums text-indigo-600 dark:text-indigo-400 font-bold">{volume}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <div className="flex justify-between text-[12px] text-[var(--text-secondary)] mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
}

