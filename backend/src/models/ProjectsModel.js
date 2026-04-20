const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  technologies: [String],  // Array of tech used
  liveLink: String,
  githubLink: String,
  badge: {
    type: String,
    default: ''
  },
  pin: {
    type: String,
    default: null  // null means no PIN required
  },
  image: {
    type: String,
    default: null  // Image URL or base64
  },
  order: {
    type: Number,
    default: 0  // Display order
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ProjectModel = mongoose.model('Project', projectSchema);

module.exports = {ProjectModel}