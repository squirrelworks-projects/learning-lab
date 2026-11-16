import { mount, getSlot, preserveFocus } from '../../../../shared/js/core/dom.js';
import { EditorLayout } from '../../components/templates/EditorLayout.js';
import { EditorGeneral } from '../../components/organisms/EditorGeneral.js';
import { EditorImages } from '../../components/organisms/EditorImages.js';
import { EditorSubjects } from '../../components/organisms/EditorSubjects.js';

/** Renders the Match Word editor from EditorModel. Re-renders on 'change' (not while typing). */
export class EditorView {
  /**
   * @param {HTMLElement} root
   * @param {import('../models/EditorModel.js').EditorModel} model
   * @param {(src: string) => string} assetUrl
   * @param {Object} handlers - see EditorController
   */
  constructor(root, model, assetUrl, handlers) {
    Object.assign(this, { model, assetUrl, handlers });
    this.page = EditorLayout();
    mount(root, this.page);
    model.on('change', () => this.render());
  }

  render() {
    const { config, library, uploading, uploadError } = this.model;
    const h = this.handlers;
    preserveFocus(() => {
      mount(getSlot(this.page, 'general'), EditorGeneral({ ...config, onInstructions: h.onInstructions, onAllowOwnImage: h.onAllowOwnImage }));
      mount(
        getSlot(this.page, 'images'),
        EditorImages({
          images: config.images,
          library,
          uploading,
          uploadError,
          assetUrl: this.assetUrl,
          onUpload: h.onUpload,
          onAddFromLibrary: h.onAddFromLibrary,
          onTitle: h.onImageTitle,
          onMove: h.onImageMove,
          onRemove: h.onImageRemove,
        }),
      );
      mount(
        getSlot(this.page, 'subjects'),
        EditorSubjects({
          subjects: config.subjects,
          onName: h.onSubjectName,
          onTerm: h.onTerm,
          onAddTerm: h.onAddTerm,
          onRemoveTerm: h.onRemoveTerm,
          onMove: h.onSubjectMove,
          onRemove: h.onSubjectRemove,
          onAdd: h.onAddSubject,
        }),
      );
    });
  }
}
