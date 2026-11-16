import { el } from '../../../../shared/js/core/dom.js';

/**
 * Organism: DataTable – a simple table. Each column renders its cell from the row.
 * @param {Object} props
 * @param {string} props.caption - describes the table (visually hidden)
 * @param {{label: string, render: (row: Object) => (Node|string), className?: string}[]} props.columns
 * @param {Object[]} props.rows
 * @param {string} [props.emptyText='Nothing here yet.']
 * @param {boolean} [props.loading=false]
 * @returns {HTMLDivElement}
 */
export function DataTable({ caption, columns, rows, emptyText = 'Nothing here yet.', loading = false }) {
  return el(
    'div',
    { class: 'o-data-table' },
    el(
      'table',
      { class: 'o-data-table__table' },
      el('caption', { class: 'u-visually-hidden' }, caption),
      el('thead', {}, el('tr', {}, columns.map((c) => el('th', { scope: 'col', class: c.className }, c.label)))),
      el('tbody', {}, rows.map((row) => el('tr', {}, columns.map((c) => el('td', { class: c.className }, c.render(row)))))),
    ),
    (loading || !rows.length) && el('p', { class: 'o-data-table__empty' }, loading ? 'Loading…' : emptyText),
  );
}
