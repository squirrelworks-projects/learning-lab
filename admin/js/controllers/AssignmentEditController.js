import { RecordModel } from '../models/RecordModel.js';
import { AssignmentEditView } from '../views/AssignmentEditView.js';
import { api, siteUrl } from '../../../shared/js/core/api.js';

/**
 * Editing one assignment. The platform fields are edited here; the module's own data is edited by the
 * module's editor.js, which runs in the page's `body` slot and reports every change through onChange.
 */
export class AssignmentEditController {
  /** @type {{destroy: () => void}|null} */
  #editor = null;
  #schema = null;

  /**
   * @param {HTMLElement} slot
   * @param {import('./AppController.js').AdminContext} ctx
   * @param {number} id
   */
  constructor(slot, ctx, id) {
    this.ctx = ctx;
    this.id = id;
    this.model = new RecordModel();
    this.view = new AssignmentEditView(
      slot,
      this.model,
      { playUrl: (publicId) => ctx.playUrl('a', publicId), moduleName: (key) => ctx.moduleName(key) },
      {
        onField: (field, value) => this.model.set(field, value, { silent: field === 'title' || field === 'description' }),
        onSave: () => this.#save(),
        onDuplicate: () => this.#duplicate(),
        onDelete: () => this.#delete(),
        onCopy: (text) => ctx.copy(text),
        onReload: () => this.init(),
      },
    );
  }

  /** Ask before leaving with unsaved changes. */
  canLeave() {
    return !this.model.dirty || confirm('You have unsaved changes. Leave without saving?');
  }

  destroy() {
    this.#editor?.destroy();
    this.#editor = null;
  }

  async init() {
    this.destroy();
    this.view.bodySlot.replaceChildren();
    this.view.render();
    try {
      const { assignment } = await api.get(`assignments/${this.id}`);
      const { schema, editor } = await this.ctx.loadModule(assignment.module, { editor: true });
      this.#schema = schema;
      const config = schema.migrate(assignment.config, assignment.schemaVersion);
      this.model.load({ ...assignment, config, schemaVersion: schema.SCHEMA_VERSION });
      this.#validate();
      this.#editor = editor.mountEditor(this.view.bodySlot, config, {
        onChange: (next) => {
          this.model.set('config', next, { silent: true });
          this.#validate();
        },
        uploadImage: async (file) => (await api.upload('media', file)).media,
        listMedia: async () => (await api.get('media')).media,
        assetUrl: siteUrl,
      });
    } catch (error) {
      console.error(error);
      this.model.fail(error.message);
    }
  }

  #validate() {
    this.model.setValidation(this.#schema.validate(this.model.record.config).map((e) => e.message));
  }

  async #save() {
    const a = this.model.record;
    if (a.status === 'published' && this.model.validation.length) {
      return this.model.setSaveError('This assignment can’t be published yet. Fix the problems listed, or save it as a draft.');
    }
    if (!a.title.trim()) return this.model.setSaveError('The assignment needs a title.', { fieldErrors: { title: 'Enter a title.' } });
    this.model.setSaving(true);
    try {
      const { assignment } = await api.put(`assignments/${this.id}`, {
        title: a.title,
        description: a.description,
        difficulty: a.difficulty,
        status: a.status,
        schemaVersion: a.schemaVersion,
        config: a.config,
        version: a.version,
      });
      // Keep the editor's config object; take everything else (version, updatedBy, …) from the server.
      this.model.load({ ...assignment, config: a.config });
      this.#validate();
      this.ctx.shell.toast('Saved.');
    } catch (error) {
      this.#saveFailed(error);
    }
  }

  async #duplicate() {
    if (this.model.dirty && !confirm('The copy is made from the last saved version. Continue without your unsaved changes?')) return;
    try {
      const { assignment } = await api.post(`assignments/${this.id}/duplicate`);
      this.ctx.shell.toast('Copy created as a draft. You are now editing the copy.');
      this.ctx.router.forceGo(`#/assignments/${assignment.id}`);
    } catch (error) {
      this.ctx.shell.toast(error.message, 'error');
    }
  }

  async #delete() {
    const { title, usedIn } = this.model.record;
    if (usedIn.length) {
      return this.ctx.shell.toast(`“${title}” is used in ${usedIn.map((c) => `“${c.title}”`).join(', ')}. Remove it from the course first, or set its status to Archived.`, 'error');
    }
    if (!confirm(`Delete “${title}”? This can’t be undone.`)) return;
    try {
      await api.delete(`assignments/${this.id}`);
      this.ctx.shell.toast('Assignment deleted.');
      this.ctx.router.forceGo('#/assignments');
    } catch (error) {
      this.ctx.shell.toast(error.message, 'error');
    }
  }

  #saveFailed(error) {
    if (error.code === 'conflict') return this.model.setSaveError(error.message, { conflict: error.details });
    const field = error.details?.field;
    this.model.setSaveError(error.message, { fieldErrors: field ? { [field]: error.message } : {} });
  }
}
