import { ListModel } from '../models/ListModel.js';
import { FormModel } from '../models/FormModel.js';
import { CourseListView } from '../views/CourseListView.js';
import { api } from '../../../shared/js/core/api.js';
import { debounce } from '../debounce.js';

/** The courses list: filtering, and creating a new (empty, draft) course. */
export class CourseListController {
  /**
   * @param {HTMLElement} slot
   * @param {import('./AppController.js').AdminContext} ctx
   */
  constructor(slot, ctx) {
    this.ctx = ctx;
    this.list = new ListModel('courses', 'courses', ctx.savedFilters.courses);
    this.form = new FormModel({ title: '' });
    const reload = debounce(() => this.list.load(), 250);
    this.view = new CourseListView(slot, { list: this.list, users: ctx.users, form: this.form }, {
      onFilter: (name, value) => {
        this.list.setFilter(name, value);
        ctx.savedFilters.courses = { ...this.list.filters };
        if (name === 'q') reload();
        else this.list.load();
      },
      onNew: () => this.form.show(),
      onInput: (field, value) => this.form.set(field, value),
      onCreate: () => this.#create(),
      onCancel: () => this.form.hide(),
    });
  }

  init() {
    this.view.render();
    this.list.load();
  }

  async #create() {
    const { title } = this.form.values;
    if (!title.trim()) return this.form.setError('Give the course a title.');
    this.form.setBusy(true);
    try {
      const { course } = await api.post('courses', { title, status: 'draft', items: [] });
      this.ctx.shell.toast('Course created. Now add assignments to it.');
      this.ctx.router.go(`#/courses/${course.id}`);
    } catch (error) {
      this.form.setError(error.message);
    }
  }
}
