import { mount } from '../../../../shared/js/core/dom.js';
import { Sidebar } from '../../components/organisms/Sidebar.js';

/** Renders the Sidebar organism from TermsModel. */
export class SidebarView {
  #error = null;

  /**
   * @param {HTMLElement} slot
   * @param {import('../models/TermsModel.js').TermsModel} terms
   * @param {{instructions: string}} options
   * @param {{onSubjectChange: Function, onTermDragStart: Function, onTermActivate: Function}} handlers
   */
  constructor(slot, terms, options, handlers) {
    this.slot = slot;
    this.terms = terms;
    this.options = options;
    this.handlers = handlers;
    terms.on('change', () => this.render());
  }

  showError(message) {
    this.#error = message;
    this.render();
  }

  render() {
    const focusedId = document.activeElement?.id;
    mount(
      this.slot,
      Sidebar({
        subjects: this.terms.subjects,
        activeId: this.terms.activeSubjectId,
        terms: this.terms.activeTerms,
        error: this.#error,
        instructions: this.options.instructions,
        ...this.handlers,
      }),
    );
    // keep keyboard focus on the subject picker after re-render
    if (focusedId) this.slot.querySelector(`#${CSS.escape(focusedId)}`)?.focus();
  }
}
