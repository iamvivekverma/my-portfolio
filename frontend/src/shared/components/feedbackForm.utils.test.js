import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildFeedbackPayload,
  getFriendlyFeedbackErrorMessage,
  sanitizeFeedbackMessageInput,
  sanitizeFeedbackNameInput,
  validateFeedback,
} from './feedbackForm.utils.js';

test('validateFeedback accepts meaningful Hindi feedback', () => {
  const result = validateFeedback('Vivek', 'यह साइट काफी अच्छी है और नेविगेशन भी बहुत आसान लग रहा है।');
  assert.equal(result, '');
});

test('validateFeedback explains empty submissions', () => {
  const result = validateFeedback('', '');
  assert.equal(result, 'Please enter your name.');
});

test('buildFeedbackPayload returns the expected submit payload', () => {
  const payload = buildFeedbackPayload({
    name: 'Vivek',
    content: 'This portfolio is easy to understand and feels professional.',
    captchaToken: 'captcha-token',
  });

  assert.deepEqual(payload, {
    name: 'Vivek',
    content: 'This portfolio is easy to understand and feels professional.',
    captchaToken: 'captcha-token',
  });
});

test('input sanitizers strip HTML and unsafe characters', () => {
  assert.equal(sanitizeFeedbackNameInput('<b>Vivek123</b>'), ' Vivek ');
  const sanitizedMessage = sanitizeFeedbackMessageInput('Hello <script>alert(1)</script><b>world</b> from feedback');
  assert.equal(sanitizedMessage.includes('<script>'), false);
  assert.equal(sanitizedMessage.includes('<b>'), false);
  assert.equal(sanitizedMessage.includes('alert(1)'), false);
  assert.equal(sanitizedMessage.includes('world'), true);
});

test('input sanitizers preserve natural spaces while typing', () => {
  assert.equal(sanitizeFeedbackNameInput('Vivek '), 'Vivek ');
  assert.equal(sanitizeFeedbackMessageInput('This is  my feedback '), 'This is  my feedback ');
});

test('buildFeedbackPayload normalizes spaces on submit', () => {
  const payload = buildFeedbackPayload({
    name: '  Vivek   Verma  ',
    content: 'This   portfolio is   very helpful.  ',
    captchaToken: 'captcha-token',
  });

  assert.equal(payload.name, 'Vivek Verma');
  assert.equal(payload.content, 'This portfolio is very helpful.');
});

test('friendly feedback errors hide technical implementation details', () => {
  assert.equal(
    getFriendlyFeedbackErrorMessage({ status: 403, message: 'CAPTCHA verification failed. Please try again.' }),
    "I couldn't verify the submission just now. Please try once more.",
  );
  assert.equal(
    getFriendlyFeedbackErrorMessage({ status: 429, message: 'Too many feedback attempts.' }),
    'Too many attempts right now. Please wait a little and try again.',
  );
  assert.equal(
    getFriendlyFeedbackErrorMessage({ status: 500, message: 'Internal error' }),
    'Failed to submit feedback. Please try again.',
  );
});
