import { el } from '../../core/dom.js';

/**
 * Atom: TextArea – multi-line text field.
 * @param {Object} props
 * @param {string} [props.value='']
 * @param {string} [props.id]
 * @param {number} [props.rows=3]
 * @param {string} [props.placeholder]
 * @param {number} [props.maxLength]
 * @param {string} [props.describedBy] - id of a hint or error element
 * @param {string} [props.ariaLabel] - accessible name when there is no visible <label>
 * @param {(value: string) => void} [props.onInput]
 * @returns {HTMLTextAreaElement}
 */
export function TextArea({ value = '', id, rows = 3, placeholder, maxLength, describedBy, ariaLabel, onInput }) {
  const area = el('textarea', {
    class: 'a-textarea',
    id, rows, placeholder, maxLength,
    'aria-describedby': describedBy,
    'aria-label': ariaLabel,
    onInput: onInput && ((e) => onInput(e.target.value)),
  });
  area.value = value;
  return area;
}
