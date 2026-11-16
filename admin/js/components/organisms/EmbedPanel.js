import { el } from '../../../../shared/js/core/dom.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';
import { CopyField } from '../molecules/CopyField.js';
import { Link } from '../atoms/Link.js';

/**
 * Organism: EmbedPanel – the student link and the iframe code to paste into Moodle, plus a preview link.
 * @param {Object} props
 * @param {string} props.url - absolute play.html URL
 * @param {string} props.title - used as the iframe's title (for screen readers)
 * @param {boolean} props.published - when false, explain that students can't open it yet
 * @param {(value: string) => void} props.onCopy
 * @returns {HTMLElement}
 */
export function EmbedPanel({ url, title, published, onCopy }) {
  const code = `<iframe src="${url}" title="${escapeAttr(title)}" width="100%" height="720" style="border:0" allow="clipboard-read; clipboard-write" loading="lazy"></iframe>`;
  return el(
    'section',
    { class: 'o-embed', 'aria-labelledby': 'embed-title' },
    el('h2', { class: 'o-embed__title', id: 'embed-title' }, 'Share and embed'),
    !published && el('p', { class: 'o-embed__note' }, 'Not published yet: students will see “Not available” until you set the status to Published.'),
    CopyField({ id: 'embed-url', label: 'Link', value: url, onCopy }),
    CopyField({ id: 'embed-code', label: 'Embed code for Moodle (HTML)', value: code, multiline: true, onCopy }),
    Link({ href: url, label: 'Open preview', icon: Icon({ name: 'external' }), variant: 'button', external: true }),
  );
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
