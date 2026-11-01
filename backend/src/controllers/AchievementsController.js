const { messages } = require('../constants/messages');
const {
  normalizeBoolean,
  normalizeHttpUrl,
  normalizeInteger,
  normalizeOptionalText,
  normalizeRequiredText,
  normalizeStringArray,
} = require('../lib/contentValidation');
const { AchievementsModel } = require('../models/AchievementsModel');

function normalizeAchievementInput(payload) {
  return {
    title: normalizeRequiredText(payload?.title, 'Achievement title', 160),
    type: normalizeRequiredText(payload?.type, 'Achievement type', 120),
    issuer: normalizeRequiredText(payload?.issuer, 'Achievement issuer', 160),
    issuerLogo: normalizeOptionalText(payload?.issuerLogo, 'Achievement issuer logo', 60),
    date: normalizeRequiredText(payload?.date, 'Achievement date', 80),
    category: normalizeStringArray(payload?.category, 'Achievement category', {
      maxItems: 8,
      maxItemLength: 80,
    }),
    badgeLabel: normalizeOptionalText(payload?.badgeLabel, 'Achievement badge label', 80),
    badgeStyle: normalizeOptionalText(payload?.badgeStyle, 'Achievement badge style', 80),
    isWinner: normalizeBoolean(payload?.isWinner, false),
    description: normalizeOptionalText(payload?.description, 'Achievement description', 1200),
    skills: normalizeStringArray(payload?.skills, 'Achievement skills', {
      maxItems: 12,
      maxItemLength: 80,
    }),
    verifyUrl: normalizeHttpUrl(payload?.verifyUrl, 'Achievement verify URL'),
    order: normalizeInteger(payload?.order, 'Achievement order', {
      min: 0,
      max: 10000,
      fallback: 0,
    }),
  };
}

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
    const item = await AchievementsModel.create(normalizeAchievementInput(req.body));
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || messages.catch_error.msg });
  }
};

const updateData = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await AchievementsModel.findByIdAndUpdate(id, normalizeAchievementInput(req.body), {
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
    const deleted = await AchievementsModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: messages.not_found.msg });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: messages.catch_error.msg });
  }
};

module.exports = { getData, createData, updateData, deleteData };
