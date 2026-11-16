import { el } from '../../../../shared/js/core/dom.js';

/**
 * Molecule: MetaList – a list of facts as label/value pairs (author, last edited, attempts, …).
 * @param {Object} props
 * @param {{label: string, value: string|Node}[]} props.items - items with an empty value are skipped
 * @returns {HTMLDListElement}
 */
export function MetaList({ items }) {
  return el(
    'dl',
    { class: 'm-meta-list' },
    items
      .filter((i) => i.value !== '' && i.value !== null && i.value !== undefined)
      .map((i) => el('div', { class: 'm-meta-list__item' }, el('dt', {}, i.label), el('dd', {}, i.value))),
  );
}
