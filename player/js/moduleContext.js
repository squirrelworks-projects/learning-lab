import { api, siteUrl } from '../../shared/js/core/api.js';

/**
 * @typedef {Object} ModuleContext - the second argument a module's mount() gets (see Module-Contract in the wiki)
 * @property {string} title - the assignment's title
 * @property {string} publicId - the assignment's public id
 * @property {string|null} coursePublicId - set when the assignment is opened from a course
 * @property {boolean} preview - true when a teacher previews an unpublished assignment
 * @property {(path: string) => string} assetUrl - turns a path from the config ("media/x.png") into a URL
 * @property {() => void} reportAttempt - count one anonymous attempt; only the first call per mount counts
 */

/**
 * @param {{publicId: string, title: string, status: string}} assignment
 * @param {string|null} coursePublicId
 * @returns {ModuleContext}
 */
export function createModuleContext(assignment, coursePublicId) {
  let reported = false;
  return Object.freeze({
    title: assignment.title,
    publicId: assignment.publicId,
    coursePublicId,
    preview: assignment.status !== 'published',
    assetUrl: siteUrl,
    reportAttempt() {
      if (reported) return;
      reported = true;
      api.post('public/attempts', { assignment: assignment.publicId, course: coursePublicId ?? '' }).catch((e) => console.warn('Attempt not counted:', e));
    },
  });
}
