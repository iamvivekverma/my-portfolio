import { createContext, useContext } from 'react';

export const FeedbackContext = createContext({
  isOpen: false,
  openFeedback: () => {},
  closeFeedback: () => {},
});

export const useFeedback = () => useContext(FeedbackContext);
