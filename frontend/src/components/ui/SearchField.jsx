import Icon from './Icon.jsx';

/** Rounded search bar with a trailing slot for a result count or action. */
export default function SearchField({ value, onChange, placeholder, trailing, className = '' }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-pill border border-line-strong bg-surface py-1.5 pr-1.5 pl-5 shadow-[0_1px_2px_rgba(30,30,26,0.04)] focus-within:border-accent transition-colors ${className}`}
    >
      <Icon name="search" size={18} className="text-faint" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 border-none bg-transparent py-2.5 text-[15px] text-ink outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {trailing}
    </div>
  );
}
