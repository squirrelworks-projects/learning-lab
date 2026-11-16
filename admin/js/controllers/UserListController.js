import { ListModel } from '../models/ListModel.js';
import { FormModel } from '../models/FormModel.js';
import { UserListView } from '../views/UserListView.js';
import { api } from '../../../shared/js/core/api.js';

/** Users page (administrators only): add teachers, edit them, reset passwords, deactivate. */
export class UserListController {
  /**
   * @param {HTMLElement} slot
   * @param {import('./AppController.js').AdminContext} ctx
   */
  constructor(slot, ctx) {
    this.ctx = ctx;
    this.list = new ListModel('users', 'users');
    this.form = new FormModel({ id: null, name: '', email: '', role: 'teacher', active: true, password: '' });
    this.view = new UserListView(slot, { list: this.list, form: this.form }, ctx.session.user.id, {
      onNew: () => this.form.show(),
      onEdit: (user) => {
        this.form.show({ ...user, password: '' });
        requestAnimationFrame(() => document.getElementById('u-name')?.focus());
      },
      onInput: (field, value) => this.form.set(field, value, { silent: typeof value === 'string' && field !== 'role' }),
      onSubmit: () => this.#submit(),
      onCancel: () => this.form.hide(),
    });
  }

  init() {
    this.view.render();
    this.list.load();
  }

  async #submit() {
    const { id, name, email, role, active, password } = this.form.values;
    this.form.setBusy(true);
    try {
      if (id) {
        await api.put(`users/${id}`, { name, email, role, active, ...(password && { password }) });
        if (id === this.ctx.session.user.id) await this.ctx.session.load();
        this.ctx.shell.toast(`${name} saved.`);
      } else {
        await api.post('users', { name, email, role, password });
        this.ctx.shell.toast(`${name} added. Remember to give them their password.`);
      }
      this.form.hide();
      this.list.load();
      this.ctx.users.load();
    } catch (error) {
      this.form.setError(error.message);
    }
  }
}
