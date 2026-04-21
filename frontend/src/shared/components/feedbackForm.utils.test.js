import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildFeedbackPayload,
  getFeedbackClientId,
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
    honeypot: '',
    metadata: {
      clientId: 'client-123',
      language: 'en-IN',
    },
  });

  assert.deepEqual(payload, {
    name: 'Vivek',
    content: 'This portfolio is easy to understand and feels professional.',
    honeypot: '',
    metadata: {
      clientId: 'client-123',
      language: 'en-IN',
    },
  });
});

test('getFeedbackClientId reuses an existing id from storage', () => {
  const store = new Map([['portfolio_feedback_client_id', 'saved-client-id']]);
  const storage = {
    getItem(key) {
      return store.get(key) || null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
  };

  const clientId = getFeedbackClientId(storage, {
    randomUUID() {
      return 'new-client-id';
    },
  });

  assert.equal(clientId, 'saved-client-id');
});
