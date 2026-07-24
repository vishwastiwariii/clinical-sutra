import Icon from './ui/Icon.jsx';
import { pageRange } from '../lib/pagination.js';

const BASE =
  'inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-pill px-3 text-[13px] font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-35';

function PageButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={`${BASE} ${
        active
          ? 'bg-ink text-paper'
          : 'border border-line-strong bg-surface text-muted hover:border-accent hover:text-accent-dark'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function Pagination({ page, totalPages, total, limit, onChange }) {
  if (!totalPages || totalPages < 1) return null;

  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);
  const go = (next) => onChange(Math.min(Math.max(next, 1), totalPages));

  return (
    <nav
      aria-label="Trial list pages"
      className="mt-8 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row"
    >
      <p className="text-[13px] text-faint">
        Showing <span className="text-muted">{first}–{last}</span> of{' '}
        <span className="text-muted">{total.toLocaleString()}</span> studies
      </p>

      <div className="flex items-center gap-1.5">
        <PageButton onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <Icon name="arrowLeft" size={12} />
          <span className="hidden sm:inline">Prev</span>
        </PageButton>

        {pageRange(page, totalPages).map((entry, i) =>
          entry === null ? (
            <span key={`gap-${i}`} className="px-1 text-[13px] text-faintest">
              …
            </span>
          ) : (
            <PageButton
              key={entry}
              active={entry === page}
              onClick={() => go(entry)}
              aria-label={`Page ${entry}`}
            >
              {entry}
            </PageButton>
          ),
        )}

        <PageButton onClick={() => go(page + 1)} disabled={page >= totalPages} aria-label="Next page">
          <span className="hidden sm:inline">Next</span>
          <Icon name="arrowRight" size={12} />
        </PageButton>
      </div>
    </nav>
  );
}
