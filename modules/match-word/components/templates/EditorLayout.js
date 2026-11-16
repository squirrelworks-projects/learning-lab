import { el } from '../../../../shared/js/core/dom.js';

/**
 * Template: EditorLayout – the Match Word editor in the admin: instructions and images side by side,
 * subjects below. Slots: `general`, `images`, `subjects`.
 * @returns {HTMLDivElement}
 */
export function EditorLayout() {
  return el(
    'div',
    { class: 't-mw-editor' },
    el('div', { class: 't-mw-editor__general', dataset: { slot: 'general' } }),
    el('div', { class: 't-mw-editor__images', dataset: { slot: 'images' } }),
    el('div', { class: 't-mw-editor__subjects', dataset: { slot: 'subjects' } }),
  );
}
