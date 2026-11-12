// Gia phả liên người chơi (bất đồng bộ): Bia Tưởng Niệm công khai. Chỉ TÀI KHOẢN; không chuyển tiền/tài sản.
// Gắn tại /api/game/shared-lineage. Xem docs/shared-lineage-2026-11-12.md.
import express from 'express';
import { requireAccount } from './auth.js';
import { sessionContext, getAncestralLineage } from '../db/db.js';
import { checkRateLimit, logSecurityIncident } from '../security/securityEngine.js';
import { cleanPublicText, containsProfanity } from '../security/contentFilter.js';
import * as store from '../db/sharedLineageStore.js';

const router = express.Router();
const ID_RE = /^sm_[0-9a-f]{16}$/;
const EPITAPH_MAX = 200;
const HOUR = 3600e3;
const fail = (res, status, error) => res.status(status).json({ error });
const serverError = (res, where, err) => { console.error(`[SharedLineage] ${where} failed:`, err.message); fail(res, 500, 'Lỗi máy chủ.'); };

router.use(requireAccount);

/** Tham số phân trang luôn bị kẹp vào khoảng an toàn; giá trị lạ -> mặc định. */
function pageParams(q) {
  const num = v => (typeof v === 'string' && /^\d{1,9}$/.test(v) ? Number(v) : NaN);
  const limit = num(q.limit);
  const offset = num(q.offset);
  return {
    limit: Number.isFinite(limit) ? Math.min(50, Math.max(1, limit)) : 20,
    offset: Number.isFinite(offset) ? Math.min(10000, offset) : 0,
    sort: q.sort === 'incense' ? 'incense' : 'new',
  };
}

const withId = handler => async (req, res) => {
  if (!ID_RE.test(req.params.id)) return fail(res, 404, 'Không tìm thấy bia tưởng niệm.');
  try { await handler(req, res); } catch (err) { serverError(res, req.method + ' ' + req.route.path, err); }
};
const NOT_FOUND = 'Không tìm thấy bia tưởng niệm.';

router.get('/', async (req, res) => {
  try {
    const p = pageParams(req.query);
    const { items, total } = await store.listMemorials({ ...p, viewerId: req.account.id });
    res.json({ items, total, limit: p.limit, offset: p.offset, sort: p.sort });
  } catch (err) { serverError(res, 'list', err); }
});

router.get('/mine', async (req, res) => {
  try { res.json({ items: await store.listMine(req.account.id) }); } catch (err) { serverError(res, 'mine', err); }
});

router.get('/adopted', async (req, res) => {
  try {
    const out = await store.listAdopted(req.account.id);
    res.json({ ...out, karma_start_bonus_cap: store.BLESSING_CAP });
  } catch (err) { serverError(res, 'adopted', err); }
});

router.post('/publish', async (req, res) => {
  try {
    const { memorial_id: sourceId, consent, epitaph } = req.body || {};
    if (consent !== true) return fail(res, 400, 'Cần đồng ý rõ ràng để đăng bia lên Bia Tưởng Niệm chung.');
    if (typeof sourceId !== 'string' || !sourceId || sourceId.length > 100) return fail(res, 400, 'Thiếu bia cần đăng.');
    if (epitaph !== undefined && typeof epitaph !== 'string') return fail(res, 400, 'Lời bia phải là văn bản.');

    // Chỉ đăng được bia thuộc gia phả CỦA CHÍNH tài khoản; dữ liệu lấy từ máy chủ, không tin client (trừ lời bia).
    const lineage = await sessionContext.run({ sessionId: req.account.session_id }, () => getAncestralLineage());
    const src = (lineage || []).find(i => i && i.id === sourceId && !i.is_demo && i.id !== 'founder_gen_1');
    if (!src) return fail(res, 404, 'Không tìm thấy tiền nhân này trong gia phả của bạn.');

    const fields = {
      ancestorName: cleanPublicText(String(src.name ?? ''), 60),
      nationality: cleanPublicText(String(src.nationality ?? ''), 40),
      cause: cleanPublicText(String(src.cause_of_passing ?? ''), 100),
      aspiration: cleanPublicText(String(src.aspiration_title ?? ''), 80),
      epitaph: cleanPublicText(epitaph ?? String(src.epitaph_quote ?? ''), EPITAPH_MAX),
    };
    if (!fields.ancestorName) fields.ancestorName = 'Tiền nhân vô danh';
    if (Object.values(fields).some(containsProfanity)) {
      return fail(res, 422, 'Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh lại lời bia.');
    }
    if (!checkRateLimit('slpub_' + req.account.id, 5, HOUR)) {
      return res.status(429).json({ error: 'Bạn đăng quá nhiều, vui lòng thử lại sau.', retryAfterSeconds: 600 });
    }
    const out = await store.publishMemorial({
      accountId: req.account.id, sourceId, displayName: req.account.username,
      age: Math.max(0, Math.min(200, Math.trunc(Number(src.age)) || 0)), ...fields,
    });
    if (out.error) return fail(res, 409, 'Kiếp này đã được đăng (mỗi kiếp chỉ đăng một lần).');
    res.status(201).json({ memorial: out.memorial });
  } catch (err) { serverError(res, 'publish', err); }
});

