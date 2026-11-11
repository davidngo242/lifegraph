'use client';

import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  X,
  Dna,
  Zap,
  BookOpen,
  GraduationCap,
  Play,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Brain,
  Shield
} from 'lucide-react';
import SkillTreeTab, { DEFAULT_TREE } from './rpg/SkillTreeTab';
import { SKILL_BRANCHES } from './SkillSelectorModal';
import Tooltip from './Tooltip';

interface SkillTreeModalProps {
  character: any;
  skillPoints: number;
  unlockedSkills: string[];
  onUnlockSkill: (skillId: string) => Promise<void>;
  onLaunchMiniGame?: (type: any) => void;
  relationships?: any[];
  assets?: any[];
  onClose: () => void;
  isLoading?: boolean;
}

export default function SkillTreeModal({
  character,
  skillPoints = 0,
  unlockedSkills = [],
  onUnlockSkill,
  onLaunchMiniGame,
  relationships = [],
  assets = [],
  onClose,
  isLoading = false
}: SkillTreeModalProps) {
  const [activeTab, setActiveTab] = useState<'rpg_tree' | 'certifications'>('rpg_tree');
  const [selectedCertBranch, setSelectedCertBranch] = useState(SKILL_BRANCHES[0].id);

  const characterAge = character?.age || 0;
  const currentCertBranch = SKILL_BRANCHES.find(b => b.id === selectedCertBranch) || SKILL_BRANCHES[0];

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="max-w-4xl w-full max-h-[92vh] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-primary)] transition-colors">
        
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between gap-2 p-3.5 md:p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0 text-xl shadow-inner">
              🌳
            </span>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                <h2 className="text-sm md:text-base font-extrabold text-[var(--text-primary)]">
                  Đại Thụ Kỹ Năng &amp; Hệ Sinh Thái Sinh Mệnh
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold uppercase whitespace-nowrap">
                  Level {character?.life_level || 1} • {character?.title || "Kẻ Khởi Đầu"}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] hidden sm:block">
                Tam vị nhất thể: Gia Phong Huyết Thống, Sản Nghiệp Tư Bản &amp; Thân Tâm Trí Tuệ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* SP Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{skillPoints} SP</span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition cursor-pointer min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0 inline-flex items-center justify-center"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-2 sm:px-4 pt-3 gap-1 sm:gap-2 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-card-subtle)]/50">
          <button
            type="button"
            onClick={() => setActiveTab('rpg_tree')}
            className={`pb-2.5 px-2 sm:px-3 min-h-[44px] sm:min-h-0 text-xs font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition text-left ${
              activeTab === 'rpg_tree'
                ? 'border-indigo-500 text-indigo-800 dark:text-indigo-300 font-extrabold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cây Kỹ Năng Tam Vị Nhất Thể</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certifications')}
            className={`pb-2.5 px-2 sm:px-3 min-h-[44px] sm:min-h-0 text-xs font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition text-left ${
              activeTab === 'certifications'
                ? 'border-indigo-500 text-indigo-800 dark:text-indigo-300 font-extrabold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Sát Hạch Chứng Chỉ &amp; Thi Cử</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 md:p-5 custom-scrollbar">
          {activeTab === 'rpg_tree' ? (
            <SkillTreeTab
              skillPoints={skillPoints}
              unlockedSkills={unlockedSkills}
              onUnlockSkill={onUnlockSkill}
              isLoading={isLoading}
              characterAge={characterAge}
              relationships={relationships}
              assets={assets}
              character={character}
            />
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Học Viện Kỹ Năng &amp; Sát Hạch Mini-game</h4>
                  <p className="text-xs text-[var(--text-secondary)]">Tham gia kỳ thi sát hạch để nhận chứng chỉ chuyên môn và gia tăng thu nhập suốt đời.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[var(--text-secondary)]">Độ tuổi tối thiểu:</span>
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">6 Tuổi trở lên</span>
                </div>
              </div>

              {/* Branch Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SKILL_BRANCHES.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedCertBranch(b.id)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedCertBranch === b.id
                        ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 font-bold shadow-sm'
                        : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{b.icon}</span>
                      <span className="text-xs font-bold">{b.name}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{b.desc}</p>
                  </button>
                ))}
              </div>

              {/* Certification Levels */}
              <div className="space-y-2.5">
                {currentCertBranch.levels.map(lvl => (
                  <div
                    key={lvl.level}
                    className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                          Cấp {lvl.level}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">{lvl.title}</h5>
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold mt-1">
                        ★ {lvl.perkTitle}: <span className="text-[var(--text-secondary)] font-normal">{lvl.perkDesc}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onLaunchMiniGame) {
                          const gameType = currentCertBranch.id === 'tech_logic' 
                            ? (characterAge <= 12 ? 'logic_circuit_6yo' : 'logic_circuit_6yo')
                            : currentCertBranch.id === 'finance_market'
                            ? 'stock_trader_20yo'
                            : 'cardio_beat_55yo';
                          onLaunchMiniGame(gameType);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-md transition active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Sát Hạch (${lvl.tuition.toLocaleString()})</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
