const { messages } = require('../constants/messages');
const { SkillModel } = require('../models/SkillsModel');

const getData = async (req, res) => {
  try {
    const skills = await SkillModel.find().sort({ order: 1 });
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const createData = async (req, res) => {
  try {
    const skill = await SkillModel.create(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const updateData = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await SkillModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!skill) return res.status(404).json({ success: false, message: messages.not_found.msg });
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

const deleteData = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SkillModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: messages.not_found.msg });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

module.exports = { getData, createData, updateData, deleteData };
