const mongoose = require('mongoose');

const achievementsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    issuer: { type: String, required: true },
    issuerLogo: { type: String },
    date: { type: String, required: true },
    category: [{ type: String }],
    badgeLabel: { type: String },
    badgeStyle: { type: String },
    isWinner: { type: Boolean, default: false },
    description: { type: String },
    skills: [{ type: String }],
    verifyUrl: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const AchievementsModel = mongoose.model('Achievements', achievementsSchema);

module.exports = { AchievementsModel };
