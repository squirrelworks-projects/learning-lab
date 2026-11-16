import { EventEmitter } from '../../../../shared/js/core/EventEmitter.js';
import { newId } from '../../schema.js';

/**
 * The config being edited in the admin. Typing in a text field updates it silently ('input');
 * adding, removing and moving things emits 'change' so the editor re-renders. Both emit 'edit',
 * which the controller passes on to the admin.
 */
export class EditorModel extends EventEmitter {
  /** @type {{src: string, name: string}[]} uploaded images teachers can reuse */
  library = [];
  uploading = false;
  /** @type {string|null} */
  uploadError = null;

  /** @param {Object} config - a migrated config (see schema.js) */
  constructor(config) {
    super();
    this.config = structuredClone(config);
  }

  /** Set a value by path, e.g. setText(['subjects', 0, 'terms', 2, 'term'], '<nav>'). No re-render. */
  setText(path, value) {
    const key = path.at(-1);
    path.slice(0, -1).reduce((obj, k) => obj[k], this.config)[key] = value;
    this.emit('edit');
  }

  setAllowOwnImage(value) {
    this.config.allowOwnImage = value;
    this.#changed();
  }

  addImage(image) {
    this.config.images.push({ title: image.title ?? '', src: image.src });
    this.#changed();
  }

  /** Move or remove an item in a list (images, subjects, or one subject's terms). */
  move(list, index, direction) {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    this.#changed();
  }

  remove(list, index) {
    list.splice(index, 1);
    this.#changed();
  }

  addSubject() {
    this.config.subjects.push({ id: newId('s'), name: '', terms: [{ id: newId('t'), term: '', explanation: '' }] });
    this.#changed();
  }

  addTerm(subjectIndex) {
    this.config.subjects[subjectIndex].terms.push({ id: newId('t'), term: '', explanation: '' });
    this.#changed();
  }

  setLibrary(items) {
    this.library = items;
    this.emit('change');
  }

  setUploading(uploading, error = null) {
    this.uploading = uploading;
    this.uploadError = error;
    this.emit('change');
  }

  #changed() {
    this.emit('change');
    this.emit('edit');
  }
}
