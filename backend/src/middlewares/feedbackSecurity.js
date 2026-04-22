const { findBlockedObjectKeyPath, sanitizeRichTextToPlainText } = require('../lib/inputSecurity');
const { logSecurityEvent } = require('../lib/securityLogger');

function rejectDangerousFeedbackPayload(req, res, next) {
  const blockedKeyPath = findBlockedObjectKeyPath(req.body);

  if (!blockedKeyPath) {
    return next();
  }

  logSecurityEvent('feedback_payload_blocked', req, {
    blockedKeyPath,
  });

  return res.status(400).json({
    success: false,
    message: 'Invalid request payload.',
  });
}

function rejectFeedbackHoneypot(req, res, next) {
  const trapValue = sanitizeRichTextToPlainText(req.body?.website || '', { maxLength: 200 });

  if (!trapValue) {
    return next();
  }

  logSecurityEvent('feedback_honeypot_triggered', req, {
    field: 'website',
  });

  return res.status(202).json({
    success: true,
    message: 'Feedback received successfully.',
  });
}

module.exports = {
  rejectDangerousFeedbackPayload,
  rejectFeedbackHoneypot,
};
