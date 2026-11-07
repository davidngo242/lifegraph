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
    { id: 'standard', name: 'Vô Thường', icon: '🌟', badge: '0t • Tự Do Tuổi Thơ', karmaCost: 0, desc: 'Trải nghiệm trọn vẹn từ 0 tuổi, tự do rèn dũa nhân cách.' },
    { id: 'street_hustler', name: 'Bàn Tay Trắng', icon: '🥊', badge: '0t • Sinh Lực Cao', karmaCost: 200, desc: 'Bắt đầu từ 0 tuổi với thể lực dẻo dai và ý chí thép vượt khó.' },
    { id: 'genz_startup', name: 'Gen Z Tiên Phong', icon: '💻', badge: '0t • Tư Duy Số', karmaCost: 800, desc: 'Bắt đầu từ 0 tuổi cùng tư duy công nghệ và logic sớm.' },
    { id: 'crazy_rich', name: 'Hào Môn Thừa Kế', icon: '🏰', badge: '0t • Quỹ $250k (18t)', karmaCost: 2500, desc: 'Sinh ra ở vạch đích: Thừa kế quỹ tín thác $250.000 khi tròn 18 tuổi.' }
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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
      <div className="max-w-xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 md:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh] overflow-y-auto custom-scrollbar">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Top Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[12px] font-sans font-semibold tracking-normal normal-case text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 inline-block">
              {rollResult ? '✨ VẬN MỆNH ĐÃ AN BÀI' : 'Phòng chờ tái sinh'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-sans font-bold text-white">
            {rollResult ? 'Hồ Sơ Luân Hồi Sinh Mệnh' : 'Vòng Quay Tái Sinh'}
          </h2>
          <p className="text-xs text-slate-400 font-sans italic mt-1">
            {rollResult
              ? 'Linh hồn đã giáng thế. Một kiếp nhân sinh mới chính thức bắt đầu.'
              : canEnterNirvana
              ? '"Bạn không có quyền chọn nơi mình sinh ra, trừ khi bạn có đủ Karma từ kiếp trước."'
              : '"Khởi đầu kiếp sống đầu tiên trên dòng thời gian LifeGraph."'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Gender Selection Toggle */}
        {!rollResult && !isSpinning && (
          <div className="mb-3.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans font-semibold text-slate-300 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <span>👤 Định Hình Giới Tính (Gender Identity)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedGender === 'random' ? 'Tùy duyên bánh xe số phận' : selectedGender === 'male' ? 'Hóa thân Nhân vật Nam (♂️)' : 'Hóa thân Nhân vật Nữ (♀️)'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'random', label: 'Ngẫu Nhiên', icon: '🎲', color: 'border-slate-700 bg-slate-950 text-slate-300' },
                { id: 'male', label: 'Nam Giới', icon: '♂️', color: 'border-indigo-500 bg-indigo-950/60 text-indigo-300' },
                { id: 'female', label: 'Nữ Giới', icon: '♀️', color: 'border-rose-500 bg-rose-950/60 text-rose-300' }
              ].map(item => {
                const isSelected = selectedGender === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedGender(item.id as any)}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 ${
                      isSelected
                        ? `${item.color} ring-2 ring-purple-500/60 shadow-md`
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Contemporary Reality Starter Packs (Karma Endgame Unlocks) */}
        {!rollResult && !isSpinning && (
          <div className="mb-4 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans font-semibold text-slate-300 normal-case tracking-wide text-[12px] flex items-center gap-1.5">
                <span>🎭 Kịch Bản Khởi Đầu (Reality Starter Packs)</span>
              </span>
              <span className="text-[12px] text-slate-400 font-sans tabular-nums">
                Đòi hỏi tích lũy Karma từ tiền kiếp
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STARTER_PACKS.map(pack => {
                const isSelected = selectedStarterPack === pack.id;
                const canAfford = karma >= pack.karmaCost;
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => {
                      if (!canAfford) {
                        setErrorMessage(`🔒 Kịch bản "${pack.name}" yêu cầu tối thiểu ${pack.karmaCost.toLocaleString()} Karma vĩnh cửu. Bạn hiện có ${karma} Karma (cần thêm ${(pack.karmaCost - karma).toLocaleString()} Karma từ các kiếp trước để mở khóa)!`);
                        return;
                      }
                      setErrorMessage(null);
                      setSelectedStarterPack(pack.id as any);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/70 border-purple-400 text-white shadow-md shadow-purple-950/40 ring-1 ring-purple-400'
                        : canAfford
                        ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 active:scale-98'
                        : 'bg-slate-950/50 border-slate-900 text-slate-500 hover:border-rose-500/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">{pack.icon}</span>
                        {!canAfford ? (
                          <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-400 border border-rose-800/80 font-bold flex items-center gap-0.5">
                            🔒 {pack.karmaCost}
                          </span>
                        ) : pack.karmaCost > 0 ? (
                          <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/40 font-bold">
                            -{pack.karmaCost} K
                          </span>
                        ) : (
                          <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-bold">
                            0 Karma
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs text-white leading-snug min-h-[30px] flex items-center">{pack.name}</div>
                      <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.2 rounded bg-slate-900 text-amber-300 border border-slate-800 block w-fit my-1 font-semibold truncate max-w-full">
                        {pack.badge}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-400 leading-tight mt-1">{pack.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Karma Shop (Chỉ tương tác TRƯỚC khi quay bánh xe định mệnh) */}
        {!rollResult && !isSpinning && (
          <div className="mb-5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-sans font-semibold text-slate-300 normal-case tracking-wide text-[12px]">
                Cửa Hàng Nghiệp Lực (Karma Shop):
              </span>
              <div className="text-right">
                <span className="font-sans tabular-nums font-bold text-purple-400 text-xs md:text-sm flex items-center gap-1 justify-end">
                  <Sparkles className="w-3.5 h-3.5" /> {currentAvailableKarma} Karma Khả Dụng
                </span>
                {totalCost > 0 && (
                  <span className="text-[12px] font-sans tabular-nums font-semibold text-rose-400 block">
                    (Đã chọn mua: -{totalCost} Karma)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                {
                  key: "longevity_root",
                  title: "Cốt Cách Trường Thọ",
                  cost: 80,
                  desc: "+15 Max Sinh Lực, kháng bệnh và giảm suy kiệt.",
                  lockedStyle: "bg-amber-950/40 border-amber-500/60 text-amber-300",
                  iconColor: "text-amber-400",
                  priceColor: "text-amber-400",
                  hoverBorder: "hover:border-amber-500/50"
                },
                {
                  key: "lock_t1_t2",
                  title: "Tránh Đói Khổ",
                  cost: 150,
                  desc: "Cấm sinh ở vùng chiến tranh, nghèo đói cùng cực.",
                  lockedStyle: "bg-indigo-950/40 border-indigo-500/60 text-indigo-300",
                  iconColor: "text-indigo-400",
                  priceColor: "text-indigo-400",
                  hoverBorder: "hover:border-indigo-500/50"
                },
                {
                  key: "guarantee_middle_class",
                  title: "Trung Lưu+",
                  cost: 250,
                  desc: "Đảm bảo gia cảnh từ Trung Lưu trở lên, không mồ côi.",
                  lockedStyle: "bg-emerald-950/40 border-emerald-500/60 text-emerald-300",
                  iconColor: "text-emerald-400",
                  priceColor: "text-emerald-400",
                  hoverBorder: "hover:border-emerald-500/50"
                },
                {
                  key: "choose_trait",
                  title: "Khóa Mã Gen",
                  cost: 400,
                  desc: "Khóa 1 tố chất siêu việt bẩm sinh vào thân xác.",
                  lockedStyle: "bg-purple-950/40 border-purple-500/60 text-purple-300",
                  iconColor: "text-purple-400",
                  priceColor: "text-purple-400",
                  hoverBorder: "hover:border-purple-500/50"
                }
              ].map((item) => {
                const isOwnedPermanent = unlockedPerks.includes(item.key);
                const isBought = !!selectedPerks[item.key];
                const isLocked = isOwnedPermanent || isBought;
                const canAfford = currentAvailableKarma >= item.cost;
                const isDisabled = !isLocked && !canAfford;

                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      if (!isLocked && !isDisabled && !isSpinning) {
                        handleBuyPerk(item.key, item.cost);
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition ${
                      isLocked
                        ? `${item.lockedStyle} shadow-md cursor-default`
                        : isDisabled
                        ? 'bg-slate-950/30 border-slate-900/80 text-slate-600 opacity-40 cursor-not-allowed select-none'
                        : `bg-slate-950/60 border-slate-800 text-slate-400 ${item.hoverBorder} hover:bg-slate-900 cursor-pointer active:scale-95`
                    }`}
                    title={isDisabled ? `Không đủ Karma (cần ${item.cost} Karma)` : undefined}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-[12px] ${isDisabled ? 'text-slate-500' : ''}`}>
                          {item.title}
                        </span>
                        {isLocked && <CheckCircle2 className={`w-3.5 h-3.5 ${item.iconColor} shrink-0`} />}
                      </div>
                      <div className={`text-[12px] leading-snug ${isDisabled ? 'text-slate-600' : 'text-slate-500'}`}>
                        {item.desc}
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
                      {isOwnedPermanent ? (
                        <span className={`text-[12px] font-bold ${item.priceColor}`}>ĐÃ CÓ</span>
                      ) : isBought ? (
                        <>
                          <span className={`text-[12px] font-bold ${item.priceColor}`}>✓ ĐÃ MUA</span>
                          <button
                            type="button"
                            onClick={(e) => handleCancelPerk(item.key, e)}
                            className="text-[12px] text-slate-400 hover:text-rose-400 underline font-medium"
                          >
                            Hủy
                          </button>
                        </>
                      ) : isDisabled ? (
                        <>
                          <span className="text-[12px] font-sans tabular-nums text-slate-600 line-through">
                            {item.cost} Karma
                          </span>
                          <span className="text-[12px] px-1 py-0.2 rounded bg-slate-900 text-slate-500 border border-slate-800">
                            Thiếu
                          </span>
                        </>
                      ) : (
                        <span className={`text-[12px] font-sans tabular-nums font-bold ${item.priceColor}`}>
                          {item.cost} Karma
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Genetic trait selector if 400 Karma perk active */}
            {(selectedPerks.choose_trait || unlockedPerks.includes('choose_trait')) && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950 border border-purple-500/40 animate-fadeIn">
                <span className="text-[12px] text-purple-300 font-semibold block mb-1.5">Chọn 1 Mã Gen Thiên Phú Muốn Khóa:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {TRAIT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setChosenTrait(opt.id)}
                      className={`p-1.5 rounded-lg text-[12px] text-left transition border ${
                        chosenTrait === opt.id 
                          ? 'bg-purple-600 text-white border-purple-400 font-bold shadow-md shadow-purple-600/30' 
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Spinning Roulette or Rolled Outcome */}
        {isSpinning ? (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/60 shadow-2xl flex flex-col items-center justify-center gap-3 my-2 animate-pulse">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-sans tabular-nums font-bold normal-case tracking-normal">
              <Dice5 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Bánh Xe Luân Hồi Đang Xoay Số Mệnh...</span>
            </div>

            {/* Slot Reel Visual */}
            <div className="w-full grid grid-cols-3 gap-2 py-2">
              <div className="p-2 rounded-xl bg-slate-950 border border-indigo-500/40 text-center">
                <span className="text-[12px] text-slate-500 block">Quốc gia</span>
                <span className="font-sans tabular-nums text-xs font-bold text-sky-400 truncate block">{reelCountry}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-indigo-500/40 text-center">
                <span className="text-[12px] text-slate-500 block">Xuất thân</span>
                <span className="font-sans tabular-nums text-xs font-bold text-emerald-400 truncate block">{reelBackground}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-indigo-500/40 text-center">
                <span className="text-[12px] text-slate-500 block">Mã gen</span>
                <span className="font-sans tabular-nums text-xs font-bold text-purple-400 truncate block">{formatTrait(reelTrait).name}</span>
              </div>
            </div>
          </div>
        ) : rollResult ? (
          <div className="space-y-3.5 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* The Unified Glassmorphic Dossier Card */}
            <div className="rounded-3xl bg-slate-900/95 border border-indigo-500/30 p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              {/* Radial gradient accent */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Section 1: Character Identity & Birthplace */}
              <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center text-xl shadow-inner shrink-0">
                    {rollResult.character.gender === 'female' ? '👧' : '👦'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
                        {rollResult.character.name || 'Hài Nhi Sơ Sinh'}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border flex items-center gap-0.5 ${
                        rollResult.character.gender === 'female'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                          : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40'
                      }`}>
                        {rollResult.character.gender === 'female' ? '♀ Nữ' : '♂ Nam'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-emerald-400 font-semibold">🌱 0 Tuổi (Sơ Sinh)</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300 font-medium">Khởi Thủy Kiếp Mới</span>
                    </div>
                  </div>
                </div>

                {/* Country & Tier Badge */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-base">{getCountryFlag(rollResult.character.nationality)}</span>
                    <span className="font-bold text-white text-xs md:text-sm">
                      {rollResult.character.nationality}
                    </span>
                  </div>
                  <div className="mt-0.5">
                    {(() => {
                      const tierBadge = getCountryTierBadge(rollResult.character.country_tier);
                      return (
                        <span className={`text-[10px] font-sans font-semibold px-2 py-0.2 rounded-full border ${tierBadge.style}`}>
                          {tierBadge.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Section 2: Family Background */}
              <div className="py-2.5 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5 shrink-0">
                  <Home className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Vị thế gia tộc:</span>
                </span>
                <span className="font-semibold text-slate-200 text-right truncate">
                  {rollResult.character.background}
                </span>
              </div>

              {/* Section 3: Innate Traits (Formatted with Localized Names & Effects) */}
              <div className="pt-2.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Dna className="w-3.5 h-3.5 text-purple-400" />
                    <span>Mã Gen Di Truyền Tiên Thiên:</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {(rollResult.character.innate_traits || []).length} Tố Chất
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(rollResult.character.innate_traits || []).map((traitId: string) => {
                    const trait = formatTrait(traitId);
                    return (
                      <div
                        key={traitId}
                        className={`p-2 rounded-xl border ${trait.badgeStyle} flex items-start gap-2 transition hover:scale-[1.01]`}
                      >
                        <span className="text-base shrink-0 mt-0.5">{trait.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs truncate">
                              {trait.name}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider shrink-0 ${
                              trait.category === 'curse'
                                ? 'bg-rose-500/20 text-rose-300'
                                : trait.category === 'rare'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {trait.category === 'curse' ? 'Thách Thức' : trait.category === 'rare' ? 'Hiếm' : 'Thiên Phú'}
                            </span>
                          </div>
                          <p className="text-[10.5px] opacity-80 leading-snug mt-0.5 truncate">
                            {trait.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Karma Perks Summary (Clean & Subtle) */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-1.5">
                <span className="flex items-center gap-1 text-slate-300">
                  <Sparkles className="w-3 h-3 text-amber-400" />
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
                      return <span className="text-slate-500 italic text-[10.5px]">Sinh mệnh tự nhiên thuần khiết</span>;
                    }
                    return applied.map(p => (
                      <span key={p.key} className="px-2 py-0.2 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-medium text-[10px]">
                        ✓ {p.label}
                      </span>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Destiny Callout Note (Clean, single sentence) */}
            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-2">
              <span className="text-base shrink-0">⚖️</span>
              <span className="leading-snug text-slate-300 text-[11.5px]">
                <strong className="text-amber-300">Nhân Quả An Bài:</strong> Bánh xe luân hồi đã chốt hạ số mệnh. Hãy đón nhận và kiến tạo cuộc đời của riêng bạn!
              </span>
            </div>

            {/* Clean, Decisive Action Entry Button */}
            <div className="pt-1">
              <button
                onClick={() => onRebirthComplete(rollResult)}
                className="w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 shadow-emerald-600/25 ring-1 ring-emerald-400/40"
              >
                <span className="text-base">🌱</span>
                <span>BƯỚC VÀO CUỘC ĐỜI (BẮT ĐẦU TỪ 0 TUỔI)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            disabled={isSpinning}
            onClick={spinDestinyWheel}
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-normal normal-case transition-all duration-300 flex items-center justify-center gap-2 shadow-xl ${
              isSpinning 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-indigo-600/25 active:scale-[0.98]'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>Quay Bánh Xe Định Mệnh (Bắt Đầu Kiếp Mới)</span>
          </button>
        )}
      </div>
    </div>
  );
}

