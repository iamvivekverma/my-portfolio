const express = require('express');
const { getData, getDataById, createData, updateData, deleteData, verifyPin } = require('../controllers/ProjectsController');
const { adminAuth } = require('../middlewares/adminAuth');

const ProjectsRouter = express.Router();

ProjectsRouter.get('/', getData);
ProjectsRouter.get('/:id', getDataById);
ProjectsRouter.post('/', adminAuth, createData);
ProjectsRouter.put('/:id', adminAuth, updateData);
ProjectsRouter.delete('/:id', adminAuth, deleteData);
ProjectsRouter.post('/:id/verify-pin', verifyPin);

module.exports = { ProjectsRouter };
