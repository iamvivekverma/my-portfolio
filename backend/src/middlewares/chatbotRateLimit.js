const CHATBOT_WINDOW_MS = Number(process.env.CHATBOT_RATE_WINDOW_MS || 60_000);
const CHATBOT_MAX_REQUESTS_PER_WINDOW = Number(process.env.CHATBOT_MAX_REQUESTS_PER_WINDOW || 8);
const CHATBOT_DAILY_LIMIT = Number(process.env.CHATBOT_DAILY_LIMIT || 80);

const chatbotTraffic = new Map();

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function cleanupChatbotTraffic(now) {
  for (const [ip, record] of chatbotTraffic.entries()) {
    if (record.dayStamp !== new Date(now).toDateString()) {
      chatbotTraffic.delete(ip);
      continue;
    }

    record.requests = record.requests.filter((timestamp) => now - timestamp < CHATBOT_WINDOW_MS);

    if (record.requests.length === 0 && record.dailyCount === 0) {
      chatbotTraffic.delete(ip);
    }
  }
}

function chatbotRateLimit(req, res, next) {
  const now = Date.now();
  const dayStamp = new Date(now).toDateString();
  const ip = getClientIp(req);
  const record = chatbotTraffic.get(ip) || { requests: [], dailyCount: 0, dayStamp };

  if (record.dayStamp !== dayStamp) {
    record.requests = [];
    record.dailyCount = 0;
    record.dayStamp = dayStamp;
  }

  record.requests = record.requests.filter((timestamp) => now - timestamp < CHATBOT_WINDOW_MS);

  if (record.dailyCount >= CHATBOT_DAILY_LIMIT) {
    return res.status(429).json({
      error: 'Daily chatbot limit reached for this IP. Please try again tomorrow.',
    });
  }

  if (record.requests.length >= CHATBOT_MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too many chatbot requests. Please wait a minute and try again.',
    });
  }

  record.requests.push(now);
  record.dailyCount += 1;
  chatbotTraffic.set(ip, record);
  cleanupChatbotTraffic(now);
  next();
}

module.exports = { chatbotRateLimit };
