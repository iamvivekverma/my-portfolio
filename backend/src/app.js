const path = require('path');
const express = require('express');
const cors = require('cors');
const { apiRouter } = require('./routes');

const app = express();

function getAllowedOrigins() {
  const rawOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174';

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = getAllowedOrigins();

      // Allow all origins for development
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRouter);

app.use((error, req, res, next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Upload too large. Please use a smaller image.',
    });
  }

  return next(error);
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = { app };
