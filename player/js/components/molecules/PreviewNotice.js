import { el } from '../../../../shared/js/core/dom.js';

/**
 * Molecule: PreviewNotice – slim bar telling a teacher that what they see is not published yet.
 * @param {Object} props
 * @param {string} [props.text='Preview – not published. Students can’t see this yet.']
 * @returns {HTMLParagraphElement}
 */
export function PreviewNotice({ text = 'Preview – not published. Students can’t see this yet.' } = {}) {
  return el('p', { class: 'm-preview-notice', role: 'status' }, text);
}
