const { messages } = require('../constants/messages');
const { FeedbackModel } = require('../models/FeedbackModel');

const storeData= async (req, res)=> {
    try{
        const { content } = req.body;
        const feedback = new FeedbackModel({ content });
        await feedback.save();
        
        res.status(201).json({
            success : true,
            message: messages.created.msg
        })
    } catch(error){
        res.status(500).json({
            success: false,
            message: messages.catch_error.msg

        })
    }


}

module.exports={ storeData }
