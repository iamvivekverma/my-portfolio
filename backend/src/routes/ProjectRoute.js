const express = require('express');
const {
  getData,
  getImageById,
  getDataById,
  createData,
  updateData,
  deleteData,
  verifyProjectPin,
  reorderProjects,
} = require('../controllers/ProjectsController');
const { adminAuth } = require('../middlewares/adminAuth');

const ProjectsRouter = express.Router();

ProjectsRouter.get('/', getData);
ProjectsRouter.get('/:id/image', getImageById);
ProjectsRouter.get('/:id', getDataById);
ProjectsRouter.post('/', adminAuth, createData);
ProjectsRouter.put('/:id', adminAuth, updateData);
ProjectsRouter.delete('/:id', adminAuth, deleteData);
ProjectsRouter.post('/:id/verify-access-code', verifyProjectPin);
ProjectsRouter.post('/:id/verify-pin', verifyProjectPin);
ProjectsRouter.post('/reorder', adminAuth, reorderProjects);

module.exports = { ProjectsRouter };
