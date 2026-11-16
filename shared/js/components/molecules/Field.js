import { el } from '../../core/dom.js';

/**
 * Molecule: Field – a label above a form control, with an optional hint and error message.
 * The control must have the same `id` as the field, so the label points to it.
 * @param {Object} props
 * @param {string} props.id - id of the control
 * @param {string} props.label
 * @param {Element} props.control - TextInput, TextArea, Select, …
 * @param {string} [props.hint] - help text under the control (id `${id}-hint`)
 * @param {string} [props.error] - error text under the control (id `${id}-error`, role="alert")
 * @param {boolean} [props.inline=false] - label and control on one row
 * @returns {HTMLDivElement}
 */
export function Field({ id, label, control, hint, error, inline = false }) {
  return el(
    'div',
    { class: ['m-field', inline && 'm-field--inline', error && 'm-field--invalid'] },
    el('label', { class: 'm-field__label', for: id }, label),
    control,
    hint && el('p', { class: 'm-field__hint', id: `${id}-hint` }, hint),
    error && el('p', { class: 'm-field__error', id: `${id}-error`, role: 'alert' }, error),
  );
}
