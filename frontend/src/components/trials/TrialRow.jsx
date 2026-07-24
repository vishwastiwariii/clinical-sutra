import StatusPill from '../ui/StatusPill.jsx';
import { trialMeta } from '../../lib/trials.js';

/** One row in the study list. Anchor-based so deep links and ⌘-click work. */
export default function TrialRow({ trial }) {
  return (
    <a
      href={`#/trial/${encodeURIComponent(trial.nctId)}`}
      className="grid grid-cols-1 items-center gap-3 border-b border-line px-3 py-6 transition-colors hover:bg-raised sm:grid-cols-[150px_1fr_auto] sm:gap-6"
    >
      <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-start sm:gap-1.5">
        <span className="font-mono text-[13px] text-accent">{trial.nctId}</span>
        <span className="text-xs text-faint">Phase {trial.phase}</span>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-base leading-[1.4] font-medium text-pretty text-ink">{trial.title}</span>
        <span className="text-[13.5px] text-muted-soft">{trialMeta(trial)}</span>
      </div>

      <div className="justify-self-start sm:justify-self-end">
        <StatusPill status={trial.status} tone={trial.tone} />
      </div>
    </a>
  );
}