router.post('/:id/incense', withId(async (req, res) => {
  if (!checkRateLimit('slinc_' + req.account.id, 60, 60000)) return res.status(429).json({ error: 'Thao tác quá nhanh.', retryAfterSeconds: 10 });
  const out = await store.incense(req.params.id, req.account.id);
  if (out.error === 'notfound') return fail(res, 404, NOT_FOUND);
  if (out.error === 'duplicate') return fail(res, 409, 'Hôm nay bạn đã thắp hương cho bia này rồi.');
  res.json({ ok: true, incense_count: out.incense_count });
}));

router.post('/:id/adopt', withId(async (req, res) => {
  if (!checkRateLimit('sladopt_' + req.account.id, 20, 60000)) return res.status(429).json({ error: 'Thao tác quá nhanh.', retryAfterSeconds: 10 });
  const out = await store.adopt(req.params.id, req.account.id);
  if (out.error === 'notfound') return fail(res, 404, NOT_FOUND);
  if (out.error === 'own') return fail(res, 403, 'Không thể nhận chính tiền nhân của mình.');
  if (out.error === 'duplicate') return fail(res, 409, 'Bạn đã nhận tiền nhân này rồi.');
  if (out.error === 'cap') return res.status(429).json({ error: `Mỗi ngày chỉ nhận tối đa ${store.ADOPT_DAILY_CAP} tiền nhân.`, retryAfterSeconds: 3600 });
  // Chỉ ân huệ nhỏ có trần; tuyệt đối không chuyển tiền, tài sản hay nhân vật.
  res.json({ ok: true, blessing: { karma_start_bonus: out.karma_start_bonus, cap: store.BLESSING_CAP } });
}));

router.post('/:id/report', withId(async (req, res) => {
  if (!checkRateLimit('slrep_' + req.account.id, 10, HOUR)) return res.status(429).json({ error: 'Bạn báo cáo quá nhiều, vui lòng thử lại sau.', retryAfterSeconds: 600 });
  const reason = cleanPublicText(typeof req.body?.reason === 'string' ? req.body.reason : '', 40);
  const out = await store.report(req.params.id, req.account.id, reason);
  if (out.error === 'notfound') return fail(res, 404, NOT_FOUND);
  if (out.error === 'own') return fail(res, 403, 'Không thể báo cáo bia của chính mình (hãy gỡ bia).');
  if (out.error === 'duplicate') return fail(res, 409, 'Bạn đã báo cáo bia này rồi.');
  if (out.hidden) logSecurityIncident('SHARED_MEMORIAL_AUTOHIDDEN', { memorial: req.params.id });
  res.json({ ok: true });
}));

router.delete('/:id', withId(async (req, res) => {
  // Không phải chủ -> 404 (không lộ bia có tồn tại hay không).
  if (!(await store.unpublish(req.params.id, req.account.id))) return fail(res, 404, NOT_FOUND);
  res.json({ ok: true });
}));

export default router;
