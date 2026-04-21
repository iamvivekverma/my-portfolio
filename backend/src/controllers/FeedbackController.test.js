const test = require('node:test');
const assert = require('node:assert/strict');

const { storeData } = require('./FeedbackController');
const { FeedbackModel } = require('../models/FeedbackModel');

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function createRequest(body = {}) {
  return {
    body,
    validatedFeedback: body,
    recaptcha: {
      score: 0.9,
      action: 'feedback_submit',
      bypassed: true,
    },
    headers: {
      'user-agent': 'test-agent',
      origin: 'http://localhost:5173',
      referer: 'http://localhost:5173/about',
    },
    ip: '127.0.0.1',
  };
}

const originalFindOne = FeedbackModel.findOne;
const originalSave = FeedbackModel.prototype.save;

test.afterEach(() => {
  FeedbackModel.findOne = originalFindOne;
  FeedbackModel.prototype.save = originalSave;
});

test('storeData accepts Hindi feedback when checks pass', async () => {
  FeedbackModel.findOne = () => ({
    lean: async () => null,
  });
  FeedbackModel.prototype.save = async function save() {
    return this;
  };

  const req = createRequest({
    name: 'Vivek',
    content: 'यह पोर्टफोलियो काफी अच्छा है और इसका अनुभव बहुत स्मूद लग रहा है।',
    metadata: {
      clientId: 'client-1',
    },
  });
  const res = createResponse();

  await storeData(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
});

test('storeData blocks duplicate feedback content from the same fingerprint', async () => {
  FeedbackModel.findOne = () => ({
    lean: async () => ({ _id: 'duplicate-feedback' }),
  });

  const req = createRequest({
    name: 'Vivek',
    content: 'This portfolio feels polished and easy to understand for visitors.',
    metadata: {
      clientId: 'client-3',
    },
  });
  const res = createResponse();

  await storeData(req, res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.success, false);
});

test('storeData rejects spammy feedback after sanitization and moderation', async () => {
  FeedbackModel.findOne = () => ({
    lean: async () => null,
  });

  const req = createRequest({
    name: 'Vivek',
    content: 'Buy now at https://spam.example and win free money today!',
    metadata: {
      clientId: 'client-4',
    },
  });
  const res = createResponse();

  await storeData(req, res);

  assert.equal(res.statusCode, 422);
  assert.equal(res.body.success, false);
});
