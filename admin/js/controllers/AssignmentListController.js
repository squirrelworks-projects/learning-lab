import { ListModel } from '../models/ListModel.js';
import { FormModel } from '../models/FormModel.js';
import { AssignmentListView } from '../views/AssignmentListView.js';
import { api } from '../../../shared/js/core/api.js';
import { debounce } from '../debounce.js';

/** The assignments list: filtering, and creating a new assignment from a module's createConfig(). */
export class AssignmentListController {
  /**
   * @param {HTMLElement} slot
   * @param {import('./AppController.js').AdminContext} ctx
   */
  constructor(slot, ctx) {
    this.ctx = ctx;
    this.list = new ListModel('assignments', 'assignments', ctx.savedFilters.assignments);
    this.form = new FormModel({ module: '', title: '', difficulty: 'green' });
    const reload = debounce(() => this.list.load(), 250);
    this.view = new AssignmentListView(slot, { list: this.list, modules: ctx.modules, users: ctx.users, form: this.form }, {
      onFilter: (name, value) => {
        this.list.setFilter(name, value);
        ctx.savedFilters.assignments = { ...this.list.filters };
        if (name === 'q') reload();
        else this.list.load();
      },
      onNew: () => this.form.show({ module: ctx.modules.items[0]?.key ?? '' }),
      onInput: (field, value) => this.form.set(field, value, { silent: field === 'title' }),
      onCreate: () => this.#create(),
      onCancel: () => this.form.hide(),
    });
  }

  init() {
    this.view.render();
    this.list.load();
  }

  async #create() {
    const { module, title, difficulty } = this.form.values;
    if (!module) return this.form.setError('Choose a module.');
    if (!title.trim()) return this.form.setError('Give the assignment a title.');
    this.form.setBusy(true);
    try {
      const { schema } = await this.ctx.loadModule(module);
      const { assignment } = await api.post('assignments', {
        module,
        title,
        difficulty,
        status: 'draft',
        schemaVersion: schema.SCHEMA_VERSION,
        config: schema.createConfig(),
      });
      this.ctx.shell.toast('Assignment created as a draft.');
      this.ctx.router.go(`#/assignments/${assignment.id}`);
    } catch (error) {
      this.form.setError(error.message);
    }
  }
}
