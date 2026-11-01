const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: Number, min: 0, max: 100, default: 0 },
    category: { type: String, default: 'general' },
    icon: { type: String },
    order: { type: Number, default: 0 },
    desc: { type: String, default: '' },
  },
  { timestamps: true },
);

const SkillModel = mongoose.model('Skill', skillSchema);

module.exports = { SkillModel };
