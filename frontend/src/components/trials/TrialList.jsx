import TrialRow from './TrialRow.jsx';
import TrialRowSkeleton from './TrialRowSkeleton.jsx';
import Notice from '../ui/Notice.jsx';

/** Renders the loading, error, empty and populated states of a trial list. */
export default function TrialList({ trials, loading, error, skeletonCount = 6, onRetry, onClear }) {
  if (error) {
    return (
      <Notice
        title="We couldn’t load the studies."
        description={error}
        action={onRetry && { label: 'Try again', onClick: onRetry }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col border-t border-line" aria-busy="true">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <TrialRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!trials.length) {
    return (
      <Notice
        title="No trials match your search."
        description="Try a broader term, an NCT ID, or clear the filters."
        action={onClear && { label: 'Clear search', onClick: onClear }}
      />
    );
  }

  return (
    <div className="flex flex-col border-t border-line">
      {trials.map((trial) => (
        <TrialRow key={trial.nctId} trial={trial} />
      ))}
    </div>
  );
}
