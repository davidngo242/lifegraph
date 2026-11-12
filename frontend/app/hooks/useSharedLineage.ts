'use client';

// Bia Tưởng Niệm chung (gia phả liên người chơi). Backend: /api/game/shared-lineage (docs/shared-lineage-2026-11-12.md).
import { useState, useCallback, useEffect } from 'react';
import { getAccountToken } from '../lib/api';

const BASE = '/api/game/shared-lineage';
export const OPEN_ACCOUNT_EVENT = 'lifegraph:open-account';
export const EPITAPH_MAX = 200;

export interface SharedMemorial {
  id: string;
  display_name: string;
  ancestor_name: string;
  nationality: string;
  age: number;
  cause_of_passing: string;
  aspiration_title: string;
  epitaph: string;
  incense_count: number;
  adopt_count: number;
  created_at: string;
  mine: boolean;
  incensed_today: boolean;
  adopted: boolean;
  status?: 'active' | 'hidden' | 'removed';
  source_memorial_id?: string;
}
export type SharedSort = 'new' | 'incense';
export interface ActionResult { ok: boolean; status: number; error?: string; data?: any }

async function call(path: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body?: unknown): Promise<ActionResult> {
  const headers: Record<string, string> = { 'x-account-token': getAccountToken() };
  if (method === 'POST') headers['Content-Type'] = 'application/json';
  try {
    const res = await fetch(BASE + path, { method, headers, body: method === 'POST' ? JSON.stringify(body ?? {}) : undefined });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, error: data?.error, data };
  } catch {
    return { ok: false, status: 0, error: 'Không kết nối được máy chủ. Vui lòng thử lại.' };
  }
}

export const openAccountModal = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_ACCOUNT_EVENT)); };

/** Có token tài khoản trong trình duyệt = đang đăng nhập (máy chủ vẫn kiểm lại, 401 -> coi như khách). */
export function useSharedLineage(enabled: boolean) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [items, setItems] = useState<SharedMemorial[]>([]);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<SharedSort>('new');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bonus, setBonus] = useState({ value: 0, cap: 3 });
  const PAGE = 10;

  const load = useCallback(async (nextSort: SharedSort, nextOffset: number) => {
    if (!getAccountToken()) { setLoggedIn(false); return; }
    setLoading(true); setError('');
    const [list, adopted] = await Promise.all([call(`?sort=${nextSort}&limit=${PAGE}&offset=${nextOffset}`), call('/adopted')]);
    setLoading(false);
    if (list.status === 401) { setLoggedIn(false); return; }
    setLoggedIn(true);
    if (!list.ok) { setError(list.error || 'Không tải được danh sách.'); return; }
    setItems(list.data.items || []); setTotal(list.data.total || 0);
    if (adopted.ok) setBonus({ value: adopted.data.karma_start_bonus || 0, cap: adopted.data.karma_start_bonus_cap || 3 });
  }, []);

  useEffect(() => { if (enabled) load(sort, offset); }, [enabled, sort, offset, load]);
  useEffect(() => { if (enabled) setLoggedIn(!!getAccountToken()); }, [enabled]);

  const act = useCallback(async (id: string, action: 'incense' | 'adopt' | 'report'): Promise<ActionResult> => {
    const r = await call(`/${id}/${action}`, 'POST', {});
    if (r.ok) {
      setItems(prev => prev.map(m => {
        if (m.id !== id) return m;
        if (action === 'incense') return { ...m, incensed_today: true, incense_count: r.data.incense_count ?? m.incense_count + 1 };
        if (action === 'adopt') return { ...m, adopted: true, adopt_count: m.adopt_count + 1 };
        return m;
      }));
      if (action === 'adopt') setBonus(b => ({ ...b, value: r.data?.blessing?.karma_start_bonus ?? b.value }));
      if (action === 'report') setItems(prev => prev.filter(m => m.id !== id));
    }
    return r;
  }, []);

  return {
    loggedIn, items, total, sort, offset, pageSize: PAGE, loading, error, bonus,
    setSort: (s: SharedSort) => { setOffset(0); setSort(s); },
    next: () => setOffset(o => (o + PAGE < total ? o + PAGE : o)),
    prev: () => setOffset(o => Math.max(0, o - PAGE)),
    reload: () => load(sort, offset),
    act,
  };
}

/** Đăng / kiểm tra trạng thái đăng một bia của chính mình. */
export function usePublishMemorial(sourceMemorialId: string) {
  const [published, setPublished] = useState<SharedMemorial | null>(null);
  const [checked, setChecked] = useState(false);

  const refresh = useCallback(async () => {
    if (!getAccountToken()) { setChecked(true); return; }
    const r = await call('/mine');
    if (r.ok) setPublished((r.data.items as SharedMemorial[]).find(m => m.source_memorial_id === sourceMemorialId) || null);
    setChecked(true);
  }, [sourceMemorialId]);

  useEffect(() => { refresh(); }, [refresh]);

  const publish = useCallback(async (epitaph: string): Promise<ActionResult> => {
    const r = await call('/publish', 'POST', { memorial_id: sourceMemorialId, consent: true, epitaph });
    if (r.ok) setPublished({ ...r.data.memorial, source_memorial_id: sourceMemorialId, status: 'active' });
    return r;
  }, [sourceMemorialId]);

  const unpublish = useCallback(async (): Promise<ActionResult> => {
    if (!published) return { ok: false, status: 0 };
    const r = await call(`/${published.id}`, 'DELETE');
    if (r.ok) setPublished({ ...published, status: 'removed' });
    return r;
  }, [published]);

  return { published, checked, publish, unpublish, loggedIn: typeof window !== 'undefined' && !!getAccountToken() };
}
