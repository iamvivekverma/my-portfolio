const FEEDBACK_NAME_MAX_LENGTH = 50;
const FEEDBACK_CONTENT_MAX_LENGTH = 1000;
const FEEDBACK_HONEYPOT_MAX_LENGTH = 200;
const SCRIPT_TAG_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const HTML_TAG_PATTERN = /<\/?[^>]+>/g;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function replaceControlChars(value) {
  return Array.from(value, (char) => {
    const code = char.charCodeAt(0);

    return code < 32 || code === 127 ? ' ' : char;
  }).join('');
}

function stripHtml(value, { collapseWhitespace = false, trim = false } = {}) {
  if (typeof value !== 'string') {
    return '';
  }

  const sanitized = value
    .normalize('NFKC')
    .replace(SCRIPT_TAG_PATTERN, ' ')
    .replace(HTML_TAG_PATTERN, ' ');

  const withoutControlChars = replaceControlChars(sanitized);

  const normalized = withoutControlChars
    .replace(collapseWhitespace ? /\s+/g : /\r\n?/g, collapseWhitespace ? ' ' : '\n');

  return trim ? normalized.trim() : normalized;
}

function normalizeForSubmit(value) {
  return stripHtml(value, {
    collapseWhitespace: true,
    trim: true,
  });
}

export function sanitizeFeedbackNameInput(name) {
  return stripHtml(name)
    .replace(/[^\p{L}\p{M}\s.'-]/gu, '')
    .slice(0, FEEDBACK_NAME_MAX_LENGTH);
}

export function sanitizeFeedbackEmailInput(email) {
  return stripHtml(email)
    .replace(/\s+/g, '')
    .slice(0, 160);
}

export function sanitizeFeedbackMessageInput(content) {
  return stripHtml(content).slice(0, FEEDBACK_CONTENT_MAX_LENGTH);
}

export function sanitizeFeedbackHoneypotInput(content) {
  return stripHtml(content).slice(0, FEEDBACK_HONEYPOT_MAX_LENGTH);
}

function normalizeFeedbackEmail(email) {
  return sanitizeFeedbackEmailInput(email).trim().toLowerCase();
}

export function validateFeedback(name, email, content) {
  const trimmedName = normalizeForSubmit(sanitizeFeedbackNameInput(name));
  const trimmedEmail = normalizeFeedbackEmail(email);
  const trimmedContent = normalizeForSubmit(sanitizeFeedbackMessageInput(content));

  if (!trimmedName) {
    return 'Please enter your name.';
  }

  if (trimmedName.length < 2) {
    return 'Please enter a proper name.';
  }

  if (trimmedName.length > FEEDBACK_NAME_MAX_LENGTH) {
    return 'Please keep your name under 50 characters.';
  }

  if (!trimmedEmail) {
    return 'Please enter your email address.';
  }

  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return 'Please enter a valid email address.';
  }

  if (!trimmedContent) {
    return 'Please write your message before submitting.';
  }

  if (trimmedContent.length < 3) {
    return 'Please write a short message (at least 3 characters).';
  }

  if (trimmedContent.length > FEEDBACK_CONTENT_MAX_LENGTH) {
    return 'Please keep your message under 1000 characters.';
  }

  return '';
}

export function getFriendlyFeedbackErrorMessage(error) {
  const status = error?.status;
  const rawMessage = error?.message || '';

  if (status === 429) {
    return rawMessage || 'Too many attempts right now. Please wait a little and try again.';
  }

  if (status === 400) {
    return rawMessage || 'Please check your name, email, and message, then try again.';
  }

  return 'Failed to submit feedback. Please try again.';
}

export function buildFeedbackPayload({ name, email, content, website = '' }) {
  return {
    name: normalizeForSubmit(sanitizeFeedbackNameInput(name)),
    email: normalizeFeedbackEmail(email),
    content: normalizeForSubmit(sanitizeFeedbackMessageInput(content)),
    website: normalizeForSubmit(sanitizeFeedbackHoneypotInput(website)),
  };
}
