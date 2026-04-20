const crypto = require('crypto');

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;

function getAdminSecret() {
  const expected = process.env.ADMIN_SECRET;

  if (!expected) {
    return {
      ok: false,
      status: 500,
      message: 'ADMIN_SECRET not configured',
    };
  }

  return { ok: true, value: expected };
}

function validateAdminSecret(provided) {
  const secret = getAdminSecret();

  if (!secret.ok) {
    return secret;
  }

  if (!safeCompare(provided, secret.value)) {
    return {
      ok: false,
      status: 401,
      message: 'Unauthorized',
    };
  }

  return { ok: true };
}

function signToken(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function safeCompare(provided, expected) {
  if (!provided || typeof provided !== 'string') {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  return (
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

function createAdminToken() {
  const secret = getAdminSecret();

  if (!secret.ok) {
    return secret;
  }

  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${expiresAt}`;
  const signature = signToken(payload, secret.value);

  return {
    ok: true,
    token: `${payload}.${signature}`,
    expiresAt,
  };
}

function verifyAdminToken(token) {
  const secret = getAdminSecret();

  if (!secret.ok) {
    return secret;
  }

  if (!token || typeof token !== 'string') {
    return {
      ok: false,
      status: 401,
      message: 'Unauthorized',
    };
  }

  const [expiresAt, signature] = token.split('.');

  if (!expiresAt || !signature) {
    return {
      ok: false,
      status: 401,
      message: 'Unauthorized',
    };
  }

  const expected = signToken(expiresAt, secret.value);

  if (!safeCompare(signature, expected)) {
    return {
      ok: false,
      status: 401,
      message: 'Unauthorized',
    };
  }

  if (Number(expiresAt) <= Date.now()) {
    return {
      ok: false,
      status: 401,
      message: 'Session expired',
    };
  }

  return { ok: true };
}

function adminAuth(req, res, next) {
  const providedToken = req.headers['x-admin-token'];
  const tokenResult = verifyAdminToken(providedToken);

  if (!tokenResult.ok) {
    return res.status(tokenResult.status).json({ success: false, message: tokenResult.message });
  }

  next();
}

module.exports = { adminAuth, createAdminToken, validateAdminSecret, verifyAdminToken };
