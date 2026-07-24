/** Dot + label chip, tinted by the trial's recruitment status. */
export default function StatusPill({ status, tone, size = 'md' }) {
  const pad = size === 'sm' ? 'px-3 py-[5px] text-xs' : 'px-3.5 py-1.5 text-[12.5px]';

  return (
    <span className={`inline-flex items-center gap-2 rounded-pill font-medium whitespace-nowrap ${tone.chip} ${tone.text} ${pad}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {status}
    </span>
  );
}
