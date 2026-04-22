const { getClientIp } = require('./inputSecurity');

function truncate(value, maxLength = 500) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.slice(0, maxLength);
}

function logSecurityEvent(event, req, details = {}, level = 'warn') {
  const entry = {
    event,
    timestamp: new Date().toISOString(),
    ip: getClientIp(req),
    method: req.method,
    path: req.originalUrl,
    userAgent: truncate(req.headers['user-agent']),
    ...details,
  };

  console[level](`[security] ${JSON.stringify(entry)}`);
}

module.exports = {
  logSecurityEvent,
};
