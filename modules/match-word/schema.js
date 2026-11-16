/**
 * Match Word – the format of an assignment's config, and how to upgrade old configs.
 * Part of the module contract (see the Module-Contract wiki page).
 *
 * Config, schemaVersion 1:
 * {
 *   instructions:  string,                        // shown above the terms
 *   allowOwnImage: boolean,                       // students may paste/drop their own screenshot
 *   images:   [{ title: string, src: string }],   // src relative to the site root, e.g. "media/k3f9xq2mzt.png"
 *   subjects: [{ id: string, name: string,
 *                terms: [{ id: string, term: string, explanation: string }] }]
 * }
 * Term ids are unique across all subjects.
 */
import { DEFAULT_CONFIG } from './js/defaultConfig.js';

export const SCHEMA_VERSION = 1;

/** A new assignment's config. */
export function createConfig() {
  return structuredClone(DEFAULT_CONFIG);
}

/**
 * Upgrade a stored config to SCHEMA_VERSION and fill in missing fields.
 * Add one step per version here when the format changes; never change old steps.
 * @param {Object} config
 * @param {number} fromVersion - the assignment's schemaVersion
 * @returns {Object} a new config at SCHEMA_VERSION
 */
export function migrate(config, fromVersion = SCHEMA_VERSION) {
  if (fromVersion > SCHEMA_VERSION) {
    throw new Error(`This assignment was made with a newer Match Word (v${fromVersion}). Reload the page.`);
  }
  const c = structuredClone(config ?? {});
  // Example for a future version:
  // if (fromVersion < 2) { c.images = c.images.map((i) => ({ ...i, alt: '' })); }
  return normalize(c);
}

/**
 * Problems that stop the assignment from working. An empty list means it can be published.
 * @returns {{path: string, message: string}[]}
 */
export function validate(config) {
  const errors = [];
  if (!config.images.length && !config.allowOwnImage) {
    errors.push({ path: 'images', message: 'Add at least one image, or let students use their own screenshot.' });
  }
  config.images.forEach((image, i) => {
    if (!image.src) errors.push({ path: `images.${i}.src`, message: `Image ${i + 1} has no file.` });
    if (!image.title.trim()) errors.push({ path: `images.${i}.title`, message: `Image ${i + 1} needs a title.` });
  });
  if (!config.subjects.length) errors.push({ path: 'subjects', message: 'Add at least one subject with terms.' });
  config.subjects.forEach((subject, s) => {
    const label = subject.name.trim() || `Subject ${s + 1}`;
    if (!subject.name.trim()) errors.push({ path: `subjects.${s}.name`, message: `Subject ${s + 1} needs a name.` });
    if (!subject.terms.length) errors.push({ path: `subjects.${s}.terms`, message: `“${label}” has no terms.` });
    subject.terms.forEach((term, t) => {
      if (!term.term.trim()) errors.push({ path: `subjects.${s}.terms.${t}.term`, message: `Term ${t + 1} in “${label}” is empty.` });
    });
  });
  return errors;
}

/** A short random id for new subjects and terms. */
export function newId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(c) {
  const usedTermIds = new Set();
  return {
    instructions: str(c.instructions),
    allowOwnImage: c.allowOwnImage !== false,
    images: list(c.images).map((i) => ({ title: str(i?.title), src: str(i?.src) })),
    subjects: list(c.subjects).map((s) => ({
      id: str(s?.id) || newId('s'),
      name: str(s?.name),
      terms: list(s?.terms).map((t) => {
        let id = str(t?.id) || newId('t');
        while (usedTermIds.has(id)) id = newId('t');
        usedTermIds.add(id);
        return { id, term: str(t?.term), explanation: str(t?.explanation) };
      }),
    })),
  };
}

const str = (v) => (typeof v === 'string' ? v : '');
const list = (v) => (Array.isArray(v) ? v : []);
