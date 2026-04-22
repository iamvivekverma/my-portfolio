const RECAPTCHA_SCRIPT_ID = 'feedback-recaptcha-script';
const RECAPTCHA_SRC = 'https://www.google.com/recaptcha/api.js?render=';
const DEV_CAPTCHA_TOKEN = 'development-feedback-captcha-token';
const IS_DEV = Boolean(import.meta?.env?.DEV);
const RECAPTCHA_BADGE_SELECTOR = '.grecaptcha-badge';
const FEEDBACK_NAME_MAX_LENGTH = 50;
const FEEDBACK_CONTENT_MAX_LENGTH = 500;
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

  if (trimmedContent.length < 5) {
    return 'Please write a more detailed message (at least 5 characters).';
  }

  if (trimmedContent.length > FEEDBACK_CONTENT_MAX_LENGTH) {
    return 'Please keep your message under 500 characters.';
  }

  return '';
}

export function getFriendlyFeedbackErrorMessage(error) {
  const status = error?.status;
  const rawMessage = error?.message || '';

  if (status === 429) {
    return rawMessage || 'Too many attempts right now. Please wait a little and try again.';
  }

  if (status === 403 || /captcha/i.test(rawMessage)) {
    return rawMessage || "I couldn't verify the submission just now. Please try once more.";
  }

  if (status === 400) {
    return rawMessage || 'Please check your name, email, and message, then try again.';
  }

  return 'Failed to submit feedback. Please try again.';
}

export function buildFeedbackPayload({ name, email, content, captchaToken, website = '' }) {
  return {
    name: normalizeForSubmit(sanitizeFeedbackNameInput(name)),
    email: normalizeFeedbackEmail(email),
    content: normalizeForSubmit(sanitizeFeedbackMessageInput(content)),
    captchaToken,
    website: normalizeForSubmit(sanitizeFeedbackHoneypotInput(website)),
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
