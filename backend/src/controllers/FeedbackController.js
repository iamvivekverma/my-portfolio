const { messages } = require('../constants/messages');
const { FeedbackModel } = require('../models/FeedbackModel');

// Simple in-memory rate limiter (for production, use Redis)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_IP = 5;

// Common spam patterns
const spamPatterns = [
  /http[s]?:\/\/[^\s]+/gi, // URLs
  /www\.[^\s]+/gi, // www URLs
  /\b(viagra|cialis|porn|xxx|casino|bitcoin|crypto|lottery|winner)\b/gi,
  /\b(click here|free money|make money|work from home)\b/gi,
  /[^\x00-\x7F]{50,}/, // Too many non-ASCII characters (potential spam)
];

function isSpamContent(content) {
  const lowerContent = content.toLowerCase();
  return spamPatterns.some(pattern => pattern.test(lowerContent));
}

const storeData = async (req, res) => {
  try {
    const { content } = req.body;
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // Rate limiting check
    const now = Date.now();
    const userRequests = rateLimit.get(ip) || [];
    const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= MAX_REQUESTS_PER_IP) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }

    recentRequests.push(now);
    rateLimit.set(ip, recentRequests);

    // Content validation
    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Content is required and must be a string'
      });
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 5 characters long'
      });
    }

    if (trimmedContent.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Content must not exceed 1000 characters'
      });
    }

    // Spam detection
    if (isSpamContent(trimmedContent)) {
      return res.status(400).json({
        success: false,
        message: 'Content appears to be spam'
      });
    }

    // Save feedback with IP tracking
    const feedback = new FeedbackModel({
      content: trimmedContent,
      ip,
      userAgent: req.headers['user-agent']
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: messages.created.msg
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      success: false,
      message: messages.catch_error.msg
    });
  }
};

module.exports = { storeData };
