import { el } from '../../../../shared/js/core/dom.js';
import { SubjectPicker } from '../molecules/SubjectPicker.js';
import { TermItem } from '../molecules/TermItem.js';

/**
 * Organism: Sidebar – subject picker and the list of draggable terms.
 * @param {Object} props
 * @param {{id: string, name: string}[]} props.subjects
 * @param {string} props.activeId
 * @param {{id: string, term: string, explanation: string}[]} props.terms
 * @param {(id: string) => void} props.onSubjectChange
 * @param {(e: DragEvent, termId: string) => void} props.onTermDragStart
 * @param {(termId: string) => void} [props.onTermActivate]
 * @param {string} [props.error] - shown instead of the list when loading failed
 * @param {string} [props.instructions] - the teacher's instructions, shown above the terms
 * @returns {HTMLDivElement}
 */
export function Sidebar({ subjects, activeId, terms, onSubjectChange, onTermDragStart, onTermActivate, error, instructions }) {
  return el(
    'div',
    { class: 'o-sidebar' },
    el('h2', { class: 'o-sidebar__title' }, 'Terms'),
    instructions && el('p', { class: 'o-sidebar__instructions' }, instructions),
    error
      ? el('p', { class: 'o-sidebar__error', role: 'alert' }, error)
      : [
          subjects.length > 1 && SubjectPicker({ subjects, activeId, onChange: onSubjectChange }),
          el('p', { class: 'o-sidebar__hint' }, 'Drag a term onto the screenshot.'),
          el(
            'ul',
            { class: 'o-sidebar__list' },
            terms.map((term) => TermItem({ term, onDragStart: onTermDragStart, onActivate: onTermActivate })),
          ),
        ],
  );
}
