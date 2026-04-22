const crypto = require('crypto');

const PROJECT_PIN_HASH_PREFIX = 'scrypt';
const PROJECT_PIN_HASH_KEY_LENGTH = 64;
const PROJECT_PIN_SALT_LENGTH = 16;

function getProjectPinSecret() {
  return process.env.PROJECT_ACCESS_SECRET || process.env.ADMIN_SECRET || '';
}

function safeCompare(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string') {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  return (
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

function isHashedProjectPin(value) {
  return typeof value === 'string' && value.startsWith(`${PROJECT_PIN_HASH_PREFIX}$`);
}

function hashProjectPin(pin) {
  const salt = crypto.randomBytes(PROJECT_PIN_SALT_LENGTH).toString('hex');
  const hash = crypto
    .scryptSync(pin, salt, PROJECT_PIN_HASH_KEY_LENGTH)
    .toString('hex');

  return `${PROJECT_PIN_HASH_PREFIX}$${salt}$${hash}`;
}

function verifyProjectPinValue(pin, storedPin) {
  if (typeof pin !== 'string' || typeof storedPin !== 'string') {
    return false;
  }

  if (!isHashedProjectPin(storedPin)) {
    return safeCompare(pin, storedPin);
  }

  const [, salt, expectedHash] = storedPin.split('$');

  if (!salt || !expectedHash) {
    return false;
  }

  const derivedHash = crypto
    .scryptSync(pin, salt, PROJECT_PIN_HASH_KEY_LENGTH)
    .toString('hex');

  return safeCompare(derivedHash, expectedHash);
}

function createProjectPinFingerprint(pin) {
  const secret = getProjectPinSecret();

  if (!secret) {
    throw new Error('PROJECT_ACCESS_SECRET not configured');
  }

  return crypto
    .createHmac('sha256', secret)
    .update(pin)
    .digest('hex');
}

module.exports = {
  createProjectPinFingerprint,
  hashProjectPin,
  isHashedProjectPin,
  verifyProjectPinValue,
};
