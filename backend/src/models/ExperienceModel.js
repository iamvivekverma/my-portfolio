const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    era: { type: String, required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    body: { type: String, required: true },
    tags: [{ type: String }],
    stat: {
      value: { type: String },
      label: { type: String },
    },
    isPulse: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const ExperienceModel = mongoose.model('Experience', experienceSchema);

module.exports = { ExperienceModel };
