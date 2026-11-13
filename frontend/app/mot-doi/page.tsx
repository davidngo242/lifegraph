'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';

interface Choice { id: string; title: string; hint: string; irreversible: boolean }
interface Voice { speaker: string; text: string }
interface Scenario { id: string; title: string; text: string; voices: Voice[]; choices: Choice[] }
interface Stats { age: number; cash: number; vitality: number; karma: number }
interface CastMember { role: string; name: string; trait: string; memory: string[] }
interface Ending { epitaph: string; died_at: number; doors: { label: string; age?: number }[]; chapters: { age: number; title: string; choice: string; irreversible: boolean }[] }
interface View {
  status: 'none' | 'playing' | 'ended';
  chapter?: number; name?: string; stats?: Stats; cast?: CastMember[];
  seed?: { era: string | null; family: string | null; fate: string | null; temperament: string | null };
  skipped?: string[]; skipped_total?: number;
  scenario?: Scenario; ending?: Ending;
  result?: { narration: string; irreversible: boolean; changes: { cash: number; vitality: number; karma: number } };
}

const ROLE_LABEL: Record<string, string> = { mentor: 'Người thầy', rival: 'Kẻ đối đầu', love: 'Người thương', creditor_or_benefactor: 'Chủ nợ / ân nhân', friend: 'Bạn', family: 'Người thân' };
const money = (n: number) => `${n < 0 ? '−' : '+'}${Math.abs(n).toLocaleString('vi-VN')}`;

