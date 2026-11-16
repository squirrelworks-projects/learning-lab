import { el } from '../../../../shared/js/core/dom.js';

/**
 * Template: PlayerLayout – an optional header (course navigation, preview notice) above the module.
 * Slots: `header`, `message` (loading and error states) and `module` (owned by the running module).
 * @returns {HTMLDivElement}
 */
export function PlayerLayout() {
  return el(
    'div',
    { class: 't-player' },
    el('header', { class: 't-player__header', dataset: { slot: 'header' } }),
    el('div', { class: 't-player__message', dataset: { slot: 'message' } }),
    el('main', { class: 't-player__module', dataset: { slot: 'module' } }),
  );
}
