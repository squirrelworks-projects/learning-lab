import { EventEmitter } from '../../../shared/js/core/EventEmitter.js';
import { api } from '../../../shared/js/core/api.js';

/**
 * A list from the API (assignments, courses, users, modules) and its filters. Emits 'change'.
 * Filters are sent as query parameters; empty filters are left out.
 */
export class ListModel extends EventEmitter {
  /** @type {Object[]} */
  items = [];
  loading = false;
  /** @type {string|null} */
  error = null;
  #request = 0;

  /**
   * @param {string} path - API path, e.g. 'assignments'
   * @param {string} key - the list's key in the response, e.g. 'assignments'
   * @param {Object<string, string>} [filters] - initial filter values
   */
  constructor(path, key, filters = {}) {
    super();
    this.path = path;
    this.key = key;
    this.filters = { ...filters };
  }

  async load() {
    const request = ++this.#request;
    this.loading = true;
    this.error = null;
    this.emit('change');
    try {
      const data = await api.get(this.path, this.filters);
      if (request !== this.#request) return; // a newer load has started
      this.items = data[this.key];
    } catch (error) {
      if (request !== this.#request) return;
      this.error = error.message;
    }
    this.loading = false;
    this.emit('change');
  }

  /** Change one filter. Call load() afterwards. */
  setFilter(name, value) {
    this.filters[name] = value;
  }
}
