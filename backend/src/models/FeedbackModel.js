const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  senderName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 80,
    trim: true,
  },
  senderEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    maxlength: 120,
  },
  content: {
    type: String,
    required: true,
    minlength: 15,
    maxlength: 1000,
    trim: true,
  },
  contentNormalized: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  origin: {
    type: String,
  },
  referrer: {
    type: String,
  },
  fingerprintHash: {
    type: String,
    index: true,
  },
  clientMeta: {
    pageUrl: String,
    referrer: String,
    timezone: String,
    language: String,
    platform: String,
    screen: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

feedbackSchema.index({ senderEmail: 1, createdAt: -1 });

const FeedbackModel = mongoose.model('Feedback', feedbackSchema);

module.exports = { FeedbackModel };
