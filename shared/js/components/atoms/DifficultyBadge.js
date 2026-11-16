import { el } from '../../core/dom.js';
import { difficultyLabel } from '../../core/difficulty.js';

/**
 * Atom: DifficultyBadge – coloured pill with the level's name, e.g. a green "Easy".
 * Always shows the text, so the level doesn't depend on colour alone.
 * @param {Object} props
 * @param {'green'|'yellow'|'red'|'black'} props.difficulty
 * @param {boolean} [props.compact=false] - smaller, for lists
 * @returns {HTMLSpanElement}
 */
export function DifficultyBadge({ difficulty, compact = false }) {
  return el(
    'span',
    { class: ['a-difficulty', `a-difficulty--${difficulty}`, compact && 'a-difficulty--compact'] },
    el('span', { class: 'a-difficulty__dot', 'aria-hidden': 'true' }),
    el('span', { class: 'a-difficulty__label' }, difficultyLabel(difficulty)),
  );
}
