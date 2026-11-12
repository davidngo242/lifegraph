'use client';

// Account session flow (register / login / logout / link-guest). Guest play never touches these paths.
import { useState, useEffect, useCallback } from 'react';
import {
  accountCall, getAccountToken, getAccountName, storeAccount, readGuestSession, writeGameSession,
} from '../lib/api';
import type { AccountAuthResponse, GuestSession } from '../lib/api';

export type AccountMode = 'login' | 'register';

export interface LinkConflict {
  message: string;
  /** true when the account already owns a game, so "replace" is offered; false = guest session belongs to another account. */
  canReplace: boolean;
  guest: GuestSession;
  account: AccountAuthResponse;
}

export interface SubmitResult { ok: boolean; error?: string; conflict?: LinkConflict }

const reload = () => { if (typeof window !== 'undefined') window.location.reload(); };

export function useAccount() {
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (!getAccountToken()) return;
    setUsername(getAccountName());
    // Verify the stored token; a revoked/expired one silently falls back to guest.
    accountCall('/me', 'GET').then(({ status, data }) => {
      if (status === 200 && data.username) { setUsername(data.username); storeAccount(getAccountToken(), data.username); }
      else if (status === 401) { storeAccount('', ''); setUsername(''); }
    });
  }, []);

  const finish = (acc: AccountAuthResponse): SubmitResult => {
    storeAccount(acc.account_token, acc.username);
    writeGameSession({ token: acc.session_token, id: acc.session_id });
    reload();
    return { ok: true };
  };

  const submit = useCallback(async (mode: AccountMode, name: string, password: string, hasGuestCharacter: boolean): Promise<SubmitResult> => {
    const guest = readGuestSession(); // capture BEFORE the auth call: its response headers overwrite the stored session
    const { status, data } = await accountCall<AccountAuthResponse>(`/${mode}`, 'POST', { username: name, password });
    if (status !== 200 || !data.account_token) {
      writeGameSession(guest);
      return { ok: false, error: data.error || 'Không thể hoàn tất. Vui lòng thử lại.' };
    }
    const acc = data as AccountAuthResponse;
    if (mode !== 'register' || !hasGuestCharacter || !guest.token) return finish(acc);

    // Register while holding a guest game: attach it so progress is kept.
    const link = await accountCall<AccountAuthResponse>('/link-guest', 'POST', {}, {
      'x-account-token': acc.account_token, 'x-session-token': guest.token, 'x-session-id': guest.id,
    });
    if (link.status === 200 && link.data.session_token) {
      return finish({ ...acc, ...link.data, account_token: link.data.account_token || acc.account_token });
    }
    writeGameSession(guest);
    storeAccount(acc.account_token, acc.username);
    if (link.status === 409) {
      const message = link.data.error || '';
      return { ok: false, conflict: { message, canReplace: /tiến trình/.test(message), guest, account: acc } };
    }
    // Account exists but the game could not be attached: keep the guest game and say so.
    setUsername(acc.username);
    return { ok: false, error: link.data.error || 'Đã tạo tài khoản nhưng chưa gắn được tiến trình khách. Hãy đăng nhập lại để thử lần nữa.' };
  }, []);

  /** 409 resolution. replace=false keeps the account's own game (guest game is not linked); replace=true overwrites it. Never automatic. */
  const resolveConflict = useCallback(async (c: LinkConflict, replace: boolean): Promise<SubmitResult> => {
    if (!replace) return finish(c.account);
    const link = await accountCall<AccountAuthResponse>('/link-guest', 'POST', { replace: true }, {
      'x-account-token': c.account.account_token, 'x-session-token': c.guest.token, 'x-session-id': c.guest.id,
    });
    if (link.status === 200 && link.data.session_token) {
      return finish({ ...c.account, ...link.data, account_token: link.data.account_token || c.account.account_token });
    }
    writeGameSession(c.guest);
    return { ok: false, error: link.data.error || 'Không thể thay thế tiến trình.' };
  }, []);

  /** Abandon a pending conflict: drop the account login, keep playing the guest game. */
  const cancelConflict = useCallback((c: LinkConflict) => {
    storeAccount('', '');
    writeGameSession(c.guest);
    setUsername('');
  }, []);

  const logout = useCallback(async () => {
    await accountCall('/logout', 'POST');
    storeAccount('', '');
    writeGameSession({ token: '', id: '' }); // next load handshakes a brand-new guest session
    reload();
  }, []);

  return { username, submit, resolveConflict, cancelConflict, logout };
}
