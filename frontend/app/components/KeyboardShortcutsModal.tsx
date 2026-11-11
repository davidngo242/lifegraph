'use client';

import React from 'react';
import { Keyboard, X, Sparkles, Zap, Play, Volume2, BookOpen, Film, AlertTriangle } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      key: 'Space',
      description: 'Bước sang năm tiếp theo / tiếp tục nhanh tiến trình',
      category: 'Điều Khiển Lượt',
      badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
    },
    {
      key: '1',
      description: 'Chọn nhanh phương án 1 trong Ngã rẽ / Tam giác bất khả thi / Khoảng lặng',
      category: 'Quyết Định',
      badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10'
    },
    {
      key: '2',
      description: 'Chọn nhanh phương án 2 trong Ngã rẽ / Tam giác bất khả thi / Khoảng lặng',
      category: 'Quyết Định',
      badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10'
    },
    {
      key: '3',
      description: 'Chọn nhanh phương án 3 trong Ngã rẽ / Tam giác bất khả thi',
      category: 'Quyết Định',
      badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10'
    },
    {
      key: 'D',
      description: 'Mở Phòng Quyết Định Điện Ảnh 21:9 (Cinema Decision Room)',
      category: 'Trải Nghiệm',
      badgeColor: 'border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10'
    },
    {
      key: 'M',
      description: 'Bật / tắt nhanh âm thanh nền (Mute toggle)',
      category: 'Âm Thanh',
      badgeColor: 'border-cyan-500/40 text-cyan-700 dark:text-cyan-300 bg-cyan-500/10'
    },
    {
      key: '? hoặc /',
      description: 'Bật nhanh Sổ tay hướng dẫn sinh tồn (Game Guide Modal)',
      category: 'Trợ Giúp',
      badgeColor: 'border-teal-500/40 text-teal-700 dark:text-teal-300 bg-teal-500/10'
    },
    {
      key: 'K',
      description: 'Bật / tắt bảng danh mục phím tắt toàn cục (Shortcuts Cheatsheet)',
      category: 'Hệ Thống',
      badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10'
    },
    {
      key: 'E',
      description: 'Mở Trạm Cứu Hộ Khẩn Cấp (Emergency SOS) khi sinh lực suy kiệt',
      category: 'Sinh Tồn',
      badgeColor: 'border-rose-500/40 text-rose-300 bg-rose-500/10'
    },
    {
      key: 'Esc',
      description: 'Đóng nhanh bất kỳ cửa sổ / modal thông tin đang mở',
      category: 'Điều Hướng',
      badgeColor: 'border-slate-500/40 text-slate-300 bg-slate-500/10'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-6 md:p-7 shadow-2xl overflow-hidden transition-colors duration-200">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                Hệ Thống Phím Tắt Toàn Cục
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  HOTKEYS
                </span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Thao tác nhanh chóng, đắm chìm trọn vẹn vào dòng thời gian cuộc đời
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.06)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="py-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-[var(--border-highlight)] transition"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-xs md:text-sm font-semibold text-[var(--text-primary)] leading-snug">
                  {item.description}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Phân loại: <span className="text-[var(--text-primary)] font-medium">{item.category}</span>
                </div>
              </div>

              <kbd className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold tracking-wider shrink-0 shadow-sm ${item.badgeColor}`}>
                [{item.key}]
              </kbd>
            </div>
          ))}
        </div>

        {/* Pro Tip Footer */}
        <div className="pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-center gap-2">
          <span className="text-amber-400 shrink-0">💡</span>
          <span>
            <strong>Ghi chú:</strong> Phím tắt tự động bỏ qua khi con trỏ đang nhập văn bản trong các ô input hoặc khi đang mở các bảng hộp thoại.
          </span>
        </div>
      </div>
    </div>
  );
}
