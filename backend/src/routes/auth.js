import express from 'express';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import {
  createAccount, getAccountByUsername, getAccountById, getAccountBySessionId,
  setAccountSession, bumpAccountEpoch, sessionHasCharacter, getCurrentSessionId, sessionContext
} from '../db/db.js';
import {
  signSessionToken, signAccountToken, verifyAccountToken, mintSessionId,
  checkRateLimit, logSecurityIncident, logGuestEvent, hashIp
} from '../security/securityEngine.js';

const scrypt = promisify(crypto.scrypt);
const KEY_LEN = 64;
const USERNAME_RE = /^[\p{L}\p{N}_.-]{3,32}$/u;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128; // chặn mật khẩu khổng lồ làm nghẽn scrypt
const LOGIN_MAX_PER_MIN = 10;
const LOGIN_MAX_PER_IP_PER_MIN = 60; // chặn rải nhiều tên để vắt kiệt scrypt
const REGISTER_MAX_PER_MIN = 20;
const GENERIC_LOGIN_ERROR = 'Sai tên đăng nhập hoặc mật khẩu.';
const DUMMY_SALT = crypto.randomBytes(16).toString('hex');

const router = express.Router();

const normalizeUsername = u => (typeof u === 'string' ? u.trim().normalize('NFC').toLowerCase() : '');
const clientIp = req => req.ip || req.connection?.remoteAddress || 'unknown';

async function hashPassword(password, saltHex) {
  return (await scrypt(password, Buffer.from(saltHex, 'hex'), KEY_LEN)).toString('hex');
}
async function verifyPassword(password, saltHex, hashHex) {
  const expected = Buffer.from(hashHex, 'hex');
  const given = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(given, expected);
}

/** Phát token tài khoản + token phiên của tài khoản; đổi header để client dùng đúng phiên game. */
function issue(res, account, extra = {}) {
  const sessionToken = signSessionToken(account.session_id);
  res.setHeader('x-session-token', sessionToken);
  res.setHeader('x-session-id', account.session_id);
  return res.json({
    username: account.username,
    session_id: account.session_id,
    session_token: sessionToken,
    account_token: signAccountToken(account.id, account.token_epoch || 0),
    ...extra
  });
}

/** Đọc account token từ header (x-account-token hoặc Authorization: Bearer) và đối chiếu epoch. */
async function authenticate(req) {
  const bearer = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  const verified = verifyAccountToken(req.headers['x-account-token'] || (bearer && bearer[1]));
  if (!verified) return null;
  const account = await getAccountById(verified.accountId);
  if (!account || (account.token_epoch || 0) !== verified.epoch) return null;
  return account;
}
const requireAccount = async (req, res, next) => {
  try {
    const account = await authenticate(req);
    if (!account) return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.' });
    req.account = account;
    next();
  } catch (err) {
    console.error('[Accounts] authenticate failed:', err.message);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
};

router.post('/register', async (req, res) => {
  try {
    if (!checkRateLimit('register_' + clientIp(req), REGISTER_MAX_PER_MIN, 60000)) {
      return res.status(429).json({ error: 'Thao tác quá nhanh, vui lòng thử lại sau.', retryAfterSeconds: 30 });
    }
    const username = normalizeUsername(req.body?.username);
    const password = req.body?.password;
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ error: 'Tên đăng nhập gồm 3-32 ký tự (chữ, số, _ . -).' });
    }
    if (typeof password !== 'string' || password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      return res.status(400).json({ error: `Mật khẩu phải từ ${PASSWORD_MIN} đến ${PASSWORD_MAX} ký tự.` });
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const account = await createAccount({ username, passHash: await hashPassword(password, salt), salt, sessionId: mintSessionId() });
    if (!account) return res.status(409).json({ error: 'Tên đăng nhập đã được sử dụng.' });
    logGuestEvent('account_registered', { ip: hashIp(clientIp(req)) });
    return issue(res, account);
  } catch (err) {
    console.error('[Accounts] register failed:', err.message);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const username = normalizeUsername(req.body?.username);
    const password = req.body?.password;
    if (!username || username.length > 64 || typeof password !== 'string' || !password || password.length > PASSWORD_MAX) {
      return res.status(400).json({ error: 'Cần nhập tên đăng nhập và mật khẩu.' });
    }
    if (!checkRateLimit('loginip_' + clientIp(req), LOGIN_MAX_PER_IP_PER_MIN, 60000)) {
      logSecurityIncident('LOGIN_RATE_LIMITED', { ip: hashIp(clientIp(req)) });
      return res.status(429).json({ error: 'Quá nhiều lần thử, vui lòng thử lại sau ít phút.', retryAfterSeconds: 60 });
    }
    // Giới hạn theo IP + tên đăng nhập; tính cả lần đúng để không lộ mật khẩu qua việc bị khoá.
    if (!checkRateLimit(`login_${clientIp(req)}_${username}`, LOGIN_MAX_PER_MIN, 60000)) {
      logSecurityIncident('LOGIN_RATE_LIMITED', { ip: hashIp(clientIp(req)) });
      return res.status(429).json({ error: 'Quá nhiều lần thử, vui lòng thử lại sau ít phút.', retryAfterSeconds: 60 });
    }
    const account = await getAccountByUsername(username);
    // Luôn chạy scrypt (kể cả khi tên không tồn tại) để thời gian phản hồi không lộ tên có thật.
    const ok = account
      ? await verifyPassword(password, account.salt, account.pass_hash)
      : (await hashPassword(password, DUMMY_SALT), false);
    if (!ok) return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
    return issue(res, account);
  } catch (err) {
    console.error('[Accounts] login failed:', err.message);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
});

router.post('/logout', requireAccount, async (req, res) => {
  try {
    await bumpAccountEpoch(req.account.id); // thu hồi mọi account token đã cấp
    res.json({ ok: true });
  } catch (err) {
    console.error('[Accounts] logout failed:', err.message);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
});

router.get('/me', requireAccount, (req, res) => {
  const { username, session_id, created_at } = req.account;
  res.json({ username, session_id, created_at });
});

/** Gắn phiên khách HIỆN TẠI vào tài khoản để giữ tiến trình. Tiến trình sẵn có của tài khoản không bị ghi đè trừ khi replace=true. */
router.post('/link-guest', requireAccount, async (req, res) => {
  try {
    const guestId = getCurrentSessionId();
    const store = sessionContext.getStore();
    if (!store?.isCryptographicallyVerified || guestId === 'default') {
      return res.status(400).json({ error: 'Không có phiên khách hợp lệ để liên kết.' });
    }
    const account = req.account;
    if (account.session_id === guestId) return issue(res, account, { linked: true });
    const owner = await getAccountBySessionId(guestId);
    if (owner) return res.status(409).json({ error: 'Phiên này đã thuộc một tài khoản.' });
    if (req.body?.replace !== true && await sessionHasCharacter(account.session_id)) {
      return res.status(409).json({ error: 'Tài khoản đã có tiến trình. Gửi replace=true để thay bằng phiên khách này.' });
    }
    if (!(await setAccountSession(account.id, guestId))) {
      return res.status(409).json({ error: 'Không thể liên kết phiên này.' });
    }
    logGuestEvent('guest_linked', { session: guestId.slice(0, 10), ip: hashIp(clientIp(req)) });
    return issue(res, { ...account, session_id: guestId }, { linked: true });
  } catch (err) {
    console.error('[Accounts] link-guest failed:', err.message);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
});

export default router;
