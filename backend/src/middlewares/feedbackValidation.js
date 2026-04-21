const { body, matchedData, validationResult } = require('express-validator');
const {
  isPlainObject,
  sanitizePlainText,
  sanitizeMetadataValue,
  hasSafeNameCharacters,
} = require('../lib/inputSecurity');

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
  body('honeypot')
    .optional({ values: 'falsy' })
    .custom(isStringField)
    .withMessage('Invalid form payload.')
    .bail()
    .customSanitizer((value) => sanitizePlainText(value, { maxLength: 120 })),
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
  body('metadata')
    .optional()
    .custom((value) => isPlainObject(value))
    .withMessage('Invalid metadata payload.'),
  body('metadata.pageUrl')
    .optional({ values: 'falsy' })
    .custom(isStringField)
    .withMessage('Invalid page URL.')
    .bail()
    .customSanitizer((value) => sanitizeMetadataValue(value, 500)),
  body('metadata.referrer')
    .optional({ values: 'falsy' })
    .custom(isStringField)
    .withMessage('Invalid referrer.')
    .bail()
    .customSanitizer((value) => sanitizeMetadataValue(value, 500)),
  body('metadata.timezone')
    .optional({ values: 'falsy' })
    .custom(isStringField)
    .withMessage('Invalid timezone.')
    .bail()
    .customSanitizer((value) => sanitizeMetadataValue(value, 120)),
  body('metadata.language')
    .optional({ values: 'falsy' })
    .custom(isStringField)
    .withMessage('Invalid language.')
    .bail()
    .customSanitizer((value) => sanitizeMetadataValue(value, 80)),
  body('metadata.platform')
    .optional({ values: 'falsy' })
    .custom(isStringField)
    .withMessage('Invalid platform.')
    .bail()
    .customSanitizer((value) => sanitizeMetadataValue(value, 120)),
  body('metadata.screen')
    .optional({ values: 'falsy' })
    .custom(isStringField)
    .withMessage('Invalid screen size.')
    .bail()
    .customSanitizer((value) => sanitizeMetadataValue(value, 80)),
  body('metadata.clientId')
    .optional({ values: 'falsy' })
    .custom(isStringField)
    .withMessage('Invalid client ID.')
    .bail()
    .customSanitizer((value) => sanitizeMetadataValue(value, 120)),
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
