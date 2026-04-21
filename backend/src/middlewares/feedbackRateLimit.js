const rateLimit = require('express-rate-limit');

const FEEDBACK_RATE_WINDOW_MS = Number(process.env.FEEDBACK_RATE_WINDOW_MS || 15 * 60 * 1000);
const FEEDBACK_RATE_MAX_REQUESTS = Number(process.env.FEEDBACK_RATE_MAX_REQUESTS || 5);

const feedbackRateLimit = rateLimit({
  windowMs: FEEDBACK_RATE_WINDOW_MS,
  limit: FEEDBACK_RATE_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many feedback attempts. Please try again later.',
  },
});

module.exports = { feedbackRateLimit };
