'use client';

import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  Heart,
  Gift,
  Zap,
  Lock,
  CheckCircle2,
  Star,
  Award,
  ChevronRight
} from 'lucide-react';
import Tooltip from '../Tooltip';

export interface NpcSocialLink {
  id: string;
  name: string;
  archetype: 'mentor' | 'ally' | 'rival' | 'protege';
  role: string;
  avatar: string;
  linkLevel: number;
  linkExp: number;
  maxExp: number;
  description: string;
  perks: { level: number; title: string; desc: string }[];
  interactedThisYear?: boolean;
}

interface SocialLinksTabProps {
  socialLinks?: NpcSocialLink[];
  actionPoints: number;
  cash: number;
  onInteract: (npcId: string, actionType: 'socialize' | 'gift' | 'request_favor') => Promise<void>;
  isLoading?: boolean;
}

export default function SocialLinksTab({
  socialLinks = [],
  actionPoints = 0,
  cash = 0,
  onInteract,
  isLoading = false
}: SocialLinksTabProps) {
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);

  const getArchetypeBadge = (type: string) => {
    switch (type) {
      case 'mentor':
        return { label: 'Quý Nhân / Đỡ Đầu', color: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30' };
      case 'ally':
        return { label: 'Chiến Hữu / Tri Kỷ', color: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40' };
      case 'rival':
        return { label: 'Kình Địch Thương Trường', color: 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/40' };
      case 'protege':
        return { label: 'Hậu Bối / Kế Thừa', color: 'bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/40' };
      default:
        return { label: 'Nhân Mạch', color: 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]' };
    }
  };

  const handleAction = async (npcId: string, type: 'socialize' | 'gift' | 'request_favor') => {
    try {
      setActiveNpcId(npcId);
      await onInteract(npcId, type);
    } finally {
      setActiveNpcId(null);
    }
  };

  return (
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-3 md:p-4 shadow-xl backdrop-blur-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <span>Mạng Lưới Nhân Mạch</span>
              <span className="text-xs text-amber-800 dark:text-amber-400 font-normal">Social Links 1–5</span>
            </h3>
            <span className="text-xs text-[var(--text-secondary)]">
              Giao lưu và củng cố liên kết với Quý Nhân, Tri Kỷ và Kình Địch để mở khóa những đặc quyền thay đổi vận mệnh.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)]">
          <span>Khả dụng:</span>
          <span className="text-amber-800 dark:text-amber-400 font-bold">{actionPoints} AP</span>
          <span className="text-[var(--text-secondary)]">•</span>
          <span className="text-emerald-800 dark:text-emerald-400 font-bold">${cash.toLocaleString()}</span>
        </div>
      </div>

      {/* NPC Grid (4 Archetypes) */}
      <div className="grid grid-cols-1 gap-3">
        {socialLinks.map(npc => {
          const badge = getArchetypeBadge(npc.archetype);
          const expPercent = Math.min(100, Math.round((npc.linkExp / (npc.maxExp || 100)) * 100));
          const canFavor = npc.linkLevel >= 3;
          const isBusy = isLoading || activeNpcId === npc.id;

          return (
            <div
              key={npc.id}
              className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-amber-400/40 transition-all flex flex-col justify-between gap-3 shadow-sm"
            >
              {/* NPC Top Bio */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shrink-0 shadow-sm">
                      {npc.avatar || '👤'}
                    </span>
                    <div>
                      <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1">
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">{npc.name}</h4>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-xs text-teal-800 dark:text-teal-300 block font-medium">{npc.role}</span>
                    </div>
                  </div>

                  {/* Link Stars */}
                  <div className="flex items-center gap-0.5 bg-[var(--bg-card)] px-2 py-1 rounded-xl border border-[var(--border-subtle)] shrink-0 whitespace-nowrap">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < npc.linkLevel
                            ? 'text-amber-700 dark:text-amber-500 fill-amber-500'
                            : 'text-slate-700 dark:text-slate-500'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-sans tabular-nums font-bold text-amber-800 dark:text-amber-300 ml-1">
                      Cấp {npc.linkLevel}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] italic mb-2">
                  {npc.description}
                </p>

                {/* Link EXP Progress Bar */}
                <div className="space-y-1 mb-2.5">
                  <div className="flex items-center justify-between text-xs font-sans tabular-nums text-[var(--text-secondary)]">
                    <span>Hảo Cảm</span>
                    <span className="text-amber-800 dark:text-amber-400 font-semibold">{npc.linkExp}/{npc.maxExp} EXP</span>
                  </div>
                  <div className="w-full bg-[var(--bg-card)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${expPercent}%` }}
                    />
                  </div>
                </div>

                {/* Milestone Perks Accordion / List */}
                <div className="space-y-1.5 text-xs bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-subtle)]">
                  {npc.perks.map(p => {
                    const isUnlocked = npc.linkLevel >= p.level;
                    return (
                      <Tooltip
                        key={p.level}
                        className="w-full"
                        position="top"
                        content={
                          <div className="space-y-0.5">
                            <strong className="text-amber-800 dark:text-amber-300 block">
                              Cấp {p.level}: {p.title}
                            </strong>
                            <div className="text-xs text-[var(--text-primary)]">{p.desc}</div>
                          </div>
                        }
                      >
                        <div className="w-full flex items-start gap-1.5 cursor-help">
                          <span className={`shrink-0 mt-0.5 ${isUnlocked ? 'text-amber-800 dark:text-amber-400 font-bold' : 'text-[var(--text-secondary)]'}`}>
                            {isUnlocked ? '★' : '☆'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <strong className={isUnlocked ? 'text-amber-800 dark:text-amber-200' : 'text-[var(--text-secondary)]'}>
                              Cấp {p.level}: {p.title}
                            </strong>
                            <span className={`block text-xs ${isUnlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                              {p.desc}
                            </span>
                          </div>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
                {/* 1. Trò chuyện / Giao lưu */}
                <button
                  disabled={isBusy || actionPoints < 1}
                  onClick={() => handleAction(npc.id, 'socialize')}
                  className="py-2 px-1.5 min-h-[44px] rounded-xl bg-[var(--bg-card)] hover:bg-amber-500/10 border border-[var(--border-subtle)] hover:border-amber-400/50 text-[var(--text-primary)] text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition active:scale-95 disabled:opacity-40"
                >
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-700 dark:text-pink-500" /> Giao Lưu
                  </span>
                  <span className="text-xs font-sans tabular-nums text-[var(--text-secondary)] text-center leading-tight">-1 AP · +35 EXP</span>
                </button>

                {/* 2. Tặng quà */}
                <button
                  disabled={isBusy || actionPoints < 1 || cash < 500}
                  onClick={() => handleAction(npc.id, 'gift')}
                  className="py-2 px-1.5 min-h-[44px] rounded-xl bg-[var(--bg-card)] hover:bg-amber-500/10 border border-[var(--border-subtle)] hover:border-amber-400/50 text-[var(--text-primary)] text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition active:scale-95 disabled:opacity-40"
                >
                  <span className="flex items-center gap-1">
                    <Gift className="w-3 h-3 text-amber-700 dark:text-amber-500" /> Tặng Quà
                  </span>
                  <span className="text-xs font-sans tabular-nums text-amber-800 dark:text-amber-400 text-center leading-tight">-$500 · +65 EXP</span>
                </button>

                {/* 3. Mượn lực đặc quyền */}
                <button
                  disabled={isBusy || actionPoints < 1 || !canFavor}
                  onClick={() => handleAction(npc.id, 'request_favor')}
                  className={`py-2 px-1.5 min-h-[44px] rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
                    canFavor
                      ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black shadow-sm'
                      : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] opacity-50 cursor-not-allowed'
                  }`}
                  title={canFavor ? "Nhờ cậy quý nhân giải tỏa bế tắc hoặc buff tài chính" : "Cần Cấp 3 Hảo Cảm để mở khóa"}
                >
                  <span className="flex items-center gap-1">
                    {canFavor ? <Zap className="w-3 h-3 text-slate-950 fill-slate-950" /> : <Lock className="w-3 h-3" />}
                    <span>Mượn Lực</span>
                  </span>
                  <span className={`text-xs font-sans tabular-nums font-bold text-center leading-tight ${canFavor ? 'text-slate-950' : 'text-[var(--text-secondary)]'}`}>
                    {canFavor ? "-1 AP · Đặc Quyền" : "Khóa (Cấp 3)"}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
