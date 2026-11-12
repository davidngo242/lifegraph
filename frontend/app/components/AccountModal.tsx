'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, EyeOff, UserRound, AlertTriangle } from 'lucide-react';
import type { AccountMode, LinkConflict, SubmitResult } from '../hooks/useAccount';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Guest currently holds a game with a character (register will then attach it to the new account). */
  hasGuestCharacter: boolean;
  onSubmit: (mode: AccountMode, username: string, password: string, hasGuestCharacter: boolean) => Promise<SubmitResult>;
  onResolveConflict: (c: LinkConflict, replace: boolean) => Promise<SubmitResult>;
  onCancelConflict: (c: LinkConflict) => void;
}

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

const inputCls =
  'w-full min-h-[44px] rounded-xl border border-[var(--border-highlight)] bg-[var(--bg-card)] px-3 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-600 dark:focus:ring-amber-400';
const primaryBtn =
  'w-full min-h-[44px] rounded-xl px-4 text-sm font-bold transition active:scale-95 disabled:opacity-60 bg-amber-700 text-white hover:bg-amber-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600';
const secondaryBtn =
  'w-full min-h-[44px] rounded-xl px-4 text-sm font-semibold border border-[var(--border-highlight)] bg-[var(--bg-card-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition active:scale-95 disabled:opacity-60';

