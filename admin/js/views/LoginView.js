import { mount, preserveFocus } from '../../../shared/js/core/dom.js';
import { AuthForm } from '../components/organisms/AuthForm.js';

/** Renders the login form, or the first-time setup form, from a FormModel. */
export class LoginView {
  /**
   * @param {HTMLElement} slot
   * @param {import('../models/FormModel.js').FormModel} form
   * @param {'login'|'setup'} mode
   * @param {{onInput: Function, onSubmit: Function}} handlers
   */
  constructor(slot, form, mode, handlers) {
    Object.assign(this, { slot, form, mode, handlers });
    form.on('change', () => this.render());
  }

  render() {
    const { values, error, busy } = this.form;
    preserveFocus(() => mount(this.slot, AuthForm({ mode: this.mode, values, error, busy, ...this.handlers })));
  }
}
