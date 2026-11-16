import { el } from '../../../../shared/js/core/dom.js';

/**
 * Template: EditLayout – the edit page for an assignment or course.
 * Slots: `header` (title and actions), `form` (main fields), `side` (sharing and facts),
 * and `body` (full width below: the module editor, or the course's assignment list).
 * @returns {HTMLDivElement}
 */
export function EditLayout() {
  return el(
    'div',
    { class: 't-edit' },
    el('div', { class: 't-edit__header', dataset: { slot: 'header' } }),
    el('div', { class: 't-edit__form', dataset: { slot: 'form' } }),
    el('aside', { class: 't-edit__side', dataset: { slot: 'side' } }),
    el('div', { class: 't-edit__body', dataset: { slot: 'body' } }),
  );
}
