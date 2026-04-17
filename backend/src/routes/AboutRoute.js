const express = require('express');
const { getData, createData, updateData, deleteData } = require('../controllers/AboutController');
const { adminAuth } = require('../middlewares/adminAuth');

const AboutRouter = express.Router();

AboutRouter.get('/', getData);
AboutRouter.post('/', adminAuth, createData);
AboutRouter.put('/', adminAuth, updateData);
AboutRouter.delete('/:id', adminAuth, deleteData);

module.exports = { AboutRouter };
