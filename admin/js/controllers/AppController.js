import { api, SITE_ROOT } from '../../../shared/js/core/api.js';
import { loadModule } from '../../../player/js/moduleLoader.js';
import { SessionModel } from '../models/SessionModel.js';
import { ListModel } from '../models/ListModel.js';
import { ShellView } from '../views/ShellView.js';
import { Router } from '../router.js';
import { LoginController } from './LoginController.js';
import { AssignmentListController } from './AssignmentListController.js';
import { AssignmentEditController } from './AssignmentEditController.js';
import { CourseListController } from './CourseListController.js';
import { CourseEditController } from './CourseEditController.js';
import { UserListController } from './UserListController.js';
import { ProfileController } from './ProfileController.js';

/**
 * @typedef {Object} AdminContext - what every page controller gets
 * @property {SessionModel} session
 * @property {ShellView} shell
 * @property {Router} router
 * @property {ListModel} modules - installed modules (GET /modules)
 * @property {ListModel} users - all teachers, for author filters
 * @property {{assignments: Object, courses: Object}} savedFilters - list filters kept while navigating
 * @property {(key: string, options?: {editor?: boolean}) => Promise<Object>} loadModule
 * @property {(key: string) => string} moduleName
 * @property {() => Object<string, string>} moduleNames
 * @property {(type: 'a'|'c', publicId: string) => string} playUrl
 * @property {(text: string) => void} copy - copy to the clipboard and confirm with a toast
 */

const PAGES = {
  assignments: { section: 'assignments', create: (slot, ctx) => new AssignmentListController(slot, ctx) },
  assignment: { section: 'assignments', create: (slot, ctx, p) => new AssignmentEditController(slot, ctx, Number(p.id)) },
  courses: { section: 'courses', create: (slot, ctx) => new CourseListController(slot, ctx) },
  course: { section: 'courses', create: (slot, ctx, p) => new CourseEditController(slot, ctx, Number(p.id)) },
  users: { section: 'users', admin: true, create: (slot, ctx) => new UserListController(slot, ctx) },
  profile: { section: 'profile', create: (slot, ctx) => new ProfileController(slot, ctx) },
};

/** Starts the admin: checks the session, shows login or the requested page, and switches pages on navigation. */
export class AppController {
  /** @type {{init: Function, destroy?: Function, canLeave?: Function}|null} */
  #page = null;
  #route = null;

  /** @param {HTMLElement} root */
  constructor(root) {
    this.session = new SessionModel();
    this.shell = new ShellView(root, this.session, { onLogout: () => this.#logout() });
    this.router = new Router((route) => this.#show(route));
    this.modules = new ListModel('modules', 'modules');
    this.users = new ListModel('users', 'users');

    /** @type {AdminContext} */
    this.ctx = {
      session: this.session,
      shell: this.shell,
      router: this.router,
      modules: this.modules,
      users: this.users,
      savedFilters: { assignments: {}, courses: {} },
      loadModule,
      moduleName: (key) => this.modules.items.find((m) => m.key === key)?.name ?? key,
      moduleNames: () => Object.fromEntries(this.modules.items.map((m) => [m.key, m.name])),
      playUrl: (type, publicId) => new URL(`play.html?${type}=${publicId}`, SITE_ROOT).href,
      copy: (text) =>
        navigator.clipboard
          .writeText(text)
          .then(() => this.shell.toast('Copied to the clipboard.'))
          .catch(() => this.shell.toast('Could not copy. Select the text and press Ctrl+C.', 'error')),
    };

    let wasAuthenticated = null; // null until the first answer from /auth/me
    this.session.on('change', () => {
      const authenticated = this.session.status === 'authenticated';
      if (authenticated === wasAuthenticated) return;
      wasAuthenticated = authenticated;
      if (authenticated) this.#afterLogin();
      else this.#showLogin();
    });
    window.addEventListener('beforeunload', (e) => {
      if (this.#page?.canLeave && this.#page.model?.dirty) e.preventDefault();
    });
  }

  async init() {
    try {
      await this.session.load();
    } catch (error) {
      this.shell.page('centered').append(document.createTextNode(`Could not reach the server: ${error.message}`));
    }
  }

  async #afterLogin() {
    await Promise.all([this.modules.load(), this.users.load()]);
    if (this.#route) this.#show(this.#route);
    else this.router.start();
  }

  #showLogin() {
    this.#stopPage();
    const slot = this.shell.page('centered');
    this.#page = new LoginController(slot, this.ctx);
    this.#page.init();
  }

  #show(route) {
    this.#route = route;
    if (this.session.status !== 'authenticated') return;
    let page = PAGES[route.name];
    if (page.admin && !this.session.isAdmin) page = PAGES.assignments;
    this.#stopPage();
    const slot = this.shell.page('admin', page.section);
    this.#page = page.create(slot, this.ctx, route.params);
    if (this.#page.canLeave) this.router.guard = () => this.#page.canLeave();
    this.#page.init();
  }

  #stopPage() {
    this.#page?.destroy?.();
    this.#page = null;
  }

  async #logout() {
    if (this.#page?.canLeave && !this.#page.canLeave()) return;
    this.router.guard = null;
    await this.session.logout();
  }
}
