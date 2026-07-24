/**
 * Shaping helpers for trial records coming off the API.
 * The API speaks ClinicalTrials.gov enums (RECRUITING, PHASE2, …); the UI
 * speaks plain language. Everything that translates between the two lives here.
 */

const STATUS_LABELS = {
  RECRUITING: 'Recruiting',
  NOT_YET_RECRUITING: 'Not yet recruiting',
  ENROLLING_BY_INVITATION: 'Enrolling by invitation',
  ACTIVE_NOT_RECRUITING: 'Active, not recruiting',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  TERMINATED: 'Terminated',
  SUSPENDED: 'Suspended',
  WITHDRAWN: 'Withdrawn',
  UNKNOWN: 'Unknown status',
};

const TONE_BY_STATUS = {
  RECRUITING: 'open',
  NOT_YET_RECRUITING: 'pending',
  ENROLLING_BY_INVITATION: 'pending',
  ACTIVE_NOT_RECRUITING: 'pending',
  ACTIVE: 'open',
  COMPLETED: 'closed',
  TERMINATED: 'closed',
  SUSPENDED: 'closed',
  WITHDRAWN: 'closed',
};

export const STATUS_TONES = {
  open: { chip: 'bg-accent-tint', dot: 'bg-accent', text: 'text-accent-dark' },
  pending: { chip: 'bg-warn-tint', dot: 'bg-warn', text: 'text-warn-ink' },
  closed: { chip: 'bg-neutral-tint', dot: 'bg-faint', text: 'text-muted' },
};

/** Filter options offered in the UI, kept next to the labels they render. */
export const STATUS_OPTIONS = [
  'RECRUITING',
  'NOT_YET_RECRUITING',
  'ENROLLING_BY_INVITATION',
  'ACTIVE_NOT_RECRUITING',
  'COMPLETED',
  'TERMINATED',
].map((value) => ({ value, label: STATUS_LABELS[value] }));

export const PHASE_OPTIONS = [
  { value: 'PHASE1', label: 'Phase 1' },
  { value: 'PHASE2', label: 'Phase 2' },
  { value: 'PHASE3', label: 'Phase 3' },
  { value: 'PHASE4', label: 'Phase 4' },
  { value: 'NA', label: 'Not applicable' },
];

export function formatStatus(status) {
  if (!status) return 'Status unavailable';
  const key = String(status).toUpperCase().replace(/[\s-]+/g, '_');
  return STATUS_LABELS[key] || titleCase(key.replace(/_/g, ' '));
}

export function statusTone(status) {
  const key = String(status || '').toUpperCase().replace(/[\s-]+/g, '_');
  return STATUS_TONES[TONE_BY_STATUS[key] || 'closed'];
}

/** 'PHASE2' → '2', 'PHASE1|PHASE2' → '1/2', 'NA' → 'N/A'. */
export function formatPhase(phase) {
  if (!phase) return 'N/A';
  const parts = String(phase)
    .toUpperCase()
    .split(/[|,/\s]+/)
    .map((p) => p.replace(/^PHASE_?/, '').trim())
    .filter(Boolean);
  if (!parts.length) return 'N/A';
  if (parts.every((p) => p === 'NA' || p === 'N/A')) return 'N/A';
  return parts.map((p) => (p === 'NA' ? 'N/A' : p)).join('/');
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function titleCase(value) {
  return String(value)
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

/**
 * The list and detail endpoints return slightly different row shapes, and some
 * fields the design shows (sponsor, enrollment, locations) are not in the
 * database yet. Normalising once keeps every component free of `?.` chains.
 */
export function normalizeTrial(raw) {
  if (!raw) return null;
  const conditions = (raw.condition || raw.conditions || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  return {
    id: raw.id,
    nctId: raw.nct_id || raw.nctId || '—',
    title: raw.title || 'Untitled study',
    summary: raw.shortSummary || raw.summary || '',
    phase: formatPhase(raw.phase),
    status: formatStatus(raw.status),
    rawStatus: raw.status,
    tone: statusTone(raw.status),
    conditions,
    condition: conditions.join(', ') || 'Condition not listed',
    sponsor: raw.sponsor || null,
    enrollment: raw.enrollment ?? null,
    locations: raw.locations || null,
    period: raw.period || null,
    studyType: raw.study_type || raw.studyType || null,
    eligibility: Array.isArray(raw.eligibility) ? raw.eligibility : [],
    involvement: raw.involvement || null,
    addedAt: formatDate(raw.created_at || raw.createdAt),
  };
}

/** One-line meta row under a trial title: only the parts we actually have. */
export function trialMeta(trial) {
  return [
    trial.condition,
    trial.sponsor,
    trial.enrollment ? `${trial.enrollment} participants` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}
