import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Select } from '../../../../shared/js/components/atoms/Select.js';
import { TextInput } from '../../../../shared/js/components/atoms/TextInput.js';
import { Field } from '../../../../shared/js/components/molecules/Field.js';
import { DIFFICULTY_OPTIONS } from '../../options.js';

/**
 * Organism: NewAssignmentForm – pick the module, a title and a difficulty for a new assignment.
 * @param {Object} props
 * @param {{key: string, name: string, description: string}[]} props.modules
 * @param {{module: string, title: string, difficulty: string}} props.values
 * @param {string} [props.error]
 * @param {boolean} [props.busy=false]
 * @param {(field: string, value: string) => void} props.onInput
 * @param {() => void} props.onSubmit
 * @param {() => void} props.onCancel
 * @returns {HTMLFormElement}
 */
export function NewAssignmentForm({ modules, values, error, busy = false, onInput, onSubmit, onCancel }) {
  const module = modules.find((m) => m.key === values.module);
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
      id: 'new-module',
      label: 'Module',
      hint: module?.description,
      control: Select({
        id: 'new-module',
        value: values.module,
        options: modules.map((m) => ({ value: m.key, label: m.name })),
        onChange: (v) => onInput('module', v),
      }),
    }),
    Field({
      id: 'new-title',
      label: 'Title',
      control: TextInput({ id: 'new-title', value: values.title, maxLength: 200, required: true, onInput: (v) => onInput('title', v) }),
    }),
    Field({
      id: 'new-difficulty',
      label: 'Difficulty',
      control: Select({ id: 'new-difficulty', value: values.difficulty, options: DIFFICULTY_OPTIONS, onChange: (v) => onInput('difficulty', v) }),
    }),
    error && el('p', { class: 'o-panel-form__error', role: 'alert' }, error),
    el(
      'div',
      { class: 'o-panel-form__actions' },
      Button({ type: 'submit', label: busy ? 'Creating…' : 'Create assignment', disabled: busy }),
      Button({ label: 'Cancel', variant: 'ghost', onClick: onCancel }),
    ),
  );
}
