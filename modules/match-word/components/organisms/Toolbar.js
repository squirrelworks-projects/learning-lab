import { el } from '../../../../shared/js/core/dom.js';
import { ImagePicker } from '../molecules/ImagePicker.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';

/** Label and icon of the copy button for each copy state. */
const COPY_STATES = {
  idle: { label: 'Copy image', icon: 'copy' },
  copying: { label: 'Copying…', icon: 'copy' },
  copied: { label: 'Copied!', icon: 'check' },
  downloaded: { label: 'Downloaded', icon: 'check' },
  error: { label: 'Copy failed', icon: 'close' },
};

/**
 * Organism: Toolbar – assignment title, image picker, "copy image" and "clear stickers".
 * The image picker is only shown when there is a choice: more than one image, or students may paste their own.
 * @param {Object} props
 * @param {string} [props.title='Match Word'] - the assignment's title
 * @param {boolean} [props.allowPaste=true] - students may paste or drop their own screenshot
 * @param {{title: string, src: string}[]} props.images
 * @param {string|null} props.value - selected asset src
 * @param {number} props.stickerCount
 * @param {boolean} props.hasImage - enables the copy button
 * @param {boolean} [props.isPasted=false] - the shown image was pasted/dropped (not an example)
 * @param {'idle'|'copying'|'copied'|'downloaded'|'error'} [props.copyState='idle']
 * @param {string} [props.notice] - short status message, e.g. why a paste failed
 * @param {(src: string) => void} props.onImageChange
 * @param {() => void} props.onPasteImage - "Paste image from clipboard" chosen in the picker
 * @param {() => void} props.onCopySnapshot
 * @param {() => void} props.onClearStickers
 * @returns {HTMLDivElement}
 */
export function Toolbar({
  title = 'Match Word', allowPaste = true, images, value, stickerCount, hasImage, isPasted = false, copyState = 'idle', notice,
  onImageChange, onPasteImage, onCopySnapshot, onClearStickers,
}) {
  const copy = COPY_STATES[copyState] ?? COPY_STATES.idle;
  return el(
    'div',
    { class: 'o-toolbar' },
    el('h1', { class: 'o-toolbar__title', title }, title),
    (images.length > 1 || allowPaste) &&
      ImagePicker({ images, value, isPasted, allowPaste, onChange: onImageChange, onPaste: onPasteImage }),
    el('span', { class: 'o-toolbar__notice', role: 'status' }, notice ?? ''),
    Button({
      id: 'copy-snapshot',
      label: copy.label,
      variant: 'primary',
      icon: Icon({ name: copy.icon }),
      disabled: !hasImage, // not disabled while copying, so keyboard focus stays on the button
      onClick: onCopySnapshot,
    }),
    Button({
      label: `Clear stickers (${stickerCount})`,
      variant: 'ghost',
      icon: Icon({ name: 'trash' }),
      disabled: stickerCount === 0,
      onClick: onClearStickers,
    }),
  );
}
