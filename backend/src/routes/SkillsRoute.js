const express = require('express');
const { getData, createData, updateData, deleteData } = require('../controllers/SkillsController');
const { adminAuth } = require('../middlewares/adminAuth');

const SkillsRouter = express.Router();

SkillsRouter.get('/', getData);
SkillsRouter.post('/', adminAuth, createData);
SkillsRouter.put('/:id', adminAuth, updateData);
SkillsRouter.delete('/:id', adminAuth, deleteData);

module.exports = { SkillsRouter };
