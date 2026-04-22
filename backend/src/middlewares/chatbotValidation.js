const { createHttpError } = require('../lib/httpError');
const { findBlockedObjectKeyPath, sanitizeRichTextToPlainText } = require('../lib/inputSecurity');

const CHATBOT_MAX_MESSAGE_CHARS = Number(process.env.CHATBOT_MAX_MESSAGE_CHARS || 500);
const CHATBOT_MAX_HISTORY_ITEMS = Number(process.env.CHATBOT_MAX_HISTORY_ITEMS || 12);
const CHATBOT_MAX_HISTORY_CHARS = Number(process.env.CHATBOT_MAX_HISTORY_CHARS || 500);

function sanitizeChatText(value, maxLength) {
  return sanitizeRichTextToPlainText(value, { maxLength: maxLength * 4 });
}

function validateChatbotPayload(req, res, next) {
  try {
    const blockedKeyPath = findBlockedObjectKeyPath(req.body);

    if (blockedKeyPath) {
      throw createHttpError(400, 'Invalid request payload.');
    }

    const message = sanitizeChatText(req.body?.message, CHATBOT_MAX_MESSAGE_CHARS);

    if (!message) {
      throw createHttpError(400, 'Message is required.');
    }

    if (message.length > CHATBOT_MAX_MESSAGE_CHARS) {
      throw createHttpError(400, 'Message is too long.');
    }

    const rawHistory = Array.isArray(req.body?.conversationHistory) ? req.body.conversationHistory : [];
    const conversationHistory = rawHistory
      .slice(-CHATBOT_MAX_HISTORY_ITEMS)
      .map((item) => ({
        role: item?.role,
        content: sanitizeChatText(item?.content, CHATBOT_MAX_HISTORY_CHARS),
      }))
      .filter(
        (item) =>
          (item.role === 'assistant' || item.role === 'user') &&
          typeof item.content === 'string' &&
          item.content.length > 0 &&
          item.content.length <= CHATBOT_MAX_HISTORY_CHARS,
      );

    req.validatedChatbot = {
      message,
      conversationHistory,
    };

    return next();
  } catch (error) {
    return res.status(error.status || 400).json({
      error: error.message || 'Invalid chatbot payload.',
    });
  }
}

module.exports = {
  validateChatbotPayload,
};
