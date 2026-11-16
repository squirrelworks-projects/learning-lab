import { DIFFICULTIES } from '../../shared/js/core/difficulty.js';

/** Select options shared by several admin organisms. Not a component. */
export const DIFFICULTY_OPTIONS = DIFFICULTIES.map((d) => ({ value: d.value, label: `${d.label} (${d.value})` }));

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

/** Shown under every status field. */
export const STATUS_HINT = 'Only published items open for students. Archived items are hidden from lists.';