export default function MotDoiPage() {
  const [view, setView] = useState<View | null>(null);
  const [lastResult, setLastResult] = useState<View['result'] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const run = useCallback(async (fn: () => Promise<View>) => {
    setBusy(true); setError('');
    try { setView(await fn()); topRef.current?.scrollIntoView({ block: 'start' }); }
    catch (e: any) { setError(e?.message || 'Có lỗi, thử lại sau nhé.'); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => { run(() => apiGet<View>('/mot-doi/state')); }, [run]);

  const start = () => { setLastResult(null); run(() => apiPost<View>('/mot-doi/start', {})); };
  const choose = useCallback((id: string) => {
    if (busy) return;
    run(async () => { const v = await apiPost<View>('/mot-doi/choose', { choice_id: id }); setLastResult(v.result ?? null); return v; });
  }, [busy, run]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      const choices = view?.scenario?.choices;
      if (view?.status === 'playing' && choices && n >= 1 && n <= choices.length) choose(choices[n - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, choose]);

  const share = async () => {
    if (!view?.ending) return;
    const e = view.ending;
    const text = `${view.name} sống ${e.died_at} năm.\n"${e.epitaph}"\n${e.doors.slice(0, 3).map(d => `🔒 ${d.label}`).join('\n')}\nBạn sẽ chọn khác đi không? ${window.location.origin}/mot-doi`;
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setError('Không sao chép được, hãy chép tay đoạn văn bia.'); }
  };

  const card = 'rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm';
  const btnPrimary = 'min-h-[48px] px-6 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-base disabled:opacity-60 transition';

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans">
      <div ref={topRef} />
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10 space-y-5">
        <header className="flex items-center justify-between gap-3">
          <a href="/" className="inline-flex items-center min-h-[44px] text-sm font-semibold text-[var(--text-secondary)] underline underline-offset-4">← Về LifeGraph</a>
          <span className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">Chế độ thử nghiệm</span>
        </header>

        {error && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 text-rose-900 px-4 py-3 text-sm font-medium">{error}</div>}

        {(!view || view.status === 'none') && (
          <section className={`${card} text-center space-y-5 py-10`}>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">Một Đời</h1>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
              Sống trọn một đời ở làng quê hậu chiến, khoảng 15 phút. Mỗi lựa chọn có giá của nó,
              người quanh bạn nhớ chuyện cũ, và cuối đời, văn bia ghi lại điều bạn đã chọn.
            </p>
            <button className={btnPrimary} onClick={start} disabled={busy || !view}>{busy ? 'Đang sinh ra…' : 'Bắt đầu một đời'}</button>
            <p className="text-[12px] text-[var(--text-muted)]">Không ảnh hưởng đến nhân vật trong game chính.</p>
          </section>
        )}

        {view?.status === 'playing' && view.scenario && view.stats && (
          <>
            <section aria-label="Hạt giống đời" className="flex flex-wrap gap-2 text-[12px]">
              {[view.seed?.family, view.seed?.fate, view.seed?.temperament].filter(Boolean).map(t => (
                <span key={t} className="px-2.5 py-1 rounded-full bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">{t}</span>
              ))}
            </section>
            <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
              <span><strong className="text-[var(--text-primary)]">{view.name}</strong>, {view.stats.age} tuổi · Chương {view.chapter}</span>
              <span className="tabular-nums">Sức khoẻ {view.stats.vitality} · Gia sản {view.stats.cash.toLocaleString('vi-VN')}</span>
            </div>

            {lastResult && (
              <section className={`${card} border-l-4 border-l-emerald-700`}>
                <p className="leading-relaxed">{lastResult.narration}</p>
                <p className="mt-2 text-[12px] text-[var(--text-secondary)] tabular-nums">
                  {[lastResult.changes.cash && `Gia sản ${money(lastResult.changes.cash)}`, lastResult.changes.vitality && `Sức khoẻ ${money(lastResult.changes.vitality)}`, lastResult.changes.karma && `Nhân đức ${money(lastResult.changes.karma)}`].filter(Boolean).join(' · ')}
                  {lastResult.irreversible && ' · 🔒 Không quay đầu'}
                </p>
              </section>
            )}

            {!!view.skipped_total && (
              <details className="text-sm text-[var(--text-secondary)]">
                <summary className="cursor-pointer min-h-[44px] flex items-center">{view.skipped_total} năm lặng lẽ trôi qua</summary>
                <ul className="mt-1 space-y-1 pl-4 list-disc">{view.skipped?.map(l => <li key={l}>{l}</li>)}</ul>
              </details>
            )}

            <section className={`${card} space-y-4`}>
              <h2 className="font-serif text-2xl font-bold">{view.scenario.title}</h2>
              <p className="leading-relaxed">{view.scenario.text}</p>
              {view.scenario.voices.length > 0 && (
                <ul className="space-y-2 border-l-2 border-[var(--border-subtle)] pl-3 text-sm text-[var(--text-secondary)]">
                  {view.scenario.voices.map((v, i) => <li key={i}><strong className="text-[var(--text-primary)]">{v.speaker}:</strong> “{v.text}”</li>)}
                </ul>
              )}
              <div className="space-y-2 pt-1">
                {view.scenario.choices.map((ch, i) => (
                  <button key={ch.id} onClick={() => choose(ch.id)} disabled={busy}
                    className="w-full text-left min-h-[56px] px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] hover:border-emerald-700 hover:bg-[var(--bg-card)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:opacity-60 transition">
                    <span className="font-bold">{i + 1}. {ch.title}</span>
                    {ch.irreversible && <span className="ml-2 text-[12px] font-bold text-rose-800">🔒 Không quay đầu</span>}
                    {ch.hint && <span className="block text-sm text-[var(--text-secondary)] mt-0.5">{ch.hint}</span>}
                  </button>
                ))}
              </div>
              <p className="text-[12px] text-[var(--text-muted)]">Phím 1–{view.scenario.choices.length} để chọn nhanh.</p>
            </section>

            {view.cast && view.cast.length > 0 && (
              <details className={card}>
                <summary className="cursor-pointer min-h-[44px] flex items-center font-semibold">Những người quanh bạn</summary>
                <ul className="mt-2 space-y-2 text-sm">
                  {view.cast.map(n => (
                    <li key={n.role}><strong>{n.name}</strong> <span className="text-[var(--text-secondary)]">({ROLE_LABEL[n.role] ?? n.role}, {n.trait})</span>
                      {n.memory.length > 0 && <div className="text-[var(--text-secondary)]">Nhớ: {n.memory.join('; ')}</div>}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}

        {view?.status === 'ended' && view.ending && (
          <>
            {lastResult && <section className={`${card} border-l-4 border-l-emerald-700`}><p className="leading-relaxed">{lastResult.narration}</p></section>}
            <section className={`${card} text-center space-y-4 py-8`}>
              <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Văn bia</p>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">{view.name}</h1>
              <p className="font-serif text-lg leading-relaxed italic">“{view.ending.epitaph}”</p>
              {view.ending.doors.length > 0 && (
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  {view.ending.doors.map(d => <li key={d.label}>🔒 {d.label}{d.age != null ? ` (${d.age} tuổi)` : ''}</li>)}
                </ul>
              )}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button className={btnPrimary} onClick={share}>{copied ? 'Đã sao chép' : 'Chép văn bia để chia sẻ'}</button>
                <button className="min-h-[48px] px-6 rounded-xl border-2 border-emerald-800 text-emerald-900 font-bold bg-transparent" onClick={start} disabled={busy}>Sống một đời khác</button>
              </div>
            </section>
            <details className={card}>
              <summary className="cursor-pointer min-h-[44px] flex items-center font-semibold">Những chương đã đi qua ({view.ending.chapters.length})</summary>
              <ol className="mt-2 space-y-1 text-sm">
                {view.ending.chapters.map((c, i) => <li key={i}><span className="tabular-nums text-[var(--text-secondary)]">{c.age}t</span> · <strong>{c.title}</strong>: {c.choice}{c.irreversible && ' 🔒'}</li>)}
              </ol>
            </details>
          </>
        )}
      </div>
    </main>
  );
}
