'use client';

import React, { useState } from 'react';
import { Award, Sparkles, X, ChevronRight, Play, Flame, MapPin, Zap, CheckCircle2, Lock, BookOpen, Star, AlertCircle } from 'lucide-react';
import { MiniGameType } from './minigames/MiniGameHostModal';

export interface SkillBranch {
  id: string;
  name: string;
  icon: string;
  desc: string;
  compatibleTraits: { id: string; name: string }[];
  levels: {
    level: number;
    title: string;
    tuition: number;
    perkTitle: string;
    perkDesc: string;
  }[];
}

export const SKILL_BRANCHES: SkillBranch[] = [
  {
    id: 'tech_logic',
    name: 'Trí Tuệ & Công Nghệ',
    icon: '💻',
    desc: 'Lập trình thuật toán, đấu nối vi mạch và làm chủ công nghệ cao.',
    compatibleTraits: [
      { id: 'thiên_tài_toán_học', name: 'Thiên tài toán học' },
      { id: 'bộ_não_kỹ_thuật', name: 'Bộ não kỹ thuật' },
      { id: 'trí_nhớ_siêu_phàm', name: 'Trí nhớ siêu phàm' },
      { id: 'tư_duy_chiến_lược', name: 'Tư duy chiến lược' }
    ],
    levels: [
      {
        level: 1,
        title: 'Kỹ Sư Tập Sự (Novice)',
        tuition: 500,
        perkTitle: '+15% Thu Nhập Cày Việc',
        perkDesc: 'Tăng 15% thù lao tiền mặt mỗi khi thực hiện Cày Thêm Việc.'
      },
      {
        level: 2,
        title: 'Chuyên Gia Thuật Toán (Expert)',
        tuition: 1800,
        perkTitle: '+30% Thu Nhập Cày Việc & Kháng Lừa Đảo',
        perkDesc: 'Tăng 30% thù lao cày việc; giảm 50% thiệt hại từ bẫy lừa đảo công nghệ/coin đa cấp.'
      },
      {
        level: 3,
        title: 'Đại Sư Công Nghệ Cao (Master)',
        tuition: 4500,
        perkTitle: 'Cổ Tức Tech Hàng Năm & Đột Phá Trilemma',
        perkDesc: 'Nhận thụ động +$2,000/năm cổ tức công nghệ và mở khóa các quyết định tối thượng trong Trilemma.'
      }
    ]
  },
  {
    id: 'finance_market',
    name: 'Tài Chính & Thương Trường',
    icon: '📈',
    desc: 'Phân tích kỹ thuật, quản trị dòng tiền, lướt sóng và định giá tài sản.',
    compatibleTraits: [
      { id: 'trực_giác_kinh_doanh', name: 'Trực giác kinh doanh' },
      { id: 'mắt_nhìn_xuyên_thị_trường', name: 'Mắt nhìn xuyên thị trường' },
      { id: 'tư_duy_chiến_lược', name: 'Tư duy chiến lược' }
    ],
    levels: [
      {
        level: 1,
        title: 'Nhà Đầu Tư F0 (Novice)',
        tuition: 500,
        perkTitle: 'Chiết Khấu 10% Mua Tài Sản',
        perkDesc: 'Tiết kiệm 10% chi phí khi mua nhà đất hoặc thâu tóm cổ phiếu.'
      },
      {
        level: 2,
        title: 'Chuyên Gia Lướt Sóng (Expert)',
        tuition: 1800,
        perkTitle: 'Chiết Khấu 20% & Tăng Tỷ Lệ Thắng Vận May',
        perkDesc: 'Chiết khấu 20% giá tài sản; tăng tỷ lệ sinh lời cao khi Thử Vận May.'
      },
      {
        level: 3,
        title: 'Tài Phiệt Quản Trị Vốn (Master)',
        tuition: 4500,
        perkTitle: 'Miễn Nhiễm Sập Sàn & +15% Lợi Tức Ròng',
        perkDesc: 'Miễn nhiễm tổn thất khi xảy ra khủng hoảng sụp đổ thị trường tài chính; tăng +15% giá trị tài sản ròng hàng năm.'
      }
    ]
  },
  {
    id: 'resilience_health',
    name: 'Sinh Lực & Khắc Kỷ',
    icon: '🧘',
    desc: 'Kiểm soát thân tâm, dưỡng sinh trường thọ, điều hòa nhịp tim và hóa giải áp lực.',
    compatibleTraits: [
      { id: 'cốt_cách_trường_thọ', name: 'Cốt cách trường thọ' },
      { id: 'gen_trường_thọ_bách_niên', name: 'Gen trường thọ bách niên' },
      { id: 'khỏe_mạnh_vô_song', name: 'Khỏe mạnh vô song' },
      { id: 'phục_hồi_thần_tốc', name: 'Phục hồi thần tốc' },
      { id: 'thể_chất_vận_động_viên', name: 'Thể chất vận động viên' },
      { id: 'tâm_lý_thép', name: 'Tâm lý thép' }
    ],
    levels: [
      {
        level: 1,
        title: 'Tâm Trí Vững Vàng (Novice)',
        tuition: 500,
        perkTitle: 'Kháng 20% Tích Lũy Burnout',
        perkDesc: 'Giảm 20% lượng Burnout gia tăng từ mọi hoạt động cày việc và biến cố.'
      },
      {
        level: 2,
        title: 'Bậc Thầy Khắc Kỷ (Expert)',
        tuition: 1800,
        perkTitle: 'Dưỡng Sinh Đột Phá (+10 HP, -15 Burnout)',
        perkDesc: 'Mỗi lần Dưỡng Sinh hồi thêm +10 Sinh Lực và thanh lọc thêm -15 Burnout.'
      },
      {
        level: 3,
        title: 'Thân Thể Kim Cương (Master)',
        tuition: 4500,
        perkTitle: '+15 Max Sinh Lực Vĩnh Viễn & Kháng Bạo Bệnh',
        perkDesc: 'Tăng vĩnh viễn +15 Giới Hạn Sinh Lực; miễn nhiễm nguy cơ tử vong do suy tim đột ngột lúc xế chiều.'
      }
    ]
  },
  {
    id: 'leadership_social',
    name: 'Lãnh Đạo & Ngoại Giao',
    icon: '🤝',
    desc: 'Đàm phán thương trường, mở rộng mạng lưới quan hệ đỉnh cao và hòa giải gia tộc.',
    compatibleTraits: [
      { id: 'phong_thái_lãnh_đạo', name: 'Phong thái lãnh đạo' },
      { id: 'thấu_cảm_xã_hội', name: 'Thấu cảm xã hội' },
      { id: 'ngoại_hình_xuất_chúng', name: 'Ngoại hình xuất chúng' },
      { id: 'giọng_nói_truyền_cảm', name: 'Giọng nói truyền cảm' }
    ],
    levels: [
      {
        level: 1,
        title: 'Sứ Giả Giao Tiếp (Novice)',
        tuition: 500,
        perkTitle: 'Giảm 25% Chi Phí Mở Quan Hệ',
        perkDesc: 'Tiết kiệm 25% tiền khi thực hiện hành động kết nối mạng lưới ngoại giao.'
      },
      {
        level: 2,
        title: 'Nhà Thuyết Phục Tài Ba (Expert)',
        tuition: 1800,
        perkTitle: 'Giảm 50% Phí & Kết Thân Đối Tác VIP',
        perkDesc: 'Giảm một nửa phí Mở Quan Hệ, tăng 40% khả năng kết nối được các NPC quyền lực.'
      },
      {
        level: 3,
        title: 'Lãnh Tụ Kiệt Xuất (Master)',
        tuition: 4500,
        perkTitle: 'Hợp Đồng Độc Quyền & Bảo Vệ Gia Tộc',
        perkDesc: 'Mở khóa hợp đồng đối tác độc quyền lớn; giảm 70% tổn thất từ các vụ tranh chấp di chúc hoặc đấu tố gia tộc.'
      }
    ]
  }
];

