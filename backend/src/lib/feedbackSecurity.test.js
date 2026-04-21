const test = require('node:test');
const assert = require('node:assert/strict');

const {
  analyzeSubmission,
  createFingerprint,
  normalizeContentForCompare,
} = require('./feedbackSecurity');

test('analyzeSubmission accepts Hindi feedback', () => {
  const result = analyzeSubmission({
    content: 'यह पोर्टफोलियो बहुत अच्छा है और डिजाइन काफी साफ लग रहा है।',
    honeypot: '',
  });

  assert.equal(result.rejected, false);
  assert.deepEqual(result.reasons, []);
});

test('analyzeSubmission blocks obvious spam links', () => {
  const result = analyzeSubmission({
    content: 'Click here http://spam.example now and win free money instantly',
    honeypot: '',
  });

  assert.equal(result.rejected, true);
  assert.ok(result.reasons.includes('contains_link'));
});

test('createFingerprint stays stable for the same client details', () => {
  const first = createFingerprint({
    ip: '127.0.0.1',
    userAgent: 'test-agent',
    clientId: 'client-1',
  });
  const second = createFingerprint({
    ip: '127.0.0.1',
    userAgent: 'test-agent',
    clientId: 'client-1',
  });

  assert.equal(first, second);
});

test('normalizeContentForCompare collapses whitespace consistently', () => {
  const result = normalizeContentForCompare('Hello   world\nthis is   feedback');
  assert.equal(result, 'hello world this is feedback');
});
