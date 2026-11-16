import { RecordModel } from '../models/RecordModel.js';
import { ListModel } from '../models/ListModel.js';
import { FormModel } from '../models/FormModel.js';
import { CourseEditView } from '../views/CourseEditView.js';
import { api } from '../../../shared/js/core/api.js';

/** Editing one course: its fields and the ordered list of assignments (from any module). */
export class CourseEditController {
  /**
   * @param {HTMLElement} slot
   * @param {import('./AppController.js').AdminContext} ctx
   * @param {number} id
   */
  constructor(slot, ctx, id) {
    this.ctx = ctx;
    this.id = id;
    this.model = new RecordModel();
    this.assignments = new ListModel('assignments', 'assignments');
    this.picker = new FormModel({ query: '', difficulty: '' });
    this.view = new CourseEditView(
      slot,
      { record: this.model, assignments: this.assignments, picker: this.picker },
      { playUrl: (publicId) => ctx.playUrl('c', publicId), moduleNames: () => ctx.moduleNames() },
      {
        onField: (field, value) => this.model.set(field, value, { silent: field === 'title' || field === 'description' }),
        onSave: () => this.#save(),
        onDelete: () => this.#delete(),
        onCopy: (text) => ctx.copy(text),
        onReload: () => this.init(),
        onMove: (index, direction) => this.#move(index, direction),
        onRemove: (index) => {
          this.model.record.items.splice(index, 1);
          this.model.touch();
        },
        onAdd: (id) => this.#add(id),
        onPickerInput: (field, value) => this.picker.set(field, value, { silent: false }),
      },
    );
  }

  canLeave() {
    return !this.model.dirty || confirm('You have unsaved changes. Leave without saving?');
  }

  destroy() {}

  async init() {
    this.view.render();
    try {
      const [{ course }] = await Promise.all([api.get(`courses/${this.id}`), this.assignments.load()]);
      this.model.load(this.#fromApi(course));
    } catch (error) {
      this.model.fail(error.message);
    }
  }

  /** Flatten items to the assignment summaries the view and the PUT need. */
  #fromApi(course) {
    return { ...course, items: course.items.map((i) => ({ ...i.assignment, attempts: i.attempts })) };
  }

  #move(index, direction) {
    const items = this.model.record.items;
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    this.model.touch();
    // keep keyboard focus on the moved item's button
    requestAnimationFrame(() => document.getElementById(`item-${direction < 0 ? 'up' : 'down'}-${items[target].id}`)?.focus());
  }

  #add(id) {
    const assignment = this.assignments.items.find((a) => a.id === id);
    if (!assignment) return;
    this.model.record.items.push({ ...assignment, attempts: 0 });
    this.model.touch();
  }

  async #save() {
    const c = this.model.record;
    if (!c.title.trim()) return this.model.setSaveError('The course needs a title.', { fieldErrors: { title: 'Enter a title.' } });
    this.model.setSaving(true);
    try {
      const { course } = await api.put(`courses/${this.id}`, {
        title: c.title,
        description: c.description,
        status: c.status,
        items: c.items.map((i) => i.id),
        version: c.version,
      });
      this.model.load(this.#fromApi(course));
      const hidden = course.status === 'published' ? course.items.filter((i) => i.assignment.status !== 'published').length : 0;
      this.ctx.shell.toast(hidden ? `Saved. ${hidden} assignment(s) are not published, so students won’t see them.` : 'Saved.', hidden ? 'info' : 'success');
    } catch (error) {
      if (error.code === 'conflict') return this.model.setSaveError(error.message, { conflict: error.details });
      const field = error.details?.field;
      this.model.setSaveError(error.message, { fieldErrors: field ? { [field]: error.message } : {} });
    }
  }

  async #delete() {
    if (!confirm(`Delete the course “${this.model.record.title}”? The assignments in it are kept.`)) return;
    try {
      await api.delete(`courses/${this.id}`);
      this.ctx.shell.toast('Course deleted.');
      this.ctx.router.forceGo('#/courses');
    } catch (error) {
      this.ctx.shell.toast(error.message, 'error');
    }
  }
}
