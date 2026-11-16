import { EventEmitter } from '../../../shared/js/core/EventEmitter.js';

/**
 * What the player shows: one assignment, or a course and the index of its current assignment.
 * Emits 'change'.
 */
export class PlayerModel extends EventEmitter {
  /** @type {'loading'|'ready'|'error'} */
  status = 'loading';
  /** @type {{title: string, text?: string}|null} */
  error = null;
  /** @type {{publicId: string, title: string, status: string, items: Object[]}|null} */
  course = null;
  /** 0-based index of the current course item */
  index = 0;
  /** @type {Object|null} the current assignment from the public API */
  assignment = null;

  setLoading() {
    this.status = 'loading';
    this.error = null;
    this.emit('change');
  }

  setError(title, text) {
    this.status = 'error';
    this.error = { title, text };
    this.emit('change');
  }

  setCourse(course) {
    this.course = course;
    this.emit('change');
  }

  setIndex(index) {
    this.index = index;
    this.emit('change');
  }

  setAssignment(assignment) {
    this.assignment = assignment;
    this.status = 'ready';
    this.error = null;
    this.emit('change');
  }

  get items() {
    return this.course?.items ?? [];
  }

  get currentItem() {
    return this.items[this.index] ?? null;
  }
}
