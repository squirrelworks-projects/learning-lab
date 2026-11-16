import { mount, preserveFocus } from '../../../shared/js/core/dom.js';
import { PageHeader } from '../components/molecules/PageHeader.js';
import { ProfileForm } from '../components/organisms/ProfileForm.js';

/** "Your profile": name, email and password of the logged-in teacher. */
export class ProfileView {
  /**
   * @param {HTMLElement} slot
   * @param {import('../models/FormModel.js').FormModel} form
   * @param {{onInput: Function, onSubmit: Function}} handlers
   */
  constructor(slot, form, handlers) {
    Object.assign(this, { slot, form, handlers });
    form.on('change', () => this.render());
  }

  render() {
    const { values, error, busy } = this.form;
    preserveFocus(() => mount(this.slot, PageHeader({ title: 'Your profile' }), ProfileForm({ values, error, busy, ...this.handlers })));
  }
}
