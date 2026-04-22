const express = require('express');
const { storeData, getData, deleteData } = require('../controllers/FeedbackController');
const { adminAuth } = require('../middlewares/adminAuth');
const { feedbackRateLimit } = require('../middlewares/feedbackRateLimit');
const {
  feedbackValidationRules,
  handleFeedbackValidation,
} = require('../middlewares/feedbackValidation');
const {
  rejectDangerousFeedbackPayload,
  rejectFeedbackHoneypot,
} = require('../middlewares/feedbackSecurity');
const { verifyFeedbackCaptcha } = require('../middlewares/verifyFeedbackCaptcha');

const FeedbackRouter = express.Router();

FeedbackRouter.post(
  '/',
  feedbackRateLimit,
  rejectDangerousFeedbackPayload,
  rejectFeedbackHoneypot,
  feedbackValidationRules,
  handleFeedbackValidation,
  verifyFeedbackCaptcha,
  storeData,
);
FeedbackRouter.get('/', adminAuth, getData);
FeedbackRouter.delete('/:id', adminAuth, deleteData);

module.exports = { FeedbackRouter };
