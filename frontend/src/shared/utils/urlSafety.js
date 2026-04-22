const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmailAddress(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const normalized = value.trim().toLowerCase();

  return EMAIL_PATTERN.test(normalized) ? normalized : '';
}

export function toSafeUrl(value, { fallback = '#', allowRelative = false } = {}) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return fallback;
  }

  if (allowRelative && trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {}

  return fallback;
}

export function toSafeMailtoHref(value, fallbackEmail = '') {
  const email = normalizeEmailAddress(value) || normalizeEmailAddress(fallbackEmail);

  return email ? `mailto:${email}` : '#';
}

export function toSafeEmailText(value, fallback = '') {
  return normalizeEmailAddress(value) || fallback;
}
