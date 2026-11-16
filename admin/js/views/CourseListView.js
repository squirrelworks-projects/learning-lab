import { el, mount, getSlot, preserveFocus } from '../../../shared/js/core/dom.js';
import { Button } from '../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../shared/js/components/atoms/Icon.js';
import { ListLayout } from '../components/templates/ListLayout.js';
import { PageHeader } from '../components/molecules/PageHeader.js';
import { ListFilters } from '../components/organisms/ListFilters.js';
import { DataTable } from '../components/organisms/DataTable.js';
import { NewCourseForm } from '../components/organisms/NewCourseForm.js';
import { StatusBadge } from '../components/atoms/StatusBadge.js';
import { Link } from '../components/atoms/Link.js';
import { formatEdited } from '../format.js';
import { STATUS_FILTER, authorOptions } from './AssignmentListView.js';

/** The courses page: filters, the table, and the "new course" panel. */
export class CourseListView {
  /**
   * @param {HTMLElement} slot
   * @param {{list, users, form}} models - ListModel, ListModel, FormModel
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
    const { list, users, form } = this.models;
    const h = this.handlers;
    const f = list.filters;
    preserveFocus(() => {
      mount(
        getSlot(this.page, 'header'),
        PageHeader({
          title: 'Courses',
          actions: [Button({ id: 'new-course', label: 'New course', icon: Icon({ name: 'plus' }), onClick: h.onNew, disabled: form.open })],
        }),
      );
      mount(
        getSlot(this.page, 'panel'),
        form.open && NewCourseForm({ values: form.values, error: form.error, busy: form.busy, onInput: h.onInput, onSubmit: h.onCreate, onCancel: h.onCancel }),
      );
      mount(
        getSlot(this.page, 'filters'),
        ListFilters({
          onChange: h.onFilter,
          filters: [
            { id: 'q', type: 'search', label: 'Search', value: f.q ?? '' },
            { id: 'author', type: 'select', label: 'Author', value: f.author ?? '', options: authorOptions(users.items) },
            { id: 'status', type: 'select', label: 'Status', value: f.status ?? '', options: STATUS_FILTER },
          ],
        }),
      );
      mount(
        getSlot(this.page, 'list'),
        list.error
          ? el('p', { class: 'o-data-table__empty', role: 'alert' }, list.error)
          : DataTable({
              caption: 'Courses',
              loading: list.loading && !list.items.length,
              emptyText: 'No courses match. Create one with “New course”.',
              rows: list.items,
              columns: [
                { label: 'Title', render: (c) => Link({ href: `#/courses/${c.id}`, label: c.title }) },
                { label: 'Assignments', className: 'is-number', render: (c) => String(c.itemCount) },
                { label: 'Status', render: (c) => StatusBadge({ status: c.status }) },
                { label: 'Author', render: (c) => c.author?.name ?? '' },
                { label: 'Last edited', render: (c) => formatEdited(c.updatedBy, c.updatedAt) },
                { label: 'Attempts', className: 'is-number', render: (c) => String(c.attempts) },
              ],
            }),
      );
    });
  }
}
