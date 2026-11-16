import { EventEmitter } from '../../../../shared/js/core/EventEmitter.js';

/**
 * Subjects and their technical terms (from the assignment config), and which subject is active.
 * Emits 'change' when the subjects are set or the active subject changes.
 */
export class TermsModel extends EventEmitter {
  subjects = [];
  activeSubjectId = null;

  /** @param {{id: string, name: string, terms: {id: string, term: string, explanation: string}[]}[]} subjects */
  setSubjects(subjects) {
    this.subjects = subjects ?? [];
    this.activeSubjectId = this.subjects[0]?.id ?? null;
    this.emit('change');
  }

  setSubject(id) {
    if (id === this.activeSubjectId) return;
    this.activeSubjectId = id;
    this.emit('change');
  }

  get activeSubject() {
    return this.subjects.find((s) => s.id === this.activeSubjectId) ?? null;
  }

  get activeTerms() {
    return this.activeSubject?.terms ?? [];
  }

  /** Look up a term across all subjects. */
  findTerm(termId) {
    for (const subject of this.subjects) {
      const term = subject.terms.find((t) => t.id === termId);
      if (term) return term;
    }
    return null;
  }
}
