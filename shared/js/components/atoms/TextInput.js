import { el } from '../../core/dom.js';

/**
 * Atom: TextInput – single-line text field.
 * @param {Object} props
 * @param {string} [props.value='']
 * @param {string} [props.id] - for pairing with a <label>, and for restoring focus after re-rendering
 * @param {'text'|'email'|'password'|'search'|'url'} [props.type='text']
 * @param {string} [props.name]
 * @param {string} [props.placeholder]
 * @param {string} [props.autocomplete]
 * @param {boolean} [props.required=false]
 * @param {number} [props.maxLength]
 * @param {boolean} [props.invalid=false] - marks the field as invalid (aria-invalid)
 * @param {string} [props.describedBy] - id of a hint or error element
 * @param {string} [props.ariaLabel] - accessible name when there is no visible <label>
 * @param {(value: string) => void} [props.onInput] - every keystroke
 * @param {(value: string) => void} [props.onChange] - when the field loses focus after a change
 * @returns {HTMLInputElement}
 */
export function TextInput({
  value = '', id, type = 'text', name, placeholder, autocomplete, required = false, maxLength,
  invalid = false, describedBy, ariaLabel, onInput, onChange,
}) {
  return el('input', {
    class: ['a-input', invalid && 'a-input--invalid'],
    type, id, name, value, placeholder, autocomplete, required, maxLength,
    'aria-invalid': invalid ? 'true' : null,
    'aria-describedby': describedBy,
    'aria-label': ariaLabel,
    onInput: onInput && ((e) => onInput(e.target.value)),
    onChange: onChange && ((e) => onChange(e.target.value)),
  });
}
