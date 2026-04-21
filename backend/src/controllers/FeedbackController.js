const crypto = require('crypto');
const { FeedbackModel } = require('../models/FeedbackModel');

const rateLimit = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;
const MIN_FORM_FILL_MS = 4000;
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

const disposableEmailPatterns = [
  /mailinator/i,
  /tempmail/i,
  /10minutemail/i,
  /guerrillamail/i,
  /yopmail/i,
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

function cleanupRateLimit(now) {
  for (const [key, timestamps] of rateLimit.entries()) {
    const recent = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

    if (recent.length) {
      rateLimit.set(key, recent);
    } else {
      rateLimit.delete(key);
    }
  }
}

function hasExceededRateLimit(key, now) {
  const existing = rateLimit.get(key) || [];
  const recent = existing.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimit.set(key, recent);
    return true;
  }

  recent.push(now);
  rateLimit.set(key, recent);
  return false;
}

function createFingerprint({ ip, userAgent, email }) {
  return crypto
    .createHash('sha256')
    .update(`${ip}|${userAgent || ''}|${email.toLowerCase()}`)
    .digest('hex');
}

function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function normalizeContentForCompare(content) {
  return content.toLowerCase().replace(/\s+/g, ' ').trim();
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
  };
}

function analyzeSubmission({ content, email, honeypot, formStartedAt, submittedAt }) {
  const reasons = [];
  const normalizedContent = normalizeContentForCompare(content);
  const submittedTime = Number(submittedAt);
  const startedTime = Number(formStartedAt);
  const linkCount = countMatches(content, /https?:\/\/|www\./gi);
  const uppercaseChars = (content.match(/[A-Z]/g) || []).length;
  const alphaChars = (content.match(/[A-Za-z]/g) || []).length;
  const symbolChars = (content.match(/[^A-Za-z0-9\s]/g) || []).length;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const uppercaseRatio = alphaChars ? uppercaseChars / alphaChars : 0;
  const symbolRatio = content.length ? symbolChars / content.length : 0;

  if (honeypot) {
    reasons.push('honeypot');
  }

  if (submittedTime && startedTime && submittedTime >= startedTime) {
    if (submittedTime - startedTime < MIN_FORM_FILL_MS) {
      reasons.push('submitted_too_fast');
    }
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

  if (wordCount < 3 || alphaChars < 12) {
    reasons.push('too_short_or_low_signal');
  }

  if (uppercaseRatio > 0.8 && content.length > 24) {
    reasons.push('excessive_caps');
  }

  if (symbolRatio > 0.3) {
    reasons.push('too_many_symbols');
  }

  if (disposableEmailPatterns.some((pattern) => pattern.test(email))) {
    reasons.push('disposable_email');
  }

  return {
    rejected: reasons.length > 0,
    reasons,
  };
}

function formatSenderName(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function getData(req, res) {
  try {
    const feedback = await FeedbackModel.find().sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error('Feedback fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load feedback right now.',
    });
  }
}

async function deleteData(req, res) {
  try {
    const deleted = await FeedbackModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Feedback deleted successfully.',
    });
  } catch (error) {
    console.error('Feedback delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to delete feedback right now.',
    });
  }
}

const storeData = async (req, res) => {
  try {
    cleanupRateLimit(Date.now());

    const senderName = sanitizeText(req.body?.name);
    const senderEmail = sanitizeText(req.body?.email).toLowerCase();
    const content = sanitizeText(req.body?.content);
    const honeypot = sanitizeText(req.body?.honeypot);
    const formStartedAt = req.body?.formStartedAt;
    const submittedAt = req.body?.submittedAt;
    const ip = getClientIp(req);
    const userAgent = sanitizeText(req.headers['user-agent']).slice(0, 500);
    const metadata = getClientMetadata(req.body);

    if (!senderName || senderName.length < 2 || senderName.length > 80) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your full name.',
      });
    }

    if (!senderEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail) || senderEmail.length > 120) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your feedback message.',
      });
    }

    if (content.length < 15) {
      return res.status(400).json({
        success: false,
        message: 'Please write a more detailed message.',
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Your message is too long. Please keep it under 1000 characters.',
      });
    }

    const rateLimitKey = `${ip}:${senderEmail}`;
    const now = Date.now();

    if (hasExceededRateLimit(rateLimitKey, now)) {
      return res.status(429).json({
        success: false,
        message: 'Too many feedback attempts. Please try again later.',
      });
    }

    const moderation = analyzeSubmission({
      content,
      email: senderEmail,
      honeypot,
      formStartedAt,
      submittedAt,
    });

    if (moderation.rejected) {
      return res.status(422).json({
        success: false,
        message:
          'Please send a clear and relevant message. Spam, random text, and meaningless submissions are not allowed.',
      });
    }

    const fingerprintHash = createFingerprint({ ip, userAgent, email: senderEmail });
    const contentNormalized = normalizeContentForCompare(content);

    const duplicate = await FeedbackModel.findOne({
      $or: [{ fingerprintHash }, { senderEmail }],
      contentNormalized,
      createdAt: { $gte: new Date(now - DUPLICATE_WINDOW_MS) },
    }).lean();

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'This message has already been submitted recently.',
      });
    }

    const feedback = new FeedbackModel({
      senderName: formatSenderName(senderName),
      senderEmail,
      content,
      contentNormalized,
      ip,
      userAgent,
      origin: sanitizeText(req.headers.origin).slice(0, 300),
      referrer: sanitizeText(req.headers.referer).slice(0, 500) || metadata.referrer,
      fingerprintHash,
      clientMeta: metadata,
    });

    await feedback.save();

    return res.status(201).json({
      success: true,
      message: 'Feedback received successfully.',
    });
  } catch (error) {
    console.error('Feedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while sending feedback.',
    });
  }
};

module.exports = { storeData, getData, deleteData };
