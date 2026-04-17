const { messages } = require('../constants/messages');
const { ExperienceModel } = require('../models/ExperienceModel');

const getData = async (req, res) => {
  try {
    const experiences = await ExperienceModel.find().sort({ order: 1 });
    res.json({ success: true, data: experiences });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const createData = async (req, res) => {
  try {
    const item = await ExperienceModel.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const updateData = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ExperienceModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: messages.not_found.msg });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const deleteData = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ExperienceModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: messages.not_found.msg });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

module.exports = { getData, createData, updateData, deleteData };
