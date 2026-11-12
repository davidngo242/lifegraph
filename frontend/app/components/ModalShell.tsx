'use client';

import React, { useEffect, useRef } from 'react';

interface ModalShellProps {
  /** Tên hộp thoại cho trình đọc màn hình (bắt buộc). */
  label: string;
  /** className của lớp phủ (giữ nguyên class cũ, gồm `fixed inset-0 ...`). */
  className?: string;
  /** Có thì Escape sẽ đóng. Bỏ trống với hộp thoại buộc phải chọn (chết, tái sinh, sự kiện bắt buộc). */
  onClose?: () => void;
  /** Tuỳ chọn: bấm vào lớp phủ (vd. đóng khi bấm nền). */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Ngăn xếp modal đang mở: chỉ modal trên cùng xử lý Tab/Escape.
const stack: symbol[] = [];

/**
 * Lớp phủ modal dùng chung: role="dialog", aria-modal, bẫy Tab, Escape (tuỳ chọn),
 * trả focus về nút đã mở. Chỉ thay thẻ <div> lớp phủ; không đổi giao diện.
 */
export default function ModalShell({ label, className = '', onClose, onClick, children }: ModalShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const id = Symbol('modal');
    stack.push(id);
    const previous = document.activeElement as HTMLElement | null;
    if (!root.contains(document.activeElement)) {
      (root.querySelector<HTMLElement>(FOCUSABLE) ?? root).focus({ preventScroll: true });
    }

    const visible = (el: HTMLElement) => el.getClientRects().length > 0;
    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === 'Escape' && closeRef.current) {
        const t = e.target as HTMLElement | null;
        if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && (t as HTMLInputElement).type !== 'button') return;
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(visible);
      if (items.length === 0) { e.preventDefault(); root.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !root.contains(active))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !root.contains(active))) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const i = stack.indexOf(id);
      if (i >= 0) stack.splice(i, 1);
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} onClick={onClick} className={`${className} outline-none`}>
      {children}
    </div>
  );
}
