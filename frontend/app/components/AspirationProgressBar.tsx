'use client';

import React from 'react';
import { Target, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import Tooltip from './Tooltip';

export interface AspirationData {
  aspiration_id: string;
  title: string;
  icon: string;
  target_summary: string;
  reward_summary: string;
  progress: number; // 0 - 100
  is_completed: boolean;
  milestones_achieved: string[];
}

interface AspirationProgressBarProps {
  aspiration?: AspirationData;
}

export default function AspirationProgressBar({ aspiration }: AspirationProgressBarProps) {
  if (!aspiration) return null;

  const isCompleted = aspiration.is_completed || aspiration.progress >= 100;

  return (
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3 md:p-3.5 shadow-md backdrop-blur-md mb-4 relative overflow-hidden transition-all hover:border-amber-400/50">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Aspiration Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl shrink-0 shadow-sm">
            {aspiration.icon || '🎯'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-sans tabular-nums normal-case px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold tracking-normal">
                Khát Vọng Đời Người
              </span>
              <Tooltip content={aspiration.target_summary || aspiration.title}>
                <h4 className="text-xs md:text-sm font-bold text-[var(--text-primary)] tracking-wide cursor-help">
                  {aspiration.title}
                </h4>
              </Tooltip>
              {isCompleted && (
                <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-bold animate-bounce">
                  <CheckCircle2 className="w-3 h-3" /> Đạt Thành Tựu!
                </span>
              )}
            </div>
            <Tooltip content={aspiration.target_summary}>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 line-clamp-1 cursor-help">
                {aspiration.target_summary}
              </p>
            </Tooltip>
          </div>
        </div>

        {/* Right: Progress Meter */}
        <div className="flex flex-col sm:items-end gap-1 shrink-0 min-w-[180px]">
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs w-full">
            <span className="text-[var(--text-secondary)] text-[12px]">Tiến độ cuộc đời:</span>
            <span className={`font-sans tabular-nums font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {aspiration.progress}%
            </span>
          </div>

          <div className="w-full h-2 bg-[var(--bg-card-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_#10b981]'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
              }`}
              style={{ width: `${Math.min(100, aspiration.progress)}%` }}
            />
          </div>

          {aspiration.milestones_achieved && aspiration.milestones_achieved.length > 0 && (
            <Tooltip content={aspiration.milestones_achieved[aspiration.milestones_achieved.length - 1]}>
              <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-xs cursor-help">
                ✓ {aspiration.milestones_achieved[aspiration.milestones_achieved.length - 1]}
              </span>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
