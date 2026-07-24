export default function ThinkingDots() {
  return (
    <div className="flex gap-1.5 px-4 py-3" role="status" aria-label="Assistant is thinking">
      {[0, 0.2, 0.4].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 rounded-full bg-accent"
          style={{ animation: `pulse-dot 1.2s infinite ${delay}s` }}
        />
      ))}
    </div>
  );
}
