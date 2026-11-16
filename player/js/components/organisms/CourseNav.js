import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';
import { Select } from '../../../../shared/js/components/atoms/Select.js';
import { DifficultyBadge } from '../../../../shared/js/components/atoms/DifficultyBadge.js';
import { difficultyLabel } from '../../../../shared/js/core/difficulty.js';

/**
 * Organism: CourseNav – the course title, a list to jump to any assignment, the current
 * assignment's difficulty, and previous/next buttons.
 * @param {Object} props
 * @param {string} props.title - course title
 * @param {{title: string, difficulty: string}[]} props.items
 * @param {number} props.index - 0-based current item
 * @param {(index: number) => void} props.onSelect
 * @returns {HTMLElement}
 */
export function CourseNav({ title, items, index, onSelect }) {
  const current = items[index];
  return el(
    'nav',
    { class: 'o-course-nav', 'aria-label': 'Course' },
    el('p', { class: 'o-course-nav__title' }, title),
    el(
      'div',
      { class: 'o-course-nav__controls' },
      Button({
        id: 'course-prev',
        variant: 'icon',
        icon: Icon({ name: 'left' }),
        ariaLabel: 'Previous assignment',
        disabled: index <= 0,
        onClick: () => onSelect(index - 1),
      }),
      Select({
        id: 'course-item',
        ariaLabel: 'Choose an assignment',
        value: String(index),
        options: items.map((item, i) => ({ value: String(i), label: `${i + 1}. ${item.title} (${difficultyLabel(item.difficulty)})` })),
        onChange: (value) => onSelect(Number(value)),
      }),
      Button({
        id: 'course-next',
        variant: 'icon',
        icon: Icon({ name: 'right' }),
        ariaLabel: 'Next assignment',
        disabled: index >= items.length - 1,
        onClick: () => onSelect(index + 1),
      }),
      el('span', { class: 'o-course-nav__count' }, `${index + 1} / ${items.length}`),
      current && DifficultyBadge({ difficulty: current.difficulty }),
    ),
  );
}
