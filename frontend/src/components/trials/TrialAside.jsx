import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import { useAssistant } from '../../state/contexts.js';

function MetaRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-faint">{label}</span>
      <span className="text-sm leading-normal text-ink-soft">{value}</span>
    </div>
  );
}

/** Sticky sidebar: the assistant prompt plus whatever metadata we hold. */
export default function TrialAside({ meta }) {
  const { open } = useAssistant();

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-26">
      <div className="rounded-2xl bg-accent-soft p-6">
        <div className="mb-2.5 flex items-center gap-2">
          <Icon name="sparkle" size={15} className="text-accent" />
          <span className="text-sm font-semibold text-accent-dark">Questions about this trial?</span>
        </div>
        <p className="mb-4 text-[13.5px] leading-snug text-accent-ink">
          Ask anything — eligibility, visits, side effects — in plain language.
        </p>
        <Button variant="accent" size="lg" onClick={open}>
          Ask the assistant
        </Button>
      </div>

      {meta.length > 0 && (
        <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-6">
          {meta.map(({ label, value }) => (
            <MetaRow key={label} label={label} value={value} />
          ))}
        </div>
      )}
    </aside>
  );
}
