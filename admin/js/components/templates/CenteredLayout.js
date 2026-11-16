import { el } from '../../../../shared/js/core/dom.js';

/**
 * Template: CenteredLayout – one centred card, for login and setup. Slot: `main`.
 * @returns {HTMLDivElement}
 */
export function CenteredLayout() {
  return el('div', { class: 't-centered' }, el('main', { class: 't-centered__card', dataset: { slot: 'main' } }));
}
