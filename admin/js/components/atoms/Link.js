import { el } from '../../../../shared/js/core/dom.js';

/**
 * Atom: Link – an internal (#/…) or external link.
 * @param {Object} props
 * @param {string} props.href
 * @param {string|Node} props.label
 * @param {Element} [props.icon] - an Icon placed before the label
 * @param {'text'|'nav'|'button'} [props.variant='text'] - `button` looks like a ghost Button
 * @param {boolean} [props.current=false] - marks the current page (aria-current)
 * @param {boolean} [props.external=false] - opens in a new tab
 * @returns {HTMLAnchorElement}
 */
export function Link({ href, label, icon, variant = 'text', current = false, external = false }) {
  return el(
    'a',
    {
      class: ['a-link', `a-link--${variant}`],
      href,
      'aria-current': current ? 'page' : null,
      target: external ? '_blank' : null,
      rel: external ? 'noopener' : null,
    },
    icon,
    label,
  );
}
