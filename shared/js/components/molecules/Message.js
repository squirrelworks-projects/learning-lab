import { el } from '../../core/dom.js';

/**
 * Molecule: Message – a box for loading, empty, info and error states.
 * @param {Object} props
 * @param {string} props.title
 * @param {string|Node} [props.text]
 * @param {'info'|'error'|'loading'|'success'} [props.variant='info']
 * @param {Node} [props.action] - e.g. a Button
 * @returns {HTMLDivElement}
 */
export function Message({ title, text, variant = 'info', action }) {
  return el(
    'div',
    { class: ['m-message', `m-message--${variant}`], role: variant === 'error' ? 'alert' : 'status' },
    el('p', { class: 'm-message__title' }, title),
    text && el('p', { class: 'm-message__text' }, text),
    action && el('div', { class: 'm-message__action' }, action),
  );
}
