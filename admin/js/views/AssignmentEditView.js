import { el, mount, getSlot, preserveFocus } from '../../../shared/js/core/dom.js';
import { Button } from '../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../shared/js/components/atoms/Icon.js';
import { DifficultyBadge } from '../../../shared/js/components/atoms/DifficultyBadge.js';
import { Message } from '../../../shared/js/components/molecules/Message.js';
import { EditLayout } from '../components/templates/EditLayout.js';
import { PageHeader } from '../components/molecules/PageHeader.js';
import { MetaList } from '../components/molecules/MetaList.js';
import { ErrorList } from '../components/molecules/ErrorList.js';
import { AssignmentMetaForm } from '../components/organisms/AssignmentMetaForm.js';
import { EmbedPanel } from '../components/organisms/EmbedPanel.js';
import { StatusBadge } from '../components/atoms/StatusBadge.js';
import { Link } from '../components/atoms/Link.js';
import { formatEdited } from '../format.js';

/**
 * The assignment edit page. Renders the header, the platform fields and the side panel from a RecordModel.
 * The `body` slot belongs to the module's editor and is never re-rendered here.
 */
export class AssignmentEditView {
  /**
   * @param {HTMLElement} slot
   * @param {import('../models/RecordModel.js').RecordModel} model
   * @param {{playUrl: (publicId: string) => string, moduleName: (key: string) => string}} helpers
   * @param {{onField, onSave, onDuplicate, onDelete, onCopy, onReload}} handlers
   */
  constructor(slot, model, helpers, handlers) {
    Object.assign(this, { slot, model, helpers, handlers });
    this.page = EditLayout();
    mount(slot, this.page);
    this.bodySlot = getSlot(this.page, 'body');
    model.on('change', () => this.render());
  }

  render() {
    const { status, record: a, dirty, saving, error, fieldErrors, conflict, validation } = this.model;
    const h = this.handlers;
    const back = Link({ href: '#/assignments', label: 'All assignments', icon: Icon({ name: 'left' }) });

    if (status !== 'ready') {
      mount(getSlot(this.page, 'header'), PageHeader({ title: status === 'loading' ? 'Loading…' : 'Could not open the assignment', before: back }));
      mount(getSlot(this.page, 'form'), status === 'error' && Message({ title: 'Something went wrong', text: error, variant: 'error' }));
      return;
    }

    preserveFocus(() => {
      mount(
        getSlot(this.page, 'header'),
        PageHeader({
          title: a.title || 'Untitled assignment',
          before: back,
          badges: [DifficultyBadge({ difficulty: a.difficulty }), StatusBadge({ status: a.status }), dirty && el('span', { class: 'o-unsaved' }, 'Unsaved changes')],
          actions: [
            Button({ id: 'save', label: saving ? 'Saving…' : 'Save', icon: Icon({ name: 'check' }), disabled: saving || !dirty, onClick: h.onSave }),
            Button({ id: 'duplicate', label: 'Duplicate', variant: 'ghost', icon: Icon({ name: 'copy' }), onClick: h.onDuplicate }),
            Button({ id: 'delete', label: 'Delete', variant: 'ghost', icon: Icon({ name: 'trash' }), onClick: h.onDelete }),
          ],
        }),
      );
      mount(
        getSlot(this.page, 'form'),
        conflict &&
          Message({
            title: 'Someone else saved this assignment',
            text: `${conflict.updatedBy} saved it while you were editing. Reload to get their version (your changes here will be lost).`,
            variant: 'error',
            action: Button({ label: 'Reload', onClick: h.onReload }),
          }),
        !conflict && error && el('p', { class: 'o-save-error', role: 'alert' }, error),
        ErrorList({ title: a.status === 'published' ? 'Fix these before saving as published:' : 'Fix these before you publish:', errors: validation, variant: a.status === 'published' ? 'error' : 'warning' }),
        AssignmentMetaForm({ record: a, moduleName: this.helpers.moduleName(a.module), errors: fieldErrors, onField: h.onField }),
      );
      mount(
        getSlot(this.page, 'side'),
        EmbedPanel({ url: this.helpers.playUrl(a.publicId), title: a.title, published: a.status === 'published', onCopy: h.onCopy }),
        MetaList({
          items: [
            { label: 'Author', value: a.author?.name },
            { label: 'Last edited', value: formatEdited(a.updatedBy, a.updatedAt) },
            { label: 'Attempts', value: String(a.attempts) },
            { label: 'Used in', value: a.usedIn.length ? el('span', {}, a.usedIn.map((c, i) => [i > 0 && ', ', Link({ href: `#/courses/${c.id}`, label: c.title })])) : 'No courses' },
          ],
        }),
      );
    });
  }
}
