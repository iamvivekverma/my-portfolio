const { createHttpError } = require('./httpError');
const { sanitizeRichTextToPlainText } = require('./inputSecurity');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeWithoutTruncation(value, maxLength) {
  return sanitizeRichTextToPlainText(value, { maxLength: maxLength * 4 });
}

function normalizeRequiredText(value, fieldName, maxLength = 500) {
  if (typeof value !== 'string') {
    throw createHttpError(400, `${fieldName} must be a string.`);
  }

  const sanitized = sanitizeWithoutTruncation(value, maxLength);

  if (!sanitized) {
    throw createHttpError(400, `${fieldName} is required.`);
  }

  if (sanitized.length > maxLength) {
    throw createHttpError(400, `${fieldName} is too long.`);
  }

  return sanitized;
}

function normalizeOptionalText(value, fieldName, maxLength = 500) {
  if (value == null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw createHttpError(400, `${fieldName} must be a string.`);
  }

  const sanitized = sanitizeWithoutTruncation(value, maxLength);

  if (!sanitized) {
    return null;
  }

  if (sanitized.length > maxLength) {
    throw createHttpError(400, `${fieldName} is too long.`);
  }

  return sanitized;
}

function normalizeEmail(value, fieldName = 'Email') {
  const email = normalizeOptionalText(value, fieldName, 320);

  if (!email) {
    return null;
  }

  const normalized = email.toLowerCase();

  if (!EMAIL_PATTERN.test(normalized)) {
    throw createHttpError(400, `${fieldName} must be a valid email address.`);
  }

  return normalized;
}

function normalizeHttpUrl(value, fieldName, { allowRelative = false } = {}) {
  const url = normalizeOptionalText(value, fieldName, 2048);

  if (!url) {
    return null;
  }

  if (allowRelative && url.startsWith('/')) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {}

  throw createHttpError(400, `${fieldName} must be a valid HTTP or HTTPS URL.`);
}

function normalizeStringArray(value, fieldName, { maxItems = 20, maxItemLength = 120 } = {}) {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw createHttpError(400, `${fieldName} must be an array.`);
  }

  const items = Array.from(
    new Set(
      value
        .map((item) => normalizeOptionalText(item, fieldName, maxItemLength))
        .filter(Boolean),
    ),
  );

  if (items.length > maxItems) {
    throw createHttpError(400, `${fieldName} has too many items.`);
  }

  return items;
}

function normalizeInteger(value, fieldName, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = 0 } = {}) {
  if (value == null || value === '') {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw createHttpError(400, `${fieldName} must be an integer between ${min} and ${max}.`);
  }

  return parsed;
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value == null || value === '') {
    return fallback;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return Boolean(value);
}

module.exports = {
  normalizeBoolean,
  normalizeEmail,
  normalizeHttpUrl,
  normalizeInteger,
  normalizeOptionalText,
  normalizeRequiredText,
  normalizeStringArray,
};
