import { el, mount, getSlot, preserveFocus } from '../../../shared/js/core/dom.js';
import { Button } from '../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../shared/js/components/atoms/Icon.js';
import { DifficultyBadge } from '../../../shared/js/components/atoms/DifficultyBadge.js';
import { DIFFICULTIES } from '../../../shared/js/core/difficulty.js';
import { ListLayout } from '../components/templates/ListLayout.js';
import { PageHeader } from '../components/molecules/PageHeader.js';
import { ListFilters } from '../components/organisms/ListFilters.js';
import { DataTable } from '../components/organisms/DataTable.js';
import { NewAssignmentForm } from '../components/organisms/NewAssignmentForm.js';
import { StatusBadge } from '../components/atoms/StatusBadge.js';
import { Link } from '../components/atoms/Link.js';
import { formatEdited } from '../format.js';

/** The assignments page: filters, the table, and the "new assignment" panel. */
export class AssignmentListView {
  /**
   * @param {HTMLElement} slot
   * @param {{list: import('../models/ListModel.js').ListModel, modules: import('../models/ListModel.js').ListModel,
   *          users: import('../models/ListModel.js').ListModel, form: import('../models/FormModel.js').FormModel}} models
   * @param {{onFilter: Function, onNew: Function, onInput: Function, onCreate: Function, onCancel: Function}} handlers
   */
  constructor(slot, models, handlers) {
    this.models = models;
    this.handlers = handlers;
    this.page = ListLayout();
    mount(slot, this.page);
    for (const model of Object.values(models)) model.on('change', () => this.render());
  }

  render() {
    const { list, modules, users, form } = this.models;
    const h = this.handlers;
    const moduleNames = Object.fromEntries(modules.items.map((m) => [m.key, m.name]));
    const f = list.filters;

    preserveFocus(() => {
      mount(
        getSlot(this.page, 'header'),
        PageHeader({
          title: 'Assignments',
          actions: [Button({ id: 'new-assignment', label: 'New assignment', icon: Icon({ name: 'plus' }), onClick: h.onNew, disabled: form.open })],
        }),
      );
      mount(
        getSlot(this.page, 'panel'),
        form.open &&
          NewAssignmentForm({ modules: modules.items, values: form.values, error: form.error, busy: form.busy, onInput: h.onInput, onSubmit: h.onCreate, onCancel: h.onCancel }),
      );
      mount(
        getSlot(this.page, 'filters'),
        ListFilters({
          onChange: h.onFilter,
          filters: [
            { id: 'q', type: 'search', label: 'Search', value: f.q ?? '' },
            { id: 'author', type: 'select', label: 'Author', value: f.author ?? '', options: authorOptions(users.items) },
            { id: 'module', type: 'select', label: 'Module', value: f.module ?? '', options: [{ value: '', label: 'All modules' }, ...modules.items.map((m) => ({ value: m.key, label: m.name }))] },
            { id: 'difficulty', type: 'select', label: 'Difficulty', value: f.difficulty ?? '', options: [{ value: '', label: 'All difficulties' }, ...DIFFICULTIES] },
            { id: 'status', type: 'select', label: 'Status', value: f.status ?? '', options: STATUS_FILTER },
          ],
        }),
      );
      mount(
        getSlot(this.page, 'list'),
        list.error
          ? el('p', { class: 'o-data-table__empty', role: 'alert' }, list.error)
          : DataTable({
              caption: 'Assignments',
              loading: list.loading && !list.items.length,
              emptyText: 'No assignments match. Create one with “New assignment”.',
              rows: list.items,
              columns: [
                { label: 'Title', render: (a) => Link({ href: `#/assignments/${a.id}`, label: a.title }) },
                { label: 'Module', render: (a) => moduleNames[a.module] ?? a.module },
                { label: 'Difficulty', render: (a) => DifficultyBadge({ difficulty: a.difficulty, compact: true }) },
                { label: 'Status', render: (a) => StatusBadge({ status: a.status }) },
                { label: 'Author', render: (a) => a.author?.name ?? '' },
                { label: 'Last edited', render: (a) => formatEdited(a.updatedBy, a.updatedAt) },
                { label: 'Attempts', className: 'is-number', render: (a) => String(a.attempts) },
              ],
            }),
      );
    });
  }
}

export const STATUS_FILTER = [
  { value: '', label: 'Draft and published' },
  { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'all', label: 'All, also archived' },
];

/** "Everyone", "Mine", then each teacher. */
export function authorOptions(users) {
  return [{ value: '', label: 'Everyone' }, { value: 'me', label: 'Mine' }, ...users.map((u) => ({ value: String(u.id), label: u.name }))];
}
