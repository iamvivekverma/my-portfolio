const rateLimit = require('express-rate-limit');
const { getClientIp } = require('../lib/inputSecurity');
const { logSecurityEvent } = require('../lib/securityLogger');

const PROJECT_PIN_WINDOW_MS = Number(process.env.PROJECT_PIN_RATE_WINDOW_MS || 10 * 60 * 1000);
const PROJECT_PIN_MAX_ATTEMPTS = Number(process.env.PROJECT_PIN_MAX_ATTEMPTS || 10);

const projectPinRateLimit = rateLimit({
  windowMs: PROJECT_PIN_WINDOW_MS,
  limit: PROJECT_PIN_MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator(req) {
    return `${getClientIp(req)}:${req.params.id || 'unknown-project'}`;
  },
  handler(req, res) {
    logSecurityEvent('project_pin_rate_limit_exceeded', req, {
      projectId: req.params.id,
      windowMs: PROJECT_PIN_WINDOW_MS,
      maxAttempts: PROJECT_PIN_MAX_ATTEMPTS,
    });

    return res.status(429).json({
      success: false,
      unlocked: false,
      message: 'Too many PIN attempts. Please try again later.',
    });
  },
});

module.exports = { projectPinRateLimit };
