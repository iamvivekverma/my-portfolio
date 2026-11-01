const { body, matchedData, validationResult } = require('express-validator');
const {
  sanitizeRichTextToPlainText,
  hasSafeNameCharacters,
} = require('../lib/inputSecurity');

const FEEDBACK_NAME_MIN_LENGTH = 2;
const FEEDBACK_NAME_MAX_LENGTH = 50;
const FEEDBACK_CONTENT_MIN_LENGTH = 3;
const FEEDBACK_CONTENT_MAX_LENGTH = 1000;
const FEEDBACK_NAME_SANITIZE_LIMIT = 200;
const FEEDBACK_EMAIL_SANITIZE_LIMIT = 320;
const FEEDBACK_CONTENT_SANITIZE_LIMIT = 2000;

function isStringField(value) {
  return typeof value === 'string';
}

const feedbackValidationRules = [
  body('name')
    .exists({ values: 'falsy' })
    .withMessage('Please enter your full name.')
    .bail()
    .custom(isStringField)
    .withMessage('Name must be plain text.')
    .bail()
    .customSanitizer((value) => sanitizeRichTextToPlainText(value, { maxLength: FEEDBACK_NAME_SANITIZE_LIMIT }))
    .isLength({ min: FEEDBACK_NAME_MIN_LENGTH, max: FEEDBACK_NAME_MAX_LENGTH })
    .withMessage('Please enter your full name.')
    .bail()
    .custom(hasSafeNameCharacters)
    .withMessage('Name contains invalid characters.'),
  body('email')
    .exists({ values: 'falsy' })
    .withMessage('Please enter your email address.')
    .bail()
    .custom(isStringField)
    .withMessage('Email must be plain text.')
    .bail()
    .customSanitizer((value) => sanitizeRichTextToPlainText(value, { maxLength: FEEDBACK_EMAIL_SANITIZE_LIMIT }).toLowerCase())
    .custom((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    .withMessage('Please enter a valid email address.'),
  body('content')
    .exists({ values: 'falsy' })
    .withMessage('Please enter your feedback message.')
    .bail()
    .custom(isStringField)
    .withMessage('Message must be plain text.')
    .bail()
    .customSanitizer((value) =>
      sanitizeRichTextToPlainText(value, { maxLength: FEEDBACK_CONTENT_SANITIZE_LIMIT }),
    )
    .isLength({ min: FEEDBACK_CONTENT_MIN_LENGTH, max: FEEDBACK_CONTENT_MAX_LENGTH })
    .withMessage('Please write a more detailed message.'),
];

function handleFeedbackValidation(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: result.array({ onlyFirstError: true })[0].msg,
      errors: result.array({ onlyFirstError: true }).map(({ path, msg }) => ({
        field: path,
        message: msg,
      })),
    });
  }

  req.validatedFeedback = matchedData(req, {
    locations: ['body'],
    includeOptionals: true,
  });

  return next();
}

module.exports = {
  FEEDBACK_CONTENT_MAX_LENGTH,
  FEEDBACK_CONTENT_MIN_LENGTH,
  FEEDBACK_NAME_MAX_LENGTH,
  FEEDBACK_NAME_MIN_LENGTH,
  feedbackValidationRules,
  handleFeedbackValidation,
};
