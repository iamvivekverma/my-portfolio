const { FeedbackModel } = require('../models/FeedbackModel');
const { getClientIp } = require('../lib/inputSecurity');

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
    const ip = getClientIp(req);
    const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'].slice(0, 500) : '';

    const feedback = new FeedbackModel({
      senderName,
      content,
      ip,
      userAgent,
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
