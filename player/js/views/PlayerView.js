import { mount, getSlot } from '../../../shared/js/core/dom.js';
import { Message } from '../../../shared/js/components/molecules/Message.js';
import { PlayerLayout } from '../components/templates/PlayerLayout.js';
import { CourseNav } from '../components/organisms/CourseNav.js';
import { PreviewNotice } from '../components/molecules/PreviewNotice.js';

/**
 * Renders the header and the loading/error message from PlayerModel.
 * The `module` slot is never re-rendered here: the running module owns it.
 */
export class PlayerView {
  /**
   * @param {HTMLElement} root
   * @param {import('../models/PlayerModel.js').PlayerModel} model
   * @param {{onSelectItem: (index: number) => void}} handlers
   */
  constructor(root, model, handlers) {
    this.model = model;
    this.handlers = handlers;
    const page = PlayerLayout();
    mount(root, page);
    this.header = getSlot(page, 'header');
    this.message = getSlot(page, 'message');
    this.moduleSlot = getSlot(page, 'module');
    model.on('change', () => this.render());
  }

  render() {
    const { status, error, course, items, index, assignment } = this.model;
    const focusedId = document.activeElement?.id;

    const preview = (course && course.status !== 'published') || (assignment && assignment.status !== 'published');
    mount(
      this.header,
      preview && PreviewNotice(),
      course && items.length > 0 && CourseNav({ title: course.title, items, index, onSelect: this.handlers.onSelectItem }),
    );
    this.header.hidden = !this.header.childElementCount;

    mount(
      this.message,
      status === 'loading' && Message({ title: 'Loading…', variant: 'loading' }),
      status === 'error' && Message({ title: error.title, text: error.text, variant: 'error' }),
    );
    this.message.hidden = status === 'ready';
    this.moduleSlot.hidden = status !== 'ready';

    if (focusedId) this.header.querySelector(`#${CSS.escape(focusedId)}`)?.focus();
  }
}
