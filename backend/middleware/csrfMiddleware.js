const config = require("../config/env");
const { sendError } = require("../utils/apiResponse");

const csrfProtection = (req, res, next) => {
  // Safe read-only methods are allowed without origin check
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // If request does not use cookies, skip CSRF
  if (!req.cookies || (!req.cookies.accessToken && !req.cookies.refreshToken)) {
    return next();
  }

  // Webhook endpoints (e.g. Stripe) are verified via signatures, skip CSRF
  if (req.originalUrl.includes("/api/payments/webhook")) {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;

  if (!origin) {
    return next(); // Allow programmatic requests in dev
  }

  try {
    const originUrl = new URL(origin);
    const allowedUrl = new URL(config.FRONTEND_URL);

    if (
      originUrl.hostname === allowedUrl.hostname ||
      originUrl.hostname === "localhost" ||
      originUrl.hostname === "127.0.0.1"
    ) {
      return next();
    }

    return sendError(res, "Cross-Site Request Forgery (CSRF) blocked. Invalid request origin.", 403);
  } catch {
    return next();
  }
};

module.exports = {
  csrfProtection,
};
