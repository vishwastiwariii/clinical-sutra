import SectionLabel from '../components/ui/SectionLabel.jsx';
import Select from '../components/ui/Select.jsx';
import TrialList from '../components/trials/TrialList.jsx';
import Pagination from '../components/Pagination.jsx';
import { useTrials } from '../state/contexts.js';
import { PHASE_OPTIONS, STATUS_OPTIONS } from '../lib/trials.js';

export default function TrialsSection() {
  const {
    items, loading, error, page, limit, total, totalPages,
    status, phase, setStatus, setPhase, setPage, refresh, reset, hasFilters,
  } = useTrials();

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>Active studies</SectionLabel>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            label="Filter by status"
            placeholder="Any status"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Filter by phase"
            placeholder="Any phase"
            value={phase}
            onChange={setPhase}
            options={PHASE_OPTIONS}
          />
        </div>
      </div>

      <TrialList
        trials={items}
        loading={loading}
        error={error}
        skeletonCount={Math.min(limit, 6)}
        onRetry={refresh}
        onClear={hasFilters ? reset : undefined}
      />

      {!loading && !error && items.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onChange={setPage}
        />
      )}
    </section>
  );
}
