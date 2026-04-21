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

const originalSave = FeedbackModel.prototype.save;

test.afterEach(() => {
  FeedbackModel.prototype.save = originalSave;
});

test('storeData accepts Hindi feedback when checks pass', async () => {
  FeedbackModel.prototype.save = async function save() {
    return this;
  };

  const req = createRequest({
    name: 'Vivek',
    content: 'यह पोर्टफोलियो काफी अच्छा है और इसका अनुभव बहुत स्मूद लग रहा है।',
  });
  const res = createResponse();

  await storeData(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
});

test('storeData saves simple feedback without extra fingerprint metadata', async () => {
  let savedDoc = null;
  FeedbackModel.prototype.save = async function save() {
    savedDoc = this.toObject();
    return this;
  };
  const req = createRequest({
    name: 'Vivek',
    content: 'This portfolio feels polished and easy to understand for visitors.',
  });
  const res = createResponse();

  await storeData(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(savedDoc.senderName, 'Vivek');
  assert.equal(savedDoc.content, 'This portfolio feels polished and easy to understand for visitors.');
  assert.equal(savedDoc.ip, '127.0.0.1');
  assert.equal(savedDoc.userAgent, 'test-agent');
});
