import { el } from '../../../../shared/js/core/dom.js';
import { Checkbox } from '../../../../shared/js/components/atoms/Checkbox.js';
import { TextArea } from '../../../../shared/js/components/atoms/TextArea.js';
import { Field } from '../../../../shared/js/components/molecules/Field.js';

/**
 * Organism: EditorGeneral – the instructions and whether students may use their own screenshot.
 * @param {Object} props
 * @param {string} props.instructions
 * @param {boolean} props.allowOwnImage
 * @param {(value: string) => void} props.onInstructions
 * @param {(value: boolean) => void} props.onAllowOwnImage
 * @returns {HTMLElement}
 */
export function EditorGeneral({ instructions, allowOwnImage, onInstructions, onAllowOwnImage }) {
  return el(
    'section',
    { class: 'o-mw-editor-section', 'aria-labelledby': 'mw-general-title' },
    el('h2', { class: 'o-mw-editor-section__title', id: 'mw-general-title' }, 'Instructions'),
    Field({
      id: 'mw-instructions',
      label: 'Shown to students above the terms',
      control: TextArea({ id: 'mw-instructions', value: instructions, rows: 2, onInput: onInstructions }),
    }),
    Checkbox({
      id: 'mw-allow-own',
      label: 'Students may paste or drop their own screenshot',
      checked: allowOwnImage,
      onChange: onAllowOwnImage,
    }),
  );
}
