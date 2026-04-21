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
    },
    ip: '127.0.0.1',
  };
}

const originalSave = FeedbackModel.prototype.save;

test.afterEach(() => {
  FeedbackModel.prototype.save = originalSave;
});

test('storeData saves feedback with sender email', async () => {
  let savedDoc = null;

  FeedbackModel.prototype.save = async function save() {
    savedDoc = this.toObject();
    return this;
  };

  const req = createRequest({
    name: 'Vivek',
    email: 'vivek@example.com',
    content: 'This portfolio feels polished and easy to understand for visitors.',
  });
  const res = createResponse();

  await storeData(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(savedDoc.senderName, 'Vivek');
  assert.equal(savedDoc.senderEmail, 'vivek@example.com');
  assert.equal(savedDoc.content, 'This portfolio feels polished and easy to understand for visitors.');
  assert.equal(savedDoc.ip, '127.0.0.1');
  assert.equal(savedDoc.userAgent, 'test-agent');
});
