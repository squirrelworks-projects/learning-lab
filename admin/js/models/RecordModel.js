import { EventEmitter } from '../../../shared/js/core/EventEmitter.js';

/**
 * The assignment or course being edited: its data, whether it has unsaved changes,
 * and the save state. Emits 'change' (not on every keystroke – see set()).
 */
export class RecordModel extends EventEmitter {
  /** @type {Object|null} */
  record = null;
  /** @type {'loading'|'ready'|'error'} */
  status = 'loading';
  dirty = false;
  saving = false;
  /** @type {string|null} load or save error */
  error = null;
  /** @type {Object<string, string>} field → message from the API */
  fieldErrors = {};
  /** @type {{updatedBy: string, updatedAt: string}|null} set when someone else saved first */
  conflict = null;
  /** @type {string[]} problems found by the module's schema.validate(); block publishing */
  validation = [];

  load(record) {
    this.record = record;
    this.status = 'ready';
    this.dirty = false;
    this.saving = false;
    this.error = null;
    this.fieldErrors = {};
    this.conflict = null;
    this.emit('change');
  }

  fail(message) {
    this.status = 'error';
    this.error = message;
    this.emit('change');
  }

  /**
   * Change one field. Text fields pass silent so the page isn't re-rendered while typing;
   * 'change' is still emitted the first time the record becomes dirty (to show "Unsaved changes").
   */
  set(field, value, { silent = false } = {}) {
    this.record[field] = value;
    delete this.fieldErrors[field];
    const becameDirty = !this.dirty;
    this.dirty = true;
    if (!silent || becameDirty) this.emit('change');
  }

  /** Re-render after a change made directly on `record` (e.g. reordering a list). */
  touch() {
    this.dirty = true;
    this.emit('change');
  }

  /** Emits only when the list of problems changed. */
  setValidation(messages) {
    if (JSON.stringify(messages) === JSON.stringify(this.validation)) return;
    this.validation = messages;
    this.emit('change');
  }

  setSaving(saving) {
    this.saving = saving;
    if (saving) this.error = null;
    this.emit('change');
  }

  /** A save failed. */
  setSaveError(message, { fieldErrors = {}, conflict = null } = {}) {
    this.saving = false;
    this.error = message;
    this.fieldErrors = fieldErrors;
    this.conflict = conflict;
    this.emit('change');
  }
}
