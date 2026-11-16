import { el } from '../../../../shared/js/core/dom.js';

/**
 * Molecule: ErrorList – problems that stop something from being published or saved.
 * @param {Object} props
 * @param {string} props.title
 * @param {string[]} props.errors - nothing is rendered when empty
 * @param {'error'|'warning'} [props.variant='warning']
 * @returns {HTMLDivElement|null}
 */
export function ErrorList({ title, errors, variant = 'warning' }) {
  if (!errors.length) return null;
  return el(
    'div',
    { class: ['m-error-list', `m-error-list--${variant}`], role: variant === 'error' ? 'alert' : null },
    el('p', { class: 'm-error-list__title' }, title),
    el('ul', { class: 'm-error-list__items' }, errors.map((e) => el('li', {}, e))),
  );
}
