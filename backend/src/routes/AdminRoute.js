const express = require('express');
const { createAdminToken, validateAdminSecret } = require('../middlewares/adminAuth');
const { adminLoginRateLimit } = require('../middlewares/adminLoginRateLimit');

const AdminRouter = express.Router();

AdminRouter.post('/verify', adminLoginRateLimit, (req, res) => {
  const result = validateAdminSecret(req.headers['x-admin-secret']);

  if (!result.ok) {
    return res.status(result.status).json({ success: false, message: result.message });
  }

  const session = createAdminToken();

  if (!session.ok) {
    return res.status(session.status).json({ success: false, message: session.message });
  }

  return res.json({
    success: true,
    token: session.token,
    expiresAt: session.expiresAt,
  });
});

module.exports = { AdminRouter };
