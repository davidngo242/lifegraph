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
        return { label: 'Quý Nhân / Đỡ Đầu', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'ally':
        return { label: 'Chiến Hữu / Tri Kỷ', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'rival':
        return { label: 'Kình Địch Thương Trường', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'protege':
        return { label: 'Hậu Bối / Kế Thừa', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      default:
        return { label: 'Nhân Mạch', color: 'bg-slate-800 text-slate-300 border-slate-700' };
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
    <div className="w-full bg-slate-900/95 border border-purple-500/30 rounded-3xl p-3 md:p-4 shadow-xl backdrop-blur-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Mạng Lưới Nhân Mạch</span>
              <span className="text-[11px] text-purple-300 font-normal">Social Links 1–5</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Giao lưu và củng cố liên kết với Quý Nhân, Tri Kỷ và Kình Địch để mở khóa những đặc quyền thay đổi vận mệnh.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-300">
          <span>Khả dụng:</span>
          <span className="text-amber-400 font-bold">{actionPoints} AP</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-bold">${cash.toLocaleString()}</span>
        </div>
      </div>

      {/* NPC Grid (4 Archetypes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {socialLinks.map(npc => {
          const badge = getArchetypeBadge(npc.archetype);
          const expPercent = Math.min(100, Math.round((npc.linkExp / (npc.maxExp || 100)) * 100));
          const canFavor = npc.linkLevel >= 3;
          const isBusy = isLoading || activeNpcId === npc.id;

          return (
            <div
              key={npc.id}
              className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-3 shadow-md"
            >
              {/* NPC Top Bio */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-2xl bg-slate-900 border border-slate-800 shrink-0 shadow-sm">
                      {npc.avatar || '👤'}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white">{npc.name}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-indigo-300 block">{npc.role}</span>
                    </div>
                  </div>

                  {/* Link Stars */}
                  <div className="flex items-center gap-0.5 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < npc.linkLevel
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                    <span className="text-[10.5px] font-sans tabular-nums font-bold text-amber-300 ml-1">
                      Cấp {npc.linkLevel}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic mb-2">
                  {npc.description}
                </p>

                {/* Link EXP Progress Bar */}
                <div className="space-y-1 mb-2.5">
                  <div className="flex items-center justify-between text-[10px] font-sans tabular-nums text-slate-400">
                    <span>Hảo Cảm</span>
                    <span className="text-purple-300 font-semibold">{npc.linkExp}/{npc.maxExp} EXP</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500 rounded-full"
                      style={{ width: `${expPercent}%` }}
                    />
                  </div>
                </div>

                {/* Milestone Perks Accordion / List */}
                <div className="space-y-1 text-[10.5px] bg-slate-900/50 p-2 rounded-xl border border-slate-800/60">
                  {npc.perks.map(p => {
                    const isUnlocked = npc.linkLevel >= p.level;
                    return (
                      <Tooltip
                        key={p.level}
                        className="w-full"
                        position="top"
                        content={
                          <div className="space-y-0.5">
                            <strong className="text-amber-300 block">
                              Cấp {p.level}: {p.title}
                            </strong>
                            <div className="text-[11.5px] text-slate-200">{p.desc}</div>
                          </div>
                        }
                      >
                        <div className="w-full flex items-start gap-1.5 cursor-help">
                          <span className={`shrink-0 mt-0.5 ${isUnlocked ? 'text-amber-400 font-bold' : 'text-slate-600'}`}>
                            {isUnlocked ? '★' : '☆'}
                          </span>
                          <div className="flex-1 truncate">
                            <strong className={isUnlocked ? 'text-amber-200' : 'text-slate-500'}>
                              Cấp {p.level}: {p.title}
                            </strong>
                            <span className={`block truncate text-[10px] ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>
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
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800/80">
                {/* 1. Trò chuyện / Giao lưu */}
                <button
                  disabled={isBusy || actionPoints < 1}
                  onClick={() => handleAction(npc.id, 'socialize')}
                  className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-purple-950/70 border border-slate-800 hover:border-purple-500/50 text-slate-200 hover:text-white text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition active:scale-95 disabled:opacity-40"
                >
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-400" /> Giao Lưu
                  </span>
                  <span className="text-[9.5px] font-sans tabular-nums text-slate-400">-1 AP · +35 EXP</span>
                </button>

                {/* 2. Tặng quà */}
                <button
                  disabled={isBusy || actionPoints < 1 || cash < 500}
                  onClick={() => handleAction(npc.id, 'gift')}
                  className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-amber-950/70 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-white text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition active:scale-95 disabled:opacity-40"
                >
                  <span className="flex items-center gap-1">
                    <Gift className="w-3 h-3 text-amber-400" /> Tặng Quà
                  </span>
                  <span className="text-[9.5px] font-sans tabular-nums text-amber-300">-$500 · +65 EXP</span>
                </button>

                {/* 3. Mượn lực đặc quyền */}
                <button
                  disabled={isBusy || actionPoints < 1 || !canFavor}
                  onClick={() => handleAction(npc.id, 'request_favor')}
                  className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
                    canFavor
                      ? 'bg-gradient-to-r from-indigo-950 to-purple-950 hover:from-indigo-900 hover:to-purple-900 border-indigo-500/60 text-indigo-200 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-600 cursor-not-allowed'
                  }`}
                  title={canFavor ? "Nhờ cậy quý nhân giải tỏa bế tắc hoặc buff tài chính" : "Cần Cấp 3 Hảo Cảm để mở khóa"}
                >
                  <span className="flex items-center gap-1">
                    {canFavor ? <Zap className="w-3 h-3 text-amber-400" /> : <Lock className="w-3 h-3" />}
                    <span>Mượn Lực</span>
                  </span>
                  <span className="text-[9.5px] font-sans tabular-nums text-indigo-300">
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
