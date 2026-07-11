import { useEffect, useRef, useState } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import { portfolioApi } from '../../services/api';
import { toast } from 'react-toastify';
import {
  buildFeedbackPayload,
  getFriendlyFeedbackErrorMessage,
  sanitizeFeedbackEmailInput,
  sanitizeFeedbackMessageInput,
  sanitizeFeedbackNameInput,
  validateFeedback,
} from './feedbackForm.utils';

function createFeedbackRequest({ name, email, content, website }) {
  return buildFeedbackPayload({
    name,
    email,
    content,
    website,
  });
}

export default function FeedbackForm({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const closeTimerRef = useRef(null);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function handleClose() {
    if (loading) {
      return;
    }

    clearCloseTimer();
    setSubmitted(false);
    setErrorMessage('');
    onClose();
  }

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousTouchAction = body.style.touchAction;

    if (isOpen) {
      body.style.overflow = 'hidden';
      body.style.touchAction = 'none';
    } else {
      body.style.overflow = previousOverflow;
      body.style.touchAction = previousTouchAction;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.touchAction = previousTouchAction;
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationMessage = validateFeedback(name, email, content);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await portfolioApi.submitFeedback(
        createFeedbackRequest({
          name,
          email,
          content,
          website,
        })
      );

      toast.success('Thank you for your feedback!');
      setName('');
      setEmail('');
      setContent('');
      setWebsite('');
      setSubmitted(true);
      clearCloseTimer();
      closeTimerRef.current = window.setTimeout(() => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Share Your Feedback
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center border cursor-pointer rounded-lg text-primary/60 hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              Thank you!
            </h3>
            <p className="text-primary/70">
              Your feedback means a lot to me. I really appreciate you taking the time to share your thoughts!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="feedback-website">Leave this field empty</label>
              <input
                id="feedback-website"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-primary text-left">
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
                className="w-full rounded-xl border border-primary/20 px-4 py-3 text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                maxLength={50}
                autoComplete="name"
                inputMode="text"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-primary text-left">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(sanitizeFeedbackEmailInput(e.target.value));
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-primary/20 px-4 py-3 text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                maxLength={160}
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-primary text-left">
                Your Message
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
                placeholder="Write your message..."
                className="w-full resize-none rounded-xl border border-primary/20 px-4 py-3 text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                maxLength={1000}
                autoComplete="off"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 rounded-xl border border-primary/20 px-4 py-3 font-medium text-primary hover:bg-primary/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-primary px-4 py-3 font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Submit'}
              </button>
            </div>

            <p className="pt-2 text-center text-[11px] leading-5 text-primary/35">
              I&apos;d love to hear your thoughts — every message means a lot.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
