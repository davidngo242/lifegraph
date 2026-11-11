'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Dna,
  Globe,
  Home,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  X,
  FastForward,
  AlertCircle,
  RotateCcw,
  Feather,
  Heart,
  Award,
  Dice5,
  Compass
} from 'lucide-react';
import { formatTrait, getCountryFlag, getCountryTierBadge } from '../utils/traitUtils';
import Tooltip from './Tooltip';

interface RebirthGachaModalProps {
  karma: number;
  unlockedPerks?: string[];
  canEnterNirvana?: boolean;
  onRebirthComplete: (characterData: any) => void;
  onEnterNirvanaComplete?: (nirvanaData: any) => void;
  onClose?: () => void;
}

const TRAIT_OPTIONS = [
  { id: "thiên_tài_toán_học", label: "Thiên tài toán học (+Tài chính & Logic đỉnh cao)" },
  { id: "math_prodigy", label: "Thiên tài logic trừu tượng (Buff tài chính & công nghệ cao)" },
  { id: "gen_trường_thọ_bách_niên", label: "Gen trường thọ bách niên (+20 Max Sinh Lực & Chậm lão hóa)" },
  { id: "longevity_ancestry", label: "Gia tộc trường thọ (Lùi mốc tử thần từ 70 lên 75 tuổi)" },
  { id: "trí_nhớ_siêu_phàm", label: "Trí nhớ siêu phàm (Học ngoại ngữ & chuyên môn x2 lần)" },
  { id: "photographic_memory", label: "Ký ức chụp ảnh siêu đẳng (Học nhanh x2 & auto-pass thi cử)" },
  { id: "khỏe_mạnh_vô_song", label: "Khung xương kim cương (+15 Max HP & Dẻo dai)" },
  { id: "iron_constitution", label: "Thể lực bất khuất (Giảm 40% suy thoái sau tuổi 60)" },
  { id: "tâm_lý_thép", label: "Tâm lý thép (-40% Burnout trước biến cố)" },
  { id: "resilient_spirit", label: "Tâm thế bình thản vô ưu (Giảm 35% tích tụ Burnout)" },
  { id: "stoic_zen", label: "Khắc kỷ tịnh tâm (Giảm 50% kiệt sức khi cày việc)" },
  { id: "trực_giác_kinh_doanh", label: "Trực giác kinh doanh (Bản năng ngửi thấy dòng tiền)" },
  { id: "market_intuition", label: "Trực giác thị trường nhạy bén (+20% Lợi nhuận đầu tư)" },
  { id: "negotiation_shark", label: "Cá mập đàm phán (-15% Giá khi mua tài sản lớn)" },
  { id: "code_whisperer", label: "Lập trình viên thiên bẩm (+35% Thù lao công nghệ & AI)" },
  { id: "charismatic_orator", label: "Hùng biện truyền cảm hứng (+35% Đàm phán & Nhân mạch)" },
  { id: "polyglot_tongue", label: "Đa ngôn ngữ thần tốc (Lợi thế thương mại quốc tế)" },
  { id: "green_thumb", label: "Bàn tay ươm mầm sinh thái (+30% Lợi tức nông nghiệp)" },
  { id: "empathic_healer", label: "Trái tim thấu cảm (+25% Gắn kết & Hồi phục HP)" },
  { id: "culinary_artist", label: "Nghệ nhân ẩm thực ngũ giác (Mở lối kinh doanh chuỗi F&B)" },
  { id: "creative_maverick", label: "Tư duy đột phá không giới hạn (Nhân đôi EXP đột phá)" },
  { id: "tâm_hồn_nghệ_sĩ", label: "Tâm hồn nghệ sĩ (Sáng tạo & Thẩm mỹ tinh tế)" },
  { id: "phong_thái_lãnh_đạo", label: "Khí chất lãnh đạo (Uy quyền & Đàm phán lớn)" }
];

