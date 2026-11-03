'use client';

import React from 'react';
import {
  Heart,
  Flame,
  DollarSign,
  Zap,
  Target,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';

interface CommitmentItem {
  id: string;
  npc_name: string;
  title: string;
  deadline_age?: number;
  condition?: string;
}

interface CompactProfileSidebarProps {
  character: any;
  aspiration?: any;
  commitments?: CommitmentItem[];
  recentHistory?: any[];
  onOpenFullHistory: () => void;
  onNextYear: () => void;
  onFastForwardSchool?: () => void;
  isProcessing?: boolean;
}

export default function CompactProfileSidebar({
  character,
  aspiration,
  commitments = [],
  recentHistory = [],
  onOpenFullHistory,
  onNextYear,
  onFastForwardSchool,
  isProcessing = false
}: CompactProfileSidebarProps) {
  if (!character) return null;

  const age = character.age ?? 0;
  const vitality = character.vitality ?? 80;
  const burnout = character.burnout ?? 15;
  const actionPoints = character.action_points ?? 3;
  const totalAp = character.total_ap ?? 3;
  const cash = Number(character.cash ?? 0);
  const familyFund = Number(character.family_fund ?? (cash > 20000000 ? cash * 0.4 : 0));
  const nationality = character.nationality || 'Việt Nam';

  // Format cash nicely
  const formattedCash = formatCurrency(cash, nationality);
  const formattedFamilyFund = formatCurrency(familyFund, nationality);

  // Parse recent history entries (3-4 items)
  const lastFewEvents = recentHistory.slice(-4).reverse();

  return (
    <aside className="w-full space-y-4 text-slate-200">
      {/* 1. Compact Identity Profile */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3.5 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Hồ Sơ Nguồn Lực
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
            {character.occupation || "Tự do"}
          </span>
        </div>

        {/* Vitality & Burnout */}
        <div className="grid grid-cols-2 gap-3">
          {/* Vitality (Sinh lực) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" /> Sinh lực
              </span>
              <span className="font-mono font-bold text-white text-[11px]">
                {vitality}/100
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  vitality < 30 ? 'bg-rose-500' : vitality < 60 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, vitality))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400">
              {vitality < 30 ? 'Nguy cơ kiệt quệ' : vitality < 60 ? 'Hơi mỏi mệt' : 'Thể trạng dồi dào'}
            </div>
          </div>

          {/* Burnout (Căng thẳng) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" /> Căng thẳng
              </span>
              <span className="font-mono font-bold text-white text-[11px]">
                {burnout}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  burnout > 75 ? 'bg-rose-500' : burnout > 45 ? 'bg-amber-400' : 'bg-indigo-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, burnout))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400">
              {burnout > 75 ? 'Quá tải tâm lý' : burnout > 45 ? 'Áp lực thường trực' : 'Thư thái'}
            </div>
          </div>
        </div>

        {/* Finance: Personal vs Family */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Tiền cá nhân khả dụng:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {formattedCash.primary}
            </span>
          </div>
          {familyFund > 0 && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-1">
              <span>Quỹ gia đình bảo hộ:</span>
              <span className="font-mono text-purple-300">{formattedFamilyFund.primary}</span>
            </div>
          )}
        </div>

        {/* Action Points (AP) */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
            <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
            <span>Điểm hoạt động (AP):</span>
          </div>
          <span className="font-mono font-bold text-white text-sm">
            {actionPoints} / {totalAp} AP
          </span>
        </div>
      </div>

      {/* 2. Primary Time Progression Button: Sang năm tiếp theo */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/30 shadow-lg space-y-2">
        <button
          onClick={onNextYear}
          disabled={isProcessing}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-indigo-600/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>Sang năm tiếp theo ({age + 1} tuổi)</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {age < 6 && onFastForwardSchool && (
          <button
            onClick={onFastForwardSchool}
            disabled={isProcessing}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 text-xs font-semibold transition"
          >
            Chuyển đến năm 6 tuổi (Tiểu học)
          </button>
        )}
      </div>

      {/* 3. Stage Objective & Active Commitments (Việc đang chờ) */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" /> Mục Tiêu Giai Đoạn
          </span>
        </div>

        {/* Primary Aspiration / Arc Goal */}
        {aspiration ? (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-purple-500/25 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="truncate">{aspiration.title || "Mục tiêu cuộc đời"}</span>
              <span className="font-mono text-purple-300 text-[11px] shrink-0">{aspiration.progress ?? 0}%</span>
            </div>
            <p className="text-[11px] text-slate-400 font-serif leading-relaxed line-clamp-2">
              {aspiration.target_summary || "Đang phấn đấu hoàn thành định hướng cá nhân."}
            </p>
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-serif italic">
            {age < 6
              ? "Hoàn thiện thể chất và nhận thức trong vòng tay gia đình."
              : age < 18
              ? "Tích lũy kiến thức và rèn luyện kỹ năng sinh tồn."
              : "Tìm kiếm chỗ đứng sự nghiệp và xác lập các mối quan hệ then chốt."}
          </div>
        )}

        {/* Active Commitments (Cam kết với NPC) */}
        {commitments.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Cam kết đang thực hiện:
            </span>
            <div className="space-y-1.5">
              {commitments.map((c, i) => (
                <div
                  key={c.id || i}
                  className="p-2 rounded-lg bg-slate-950/50 border border-slate-800 text-[11px] space-y-0.5"
                >
                  <div className="font-bold text-slate-200 flex items-center justify-between">
                    <span>{c.npc_name}: {c.title}</span>
                    {c.deadline_age && (
                      <span className="font-mono text-amber-400 text-[10px]">Trước {c.deadline_age}t</span>
                    )}
                  </div>
                  {c.condition && (
                    <div className="text-slate-400 text-[10px] font-serif">{c.condition}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Recent Journal (Nhật ký gần nhất: 3-4 items) */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Ký Ức Gần Nhất
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {recentHistory.length} sự kiện
          </span>
        </div>

        <div className="space-y-2">
          {lastFewEvents.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-2">
              Chưa có ghi chép đáng chú ý.
            </div>
          ) : (
            lastFewEvents.map((item, idx) => {
              const text = typeof item === 'string' ? item : item.event || item.message || '';
              const itemAge = typeof item === 'object' && item.age !== undefined ? item.age : age;

              return (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-indigo-300 font-mono">
                    <span>Tuổi {itemAge}</span>
                  </div>
                  <p className="text-slate-300 font-serif text-[11px] leading-relaxed line-clamp-2">
                    {text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* View Full Chronicle Button */}
        <button
          onClick={onOpenFullHistory}
          className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <span>Xem toàn bộ dòng đời</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </aside>
  );
}
