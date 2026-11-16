import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Checkbox } from '../../../../shared/js/components/atoms/Checkbox.js';
import { Select } from '../../../../shared/js/components/atoms/Select.js';
import { TextInput } from '../../../../shared/js/components/atoms/TextInput.js';
import { Field } from '../../../../shared/js/components/molecules/Field.js';

/**
 * Organism: UserForm – add a teacher, or edit one (admins only).
 * @param {Object} props
 * @param {{name: string, email: string, role: string, active: boolean, password: string}} props.values
 * @param {boolean} props.editing - false = new user (password required)
 * @param {boolean} [props.isSelf=false] - editing yourself: role and active can't be changed
 * @param {string} [props.error]
 * @param {boolean} [props.busy=false]
 * @param {(field: string, value: string|boolean) => void} props.onInput
 * @param {() => void} props.onSubmit
 * @param {() => void} props.onCancel
 * @returns {HTMLFormElement}
 */
export function UserForm({ values, editing, isSelf = false, error, busy = false, onInput, onSubmit, onCancel }) {
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
    el('h2', { class: 'o-panel-form__title' }, editing ? `Edit ${values.name || 'user'}` : 'Add a teacher'),
    el(
      'div',
      { class: 'o-panel-form__grid' },
      Field({ id: 'u-name', label: 'Name', control: TextInput({ id: 'u-name', value: values.name, autocomplete: 'off', onInput: (v) => onInput('name', v) }) }),
      Field({ id: 'u-email', label: 'Email', control: TextInput({ id: 'u-email', type: 'email', value: values.email, autocomplete: 'off', onInput: (v) => onInput('email', v) }) }),
      Field({
        id: 'u-role',
        label: 'Role',
        hint: isSelf ? 'You can’t change your own role.' : 'Administrators can also manage users.',
        control: isSelf
          ? el('span', { class: 'o-panel-form__static', id: 'u-role' }, 'Administrator')
          : Select({ id: 'u-role', value: values.role, options: [{ value: 'teacher', label: 'Teacher' }, { value: 'admin', label: 'Administrator' }], onChange: (v) => onInput('role', v) }),
      }),
      Field({
        id: 'u-password',
        label: editing ? 'New password (leave empty to keep)' : 'Password',
        hint: 'At least 10 characters. Give it to the teacher in person; they can change it under their name.',
        control: TextInput({ id: 'u-password', type: 'password', value: values.password, autocomplete: 'new-password', describedBy: 'u-password-hint', onInput: (v) => onInput('password', v) }),
      }),
    ),
    editing && !isSelf && Checkbox({ id: 'u-active', label: 'Active (can log in)', checked: values.active, onChange: (v) => onInput('active', v) }),
    error && el('p', { class: 'o-panel-form__error', role: 'alert' }, error),
    el(
      'div',
      { class: 'o-panel-form__actions' },
      Button({ type: 'submit', label: busy ? 'Saving…' : editing ? 'Save user' : 'Add user', disabled: busy }),
      Button({ label: 'Cancel', variant: 'ghost', onClick: onCancel }),
    ),
  );
}
