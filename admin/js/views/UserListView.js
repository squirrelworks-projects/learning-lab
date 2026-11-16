import { el, mount, getSlot, preserveFocus } from '../../../shared/js/core/dom.js';
import { Button } from '../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../shared/js/components/atoms/Icon.js';
import { ListLayout } from '../components/templates/ListLayout.js';
import { PageHeader } from '../components/molecules/PageHeader.js';
import { DataTable } from '../components/organisms/DataTable.js';
import { UserForm } from '../components/organisms/UserForm.js';
import { formatDate } from '../format.js';

/** The users page (administrators only): the list of teachers and the add/edit form. */
export class UserListView {
  /**
   * @param {HTMLElement} slot
   * @param {{list: import('../models/ListModel.js').ListModel, form: import('../models/FormModel.js').FormModel}} models
   * @param {number} myId - the logged-in user's id
   * @param {{onNew, onEdit, onInput, onSubmit, onCancel}} handlers
   */
  constructor(slot, models, myId, handlers) {
    Object.assign(this, { models, myId, handlers });
    this.page = ListLayout();
    mount(slot, this.page);
    for (const model of Object.values(models)) model.on('change', () => this.render());
  }

  render() {
    const { list, form } = this.models;
    const h = this.handlers;
    preserveFocus(() => {
      mount(
        getSlot(this.page, 'header'),
        PageHeader({ title: 'Users', actions: [Button({ id: 'new-user', label: 'Add teacher', icon: Icon({ name: 'plus' }), disabled: form.open, onClick: h.onNew })] }),
      );
      mount(
        getSlot(this.page, 'panel'),
        form.open &&
          UserForm({
            values: form.values,
            editing: Boolean(form.values.id),
            isSelf: form.values.id === this.myId,
            error: form.error,
            busy: form.busy,
            onInput: h.onInput,
            onSubmit: h.onSubmit,
            onCancel: h.onCancel,
          }),
      );
      mount(
        getSlot(this.page, 'list'),
        list.error
          ? el('p', { class: 'o-data-table__empty', role: 'alert' }, list.error)
          : DataTable({
              caption: 'Users',
              loading: list.loading && !list.items.length,
              rows: list.items,
              columns: [
                { label: 'Name', render: (u) => u.name },
                { label: 'Email', render: (u) => u.email },
                { label: 'Role', render: (u) => (u.role === 'admin' ? 'Administrator' : 'Teacher') },
                { label: 'Active', render: (u) => (u.active ? 'Yes' : 'No') },
                { label: 'Last login', render: (u) => formatDate(u.lastLoginAt) || 'Never' },
                {
                  label: 'Actions',
                  render: (u) => Button({ label: 'Edit', variant: 'ghost', icon: Icon({ name: 'edit' }), ariaLabel: `Edit ${u.name}`, onClick: () => h.onEdit(u) }),
                },
              ],
            }),
      );
    });
  }
}
