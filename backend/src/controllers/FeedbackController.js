const { FeedbackModel } = require('../models/FeedbackModel');
const {
  DUPLICATE_WINDOW_MS,
  getClientIp,
  createFingerprint,
  normalizeContentForCompare,
  formatSenderName,
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
    const payload = req.validatedFeedback || {};
    const senderName = payload.name || '';
    const content = payload.content || '';
    const honeypot = payload.honeypot || '';
    const metadata = payload.metadata || {};
    const ip = getClientIp(req);
    const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'].slice(0, 500) : '';
    const fingerprintHash = createFingerprint({ ip, userAgent, clientId: metadata.clientId });
    const now = Date.now();

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
      origin: typeof req.headers.origin === 'string' ? req.headers.origin.slice(0, 300) : '',
      referrer:
        (typeof req.headers.referer === 'string' ? req.headers.referer.slice(0, 500) : '') || metadata.referrer,
      fingerprintHash,
      clientMeta: metadata,
      captcha: {
        score: req.recaptcha?.score,
        action: req.recaptcha?.action,
        bypassed: req.recaptcha?.bypassed === true,
      },
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
