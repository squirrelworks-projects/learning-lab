import { EventEmitter } from '../../../shared/js/core/EventEmitter.js';
import { api } from '../../../shared/js/core/api.js';

/**
 * Who is logged in. Keeps the CSRF token in the API client up to date. Emits 'change'.
 */
export class SessionModel extends EventEmitter {
  /** @type {{id: number, name: string, email: string, role: 'teacher'|'admin'}|null} */
  user = null;
  /** true while there are no users at all (first-time setup) */
  setupNeeded = false;
  /** @type {'unknown'|'anonymous'|'authenticated'} */
  status = 'unknown';

  async load() {
    this.#apply(await api.get('auth/me'));
  }

  async login(email, password) {
    this.#apply(await api.post('auth/login', { email, password }));
  }

  async setup(values) {
    this.#apply(await api.post('setup', values));
  }

  async logout() {
    await api.post('auth/logout').catch(() => {});
    this.#apply({ user: null, setupNeeded: false });
  }

  /** After the teacher changed their own name or email. */
  setUser(user) {
    this.user = user;
    this.emit('change');
  }

  get isAdmin() {
    return this.user?.role === 'admin';
  }

  #apply({ user, csrf, setupNeeded }) {
    this.user = user ?? null;
    this.setupNeeded = Boolean(setupNeeded);
    this.status = this.user ? 'authenticated' : 'anonymous';
    api.setCsrf(csrf ?? '');
    this.emit('change');
  }
}
