const PATHS = {
  sparkle: <path d="M7 0.5 L8.6 5.4 L13.5 7 L8.6 8.6 L7 13.5 L5.4 8.6 L0.5 7 L5.4 5.4 Z" fill="currentColor" />,
  search: (
    <>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.5 12.5 L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  arrowLeft: (
    <path d="M8.5 3 L4.5 7 L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  arrowRight: (
    <path d="M5.5 3 L9.5 7 L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  arrowUp: (
    <path d="M7 11.5 L7 2.5 M3 6.5 L7 2.5 L11 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  close: (
    <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  ),
};

const VIEWBOX = { search: '0 0 18 18', close: '0 0 16 16' };

export default function Icon({ name, size = 14, className = '' }) {
  const path = PATHS[name];
  if (!path) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={VIEWBOX[name] || '0 0 14 14'}
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {path}
    </svg>
  );
}
