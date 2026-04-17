const path = require('path');
const dotenv = require('dotenv');

function loadEnv() {
  const envFile = process.env.ENV_FILE || path.join(__dirname, '../../.env');
  dotenv.config({ path: envFile });
}

module.exports = { loadEnv };
