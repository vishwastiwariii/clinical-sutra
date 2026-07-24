import SearchField from '../components/ui/SearchField.jsx';
import { useTrials } from '../state/contexts.js';

function ResultCount() {
  const { total, loading } = useTrials();
  const label = loading ? 'Searching…' : `${total.toLocaleString()} ${total === 1 ? 'trial' : 'trials'}`;

  return (
    <span className="hidden rounded-pill bg-chip px-4 py-2.5 text-[13px] font-medium text-muted sm:block">
      {label}
    </span>
  );
}

export default function SearchSection() {
  const { query, setQuery } = useTrials();

  return (
    <SearchField
      value={query}
      onChange={setQuery}
      placeholder="Search by condition, title, or NCT ID…"
      trailing={<ResultCount />}
      className="mb-14"
    />
  );
}
