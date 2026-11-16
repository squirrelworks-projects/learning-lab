import { EditorModel } from '../models/EditorModel.js';
import { EditorView } from '../views/EditorView.js';
import { DEFAULT_CONFIG } from '../defaultConfig.js';

/**
 * The Match Word editor in the admin. Turns editor actions into EditorModel changes and reports
 * every change to the admin through ctx.onChange(config).
 */
export class EditorController {
  /**
   * @param {HTMLElement} root
   * @param {Object} config - migrated config
   * @param {{onChange: (config: Object) => void, uploadImage: (file: File) => Promise<{src: string, name: string}>,
   *          listMedia: () => Promise<{src: string, name: string}[]>, assetUrl: (path: string) => string}} ctx
   */
  constructor(root, config, ctx) {
    this.ctx = ctx;
    const m = (this.model = new EditorModel(config));
    const c = () => m.config;
    m.on('edit', () => ctx.onChange(structuredClone(m.config)));

    this.view = new EditorView(root, m, ctx.assetUrl, {
      onInstructions: (v) => m.setText(['instructions'], v),
      onAllowOwnImage: (v) => m.setAllowOwnImage(v),
      onUpload: (file) => this.#upload(file),
      onAddFromLibrary: (src) => m.addImage({ src, title: m.library.find((i) => i.src === src)?.name.replace(/\.\w+$/, '') ?? '' }),
      onImageTitle: (i, v) => m.setText(['images', i, 'title'], v),
      onImageMove: (i, d) => m.move(c().images, i, d),
      onImageRemove: (i) => m.remove(c().images, i),
      onSubjectName: (s, v) => m.setText(['subjects', s, 'name'], v),
      onTerm: (s, t, field, v) => m.setText(['subjects', s, 'terms', t, field], v),
      onAddTerm: (s) => {
        m.addTerm(s);
        focus(`mw-s${s}-t${c().subjects[s].terms.length - 1}-term`);
      },
      onRemoveTerm: (s, t) => m.remove(c().subjects[s].terms, t),
      onSubjectMove: (s, d) => m.move(c().subjects, s, d),
      onSubjectRemove: (s) => {
        const subject = c().subjects[s];
        if (subject.terms.some((t) => t.term) && !confirm(`Remove “${subject.name || 'this subject'}” and its ${subject.terms.length} terms?`)) return;
        m.remove(c().subjects, s);
      },
      onAddSubject: () => {
        m.addSubject();
        focus(`mw-s${c().subjects.length - 1}-name`);
      },
    });
  }

  init() {
    this.view.render();
    this.#loadLibrary();
  }

  /** Uploaded images (newest first) plus the bundled examples. */
  async #loadLibrary() {
    const examples = DEFAULT_CONFIG.images.map((i) => ({ src: i.src, name: i.title }));
    try {
      const media = await this.ctx.listMedia();
      this.model.setLibrary([...media.map((m) => ({ src: m.src, name: m.name })), ...examples]);
    } catch {
      this.model.setLibrary(examples);
    }
  }

  async #upload(file) {
    this.model.setUploading(true);
    try {
      const media = await this.ctx.uploadImage(file);
      this.model.library.unshift({ src: media.src, name: media.name });
      this.model.setUploading(false);
      this.model.addImage({ src: media.src, title: media.name.replace(/\.\w+$/, '') });
    } catch (error) {
      this.model.setUploading(false, error.message);
    }
  }
}

const focus = (id) => requestAnimationFrame(() => document.getElementById(id)?.focus());
