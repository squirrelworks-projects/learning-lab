import { SITE_ROOT } from '../../shared/js/core/api.js';

/**
 * Loads a module from /modules/<key>/: its manifest, its stylesheets, player.js and schema.js.
 * Only one module's stylesheets are on the page at a time.
 * Used by the player and by the admin (which also loads editor.js).
 */

const KEY = /^[a-z0-9]+(-[a-z0-9]+)*$/;
let currentStyleKey = null;

/**
 * @param {string} key - e.g. 'match-word'
 * @param {{editor?: boolean}} [options] - also import editor.js
 * @returns {Promise<{manifest: Object, player: Object, schema: Object, editor?: Object}>}
 */
export async function loadModule(key, { editor = false } = {}) {
  if (!KEY.test(key)) throw new Error(`Invalid module name “${key}”.`);
  const base = new URL(`modules/${key}/`, SITE_ROOT);
  const res = await fetch(new URL('manifest.json', base));
  if (!res.ok) throw new Error(`The module “${key}” is not installed.`);
  const manifest = await res.json();

  const [player, schema, editorModule] = await Promise.all([
    import(new URL('player.js', base).href),
    import(new URL('schema.js', base).href),
    editor ? import(new URL('editor.js', base).href) : null,
  ]);
  await useStyles(key, (manifest.styles ?? []).map((href) => new URL(href, base).href));
  return { manifest, player, schema, ...(editor && { editor: editorModule }) };
}

/** Swap the module stylesheets on the page and wait until they have loaded. */
function useStyles(key, hrefs) {
  if (currentStyleKey === key) return Promise.resolve();
  document.querySelectorAll('link[data-module-style]').forEach((link) => link.remove());
  currentStyleKey = key;
  return Promise.all(
    hrefs.map(
      (href) =>
        new Promise((resolve) => {
          const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
          link.dataset.moduleStyle = key;
          link.onload = link.onerror = resolve;
          document.head.append(link);
        }),
    ),
  );
}
