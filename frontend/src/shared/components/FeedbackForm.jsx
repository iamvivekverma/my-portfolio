import { useEffect, useState } from 'react';
import { portfolioApi } from '../../services/api';
import { toast } from 'react-toastify';

export default function FeedbackForm({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());

  useEffect(() => {
    if (isOpen) {
      setFormStartedAt(Date.now());
      setSubmitted(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      console.log('Bot detected via honeypot');
      return;
    }

    if (!name.trim() || !email.trim() || !content.trim()) {
      return;
    }

    setLoading(true);
    try {
      await portfolioApi.submitFeedback({
        name,
        email,
        content,
        honeypot,
        formStartedAt,
        submittedAt: Date.now(),
        metadata: {
          pageUrl: window.location.href,
          referrer: document.referrer,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
          language: navigator.language || '',
          platform: navigator.userAgentData?.platform || navigator.platform || '',
          screen: `${window.screen.width}x${window.screen.height}`,
        },
      });

      toast.success('Thank you for your feedback!');
      setName('');
      setEmail('');
      setContent('');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Send Feedback
          </h2>
          <button
            onClick={onClose}
            className="text-primary/60 hover:text-primary text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Thank you!
            </h3>
            <p className="text-primary/70">
              Your feedback means a lot to me. I really appreciate you taking the time to share your thoughts!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field for bot detection - hidden from real users */}
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

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-primary"
              required
              minLength={2}
              maxLength={80}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-primary"
              required
              maxLength={120}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Your Feedback
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Share your thoughts, suggestions, or report issues..."
              className="w-full border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-primary resize-none"
              required
              minLength={15}
              maxLength={1000}
            />
            <p className="mt-2 text-xs text-primary/50">
              Please keep the message clear and relevant. Spam or meaningless text will be rejected.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-primary/20 text-primary font-medium hover:bg-primary/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !email.trim() || !content.trim()}
              className="flex-1 bg-[var(--color-primary)] text-white px-4 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
