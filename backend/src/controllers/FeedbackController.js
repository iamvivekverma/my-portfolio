const { FeedbackModel } = require('../models/FeedbackModel');
const {
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
} = require('../lib/feedbackSecurity');

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
    const senderName = sanitizeText(req.body?.name);
    const content = sanitizeText(req.body?.content);
    const honeypot = sanitizeText(req.body?.honeypot);
    const ip = getClientIp(req);
    const userAgent = sanitizeText(req.headers['user-agent']).slice(0, 500);
    const metadata = getClientMetadata(req.body);
    const fingerprintHash = createFingerprint({ ip, userAgent, clientId: metadata.clientId });
    const now = Date.now();

    if (!senderName || senderName.length < 2 || senderName.length > 80) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your full name.',
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

    const recentFeedbackCount = await FeedbackModel.countDocuments({
      fingerprintHash,
      createdAt: { $gte: new Date(now - RATE_LIMIT_WINDOW_MS) },
    });

    if (recentFeedbackCount >= MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        success: false,
        message: 'Too many feedback attempts. Please try again later.',
      });
    }

    const moderation = analyzeSubmission({
      content,
      honeypot,
    });

    if (moderation.rejected) {
      return res.status(422).json({
        success: false,
        message: getModerationMessage(moderation.reasons),
      });
    }

    const contentNormalized = normalizeContentForCompare(content);

    const duplicate = await FeedbackModel.findOne({
      fingerprintHash,
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
