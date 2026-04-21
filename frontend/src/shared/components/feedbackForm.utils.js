export const FEEDBACK_CLIENT_ID_KEY = 'portfolio_feedback_client_id';

export function getFeedbackClientId(storage = window.localStorage, cryptoRef = window.crypto) {
  const existingId = storage.getItem(FEEDBACK_CLIENT_ID_KEY);

  if (existingId) {
    return existingId;
  }

  const nextId =
    cryptoRef?.randomUUID?.() || `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  storage.setItem(FEEDBACK_CLIENT_ID_KEY, nextId);
  return nextId;
}

export function validateFeedback(name, content) {
  const trimmedName = name.trim();
  const trimmedContent = content.trim();
  const normalized = trimmedContent.toLowerCase().replace(/\s+/g, ' ');
  const wordCount = trimmedContent.split(/\s+/).filter(Boolean).length;
  const letterChars = (trimmedContent.match(/\p{L}/gu) || []).length;

  if (!trimmedName) {
    return 'Please enter your name.';
  }

  if (trimmedName.length < 2) {
    return 'Please enter a proper name.';
  }

  if (!trimmedContent) {
    return 'Please write your message before submitting.';
  }

  if (trimmedContent.length < 15 || wordCount < 3 || letterChars < 8) {
    return 'Please type a proper message with a little more detail so I can understand your feedback.';
  }

  if (/^(hi|hello|hey|test|testing|ok|nice|good|cool|hmm+|lol|yo)$/i.test(normalized)) {
    return 'Please type a proper message with a little more detail so I can understand your feedback.';
  }

  if (/^(asdf|qwer|zxcv|1234|0000|abc|demo|dummy)+$/i.test(normalized) || /(.)\1{6,}/.test(trimmedContent)) {
    return 'Please do not send random or meaningless text. Write a clear message instead.';
  }

  if (/https?:\/\/|www\./i.test(trimmedContent)) {
    return 'Please avoid links here and send a simple feedback message instead.';
  }

  return '';
}

export function buildFeedbackPayload({ name, content, honeypot, metadata }) {
  return {
    name,
    content,
    honeypot,
    metadata,
  };
}
