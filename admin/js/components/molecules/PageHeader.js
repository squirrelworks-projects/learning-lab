import { el } from '../../../../shared/js/core/dom.js';

/**
 * Molecule: PageHeader – page title with an optional line above it (e.g. a back link), badges and actions.
 * @param {Object} props
 * @param {string} props.title
 * @param {Node} [props.before] - shown above the title, e.g. a back Link
 * @param {Node[]} [props.badges] - shown after the title
 * @param {Node[]} [props.actions] - buttons on the right
 * @returns {HTMLDivElement}
 */
export function PageHeader({ title, before, badges = [], actions = [] }) {
  return el(
    'div',
    { class: 'm-page-header' },
    before && el('div', { class: 'm-page-header__before' }, before),
    el(
      'div',
      { class: 'm-page-header__row' },
      el('h1', { class: 'm-page-header__title' }, title),
      badges.length > 0 && el('div', { class: 'm-page-header__badges' }, badges),
      actions.length > 0 && el('div', { class: 'm-page-header__actions' }, actions),
    ),
  );
}
