const mongoose = require('mongoose');

function connectDB() {
  const { MONGODB_URI, DB_NAME } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  const dbName = DB_NAME || 'portfolio';

  return mongoose.connect(MONGODB_URI, { dbName });
}

module.exports = { connectDB };
