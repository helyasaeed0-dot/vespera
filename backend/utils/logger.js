/**
 * Safe structured logger that redacts sensitive information.
 */
const SENSITIVE_KEYS = ["password", "token", "accessToken", "refreshToken", "secret", "cvc", "authorization"];

function redact(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(redact);
  const sanitized = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s))) {
      sanitized[k] = "[REDACTED]";
    } else if (typeof v === "object") {
      sanitized[k] = redact(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

const logger = {
  info: (msg, meta = {}) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? redact(meta) : "");
  },
  warn: (msg, meta = {}) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? redact(meta) : "");
  },
  error: (msg, meta = {}) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? redact(meta) : "");
  },
};

module.exports = logger;
