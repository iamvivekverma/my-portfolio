const express = require('express');
const { storeData } = require('../controllers/FeedbackController');

const FeedbackRouter = express.Router();

FeedbackRouter.post('/', storeData);

module.exports = { FeedbackRouter };
