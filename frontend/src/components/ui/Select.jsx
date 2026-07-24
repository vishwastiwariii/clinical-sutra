/** Quiet pill-shaped native select, used for the browse filters. */
export default function Select({ value, onChange, options, placeholder, label }) {
  const active = Boolean(value);

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`cursor-pointer appearance-none rounded-pill border py-2 pr-8 pl-4 text-[13px] font-medium outline-none transition-colors focus-visible:border-accent ${
          active
            ? 'border-accent bg-accent-tint text-accent-dark'
            : 'border-line-strong bg-surface text-muted hover:border-faint'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        width="9"
        height="6"
        viewBox="0 0 9 6"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5"
      >
        <path d="M1 1 L4.5 4.5 L8 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </label>
  );
}
