import { FormModel } from '../models/FormModel.js';
import { LoginView } from '../views/LoginView.js';

/** Login, or first-time setup when there are no users yet. */
export class LoginController {
  /**
   * @param {HTMLElement} slot
   * @param {import('./AppController.js').AdminContext} ctx
   */
  constructor(slot, ctx) {
    this.ctx = ctx;
    this.mode = ctx.session.setupNeeded ? 'setup' : 'login';
    this.form = new FormModel({ name: '', email: '', password: '' });
    this.view = new LoginView(slot, this.form, this.mode, {
      onInput: (field, value) => this.form.set(field, value),
      onSubmit: () => this.#submit(),
    });
  }

  init() {
    this.view.render();
    document.getElementById(this.mode === 'setup' ? 'auth-name' : 'auth-email')?.focus();
  }

  async #submit() {
    const { name, email, password } = this.form.values;
    if (!email.trim() || !password) return this.form.setError('Enter your email and password.');
    this.form.setBusy(true);
    try {
      if (this.mode === 'setup') await this.ctx.session.setup({ name, email, password });
      else await this.ctx.session.login(email, password);
      // AppController reacts to the session change and shows the requested page.
    } catch (error) {
      this.form.setError(error.message);
    }
  }
}
