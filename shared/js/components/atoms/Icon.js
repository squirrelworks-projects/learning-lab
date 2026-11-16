/**
 * Atom: Icon – small inline SVG icon that uses the current text color.
 * @param {Object} props
 * @param {'close'|'paste'|'image'|'trash'|'copy'|'check'|'plus'|'up'|'down'|'left'|'right'|'edit'|'upload'|'external'|'logout'|'list'} props.name
 * @param {string} [props.className]
 * @returns {SVGElement}
 */
const PATHS = {
  close: 'M6 6l12 12M18 6L6 18',
  paste: 'M9 4h6v3H9zM7 6H5v15h14V6h-2M9 12h6M9 16h4',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  check: 'M5 12l5 5 9-10',
  plus: 'M12 5v14M5 12h14',
  up: 'M12 19V5M6 11l6-6 6 6',
  down: 'M12 5v14M6 13l6 6 6-6',
  left: 'M15 6l-6 6 6 6',
  right: 'M9 6l6 6-6 6',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  upload: 'M12 16V4M7 9l5-5 5 5M4 17v3h16v-3',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  logout: 'M9 4H4v16h5M16 8l4 4-4 4M20 12H9',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
};

export function Icon({ name, className = '' }) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', `a-icon ${className}`.trim());
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', PATHS[name] ?? '');
  svg.append(path);
  return svg;
}
