import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';
import { TextInput } from '../../../../shared/js/components/atoms/TextInput.js';

/**
 * Molecule: TermRow – one term in the editor: the term, its explanation, and a remove button.
 * @param {Object} props
 * @param {string} props.idPrefix - unique per row, e.g. 'mw-s0-t3'
 * @param {{term: string, explanation: string}} props.term
 * @param {(field: 'term'|'explanation', value: string) => void} props.onInput
 * @param {() => void} props.onRemove
 * @returns {HTMLLIElement}
 */
export function TermRow({ idPrefix, term, onInput, onRemove }) {
  return el(
    'li',
    { class: 'm-term-row' },
    TextInput({ id: `${idPrefix}-term`, value: term.term, ariaLabel: 'Term', placeholder: 'Term, e.g. <nav>', onInput: (v) => onInput('term', v) }),
    TextInput({ id: `${idPrefix}-explanation`, value: term.explanation, ariaLabel: `Explanation of ${term.term || 'the term'}`, placeholder: 'Short explanation (shown on hover)', onInput: (v) => onInput('explanation', v) }),
    Button({ variant: 'icon', icon: Icon({ name: 'close' }), ariaLabel: `Remove ${term.term || 'this term'}`, onClick: onRemove }),
  );
}
