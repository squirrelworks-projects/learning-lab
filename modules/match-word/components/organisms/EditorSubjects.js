import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';
import { TextInput } from '../../../../shared/js/components/atoms/TextInput.js';
import { TermRow } from '../molecules/TermRow.js';

/**
 * Organism: EditorSubjects – subjects (HTML, CSS, …) and their terms. Students pick a subject and drag its terms.
 * @param {Object} props
 * @param {{name: string, terms: {term: string, explanation: string}[]}[]} props.subjects
 * @param {(s: number, value: string) => void} props.onName
 * @param {(s: number, t: number, field: 'term'|'explanation', value: string) => void} props.onTerm
 * @param {(s: number) => void} props.onAddTerm
 * @param {(s: number, t: number) => void} props.onRemoveTerm
 * @param {(s: number, direction: -1|1) => void} props.onMove
 * @param {(s: number) => void} props.onRemove
 * @param {() => void} props.onAdd
 * @returns {HTMLElement}
 */
export function EditorSubjects({ subjects, onName, onTerm, onAddTerm, onRemoveTerm, onMove, onRemove, onAdd }) {
  return el(
    'section',
    { class: 'o-mw-editor-section', 'aria-labelledby': 'mw-subjects-title' },
    el('h2', { class: 'o-mw-editor-section__title', id: 'mw-subjects-title' }, `Subjects and terms (${subjects.length})`),
    subjects.map((subject, s) => {
      const name = subject.name || `subject ${s + 1}`;
      return el(
        'div',
        { class: 'o-mw-subject' },
        el(
          'div',
          { class: 'o-mw-subject__head' },
          TextInput({ id: `mw-s${s}-name`, value: subject.name, ariaLabel: `Name of subject ${s + 1}`, placeholder: 'Subject name, e.g. HTML', onInput: (v) => onName(s, v) }),
          Button({ id: `mw-s${s}-up`, variant: 'icon', icon: Icon({ name: 'up' }), ariaLabel: `Move ${name} up`, disabled: s === 0, onClick: () => onMove(s, -1) }),
          Button({ id: `mw-s${s}-down`, variant: 'icon', icon: Icon({ name: 'down' }), ariaLabel: `Move ${name} down`, disabled: s === subjects.length - 1, onClick: () => onMove(s, 1) }),
          Button({ variant: 'icon', icon: Icon({ name: 'trash' }), ariaLabel: `Remove ${name} and its terms`, onClick: () => onRemove(s) }),
        ),
        el(
          'ul',
          { class: 'o-mw-subject__terms' },
          subject.terms.map((term, t) =>
            TermRow({ idPrefix: `mw-s${s}-t${t}`, term, onInput: (field, v) => onTerm(s, t, field, v), onRemove: () => onRemoveTerm(s, t) }),
          ),
        ),
        Button({ id: `mw-s${s}-add`, label: 'Add term', variant: 'ghost', icon: Icon({ name: 'plus' }), onClick: () => onAddTerm(s) }),
      );
    }),
    Button({ id: 'mw-add-subject', label: 'Add subject', variant: 'ghost', icon: Icon({ name: 'plus' }), onClick: onAdd }),
  );
}
