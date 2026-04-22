const express = require('express');
const { chatbotHandler } = require('../controllers/ChatbotController');
const { chatbotRateLimit } = require('../middlewares/chatbotRateLimit');
const { validateChatbotPayload } = require('../middlewares/chatbotValidation');

const ChatbotRouter = express.Router();

ChatbotRouter.post('/chat', chatbotRateLimit, validateChatbotPayload, chatbotHandler);

module.exports = { ChatbotRouter };
