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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="max-w-4xl w-full max-h-[92vh] bg-[var(--bg-card)] border border-indigo-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-primary)]">
        
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between p-3.5 md:p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 text-xl shadow-inner">
              🌳
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-extrabold text-white">
                  Đại Thụ Kỹ Năng &amp; Hệ Sinh Thái Sinh Mệnh
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-bold uppercase">
                  Level {character?.life_level || 1} • {character?.title || "Kẻ Khởi Đầu"}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Tam vị nhất thể: Gia Phong Huyết Thống, Sản Nghiệp Tư Bản &amp; Thân Tâm Trí Tuệ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* SP Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{skillPoints} SP</span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-4 pt-3 gap-2 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-card-subtle)]/50">
          <button
            type="button"
            onClick={() => setActiveTab('rpg_tree')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'rpg_tree'
                ? 'border-indigo-400 text-indigo-200'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cây Kỹ Năng Tam Vị Nhất Thể</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certifications')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'certifications'
                ? 'border-indigo-400 text-indigo-200'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-indigo-500/30 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Học Viện Kỹ Năng &amp; Sát Hạch Mini-game</h4>
                  <p className="text-[11px] text-slate-400">Tham gia kỳ thi sát hạch để nhận chứng chỉ chuyên môn và gia tăng thu nhập suốt đời.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10.5px] text-slate-400">Độ tuổi tối thiểu:</span>
                  <span className="text-xs font-bold text-amber-300 block">6 Tuổi trở lên</span>
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
                        ? 'bg-indigo-950/80 border-indigo-500/70 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{b.icon}</span>
                      <span className="text-xs font-bold">{b.name}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 line-clamp-2">{b.desc}</p>
                  </button>
                ))}
              </div>

              {/* Certification Levels */}
              <div className="space-y-2.5">
                {currentCertBranch.levels.map(lvl => (
                  <div
                    key={lvl.level}
                    className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          Cấp {lvl.level}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-white">{lvl.title}</h5>
                      </div>
                      <p className="text-[11px] text-emerald-300 font-semibold mt-1">
                        ★ {lvl.perkTitle}: <span className="text-slate-300 font-normal">{lvl.perkDesc}</span>
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
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-md transition active:scale-95"
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
