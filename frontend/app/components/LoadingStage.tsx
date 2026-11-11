'use client';

import React, { useEffect, useState } from 'react';

interface LoadingStageProps {
  /** Dòng mô tả tuỳ chỉnh (mặc định: "Đang tải tiến trình đã lưu…"). */
  message?: string;
  /** Thời gian đã chờ (ms). Nếu không truyền, component tự đếm kể từ lúc hiện ra. */
  elapsedMs?: number;
}

// Câu trích về cuộc đời, xoay vòng trong lúc chờ (không gán tên tác giả để tránh sai nguồn).
const QUOTES = [
  'Có công mài sắt, có ngày nên kim.',
  'Mỗi lựa chọn hôm nay là một nhánh cây của ngày mai.',
  'Cuộc đời không có bản nháp, nhưng luôn có kiếp sau để làm tốt hơn.',
  'Giàu có không phải là điểm đến, mà là cách ta đi qua từng năm tháng.',
  'Tiền có thể mua được thời gian, nhưng không mua được những người ta đã bỏ lỡ.',
  'Chậm mà chắc: gốc sâu thì cây mới cao.',
  'Phúc đức tại mẫu: việc thiện hôm nay là vốn liếng của con cháu mai sau.',
];

// Các mốc tiến trình có ý nghĩa: máy chủ miễn phí (Render free) ngủ đông nên lần đầu mất ~20-30s.
const STAGES: { from: number; label: string }[] = [
  { from: 0, label: 'Đang kết nối tới máy chủ…' },
  { from: 3000, label: 'Máy chủ đang thức dậy (lần đầu mất khoảng 20 giây)…' },
  { from: 12000, label: 'Đang nạp tiến trình và gia phả của bạn…' },
  { from: 25000, label: 'Sắp xong rồi, máy chủ khởi động hơi lâu hơn thường lệ…' },
  { from: 50000, label: 'Vẫn đang chờ máy chủ. Nếu quá 1 phút, hãy tải lại trang.' },
];

const QUOTE_INTERVAL_MS = 6000;

export function getStageIndex(elapsedMs: number): number {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (elapsedMs >= STAGES[i].from) idx = i;
  }
  return idx;
}

/** Tiến trình giả có ý nghĩa: tăng nhanh lúc đầu, tiệm cận 95% (không bao giờ tự "đầy" trước khi dữ liệu về). */
export function getFakeProgress(elapsedMs: number): number {
  const pct = 95 * (1 - Math.exp(-Math.max(0, elapsedMs) / 14000));
  return Math.min(95, Math.max(2, Math.round(pct)));
}

export default function LoadingStage({ message, elapsedMs }: LoadingStageProps) {
  // Tự đếm giờ nếu cha không truyền elapsedMs.
  const [ownElapsed, setOwnElapsed] = useState(0);
  const controlled = typeof elapsedMs === 'number';

  useEffect(() => {
    if (controlled) return;
    const start = Date.now();
    const id = window.setInterval(() => setOwnElapsed(Date.now() - start), 500);
    return () => window.clearInterval(id);
  }, [controlled]);

  const elapsed = controlled ? (elapsedMs as number) : ownElapsed;
  const stageIdx = getStageIndex(elapsed);
  const progress = getFakeProgress(elapsed);
  const seconds = Math.floor(elapsed / 1000);

  const [quoteIdx, setQuoteIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), QUOTE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-10 md:py-16">
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xl p-6 md:p-8 space-y-6 text-center">
        {/* Biểu tượng: cây mầm "thở" nhẹ; tắt hoàn toàn khi người dùng chọn giảm chuyển động */}
        <div
          aria-hidden="true"
          className="mx-auto w-16 h-16 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] flex items-center justify-center text-3xl motion-safe:animate-pulse"
        >
          🌱
        </div>

        {/* Vùng thông báo cho trình đọc màn hình: chỉ đổi khi sang giai đoạn mới (không đọc từng giây) */}
        <div role="status" aria-live="polite" aria-atomic="true" className="space-y-1.5">
          <h2 className="text-base md:text-lg font-bold text-[var(--text-primary)]">
            {message || 'Đang tải tiến trình đã lưu…'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{STAGES[stageIdx].label}</p>
        </div>

        {/* Thanh tiến trình */}
        <div className="space-y-2">
          <div
            role="progressbar"
            aria-label="Tiến trình khởi động máy chủ (ước lượng)"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-2.5 w-full rounded-full bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-[var(--accent-gold)] motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-sans tabular-nums" aria-hidden="true">
            <span>Bước {stageIdx + 1}/{STAGES.length}</span>
            <span>{seconds}s</span>
          </div>
        </div>

        {/* Câu trích xoay vòng */}
        <figure className="pt-4 border-t border-[var(--border-subtle)] min-h-[3.5rem]">
          <blockquote
            key={quoteIdx}
            className="text-sm md:text-base italic text-[var(--text-primary)] leading-relaxed motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
          >
            “{QUOTES[quoteIdx]}”
          </blockquote>
        </figure>

        <p className="text-xs text-[var(--text-secondary)]">
          Lần truy cập sau sẽ nhanh hơn nhiều khi máy chủ đã thức.
        </p>
      </div>
    </div>
  );
}
