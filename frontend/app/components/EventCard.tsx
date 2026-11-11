'use client';

import React, { useState } from 'react';
import {
  Zap,
  Compass,
  Sparkles,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Heart,
  ShieldAlert,
  Dices,
  Flame,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import Tooltip from './Tooltip';
import FateDiceCheck from './FateDiceCheck';

interface Option {
  id: string;
  action_title?: string;
  label?: string;
  consequence_hint?: string;
  effects_hint?: string;
  risk_percent: number;
  cost_ap: number;
}

interface Dilemma {
  id: string;
  title: string;
  narrative: string;
  options: Option[];
}

interface EventCardProps {
  dilemma: Dilemma | null;
  actionPoints: number;
  characterAge?: number;
  character?: any;
  onSelectOption: (optionId: string, investedAp?: number) => void;
  onCustomResolve?: (actionText: string) => Promise<any>;
  isLoading: boolean;
}

export default function EventCard({
  dilemma,
  actionPoints,
  characterAge,
  character,
  onSelectOption,
  onCustomResolve,
  isLoading
}: EventCardProps) {
  const [activeTab, setActiveTab] = useState<'standard' | 'custom'>('standard');
  const [customActionText, setCustomActionText] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [customResult, setCustomResult] = useState<any>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Invested AP state & Smart Unspent Warning
  const [investedApMap, setInvestedApMap] = useState<Record<string, number>>({});
  const [pendingUnspentWarning, setPendingUnspentWarning] = useState<{
    option: Option;
    investedAp: number;
    unspentAP: number;
  } | null>(null);
  const [rollingCheck, setRollingCheck] = useState<{
    option: Option;
    investedAp: number;
  } | null>(null);

  // Mind Voices Expansion State
  const [activeVoice, setActiveVoice] = useState<'logic' | 'heart' | 'primal'>('logic');
  const [showMindVoices, setShowMindVoices] = useState<boolean>(true);

  if (!dilemma) {
    return (
      <div className="bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] text-[var(--text-secondary)] backdrop-blur-md">
        <Compass className="w-7 h-7 animate-spin text-indigo-500 mb-2" />
        <p className="text-xs normal-case font-sans font-medium text-[var(--text-secondary)]">Đang điều phối bước ngoặt cuộc đời...</p>
      </div>
    );
  }

  // Active Fate Dice Roll Stage
  if (rollingCheck && dilemma) {
    return (
      <FateDiceCheck
        option={rollingCheck.option}
        character={character}
        dilemmaTitle={dilemma.title}
        investedAp={rollingCheck.investedAp}
        onComplete={() => {
          const { option, investedAp } = rollingCheck;
          setRollingCheck(null);
          onSelectOption(option.id, investedAp);
        }}
        onCancel={() => setRollingCheck(null)}
        isLoading={isLoading}
      />
    );
  }

  const getRiskLabel = (risk: number) => {
    if (risk >= 65) return { text: `${risk}% rủi ro`, color: "text-rose-800 dark:text-rose-400 border-rose-500/30 bg-rose-500/10" };
    if (risk >= 35) return { text: `${risk}% rủi ro`, color: "text-amber-800 dark:text-amber-400 border-amber-500/30 bg-amber-500/10" };
    return { text: `An toàn`, color: "text-emerald-800 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
  };

  const displayTitle = characterAge
    ? dilemma.title.replace(/Tuổi \d+/i, `Tuổi ${characterAge}`)
    : dilemma.title;

  // Dynamic Internal Ego Voices (Bản Ngã Tranh Luận)
  const getInternalVoices = () => {
    const text = (dilemma.narrative + ' ' + dilemma.title).toLowerCase();
    
    if (text.includes('tiền') || text.includes('nợ') || text.includes('đầu tư') || text.includes('lương') || text.includes('kinh doanh')) {
      return {
        logic: "Dòng tiền là huyết mạch sinh tồn. Đừng để cảm xúc lấn át những phép tính thực dụng.",
        heart: "Tiền bạc có thể kiếm lại, nhưng lòng tự trọng và ân tình mất đi là không thể vãn hồi.",
        primal: "Cẩn thận với cạm bẫy tài chính. Giữ cho mình một lối thoát an toàn trước khi tất tay."
      };
    }
    if (text.includes('gia đình') || text.includes('mẹ') || text.includes('cha') || text.includes('vợ') || text.includes('bạn')) {
      return {
        logic: "Mối quan hệ cũng cần ranh giới sòng phẳng. Đừng tự trói mình vào những gánh nặng không lối thoát.",
        heart: "Tình thân và lòng chân thành là nơi nương tựa duy nhất khi giông bão cuộc đời ập đến.",
        primal: "Đừng để kiệt sức vì người khác. Cần giữ vững năng lượng và thể xác của chính mình trước."
      };
    }
    if (text.includes('học') || text.includes('thi') || text.includes('sách') || text.includes('trường')) {
      return {
        logic: "Kiến thức là đòn bẩy duy nhất để thay đổi tầng lớp xã hội. Hãy đầu tư hết sức cho tương lai.",
        heart: "Học vì đam mê mở mang tâm trí, đừng biến tuổi trẻ thành cỗ máy thi cử vô hồn.",
        primal: "Cân bằng não bộ! Đừng học đến mức kiệt quệ thần kinh và suy sụp sinh lực."
      };
    }
    return {
      logic: "Phân tích thiệt hơn một cách tỉnh táo. Mỗi lựa chọn hôm nay sẽ định hình 10 năm sau.",
      heart: "Hãy hành động sao cho đêm về lòng cảm thấy thanh thản, không phải hổ thẹn với lương tri.",
      primal: "Lùi một bước biển rộng trời cao. Bảo toàn sinh mạng và sức khỏe là nền tảng tối thượng."
    };
  };
  const voices = getInternalVoices();

  // Map option to Persona Roleplay Stance
  const getOptionStance = (option: Option, index: number) => {
    const text = (option.action_title || option.label || '').toLowerCase();
    const costAp = option.cost_ap !== undefined ? option.cost_ap : 1;

    if (costAp >= 2 || text.includes('đổi đời') || text.includes('đột phá') || text.includes('liều')) {
      return {
        tag: '🎲 Canh Bạc Đột Phá',
        color: 'text-amber-800 dark:text-amber-300 border-amber-500/40 bg-amber-500/15',
        needsRoll: true
      };
    }
    if (text.includes('ngủ') || text.includes('an toàn') || text.includes('rút lui') || text.includes('tiết kiệm') || text.includes('chăm sóc')) {
      return {
        tag: '⚡ Thận Trọng / Tự Vệ',
        color: 'text-teal-800 dark:text-teal-300 border-teal-500/40 bg-teal-500/15',
        needsRoll: option.risk_percent >= 25
      };
    }
    if (text.includes('giúp') || text.includes('chia sẻ') || text.includes('mẹ') || text.includes('bạn') || text.includes('thân')) {
      return {
        tag: '❤️ Thấu Cảm & Tình Thân',
        color: 'text-rose-800 dark:text-rose-300 border-rose-500/40 bg-rose-500/15',
        needsRoll: option.risk_percent >= 25
      };
    }
    if (index === 0) {
      return {
        tag: '🧠 Lý Trí & Quyết Đoán',
        color: 'text-indigo-800 dark:text-indigo-300 border-indigo-500/40 bg-indigo-500/15',
        needsRoll: option.risk_percent >= 20
      };
    }
    return {
      tag: '🎭 Khôn Khéo & Tùy Cơ',
      color: 'text-amber-800 dark:text-amber-300 border-amber-500/40 bg-amber-500/15',
      needsRoll: option.risk_percent >= 25
    };
  };

  const proceedOptionExecution = (option: Option, investedAp: number = 0) => {
    setPendingUnspentWarning(null);
    const risk = option.risk_percent ?? 0;
    // Kích hoạt FateDiceCheck khi lựa chọn có rủi ro (risk_percent >= 30 hoặc khi có AP trợ lực), trước khi gọi onSelectOption(optionId, investedAp)
    if (risk >= 30 || investedAp > 0) {
      setRollingCheck({ option, investedAp });
    } else {
      onSelectOption(option.id, investedAp);
    }
  };

  const handleOptionClick = (option: Option) => {
    if (isLoading) return;
    const costAp = option.cost_ap !== undefined ? option.cost_ap : 1;
    const currentInvested = investedApMap[option.id] || 0;
    const totalCost = costAp + currentInvested;
    const unspentAP = actionPoints - totalCost;

    if (unspentAP > 0) {
      // Smart Unspent AP Warning
      setPendingUnspentWarning({
        option,
        investedAp: currentInvested,
        unspentAP
      });
      return;
    }

    proceedOptionExecution(option, currentInvested);
  };

  const handleSendCustomAction = async () => {
    if (!customActionText.trim() || isResolving || !onCustomResolve) return;
    if (actionPoints < 1) {
      setResolveError("Cần tối thiểu 1 Điểm Hành Động (AP) để thực hiện quyết định tự do!");
      return;
    }

    try {
      setIsResolving(true);
      setResolveError(null);
      const res = await onCustomResolve(customActionText);
      setCustomResult(res);
    } catch (err: any) {
      setResolveError(err.message || "Phán xử hành động thất bại.");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-4 md:p-5 shadow-2xl relative overflow-hidden backdrop-blur-lg flex flex-col gap-3 transition-colors duration-200">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold normal-case px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-600/40 dark:border-amber-500/30">
            Sân Khấu Tâm Thức & Biến Cố
          </span>
          {characterAge !== undefined && (
            <span className="text-xs font-sans tabular-nums font-bold text-amber-800 dark:text-amber-400">
              Năm {characterAge} Tuổi
            </span>
          )}
        </div>

        {/* Tab Switcher: RPG Options vs Open-Text AI */}
        <div className="flex items-center bg-[var(--bg-card-subtle)] p-0.5 rounded-xl border border-[var(--border-subtle)] text-[12px]">
          <button
            onClick={() => { setActiveTab('standard'); setCustomResult(null); }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              activeTab === 'standard'
                ? 'bg-amber-500/25 dark:bg-amber-600/30 text-amber-900 dark:text-amber-200 border border-amber-600/50 dark:border-amber-500/40 shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            🎭 Thái Độ Nhập Vai
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition ${
              activeTab === 'custom'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Tự Do Hành Động</span>
          </button>
        </div>
      </div>

      {/* Atmospheric Title */}
      <h2 className="text-base md:text-lg font-bold text-[var(--text-primary)] tracking-tight leading-snug">
        {displayTitle}
      </h2>

      {/* Narrative Context */}
      <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs md:text-sm leading-relaxed font-sans italic">
        "{dilemma.narrative}"
      </div>

      {/* INTERNAL EGO VOICES CABINET (Bản Ngã Tranh Luận) */}
      <div className="rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] p-2.5 transition">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] normal-case font-sans tabular-nums font-bold text-[var(--text-secondary)] flex items-center gap-1">
            <Brain className="w-3 h-3 text-amber-500" /> Trực Giác Nội Tâm
          </span>
          <button
            onClick={() => setShowMindVoices(!showMindVoices)}
            className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-0.5"
          >
            {showMindVoices ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showMindVoices && (
          <div className="flex flex-col gap-2 pt-1 animate-in fade-in duration-200">
            {/* Voice Selectors */}
            <div className="grid grid-cols-3 gap-1.5 text-[12px]">
              <button
                onClick={() => setActiveVoice('logic')}
                className={`py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 border transition ${
                  activeVoice === 'logic'
                    ? 'bg-teal-500/15 border-teal-500/40 text-teal-700 dark:text-teal-300 font-bold'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Brain className="w-3 h-3 text-teal-500" />
                <span className="truncate">Lý Trí</span>
              </button>

              <button
                onClick={() => setActiveVoice('heart')}
                className={`py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 border transition ${
                  activeVoice === 'heart'
                    ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-500/60 dark:border-rose-400/60 text-rose-900 dark:text-rose-200 font-bold'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Heart className="w-3 h-3 text-rose-400" />
                <span className="truncate">Trái Tim</span>
              </button>

              <button
                onClick={() => setActiveVoice('primal')}
                className={`py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 border transition ${
                  activeVoice === 'primal'
                    ? 'bg-teal-100 dark:bg-teal-950/80 border-teal-600/60 dark:border-teal-400/60 text-teal-900 dark:text-teal-200 font-bold'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-teal-400" />
                <span className="truncate">Bản Năng</span>
              </button>
            </div>

            {/* Active Voice Whisper */}
            <div className="text-[12px] font-sans italic text-[var(--text-secondary)] p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-start gap-2">
              <span className="text-xs">
                {activeVoice === 'logic' ? '💡' : activeVoice === 'heart' ? '❤️' : '⚡'}
              </span>
              <span>
                {activeVoice === 'logic' ? voices.logic : activeVoice === 'heart' ? voices.heart : voices.primal}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Smart Unspent AP Warning Banner */}
      {pendingUnspentWarning && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 text-amber-900 dark:text-amber-200 shadow-xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between gap-2 border-b border-amber-500/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <div className="font-bold text-amber-950 dark:text-amber-100 text-xs md:text-sm">
                  Năm nay bạn vẫn còn <span className="text-amber-800 dark:text-amber-400 font-extrabold font-mono text-sm">{pendingUnspentWarning.unspentAP} AP</span> chưa dùng!
                </div>
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  Hành động đang chọn: <strong className="text-amber-950 dark:text-amber-200">{pendingUnspentWarning.option.action_title || pendingUnspentWarning.option.label}</strong>
                </div>
              </div>
            </div>
            <button
              onClick={() => setPendingUnspentWarning(null)}
              className="text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white p-1 rounded-lg"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Tùy chọn 1: Đầu tư 1 AP vào lựa chọn này */}
            <button
              type="button"
              disabled={pendingUnspentWarning.unspentAP < 1}
              onClick={() => {
                const opt = pendingUnspentWarning.option;
                const newInvested = (pendingUnspentWarning.investedAp || 0) + 1;
                setInvestedApMap(prev => ({ ...prev, [opt.id]: newInvested }));
                proceedOptionExecution(opt, newInvested);
              }}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-500/30 hover:from-amber-600/50 hover:to-amber-500/50 border border-amber-400/60 text-amber-950 dark:text-white font-bold text-left transition flex flex-col justify-between group active:scale-95 shadow-md"
            >
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold mb-1">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>⚡ Đầu tư 1 AP</span>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-normal leading-tight">
                Vào lựa chọn này (+15% tỷ lệ thành công)
              </span>
            </button>

            {/* Tùy chọn 2: Chuyển hóa thành Dưỡng Sinh */}
            <button
              type="button"
              onClick={() => {
                const opt = pendingUnspentWarning.option;
                proceedOptionExecution(opt, pendingUnspentWarning.investedAp);
              }}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 border border-emerald-400/60 text-emerald-950 dark:text-white font-bold text-left transition flex flex-col justify-between group active:scale-95 shadow-md"
            >
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold mb-1">
                <span>🌿 Chuyển hóa Dưỡng Sinh</span>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-normal leading-tight">
                (+{pendingUnspentWarning.unspentAP * 2} HP) & Chốt Năm
              </span>
            </button>

            {/* Tùy chọn 3: Quay lại dùng AP */}
            <button
              type="button"
              onClick={() => setPendingUnspentWarning(null)}
              className="p-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-left transition flex flex-col justify-between active:scale-95 shadow-md"
            >
              <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-bold mb-1">
                <span>↩️ Quay lại dùng AP</span>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-normal leading-tight">
                Dùng nốt AP ở Action Hub bên dưới
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: Roleplay Choice Buttons with Stances & Fate Roll */}
      {activeTab === 'standard' && (
        <div className="space-y-2.5">
          {dilemma.options.map((option, idx) => {
            const actionText = option.action_title || option.label || "Hành động";
            const consequence = option.consequence_hint || option.effects_hint || "Hệ quả sẽ được ghi nhận vào dòng thời gian.";
            const risk = getRiskLabel(option.risk_percent);
            const costAp = option.cost_ap !== undefined ? option.cost_ap : 1;
            const isCurrentlyInvested = (investedApMap[option.id] || 0) > 0;
            const totalRequiredAp = costAp + (investedApMap[option.id] || 0);
            const hasEnoughAP = actionPoints >= totalRequiredAp;
            const isDisabled = (!hasEnoughAP && !isCurrentlyInvested) || isLoading;
            const canInvestMore = actionPoints >= costAp + 1;

            const stance = getOptionStance(option, idx);

            return (
              <div
                key={option.id}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 bg-[var(--bg-card-subtle)] hover:bg-[rgba(255,255,255,0.04)] border-[var(--border-subtle)] hover:border-[var(--border-highlight)] group`}
              >
                {/* Left: Button Action Title & Consequence Hint */}
                <button
                  disabled={isDisabled}
                  onClick={() => handleOptionClick(option)}
                  className="flex-1 text-left min-w-0 pr-2"
                >
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    {/* Hotkey badge */}
                    {idx < 3 && (
                      <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-amber-800 dark:text-amber-300 font-mono text-xs font-bold group-hover:border-[var(--border-highlight)] dark:group-hover:text-amber-200 shadow-sm transition">
                        {idx + 1}
                      </kbd>
                    )}

                    {/* Roleplay Stance Badge */}
                    <span className={`text-[12px] font-bold normal-case tracking-normal px-2 py-0.5 rounded-md border ${stance.color}`}>
                      {stance.tag}
                    </span>

                    {(stance.needsRoll || isCurrentlyInvested) && (
                      <span className="text-[12px] font-sans tabular-nums text-amber-800 dark:text-amber-400 flex items-center gap-0.5">
                        <Dices className="w-2.5 h-2.5" /> Thử thách
                      </span>
                    )}

                    <Tooltip content={actionText}>
                      <span className="text-xs md:text-sm font-bold text-[var(--text-primary)] group-hover:text-amber-800 dark:group-hover:text-amber-200 transition truncate cursor-help">
                        {actionText}
                      </span>
                    </Tooltip>
                  </div>

                  {consequence && (
                    <Tooltip content={`Dự báo hệ quả: ${consequence}`}>
                      <div className="text-[12px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-sans truncate cursor-help">
                        ↳ {consequence}
                      </div>
                    </Tooltip>
                  )}
                </button>

                {/* Right: Info Tooltip + Risk Badge + AP Cost */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end">
                  {/* Toggle [⚡ +1 AP Trợ Lực] button */}
                  <button
                    type="button"
                    disabled={isLoading || (!isCurrentlyInvested && !canInvestMore)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrentlyInvested) {
                        setInvestedApMap(prev => ({ ...prev, [option.id]: 0 }));
                      } else if (canInvestMore) {
                        setInvestedApMap(prev => ({ ...prev, [option.id]: 1 }));
                      }
                    }}
                    className={`px-2 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                      isCurrentlyInvested
                        ? 'bg-amber-500/25 border-amber-500 text-amber-800 dark:text-amber-300 shadow-md shadow-amber-500/25 animate-pulse'
                        : canInvestMore
                        ? 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-amber-500/50 hover:text-amber-700 dark:hover:text-amber-300 active:scale-95'
                        : 'bg-[var(--bg-card-subtle)]/50 border-[var(--border-subtle)] text-slate-600 dark:text-slate-600 cursor-not-allowed opacity-70 dark:opacity-40'
                    }`}
                    title={
                      isCurrentlyInvested
                        ? "Đang trợ lực +1 AP (Bấm để hủy)"
                        : canInvestMore
                        ? "Bấm để đầu tư +1 AP trợ lực, tăng tỷ lệ thành công và hạn chế rủi ro"
                        : "Không đủ AP để trợ lực thêm"
                    }
                  >
                    <Zap className={`w-3 h-3 ${isCurrentlyInvested ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span className="hidden sm:inline">{isCurrentlyInvested ? 'Đã Trợ Lực +1 AP' : '+1 AP Trợ Lực'}</span>
                    <span className="sm:hidden">{isCurrentlyInvested ? '+1 AP' : '+1 AP'}</span>
                  </button>

                  <Tooltip content={<div className="font-sans italic text-slate-700 dark:text-slate-300">{consequence}</div>}>
                    <button className="text-slate-600 dark:text-slate-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition p-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>

                  <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full border ${risk.color}`}>
                    {risk.text}
                  </span>

                  {costAp > 0 && (
                    <span className={`text-[12px] font-sans tabular-nums font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border ${
                      !hasEnoughAP
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-400'
                        : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-amber-800 dark:text-amber-400'
                    }`}>
                      <Zap className={`w-3 h-3 ${hasEnoughAP ? 'fill-current' : ''}`} />
                      {totalRequiredAp} AP
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Open-Text Freeform AI Dungeon Master Resolution */}
      {activeTab === 'custom' && (
        <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] flex flex-col gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tự do nhập vai. Bạn sẽ xử lý tình huống này thế nào?
            </span>
            <span className="text-[12px] font-sans tabular-nums text-amber-800 dark:text-amber-400 flex items-center gap-1 bg-[var(--bg-card)] px-2 py-0.5 rounded-lg border border-[var(--border-subtle)]">
              <Zap className="w-3 h-3 fill-amber-500 text-amber-500" /> Tiêu hao: 1 AP
            </span>
          </div>

          <textarea
            value={customActionText}
            onChange={(e) => setCustomActionText(e.target.value)}
            disabled={isResolving || !!customResult}
            rows={3}
            placeholder="Tự viết hành động của bạn... (Ví dụ: Tôi nhẹ nhàng ôm lấy cha mẹ, xin một năm nghỉ phép để tự mình lập nghiệp, đồng thời bảo đảm sẽ hoàn trả vốn...)"
            className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-amber-400 rounded-xl p-3 text-xs md:text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none transition resize-none custom-scrollbar"
          />

          {/* Inspirational Prompt Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-[12px]">
            <span className="text-[var(--text-secondary)] font-sans tabular-nums">Gợi ý:</span>
            {[
              "Đàm phán chia đôi lợi ích",
              "Khéo léo xin thêm thời gian",
              "Ủy quyền cho người thân bảo lãnh",
              "Dứt khoát từ chối để giữ an toàn"
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setCustomActionText(chip)}
                className="px-2 py-0.5 rounded-md bg-[var(--bg-card)] hover:bg-amber-500/10 text-[var(--text-secondary)] hover:text-amber-700 dark:hover:text-amber-300 border border-[var(--border-subtle)] hover:border-amber-400/50 transition truncate"
              >
                {chip}
              </button>
            ))}
          </div>

          {resolveError && (
            <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{resolveError}</span>
            </div>
          )}

          {/* Custom Action Result Feedback */}
          {customResult && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-[var(--text-primary)] animate-in fade-in duration-300">
              <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Phán Quyết Định Mệnh
              </div>
              <p className="font-sans italic leading-relaxed text-[var(--text-secondary)]">
                "{customResult.story_outcome || customResult.message || "Hành động độc bản của bạn đã được ghi nhận."}"
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[12px] text-[var(--text-secondary)] font-sans italic">
              AI Game Master sẽ phân giải xác suất dựa trên chỉ số nhân vật của bạn.
            </span>
            <button
              onClick={handleSendCustomAction}
              disabled={isResolving || !customActionText.trim() || !!customResult}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isResolving || !customActionText.trim() || !!customResult
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 active:scale-95'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isResolving ? 'Đang phán xử...' : 'Thực Thi Quyết Định'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

