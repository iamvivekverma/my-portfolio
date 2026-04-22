const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { apiRouter } = require('./routes');

const app = express();
const DEFAULT_BODY_LIMIT = process.env.DEFAULT_BODY_LIMIT || '6mb';
const FEEDBACK_BODY_LIMIT = process.env.FEEDBACK_BODY_LIMIT || '10kb';

function getTrustProxySetting() {
  if (process.env.TRUST_PROXY === 'true') {
    return true;
  }

  if (process.env.TRUST_PROXY === 'false') {
    return false;
  }

  const numericTrustProxy = Number(process.env.TRUST_PROXY);

  if (Number.isInteger(numericTrustProxy) && numericTrustProxy >= 0) {
    return numericTrustProxy;
  }

  return 1;
}

app.disable('x-powered-by');
app.set('trust proxy', getTrustProxySetting());

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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-admin-secret', 'x-admin-token', 'x-project-access-token'],
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
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: false,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  }),
);

app.use(
  '/api/feedback',
  express.json({ limit: FEEDBACK_BODY_LIMIT }),
  express.urlencoded({ extended: true, limit: FEEDBACK_BODY_LIMIT }),
);
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.json({ limit: DEFAULT_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: DEFAULT_BODY_LIMIT }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRouter);

app.use((error, req, res, next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: req.originalUrl?.startsWith('/api/feedback')
        ? 'Feedback payload too large.'
        : 'Request payload too large.',
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

  if (error?.name === 'ValidationError' || error?.name === 'StrictModeError') {
    return res.status(400).json({
      success: false,
      message: error.message || 'Invalid request payload.',
    });
  }

  if (!isProduction()) {
    console.error(error);
  }

  return res.status(error?.status || 500).json({
    success: false,
    message: isProduction() ? 'Something went wrong.' : error?.message || 'Something went wrong.',
    ...(isProduction() || !error?.details ? {} : { details: error.details }),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = { app };
