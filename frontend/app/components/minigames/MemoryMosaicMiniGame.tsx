'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, AlertCircle, CheckCircle2, X, Play, ArrowRight } from 'lucide-react';

interface MemoryMosaicMiniGameProps {
  onComplete: (result: {
    status: 'success' | 'fair' | 'fail';
    score: number;
    summary: string;
  }) => void;
  onClose: () => void;
}

interface Card {
  id: number;
  pairId: number;
  emoji: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORIES = [
  { id: 1, emoji: '👵', label: 'Bóng Hình Mẹ' },
  { id: 2, emoji: '💍', label: 'Lễ Thành Hôn' },
  { id: 3, emoji: '👶', label: 'Con Đầu Lòng' },
  { id: 4, emoji: '🎓', label: 'Tốt Nghiệp' },
  { id: 5, emoji: '🏡', label: 'Ngôi Nhà Đầu' },
  { id: 6, emoji: '🌸', label: 'Mùa Xuân Xưa' },
];

export default function MemoryMosaicMiniGame({ onComplete, onClose }: MemoryMosaicMiniGameProps) {
  const [stage, setStage] = useState<'briefing' | 'playing' | 'result'>('briefing');
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(28);
  const [status, setStatus] = useState<'success' | 'fair' | 'fail'>('fair');
  const [isPeeking, setIsPeeking] = useState(false);

  // Initialize deck on start
  const startNewGame = () => {
    const deck: Card[] = [];
    let counter = 0;
    MEMORIES.forEach(mem => {
      deck.push({ id: counter++, pairId: mem.id, emoji: mem.emoji, label: mem.label, isFlipped: true, isMatched: false });
      deck.push({ id: counter++, pairId: mem.id, emoji: mem.emoji, label: mem.label, isFlipped: true, isMatched: false });
    });
    deck.sort(() => Math.random() - 0.5);

    setCards(deck);
    setSelectedCards([]);
    setMatchedPairs(0);
    setTimeLeft(28);
    setIsPeeking(true);
    setStage('playing');

    // 1.8s peek for memorizing, then flip face down
    setTimeout(() => {
      setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
      setIsPeeking(false);
    }, 1800);
  };

  // Timer Countdown in playing stage (starts after peeking)
  useEffect(() => {
    if (stage !== 'playing' || isPeeking) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, isPeeking, matchedPairs]);

  // Card Flip Logic
  const handleCardClick = (index: number) => {
    if (isPeeking || stage !== 'playing' || cards[index].isFlipped || cards[index].isMatched || selectedCards.length >= 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [idx1, idx2] = newSelected;
      if (cards[idx1].pairId === cards[idx2].pairId) {
        // Matched!
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[idx1].isMatched = true;
            updated[idx2].isMatched = true;
            return updated;
          });
          setSelectedCards([]);
          setMatchedPairs(m => {
            const next = m + 1;
            if (next === 6) {
              // Won all pairs!
              setStatus('success');
              setStage('result');
            }
            return next;
          });
        }, 350);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[idx1].isFlipped = false;
            updated[idx2].isFlipped = false;
            return updated;
          });
          setSelectedCards([]);
        }, 750);
      }
    }
  };

  const finishGame = () => {
    let finalStatus: 'success' | 'fair' | 'fail' = 'fair';
    if (matchedPairs === 6) finalStatus = 'success';
    else if (matchedPairs >= 4) finalStatus = 'fair';
    else finalStatus = 'fail';

    setStatus(finalStatus);
    setStage('result');
  };

  const handleReturnToLife = () => {
    const summary =
      status === 'success'
        ? "Tìm lại trọn vẹn 6 mảnh ghép thiêng liêng! Tâm trí hoàn toàn minh mẫn (+35 Karma, +10 Sinh lực, cờ 'Minh Mẫn Hoàng Hôn')."
        : status === 'fair'
        ? "Lưu giữ được những nụ cười ấm áp bên người thân (+20 Karma, +5 Sinh lực)."
        : "Ký ức nhạt nhòa dần theo năm tháng. Bình thản chấp nhận quy luật vô thường (-8 Sinh lực).";

    onComplete({
      status,
      score: Math.round((matchedPairs / 6) * 100),
      summary
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[var(--bg-card-subtle)] border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[var(--bg-card-subtle)] text-slate-400 hover:text-white hover:bg-slate-700 transition z-20 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 shrink-0 inline-flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/3 w-80 h-28 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ================================================================ */}
        {/* PHASE 1: BRIEFING & TUTORIAL SCREEN */}
        {/* ================================================================ */}
        {stage === 'briefing' && (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-amber-500/20 text-amber-800 dark:text-amber-300">
              🧠
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-sans tabular-nums px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                Minh Mẫn Hoàng Hôn (69+ Tuổi)
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Mảnh Ghép Ký Ức</h3>
            <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
              Những năm tháng hoàng hôn, sương mù tuổi già có thể làm phai mờ ký ức. Hãy tìm lại 6 cặp kỷ niệm thiêng liêng để bảo vệ sự minh mẫn tinh thần!
            </p>

            {/* How to play card */}
            <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 mb-4 text-left space-y-2.5 text-xs">
              <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 normal-case text-[12px] tracking-normal">
                <Sparkles className="w-4 h-4" /> Hướng Dẫn & Thao Tác:
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-slate-300">
                <span className="text-[12px] text-slate-300">
                  Khi bắt đầu, các lá bài sẽ hé lộ trong <strong>1.8 giây</strong> để bạn ghi nhớ. Sau đó, hãy nhấp chuột để lật và ghép đúng <strong>6 cặp ký ức</strong> trước khi hết thời gian!
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[12px] text-slate-400">
                🧩 <strong>Kỷ niệm bao gồm:</strong> Bóng Hình Mẹ, Lễ Thành Hôn, Con Đầu Lòng, Ngày Tốt Nghiệp, Ngôi Nhà Đầu Tiên, Mùa Xuân Xưa.
              </div>
            </div>

            {/* Stakes card */}
            <div className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3 mb-5 text-xs text-left grid grid-cols-2 gap-3">
              <div>
                <span className="text-emerald-800 dark:text-emerald-400 font-bold block mb-0.5">🌟 Minh Mẫn Tuyệt Đối (6/6):</span>
                <span className="text-[12px] text-slate-400">+35 Karma, +10 Sinh lực, Cờ &quot;Minh Mẫn Hoàng Hôn&quot;.</span>
              </div>
              <div>
                <span className="text-rose-700 dark:text-rose-400 font-bold block mb-0.5">⚠️ Ký Ức Phai Mờ:</span>
                <span className="text-[12px] text-slate-400">-8 Sinh lực khi sương mù tuổi già xâm lấn.</span>
              </div>
            </div>

            {/* Ready Button */}
            <button
              onClick={startNewGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs normal-case tracking-normal transition shadow-lg shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Ghép Ký Ức (28 Giây)</span>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 2: ACTIVE GAMEPLAY */}
        {/* ================================================================ */}
        {stage === 'playing' && (
          <div className="w-full flex flex-col items-center">
            {/* Header */}
            <div className="w-full flex items-center justify-between gap-2 pr-12 sm:pr-14 pb-3 border-b border-[var(--border-subtle)] mb-3 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 font-medium border border-cyan-500/20 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> Mảnh Ghép Trí Nhớ ({matchedPairs}/6 Cặp)
              </span>
              <div className="flex items-center gap-2 font-sans tabular-nums">
                <span className="text-slate-400">Thời gian:</span>
                <span className={`px-2.5 py-0.5 rounded font-bold ${
                  timeLeft <= 6 ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 animate-pulse' : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                }`}>
                  {isPeeking ? 'Đang Ghi Nhớ...' : `${timeLeft}s`}
                </span>
              </div>
            </div>

            {/* 12-Card Grid (4 cols x 3 rows) */}
            <div className="w-full grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-2 select-none">
              {cards.map((card, idx) => {
                const showFace = card.isFlipped || card.isMatched || isPeeking;

                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    disabled={card.isMatched || isPeeking}
                    className={`h-24 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ${
                      card.isMatched
                        ? 'bg-emerald-950/40 border-emerald-500/60 opacity-80 scale-95'
                        : showFace
                        ? 'bg-[var(--bg-card-subtle)] border-cyan-500/60 shadow-lg shadow-cyan-950/40 scale-100'
                        : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-cyan-500/40 hover:scale-105 cursor-pointer'
                    }`}
                  >
                    {showFace ? (
                      <>
                        <span className="text-2xl mb-1">{card.emoji}</span>
                        <span className="text-[12px] font-bold text-slate-200 text-center px-1 truncate w-full">
                          {card.label}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl text-slate-700 dark:text-slate-400 font-sans tabular-nums font-bold">?</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 3: RESULT SCREEN */}
        {/* ================================================================ */}
        {stage === 'result' && (
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-lg ${
                status === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-400 shadow-emerald-500/20'
                  : status === 'fair'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-700 dark:text-cyan-400 shadow-cyan-500/20'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-400 shadow-rose-500/20'
              }`}
            >
              {status === 'success' ? '🧠' : status === 'fair' ? '🌸' : '🌫️'}
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {status === 'success'
                ? "Tâm Trí Hoàn Toàn Minh Mẫn!"
                : status === 'fair'
                ? "Ký Ức Ấm Áp Vẹn Nguyên"
                : "Sương Mù Tuổi Già Xâm Lấn"}
            </h3>

            <div className="font-sans tabular-nums text-sm text-slate-300 mb-3">
              Mảnh ghép khôi phục: <strong className="text-white font-bold">{matchedPairs}/6 cặp</strong>
            </div>

            <p className="text-xs text-slate-300 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3.5 mb-5 max-w-md leading-relaxed">
              {status === 'success'
                ? "Tìm lại trọn vẹn 6 mảnh ghép thiêng liêng nhất của một đời người! Bạn nhận cờ ẩn 'Minh Mẫn Hoàng Hôn', thanh tịnh trước quy luật sinh tử (+35 Karma, +10 Sinh lực)."
                : status === 'fair'
                ? "Lưu giữ được phần lớn những nụ cười ấm áp bên người thân và mái ấm gia đình (+20 Karma, +5 Sinh lực)."
                : "Những ký ức xưa dần tan vào màn sương vô thường. Bạn bình thản chấp nhận quy luật tuổi xế chiều (-8 Sinh lực)."}
            </p>

            <button
              onClick={handleReturnToLife}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs normal-case tracking-normal transition shadow-lg shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Tiếp Tục Cuộc Đời</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

