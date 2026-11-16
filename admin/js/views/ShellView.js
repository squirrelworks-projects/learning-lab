import { mount, getSlot, preserveFocus } from '../../../shared/js/core/dom.js';
import { AdminLayout } from '../components/templates/AdminLayout.js';
import { CenteredLayout } from '../components/templates/CenteredLayout.js';
import { AppHeader } from '../components/organisms/AppHeader.js';
import { Toast } from '../components/molecules/Toast.js';

const TOAST_MS = 4000;

/**
 * The frame around every admin page: AdminLayout with the AppHeader when logged in,
 * CenteredLayout for login and setup. Pages render into `main`. Also shows toasts.
 */
export class ShellView {
  #layout = null;
  #section = 'assignments';
  #toast = null;
  #toastTimer = null;

  /**
   * @param {HTMLElement} root
   * @param {import('../models/SessionModel.js').SessionModel} session
   * @param {{onLogout: () => void}} handlers
   */
  constructor(root, session, handlers) {
    this.root = root;
    this.session = session;
    this.handlers = handlers;
    session.on('change', () => this.renderHeader());
  }

  /**
   * Prepare an empty page area and return it.
   * @param {'admin'|'centered'} layout
   * @param {string} [section] - highlighted in the navigation
   * @returns {HTMLElement} the `main` slot
   */
  page(layout, section = this.#section) {
    this.#section = section;
    if (this.#layout !== layout) {
      this.#layout = layout;
      this.page$ = layout === 'admin' ? AdminLayout() : CenteredLayout();
      mount(this.root, this.page$);
    }
    this.renderHeader();
    const main = getSlot(this.page$, 'main');
    main.replaceChildren();
    window.scrollTo(0, 0);
    return main;
  }

  renderHeader() {
    const header = this.page$ && getSlot(this.page$, 'header');
    if (!header || !this.session.user) return;
    preserveFocus(() => mount(header, AppHeader({ user: this.session.user, current: this.#section, onLogout: this.handlers.onLogout })));
  }

  /**
   * @param {string} message
   * @param {'success'|'error'|'info'} [variant='success']
   */
  toast(message, variant = 'success') {
    clearTimeout(this.#toastTimer);
    this.#toast = { message, variant };
    this.#renderToast();
    if (variant !== 'error') this.#toastTimer = setTimeout(() => this.#closeToast(), TOAST_MS);
  }

  #closeToast() {
    this.#toast = null;
    this.#renderToast();
  }

  #renderToast() {
    const slot = this.page$ && (getSlot(this.page$, 'toast') ?? null);
    const target = slot ?? this.root;
    if (!slot) return;
    mount(target, this.#toast && Toast({ ...this.#toast, onClose: () => this.#closeToast() }));
  }
}
