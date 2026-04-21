import { useEffect, useState } from 'react';
import { portfolioApi } from '../../services/api';
import { toast } from 'react-toastify';
import {
  buildFeedbackPayload,
  getFriendlyFeedbackErrorMessage,
  getFeedbackCaptchaToken,
  getFeedbackClientId,
  loadRecaptchaScript,
  setRecaptchaBadgeVisibility,
  sanitizeFeedbackMessageInput,
  sanitizeFeedbackNameInput,
  validateFeedback,
} from './feedbackForm.utils';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

function createFeedbackRequest({ name, content, honeypot, captchaToken }) {
  return buildFeedbackPayload({
    name,
    content,
    honeypot,
    captchaToken,
    metadata: {
      pageUrl: window.location.href,
      referrer: document.referrer,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      language: navigator.language || '',
      platform: navigator.userAgentData?.platform || navigator.platform || '',
      screen: `${window.screen.width}x${window.screen.height}`,
      clientId: getFeedbackClientId(),
    },
  });
}

export default function FeedbackForm({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setErrorMessage('');

      if (RECAPTCHA_SITE_KEY) {
        loadRecaptchaScript(RECAPTCHA_SITE_KEY)
          .then(() => setRecaptchaBadgeVisibility(true))
          .catch(() => {});
      }
    } else {
      setRecaptchaBadgeVisibility(false);
    }

    return () => {
      setRecaptchaBadgeVisibility(false);
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (honeypot) {
      setErrorMessage('Something went wrong while sending your feedback. Please try again.');
      return;
    }

    const validationMessage = validateFeedback(name, content);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const captchaToken = await getFeedbackCaptchaToken(RECAPTCHA_SITE_KEY);

      await portfolioApi.submitFeedback(
        createFeedbackRequest({
          name,
          content,
          honeypot,
          captchaToken,
        })
      );

      toast.success('Thank you for your feedback!');
      setName('');
      setContent('');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (error) {
      const message = getFriendlyFeedbackErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Send Feedback
          </h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-primary/60 hover:text-primary"
          >
            &times;
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-6xl">🎉</div>
            <h3 className="mb-2 text-xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              Thank you!
            </h3>
            <p className="text-primary/70">
              Your feedback means a lot to me. I really appreciate you taking the time to share your thoughts!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              style={{ position: 'absolute', left: '-5000px' }}
              aria-hidden="true"
            />

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-primary">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(sanitizeFeedbackNameInput(e.target.value));
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-primary/20 bg-white px-4 py-3 text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                maxLength={80}
                autoComplete="name"
                inputMode="text"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-primary">
                Your Feedback
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(sanitizeFeedbackMessageInput(e.target.value));
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
                rows={4}
                placeholder="Share your thoughts, suggestions, or report issues..."
                className="w-full resize-none rounded-xl border border-primary/20 bg-white px-4 py-3 text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                maxLength={1000}
                autoComplete="off"
              />
              <p className="mt-2 text-xs text-primary/50">
                Share your thoughts, suggestions, or anything that could make the experience better.
              </p>
              <p className="mt-2 text-xs leading-5 text-primary/45">
                A quick security check runs when you send this form. Google&apos;s{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  Terms of Service
                </a>{' '}
                apply.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-primary/20 px-4 py-3 font-medium text-primary transition-colors hover:bg-primary/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-[var(--color-primary)] px-4 py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
