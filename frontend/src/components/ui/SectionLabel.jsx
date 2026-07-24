/** The small uppercase eyebrow used above every section and field. */
export default function SectionLabel({ as: Tag = 'h2', className = '', children }) {
  return (
    <Tag className={`text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-soft ${className}`}>
      {children}
    </Tag>
  );
}
