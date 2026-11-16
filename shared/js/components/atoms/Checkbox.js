import { el } from '../../core/dom.js';

/**
 * Atom: Checkbox – a native checkbox with its label.
 * @param {Object} props
 * @param {string} props.label
 * @param {boolean} [props.checked=false]
 * @param {string} [props.id]
 * @param {string} [props.describedBy]
 * @param {(checked: boolean) => void} [props.onChange]
 * @returns {HTMLLabelElement}
 */
export function Checkbox({ label, checked = false, id, describedBy, onChange }) {
  return el(
    'label',
    { class: 'a-checkbox' },
    el('input', {
      class: 'a-checkbox__input',
      type: 'checkbox',
      id,
      checked,
      'aria-describedby': describedBy,
      onChange: (e) => onChange?.(e.target.checked),
    }),
    el('span', { class: 'a-checkbox__label' }, label),
  );
}
