import { TermsModel } from '../models/TermsModel.js';
import { ScreenshotModel } from '../models/ScreenshotModel.js';
import { StickerModel } from '../models/StickerModel.js';
import { AppView } from '../views/AppView.js';
import { DragController } from './DragController.js';

/**
 * Creates models and views for one assignment, connects them, and handles app-level input
 * (paste, image choice). Created by player.js; `destroy()` removes everything it added to the page.
 */
export class AppController {
  #onPasteBound = (e) => this.#onPaste(e);
  #attemptReported = false;

  /**
   * @param {HTMLElement} root
   * @param {Object} config - a migrated Match Word config (see schema.js)
   * @param {import('../../../../player/js/moduleContext.js').ModuleContext} ctx
   */
  constructor(root, config, ctx) {
    this.root = root;
    this.config = config;
    this.ctx = ctx;
    this.models = {
      terms: new TermsModel(),
      screenshot: new ScreenshotModel(),
      stickers: new StickerModel(),
    };
  }

  init() {
    const { terms, screenshot, stickers } = this.models;
    const options = {
      title: this.ctx.title,
      instructions: this.config.instructions,
      allowOwnImage: this.config.allowOwnImage,
    };

    const drag = new DragController(
      this.models,
      () => this.view.stage,
      options.allowOwnImage ? (file) => this.#loadImageBlob(file) : null,
    );

    this.view = new AppView(this.root, this.models, options, {
      ...drag.handlers,
      onSubjectChange: (id) => terms.setSubject(id),
      onImageChange: (src) => {
        stickers.clear();
        screenshot.setFromAsset(src);
      },
      onClearStickers: () => stickers.clear(),
      onCopySnapshot: () => this.#copySnapshot(),
      onPasteImage: () => this.#pasteFromClipboard(),
    });
    this.view.render();

    // The first placed sticker counts as one (anonymous) attempt.
    stickers.on('change', () => {
      if (this.#attemptReported || !stickers.stickers.length) return;
      this.#attemptReported = true;
      this.ctx.reportAttempt();
    });

    if (options.allowOwnImage) document.addEventListener('paste', this.#onPasteBound);

    terms.setSubjects(this.config.subjects);
    screenshot.setManifest(this.config.images.map((i) => ({ title: i.title, src: this.ctx.assetUrl(i.src) })));
  }

  /** Remove listeners and free memory. The player empties the root element afterwards. */
  destroy() {
    document.removeEventListener('paste', this.#onPasteBound);
    this.models.screenshot.destroy();
  }

  #onPaste(e) {
    const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith('image/'));
    if (!item) return;
    e.preventDefault();
    this.#loadImageBlob(item.getAsFile());
  }

  /**
   * "Paste image from clipboard" in the image picker: read an image with the async Clipboard API.
   * The browser may ask for permission. If reading is unavailable or blocked, tell the user to use Ctrl+V.
   */
  async #pasteFromClipboard() {
    const { toolbar } = this.view;
    if (!navigator.clipboard?.read) {
      return toolbar.showNotice('Your browser can’t read the clipboard from a menu – press Ctrl+V instead.');
    }
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((t) => t.startsWith('image/'));
        if (type) return this.#loadImageBlob(await item.getType(type));
      }
      toolbar.showNotice('No image on the clipboard – take a screenshot first (Win+Shift+S).');
    } catch (error) {
      console.warn('Clipboard read failed:', error);
      toolbar.showNotice('Clipboard access was blocked – press Ctrl+V instead.');
    }
  }

  #loadImageBlob(blob) {
    if (!blob) return;
    this.models.stickers.clear();
    this.models.screenshot.setFromBlob(blob);
  }

  /**
   * Copy the image with its stickers to the clipboard as a PNG, so students can paste it into a document.
   * If the clipboard can't be used (unsupported browser, not a secure context, permission denied,
   * or an iframe without clipboard-write permission), the PNG is downloaded instead.
   */
  async #copySnapshot() {
    const { toolbar, stage } = this.view;
    if (toolbar.copyState === 'copying' || !stage.canvas) return;
    toolbar.setCopyState('copying');

    // Pass the blob *promise* to ClipboardItem: Safari only allows clipboard writes started
    // directly in the click handler, before any await.
    const pngPromise = stage.snapshot();
    try {
      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('Clipboard API unavailable');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngPromise })]);
      toolbar.setCopyState('copied');
    } catch (clipboardError) {
      console.warn('Copy to clipboard failed, downloading instead:', clipboardError);
      try {
        downloadBlob(await pngPromise, 'match-word.png');
        toolbar.setCopyState('downloaded');
      } catch (renderError) {
        console.error(renderError);
        toolbar.setCopyState('error');
      }
    }
  }
}

/** Save a blob as a file through a temporary <a download> link. */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
