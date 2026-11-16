/**
 * The four difficulty levels of an assignment, easiest first. The value is what the API stores;
 * the label is always shown next to the colour, so the level never depends on colour alone.
 */
export const DIFFICULTIES = [
  { value: 'green', label: 'Easy' },
  { value: 'yellow', label: 'Harder' },
  { value: 'red', label: 'Hardest' },
  { value: 'black', label: 'Expert' },
];

/** @param {string} value @returns {string} e.g. 'green' → 'Easy' */
export const difficultyLabel = (value) => DIFFICULTIES.find((d) => d.value === value)?.label ?? value;
