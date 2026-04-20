const { messages } = require('../constants/messages');
const { AchievementsModel } = require('../models/AchievementsModel');

const getData = async (req, res) => {
  try {
    const achievements = await AchievementsModel.find().sort({ order: 1 });
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const createData = async (req, res) => {
  try {
    const item = await AchievementsModel.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const updateData = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await AchievementsModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: messages.not_found.msg });
    res.json({ success: true, data: item });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const deleteData = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AchievementsModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: messages.not_found.msg });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

module.exports = { getData, createData, updateData, deleteData };
