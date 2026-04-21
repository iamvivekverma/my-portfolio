const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    content:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1000,
        trim: true
    },
    ip:{
        type: String,
        required: true
    },
    userAgent:{
        type: String
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

const FeedbackModel = mongoose.model('Feedback', feedbackSchema);

module.exports = { FeedbackModel };