interface SkillSelectorModalProps {
  characterAge: number;
  character?: any;
  onSelectSkill?: (gameType: MiniGameType) => void;
  onRegisterExam?: (skillId: string) => Promise<void>;
  onClose: () => void;
}

export default function SkillSelectorModal({
  characterAge,
  character,
  onSelectSkill,
  onRegisterExam,
  onClose
}: SkillSelectorModalProps) {
  const [submittingSkillId, setSubmittingSkillId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const nationality = character?.nationality || "Việt Nam";
  const currentCity = character?.current_city || (nationality === "Việt Nam" ? "Hà Nội" : nationality);
  const userTraits: string[] = character?.innate_traits || [];
  const characterCash: number = Number(character?.cash) || 0;
  const characterAP: number = Number(character?.action_points) || 0;
  const skillsData = character?.skills || {};

  // Total mastery stars
  const totalMasteryScore: number = Object.values(skillsData || {}).reduce<number>(
    (sum, s: any) => sum + (Number(s?.level) || 0),
    0
  );

  const handleStartExam = async (skillId: string) => {
    setLocalError(null);
    setSubmittingSkillId(skillId);
    try {
      if (onRegisterExam) {
        await onRegisterExam(skillId);
      } else if (onSelectSkill) {
        // Fallback to legacy
        let defaultGame: MiniGameType = 'logic_circuit_6yo';
        if (skillId === 'finance_market') defaultGame = 'stock_trader_20yo';
        else if (skillId === 'resilience_health') {
          defaultGame = characterAge <= 18 ? 'plant_care_6yo' : characterAge <= 48 ? 'life_tightrope_35yo' : 'cardio_beat_55yo';
        } else if (skillId === 'leadership_social') defaultGame = 'negotiation_duel';
        onClose();
        onSelectSkill(defaultGame);
      }
    } catch (err: any) {
      setLocalError(err.message || "Đăng ký thi sát hạch thất bại");
    } finally {
      setSubmittingSkillId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-5 md:p-7 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-28 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 shrink-0">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg md:text-2xl font-bold text-white tracking-tight">
                  Viện Phát Triển Bằng Cấp & Năng Lực Chuyên Môn
                </h2>
                <span className="text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Tuổi {characterAge}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Định vị: <strong>{currentCity} ({nationality})</strong></span>
                <span>•</span>
                <span>Học phí + 1 AP • Vượt qua sát hạch để nhận Bằng & Quyền lợi thụ động</span>
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2.5 bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] rounded-2xl px-3.5 py-2 shrink-0 self-start sm:self-center">
            <div className="text-center">
              <span className="text-[12px] text-[var(--text-secondary)] normal-case tracking-normal block">Điểm AP</span>
              <span className="text-xs font-bold text-amber-400 font-sans tabular-nums">⚡ {characterAP} AP</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[12px] text-[var(--text-secondary)] normal-case tracking-normal block">Tiền Mặt</span>
              <span className="text-xs font-bold text-emerald-400 font-sans tabular-nums">${characterCash.toLocaleString()}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[12px] text-[var(--text-secondary)] normal-case tracking-normal block">Tổng Cấp Độ</span>
              <span className="text-xs font-bold text-sky-400 font-sans tabular-nums">★ {totalMasteryScore}/12</span>
            </div>
          </div>
        </div>

        {localError && (
          <div className="mb-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{localError}</span>
          </div>
        )}

        {/* 4 Skill Branches Grid */}
        <div className="overflow-y-auto space-y-3.5 pr-1 flex-1">
          {SKILL_BRANCHES.map((branch) => {
            const currentLevel = skillsData[branch.id]?.level || 0;
            const isMaxed = currentLevel >= 3;
            const nextLevelConfig = branch.levels.find(l => l.level === currentLevel + 1);
            
            // Check genetic affinity
            const matchingTrait = branch.compatibleTraits.find(t => userTraits.includes(t.id));
            const hasAffinity = !!matchingTrait;

            // Tuition calculation
            const rawTuition = nextLevelConfig?.tuition || 0;
            const finalTuition = hasAffinity ? Math.round(rawTuition * 0.5) : rawTuition;

            // Affordability check
            const hasEnoughAP = characterAP >= 1;
            const hasEnoughCash = characterCash >= finalTuition;
            const canAfford = hasEnoughAP && hasEnoughCash;

            // Active perks
            const activeLevelConfig = branch.levels.find(l => l.level === currentLevel);

            return (
              <div
                key={branch.id}
                className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]/80 hover:border-amber-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Column: Icon & Basic Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl p-2 rounded-xl bg-slate-950 border border-[var(--border-subtle)]">{branch.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-white">{branch.name}</h4>
                        {/* Stars */}
                        <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                          {[1, 2, 3].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`w-3.5 h-3.5 ${starIdx <= currentLevel ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                            />
                          ))}
                        </div>
                        {/* Level badge */}
                        <span className={`text-[12px] font-sans tabular-nums px-2 py-0.5 rounded-full border ${
                          currentLevel === 3
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : currentLevel === 2
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                            : currentLevel === 1
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-[var(--text-secondary)] border-slate-700'
                        }`}>
                          {currentLevel === 0 ? 'Chưa Đào Tạo' : activeLevelConfig?.title}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{branch.desc}</p>
                    </div>
                  </div>

                  {/* Genetic Affinity Tag */}
                  {hasAffinity && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-950/40 border border-pink-500/30 text-[12px] text-pink-300 mb-2">
                      <span>🧬</span>
                      <span>Hưởng ứng Mã Gen: <strong>{matchingTrait?.name}</strong></span>
                      <span className="text-pink-400 font-bold">• Giảm 50% Học Phí & Tăng Tỉ Lệ Đỗ</span>
                    </div>
                  )}

                  {/* Perks Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {/* Current Active Perk */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-[12px]">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Quyền Lợi Đã Kích Hoạt ({currentLevel === 0 ? 'Chưa có' : `Cấp ${currentLevel}`}):</span>
                      </div>
                      <p className="text-[var(--text-secondary)] text-[12px]">
                        {currentLevel === 0 ? 'Chưa có quyền lợi thụ động.' : activeLevelConfig?.perkDesc}
                      </p>
                    </div>

                    {/* Next Unlockable Perk */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-[12px]">
                      <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mục Tiêu Kế Tiếp ({isMaxed ? 'Đạt Max' : nextLevelConfig?.title}):</span>
                      </div>
                      <p className="text-[var(--text-secondary)] text-[12px]">
                        {isMaxed ? 'Đã đạt cảnh giới Đại Sư tối cao, không thể nâng thêm.' : nextLevelConfig?.perkDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Pricing & Exam Action Button */}
                <div className="shrink-0 flex flex-col items-end justify-center min-w-[200px] border-t md:border-t-0 md:border-l border-[var(--border-subtle)]/80 pt-3 md:pt-0 md:pl-4">
                  {!isMaxed ? (
                    <>
                      {/* Price Tag */}
                      <div className="text-right mb-2.5">
                        <div className="text-[12px] text-[var(--text-secondary)]">Chi phí sát hạch:</div>
                        <div className="flex items-center gap-2 justify-end mt-0.5">
                          <span className="text-xs font-sans tabular-nums font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                            1 AP
                          </span>
                          <span className="text-sm font-bold text-emerald-400 font-sans tabular-nums">
                            ${finalTuition.toLocaleString()}
                          </span>
                          {hasAffinity && (
                            <span className="text-[12px] text-slate-500 line-through">
                              ${rawTuition.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleStartExam(branch.id)}
                        disabled={!canAfford || submittingSkillId === branch.id}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs normal-case tracking-normal transition flex items-center justify-center gap-1.5 shadow-md ${
                          canAfford && submittingSkillId !== branch.id
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 active:scale-95'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        {submittingSkillId === branch.id ? (
                          <span>Đang Đăng Ký...</span>
                        ) : !hasEnoughAP ? (
                          <span>Thiếu 1 AP</span>
                        ) : !hasEnoughCash ? (
                          <span>Thiếu Tiền Mặt</span>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Đăng Ký & Thi Sát Hạch</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="text-amber-400 font-bold text-xs normal-case tracking-wide flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>ĐẠI SƯ HOÀN MỸ</span>
                      </div>
                      <span className="text-[12px] text-[var(--text-secondary)] block mt-0.5">Đạt cảnh giới tối cao</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-center text-[12px] text-[var(--text-secondary)] flex items-center justify-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Vượt qua kỳ sát hạch (Mini-Game) sẽ nhận bằng cấp và kích hoạt quyền lợi vĩnh viễn suốt kiếp sống.</span>
        </div>
      </div>
    </div>
  );
}

