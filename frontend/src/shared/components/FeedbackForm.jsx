import { useState } from 'react';
import { portfolioApi } from '../../services/api';
import { toast } from 'react-toastify';

export default function FeedbackForm({ isOpen, onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await portfolioApi.submitFeedback({ content });
      toast.success('Thank you for your feedback!');
      setContent('');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch {
      toast.error('Failed to submit feedback. Please try again.');
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
            />
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
              disabled={loading || !content.trim()}
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
