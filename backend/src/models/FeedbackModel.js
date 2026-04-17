const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    content:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

const FeedbackModel = mongoose.model('Feedback', feedbackSchema);

module.exports = { FeedbackModel };