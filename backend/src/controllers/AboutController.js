const { messages } = require('../constants/messages');
const {
  normalizeEmail,
  normalizeHttpUrl,
  normalizeOptionalText,
  normalizeRequiredText,
} = require('../lib/contentValidation');
const { AboutModel } = require('../models/AboutModel');

function normalizeAboutInput(payload) {
  return {
    headline: normalizeRequiredText(payload?.headline, 'Headline', 160),
    bio: normalizeRequiredText(payload?.bio, 'Bio', 2000),
    location: normalizeOptionalText(payload?.location, 'Location', 160),
    email: normalizeEmail(payload?.email, 'Email'),
    socials: {
      linkedin: normalizeHttpUrl(payload?.socials?.linkedin, 'LinkedIn URL'),
      github: normalizeHttpUrl(payload?.socials?.github, 'GitHub URL'),
      instagram: normalizeHttpUrl(payload?.socials?.instagram, 'Instagram URL'),
      youtube: normalizeHttpUrl(payload?.socials?.youtube, 'YouTube URL'),
    },
    availability: normalizeOptionalText(payload?.availability, 'Availability', 160),
  };
}

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
    const about = await AboutModel.create(normalizeAboutInput(req.body));
    res.status(201).json({ success: true, data: about });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || messages.catch_error.msg });
  }
};

const updateData = async (req, res) => {
  try {
    const about = await AboutModel.findOneAndUpdate(
      {},
      normalizeAboutInput(req.body),
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        sort: { updatedAt: -1 },
      },
    );
    res.json({ success: true, data: about });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || messages.catch_error.msg });
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
