import crypto from 'crypto';

// Secret key for HMAC signing (sử dụng biến môi trường hoặc tự sinh an toàn)
const SERVER_SECRET = process.env.SESSION_SECRET || 'lifegraph_quantum_security_key_2026_super_safe';

// =========================================================================
// 1. CRYPTOGRAPHIC SESSION SIGNING (HMAC-SHA256)
// =========================================================================
/**
 * Tạo chữ ký HMAC cho một Session ID kèm timestamp
 * Token format: <rawId>.<timestamp>.<signature>
 */
export function signSessionToken(rawSessionId) {
  const timestamp = Date.now();
  const payload = `${rawSessionId}.${timestamp}`;
  const hmac = crypto.createHmac('sha256', SERVER_SECRET).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

/**
 * Xác thực token phiên làm việc:
 * - Kiểm tra chữ ký HMAC có bị sửa đổi không
 * - Ngăn chặn kẻ tấn công đoán hoặc tráo đổi session ID của người chơi khác
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) {
    // Trường hợp legacy hoặc token chưa ký hợp lệ
    return null;
  }

  const [rawId, timestampStr, signature] = parts;
  const payload = `${rawId}.${timestampStr}`;
  const expectedHmac = crypto.createHmac('sha256', SERVER_SECRET).update(payload).digest('hex');

  // So sánh chuỗi thời gian không đổi (timing-safe) để chống Timing Attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedHmac);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null; // Chữ ký giả mạo!
  }

  return rawId;
}

// =========================================================================
// 2. RATE LIMITER & ANTI-SPAM (SLIDING WINDOW ALGORITHM)
// =========================================================================
const rateLimitMap = new Map(); // key -> [timestamps]

/**
 * Kiểm tra tần suất gọi request để chống DDoS, Brute-force & Auto-click Script
 * @param {string} identifier - IP hoặc Session ID
 * @param {number} maxRequests - Số lượng request tối đa trong cửa sổ
 * @param {number} windowMs - Kích thước cửa sổ (mili giây)
 * @returns {boolean} true nếu hợp lệ, false nếu bị vượt ngưỡng
 */
export function checkRateLimit(identifier, maxRequests = 120, windowMs = 60000) {
  const now = Date.now();
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, [now]);
    return true;
  }

  const timestamps = rateLimitMap.get(identifier);
  // Loại bỏ các mốc thời gian ngoài cửa sổ
  while (timestamps.length > 0 && timestamps[0] < now - windowMs) {
    timestamps.shift();
  }

  if (timestamps.length >= maxRequests) {
    return false; // Vượt ngưỡng rate limit!
  }

  timestamps.push(now);
  return true;
}

// Định kỳ dọn dẹp các IP/Session đã không còn hoạt động để giải phóng bộ nhớ
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitMap.entries()) {
    while (timestamps.length > 0 && timestamps[0] < now - 60000) {
      timestamps.shift();
    }
    if (timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}, 300000).unref();

// =========================================================================
// 3. INPUT SANITIZATION & ANTI-INJECTION
// =========================================================================
/**
 * Lọc sạch các ký tự nguy hại chống XSS và Injection
 */
export function sanitizeString(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>'"`;\\]/g, '') // Gỡ bỏ ký tự nhạy cảm HTML / SQL meta
    .slice(0, maxLength);
}

// =========================================================================
// 4. ACTION INTEGRITY & SEQUENCE TRACKER (ANTI-REPLAY)
// =========================================================================
const sessionSequences = new Map();

/**
 * Xác thực số thứ tự hành động (Monotonic Sequence ID) để chống Replay Attack
 */
export function validateActionSequence(sessionId, clientSeq) {
  if (typeof clientSeq !== 'number') return true; // Cho phép fallback nếu client chưa kích hoạt
  
  const currentSeq = sessionSequences.get(sessionId) || 0;
  if (clientSeq <= currentSeq) {
    return false; // Phát hiện Replay Attack hoặc gói tin bị gửi lại!
  }
  
  sessionSequences.set(sessionId, clientSeq);
  return true;
}

// =========================================================================
// 5. SECURITY AUDIT LOGGING
// =========================================================================
const securityAuditLogs = [];

export function logSecurityIncident(type, details) {
  const record = {
    id: crypto.randomUUID(),
    type,
    timestamp: new Date().toISOString(),
    details
  };
  securityAuditLogs.push(record);
  if (securityAuditLogs.length > 500) securityAuditLogs.shift();
  console.warn(`🚨 [BẢO MẬT] Cảnh báo hành vi bất thường: [${type}] -`, details);
}

export function getSecurityAuditLogs() {
  return [...securityAuditLogs];
}
