import { mount, getSlot } from '../../../../shared/js/core/dom.js';
import { WorkspaceLayout } from '../../components/templates/WorkspaceLayout.js';
import { SidebarView } from './SidebarView.js';
import { ToolbarView } from './ToolbarView.js';
import { StageView } from './StageView.js';

/** Mounts the WorkspaceLayout template and creates one view per slot. */
export class AppView {
  /**
   * @param {HTMLElement} root
   * @param {{terms, screenshot, stickers}} models
   * @param {{title: string, instructions: string, allowOwnImage: boolean}} options - from the assignment
   * @param {Object} handlers - all controller callbacks, passed through to the sub-views
   */
  constructor(root, { terms, screenshot, stickers }, options, handlers) {
    const page = WorkspaceLayout();
    mount(root, page);

    this.sidebar = new SidebarView(getSlot(page, 'sidebar'), terms, options, handlers);
    this.toolbar = new ToolbarView(getSlot(page, 'toolbar'), screenshot, stickers, options, handlers);
    this.stage = new StageView(getSlot(page, 'stage'), screenshot, stickers, options, handlers);
  }

  render() {
    this.sidebar.render();
    this.toolbar.render();
    this.stage.render();
  }
}
