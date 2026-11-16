import { el } from '../../../../shared/js/core/dom.js';

/**
 * Template: AdminLayout – header on top, page content below, toasts at the bottom.
 * Slots: `header`, `main`, `toast`.
 * @returns {HTMLDivElement}
 */
export function AdminLayout() {
  return el(
    'div',
    { class: 't-admin' },
    el('header', { class: 't-admin__header', dataset: { slot: 'header' } }),
    el('main', { class: 't-admin__main', id: 'main', tabIndex: -1, dataset: { slot: 'main' } }),
    el('div', { class: 't-admin__toast', dataset: { slot: 'toast' } }),
  );
}
