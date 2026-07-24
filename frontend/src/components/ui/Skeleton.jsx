export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`rounded bg-line ${className}`}
      style={{ animation: 'shimmer 1.4s ease-in-out infinite' }}
    />
  );
}
