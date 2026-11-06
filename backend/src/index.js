import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from './routes/game.js';
import { initDb, sessionContext } from './db/db.js';
import {
  signSessionToken,
  verifySessionToken,
  checkRateLimit,
  logSecurityIncident
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
app.use((req, res, next) => {
  const rawToken = req.headers['x-session-token'] || req.headers['x-session-id'] || req.query.session_id;

  let sessionId = 'default';
  let isCryptographicallyVerified = false;

  if (rawToken) {
    const verifiedId = verifySessionToken(rawToken);
    if (verifiedId) {
      sessionId = verifiedId;
      isCryptographicallyVerified = true;
    } else {
      // Nếu là raw ID chưa ký (phiên khởi tạo từ client mới), làm sạch ký tự an toàn
      sessionId = String(rawToken).replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64) || 'user_' + Date.now();
    }
  }

  // Tự động cấp/làm mới signed token kèm chữ ký HMAC trả về cho client
  const signedToken = signSessionToken(sessionId);
  res.setHeader('x-session-token', signedToken);

  sessionContext.run({ sessionId, isCryptographicallyVerified }, () => {
    next();
  });
});

// Routes
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

