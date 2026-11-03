'use client';

import React, { useState } from 'react';
import {
  Users,
  Zap,
  MessageSquare,
  Sparkles,
  Send,
  Dices,
  Shield,
  Heart,
  Briefcase,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import FateDiceCheck from './FateDiceCheck';

interface NPCDialogCardProps {
  dilemma: any;
  characterVisuals: any;
  characterName: string;
  characterAge: number;
  character?: any;
  actionPoints: number;
  onSelectOption: (optionId: string) => void;
  onCustomResolve?: (actionText: string) => Promise<any>;
  isLoading: boolean;
}

export default function NPCDialogCard({
  dilemma,
  characterVisuals,
  characterName,
  characterAge,
  character,
  actionPoints,
  onSelectOption,
  onCustomResolve,
  isLoading
}: NPCDialogCardProps) {
  const [activeTab, setActiveTab] = useState<'dialogue' | 'custom'>('dialogue');
  const [customSpeechText, setCustomSpeechText] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [customResult, setCustomResult] = useState<any>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Active Fate Dice Roll for Persuasion Checks
  const [rollingOption, setRollingOption] = useState<any | null>(null);

  const npc = dilemma.active_npc || { name: "Người quen", role: "Nhân vật xã hội", affinity: 50 };
  const affinityColor =
    npc.affinity >= 60
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : npc.affinity <= -20
      ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
      : "text-amber-400 bg-amber-500/10 border-amber-500/30";

  // If rolling fate dice for persuasion
  if (rollingOption) {
    return (
      <FateDiceCheck
        option={rollingOption}
        character={character}
        dilemmaTitle={`Thuyết Phục: ${npc.name} (${npc.role})`}
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

  // Dialogue Stance helper
  const getDialogueStance = (option: any, index: number) => {
    const text = (option.action_title || option.label || '').toLowerCase();
    const costAp = option.cost_ap !== undefined ? option.cost_ap : 1;

    if (costAp >= 2 || text.includes('thuyết phục') || text.includes('ép') || text.includes('thách thức')) {
      return {
        tag: '🎭 Thuyết Phục / Mạo Hiểm',
        icon: <Dices className="w-3 h-3 text-amber-400" />,
        color: 'text-amber-300 border-amber-500/40 bg-amber-500/15',
        needsRoll: true
      };
    }
    if (text.includes('sòng phẳng') || text.includes('tiền') || text.includes('hợp đồng') || text.includes('lợi ích')) {
      return {
        tag: '💼 Sòng Phẳng & Thực Dụng',
        icon: <Briefcase className="w-3 h-3 text-indigo-400" />,
        color: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/15',
        needsRoll: false
      };
    }
    if (text.includes('nhượng bộ') || text.includes('rút lui') || text.includes('im lặng') || text.includes('từ chối')) {
      return {
        tag: '🛡️ Thận Trọng & Thăm Dò',
        icon: <Shield className="w-3 h-3 text-teal-400" />,
        color: 'text-teal-300 border-teal-500/40 bg-teal-500/15',
        needsRoll: false
      };
    }
    return {
      tag: '🤝 Chân Thành & Hợp Tác',
      icon: <Heart className="w-3 h-3 text-rose-400" />,
      color: 'text-rose-300 border-rose-500/40 bg-rose-500/15',
      needsRoll: false
    };
  };

  const handleOptionClick = (option: any, index: number) => {
    const stance = getDialogueStance(option, index);
    if (stance.needsRoll || (option.cost_ap && option.cost_ap >= 2) || (option.risk_percent && option.risk_percent >= 30)) {
      setRollingOption(option);
    } else {
      onSelectOption(option.id);
    }
  };

  const handleSendCustomSpeech = async () => {
    if (!customSpeechText.trim() || isResolving || !onCustomResolve) return;
    if (actionPoints < 1) {
      setResolveError("Cần tối thiểu 1 AP để thực hiện đàm phán tự do!");
      return;
    }

    try {
      setIsResolving(true);
      setResolveError(null);
      const res = await onCustomResolve(`Đối thoại với ${npc.name}: "${customSpeechText}"`);
      setCustomResult(res);
    } catch (err: any) {
      setResolveError(err.message || "Đàm phán thất bại.");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="bg-slate-900/95 border border-indigo-500/40 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col gap-4">
      
      {/* Top Header & Mode Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-sans font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Sân Khấu Đối Thoại Nhân Vật
        </span>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 text-[11px]">
          <button
            onClick={() => { setActiveTab('dialogue'); setCustomResult(null); }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              activeTab === 'dialogue'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💬 Phản Hồi Có Sẵn
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
            <span>Trực Tiếp Lên Tiếng</span>
          </button>
        </div>
      </div>

      {/* Split Duel Faces Header */}
      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
        {/* Left Side: Player */}
        <div className="flex items-center gap-3 pr-2 border-r border-slate-800">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden border border-slate-700 shrink-0 bg-slate-900 shadow-md">
            <img src={characterVisuals?.portrait_url || '/placeholder.png'} alt="You" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase truncate">BẠN</div>
            <div className="text-xs md:text-sm font-bold text-white truncate">{characterName}</div>
            <div className="text-[10px] text-slate-400 font-sans">{characterAge} tuổi</div>
          </div>
        </div>

        {/* Right Side: NPC */}
        <div className="flex items-center gap-3 pl-1">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden border border-indigo-500/50 shrink-0 bg-indigo-950/40 flex items-center justify-center text-indigo-300 font-bold text-xl shadow-md font-sans">
            {npc.name ? npc.name.charAt(0) : 'N'}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-sans text-slate-400 truncate">{npc.role}</div>
            <div className="text-xs md:text-sm font-bold text-white truncate">{npc.name}</div>
            <span className={`text-[9.5px] font-sans px-2 py-0.2 rounded-md border inline-block mt-0.5 ${affinityColor}`}>
              Thiện cảm: <span className="font-mono">{npc.affinity > 0 ? `+${npc.affinity}` : npc.affinity}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Title & Speech Bubble */}
      <div>
        <h2 className="text-base md:text-lg font-bold text-white mb-2 tracking-tight">
          {dilemma.title}
        </h2>

        {/* Speech Bubble */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-slate-200 text-xs md:text-sm leading-relaxed font-serif italic relative">
          <span className="text-indigo-400 font-bold mr-1">"{npc.name}":</span>
          "{dilemma.narrative}"
        </div>
      </div>

      {/* TAB 1: Dialogue Choices with Stance & Fate Roll */}
      {activeTab === 'dialogue' && (
        <div className="space-y-2.5">
          {dilemma.options.map((option: any, idx: number) => {
            const hasAP = actionPoints >= (option.cost_ap || 1);
            const isDisabled = !hasAP || isLoading;
            const stance = getDialogueStance(option, idx);

            return (
              <button
                key={option.id}
                disabled={isDisabled}
                onClick={() => handleOptionClick(option, idx)}
                className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 ${
                  isDisabled
                    ? 'bg-slate-950/40 border-slate-800/40 opacity-40 cursor-not-allowed'
                    : 'bg-slate-950/60 hover:bg-slate-800/90 border-slate-800 hover:border-indigo-400 active:scale-[0.99] group'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${stance.color}`}>
                        {stance.icon}
                        <span>{stance.tag}</span>
                      </span>

                      {stance.needsRoll && (
                        <span className="text-[9px] font-mono text-amber-400 flex items-center gap-0.5">
                          <Dices className="w-2.5 h-2.5" /> Gieo Xúc Xắc
                        </span>
                      )}

                      <span className="text-xs md:text-sm font-bold text-white group-hover:text-indigo-200 transition truncate">
                        {option.action_title || option.label}
                      </span>
                    </div>

                    <div className="text-[10.5px] text-slate-400 mt-0.5 truncate">
                      ↳ {option.consequence_hint || option.effects_hint || "Lời nói định hình thái độ đối phương."}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-amber-400" /> {option.cost_ap || 1} AP
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* TAB 2: Direct Speech Freeform DM Input */}
      {activeTab === 'custom' && (
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/40 flex flex-col gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Bạn muốn nói gì hoặc đưa ra điều kiện gì với {npc.name}?
            </span>
            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
              <Zap className="w-3 h-3 fill-amber-400" /> Tiêu hao: 1 AP
            </span>
          </div>

          <textarea
            value={customSpeechText}
            onChange={(e) => setCustomSpeechText(e.target.value)}
            disabled={isResolving || !!customResult}
            rows={3}
            placeholder={`Trực tiếp lên tiếng với ${npc.name}... (Ví dụ: "Tôi hiểu hoàn cảnh của anh, nhưng chúng ta hãy chia đôi lợi nhuận hợp đồng và ký cam kết bảo mật...")`}
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-purple-400 rounded-xl p-3 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none transition resize-none custom-scrollbar"
          />

          {/* Dialogue suggestion chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            <span className="text-slate-500 font-mono">Gợi ý phát ngôn:</span>
            {[
              `"Tôi đồng ý giúp, nhưng anh phải giữ bí mật"`,
              `"Hãy cho tôi xem giấy tờ và bằng chứng trước"`,
              `"Chúng ta bắt tay hợp tác cùng có lợi nhé"`
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setCustomSpeechText(chip)}
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

          {customResult && (
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs text-purple-200 animate-in fade-in duration-300">
              <div className="font-bold text-amber-300 flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Phản Hồi Từ {npc.name}
              </div>
              <p className="font-serif italic leading-relaxed text-slate-300">
                "{customResult.story_outcome || customResult.message || `${npc.name} đã lắng nghe và phản ứng theo lời nói của bạn.`}"
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10.5px] text-slate-400 font-sans italic">
              Lời nói chân thật và tài hùng biện sẽ quyết định mức độ thiện cảm.
            </span>
            <button
              onClick={handleSendCustomSpeech}
              disabled={isResolving || !customSpeechText.trim() || !!customResult}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isResolving || !customSpeechText.trim() || !!customResult
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md active:scale-95'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isResolving ? 'Đang hồi đáp...' : 'Gửi Lời Đối Thoại'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
