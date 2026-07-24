import { useCallback, useMemo, useRef, useState } from 'react';
import { assistantService } from '../services/assistantService.js';
import { AssistantContext } from './contexts.js';

/**
 * The assistant panel is global: it can be opened from the navbar while
 * browsing, or from a trial page, in which case answers are scoped to that
 * trial. The active trial is registered by whichever page is mounted.
 */
const GENERAL_SUGGESTIONS = [
  'Which trials are still recruiting?',
  'What does "Phase 3" mean?',
  'How do I know if I qualify?',
];

const TRIAL_SUGGESTIONS = [
  'Am I likely to be eligible?',
  'What would I have to do?',
  'Explain this study in simple terms',
];

let messageId = 0;
const message = (role, text) => ({ id: (messageId += 1), role, text });

export default function AssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [trial, setTrial] = useState(null);

  // Read inside async callbacks so a page change mid-question is respected.
  const trialRef = useRef(null);
  trialRef.current = trial;

  const setContextTrial = useCallback((next) => setTrial(next), []);

  const open = useCallback(() => {
    setIsOpen(true);
    setMessages((prev) => {
      if (prev.length) return prev;
      const active = trialRef.current;
      return [
        message(
          'assistant',
          active
            ? `Hi — I can answer questions about "${active.title}" (${active.nctId}). What would you like to know?`
            : 'Hi — I can help you understand any study listed here, or explain how clinical trials work. What would you like to know?',
        ),
      ];
    });
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const send = useCallback(async (text) => {
    const question = (text ?? '').trim();
    if (!question || isThinking) return;

    setMessages((prev) => [...prev, message('user', question)]);
    setInput('');
    setIsThinking(true);

    try {
      const { answer } = await assistantService.ask({ question, trial: trialRef.current });
      setMessages((prev) => [...prev, message('assistant', answer)]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        message(
          'assistant',
          error.message
            ? `Sorry — ${error.message}`
            : 'Sorry — I couldn’t reach the assistant just now. Please try again in a moment.',
        ),
      ]);
    } finally {
      setIsThinking(false);
    }
  }, [isThinking]);

  const value = useMemo(
    () => ({
      isOpen,
      messages,
      input,
      isThinking,
      trial,
      contextLabel: trial ? `Context: ${trial.nctId}` : 'Context: all studies',
      suggestions: trial ? TRIAL_SUGGESTIONS : GENERAL_SUGGESTIONS,
      showSuggestions: messages.length <= 1 && !isThinking,
      open,
      close,
      send,
      setInput,
      setContextTrial,
    }),
    [isOpen, messages, input, isThinking, trial, open, close, send, setContextTrial],
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}
