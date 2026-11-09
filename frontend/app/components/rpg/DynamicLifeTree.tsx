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
  Lock,
  Activity,
  AlertTriangle,
  X,
  Layers,
  Leaf
} from 'lucide-react';
import Tooltip from '../Tooltip';
import { formatCurrency } from '../../utils/currencyUtils';
import dynamic from 'next/dynamic';
import SkillTreeTab from './SkillTreeTab';
import SocialLinksTab from './SocialLinksTab';
import { soundFx } from '../../utils/soundEffects';

const Dynamic3DAvatar = dynamic(() => import('../Safe3DAvatar'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950">
      <div className="w-5 h-5 rounded-full border-2 border-emerald-500/40 border-t-emerald-400 animate-spin" />
    </div>
  )
});

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
  onOpenYearEndReflection?: () => void;
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
  onOpenYearEndReflection,
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

  // Interactive In-Tree State
  const [healingPulse, setHealingPulse] = useState<boolean>(false);
  const [avatarAnim, setAvatarAnim] = useState<string>('Front_idle');
  const [avatarSpeech, setAvatarSpeech] = useState<string | null>(null);
  const [selectedMeridianSkill, setSelectedMeridianSkill] = useState<string | null>(null);
  const [activeConstellationNpc, setActiveConstellationNpc] = useState<any | null>(null);

  const nationality = character?.nationality || 'Việt Nam';
  const formattedCash = formatCurrency(cash, nationality);
  const formattedNetWorth = formatCurrency(netWorth, nationality);

  // Character Health, Vitality, Burnout & Tree Vitality Reaction
  const burnout = Number(character?.burnout ?? 0);
  const vitalityVal = Number(vitality ?? character?.vitality ?? 80);
  const isDebt = cash < 0;

  // 3-Level Dynamic Life Tree Health State (Sức Khỏe & Thể Trạng Thần Mộc)
  const getTreeHealthState = (): 'thriving' | 'fatigued' | 'withered' => {
    if (burnout >= 70 || vitalityVal < 35 || cash < -50000) {
      return 'withered'; // Cây bị bệnh / trúng độc / kiệt sức
    }
    if (burnout >= 40 || vitalityVal < 60) {
      return 'fatigued'; // Cây mỏi mệt / tiêu hao
    }
    return 'thriving'; // Thần mộc sung mãn / linh khí bừng sáng
  };
  const treeHealthState = getTreeHealthState();

  // Household & Parents status
  const household = character?.household;
  const isParentsDeceased = household?.parents_status === 'deceased' || household?.parents_status === 'deceased_or_abandoned';
  const canEatMeal = household && !isParentsDeceased && (household.family_meals_available ?? 1) > 0;
  const canMentor = household && !isParentsDeceased && (household.family_mentorship_used !== characterAge);

  // Spouse & Children (F2 Generation - Quyết định 2: Phương Án A)
  const spouse = character?.spouse || relationships.find((r: any) => r.type === 'spouse' || r.type === 'partner' || r.relation === 'spouse');
  const hasSpouse = Boolean(spouse);
  const childrenList: any[] = character?.children || relationships.filter((r: any) => r.type === 'child' || r.relation === 'child') || [];

  // Interactive Avatar Poke / Voice
  const handleAvatarPoke = () => {
    soundFx.playBirdChirp();
    const speeches = [
      'Linh khí đang cuồn cuộn chảy qua kinh mạch!',
      'Gốc rễ vững chãi, cành lá sinh sôi!',
      'Mỗi năm tích lũy một vòng vân gỗ bồi đắp!',
      'Thần Mộc và bản thể cùng chung một nhịp đập!'
    ];
    const anims = ['Jump', 'Gotcha_Pose', 'Vibing', 'Front_Talk'];
    const nextSpeech = speeches[Math.floor(Math.random() * speeches.length)];
    const nextAnim = anims[Math.floor(Math.random() * anims.length)];
    setAvatarSpeech(nextSpeech);
    setAvatarAnim(nextAnim);
    setHealingPulse(true);
    setTimeout(() => setHealingPulse(false), 900);
    setTimeout(() => {
      setAvatarSpeech(null);
      setAvatarAnim('Front_idle');
    }, 2800);
  };

  // Generate dynamic nodes based on life stage
  const getNodesForStage = (): LifeTreeNode[] => {
    // Stage 1: Sơ sinh & Ấu thơ (0 - 5 Tuổi)
    if (characterAge <= 5) {
      const nodes: LifeTreeNode[] = [
        {
          id: 'toy_brain',
          title: 'Đồ Chơi Trí Não',
          category: 'wisdom',
          icon: '🧸',
          apCost: 1,
          gainText: '+10 Trí tuệ, +5 Karma',
          flavor: 'Lắc chiếc lục lạc leng keng, tò mò gặm thử mẩu gỗ vuông cha đẽo',
          angleDeg: -145, // Cánh Tây Bắc thoáng đãng
          distanceRatio: 0.76,
          color: {
            border: 'border-sky-500/50',
            bg: 'bg-sky-950/70',
            glow: '#0284c7',
            text: 'text-sky-300',
            line: '#0284c7'
          }
        },
        {
          id: 'sunbath',
          title: 'Tắm Nắng Sớm',
          category: 'vitality',
          icon: '☀️',
          apCost: 1,
          gainText: '+10 Đề kháng, -5 Stress',
          flavor: 'Nằm phơi nắng sớm ngoài hiên, gió phe phẩy làm khô lớp mồ hôi trộm',
          angleDeg: -35, // Cánh Đông Bắc thoáng đãng
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
          id: 'toddler_walk',
          title: 'Tập Đi & Bập Bẹ',
          category: 'vitality',
          icon: '👶',
          apCost: 1,
          gainText: '+3 Max HP, +8 Thể lực',
          flavor: 'Bám thành giường lò dò từng bước, ngã dập mông lại lồm cồm bò dậy',
          angleDeg: -5, // Cánh Đông (trên lá mầm phải)
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
          flavor: 'Dụi đầu vào cổ mẹ nũng nịu đòi bế, nghe tiếng cha cười vang gian nhà',
          angleDeg: -175, // Cánh Tây (trên lá mầm trái)
          distanceRatio: 0.75,
          color: {
            border: 'border-pink-500/50',
            bg: 'bg-pink-950/70',
            glow: '#f43f5e',
            text: 'text-pink-300',
            line: '#e11d48'
          }
        },
        {
          id: 'eat_grow',
          title: 'Bú Mẹ & Ăn Dặm',
          category: 'vitality',
          icon: '🍼',
          apCost: 1,
          gainText: '+15 Thể chất, +5 HP',
          flavor: 'Ngậm bầu sữa ấm của mẹ, no bụng rồi chìm vào giấc ngủ thật say',
          angleDeg: 140, // Tây Nam cội rễ (không đè thân mầm và avatar)
          distanceRatio: 0.65,
          color: {
            border: 'border-emerald-500/50',
            bg: 'bg-emerald-950/70',
            glow: '#10b981',
            text: 'text-emerald-300',
            line: '#059669'
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
          angleDeg: -90, // Vươn thẳng lên đỉnh trời (không đè card Quý Nhân)
          distanceRatio: 0.58,
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
          flavor: 'Nắn nót từng dòng mực tím, quyết tâm giải bằng được bài toán đố hóc búa',
          angleDeg: -145,
          distanceRatio: 0.76,
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
          flavor: 'Quét sạch hiên nhà, rửa xong chồng bát đũa mỡ màng để mẹ về đỡ nhọc',
          angleDeg: -35,
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
          id: 'play_sports',
          title: 'Đá Bóng Cùng Bạn',
          category: 'vitality',
          icon: '⚽',
          apCost: 1,
          gainText: '+10 HP, -20 Stress',
          flavor: 'Tranh bóng trên sân đất nứt nẻ, mồ hôi ướt đẫm lưng áo mà vui hết nấc',
          angleDeg: -5,
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
          flavor: 'Trèo cây hái quả dại, lội mương bắt ốc cùng đám bạn xóm dưới',
          angleDeg: 35,
          distanceRatio: 0.68,
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
          flavor: 'Ngồi bên mâm cơm tối kể chuyện trường lớp, nghe cha thở dài chuyện tiền nong',
          angleDeg: 140,
          distanceRatio: 0.65,
          color: {
            border: 'border-amber-500/40',
            bg: 'bg-amber-500/10',
            glow: '#f59e0b',
            text: 'text-amber-700 dark:text-amber-300',
            line: '#d97706'
          }
        }
      ];

      if (breakthroughAction) {
        nodes.push({
          id: 'breakthrough',
          title: breakthroughAction.title,
          category: 'destiny',
          icon: breakthroughAction.icon || '🏆',
          apCost: breakthroughAction.costAp || 2,
          gainText: 'ĐỘT PHÁ SỐ MỆNH',
          flavor: breakthroughAction.description,
          isBreakthrough: true,
          angleDeg: -90,
          distanceRatio: 0.58,
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

    // Stage 3 & Trưởng thành (18+ Tuổi): Dynamic Career Foliage (Quyết định 1)
    const careerCategory = String(character?.career_category || character?.occupation_field || '').toLowerCase();
    const jobTitle = String(character?.job || character?.career || character?.profession || '').toLowerCase();

    let workNode: LifeTreeNode;
    if (careerCategory.includes('health') || jobTitle.includes('bác sĩ') || jobTitle.includes('y tế') || jobTitle.includes('dược')) {
      workNode = {
        id: 'work_ot',
        title: 'Ca Mổ Cấp Cứu',
        category: 'career',
        icon: '🩺',
        apCost: 1,
        gainText: '+$3.5k Thặng dư, +15 Karma',
        flavor: 'Tập trung cao độ trong phòng mổ, giật lại sự sống cho bệnh nhân từ tay tử thần',
        angleDeg: -145,
        distanceRatio: 0.76,
        color: {
          border: 'border-emerald-500/50',
          bg: 'bg-emerald-950/70',
          glow: '#10b981',
          text: 'text-emerald-300',
          line: '#059669'
        }
      };
    } else if (careerCategory.includes('tech') || jobTitle.includes('coder') || jobTitle.includes('kỹ sư') || jobTitle.includes('phần mềm') || jobTitle.includes('dev')) {
      workNode = {
        id: 'work_ot',
        title: 'Kiến Trúc & Fix Bug Đêm',
        category: 'career',
        icon: '💻',
        apCost: 1,
        gainText: '+$3.2k Thặng dư, +10 Trí tuệ',
        flavor: 'Tối ưu thuật toán chịu tải hàng triệu người dùng, hoàn thành bản phát hành quan trọng',
        angleDeg: -145,
        distanceRatio: 0.76,
        color: {
          border: 'border-cyan-500/50',
          bg: 'bg-cyan-950/70',
          glow: '#06b6d4',
          text: 'text-cyan-300',
          line: '#0891b2'
        }
      };
    } else if (careerCategory.includes('finance') || careerCategory.includes('business') || jobTitle.includes('doanh') || jobTitle.includes('giám đốc') || jobTitle.includes('ceo')) {
      workNode = {
        id: 'work_ot',
        title: 'Đàm Phán & Gọi Vốn',
        category: 'career',
        icon: '📊',
        apCost: 1,
        gainText: '+$4.5k Thặng dư, +Uy quyền',
        flavor: 'Bảo vệ kế hoạch kinh doanh trước các quỹ mạo hiểm, ký kết hợp đồng thương mại lớn',
        angleDeg: -145,
        distanceRatio: 0.76,
        color: {
          border: 'border-amber-500/50',
          bg: 'bg-amber-950/70',
          glow: '#f59e0b',
          text: 'text-amber-300',
          line: '#d97706'
        }
      };
    } else if (careerCategory.includes('art') || jobTitle.includes('nghệ sĩ') || jobTitle.includes('nhà văn') || jobTitle.includes('họa sĩ') || jobTitle.includes('thiết kế')) {
      workNode = {
        id: 'work_ot',
        title: 'Sáng Tác Tuyệt Phẩm',
        category: 'career',
        icon: '🎨',
        apCost: 1,
        gainText: '+$2.8k, +Danh vọng vang xa',
        flavor: 'Đốt cháy đam mê trên từng nét vẽ trang sách, tạo nên tác phẩm để đời cho công chúng',
        angleDeg: -145,
        distanceRatio: 0.76,
        color: {
          border: 'border-purple-500/50',
          bg: 'bg-purple-950/70',
          glow: '#a855f7',
          text: 'text-purple-300',
          line: '#9333ea'
        }
      };
    } else {
      workNode = {
        id: 'work_ot',
        title: 'Cày Cuốc Kiếm Tiền',
        category: 'career',
        icon: '💼',
        apCost: 1,
        gainText: '+$1.5k~$3k Thặng dư',
        flavor: 'Tăng ca mỏi mắt bên bàn làm việc, đổi mồ hôi lấy từng đồng tiền nuôi sống bản thân',
        angleDeg: -145, // Cành Hoàng Kim Tài Sản
        distanceRatio: 0.76,
        color: {
          border: 'border-emerald-500/50',
          bg: 'bg-emerald-950/70',
          glow: '#10b981',
          text: 'text-emerald-300',
          line: '#059669'
        }
      };
    }

    const adultNodes: LifeTreeNode[] = [
      workNode,
      {
        id: 'study_specialty',
        title: 'Đèn Sách Tri Thức',
        category: 'wisdom',
        icon: '📚',
        apCost: 1,
        gainText: '+8 Karma, Nâng trình chuyên môn',
        flavor: 'Thức trắng đêm nghiên cứu tài liệu chuyên ngành, mở rộng tầm nhìn học thuật',
        angleDeg: -90, // Đỉnh ngọn Thần Mộc (dưới card Quý Nhân)
        distanceRatio: 0.58,
        color: {
          border: 'border-sky-500/50',
          bg: 'bg-sky-950/70',
          glow: '#0284c7',
          text: 'text-sky-300',
          line: '#0284c7'
        }
      },
      {
        id: 'expand_network',
        title: 'Mở Rộng Nhân Mạch',
        category: 'family',
        icon: '🤝',
        apCost: 1,
        gainText: 'Gặp gỡ tri kỷ, Mở lối làm ăn',
        flavor: 'Mời ly cà phê vỉa hè hay bữa tối thân tình, kết nối những mối quan hệ vàng ngọc',
        angleDeg: -35, // Cành Nhân Mạch Quý Nhân
        distanceRatio: 0.76,
        color: {
          border: 'border-amber-500/40',
          bg: 'bg-amber-500/10',
          glow: '#f59e0b',
          text: 'text-amber-700 dark:text-amber-300',
          line: '#d97706'
        }
      },
      {
        id: 'stock_trading',
        title: 'Lướt Sóng & Thử Vận',
        category: 'career',
        icon: '📈',
        apCost: 1,
        gainText: 'Cơ hội x2 vốn hoặc rút củi',
        flavor: 'Đặt lệnh mua mã cổ phiếu tiềm năng, tim đập thình thịch theo từng nhịp bảng điện tử',
        angleDeg: -5, // Cánh Đông
        distanceRatio: 0.75,
        color: {
          border: 'border-pink-500/50',
          bg: 'bg-pink-950/70',
          glow: '#f43f5e',
          text: 'text-pink-300',
          line: '#e11d48'
        }
      },
      {
        id: 'restore_vitality',
        title: 'Dưỡng Sinh Hồi Phục',
        category: 'vitality',
        icon: '🌿',
        apCost: 1,
        gainText: '+15 Sinh lực, -25 Stress',
        flavor: 'Tắm nước nóng xua tan cơn đau nhức xương khớp, ngủ một giấc sâu không mộng mị',
        angleDeg: 140, // Cội Rễ Sinh Mệnh Tây Nam
        distanceRatio: 0.65,
        color: {
          border: 'border-teal-500/50',
          bg: 'bg-teal-950/70',
          glow: '#14b8a6',
          text: 'text-teal-300',
          line: '#0d9488'
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
        angleDeg: -65, // Vươn cao Đông Bắc
        distanceRatio: 0.75,
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

    soundFx.playLeafRustle();
    setPulseActiveId(node.id);
    setTimeout(() => setPulseActiveId(null), 600);

    // If healing action was selected, trigger radiant healing ripple & sound
    if (node.id === 'restore_vitality' || node.id === 'sunbath' || node.id === 'eat_grow') {
      soundFx.playHealingPulse();
      setHealingPulse(true);
      setTimeout(() => setHealingPulse(false), 1400);
    }

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

  // In-Tree Meridian Acupoints (Huyệt Đạo Kỹ Năng Ngay Trên Tán Cây)
  const MERIDIAN_ACUPOINTS = [
    {
      id: 'mindfulness_zen',
      name: 'Thiền Định Tỉnh Thức',
      icon: '🧘',
      branch: 'Trí Tuệ',
      costSp: 1,
      x: 185,
      y: 135,
      desc: '-20% Căng thẳng tích tụ mỗi năm.'
    },
    {
      id: 'charisma_magnet',
      name: 'Hiếu Đạo Gia Phong',
      icon: '✨',
      branch: 'Gia Phong',
      costSp: 1,
      x: 275,
      y: 185,
      desc: 'Gấp đôi tốc độ hảo cảm Social Links.'
    },
    {
      id: 'market_sense_1',
      name: 'Mắt Thần Định Giá',
      icon: '👁️',
      branch: 'Tư Bản',
      costSp: 1,
      x: 460,
      y: 180,
      desc: 'Giảm 10% giá BĐS & +15% lướt sóng.'
    }
  ];

  // SVG Dimension Constants (Expanded Majestic Scale)
  const canvasWidth = 720;
  const canvasHeight = 520;
  const centerX = canvasWidth / 2; // 360
  const centerY = 270;
  const baseRadius = 185;

  return (
    <div className="w-full rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-3 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col gap-3.5 backdrop-blur-2xl transition-colors duration-200">
      {/* Background Starfield Aura & Cosmic Mist */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[560px] bg-gradient-to-br from-indigo-950/15 via-amber-950/10 to-emerald-950/15 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER: THẦN MỘC STATUS & LENS BAR */}
      <div className="flex items-center justify-between gap-3 flex-wrap relative z-20 pb-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-wide flex items-center gap-2">
              <span>Đại Thụ Sinh Mệnh Toàn Năng</span>
              <span className="text-[10px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-300 border border-indigo-500/30">
                Tuổi {characterAge}
              </span>
              <span
                className="text-[10px] font-sans px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold shadow-sm"
                style={{
                  backgroundColor: `${STAGE_META[growthStage].themeColor}15`,
                  color: STAGE_META[growthStage].themeColor,
                  borderColor: `${STAGE_META[growthStage].themeColor}40`
                }}
              >
                <span>{STAGE_META[growthStage].icon}</span>
                <span>{STAGE_META[growthStage].label}</span>
              </span>
            </h3>
            <div className="text-[10.5px] text-[var(--text-secondary)] hidden sm:block mt-0.5">
              Hệ sinh thái cuộc đời: Gốc Rễ Gia Đình · Nhánh Kỹ Năng · Cành Tài Sản · Tán Lá Hành Động.
            </div>
          </div>
        </div>

        {/* Tree Health Indicator & AP Balance */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Dynamic Tree Health State Pill */}
          <Tooltip
            content={
              <div className="space-y-1 text-xs">
                <div className="font-bold text-amber-500">Thể Trạng Thần Mộc:</div>
                <div className="text-[var(--text-secondary)]">
                  {treeHealthState === 'withered'
                    ? 'Thần Mộc kiệt sức: Căng thẳng cao hoặc âm nợ. Hãy chọn Dưỡng Sinh hoặc Bữa Cơm!'
                    : treeHealthState === 'fatigued'
                    ? 'Thần Mộc tiêu hao sinh lực: Nhựa sống luân chuyển chậm, nên nghỉ ngơi.'
                    : 'Thần Mộc sung mãn: Linh khí ngọc bích dồi dào!'}
                </div>
                <div className="text-[11px] text-emerald-500 font-mono">
                  Sinh lực: {vitalityVal}% · Căng thẳng: {burnout}%
                </div>
              </div>
            }
          >
            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-[11px] font-bold cursor-help transition shadow-sm ${
                treeHealthState === 'withered'
                  ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse ring-1 ring-rose-400/50'
                  : treeHealthState === 'fatigued'
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  treeHealthState === 'withered'
                    ? 'text-rose-400 fill-rose-500 animate-bounce'
                    : treeHealthState === 'fatigued'
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-emerald-400 fill-emerald-400'
                }`}
              />
              <span>
                {treeHealthState === 'withered'
                  ? '🥀 Cây Kiệt Sức'
                  : treeHealthState === 'fatigued'
                  ? '⚠️ Hao Hụt Khí Lực'
                  : '✨ Tràn Đầy Nhựa Sống'}
              </span>
            </div>
          </Tooltip>

          {/* AP Balance Indicator */}
          <Tooltip content="Điểm Hành Động (Action Points): Năng lượng sinh tồn dùng để thực hiện các bước ngoặt cuộc đời trong năm nay.">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg-card-subtle)] border border-amber-500/40 text-xs font-semibold text-amber-500 shadow-sm cursor-help">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
              <span className="font-mono font-bold text-sm">{actionPoints}</span>
              <span className="text-[var(--text-secondary)] text-[11px]">/ {totalAp} AP</span>
            </div>
          </Tooltip>

          {/* Quick fast-forwards */}
          {characterAge < 6 && onFastForwardToSchool && (
            <Tooltip content="Tua nhanh qua giai đoạn 0-5 tuổi, bước thẳng vào Lớp 1 (6 tuổi).">
              <button
                onClick={() => {
                  if (window.confirm("Bỏ qua giai đoạn bập bẹ để bước thẳng vào Lớp 1 (6 Tuổi)?")) {
                    onFastForwardToSchool();
                  }
                }}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow transition active:scale-95"
              >
                <FastForward className="w-3 h-3 text-amber-300" />
                <span>Lên Lớp 1</span>
              </button>
            </Tooltip>
          )}

          {/* Year-End Sacred Ritual / Turn Advancement Button */}
          {(onOpenYearEndReflection || onTimeSkip) && (
            <Tooltip
              content={
                actionPoints === 0
                  ? "Đã dùng hết năng lượng năm nay. Nhấn để bước vào thời khắc Giao Thừa và đón năm mới!"
                  : "Khép lại năm sớm: Năng lượng AP dư thừa sẽ tự động quy đổi thành Dưỡng Sinh (+2 HP / -5% Căng thẳng)."
              }
            >
              <button
                onClick={() => (onOpenYearEndReflection ? onOpenYearEndReflection() : onTimeSkip?.())}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 shadow-md flex items-center gap-1.5 ${
                  actionPoints === 0
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black shadow-amber-500/30 animate-pulse ring-2 ring-amber-300/60'
                    : 'bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-amber-500/40'
                }`}
              >
                {actionPoints === 0 ? (
                  <>
                    <span>✨</span>
                    <span>Chiêm Nghiệm Cuối Năm</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>🌿</span>
                    <span>Khép Năm Sớm</span>
                  </>
                )}
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SACRED TREE LENS SELECTOR (BỘ ĐIỀU KHIỂN LĂNG KÍNH THẦN MỘC ĐỒNG BỘ) */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] shadow-inner w-full sm:w-fit self-start shrink-0 relative z-20 flex-wrap">
        <button
          type="button"
          onClick={() => setTreeViewMode('life_actions')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            treeViewMode === 'life_actions'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          <span>Vòng Đời &amp; Hành Động</span>
        </button>

        <button
          type="button"
          onClick={() => setTreeViewMode('skill_tree')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            treeViewMode === 'skill_tree'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-md shadow-slate-900/20'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <span>🔮 Cây Kỹ Năng</span>
          {(character?.skill_points || 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-black animate-pulse">
              +{character.skill_points} SP
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTreeViewMode('social_links')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            treeViewMode === 'social_links'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <span>👥 Nhân Mạch Quý Nhân</span>
          <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 text-[10px] font-mono font-bold">
            {character?.social_links?.length || 4}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MAIN LIVING STAGE: THẦN MỘC 3D VĨ ĐẠI (ZERO-DETACHED LIVING CANVAS) */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[540px] sm:h-[580px] overflow-hidden flex items-center justify-center rounded-3xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] shadow-2xl transition-colors duration-200">
        
        {/* Sickness Alarm Banner (Khi Cây Bị Bệnh / Kiệt Sức) */}
        {treeHealthState === 'withered' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1 rounded-full bg-rose-950/90 border border-rose-500/70 text-rose-200 text-[11px] font-bold flex items-center gap-2 shadow-2xl shadow-rose-950/90 animate-pulse pointer-events-none whitespace-nowrap">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Thần Mộc Đang Bị Kiệt Sức! Kinh mạch tắc nghẽn — Hãy chọn Dưỡng Sinh hoặc Bầu Sữa Mẹ để hồi sinh!</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3 SACRED CELESTIAL BOUGH SHRINES (GẮN TRỰC TIẾP TRÊN 3 ĐẠI NHÁNH CỦA CÂY) */}
        {/* ========================================================================= */}
        {/* BOUGH 1: KỸ NĂNG & TRÍ TUỆ (TÂY BẮC - ĐẦU CÀNH TRÁI) */}
        <div
          onClick={() => setTreeViewMode('skill_tree')}
          className={`absolute top-4 left-4 sm:left-6 z-25 group cursor-pointer transition-all duration-300 ${
            treeViewMode === 'skill_tree' ? 'scale-105 ring-2 ring-amber-400 rounded-2xl shadow-amber-500/25 shadow-xl' : ''
          }`}
        >
          <div className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-2xl bg-[var(--bg-card)]/95 hover:bg-[var(--bg-card)] border border-amber-500/50 hover:border-amber-400 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-sm shadow-inner group-hover:scale-110 transition-transform shrink-0">
              🔮
            </span>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Nhánh Kỹ Năng
                </span>
                {(character?.skill_points || 0) > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black animate-pulse">
                    +{character.skill_points} SP
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[125px] sm:max-w-[155px]">
                Lv.{character?.life_level || 1} · {character?.unlocked_skills?.length || 0} Tố Chất
              </div>
            </div>
            {onRpgActivePerk && character?.unlocked_skills?.includes('stock_trading') && (
              <Tooltip content="Lướt sóng cổ phiếu (1 AP): Chớp cơ hội thị trường sinh lời">
                <button
                  type="button"
                  disabled={isLoading || actionPoints < 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRpgActivePerk('stock_trading');
                  }}
                  className="p-1 rounded-md bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs transition shrink-0 ml-0.5"
                >
                  📈
                </button>
              </Tooltip>
            )}
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
          </div>
        </div>

        {/* BOUGH 2: NHÂN MẠCH QUÝ NHÂN (THIÊN ĐỈNH - VƯƠNG MIỆN TÁN CÂY) */}
        <div
          onClick={() => setTreeViewMode('social_links')}
          className={`absolute top-3 left-1/2 -translate-x-1/2 z-25 group cursor-pointer transition-all duration-300 ${
            treeViewMode === 'social_links' ? 'scale-105 ring-2 ring-sky-400 rounded-2xl shadow-sky-500/50 shadow-xl' : ''
          }`}
        >
          <div className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-2xl bg-[var(--bg-card)]/95 hover:bg-[var(--bg-card)] border border-sky-500/50 hover:border-sky-300 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <span className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sm shadow-inner group-hover:scale-110 transition-transform shrink-0">
              👥
            </span>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                  Nhân Mạch Quý Nhân
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40 font-mono">
                  {character?.social_links?.length || 4}
                </span>
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[125px] sm:max-w-[155px]">
                {character?.social_links?.filter((n: any) => n.linkLevel >= 2).length || 0} Quý Nhân Thân Thiết
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
          </div>
        </div>

        {/* BOUGH 3: CÀNH HOÀNG KIM TÀI SẢN (ĐÔNG BẮC - ĐẦU CÀNH PHẢI) */}
        <div
          onClick={onOpenAssets}
          className="absolute top-4 right-4 sm:right-6 z-25 group cursor-pointer"
        >
          <div className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-2xl bg-[var(--bg-card)]/95 hover:bg-[var(--bg-card)] border border-amber-500/50 hover:border-amber-300 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95">
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-sm shadow-inner group-hover:scale-110 transition-transform shrink-0">
              🪙
            </span>
            <div className="text-left min-w-0">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                Cành Hoàng Kim
              </span>
              <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 truncate max-w-[125px] sm:max-w-[155px]">
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{formattedCash.primary}</span>
                <span className="text-[var(--text-secondary)] text-[10px] font-sans">• {assets.length} TS</span>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SVG SCENIC CANVAS: PROCEDURAL 3D TRUNK, SHADING, MERIDIANS & FOLIAGE */}
        {/* ========================================================================= */}
        <svg
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            <linearGradient id="treePulseGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="godRayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.28" />
              <stop offset="35%" stopColor="#a7f3d0" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>

            {/* 3D Wood Oak Gradient (Cylindrical Lighting) */}
            <linearGradient id="woodOakGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e0b04" />
              <stop offset="25%" stopColor="#451a03" />
              <stop offset="45%" stopColor="#b45309" />
              <stop offset="65%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#240c03" />
            </linearGradient>

            {/* Withered / Toxic Bark Gradient */}
            <linearGradient id="witheredBarkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="30%" stopColor="#3f3f46" />
              <stop offset="60%" stopColor="#581c87" />
              <stop offset="100%" stopColor="#1c1917" />
            </linearGradient>

            {/* Dynamic Mana Sap Meridian Gradient */}
            <linearGradient id="manaSapGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              {treeHealthState === 'withered' ? (
                <>
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#9333ea" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
                </>
              ) : treeHealthState === 'fatigued' ? (
                <>
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0.9" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                  <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.85" />
                  <stop offset="70%" stopColor="#a855f7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
                </>
              )}
            </linearGradient>

            {/* Avatar Dan-Tien to Roots Meridian Conduit */}
            <linearGradient id="avatarToTreeMeridian" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="ancientWorldTreeGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#fbbf24" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            <linearGradient id="sproutGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>

            <radialGradient id="wisdomFoliageGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={treeHealthState === 'withered' ? '#4c1d95' : '#818cf8'} stopOpacity="0.45" />
              <stop offset="60%" stopColor={treeHealthState === 'withered' ? '#311042' : '#4338ca'} stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="socialFoliageGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={treeHealthState === 'withered' ? '#581c87' : '#38bdf8'} stopOpacity="0.45" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="wealthFoliageGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={treeHealthState === 'withered' ? '#78350f' : '#fbbf24'} stopOpacity="0.45" />
              <stop offset="60%" stopColor="#d97706" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
            </radialGradient>

            {/* Rose & Children Gradients (Quyết định 2: Phương Án A) */}
            <linearGradient id="roseStemGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <radialGradient id="roseFlowerGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe4e6" />
              <stop offset="40%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#9f1239" />
            </radialGradient>
            <radialGradient id="childFruitGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="45%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </radialGradient>

            <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="foliageBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="14" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* God Rays (Thiên Khải Chi Quang) */}
          <g className="god-rays pointer-events-none opacity-40">
            <polygon points="260,0 330,0 240,460 140,460" fill="url(#godRayGradient)" />
            <polygon points="340,0 400,0 440,480 340,480" fill="url(#godRayGradient)" />
            <polygon points="420,0 490,0 600,460 500,460" fill="url(#godRayGradient)" />
          </g>

          {/* Ambient Celestial Starlight Circles */}
          <circle
            cx={centerX}
            cy={centerY}
            r={80}
            fill="none"
            stroke={treeHealthState === 'withered' ? '#9333ea' : '#6366f1'}
            strokeWidth="1.5"
            strokeDasharray="5 5"
            className="opacity-25 animate-[spin_40s_linear_infinite]"
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={baseRadius * 0.9}
            fill="none"
            stroke={treeHealthState === 'withered' ? '#dc2626' : '#38bdf8'}
            strokeWidth="1"
            strokeDasharray="8 8"
            className="opacity-20 animate-[spin_60s_linear_infinite_reverse]"
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          />

          {/* Floating Spirit Fireflies */}
          <g className="spirit-fireflies pointer-events-none">
            {treeHealthState !== 'withered' ? (
              <>
                <circle cx="280" cy="220" r="3" fill="#6ee7b7" className="animate-pulse" style={{ animationDuration: '2.4s' }} filter="url(#coreGlow)" />
                <circle cx="440" cy="240" r="3.5" fill="#fef08a" className="animate-pulse" style={{ animationDuration: '3.1s', animationDelay: '0.7s' }} filter="url(#coreGlow)" />
                <circle cx="360" cy="140" r="3" fill="#c084fc" className="animate-pulse" style={{ animationDuration: '2.7s', animationDelay: '1.2s' }} filter="url(#coreGlow)" />
                <circle cx="200" cy="130" r="3.5" fill="#818cf8" className="animate-pulse" style={{ animationDuration: '3.4s', animationDelay: '0.3s' }} filter="url(#coreGlow)" />
                <circle cx="530" cy="150" r="3.5" fill="#fbbf24" className="animate-pulse" style={{ animationDuration: '2.9s', animationDelay: '1s' }} filter="url(#coreGlow)" />
                <circle cx="320" cy="420" r="2.5" fill="#34d399" className="animate-pulse" style={{ animationDuration: '3.8s', animationDelay: '1.8s' }} filter="url(#coreGlow)" />
                <circle cx="410" cy="400" r="3" fill="#fde047" className="animate-pulse" style={{ animationDuration: '2.8s', animationDelay: '1.5s' }} filter="url(#coreGlow)" />
              </>
            ) : (
              <>
                <circle cx="360" cy="240" r="2.5" fill="#dc2626" className="animate-ping" style={{ animationDuration: '1.8s' }} filter="url(#coreGlow)" />
                <circle cx="310" cy="330" r="2" fill="#9333ea" className="animate-pulse" style={{ animationDuration: '2.2s' }} filter="url(#coreGlow)" />
              </>
            )}
          </g>

          {/* Sacred Ground Soil Mound */}
          <ellipse cx={centerX} cy={488} rx={280} ry={24} fill="#0b1120" stroke="#1e293b" strokeWidth="2" />
          <ellipse cx={centerX} cy={488} rx={250} ry={16} fill="rgba(15,23,42,0.95)" stroke="#334155" strokeWidth="1" />

          {/* PROCEDURAL TRUNK GEOMETRY FOR THE 5 GROWTH STAGES */}
          <g className="procedural-tree-trunk" id="proceduralTreeTrunk">
            {growthStage === 'sprout' && (
              <g className="stage-sprout">
                {/* Sacred Seed (Hạt Giống Thần Thoại Khởi Nguyên) */}
                <ellipse cx="360" cy="480" rx="22" ry="14" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" filter="url(#coreGlow)" />
                <ellipse cx="360" cy="478" rx="16" ry="9" fill="#10b981" opacity="0.4" />

                {/* 3D Curved Seedling Trunk (Thân Mầm Ngọc Bích Khối Trụ) */}
                <path
                  d="M 351 480 C 344 380, 354 310, 360 270 C 366 310, 376 380, 369 480 Z"
                  fill={treeHealthState === 'withered' ? 'url(#witheredBarkGradient)' : 'url(#sproutGradient)'}
                  stroke={treeHealthState === 'withered' ? '#450a0a' : '#047857'}
                  strokeWidth="2.5"
                />

                {/* Internal Mana Sap Meridian in Sprout */}
                <path
                  d="M 360 475 C 356 385, 362 310, 360 270"
                  stroke="url(#manaSapGradient)"
                  strokeWidth="4"
                  strokeDasharray="6 4"
                  fill="none"
                  className="animate-pulse"
                />

                {/* Left Cotyledon Baby Leaf (Lá Mầm Ngọc Bích Trái) */}
                <path
                  d="M 358 340 C 295 295, 240 320, 235 350 C 270 375, 325 355, 358 340 Z"
                  fill={treeHealthState === 'withered' ? '#713f12' : '#10b981'}
                  stroke={treeHealthState === 'withered' ? '#451a03' : '#34d399'}
                  strokeWidth="2"
                  filter="url(#coreGlow)"
                />
                {/* Left leaf internal glowing vein */}
                <path d="M 358 340 Q 300 330, 245 348" stroke="#a7f3d0" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.8" />

                {/* Right Cotyledon Baby Leaf (Lá Mầm Ngọc Bích Phải) */}
                <path
                  d="M 362 335 C 425 290, 480 315, 485 345 C 450 370, 395 350, 362 335 Z"
                  fill={treeHealthState === 'withered' ? '#854d0e' : '#34d399'}
                  stroke={treeHealthState === 'withered' ? '#451a03' : '#6ee7b7'}
                  strokeWidth="2"
                  filter="url(#coreGlow)"
                />
                {/* Right leaf internal glowing vein */}
                <path d="M 362 335 Q 420 325, 475 343" stroke="#d1fae5" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.8" />

                {/* Root capillary threads */}
                <path d="M 360 485 Q 315 500, 260 508" stroke="#059669" strokeWidth="3" strokeDasharray="4 4" fill="none" />
                <path d="M 360 485 Q 405 500, 460 508" stroke="#059669" strokeWidth="3" strokeDasharray="4 4" fill="none" />
                <path d="M 360 485 Q 350 504, 340 514" stroke="#059669" strokeWidth="2.5" strokeDasharray="3 3" fill="none" />
              </g>
            )}

            {growthStage === 'sapling' && (
              <g className="stage-sapling">
                {/* Straight slender youthful trunk */}
                <path
                  d="M 360 480 C 354 380, 366 290, 360 190"
                  stroke={treeHealthState === 'withered' ? 'url(#witheredBarkGradient)' : '#059669'}
                  strokeWidth="24"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Pulsing Mana Meridian Sap */}
                <path
                  d="M 360 475 C 356 385, 364 290, 360 195"
                  stroke="url(#manaSapGradient)"
                  strokeWidth="5"
                  strokeDasharray="8 6"
                  fill="none"
                  className="animate-pulse"
                />
                {/* Branches reaching for sunlight */}
                <path d="M 360 320 Q 280 260, 220 210" stroke={treeHealthState === 'withered' ? '#581c87' : '#10b981'} strokeWidth="10" strokeLinecap="round" fill="none" />
                <path d="M 360 270 Q 440 210, 500 170" stroke={treeHealthState === 'withered' ? '#581c87' : '#10b981'} strokeWidth="10" strokeLinecap="round" fill="none" />
                {/* Foliage soft clouds */}
                <circle cx="220" cy="210" r="38" fill={treeHealthState === 'withered' ? '#3b0764' : '#10b981'} opacity="0.35" filter="url(#foliageBlur)" />
                <circle cx="500" cy="170" r="42" fill={treeHealthState === 'withered' ? '#3b0764' : '#10b981'} opacity="0.35" filter="url(#foliageBlur)" />
                <circle cx="360" cy="190" r="46" fill={treeHealthState === 'withered' ? '#2e1065' : '#34d399'} opacity="0.3" filter="url(#foliageBlur)" />
              </g>
            )}

            {growthStage === 'flourishing_oak' && (
              <g className="stage-flourishing-oak">
                {/* Sturdy muscular oak trunk with 3D cylindrical gradient */}
                <path
                  d="M 326 480 C 340 380, 348 310, 360 265 C 372 310, 380 380, 394 480 Z"
                  fill={treeHealthState === 'withered' ? 'url(#witheredBarkGradient)' : 'url(#woodOakGradient)'}
                  stroke={treeHealthState === 'withered' ? '#450a0a' : '#5c2409'}
                  strokeWidth="3.5"
                />
                {/* Buttress root anchors */}
                <path d="M 326 480 Q 270 496, 215 508" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="14" strokeLinecap="round" fill="none" />
                <path d="M 394 480 Q 450 496, 505 508" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="14" strokeLinecap="round" fill="none" />

                {/* Central Meridian (Đốc Mạch Thần Mộc) */}
                <path d="M 360 475 Q 365 370, 360 265" stroke="url(#manaSapGradient)" strokeWidth="6" strokeDasharray="10 8" fill="none" className="animate-pulse" />

                {/* Major Acupuncture Meridian Conduits along 3 Boughs */}
                <path d="M 350 295 C 310 230, 230 160, 140 85" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="20" strokeLinecap="round" fill="none" />
                <path d="M 350 295 C 310 230, 230 160, 140 85" stroke="url(#manaSapGradient)" strokeWidth="5" strokeDasharray="8 6" fill="none" className="animate-pulse" />

                <path d="M 360 275 Q 360 160, 360 65" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="20" strokeLinecap="round" fill="none" />
                <path d="M 360 275 Q 360 160, 360 65" stroke="url(#manaSapGradient)" strokeWidth="5" strokeDasharray="8 6" fill="none" className="animate-pulse" />

                <path d="M 370 295 C 410 230, 490 160, 580 85" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="20" strokeLinecap="round" fill="none" />
                <path d="M 370 295 C 410 230, 490 160, 580 85" stroke="url(#manaSapGradient)" strokeWidth="5" strokeDasharray="8 6" fill="none" className="animate-pulse" />

                {/* Acupoint Nodes (Huyệt Vị Kinh Mạch) */}
                <circle cx="360" cy="460" r="5.5" fill="#38bdf8" filter="url(#coreGlow)" className="animate-pulse" />
                <circle cx="360" cy="350" r="6" fill="#fbbf24" filter="url(#coreGlow)" className="animate-pulse" />
                <circle cx="270" cy="215" r="5" fill="#c084fc" filter="url(#coreGlow)" />
                <circle cx="450" cy="215" r="5" fill="#fde047" filter="url(#coreGlow)" />

                {/* Layered Foliage Canopy Clusters */}
                <circle cx="140" cy="85" r="65" fill="url(#wisdomFoliageGlow)" filter="url(#foliageBlur)" />
                <circle cx="170" cy="105" r="42" fill={treeHealthState === 'withered' ? '#4c1d95' : '#6366f1'} opacity="0.3" filter="url(#coreGlow)" />
                <circle cx="360" cy="65" r="75" fill="url(#socialFoliageGlow)" filter="url(#foliageBlur)" />
                <circle cx="360" cy="85" r="52" fill={treeHealthState === 'withered' ? '#581c87' : '#0284c7'} opacity="0.35" filter="url(#coreGlow)" />
                <circle cx="580" cy="85" r="65" fill="url(#wealthFoliageGlow)" filter="url(#foliageBlur)" />
                <circle cx="550" cy="105" r="42" fill={treeHealthState === 'withered' ? '#78350f' : '#f59e0b'} opacity="0.3" filter="url(#coreGlow)" />
              </g>
            )}

            {growthStage === 'grand_pillar' && (
              <g className="stage-grand-pillar">
                {/* Massive weathered ancient pillar trunk */}
                <path
                  d="M 315 480 C 330 380, 345 300, 360 250 C 375 300, 390 380, 405 480 Z"
                  fill={treeHealthState === 'withered' ? 'url(#witheredBarkGradient)' : 'url(#woodOakGradient)'}
                  stroke={treeHealthState === 'withered' ? '#450a0a' : '#451a03'}
                  strokeWidth="4"
                />
                {/* Buttress root anchors */}
                <path d="M 315 480 Q 260 495, 200 508" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#5c2409'} strokeWidth="16" strokeLinecap="round" fill="none" />
                <path d="M 405 480 Q 460 495, 520 508" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#5c2409'} strokeWidth="16" strokeLinecap="round" fill="none" />

                {/* Dual Meridian Sap Channels */}
                <path d="M 355 475 Q 361 360, 355 250" stroke="url(#manaSapGradient)" strokeWidth="6" strokeDasharray="12 8" fill="none" className="animate-pulse" />
                <path d="M 365 475 Q 371 360, 365 250" stroke="url(#manaSapGradient)" strokeWidth="6" strokeDasharray="12 8" fill="none" className="animate-pulse" />

                {/* Broad sheltering canopy arches */}
                <path d="M 345 280 C 290 220, 210 160, 130 95" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="22" strokeLinecap="round" fill="none" />
                <path d="M 360 260 Q 360 150, 360 65" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="22" strokeLinecap="round" fill="none" />
                <path d="M 375 280 C 430 220, 510 160, 590 95" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="22" strokeLinecap="round" fill="none" />

                {/* Colossal canopy foliage */}
                <circle cx="130" cy="95" r="72" fill="url(#wisdomFoliageGlow)" filter="url(#foliageBlur)" />
                <circle cx="360" cy="65" r="80" fill="url(#socialFoliageGlow)" filter="url(#foliageBlur)" />
                <circle cx="590" cy="95" r="72" fill="url(#wealthFoliageGlow)" filter="url(#foliageBlur)" />
              </g>
            )}

            {growthStage === 'ancient_world_tree' && (
              <g className="stage-ancient-world-tree">
                {/* Radiant Golden Amber World Tree trunk */}
                <path
                  d="M 310 480 C 330 370, 345 290, 360 240 C 375 290, 390 370, 410 480 Z"
                  fill={treeHealthState === 'withered' ? 'url(#witheredBarkGradient)' : 'url(#ancientWorldTreeGold)'}
                  stroke={treeHealthState === 'withered' ? '#7f1d1d' : '#d97706'}
                  strokeWidth="4"
                />
                {/* Transcendent spiral runes on trunk */}
                <path d="M 360 450 Q 370 380, 360 320 Q 350 260, 360 200" stroke="#fef08a" strokeWidth="4" strokeDasharray="8 6" fill="none" className="animate-pulse" />

                {/* Deep ancient root foundation */}
                <path d="M 310 480 Q 255 496, 190 510" stroke="#d97706" strokeWidth="18" strokeLinecap="round" fill="none" />
                <path d="M 410 480 Q 465 496, 530 510" stroke="#d97706" strokeWidth="18" strokeLinecap="round" fill="none" />

                {/* Grand radiant canopy arches */}
                <path d="M 345 270 C 285 210, 205 150, 120 90" stroke="#f59e0b" strokeWidth="24" strokeLinecap="round" fill="none" />
                <path d="M 360 250 Q 360 140, 360 55" stroke="#f59e0b" strokeWidth="24" strokeLinecap="round" fill="none" />
                <path d="M 375 270 C 435 210, 515 150, 600 90" stroke="#f59e0b" strokeWidth="24" strokeLinecap="round" fill="none" />

                {/* Golden heritage fruits (legacy orbs) */}
                <circle cx="120" cy="90" r="14" fill="#fef08a" stroke="#f59e0b" strokeWidth="3" className="animate-bounce" />
                <circle cx="600" cy="90" r="14" fill="#fef08a" stroke="#f59e0b" strokeWidth="3" className="animate-bounce" style={{ animationDelay: '0.4s' }} />
                <circle cx="360" cy="55" r="16" fill="#fef08a" stroke="#eab308" strokeWidth="3" className="animate-pulse" />
              </g>
            )}
          </g>

          {/* Spouse Ivy of Love (Quyết định 2: Phương Án A) */}
          {hasSpouse && growthStage !== 'sprout' && (
            <g className="spouse-ivy-of-love cursor-pointer" onClick={() => soundFx.playBirdChirp()}>
              <title>{`🌹 Dây Leo Tình Duyên: ${spouse?.name || 'Bạn Đời'} (Độ Thấu Cảm: ${spouse?.affection_level || 90}%)`}</title>
              {/* Helical Spiral Stem wrapped around trunk */}
              <path
                d="M 338 465 C 380 420, 332 375, 368 320 C 392 280, 342 245, 362 205"
                stroke="url(#roseStemGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                filter="url(#coreGlow)"
              />
              <path
                d="M 338 465 C 380 420, 332 375, 368 320 C 392 280, 342 245, 362 205"
                stroke="#6ee7b7"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="none"
              />

              {/* Blooming Ruby Rose Blossoms */}
              {[
                { cx: 356, cy: 425, r: 7 },
                { cx: 342, cy: 350, r: 8.5 },
                { cx: 374, cy: 285, r: 8 },
                { cx: 358, cy: 215, r: 6.5 }
              ].map((rose, idx) => (
                <g key={`rose-${idx}`} className="transition-transform hover:scale-125 origin-center">
                  <circle cx={rose.cx} cy={rose.cy} r={rose.r} fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                  <circle cx={rose.cx} cy={rose.cy} r={rose.r * 0.4} fill="#fef08a" />
                </g>
              ))}

              {/* Floating Romance Heart Tag */}
              <g transform="translate(378, 335)">
                <rect x="0" y="0" width="84" height="20" rx="10" fill="#4c0519" stroke="#f43f5e" strokeWidth="1" opacity="0.9" />
                <text x="8" y="14" fontSize="10" fill="#fecdd3" fontWeight="bold">🌹 {spouse?.name?.split(' ')[0] || 'Ý Trung Nhân'}</text>
              </g>
            </g>
          )}

          {/* Children Budding Orbs (Quyết định 2: Phương Án A - Búp Mầm Quả Non F2) */}
          {childrenList.length > 0 && growthStage !== 'sprout' && (
            <g className="children-budding-orbs">
              {/* Family bough branching toward South-West */}
              <path
                d="M 345 365 C 290 395, 240 425, 175 440"
                stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'}
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 345 365 C 290 395, 240 425, 175 440"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                fill="none"
              />

              {/* Dangling Golden Child Orbs */}
              {childrenList.slice(0, 3).map((child: any, idx: number) => {
                const childPos = [
                  { stemX: 285, stemY: 395, fruitX: 285, fruitY: 422 },
                  { stemX: 235, stemY: 418, fruitX: 235, fruitY: 448 },
                  { stemX: 185, stemY: 438, fruitX: 185, fruitY: 468 }
                ][idx] || { stemX: 285, stemY: 395, fruitX: 285, fruitY: 422 };

                return (
                  <g
                    key={`child-orb-${child.id || idx}`}
                    className="cursor-pointer group"
                    onClick={() => {
                      soundFx.playBabyChuckle();
                      if (onNpcInteract) onNpcInteract(child.id, 'socialize');
                    }}
                  >
                    <title>{`👶 Con Cái F2: ${child.name || 'Hài Nhi'} (${child.age ?? 0} tuổi)`}</title>
                    {/* Hanging stalk */}
                    <line
                      x1={childPos.stemX}
                      y1={childPos.stemY}
                      x2={childPos.fruitX}
                      y2={childPos.fruitY}
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                    {/* Glowing Fruit Orb */}
                    <circle
                      cx={childPos.fruitX}
                      cy={childPos.fruitY}
                      r="13"
                      fill="url(#childFruitGrad)"
                      stroke="#fed7aa"
                      strokeWidth="1.5"
                      filter="url(#coreGlow)"
                      className="animate-pulse"
                      style={{ animationDuration: `${2.5 + idx * 0.5}s` }}
                    />
                    {/* Baby Emoji / Icon */}
                    <text
                      x={childPos.fruitX}
                      y={childPos.fruitY + 4}
                      textAnchor="middle"
                      fontSize="11"
                    >
                      👶
                    </text>
                    {/* Child Name & Age Badge */}
                    <g transform={`translate(${childPos.fruitX - 35}, ${childPos.fruitY + 16})`}>
                      <rect x="0" y="0" width="70" height="16" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="0.8" opacity="0.95" />
                      <text x="35" y="11.5" textAnchor="middle" fontSize="9" fill="#e0e7ff" fontWeight="bold">
                        {child.name?.split(' ').slice(-1)[0] || 'Con'} ({child.age ?? 0}t)
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* Annual Tree Growth Rings (Vòng Vân Gỗ Đời Người) */}
          <g className="annual-growth-rings" id="annualGrowthRings">
            <ellipse cx={centerX} cy={485} rx={65} ry={15} fill="#381404" stroke="#78350f" strokeWidth="2" />
            {Array.from({ length: Math.min(characterAge, 45) }).map((_, i) => {
              const rx = 5 + (i * 1.3);
              const ry = 1.6 + (i * 0.28);
              const isMilestone = [6, 18, 30, 42, 60].includes(i + 1);
              return (
                <ellipse
                  key={`wood-ring-${i}`}
                  cx={centerX}
                  cy={485}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke={isMilestone ? '#fbbf24' : '#92400e'}
                  strokeWidth={isMilestone ? '1.8' : '0.7'}
                  strokeOpacity={isMilestone ? '0.95' : '0.4'}
                />
              );
            })}
          </g>

          {/* Healing Pulse Shockwave when Vitality Restored */}
          {healingPulse && (
            <circle
              cx={centerX}
              cy={centerY}
              r="240"
              fill="none"
              stroke="#10b981"
              strokeWidth="8"
              className="animate-ping opacity-60"
              style={{ animationDuration: '1.2s' }}
            />
          )}

          {/* Draw Leaf Petiole Vines from Center Trunk to each Foliage Leaflet */}
          {nodes.map(node => {
            const rad = (node.angleDeg * Math.PI) / 180;
            const targetX = centerX + Math.cos(rad) * (baseRadius * node.distanceRatio * 1.25);
            const targetY = centerY + Math.sin(rad) * (baseRadius * node.distanceRatio * 1.05);

            const midX = (centerX + targetX) / 2;
            const midY = (centerY + targetY) / 2 - 20;
            const pathD = `M ${centerX} ${centerY} Q ${midX} ${midY} ${targetX} ${targetY}`;

            const isHovered = hoveredNodeId === node.id;
            const canAfford = actionPoints >= node.apCost;

            return (
              <g key={`branch-${node.id}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={node.color.line}
                  strokeWidth={isHovered ? '4.5' : '2.5'}
                  strokeOpacity={isHovered ? '0.95' : canAfford ? '0.55' : '0.2'}
                  className="transition-all duration-300"
                />

                {canAfford && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHovered ? '#fbbf24' : '#a5b4fc'}
                    strokeWidth={isHovered ? '3.5' : '2'}
                    strokeDasharray="6 14"
                    className="animate-[dash_1.5s_linear_infinite]"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* ========================================================================= */}
        {/* IN-TREE MERIDIAN ACUPOINTS (HUYỆT ĐẠO KỸ NĂNG NGAY TRÊN CÀNH TÂY BẮC) */}
        {/* ========================================================================= */}
        {characterAge >= 6 && MERIDIAN_ACUPOINTS.map(acupoint => {
          const isUnlocked = character?.unlocked_skills?.includes(acupoint.id);
          const canUnlock = (character?.skill_points || 0) >= acupoint.costSp && !isUnlocked;

          return (
            <div
              key={`acupoint-${acupoint.id}`}
              className="absolute z-25 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(acupoint.x / canvasWidth) * 100}%`,
                top: `${(acupoint.y / canvasHeight) * 100}%`
              }}
            >
              <Tooltip
                content={
                  <div className="space-y-1 text-xs max-w-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                      <span>{acupoint.icon}</span>
                      <span>Huyệt Đạo: {acupoint.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        {acupoint.branch}
                      </span>
                    </div>
                    <div className="text-slate-200">{acupoint.desc}</div>
                    <div className="text-[11px] font-mono">
                      {isUnlocked ? (
                        <span className="text-emerald-400 font-bold">✓ Đã đả thông kinh mạch</span>
                      ) : canUnlock ? (
                        <span className="text-amber-300 font-bold">✨ Nhấn để khai mở ({acupoint.costSp} SP)</span>
                      ) : (
                        <span className="text-slate-400">Cần {acupoint.costSp} SP để khai thông</span>
                      )}
                    </div>
                  </div>
                }
              >
                <button
                  type="button"
                  disabled={isLoading || isUnlocked || !canUnlock}
                  onClick={() => {
                    if (canUnlock && onUnlockSkill) {
                      soundFx.playLevelUp();
                      onUnlockSkill(acupoint.id);
                    }
                  }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 shadow-xl border ${
                    isUnlocked
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/50 shadow-emerald-500/40'
                      : canUnlock
                      ? 'bg-amber-500 border-amber-300 text-slate-950 ring-2 ring-amber-400/60 animate-pulse hover:scale-125 cursor-pointer font-bold'
                      : 'bg-slate-900/70 border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  {acupoint.icon}
                </button>
              </Tooltip>
            </div>
          );
        })}

        {/* ========================================================================= */}
        {/* CENTER CORE: CỘI NGUỒN SINH MỆNH (CENTRAL ORB) */}
        {/* ========================================================================= */}
        <Tooltip
          content={
            <div className="space-y-1 text-xs">
              <div className="font-bold text-amber-300">
                {actionPoints === 0 ? '✨ Đón Giao Thừa & Chiêm Nghiệm Cuối Năm' : 'Lõi Sinh Mệnh Cội Nguồn'}
              </div>
              <div>
                {actionPoints === 0
                  ? 'Chạm vào lõi để khép lại một năm, đúc kết hành trình và gieo mầm tâm nguyện cho năm mới!'
                  : 'Bản thể hội tụ năng lượng sống, định hình các lựa chọn thường niên.'}
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                {actionPoints > 0 ? `Khả dụng: ${actionPoints}/${totalAp} AP` : 'Đã tiêu hao hết năng lượng năm nay'}
              </div>
            </div>
          }
        >
          <div
            onClick={() => {
              if (actionPoints === 0) {
                soundFx.playYearEndChime();
                if (onOpenYearEndReflection) onOpenYearEndReflection();
                else if (onTimeSkip) onTimeSkip();
              } else {
                handleAvatarPoke();
              }
            }}
            className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center p-2 text-center select-none shadow-2xl transition-all duration-300 cursor-pointer group ${
              actionPoints === 0 ? 'hover:scale-110 active:scale-95 animate-pulse' : ''
            }`}
            style={{
              left: '50%',
              top: `${(centerY / canvasHeight) * 100}%`,
              background: actionPoints === 0
                ? 'radial-gradient(circle, rgba(245,158,11,0.6) 0%, rgba(180,83,9,0.4) 50%, rgba(15,23,42,0.95) 85%)'
                : 'radial-gradient(circle, rgba(99,102,241,0.38) 0%, rgba(15,23,42,0.95) 75%)',
              boxShadow: actionPoints === 0
                ? '0 0 50px rgba(245,158,11,0.65), inset 0 0 25px rgba(251,191,36,0.35)'
                : '0 0 40px rgba(99,102,241,0.45)',
              border: actionPoints === 0
                ? '2.5px solid rgba(251,191,36,0.95)'
                : '2px solid rgba(129,140,248,0.65)'
            }}
          >
            <div className={`absolute inset-0 rounded-full border pointer-events-none ${
              actionPoints === 0 ? 'border-amber-400 animate-ping opacity-35' : 'border-indigo-400/40 animate-ping opacity-25'
            }`} />

            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shadow-inner group-hover:scale-110 transition-transform ${
              actionPoints === 0
                ? 'bg-amber-500/30 border border-amber-400 text-amber-200'
                : 'bg-indigo-500/20 border border-indigo-400/40 text-white'
            }`}>
              {actionPoints === 0 ? '✨' : STAGE_META[growthStage].icon}
            </div>

            <div className={`text-xs font-sans font-bold mt-1 leading-none tracking-tight ${
              actionPoints === 0 ? 'text-amber-300 font-black' : 'text-white'
            }`}>
              {actionPoints > 0 ? `${actionPoints} AP` : '✨ Giao Thừa'}
            </div>
            <div className={`text-[9.5px] font-mono mt-0.5 opacity-90 truncate max-w-[92px] ${
              actionPoints === 0 ? 'text-amber-200 font-bold' : 'text-emerald-300'
            }`}>
              {actionPoints === 0 ? 'Gieo Mầm →' : STAGE_META[growthStage].label}
            </div>
          </div>
        </Tooltip>

        {/* ========================================================================= */}
        {/* ORGANIC FOLIAGE LEAFLET NODES (TÁN LÁ HÀNH ĐỘNG HỮU CƠ CỦA THẦN MỘC) */}
        {/* ========================================================================= */}
        {nodes.map(node => {
          const rad = (node.angleDeg * Math.PI) / 180;
          const leftPercent = 50 + (Math.cos(rad) * (baseRadius * node.distanceRatio * 1.25) / canvasWidth) * 100;
          const topPercent = (centerY / canvasHeight) * 100 + (Math.sin(rad) * (baseRadius * node.distanceRatio * 1.05) / canvasHeight) * 100;

          const isHovered = hoveredNodeId === node.id;
          const isPulsing = pulseActiveId === node.id;
          const canAfford = actionPoints >= node.apCost;
          const isHealingAction = node.id === 'restore_vitality' || node.id === 'sunbath' || node.id === 'eat_grow';

          return (
            <div
              key={node.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
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
                {/* Organic Leaflet Sprig Button */}
                <button
                  type="button"
                  disabled={isLoading || !canAfford}
                  onClick={() => handleNodeClick(node)}
                  className={`relative px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-tl-[26px] rounded-br-[26px] rounded-tr-[10px] rounded-bl-[10px] border text-left transition-all duration-300 flex items-center gap-2 select-none active:scale-95 shadow-xl backdrop-blur-md ${
                    node.isBreakthrough
                      ? 'bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border-amber-400 text-amber-200 ring-2 ring-amber-400/60 shadow-amber-900/50 animate-pulse'
                      : isHealingAction && treeHealthState === 'withered'
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400 shadow-emerald-500/60 animate-bounce'
                      : node.color.bg + ' ' + node.color.border + ' ' + node.color.text
                  } ${
                    isHovered ? 'scale-110 -rotate-2 z-30 shadow-2xl ring-2 ring-white/60' : ''
                  } ${
                    isPulsing ? 'scale-95 ring-4 ring-emerald-400' : ''
                  } ${
                    !canAfford ? 'opacity-40 cursor-not-allowed grayscale-[0.3]' : 'cursor-pointer hover:border-white'
                  }`}
                  style={{
                    boxShadow: isHovered ? `0 0 24px ${node.color.glow}` : undefined
                  }}
                >
                  {/* Organic leaf vein highlight line */}
                  <div className="absolute top-1/2 left-2 right-2 h-[1px] bg-white/10 pointer-events-none -translate-y-1/2" />

                  {/* Leaflet Icon Orb */}
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-base sm:text-lg shrink-0 group-hover:scale-125 transition-transform">
                    {node.icon}
                  </span>

                  {/* Leaflet Titles & Benefits */}
                  <div className="min-w-0 pr-1 text-left">
                    <div className="text-xs font-bold text-white whitespace-normal leading-tight max-w-[125px] sm:max-w-[150px]">
                      {node.title}
                    </div>
                    <div className={`text-[9.5px] font-mono mt-0.5 truncate max-w-[130px] ${
                      node.isBreakthrough
                        ? 'text-amber-300 font-black tracking-wider animate-pulse drop-shadow'
                        : 'text-slate-200 opacity-90'
                    }`}>
                      {node.gainText}
                    </div>
                  </div>

                  {/* Dewdrop AP Cost Badge */}
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/60 text-amber-300 border border-amber-400/30 shrink-0 font-bold shadow-inner">
                    {node.apCost} AP
                  </span>
                </button>
              </Tooltip>
            </div>
          );
        })}

        {/* Annual Growth Rings Interactive Pill Badge */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <Tooltip
            content={
              <div className="space-y-1 text-xs">
                <div className="font-bold text-amber-300">
                  {characterAge === 0 ? '🌱 Mầm Sống Khởi Nguyên' : `🪵 Vòng Vân Gỗ Đời Người (${characterAge} Năm Tuổi)`}:
                </div>
                <div>Gốc rễ đời người tích lũy từng vòng vân gỗ theo năm tháng.</div>
                <div className="text-[11px] text-emerald-300">Giai đoạn hiện tại: <span className="font-bold">{STAGE_META[growthStage].label}</span> ({STAGE_META[growthStage].ageSpan})</div>
                <div className="text-[10px] text-slate-400 italic">{STAGE_META[growthStage].desc}</div>
              </div>
            }
          >
            <div className="px-3 py-1 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-amber-500/40 text-[10.5px] font-sans text-amber-300 font-bold flex items-center gap-1.5 shadow-lg backdrop-blur cursor-help transition">
              <span>{characterAge === 0 ? '🌱' : '🪵'}</span>
              <span>
                {characterAge === 0
                  ? 'Mầm Sống Khởi Nguyên • Gốc Rễ Đời Người'
                  : `${characterAge} Vòng Vân Gỗ Đời Người`}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400">{STAGE_META[growthStage].label}</span>
            </div>
          </Tooltip>
        </div>

        {/* ========================================================================= */}
        {/* IN-TREE SLIDING GLASSMORPHIC DRAWER: SKILL TREE & SOCIAL LINKS LENS */}
        {/* ========================================================================= */}
        {treeViewMode === 'skill_tree' && (
          <div className="absolute inset-y-0 right-0 w-full md:w-[480px] z-40 bg-[var(--bg-card)] border-l border-[var(--border-subtle)] text-[var(--text-primary)] shadow-2xl backdrop-blur-2xl p-4 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-base">
                  🔮
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>Nhánh Kỹ Năng Cuộc Đời</span>
                    <span className="px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold">
                      {character?.skill_points || 0} SP
                    </span>
                  </h4>
                  <p className="text-[10.5px] text-[var(--text-secondary)]">
                    Tri-Branch RPG Build: Thương Trường, Uy Quyền, Tâm Thức
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTreeViewMode('life_actions')}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
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
          </div>
        )}

        {treeViewMode === 'social_links' && (
          <div className="absolute inset-y-0 right-0 w-full md:w-[480px] z-40 bg-slate-950/95 border-l border-sky-500/40 shadow-2xl backdrop-blur-2xl p-4 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-sky-500/30">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-base">
                  👥
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>Nhân Mạch Quý Nhân (Social Links)</span>
                    <span className="px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[11px] font-mono font-bold">
                      {character?.social_links?.length || 4} Quý Nhân
                    </span>
                  </h4>
                  <p className="text-[10.5px] text-slate-400">
                    4 Archetypes: Quý Nhân Bảo Trợ, Chiến Hữu, Kình Địch, Hậu Bối
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTreeViewMode('life_actions')}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
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
          </div>
        )}

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
                Gốc Rễ Gia Đình &amp; Cội Nguồn
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
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {canEatMeal && onFamilyMeal && (
            <Tooltip content="Ăn cơm cùng gia đình: +10 HP, hồi phục sinh lực và bồi đắp tình thân ấm êm.">
              <button
                type="button"
                onClick={onFamilyMeal}
                disabled={isLoading}
                className="py-1.5 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow"
              >
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                <span>{characterAge <= 5 ? 'Bầu Sữa Mẹ' : 'Bữa Cơm'}</span>
                <span className="text-[10px] font-mono text-amber-300/80 ml-1">+10 HP</span>
              </button>
            </Tooltip>
          )}

          {household && !isParentsDeceased && onFamilyMentorship && (
            <Tooltip content={canMentor ? "Lắng nghe lời chỉ dẫn của cha mẹ để nhận +8 Karma và sáng suốt hướng đi." : "Năm nay bạn đã nhận lời khuyên từ cha mẹ rồi."}>
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
    </div>
  );
}
