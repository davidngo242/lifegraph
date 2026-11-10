'use client';

import React, { useRef, useState } from 'react';
import { Sparkles, Download, Copy, Check, X, Award, Skull, ShieldCheck, Heart, MapPin, Zap, Trophy, Crown, Flame, Star, BookOpen, Users, Compass } from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';

interface LifeTarotCardModalProps {
  character: any;
  historyLog?: any[];
  deathCause?: string;
  onClose: () => void;
}

interface DynastyAchievement {
  id: string;
  title: string;
  icon: string;
  desc: string;
  progressText: string;
  isUnlocked: boolean;
  progressPercent: number;
}

export default function LifeTarotCardModal({
  character,
  historyLog = [],
  deathCause,
  onClose
}: LifeTarotCardModalProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<'tarot' | 'hall_of_fame'>('tarot');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const name = character?.name || "Kẻ Phiêu Lãng";
  const age = character?.age ?? 0;
  const nationality = character?.nationality || "Việt Nam";
  const currentCity = character?.current_city || nationality;
  const cash = Number(character?.cash) || 0;
  const karma = Number(character?.karma ?? 0);
  const skills = character?.skills || {};
  const relationships = character?.relationships || [];
  const flags: string[] = character?.hidden_flags || [];

  const totalSkillsLevel = Object.values(skills).reduce<number>((sum, s: any) => sum + (Number(s?.level) || 0), 0);
  const techLevel = skills?.tech_logic?.level || 0;
  const financeLevel = skills?.finance_market?.level || 0;
  const healthLevel = skills?.resilience_health?.level || 0;
  const socialLevel = skills?.leadership_social?.level || 0;

  // Procedural Life Epithet / Title
  const getEpithet = () => {
    if (deathCause) {
      if (deathCause.toLowerCase().includes('đột quỵ') || deathCause.toLowerCase().includes('kiệt sức')) {
        return "CHIẾN BINH KIỆT CÙNG VÌ KHÁT VỌNG";
      }
      if (deathCause.toLowerCase().includes('chiến tranh') || deathCause.toLowerCase().includes('tai nạn')) {
        return "LINH HỒN BẤT KHUẤT GIỮA GIÔNG BÃO";
      }
    }
    if (financeLevel >= 2 && cash >= 100000) return "TÀI PHIỆT THƯƠNG TRƯỜNG ĐỈNH CAO";
    if (techLevel >= 2 && relationships.length <= 1) return "ĐẠI SƯ CÔNG NGHỆ NHƯNG CÔ ĐỘC";
    if (techLevel >= 2) return "BẬC THẦY THUẬT TOÁN & TRÍ TUỆ";
    if (socialLevel >= 2 && relationships.length >= 4) return "LÃNH TỤ GIA TỘC QUYỀN UY VANG DANH";
    if (healthLevel >= 2 && age >= 70) return "ẨN SĨ KHẮC KỶ & TRƯỜNG THỌ BÁCH NIÊN";
    if (cash >= 300000) return "HUYỀN THOẠI TRIỆU PHÚ TỰ THÂN";
    if (age <= 28) return "CÁNH ÉN THANH XUÂN DỞ DANG";
    return "LỮ KHÁCH VÔ THƯỜNG TRẦN THẾ";
  };
  const epithet = getEpithet();

  // Extract top 3 defining moments
  const getTopMoments = () => {
    const logs = [...(historyLog.length > 0 ? historyLog : (character?.history_log || []))];
    if (logs.length === 0) {
      return [
        { age: 0, text: `Chào đời tại ${nationality}` },
        { age: Math.min(age, 20), text: "Chập chững bước chân vào dòng đời biến động" },
        { age: age, text: deathCause || "Tiếp tục kiến tạo vận mệnh gia tộc" }
      ];
    }
    const notable = logs.filter(l => 
      l.event?.includes('Kỳ Thi') ||
      l.event?.includes('Biến cố') ||
      l.event?.includes('Đầu tư') ||
      l.event?.includes('Tam Giác') ||
      l.event?.includes('Cú Sốc') ||
      l.event?.includes('Kết hôn') ||
      l.event?.includes('Vĩ Mô')
    );
    const chosen = notable.length >= 3 ? notable.slice(-3) : logs.slice(-3);
    return chosen.map(c => ({
      age: c.age ?? age,
      text: c.event || c.choice || "Bước ngoặt cuộc đời"
    }));
  };
  const topMoments = getTopMoments();

  // Dynasty Hall of Fame Achievements (Quyết định 4)
  const achievements: DynastyAchievement[] = [
    {
      id: 'longevity',
      title: 'Bách Niên Trường Thọ',
      icon: '👑',
      desc: 'Vượt qua quy luật nghiệt ngã của sinh lão bệnh tử, sống trọn kiếp người.',
      progressText: `${age}/70 Tuổi`,
      isUnlocked: age >= 70,
      progressPercent: Math.min(100, Math.round((age / 70) * 100))
    },
    {
      id: 'wealth_tycoon',
      title: 'Tài Phiệt Thương Trường',
      icon: '💰',
      desc: 'Tích lũy tài sản lưu động đạt mốc từ $100.000 trở lên.',
      progressText: `$${cash.toLocaleString()} / $100.000`,
      isUnlocked: cash >= 100000,
      progressPercent: Math.min(100, Math.round((cash / 100000) * 100))
    },
    {
      id: 'wisdom_master',
      title: 'Đại Sư Khai Sáng',
      icon: '🧠',
      desc: 'Đạt tối thiểu 6 cấp độ tinh thông các nhánh kỹ năng thế hệ.',
      progressText: `${totalSkillsLevel}/6 Cấp Tinh Hoa`,
      isUnlocked: totalSkillsLevel >= 6,
      progressPercent: Math.min(100, Math.round((totalSkillsLevel / 6) * 100))
    },
    {
      id: 'dynasty_kin',
      title: 'Gia Đạo Hưng Vượng',
      icon: '👨‍👩‍👧‍👦',
      desc: 'Xây dựng mối liên kết gia đình bền chặt cùng bạn đời và thế hệ F2.',
      progressText: `${relationships.length}/3 Người thân gắn kết`,
      isUnlocked: relationships.length >= 3,
      progressPercent: Math.min(100, Math.round((relationships.length / 3) * 100))
    },
    {
      id: 'macro_resilience',
      title: 'Bàn Tay Vàng Vượt Sóng',
      icon: '🛡️',
      desc: 'Đứng vững trước biến cố thời cuộc, suy thoái hoặc thảm họa vĩ mô.',
      progressText: flags.some(f => f.includes('macro') || f.includes('calamity')) ? 'Đã sống sót qua phong ba' : 'Đang tôi luyện',
      isUnlocked: flags.some(f => f.includes('macro') || f.includes('calamity')),
      progressPercent: flags.some(f => f.includes('macro') || f.includes('calamity')) ? 100 : 35
    },
    {
      id: 'nirvana_karma',
      title: 'Giác Ngộ Niết Bàn',
      icon: '✨',
      desc: 'Gieo hạt mầm phúc đức, tích lũy từ 80 điểm Nghiệp Lực thiện lành trở lên.',
      progressText: `${karma}/80 Karma`,
      isUnlocked: karma >= 80,
      progressPercent: Math.min(100, Math.round((karma / 80) * 100))
    },
    {
      id: 'youth_prodigy',
      title: 'Kỳ Tích Khởi Nguyên',
      icon: '🌟',
      desc: 'Vượt qua các kỳ thi lớn hoặc đột phá số mệnh thời niên thiếu.',
      progressText: flags.some(f => f.includes('prodigy') || f.includes('olympiad') || f.includes('scholar')) ? 'Đạt thành tích xuất sắc' : 'Chờ bứt phá',
      isUnlocked: flags.some(f => f.includes('prodigy') || f.includes('olympiad') || f.includes('scholar')) || age >= 18,
      progressPercent: flags.some(f => f.includes('prodigy') || f.includes('olympiad') || f.includes('scholar')) || age >= 18 ? 100 : 50
    },
    {
      id: 'pillar_destiny',
      title: 'Thần Mộc Bách Niên',
      icon: '🌳',
      desc: 'Nuôi dưỡng Thần Mộc Sinh Mệnh phát triển đến trạng thái vững chãi.',
      progressText: `${age}/30 Vòng Vân Gỗ`,
      isUnlocked: age >= 30,
      progressPercent: Math.min(100, Math.round((age / 30) * 100))
    }
  ];

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  // Copy text summary
  const handleCopySummary = () => {
    let text = "";
    if (activeTab === 'tarot') {
      text = `🎴 [THẺ BÀI VẬN MỆNH CUỘC ĐỜI - LIFEGRAPH 2.0]
━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Nhân Vật: ${name} (${age} Tuổi)
👑 Danh Xưng: ${epithet}
📍 Xuất Thân: ${currentCity} (${nationality})
💰 Tiền Mặt: $${cash.toLocaleString()}
⭐ Kỹ Năng Tinh Hoa: ${totalSkillsLevel}/12 Cấp Độ
✨ Nghiệp Lực (Karma): ${karma}
📜 3 Cột Mốc Đời Người:
${topMoments.map(m => `  • [Năm ${m.age}t]: ${m.text}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━
👉 Khám phá và kiến tạo gia tộc tại: ${window.location.origin}`;
    } else {
      text = `🏆 [SỔ VÀNG THÀNH TỰU GIA TỘC - LIFEGRAPH 2.0]
━━━━━━━━━━━━━━━━━━━━━━━━━
👑 Chủ Gia Tộc: ${name} (${age} Tuổi)
📍 Danh Xưng: ${epithet}
🎖️ Chiến Tích Mở Khóa: ${unlockedCount}/${achievements.length} Đại Huy Hiệu
🌟 Danh Sách Huy Hiệu Vinh Quang:
${achievements.map(a => `  ${a.isUnlocked ? '✅' : '⏳'} ${a.icon} ${a.title} (${a.progressText})`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━
👉 Khám phá và lưu truyền phả hệ tại: ${window.location.origin}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Card as PNG Image via Canvas
  const handleDownloadImage = () => {
    setIsExporting(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1440);
    if (activeTab === 'tarot') {
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(0.5, '#090d16');
      bgGrad.addColorStop(1, '#020617');
    } else {
      bgGrad.addColorStop(0, '#1c1004');
      bgGrad.addColorStop(0.5, '#0f0a05');
      bgGrad.addColorStop(1, '#030712');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1440);

    // Golden Border Frame
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, 1008, 1368);

    ctx.strokeStyle = activeTab === 'tarot' ? '#38bdf8' : '#eab308';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, 984, 1344);

    // Header Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(activeTab === 'tarot' ? 'LIFEGRAPH 2.0 • BÁNH XE ĐỊNH MỆNH' : 'LIFEGRAPH 2.0 • SỔ VÀNG THÀNH TỰU GIA TỘC', 540, 110);

    // Epithet Badge
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(180, 150, 720, 60);
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(180, 150, 720, 60);

    ctx.fillStyle = '#c7d2fe';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`👑 ${epithet}`, 540, 190);

    // Avatar Icon & Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px serif';
    ctx.fillText(name, 540, 305);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '30px sans-serif';
    ctx.fillText(`${nationality} • ${deathCause ? `Hưởng thọ ${age} tuổi` : `Tuổi hiện tại: ${age}`}`, 540, 360);

    // Separator line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 400);
    ctx.lineTo(960, 400);
    ctx.stroke();

    if (activeTab === 'tarot') {
      // 4 Key Stats Box Grid
      const drawStatBox = (x: number, y: number, label: string, val: string, color: string) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, y, 380, 110);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(x, y, 380, 110);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 24, y + 42);

        ctx.fillStyle = color;
        ctx.font = 'bold 36px monospace';
        ctx.fillText(val, x + 24, y + 88);
      };

      drawStatBox(130, 440, 'TIỀN MẶT TÍCH LŨY', `$${cash.toLocaleString()}`, '#10b981');
      drawStatBox(570, 440, 'NGHIỆP LỰC (KARMA)', `+${karma}`, '#c084fc');
      drawStatBox(130, 580, 'BẰNG CẤP TINH HOA', `★ ${totalSkillsLevel}/12 Cấp`, '#38bdf8');
      drawStatBox(570, 580, 'HUYẾT THỐNG GIA TỘC', `${relationships.length} Hậu Duệ`, '#f43f5e');

      // 3 Defining Moments Section
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('📜 BA CỘT MỐC ĐỊNH MỆNH CUỘC ĐỜI', 130, 755);

      topMoments.forEach((m, idx) => {
        const boxY = 790 + idx * 135;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(130, boxY, 820, 110);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(130, boxY, 820, 110);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`Năm ${m.age}t:`, 155, boxY + 45);

        ctx.fillStyle = '#f1f5f9';
        ctx.font = '22px sans-serif';
        const truncated = m.text.length > 55 ? m.text.slice(0, 52) + '...' : m.text;
        ctx.fillText(truncated, 155, boxY + 80);
      });
    } else {
      // Hall of Fame 8 Achievement Grid
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🏆 CHIẾN TÍCH VINH QUANG GIA TỘC (${unlockedCount}/${achievements.length} MỞ KHÓA)`, 130, 440);

      achievements.forEach((ach, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const boxX = 130 + col * 420;
        const boxY = 475 + row * 195;

        ctx.fillStyle = ach.isUnlocked ? '#1e1b4b' : '#0f172a';
        ctx.fillRect(boxX, boxY, 400, 175);
        ctx.strokeStyle = ach.isUnlocked ? '#f59e0b' : '#334155';
        ctx.lineWidth = ach.isUnlocked ? 2.5 : 1;
        ctx.strokeRect(boxX, boxY, 400, 175);

        // Icon & Title
        ctx.fillStyle = ach.isUnlocked ? '#fef08a' : '#94a3b8';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${ach.icon} ${ach.title}`, boxX + 20, boxY + 42);

        // Status pill
        ctx.fillStyle = ach.isUnlocked ? '#10b981' : '#64748b';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(ach.isUnlocked ? '★ ĐẠT ĐƯỢC' : 'TIẾN TRÌNH', boxX + 20, boxY + 75);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '18px sans-serif';
        ctx.fillText(ach.progressText, boxX + 150, boxY + 75);

        // Desc
        ctx.fillStyle = '#94a3b8';
        ctx.font = '18px sans-serif';
        const truncatedDesc = ach.desc.length > 34 ? ach.desc.slice(0, 32) + '...' : ach.desc;
        ctx.fillText(truncatedDesc, boxX + 20, boxY + 115);

        // Progress bar background
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(boxX + 20, boxY + 135, 360, 14);

        // Progress bar fill
        ctx.fillStyle = ach.isUnlocked ? '#10b981' : '#38bdf8';
        ctx.fillRect(boxX + 20, boxY + 135, Math.round(360 * (ach.progressPercent / 100)), 14);
      });
    }

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Được tạo bởi LifeGraph 2.0 • Trò chơi mô phỏng nhân quả đa kiếp', 540, 1340);

    // Export image
    const link = document.createElement('a');
    link.download = `LifeGraph_${activeTab === 'tarot' ? 'Tarot' : 'So_Vang'}_${name.replace(/\s+/g, '_')}_${age}yo.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[var(--bg-card)] border-2 border-amber-500/60 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col overflow-hidden max-h-[95vh] text-[var(--text-primary)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Tarot Holographic Glows */}
        <div className="absolute top-0 left-1/4 w-80 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-32 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Tab Navigation Switcher (Quyết định 4) */}
        <div className="flex items-center gap-2 mb-4 bg-[var(--bg-card-subtle)] p-1.5 rounded-2xl border border-[var(--border-subtle)] shrink-0">
          <button
            onClick={() => setActiveTab('tarot')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'tarot'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/25'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <span>🎴</span>
            <span>Thẻ Vận Mệnh Cyber-Tarot</span>
          </button>
          <button
            onClick={() => setActiveTab('hall_of_fame')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'hall_of_fame'
                ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/25'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Sổ Vàng Thành Tựu ({unlockedCount}/{achievements.length})</span>
          </button>
        </div>

        {/* Card Frame Container */}
        <div ref={cardRef} className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* Header Info */}
          <div className="text-center">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs normal-case tracking-normal mb-1.5 inline-block px-4">
              👑 {epithet}
            </div>
            <h2 className="text-2xl md:text-3xl font-sans font-bold text-[var(--text-primary)] tracking-tight">
              {name}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{currentCity} ({nationality})</span>
              <span>•</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold">{deathCause ? `Hưởng thọ ${age} tuổi` : `Đang sống (${age} tuổi)`}</span>
            </p>
          </div>

          {activeTab === 'tarot' ? (
            <>
              {/* 4 Stats Quad */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                  <span className="text-[12px] text-[var(--text-secondary)] block normal-case tracking-normal">Tiền Tích Lũy</span>
                  <span className="text-sm md:text-base font-bold text-emerald-700 dark:text-emerald-400 font-sans tabular-nums">
                    ${cash.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                  <span className="text-[12px] text-[var(--text-secondary)] block normal-case tracking-normal">Nghiệp Lực</span>
                  <span className="text-sm md:text-base font-bold text-amber-700 dark:text-amber-500 font-sans tabular-nums">
                    +{karma} Karma
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                  <span className="text-[12px] text-[var(--text-secondary)] block normal-case tracking-normal">Bằng Cấp Kỹ Năng</span>
                  <span className="text-sm md:text-base font-bold text-sky-700 dark:text-sky-400 font-sans tabular-nums">
                    ★ {totalSkillsLevel}/12 Cấp
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
                  <span className="text-[12px] text-[var(--text-secondary)] block normal-case tracking-normal">Hậu Duệ Gia Tộc</span>
                  <span className="text-sm md:text-base font-bold text-rose-700 dark:text-rose-400 font-sans tabular-nums">
                    {relationships.length} Người
                  </span>
                </div>
              </div>

              {/* 3 Defining Moments */}
              <div className="p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] space-y-2">
                <div className="text-[12px] font-bold text-amber-700 dark:text-amber-400 normal-case tracking-normal flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Ba Cột Mốc Định Mệnh:
                </div>
                {topMoments.map((m, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs flex items-start gap-2">
                    <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold shrink-0 border border-sky-500/30">
                      {m.age}t
                    </span>
                    <span className="text-[var(--text-secondary)] text-[12px] leading-snug">{m.text}</span>
                  </div>
                ))}
              </div>

              {/* Death / Destiny footer */}
              {deathCause && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-[12px] text-center italic">
                  "Biến cố cuối cùng: {deathCause}"
                </div>
              )}
            </>
          ) : (
            /* Tab 2: Sổ Vàng Thành Tựu Gia Tộc */
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-slate-900/80 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    Bảng Vàng Danh Dự Gia Tộc
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Lưu danh sử sách các mốc son chói lọi trong hành trình</p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tabular-nums">
                  {unlockedCount} / {achievements.length} Mở Khóa
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      ach.isUnlocked
                        ? 'bg-gradient-to-br from-amber-950/40 to-slate-900/90 border-amber-500/40 shadow-sm shadow-amber-950/40'
                        : 'bg-slate-900/50 border-slate-800/80 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl shrink-0">{ach.icon}</span>
                        <div>
                          <h4 className={`text-xs font-bold ${ach.isUnlocked ? 'text-amber-200' : 'text-slate-300'}`}>
                            {ach.title}
                          </h4>
                          <span className={`text-[10px] font-medium ${ach.isUnlocked ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {ach.progressText}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        ach.isUnlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {ach.isUnlocked ? 'Đạt' : 'Chưa'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {ach.desc}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-2.5 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          ach.isUnlocked ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-sky-500'
                        }`}
                        style={{ width: `${ach.progressPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-2.5">
          <button
            onClick={handleCopySummary}
            className="flex-1 py-3 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-xs normal-case tracking-normal transition flex items-center justify-center gap-2 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Đã Sao Chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                <span>{activeTab === 'tarot' ? 'Sao Chép Thẻ Bài' : 'Sao Chép Sổ Vàng'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs normal-case tracking-normal transition shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Đang Xuất Ảnh...' : (activeTab === 'tarot' ? 'Tải Ảnh Thẻ Bài' : 'Tải Ảnh Sổ Vàng')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
