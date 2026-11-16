import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';
import { Select } from '../../../../shared/js/components/atoms/Select.js';
import { TextInput } from '../../../../shared/js/components/atoms/TextInput.js';
import { DifficultyBadge } from '../../../../shared/js/components/atoms/DifficultyBadge.js';
import { StatusBadge } from '../atoms/StatusBadge.js';
import { DIFFICULTIES } from '../../../../shared/js/core/difficulty.js';

const MAX_SHOWN = 25;

/**
 * Organism: AssignmentPicker – search all assignments (from every module and teacher) and add one to the course.
 * @param {Object} props
 * @param {{id: number, title: string, module: string, difficulty: string, status: string, author: {name: string}|null}[]} props.assignments - the ones not in the course yet
 * @param {Object<string, string>} props.moduleNames
 * @param {string} props.query
 * @param {string} props.difficulty - '' for all
 * @param {(query: string) => void} props.onQuery
 * @param {(difficulty: string) => void} props.onDifficulty
 * @param {(id: number) => void} props.onAdd
 * @returns {HTMLElement}
 */
export function AssignmentPicker({ assignments, moduleNames, query, difficulty, onQuery, onDifficulty, onAdd }) {
  const q = query.trim().toLowerCase();
  const matches = assignments.filter((a) => (!q || a.title.toLowerCase().includes(q)) && (!difficulty || a.difficulty === difficulty));
  return el(
    'section',
    { class: 'o-picker', 'aria-labelledby': 'picker-title' },
    el('h2', { class: 'o-picker__title', id: 'picker-title' }, 'Add assignments'),
    el(
      'div',
      { class: 'o-picker__filters' },
      TextInput({ id: 'picker-q', type: 'search', value: query, placeholder: 'Search assignments…', ariaLabel: 'Search assignments', onInput: onQuery }),
      Select({
        id: 'picker-difficulty',
        value: difficulty,
        ariaLabel: 'Difficulty',
        options: [{ value: '', label: 'All difficulties' }, ...DIFFICULTIES],
        onChange: onDifficulty,
      }),
    ),
    matches.length
      ? el(
          'ul',
          { class: 'o-picker__list' },
          matches.slice(0, MAX_SHOWN).map((a) =>
            el(
              'li',
              { class: 'o-picker__item' },
              el(
                'div',
                { class: 'o-picker__main' },
                el('span', { class: 'o-picker__name' }, a.title),
                el('span', { class: 'o-picker__meta' }, [moduleNames[a.module] ?? a.module, a.author?.name].filter(Boolean).join(' · ')),
              ),
              DifficultyBadge({ difficulty: a.difficulty, compact: true }),
              a.status !== 'published' && StatusBadge({ status: a.status }),
              Button({ label: 'Add', variant: 'ghost', icon: Icon({ name: 'plus' }), ariaLabel: `Add “${a.title}”`, onClick: () => onAdd(a.id) }),
            ),
          ),
        )
      : el('p', { class: 'o-picker__empty' }, 'No matching assignments.'),
    matches.length > MAX_SHOWN && el('p', { class: 'o-picker__more' }, `Showing ${MAX_SHOWN} of ${matches.length}. Search to narrow the list.`),
  );
}