const REEL_COUNTRIES = ["Việt Nam (T2)", "Nhật Bản (T1)", "Hoa Kỳ (T1)", "Ba Lan (T2)", "Syria (T3)", "Thái Lan (T2)", "Na Uy (T1)", "Thụy Sĩ (T1)", "Brazil (T2)", "Haiti (T3)"];
const REEL_BACKGROUNDS = ["Tài Phiệt Hào Môn", "Gia Đình Trí Thức", "Trung Lưu Ổn Định", "Tiểu Thương Phố Thị", "Nhà Nông Cần Mẫn", "Mồ Côi Tình Thương"];
const REEL_TRAITS = [
  "thiên_tài_toán_học",
  "gen_trường_thọ_bách_niên",
  "trí_nhớ_siêu_phàm",
  "khỏe_mạnh_vô_song",
  "tâm_lý_thép",
  "trực_giác_kinh_doanh",
  "tâm_hồn_nghệ_sĩ",
  "phong_thái_lãnh_đạo",
  "mắt_nhìn_xuyên_thị_trường",
  "gen_ngủ_ngắn_sleepless",
  "math_prodigy",
  "longevity_ancestry",
  "iron_constitution",
  "market_intuition",
  "code_whisperer"
];

export default function RebirthGachaModal({
  karma,
  unlockedPerks = [],
  canEnterNirvana = false,
  onRebirthComplete,
  onEnterNirvanaComplete,
  onClose
}: RebirthGachaModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'random' | 'male' | 'female'>('random');
  const [selectedPerks, setSelectedPerks] = useState<{ [key: string]: boolean }>({});
  const [selectedStarterPack, setSelectedStarterPack] = useState<'standard' | 'genz_startup' | 'crazy_rich' | 'street_hustler'>('standard');
  const [chosenTrait, setChosenTrait] = useState<string>("thiên_tài_toán_học");
  const [activeKarmaTab, setActiveKarmaTab] = useState<'packs' | 'perks'>('packs');
  const [showTraitPicker, setShowTraitPicker] = useState<boolean>(false);
  const [rollResult, setRollResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Animated Roulette Reel States
  const [reelCountry, setReelCountry] = useState(REEL_COUNTRIES[0]);
  const [reelBackground, setReelBackground] = useState(REEL_BACKGROUNDS[0]);
  const [reelTrait, setReelTrait] = useState(REEL_TRAITS[0]);

  // Fair, accessible Karma Pricing
  const perkCosts: { [key: string]: number } = {
    longevity_root: 80,
    lock_t1_t2: 150,
    guarantee_middle_class: 250,
    choose_trait: 400
  };

  const STARTER_PACKS = [
    {
      id: 'standard',
      name: 'Vô Thường Tự Do',
      icon: '🌟',
      badge: 'Khởi đầu tự do · 0 tuổi',
      karmaCost: 0,
      desc: 'Trải nghiệm tuổi thơ bình dị, tự do rèn dũa nhân cách và định hình tương lai.'
    },
    {
      id: 'street_hustler',
      name: 'Bàn Tay Trắng Vượt Khó',
      icon: '🥊',
      badge: 'Ý chí thép · Thể lực cao',
      karmaCost: 200,
      desc: 'Bắt đầu từ 0 tuổi với thể lực dẻo dai và ý chí bất khuất vượt qua mọi nghịch cảnh.'
    },
    {
      id: 'genz_startup',
      name: 'Gen Z Tiên Phong',
      icon: '💻',
      badge: 'Tư duy số · Công nghệ AI',
      karmaCost: 800,
      desc: 'Chào đời với tư duy thuật toán và logic nhạy bén, mở lối thăng tiến công nghệ sớm.'
    },
    {
      id: 'crazy_rich',
      name: 'Hào Môn Thừa Kế',
      icon: '🏰',
      badge: 'Quỹ tín thác $250.000',
      karmaCost: 2500,
      desc: 'Sinh ra ở vạch đích, mở khóa tài sản thừa kế $250.000 khi tròn 18 tuổi.'
    }
  ];

  const starterPackCost = STARTER_PACKS.find(p => p.id === selectedStarterPack)?.karmaCost || 0;

  // Calculate costs, skipping perks already owned permanently
  const perksCost = Object.keys(selectedPerks).reduce((sum, key) => {
    if (unlockedPerks.includes(key)) return sum;
    return sum + (selectedPerks[key] ? (perkCosts[key] || 0) : 0);
  }, 0);

  const totalCost = perksCost + starterPackCost;
  const currentAvailableKarma = Math.max(0, karma - totalCost);

  // Roulette Slot animation effect when spinning
  useEffect(() => {
    let interval: any;
    if (isSpinning) {
      interval = setInterval(() => {
        setReelCountry(REEL_COUNTRIES[Math.floor(Math.random() * REEL_COUNTRIES.length)]);
        setReelBackground(REEL_BACKGROUNDS[Math.floor(Math.random() * REEL_BACKGROUNDS.length)]);
        setReelTrait(REEL_TRAITS[Math.floor(Math.random() * REEL_TRAITS.length)]);
      }, 70);
    }
    return () => clearInterval(interval);
  }, [isSpinning]);

  const handleBuyPerk = (key: string, cost: number) => {
    if (unlockedPerks.includes(key)) return;
    if (selectedPerks[key]) return;
    if (currentAvailableKarma < cost) return;

    setErrorMessage(null);
    setSelectedPerks(prev => ({ ...prev, [key]: true }));
  };

  const handleCancelPerk = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (unlockedPerks.includes(key)) return;
    setSelectedPerks(prev => ({ ...prev, [key]: false }));
    setErrorMessage(null);
  };

  const spinDestinyWheel = async () => {
    setIsSpinning(true);
    setRollResult(null);
    setErrorMessage(null);

    try {
      const payload: any = { karma_perks: { ...selectedPerks } };
      if (selectedGender !== 'random') {
        payload.karma_perks.preferred_gender = selectedGender;
        payload.preferred_gender = selectedGender;
        payload.gender = selectedGender;
      }
      if (selectedPerks.choose_trait || unlockedPerks.includes('choose_trait')) {
        payload.karma_perks.choose_trait = true;
        payload.karma_perks.chosen_trait = chosenTrait;
      }
      if (unlockedPerks.includes('lock_t1_t2')) payload.karma_perks.lock_t1_t2 = true;
      if (unlockedPerks.includes('guarantee_middle_class')) payload.karma_perks.guarantee_middle_class = true;
      if (selectedPerks.longevity_root || unlockedPerks.includes('longevity_root')) payload.karma_perks.longevity_root = true;

      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          starter_pack: selectedStarterPack
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Quay bánh xe thất bại");
      }
      const data = await res.json();

      setTimeout(() => {
        setIsSpinning(false);
        setRollResult(data);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Khởi tạo kiếp mới thất bại.");
      setIsSpinning(false);
    }
  };

  // 2. Main Rebirth Gacha Wheel & Karma Shop
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="max-w-xl w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 md:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh] overflow-y-auto custom-scrollbar transition-colors duration-200">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] transition z-10 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0 inline-flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Top Warm Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[12px] font-sans font-semibold tracking-normal normal-case text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 inline-block">
              {rollResult ? '✨ VẬN MỆNH ĐÃ AN BÀI' : 'Phòng chờ tái sinh'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-sans font-bold text-[var(--text-primary)]">
            {rollResult ? 'Hồ Sơ Luân Hồi Sinh Mệnh' : 'Vòng Quay Tái Sinh'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans italic mt-1">
            {rollResult
              ? 'Linh hồn đã giáng thế. Một kiếp nhân sinh mới chính thức bắt đầu.'
              : canEnterNirvana
              ? '"Bạn không có quyền chọn nơi mình sinh ra, trừ khi bạn có đủ Karma từ kiếp trước."'
              : '"Khởi đầu kiếp sống đầu tiên trên dòng thời gian LifeGraph."'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Karma Ledger Status Bar */}
        {!rollResult && !isSpinning && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] mb-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-800 dark:text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-500 animate-pulse" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-amber-800 dark:text-amber-400 block">Ví Nghiệp Lực Tiền Kiếp</span>
                <span className="text-xs font-bold text-[var(--text-primary)] font-mono">{karma.toLocaleString()} Karma Khả Dụng</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-[var(--text-secondary)] block font-medium">
                {totalCost > 0 ? 'Đang phân bổ:' : 'Khả dụng:'}
              </span>
              <span className={`text-xs font-bold font-mono ${totalCost > 0 ? 'text-amber-800 dark:text-amber-400' : 'text-emerald-800 dark:text-emerald-400'}`}>
                {totalCost > 0 ? `-${totalCost.toLocaleString()} Karma` : `${currentAvailableKarma.toLocaleString()} Karma`}
              </span>
            </div>
          </div>
        )}

        {/* Gender Selection Compact Row */}
        {!rollResult && !isSpinning && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] mb-3 text-xs">
            <span className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5 text-xs shrink-0">
              <span>👤 Bản Thể Giới Tính:</span>
            </span>
            <div className="flex items-stretch sm:items-center gap-1.5 min-w-0">
              {[
                { id: 'random', label: 'Tùy Duyên', short: 'Tùy Duyên', icon: '🎲' },
                { id: 'male', label: 'Nam Giới (♂)', short: 'Nam ♂', icon: '👦' },
                { id: 'female', label: 'Nữ Giới (♀)', short: 'Nữ ♀', icon: '👧' }
              ].map(item => {
                const isSelected = selectedGender === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedGender(item.id as any)}
                    className={`py-1 px-2 sm:px-3 min-h-[44px] sm:min-h-0 flex-1 sm:flex-none justify-center whitespace-nowrap rounded-xl border text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition active:scale-95 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="sm:hidden">{item.short}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2-Category Tab Selector */}
        {!rollResult && !isSpinning && (
          <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] mb-3.5">
            <button
              type="button"
              onClick={() => setActiveKarmaTab('packs')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeKarmaTab === 'packs'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>🎭 1. Gói Kịch Bản Đời Người</span>
              {starterPackCost > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-mono">
                  -{starterPackCost} K
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveKarmaTab('perks')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeKarmaTab === 'perks'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>🔮 2. Tùy Chọn Phước Báo</span>
              {perksCost > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-mono">
                  -{perksCost} K
                </span>
              )}
            </button>
          </div>
        )}

        {/* Tab 1: Contemporary Reality Starter Packs */}
        {!rollResult && !isSpinning && activeKarmaTab === 'packs' && (
          <div className="space-y-2 mb-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[var(--text-secondary)] text-xs">Chọn 1 kịch bản khởi nguyên để mở đường cho số mệnh:</span>
              <span className="text-amber-800 dark:text-amber-400 font-mono text-xs font-bold">
                {selectedStarterPack === 'standard' ? 'Gói Cơ Bản (0 K)' : `Đã chọn: ${STARTER_PACKS.find(p => p.id === selectedStarterPack)?.name}`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STARTER_PACKS.map(pack => {
                const isSelected = selectedStarterPack === pack.id;
                const canAfford = karma >= pack.karmaCost;
                return (
                  <Tooltip
                    key={pack.id}
                    className="w-full h-full"
                    position="top"
                    content={
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                          <span>{pack.icon}</span>
                          <span>{pack.name}</span>
                          <span className="text-xs px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200">
                            {pack.badge}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{pack.desc}</div>
                        <div className="text-xs text-amber-800 dark:text-amber-400 font-mono pt-0.5">
                          Chi phí: {pack.karmaCost === 0 ? 'Miễn phí' : `${pack.karmaCost.toLocaleString()} Karma`}
                        </div>
                      </div>
                    }
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!canAfford) {
                          setErrorMessage(`🔒 Kịch bản "${pack.name}" yêu cầu tối thiểu ${pack.karmaCost.toLocaleString()} Karma vĩnh cửu. Bạn hiện có ${karma} Karma (cần thêm ${(pack.karmaCost - karma).toLocaleString()} Karma từ tiền kiếp)!`);
                          return;
                        }
                        setErrorMessage(null);
                        setSelectedStarterPack(pack.id as any);
                      }}
                      className={`w-full h-full p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-2 border-amber-500 text-[var(--text-primary)] shadow-md ring-1 ring-amber-400/50'
                          : canAfford
                          ? 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-slate-400 dark:hover:border-slate-600 active:scale-[0.99] shadow-sm'
                          : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-slate-400 opacity-60 hover:border-rose-500/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-2xl">{pack.icon}</span>
                          {pack.karmaCost === 0 ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                              Miễn Phí
                            </span>
                          ) : canAfford ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-mono">
                              {pack.karmaCost.toLocaleString()} Karma
                            </span>
                          ) : (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 font-mono flex items-center gap-1">
                              🔒 {pack.karmaCost.toLocaleString()} K
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-sm text-[var(--text-primary)]">{pack.name}</div>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--bg-card-subtle)] text-amber-800 dark:text-amber-300 border border-[var(--border-subtle)] block w-fit my-1 font-semibold">
                          {pack.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-snug mt-1.5 line-clamp-2">{pack.desc}</p>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Karma Shop Perks */}
        {!rollResult && !isSpinning && activeKarmaTab === 'perks' && (
          <div className="space-y-2 mb-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[var(--text-secondary)] text-xs">Tùy chọn gia hộ kiếp sống bằng phước báo cá nhân:</span>
              <span className="text-amber-800 dark:text-amber-400 font-mono text-xs font-bold">
                {perksCost > 0 ? `Đã chọn: ${Object.keys(selectedPerks).filter(k => selectedPerks[k]).length} Phước Báo` : 'Chưa chọn'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  key: "longevity_root",
                  title: "Cốt Cách Trường Thọ",
                  icon: "🌿",
                  cost: 80,
                  desc: "+15 Max Sinh Lực, kháng bệnh và giảm suy kiệt.",
                  color: "amber"
                },
                {
                  key: "lock_t1_t2",
                  title: "Tránh Đói Khổ",
                  icon: "🛡️",
                  cost: 150,
                  desc: "Chỉ sinh tại quốc gia Tier 1 / Tier 2 (Thịnh Vượng).",
                  color: "teal"
                },
                {
                  key: "guarantee_middle_class",
                  title: "Gia Cảnh Khá Giả",
                  icon: "🏰",
                  cost: 250,
                  desc: "Đảm bảo gia cảnh từ Trung Lưu trở lên, không mồ côi.",
                  color: "emerald"
                },
                {
                  key: "choose_trait",
                  title: "Khóa Mã Gen Bẩm Sinh",
                  icon: "🧬",
                  cost: 400,
                  desc: "Khóa 1 tố chất siêu việt tiên thiên vào thân xác.",
                  color: "amber"
                }
              ].map(item => {
                const isOwnedPermanent = unlockedPerks.includes(item.key);
                const isBought = !!selectedPerks[item.key];
                const isLocked = isOwnedPermanent || isBought;
                const canAfford = currentAvailableKarma >= item.cost;
                const isDisabled = !isLocked && !canAfford;

                return (
                  <Tooltip
                    key={item.key}
                    className="w-full h-full"
                    position="top"
                    content={
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                          <span>{item.icon}</span>
                          <span>{item.title}</span>
                          <span className="text-xs px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 font-mono">
                            {item.cost} Karma
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</div>
                      </div>
                    }
                  >
                    <div
                      onClick={() => {
                        if (!isLocked && !isDisabled && !isSpinning) {
                          handleBuyPerk(item.key, item.cost);
                        }
                      }}
                      className={`w-full h-full p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                        isLocked
                          ? 'bg-amber-500/10 border-2 border-amber-500 text-[var(--text-primary)] shadow-md ring-1 ring-amber-400/50 cursor-default'
                          : isDisabled
                          ? 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-slate-400 opacity-60 cursor-not-allowed select-none'
                          : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer active:scale-[0.99] shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-bold text-xs md:text-sm text-[var(--text-primary)]">
                              {item.title}
                            </span>
                          </div>
                          {isLocked && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              ✓ Đã Bật
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-snug line-clamp-2">
                          {item.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                        {isOwnedPermanent ? (
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">ĐÃ SỞ HỮU VĨNH VIỄN</span>
                        ) : isBought ? (
                          <>
                            <span className="text-xs font-bold text-amber-800 dark:text-amber-400 font-mono">-{item.cost} Karma</span>
                            <button
                              type="button"
                              onClick={(e) => handleCancelPerk(item.key, e)}
                              className="text-xs text-slate-400 hover:text-rose-500 underline font-semibold transition"
                            >
                              Bỏ chọn
                            </button>
                          </>
                        ) : isDisabled ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-mono text-slate-400 line-through">
                              {item.cost} Karma
                            </span>
                            <span className="text-xs px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 font-semibold">
                              Thiếu {(item.cost - currentAvailableKarma).toLocaleString()} K
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400">
                              {item.cost} Karma
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold hover:bg-amber-500 hover:text-slate-950 transition">
                              + Kích Hoạt
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Tooltip>
                );
              })}
            </div>

            {/* Trait selector chip if 400 Karma perk active */}
            {(selectedPerks.choose_trait || unlockedPerks.includes('choose_trait')) && (
              <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0">{formatTrait(chosenTrait).icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs uppercase font-bold text-amber-800 dark:text-amber-400 block">Mã Gen Đã Khóa:</span>
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate block">{formatTrait(chosenTrait).name}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTraitPicker(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition shadow-sm"
                >
                  🔄 Đổi Mã Gen
                </button>
              </div>
            )}
          </div>
        )}

        {/* Trait Picker Dialog Modal */}
        {showTraitPicker && (
          <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="max-w-lg w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span>🧬</span>
                  <span>Chọn 1 Mã Gen Thiên Phú Muốn Khóa</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTraitPicker(false)}
                  className="p-1 rounded-full bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0 inline-flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {TRAIT_OPTIONS.map(opt => {
                  const ft = formatTrait(opt.id);
                  const isChosen = chosenTrait === opt.id;
                  return (
                    <Tooltip
                      key={opt.id}
                      className="w-full"
                      position="top"
                      content={
                        <div className="space-y-0.5">
                          <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                            <span>{ft.icon}</span>
                            <span>{ft.name}</span>
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">{ft.desc}</div>
                        </div>
                      }
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setChosenTrait(opt.id);
                          setShowTraitPicker(false);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2.5 ${
                          isChosen
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                            : 'bg-[var(--bg-card-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg shrink-0">{ft.icon}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{ft.name}</div>
                            <div className="text-xs opacity-75 truncate">{ft.desc}</div>
                          </div>
                        </div>
                        {isChosen && <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />}
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Spinning Roulette or Rolled Outcome */}
        {isSpinning ? (
          <div className="p-5 rounded-2xl bg-[var(--bg-card-subtle)] border border-amber-400/50 shadow-md flex flex-col items-center justify-center gap-3 my-2 animate-pulse">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-xs font-sans tabular-nums font-bold normal-case tracking-normal">
              <Dice5 className="w-4 h-4 animate-spin text-amber-700 dark:text-amber-500" />
              <span>Bánh Xe Luân Hồi Đang Xoay Số Mệnh...</span>
            </div>

            {/* Slot Reel Visual */}
            <div className="w-full grid grid-cols-3 gap-2 py-2">
              <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                <span className="text-[12px] text-[var(--text-secondary)] block">Quốc gia</span>
                <span className="font-sans tabular-nums text-xs font-bold text-sky-800 dark:text-sky-400 truncate block">{reelCountry}</span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                <span className="text-[12px] text-[var(--text-secondary)] block">Xuất thân</span>
                <span className="font-sans tabular-nums text-xs font-bold text-emerald-800 dark:text-emerald-400 truncate block">{reelBackground}</span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                <span className="text-[12px] text-[var(--text-secondary)] block">Mã gen</span>
                <span className="font-sans tabular-nums text-xs font-bold text-amber-800 dark:text-amber-400 truncate block">{formatTrait(reelTrait).name}</span>
              </div>
            </div>
          </div>
        ) : rollResult ? (
          <div className="space-y-3.5 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* The Unified Glassmorphic Dossier Card */}
            <div className="rounded-3xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] p-5 shadow-xl relative overflow-hidden">
              {/* Radial warm ambient accent */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Section 1: Character Identity & Birthplace */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 pb-3.5 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                    {rollResult.character.gender === 'female' ? '👧' : '👦'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)] tracking-tight break-words">
                        {rollResult.character.name || 'Hài Nhi Sơ Sinh'}
                      </h3>
                      <span className={`text-xs font-bold px-2 py-0.2 rounded-full border flex items-center gap-0.5 ${
                        rollResult.character.gender === 'female'
                          ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30'
                          : 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30'
                      }`}>
                        {rollResult.character.gender === 'female' ? '♀ Nữ' : '♂ Nam'}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] flex items-center flex-wrap gap-x-1.5 gap-y-0.5 mt-0.5">
                      <span className="text-emerald-800 dark:text-emerald-400 font-semibold whitespace-nowrap">🌱 0 Tuổi (Sơ Sinh)</span>
                      <span>•</span>
                      <span className="text-[var(--text-primary)] font-medium whitespace-nowrap">Khởi Thủy Kiếp Mới</span>
                    </div>
                  </div>
                </div>

                {/* Country & Tier Badge */}
                <div className="sm:text-right shrink-0">
                  <div className="flex items-center gap-1.5 sm:justify-end">
                    <span className="text-base">{getCountryFlag(rollResult.character.nationality)}</span>
                    <span className="font-bold text-[var(--text-primary)] text-xs md:text-sm">
                      {rollResult.character.nationality}
                    </span>
                  </div>
                  <div className="mt-0.5">
                    {(() => {
                      const tierBadge = getCountryTierBadge(rollResult.character.country_tier);
                      return (
                        <span className={`text-xs font-sans font-semibold px-2 py-0.2 rounded-full border ${tierBadge.style}`}>
                          {tierBadge.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Section 2: Family Background */}
              <div className="py-2.5 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 text-xs">
                <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1.5 shrink-0">
                  <Home className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
                  <span>Vị thế gia tộc:</span>
                </span>
                <Tooltip content={rollResult.character.background} position="top" align="right">
                  <span className="font-semibold text-[var(--text-primary)] sm:text-right sm:truncate sm:max-w-[280px] block cursor-help">
                    {rollResult.character.background}
                  </span>
                </Tooltip>
              </div>

              {/* Section 3: Innate Traits */}
              <div className="pt-2.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                    <Dna className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                    <span>Mã Gen Di Truyền Tiên Thiên:</span>
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-mono">
                    {(rollResult.character.innate_traits || []).length} Tố Chất
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(rollResult.character.innate_traits || []).map((traitId: string) => {
                    const trait = formatTrait(traitId);
                    return (
                      <Tooltip
                        key={traitId}
                        position="top"
                        content={
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                              <span>{trait.icon}</span>
                              <span>{trait.name}</span>
                              <span className={`text-xs px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                                trait.category === 'curse'
                                  ? 'bg-rose-500/20 text-rose-800 dark:text-rose-300'
                                  : trait.category === 'rare'
                                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                              }`}>
                                {trait.category === 'curse' ? 'Thách Thức' : trait.category === 'rare' ? 'Hiếm' : 'Thiên Phú'}
                              </span>
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{trait.desc}</div>
                          </div>
                        }
                        className="w-full"
                      >
                        <div
                          className={`w-full p-2.5 rounded-xl border ${trait.badgeStyle} flex items-start gap-2 transition hover:scale-[1.01] cursor-help`}
                        >
                          <span className="text-base shrink-0 mt-0.5">{trait.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs truncate">
                                {trait.name}
                              </span>
                              <span className={`text-xs px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider shrink-0 ${
                                trait.category === 'curse'
                                  ? 'bg-rose-500/20 text-rose-800 dark:text-rose-300'
                                  : trait.category === 'rare'
                                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                              }`}>
                                {trait.category === 'curse' ? 'Thách Thức' : trait.category === 'rare' ? 'Hiếm' : 'Thiên Phú'}
                              </span>
                            </div>
                            <p className="text-xs opacity-80 leading-snug mt-0.5">
                              {trait.desc}
                            </p>
                          </div>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Karma Perks Summary */}
              <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)] flex-wrap gap-1.5">
                <span className="flex items-center gap-1 text-[var(--text-primary)] font-medium">
                  <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-500" />
                  <span>Đặc quyền Karma:</span>
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  {(() => {
                    const applied = [
                      { key: 'longevity_root', label: 'Cốt cách trường thọ (+15 HP)' },
                      { key: 'lock_t1_t2', label: 'Quốc gia T1/T2' },
                      { key: 'guarantee_middle_class', label: 'Trung lưu+' },
                      { key: 'choose_trait', label: `Khóa gen (${formatTrait(chosenTrait).name})` }
                    ].filter(p => selectedPerks[p.key] || unlockedPerks.includes(p.key));

                    if (applied.length === 0) {
                      return <span className="text-slate-400 italic text-xs">Sinh mệnh tự nhiên thuần khiết</span>;
                    }
                    return applied.map(p => (
                      <span key={p.key} className="px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-medium text-xs">
                        ✓ {p.label}
                      </span>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Destiny Callout Note */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <span className="text-base shrink-0">⚖️</span>
              <span className="leading-snug text-[var(--text-secondary)] text-xs">
                <strong className="text-amber-800 dark:text-amber-300">Nhân Quả An Bài:</strong> Bánh xe luân hồi đã chốt hạ số mệnh. Hãy đón nhận và kiến tạo cuộc đời của riêng bạn!
              </span>
            </div>

            {/* Clean, Decisive Action Entry Button */}
            <div className="pt-1">
              <button
                onClick={() => onRebirthComplete(rollResult)}
                className="w-full py-3.5 px-6 rounded-2xl text-slate-950 font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 hover:from-amber-300 hover:to-emerald-400 shadow-amber-500/25 ring-1 ring-amber-400/50"
              >
                <span className="text-base">🌱</span>
                <span>BƯỚC VÀO CUỘC ĐỜI (BẮT ĐẦU TỪ 0 TUỔI)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-1">
            <button
              disabled={isSpinning}
              onClick={spinDestinyWheel}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm tracking-normal normal-case transition-all duration-300 flex items-center justify-center gap-2.5 shadow-xl ${
                isSpinning 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 shadow-amber-500/25 ring-1 ring-amber-400/50 active:scale-[0.98]'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isSpinning ? 'animate-spin text-slate-950' : 'text-slate-950 fill-slate-950'}`} />
              <span>Quay Bánh Xe Định Mệnh (Bắt Đầu Kiếp Mới)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] px-2 mt-2">
              <span>Đang phân bổ: <strong className="text-amber-800 dark:text-amber-400 font-mono">{totalCost.toLocaleString()} Karma</strong></span>
              <span>Khởi đầu: <strong className="text-emerald-800 dark:text-emerald-400">0 Tuổi (Cockpit Sơ Sinh)</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

