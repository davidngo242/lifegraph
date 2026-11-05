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
  Award
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

interface SkillTreeTabProps {
  skillPoints: number;
  unlockedSkills: string[];
  skillTree?: Record<string, SkillBranch>;
  onUnlockSkill: (skillId: string) => Promise<void>;
  isLoading?: boolean;
}

const DEFAULT_TREE: Record<string, SkillBranch> = {
  wealth: {
    id: "wealth",
    name: "Thương Trường & Tài Phiệt",
    icon: "💼",
    description: "Làm chủ dòng tiền, thâu tóm tài sản và tối ưu hóa lợi nhuận đầu tư.",
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
        name: "Đàm Phán Khắc Nghiệt",
        icon: "🤝",
        costSp: 2,
        requires: "market_sense_1",
        description: "Bản lĩnh trên bàn thương thuyết. Cày việc OT nhận thêm +35% thặng dư, tăng thu nhập hàng năm.",
        effects: { overtime_bonus: 0.35, salary_multiplier: 1.25 }
      },
      {
        id: "capital_engine",
        tier: 3,
        name: "Cỗ Máy Dòng Tiền",
        icon: "👑",
        costSp: 3,
        requires: "negotiation_master",
        description: "Tiền tự đẻ ra tiền. Tự động sinh lợi tức thụ động $25,000/năm không tiêu tốn sinh lực.",
        effects: { passive_income_annual: 25000 }
      }
    ]
  },
  social: {
    id: "social",
    name: "Uy Quyền & Nhân Mạch",
    icon: "🤝",
    description: "Mở rộng quan hệ quý nhân, thao túng cục diện xã hội và nâng đỡ gia tộc.",
    skills: [
      {
        id: "charisma_magnet",
        tier: 1,
        name: "Hào Quang Cuốn Hút",
        icon: "✨",
        costSp: 1,
        requires: null,
        description: "Khí chất cuốn hút tự nhiên. Tăng gấp đôi tốc độ tăng cấp hảo cảm Social Link với các NPC.",
        effects: { social_link_exp_boost: 2.0, network_cost_discount: 0.5 }
      },
      {
        id: "leverage_power",
        tier: 2,
        name: "Mượn Gió Bẻ Măng",
        icon: "⚖️",
        costSp: 2,
        requires: "charisma_magnet",
        description: "Nhờ cậy quý nhân tháo gỡ bế tắc. Có thể yêu cầu Quý nhân can thiệp xóa nợ xấu hoặc bảo lãnh thăng chức.",
        effects: { unlock_npc_favor: true, crisis_bailout_available: true }
      },
      {
        id: "syndicate_kingmaker",
        tier: 3,
        name: "Đế Chế Nhân Mạch",
        icon: "🏛️",
        costSp: 3,
        requires: "leverage_power",
        description: "Nắm trong tay mạng lưới đầu sỏ. Đời sau thừa hưởng sẵn các mối quan hệ đỡ đầu danh giá từ đời trước.",
        effects: { dynasty_influence_bonus: 50, patron_inheritance: true }
      }
    ]
  },
  sage: {
    id: "sage",
    name: "Tâm Thức & Chân Nhân",
    icon: "🧘",
    description: "Rèn giũa tâm trí thép, trường thọ vô ưu và tích lũy đại phước đức chuyển kiếp.",
    skills: [
      {
        id: "stoic_mind",
        tier: 1,
        name: "Tâm Lý Thép",
        icon: "🛡️",
        costSp: 1,
        requires: null,
        description: "Khắc kỷ vững vàng. Giảm 40% lượng Burnout phải nhận từ công việc và biến cố cuộc sống.",
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

export default function SkillTreeTab({
  skillPoints = 0,
  unlockedSkills = [],
  skillTree = DEFAULT_TREE,
  onUnlockSkill,
  isLoading = false
}: SkillTreeTabProps) {
  const [selectedBranch, setSelectedBranch] = useState<'wealth' | 'social' | 'sage'>('wealth');
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  const branches = Object.values(skillTree || DEFAULT_TREE);
  const currentBranch = skillTree[selectedBranch] || branches[0];

  const handleUnlock = async (skillId: string) => {
    try {
      setUnlockingId(skillId);
      await onUnlockSkill(skillId);
    } finally {
      setUnlockingId(null);
    }
  };

  return (
    <div className="w-full bg-slate-900/95 border border-indigo-500/30 rounded-3xl p-3 md:p-4 shadow-xl backdrop-blur-xl flex flex-col gap-3">
      {/* Header: Skill Points Available */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Award className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Cây Kỹ Năng Cuộc Đời</span>
              <span className="text-[11px] text-indigo-300 font-normal">Tri-Branch RPG Build</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Dùng Điểm Kỹ Năng (SP) nhận được khi thăng cấp để mở khóa các đặc quyền vĩnh viễn.
            </span>
          </div>
        </div>

        {/* SP Counter Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-950/80 border border-amber-500/50 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30 animate-pulse" />
          <span className="text-xs font-bold text-amber-200">Điểm Kỹ Năng:</span>
          <span className="text-sm font-sans tabular-nums font-black text-amber-300">
            {skillPoints} <span className="text-[10px] font-semibold text-amber-400/80">SP</span>
          </span>
        </div>
      </div>

      {/* Branch Selector Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {branches.map(b => {
          const isSelected = selectedBranch === b.id;
          const unlockedInBranch = b.skills.filter(s => unlockedSkills.includes(s.id)).length;
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b.id as any)}
              className={`p-2 rounded-2xl border text-left transition active:scale-98 flex flex-col gap-1 ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border-indigo-500/60 shadow-md'
                  : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">{b.icon}</span>
                <span className="text-[10px] font-sans tabular-nums px-1.5 py-0.2 rounded-full bg-slate-900 text-indigo-300 border border-slate-800">
                  {unlockedInBranch}/{b.skills.length}
                </span>
              </div>
              <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {b.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Branch Description Banner */}
      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-300 flex items-center gap-2">
        <span className="text-sm">{currentBranch.icon}</span>
        <span>{currentBranch.description}</span>
      </div>

      {/* Skill Progression Pathway (Tier 1 -> Tier 2 -> Tier 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-1">
        {currentBranch.skills.map((skill, idx) => {
          const isUnlocked = unlockedSkills.includes(skill.id);
          const hasPrereq = !skill.requires || unlockedSkills.includes(skill.requires);
          const canAfford = skillPoints >= skill.costSp;
          const canUnlock = !isUnlocked && hasPrereq && canAfford;

          return (
            <div
              key={skill.id}
              className={`relative p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                isUnlocked
                  ? 'bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border-emerald-500/50 shadow-md'
                  : canUnlock
                  ? 'bg-gradient-to-br from-amber-950/30 via-slate-950 to-indigo-950/20 border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/50 border-slate-800/60 opacity-60'
              }`}
            >
              {/* Card Header: Tier & Cost */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans tabular-nums font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  Cấp {skill.tier}
                </span>
                {isUnlocked ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Đã Mở Khóa
                  </span>
                ) : (
                  <span className={`text-[10px] font-sans tabular-nums font-bold px-2 py-0.5 rounded-full border ${
                    canAfford
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {skill.costSp} SP
                  </span>
                )}
              </div>

              {/* Skill Core Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {skill.icon}
                  </span>
                  <div>
                    <h4 className={`text-xs font-bold ${isUnlocked ? 'text-emerald-200' : 'text-white'}`}>
                      {skill.name}
                    </h4>
                    {skill.requires && !hasPrereq && (
                      <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Cần mở khóa Cấp trước
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                  {skill.description}
                </p>
              </div>

              {/* Action Button */}
              <div>
                {isUnlocked ? (
                  <div className="w-full py-1 text-center text-[10.5px] font-bold text-emerald-400/90 bg-emerald-950/30 rounded-xl border border-emerald-500/20">
                    ✓ Đặc Quyền Đang Kích Hoạt
                  </div>
                ) : (
                  <button
                    onClick={() => handleUnlock(skill.id)}
                    disabled={!canUnlock || isLoading || unlockingId !== null}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow ${
                      canUnlock
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black'
                        : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    {unlockingId === skill.id ? (
                      <span className="animate-pulse">Đang mở khóa...</span>
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
