const { messages } = require('../constants/messages');
const {
  normalizeBoolean,
  normalizeInteger,
  normalizeOptionalText,
  normalizeRequiredText,
  normalizeStringArray,
} = require('../lib/contentValidation');
const { ExperienceModel } = require('../models/ExperienceModel');

function normalizeExperienceInput(payload) {
  return {
    number: normalizeRequiredText(payload?.number, 'Experience number', 80),
    era: normalizeRequiredText(payload?.era, 'Experience era', 120),
    category: normalizeRequiredText(payload?.category, 'Experience category', 120),
    title: normalizeRequiredText(payload?.title, 'Experience title', 160),
    subtitle: normalizeOptionalText(payload?.subtitle, 'Experience subtitle', 200),
    body: normalizeRequiredText(payload?.body, 'Experience body', 2000),
    tags: normalizeStringArray(payload?.tags, 'Experience tags', { maxItems: 12, maxItemLength: 80 }),
    stat: {
      value: normalizeOptionalText(payload?.stat?.value, 'Experience stat value', 80),
      label: normalizeOptionalText(payload?.stat?.label, 'Experience stat label', 120),
    },
    isPulse: normalizeBoolean(payload?.isPulse, false),
    order: normalizeInteger(payload?.order, 'Experience order', {
      min: 0,
      max: 10000,
      fallback: 0,
    }),
  };
}

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
    const item = await ExperienceModel.create(normalizeExperienceInput(req.body));
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || messages.catch_error.msg });
  }
};

const updateData = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ExperienceModel.findByIdAndUpdate(id, normalizeExperienceInput(req.body), {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: messages.not_found.msg });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || messages.catch_error.msg });
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
