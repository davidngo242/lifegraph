'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  Briefcase,
  Users,
  Compass,
  ArrowRight,
  Shield,
  Zap,
  Award,
  Home,
  Building,
  Heart,
  TrendingUp,
  Brain,
  Feather
} from 'lucide-react';
import Tooltip from '../Tooltip';

export interface SkillNode {
  id: string;
  tier: number;
  name: string;
  icon: string;
  costSp: number;
  requires: string | null;
  description: string;
  effects: Record<string, any>;
}

export interface SkillBranch {
  id: string;
  name: string;
  icon: string;
  description: string;
  skills: SkillNode[];
}

export interface TreeResonance {
  id: string;
  name: string;
  icon: string;
  pairNames: string[];
  reqSkills: string[];
  description: string;
  effectText: string;
}

export const TREE_RESONANCES: TreeResonance[] = [
  {
    id: "family_trust_fund",
    name: "Quỹ Tín Thác Gia Tộc",
    icon: "🏛️",
    pairNames: ["Gia Phong", "Tư Bản"],
    reqSkills: ["leverage_power", "negotiation_master"],
    description: "Gia phong hậu thuẫn hòa quyện đòn bẩy tài chính sắc bén.",
    effectText: "Giảm 50% chi phí bảo trì dinh thự & bảo lãnh vốn ưu đãi 0% lãi suất khi nguy cấp."
  },
  {
    id: "tech_unicorn",
    name: "Kỳ Lân Đổi Mới",
    icon: "🚀",
    pairNames: ["Tư Bản", "Trí Tuệ"],
    reqSkills: ["negotiation_master", "encyclopedic_brain"],
    description: "Tư bản nhạy bén kết hợp bách khoa trí tuệ đỉnh cao.",
    effectText: "+15% cổ tức tài chính hàng năm & giảm 30% kiệt sức khi làm việc trí óc."
  },
  {
    id: "scholarly_dynasty",
    name: "Danh Gia Trí Thức",
    icon: "📜",
    pairNames: ["Gia Phong", "Trí Tuệ"],
    reqSkills: ["leverage_power", "encyclopedic_brain"],
    description: "Thế gia đạo học nho nhã truyền đời muôn thế hệ.",
    effectText: "+15 Karma gia tộc mỗi năm & con cái sinh ra tăng cao cơ hội thừa hưởng gen Thần Đồng."
  },
  {
    id: "trinity_perfection",
    name: "Tam Vị Nhất Thể Hoàn Hảo",
    icon: "🌟",
    pairNames: ["Gia Phong", "Tư Bản", "Trí Tuệ"],
    reqSkills: ["syndicate_kingmaker", "capital_engine", "transcendence_sage"],
    description: "Đại cảnh giới tối thượng: Đỉnh cao gia tộc, tư bản tự động & giác ngộ trường sinh.",
    effectText: "Bảo tồn 100% Karma luân hồi, vĩnh viễn +2 AP khởi đầu kiếp sau & +25 Karma/năm."
  }
];

