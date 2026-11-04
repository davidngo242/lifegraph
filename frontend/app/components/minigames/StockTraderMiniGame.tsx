'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle2, AlertTriangle, ArrowRight, Play, X, Sparkles } from 'lucide-react';

interface StockTraderMiniGameProps {
  nationality?: string;
  currentCity?: string;
  targetLevel?: number;
  onComplete: (result: {
    status: 'success' | 'fair' | 'fail';
    score: number;
    summary: string;
  }) => void;
  onClose: () => void;
}

export default function StockTraderMiniGame({
  nationality = "Việt Nam",
  currentCity = "Hà Nội",
  targetLevel = 1,
  onComplete,
  onClose
}: StockTraderMiniGameProps) {
  const [stage, setStage] = useState<'briefing' | 'playing' | 'result'>('briefing');

  const initialDuration = targetLevel === 1 ? 14 : targetLevel === 2 ? 11 : 8;
  const tickerIntervalMs = targetLevel === 1 ? 340 : targetLevel === 2 ? 230 : 160;
  const targetSuccessProfit = targetLevel === 1 ? 12 : targetLevel === 2 ? 22 : 32;
  const targetFairProfit = targetLevel === 1 ? 3 : targetLevel === 2 ? 8 : 12;
  const volMin = targetLevel === 1 ? -12 : targetLevel === 2 ? -22 : -35;
  const volMax = targetLevel === 1 ? 15 : targetLevel === 2 ? 26 : 42;

  const getMarketName = () => {
    const nat = nationality.toLowerCase();
    if (nat.includes('ba lan') || nat.includes('poland')) return `Sàn Chứng Khoán GPW Warsaw (${currentCity})`;
    if (nat.includes('nhật') || nat.includes('japan')) return `Sàn Giao Dịch Tokyo TSE (${currentCity})`;
    if (nat.includes('mỹ') || nat.includes('hoa kỳ') || nat.includes('usa')) return `Sàn Phố Wall NYSE / S&P 500`;
    if (nat.includes('syria') || nat.includes('somalia') || nat.includes('haiti')) return `Chợ Đen Tỷ Giá & Vật Tư (${currentCity})`;
    return `Sàn Giao Dịch Chứng Khoán HOSE / HNX (${currentCity})`;
  };
  const marketName = getMarketName();
  const [timeLeft, setTimeLeft] = useState<number>(initialDuration);
  const [priceHistory, setPriceHistory] = useState<number[]>([100]);
  const [currentPrice, setCurrentPrice] = useState<number>(100);
  const [hasBought, setHasBought] = useState<boolean>(false);
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [profitPct, setProfitPct] = useState<number>(0);
  const [sold, setSold] = useState<boolean>(false);
  const [status, setStatus] = useState<'success' | 'fair' | 'fail'>('fair');

  // Spacebar to Buy / Sell
  useEffect(() => {
    if (stage !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        if (!hasBought) {
          handleBuy();
        } else if (!sold) {
          handleSell();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, hasBought, sold, currentPrice]);

  // Countdown timer in playing stage
  useEffect(() => {
    if (stage !== 'playing' || sold) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          finishTrade();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, sold, hasBought, buyPrice, currentPrice]);

  // Price ticker loop (generates volatile price swings with level-based speeds)
  useEffect(() => {
    if (stage !== 'playing' || sold) return;

    const ticker = setInterval(() => {
      setCurrentPrice(prev => {
        const volatility = (Math.random() * (volMax - volMin)) + volMin;
        const newP = Math.max(15, Math.round(prev * (1 + volatility / 100)));
        setPriceHistory(h => [...h.slice(-25), newP]);

        if (hasBought && buyPrice > 0) {
          const diff = Math.round(((newP - buyPrice) / buyPrice) * 100);
          setProfitPct(diff);
        }
        return newP;
      });
    }, tickerIntervalMs);

    return () => clearInterval(ticker);
  }, [stage, sold, hasBought, buyPrice, tickerIntervalMs, volMax, volMin]);

  const handleBuy = () => {
    if (hasBought || sold) return;
    setHasBought(true);
    setBuyPrice(currentPrice);
  };

  const handleSell = () => {
    if (!hasBought || sold) return;
    setSold(true);
    const finalDiff = Math.round(((currentPrice - buyPrice) / buyPrice) * 100);
    setProfitPct(finalDiff);

    let finalStatus: 'success' | 'fair' | 'fail' = 'fair';
    if (finalDiff >= targetSuccessProfit) finalStatus = 'success';
    else if (finalDiff >= targetFairProfit) finalStatus = 'fair';
    else finalStatus = 'fail';

    setStatus(finalStatus);
    setStage('result');
  };

  const finishTrade = () => {
    setSold(true);
    let finalStatus: 'success' | 'fair' | 'fail' = 'fair';

    if (!hasBought) {
      finalStatus = 'fair'; // Missed entry, stayed safe
    } else {
      const finalDiff = Math.round(((currentPrice - buyPrice) / buyPrice) * 100);
      setProfitPct(finalDiff);
      if (finalDiff >= targetSuccessProfit) finalStatus = 'success';
      else if (finalDiff >= targetFairProfit) finalStatus = 'fair';
      else finalStatus = 'fail';
    }

    setStatus(finalStatus);
    setStage('result');
  };

  const handleReturnToLife = () => {
    const summary =
      status === 'success'
        ? `Chốt lời ngoạn mục +${profitPct}%! Nhận +$15.000 tiền mặt và cờ Trực Giác Đầu Cơ.`
        : status === 'fair'
        ? hasBought
          ? `Bảo toàn vốn an toàn với lợi nhuận +${profitPct}%. Thu về +$5.000.`
          : "Đứng ngoài quan sát, bảo toàn vốn 100% trước biến động dữ dội."
        : `Cắt lỗ thê thảm (${profitPct}%)! Thất thoát -$4.000 tiền mặt và tăng +20 Burnout.`;

    onComplete({
      status,
      score: profitPct,
      summary
    });
  };

  const minPrice = Math.min(...priceHistory, 50);
  const maxPrice = Math.max(...priceHistory, 150);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-24 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ================================================================ */}
        {/* PHASE 1: BRIEFING & TUTORIAL SCREEN */}
        {/* ================================================================ */}
        {stage === 'briefing' && (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-cyan-500/20">
              📈
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-sans tabular-nums px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {marketName}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Lướt Sóng Tài Chính Đỉnh Cao</h3>
            <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
              Bạn tham gia sàn giao dịch tài chính tại <strong>{currentCity}</strong>. Hãy canh thời điểm tài sản chạm đáy để MUA VÀO và chốt lời tại đỉnh sóng trước khi hết 12 giây!
            </p>

            {/* How to play card */}
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 text-left space-y-2.5 text-xs">
              <div className="font-bold text-cyan-400 flex items-center gap-1.5 normal-case text-[12px] tracking-normal">
                <Sparkles className="w-4 h-4" /> Hướng Dẫn & Thao Tác:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                    Bước 1: Mua Vào (Buy)
                  </div>
                  <span className="text-[12px] text-slate-400">
                    Bấm nút hoặc phím <strong className="text-amber-300 font-sans tabular-nums">[Space]</strong> khi giá chạm đáy nến.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="font-semibold text-cyan-400 flex items-center gap-1.5 mb-1">
                    Bước 2: Chốt Lời (Sell)
                  </div>
                  <span className="text-[12px] text-slate-400">
                    Bấm tiếp <strong className="text-amber-300 font-sans tabular-nums">[Space]</strong> khi giá tăng vọt để bỏ túi lợi nhuận.
                  </span>
                </div>
              </div>
            </div>

            {/* Stakes card */}
            <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 mb-5 text-xs text-left grid grid-cols-2 gap-3">
              <div>
                <span className="text-emerald-400 font-bold block mb-0.5">🌟 Lợi Nhuận (≥20%):</span>
                <span className="text-[12px] text-slate-400">Nhận +$15.000 tiền mặt & Cờ &quot;Trực Giác Đầu Cơ&quot;.</span>
              </div>
              <div>
                <span className="text-rose-400 font-bold block mb-0.5">⚠️ Đu Đỉnh Cắt Lỗ:</span>
                <span className="text-[12px] text-slate-400">Thất thoát -$4.000 tiền mặt, tăng +20 Burnout.</span>
              </div>
            </div>

            {/* Ready Button */}
            <button
              onClick={() => {
                setTimeLeft(12);
                setCurrentPrice(100);
                setPriceHistory([100]);
                setHasBought(false);
                setBuyPrice(0);
                setProfitPct(0);
                setSold(false);
                setStage('playing');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-cyan-500/25 active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Lướt Sóng (12 Giây)</span>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* PHASE 2: ACTIVE GAMEPLAY */}
        {/* ================================================================ */}
        {stage === 'playing' && (
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 font-medium border border-cyan-500/20">
                ⚡ Sàn Giao Dịch Chứng Khoán
              </span>
              <div className="flex items-center gap-2 font-sans tabular-nums">
                <span className="text-slate-400">Thời gian:</span>
                <span className={`px-2.5 py-0.5 rounded font-bold ${
                  timeLeft <= 3 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Live Price Display & P&L */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 mb-3">
              <div>
                <div className="text-[12px] text-slate-400">GIÁ HIỆN TẠI (TICKER)</div>
                <div className="text-2xl font-sans tabular-nums font-bold text-white flex items-center gap-1">
                  ${currentPrice}
                  <span className="text-xs font-normal text-slate-400">USD</span>
                </div>
              </div>

              {hasBought && (
                <div className="text-right">
                  <div className="text-[12px] text-slate-400">LỢI NHUẬN RÒNG (P&L)</div>
                  <div className={`text-xl font-sans tabular-nums font-bold flex items-center justify-end gap-1 ${
                    profitPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {profitPct >= 0 ? '+' : ''}{profitPct}%
                    {profitPct >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                </div>
              )}
            </div>

            {/* Sparkline Canvas Chart */}
            <div className="h-36 w-full bg-slate-950 rounded-2xl border border-slate-800 p-2 flex items-end gap-1 overflow-hidden relative mb-4">
              {/* Buy Price Horizontal Marker */}
              {hasBought && (
                <div
                  className="absolute w-full border-t-2 border-dashed border-amber-400/60 z-10 transition-all pointer-events-none"
                  style={{
                    bottom: `${Math.max(5, Math.min(95, ((buyPrice - minPrice) / (maxPrice - minPrice || 1)) * 100))}%`
                  }}
                >
                  <span className="absolute right-2 -top-4 text-[12px] font-sans tabular-nums text-amber-300 bg-slate-900/90 px-1 rounded">
                    Giá Mua: ${buyPrice}
                  </span>
                </div>
              )}

              {/* Price Bars */}
              {priceHistory.map((p, idx) => {
                const heightPct = Math.max(8, Math.min(100, ((p - minPrice) / (maxPrice - minPrice || 1)) * 100));
                const isLatest = idx === priceHistory.length - 1;
                const isAboveBuy = hasBought && p >= buyPrice;

                return (
                  <div
                    key={idx}
                    className="flex-1 rounded-t transition-all duration-200"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: isLatest
                        ? '#38bdf8'
                        : hasBought
                        ? isAboveBuy
                          ? '#10b981'
                          : '#f43f5e'
                        : '#475569'
                    }}
                  />
                );
              })}
            </div>

            {/* Interactive Buy / Sell Controls */}
            {!hasBought ? (
              <button
                onClick={handleBuy}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                <span>MUA VÀO TẠI ĐÂY (${currentPrice})</span>
                <span className="text-[12px] font-sans tabular-nums bg-slate-950/20 px-2 py-0.5 rounded">[Space]</span>
              </button>
            ) : (
              <button
                onClick={handleSell}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2 animate-pulse"
              >
                <TrendingUp className="w-4 h-4" />
                <span>CHỐT LỜI NGAY ({profitPct >= 0 ? `+${profitPct}%` : `${profitPct}%`})</span>
                <span className="text-[12px] font-sans tabular-nums bg-slate-950/20 px-2 py-0.5 rounded">[Space]</span>
              </button>
            )}
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
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/20'
                  : status === 'fair'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-cyan-500/20'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-rose-500/20'
              }`}
            >
              {status === 'success' ? '🚀' : status === 'fair' ? '📊' : '📉'}
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {status === 'success'
                ? "Chốt Lời Đỉnh Sóng Ngoạn Mục!"
                : status === 'fair'
                ? "Giao Dịch Bảo Toàn An Toàn"
                : "Đu Đỉnh Cắt Lỗ Nặng Nề"}
            </h3>

            <div className="font-sans tabular-nums text-sm text-slate-300 mb-3">
              Hiệu suất thương vụ: <strong className={`font-bold ${profitPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {profitPct >= 0 ? `+${profitPct}%` : `${profitPct}%`}
              </strong>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 mb-5 max-w-md leading-relaxed">
              {status === 'success'
                ? "Khả năng nhạy bén giúp bạn bắt trúng đáy nến và bán đúng đỉnh! Nhận +$15.000 lợi nhuận và cờ 'Trực Giác Đầu Cơ'."
                : status === 'fair'
                ? "Giao dịch cẩn trọng giúp bảo toàn vốn trước bão giông thị trường. Bạn tích lũy thêm kinh nghiệm quý báu."
                : "Bị cuốn theo tâm lý FOMO dẫn đến cắt lỗ sâu nơi đỉnh sóng. Mất -$4.000 và áp lực tinh thần đè nặng (+20 Burnout)."}
            </p>

            <button
              onClick={handleReturnToLife}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs normal-case tracking-normal transition shadow-lg shadow-cyan-500/25 active:scale-95 flex items-center justify-center gap-2"
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

