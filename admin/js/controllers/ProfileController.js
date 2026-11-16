import { FormModel } from '../models/FormModel.js';
import { ProfileView } from '../views/ProfileView.js';
import { api } from '../../../shared/js/core/api.js';

/** The logged-in teacher's own name, email and password. */
export class ProfileController {
  /**
   * @param {HTMLElement} slot
   * @param {import('./AppController.js').AdminContext} ctx
   */
  constructor(slot, ctx) {
    this.ctx = ctx;
    const { name, email } = ctx.session.user;
    this.form = new FormModel({ name, email, currentPassword: '', newPassword: '' });
    this.view = new ProfileView(slot, this.form, {
      onInput: (field, value) => this.form.set(field, value),
      onSubmit: () => this.#submit(),
    });
  }

  init() {
    this.view.render();
  }

  async #submit() {
    this.form.setBusy(true);
    try {
      const { user } = await api.put('auth/me', this.form.values);
      this.ctx.session.setUser(user);
      this.form.values.currentPassword = '';
      this.form.values.newPassword = '';
      this.form.setBusy(false);
      this.ctx.shell.toast('Your profile is saved.');
    } catch (error) {
      this.form.setError(error.message);
    }
  }
}
