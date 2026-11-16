/**
 * Hash router for the admin: #/assignments, #/assignments/12, … Not a component.
 * A page can refuse to be left (unsaved changes) through `guard`.
 */

const ROUTES = [
  ['assignments', /^\/assignments$/],
  ['assignment', /^\/assignments\/(?<id>\d+)$/],
  ['courses', /^\/courses$/],
  ['course', /^\/courses\/(?<id>\d+)$/],
  ['users', /^\/users$/],
  ['profile', /^\/profile$/],
];

/** @typedef {{name: string, params: Object<string, string>, query: URLSearchParams}} Route */

export class Router {
  /** @type {(() => boolean)|null} return false to stay on the page */
  guard = null;
  #current = '';
  #ignoreNext = false;

  /** @param {(route: Route) => void} onRoute */
  constructor(onRoute) {
    this.onRoute = onRoute;
    window.addEventListener('hashchange', () => this.#onHashChange());
  }

  start() {
    this.#onHashChange();
  }

  /** Go to a hash like '#/assignments/3'. */
  go(hash) {
    if (location.hash === hash) this.#onHashChange();
    else location.hash = hash;
  }

  /** Leave the page without asking (e.g. after deleting). */
  forceGo(hash) {
    this.guard = null;
    this.go(hash);
  }

  #onHashChange() {
    if (this.#ignoreNext) {
      this.#ignoreNext = false;
      return;
    }
    if (this.guard && location.hash !== this.#current && !this.guard()) {
      this.#ignoreNext = true;
      location.hash = this.#current;
      return;
    }
    const [path, search = ''] = (location.hash.slice(1) || '/assignments').split('?');
    for (const [name, regex] of ROUTES) {
      const match = path.match(regex);
      if (match) {
        this.#current = location.hash;
        this.guard = null;
        this.onRoute({ name, params: match.groups ?? {}, query: new URLSearchParams(search) });
        return;
      }
    }
    this.go('#/assignments');
  }
}
