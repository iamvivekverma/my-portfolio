import { useState } from 'react';
import { FeedbackContext } from './feedbackContext';
import FeedbackForm from './FeedbackForm';

export default function FeedbackProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const openFeedback = () => setIsOpen(true);
  const closeFeedback = () => setIsOpen(false);

  return (
    <FeedbackContext.Provider value={{ isOpen, openFeedback, closeFeedback }}>
      {children}
      <FeedbackForm isOpen={isOpen} onClose={closeFeedback} />
    </FeedbackContext.Provider>
  );
}
