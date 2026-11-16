import { el } from '../../../../shared/js/core/dom.js';

const LABELS = { draft: 'Draft', published: 'Published', archived: 'Archived' };

/**
 * Atom: StatusBadge – the publishing status of an assignment or course.
 * @param {Object} props
 * @param {'draft'|'published'|'archived'} props.status
 * @returns {HTMLSpanElement}
 */
export function StatusBadge({ status }) {
  return el('span', { class: ['a-status', `a-status--${status}`] }, LABELS[status] ?? status);
}
