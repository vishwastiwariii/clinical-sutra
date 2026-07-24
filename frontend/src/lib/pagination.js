/**
 * Page numbers to render, with `null` marking a gap.
 * e.g. range(7, 20) → [1, null, 6, 7, 8, null, 20]
 */
export function pageRange(current, totalPages, siblings = 2) {
  if (totalPages <= 1) return [1];

  const first = 1;
  const last = totalPages;
  const start = Math.max(first, current - siblings);
  const end = Math.min(last, current + siblings);

  const pages = [];
  for (let p = start; p <= end; p += 1) pages.push(p);

  if (start > first + 1) pages.unshift(null);
  if (start > first) pages.unshift(first);
  if (end < last - 1) pages.push(null);
  if (end < last) pages.push(last);

  return pages;
}
