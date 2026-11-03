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
  ChevronUp
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
  onSelectOption: (optionId: string) => void;
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

  // Active Fate Dice Roll Stage
  const [rollingOption, setRollingOption] = useState<Option | null>(null);

  // Mind Voices Expansion State
  const [activeVoice, setActiveVoice] = useState<'logic' | 'heart' | 'primal'>('logic');
  const [showMindVoices, setShowMindVoices] = useState<boolean>(true);

  if (!dilemma) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] text-slate-500 backdrop-blur-md">
        <Compass className="w-7 h-7 animate-spin text-indigo-400/80 mb-2" />
        <p className="text-xs uppercase font-sans font-medium text-slate-400">Đang điều phối bước ngoặt cuộc đời...</p>
      </div>
    );
  }

  // If player is currently rolling fate dice for an option, show the FateDiceCheck stage
  if (rollingOption) {
    return (
      <FateDiceCheck
        option={rollingOption}
        character={character}
        dilemmaTitle={dilemma.title}
        onComplete={() => {
          const optId = rollingOption.id;
          setRollingOption(null);
          onSelectOption(optId);
        }}
        onCancel={() => setRollingOption(null)}
        isLoading={isLoading}
      />
    );
  }

  const getRiskLabel = (risk: number) => {
    if (risk >= 65) return { text: `${risk}% rủi ro`, color: "text-rose-400 border-rose-500/30 bg-rose-500/10" };
    if (risk >= 35) return { text: `${risk}% rủi ro`, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
    return { text: `An toàn`, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
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
        color: 'text-amber-300 border-amber-500/40 bg-amber-500/15',
        needsRoll: true
      };
    }
    if (text.includes('ngủ') || text.includes('an toàn') || text.includes('rút lui') || text.includes('tiết kiệm') || text.includes('chăm sóc')) {
      return {
        tag: '⚡ Thận Trọng / Tự Vệ',
        color: 'text-teal-300 border-teal-500/40 bg-teal-500/15',
        needsRoll: option.risk_percent >= 25
      };
    }
    if (text.includes('giúp') || text.includes('chia sẻ') || text.includes('mẹ') || text.includes('bạn') || text.includes('thân')) {
      return {
        tag: '❤️ Thấu Cảm & Tình Thân',
        color: 'text-rose-300 border-rose-500/40 bg-rose-500/15',
        needsRoll: option.risk_percent >= 25
      };
    }
    if (index === 0) {
      return {
        tag: '🧠 Lý Trí & Quyết Đoán',
        color: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/15',
        needsRoll: option.risk_percent >= 20
      };
    }
    return {
      tag: '🎭 Khôn Khéo & Tùy Cơ',
      color: 'text-purple-300 border-purple-500/40 bg-purple-500/15',
      needsRoll: option.risk_percent >= 25
    };
  };

  const handleOptionClick = (option: Option) => {
    const stance = getOptionStance(option, 0);
    // If option has risk or is high stake, trigger the Fate Dice Roll stage
    if (stance.needsRoll || option.risk_percent >= 25 || (option.cost_ap && option.cost_ap >= 2)) {
      setRollingOption(option);
    } else {
      onSelectOption(option.id);
    }
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
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl relative overflow-hidden backdrop-blur-lg flex flex-col gap-3">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Sân Khấu Tâm Thức & Biến Cố
          </span>
          {characterAge !== undefined && (
            <span className="text-xs font-mono font-bold text-amber-400">
              Năm {characterAge} Tuổi
            </span>
          )}
        </div>

        {/* Tab Switcher: RPG Options vs Open-Text AI */}
        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 text-[11px]">
          <button
            onClick={() => { setActiveTab('standard'); setCustomResult(null); }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              activeTab === 'standard'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎭 Thái Độ Nhập Vai
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition ${
              activeTab === 'custom'
                ? 'bg-purple-600 text-white shadow-sm font-bold'
                : 'text-purple-300 hover:text-purple-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Tự Do Hành Động</span>
          </button>
        </div>
      </div>

      {/* Atmospheric Title */}
      <h2 className="text-base md:text-lg font-bold text-white tracking-tight leading-snug">
        {displayTitle}
      </h2>

      {/* Narrative Context */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-slate-200 text-xs md:text-sm leading-relaxed font-serif italic">
        "{dilemma.narrative}"
      </div>

      {/* INTERNAL EGO VOICES CABINET (Bản Ngã Tranh Luận) */}
      <div className="rounded-2xl bg-slate-950/70 border border-indigo-500/20 p-2.5 transition">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9.5px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1">
            <Brain className="w-3 h-3 text-indigo-400" /> Bản Ngã Tranh Luận (Internal Voices)
          </span>
          <button
            onClick={() => setShowMindVoices(!showMindVoices)}
            className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5"
          >
            {showMindVoices ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showMindVoices && (
          <div className="flex flex-col gap-2 pt-1 animate-in fade-in duration-200">
            {/* Voice Selectors */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                onClick={() => setActiveVoice('logic')}
                className={`py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 border transition ${
                  activeVoice === 'logic'
                    ? 'bg-indigo-950/90 border-indigo-400 text-indigo-200 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Brain className="w-3 h-3 text-indigo-400" />
                <span className="truncate">Lý Trí</span>
              </button>

              <button
                onClick={() => setActiveVoice('heart')}
                className={`py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 border transition ${
                  activeVoice === 'heart'
                    ? 'bg-rose-950/90 border-rose-400 text-rose-200 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Heart className="w-3 h-3 text-rose-400" />
                <span className="truncate">Trái Tim</span>
              </button>

              <button
                onClick={() => setActiveVoice('primal')}
                className={`py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 border transition ${
                  activeVoice === 'primal'
                    ? 'bg-teal-950/90 border-teal-400 text-teal-200 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-teal-400" />
                <span className="truncate">Bản Năng</span>
              </button>
            </div>

            {/* Active Voice Whisper */}
            <div className="text-[11px] font-serif italic text-slate-300 p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2">
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

      {/* TAB 1: Roleplay Choice Buttons with Stances & Fate Roll */}
      {activeTab === 'standard' && (
        <div className="space-y-2.5">
          {dilemma.options.map((option, idx) => {
            const actionText = option.action_title || option.label || "Hành động";
            const consequence = option.consequence_hint || option.effects_hint || "Hệ quả sẽ được ghi nhận vào dòng thời gian.";
            const risk = getRiskLabel(option.risk_percent);
            const costAp = option.cost_ap !== undefined ? option.cost_ap : 1;
            const hasEnoughAP = actionPoints >= costAp;
            const isDisabled = !hasEnoughAP || isLoading;

            const stance = getOptionStance(option, idx);

            return (
              <div
                key={option.id}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 bg-slate-950/60 hover:bg-slate-850 border-slate-800 hover:border-indigo-500/60 group`}
              >
                {/* Left: Button Action Title & Consequence Hint */}
                <button
                  disabled={isDisabled}
                  onClick={() => handleOptionClick(option)}
                  className="flex-1 text-left min-w-0 pr-2"
                >
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    {/* Roleplay Stance Badge */}
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${stance.color}`}>
                      {stance.tag}
                    </span>

                    {stance.needsRoll && (
                      <span className="text-[9px] font-mono text-amber-400 flex items-center gap-0.5">
                        <Dices className="w-2.5 h-2.5" /> Thử thách
                      </span>
                    )}

                    <span className="text-xs md:text-sm font-bold text-white group-hover:text-indigo-200 transition truncate">
                      {actionText}
                    </span>
                  </div>

                  {consequence && (
                    <div className="text-[10.5px] text-slate-400 group-hover:text-slate-300 font-sans truncate">
                      ↳ {consequence}
                    </div>
                  )}
                </button>

                {/* Right: Info Tooltip + Risk Badge + AP Cost */}
                <div className="flex items-center gap-2 shrink-0">
                  <Tooltip content={<div className="font-serif italic text-slate-300">{consequence}</div>}>
                    <button className="text-slate-500 hover:text-indigo-300 transition p-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>

                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${risk.color}`}>
                    {risk.text}
                  </span>

                  {costAp > 0 && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border ${
                      !hasEnoughAP
                        ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                        : 'bg-slate-900 border-slate-700 text-amber-400'
                    }`}>
                      <Zap className={`w-3 h-3 ${hasEnoughAP ? 'fill-current' : ''}`} />
                      {costAp} AP
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
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/40 flex flex-col gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Tự do nhập vai. Bạn sẽ xử lý tình huống này thế nào?
            </span>
            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
              <Zap className="w-3 h-3 fill-amber-400" /> Tiêu hao: 1 AP
            </span>
          </div>

          <textarea
            value={customActionText}
            onChange={(e) => setCustomActionText(e.target.value)}
            disabled={isResolving || !!customResult}
            rows={3}
            placeholder="Tự viết hành động của bạn... (Ví dụ: Tôi nhẹ nhàng ôm lấy cha mẹ, xin một năm nghỉ phép để tự mình lập nghiệp, đồng thời bảo đảm sẽ hoàn trả vốn...)"
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-purple-400 rounded-xl p-3 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none transition resize-none custom-scrollbar"
          />

          {/* Inspirational Prompt Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            <span className="text-slate-500 font-mono">Gợi ý:</span>
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
                className="px-2 py-0.5 rounded-md bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 transition truncate"
              >
                {chip}
              </button>
            ))}
          </div>

          {resolveError && (
            <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{resolveError}</span>
            </div>
          )}

          {/* Custom Action Result Feedback */}
          {customResult && (
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs text-purple-200 animate-in fade-in duration-300">
              <div className="font-bold text-amber-300 flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Phán Quyết Định Mệnh
              </div>
              <p className="font-serif italic leading-relaxed text-slate-300">
                "{customResult.story_outcome || customResult.message || "Hành động độc bản của bạn đã được ghi nhận."}"
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10.5px] text-slate-400 font-sans italic">
              AI Game Master sẽ phân giải xác suất dựa trên chỉ số nhân vật của bạn.
            </span>
            <button
              onClick={handleSendCustomAction}
              disabled={isResolving || !customActionText.trim() || !!customResult}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isResolving || !customActionText.trim() || !!customResult
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md active:scale-95'
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
