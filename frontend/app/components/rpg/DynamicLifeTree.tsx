'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Heart,
  BookOpen,
  Briefcase,
  Users,
  Compass,
  Smile,
  Shield,
  Award,
  Baby,
  ChevronRight,
  TrendingUp,
  Dices,
  Flame,
  ArrowUpRight,
  DollarSign,
  Building,
  Home,
  Utensils,
  MessageSquare,
  FastForward,
  CheckCircle2,
  Lock
} from 'lucide-react';
import Tooltip from '../Tooltip';
import { formatCurrency } from '../../utils/currencyUtils';
import SkillTreeTab from './SkillTreeTab';
import SocialLinksTab from './SocialLinksTab';

export interface LifeTreeNode {
  id: string;
  title: string;
  category: 'vitality' | 'wisdom' | 'family' | 'career' | 'destiny';
  icon: string;
  apCost: number;
  gainText: string;
  flavor: string;
  isBreakthrough?: boolean;
  disabled?: boolean;
  angleDeg: number;
  distanceRatio: number;
  color: {
    border: string;
    bg: string;
    glow: string;
    text: string;
    line: string;
  };
}

export interface DynamicLifeTreeProps {
  characterAge: number;
  actionPoints: number;
  totalAp: number;
  vitality?: number;
  cash?: number;
  netWorth?: number;
  character?: any;
  relationships?: any[];
  assets?: any[];
  onChildAction?: (actionKey: string, apCost?: number) => void;
  onAdultAction?: (actionKey: string, apCost: number, cashCost: number) => void;
  onBreakthrough?: () => void;
  breakthroughAction?: {
    id: string;
    title: string;
    icon?: string;
    description: string;
    costAp?: number;
    costCash?: number;
  } | null;
  onFastForwardToSchool?: () => void;
  onTimeSkip?: () => void;
  onOpenAssets?: () => void;
  onOpenFamily?: () => void;
  onOpenSkillHub?: () => void;
  onUnlockSkill?: (skillId: string) => Promise<void>;
  onNpcInteract?: (npcId: string, actionType: 'socialize' | 'gift' | 'request_favor') => Promise<void>;
  onFamilyMeal?: () => void;
  onFamilyMentorship?: () => void;
  onRpgActivePerk?: (type: string) => void;
  isLoading?: boolean;
}

