const { createHttpError } = require('./httpError');

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

function isRecaptchaConfigured() {
  return Boolean(process.env.RECAPTCHA_SECRET_KEY);
}

function shouldBypassRecaptcha() {
  return process.env.NODE_ENV !== 'production' && process.env.RECAPTCHA_BYPASS_IN_DEV === 'true';
}

async function verifyRecaptchaToken({ token, remoteIp, expectedAction }) {
  if (shouldBypassRecaptcha()) {
    return {
      success: true,
      action: expectedAction,
      score: 0.9,
      bypassed: true,
    };
  }

  if (!isRecaptchaConfigured()) {
    throw createHttpError(503, 'Feedback protection is not configured on the server.');
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || 0.5);
  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  const response = await fetch(RECAPTCHA_VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw createHttpError(502, 'Unable to verify CAPTCHA right now.');
  }

  const payload = await response.json();

  if (!payload.success) {
    return {
      success: false,
      code: payload['error-codes'] || [],
    };
  }

  if (expectedAction && payload.action && payload.action !== expectedAction) {
    return {
      success: false,
      code: ['action-mismatch'],
    };
  }

  if (typeof payload.score === 'number' && payload.score < minScore) {
    return {
      success: false,
      code: ['low-score'],
      score: payload.score,
    };
  }

  return payload;
}

module.exports = {
  isRecaptchaConfigured,
  shouldBypassRecaptcha,
  verifyRecaptchaToken,
};
