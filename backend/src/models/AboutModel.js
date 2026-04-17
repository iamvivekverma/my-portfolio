const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema(
  {
    headline: { type: String, required: true },
    bio: { type: String, required: true },
    location: { type: String },
    email: { type: String },
    socials: {
      linkedin: String,
      github: String,
      instagram: String,
      youtube: String,
    },
    availability: { type: String },
  },
  { timestamps: true },
);

const AboutModel = mongoose.model('About', aboutSchema);

module.exports = { AboutModel };
