const express = require('express');
const { chatbotHandler } = require('../controllers/ChatbotController');
const { chatbotRateLimit } = require('../middlewares/chatbotRateLimit');

const ChatbotRouter = express.Router();

ChatbotRouter.post('/chat', chatbotRateLimit, chatbotHandler);

module.exports = { ChatbotRouter };
