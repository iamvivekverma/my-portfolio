const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { apiRouter } = require('./routes');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
      },
    },
    crossOriginResourcePolicy: false,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  }),
);

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRouter);

app.use((error, req, res, next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Upload too large. Please use a smaller image.',
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload.',
    });
  }

  if (error?.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed.',
    });
  }

  if (!isProduction()) {
    console.error(error);
  }

  return res.status(error?.status || 500).json({
    success: false,
    message: isProduction() ? 'Something went wrong.' : error?.message || 'Something went wrong.',
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = { app };
