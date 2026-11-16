import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';
import { TextInput } from '../../../../shared/js/components/atoms/TextInput.js';

/**
 * Molecule: ImageRow – one image of the assignment in the editor: thumbnail, title, move and remove.
 * @param {Object} props
 * @param {number} props.index
 * @param {number} props.count - number of images (to disable moving past the ends)
 * @param {{title: string, src: string}} props.image
 * @param {string} props.url - full URL of the image, for the thumbnail
 * @param {(value: string) => void} props.onTitle
 * @param {(direction: -1|1) => void} props.onMove
 * @param {() => void} props.onRemove
 * @returns {HTMLLIElement}
 */
export function ImageRow({ index, count, image, url, onTitle, onMove, onRemove }) {
  const name = image.title || `image ${index + 1}`;
  return el(
    'li',
    { class: 'm-image-row' },
    el('img', { class: 'm-image-row__thumb', src: url, alt: '' }),
    el(
      'div',
      { class: 'm-image-row__main' },
      TextInput({ id: `mw-image-${index}-title`, value: image.title, ariaLabel: `Title of image ${index + 1}`, placeholder: 'Title shown to students', onInput: onTitle }),
      el('span', { class: 'm-image-row__src' }, image.src),
    ),
    el(
      'div',
      { class: 'm-image-row__actions' },
      Button({ id: `mw-image-${index}-up`, variant: 'icon', icon: Icon({ name: 'up' }), ariaLabel: `Move ${name} up`, disabled: index === 0, onClick: () => onMove(-1) }),
      Button({ id: `mw-image-${index}-down`, variant: 'icon', icon: Icon({ name: 'down' }), ariaLabel: `Move ${name} down`, disabled: index === count - 1, onClick: () => onMove(1) }),
      Button({ variant: 'icon', icon: Icon({ name: 'trash' }), ariaLabel: `Remove ${name}`, onClick: onRemove }),
    ),
  );
}
