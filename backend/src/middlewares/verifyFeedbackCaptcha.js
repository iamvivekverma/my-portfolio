const { getClientIp } = require('../lib/feedbackSecurity');
const { verifyRecaptchaToken } = require('../lib/recaptcha');

async function verifyFeedbackCaptcha(req, res, next) {
  try {
    const token = req.validatedFeedback?.captchaToken;

    const result = await verifyRecaptchaToken({
      token,
      remoteIp: getClientIp(req),
      expectedAction: 'feedback_submit',
    });

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: 'CAPTCHA verification failed. Please try again.',
      });
    }

    req.recaptcha = {
      score: result.score,
      action: result.action,
      bypassed: result.bypassed === true,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { verifyFeedbackCaptcha };
