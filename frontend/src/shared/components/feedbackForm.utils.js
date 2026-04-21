export const FEEDBACK_CLIENT_ID_KEY = 'portfolio_feedback_client_id';
const RECAPTCHA_SCRIPT_ID = 'feedback-recaptcha-script';
const RECAPTCHA_SRC = 'https://www.google.com/recaptcha/api.js?render=';
const DEV_CAPTCHA_TOKEN = 'development-feedback-captcha-token';
const IS_DEV = Boolean(import.meta?.env?.DEV);
const RECAPTCHA_BADGE_SELECTOR = '.grecaptcha-badge';

function stripHtml(value) {
  return typeof value === 'string'
    ? value
        .normalize('NFKC')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<\/?[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : '';
}

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

export function sanitizeFeedbackNameInput(name) {
  return stripHtml(name)
    .replace(/[^\p{L}\p{M}\s.'-]/gu, '')
    .slice(0, 80);
}

export function sanitizeFeedbackMessageInput(content) {
  return stripHtml(content).slice(0, 1000);
}

export function validateFeedback(name, content) {
  const trimmedName = sanitizeFeedbackNameInput(name).trim();
  const trimmedContent = sanitizeFeedbackMessageInput(content).trim();
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

export function buildFeedbackPayload({ name, content, honeypot, metadata, captchaToken }) {
  return {
    name: sanitizeFeedbackNameInput(name),
    content: sanitizeFeedbackMessageInput(content),
    honeypot,
    captchaToken,
    metadata,
  };
}

export function loadRecaptchaScript(siteKey, documentRef = document) {
  if (IS_DEV && !siteKey) {
    return Promise.resolve(null);
  }

  if (!siteKey) {
    return Promise.reject(new Error('Feedback CAPTCHA is not configured.'));
  }

  if (typeof window === 'undefined') {
    return Promise.reject(new Error('CAPTCHA is only available in the browser.'));
  }

  if (window.grecaptcha?.ready) {
    return Promise.resolve(window.grecaptcha);
  }

  const existingScript = documentRef.getElementById(RECAPTCHA_SCRIPT_ID);

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(window.grecaptcha), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load CAPTCHA.')), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = documentRef.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `${RECAPTCHA_SRC}${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.grecaptcha);
    script.onerror = () => reject(new Error('Unable to load CAPTCHA.'));
    documentRef.head.appendChild(script);
  });
}

export function setRecaptchaBadgeVisibility(isVisible, documentRef = document) {
  if (typeof window === 'undefined') {
    return;
  }

  const applyVisibility = () => {
    const badge = documentRef.querySelector(RECAPTCHA_BADGE_SELECTOR);

    if (!badge) {
      return false;
    }

    badge.style.visibility = isVisible ? 'visible' : 'hidden';
    badge.style.opacity = isVisible ? '1' : '0';
    badge.style.pointerEvents = isVisible ? 'auto' : 'none';
    return true;
  };

  if (applyVisibility()) {
    return;
  }

  window.setTimeout(() => {
    applyVisibility();
  }, 250);
}

export async function getFeedbackCaptchaToken(siteKey) {
  if (IS_DEV && !siteKey) {
    return DEV_CAPTCHA_TOKEN;
  }

  const grecaptcha = await loadRecaptchaScript(siteKey);

  return new Promise((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha
        .execute(siteKey, { action: 'feedback_submit' })
        .then(resolve)
        .catch(() => reject(new Error('Unable to verify CAPTCHA. Please try again.')));
    });
  });
}
