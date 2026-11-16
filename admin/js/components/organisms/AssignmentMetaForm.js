import { el } from '../../../../shared/js/core/dom.js';
import { Select } from '../../../../shared/js/components/atoms/Select.js';
import { TextArea } from '../../../../shared/js/components/atoms/TextArea.js';
import { TextInput } from '../../../../shared/js/components/atoms/TextInput.js';
import { Field } from '../../../../shared/js/components/molecules/Field.js';
import { DIFFICULTY_OPTIONS, STATUS_OPTIONS, STATUS_HINT } from '../../options.js';

/**
 * Organism: AssignmentMetaForm – the platform fields of an assignment: title, description, difficulty and status.
 * The module's own data is edited by the module's editor, not here.
 * @param {Object} props
 * @param {{title: string, description: string, difficulty: string, status: string}} props.record
 * @param {string} props.moduleName
 * @param {Object<string, string>} [props.errors] - field name → message, from the API
 * @param {(field: string, value: string) => void} props.onField - text fields call it on every keystroke
 * @returns {HTMLDivElement}
 */
export function AssignmentMetaForm({ record, moduleName, errors = {}, onField }) {
  return el(
    'div',
    { class: 'o-meta-form' },
    Field({
      id: 'a-title',
      label: 'Title',
      error: errors.title,
      control: TextInput({ id: 'a-title', value: record.title, maxLength: 200, invalid: Boolean(errors.title), onInput: (v) => onField('title', v) }),
    }),
    Field({
      id: 'a-description',
      label: 'Description (for teachers)',
      control: TextArea({ id: 'a-description', value: record.description, rows: 2, maxLength: 5000, onInput: (v) => onField('description', v) }),
    }),
    el(
      'div',
      { class: 'o-meta-form__row' },
      Field({
        id: 'a-difficulty',
        label: 'Difficulty',
        control: Select({ id: 'a-difficulty', value: record.difficulty, options: DIFFICULTY_OPTIONS, onChange: (v) => onField('difficulty', v) }),
      }),
      Field({
        id: 'a-status',
        label: 'Status',
        hint: STATUS_HINT,
        control: Select({ id: 'a-status', value: record.status, options: STATUS_OPTIONS, onChange: (v) => onField('status', v) }),
      }),
      el('div', { class: 'm-field' }, el('span', { class: 'm-field__label' }, 'Module'), el('span', { class: 'o-meta-form__static' }, moduleName)),
    ),
  );
}
