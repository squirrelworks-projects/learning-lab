import { el } from '../../core/dom.js';

/**
 * Atom: Select – native dropdown.
 * @param {Object} props
 * @param {{value: string, label: string}[]} props.options
 * @param {string} [props.value] - selected value
 * @param {string} [props.id] - for pairing with a <label>
 * @param {string} [props.ariaLabel] - accessible name when there is no visible <label>
 * @param {(value: string) => void} [props.onChange]
 * @returns {HTMLSelectElement}
 */
export function Select({ options, value = '', id, ariaLabel, onChange }) {
  const select = el(
    'select',
    { class: 'a-select', id, 'aria-label': ariaLabel, onChange: (e) => onChange?.(e.target.value) },
    options.map((o) => el('option', { value: o.value }, o.label)),
  );
  select.value = value;
  return select;
}