export const DEFAULT_TREE: Record<string, SkillBranch> = {
  social: {
    id: "social",
    name: "🌿 Gia Phong & Huyết Thống",
    icon: "🌿",
    description: "Gốc rễ dòng tộc, kết nối huyết thống, nuôi dạy hiền tài và truyền thừa gia phả muôn đời.",
    skills: [
      {
        id: "charisma_magnet",
        tier: 1,
        name: "Hiếu Đạo Gia Phong",
        icon: "✨",
        costSp: 1,
        requires: null,
        description: "Gia đạo thuận hòa, chữ hiếu làm đầu. Tăng gấp đôi tốc độ tăng cấp hảo cảm Social Link với các NPC và người thân.",
        effects: { social_link_exp_boost: 2.0, network_cost_discount: 0.5 }
      },
      {
        id: "leverage_power",
        tier: 2,
        name: "Gia Tộc Đồng Tâm",
        icon: "⚖️",
        costSp: 2,
        requires: "charisma_magnet",
        description: "Dòng họ tương trợ, quý nhân đỡ đầu. Nhờ cậy quý nhân can thiệp xóa nợ xấu hoặc bảo lãnh thăng chức.",
        effects: { unlock_npc_favor: true, crisis_bailout_available: true }
      },
      {
        id: "syndicate_kingmaker",
        tier: 3,
        name: "Đại Gia Tộc Bất Diệt",
        icon: "🏛️",
        costSp: 3,
        requires: "leverage_power",
        description: "Gia phả hiển hách, thế gia vọng tộc. Đời sau thừa hưởng trọn vẹn mạng lưới danh giá và giảm 50% thuế thừa kế.",
        effects: { dynasty_influence_bonus: 50, patron_inheritance: true }
      }
    ]
  },
  wealth: {
    id: "wealth",
    name: "🪙 Tư Bản & Sản Nghiệp",
    icon: "🪙",
    description: "Làm chủ dòng tiền, thâu tóm sản nghiệp hoàng kim và tự động hóa cỗ máy tài chính.",
    skills: [
      {
        id: "market_sense_1",
        tier: 1,
        name: "Mắt Thần Định Giá",
        icon: "👁️",
        costSp: 1,
        requires: null,
        description: "Khứu giác thị trường nhạy bén. Giảm 10% giá mua bất động sản & tăng 15% lợi nhuận lướt sóng.",
        effects: { property_discount: 0.1, asset_profit_bonus: 0.15 }
      },
      {
        id: "negotiation_master",
        tier: 2,
        name: "Đàm Phán Sắc Bén & Đòn Bẩy",
        icon: "🤝",
        costSp: 2,
        requires: "market_sense_1",
        description: "Bản lĩnh trên bàn thương thuyết. Cày việc OT nhận thêm +35% thặng dư, tăng thu nhập hàng năm.",
        effects: { overtime_bonus: 0.35, salary_multiplier: 1.25 }
      },
      {
        id: "capital_engine",
        tier: 3,
        name: "Cỗ Máy Dòng Tiền Tự Động",
        icon: "👑",
        costSp: 3,
        requires: "negotiation_master",
        description: "Tiền tự đẻ ra tiền. Tự động sinh lợi tức thụ động $25,000/năm không tiêu tốn bất kỳ giọt sinh lực nào.",
        effects: { passive_income_annual: 25000 }
      }
    ]
  },
  sage: {
    id: "sage",
    name: "🔮 Thân Tâm & Trí Tuệ",
    icon: "🔮",
    description: "Rèn giũa tâm trí khắc kỷ, mở khóa bách khoa toàn thư và giác ngộ đại phước đức trường sinh.",
    skills: [
      {
        id: "stoic_mind",
        tier: 1,
        name: "Khắc Kỷ Tịnh Tâm",
        icon: "🛡️",
        costSp: 1,
        requires: null,
        description: "Khắc kỷ vững vàng, tâm bất biến. Giảm 40% lượng Burnout phải nhận từ công việc và biến cố cuộc sống.",
        effects: { burnout_reduction: 0.4 }
      },
      {
        id: "encyclopedic_brain",
        tier: 2,
        name: "Bách Khoa Toàn Thư",
        icon: "📚",
        costSp: 2,
        requires: "stoic_mind",
        description: "Trí tuệ thông suốt. Tự động nhận điểm tối đa trong các kỳ thi sát hạch và cộng thêm +25 Karma/năm.",
        effects: { academic_mastery: true, karma_annual_buff: 25 }
      },
      {
        id: "transcendence_sage",
        tier: 3,
        name: "Giác Ngộ Niết Bàn",
        icon: "☀️",
        costSp: 3,
        requires: "encyclopedic_brain",
        description: "Thoát ly phàm tục. Gia tăng +15 Thể lực tối đa, kéo dài tuổi thọ và nhân đôi điểm Karma tích lũy khi luân hồi.",
        effects: { max_vitality_bonus: 15, max_lifespan_bonus: 10, rebirth_karma_multiplier: 2.0 }
      }
    ]
  }
};

