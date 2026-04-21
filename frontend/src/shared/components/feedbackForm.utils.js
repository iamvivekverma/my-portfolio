const RECAPTCHA_SCRIPT_ID = 'feedback-recaptcha-script';
const RECAPTCHA_SRC = 'https://www.google.com/recaptcha/api.js?render=';
const DEV_CAPTCHA_TOKEN = 'development-feedback-captcha-token';
const IS_DEV = Boolean(import.meta?.env?.DEV);
const RECAPTCHA_BADGE_SELECTOR = '.grecaptcha-badge';
const SCRIPT_TAG_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const HTML_TAG_PATTERN = /<\/?[^>]+>/g;
const CONTROL_CHARS_PATTERN = /[\u0000-\u001F\u007F]/g;

function stripHtml(value, { collapseWhitespace = false, trim = false } = {}) {
  if (typeof value !== 'string') {
    return '';
  }

  const sanitized = value
    .normalize('NFKC')
    .replace(SCRIPT_TAG_PATTERN, ' ')
    .replace(HTML_TAG_PATTERN, ' ')
    .replace(CONTROL_CHARS_PATTERN, ' ')
    .replace(collapseWhitespace ? /\s+/g : /\r\n?/g, collapseWhitespace ? ' ' : '\n');

  return trim ? sanitized.trim() : sanitized;
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
    .slice(0, 80);
}

export function sanitizeFeedbackMessageInput(content) {
  return stripHtml(content).slice(0, 1000);
}

export function validateFeedback(name, content) {
  const trimmedName = normalizeForSubmit(sanitizeFeedbackNameInput(name));
  const trimmedContent = normalizeForSubmit(sanitizeFeedbackMessageInput(content));
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

  return '';
}

export function getFriendlyFeedbackErrorMessage(error) {
  const status = error?.status;
  const rawMessage = error?.message || '';

  if (status === 429) {
    return 'Too many attempts right now. Please wait a little and try again.';
  }

  if (status === 403 || /captcha/i.test(rawMessage)) {
    return "I couldn't verify the submission just now. Please try once more.";
  }

  if (status === 400) {
    return 'Please check your name and feedback message, then try again.';
  }

  return 'Failed to submit feedback. Please try again.';
}

export function buildFeedbackPayload({ name, content, captchaToken }) {
  return {
    name: normalizeForSubmit(sanitizeFeedbackNameInput(name)),
    content: normalizeForSubmit(sanitizeFeedbackMessageInput(content)),
    captchaToken,
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
