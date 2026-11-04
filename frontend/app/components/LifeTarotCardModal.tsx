'use client';

import React, { useRef, useState } from 'react';
import { Sparkles, Download, Copy, Check, X, Award, Skull, ShieldCheck, Heart, MapPin, Zap } from 'lucide-react';
import { formatCurrency } from '../utils/currencyUtils';

interface LifeTarotCardModalProps {
  character: any;
  historyLog?: any[];
  deathCause?: string;
  onClose: () => void;
}

export default function LifeTarotCardModal({
  character,
  historyLog = [],
  deathCause,
  onClose
}: LifeTarotCardModalProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
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
    // Filter notable moments
    const notable = logs.filter(l => 
      l.event?.includes('Kỳ Thi') ||
      l.event?.includes('Biến cố') ||
      l.event?.includes('Đầu tư') ||
      l.event?.includes('Tam Giác') ||
      l.event?.includes('Cú Sốc') ||
      l.event?.includes('Kết hôn')
    );
    const chosen = notable.length >= 3 ? notable.slice(-3) : logs.slice(-3);
    return chosen.map(c => ({
      age: c.age ?? age,
      text: c.event || c.choice || "Bước ngoặt cuộc đời"
    }));
  };
  const topMoments = getTopMoments();

  // Copy text summary
  const handleCopySummary = () => {
    const text = `🎴 [THẺ BÀI CUỘC ĐỜI - LIFEGRAPH 2.0]
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
👉 Khám phá và đầu thai kiếp mới tại: ${window.location.origin}`;

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
    bgGrad.addColorStop(0, '#030712');
    bgGrad.addColorStop(0.5, '#090d16');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1440);

    // Golden Border Frame
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, 1008, 1368);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, 984, 1344);

    // Header Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LIFEGRAPH 2.0 • BÁNH XE ĐỊNH MỆNH', 540, 110);

    // Epithet Badge
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(200, 150, 680, 60);
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(200, 150, 680, 60);

    ctx.fillStyle = '#c7d2fe';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`👑 ${epithet}`, 540, 190);

    // Avatar Icon & Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px serif';
    ctx.fillText(name, 540, 310);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '30px sans-serif';
    ctx.fillText(`${nationality} • Hưởng thọ ${age} tuổi`, 540, 365);

    // Separator line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 410);
    ctx.lineTo(960, 410);
    ctx.stroke();

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

    drawStatBox(130, 450, 'TIỀN MẶT TÍCH LŨY', `$${cash.toLocaleString()}`, '#10b981');
    drawStatBox(570, 450, 'NGHIỆP LỰC (KARMA)', `+${karma}`, '#c084fc');
    drawStatBox(130, 590, 'BẰNG CẤP TINH HOA', `★ ${totalSkillsLevel}/12 Cấp`, '#38bdf8');
    drawStatBox(570, 590, 'HUYẾT THỐNG GIA TỘC', `${relationships.length} Hậu Duệ`, '#f43f5e');

    // 3 Defining Moments Section
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📜 BA CỘT MỐC ĐỊNH MỆNH CUỘC ĐỜI', 130, 770);

    topMoments.forEach((m, idx) => {
      const boxY = 810 + idx * 130;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(130, boxY, 820, 105);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(130, boxY, 820, 105);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`Năm ${m.age}t:`, 155, boxY + 45);

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '22px sans-serif';
      const truncated = m.text.length > 55 ? m.text.slice(0, 52) + '...' : m.text;
      ctx.fillText(truncated, 155, boxY + 80);
    });

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Được tạo bởi LifeGraph 2.0 • Trò chơi mô phỏng nhân quả đa kiếp', 540, 1330);

    // Export image
    const link = document.createElement('a');
    link.download = `LifeGraph_Tarot_${name.replace(/\s+/g, '_')}_${age}yo.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-black/90 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 md:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden max-h-[95vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Tarot Holographic Glows */}
        <div className="absolute top-0 left-1/4 w-80 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-32 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Card Frame Container */}
        <div ref={cardRef} className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* Header Badge */}
          <div className="text-center">
            <span className="text-[12px] font-sans tabular-nums tracking-wide normal-case px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold inline-block mb-2">
              🎴 THẺ BÀI VẬN MỆNH • TAROT CUỘC ĐỜI
            </span>
            <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 font-bold text-xs normal-case tracking-normal mb-2">
              👑 {epithet}
            </div>
            <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight">
              {name}
            </h2>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{currentCity} ({nationality})</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{deathCause ? `Hưởng thọ ${age} tuổi` : `Đang sống (${age} tuổi)`}</span>
            </p>
          </div>

          {/* 4 Stats Quad */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[12px] text-slate-400 block normal-case tracking-normal">Tiền Tích Lũy</span>
              <span className="text-sm md:text-base font-bold text-emerald-400 font-sans tabular-nums">
                ${cash.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[12px] text-slate-400 block normal-case tracking-normal">Nghiệp Lực</span>
              <span className="text-sm md:text-base font-bold text-purple-400 font-sans tabular-nums">
                +{karma} Karma
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[12px] text-slate-400 block normal-case tracking-normal">Bằng Cấp Kỹ Năng</span>
              <span className="text-sm md:text-base font-bold text-sky-400 font-sans tabular-nums">
                ★ {totalSkillsLevel}/12 Cấp
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[12px] text-slate-400 block normal-case tracking-normal">Hậu Duệ Gia Tộc</span>
              <span className="text-sm md:text-base font-bold text-rose-400 font-sans tabular-nums">
                {relationships.length} Người
              </span>
            </div>
          </div>

          {/* 3 Defining Moments */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="text-[12px] font-bold text-amber-400 normal-case tracking-normal flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Ba Cột Mốc Định Mệnh:
            </div>
            {topMoments.map((m, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-start gap-2">
                <span className="text-[12px] font-sans tabular-nums px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-bold shrink-0">
                  {m.age}t
                </span>
                <span className="text-slate-300 text-[12px] leading-snug">{m.text}</span>
              </div>
            ))}
          </div>

          {/* Death / Destiny footer */}
          {deathCause && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-[12px] text-center italic">
              "Biến cố cuối cùng: {deathCause}"
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2.5">
          <button
            onClick={handleCopySummary}
            className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs normal-case tracking-normal transition flex items-center justify-center gap-2 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Đã Sao Chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Sao Chép Thẻ Bài</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs normal-case tracking-normal transition shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Đang Xuất Ảnh...' : 'Tải Ảnh Thẻ Bài'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

