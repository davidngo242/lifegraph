'use client';

// "Nếu như…": fetches the available rewind ages and runs one sandboxed comparison (the server never mutates the real life).
import { useState, useCallback } from 'react';
import { API_BASE } from '../lib/api';

export type WhatIfAction = 'study' | 'overtime' | 'wellness' | 'network';
export interface WhatIfPoint { age: number; cash: number; vitality: number; karma: number }
export interface WhatIfLine { timeline: WhatIfPoint[]; death: { age: number; cause: string | null } | null }
export interface WhatIfInfo { ages: number[]; uses_left: number; max_uses: number; max_years: number }
export interface WhatIfResult {
  from_age: number; alt_action: WhatIfAction; years: number; uses_left: number;
  baseline: WhatIfLine; alt: WhatIfLine;
  summary: { cash_delta: number; vitality_delta: number; karma_delta: number };
}

export function useWhatIf() {
  const [info, setInfo] = useState<WhatIfInfo | null>(null);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/whatif`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Không tải được dữ liệu.');
      setInfo(data);
      setError(null);
    } catch (e: any) { setError(e?.message || 'Không tải được dữ liệu.'); }
  }, []);

  const run = useCallback(async (from_age: number, alt_action: WhatIfAction, years: number) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/whatif`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_age, alt_action, years }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Mô phỏng thất bại.');
      setResult(data);
      setInfo(prev => (prev ? { ...prev, uses_left: data.uses_left } : prev));
    } catch (e: any) { setError(e?.message || 'Mô phỏng thất bại.'); }
    finally { setLoading(false); }
  }, []);

  return { info, result, loading, error, load, run, clear: () => setResult(null) };
}
