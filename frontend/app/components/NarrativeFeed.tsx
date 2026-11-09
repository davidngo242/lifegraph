'use client';

import React, { useState } from 'react';
import { BookOpen, Briefcase, EyeOff, Sparkles, AlertTriangle, Heart, Award } from 'lucide-react';
import AnnualDigestBanner, { AnnualDigestData } from './AnnualDigestBanner';
import { MiniGameType } from './minigames/MiniGameHostModal';

interface HistoryItem {
  age: number;
  event: string;
  choice?: string;
  impact?: string;
}

interface Asset {
  id: string;
  name: string;
  type: string;
  current_value: number;
}

interface Relationship {
  id: string;
  name: string;
  type: string;
  affinity?: number;
  affection_level?: number;
}

interface NarrativeFeedProps {
  history: HistoryItem[];
  assets?: Asset[];
  relationships?: Relationship[];
  currentAge: number;
  annualDigest?: AnnualDigestData | null;
  nationality?: string;
  onLaunchMiniGame?: (gameType: MiniGameType) => void;
  onCloseDigest?: () => void;
  onOpenAssets?: () => void;
  onOpenFamily?: () => void;
}

export default function NarrativeFeed({
  history = [],
  currentAge,
  annualDigest,
  nationality = "Việt Nam",
  onLaunchMiniGame,
  onCloseDigest,
  onOpenAssets,
  onOpenFamily
}: NarrativeFeedProps) {
  const [filter, setFilter] = useState<'all' | 'milestones' | 'career' | 'family'>('all');
  const isOldAge = currentAge >= 60;

  // Filter history items by category
  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    const text = `${item.event} ${item.choice || ''}`.toLowerCase();
    if (filter === 'career') {
      return text.includes('tiền') || text.includes('việc') || text.includes('tài sản') || text.includes('đầu tư') || text.includes('công sở') || text.includes('khởi nghiệp');
    }
    if (filter === 'family') {
      return text.includes('mẹ') || text.includes('cha') || text.includes('con') || text.includes('vợ') || text.includes('chồng') || text.includes('gia đình') || text.includes('hôn lễ');
    }
    if (filter === 'milestones') {
      return item.age % 5 === 0 || text.includes('thừa kế') || text.includes('chào đời') || text.includes('kỹ năng') || text.includes('18 tuổi');
    }
    return true;
  });

  // Reversing so newest events are ALWAYS at the top (LIFO Chronological Journey)
  const displayHistory = [...filteredHistory].reverse();
  const latestHistoryItem = history.length > 0 ? history[history.length - 1] : null;

  const getCategoryIcon = (item: HistoryItem) => {
    const text = `${item.event} ${item.choice || ''}`.toLowerCase();
    if (text.includes('kỹ năng') || text.includes('thử thách')) return <Award className="w-3.5 h-3.5 text-amber-400" />;
    if (text.includes('mẹ') || text.includes('cha') || text.includes('con') || text.includes('vợ') || text.includes('gia đình')) return <Heart className="w-3.5 h-3.5 text-pink-400" />;
    if (text.includes('tài sản') || text.includes('tiền') || text.includes('đầu tư') || text.includes('công sở')) return <Briefcase className="w-3.5 h-3.5 text-sky-400" />;
    if (text.includes('khủng hoảng') || text.includes('thảm') || text.includes('mất')) return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
    return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
  };

  return (
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-4 md:p-5 shadow-xl backdrop-blur-xl flex flex-col h-auto max-h-[520px] lg:max-h-none lg:h-[calc(100vh-6.5rem)] lg:sticky top-20 overflow-hidden transition-colors duration-200">
      {/* Header: Replaced redundant age badge with Timeline Progress and Filters */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-800/80 mb-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)] tracking-wide text-xs md:text-sm flex items-center gap-2">
                <span>Nhật Ký Hành Trình</span>
                <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] font-normal border border-[var(--border-subtle)]">
                  {history.length} sự kiện
                </span>
              </h3>
            </div>
          </div>

          {isOldAge && (
            <span className="text-[12px] font-sans px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
              <EyeOff className="w-3 h-3" /> Trí nhớ mờ dần
            </span>
          )}
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-1.5 text-[12px] overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-xl transition font-medium ${
              filter === 'all'
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]'
            }`}
          >
            Tất Cả
          </button>
          <button
            onClick={() => setFilter('milestones')}
            className={`px-2.5 py-1 rounded-xl transition font-medium ${
              filter === 'milestones'
                ? 'bg-amber-600/30 text-amber-700 dark:text-amber-300 border border-amber-500/50'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]'
            }`}
          >
            Cột Mốc
          </button>
          <button
            onClick={() => setFilter('career')}
            className={`px-2.5 py-1 rounded-xl transition font-medium ${
              filter === 'career'
                ? 'bg-sky-600/30 text-sky-700 dark:text-sky-300 border border-sky-500/50'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]'
            }`}
          >
            Sự Nghiệp
          </button>
          <button
            onClick={() => setFilter('family')}
            className={`px-2.5 py-1 rounded-xl transition font-medium ${
              filter === 'family'
                ? 'bg-pink-600/30 text-pink-700 dark:text-pink-300 border border-pink-500/50'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]'
            }`}
          >
            Gia Tộc
          </button>
        </div>

        {/* Pinned Annual Digest Strip (Điểm Tin Mới Nhất) */}
        {annualDigest && (
          <div className="pt-1">
            <AnnualDigestBanner
              digest={annualDigest}
              nationality={nationality}
              onLaunchMiniGame={onLaunchMiniGame || (() => {})}
              onClose={onCloseDigest || (() => {})}
            />
          </div>
        )}
      </div>

      {/* Narrative Feed Timeline (Newest on top, smooth scroll) */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-1 select-text custom-scrollbar">
        {displayHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs italic font-sans p-6">
            <BookOpen className="w-8 h-8 opacity-30 mb-2 text-indigo-400" />
            <p>Chưa có ký ức nào trong danh mục này.</p>
            <p className="text-[12px] text-slate-600 mt-0.5">Tiếp tục hành trình để bồi đắp dòng lịch sử.</p>
          </div>
        ) : (
          displayHistory.map((item, idx) => {
            const isLatest = item === latestHistoryItem;
            const isVeryOldMemory = isOldAge && item.age < currentAge - 25;
            const memoryStyle = isVeryOldMemory
              ? "opacity-40 blur-[0.4px] hover:opacity-100 hover:blur-none transition-all duration-300"
              : "opacity-100";

            return (
              <div
                key={idx}
                className={`relative pl-5 pb-1 transition-all group ${memoryStyle}`}
              >
                {/* Timeline vertical connector line */}
                <div className="absolute left-2 top-3 bottom-0 w-0.5 bg-slate-800 group-last:hidden" />

                {/* Timeline node icon */}
                <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                  isLatest
                    ? 'bg-indigo-600 border-indigo-300 shadow-[0_0_10px_#6366f1]'
                    : 'bg-slate-950 border-slate-700'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isLatest ? 'bg-white animate-ping' : 'bg-indigo-400'}`} />
                </div>

                {/* Card Container */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  isLatest
                    ? 'bg-gradient-to-r from-indigo-500/10 via-[var(--bg-card)] to-[var(--bg-card)] border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] hover:border-indigo-400/40'
                }`}>
                  {/* Card Header: Age Badge & Event Category */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-md border font-bold ${
                        isLatest 
                          ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-200 border-indigo-500/30' 
                          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                      }`}>
                        Tuổi {item.age}
                      </span>
                      <span className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                        {getCategoryIcon(item)}
                      </span>
                    </div>

                    {isLatest && (
                      <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-bold animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Vừa xong
                      </span>
                    )}
                  </div>

                  {/* Event Title */}
                  <div className={`text-xs font-bold leading-snug mb-1 ${isLatest ? 'text-[var(--text-primary)] font-extrabold' : 'text-[var(--text-primary)]'}`}>
                    {item.event}
                  </div>

                  {/* Choice & Consequence */}
                  {item.choice && (
                    <div className="text-[12px] text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-xl p-2 border border-[var(--border-subtle)] font-sans leading-relaxed">
                      <span className="text-indigo-500 dark:text-indigo-400 font-sans font-semibold mr-1">
                        {item.age === 0 ? '↳ Ký ức đầu đời:' : '↳ Lựa chọn:'}
                      </span>
                      <span>{item.choice}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

