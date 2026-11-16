import { el } from '../../../../shared/js/core/dom.js';
import { Select } from '../../../../shared/js/components/atoms/Select.js';
import { TextInput } from '../../../../shared/js/components/atoms/TextInput.js';

/**
 * Organism: ListFilters – a search field and dropdown filters above a list.
 * @param {Object} props
 * @param {{id: string, label: string, type: 'search'|'select', value: string, options?: {value: string, label: string}[]}[]} props.filters
 * @param {(id: string, value: string) => void} props.onChange - search fields call it on every keystroke
 * @returns {HTMLDivElement}
 */
export function ListFilters({ filters, onChange }) {
  return el(
    'div',
    { class: 'o-list-filters', role: 'search' },
    filters.map((f) => {
      const id = `filter-${f.id}`;
      const control =
        f.type === 'search'
          ? TextInput({ id, type: 'search', value: f.value, placeholder: 'Search titles…', ariaLabel: f.label, onInput: (v) => onChange(f.id, v) })
          : Select({ id, value: f.value, options: f.options, ariaLabel: f.label, onChange: (v) => onChange(f.id, v) });
      return el('div', { class: ['o-list-filters__item', f.type === 'search' && 'o-list-filters__item--grow'] }, control);
    }),
  );
}
