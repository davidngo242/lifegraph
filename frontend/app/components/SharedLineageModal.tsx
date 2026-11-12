'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Flame, HeartHandshake, Flag, Landmark, Globe2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useSharedLineage, usePublishMemorial, openAccountModal, EPITAPH_MAX,
  type SharedMemorial, type SharedSort,
} from '../hooks/useSharedLineage';

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
const primaryBtn =
  'min-h-[44px] rounded-xl px-4 text-sm font-bold transition active:scale-95 disabled:opacity-60 bg-amber-700 text-white hover:bg-amber-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600';
const secondaryBtn =
  'min-h-[44px] rounded-xl px-3 text-sm font-semibold border border-[var(--border-highlight)] bg-[var(--bg-card-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition active:scale-95 disabled:opacity-60 inline-flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600';

/** Khung hộp thoại dùng chung: portal, Esc, bẫy focus, không để phím tắt game lọt vào. */
function Dialog({ title, titleId, onClose, children }: { title: string; titleId: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 0);
    return () => { window.clearTimeout(t); back?.focus?.(); };
  }, []);
  const onKeyDown = (e: React.KeyboardEvent) => {
    e.nativeEvent.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    if (e.key !== 'Tab' || !ref.current) return;
    const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-sm"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onKeyDown}
        className="w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl bg-[var(--bg-popover)] border border-[var(--border-highlight)] shadow-2xl p-5 flex flex-col gap-4 text-[var(--text-primary)]">
        <div className="flex items-center justify-between gap-2">
          <h2 id={titleId} className="flex items-center gap-2 text-base font-extrabold">
            <Landmark className="w-5 h-5 text-amber-700 dark:text-amber-400" aria-hidden="true" />{title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Đóng" data-autofocus
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function GuestPrompt({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        Bia Tưởng Niệm chung dành cho người chơi có tài khoản, để tiền nhân của bạn được lưu danh và bạn thắp hương cho tiền nhân của người khác một cách an toàn.
      </p>
      <button type="button" className={primaryBtn + ' w-full'} onClick={() => { onClose(); openAccountModal(); }}>
        Đăng nhập để tham gia
      </button>
    </div>
  );
}

function Card({ m, onAct }: { m: SharedMemorial; onAct: (id: string, a: 'incense' | 'adopt' | 'report') => Promise<{ ok: boolean; error?: string }> }) {
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');
  const [confirmReport, setConfirmReport] = useState(false);
  const run = async (a: 'incense' | 'adopt' | 'report') => {
    setBusy(a); setNote('');
    const r = await onAct(m.id, a);
    setBusy(''); setConfirmReport(false);
    if (!r.ok) setNote(r.error || 'Không thực hiện được.');
    else if (a === 'incense') setNote('Tâm hương đã được thắp.');
    else if (a === 'adopt') setNote('Đã nhận làm tiền nhân (ân huệ nhỏ, có trần).');
  };
  return (
    <li className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-base font-bold text-[var(--text-primary)] [overflow-wrap:anywhere]">🪦 {m.ancestor_name}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-0.5 [overflow-wrap:anywhere]">
            Hưởng thọ {m.age} tuổi • {m.nationality}{m.cause_of_passing ? ` • ${m.cause_of_passing}` : ''}
          </div>
          {m.aspiration_title && <div className="text-xs font-medium text-teal-800 dark:text-teal-300 mt-0.5 [overflow-wrap:anywhere]">Khát vọng: {m.aspiration_title}</div>}
        </div>
        <div className="text-[12px] tabular-nums text-[var(--text-secondary)] text-right shrink-0">
          <div>🔥 {m.incense_count}</div><div>🤝 {m.adopt_count}</div>
        </div>
      </div>
      {m.epitaph && <p className="rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] p-2.5 text-sm italic text-[var(--text-secondary)] [overflow-wrap:anywhere]">{m.epitaph}</p>}
      <div className="text-[12px] text-[var(--text-secondary)]">Do {m.display_name} lưu danh{m.mine ? ' (của bạn)' : ''}</div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={secondaryBtn} disabled={!!busy || m.incensed_today} onClick={() => run('incense')}>
          <Flame className="w-4 h-4 text-amber-700 dark:text-amber-400" aria-hidden="true" />{m.incensed_today ? 'Hôm nay đã thắp' : 'Thắp hương'}
        </button>
        {!m.mine && (
          <button type="button" className={secondaryBtn} disabled={!!busy || m.adopted} onClick={() => run('adopt')}>
            <HeartHandshake className="w-4 h-4 text-teal-700 dark:text-teal-300" aria-hidden="true" />{m.adopted ? 'Đã nhận làm tiền nhân' : 'Nhận làm tiền nhân'}
          </button>
        )}
        {!m.mine && (confirmReport ? (
          <button type="button" className={secondaryBtn + ' !border-rose-600 !text-rose-800 dark:!text-rose-300'} disabled={!!busy} onClick={() => run('report')}>
            <Flag className="w-4 h-4" aria-hidden="true" />Xác nhận báo cáo
          </button>
        ) : (
          <button type="button" className={secondaryBtn} disabled={!!busy} onClick={() => setConfirmReport(true)}>
            <Flag className="w-4 h-4 text-rose-700 dark:text-rose-300" aria-hidden="true" />Báo cáo
          </button>
        ))}
      </div>
      {note && <p role="status" className="text-xs font-medium text-[var(--text-primary)]">{note}</p>}
    </li>
  );
}

export default function SharedLineageModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const s = useSharedLineage(isOpen);
  if (!isOpen || typeof document === 'undefined') return null;
  const sorts: [SharedSort, string][] = [['new', 'Mới nhất'], ['incense', 'Nhiều hương nhất']];
  return (
    <Dialog title="Bia Tưởng Niệm chung" titleId="shared-lineage-title" onClose={onClose}>
      {!s.loggedIn ? <GuestPrompt onClose={onClose} /> : (
        <>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Tiền nhân của người chơi khác. Thắp hương mỗi bia một lần mỗi ngày. Nhận làm tiền nhân chỉ là ân huệ nhỏ
            (+1 Karma khởi đầu mỗi người, tối đa +{s.bonus.cap}; hiện +{s.bonus.value}), không chuyển tiền hay tài sản.
          </p>
          <div role="group" aria-label="Sắp xếp" className="flex gap-2">
            {sorts.map(([k, label]) => (
              <button key={k} type="button" aria-pressed={s.sort === k} onClick={() => s.setSort(k)}
                className={`min-h-[44px] flex-1 rounded-xl text-sm font-bold transition ${s.sort === k ? 'bg-amber-700 text-white dark:bg-amber-500 dark:text-slate-950' : 'border border-[var(--border-highlight)] text-[var(--text-primary)] bg-[var(--bg-card-subtle)]'}`}>
                {label}
              </button>
            ))}
          </div>
          {s.error && <p role="alert" className="text-sm font-medium text-rose-800 dark:text-rose-300">{s.error}</p>}
          {s.loading && s.items.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">Đang tải…</p> : s.items.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-6">Chưa có bia nào. Hãy là người đầu tiên đăng tiền nhân của mình.</p>
          ) : (
            <ul className="space-y-3">{s.items.map(m => <Card key={m.id} m={m} onAct={s.act} />)}</ul>
          )}
          <div className="flex items-center justify-between gap-2">
            <button type="button" className={secondaryBtn} onClick={s.prev} disabled={s.offset === 0 || s.loading} aria-label="Trang trước"><ChevronLeft className="w-4 h-4" aria-hidden="true" />Trước</button>
            <span className="text-xs tabular-nums text-[var(--text-secondary)]">{s.total === 0 ? 0 : s.offset + 1}-{Math.min(s.offset + s.pageSize, s.total)} / {s.total}</span>
            <button type="button" className={secondaryBtn} onClick={s.next} disabled={s.offset + s.pageSize >= s.total || s.loading} aria-label="Trang sau">Sau<ChevronRight className="w-4 h-4" aria-hidden="true" /></button>
          </div>
        </>
      )}
    </Dialog>
  );
}

