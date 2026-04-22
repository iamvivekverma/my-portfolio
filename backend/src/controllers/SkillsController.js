const { messages } = require('../constants/messages');
const {
  normalizeInteger,
  normalizeOptionalText,
  normalizeRequiredText,
} = require('../lib/contentValidation');
const { SkillModel } = require('../models/SkillsModel');

function normalizeSkillInput(payload) {
  return {
    name: normalizeRequiredText(payload?.name, 'Skill name', 120),
    level: normalizeInteger(payload?.level, 'Skill level', { min: 0, max: 100, fallback: 0 }),
    category: normalizeOptionalText(payload?.category, 'Skill category', 80) || 'general',
    icon: normalizeOptionalText(payload?.icon, 'Skill icon', 255),
    order: normalizeInteger(payload?.order, 'Skill order', { min: 0, max: 10000, fallback: 0 }),
    desc: normalizeOptionalText(payload?.desc, 'Skill description', 500) || '',
  };
}

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
    const skill = await SkillModel.create(normalizeSkillInput(req.body));
    res.status(201).json({ success: true, data: skill });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || messages.catch_error.msg });
  }
};

const updateData = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await SkillModel.findByIdAndUpdate(id, normalizeSkillInput(req.body), {
      new: true,
      runValidators: true,
    });
    if (!skill) return res.status(404).json({ success: false, message: messages.not_found.msg });
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || messages.catch_error.msg });
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
