'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  X,
  Search,
  Filter,
  Sparkles,
  Award,
  AlertCircle
} from 'lucide-react';

interface HistoryItem {
  age?: number;
  year?: number;
  event: string;
  category?: string;
  impact?: string;
  choice?: string;
  timestamp?: string;
}

interface LifeChronicleModalProps {
  history: any[];
  characterName: string;
  currentAge: number;
  onClose: () => void;
}

export default function LifeChronicleModal({
  history = [],
  characterName,
  currentAge,
  onClose
}: LifeChronicleModalProps) {
  const [filterStage, setFilterStage] = useState<'all' | 'childhood' | 'youth' | 'adult' | 'elder'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const normalizeEntry = (item: any, index: number): HistoryItem => {
    if (typeof item === 'string') {
      // Parse patterns like "[Tuổi 18] Bước vào giảng đường..."
      const match = item.match(/\[Tuổi\s*(\d+)\]\s*(.*)/i);
      if (match) {
        return {
          age: parseInt(match[1], 10),
          event: match[2],
          timestamp: `Năm thứ ${index + 1}`
        };
      }
      return {
        age: Math.min(currentAge, Math.floor(index)),
        event: item,
        timestamp: `Sự kiện ${index + 1}`
      };
    }
    return {
      age: item.age ?? 0,
      year: item.year,
      event: item.event || item.message || item.text || JSON.stringify(item),
      category: item.category,
      impact: item.impact,
      choice: item.choice,
      timestamp: item.timestamp
    };
  };

  const parsedList = history.map(normalizeEntry);

  const filteredEntries = parsedList.filter(entry => {
    const entryAge = entry.age ?? 0;
    if (filterStage === 'childhood' && entryAge > 5) return false;
    if (filterStage === 'youth' && (entryAge < 6 || entryAge > 17)) return false;
    if (filterStage === 'adult' && (entryAge < 18 || entryAge > 59)) return false;
    if (filterStage === 'elder' && entryAge < 60) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return entry.event.toLowerCase().includes(q) || (entry.choice && entry.choice.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Dòng Đời: {characterName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-normal">
                  {history.length} sự kiện
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Toàn bộ biên niên sử ký ức và các cột mốc đã trải qua
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="py-3.5 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/80">
          {/* Stage Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterStage('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterStage === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStage('childhood')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterStage === 'childhood' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              0–5 tuổi
            </button>
            <button
              onClick={() => setFilterStage('youth')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterStage === 'youth' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              6–17 tuổi
            </button>
            <button
              onClick={() => setFilterStage('adult')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterStage === 'adult' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              18–59 tuổi
            </button>
            <button
              onClick={() => setFilterStage('elder')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterStage === 'elder' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              60+ tuổi
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sự kiện, cột mốc..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Chronicle Timeline List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Không tìm thấy sự kiện nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredEntries.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition flex items-start gap-3.5"
              >
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs font-bold shrink-0 min-w-[54px] text-center">
                  {item.age !== undefined ? `${item.age} tuổi` : 'Ký ức'}
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-sm text-slate-200 font-serif leading-relaxed">
                    {item.event}
                  </p>
                  {item.choice && (
                    <div className="text-xs text-purple-300 font-medium">
                      Quyết định đã chọn: <em>{item.choice}</em>
                    </div>
                  )}
                  {item.impact && (
                    <div className="text-xs text-emerald-400">
                      Hậu quả: {item.impact}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Đóng Biên Niên Sử
          </button>
        </div>
      </div>
    </div>
  );
}
