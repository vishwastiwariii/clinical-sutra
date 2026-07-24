const VARIANTS = {
  // Dark pill — primary action in the navbar and the chat composer.
  solid: 'bg-ink text-paper hover:bg-accent',
  // Evergreen pill — in-context primary action inside cards.
  accent: 'bg-accent text-paper hover:bg-accent-dark',
  // Quiet outline pill — pagination, filters, chips.
  outline: 'bg-surface text-ink-soft border border-line-strong hover:border-accent hover:text-accent-dark',
  // Text-only — back links.
  ghost: 'bg-transparent text-muted hover:text-ink',
};

const SIZES = {
  sm: 'px-3.5 py-2 text-[13px]',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm w-full justify-center',
};

export default function Button({
  variant = 'solid',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center gap-2 rounded-pill font-medium cursor-pointer transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-inherit',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
