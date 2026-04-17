const { messages } = require('../constants/messages');
const { AboutModel } = require('../models/AboutModel');

const getData = async (req, res) => {
  try {
    const about = await AboutModel.findOne().sort({ updatedAt: -1 });
    res.json({ success: true, data: about || null });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const createData = async (req, res) => {
  try {
    const about = await AboutModel.create(req.body);
    res.status(201).json({ success: true, data: about });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const updateData = async (req, res) => {
  try {
    const about = await AboutModel.findOneAndUpdate({}, req.body, { new: true, upsert: true, sort: { updatedAt: -1 } });
    res.json({ success: true, data: about });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const deleteData = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AboutModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: messages.not_found.msg });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

module.exports = { getData, createData, updateData, deleteData };
