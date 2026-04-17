const http = require('http');
const { loadEnv } = require('./config/env');
const { connectDB } = require('./config/db');
const { app } = require('./app');

loadEnv();

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

start();
