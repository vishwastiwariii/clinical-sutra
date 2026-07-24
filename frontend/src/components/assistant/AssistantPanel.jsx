import { useEffect, useRef } from 'react';
import Icon from '../ui/Icon.jsx';
import MessageBubble from './MessageBubble.jsx';
import ThinkingDots from './ThinkingDots.jsx';
import { useAssistant } from '../../state/contexts.js';

/** Slide-over chat panel, mounted once at the app root. */
export default function AssistantPanel() {
  const {
    isOpen, close, messages, isThinking, input, setInput, send,
    contextLabel, suggestions, showSuggestions,
  } = useAssistant();

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [isOpen, messages, isThinking]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={close}
        className="fixed inset-0 z-40 bg-[rgba(30,30,26,0.25)]"
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-label="Trial assistant"
        className="fixed top-0 right-0 bottom-0 z-50 flex w-[420px] max-w-[92vw] flex-col bg-surface shadow-[-12px_0_40px_rgba(30,30,26,0.12)]"
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Icon name="sparkle" className="text-accent" />
              <span className="text-[15px] font-semibold text-ink">Trial assistant</span>
            </div>
            <span className="font-mono text-xs text-faint">{contextLabel}</span>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close assistant"
            className="cursor-pointer p-2 text-faint transition-colors hover:text-ink"
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} text={m.text} />
          ))}
          {isThinking && <ThinkingDots />}
        </div>

        {showSuggestions && (
          <div className="flex flex-wrap gap-2 px-6 pb-4">
            {suggestions.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => send(label)}
                className="cursor-pointer rounded-pill border border-line bg-raised px-3.5 py-2 text-left text-[13px] text-ink-soft transition-colors hover:border-accent hover:text-accent-dark"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-line px-6 pt-4 pb-5"
        >
          <div className="flex items-center gap-2.5 rounded-pill bg-raised py-1.5 pr-1.5 pl-4">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this trial…"
              aria-label="Ask about this trial"
              className="min-w-0 flex-1 border-none bg-transparent py-2 text-sm text-ink outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              aria-label="Send question"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="arrowUp" />
            </button>
          </div>
          <p className="mt-2.5 mx-1 text-[11.5px] leading-snug text-faintest">
            General information only — not medical advice. Talk to your doctor before joining a study.
          </p>
        </form>
      </aside>
    </>
  );
}
