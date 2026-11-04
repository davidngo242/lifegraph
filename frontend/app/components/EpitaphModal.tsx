'use client';

import React, { useState } from 'react';
import { Skull, Sparkles, UserCheck, RotateCcw, Film, Home, X, Layers, AlertTriangle } from 'lucide-react';
import DeathRecapVideoModal from './DeathRecapVideoModal';
import LifeTarotCardModal from './LifeTarotCardModal';

interface EpitaphModalProps {
  name: string;
  age: number;
  cause: string;
  historyLength: number;
  hasChildren: boolean;
  childrenList?: any[];
  karma: number;
  personalityFlags?: string[];
  historyLog?: any[];
  timelineSnapshots?: any[];
  character?: any;
  onContinueAsChild: (child: any) => void;
  onEnterRebirthQueue: () => void;
  onReturnHome?: () => void;
}

export default function EpitaphModal({
  name,
  age,
  cause,
  historyLength,
  hasChildren,
  childrenList = [],
  karma,
  personalityFlags = [],
  historyLog = [],
  timelineSnapshots = [],
  character,
  onContinueAsChild,
  onEnterRebirthQueue,
  onReturnHome
}: EpitaphModalProps) {
  const [showRecapModal, setShowRecapModal] = useState<boolean>(false);
  const [showTarotCard, setShowTarotCard] = useState<boolean>(false);
  const [isAscendingNirvana, setIsAscendingNirvana] = useState<boolean>(false);
  const [nirvanaMessage, setNirvanaMessage] = useState<string | null>(null);
  const [nirvanaError, setNirvanaError] = useState<string | null>(null);

  const canAscendNirvana = (age >= 45 && karma >= 70) || Boolean(character?.life_aspiration_completed);

  const handleAscendNirvana = async () => {
    try {
      setIsAscendingNirvana(true);
      const res = await fetch('/api/game/rebirth/nirvana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đắc đạo thất bại");
      setNirvanaMessage(data.message || "Linh hồn bạn đã đắc đạo Niết Bàn, an trụ Đại Điện Tiên Hiền.");
      setTimeout(() => {
        if (onReturnHome) onReturnHome();
        else window.location.reload();
      }, 2500);
    } catch (err: any) {
      setNirvanaError(err.message || "Chưa đủ duyên lành Niết Bàn.");
      setIsAscendingNirvana(false);
    }
  };

  const charData = character || {
    name,
    age,
    karma,
    hidden_flags: personalityFlags,
    history_log: historyLog
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-700">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Close / Return Home Button */}
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition z-20"
              title="Trở về Trang Chủ Gia Phả"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Somber lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-950/30 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-5 text-slate-400">
            <Skull className="w-8 h-8 text-rose-500/80 animate-pulse" />
          </div>

          <span className="text-[12px] font-sans font-semibold tracking-wide normal-case text-slate-500 block mb-1">
            KẾT THÚC MỘT KIẾP NGƯỜI
          </span>

          <h2 className="text-2xl font-sans font-bold text-white mb-1">
            {name}
          </h2>
          
          <p className="text-sm font-sans font-medium text-indigo-400 mb-6">
            Hưởng thọ {age} tuổi
          </p>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 mb-6 text-left space-y-2 text-xs">
            <div className="text-slate-400">
              <span className="text-slate-500 font-sans font-medium">Biến cố cuối cùng:</span>
              <p className="text-slate-200 mt-0.5 font-sans italic text-sm">"{cause}"</p>
            </div>
            <div className="text-slate-400 pt-2 border-t border-slate-800/50 flex justify-between items-center">
              <span className="text-slate-500 font-sans font-medium">Tổng ngã rẽ cuộc đời:</span>
              <span className="font-sans tabular-nums text-slate-300 font-bold">{historyLength} quyết định</span>
            </div>
            <div className="text-slate-400 pt-1 flex justify-between items-center">
              <span className="text-slate-500 font-sans font-medium">Nghiệp lực tích lũy (Karma):</span>
              <span className="font-sans tabular-nums text-purple-400 font-bold">+{karma} Karma</span>
            </div>
          </div>

          {/* Action choices */}
          <div className="space-y-2.5">
            {/* Tarot Life Card Button */}
            <button
              onClick={() => setShowTarotCard(true)}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.98]"
            >
              <Layers className="w-4 h-4" />
              <span>Xuất Thẻ Bài Vận Mệnh (Tarot Card Chia Sẻ)</span>
            </button>

            {/* 15s Death Video Recap Button */}
            <button
              onClick={() => setShowRecapModal(true)}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 active:scale-[0.98]"
            >
              <Film className="w-4 h-4" />
              <span>Xem Thước Phim Dĩ Vãng (15s Video Recap)</span>
            </button>

            {/* Multi-generational Lineage Choices */}
            {hasChildren && childrenList.length > 0 && (
              <button
                onClick={() => onContinueAsChild(childrenList[0])}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 active:scale-[0.98]"
              >
                <UserCheck className="w-4 h-4" />
                <span>Truyền Thừa: Nhập Vai Vào Con ({childrenList[0]?.name || "Hậu duệ"})</span>
              </button>
            )}

            {/* Đắc Đạo Niết Bàn (Chỉ sáng khi đủ tuổi thọ & công đức thiện lành) */}
            {canAscendNirvana && !nirvanaMessage && (
              <button
                onClick={handleAscendNirvana}
                disabled={isAscendingNirvana}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/40 text-purple-200 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 active:scale-[0.98]"
              >
                <span>🕊️ {isAscendingNirvana ? "Đang Khai Quang Nhập Niết Bàn..." : "Đắc Đạo Niết Bàn (An Trụ Đại Điện Tiên Hiền)"}</span>
              </button>
            )}

            {nirvanaMessage && (
              <div className="p-3.5 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-200 text-xs text-center font-sans">
                ✨ {nirvanaMessage}
              </div>
            )}

            <button
              onClick={onEnterRebirthQueue}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-800/80 to-indigo-800/80 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Phòng Chờ Chuyển Kiếp (Xổ Số Nhân Phẩm Mới)</span>
            </button>

            {/* Nút Trở Về Trang Chủ Gia Phả */}
            {onReturnHome && (
              <button
                onClick={onReturnHome}
                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Home className="w-4 h-4 text-indigo-400" />
                <span>Trở Về Trang Chủ Gia Phả (Nghỉ Ngơi & Tưởng Niệm)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Render 15s Death Video Modal if opened */}
      {showRecapModal && (
        <DeathRecapVideoModal
          characterName={name}
          deathAge={age}
          deathCause={cause}
          historyLog={historyLog}
          timelineSnapshots={timelineSnapshots}
          personalityFlags={personalityFlags}
          karma={karma}
          onClose={() => setShowRecapModal(false)}
        />
      )}

      {/* Render Tarot Life Card Modal if opened */}
      {showTarotCard && (
        <LifeTarotCardModal
          character={charData}
          historyLog={historyLog}
          deathCause={cause}
          onClose={() => setShowTarotCard(false)}
        />
      )}

      {/* Nirvana Error Popup Modal */}
      {nirvanaError && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/50 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Thông Báo Đắc Đạo
              </h4>
              <button onClick={() => setNirvanaError(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {nirvanaError}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setNirvanaError(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

