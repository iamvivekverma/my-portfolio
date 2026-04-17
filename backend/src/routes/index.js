const express = require('express');
const { ProjectsRouter } = require('./ProjectRoute');
const { AboutRouter } = require('./AboutRoute');
const { FeedbackRouter } = require('./FeedbackRoute');
const { SkillsRouter } = require('./SkillsRoute');
const { ExperienceRouter } = require('./ExperienceRoute');
const { ChatbotRouter } = require('./chatbot.route');
const { AdminRouter } = require('./AdminRoute');

const apiRouter = express.Router();

apiRouter.use('/projects', ProjectsRouter);
apiRouter.use('/about', AboutRouter);
apiRouter.use('/feedback', FeedbackRouter);
apiRouter.use('/skills', SkillsRouter);
apiRouter.use('/experience', ExperienceRouter);
apiRouter.use('/chatbot', ChatbotRouter);
apiRouter.use('/admin', AdminRouter);

module.exports = { apiRouter };
