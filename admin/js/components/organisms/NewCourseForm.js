import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { TextInput } from '../../../../shared/js/components/atoms/TextInput.js';
import { Field } from '../../../../shared/js/components/molecules/Field.js';

/**
 * Organism: NewCourseForm – the title of a new course. Assignments are added on the edit page.
 * @param {Object} props
 * @param {{title: string}} props.values
 * @param {string} [props.error]
 * @param {boolean} [props.busy=false]
 * @param {(field: string, value: string) => void} props.onInput
 * @param {() => void} props.onSubmit
 * @param {() => void} props.onCancel
 * @returns {HTMLFormElement}
 */
export function NewCourseForm({ values, error, busy = false, onInput, onSubmit, onCancel }) {
  return el(
    'form',
    {
      class: 'o-panel-form',
      novalidate: true,
      onSubmit: (e) => {
        e.preventDefault();
        onSubmit();
      },
    },
    Field({
      id: 'new-course-title',
      label: 'Course title',
      control: TextInput({ id: 'new-course-title', value: values.title, maxLength: 200, onInput: (v) => onInput('title', v) }),
    }),
    error && el('p', { class: 'o-panel-form__error', role: 'alert' }, error),
    el(
      'div',
      { class: 'o-panel-form__actions' },
      Button({ type: 'submit', label: busy ? 'Creating…' : 'Create course', disabled: busy }),
      Button({ label: 'Cancel', variant: 'ghost', onClick: onCancel }),
    ),
  );
}
