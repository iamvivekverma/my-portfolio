const express = require('express');
const { getData, createData, updateData, deleteData } = require('../controllers/ExperienceController');
const { adminAuth } = require('../middlewares/adminAuth');

const ExperienceRouter = express.Router();

ExperienceRouter.get('/', getData);
ExperienceRouter.post('/', adminAuth, createData);
ExperienceRouter.put('/:id', adminAuth, updateData);
ExperienceRouter.delete('/:id', adminAuth, deleteData);

module.exports = { ExperienceRouter };
