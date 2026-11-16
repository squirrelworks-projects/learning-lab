import { el } from '../../../../shared/js/core/dom.js';

/**
 * Template: ListLayout – a list page: header, an optional panel (e.g. a "new" form), filters, then the list.
 * Slots: `header`, `panel`, `filters`, `list`.
 * @returns {HTMLDivElement}
 */
export function ListLayout() {
  return el(
    'div',
    { class: 't-list' },
    el('div', { class: 't-list__header', dataset: { slot: 'header' } }),
    el('div', { class: 't-list__panel', dataset: { slot: 'panel' } }),
    el('div', { class: 't-list__filters', dataset: { slot: 'filters' } }),
    el('div', { class: 't-list__list', dataset: { slot: 'list' } }),
  );
}
