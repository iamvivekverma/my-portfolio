const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  fullDescription: {
    type: String,
    default: null,
    trim: true,
  },
  technologies: [{ type: String, trim: true }],
  liveLink: {
    type: String,
    default: null,
    trim: true,
  },
  githubLink: {
    type: String,
    default: null,
    trim: true,
  },
  badge: {
    type: String,
    default: null,
    trim: true,
  },
  pin: {
    type: String,
    default: null,
    match: [/^\d{4}$/, 'Project PIN must be exactly 4 digits.'],
  },
  image: {
    type: String,
    default: null,
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProjectModel = mongoose.model('Project', projectSchema);

module.exports = {ProjectModel}
