import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';
import { DifficultyBadge } from '../../../../shared/js/components/atoms/DifficultyBadge.js';
import { StatusBadge } from '../atoms/StatusBadge.js';
import { Link } from '../atoms/Link.js';

/**
 * Organism: CourseItemList – the course's assignments in order, with move up/down and remove.
 * Unpublished assignments are flagged: students won't see them.
 * @param {Object} props
 * @param {{id: number, title: string, module: string, difficulty: string, status: string, attempts?: number}[]} props.items
 * @param {Object<string, string>} props.moduleNames - module key → name
 * @param {(index: number, direction: -1|1) => void} props.onMove
 * @param {(index: number) => void} props.onRemove
 * @returns {HTMLDivElement}
 */
export function CourseItemList({ items, moduleNames, onMove, onRemove }) {
  if (!items.length) {
    return el('div', { class: 'o-course-items' }, el('p', { class: 'o-course-items__empty' }, 'No assignments yet. Add some below.'));
  }
  return el(
    'div',
    { class: 'o-course-items' },
    el(
      'ol',
      { class: 'o-course-items__list' },
      items.map((item, i) =>
        el(
          'li',
          { class: 'o-course-items__item' },
          el('span', { class: 'o-course-items__number' }, String(i + 1)),
          el(
            'div',
            { class: 'o-course-items__main' },
            Link({ href: `#/assignments/${item.id}`, label: item.title }),
            el('span', { class: 'o-course-items__module' }, moduleNames[item.module] ?? item.module),
          ),
          DifficultyBadge({ difficulty: item.difficulty, compact: true }),
          item.status !== 'published' && el('span', { class: 'o-course-items__warning', title: 'Students won’t see this assignment until it is published.' }, StatusBadge({ status: item.status })),
          item.attempts !== undefined && el('span', { class: 'o-course-items__attempts' }, `${item.attempts} ${item.attempts === 1 ? 'attempt' : 'attempts'}`),
          el(
            'div',
            { class: 'o-course-items__actions' },
            Button({ id: `item-up-${item.id}`, variant: 'icon', icon: Icon({ name: 'up' }), ariaLabel: `Move “${item.title}” up`, disabled: i === 0, onClick: () => onMove(i, -1) }),
            Button({ id: `item-down-${item.id}`, variant: 'icon', icon: Icon({ name: 'down' }), ariaLabel: `Move “${item.title}” down`, disabled: i === items.length - 1, onClick: () => onMove(i, 1) }),
            Button({ variant: 'icon', icon: Icon({ name: 'close' }), ariaLabel: `Remove “${item.title}” from the course`, onClick: () => onRemove(i) }),
          ),
        ),
      ),
    ),
  );
}
