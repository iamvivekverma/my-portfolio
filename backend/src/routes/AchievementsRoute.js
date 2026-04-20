const express = require('express');
const { getData, createData, updateData, deleteData } = require('../controllers/AchievementsController');
const { adminAuth } = require('../middlewares/adminAuth');

const AchievementsRouter = express.Router();

AchievementsRouter.get('/', getData);
AchievementsRouter.post('/', adminAuth, createData);
AchievementsRouter.put('/:id', adminAuth, updateData);
AchievementsRouter.delete('/:id', adminAuth, deleteData);

module.exports = { AchievementsRouter };
