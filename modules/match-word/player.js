/**
 * Match Word – player entry point (module contract: see the Module-Contract wiki page).
 * The player calls mount() with a config that has already been migrated by schema.js.
 */
import { AppController } from './js/controllers/AppController.js';

/**
 * @param {HTMLElement} root - an empty element that the module owns until destroy()
 * @param {Object} config - Match Word config at schema.js SCHEMA_VERSION
 * @param {import('../../player/js/moduleContext.js').ModuleContext} ctx
 * @returns {{destroy: () => void}}
 */
export function mount(root, config, ctx) {
  const app = new AppController(root, config, ctx);
  app.init();
  return { destroy: () => app.destroy() };
}
