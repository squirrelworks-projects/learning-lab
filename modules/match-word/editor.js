/**
 * Match Word – editor entry point, used by the teacher admin (module contract: see the Module-Contract wiki page).
 */
import { EditorController } from './js/controllers/EditorController.js';

/**
 * @param {HTMLElement} root - an empty element the editor owns until destroy()
 * @param {Object} config - migrated config (schema.js)
 * @param {{onChange: (config: Object) => void, uploadImage: (file: File) => Promise<{src: string, name: string}>,
 *          listMedia: () => Promise<{src: string, name: string}[]>, assetUrl: (path: string) => string}} ctx
 * @returns {{destroy: () => void}}
 */
export function mountEditor(root, config, ctx) {
  const editor = new EditorController(root, config, ctx);
  editor.init();
  return { destroy: () => root.replaceChildren() };
}
