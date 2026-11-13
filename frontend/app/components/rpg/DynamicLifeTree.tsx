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
  Leaf,
  Clapperboard,
  Gamepad2,
  Stethoscope
} from 'lucide-react';
import Tooltip from '../Tooltip';
import { formatCurrency } from '../../utils/currencyUtils';
import dynamic from 'next/dynamic';
import SkillTreeTab from './SkillTreeTab';
import SocialLinksTab from './SocialLinksTab';
import CulturalLandscapeBackdrop from './CulturalLandscapeBackdrop';
import { soundFx } from '../../utils/soundEffects';
import { ALL_UNLOCKED, UNLOCK_HINTS, type Unlocks } from '../../lib/unlocks';
import { getNodesForState, type LifeTreeNode } from '../../lib/lifeTreeNodes';
import { buildLifeTreeMap, seasonFromLatestEvent } from '../../lib/lifeTreeMap';
import { LifeTreeMapLayer, LifeTreeMapCards } from './LifeTreeMapLayer';

export type { LifeTreeNode } from '../../lib/lifeTreeNodes';

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
  onAdvanceYear?: () => void;
  onOpenYearEndReflection?: () => void;
  onOpenAssets?: () => void;
  onOpenFamily?: () => void;
  onOpenSkillHub?: () => void;
  onUnlockSkill?: (skillId: string) => Promise<void>;
  onNpcInteract?: (npcId: string, actionType: 'socialize' | 'gift' | 'request_favor') => Promise<void>;
  onFamilyMeal?: () => void;
  onFamilyMentorship?: () => void;
  onRpgActivePerk?: (type: string) => void;
  onOpenPetSanctuary?: () => void;
  onLaunchMiniGame?: (gameType: any) => void;
  onSeniorAction?: (actionType: 'write_memoir' | 'grandchild_mentorship' | 'early_estate_will') => Promise<string | void>;
  onDebtRelief?: (reliefType: 'family_soft_loan' | 'liquidate_personal_items') => Promise<string | void>;
  onHealthCheckup?: () => Promise<string | void>;
  onOpenCinema?: () => void;
  activeScenario?: any;
  dilemma?: any;
  annualDigest?: any;
  isNextAgeMilestone?: boolean;
  isPledging?: boolean;
  isLoading?: boolean;
  unlocks?: Unlocks;
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
  onAdvanceYear,
  onOpenYearEndReflection,
  onOpenAssets,
  onOpenFamily,
  onOpenSkillHub,
  onUnlockSkill,
  onNpcInteract,
  onFamilyMeal,
  onFamilyMentorship,
  onRpgActivePerk,
  onOpenPetSanctuary,
  onLaunchMiniGame,
  onSeniorAction,
  onDebtRelief,
  onHealthCheckup,
  onOpenCinema,
  activeScenario,
  dilemma,
  annualDigest,
  isNextAgeMilestone = false,
  isPledging = false,
  isLoading = false,
  unlocks = ALL_UNLOCKED
}: DynamicLifeTreeProps) {
  const [treeViewMode, setTreeViewMode] = useState<'life_actions' | 'skill_tree' | 'social_links' | 'family_roots'>('life_actions');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [pulseActiveId, setPulseActiveId] = useState<string | null>(null);

  // Interactive In-Tree State
  const [healingPulse, setHealingPulse] = useState<boolean>(false);
  const [avatarAnim, setAvatarAnim] = useState<string>('Front_idle');
  const [avatarSpeech, setAvatarSpeech] = useState<string | null>(null);
  const [selectedMeridianSkill, setSelectedMeridianSkill] = useState<string | null>(null);
  const [activeConstellationNpc, setActiveConstellationNpc] = useState<any | null>(null);

  const nationality = character?.nationality || character?.country || character?.origin_country || 'Việt Nam';
  const formattedCash = formatCurrency(cash, nationality);
  const formattedNetWorth = formatCurrency(netWorth, nationality);

  // Character Health, Vitality, Burnout & Tree Vitality Reaction
  const burnout = Number(character?.burnout ?? 0);
  const vitalityVal = Number(vitality ?? character?.vitality ?? 80);
  const isDebt = cash < 0;
  const activeEventData = activeScenario || dilemma;
  const hasActiveEvent = Boolean(activeEventData);
  const milestoneChallenge = annualDigest?.milestone_challenge || null;

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

  // 4 Seasons & Climate Cycle System (Quyết định 2)
  const SEASONS: Array<{
    id: 'spring' | 'summer' | 'autumn' | 'winter';
    name: string;
    icon: string;
    color: string;
    bgBadge: string;
    borderBadge: string;
    textBadge: string;
    tropicalClimate: { title: string; desc: string };
    temperateClimate: { title: string; desc: string };
  }> = [
    {
      id: 'spring',
      name: 'Xuân Sang',
      icon: '🌸',
      color: '#f472b6',
      bgBadge: 'bg-pink-50/90 dark:bg-pink-950/70',
      borderBadge: 'border-pink-400/50 dark:border-pink-500/40',
      textBadge: 'text-pink-900 dark:text-pink-300',
      tropicalClimate: { title: 'Xuân Sang Đâm Chồi', desc: 'Hoa Mai & Đào khoe sắc, vạn vật hồi sinh, khởi sắc đại vận' },
      temperateClimate: { title: 'Băng Tan Chồi Biếc', desc: 'Tuyết tan trên sườn đồi, mầm non đội đất đón nắng ấm đầu mùa' }
    },
    {
      id: 'summer',
      name: 'Hạ Rực Rỡ',
      icon: '☀️',
      color: '#f59e0b',
      bgBadge: 'bg-amber-50/90 dark:bg-amber-950/70',
      borderBadge: 'border-amber-400/50 dark:border-amber-500/40',
      textBadge: 'text-amber-900 dark:text-amber-300',
      tropicalClimate: { title: 'Hạ Chí Nắng Vàng', desc: 'Trời quang mây tạnh, sinh lực căng tràn, nhiệt huyết thăng hoa' },
      temperateClimate: { title: 'Nắng Hè Chói Lọi', desc: 'Ngày dài đêm ngắn, biển trời xanh ngắt, dồi dào sinh khí' }
    },
    {
      id: 'autumn',
      name: 'Thu Hoan Ca',
      icon: '🍁',
      color: '#ea580c',
      bgBadge: 'bg-orange-50/90 dark:bg-orange-950/70',
      borderBadge: 'border-orange-400/50 dark:border-orange-500/40',
      textBadge: 'text-orange-900 dark:text-orange-300',
      tropicalClimate: { title: 'Gió Heo May Về', desc: 'Lúa vàng trĩu hạt, gió heo may se lạnh, kết tinh quả ngọt' },
      temperateClimate: { title: 'Rừng Phong Đỏ Thắm', desc: 'Lá phong nhuộm đỏ đại ngàn, thu hoạch mùa màng no ấm' }
    },
    {
      id: 'winter',
      name: 'Đông Tĩnh Lặng',
      icon: '❄️',
      color: '#38bdf8',
      bgBadge: 'bg-sky-50/90 dark:bg-sky-950/70',
      borderBadge: 'border-sky-400/50 dark:border-sky-500/40',
      textBadge: 'text-sky-900 dark:text-sky-300',
      tropicalClimate: { title: 'Mưa Phùn Se Lạnh', desc: 'Mưa xuân lất phất, không khí trầm lắng, tích lũy nội lực' },
      temperateClimate: { title: 'Tuyết Phủ Tinh Khôi', desc: 'Bông tuyết trắng ngần phủ kín cành cây, ngủ đông dưỡng khí' }
    }
  ];

  const seasonIndex = (characterAge >= 0 ? characterAge : 0) % 4;
  // Mùa theo biến cố của năm vừa khép (nhật ký năm); không rõ thì quay về age % 4
  const eventSeasonId = seasonFromLatestEvent(character, annualDigest?.journal_line);
  const currentSeason = SEASONS.find(s => s.id === eventSeasonId) ?? SEASONS[seasonIndex];
  const lifeMap = buildLifeTreeMap(character);

  // Country climate check (Việt Nam, Đông Nam Á & Vùng Nhiệt Đới vs Ôn đới)
  const isTropicalCountry = ['Việt Nam', 'Vietnam', 'Thailand', 'Thái Lan', 'Indonesia', 'Philippines', 'Singapore', 'Malaysia', 'Ấn Độ', 'India', 'Brazil', 'Somalia', 'Haiti'].some(c => 
    nationality.toLowerCase().includes(c.toLowerCase())
  );
  const seasonClimate = isTropicalCountry ? currentSeason.tropicalClimate : currentSeason.temperateClimate;

  // Dynamic 4-Season Foliage Color Profiles (Đổi sắc thái tán cây theo chu kỳ bốn mùa)
  const seasonalFoliageGlow = {
    spring: {
      wisdom: { start: '#f472b6', mid: '#db2777', stop: '#4a044e' },
      social: { start: '#34d399', mid: '#059669', stop: '#022c22' },
      wealth: { start: '#fde047', mid: '#f59e0b', stop: '#451a03' }
    },
    summer: {
      wisdom: { start: '#38bdf8', mid: '#0284c7', stop: '#082f49' },
      social: { start: '#10b981', mid: '#047857', stop: '#022c22' },
      wealth: { start: '#fbbf24', mid: '#d97706', stop: '#451a03' }
    },
    autumn: {
      wisdom: { start: '#c084fc', mid: '#7e22ce', stop: '#3b0764' },
      social: { start: '#f97316', mid: '#c2410c', stop: '#431407' },
      wealth: { start: '#eab308', mid: '#b45309', stop: '#451a03' }
    },
    winter: {
      wisdom: { start: '#7dd3fc', mid: '#0284c7', stop: '#0c4a6e' },
      social: { start: '#67e8f9', mid: '#0891b2', stop: '#164e63' },
      wealth: { start: '#f8fafc', mid: '#94a3b8', stop: '#334155' }
    }
  }[currentSeason.id];

  // Equipped Spirit Guardian Pet (Quyết định 4)
  const equippedPet = character?.equipped_pet || 'none';
  const [petHeartAnim, setPetHeartAnim] = useState<boolean>(false);
  const [petFeedbackText, setPetFeedbackText] = useState<string | null>(null);

  const handlePetInteraction = () => {
    if (equippedPet === 'puppy') {
      soundFx.playPetBark();
      setPetFeedbackText('Gâu gâu! Cún Lucky ve vẩy đuôi ôm chân bạn (-8% Burnout, +3 Tình cảm)!');
    } else if (equippedPet === 'cat') {
      soundFx.playPetMeow();
      setPetFeedbackText('Meo meo~ Mèo Mochi ôm đồng tiền vàng vẫy tay chiêu tài lộc (+5% Lợi tức)!');
    } else if (equippedPet === 'fox') {
      soundFx.playFoxChirp();
      setPetFeedbackText('Hồ Ly Cửu Vĩ xòe 9 đuôi phát quang tím mê hoặc (+5 Charm, Quý Nhân)!');
    } else if (equippedPet === 'dragon') {
      soundFx.playDragonRoar();
      setPetFeedbackText('Ấu Long Luân Hồi ngâm vang chấn động Thần Mộc (+10 Karma, -30% Shock)!');
    } else {
      if (onOpenPetSanctuary) onOpenPetSanctuary();
      return;
    }
    setPetHeartAnim(true);
    setTimeout(() => setPetHeartAnim(false), 1200);
    setTimeout(() => setPetFeedbackText(null), 3500);
  };

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

  const nodes = getNodesForState({ character, characterAge, breakthroughAction, unlocks });


  // Lớp màu dùng chung cho node hành động (canvas desktop + danh sách thẻ mobile)
  const getNodeSkin = (node: LifeTreeNode): string => {
    const isHealingAction = node.id === 'restore_vitality' || node.id === 'sunbath' || node.id === 'eat_grow';
    if (node.isBreakthrough) {
      return 'bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 border-amber-500 text-amber-950 shadow-amber-300/40 ring-2 ring-amber-400/50 dark:from-amber-950 dark:via-yellow-950 dark:to-amber-950 dark:border-amber-400 dark:text-amber-200 dark:ring-amber-400/60 dark:shadow-amber-900/50 animate-pulse';
    }
    if (isHealingAction && treeHealthState === 'withered') {
      return 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 shadow-emerald-400/40 animate-bounce dark:bg-emerald-950/90 dark:border-emerald-400 dark:text-emerald-200';
    }
    return node.color.bg + ' ' + node.color.border + ' ' + node.color.text;
  };

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

    // Focus-driven nodes that reuse existing handlers outside onChildAction/onAdultAction
    if (node.id === 'family_meal') { onFamilyMeal?.(); return; }
    if (node.id === 'health_checkup') { onHealthCheckup?.(); return; }
    if (node.id.startsWith('npc_meet:')) { onNpcInteract?.(node.id.slice('npc_meet:'.length), 'socialize'); return; }

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

  // In-Tree Meridian Acupoints (Huyệt Đạo Kỹ Năng Trên Tán Cây - tách biệt khỏi các thẻ hành động & pill góc)
  const MERIDIAN_ACUPOINTS = [
    {
      id: 'stoic_mind',
      name: 'Khắc Kỷ Tịnh Tâm',
      icon: '🔮',
      branch: 'Trí Tuệ',
      costSp: 1,
      x: 125,
      y: 105,
      desc: 'Kháng 30% kiệt sức, bảo tồn nguyên khí.'
    },
    {
      id: 'mindfulness_zen',
      name: 'Thiền Định Tỉnh Thức',
      icon: '🧘',
      branch: 'Trí Tuệ',
      costSp: 1,
      x: 205,
      y: 132,
      desc: '-20% Căng thẳng tích tụ mỗi năm.'
    },
    {
      id: 'charisma_magnet',
      name: 'Hiếu Đạo Gia Phong',
      icon: '✨',
      branch: 'Gia Phong',
      costSp: 1,
      x: 360,
      y: 184,
      desc: 'Gấp đôi tốc độ hảo cảm Social Links.'
    },
    {
      id: 'market_sense_1',
      name: 'Mắt Thần Định Giá',
      icon: '🪙',
      branch: 'Tư Bản',
      costSp: 1,
      x: 515,
      y: 132,
      desc: 'Giảm 10% giá BĐS & +15% lướt sóng.'
    },
    {
      id: 'capital_engine',
      name: 'Cỗ Máy Dòng Tiền',
      icon: '⚙️',
      branch: 'Tư Bản',
      costSp: 2,
      x: 595,
      y: 105,
      desc: 'Tự động sinh lãi thặng dư hàng năm.'
    }
  ];

  // SVG Dimension Constants (Expanded Majestic Scale)
  const canvasWidth = 720;
  const canvasHeight = 520;
  const centerX = canvasWidth / 2; // 360
  const centerY = 275;
  const baseRadius = 182;

  // Sacred Dais Level Progression (Tier 1 to 5 - Đồng bộ với Avatar GoldenMagicDais theo chỉ đạo của Sếp)
  const daisTier = characterAge >= 56 ? 5 : characterAge >= 36 ? 4 : characterAge >= 18 ? 3 : characterAge >= 6 ? 2 : 1;

  return (
    <div className="w-full rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-2 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col gap-3.5 backdrop-blur-2xl transition-colors duration-200">
      {/* Background Starfield Aura & Cosmic Mist */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[560px] bg-gradient-to-br from-indigo-950/15 via-amber-950/10 to-emerald-950/15 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER: THẦN MỘC STATUS BAR (SINGLE-ROW COMPACT STANDARD) */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap relative z-20 pb-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 min-w-0">
          <Tooltip
            position="bottom"
            align="left"
            content={
              <div className="space-y-1 text-xs max-w-xs">
                <div className="font-bold text-amber-700 dark:text-amber-300">Đại Thụ Sinh Mệnh Toàn Năng</div>
                <div className="text-[var(--text-secondary)]">
                  Hệ sinh thái cuộc đời: Gốc Rễ Gia Đình · Nhánh Kỹ Năng · Cành Tài Sản · Tán Lá Hành Động.
                </div>
              </div>
            }
          >
            <div className="flex items-center gap-2 cursor-help">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-wide flex items-center gap-1.5 flex-wrap">
                <span>Đại Thụ Sinh Mệnh Toàn Năng</span>
                <span className="text-xs font-sans tabular-nums px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold">
                  Tuổi {characterAge}
                </span>
                <span
                  className="text-xs font-sans px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold shadow-sm text-emerald-800 dark:text-emerald-300"
                  style={{
                    backgroundColor: `${STAGE_META[growthStage].themeColor}15`,
                    borderColor: `${STAGE_META[growthStage].themeColor}40`
                  }}
                >
                  <span>{STAGE_META[growthStage].icon}</span>
                  <span>{STAGE_META[growthStage].label}</span>
                </span>
              </h3>
            </div>
          </Tooltip>
        </div>

        {/* Tree Health Indicator & AP Balance */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dynamic Tree Health State Pill */}
          <Tooltip
            position="bottom"
            align="right"
            content={
              <div className="space-y-1 text-xs">
                <div className="font-bold text-amber-700 dark:text-amber-300">Thể Trạng Thần Mộc:</div>
                <div className="text-[var(--text-secondary)]">
                  {treeHealthState === 'withered'
                    ? 'Thần Mộc kiệt sức: Căng thẳng cao hoặc âm nợ. Hãy chọn Dưỡng Sinh hoặc Bữa Cơm!'
                    : treeHealthState === 'fatigued'
                    ? 'Thần Mộc tiêu hao sinh lực: Nhựa sống luân chuyển chậm, nên nghỉ ngơi.'
                    : 'Thần Mộc sung mãn: Linh khí ngọc bích dồi dào!'}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 tabular-nums">
                  Sinh lực: {vitalityVal}% · Căng thẳng: {burnout}%
                </div>
              </div>
            }
          >
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold cursor-help transition shadow-sm ${
                treeHealthState === 'withered'
                  ? 'bg-rose-50/90 dark:bg-rose-950/80 border-rose-400/60 dark:border-rose-500/60 text-rose-900 dark:text-rose-300 animate-pulse ring-1 ring-rose-400/50'
                  : treeHealthState === 'fatigued'
                  ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-400/50 dark:border-amber-500/50 text-amber-900 dark:text-amber-300'
                  : 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-400/40 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  treeHealthState === 'withered'
                    ? 'text-rose-500 fill-rose-500 animate-bounce'
                    : treeHealthState === 'fatigued'
                    ? 'text-amber-500 fill-amber-400'
                    : 'text-emerald-500 fill-emerald-400'
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
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--bg-card-subtle)] border border-amber-500/40 text-xs font-semibold text-amber-700 dark:text-amber-400 shadow-sm cursor-help">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500 dark:text-amber-400 animate-pulse" />
              <span className="tabular-nums font-bold text-sm">{actionPoints}</span>
              <span className="text-[var(--text-secondary)] text-xs">/ {totalAp} AP</span>
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
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-500 hover:from-amber-300 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition active:scale-95"
              >
                <FastForward className="w-3 h-3 text-slate-950" />
                <span>Lên Lớp 1</span>
              </button>
            </Tooltip>
          )}

          {/* Year-End Sacred Ritual & Unified Turn Advancement Pair */}
          {(onOpenYearEndReflection || onAdvanceYear || onTimeSkip) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {onOpenYearEndReflection && !isNextAgeMilestone && (
                <Tooltip
                  position="bottom"
                  align="right"
                  content="Chiêm Nghiệm Cuối Năm & Gieo Mầm Tâm Nguyện: Chủ động tổng kết và đặt lời nguyện bất cứ lúc nào."
                >
                  <button
                    type="button"
                    onClick={onOpenYearEndReflection}
                    disabled={isLoading || isPledging}
                    title="Chiêm Nghiệm Cuối Năm"
                    className="px-2.5 py-1 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-amber-500/50 font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <span>✨</span>
                    <span>Gieo Mầm</span>
                  </button>
                </Tooltip>
              )}

              {(onAdvanceYear || onTimeSkip) && (
                <Tooltip
                  position="bottom"
                  align="right"
                  content={
                    actionPoints === 0
                      ? `Đã dùng hết năng lượng năm nay. Nhấn (hoặc bấm Space) để mở khóa Tuổi ${characterAge + 1}!`
                      : `Bước sang Tuổi ${characterAge + 1} [Space]: AP chưa dùng tự động chuyển thành Dưỡng Sinh (+2 HP / -5% Căng thẳng).`
                  }
                >
                  <button
                    type="button"
                    onClick={() => (onAdvanceYear ? onAdvanceYear() : onTimeSkip?.())}
                    disabled={isLoading || isPledging}
                    className={`px-3 py-1 rounded-xl font-bold text-xs transition active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                      actionPoints === 0
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 font-black shadow-amber-500/30 animate-pulse ring-2 ring-amber-400/60'
                        : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/70 dark:hover:bg-amber-900/70 text-amber-950 dark:text-amber-200 border border-amber-400/50'
                    }`}
                  >
                    <span>{isNextAgeMilestone ? '✨' : '🌿'}</span>
                    <span>
                      {isNextAgeMilestone
                        ? `Cột Mốc Tuổi ${characterAge + 1}`
                        : `Sang Tuổi ${characterAge + 1}`}
                    </span>
                    <kbd className="font-mono text-xs bg-slate-900/10 dark:bg-black/35 px-1.5 py-0.5 rounded font-bold hidden sm:inline">
                      Space
                    </kbd>
                  </button>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* UNIFIED 4-PILLAR LENS BAR (HỢP NHẤT 4 TRỤ CỘT TRÊN ĐỈNH ĐẠI THỤ) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-2 flex-wrap relative z-20">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] shadow-inner flex-nowrap overflow-x-auto max-w-full [&>*]:shrink-0 [&>*]:whitespace-nowrap sm:flex-wrap sm:overflow-visible">
          <button
            type="button"
            onClick={() => setTreeViewMode('life_actions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              treeViewMode === 'life_actions'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Vòng Đời &amp; Hành Động</span>
          </button>

          {unlocks.skillTree ? (
          <button
            type="button"
            onClick={() => setTreeViewMode('skill_tree')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              treeViewMode === 'skill_tree'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-md shadow-slate-900/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>🔮 Nhánh Kỹ Năng</span>
            <span className={`hidden sm:inline text-xs tabular-nums ${treeViewMode === 'skill_tree' ? 'text-slate-300 dark:text-slate-600' : 'text-[var(--text-secondary)]'}`}>
              · Lv.{character?.life_level || 1} · {character?.unlocked_skills?.length || 0} kỹ năng
            </span>
            {(character?.skill_points || 0) > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs tabular-nums font-black">
                +{character.skill_points} điểm
              </span>
            )}
          </button>
          ) : (
            <span role="note" className="px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">{UNLOCK_HINTS.rebirth}</span>
          )}

          {onRpgActivePerk && character?.unlocked_skills?.includes('stock_trading') && (
            <Tooltip content="Lướt sóng cổ phiếu (1 AP): Chớp cơ hội thị trường sinh lời">
              <button
                type="button"
                disabled={isLoading || actionPoints < 1}
                onClick={() => onRpgActivePerk('stock_trading')}
                className="px-2 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-400/50 text-emerald-900 dark:text-emerald-300 text-xs font-bold transition shrink-0 cursor-pointer"
              >
                📈 Lướt Sóng
              </button>
            </Tooltip>
          )}

          <button
            type="button"
            onClick={() => setTreeViewMode('social_links')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              treeViewMode === 'social_links'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>👥 Nhân Mạch Quý Nhân</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs tabular-nums font-bold border ${
              treeViewMode === 'social_links'
                ? 'bg-sky-700/40 border-white/40'
                : 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/35'
            }`}>
              {character?.social_links?.filter((n: any) => n.linkLevel >= 2).length || 0}/{character?.social_links?.length || 4}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTreeViewMode('family_roots')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              treeViewMode === 'family_roots'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>🏡 Gốc Rễ Gia Đình</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs tabular-nums font-bold border ${
              treeViewMode === 'family_roots'
                ? 'bg-slate-900/15 border-slate-900/25 text-slate-950'
                : isParentsDeceased
                ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/35'
            }`}>
              {isParentsDeceased ? 'Di sản' : canEatMeal || canMentor ? 'Ấm êm' : 'Bình an'}
            </span>
          </button>
        </div>

        {/* Wealth Pillar Shortcut */}
        {unlocks.assets ? (
        <Tooltip position="bottom" align="right" content="Mở Sổ Vàng Tài Sản & Đầu Tư BĐS (Cành Hoàng Kim)">
          <button
            type="button"
            onClick={onOpenAssets}
            className="px-3 py-1.5 rounded-2xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-amber-500/40 hover:border-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-sm transition hover:scale-[1.02] active:scale-95 cursor-pointer group shrink-0"
          >
            <span>🪙</span>
            <span className="text-amber-700 dark:text-amber-400">Cành Hoàng Kim</span>
            <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">{formattedCash.primary}</span>
            <span className="text-[var(--text-secondary)] text-xs font-sans">• {assets.length} TS</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 opacity-70 group-hover:opacity-100 transition" />
          </button>
        </Tooltip>
        ) : (
          <span role="note" className="px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] shrink-0">{UNLOCK_HINTS.adult}</span>
        )}
      </div>

      {/* ========================================================================= */}
      {/* INTEGRATED DESTINY EVENT, MILESTONE & INTERVENTION SANCTUARY STRIP */}
      {/* (Quy hoạch các sự kiện chức năng ngay đỉnh Thần Mộc, không tách thẻ thừa) */}
      {/* ========================================================================= */}
      {(hasActiveEvent || milestoneChallenge || treeHealthState === 'withered' || (isDebt && onDebtRelief) || (characterAge >= 56 && onSeniorAction)) && (
        <div className="space-y-1.5 relative z-20">
          {hasActiveEvent && (
            <div className="px-3.5 py-2 rounded-2xl bg-rose-50/95 dark:bg-rose-950/85 border border-rose-400/70 dark:border-rose-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wide">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600 dark:bg-rose-400" />
                  </span>
                  <span>Biến Cố Định Mệnh • Tuổi {characterAge}</span>
                </div>
                <div className="text-sm font-bold text-rose-950 dark:text-rose-100 line-clamp-2">
                  {activeEventData?.title}
                </div>
                {activeEventData?.description && (
                  <div className="text-xs text-rose-900 dark:text-rose-200 line-clamp-2">
                    {activeEventData.description}
                  </div>
                )}
              </div>
              {onOpenCinema && (
                <button
                  type="button"
                  onClick={onOpenCinema}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-rose-500 dark:hover:bg-rose-400 dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-95 shrink-0 cursor-pointer"
                >
                  <Clapperboard className="w-3.5 h-3.5" />
                  <span>Đối Mặt Biến Cố</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {milestoneChallenge && onLaunchMiniGame && (
            <div className="px-3.5 py-2 rounded-2xl bg-amber-50/95 dark:bg-amber-950/75 border border-amber-400/70 dark:border-amber-500/50 flex flex-wrap items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <Gamepad2 className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-amber-950 dark:text-amber-100 truncate">
                    Thử Thách Cột Mốc Tuổi {milestoneChallenge.age}: {milestoneChallenge.title}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onLaunchMiniGame(milestoneChallenge.game_type)}
                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
              >
                <span>Thử Thách Ngay</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {treeHealthState === 'withered' && (
            <div className="px-3.5 py-1.5 rounded-2xl bg-rose-50/95 dark:bg-rose-950/90 border border-rose-400/70 dark:border-rose-500/70 text-rose-900 dark:text-rose-200 text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Thần Mộc Đang Kiệt Sức! Hãy chọn Dưỡng Sinh, Khám Sức Khỏe hoặc chạm Rễ Gia Đình để hồi sinh!</span>
              </div>
              <div className="flex items-center gap-1.5">
                {onHealthCheckup && (
                  <button
                    type="button"
                    onClick={() => onHealthCheckup()}
                    disabled={isLoading}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/70 text-emerald-950 dark:text-emerald-200 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Stethoscope className="w-3 h-3" />
                    <span>Khám Tổng Quát</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {isDebt && onDebtRelief && (
            <div className="px-3.5 py-1.5 rounded-2xl bg-orange-50/95 dark:bg-orange-950/75 border border-orange-400/60 dark:border-orange-500/50 text-orange-950 dark:text-orange-200 text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-sm">
              <span>💸 Cảnh Báo Nợ Nần ({formattedCash.primary}): Giải cứu dòng tiền kịp thời</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onDebtRelief('family_soft_loan')}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 border border-amber-500/40 text-amber-950 dark:text-amber-200 text-xs font-bold cursor-pointer"
                >
                  🤝 Vay Mềm Người Thân
                </button>
                <button
                  type="button"
                  onClick={() => onDebtRelief('liquidate_personal_items')}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-bold cursor-pointer"
                >
                  📦 Thanh Lý Đồ Đạc
                </button>
              </div>
            </div>
          )}

          {characterAge >= 56 && onSeniorAction && (
            <div className="px-3.5 py-1.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/65 border border-amber-500/40 text-amber-950 dark:text-amber-200 text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-sm">
              <span>👑 Nghi Thức Tuổi Hạc &amp; Truyền Thừa Di Sản:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => onSeniorAction('write_memoir')}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-bold cursor-pointer"
                >
                  ✍️ Viết Hồi Ký
                </button>
                <button
                  type="button"
                  onClick={() => onSeniorAction('grandchild_mentorship')}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-bold cursor-pointer"
                >
                  👨‍👩‍👧‍👦 Dạy Cháu
                </button>
                <button
                  type="button"
                  onClick={() => onSeniorAction('early_estate_will')}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-bold cursor-pointer"
                >
                  ⚖️ Lập Di Chúc
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN LIVING STAGE: THẦN MỘC 3D VĨ ĐẠI (ZERO-OVERLAP BREATHABLE CANVAS) */}
      {/* ========================================================================= */}
      <div className={`relative w-full ${treeViewMode === 'life_actions' ? 'h-[350px]' : 'h-[560px]'} md:h-[600px] overflow-hidden flex items-center justify-center rounded-3xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] shadow-2xl transition-colors duration-200`}>
        
        {/* Dynamic Seasonal Sky Dome & Ambient Backdrop Aura */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-1000 z-0"
          style={{
            background:
              currentSeason.id === 'spring'
                ? 'var(--tree-sky-spring)'
                : currentSeason.id === 'summer'
                ? 'var(--tree-sky-summer)'
                : currentSeason.id === 'autumn'
                ? 'var(--tree-sky-autumn)'
                : 'var(--tree-sky-winter)'
          }}
        />

        {/* Dynamic National Cultural Landscape Panorama Backdrop */}
        <CulturalLandscapeBackdrop
          nationality={nationality}
          currentCity={character?.current_city}
          seasonId={currentSeason.id}
          characterAge={characterAge}
        />

        {/* 60fps GPU-Accelerated Dynamic Particle Weather Stream */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {currentSeason.id === 'spring' && (
            <>
              {/* 20 Falling Cherry & Peach Blossoms */}
              {[
                { left: 5, delay: 0.2, dur: 7.2, size: 14, rot: 15, isGold: false },
                { left: 12, delay: 2.1, dur: 8.5, size: 12, rot: -30, isGold: true },
                { left: 18, delay: 4.3, dur: 6.8, size: 16, rot: 45, isGold: false },
                { left: 25, delay: 1.0, dur: 9.0, size: 13, rot: -15, isGold: false },
                { left: 32, delay: 5.5, dur: 7.6, size: 15, rot: 35, isGold: true },
                { left: 39, delay: 0.8, dur: 8.2, size: 12, rot: -40, isGold: false },
                { left: 46, delay: 3.4, dur: 9.4, size: 17, rot: 50, isGold: false },
                { left: 53, delay: 1.9, dur: 7.4, size: 14, rot: 20, isGold: false },
                { left: 60, delay: 4.8, dur: 8.6, size: 13, rot: -25, isGold: true },
                { left: 67, delay: 2.7, dur: 7.9, size: 15, rot: 30, isGold: false },
                { left: 74, delay: 0.5, dur: 8.8, size: 12, rot: -35, isGold: false },
                { left: 81, delay: 3.9, dur: 7.5, size: 16, rot: 25, isGold: true },
                { left: 88, delay: 1.4, dur: 9.2, size: 14, rot: -10, isGold: false },
                { left: 94, delay: 5.0, dur: 8.1, size: 13, rot: 40, isGold: false },
                { left: 15, delay: 6.2, dur: 7.8, size: 15, rot: -20, isGold: false },
                { left: 29, delay: 7.1, dur: 8.4, size: 14, rot: 35, isGold: false },
                { left: 43, delay: 6.6, dur: 7.3, size: 13, rot: -15, isGold: true },
                { left: 58, delay: 7.8, dur: 8.9, size: 16, rot: 45, isGold: false },
                { left: 72, delay: 6.9, dur: 7.7, size: 12, rot: -30, isGold: false },
                { left: 86, delay: 7.4, dur: 8.3, size: 15, rot: 20, isGold: false },
              ].map((p, i) => (
                <span
                  key={`spring-petal-stream-${i}`}
                  className="absolute text-base select-none pointer-events-none animate-tree-petal-fall"
                  style={{
                    left: `${p.left}%`,
                    top: '-24px',
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.dur}s`,
                    ['--fall-dur' as any]: `${p.dur}s`,
                    fontSize: `${p.size}px`,
                    filter: p.isGold ? 'drop-shadow(0 0 6px rgba(251,191,36,0.6))' : 'drop-shadow(0 0 6px rgba(244,114,182,0.5))'
                  }}
                >
                  {p.isGold ? '✨' : '🌸'}
                </span>
              ))}
            </>
          )}

          {currentSeason.id === 'summer' && (
            <>
              {/* 18 Ascending Glowing Summer Fireflies */}
              {[
                { left: 8, bottom: 25, delay: 0.3, dur: 4.8, size: 6 },
                { left: 16, bottom: 35, delay: 1.8, dur: 5.6, size: 8 },
                { left: 24, bottom: 15, delay: 3.2, dur: 4.5, size: 7 },
                { left: 32, bottom: 40, delay: 0.9, dur: 5.2, size: 9 },
                { left: 40, bottom: 20, delay: 2.4, dur: 4.9, size: 8 },
                { left: 48, bottom: 30, delay: 4.1, dur: 5.8, size: 7 },
                { left: 56, bottom: 18, delay: 1.3, dur: 4.6, size: 9 },
                { left: 64, bottom: 38, delay: 2.9, dur: 5.4, size: 8 },
                { left: 72, bottom: 22, delay: 0.6, dur: 5.0, size: 7 },
                { left: 80, bottom: 32, delay: 3.6, dur: 4.7, size: 8 },
                { left: 88, bottom: 15, delay: 1.7, dur: 5.5, size: 9 },
                { left: 93, bottom: 28, delay: 2.7, dur: 4.8, size: 6 },
                { left: 20, bottom: 45, delay: 4.6, dur: 5.1, size: 8 },
                { left: 36, bottom: 25, delay: 3.9, dur: 4.9, size: 7 },
                { left: 52, bottom: 42, delay: 5.2, dur: 5.3, size: 8 },
                { left: 68, bottom: 20, delay: 4.3, dur: 4.7, size: 9 },
                { left: 78, bottom: 46, delay: 5.7, dur: 5.4, size: 7 },
                { left: 85, bottom: 35, delay: 4.9, dur: 5.0, size: 8 }
              ].map((f, i) => (
                <span
                  key={`summer-firefly-${i}`}
                  className="absolute rounded-full bg-amber-300 pointer-events-none animate-tree-firefly"
                  style={{
                    left: `${f.left}%`,
                    bottom: `${f.bottom}%`,
                    width: `${f.size}px`,
                    height: `${f.size}px`,
                    animationDelay: `${f.delay}s`,
                    animationDuration: `${f.dur}s`,
                    ['--fly-dur' as any]: `${f.dur}s`,
                    boxShadow: '0 0 12px 3px rgba(251,191,36,0.95), 0 0 20px 6px rgba(245,158,11,0.6)'
                  }}
                />
              ))}
            </>
          )}

          {currentSeason.id === 'autumn' && (
            <>
              {/* 20 Swirling Autumn Leaves */}
              {[
                { left: 6, delay: 0.3, dur: 7.5, size: 16, icon: '🍁' },
                { left: 14, delay: 2.4, dur: 8.8, size: 14, icon: '🍂' },
                { left: 21, delay: 4.6, dur: 7.0, size: 17, icon: '🍁' },
                { left: 28, delay: 1.1, dur: 9.2, size: 15, icon: '🍂' },
                { left: 35, delay: 3.8, dur: 8.0, size: 18, icon: '🍁' },
                { left: 42, delay: 0.6, dur: 8.6, size: 14, icon: '🍂' },
                { left: 49, delay: 5.2, dur: 7.4, size: 16, icon: '🍁' },
                { left: 56, delay: 2.0, dur: 9.0, size: 15, icon: '🍂' },
                { left: 63, delay: 4.1, dur: 8.2, size: 17, icon: '🍁' },
                { left: 70, delay: 1.5, dur: 7.7, size: 14, icon: '🍂' },
                { left: 77, delay: 5.7, dur: 8.9, size: 16, icon: '🍁' },
                { left: 84, delay: 3.0, dur: 7.3, size: 15, icon: '🍂' },
                { left: 91, delay: 0.8, dur: 9.5, size: 18, icon: '🍁' },
                { left: 96, delay: 4.8, dur: 8.3, size: 14, icon: '🍂' },
                { left: 18, delay: 6.4, dur: 7.9, size: 16, icon: '🍁' },
                { left: 33, delay: 7.2, dur: 8.5, size: 15, icon: '🍂' },
                { left: 47, delay: 6.8, dur: 7.6, size: 17, icon: '🍁' },
                { left: 62, delay: 7.9, dur: 8.7, size: 14, icon: '🍂' },
                { left: 75, delay: 6.5, dur: 7.8, size: 16, icon: '🍁' },
                { left: 88, delay: 7.6, dur: 8.4, size: 15, icon: '🍂' }
              ].map((leaf, i) => (
                <span
                  key={`autumn-leaf-stream-${i}`}
                  className="absolute select-none pointer-events-none animate-tree-leaf-swirl"
                  style={{
                    left: `${leaf.left}%`,
                    top: '-24px',
                    animationDelay: `${leaf.delay}s`,
                    animationDuration: `${leaf.dur}s`,
                    ['--fall-dur' as any]: `${leaf.dur}s`,
                    fontSize: `${leaf.size}px`,
                    filter: 'drop-shadow(0 0 6px rgba(234,88,12,0.6))'
                  }}
                >
                  {leaf.icon}
                </span>
              ))}
            </>
          )}

          {currentSeason.id === 'winter' && (
            <>
              {/* 26 Falling Snowflakes (Parallax Multi-Depth) */}
              {[
                { left: 4, delay: 0.2, dur: 6.0, size: 16, opacity: 0.95 },
                { left: 10, delay: 2.5, dur: 8.5, size: 10, opacity: 0.7 },
                { left: 17, delay: 4.8, dur: 5.6, size: 18, opacity: 1.0 },
                { left: 23, delay: 1.2, dur: 9.0, size: 9, opacity: 0.65 },
                { left: 29, delay: 3.5, dur: 6.5, size: 15, opacity: 0.9 },
                { left: 36, delay: 0.7, dur: 8.2, size: 11, opacity: 0.75 },
                { left: 42, delay: 5.1, dur: 5.8, size: 17, opacity: 0.95 },
                { left: 48, delay: 2.1, dur: 8.8, size: 10, opacity: 0.7 },
                { left: 54, delay: 4.3, dur: 6.2, size: 15, opacity: 0.9 },
                { left: 61, delay: 1.6, dur: 9.3, size: 9, opacity: 0.6 },
                { left: 67, delay: 5.8, dur: 5.4, size: 19, opacity: 1.0 },
                { left: 73, delay: 3.1, dur: 8.0, size: 11, opacity: 0.75 },
                { left: 79, delay: 0.4, dur: 6.6, size: 16, opacity: 0.9 },
                { left: 86, delay: 4.5, dur: 8.6, size: 10, opacity: 0.7 },
                { left: 92, delay: 2.8, dur: 5.7, size: 18, opacity: 0.95 },
                { left: 97, delay: 1.0, dur: 9.1, size: 8, opacity: 0.6 },
                { left: 13, delay: 6.3, dur: 6.4, size: 15, opacity: 0.9 },
                { left: 26, delay: 7.1, dur: 8.1, size: 10, opacity: 0.75 },
                { left: 39, delay: 6.7, dur: 5.9, size: 17, opacity: 0.95 },
                { left: 52, delay: 7.8, dur: 8.7, size: 11, opacity: 0.7 },
                { left: 65, delay: 6.4, dur: 6.3, size: 16, opacity: 0.9 },
                { left: 77, delay: 7.5, dur: 8.4, size: 10, opacity: 0.7 },
                { left: 89, delay: 6.9, dur: 5.8, size: 18, opacity: 1.0 },
                { left: 20, delay: 8.2, dur: 7.2, size: 13, opacity: 0.8 },
                { left: 58, delay: 8.6, dur: 6.9, size: 14, opacity: 0.85 },
                { left: 83, delay: 8.0, dur: 7.5, size: 12, opacity: 0.8 }
              ].map((snow, i) => (
                <span
                  key={`winter-snow-stream-${i}`}
                  className="absolute select-none pointer-events-none animate-tree-snow-drift font-sans"
                  style={{
                    left: `${snow.left}%`,
                    top: '-24px',
                    animationDelay: `${snow.delay}s`,
                    animationDuration: `${snow.dur}s`,
                    ['--fall-dur' as any]: `${snow.dur}s`,
                    fontSize: `${snow.size}px`,
                    opacity: snow.opacity,
                    color: '#f0f9ff',
                    filter: 'drop-shadow(0 0 5px rgba(224,242,254,0.9))'
                  }}
                >
                  ❄
                </span>
              ))}
            </>
          )}
        </div>
        
        {/* ========================================================================= */}
        {/* SEASON & CLIMATE BADGE (GÓC TRÊN TRÁI CANVAS - THOÁNG ĐẠT KHÔNG CHE TÁN CÂY) */}
        {/* ========================================================================= */}
        <div className="absolute top-3 left-3 sm:left-4 z-25 pointer-events-auto">
          <Tooltip
            position="bottom"
            align="left"
            content={
              <div className="space-y-1 text-xs max-w-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                  <span>{currentSeason.icon}</span>
                  <span>{currentSeason.name} • {seasonClimate.title}</span>
                </div>
                <div className="text-[var(--text-primary)]">{seasonClimate.desc}</div>
                <div className="text-xs text-[var(--text-secondary)] tabular-nums">
                  Quốc gia: {nationality} ({isTropicalCountry ? 'Nhiệt đới / Á nhiệt đới' : 'Ôn đới / Hàn đới'})
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Nhấp để lắng nghe phong linh bốn mùa</div>
              </div>
            }
          >
            <button
              type="button"
              onClick={() => soundFx.playSeasonBreeze()}
              className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-full ${currentSeason.bgBadge} border ${currentSeason.borderBadge} shadow-md backdrop-blur-md flex items-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-xs`}
            >
              <span className="text-sm">{currentSeason.icon}</span>
              <span className={`font-bold ${currentSeason.textBadge}`}>{currentSeason.name}</span>
              <span className="text-slate-600 dark:text-slate-300 hidden md:inline">•</span>
              <span className="text-xs text-slate-700 dark:text-slate-200 hidden md:inline truncate max-w-[125px] font-sans font-medium">
                {seasonClimate.title}
              </span>
            </button>
          </Tooltip>
        </div>

        {/* ========================================================================= */}
        {/* SPIRIT GUARDIAN PET CONTROLS (GÓC TRÊN PHẢI CANVAS - CÂN XỨNG) */}
        {/* ========================================================================= */}
        <div className="absolute top-3 right-3 sm:right-4 z-25 pointer-events-auto flex items-center gap-1.5">
          {!unlocks.pets ? null : equippedPet !== 'none' ? (
            <Tooltip
              position="bottom"
              align="right"
              content={
                <div className="space-y-1 text-xs max-w-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                    <span>{equippedPet === 'puppy' ? '🐶' : equippedPet === 'cat' ? '🐱' : equippedPet === 'fox' ? '🦊' : '🐉'}</span>
                    <span>Linh Thú: {equippedPet === 'puppy' ? 'Cún Cỏ Trung Nghĩa' : equippedPet === 'cat' ? 'Mèo Thần Tài' : equippedPet === 'fox' ? 'Hồ Ly Cửu Vĩ' : 'Ấu Long Luân Hồi'}</span>
                  </div>
                  <div className="text-[var(--text-primary)]">
                    {equippedPet === 'puppy' ? 'Giảm 8% Burnout thụ động, +3 Tình cảm người thân hàng năm' :
                     equippedPet === 'cat' ? '+5% Lợi tức tài sản, chiêu tài đón lộc thặng dư' :
                     equippedPet === 'fox' ? '+5 Sức hút Charm, tăng cơ duyên gặp gỡ quý nhân' :
                     '+10 Karma, +3 HP, giảm 30% tổn thất từ biến cố vĩ mô'}
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 tabular-nums">Nhấp để vuốt ve & nghe tiếng kêu!</div>
                </div>
              }
            >
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePetInteraction}
                  className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900/80 border border-indigo-300 dark:border-indigo-400/50 shadow-md backdrop-blur-md flex items-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-xs"
                >
                  <span className="text-base animate-bounce">{equippedPet === 'puppy' ? '🐶' : equippedPet === 'cat' ? '🐱' : equippedPet === 'fox' ? '🦊' : '🐉'}</span>
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 text-xs">
                    {equippedPet === 'puppy' ? 'Cún Lucky' : equippedPet === 'cat' ? 'Mèo Mochi' : equippedPet === 'fox' ? 'Cửu Vĩ' : 'Ấu Long'}
                  </span>
                  {petHeartAnim && <span className="animate-ping text-rose-500 text-xs">❤️</span>}
                </button>
                {onOpenPetSanctuary && (
                  <button
                    type="button"
                    onClick={onOpenPetSanctuary}
                    className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow text-xs cursor-pointer"
                    title="Đổi hoặc Mở Chuồng Linh Thú"
                  >
                    🐾
                  </button>
                )}
              </div>
            </Tooltip>
          ) : (
            onOpenPetSanctuary && (
              <button
                type="button"
                onClick={onOpenPetSanctuary}
                className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border border-amber-500/40 hover:border-amber-400 text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 text-xs font-semibold shadow-md backdrop-blur flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <span>🐾</span>
                <span>Đón Linh Thú</span>
              </button>
            )
          )}
        </div>

        {/* Pet Floating Speech Balloon Notification */}
        {petFeedbackText && (
          <div className="absolute top-[50px] right-3 sm:right-4 z-30 px-3 py-1.5 rounded-2xl bg-[var(--bg-card)] dark:bg-indigo-950/95 border border-indigo-400 text-slate-900 dark:text-indigo-100 text-xs font-semibold shadow-2xl backdrop-blur animate-in fade-in zoom-in-95 duration-200 max-w-xs pointer-events-none">
            {petFeedbackText}
          </div>
        )}

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
              <stop offset="0%" stopColor={treeHealthState === 'withered' ? '#4c1d95' : seasonalFoliageGlow.wisdom.start} stopOpacity="0.55" />
              <stop offset="55%" stopColor={treeHealthState === 'withered' ? '#311042' : seasonalFoliageGlow.wisdom.mid} stopOpacity="0.28" />
              <stop offset="100%" stopColor={seasonalFoliageGlow.wisdom.stop} stopOpacity="0" />
            </radialGradient>

            <radialGradient id="socialFoliageGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={treeHealthState === 'withered' ? '#581c87' : seasonalFoliageGlow.social.start} stopOpacity="0.55" />
              <stop offset="55%" stopColor={treeHealthState === 'withered' ? '#0284c7' : seasonalFoliageGlow.social.mid} stopOpacity="0.28" />
              <stop offset="100%" stopColor={seasonalFoliageGlow.social.stop} stopOpacity="0" />
            </radialGradient>

            <radialGradient id="wealthFoliageGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={treeHealthState === 'withered' ? '#78350f' : seasonalFoliageGlow.wealth.start} stopOpacity="0.55" />
              <stop offset="55%" stopColor={treeHealthState === 'withered' ? '#d97706' : seasonalFoliageGlow.wealth.mid} stopOpacity="0.28" />
              <stop offset="100%" stopColor={seasonalFoliageGlow.wealth.stop} stopOpacity="0" />
            </radialGradient>

            <radialGradient id="sproutHaloGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={currentSeason.id === 'spring' ? '#f472b6' : '#34d399'} stopOpacity="0.35" />
              <stop offset="50%" stopColor={currentSeason.id === 'spring' ? '#10b981' : '#059669'} stopOpacity="0.18" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
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

            {/* Sacred Dais Gradients (Kế thừa từ GoldenMagicDais Avatar) */}
            <linearGradient id="daisGoldPlateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="20%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="80%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            <linearGradient id="daisObsidianGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="verticalBeamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#67e8f9" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>

            {/* Seasonal Ambient Gradients */}
            <radialGradient id="springDawnGlow" cx="50%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0.22" />
              <stop offset="45%" stopColor="#34d399" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="summerGodRayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>

            <radialGradient id="autumnTwilightGlow" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#b45309" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="winterAuroraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.38" />
              <stop offset="40%" stopColor="#10b981" stopOpacity="0.32" />
              <stop offset="75%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.28" />
            </linearGradient>

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

          {/* ========================================================================= */}
          {/* 1. DYNAMIC SEASONAL ATMOSPHERE & WEATHER AMBIENCE (CHỈ ĐẠO CỦA SẾP) */}
          {/* ========================================================================= */}
          <g className="seasonal-atmosphere-layer pointer-events-none">
            {currentSeason.id === 'spring' && (
              <g className="spring-atmosphere">
                <ellipse cx={centerX} cy={200} rx={340} ry={200} fill="url(#springDawnGlow)" />
                {/* 14 Falling Sakura/Peach Blossom Petals */}
                {[
                  { x: 120, y: 40, rx: 7, ry: 4, rot: 25, dur: '7s', delay: '0s' },
                  { x: 190, y: 70, rx: 6, ry: 3.5, rot: -30, dur: '8.5s', delay: '1.2s' },
                  { x: 270, y: 30, rx: 7.5, ry: 4.2, rot: 45, dur: '6.8s', delay: '2.5s' },
                  { x: 340, y: 60, rx: 6.5, ry: 3.8, rot: -15, dur: '9s', delay: '0.8s' },
                  { x: 420, y: 35, rx: 7, ry: 4, rot: 35, dur: '7.5s', delay: '3.1s' },
                  { x: 490, y: 75, rx: 6, ry: 3.5, rot: -40, dur: '8s', delay: '1.9s' },
                  { x: 580, y: 45, rx: 8, ry: 4.5, rot: 50, dur: '9.5s', delay: '2.8s' },
                  { x: 150, y: 160, rx: 6.5, ry: 3.8, rot: 15, dur: '7.2s', delay: '4s' },
                  { x: 230, y: 220, rx: 7, ry: 4, rot: -25, dur: '8.2s', delay: '3.5s' },
                  { x: 310, y: 290, rx: 6, ry: 3.5, rot: 30, dur: '7.8s', delay: '2.2s' },
                  { x: 450, y: 240, rx: 7.5, ry: 4.2, rot: -35, dur: '8.8s', delay: '4.5s' },
                  { x: 530, y: 280, rx: 6.5, ry: 3.8, rot: 20, dur: '7.6s', delay: '1.5s' },
                  { x: 380, y: 360, rx: 7, ry: 4, rot: -10, dur: '9.2s', delay: '3.8s' },
                  { x: 480, y: 380, rx: 6, ry: 3.5, rot: 40, dur: '8.4s', delay: '0.5s' }
                ].map((petal, i) => (
                  <ellipse
                    key={`spring-petal-${i}`}
                    cx={petal.x}
                    cy={petal.y}
                    rx={petal.rx}
                    ry={petal.ry}
                    fill="url(#roseFlowerGrad)"
                    transform={`rotate(${petal.rot} ${petal.x} ${petal.y})`}
                    className="animate-pulse"
                    style={{
                      animationDuration: petal.dur,
                      animationDelay: petal.delay,
                      opacity: 0.85
                    }}
                  />
                ))}
                {/* Luminous Golden Pollen Spores */}
                {[
                  { cx: 220, cy: 380, r: 2.5, dur: '3.2s' },
                  { cx: 290, cy: 340, r: 3, dur: '2.6s' },
                  { cx: 360, cy: 390, r: 2.8, dur: '3.8s' },
                  { cx: 430, cy: 330, r: 3.2, dur: '2.9s' },
                  { cx: 500, cy: 370, r: 2.6, dur: '3.5s' }
                ].map((spore, i) => (
                  <circle
                    key={`spring-spore-${i}`}
                    cx={spore.cx}
                    cy={spore.cy}
                    r={spore.r}
                    fill="#fef08a"
                    filter="url(#coreGlow)"
                    className="animate-pulse"
                    style={{ animationDuration: spore.dur }}
                  />
                ))}
              </g>
            )}

            {currentSeason.id === 'summer' && (
              <g className="summer-atmosphere">
                {/* 4 Golden God Rays streaming from zenith down to earth */}
                <g className="god-rays opacity-50">
                  <polygon points="360,0 230,520 290,520" fill="url(#summerGodRayGrad)" className="animate-tree-godray" />
                  <polygon points="360,0 430,520 490,520" fill="url(#summerGodRayGrad)" className="animate-tree-godray" style={{ animationDelay: '2s' }} />
                  <polygon points="360,0 130,480 180,480" fill="url(#summerGodRayGrad)" className="animate-tree-godray" style={{ animationDelay: '1.2s' }} />
                  <polygon points="360,0 540,480 590,480" fill="url(#summerGodRayGrad)" className="animate-tree-godray" style={{ animationDelay: '3.1s' }} />
                </g>
                {/* Glowing Solar Core at Zenith */}
                <circle cx={centerX} cy={35} r={48} fill="#fef08a" opacity="0.3" filter="url(#foliageBlur)" />
                <circle cx={centerX} cy={35} r={18} fill="#fbbf24" opacity="0.6" filter="url(#coreGlow)" className="animate-pulse" />
                {/* Golden Fireflies */}
                {[
                  { cx: 210, cy: 150, r: 3.5, delay: '0.4s' },
                  { cx: 280, cy: 230, r: 3, delay: '1.2s' },
                  { cx: 340, cy: 180, r: 4, delay: '2.1s' },
                  { cx: 420, cy: 190, r: 3.5, delay: '0.9s' },
                  { cx: 500, cy: 140, r: 4, delay: '1.7s' },
                  { cx: 460, cy: 260, r: 3, delay: '2.5s' }
                ].map((fly, i) => (
                  <circle
                    key={`summer-fly-${i}`}
                    cx={fly.cx}
                    cy={fly.cy}
                    r={fly.r}
                    fill="#fef08a"
                    filter="url(#coreGlow)"
                    className="animate-pulse"
                    style={{ animationDuration: '2.2s', animationDelay: fly.delay }}
                  />
                ))}
              </g>
            )}

            {currentSeason.id === 'autumn' && (
              <g className="autumn-atmosphere">
                <ellipse cx={centerX} cy={220} rx={350} ry={220} fill="url(#autumnTwilightGlow)" />
                {/* 10 Swirling Autumn Leaves */}
                {[
                  { d: 'M 0 -8 C 6 -12 12 -4 8 4 C 4 10 -4 10 -8 4 C -12 -4 -6 -12 0 -8 Z', x: 140, y: 60, scale: 0.9, fill: '#dc2626', rot: 25, dur: '7.5s', delay: '0s' },
                  { d: 'M 0 -8 C 6 -12 12 -4 8 4 C 4 10 -4 10 -8 4 C -12 -4 -6 -12 0 -8 Z', x: 230, y: 110, scale: 0.8, fill: '#ea580c', rot: -40, dur: '8.8s', delay: '1.4s' },
                  { d: 'M 0 -8 C 6 -12 12 -4 8 4 C 4 10 -4 10 -8 4 C -12 -4 -6 -12 0 -8 Z', x: 320, y: 40, scale: 1.0, fill: '#f59e0b', rot: 30, dur: '6.9s', delay: '2.8s' },
                  { d: 'M 0 -8 C 6 -12 12 -4 8 4 C 4 10 -4 10 -8 4 C -12 -4 -6 -12 0 -8 Z', x: 410, y: 80, scale: 0.85, fill: '#b45309', rot: -20, dur: '9.1s', delay: '0.6s' },
                  { d: 'M 0 -8 C 6 -12 12 -4 8 4 C 4 10 -4 10 -8 4 C -12 -4 -6 -12 0 -8 Z', x: 500, y: 50, scale: 0.95, fill: '#dc2626', rot: 45, dur: '7.8s', delay: '3.2s' },
                  { d: 'M 0 -8 C 6 -12 12 -4 8 4 C 4 10 -4 10 -8 4 C -12 -4 -6 -12 0 -8 Z', x: 590, y: 95, scale: 0.75, fill: '#ea580c', rot: -35, dur: '8.4s', delay: '2.1s' },
                  { d: 'M 0 -8 C 6 -12 12 -4 8 4 C 4 10 -4 10 -8 4 C -12 -4 -6 -12 0 -8 Z', x: 180, y: 220, scale: 0.85, fill: '#f59e0b', rot: 15, dur: '7.4s', delay: '4.2s' },
                  { d: 'M 0 -8 C 6 -12 12 -4 8 4 C 4 10 -4 10 -8 4 C -12 -4 -6 -12 0 -8 Z', x: 270, y: 290, scale: 0.9, fill: '#dc2626', rot: -50, dur: '8.6s', delay: '1.8s' }
                ].map((leaf, i) => (
                  <path
                    key={`autumn-leaf-${i}`}
                    d={leaf.d}
                    fill={leaf.fill}
                    transform={`translate(${leaf.x}, ${leaf.y}) scale(${leaf.scale}) rotate(${leaf.rot})`}
                    className="animate-pulse"
                    style={{ animationDuration: leaf.dur, animationDelay: leaf.delay, opacity: 0.88 }}
                  />
                ))}
              </g>
            )}

            {currentSeason.id === 'winter' && (
              <g className="winter-atmosphere">
                {/* Aurora Borealis Shimmering Wave Curtain */}
                <path
                  d="M 0 75 Q 180 20, 360 85 T 720 40 L 720 0 L 0 0 Z"
                  fill="url(#winterAuroraGrad)"
                  className="animate-tree-aurora"
                  filter="url(#foliageBlur)"
                  opacity="0.65"
                />
                {/* 16 Falling Snowflakes */}
                {[
                  { cx: 90, cy: 45, r: 3.5, dur: '5.5s', delay: '0s', op: 0.9 },
                  { cx: 160, cy: 90, r: 2.2, dur: '8s', delay: '1.5s', op: 0.7 },
                  { cx: 230, cy: 35, r: 4, dur: '5s', delay: '2.8s', op: 0.95 },
                  { cx: 290, cy: 80, r: 2, dur: '8.5s', delay: '0.8s', op: 0.65 },
                  { cx: 350, cy: 30, r: 3.5, dur: '6s', delay: '3.2s', op: 0.9 },
                  { cx: 410, cy: 85, r: 2.5, dur: '7.5s', delay: '1.9s', op: 0.75 },
                  { cx: 480, cy: 40, r: 4.2, dur: '5.2s', delay: '2.4s', op: 0.95 },
                  { cx: 550, cy: 75, r: 2, dur: '9s', delay: '0.4s', op: 0.6 },
                  { cx: 620, cy: 50, r: 3.8, dur: '5.8s', delay: '3.5s', op: 0.9 },
                  { cx: 210, cy: 260, r: 3.5, dur: '6.2s', delay: '2.1s', op: 0.9 },
                  { cx: 440, cy: 250, r: 3.8, dur: '5.6s', delay: '1.2s', op: 0.95 },
                  { cx: 600, cy: 270, r: 3.2, dur: '6.5s', delay: '0.9s', op: 0.85 }
                ].map((snow, i) => (
                  <circle
                    key={`winter-snow-${i}`}
                    cx={snow.cx}
                    cy={snow.cy}
                    r={snow.r}
                    fill="#e0f2fe"
                    opacity={snow.op}
                    className="animate-pulse"
                    style={{ animationDuration: snow.dur, animationDelay: snow.delay }}
                  />
                ))}
              </g>
            )}
          </g>

          {/* Sacred Ground Soil Mound */}
          <ellipse cx={centerX} cy={488} rx={280} ry={24} fill="#0b1120" stroke="#1e293b" strokeWidth="2" />
          <ellipse cx={centerX} cy={488} rx={250} ry={16} fill="rgba(15,23,42,0.95)" stroke="#334155" strokeWidth="1" />

          {/* PROCEDURAL TRUNK GEOMETRY FOR THE 5 GROWTH STAGES */}
          <g className="procedural-tree-trunk" id="proceduralTreeTrunk">
            {growthStage === 'sprout' && (
              <g className="stage-sprout">
                {/* Sprout Luminous Ambient Halo */}
                <ellipse cx="360" cy="365" rx="130" ry="120" fill="url(#sproutHaloGrad)" className="animate-tree-foliage-breath" />

                {/* Sacred Seed (Hạt Giống Thần Thoại Khởi Nguyên) */}
                <ellipse cx="360" cy="480" rx="24" ry="15" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" filter="url(#coreGlow)" />
                <ellipse cx="360" cy="477" rx="17" ry="10" fill="#34d399" opacity="0.6" />
                <circle cx="360" cy="476" r="4" fill="#fef08a" filter="url(#coreGlow)" className="animate-pulse" />

                {/* 3D Curved Seedling Trunk (Thân Mầm Ngọc Bích Khối Trụ) */}
                <path
                  d="M 350 480 C 342 380, 353 305, 360 265 C 367 305, 378 380, 370 480 Z"
                  fill={treeHealthState === 'withered' ? 'url(#witheredBarkGradient)' : 'url(#sproutGradient)'}
                  stroke={treeHealthState === 'withered' ? '#450a0a' : '#047857'}
                  strokeWidth="2.5"
                />

                {/* Internal Flowing Mana Sap Meridian in Sprout */}
                <path
                  d="M 360 475 C 355 385, 365 305, 360 265"
                  stroke="url(#manaSapGradient)"
                  strokeWidth="4.5"
                  strokeDasharray="8 6"
                  fill="none"
                  className="animate-tree-mana-stream"
                />

                {/* Left Cotyledon Baby Leaf (Lá Mầm Ngọc Bích Trái) */}
                <path
                  d="M 357 340 C 285 285, 225 315, 220 350 C 260 380, 325 358, 357 340 Z"
                  fill={treeHealthState === 'withered' ? '#713f12' : '#10b981'}
                  stroke={treeHealthState === 'withered' ? '#451a03' : '#34d399'}
                  strokeWidth="2.5"
                  filter="url(#coreGlow)"
                />
                {/* Left leaf internal glowing vein */}
                <path d="M 357 340 Q 290 328, 230 348" stroke="#d1fae5" strokeWidth="2.2" strokeDasharray="4 3" fill="none" opacity="0.9" />
                {/* Sparkling Morning Dewdrop on left leaf */}
                <circle cx="232" cy="346" r="3.2" fill="#67e8f9" filter="url(#coreGlow)" className="animate-ping" style={{ animationDuration: '3s' }} />

                {/* Right Cotyledon Baby Leaf (Lá Mầm Ngọc Bích Phải) */}
                <path
                  d="M 363 335 C 435 280, 495 310, 500 345 C 460 375, 395 353, 363 335 Z"
                  fill={treeHealthState === 'withered' ? '#854d0e' : '#34d399'}
                  stroke={treeHealthState === 'withered' ? '#451a03' : '#6ee7b7'}
                  strokeWidth="2.5"
                  filter="url(#coreGlow)"
                />
                {/* Right leaf internal glowing vein */}
                <path d="M 363 335 Q 430 323, 490 343" stroke="#ecfdf5" strokeWidth="2.2" strokeDasharray="4 3" fill="none" opacity="0.9" />
                {/* Sparkling Morning Dewdrop on right leaf */}
                <circle cx="488" cy="341" r="3.2" fill="#67e8f9" filter="url(#coreGlow)" className="animate-ping" style={{ animationDuration: '3.6s' }} />

                {/* Crown emerging leaflet shoot */}
                <path d="M 360 265 C 351 245, 342 238, 347 228 C 357 236, 360 252, 360 265 Z" fill="#6ee7b7" stroke="#059669" strokeWidth="1.5" />
                <path d="M 360 265 C 369 245, 378 238, 373 228 C 363 236, 360 252, 360 265 Z" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5" />
                <circle cx="360" cy="232" r="4.5" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.2" filter="url(#coreGlow)" className="animate-pulse" />

                {/* Seasonal features on Sprout */}
                {currentSeason.id === 'spring' && (
                  <>
                    <circle cx="347" cy="236" r="5.5" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                    <circle cx="373" cy="236" r="5.5" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                  </>
                )}
                {currentSeason.id === 'winter' && (
                  <>
                    <path d="M 226 348 Q 285 322, 355 338" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.95" />
                    <path d="M 494 343 Q 435 317, 365 333" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.95" />
                  </>
                )}

                {/* Root capillary threads gripping the earth */}
                <path d="M 360 485 Q 310 500, 250 508" stroke="#10b981" strokeWidth="3.5" strokeDasharray="5 4" fill="none" />
                <path d="M 360 485 Q 410 500, 470 508" stroke="#10b981" strokeWidth="3.5" strokeDasharray="5 4" fill="none" />
                <path d="M 360 485 Q 350 505, 338 516" stroke="#059669" strokeWidth="3" strokeDasharray="4 3" fill="none" />
                <path d="M 360 485 Q 370 505, 382 516" stroke="#059669" strokeWidth="3" strokeDasharray="4 3" fill="none" />
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
                {/* Flowing Mana Meridian Sap */}
                <path
                  d="M 360 475 C 356 385, 364 290, 360 195"
                  stroke="url(#manaSapGradient)"
                  strokeWidth="5"
                  strokeDasharray="8 6"
                  fill="none"
                  className="animate-tree-mana-stream"
                />
                {/* Branches reaching for sunlight */}
                <path d="M 360 320 Q 280 260, 220 210" stroke={treeHealthState === 'withered' ? '#581c87' : '#10b981'} strokeWidth="10" strokeLinecap="round" fill="none" />
                <path d="M 360 270 Q 440 210, 500 170" stroke={treeHealthState === 'withered' ? '#581c87' : '#10b981'} strokeWidth="10" strokeLinecap="round" fill="none" />
                
                {/* Winter Snow Caps on Sapling */}
                {currentSeason.id === 'winter' && (
                  <>
                    <path d="M 358 316 Q 282 256, 222 206" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.9" />
                    <path d="M 362 266 Q 438 206, 498 166" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.9" />
                  </>
                )}
                {/* Spring Blossom Buds on Sapling */}
                {currentSeason.id === 'spring' && (
                  <>
                    <circle cx="220" cy="208" r="6" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                    <circle cx="500" cy="168" r="6" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                  </>
                )}

                {/* Foliage soft clouds with breathing motion */}
                <circle cx="220" cy="210" r="42" fill="url(#wisdomFoliageGlow)" opacity="0.45" filter="url(#foliageBlur)" className="animate-tree-foliage-breath" />
                <circle cx="500" cy="170" r="46" fill="url(#wealthFoliageGlow)" opacity="0.45" filter="url(#foliageBlur)" className="animate-tree-foliage-breath" />
                <circle cx="360" cy="190" r="50" fill="url(#socialFoliageGlow)" opacity="0.4" filter="url(#foliageBlur)" className="animate-tree-foliage-breath" />
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

                {/* Central Flowing Meridian (Đốc Mạch Thần Mộc) */}
                <path d="M 360 475 Q 365 370, 360 265" stroke="url(#manaSapGradient)" strokeWidth="6" strokeDasharray="10 8" fill="none" className="animate-tree-mana-stream" />

                {/* BOUGH 1: Wisdom & Mastery (West / North-West - Organic Bezier Tapered Curve) */}
                <path d="M 350 290 C 300 245, 225 180, 140 95" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="18" strokeLinecap="round" fill="none" />
                <path d="M 350 290 C 300 245, 225 180, 140 95" stroke="url(#manaSapGradient)" strokeWidth="4.5" strokeDasharray="8 6" fill="none" className="animate-tree-mana-stream" />
                <path d="M 240 195 C 195 205, 150 225, 115 240" stroke="#78350f" strokeWidth="8" strokeLinecap="round" fill="none" />

                {/* BOUGH 2: Crown of Social Fellowship (Zenith Crown - Sheltering Arch) */}
                <path d="M 360 265 C 352 195, 368 135, 360 65" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="19" strokeLinecap="round" fill="none" />
                <path d="M 360 265 C 352 195, 368 135, 360 65" stroke="url(#manaSapGradient)" strokeWidth="4.5" strokeDasharray="8 6" fill="none" className="animate-tree-mana-stream" />
                <path d="M 360 135 C 335 105, 305 90, 280 80" stroke="#78350f" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d="M 360 135 C 385 105, 415 90, 440 80" stroke="#78350f" strokeWidth="8" strokeLinecap="round" fill="none" />

                {/* BOUGH 3: Wealth & Abundance (East / North-East - Organic Tapered Bough) */}
                <path d="M 370 290 C 420 245, 495 180, 580 95" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="18" strokeLinecap="round" fill="none" />
                <path d="M 370 290 C 420 245, 495 180, 580 95" stroke="url(#manaSapGradient)" strokeWidth="4.5" strokeDasharray="8 6" fill="none" className="animate-tree-mana-stream" />
                <path d="M 480 195 C 525 205, 570 225, 605 240" stroke="#78350f" strokeWidth="8" strokeLinecap="round" fill="none" />

                {/* Winter Snow Caps on Oak Boughs */}
                {currentSeason.id === 'winter' && (
                  <g className="winter-snow-caps-oak">
                    <path d="M 348 286 C 298 241, 223 176, 138 91" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.9" />
                    <path d="M 358 261 C 350 191, 366 131, 358 61" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.9" />
                    <path d="M 372 286 C 422 241, 497 176, 582 91" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.9" />
                  </g>
                )}

                {/* Spring Cherry Blossoms on Oak Boughs */}
                {currentSeason.id === 'spring' && (
                  <g className="spring-blossoms-oak">
                    <circle cx="140" cy="95" r="7.5" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                    <circle cx="360" cy="65" r="8.5" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                    <circle cx="580" cy="95" r="7.5" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                  </g>
                )}

                {/* Layered Foliage Canopy Clusters with Breathing Motion */}
                <circle cx="140" cy="95" r="68" fill="url(#wisdomFoliageGlow)" filter="url(#foliageBlur)" className="animate-tree-foliage-breath" />
                <circle cx="115" cy="235" r="38" fill="url(#wisdomFoliageGlow)" filter="url(#foliageBlur)" opacity="0.6" className="animate-tree-foliage-breath" />
                <circle cx="360" cy="65" r="78" fill="url(#socialFoliageGlow)" filter="url(#foliageBlur)" className="animate-tree-foliage-breath" />
                <circle cx="580" cy="95" r="68" fill="url(#wealthFoliageGlow)" filter="url(#foliageBlur)" className="animate-tree-foliage-breath" />
                <circle cx="605" cy="235" r="38" fill="url(#wealthFoliageGlow)" filter="url(#foliageBlur)" opacity="0.6" className="animate-tree-foliage-breath" />
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

                {/* Dual Flowing Meridian Sap Channels */}
                <path d="M 355 475 Q 361 360, 355 250" stroke="url(#manaSapGradient)" strokeWidth="6" strokeDasharray="12 8" fill="none" className="animate-tree-mana-stream" />
                <path d="M 365 475 Q 371 360, 365 250" stroke="url(#manaSapGradient)" strokeWidth="6" strokeDasharray="12 8" fill="none" className="animate-tree-mana-stream" />

                {/* Broad Sheltering Fractal Boughs */}
                <path d="M 345 275 C 290 230, 215 170, 130 95" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="20" strokeLinecap="round" fill="none" />
                <path d="M 345 275 C 290 230, 215 170, 130 95" stroke="url(#manaSapGradient)" strokeWidth="5" strokeDasharray="10 8" fill="none" className="animate-tree-mana-stream" />
                <path d="M 230 190 C 185 200, 140 220, 105 238" stroke="#5c2409" strokeWidth="8" strokeLinecap="round" fill="none" />

                <path d="M 360 250 C 352 185, 368 125, 360 60" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="20" strokeLinecap="round" fill="none" />
                <path d="M 360 250 C 352 185, 368 125, 360 60" stroke="url(#manaSapGradient)" strokeWidth="5" strokeDasharray="10 8" fill="none" className="animate-tree-mana-stream" />
                <path d="M 360 120 C 330 90, 300 75, 270 65" stroke="#5c2409" strokeWidth="9" strokeLinecap="round" fill="none" />
                <path d="M 360 120 C 390 90, 420 75, 450 65" stroke="#5c2409" strokeWidth="9" strokeLinecap="round" fill="none" />

                <path d="M 375 275 C 430 230, 505 170, 590 95" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#78350f'} strokeWidth="20" strokeLinecap="round" fill="none" />
                <path d="M 375 275 C 430 230, 505 170, 590 95" stroke="url(#manaSapGradient)" strokeWidth="5" strokeDasharray="10 8" fill="none" className="animate-tree-mana-stream" />
                <path d="M 490 190 C 535 200, 580 220, 615 238" stroke="#5c2409" strokeWidth="8" strokeLinecap="round" fill="none" />

                {/* Winter Snow Caps on Pillar */}
                {currentSeason.id === 'winter' && (
                  <g className="winter-snow-caps-pillar">
                    <path d="M 342 271 C 288 226, 213 166, 128 91" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />
                    <path d="M 358 246 C 350 181, 366 121, 358 56" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />
                    <path d="M 378 271 C 432 226, 507 166, 592 91" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />
                  </g>
                )}

                {/* Spring Cherry Blossoms on Pillar */}
                {currentSeason.id === 'spring' && (
                  <g className="spring-blossoms-pillar">
                    <circle cx="130" cy="95" r="8" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                    <circle cx="360" cy="60" r="9" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                    <circle cx="590" cy="95" r="8" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                  </g>
                )}

                {/* Colossal canopy foliage with breathing motion */}
                <circle cx="130" cy="95" r="74" fill="url(#wisdomFoliageGlow)" filter="url(#foliageBlur)" className="animate-tree-foliage-breath" />
                <circle cx="105" cy="235" r="42" fill="url(#wisdomFoliageGlow)" filter="url(#foliageBlur)" opacity="0.6" className="animate-tree-foliage-breath" />
                <circle cx="360" cy="60" r="82" fill="url(#socialFoliageGlow)" filter="url(#foliageBlur)" className="animate-tree-foliage-breath" />
                <circle cx="590" cy="95" r="74" fill="url(#wealthFoliageGlow)" filter="url(#foliageBlur)" className="animate-tree-foliage-breath" />
                <circle cx="615" cy="235" r="42" fill="url(#wealthFoliageGlow)" filter="url(#foliageBlur)" opacity="0.6" className="animate-tree-foliage-breath" />
              </g>
            )}

            {growthStage === 'ancient_world_tree' && (
              <g className="stage-ancient-world-tree">
                {/* Grand Sculpted Golden Bark Trunk */}
                <path
                  d="M 315 486 C 330 380, 342 305, 360 250 C 378 305, 390 380, 405 486 Q 360 492, 315 486 Z"
                  fill={treeHealthState === 'withered' ? 'url(#witheredBarkGradient)' : 'url(#ancientWorldTreeGold)'}
                  stroke={treeHealthState === 'withered' ? '#7f1d1d' : '#d97706'}
                  strokeWidth="3.5"
                />
                {/* Transcendent spiral runes on trunk */}
                <path d="M 360 450 Q 370 380, 360 320 Q 350 260, 360 200" stroke="#fef08a" strokeWidth="4" strokeDasharray="8 6" fill="none" className="animate-tree-mana-stream" />

                {/* Buttress Root Anchors gripping the Sacred Dais */}
                <path d="M 320 482 Q 260 490, 210 496" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#d97706'} strokeWidth="14" strokeLinecap="round" fill="none" />
                <path d="M 400 482 Q 460 490, 510 496" stroke={treeHealthState === 'withered' ? '#3f3f46' : '#d97706'} strokeWidth="14" strokeLinecap="round" fill="none" />

                {/* BOUGH 1: Wisdom & Skills (West / North-West - Organic Bezier Tapered Branch) */}
                <path d="M 346 270 C 285 235, 215 170, 135 95" stroke="url(#ancientWorldTreeGold)" strokeWidth="18" strokeLinecap="round" fill="none" />
                <path d="M 346 270 C 285 235, 215 170, 135 95" stroke="url(#manaSapGradient)" strokeWidth="5" strokeDasharray="8 6" fill="none" className="animate-tree-mana-stream" />
                {/* Secondary fractal twigs on Wisdom Bough */}
                <path d="M 235 185 C 190 195, 145 220, 110 240" stroke="#d97706" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d="M 185 135 C 160 115, 140 100, 120 70" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" fill="none" />

                {/* BOUGH 2: Crown of Social Links (Center / Zenith - Soaring Canopy Arch) */}
                <path d="M 360 250 C 352 195, 368 135, 360 55" stroke="url(#ancientWorldTreeGold)" strokeWidth="19" strokeLinecap="round" fill="none" />
                <path d="M 360 250 C 352 195, 368 135, 360 55" stroke="url(#manaSapGradient)" strokeWidth="5" strokeDasharray="8 6" fill="none" className="animate-tree-mana-stream" />
                {/* Crown arch bifurcation */}
                <path d="M 360 125 C 335 95, 305 80, 275 70" stroke="#d97706" strokeWidth="9" strokeLinecap="round" fill="none" />
                <path d="M 360 125 C 385 95, 415 80, 445 70" stroke="#d97706" strokeWidth="9" strokeLinecap="round" fill="none" />

                {/* BOUGH 3: Wealth & Abundance (East / North-East - Organic Golden Branch) */}
                <path d="M 374 270 C 435 235, 505 170, 585 95" stroke="url(#ancientWorldTreeGold)" strokeWidth="18" strokeLinecap="round" fill="none" />
                <path d="M 374 270 C 435 235, 505 170, 585 95" stroke="url(#manaSapGradient)" strokeWidth="5" strokeDasharray="8 6" fill="none" className="animate-tree-mana-stream" />
                {/* Secondary fractal twigs on Wealth Bough */}
                <path d="M 485 185 C 530 195, 575 220, 610 240" stroke="#d97706" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d="M 535 135 C 560 115, 580 100, 600 70" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" fill="none" />

                {/* Winter Snow Caps on World Tree */}
                {currentSeason.id === 'winter' && (
                  <g className="winter-snow-caps-world-tree">
                    <path d="M 344 266 C 283 231, 213 166, 133 91" stroke="#f8fafc" strokeWidth="5.5" strokeLinecap="round" fill="none" opacity="0.9" />
                    <path d="M 358 246 C 350 191, 366 131, 358 51" stroke="#f8fafc" strokeWidth="5.5" strokeLinecap="round" fill="none" opacity="0.9" />
                    <path d="M 376 266 C 437 231, 507 166, 587 91" stroke="#f8fafc" strokeWidth="5.5" strokeLinecap="round" fill="none" opacity="0.9" />
                  </g>
                )}

                {/* Spring Blossoms on World Tree */}
                {currentSeason.id === 'spring' && (
                  <g className="spring-blossoms-world-tree">
                    <circle cx="135" cy="95" r="9" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                    <circle cx="360" cy="55" r="10" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                    <circle cx="585" cy="95" r="9" fill="url(#roseFlowerGrad)" filter="url(#coreGlow)" />
                  </g>
                )}

                {/* Layered Foliage Clusters with Breathing Motion */}
                <circle cx="135" cy="95" r="75" fill="url(#wisdomFoliageGlow)" filter="url(#foliageBlur)" className="animate-tree-foliage-breath" />
                <circle cx="105" cy="235" r="42" fill="url(#wisdomFoliageGlow)" filter="url(#foliageBlur)" opacity="0.6" className="animate-tree-foliage-breath" />
                <circle cx="360" cy="55" r="85" fill="url(#socialFoliageGlow)" filter="url(#foliageBlur)" className="animate-tree-foliage-breath" />
                <circle cx="585" cy="95" r="75" fill="url(#wealthFoliageGlow)" filter="url(#foliageBlur)" className="animate-tree-foliage-breath" />
                <circle cx="615" cy="235" r="42" fill="url(#wealthFoliageGlow)" filter="url(#foliageBlur)" opacity="0.6" className="animate-tree-foliage-breath" />

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

          {/* ========================================================================= */}
          {/* 4. SACRED TREE ROOT DAIS PROGRESSION (BỆ GỐC CÂY THĂNG HOA THEO LEVEL) */}
          {/* ========================================================================= */}
          <g className="sacred-root-dais" id="sacredRootDais">
            {/* Ground Contact Shadow (tinh gọn viền đáy, không đè badge di sản góc dưới) */}
            <ellipse cx={centerX} cy={496} rx={daisTier >= 4 ? 128 : 98} ry={17} fill="#020617" opacity="0.72" />

            {/* Stepped Base Plinth */}
            {daisTier === 1 && (
              <g className="dais-tier-1-sprout">
                <ellipse cx={centerX} cy={496} rx={85} ry={18} fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                <ellipse cx={centerX} cy={490} rx={75} ry={15} fill="#022c22" stroke="#34d399" strokeWidth="1" />
                {/* Soft fertile moss spores */}
                <circle cx={325} cy={494} r="2.5" fill="#6ee7b7" opacity="0.8" />
                <circle cx={395} cy={493} r="2" fill="#a7f3d0" opacity="0.85" />
                <circle cx={360} cy={498} r="2" fill="#34d399" opacity="0.7" />
              </g>
            )}

            {daisTier === 2 && (
              <g className="dais-tier-2-sapling">
                <ellipse cx={centerX} cy={498} rx={98} ry={20} fill="#0f172a" stroke="#334155" strokeWidth="2" />
                <ellipse cx={centerX} cy={492} rx={88} ry={17} fill="url(#daisObsidianGrad)" stroke="#10b981" strokeWidth="1.5" />
                <ellipse cx={centerX} cy={487} rx={76} ry={14} fill="none" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="4 4" className="animate-tree-rune-cw" />
              </g>
            )}

            {daisTier >= 3 && (
              <g className="dais-tier-advanced">
                {/* Stepped Obsidian Core Base */}
                <ellipse cx={centerX} cy={500} rx={daisTier >= 5 ? 130 : 115} ry={daisTier >= 5 ? 26 : 22} fill="url(#daisObsidianGrad)" stroke={daisTier >= 4 ? '#b45309' : '#475569'} strokeWidth="2.5" />
                
                {/* Lustrous Gold Plinth Ring */}
                <ellipse cx={centerX} cy={493} rx={daisTier >= 5 ? 120 : 105} ry={daisTier >= 5 ? 23 : 19} fill="url(#daisGoldPlateGrad)" stroke="#fde047" strokeWidth={daisTier >= 5 ? 2.5 : 1.5} filter="url(#coreGlow)" opacity="0.95" />
                
                <ellipse cx={centerX} cy={488} rx={daisTier >= 5 ? 108 : 95} ry={daisTier >= 5 ? 20 : 16} fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />

                {/* Outer Golden Magic Rune Ring (Clockwise Rotation) */}
                <g className="animate-tree-rune-cw origin-center" style={{ transformOrigin: `${centerX}px 488px` }}>
                  <ellipse cx={centerX} cy={488} rx={daisTier >= 5 ? 100 : 88} ry={daisTier >= 5 ? 18 : 15} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="12 10" />
                  {/* Perimeter 12 Ancient Rune Markers */}
                  {Array.from({ length: daisTier >= 4 ? 12 : 8 }).map((_, i) => {
                    const count = daisTier >= 4 ? 12 : 8;
                    const rad = (i * (360 / count) * Math.PI) / 180;
                    const rxRune = centerX + Math.cos(rad) * (daisTier >= 5 ? 100 : 88);
                    const ryRune = 488 + Math.sin(rad) * (daisTier >= 5 ? 18 : 15);
                    return (
                      <circle key={`dais-rune-marker-${i}`} cx={rxRune} cy={ryRune} r={daisTier >= 5 ? 2.5 : 2} fill="#fef08a" stroke="#d97706" strokeWidth="1" />
                    );
                  })}
                </g>

                {/* Inner Cyan Geometric Star Lines (Counter-Clockwise Rotation, Tier 4 & 5) */}
                {daisTier >= 4 && (
                  <g className="animate-tree-rune-ccw origin-center" style={{ transformOrigin: `${centerX}px 488px` }}>
                    <ellipse cx={centerX} cy={488} rx={daisTier >= 5 ? 74 : 64} ry={daisTier >= 5 ? 13 : 11} fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="8 6" opacity="0.9" />
                    {Array.from({ length: 6 }).map((_, i) => {
                      const rad = (i * 60 * Math.PI) / 180;
                      const rxCyan = centerX + Math.cos(rad) * (daisTier >= 5 ? 74 : 64);
                      const ryCyan = 488 + Math.sin(rad) * (daisTier >= 5 ? 13 : 11);
                      return (
                        <rect key={`dais-cyan-star-${i}`} x={rxCyan - 2} y={ryCyan - 2} width="4" height="4" fill="#38bdf8" transform={`rotate(45 ${rxCyan} ${ryCyan})`} />
                      );
                    })}
                  </g>
                )}

                {/* Vertical Shimmering Light Beams Ascending from Dais into Trunk (Tier 4 & 5) */}
                {daisTier >= 4 && (
                  <g className="dais-vertical-light-beams pointer-events-none">
                    <polygon points="325,488 335,360 345,488" fill="url(#verticalBeamGrad)" className="animate-tree-beam" opacity="0.5" />
                    <polygon points="352,488 360,300 368,488" fill="url(#verticalBeamGrad)" className="animate-tree-beam" style={{ animationDelay: '1.2s' }} opacity="0.75" />
                    <polygon points="375,488 385,360 395,488" fill="url(#verticalBeamGrad)" className="animate-tree-beam" style={{ animationDelay: '2.4s' }} opacity="0.5" />
                  </g>
                )}

                {/* Floating Mystic Crystals Orbiting Root Base (Tier 5 - Cổ Thụ Hoàng Kim 56+ Tuổi) */}
                {daisTier >= 5 && (
                  <g className="dais-floating-crystals pointer-events-none">
                    {/* Astral Diamond Crystal 1 (West) */}
                    <g className="animate-float-slow" style={{ transformOrigin: '240px 478px' }}>
                      <polygon points="240,466 248,478 240,490 232,478" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" filter="url(#coreGlow)" />
                      <polygon points="240,470 245,478 240,486 235,478" fill="#ffffff" opacity="0.7" />
                    </g>
                    {/* Astral Diamond Crystal 2 (East) */}
                    <g className="animate-float-fast" style={{ transformOrigin: '480px 478px' }}>
                      <polygon points="480,466 488,478 480,490 472,478" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" filter="url(#coreGlow)" />
                      <polygon points="480,470 485,478 480,486 475,478" fill="#ffffff" opacity="0.7" />
                    </g>
                    {/* Amethyst Crystal 1 (South-West) */}
                    <g className="animate-float-fast" style={{ transformOrigin: '285px 508px', animationDelay: '1s' }}>
                      <polygon points="285,498 292,508 285,518 278,508" fill="#c084fc" stroke="#9333ea" strokeWidth="1.5" filter="url(#coreGlow)" />
                      <polygon points="285,502 290,508 285,514 280,508" fill="#f3e8ff" opacity="0.6" />
                    </g>
                    {/* Amethyst Crystal 2 (South-East) */}
                    <g className="animate-float-slow" style={{ transformOrigin: '435px 508px', animationDelay: '1.8s' }}>
                      <polygon points="435,498 442,508 435,518 428,508" fill="#c084fc" stroke="#9333ea" strokeWidth="1.5" filter="url(#coreGlow)" />
                      <polygon points="435,502 440,508 435,514 430,508" fill="#f3e8ff" opacity="0.6" />
                    </g>
                  </g>
                )}
              </g>
            )}

            {/* Concentric Annual Wood Growth Rings embedded inside the dais top */}
            <g className="annual-growth-rings" id="annualGrowthRings">
              {Array.from({ length: Math.min(characterAge, 45) }).map((_, i) => {
                const rx = 6 + (i * 1.4);
                const ry = 1.6 + (i * 0.28);
                const isMilestone = [6, 18, 30, 42, 60].includes(i + 1);
                return (
                  <ellipse
                    key={`wood-ring-${i}`}
                    cx={centerX}
                    cy={486}
                    rx={rx}
                    ry={ry}
                    fill="none"
                    stroke={isMilestone ? '#fbbf24' : '#92400e'}
                    strokeWidth={isMilestone ? '1.8' : '0.6'}
                    strokeOpacity={isMilestone ? '0.95' : '0.35'}
                  />
                );
              })}
            </g>

            {/* Organic Family Root Conduit Tendrils nourishing the trunk from soil edges */}
            <g className="family-root-tendrils pointer-events-none">
              <path
                d="M 342 486 Q 218 478 102 436"
                fill="none"
                stroke={isParentsDeceased ? '#64748b' : '#10b981'}
                strokeWidth="2.5"
                strokeOpacity={isParentsDeceased ? '0.3' : '0.55'}
              />
              {!isParentsDeceased && canEatMeal && (
                <path
                  d="M 342 486 Q 218 478 102 436"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeDasharray="5 11"
                  className="animate-[dash_2s_linear_infinite]"
                />
              )}
              <path
                d="M 378 486 Q 502 478 618 436"
                fill="none"
                stroke={isParentsDeceased ? '#64748b' : '#6366f1'}
                strokeWidth="2.5"
                strokeOpacity={isParentsDeceased ? '0.3' : '0.55'}
              />
              {!isParentsDeceased && canMentor && (
                <path
                  d="M 378 486 Q 502 478 618 436"
                  fill="none"
                  stroke="#a5b4fc"
                  strokeWidth="2"
                  strokeDasharray="5 11"
                  className="animate-[dash_2s_linear_infinite]"
                />
              )}
            </g>
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

          {treeViewMode === 'life_actions' && (
            <LifeTreeMapLayer map={lifeMap} centerX={centerX} centerY={centerY} baseRadius={baseRadius} />
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

          {/* ========================================================================= */}
          {/* GUARDIAN SPIRIT PET ON TREE STAGE (THÚ CƯNG HỘ MỆNH TRÊN THẦN MỘC - ĐỀ XUẤT 4) */}
          {/* ========================================================================= */}
          {equippedPet === 'puppy' && (
            <g
              className="cursor-pointer pointer-events-auto group transition-transform hover:scale-125"
              onClick={handlePetInteraction}
              transform="translate(260, 465)"
            >
              <title>🐶 Cún Cỏ Trung Nghĩa (Nhấp để vuốt ve & nghe sủa -8% Burnout)</title>
              {/* Pet Dais Aura Ring */}
              <ellipse cx="20" cy="24" rx="18" ry="7" fill="url(#daisGoldPlateGrad)" opacity="0.45" filter="url(#coreGlow)" />
              {/* Pet Shadow */}
              <ellipse cx="20" cy="24" rx="15" ry="5" fill="#020617" opacity="0.7" />
              {/* Wagging Tail */}
              <path
                d="M 6 16 Q 0 8 4 4"
                stroke="#d97706"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                className="animate-[spin_0.4s_ease-in-out_infinite_alternate] origin-[6px_16px]"
              />
              {/* Dog Body */}
              <ellipse cx="18" cy="16" rx="12" ry="9" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
              {/* Dog Head */}
              <circle cx="26" cy="11" r="8" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
              {/* Floppy Ears */}
              <ellipse cx="22" cy="7" rx="3.5" ry="6" fill="#b45309" transform="rotate(-20 22 7)" />
              <ellipse cx="30" cy="7" rx="3.5" ry="6" fill="#b45309" transform="rotate(20 30 7)" />
              {/* Snout & Nose */}
              <ellipse cx="29" cy="13" rx="3" ry="2" fill="#fef3c7" />
              <circle cx="30" cy="12.5" r="1.2" fill="#1e1b4b" />
              {/* Cute Eyes */}
              <circle cx="25" cy="10" r="1.2" fill="#1e1b4b" />
              <circle cx="28" cy="10" r="1.2" fill="#1e1b4b" />
              {/* Red Collar & Bell */}
              <path d="M 22 17 Q 26 19 28 17" stroke="#ef4444" strokeWidth="2" fill="none" />
              <circle cx="26" cy="18.5" r="1.5" fill="#fde047" />
              {/* Paws */}
              <ellipse cx="14" cy="23" rx="3.5" ry="2" fill="#d97706" />
              <ellipse cx="24" cy="23" rx="3.5" ry="2" fill="#d97706" />
              {/* Heart popup when touched */}
              {petHeartAnim && (
                <text x="32" y="0" fontSize="14" className="animate-bounce">❤️</text>
              )}
            </g>
          )}

          {equippedPet === 'cat' && (
            <g
              className="cursor-pointer pointer-events-auto group transition-transform hover:scale-125"
              onClick={handlePetInteraction}
              transform="translate(515, 155)"
            >
              <title>🐱 Mèo Thần Tài (Nhấp để vuốt ve & chiêu tài lộc +5% Yield)</title>
              {/* Cat Dais Aura Ring */}
              <ellipse cx="16" cy="28" rx="17" ry="6" fill="url(#daisGoldPlateGrad)" opacity="0.45" filter="url(#coreGlow)" />
              {/* Cat Shadow */}
              <ellipse cx="16" cy="28" rx="13" ry="4.5" fill="#020617" opacity="0.6" />
              {/* Cat Body */}
              <ellipse cx="16" cy="18" rx="11" ry="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
              {/* Calico spot */}
              <path d="M 10 12 Q 15 10 16 16 Z" fill="#f97316" />
              {/* Cat Head */}
              <circle cx="16" cy="10" r="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
              {/* Pointy Ears */}
              <polygon points="10,6 12,1 15,5" fill="#f43f5e" />
              <polygon points="17,5 20,1 22,6" fill="#f97316" />
              {/* Eyes & Whiskers */}
              <circle cx="13" cy="9.5" r="1.2" fill="#0f172a" />
              <circle cx="19" cy="9.5" r="1.2" fill="#0f172a" />
              <path d="M 16 12 L 16 13" stroke="#f43f5e" strokeWidth="1" />
              <line x1="8" y1="11" x2="4" y2="10" stroke="#94a3b8" strokeWidth="0.8" />
              <line x1="8" y1="13" x2="4" y2="14" stroke="#94a3b8" strokeWidth="0.8" />
              <line x1="24" y1="11" x2="28" y2="10" stroke="#94a3b8" strokeWidth="0.8" />
              <line x1="24" y1="13" x2="28" y2="14" stroke="#94a3b8" strokeWidth="0.8" />
              {/* Golden Koban Coin in chest */}
              <ellipse cx="16" cy="20" rx="4.5" ry="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <text x="16" y="22" fontSize="6" textAnchor="middle" fill="#78350f" fontWeight="bold">萬</text>
              {/* Waving Right Paw (Maneki-Neko) */}
              <path
                d="M 23 16 Q 28 10 27 6"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                className="animate-[wiggle_0.6s_ease-in-out_infinite_alternate]"
              />
              <circle cx="27" cy="6" r="2.5" fill="#f43f5e" />
              {/* Coin Sparkle when touched */}
              {petHeartAnim && (
                <text x="24" y="0" fontSize="14" className="animate-bounce">🪙</text>
              )}
            </g>
          )}

          {equippedPet === 'fox' && (
            <g
              className="cursor-pointer pointer-events-auto group transition-transform hover:scale-125"
              onClick={handlePetInteraction}
              transform="translate(195, 275)"
            >
              <title>🦊 Hồ Ly Cửu Vĩ (Nhấp để kích hoạt hào quang mị lực +5 Charm)</title>
              {/* Spirit Lotus Dais under Fox */}
              <ellipse cx="16" cy="24" rx="20" ry="7" fill="#a855f7" opacity="0.3" filter="url(#coreGlow)" />
              {/* 9 Ethereal Glowing Tails radiating */}
              <g className="opacity-70 animate-pulse" style={{ animationDuration: '2s' }}>
                {[-50, -35, -20, -10, 0, 10, 20, 35, 50].map((deg, i) => (
                  <path
                    key={`tail-${i}`}
                    d="M 8 18 Q -10 12 -22 6 Q -12 24 8 20"
                    fill="url(#coreGlow)"
                    stroke="#c084fc"
                    strokeWidth="1.5"
                    transform={`rotate(${deg} 8 18)`}
                    opacity="0.6"
                  />
                ))}
              </g>
              {/* Fox Body */}
              <ellipse cx="16" cy="18" rx="10" ry="8" fill="#ea580c" stroke="#c2410c" strokeWidth="1.5" />
              <ellipse cx="16" cy="20" rx="6" ry="5" fill="#ffffff" />
              {/* Fox Head & Mask */}
              <polygon points="16,8 24,14 8,14" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />
              <polygon points="16,11 22,14 10,14" fill="#ffffff" />
              {/* Tall Ears */}
              <polygon points="10,9 8,1 13,7" fill="#1e1b4b" />
              <polygon points="19,7 24,1 22,9" fill="#1e1b4b" />
              {/* Mysterious Fox Eyes */}
              <path d="M 12 11 Q 14 12 15 11" stroke="#581c87" strokeWidth="1.2" fill="none" />
              <path d="M 17 11 Q 18 12 20 11" stroke="#581c87" strokeWidth="1.2" fill="none" />
              <circle cx="16" cy="14" r="1" fill="#0f172a" />
              {/* Spirit Aura */}
              <circle cx="16" cy="14" r="18" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" className="animate-[spin_10s_linear_infinite]" />
              {petHeartAnim && (
                <text x="24" y="0" fontSize="14" className="animate-bounce">✨</text>
              )}
            </g>
          )}

          {equippedPet === 'dragon' && (
            <g
              className="cursor-pointer pointer-events-auto group transition-transform hover:scale-125"
              onClick={handlePetInteraction}
              transform="translate(330, 20)"
            >
              <title>🐉 Ấu Long Luân Hồi (Nhấp để rồng ngâm hộ mệnh +10 Karma, -30% Shock)</title>
              {/* Dragon Celestial Cloud Dais */}
              <ellipse cx="32" cy="40" rx="24" ry="8" fill="#38bdf8" opacity="0.35" filter="url(#coreGlow)" />
              {/* Serpentine Dragon Body (Curved loop) */}
              <path
                d="M 10 32 C 0 20, 20 5, 35 15 C 45 22, 55 35, 42 42 C 30 48, 15 42, 28 30"
                stroke="url(#ancientWorldTreeGold)"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                filter="url(#coreGlow)"
                className="animate-pulse"
                style={{ animationDuration: '1.8s' }}
              />
              <path
                d="M 10 32 C 0 20, 20 5, 35 15 C 45 22, 55 35, 42 42 C 30 48, 15 42, 28 30"
                stroke="#fef08a"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                fill="none"
              />
              {/* Dragon Head */}
              <ellipse cx="32" cy="14" rx="8" ry="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
              {/* Antler Horns */}
              <path d="M 33 10 Q 36 3 40 2" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 29 10 Q 28 4 25 3" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Whiskers */}
              <path d="M 36 16 Q 44 18 48 14" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M 34 18 Q 42 22 46 25" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              {/* Blazing Eyes */}
              <circle cx="34" cy="13" r="1.5" fill="#dc2626" />
              <circle cx="30" cy="13" r="1.5" fill="#dc2626" />
              {/* Dragon Pearl Orb */}
              <circle cx="48" cy="20" r="4.5" fill="#38bdf8" stroke="#fef08a" strokeWidth="1.5" filter="url(#coreGlow)" className="animate-ping" style={{ animationDuration: '2.5s' }} />
              {petHeartAnim && (
                <text x="40" y="-4" fontSize="14" className="animate-bounce">🌟</text>
              )}
            </g>
          )}
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
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        {acupoint.branch}
                      </span>
                    </div>
                    <div className="text-[var(--text-primary)]">{acupoint.desc}</div>
                    <div className="text-xs tabular-nums">
                      {isUnlocked ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Đã đả thông kinh mạch</span>
                      ) : canUnlock ? (
                        <span className="text-amber-700 dark:text-amber-300 font-bold">✨ Nhấn để khai mở ({acupoint.costSp} SP)</span>
                      ) : (
                        <span className="text-[var(--text-secondary)]">Cần {acupoint.costSp} SP để khai thông</span>
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
                  className={`relative before:absolute before:-inset-2 before:content-[''] w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 shadow-xl border ${
                    isUnlocked
                      ? 'bg-emerald-100 dark:bg-emerald-950/90 border-emerald-500 dark:border-emerald-400 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400/50 shadow-emerald-500/40'
                      : canUnlock
                      ? 'bg-amber-500 border-amber-300 text-slate-950 ring-2 ring-amber-400/60 animate-pulse hover:scale-125 cursor-pointer font-bold'
                      : 'bg-slate-100 dark:bg-slate-900/70 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed opacity-75'
                  }`}
                >
                  {acupoint.icon}
                </button>
              </Tooltip>
            </div>
          );
        })}

        {/* ========================================================================= */}
        {/* IN-TREE CELESTIAL NPC CONSTELLATION (QUÝ NHÂN ĐẬU TRÊN TÁN THIÊN ĐỈNH - THOÁNG SẠCH) */}
        {/* ========================================================================= */}
        {characterAge >= 6 && (character?.social_links || []).slice(0, 4).map((npc: any, idx: number) => {
          const npcPositions = [
            { x: 255, y: 54, branchName: 'Quý Nhân Bảo Trợ' },
            { x: 325, y: 42, branchName: 'Chiến Hữu Tri Kỷ' },
            { x: 395, y: 42, branchName: 'Kình Địch Thương Trường' },
            { x: 465, y: 54, branchName: 'Hậu Bối Kế Thừa' }
          ];
          const pos = npcPositions[idx] || npcPositions[0];
          const linkLvl = npc.linkLevel || 1;
          const isHighAffinity = linkLvl >= 3;

          return (
            <div
              key={`tree-npc-${npc.id || idx}`}
              className="absolute z-25 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{
                left: `${(pos.x / canvasWidth) * 100}%`,
                top: `${(pos.y / canvasHeight) * 100}%`
              }}
            >
              <Tooltip
                position="bottom"
                content={
                  <div className="space-y-1 text-xs max-w-xs">
                    <div className="flex items-center gap-1.5 font-bold text-sky-700 dark:text-sky-300">
                      <span>{npc.avatar || '🕊️'}</span>
                      <span>{npc.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-800 dark:text-sky-200 border border-sky-400/35">
                        Link Lv.{linkLvl}
                      </span>
                    </div>
                    <div className="text-[var(--text-primary)] text-xs">{npc.role || pos.branchName}</div>
                    <div className="text-xs text-amber-700 dark:text-amber-300 tabular-nums">
                      Hảo cảm: {npc.affinity || 50}/100 • {isHighAffinity ? 'Đặc quyền Mượn Lực khả dụng!' : 'Cần bồi đắp thêm'}
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-300">Nhấp để mở tương tác quý nhân</div>
                  </div>
                }
              >
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playBirdChirp();
                    setTreeViewMode('social_links');
                  }}
                  className={`relative before:absolute before:-inset-2 before:content-[''] w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 shadow-xl border cursor-pointer hover:scale-125 ${
                    linkLvl >= 4
                      ? 'bg-amber-100 dark:bg-gradient-to-br dark:from-amber-500/30 dark:to-yellow-600/40 border-amber-500 dark:border-amber-400 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/70 shadow-amber-500/50 animate-pulse'
                      : linkLvl >= 2
                      ? 'bg-sky-100 dark:bg-sky-950/80 border-sky-400 text-sky-800 dark:text-sky-200 ring-1 ring-sky-400/50 shadow-sky-500/40'
                      : 'bg-slate-100 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                  }`}
                >
                  {npc.avatar || (idx === 0 ? '🦉' : idx === 1 ? '🦅' : idx === 2 ? '🐺' : '🕊️')}
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
              <div className="font-bold text-amber-700 dark:text-amber-300">
                {actionPoints === 0 ? '✨ Đón Giao Thừa & Chiêm Nghiệm Cuối Năm' : 'Lõi Sinh Mệnh Cội Nguồn'}
              </div>
              <div>
                {actionPoints === 0
                  ? 'Chạm vào lõi để khép lại một năm, đúc kết hành trình và gieo mầm tâm nguyện cho năm mới!'
                  : 'Bản thể hội tụ năng lượng sống, định hình các lựa chọn thường niên.'}
              </div>
              <div className="text-xs text-amber-800 dark:text-amber-400 tabular-nums">
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
            className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 w-[84px] h-[84px] md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center p-1 md:p-2 text-center select-none shadow-2xl transition-all duration-300 cursor-pointer group ${
              actionPoints === 0 ? 'hover:scale-110 active:scale-95 animate-pulse' : ''
            }`}
            style={{
              left: '50%',
              top: `${(centerY / canvasHeight) * 100}%`,
              background: actionPoints === 0 ? 'var(--tree-core-ap0-bg)' : 'var(--tree-core-bg)',
              boxShadow: actionPoints === 0 ? 'var(--tree-core-ap0-shadow)' : 'var(--tree-core-shadow)',
              border: actionPoints === 0 ? 'var(--tree-core-ap0-border)' : '2px solid var(--tree-core-border)'
            }}
          >
            <div className={`absolute inset-0 rounded-full border pointer-events-none ${
              actionPoints === 0 ? 'border-amber-400 animate-ping opacity-35' : 'border-indigo-400/40 animate-ping opacity-25'
            }`} />

            <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm md:text-base shadow-inner group-hover:scale-110 transition-transform ${
              actionPoints === 0
                ? 'bg-amber-500/30 border border-amber-400 text-amber-900 dark:text-amber-200'
                : 'bg-indigo-500/15 dark:bg-indigo-500/20 border border-indigo-400/40 text-indigo-900 dark:text-white'
            }`}>
              {actionPoints === 0 ? '✨' : STAGE_META[growthStage].icon}
            </div>

            <div className={`text-xs font-sans font-bold mt-1 leading-none tracking-tight ${
              actionPoints === 0 ? 'text-amber-900 dark:text-amber-300 font-black' : 'text-slate-900 dark:text-white'
            }`}>
              {actionPoints > 0 ? `${actionPoints} AP` : '✨ Giao Thừa'}
            </div>
            <div className={`text-xs md:text-xs tabular-nums mt-0.5 opacity-90 truncate max-w-[72px] md:max-w-[92px] ${
              actionPoints === 0 ? 'text-amber-800 dark:text-amber-200 font-bold' : 'text-emerald-700 dark:text-emerald-300'
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

          return (
            <div
              key={node.id}
              className="hidden md:block absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto w-max max-w-[300px]"
              style={{
                // Kẹp trong khung: nhãn node không bị cắt mép khi canvas hẹp (md/lg)
                left: `clamp(125px, ${leftPercent}%, calc(100% - 125px))`,
                top: `${topPercent}%`
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <Tooltip
                content={
                  <div className="space-y-1 text-xs max-w-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                      <span>{node.icon}</span>
                      <span>{node.title}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 tabular-nums font-bold">
                        {node.apCost} AP
                      </span>
                    </div>
                    <div className="text-[var(--text-primary)] font-medium">{node.gainText}</div>
                    <div className="text-xs text-[var(--text-secondary)] italic">{node.flavor}</div>
                  </div>
                }
              >
                {/* Organic Leaflet Sprig Button */}
                <button
                  type="button"
                  disabled={isLoading || !canAfford}
                  onClick={() => handleNodeClick(node)}
                  className={`relative px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-tl-[26px] rounded-br-[26px] rounded-tr-[10px] rounded-bl-[10px] border text-left transition-all duration-300 flex items-center gap-2 select-none active:scale-95 shadow-xl backdrop-blur-md ${
                    getNodeSkin(node)
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
                  <div className="absolute top-1/2 left-2 right-2 h-[1px] bg-slate-900/10 dark:bg-white/10 pointer-events-none -translate-y-1/2" />

                  {/* Leaflet Icon Orb */}
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/10 dark:bg-black/40 border border-slate-900/15 dark:border-white/20 flex items-center justify-center text-base sm:text-lg shrink-0 group-hover:scale-125 transition-transform">
                    {node.icon}
                  </span>

                  {/* Leaflet Titles & Benefits (Zero-Truncation Design Standard) */}
                  <div className="min-w-0 pr-1 text-left">
                    <div className="text-xs font-bold text-slate-900 dark:text-white whitespace-normal leading-tight max-w-[110px] xl:max-w-[185px]">
                      {node.title}
                    </div>
                    <div className={`text-xs tabular-nums mt-0.5 whitespace-normal leading-tight max-w-[110px] xl:max-w-[185px] ${
                      node.isBreakthrough
                        ? 'text-amber-800 dark:text-amber-300 font-black tracking-wider animate-pulse drop-shadow'
                        : 'text-slate-600 dark:text-slate-200'
                    }`}>
                      {node.gainText}
                    </div>
                  </div>

                  {/* Dewdrop AP Cost Badge */}
                  <span className="text-xs tabular-nums px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-black/60 text-amber-900 dark:text-amber-300 border border-amber-400/40 shrink-0 font-bold shadow-sm">
                    {node.apCost} AP
                  </span>
                </button>
              </Tooltip>
            </div>
          );
        })}

        {/* ========================================================================= */}
        {/* IN-TREE FAMILY ROOT CONDUITS (RỄ CỘI NGUỒN TÍCH HỢP NGAY CHÂN THẦN MỘC) */}
        {/* ========================================================================= */}
        <div
          className="absolute z-20 left-2 md:left-[14.2%] md:-translate-x-1/2 -translate-y-1/2 pointer-events-auto w-max"
          style={{
            top: `${(436 / canvasHeight) * 100}%`
          }}
        >
          {canEatMeal && onFamilyMeal ? (
            <Tooltip
              position="top"
              align="left"
              content="Rễ Dưỡng Chất Gia Đình: +10 Sinh lực, hồi phục sinh khí và bồi đắp tình thân ấm êm."
            >
              <button
                type="button"
                onClick={() => {
                  soundFx.playHealingPulse();
                  setHealingPulse(true);
                  setTimeout(() => setHealingPulse(false), 1200);
                  onFamilyMeal();
                }}
                disabled={isLoading}
                className="px-2.5 py-1.5 min-h-[44px] md:min-h-0 rounded-2xl bg-amber-50/95 hover:bg-amber-100 dark:bg-amber-950/85 dark:hover:bg-amber-900 border border-amber-500/60 text-amber-950 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Utensils className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{characterAge <= 5 ? 'Bầu Sữa Mẹ' : 'Bữa Cơm'}</span>
                <span className="hidden md:inline text-xs tabular-nums px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  +10 HP
                </span>
              </button>
            </Tooltip>
          ) : (
            <Tooltip
              position="top"
              align="left"
              content="Nhấp để mở Gốc Rễ Gia Đình, xem gia phong & kết nối người thân."
            >
              <button
                type="button"
                onClick={() => setTreeViewMode('family_roots')}
                className="px-2.5 py-1.5 min-h-[44px] md:min-h-0 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border border-emerald-500/50 text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>🏡</span>
                <span>{household?.family_buff?.name ? household.family_buff.name : 'Rễ Gia Đình'}</span>
              </button>
            </Tooltip>
          )}
        </div>

        <div
          className="absolute z-20 right-2 md:right-auto md:left-[85.8%] md:-translate-x-1/2 -translate-y-1/2 pointer-events-auto w-max"
          style={{
            top: `${(436 / canvasHeight) * 100}%`
          }}
        >
          {household && !isParentsDeceased && onFamilyMentorship && canMentor ? (
            <Tooltip
              position="top"
              align="right"
              content="Rễ Trí Tuệ Phụ Mẫu: Lắng nghe chỉ dẫn của cha mẹ nhận +8 Karma & soi sáng đường đời."
            >
              <button
                type="button"
                onClick={onFamilyMentorship}
                disabled={isLoading}
                className="px-2.5 py-1.5 min-h-[44px] md:min-h-0 rounded-2xl bg-indigo-50/95 hover:bg-indigo-100 dark:bg-indigo-950/85 dark:hover:bg-indigo-900 border border-indigo-400/60 text-indigo-950 dark:text-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Lời Khuyên</span>
                <span className="hidden md:inline text-xs tabular-nums px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30">
                  +8 Karma
                </span>
              </button>
            </Tooltip>
          ) : (
            <Tooltip
              position="top"
              align="right"
              content="Xem toàn cảnh Phả Hệ Dòng Tộc & Gốc Rễ Gia Đình ngay trên Thần Mộc."
            >
              <button
                type="button"
                onClick={() => setTreeViewMode('family_roots')}
                className="px-2.5 py-1.5 min-h-[44px] md:min-h-0 rounded-2xl bg-emerald-50/95 hover:bg-emerald-100 dark:bg-emerald-950/85 dark:hover:bg-emerald-900 border border-emerald-500/50 text-emerald-950 dark:text-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>🌳</span>
                <span>Gia Tộc &amp; Gốc Rễ</span>
              </button>
            </Tooltip>
          )}
        </div>

        {/* Annual Growth Rings Interactive Pill Badge (Đặt đối xứng góc dưới phải, không đè Bệ Gốc & Nhãn Phong Cảnh) */}
        <div className="absolute bottom-3 right-3 sm:right-4 z-30 pointer-events-auto">
          <Tooltip
            position="top"
            align="right"
            content={
              <div className="space-y-1 text-xs">
                <div className="font-bold text-amber-700 dark:text-amber-300">
                  {characterAge === 0 ? '🌱 Mầm Sống Khởi Nguyên' : `🪵 Vòng Vân Gỗ Đời Người (${characterAge} Năm Tuổi)`}:
                </div>
                <div className="text-[var(--text-primary)]">Gốc rễ đời người tích lũy từng vòng vân gỗ theo năm tháng.</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300">Giai đoạn hiện tại: <span className="font-bold">{STAGE_META[growthStage].label}</span> ({STAGE_META[growthStage].ageSpan})</div>
                <div className="text-xs text-[var(--text-secondary)] italic">{STAGE_META[growthStage].desc}</div>
              </div>
            }
          >
            <div className="px-2.5 py-1 rounded-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border border-amber-500/50 text-xs font-sans text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5 shadow-lg backdrop-blur cursor-help transition max-w-[132px] sm:max-w-[330px]">
              <span className="shrink-0">{characterAge === 0 ? '🌱' : '🪵'}</span>
              <span className="truncate">
                {characterAge === 0
                  ? 'Mầm Sống Khởi Nguyên • Gốc Rễ Đời Người'
                  : `${characterAge} Vòng Vân Gỗ`}
              </span>
              <span className="text-slate-600 dark:text-slate-300 hidden sm:inline shrink-0">•</span>
              <span className="text-emerald-700 dark:text-emerald-400 hidden sm:inline shrink-0">{STAGE_META[growthStage].label}</span>
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
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs tabular-nums font-bold">
                      {character?.skill_points || 0} điểm
                    </span>
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Tri-Branch RPG Build: Thương Trường, Uy Quyền, Tâm Thức
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTreeViewMode('life_actions')}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition"
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
          <div className="absolute inset-y-0 right-0 w-full md:w-[480px] z-40 bg-[var(--bg-card)] border-l border-[var(--border-subtle)] text-[var(--text-primary)] shadow-2xl backdrop-blur-2xl p-4 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-base">
                  👥
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>Nhân Mạch Quý Nhân (Social Links)</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-xs tabular-nums font-bold">
                      {character?.social_links?.length || 4} Quý Nhân
                    </span>
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    4 Archetypes: Quý Nhân Bảo Trợ, Chiến Hữu, Kình Địch, Hậu Bối
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTreeViewMode('life_actions')}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition"
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

        {treeViewMode === 'family_roots' && (
          <div className="absolute inset-y-0 right-0 w-full md:w-[480px] z-40 bg-[var(--bg-card)] border-l border-[var(--border-subtle)] text-[var(--text-primary)] shadow-2xl backdrop-blur-2xl p-4 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-base">
                  🏡
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span>Gốc Rễ Gia Đình &amp; Cội Nguồn</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                      isParentsDeceased
                        ? 'text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 border-rose-400/40'
                        : 'text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400/40'
                    }`}>
                      {isParentsDeceased ? 'Đã khuất' : 'Bình an'}
                    </span>
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Mạch nguồn dưỡng sinh nuôi lớn Thần Mộc &amp; nghi thức gia tộc
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTreeViewMode('life_actions')}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {/* Parents & Family Lineage Card */}
              <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Cội Nguồn Huyết Thống
                  </span>
                  {household?.family_buff && (
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25">
                      ⭐ {household.family_buff.name}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--text-primary)] font-medium">
                  {household?.father_name ? `Bố: ${household.father_name}` : 'Mồ côi'}
                  {household?.mother_name ? ` • Mẹ: ${household.mother_name}` : ''}
                </div>
                {(hasSpouse || childrenList.length > 0) && (
                  <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center gap-2 flex-wrap text-xs text-[var(--text-secondary)]">
                    {hasSpouse && (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/25 font-semibold">
                        ❤️ Phối ngẫu: {spouse?.name || spouse?.target_name || 'Tri kỷ trăm năm'}
                      </span>
                    )}
                    {childrenList.length > 0 && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 font-semibold">
                        👶 Hậu duệ: {childrenList.length} người con
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 1-Click Family Root Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {canEatMeal && onFamilyMeal && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playHealingPulse();
                      onFamilyMeal();
                    }}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-950 dark:text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center justify-between gap-2 transition active:scale-95 shadow-sm cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>{characterAge <= 5 ? 'Bầu Sữa Mẹ' : 'Bữa Cơm'}</span>
                    </span>
                    <span className="text-xs tabular-nums text-emerald-700 dark:text-emerald-300">+10 HP</span>
                  </button>
                )}

                {household && !isParentsDeceased && onFamilyMentorship && (
                  <button
                    type="button"
                    onClick={onFamilyMentorship}
                    disabled={!canMentor || isLoading}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 transition border cursor-pointer ${
                      canMentor
                        ? 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-950 dark:text-indigo-200 border-indigo-400/50 active:scale-95 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Lời Khuyên</span>
                    </span>
                    <span className="text-xs tabular-nums text-indigo-800 dark:text-indigo-300">
                      {canMentor ? '+8 Karma' : 'Đã dùng'}
                    </span>
                  </button>
                )}

                {onHealthCheckup && (
                  <button
                    type="button"
                    onClick={() => onHealthCheckup()}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-950 dark:text-teal-200 border border-teal-500/40 text-xs font-bold flex items-center justify-between gap-2 transition active:scale-95 shadow-sm cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Khám Tổng Quát</span>
                    </span>
                    <span className="text-xs tabular-nums text-teal-800 dark:text-teal-300">+20 HP</span>
                  </button>
                )}

                {onOpenFamily && (
                  <button
                    type="button"
                    onClick={onOpenFamily}
                    className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <span>Phả Hệ Dòng Tộc</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Contextual Senior Legacy & Debt Relief inside Family Roots Sanctuary */}
              {characterAge >= 56 && onSeniorAction && (
                <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-500/35 space-y-2">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    👑 Nghi Thức Tuổi Hạc &amp; Di Sản Gia Tộc
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSeniorAction('write_memoir')}
                      disabled={isLoading}
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-500/40 text-xs font-bold text-amber-950 dark:text-amber-200 cursor-pointer"
                    >
                      ✍️ Viết Hồi Ký (+25 Karma)
                    </button>
                    <button
                      type="button"
                      onClick={() => onSeniorAction('grandchild_mentorship')}
                      disabled={isLoading}
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-500/40 text-xs font-bold text-amber-950 dark:text-amber-200 cursor-pointer"
                    >
                      👨‍👩‍👧‍👦 Chỉ Dạy Con Cháu
                    </button>
                    <button
                      type="button"
                      onClick={() => onSeniorAction('early_estate_will')}
                      disabled={isLoading}
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-500/40 text-xs font-bold text-amber-950 dark:text-amber-200 cursor-pointer"
                    >
                      ⚖️ Lập Di Chúc Sớm
                    </button>
                  </div>
                </div>
              )}

              {isDebt && onDebtRelief && (
                <div className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/50 border border-rose-500/40 space-y-2">
                  <div className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    💸 Gỡ Rối Khủng Hoảng Nợ Nần
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onDebtRelief('family_soft_loan')}
                      disabled={isLoading}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/60 border border-amber-500/40 text-xs font-bold text-amber-950 dark:text-amber-200 cursor-pointer"
                    >
                      🤝 Vay Mềm Người Thân (+$3k)
                    </button>
                    <button
                      type="button"
                      onClick={() => onDebtRelief('liquidate_personal_items')}
                      disabled={isLoading}
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                    >
                      📦 Thanh Lý Đồ Đạc (+$1.2k)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MOBILE ACTION LIST (< md): thẻ hành động xếp dọc, chạm >= 44px, không chồng / không cắt */}
      {/* ========================================================================= */}
      {treeViewMode === 'life_actions' && nodes.length > 0 && (
        <div className="md:hidden flex flex-col gap-2" aria-label="Hành động trong năm">
          {[...nodes].sort((a, b) => Number(!!b.isBreakthrough) - Number(!!a.isBreakthrough)).map(node => {
            const canAfford = actionPoints >= node.apCost;
            const isPulsing = pulseActiveId === node.id;
            return (
              <button
                key={`m-${node.id}`}
                type="button"
                disabled={isLoading || !canAfford}
                onClick={() => handleNodeClick(node)}
                className={`relative w-full min-h-[56px] px-3 py-2 rounded-2xl border text-left flex items-center gap-3 select-none shadow-md transition-all duration-200 active:scale-[0.98] ${getNodeSkin(node).replace('animate-pulse', '').replace('animate-bounce', '')} ${
                  isPulsing ? 'scale-[0.98] ring-4 ring-emerald-400' : ''
                } ${!canAfford ? 'opacity-80 cursor-not-allowed grayscale-[0.35]' : 'cursor-pointer'}`}
              >
                <span className="w-10 h-10 rounded-full bg-slate-900/10 dark:bg-black/40 border border-slate-900/15 dark:border-white/20 flex items-center justify-center text-xl shrink-0">
                  {node.icon}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[13px] font-bold text-slate-900 dark:text-white leading-snug whitespace-normal break-words">
                    {node.title}
                  </span>
                  <span className={`block text-xs tabular-nums mt-0.5 leading-snug whitespace-normal break-words ${
                    node.isBreakthrough
                      ? 'text-amber-800 dark:text-amber-300 font-black tracking-wide'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}>
                    {node.gainText}
                  </span>
                </span>
                <span
                  title={canAfford ? undefined : `Cần ${node.apCost} AP, hiện còn ${actionPoints} AP`}
                  className={`text-xs tabular-nums px-2 py-1 rounded-full border shrink-0 font-bold shadow-sm whitespace-nowrap ${
                    canAfford
                      ? 'bg-amber-100 dark:bg-black/60 text-amber-900 dark:text-amber-300 border-amber-400/40'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border-rose-500/70'
                  }`}
                >
                  {canAfford ? `${node.apCost} AP` : `Thiếu AP · ${node.apCost}`}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {treeViewMode === 'life_actions' && <LifeTreeMapCards map={lifeMap} />}
    </div>
  );
}
