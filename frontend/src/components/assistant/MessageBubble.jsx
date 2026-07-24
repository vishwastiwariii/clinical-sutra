export default function MessageBubble({ role, text }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-pretty ${
          isUser ? 'bg-ink text-paper' : 'bg-raised text-ink'
        }`}
      >
        {text}
      </div>
    </div>
  );
}