export default function DynamicLifeTree({
  characterAge,
  actionPoints,
  totalAp,
  vitality = 80,
  cash = 0,
  netWorth = 0,
  character,
  relationships = [],
  assets = [],
  onChildAction,
  onAdultAction,
  onBreakthrough,
  breakthroughAction,
  onFastForwardToSchool,
  onTimeSkip,
  onOpenAssets,
  onOpenFamily,
  onOpenSkillHub,
  onUnlockSkill,
  onNpcInteract,
  onFamilyMeal,
  onFamilyMentorship,
  onRpgActivePerk,
  isLoading = false
}: DynamicLifeTreeProps) {
  const [treeViewMode, setTreeViewMode] = useState<'life_actions' | 'skill_tree' | 'social_links'>('life_actions');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [pulseActiveId, setPulseActiveId] = useState<string | null>(null);

  const nationality = character?.nationality || 'Việt Nam';
  const formattedCash = formatCurrency(cash, nationality);
  const formattedNetWorth = formatCurrency(netWorth, nationality);

  // Household & Parents status
  const household = character?.household;
  const isParentsDeceased = household?.parents_status === 'deceased' || household?.parents_status === 'deceased_or_abandoned';
  const canEatMeal = household && !isParentsDeceased && (household.family_meals_available ?? 1) > 0;
  const canMentor = household && !isParentsDeceased && (household.family_mentorship_used !== characterAge);

  // Generate dynamic nodes based on life stage
  const getNodesForStage = (): LifeTreeNode[] => {
    // Stage 1: Sơ sinh & Ấu thơ (0 - 5 Tuổi)
    if (characterAge <= 5) {
      const nodes: LifeTreeNode[] = [
        {
          id: 'eat_grow',
          title: 'Bú Mẹ & Ăn Dặm',
          category: 'vitality',
          icon: '🍼',
          apCost: 1,
          gainText: '+15 Thể chất, +5 HP',
          flavor: 'Hấp thu nguồn sữa ngọt lành và vi chất nuôi lớn cơ thể non nớt',
          angleDeg: -135,
          distanceRatio: 0.72,
          color: {
            border: 'border-emerald-500/50',
            bg: 'bg-emerald-950/70',
            glow: '#10b981',
            text: 'text-emerald-300',
            line: '#059669'
          }
        },
        {
          id: 'sunbath',
          title: 'Tắm Nắng Sớm',
          category: 'vitality',
          icon: '☀️',
          apCost: 1,
          gainText: '+10 Đề kháng, -5 Stress',
          flavor: 'Phơi nắng sớm ban mai hấp thu Vitamin D tự nhiên làm chắc xương',
          angleDeg: -75,
          distanceRatio: 0.76,
          color: {
            border: 'border-amber-500/50',
            bg: 'bg-amber-950/70',
            glow: '#f59e0b',
            text: 'text-amber-300',
            line: '#d97706'
          }
        },
        {
          id: 'toy_brain',
          title: 'Đồ Chơi Trí Não',
          category: 'wisdom',
          icon: '🧸',
          apCost: 1,
          gainText: '+10 Trí tuệ, +5 Karma',
          flavor: 'Chơi xếp hình khối và lục lạc kích thích liên kết tế bào thần kinh',
          angleDeg: -15,
          distanceRatio: 0.74,
          color: {
            border: 'border-sky-500/50',
            bg: 'bg-sky-950/70',
            glow: '#0284c7',
            text: 'text-sky-300',
            line: '#0284c7'
          }
        },
        {
          id: 'toddler_walk',
          title: 'Tập Đi & Bập Bẹ',
          category: 'vitality',
          icon: '👶',
          apCost: 1,
          gainText: '+3 Max HP, +8 Thể lực',
          flavor: 'Chập chững những bước chân đầu đời khám phá thế giới xung quanh',
          angleDeg: 45,
          distanceRatio: 0.75,
          color: {
            border: 'border-teal-500/50',
            bg: 'bg-teal-950/70',
            glow: '#14b8a6',
            text: 'text-teal-300',
            line: '#0d9488'
          }
        },
        {
          id: 'cuddle_parents',
          title: 'Làm Nũng Phụ Mẫu',
          category: 'family',
          icon: '💖',
          apCost: 1,
          gainText: '+15 Tình cảm, -10 Stress',
          flavor: 'Sà vào lòng cha mẹ cảm nhận tình yêu thương vô điều kiện',
          angleDeg: 120,
          distanceRatio: 0.72,
          color: {
            border: 'border-pink-500/50',
            bg: 'bg-pink-950/70',
            glow: '#f43f5e',
            text: 'text-pink-300',
            line: '#e11d48'
          }
        }
      ];

      if (breakthroughAction) {
        nodes.push({
          id: 'breakthrough',
          title: breakthroughAction.title,
          category: 'destiny',
          icon: breakthroughAction.icon || '🚀',
          apCost: breakthroughAction.costAp || 2,
          gainText: 'ĐỘT PHÁ SỐ MỆNH',
          flavor: breakthroughAction.description,
          isBreakthrough: true,
          angleDeg: 180,
          distanceRatio: 0.88,
          color: {
            border: 'border-amber-400',
            bg: 'bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950',
            glow: '#eab308',
            text: 'text-amber-200',
            line: '#f59e0b'
          }
        });
      }

      return nodes;
    }

    // Stage 2: Tuổi Học Trò (6 - 17 Tuổi)
    if (characterAge <= 17) {
      const nodes: LifeTreeNode[] = [
        {
          id: 'school_study',
          title: 'Học Bài Ở Trường',
          category: 'wisdom',
          icon: '🎒',
          apCost: 1,
          gainText: '+12 Karma học vấn',
          flavor: 'Chăm chỉ nghe giảng, giành danh hiệu học sinh xuất sắc',
          angleDeg: -120,
          distanceRatio: 0.75,
          color: {
            border: 'border-sky-500/50',
            bg: 'bg-sky-950/70',
            glow: '#38bdf8',
            text: 'text-sky-300',
            line: '#0284c7'
          }
        },
        {
          id: 'help_chores',
          title: 'Việc Nhà Phụ Mẹ',
          category: 'family',
          icon: '🧹',
          apCost: 1,
          gainText: '+$25 tiền tiêu vặt, +Gia đạo',
          flavor: 'Quét nhà rửa chén, đỡ đần cha mẹ và học tính tự lập',
          angleDeg: -60,
          distanceRatio: 0.72,
          color: {
            border: 'border-emerald-500/50',
            bg: 'bg-emerald-950/70',
            glow: '#10b981',
            text: 'text-emerald-300',
            line: '#059669'
          }
        },
        {
          id: 'play_sports',
          title: 'Đá Bóng Cùng Bạn',
          category: 'vitality',
          icon: '⚽',
          apCost: 1,
          gainText: '+10 HP, -20 Stress',
          flavor: 'Rèn luyện thể lực dẻo dai và gắn kết tình bạn thanh xuân',
          angleDeg: 10,
          distanceRatio: 0.75,
          color: {
            border: 'border-amber-500/50',
            bg: 'bg-amber-950/70',
            glow: '#f59e0b',
            text: 'text-amber-300',
            line: '#d97706'
          }
        },
        {
          id: 'explore_nature',
          title: 'Khám Phá Thiên Nhiên',
          category: 'wisdom',
          icon: '🌲',
          apCost: 1,
          gainText: '+Khám phá, Nuôi dưỡng tâm hồn',
          flavor: 'Dạo chơi đồng nội, quan sát vạn vật sinh sôi',
          angleDeg: 80,
          distanceRatio: 0.74,
          color: {
            border: 'border-teal-500/50',
            bg: 'bg-teal-950/70',
            glow: '#14b8a6',
            text: 'text-teal-300',
            line: '#0d9488'
          }
        },
        {
          id: 'talk_parents',
          title: 'Tâm Sự Cha Mẹ',
          category: 'family',
          icon: '👨‍👩‍👧',
          apCost: 1,
          gainText: '+Hảo cảm, Gia đạo thuận hòa',
          flavor: 'Lắng nghe lời khuyên răn dạy dỗ của đấng sinh thành',
          angleDeg: 145,
          distanceRatio: 0.75,
          color: {
            border: 'border-purple-500/50',
            bg: 'bg-purple-950/70',
            glow: '#a855f7',
            text: 'text-purple-300',
            line: '#9333ea'
          }
        }
      ];

      if (breakthroughAction) {
        nodes.push({
          id: 'breakthrough',
          title: breakthroughAction.title,
          category: 'destiny',
          icon: breakthroughAction.icon || '🚀',
          apCost: breakthroughAction.costAp || 2,
          gainText: 'ĐỘT PHÁ SỐ MỆNH',
          flavor: breakthroughAction.description,
          isBreakthrough: true,
          angleDeg: 180,
          distanceRatio: 0.88,
          color: {
            border: 'border-amber-400',
            bg: 'bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950',
            glow: '#eab308',
            text: 'text-amber-200',
            line: '#f59e0b'
          }
        });
      }

      return nodes;
    }

    // Stage 3: Trưởng Thành & Đời Thực (18+ Tuổi)
    const adultNodes: LifeTreeNode[] = [
      {
        id: 'work',
        title: 'Cày Cuốc Kiếm Tiền',
        category: 'career',
        icon: '💼',
        apCost: 1,
        gainText: '+$1.5k~$7k Thặng dư',
        flavor: 'Làm việc chăm chỉ, tạo dựng nền tảng tài chính tự do',
        angleDeg: -130,
        distanceRatio: 0.76,
        color: {
          border: 'border-emerald-500/50',
          bg: 'bg-emerald-950/70',
          glow: '#10b981',
          text: 'text-emerald-300',
          line: '#059669'
        }
      },
      {
        id: 'study',
        title: 'Đèn Sách Tri Thức',
        category: 'wisdom',
        icon: '📚',
        apCost: 1,
        gainText: '+8 Karma, Nâng trình chuyên môn',
        flavor: 'Đầu tư học thêm kỹ năng và tích lũy học vấn cao cấp',
        angleDeg: -60,
        distanceRatio: 0.72,
        color: {
          border: 'border-sky-500/50',
          bg: 'bg-sky-950/70',
          glow: '#0284c7',
          text: 'text-sky-300',
          line: '#0284c7'
        }
      },
      {
        id: 'wellness',
        title: 'Dưỡng Sinh Hồi Phục',
        category: 'vitality',
        icon: '🌿',
        apCost: 1,
        gainText: '+15 Sinh lực, -25 Stress',
        flavor: 'Tập yoga, thiền định và chữa lành sau những ngày cày việc',
        angleDeg: 20,
        distanceRatio: 0.74,
        color: {
          border: 'border-teal-500/50',
          bg: 'bg-teal-950/70',
          glow: '#14b8a6',
          text: 'text-teal-300',
          line: '#0d9488'
        }
      },
      {
        id: 'network',
        title: 'Mở Rộng Nhân Mạch',
        category: 'family',
        icon: '🤝',
        apCost: 1,
        gainText: 'Gặp gỡ tri kỷ, Mở lối làm ăn',
        flavor: 'Tham gia hội thảo, mở rộng các mối quan hệ chất lượng',
        angleDeg: 90,
        distanceRatio: 0.76,
        color: {
          border: 'border-purple-500/50',
          bg: 'bg-purple-950/70',
          glow: '#a855f7',
          text: 'text-purple-300',
          line: '#9333ea'
        }
      },
      {
        id: 'gamble',
        title: 'Lướt Sóng & Thử Vận',
        category: 'career',
        icon: '🎲',
        apCost: 1,
        gainText: 'Cơ hội x2 vốn hoặc rủi ro',
        flavor: 'Đầu tư mạo hiểm nắm bắt các chu kỳ tài sản chớp nhoáng',
        angleDeg: 150,
        distanceRatio: 0.72,
        color: {
          border: 'border-fuchsia-500/50',
          bg: 'bg-fuchsia-950/70',
          glow: '#d946ef',
          text: 'text-fuchsia-300',
          line: '#c026d3'
        }
      }
    ];

    if (breakthroughAction) {
      adultNodes.push({
        id: 'breakthrough',
        title: breakthroughAction.title,
        category: 'destiny',
        icon: breakthroughAction.icon || '🚀',
        apCost: breakthroughAction.costAp || 2,
        gainText: 'ĐỘT PHÁ SỐ MỆNH',
        flavor: breakthroughAction.description,
        isBreakthrough: true,
        angleDeg: 180,
        distanceRatio: 0.88,
        color: {
          border: 'border-amber-400',
          bg: 'bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950',
          glow: '#eab308',
          text: 'text-amber-200',
          line: '#f59e0b'
        }
      });
    }

    return adultNodes;
  };

  const nodes = getNodesForStage();

  const handleNodeClick = (node: LifeTreeNode) => {
    if (isLoading || actionPoints < node.apCost) return;

    setPulseActiveId(node.id);
    setTimeout(() => setPulseActiveId(null), 600);

    if (node.isBreakthrough) {
      if (onBreakthrough) onBreakthrough();
      return;
    }

    if (characterAge <= 5) {
      if (onChildAction) onChildAction(node.id, node.apCost);
    } else {
      if (onAdultAction) onAdultAction(node.id, node.apCost, 0);
    }
  };

  // 5 Life Stages Procedural Evolution (Đại Thụ Tiến Hóa Thủ Tục)
  const getGrowthStage = (age: number): 'sprout' | 'sapling' | 'flourishing_oak' | 'grand_pillar' | 'ancient_world_tree' => {
    if (age <= 5) return 'sprout';
    if (age <= 17) return 'sapling';
    if (age <= 35) return 'flourishing_oak';
    if (age <= 55) return 'grand_pillar';
    return 'ancient_world_tree';
  };
  const growthStage = getGrowthStage(characterAge);

  const STAGE_META = {
    sprout: {
      label: 'Mầm Non Búp Măng',
      ageSpan: '0 - 5 Tuổi',
      icon: '🌱',
      themeColor: '#10b981',
      desc: 'Rễ non ôm đất mẹ, vươn 2 chồi non bập bẹ tập đi.'
    },
    sapling: {
      label: 'Cây Non Vươn Cành',
      ageSpan: '6 - 17 Tuổi',
      icon: '🌿',
      themeColor: '#059669',
      desc: 'Thân non vươn cành thẳng tắp, học hành tri thức và bạn bè đồng trang lứa.'
    },
    flourishing_oak: {
      label: 'Thần Mộc Bùng Nở',
      ageSpan: '18 - 35 Tuổi',
      icon: '🌳',
      themeColor: '#6366f1',
      desc: 'Thần mộc vạm vỡ phân tỏa 3 Trụ Cột Quang Minh: Kỹ Năng, Nhân Mạch, Tài Sản.'
    },
    grand_pillar: {
      label: 'Đại Thụ Vững Chãi',
      ageSpan: '36 - 55 Tuổi',
      icon: '🛡️',
      themeColor: '#d97706',
      desc: 'Rễ cọc đâm sâu ngàn dặm, tán đại thụ rợp bóng che chở gia đình và cơ nghiệp.'
    },
    ancient_world_tree: {
      label: 'Cổ Thụ Hoàng Kim',
      ageSpan: '56+ Tuổi',
      icon: '👑',
      themeColor: '#fbbf24',
      desc: 'Cổ thụ kết tinh linh khí đất trời, quả di sản hoàng kim truyền thừa muôn đời.'
    }
  };

  // SVG Dimension Constants
  const canvasWidth = 640;
  const canvasHeight = 340;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const baseRadius = 145;

  return (
    <div className="w-full rounded-3xl bg-slate-950/95 border border-indigo-500/30 p-3 sm:p-4 shadow-2xl relative overflow-hidden flex flex-col gap-3 backdrop-blur-xl">
      {/* Background Starfield Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] bg-gradient-to-br from-indigo-900/15 via-purple-900/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap relative z-10 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Đại Thụ Sinh Mệnh Toàn Năng</span>
              <span className="text-[10px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Tuổi {characterAge}
              </span>
              <span
                className="text-[10px] font-sans px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold"
                style={{
                  backgroundColor: `${STAGE_META[growthStage].themeColor}20`,
                  color: STAGE_META[growthStage].themeColor,
                  borderColor: `${STAGE_META[growthStage].themeColor}40`
                }}
              >
                <span>{STAGE_META[growthStage].icon}</span>
                <span>{STAGE_META[growthStage].label}</span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Hệ sinh thái cuộc đời: Gốc Rễ Gia Đình · Nhánh Kỹ Năng · Cành Tài Sản · Tán Lá Hành Động.
            </p>
          </div>
        </div>

        {/* AP Balance Indicator & Quick Controls */}
        <div className="flex items-center gap-2">
          <Tooltip content="Điểm Hành Động (Action Points): Năng lượng sinh tồn dùng để thực hiện các bước ngoặt cuộc đời trong năm nay.">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-amber-500/40 text-xs font-semibold text-amber-300 shadow-sm cursor-help">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
              <span className="font-mono font-bold text-sm">{actionPoints}</span>
              <span className="text-slate-500 text-[11px]">/ {totalAp} AP</span>
            </div>
          </Tooltip>

          {/* Quick fast-forwards */}
          {characterAge < 6 && onFastForwardToSchool && (
            <Tooltip content="Tua nhanh qua giai đoạn 0-5 tuổi, bước thẳng vào Lớp 1 (6 tuổi) với ký ức tuổi thơ êm đềm.">
              <button
                onClick={() => {
                  if (window.confirm("Bỏ qua giai đoạn bập bẹ để bước thẳng vào Lớp 1 (6 Tuổi)?")) {
                    onFastForwardToSchool();
                  }
                }}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-[11px] flex items-center gap-1 shadow transition active:scale-95"
              >
                <FastForward className="w-3 h-3 text-amber-300" />
                <span>Lên Lớp 1</span>
              </button>
            </Tooltip>
          )}

          {onTimeSkip && (
            <Tooltip content="Chốt năm trực tiếp, tích trữ AP dư chuyển sang Dưỡng Sinh (+2 HP / -5% Stress) và bước sang tuổi kế tiếp (+1 tuổi).">
              <button
                onClick={onTimeSkip}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs border border-amber-500/40 transition active:scale-95 shadow-sm flex items-center gap-1"
              >
                <span>⏩ Qua Năm (+1t)</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3 UNIFIED ECOSYSTEM TABS (ĐẠI THỤ SINH MỆNH TOÀN NĂNG) */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 w-full sm:w-fit self-start shrink-0 relative z-10 flex-wrap">
        <button
          type="button"
          onClick={() => setTreeViewMode('life_actions')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            treeViewMode === 'life_actions'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🌿 Vòng Đời & Hành Động</span>
        </button>

        <button
          type="button"
          onClick={() => setTreeViewMode('skill_tree')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            treeViewMode === 'skill_tree'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🌟 Cây Kỹ Năng</span>
          {(character?.skill_points || 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-black animate-pulse">
              +{character.skill_points} SP
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTreeViewMode('social_links')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            treeViewMode === 'social_links'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>👥 Nhân Mạch Quý Nhân</span>
          <span className="px-1.5 py-0.2 rounded-full bg-sky-950 text-sky-300 border border-sky-500/40 text-[10px] font-mono font-bold">
            {character?.social_links?.length || 4}
          </span>
        </button>
      </div>

      {treeViewMode === 'life_actions' && (
        <>
          {/* ========================================================================= */}
          {/* 3 SACRED CANOPY PILLARS: KỸ NĂNG (TÂY BẮC), NHÂN MẠCH (TRUNG TÂM), TÀI SẢN (ĐÔNG BẮC) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 relative z-10">
            {/* PILLAR 1: KỸ NĂNG & TRÍ TUỆ (TÂY BẮC) */}
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/30 flex items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-sm shrink-0">
                  🔮
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                      Nhánh Kỹ Năng
                    </span>
                    {(character?.skill_points || 0) > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black animate-pulse">
                        +{character.skill_points} SP
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    Lv.{character?.life_level || 1} · {character?.unlocked_skills?.length || 0} Tố Chất
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {onRpgActivePerk && character?.unlocked_skills?.includes('market_sense_1') && (
                  <Tooltip content="Lướt sóng cổ phiếu: Dùng 1 AP chớp thời cơ thị trường sinh lời">
                    <button
                      disabled={isLoading || actionPoints < 1}
                      onClick={() => onRpgActivePerk('stock_trading')}
                      className="p-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs transition"
                    >
                      📈
                    </button>
                  </Tooltip>
                )}
                {onRpgActivePerk && character?.unlocked_skills?.includes('stoic_mind_1') && (
                  <Tooltip content="Thiền định siêu việt: Dùng 1 AP xóa tan Burnout kiệt sức">
                    <button
                      disabled={isLoading || actionPoints < 1}
                      onClick={() => onRpgActivePerk('zen_meditation')}
                      className="p-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs transition"
                    >
                      🧘
                    </button>
                  </Tooltip>
                )}
                <button
                  type="button"
                  onClick={() => setTreeViewMode('skill_tree')}
                  className="px-2 py-1 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-[10.5px] font-bold transition flex items-center gap-1 active:scale-95"
                >
                  <span>Mở Cây</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* PILLAR 2: NHÂN MẠCH QUÝ NHÂN */}
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-950/60 via-slate-900 to-slate-950 border border-sky-500/30 flex items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sm shrink-0">
                  👥
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">
                      Nhân Mạch Quý Nhân
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                      {character?.social_links?.length || 4}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {character?.social_links?.filter((n: any) => n.linkLevel >= 2).length || 0} Quý Nhân Thân Thiết
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTreeViewMode('social_links')}
                className="px-2 py-1 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/50 text-sky-200 text-[10.5px] font-bold transition flex items-center gap-1 active:scale-95 shrink-0"
              >
                <span>Giao Lưu</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* PILLAR 3: CÀNH HOÀNG KIM TÀI SẢN (ĐÔNG BẮC) */}
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border border-amber-500/30 flex items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm shrink-0">
                  🪙
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                    Cành Hoàng Kim
                  </span>
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    <span className="text-emerald-400 font-mono">{formattedCash.primary}</span>
                    <span className="text-slate-500 text-[10px]">• {assets.length} Tài sản</span>
                  </div>
                </div>
              </div>

              {onOpenAssets && (
                <button
                  type="button"
                  onClick={onOpenAssets}
                  className="px-2 py-1 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-[10.5px] font-bold transition flex items-center gap-1 active:scale-95 shrink-0"
                >
                  <span>Sàn Tài Sản</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

      {/* ========================================================================= */}
      {/* SVG CANVAS: TRỤC THẦN MỘC & CÁC VỆ TINH HÀNH ĐỘNG HẰNG NĂM */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[320px] sm:h-[350px] overflow-hidden flex items-center justify-center rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <svg
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            <linearGradient id="treePulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="ancientWorldTreeGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            <linearGradient id="woodOakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            <linearGradient id="sproutGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            <filter id="coreGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Central Trunk Ambient Circles */}
          <circle
            cx={centerX}
            cy={centerY}
            r={50}
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-30 animate-[spin_30s_linear_infinite]"
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          />

          {/* Ground Curve / Soil Mound */}
          <ellipse cx={centerX} cy={canvasHeight - 20} rx={180} ry={16} fill="rgba(15,23,42,0.85)" stroke="#334155" strokeWidth="1.5" />

          {/* Procedural Trunk Geometry for the 5 Growth Stages */}
          <g className="procedural-tree-trunk" id="proceduralTreeTrunk">
            {growthStage === 'sprout' && (
              <g className="stage-sprout">
                {/* Curved delicate seedling stem */}
                <path d="M 320 295 Q 316 235 320 180" stroke="url(#sproutGradient)" strokeWidth="8" strokeLinecap="round" fill="none" />
                {/* Cotyledon baby leaves */}
                <path d="M 320 185 Q 295 165 290 190 Q 305 195 320 185" fill="#34d399" />
                <path d="M 320 185 Q 345 165 350 190 Q 335 195 320 185" fill="#34d399" />
                {/* Root threads */}
                <path d="M 320 295 Q 300 315 285 325" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" fill="none" />
                <path d="M 320 295 Q 340 315 355 325" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" fill="none" />
              </g>
            )}

            {growthStage === 'sapling' && (
              <g className="stage-sapling">
                {/* Straight slender youthful trunk */}
                <path d="M 320 295 C 316 235, 324 185, 320 145" stroke="#059669" strokeWidth="14" strokeLinecap="round" fill="none" />
                {/* Branches reaching for sunlight */}
                <path d="M 320 215 Q 280 190 255 175" stroke="#10b981" strokeWidth="5" strokeLinecap="round" fill="none" />
                <path d="M 320 185 Q 360 160 385 145" stroke="#10b981" strokeWidth="5" strokeLinecap="round" fill="none" />
                {/* Foliage soft clouds */}
                <circle cx={255} cy={175} r={16} fill="#10b981" opacity="0.3" />
                <circle cx={385} cy={145} r={18} fill="#10b981" opacity="0.3" />
              </g>
            )}

            {growthStage === 'flourishing_oak' && (
              <g className="stage-flourishing-oak">
                {/* Sturdy oak trunk */}
                <path d="M 304 295 C 310 240, 314 180, 320 145 C 326 180, 330 240, 336 295 Z" fill="url(#woodOakGradient)" stroke="#78350f" strokeWidth="2" />
                {/* 3 Sacred Canopy Boughs */}
                <path d="M 314 180 Q 265 140 215 115" stroke="#78350f" strokeWidth="10" strokeLinecap="round" fill="none" />
                <path d="M 320 150 Q 320 95 320 65" stroke="#78350f" strokeWidth="11" strokeLinecap="round" fill="none" />
                <path d="M 326 180 Q 375 140 425 115" stroke="#78350f" strokeWidth="10" strokeLinecap="round" fill="none" />
                {/* Foliage clusters */}
                <circle cx={215} cy={115} r={24} fill="#6366f1" opacity="0.25" filter="url(#coreGlow)" />
                <circle cx={320} cy={65} r={28} fill="#0284c7" opacity="0.25" filter="url(#coreGlow)" />
                <circle cx={425} cy={115} r={24} fill="#f59e0b" opacity="0.25" filter="url(#coreGlow)" />
              </g>
            )}

            {growthStage === 'grand_pillar' && (
              <g className="stage-grand-pillar">
                {/* Massive weathered ancient pillar trunk */}
                <path d="M 292 295 C 304 240, 312 180, 320 138 C 328 180, 336 240, 348 295 Z" fill="url(#woodOakGradient)" stroke="#92400e" strokeWidth="3" />
                {/* Buttress root anchors */}
                <path d="M 292 295 Q 260 310 235 325" stroke="#78350f" strokeWidth="7" strokeLinecap="round" fill="none" />
                <path d="M 348 295 Q 380 310 405 325" stroke="#78350f" strokeWidth="7" strokeLinecap="round" fill="none" />
                {/* Broad sheltering canopy arches */}
                <path d="M 310 170 Q 240 130 180 110" stroke="#78350f" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M 320 140 Q 320 80 320 50" stroke="#78350f" strokeWidth="13" strokeLinecap="round" fill="none" />
                <path d="M 330 170 Q 400 130 460 110" stroke="#78350f" strokeWidth="12" strokeLinecap="round" fill="none" />
              </g>
            )}

            {growthStage === 'ancient_world_tree' && (
              <g className="stage-ancient-world-tree">
                {/* Radiant Golden Amber World Tree trunk */}
                <path d="M 285 295 C 302 235, 312 175, 320 132 C 328 175, 338 235, 355 295 Z" fill="url(#ancientWorldTreeGold)" stroke="#f59e0b" strokeWidth="3" />
                {/* Transcendent spiral runes on trunk */}
                <path d="M 320 270 Q 326 245 320 220 Q 314 195 320 170" stroke="#fef08a" strokeWidth="3" strokeDasharray="6 4" fill="none" className="animate-pulse" />
                {/* Deep ancient root foundation */}
                <path d="M 285 295 Q 245 315 210 330" stroke="#d97706" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d="M 355 295 Q 395 315 430 330" stroke="#d97706" strokeWidth="8" strokeLinecap="round" fill="none" />
                {/* Golden heritage fruits (legacy orbs) */}
                <circle cx={190} cy={100} r={9} fill="#fef08a" stroke="#f59e0b" strokeWidth="2" className="animate-bounce" />
                <circle cx={450} cy={100} r={9} fill="#fef08a" stroke="#f59e0b" strokeWidth="2" className="animate-bounce" style={{ animationDelay: '0.4s' }} />
                <circle cx={320} cy={45} r={11} fill="#fef08a" stroke="#eab308" strokeWidth="2" className="animate-pulse" />
              </g>
            )}
          </g>

          {/* Annual Tree Growth Rings (Vòng Vân Gỗ Đời Người) */}
          <g className="annual-growth-rings" id="annualGrowthRings">
            <ellipse cx={centerX} cy={canvasHeight - 22} rx={58} ry={14} fill="#451a03" stroke="#78350f" strokeWidth="2" />
            {Array.from({ length: Math.min(characterAge, 45) }).map((_, i) => {
              const rx = 5 + (i * 1.15);
              const ry = 1.8 + (i * 0.26);
              const isMilestone = [6, 18, 30, 42, 60].includes(i + 1);
              return (
                <ellipse
                  key={`wood-ring-${i}`}
                  cx={centerX}
                  cy={canvasHeight - 22}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke={isMilestone ? '#fbbf24' : '#92400e'}
                  strokeWidth={isMilestone ? '1.5' : '0.6'}
                  strokeOpacity={isMilestone ? '0.9' : '0.4'}
                />
              );
            })}
          </g>
          <circle
            cx={centerX}
            cy={centerY}
            r={baseRadius * 0.75}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="6 6"
            className="opacity-20 animate-[spin_45s_linear_infinite_reverse]"
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          />

          {/* Ground Curve / Soil Mound */}
          <ellipse cx={centerX} cy={canvasHeight - 20} rx={180} ry={16} fill="rgba(15,23,42,0.85)" stroke="#334155" strokeWidth="1.5" />

          {/* Procedural Trunk Geometry for the 5 Growth Stages */}
          <g className="procedural-tree-trunk" id="proceduralTreeTrunk">
            {growthStage === 'sprout' && (
              <g className="stage-sprout">
                {/* Curved delicate seedling stem */}
                <path d="M 320 295 Q 316 235 320 180" stroke="url(#sproutGradient)" strokeWidth="8" strokeLinecap="round" fill="none" />
                {/* Cotyledon baby leaves */}
                <path d="M 320 185 Q 295 165 290 190 Q 305 195 320 185" fill="#34d399" />
                <path d="M 320 185 Q 345 165 350 190 Q 335 195 320 185" fill="#34d399" />
                {/* Root threads */}
                <path d="M 320 295 Q 300 315 285 325" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" fill="none" />
                <path d="M 320 295 Q 340 315 355 325" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" fill="none" />
              </g>
            )}

            {growthStage === 'sapling' && (
              <g className="stage-sapling">
                {/* Straight slender youthful trunk */}
                <path d="M 320 295 C 316 235, 324 185, 320 145" stroke="#059669" strokeWidth="14" strokeLinecap="round" fill="none" />
                {/* Branches reaching for sunlight */}
                <path d="M 320 215 Q 280 190 255 175" stroke="#10b981" strokeWidth="5" strokeLinecap="round" fill="none" />
                <path d="M 320 185 Q 360 160 385 145" stroke="#10b981" strokeWidth="5" strokeLinecap="round" fill="none" />
                {/* Foliage soft clouds */}
                <circle cx={255} cy={175} r={16} fill="#10b981" opacity="0.3" />
                <circle cx={385} cy={145} r={18} fill="#10b981" opacity="0.3" />
              </g>
            )}

            {growthStage === 'flourishing_oak' && (
              <g className="stage-flourishing-oak">
                {/* Sturdy oak trunk */}
                <path d="M 304 295 C 310 240, 314 180, 320 145 C 326 180, 330 240, 336 295 Z" fill="url(#woodOakGradient)" stroke="#78350f" strokeWidth="2" />
                {/* 3 Sacred Canopy Boughs */}
                <path d="M 314 180 Q 265 140 215 115" stroke="#78350f" strokeWidth="10" strokeLinecap="round" fill="none" />
                <path d="M 320 150 Q 320 95 320 65" stroke="#78350f" strokeWidth="11" strokeLinecap="round" fill="none" />
                <path d="M 326 180 Q 375 140 425 115" stroke="#78350f" strokeWidth="10" strokeLinecap="round" fill="none" />
                {/* Foliage clusters */}
                <circle cx={215} cy={115} r={24} fill="#6366f1" opacity="0.25" filter="url(#coreGlow)" />
                <circle cx={320} cy={65} r={28} fill="#0284c7" opacity="0.25" filter="url(#coreGlow)" />
                <circle cx={425} cy={115} r={24} fill="#f59e0b" opacity="0.25" filter="url(#coreGlow)" />
              </g>
            )}

            {growthStage === 'grand_pillar' && (
              <g className="stage-grand-pillar">
                {/* Massive weathered ancient pillar trunk */}
                <path d="M 292 295 C 304 240, 312 180, 320 138 C 328 180, 336 240, 348 295 Z" fill="url(#woodOakGradient)" stroke="#92400e" strokeWidth="3" />
                {/* Buttress root anchors */}
                <path d="M 292 295 Q 260 310 235 325" stroke="#78350f" strokeWidth="7" strokeLinecap="round" fill="none" />
                <path d="M 348 295 Q 380 310 405 325" stroke="#78350f" strokeWidth="7" strokeLinecap="round" fill="none" />
                {/* Broad sheltering canopy arches */}
                <path d="M 310 170 Q 240 130 180 110" stroke="#78350f" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M 320 140 Q 320 80 320 50" stroke="#78350f" strokeWidth="13" strokeLinecap="round" fill="none" />
                <path d="M 330 170 Q 400 130 460 110" stroke="#78350f" strokeWidth="12" strokeLinecap="round" fill="none" />
              </g>
            )}

            {growthStage === 'ancient_world_tree' && (
              <g className="stage-ancient-world-tree">
                {/* Radiant Golden Amber World Tree trunk */}
                <path d="M 285 295 C 302 235, 312 175, 320 132 C 328 175, 338 235, 355 295 Z" fill="url(#ancientWorldTreeGold)" stroke="#f59e0b" strokeWidth="3" />
                {/* Transcendent spiral runes on trunk */}
                <path d="M 320 270 Q 326 245 320 220 Q 314 195 320 170" stroke="#fef08a" strokeWidth="3" strokeDasharray="6 4" fill="none" className="animate-pulse" />
                {/* Deep ancient root foundation */}
                <path d="M 285 295 Q 245 315 210 330" stroke="#d97706" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d="M 355 295 Q 395 315 430 330" stroke="#d97706" strokeWidth="8" strokeLinecap="round" fill="none" />
                {/* Golden heritage fruits (legacy orbs) */}
                <circle cx={190} cy={100} r={9} fill="#fef08a" stroke="#f59e0b" strokeWidth="2" className="animate-bounce" />
                <circle cx={450} cy={100} r={9} fill="#fef08a" stroke="#f59e0b" strokeWidth="2" className="animate-bounce" style={{ animationDelay: '0.4s' }} />
                <circle cx={320} cy={45} r={11} fill="#fef08a" stroke="#eab308" strokeWidth="2" className="animate-pulse" />
              </g>
            )}
          </g>

          {/* Annual Tree Growth Rings (Vòng Vân Gỗ Đời Người) */}
          <g className="annual-growth-rings" id="annualGrowthRings">
            <ellipse cx={centerX} cy={canvasHeight - 22} rx={58} ry={14} fill="#451a03" stroke="#78350f" strokeWidth="2" />
            {Array.from({ length: Math.min(characterAge, 45) }).map((_, i) => {
              const rx = 5 + (i * 1.15);
              const ry = 1.8 + (i * 0.26);
              const isMilestone = [6, 18, 30, 42, 60].includes(i + 1);
              return (
                <ellipse
                  key={`wood-ring-${i}`}
                  cx={centerX}
                  cy={canvasHeight - 22}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke={isMilestone ? '#fbbf24' : '#92400e'}
                  strokeWidth={isMilestone ? '1.5' : '0.6'}
                  strokeOpacity={isMilestone ? '0.9' : '0.4'}
                />
              );
            })}
          </g>

          {/* Draw Bezier Branch Lines from Center to each Node */}
          {nodes.map(node => {
            const rad = (node.angleDeg * Math.PI) / 180;
            const targetX = centerX + Math.cos(rad) * (baseRadius * node.distanceRatio * 1.35);
            const targetY = centerY + Math.sin(rad) * (baseRadius * node.distanceRatio * 0.95);

            const midX = (centerX + targetX) / 2;
            const midY = (centerY + targetY) / 2 - 18;
            const pathD = `M ${centerX} ${centerY} Q ${midX} ${midY} ${targetX} ${targetY}`;

            const isHovered = hoveredNodeId === node.id;
            const canAfford = actionPoints >= node.apCost;

            return (
              <g key={`branch-${node.id}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={node.color.line}
                  strokeWidth={isHovered ? '3.5' : '2'}
                  strokeOpacity={isHovered ? '0.9' : canAfford ? '0.45' : '0.15'}
                  className="transition-all duration-300"
                />

                {canAfford && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHovered ? '#fbbf24' : '#a5b4fc'}
                    strokeWidth={isHovered ? '2.5' : '1.5'}
                    strokeDasharray="6 14"
                    className="animate-[dash_1.5s_linear_infinite]"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* ========================================================================= */}
        {/* CENTER CORE: CỘI NGUỒN SINH MỆNH (CENTRAL ORB) */}
        {/* ========================================================================= */}
        <Tooltip
          content={
            <div className="space-y-1 text-xs">
              <div className="font-bold text-amber-300">Lõi Sinh Mệnh Trung Tâm:</div>
              <div>Bản thể hội tụ năng lượng sống, định hình các lựa chọn thường niên.</div>
              <div className="text-[11px] text-purple-300 font-mono">Khả dụng: {actionPoints}/{totalAp} AP</div>
            </div>
          }
        >
          <div
            className="absolute z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center p-2 text-center select-none shadow-2xl transition-all duration-300 cursor-pointer group"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(15,23,42,0.95) 75%)',
              boxShadow: '0 0 35px rgba(99,102,241,0.4)',
              border: '2px solid rgba(129,140,248,0.6)'
            }}
          >
            <div className="absolute inset-0 rounded-full border border-indigo-400/40 animate-ping opacity-25 pointer-events-none" />

            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-sm shadow-inner group-hover:scale-110 transition-transform">
              {characterAge < 6 ? '🌱' : characterAge < 18 ? '🎒' : '⚡'}
            </div>

            <div className="text-[11px] font-sans font-bold text-white mt-1 leading-none tracking-tight">
              {actionPoints > 0 ? `${actionPoints} AP` : 'Hết AP'}
            </div>
            <div className="text-[9.5px] text-indigo-300 font-mono mt-0.5 opacity-80">
              Lõi Sinh Mệnh
            </div>
          </div>
        </Tooltip>

        {/* ========================================================================= */}
        {/* SATELLITE ACTION NODES (VỆ TINH HÀNH ĐỘNG QUAY QUANH TRỤC) */}
        {/* ========================================================================= */}
        {nodes.map(node => {
          const rad = (node.angleDeg * Math.PI) / 180;
          const leftPercent = 50 + (Math.cos(rad) * (baseRadius * node.distanceRatio * 1.35) / canvasWidth) * 100;
          const topPercent = 50 + (Math.sin(rad) * (baseRadius * node.distanceRatio * 0.95) / canvasHeight) * 100;

          const isHovered = hoveredNodeId === node.id;
          const isPulsing = pulseActiveId === node.id;
          const canAfford = actionPoints >= node.apCost;

          return (
            <div
              key={node.id}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <Tooltip
                content={
                  <div className="space-y-1 text-xs max-w-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <span>{node.icon}</span>
                      <span>{node.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                        {node.apCost} AP
                      </span>
                    </div>
                    <div className="text-slate-200">{node.gainText}</div>
                    <div className="text-[11px] text-slate-400 italic">{node.flavor}</div>
                  </div>
                }
              >
                <button
                  type="button"
                  disabled={isLoading || !canAfford}
                  onClick={() => handleNodeClick(node)}
                  className={`relative p-2 sm:p-2.5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-2 select-none active:scale-95 shadow-xl ${
                    node.isBreakthrough
                      ? 'bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border-amber-400 text-amber-200 ring-2 ring-amber-400/60 shadow-amber-900/40 animate-pulse'
                      : node.color.bg + ' ' + node.color.border + ' ' + node.color.text
                  } ${
                    isHovered ? 'scale-110 z-40 shadow-2xl ring-2 ring-white/50' : ''
                  } ${
                    isPulsing ? 'scale-95 ring-4 ring-emerald-400' : ''
                  } ${
                    !canAfford ? 'opacity-40 cursor-not-allowed grayscale-[0.4]' : 'cursor-pointer hover:border-white'
                  }`}
                  style={{
                    boxShadow: isHovered ? `0 0 20px ${node.color.glow}` : undefined
                  }}
                >
                  <span className="text-lg sm:text-xl shrink-0 group-hover:scale-125 transition-transform">
                    {node.icon}
                  </span>
                  <div className="min-w-0 pr-1 hidden sm:block">
                    <div className="text-xs font-bold truncate max-w-[110px] text-white">
                      {node.title}
                    </div>
                    <div className="text-[10px] opacity-80 truncate max-w-[110px] font-mono">
                      {node.gainText}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/40 text-amber-300 border border-white/10 shrink-0 font-bold">
                    {node.apCost} AP
                  </span>
                </button>
              </Tooltip>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3RD PILLAR: GỐC RỄ GIA ĐÌNH & CỘI NGUỒN (CHÂN CÂY / PHÍA NAM) */}
      {/* ========================================================================= */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md relative z-10">
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm shrink-0">
            🌿
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                Gốc Rễ Gia Đình & Cội Nguồn
              </span>
              {household?.family_buff && (
                <span className="text-[10px] font-semibold text-amber-300 px-2 py-0.2 rounded-full bg-amber-500/10 border border-amber-500/20">
                  ⭐ {household.family_buff.name}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-300 truncate">
              {household?.father_name ? `Bố: ${household.father_name}` : 'Mồ côi'}
              {household?.mother_name ? ` • Mẹ: ${household.mother_name}` : ''}
              <span className={`ml-2 text-[10px] px-1.5 py-0.2 rounded font-semibold ${isParentsDeceased ? 'text-rose-400 bg-rose-950/60' : 'text-emerald-400 bg-emerald-950/60'}`}>
                {isParentsDeceased ? 'Đã khuất' : 'Bình an'}
              </span>
            </div>
          </div>
        </div>

        {/* 1-Click Family Interactions & Phả Hệ Button */}
        <div className="flex items-center gap-2 flex-wrap justify-end shrink-0 w-full sm:w-auto">
          {onFamilyMeal && !isParentsDeceased && (
            <Tooltip content={canEatMeal ? "Bữa cơm đầm ấm: Tăng 10 HP và giảm 15 Burnout" : "Đã dùng bữa cơm trong năm nay"}>
              <button
                type="button"
                onClick={onFamilyMeal}
                disabled={!canEatMeal || isLoading}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                  canEatMeal
                    ? 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border-amber-500/40 active:scale-95 shadow'
                    : 'bg-slate-900/40 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
                }`}
              >
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                <span>{characterAge < 6 ? 'Bầu Sữa Mẹ' : 'Bữa Cơm'}</span>
                <span className="text-[10px] font-mono text-amber-300/80 ml-1">
                  {canEatMeal ? '+10 HP' : 'Đã dùng'}
                </span>
              </button>
            </Tooltip>
          )}

          {onFamilyMentorship && !isParentsDeceased && (
            <Tooltip content={canMentor ? "Lời khuyên phụ mẫu: Tiếp thu kinh nghiệm cha mẹ, +8 Karma" : "Đã nhận lời khuyên trong năm nay"}>
              <button
                type="button"
                onClick={onFamilyMentorship}
                disabled={!canMentor || isLoading}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                  canMentor
                    ? 'bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 border-indigo-500/40 active:scale-95 shadow'
                    : 'bg-slate-900/40 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lời Khuyên</span>
                <span className="text-[10px] font-mono text-indigo-300/80 ml-1">
                  {canMentor ? '+8 Karma' : 'Đã dùng'}
                </span>
              </button>
            </Tooltip>
          )}

          {onOpenFamily && (
            <button
              type="button"
              onClick={onOpenFamily}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 text-xs font-bold transition flex items-center gap-1 active:scale-95"
            >
              <span>Phả Hệ Dòng Tộc</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </>
  )}

  {/* ========================================================================= */}
  {/* 4. VIEW MODE 2: CÂY KỸ NĂNG TRI-BRANCH RPG BUILD */}
  {/* ========================================================================= */}
  {treeViewMode === 'skill_tree' && (
    <div className="relative z-10 space-y-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-lg">
            🌟
          </span>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Cây Kỹ Năng Cuộc Đời (Tri-Branch RPG Build)</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                {character?.skill_points || 0} Điểm SP Khả Dụng
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Rèn luyện tố chất: Thương Trường &amp; Tài Phiệt, Uy Quyền &amp; Nhân Mạch, Tâm Thức &amp; Chân Nhân.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTreeViewMode('life_actions')}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition active:scale-95"
        >
          ← Trở Về Vòng Đời
        </button>
      </div>

      <SkillTreeTab
        skillPoints={character?.skill_points || 0}
        unlockedSkills={character?.unlocked_skills || []}
        characterAge={characterAge}
        onUnlockSkill={async (id) => {
          if (onUnlockSkill) await onUnlockSkill(id);
        }}
        isLoading={isLoading}
      />
    </div>
  )}

  {/* ========================================================================= */}
  {/* 5. VIEW MODE 3: MẠNG LƯỚI NHÂN MẠCH QUÝ NHÂN (SOCIAL LINKS) */}
  {/* ========================================================================= */}
  {treeViewMode === 'social_links' && (
    <div className="relative z-10 space-y-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-lg">
            👥
          </span>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Mạng Lưới Nhân Mạch Quý Nhân (Social Links)</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold">
                {character?.social_links?.length || 4} Quý Nhân
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Gắn kết 4 Archetypes: Quý Nhân Bảo Trợ, Chiến Hữu Tri Kỷ, Kình Địch, Hậu Bối Kế Thừa.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTreeViewMode('life_actions')}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition active:scale-95"
        >
          ← Trở Về Vòng Đời
        </button>
      </div>

      <SocialLinksTab
        socialLinks={character?.social_links || []}
        actionPoints={actionPoints}
        cash={cash}
        onInteract={async (npcId, actionType) => {
          if (onNpcInteract) await onNpcInteract(npcId, actionType);
        }}
        isLoading={isLoading}
      />
    </div>
  )}
</div>
  );
}
