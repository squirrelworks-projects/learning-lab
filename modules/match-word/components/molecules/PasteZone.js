import { el } from '../../../../shared/js/core/dom.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';

/**
 * Molecule: PasteZone – empty state shown on the stage before an image is loaded.
 * @param {Object} [props]
 * @param {string} [props.title='No screenshot yet']
 * @param {boolean} [props.allowPaste=true] - explain how to paste; when false, say that there is no image
 * @returns {HTMLDivElement}
 */
export function PasteZone({ title = 'No screenshot yet', allowPaste = true } = {}) {
  if (!allowPaste) {
    return el(
      'div',
      { class: 'm-paste-zone' },
      Icon({ name: 'image', className: 'm-paste-zone__icon' }),
      el('p', { class: 'm-paste-zone__title' }, 'No image'),
      el('p', { class: 'm-paste-zone__hint' }, 'Choose an image in the menu above.'),
    );
  }
  return el(
    'div',
    { class: 'm-paste-zone' },
    Icon({ name: 'paste', className: 'm-paste-zone__icon' }),
    el('p', { class: 'm-paste-zone__title' }, title),
    el(
      'p',
      { class: 'm-paste-zone__hint' },
      'Take a screenshot (',
      el('kbd', {}, 'Win'), '+', el('kbd', {}, 'Shift'), '+', el('kbd', {}, 'S'),
      ') and press ',
      el('kbd', {}, 'Ctrl'), '+', el('kbd', {}, 'V'),
      ' here, drop an image file, or use the Image menu above.',
    ),
  );
}
