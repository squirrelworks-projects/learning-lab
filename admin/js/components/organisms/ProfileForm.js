import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { TextInput } from '../../../../shared/js/components/atoms/TextInput.js';
import { Field } from '../../../../shared/js/components/molecules/Field.js';

/**
 * Organism: ProfileForm – change your own name, email and password.
 * @param {Object} props
 * @param {{name: string, email: string, currentPassword: string, newPassword: string}} props.values
 * @param {string} [props.error]
 * @param {boolean} [props.busy=false]
 * @param {(field: string, value: string) => void} props.onInput
 * @param {() => void} props.onSubmit
 * @returns {HTMLFormElement}
 */
export function ProfileForm({ values, error, busy = false, onInput, onSubmit }) {
  return el(
    'form',
    {
      class: 'o-panel-form o-panel-form--narrow',
      novalidate: true,
      onSubmit: (e) => {
        e.preventDefault();
        onSubmit();
      },
    },
    Field({ id: 'p-name', label: 'Name', control: TextInput({ id: 'p-name', value: values.name, autocomplete: 'name', onInput: (v) => onInput('name', v) }) }),
    Field({ id: 'p-email', label: 'Email', control: TextInput({ id: 'p-email', type: 'email', value: values.email, autocomplete: 'username', onInput: (v) => onInput('email', v) }) }),
    el('h2', { class: 'o-panel-form__title' }, 'Change password'),
    Field({
      id: 'p-current',
      label: 'Current password',
      control: TextInput({ id: 'p-current', type: 'password', value: values.currentPassword, autocomplete: 'current-password', onInput: (v) => onInput('currentPassword', v) }),
    }),
    Field({
      id: 'p-new',
      label: 'New password',
      hint: 'At least 10 characters. Leave both empty to keep your password.',
      control: TextInput({ id: 'p-new', type: 'password', value: values.newPassword, autocomplete: 'new-password', describedBy: 'p-new-hint', onInput: (v) => onInput('newPassword', v) }),
    }),
    error && el('p', { class: 'o-panel-form__error', role: 'alert' }, error),
    el('div', { class: 'o-panel-form__actions' }, Button({ type: 'submit', label: busy ? 'Saving…' : 'Save', disabled: busy })),
  );
}
