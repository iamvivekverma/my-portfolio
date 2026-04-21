const HTML_TAG_PATTERN = /<\/?[^>]+>/g;
const SCRIPT_TAG_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const CONTROL_CHARS_PATTERN = /[\u0000-\u001F\u007F]/g;
const NAME_PATTERN = /^[\p{L}\p{M}\s.'-]+$/u;

function sanitizePlainText(value, { maxLength = 1000 } = {}) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .normalize('NFKC')
    .replace(SCRIPT_TAG_PATTERN, ' ')
    .replace(HTML_TAG_PATTERN, ' ')
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

module.exports = {
  getClientIp,
  sanitizePlainText,
  hasSafeNameCharacters,
};
