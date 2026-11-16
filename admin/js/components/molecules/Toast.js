import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';

/**
 * Molecule: Toast – a short message at the bottom of the screen (saved, error, …).
 * @param {Object} props
 * @param {string} props.message
 * @param {'success'|'error'|'info'} [props.variant='info']
 * @param {() => void} [props.onClose]
 * @returns {HTMLDivElement}
 */
export function Toast({ message, variant = 'info', onClose }) {
  return el(
    'div',
    { class: ['m-toast', `m-toast--${variant}`], role: variant === 'error' ? 'alert' : 'status' },
    el('span', { class: 'm-toast__message' }, message),
    onClose && Button({ variant: 'icon', icon: Icon({ name: 'close' }), ariaLabel: 'Close message', onClick: onClose }),
  );
}
