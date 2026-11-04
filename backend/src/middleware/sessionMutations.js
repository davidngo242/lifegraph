import { getCurrentSessionId, getSessionData, scheduleDiskPersist } from '../db/db.js';

const pending = new Map();
/** Serialize mutations of a session, and replay successful transport retries. */
export function sessionMutations(req, res, next) {
  if (req.method !== 'POST') return next();
  const session = getCurrentSessionId();
  const previous = pending.get(session) ?? Promise.resolve();
  let release;
  const finished = new Promise(resolve => { release = resolve; });
  const queued = previous.then(() => finished);
  pending.set(session, queued);
  previous.then(() => {
    const key = req.get('x-action-id');
    const store = getSessionData();
    const fingerprint = JSON.stringify([req.path, req.body]);
    const receipt = key && store.actionReceipts?.find(r => r.key === key);
    const done = () => { release(); if (pending.get(session) === queued) pending.delete(session); };
    res.once('finish', done); res.once('close', done);
    if (receipt) {
      if (receipt.fingerprint !== fingerprint) return res.status(409).json({ error: 'Mã hành động đã dùng cho yêu cầu khác.' });
      return res.json(receipt.body);
    }
    const json = res.json.bind(res);
    res.json = body => {
      if (key && /^[a-zA-Z0-9_-]{8,100}$/.test(key) && res.statusCode < 400) {
        store.actionReceipts ??= [];
        store.actionReceipts.push({ key, fingerprint, body: structuredClone(body) });
        store.actionReceipts = store.actionReceipts.slice(-40);
        scheduleDiskPersist();
      }
      return json(body);
    };
    next();
  }).catch(next);
}
