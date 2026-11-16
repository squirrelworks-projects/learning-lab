import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';

/**
 * Molecule: CopyField – a read-only value (a link or embed code) with a Copy button.
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} props.value
 * @param {boolean} [props.multiline=false] - show in a textarea (for embed code)
 * @param {(value: string) => void} props.onCopy
 * @returns {HTMLDivElement}
 */
export function CopyField({ id, label, value, multiline = false, onCopy }) {
  const control = multiline
    ? el('textarea', { class: 'a-textarea m-copy-field__value', id, rows: 3, readOnly: true }, value)
    : el('input', { class: 'a-input m-copy-field__value', id, value, readOnly: true });
  control.addEventListener('focus', () => control.select());
  return el(
    'div',
    { class: 'm-copy-field' },
    el('label', { class: 'm-field__label', for: id }, label),
    el(
      'div',
      { class: 'm-copy-field__row' },
      control,
      Button({ label: 'Copy', variant: 'ghost', icon: Icon({ name: 'copy' }), onClick: () => onCopy(value) }),
    ),
  );
}
