import { EventEmitter } from '../../../shared/js/core/EventEmitter.js';

/**
 * Values of a small form (login, new assignment, user, profile), plus busy and error state.
 * Typing updates values silently, so the form isn't re-rendered on every keystroke. Emits 'change'.
 */
export class FormModel extends EventEmitter {
  busy = false;
  /** @type {string|null} */
  error = null;
  /** @type {boolean} whether the form is shown (for forms that open in a panel) */
  open = false;

  /** @param {Object} values - initial values */
  constructor(values = {}) {
    super();
    this.initial = { ...values };
    this.values = { ...values };
  }

  /** @param {{silent?: boolean}} [options] - silent: don't re-render (text typing) */
  set(field, value, { silent = true } = {}) {
    this.values[field] = value;
    if (!silent) this.emit('change');
  }

  /** Open the form with these values (or the initial ones). */
  show(values = this.initial) {
    this.values = { ...this.initial, ...values };
    this.error = null;
    this.busy = false;
    this.open = true;
    this.emit('change');
  }

  hide() {
    this.open = false;
    this.error = null;
    this.emit('change');
  }

  setBusy(busy) {
    this.busy = busy;
    if (busy) this.error = null;
    this.emit('change');
  }

  setError(message) {
    this.error = message;
    this.busy = false;
    this.emit('change');
  }
}