/** Nút mở Bia Tưởng Niệm chung (tự giữ trạng thái, gắn một dòng vào bất kỳ đâu). */
export function SharedLineageHallButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={secondaryBtn}>
        <Globe2 className="w-4 h-4 text-teal-700 dark:text-teal-300" aria-hidden="true" />Bia Tưởng Niệm chung
      </button>
      <SharedLineageModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Công tắc đăng một bia của mình lên Bia Tưởng Niệm chung (chủ động, từng bia). */
export function SharedLineagePublish({ memorialId, defaultEpitaph = '' }: { memorialId: string; defaultEpitaph?: string }) {
  const p = usePublishMemorial(memorialId);
  const [open, setOpen] = useState(false);
  const [epitaph, setEpitaph] = useState(defaultEpitaph.slice(0, EPITAPH_MAX));
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  if (!p.checked) return null;

  const live = p.published && p.published.status !== 'removed';
  const submit = async () => {
    setBusy(true); setMsg('');
    const r = await p.publish(epitaph);
    setBusy(false);
    if (r.ok) setOpen(false); else setMsg(r.error || 'Không đăng được.');
  };
  const remove = async () => {
    setBusy(true); setMsg('');
    const r = await p.unpublish();
    setBusy(false);
    if (!r.ok) setMsg(r.error || 'Không gỡ được.');
  };

  return (
    <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-2">
      {live ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">
            {p.published?.status === 'hidden' ? 'Bia đang bị ẩn do bị báo cáo' : 'Đã đăng lên Bia Tưởng Niệm chung'}
          </span>
          <button type="button" className={secondaryBtn} disabled={busy} onClick={remove}>Gỡ bia</button>
        </div>
      ) : p.published?.status === 'removed' ? (
        <span className="text-xs text-[var(--text-secondary)]">Bia này đã gỡ khỏi Bia Tưởng Niệm chung (mỗi kiếp đăng một lần).</span>
      ) : (
        <button type="button" className={secondaryBtn + ' self-start'} onClick={() => (p.loggedIn ? setOpen(true) : openAccountModal())}>
          <Globe2 className="w-4 h-4 text-teal-700 dark:text-teal-300" aria-hidden="true" />
          {p.loggedIn ? 'Đăng lên Bia Tưởng Niệm chung' : 'Đăng nhập để đăng bia chung'}
        </button>
      )}
      {msg && <p role="alert" className="text-xs font-medium text-rose-800 dark:text-rose-300">{msg}</p>}
      {open && (
        <Dialog title="Đăng bia lên Bia Tưởng Niệm chung" titleId={`sl-pub-${memorialId}`} onClose={() => setOpen(false)}>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Người chơi khác sẽ thấy tên tiền nhân, quốc tịch, tuổi thọ, nguyên nhân, khát vọng, lời bia và tên tài khoản của bạn. Tiền bạc, tài sản không bao giờ được đăng. Lời bia không chứa liên kết hay HTML.
          </p>
          <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor={`sl-ep-${memorialId}`}>Lời bia ({epitaph.length}/{EPITAPH_MAX})</label>
          <textarea id={`sl-ep-${memorialId}`} value={epitaph} maxLength={EPITAPH_MAX} rows={3} onChange={e => setEpitaph(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-highlight)] bg-[var(--bg-card)] p-3 text-base text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-600 dark:focus:ring-amber-400" />
          <label className="flex items-start gap-3 min-h-[44px] text-sm text-[var(--text-primary)] cursor-pointer">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 w-5 h-5 accent-amber-700" />
            <span>Tôi đồng ý công khai bia này cho người chơi có tài khoản khác. Tôi có thể gỡ bất cứ lúc nào.</span>
          </label>
          {msg && <p role="alert" className="text-sm font-medium text-rose-800 dark:text-rose-300">{msg}</p>}
          <button type="button" className={primaryBtn} disabled={!consent || busy} onClick={submit}>Đăng bia</button>
        </Dialog>
      )}
    </div>
  );
}
