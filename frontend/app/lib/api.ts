// Typed API client for the '/api/game' backend + shared core game-state types.

export const API_BASE = '/api/game';

// ---- Types (derived from actual usage in page.tsx; loose where the shape is not fixed) ----
export interface Character {
  name?: string;
  age?: number;
  cash?: number;
  vitality?: number;
  burnout?: number;
  karma?: number;
  housing?: string;
  action_points?: number;
  total_ap?: number;
  locked_ap?: number;
  locked_reasons?: string[];
  skill_points?: number;
  unlocked_skills?: string[];
  hidden_flags?: string[];
  history_log?: unknown[];
  timeline_snapshots?: unknown[];
  personality_flags?: string[];
  is_deceased?: boolean;
  death_age?: number;
  death_cause?: string;
  active_pledge?: string;
  current_city?: string;
  nationality?: string;
  country_tier?: string;
  [key: string]: any;
}
export interface PlayerAccount {
  total_karma?: number;
  unlocked_perks?: string[];
  reincarnation_count?: number;
  [key: string]: any;
}
export interface Visuals { personality_badges?: any[]; visual_vibe?: { background_scene?: string; [key: string]: any }; [key: string]: any }
export interface Asset { id: string; name: string; type: string; buy_price: number; current_value: number; [key: string]: any }
export interface Relationship { id: string; name: string; affinity: number; type: string; status?: string; [key: string]: any }
export interface Npc { id?: string; [key: string]: any }
export interface Dilemma {
  interaction_type?: string;
  options?: { id: string; [key: string]: any }[];
  trilemma_options?: { id: string; [key: string]: any }[];
  has_npc_interaction?: boolean;
  active_npc?: unknown;
  [key: string]: any;
}
export interface LineageEntry { id?: string; is_demo?: boolean; [key: string]: any }

/** Response of /state, /tick and other state-returning endpoints (all optional, nothing invented). */
export interface GameStateResponse {
  character?: Character | null;
  player_account?: PlayerAccount | null;
  visuals?: Visuals | null;
  assets?: Asset[];
  relationships?: Relationship[];
  npcs?: Npc[];
  dilemma?: Dilemma | null;
  can_transhuman?: boolean;
  breakthrough_action?: unknown;
  incoming_npc_event?: unknown;
  scenario?: unknown;
  aspiration?: any;
  passiveSummary?: { annual_digest?: any; converted_ap_notice?: string; unused_ap_vitality_gain?: number; unused_ap_burnout_relief?: number; [key: string]: any };
  combo_triggered?: any;
  message?: string;
  [key: string]: any;
}

// ---- action-id injection. Session id/token are issued by the server and attached in layout.tsx. ----
if (typeof window !== 'undefined' && !(window as any).__lgFetchPatched) {
  (window as any).__lgFetchPatched = true;
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    const headers = new Headers(init?.headers || {});
    if ((init?.method ?? 'GET').toUpperCase() === 'POST' && !headers.has('x-action-id')) headers.set('x-action-id', crypto.randomUUID());
    return originalFetch.call(this, input, { ...init, headers });
  };
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface ApiOptions {
  /** Which error-body keys to read for the message, in order (default message then error). */
  errorKeys?: ('message' | 'error')[];
  /** Message used when the error body has none (default `HTTP <status>`). */
  fallback?: string;
  /** Do not throw on non-2xx; return the parsed body anyway. */
  lenient?: boolean;
  credentials?: RequestCredentials;
}

async function request<T>(method: 'GET' | 'POST', path: string, body: unknown, opts: ApiOptions): Promise<T> {
  const init: RequestInit = { method };
  if (opts.credentials) init.credentials = opts.credentials;
  if (method === 'POST' && body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  } else if (method === 'POST') {
    init.headers = { 'Content-Type': 'application/json' };
  }
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok && !opts.lenient) {
    const err = await res.json().catch(() => ({}));
    const keys = opts.errorKeys ?? ['message', 'error'];
    let msg: string | undefined;
    for (const k of keys) { if (err?.[k]) { msg = err[k]; break; } }
    throw new ApiError(msg || opts.fallback || `HTTP ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

export const apiGet = <T = GameStateResponse>(path: string, opts: ApiOptions = {}) => request<T>('GET', path, undefined, opts);
export const apiPost = <T = GameStateResponse>(path: string, body?: unknown, opts: ApiOptions = {}) => request<T>('POST', path, body, opts);

// ---- Account (login/register) client. Endpoints: /api/game/account-auth/* (docs/accounts-backend-2026-11-12.md) ----
export const ACCOUNT_BASE = '/api/game/account-auth';
export const LS_ACCOUNT_TOKEN = 'lifegraph_account_token';
export const LS_ACCOUNT_NAME = 'lifegraph_account_name';
export const LS_SESSION_TOKEN = 'lifegraph_session_token';
export const LS_SESSION_ID = 'lifegraph_session_id';

export interface AccountAuthResponse { username: string; session_id: string; session_token: string; account_token: string; linked?: boolean }
export interface GuestSession { token: string; id: string }

const lsGet = (k: string) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const lsSet = (k: string, v: string) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch { /* storage blocked */ } };

export const getAccountToken = () => lsGet(LS_ACCOUNT_TOKEN);
export const getAccountName = () => lsGet(LS_ACCOUNT_NAME);
export const readGuestSession = (): GuestSession => ({ token: lsGet(LS_SESSION_TOKEN), id: lsGet(LS_SESSION_ID) });
/** Same keys layout.tsx bootstraps with; empty values clear them so the next load handshakes a fresh guest. */
export const writeGameSession = (s: GuestSession) => { lsSet(LS_SESSION_TOKEN, s.token); lsSet(LS_SESSION_ID, s.id); };
export const storeAccount = (token: string, name: string) => { lsSet(LS_ACCOUNT_TOKEN, token); lsSet(LS_ACCOUNT_NAME, name); };

/** Calls an account-auth endpoint. Never throws on HTTP errors: returns { status, data } (status 0 = network failure). */
export async function accountCall<T = any>(
  path: string, method: 'GET' | 'POST', body?: unknown, extraHeaders: Record<string, string> = {},
): Promise<{ status: number; data: T & { error?: string } }> {
  const headers: Record<string, string> = { ...extraHeaders };
  const token = getAccountToken();
  if (token && !headers['x-account-token']) headers['x-account-token'] = token;
  if (method === 'POST') headers['Content-Type'] = 'application/json';
  try {
    const res = await fetch(`${ACCOUNT_BASE}${path}`, { method, headers, body: method === 'POST' ? JSON.stringify(body ?? {}) : undefined });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch {
    return { status: 0, data: { error: 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.' } as any };
  }
}
