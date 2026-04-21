const { body, matchedData, validationResult } = require('express-validator');
const { sanitizePlainText, hasSafeNameCharacters } = require('../lib/inputSecurity');

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
    .customSanitizer((value) => sanitizePlainText(value, { maxLength: 80 }))
    .isLength({ min: 2, max: 80 })
    .withMessage('Please enter your full name.')
    .bail()
    .custom(hasSafeNameCharacters)
    .withMessage('Name contains invalid characters.'),
  body('content')
    .exists({ values: 'falsy' })
    .withMessage('Please enter your feedback message.')
    .bail()
    .custom(isStringField)
    .withMessage('Message must be plain text.')
    .bail()
    .customSanitizer((value) => sanitizePlainText(value, { maxLength: 1000 }))
    .isLength({ min: 15, max: 1000 })
    .withMessage('Please write a more detailed message.'),
  body('captchaToken')
    .exists({ values: 'falsy' })
    .withMessage('Please complete the CAPTCHA challenge.')
    .bail()
    .custom(isStringField)
    .withMessage('Invalid CAPTCHA token.')
    .bail()
    .customSanitizer((value) => sanitizePlainText(value, { maxLength: 5000 }))
    .isLength({ min: 20, max: 5000 })
    .withMessage('Invalid CAPTCHA token.'),
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
  feedbackValidationRules,
  handleFeedbackValidation,
};