export default function AccountModal({ isOpen, onClose, hasGuestCharacter, onSubmit, onResolveConflict, onCancelConflict }: AccountModalProps) {
  const [mode, setMode] = useState<AccountMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState<LinkConflict | null>(null);
  const [confirmLogin, setConfirmLogin] = useState(false); // login would replace the guest game held in this browser
  const dialogRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const close = () => {
    if (busy) return;
    if (conflict) onCancelConflict(conflict);
    setConflict(null);
    onClose();
  };

  // Reset on open, focus first field, restore focus on close.
  useEffect(() => {
    if (!isOpen) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    setError(''); setPassword(''); setShowPw(false); setConflict(null); setConfirmLogin(false);
    const t = window.setTimeout(() => userRef.current?.focus(), 0);
    return () => { window.clearTimeout(t); returnFocus.current?.focus?.(); };
  }, [isOpen]);

  // Views swap without unmounting the dialog: move focus to the new view's primary action (a11y).
  useEffect(() => {
    if (!isOpen || (!conflict && !confirmLogin)) return;
    dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  }, [isOpen, conflict, confirmLogin]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.nativeEvent.stopPropagation(); // keep game hotkeys (Space, M, 1-3...) out of the dialog
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const handleResult = (r: SubmitResult) => {
    if (r.ok) return; // page reloads
    if (r.conflict) setConflict(r.conflict);
    else setError(r.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
  };

  const doSubmit = async () => {
    setBusy(true); setError('');
    try { handleResult(await onSubmit(mode, username.trim(), password, hasGuestCharacter)); } finally { setBusy(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const name = username.trim();
    if (!name) { setError('Vui lòng nhập tên đăng nhập.'); userRef.current?.focus(); return; }
    if (!password) { setError('Vui lòng nhập mật khẩu.'); return; }
    if (mode === 'register' && password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự.'); return; }
    // Logging in switches this browser to the account's game; the guest game would be orphaned. Ask first.
    if (mode === 'login' && hasGuestCharacter) { setConfirmLogin(true); return; }
    await doSubmit();
  };

  const resolve = async (replace: boolean) => {
    if (!conflict || busy) return;
    setBusy(true); setError('');
    try { handleResult(await onResolveConflict(conflict, replace)); } finally { setBusy(false); }
  };

  const switchMode = (m: AccountMode) => { setMode(m); setError(''); };

  const tabCls = (active: boolean) =>
    `flex-1 min-h-[44px] rounded-lg text-sm font-bold transition ${
      active
        ? 'bg-amber-700 text-white dark:bg-amber-500 dark:text-slate-950'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`;

  const modal = (
    <div
      className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        onKeyDown={handleKeyDown}
        className="w-full max-w-sm max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl bg-[var(--bg-popover)] border border-[var(--border-highlight)] shadow-2xl p-5 flex flex-col gap-4 text-[var(--text-primary)]"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="account-modal-title" className="flex items-center gap-2 text-base font-extrabold">
            <UserRound className="w-5 h-5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
            {conflict ? 'Tài khoản đã có tiến trình' : confirmLogin ? 'Rời cuộc đời khách?' : 'Tài khoản'}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Đóng"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {confirmLogin && !conflict ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 rounded-xl border border-amber-700/40 bg-amber-500/10 p-3 text-sm text-[var(--text-primary)]">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-800 dark:text-amber-400" aria-hidden="true" />
              <p>Bạn đang có một cuộc đời khách chưa lưu vào tài khoản. Đăng nhập sẽ chuyển sang cuộc đời của tài khoản và cuộc đời khách này sẽ không còn truy cập được trên trình duyệt này. Muốn giữ nó, hãy chọn &quot;Đăng ký&quot; tài khoản mới thay vì đăng nhập.</p>
            </div>
            {error && <p role="alert" className="rounded-lg border border-rose-700/40 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-800 dark:text-rose-300">{error}</p>}
            <button type="button" data-autofocus className={primaryBtn} disabled={busy} onClick={() => { void doSubmit(); }}>
              {busy ? 'Đang xử lý…' : 'Vẫn đăng nhập, bỏ cuộc đời khách'}
            </button>
            <button type="button" className={secondaryBtn} disabled={busy} onClick={() => { setConfirmLogin(false); setError(''); }}>
              Quay lại
            </button>
          </div>
        ) : conflict ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 rounded-xl border border-amber-700/40 bg-amber-500/10 p-3 text-sm text-[var(--text-primary)]">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-800 dark:text-amber-400" aria-hidden="true" />
              <p>
                {conflict.canReplace
                  ? 'Tài khoản này đã có một cuộc đời đang chơi. Bạn muốn giữ cuộc đời của tài khoản hay thay bằng cuộc đời khách hiện tại?'
                  : 'Phiên khách hiện tại đã thuộc một tài khoản khác nên không thể gắn vào tài khoản này. Bạn có thể tiếp tục với cuộc đời của tài khoản.'}
              </p>
            </div>
            {error && <p role="alert" className="rounded-lg border border-rose-700/40 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-800 dark:text-rose-300">{error}</p>}
            <button type="button" data-autofocus className={primaryBtn} disabled={busy} onClick={() => resolve(false)}>
              {busy ? 'Đang xử lý…' : 'Giữ cuộc đời của tài khoản'}
            </button>
            {conflict.canReplace && (
              <button type="button" className={`${secondaryBtn} !border-rose-700/60 text-rose-800 dark:text-rose-300`} disabled={busy} onClick={() => resolve(true)}>
                Thay bằng cuộc đời khách hiện tại
              </button>
            )}
            <button type="button" className={secondaryBtn} disabled={busy} onClick={close}>
              Hủy, tiếp tục chơi khách
            </button>
          </div>
        ) : (
          <>
            <div role="tablist" aria-label="Đăng nhập hoặc đăng ký" className="flex gap-1 p-1 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]">
              <button type="button" role="tab" id="tab-login" aria-selected={mode === 'login'} aria-controls="account-panel" onClick={() => switchMode('login')} className={tabCls(mode === 'login')}>Đăng nhập</button>
              <button type="button" role="tab" id="tab-register" aria-selected={mode === 'register'} aria-controls="account-panel" onClick={() => switchMode('register')} className={tabCls(mode === 'register')}>Đăng ký</button>
            </div>

            <form id="account-panel" role="tabpanel" aria-labelledby={`tab-${mode}`} onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
              {mode === 'register' && hasGuestCharacter && (
                <p className="rounded-xl border border-emerald-700/40 bg-emerald-500/10 p-3 text-sm text-emerald-900 dark:text-emerald-300">
                  Cuộc đời khách đang chơi sẽ được gắn vào tài khoản mới để giữ nguyên tiến trình.
                </p>
              )}
              <div className="flex flex-col gap-1">
                <label htmlFor="account-username" className="text-sm font-semibold text-[var(--text-secondary)]">Tên đăng nhập</label>
                <input
                  id="account-username" ref={userRef} className={inputCls} type="text" autoComplete="username"
                  autoCapitalize="none" spellCheck={false} value={username} onChange={(e) => setUsername(e.target.value)}
                  aria-describedby={mode === 'register' ? 'account-user-hint' : undefined}
                />
                {mode === 'register' && <span id="account-user-hint" className="text-xs text-[var(--text-secondary)]">3-32 ký tự: chữ, số, _ . -</span>}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="account-password" className="text-sm font-semibold text-[var(--text-secondary)]">Mật khẩu</label>
                <div className="relative">
                  <input
                    id="account-password" className={`${inputCls} pr-12`} type={showPw ? 'text' : 'password'}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-describedby={mode === 'register' ? 'account-pw-hint' : undefined}
                  />
                  <button
                    type="button" onClick={() => setShowPw((v) => !v)} aria-pressed={showPw}
                    aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute right-0 top-0 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
                {mode === 'register' && <span id="account-pw-hint" className="text-xs text-[var(--text-secondary)]">Tối thiểu 8 ký tự.</span>}
              </div>
              {error && <p role="alert" className="rounded-lg border border-rose-700/40 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-800 dark:text-rose-300">{error}</p>}
              <button type="submit" disabled={busy} className={primaryBtn}>
                {busy ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
              </button>
              <p className="text-xs text-[var(--text-secondary)]">Không cần tài khoản để chơi. Đăng ký chỉ để lưu và chơi tiếp trên thiết bị khác.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}
