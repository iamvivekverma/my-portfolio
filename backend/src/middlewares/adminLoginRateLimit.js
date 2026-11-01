const rateLimit = require('express-rate-limit');
const { getClientIp } = require('../lib/inputSecurity');
const { logSecurityEvent } = require('../lib/securityLogger');

const ADMIN_LOGIN_WINDOW_MS = Number(process.env.ADMIN_LOGIN_RATE_WINDOW_MS || 15 * 60 * 1000);
const ADMIN_LOGIN_MAX_ATTEMPTS = Number(process.env.ADMIN_LOGIN_MAX_ATTEMPTS || 8);

const adminLoginRateLimit = rateLimit({
  windowMs: ADMIN_LOGIN_WINDOW_MS,
  limit: ADMIN_LOGIN_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator(req) {
    return getClientIp(req);
  },
  handler(req, res) {
    logSecurityEvent('admin_login_rate_limit_exceeded', req, {
      windowMs: ADMIN_LOGIN_WINDOW_MS,
      maxAttempts: ADMIN_LOGIN_MAX_ATTEMPTS,
    });

    return res.status(429).json({
      success: false,
      message: 'Too many admin login attempts. Please try again later.',
    });
  },
});

module.exports = { adminLoginRateLimit };
