import { api, ApiError } from '../../../shared/js/core/api.js';
import { PlayerModel } from '../models/PlayerModel.js';
import { PlayerView } from '../views/PlayerView.js';
import { loadModule } from '../moduleLoader.js';
import { createModuleContext } from '../moduleContext.js';

/**
 * Reads the URL, loads the assignment or course from the public API, and mounts the right module.
 *
 *   play.html?a=<assignment publicId>
 *   play.html?c=<course publicId>            first assignment of the course
 *   play.html?c=<course publicId>&i=<n>     assignment n (1-based) of the course
 */
export class PlayerController {
  /** @type {{destroy: () => void}|null} the running module */
  #running = null;
  #loadToken = 0;

  /** @param {HTMLElement} root */
  constructor(root) {
    this.model = new PlayerModel();
    this.view = new PlayerView(root, this.model, {
      onSelectItem: (index) => this.#showCourseItem(index),
    });
  }

  async init() {
    this.view.render();
    const params = new URLSearchParams(location.search);
    const assignmentId = params.get('a');
    const courseId = params.get('c');

    if (courseId) return this.#openCourse(courseId, Number(params.get('i')) || 1);
    if (assignmentId) return this.#openAssignment(assignmentId);
    this.model.setError('No assignment chosen', 'The link is missing ?a=… (an assignment) or ?c=… (a course).');
  }

  async #openCourse(publicId, position) {
    try {
      const { course } = await api.get(`public/courses/${encodeURIComponent(publicId)}`);
      document.title = course.title;
      this.model.setCourse(course);
      if (!course.items.length) return this.model.setError('This course has no assignments yet', 'Ask your teacher.');
      await this.#showCourseItem(Math.min(Math.max(position, 1), course.items.length) - 1);
    } catch (error) {
      this.#fail(error);
    }
  }

  async #showCourseItem(index) {
    this.model.setIndex(index);
    const url = new URL(location.href);
    url.searchParams.set('i', String(index + 1));
    history.replaceState(null, '', url);
    await this.#openAssignment(this.model.currentItem.publicId);
  }

  async #openAssignment(publicId) {
    const token = ++this.#loadToken;
    this.#stopModule();
    this.model.setLoading();
    try {
      const { assignment } = await api.get(`public/assignments/${encodeURIComponent(publicId)}`);
      const mod = await loadModule(assignment.module);
      if (token !== this.#loadToken) return; // the student already moved on
      const config = mod.schema.migrate(assignment.config, assignment.schemaVersion);
      if (!this.model.course) document.title = assignment.title;
      this.model.setAssignment(assignment);
      const ctx = createModuleContext(assignment, this.model.course?.publicId ?? null);
      this.#running = mod.player.mount(this.view.moduleSlot, config, ctx);
    } catch (error) {
      if (token === this.#loadToken) this.#fail(error);
    }
  }

  #stopModule() {
    this.#running?.destroy();
    this.#running = null;
    this.view.moduleSlot.replaceChildren();
  }

  #fail(error) {
    console.error(error);
    if (error instanceof ApiError && error.status === 404) {
      return this.model.setError('Not available', 'This assignment or course doesn’t exist or isn’t published yet.');
    }
    this.model.setError('Something went wrong', error.message);
  }
}
