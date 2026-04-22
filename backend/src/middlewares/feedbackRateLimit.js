const rateLimit = require('express-rate-limit');
const { logSecurityEvent } = require('../lib/securityLogger');

const FEEDBACK_RATE_WINDOW_MS = Number(process.env.FEEDBACK_RATE_WINDOW_MS || 10 * 60 * 1000);
const FEEDBACK_RATE_MAX_REQUESTS = Number(process.env.FEEDBACK_RATE_MAX_REQUESTS || 20);

const feedbackRateLimit = rateLimit({
  windowMs: FEEDBACK_RATE_WINDOW_MS,
  limit: FEEDBACK_RATE_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler(req, res) {
    logSecurityEvent('feedback_rate_limit_exceeded', req, {
      windowMs: FEEDBACK_RATE_WINDOW_MS,
      maxRequests: FEEDBACK_RATE_MAX_REQUESTS,
    });

    return res.status(429).json({
      success: false,
      message: 'Too many feedback attempts. Please try again later.',
    });
  },
});

module.exports = { feedbackRateLimit };
