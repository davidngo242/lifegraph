import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from './routes/game.js';
import authRoutes from './routes/auth.js';
import sharedLineageRoutes from './routes/shared_lineage.js';
import { initDb, sessionContext, claimLegacySession } from './db/db.js';
import {
  signSessionToken,
  verifySessionToken,
  checkRateLimit,
  logSecurityIncident,
  mintSessionId,
  logGuestEvent,
  hashIp
} from './security/securityEngine.js';

dotenv.config();

export const app = express();
const PORT = parseInt(process.env.PORT, 10) || 10000;

// Enable reverse proxy support (Render, Vercel, Cloudflare)
app.set('trust proxy', 1);

// Fast Health Check Endpoint (Đặt đầu tiên để Render / Vercel ping tức thời không bao giờ nghẽn)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    security: 'multi-layer-active',
    port: PORT,
    time: new Date().toISOString()
  });
});
app.get('/', (req, res) => {
  res.send('LifeGraph Backend Engine is Live & Healthy.');
});

// =========================================================================
// LAYER 1: NETWORK & PERIMETER SECURITY (SECURITY HEADERS + CORS)
// =========================================================================
app.use((req, res, next) => {
  // Anti-clickjacking, XSS protection & MIME sniffing prevention
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Cache Buster for Real-Time Dynamic Game Simulation
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  next();
});

// CORS: Cho phép bất kỳ Frontend nào gọi tới (Vercel, Localhost, Mobile)
app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: ['x-session-token']
}));

// Body Parser with strict payload size limit (Anti-DoS memory exhaustion)
app.use(express.json({ limit: '200kb' }));

// =========================================================================
// LAYER 2: ANTI-SPAM & RATE LIMITING (SLIDING WINDOW)
// =========================================================================
app.use((req, res, next) => {
  // Bỏ qua rate limit cho health check
  if (req.path === '/health' || process.env.NODE_ENV === 'test') return next();

  const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
  const token = req.headers['x-session-token'] || req.headers['x-session-id'] || 'anonymous';
  const rateLimitKey = `${clientIp}_${token}`;

  // Tối đa 120 requests/phút cho mỗi client/IP
  if (!checkRateLimit(rateLimitKey, 120, 60000)) {
    logSecurityIncident('RATE_LIMIT_EXCEEDED', { ip: clientIp, token, path: req.path });
    return res.status(429).json({
      error: 'Tần suất thao tác quá nhanh. Hệ thống bảo mật đã tạm khóa luồng, vui lòng thử lại sau vài giây.',
      retryAfterSeconds: 5
    });
  }
  next();
});

// =========================================================================
// LAYER 3: CRYPTOGRAPHIC SESSION ISOLATION & HMAC SIGNATURE VERIFICATION
// =========================================================================
app.use(async (req, res, next) => {
  const rawToken = req.headers['x-session-token'] || req.headers['x-session-id'] || req.query.session_id;

  let sessionId = null;
  let isCryptographicallyVerified = false;
  const allowRaw = process.env.NODE_ENV === 'test' || process.env.ALLOW_RAW_SESSION_ID === '1';
  const ipHash = hashIp(req.ip || 'unknown');

  const verifiedId = rawToken ? verifySessionToken(rawToken) : null;
  if (verifiedId) {
    sessionId = verifiedId;
    isCryptographicallyVerified = true;
  } else {
    const rawId = String(req.headers['x-session-id'] || req.query.session_id || rawToken || '')
      .replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64);
    if (rawId && allowRaw) {
      sessionId = rawId;
    } else if (rawId && await claimLegacySession(rawId)) {
      // Người chơi cũ: nhận lại đúng phiên (cache hoặc Postgres) MỘT LẦN, sau đó chỉ vào bằng token có chữ ký.
      sessionId = rawId;
      isCryptographicallyVerified = true;
      logGuestEvent('legacy_claimed', { session: rawId.slice(0, 12), ip: ipHash });
    } else {
      if (process.env.NODE_ENV !== 'test' && !checkRateLimit('mint_' + (req.ip || 'unknown'), 30, 60000)) {
        logGuestEvent('mint_rate_limited', { ip: ipHash });
        return res.status(429).json({ error: 'Quá nhiều phiên mới từ cùng địa chỉ, vui lòng thử lại sau.', retryAfterSeconds: 30 });
      }
      sessionId = mintSessionId();
      isCryptographicallyVerified = true;
      logGuestEvent(rawId ? 'raw_id_rejected_new_minted' : 'guest_created', {
        session: sessionId.slice(0, 10), ip: ipHash, ua: String(req.headers['user-agent'] || '').slice(0, 80)
      });
    }
  }

  res.setHeader('x-session-token', signSessionToken(sessionId));
  res.setHeader('x-session-id', sessionId);

  sessionContext.run({ sessionId, isCryptographicallyVerified }, () => {
    next();
  });
});

// Routes (tài khoản gắn trước để không đi qua middleware ghi trạng thái game)
app.use('/api/game/account-auth', authRoutes);
app.use('/api/game/shared-lineage', sharedLineageRoutes);
app.use('/api/game', gameRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    security: 'multi-layer-active',
    time: new Date().toISOString()
  });
});

async function bootstrap() {
  await initDb();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ [LifeGraph Security] Server is running on http://0.0.0.0:${PORT} with Multi-layer Defense.`);
  });
}

if (process.env.NODE_ENV !== 'test') bootstrap();

