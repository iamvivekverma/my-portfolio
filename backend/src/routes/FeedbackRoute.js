const express = require('express');
const { storeData, getData, deleteData } = require('../controllers/FeedbackController');
const { adminAuth } = require('../middlewares/adminAuth');

const FeedbackRouter = express.Router();

FeedbackRouter.post('/', storeData);
FeedbackRouter.get('/', adminAuth, getData);
FeedbackRouter.delete('/:id', adminAuth, deleteData);

module.exports = { FeedbackRouter };
