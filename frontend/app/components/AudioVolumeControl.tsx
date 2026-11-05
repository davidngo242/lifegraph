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
            <div className="font-bold text-indigo-300 text-xs flex items-center gap-1 mb-0.5">
              <Music className="w-3.5 h-3.5" /> {isPlaying ? `Nhạc Nền Đang Phát (${volume}%)` : "Nhạc Nền Tắt"}
            </div>
            <div className="text-[10px] text-slate-300">
              {isPlaying ? "Bấm để tạm dừng âm thanh không gian sống hoặc chỉnh âm lượng." : "Bấm để bật âm nhạc thiền định và nhịp điệu cuộc sống."}
            </div>
          </div>
        }
      >
        <div className={`flex items-center rounded-xl border text-xs font-sans transition-all shadow-md ${
          isPlaying
            ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300 shadow-indigo-950/30'
            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-400'
        }`}>
          {/* Toggle Play/Pause Icon Button */}
          <button
            onClick={onTogglePlay}
            className="p-2 hover:text-white transition flex items-center gap-1.5"
          >
            {isPlaying ? (
              volume > 50 ? (
                <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse" />
              ) : (
                <Volume1 className="w-4 h-4 text-indigo-400" />
              )
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <span className="hidden sm:inline font-medium text-[12px]">
              {isPlaying ? `${volume}%` : 'Nhạc Tắt'}
            </span>
          </button>

          {/* Volume Slider Popover Toggle */}
          <button
            onClick={() => setShowSlider(!showSlider)}
            className="px-2 py-2 border-l border-slate-800 hover:text-white transition"
          >
            <Sliders className="w-3 h-3 opacity-80" />
          </button>
        </div>
      </Tooltip>

      {/* Floating Volume Slider Popover */}
      {showSlider && (
        <div className="absolute top-11 right-0 w-48 bg-slate-950 border border-slate-800 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between text-[12px] text-slate-400 mb-2">
            <span className="flex items-center gap-1 text-white font-medium">
              <Music className="w-3 h-3 text-indigo-400" /> Âm Lượng
            </span>
            <span className="font-sans tabular-nums text-indigo-300 font-bold">{volume}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <div className="flex justify-between text-[12px] text-slate-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
}