interface SkillTreeTabProps {
  skillPoints: number;
  unlockedSkills: string[];
  skillTree?: Record<string, SkillBranch>;
  onUnlockSkill: (skillId: string) => Promise<void>;
  isLoading?: boolean;
  characterAge?: number;
  relationships?: any[];
  assets?: any[];
  character?: any;
}

export default function SkillTreeTab({
  skillPoints = 0,
  unlockedSkills = [],
  skillTree = DEFAULT_TREE,
  onUnlockSkill,
  isLoading = false,
  characterAge = 0,
  relationships = [],
  assets = [],
  character
}: SkillTreeTabProps) {
  const [selectedBranch, setSelectedBranch] = useState<'social' | 'wealth' | 'sage'>('social');
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  const branches = Object.values(skillTree || DEFAULT_TREE);
  const currentBranch = (skillTree && skillTree[selectedBranch]) || branches[0];

  const handleUnlock = async (skillId: string) => {
    try {
      setUnlockingId(skillId);
      await onUnlockSkill(skillId);
    } finally {
      setUnlockingId(null);
    }
  };

  const unlockedSet = new Set(unlockedSkills || []);

  // Compute Active Resonances
  const activeResonances = TREE_RESONANCES.map(res => {
    const active = res.reqSkills.every(req => unlockedSet.has(req));
    const activeCount = res.reqSkills.filter(req => unlockedSet.has(req)).length;
    return {
      ...res,
      isActive: active,
      progress: `${activeCount}/${res.reqSkills.length}`
    };
  });

  return (
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-3 md:p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
      
      {/* 1. Header Bar: Title & SP Pill */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[var(--border-subtle)] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <Award className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-extrabold text-[var(--text-primary)]">
                Đại Thụ Kỹ Năng Tam Vị Nhất Thể
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold uppercase tracking-wide">
                The Trinity RPG Tree
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Gốc Rễ Gia Phong • Cành Vàng Tư Bản • Đỉnh Cao Trí Tuệ — Rèn luyện đặc quyền định đoạt vận mệnh
            </p>
          </div>
        </div>

        {/* SP Counter Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-200 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/30 animate-pulse" />
          <span className="text-xs font-bold text-amber-800 dark:text-amber-200">Điểm Kỹ Năng:</span>
          <span className="text-sm md:text-base font-sans tabular-nums font-black text-amber-900 dark:text-amber-300">
            {skillPoints} <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">SP</span>
          </span>
        </div>
      </div>

      {/* 2. Triangle Resonance Synergies HUD (Cộng Hưởng Tam Giác Sinh Mệnh) */}
      <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] shadow-inner space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Cộng Hưởng Tam Giác Sinh Mệnh (Resonance Synergies)
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-sans tabular-nums">
            {activeResonances.filter(r => r.isActive).length}/{TREE_RESONANCES.length} Đang Kích Hoạt
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {activeResonances.map(res => {
            return (
              <Tooltip
                key={res.id}
                position="top"
                align="center"
                content={`${res.name}: ${res.description} [Hiệu ứng: ${res.effectText}] (Yêu cầu: ${res.progress})`}
              >
                <div
                  className={`p-2 rounded-xl border transition flex items-center justify-between gap-2 cursor-help ${
                    res.isActive
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm shrink-0">{res.icon}</span>
                    <span className="text-xs font-bold truncate">
                      {res.name}
                    </span>
                  </div>
                  {res.isActive ? (
                    <span className="text-xs px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold shrink-0">
                      ✓ Sẵn Sàng
                    </span>
                  ) : (
                    <span className="text-xs font-sans tabular-nums px-1.5 py-0.2 rounded-full bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shrink-0">
                      {res.progress}
                    </span>
                  )}
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* 3. The Three Trinity Pillar Selectors (Gia Phong, Tư Bản, Trí Tuệ) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {branches.map(b => {
          const isSelected = selectedBranch === b.id;
          const unlockedInBranch = b.skills.filter(s => unlockedSet.has(s.id)).length;
          
          // Contextual indicator based on pillar
          let pillarMeta = '';
          if (b.id === 'social') {
            pillarMeta = `${relationships.length} người thân`;
          } else if (b.id === 'wealth') {
            pillarMeta = `${assets.length} tài sản`;
          } else {
            pillarMeta = `${character?.karma ?? 50} Karma`;
          }

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBranch(b.id as any)}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-98 flex flex-col gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-br from-amber-500/20 via-[var(--bg-card)] to-[var(--bg-card-subtle)] border-amber-500/60 shadow-md ring-1 ring-amber-500/40 text-[var(--text-primary)]'
                  : 'bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">{b.icon}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-sans tabular-nums px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-indigo-700 dark:text-indigo-300 border border-[var(--border-subtle)] font-bold">
                    {unlockedInBranch}/{b.skills.length}
                  </span>
                </div>
              </div>

              <div>
                <div className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-[var(--text-primary)] font-extrabold' : 'text-[var(--text-secondary)]'}`}>
                  {b.name}
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] mt-0.5">
                  <span>Hệ sinh thái:</span>
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">{pillarMeta}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Branch Description Header */}
      <div className="p-2.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-center gap-2.5">
        <span className="text-base shrink-0">{currentBranch.icon}</span>
        <span className="leading-relaxed">{currentBranch.description}</span>
      </div>

      {/* 5. Skill Progression Pathway (Tier 1 -> Tier 2 -> Tier 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {currentBranch.skills.map((skill) => {
          const isUnlocked = unlockedSet.has(skill.id);
          const hasPrereq = !skill.requires || unlockedSet.has(skill.requires);
          const canAfford = skillPoints >= skill.costSp;
          const canUnlock = !isUnlocked && hasPrereq && canAfford;

          return (
            <div
              key={skill.id}
              className={`relative p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                isUnlocked
                  ? 'bg-gradient-to-br from-emerald-500/10 via-[var(--bg-card-subtle)] to-[var(--bg-card-subtle)] border-emerald-500/50 shadow-sm'
                  : canUnlock
                  ? 'bg-gradient-to-br from-amber-500/10 via-[var(--bg-card-subtle)] to-indigo-500/10 border-amber-500/50 shadow-sm'
                  : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] opacity-60'
              }`}
            >
              {/* Card Header: Tier & Cost */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans tabular-nums font-bold px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  Cấp {skill.tier}
                </span>
                {isUnlocked ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Đã Mở Khóa
                  </span>
                ) : (
                  <span className={`text-xs font-sans tabular-nums font-bold px-2 py-0.5 rounded-full border ${
                    canAfford
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                  }`}>
                    {skill.costSp} SP
                  </span>
                )}
              </div>

              {/* Skill Core Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shrink-0">
                    {skill.icon}
                  </span>
                  <div className="min-w-0">
                    <h4 className={`text-xs sm:text-sm font-bold truncate ${isUnlocked ? 'text-emerald-700 dark:text-emerald-300' : 'text-[var(--text-primary)]'}`}>
                      {skill.name}
                    </h4>
                    {skill.requires && !hasPrereq && (
                      <span className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                        <Lock className="w-2.5 h-2.5" /> Yêu cầu mở khóa Cấp {skill.tier - 1}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {skill.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                {isUnlocked ? (
                  <div className="w-full py-1.5 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 rounded-xl border border-emerald-500/25 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đặc Quyền Vĩnh Viễn Đang Kích Hoạt</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUnlock(skill.id)}
                    disabled={!canUnlock || isLoading || unlockingId !== null}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow ${
                      canUnlock
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black cursor-pointer'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {unlockingId === skill.id ? (
                      <span className="animate-pulse">Đang rèn luyện...</span>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Mở Khóa ({skill.costSp} SP)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
