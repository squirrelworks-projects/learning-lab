import { el, mount, getSlot, preserveFocus } from '../../../shared/js/core/dom.js';
import { Button } from '../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../shared/js/components/atoms/Icon.js';
import { Message } from '../../../shared/js/components/molecules/Message.js';
import { EditLayout } from '../components/templates/EditLayout.js';
import { PageHeader } from '../components/molecules/PageHeader.js';
import { MetaList } from '../components/molecules/MetaList.js';
import { CourseMetaForm } from '../components/organisms/CourseMetaForm.js';
import { CourseItemList } from '../components/organisms/CourseItemList.js';
import { AssignmentPicker } from '../components/organisms/AssignmentPicker.js';
import { EmbedPanel } from '../components/organisms/EmbedPanel.js';
import { StatusBadge } from '../components/atoms/StatusBadge.js';
import { Link } from '../components/atoms/Link.js';
import { formatEdited } from '../format.js';

/** The course edit page: fields, sharing, the ordered assignment list and the picker to add more. */
export class CourseEditView {
  /**
   * @param {HTMLElement} slot
   * @param {{record: import('../models/RecordModel.js').RecordModel, assignments: import('../models/ListModel.js').ListModel,
   *          picker: import('../models/FormModel.js').FormModel}} models
   * @param {{playUrl: Function, moduleNames: () => Object<string, string>}} helpers
   * @param {{onField, onSave, onDelete, onCopy, onReload, onMove, onRemove, onAdd, onPickerInput}} handlers
   */
  constructor(slot, models, helpers, handlers) {
    Object.assign(this, { models, helpers, handlers });
    this.page = EditLayout();
    mount(slot, this.page);
    for (const model of Object.values(models)) model.on('change', () => this.render());
  }

  render() {
    const { record: model, assignments, picker } = this.models;
    const { status, record: c, dirty, saving, error, fieldErrors, conflict } = model;
    const h = this.handlers;
    const back = Link({ href: '#/courses', label: 'All courses', icon: Icon({ name: 'left' }) });

    if (status !== 'ready') {
      mount(getSlot(this.page, 'header'), PageHeader({ title: status === 'loading' ? 'Loading…' : 'Could not open the course', before: back }));
      mount(getSlot(this.page, 'form'), status === 'error' && Message({ title: 'Something went wrong', text: error, variant: 'error' }));
      return;
    }

    const moduleNames = this.helpers.moduleNames();
    const inCourse = new Set(c.items.map((i) => i.id));
    preserveFocus(() => {
      mount(
        getSlot(this.page, 'header'),
        PageHeader({
          title: c.title || 'Untitled course',
          before: back,
          badges: [StatusBadge({ status: c.status }), dirty && el('span', { class: 'o-unsaved' }, 'Unsaved changes')],
          actions: [
            Button({ id: 'save', label: saving ? 'Saving…' : 'Save', icon: Icon({ name: 'check' }), disabled: saving || !dirty, onClick: h.onSave }),
            Button({ id: 'delete', label: 'Delete', variant: 'ghost', icon: Icon({ name: 'trash' }), onClick: h.onDelete }),
          ],
        }),
      );
      mount(
        getSlot(this.page, 'form'),
        conflict &&
          Message({
            title: 'Someone else saved this course',
            text: `${conflict.updatedBy} saved it while you were editing. Reload to get their version (your changes here will be lost).`,
            variant: 'error',
            action: Button({ label: 'Reload', onClick: h.onReload }),
          }),
        !conflict && error && el('p', { class: 'o-save-error', role: 'alert' }, error),
        CourseMetaForm({ record: c, errors: fieldErrors, onField: h.onField }),
      );
      mount(
        getSlot(this.page, 'side'),
        EmbedPanel({ url: this.helpers.playUrl(c.publicId), title: c.title, published: c.status === 'published', onCopy: h.onCopy }),
        MetaList({
          items: [
            { label: 'Author', value: c.author?.name },
            { label: 'Last edited', value: formatEdited(c.updatedBy, c.updatedAt) },
            { label: 'Attempts in this course', value: String(c.attempts) },
          ],
        }),
      );
      mount(
        getSlot(this.page, 'body'),
        el('h2', { class: 't-edit__section-title' }, `Assignments in this course (${c.items.length})`),
        CourseItemList({ items: c.items, moduleNames, onMove: h.onMove, onRemove: h.onRemove }),
        AssignmentPicker({
          assignments: assignments.items.filter((a) => !inCourse.has(a.id)),
          moduleNames,
          query: picker.values.query,
          difficulty: picker.values.difficulty,
          onQuery: (v) => h.onPickerInput('query', v),
          onDifficulty: (v) => h.onPickerInput('difficulty', v),
          onAdd: h.onAdd,
        }),
      );
    });
  }
}
