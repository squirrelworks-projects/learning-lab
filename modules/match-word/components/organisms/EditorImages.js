import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';
import { Select } from '../../../../shared/js/components/atoms/Select.js';
import { ImageRow } from '../molecules/ImageRow.js';

/**
 * Organism: EditorImages – the screenshots students place terms on: upload new ones,
 * reuse uploaded or example images, retitle, reorder and remove.
 * @param {Object} props
 * @param {{title: string, src: string}[]} props.images
 * @param {{src: string, name: string}[]} props.library - images that can be added
 * @param {boolean} props.uploading
 * @param {string|null} props.uploadError
 * @param {(src: string) => string} props.assetUrl
 * @param {(file: File) => void} props.onUpload
 * @param {(src: string) => void} props.onAddFromLibrary
 * @param {(index: number, value: string) => void} props.onTitle
 * @param {(index: number, direction: -1|1) => void} props.onMove
 * @param {(index: number) => void} props.onRemove
 * @returns {HTMLElement}
 */
export function EditorImages({ images, library, uploading, uploadError, assetUrl, onUpload, onAddFromLibrary, onTitle, onMove, onRemove }) {
  const file = el('input', {
    type: 'file',
    accept: 'image/png,image/jpeg,image/gif,image/webp',
    class: 'u-visually-hidden',
    id: 'mw-upload-input',
    tabIndex: -1,
    onChange: (e) => {
      const chosen = e.target.files[0];
      if (chosen) onUpload(chosen);
      e.target.value = '';
    },
  });
  const used = new Set(images.map((i) => i.src));
  const available = library.filter((m) => !used.has(m.src));

  return el(
    'section',
    { class: 'o-mw-editor-section', 'aria-labelledby': 'mw-images-title' },
    el('h2', { class: 'o-mw-editor-section__title', id: 'mw-images-title' }, `Images (${images.length})`),
    images.length
      ? el(
          'ol',
          { class: 'o-mw-editor-section__list' },
          images.map((image, i) =>
            ImageRow({
              index: i,
              count: images.length,
              image,
              url: assetUrl(image.src),
              onTitle: (v) => onTitle(i, v),
              onMove: (d) => onMove(i, d),
              onRemove: () => onRemove(i),
            }),
          ),
        )
      : el('p', { class: 'o-mw-editor-section__empty' }, 'No images yet.'),
    el(
      'div',
      { class: 'o-mw-editor-section__actions' },
      file,
      Button({
        id: 'mw-upload',
        label: uploading ? 'Uploading…' : 'Upload image',
        variant: 'ghost',
        icon: Icon({ name: 'upload' }),
        disabled: uploading,
        onClick: () => file.click(),
      }),
      available.length > 0 &&
        Select({
          id: 'mw-library',
          ariaLabel: 'Add an image you or other teachers uploaded before',
          value: '',
          options: [{ value: '', label: 'Add an existing image…' }, ...available.map((m) => ({ value: m.src, label: m.name }))],
          onChange: (v) => v && onAddFromLibrary(v),
        }),
    ),
    uploadError && el('p', { class: 'm-field__error', role: 'alert' }, uploadError),
    el('p', { class: 'm-field__hint' }, 'PNG, JPEG, GIF or WebP, max 5 MB. Screenshots work best at 1200–1600 px wide.'),
  );
}
