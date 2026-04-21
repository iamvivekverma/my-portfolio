const test = require('node:test');
const assert = require('node:assert/strict');

const {
  feedbackValidationRules,
  handleFeedbackValidation,
} = require('./feedbackValidation');

async function runValidation(body) {
  const req = { body };
  const res = {
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

  for (const rule of feedbackValidationRules) {
    await rule.run(req);
  }

  let nextCalled = false;
  handleFeedbackValidation(req, res, () => {
    nextCalled = true;
  });

  return { req, res, nextCalled };
}

test('feedback validation sanitizes HTML from name and content', async () => {
  const { req, res, nextCalled } = await runValidation({
    name: '<b>Vivek</b>',
    content: 'This portfolio <script>alert(1)</script> feels polished and informative.',
    captchaToken: 'token-value-that-is-long-enough-for-tests',
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.equal(req.validatedFeedback.name, 'Vivek');
  assert.equal(req.validatedFeedback.content, 'This portfolio feels polished and informative.');
});

test('feedback validation rejects NoSQL-style operator objects', async () => {
  const { res, nextCalled } = await runValidation({
    name: { $ne: '' },
    content: 'This portfolio feels polished and easy to understand for visitors.',
    captchaToken: 'token-value-that-is-long-enough-for-tests',
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});
