const sanitizeHtml = require('sanitize-html');

const CONTROL_CHARS_PATTERN = /[\u0000-\u001F\u007F]/g;
const NAME_PATTERN = /^[\p{L}\p{M}\s.'-]+$/u;
const BLOCKED_OBJECT_KEY_PATTERN = /(^\$)|\./;
const PLAIN_TEXT_SANITIZER_OPTIONS = {
  allowedTags: [],
  allowedAttributes: {},
};

function sanitizePlainText(value, { maxLength = 1000 } = {}) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .normalize('NFKC')
    .replace(CONTROL_CHARS_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function sanitizeRichTextToPlainText(value, { maxLength = 1000 } = {}) {
  if (typeof value !== 'string') {
    return '';
  }

  return sanitizeHtml(value.normalize('NFKC'), PLAIN_TEXT_SANITIZER_OPTIONS)
    .replace(CONTROL_CHARS_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function hasSafeNameCharacters(value) {
  return NAME_PATTERN.test(value);
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
}

function findBlockedObjectKeyPath(value, currentPath = '') {
  if (!value || typeof value !== 'object') {
    return null;
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const blockedPath = findBlockedObjectKeyPath(value[index], `${currentPath}[${index}]`);

      if (blockedPath) {
        return blockedPath;
      }
    }

    return null;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nextPath = currentPath ? `${currentPath}.${key}` : key;

    if (BLOCKED_OBJECT_KEY_PATTERN.test(key)) {
      return nextPath;
    }

    const blockedPath = findBlockedObjectKeyPath(nestedValue, nextPath);

    if (blockedPath) {
      return blockedPath;
    }
  }

  return null;
}

module.exports = {
  findBlockedObjectKeyPath,
  getClientIp,
  sanitizePlainText,
  sanitizeRichTextToPlainText,
  hasSafeNameCharacters,
};
