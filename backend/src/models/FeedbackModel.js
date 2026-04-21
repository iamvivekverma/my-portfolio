const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
  {
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
      maxlength: 160,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1000,
      trim: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    captcha: {
      score: Number,
      action: String,
      bypassed: {
        type: Boolean,
        default: false,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    strict: 'throw',
  },
);

feedbackSchema.index({ senderName: 1, createdAt: -1 });
feedbackSchema.index({ senderEmail: 1, createdAt: -1 });

const FeedbackModel = mongoose.model('Feedback', feedbackSchema);

module.exports = { FeedbackModel };
