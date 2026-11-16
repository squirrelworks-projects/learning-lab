import { EventEmitter } from '../../../../shared/js/core/EventEmitter.js';

/**
 * The current screenshot (pasted blob or one of the assignment's images) and the list of images.
 * Emits 'change' when the image or the list changes.
 */
export class ScreenshotModel extends EventEmitter {
  /** @type {{title: string, src: string}[]} the assignment's images, src as full URLs */
  manifest = [];
  src = null;
  /** src of the selected assignment image, or null for a pasted image */
  assetSrc = null;
  #objectUrl = null;

  /** Set the assignment's images and show the first one. */
  setManifest(images) {
    this.manifest = images ?? [];
    this.setFromAsset(this.manifest[0]?.src ?? '');
  }

  /** Use a pasted/dropped image file. */
  setFromBlob(blob) {
    this.#revoke();
    this.#objectUrl = URL.createObjectURL(blob);
    this.src = this.#objectUrl;
    this.assetSrc = null;
    this.emit('change');
  }

  /** Use one of the assignment's images. Empty string clears the image. */
  setFromAsset(src) {
    this.#revoke();
    this.src = src || null;
    this.assetSrc = src || null;
    this.emit('change');
  }

  /** Free the pasted image's object URL (call when the module is unmounted). */
  destroy() {
    this.#revoke();
  }

  #revoke() {
    if (this.#objectUrl) URL.revokeObjectURL(this.#objectUrl);
    this.#objectUrl = null;
  }
}
