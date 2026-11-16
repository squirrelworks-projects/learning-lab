import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { TextInput } from '../../../../shared/js/components/atoms/TextInput.js';
import { Field } from '../../../../shared/js/components/molecules/Field.js';

/**
 * Organism: AuthForm – the login form, or the first-time setup form that creates the first administrator.
 * @param {Object} props
 * @param {'login'|'setup'} props.mode
 * @param {{name?: string, email: string, password: string}} props.values
 * @param {string} [props.error] - shown above the button
 * @param {boolean} [props.busy=false] - disables the button while the request runs
 * @param {(field: string, value: string) => void} props.onInput
 * @param {() => void} props.onSubmit
 * @returns {HTMLFormElement}
 */
export function AuthForm({ mode, values, error, busy = false, onInput, onSubmit }) {
  const setup = mode === 'setup';
  return el(
    'form',
    {
      class: 'o-auth-form',
      novalidate: true,
      onSubmit: (e) => {
        e.preventDefault();
        onSubmit();
      },
    },
    el('h1', { class: 'o-auth-form__title' }, setup ? 'Set up Learning Lab' : 'Log in'),
    el(
      'p',
      { class: 'o-auth-form__intro' },
      setup ? 'Create the first administrator account. You can add other teachers afterwards.' : 'Learning Lab – for teachers.',
    ),
    setup &&
      Field({
        id: 'auth-name',
        label: 'Your name',
        control: TextInput({ id: 'auth-name', value: values.name, autocomplete: 'name', onInput: (v) => onInput('name', v) }),
      }),
    Field({
      id: 'auth-email',
      label: 'Email',
      control: TextInput({ id: 'auth-email', type: 'email', value: values.email, autocomplete: 'username', onInput: (v) => onInput('email', v) }),
    }),
    Field({
      id: 'auth-password',
      label: 'Password',
      hint: setup ? 'At least 10 characters.' : undefined,
      control: TextInput({
        id: 'auth-password',
        type: 'password',
        value: values.password,
        autocomplete: setup ? 'new-password' : 'current-password',
        describedBy: setup ? 'auth-password-hint' : undefined,
        onInput: (v) => onInput('password', v),
      }),
    }),
    error && el('p', { class: 'o-auth-form__error', role: 'alert' }, error),
    Button({ type: 'submit', label: busy ? 'Please wait…' : setup ? 'Create account' : 'Log in', disabled: busy }),
  );
}
