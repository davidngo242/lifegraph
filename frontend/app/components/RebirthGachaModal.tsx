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
  { id: "gen_trường_thọ_bách_niên", label: "Gen trường thọ bách niên (+20 Max Sinh Lực & Chậm lão hóa)" },
  { id: "trí_nhớ_siêu_phàm", label: "Trí nhớ siêu phàm (Học ngoại ngữ & chuyên môn x2 lần)" },
  { id: "khỏe_mạnh_vô_song", label: "Khung xương kim cương (+15 Max HP & Dẻo dai)" },
  { id: "tâm_lý_thép", label: "Tâm lý thép (-40% Burnout trước biến cố)" },
  { id: "trực_giác_kinh_doanh", label: "Trực giác kinh doanh (Bản năng ngửi thấy dòng tiền)" },
  { id: "tâm_hồn_nghệ_sĩ", label: "Tâm hồn nghệ sĩ (Sáng tạo & Thẩm mỹ tinh tế)" },
  { id: "phong_thái_lãnh_đạo", label: "Khí chất lãnh đạo (Uy quyền & Đàm phán lớn)" }
];

const REEL_COUNTRIES = ["Việt Nam (T2)", "Nhật Bản (T1)", "Hoa Kỳ (T1)", "Ba Lan (T2)", "Đức (T1)", "Thái Lan (T2)", "Hàn Quốc (T1)"];
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
  "gen_ngủ_ngắn_sleepless"
];

