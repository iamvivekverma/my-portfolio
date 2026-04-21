const crypto = require('crypto');

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

const spamPatterns = [
  /http[s]?:\/\/[^\s]+/i,
  /www\.[^\s]+/i,
  /\b(viagra|cialis|porn|xxx|casino|bitcoin|crypto|lottery|winner)\b/i,
  /\b(click here|free money|make money|work from home|buy now|100% guaranteed)\b/i,
];

const nonsensePatterns = [
  /^(hi|hello|hey|test|testing|ok|nice|good|cool|hmm+|lol|yo)$/i,
  /^(asdf|qwer|zxcv|1234|0000|abc|demo|dummy)+$/i,
  /(.)\1{6,}/,
];

function sanitizeText(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
}

function createFingerprint({ ip, userAgent, clientId }) {
  return crypto
    .createHash('sha256')
    .update(`${ip}|${userAgent || ''}|${clientId || ''}`)
    .digest('hex');
}

function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function normalizeContentForCompare(content) {
  return content.toLowerCase().replace(/\s+/g, ' ').trim();
}

function formatSenderName(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getClientMetadata(payload = {}) {
  const metadata = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};

  return {
    pageUrl: sanitizeText(metadata.pageUrl).slice(0, 500),
    referrer: sanitizeText(metadata.referrer).slice(0, 500),
    timezone: sanitizeText(metadata.timezone).slice(0, 120),
    language: sanitizeText(metadata.language).slice(0, 80),
    platform: sanitizeText(metadata.platform).slice(0, 120),
    screen: sanitizeText(metadata.screen).slice(0, 80),
    clientId: sanitizeText(metadata.clientId).slice(0, 120),
  };
}

function analyzeSubmission({ content, honeypot }) {
  const reasons = [];
  const normalizedContent = normalizeContentForCompare(content);
  const linkCount = countMatches(content, /https?:\/\/|www\./gi);
  const uppercaseChars = (content.match(/[A-Z]/g) || []).length;
  const letterChars = (content.match(/\p{L}/gu) || []).length;
  const symbolChars = (content.match(/[^\p{L}\p{N}\s]/gu) || []).length;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const uppercaseRatio = letterChars ? uppercaseChars / letterChars : 0;
  const symbolRatio = content.length ? symbolChars / content.length : 0;

  if (honeypot) {
    reasons.push('honeypot');
  }

  if (spamPatterns.some((pattern) => pattern.test(content))) {
    reasons.push('spam_pattern');
  }

  if (nonsensePatterns.some((pattern) => pattern.test(normalizedContent))) {
    reasons.push('nonsense_pattern');
  }

  if (linkCount > 0) {
    reasons.push('contains_link');
  }

  if (wordCount < 3 || letterChars < 8) {
    reasons.push('too_short_or_low_signal');
  }

  if (uppercaseRatio > 0.8 && content.length > 24) {
    reasons.push('excessive_caps');
  }

  if (symbolRatio > 0.3) {
    reasons.push('too_many_symbols');
  }

  return {
    rejected: reasons.length > 0,
    reasons,
  };
}

function getModerationMessage(reasons) {
  if (reasons.includes('honeypot')) {
    return 'Your submission could not be accepted. Please try again with a normal message.';
  }

  if (reasons.includes('contains_link') || reasons.includes('spam_pattern')) {
    return 'Please avoid links or promotional content. Write a simple feedback message instead.';
  }

  if (reasons.includes('nonsense_pattern') || reasons.includes('too_short_or_low_signal')) {
    return 'Please type a proper message with a little more detail so I can understand your feedback.';
  }

  if (reasons.includes('excessive_caps') || reasons.includes('too_many_symbols')) {
    return 'Please write your feedback in a normal readable format.';
  }

  return 'Please send a clear and relevant message. Spam, random text, and meaningless submissions are not allowed.';
}

module.exports = {
  RATE_LIMIT_WINDOW_MS,
  MAX_REQUESTS_PER_WINDOW,
  DUPLICATE_WINDOW_MS,
  sanitizeText,
  getClientIp,
  createFingerprint,
  normalizeContentForCompare,
  formatSenderName,
  getClientMetadata,
  analyzeSubmission,
  getModerationMessage,
};
