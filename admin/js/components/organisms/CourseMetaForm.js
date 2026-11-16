import { el } from '../../../../shared/js/core/dom.js';
import { Select } from '../../../../shared/js/components/atoms/Select.js';
import { TextArea } from '../../../../shared/js/components/atoms/TextArea.js';
import { TextInput } from '../../../../shared/js/components/atoms/TextInput.js';
import { Field } from '../../../../shared/js/components/molecules/Field.js';
import { STATUS_OPTIONS, STATUS_HINT } from '../../options.js';

/**
 * Organism: CourseMetaForm – title, description and status of a course.
 * @param {Object} props
 * @param {{title: string, description: string, status: string}} props.record
 * @param {Object<string, string>} [props.errors] - field name → message
 * @param {(field: string, value: string) => void} props.onField
 * @returns {HTMLDivElement}
 */
export function CourseMetaForm({ record, errors = {}, onField }) {
  return el(
    'div',
    { class: 'o-meta-form' },
    Field({
      id: 'c-title',
      label: 'Title',
      error: errors.title,
      control: TextInput({ id: 'c-title', value: record.title, maxLength: 200, invalid: Boolean(errors.title), onInput: (v) => onField('title', v) }),
    }),
    Field({
      id: 'c-description',
      label: 'Description',
      control: TextArea({ id: 'c-description', value: record.description, rows: 2, maxLength: 5000, onInput: (v) => onField('description', v) }),
    }),
    Field({
      id: 'c-status',
      label: 'Status',
      hint: STATUS_HINT,
      control: Select({ id: 'c-status', value: record.status, options: STATUS_OPTIONS, onChange: (v) => onField('status', v) }),
    }),
  );
}