export default function RebirthGachaModal({
  karma,
  unlockedPerks = [],
  canEnterNirvana = false,
  onRebirthComplete,
  onEnterNirvanaComplete,
  onClose
}: RebirthGachaModalProps) {
  const [viewMode, setViewMode] = useState<'wheel' | 'nirvana'>('wheel');
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPerks, setSelectedPerks] = useState<{ [key: string]: boolean }>({});
  const [selectedStarterPack, setSelectedStarterPack] = useState<'standard' | 'genz_startup' | 'crazy_rich' | 'street_hustler'>('standard');
  const [chosenTrait, setChosenTrait] = useState<string>("thiên_tài_toán_học");
  const [rollResult, setRollResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nirvanaInfo, setNirvanaInfo] = useState<any | null>(null);

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

  // Nirvana Transcendence Call for Weary Souls
  const handleEnterNirvana = async () => {
    try {
      setErrorMessage(null);
      const res = await fetch('/api/game/rebirth/nirvana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error("Quy y Niết Bàn thất bại.");
      const data = await res.json();
      setNirvanaInfo(data);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // 2. View Mode: Nirvana Sanctuary (For Weary Souls who want to stop Samsara)
  if (viewMode === 'nirvana') {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in">
        <div className="max-w-xl w-full bg-slate-950 border border-purple-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-3xl mb-4 shadow-xl shadow-purple-500/20">
            🕊️
          </div>

          <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold tracking-wider mb-2">
            Đại Thừa Niết Bàn (The Nirvana Sanctuary)
          </span>

          <h2 className="text-2xl font-bold text-white mb-2 font-serif">
            Buông Bỏ Vòng Luân Hồi
          </h2>

          <p className="text-xs text-slate-300 italic max-w-md mb-6 leading-relaxed font-serif">
            "Nếu bạn cảm thấy mệt mỏi với cơm áo gạo tiền, bệnh tật và sinh tử trần gian, linh hồn bạn có quyền dừng lại. Không ai bắt bạn phải vất vả tái sinh làm người phàm nữa."
          </p>

          {/* Nirvana Perks for Weary Souls */}
          <div className="w-full space-y-3 mb-6 text-left text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-purple-500/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <Feather className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Lưu Danh Đại Điện Tiên Hiền</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Toàn bộ gia phả các đời của bạn được khắc bia vĩnh hằng, trở thành một thiên sử thi hoàn chỉnh.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Quỹ An Nghỉ Linh Hồn (+150 Karma)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Được ban tặng ngay 150 Karma tĩnh dưỡng vào tài khoản vĩnh cửu. Karma không bao giờ bị mất đi.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white">Hóa Thân Thần Hộ Mệnh Dòng Tộc</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Trở thành tổ tiên hộ trì, ban phước lành cho con cháu trần gian mà không cần tự mình nhập xác cày cuốc.
                </div>
              </div>
            </div>
          </div>

          {/* Action options */}
          <div className="w-full space-y-2.5">
            {nirvanaInfo ? (
              <div className="space-y-2">
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs">
                  ✨ Đã thâu nhận <strong>+150 Karma Vĩnh Cửu</strong>! Khắc ghi danh hiệu: <strong className="text-amber-300">{nirvanaInfo.soul_title}</strong> vào Đài Tưởng Niệm Gia Phả.
                </div>
                <button
                  onClick={() => {
                    if (onEnterNirvanaComplete) onEnterNirvanaComplete(nirvanaInfo);
                    else if (onClose) onClose();
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/30 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>🏛️ Quy Hồi Trang Chủ & Chiêm Bái Đại Điện Tiên Hiền</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnterNirvana}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-purple-600/30 active:scale-95"
              >
                Nhận Phước Lành Niết Bàn & An Nghỉ (+150 Karma)
              </button>
            )}

            <button
              onClick={() => setViewMode('wheel')}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              ← Khi Tâm Tĩnh Lại: Quay Về Bánh Xe Luân Hồi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Main Rebirth Gacha Wheel & Karma Shop
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

        {/* Header with Switcher to Nirvana */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[10px] font-sans font-semibold tracking-wider uppercase text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 inline-block">
              Phòng Chờ Luân Hồi (The Karma Void)
            </span>
            {canEnterNirvana && (
              <button
                onClick={() => setViewMode('nirvana')}
                className="text-[10px] font-sans font-bold px-2.5 py-1 rounded-full bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 flex items-center gap-1 transition"
                title="Buông bỏ luân hồi, an nghỉ vĩnh hằng"
              >
                🕊️ Buông Bỏ Hồng Trần
              </button>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Vòng Quay Tái Sinh</h2>
          <p className="text-xs text-slate-400 font-serif italic mt-1">
            {canEnterNirvana
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

        {/* Contemporary Reality Starter Packs (Karma Endgame Unlocks) */}
        {!rollResult && !isSpinning && (
          <div className="mb-4 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans font-semibold text-slate-300 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <span>🎭 Kịch Bản Khởi Đầu (Reality Starter Packs)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
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
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-400 border border-rose-800/80 font-bold flex items-center gap-0.5">
                            🔒 {pack.karmaCost}
                          </span>
                        ) : pack.karmaCost > 0 ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/40 font-bold">
                            -{pack.karmaCost} K
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-bold">
                            0 Karma
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs text-white leading-snug min-h-[30px] flex items-center">{pack.name}</div>
                      <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-amber-300 border border-slate-800 block w-fit my-1 font-semibold truncate max-w-full">
                        {pack.badge}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 leading-tight mt-1">{pack.desc}</p>
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
              <span className="font-sans font-semibold text-slate-300 uppercase tracking-wide text-[11px]">
                Cửa Hàng Nghiệp Lực (Karma Shop):
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-purple-400 text-xs md:text-sm flex items-center gap-1 justify-end">
                  <Sparkles className="w-3.5 h-3.5" /> {currentAvailableKarma} Karma Khả Dụng
                </span>
                {totalCost > 0 && (
                  <span className="text-[10px] font-mono font-semibold text-rose-400 block">
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
                        <span className={`font-bold text-[10px] ${isDisabled ? 'text-slate-500' : ''}`}>
                          {item.title}
                        </span>
                        {isLocked && <CheckCircle2 className={`w-3.5 h-3.5 ${item.iconColor} shrink-0`} />}
                      </div>
                      <div className={`text-[9px] leading-snug ${isDisabled ? 'text-slate-600' : 'text-slate-500'}`}>
                        {item.desc}
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
                      {isOwnedPermanent ? (
                        <span className={`text-[9px] font-bold ${item.priceColor}`}>ĐÃ CÓ</span>
                      ) : isBought ? (
                        <>
                          <span className={`text-[9px] font-bold ${item.priceColor}`}>✓ ĐÃ MUA</span>
                          <button
                            type="button"
                            onClick={(e) => handleCancelPerk(item.key, e)}
                            className="text-[8px] text-slate-400 hover:text-rose-400 underline font-medium"
                          >
                            Hủy
                          </button>
                        </>
                      ) : isDisabled ? (
                        <>
                          <span className="text-[9px] font-mono text-slate-600 line-through">
                            {item.cost} Karma
                          </span>
                          <span className="text-[7.5px] px-1 py-0.2 rounded bg-slate-900 text-slate-500 border border-slate-800">
                            Thiếu
                          </span>
                        </>
                      ) : (
                        <span className={`text-[9px] font-mono font-bold ${item.priceColor}`}>
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
                <span className="text-[10px] text-purple-300 font-semibold block mb-1.5">Chọn 1 Mã Gen Thiên Phú Muốn Khóa:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {TRAIT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setChosenTrait(opt.id)}
                      className={`p-1.5 rounded-lg text-[10px] text-left transition border ${
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

        {/* Khi đã quay xong: Hiển thị tóm tắt đặc quyền đã kích hoạt bất biến (Không có nút Hủy, không chỉnh sửa) */}
        {rollResult && (
          <div className="mb-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans font-semibold text-slate-300 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Đặc Quyền Nghiệp Quả Đã Kích Hoạt Kiếp Này:
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                ✓ Đã An Bài
              </span>
            </div>
            {(() => {
              const applied = [
                { key: 'longevity_root', label: 'Cốt Cách Trường Thọ (+15 Sinh Lực)', color: 'text-amber-300 bg-amber-950/40 border-amber-500/30' },
                { key: 'lock_t1_t2', label: 'Tránh Đói Khổ (Quốc Gia T1/T2)', color: 'text-indigo-300 bg-indigo-950/40 border-indigo-500/30' },
                { key: 'guarantee_middle_class', label: 'Trung Lưu+ (Gia Cảnh Khá Giả)', color: 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30' },
                { key: 'choose_trait', label: `Khóa Mã Gen (${chosenTrait.replace(/_/g, ' ')})`, color: 'text-purple-300 bg-purple-950/40 border-purple-500/30' }
              ].filter(p => selectedPerks[p.key] || unlockedPerks.includes(p.key));

              if (applied.length === 0) {
                return (
                  <div className="text-[10px] text-slate-400 italic">
                    Sinh mệnh tự nhiên thuần khiết (Không sử dụng đặc quyền Karma).
                  </div>
                );
              }

              return (
                <div className="flex flex-wrap gap-1.5">
                  {applied.map(p => (
                    <span key={p.key} className={`text-[9.5px] font-medium px-2 py-0.5 rounded-lg border ${p.color}`}>
                      ✨ {p.label}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Dynamic Spinning Roulette or Rolled Outcome */}
        {isSpinning ? (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/60 shadow-2xl flex flex-col items-center justify-center gap-3 my-2 animate-pulse">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Dice5 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Bánh Xe Luân Hồi Đang Xoay Số Mệnh...</span>
            </div>

            {/* Slot Reel Visual */}
            <div className="w-full grid grid-cols-3 gap-2 py-2">
              <div className="p-2 rounded-xl bg-slate-950 border border-indigo-500/40 text-center">
                <span className="text-[9px] text-slate-500 block">Quốc gia</span>
                <span className="font-mono text-xs font-bold text-sky-400 truncate block">{reelCountry}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-indigo-500/40 text-center">
                <span className="text-[9px] text-slate-500 block">Xuất thân</span>
                <span className="font-mono text-xs font-bold text-emerald-400 truncate block">{reelBackground}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-indigo-500/40 text-center">
                <span className="text-[9px] text-slate-500 block">Mã gen</span>
                <span className="font-mono text-xs font-bold text-purple-400 truncate block">{reelTrait}</span>
              </div>
            </div>
          </div>
        ) : rollResult ? (
          <div className="space-y-2.5 mb-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Outcome Strip 1 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Globe className="w-4 h-4 text-sky-400" />
                <span className="font-medium">Quốc gia & Đẳng cấp:</span>
              </div>
              <span className="font-bold text-white font-mono">
                {rollResult.character.nationality} ({rollResult.character.country_tier})
              </span>
            </div>

            {/* Outcome Strip 2 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Home className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">Vị thế gia tộc:</span>
              </div>
              <span className="font-bold text-white">
                {rollResult.character.background}
              </span>
            </div>

            {/* Outcome Strip 3 */}
            <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs">
              <div className="flex items-center gap-2 text-slate-300 mb-1.5">
                <Dna className="w-4 h-4 text-purple-400" />
                <span className="font-medium">Mã gen di truyền:</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(rollResult.character.innate_traits || []).map((t: string) => (
                  <span key={t} className="px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[10px]">
                    ✨ {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Irrevocable Destiny Notice (Không cho phép Reroll) */}
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 flex items-center gap-2.5 shadow-inner">
              <span className="text-base shrink-0">⚖️</span>
              <span className="leading-snug font-serif italic text-slate-300">
                <strong className="text-amber-300 font-sans not-italic">Nhân Quả Tiền Định:</strong> Bánh xe luân hồi đã an bài theo phúc báo tiền kiếp, tuyệt đối không thể gieo quẻ lại. Hãy dũng cảm đón nhận và định đoạt kiếp người này!
              </span>
            </div>

            {/* Single Unified Action Entry - ALWAYS START FROM AGE 0 */}
            <div className="mt-3">
              <button
                onClick={() => onRebirthComplete(rollResult)}
                className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 shadow-xl active:scale-[0.98] bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 shadow-emerald-600/30 ring-1 ring-emerald-400/50"
              >
                <span className="text-lg">🌱</span>
                <span>BƯỚC VÀO CUỘC ĐỜI (BẮT ĐẦU TỪ 0 TUỔI)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2 font-serif italic">
                Bắt đầu kiếp sống từ 0 tuổi, trải nghiệm trọn vẹn tuổi thơ, định hình nhân cách và gắn kết gia đình tại Cockpit chính.
              </p>
            </div>
          </div>
        ) : (
          <button
            disabled={isSpinning}
            onClick={spinDestinyWheel}
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-xl ${
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
