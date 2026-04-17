const mongoose = require('mongoose');
const { messages } = require('../constants/messages');
const { ProjectModel } = require('../models/ProjectsModel');

const getData = async (req, res) => {
  try {
    const projects = await ProjectModel.find();

    res.status(200).json({
      success: true,
      data: projects, // always return array
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      message: messages.catch_error.msg,
    });
  }
};

const getDataById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID format' });
    }

    const project = await ProjectModel.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: messages.catch_error.msg,
    });
  }
};


const createData = async (req, res) => {
  try {
    const project = await ProjectModel.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const updateData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID format' });
    }

    const cleanData = {};

    for (const key in req.body) {
      const value = req.body[key];

      if (value === '') {
        cleanData[key] = null;
      } else if (key === 'image') {
        if (!value) {
          cleanData[key] = null;
          continue;
        }

        if (value.length > 10000000) { // 10MB limit
          return res.status(400).json({ success: false, message: 'Image too large (max 10MB)' });
        }

        const isSupportedImage =
          typeof value === 'string' &&
          (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/'));

        if (!isSupportedImage) {
          return res.status(400).json({
            success: false,
            message: 'Invalid image format (use a data URL, absolute URL, or site-relative path)',
          });
        }

        cleanData[key] = value;
      } else if (key === 'technologies' && Array.isArray(value)) {
        cleanData[key] = value.filter(Boolean);
      } else {
        cleanData[key] = value;
      }
    }

    const project = await ProjectModel.findByIdAndUpdate(id, cleanData, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: messages.not_found.msg });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: `Invalid data type for field: ${error.path}` });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    res.status(500).json({ success: false, message: error.message || messages.catch_error.msg });
  }
};

const deleteData = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProjectModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: messages.not_found.msg });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const verifyPin = async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    const project = await ProjectModel.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // If project has no PIN, it's publicly accessible
    if (!project.pin) {
      return res.json({ success: true, unlocked: true });
    }

    // Verify PIN
    if (project.pin === pin) {
      return res.json({ success: true, unlocked: true });
    } else {
      return res.status(401).json({ success: false, unlocked: false, message: 'Incorrect PIN' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

module.exports = { getData, getDataById, createData, updateData, deleteData, verifyPin };
