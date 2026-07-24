/** Bordered grid of label/value facts. Cells come from `facts`, so a trial
 *  missing sponsor or enrollment simply renders fewer of them. */
export default function FactGrid({ facts }) {
  if (!facts.length) return null;

  return (
    <div
      // auto-fit rather than a fixed 4 columns: a trial missing sponsor or
      // enrollment fills the row instead of leaving blank cells.
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}
      className="mb-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line"
    >
      {facts.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-1.5 bg-surface px-5 py-4.5">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-faint">
            {label}
          </span>
          <span className="text-[15px] font-medium text-ink">{value}</span>
        </div>
      ))}
    </div>
  );
}
