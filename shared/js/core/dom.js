/**
 * Create a DOM element.
 * @param {string} tag
 * @param {Object} [attrs] - `class`, `dataset`, `style`, `on<Event>` handlers, or plain attributes/properties
 * @param {...(Node|string|null|false)} children
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = Array.isArray(value) ? value.filter(Boolean).join(' ') : value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'style') Object.assign(node.style, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key in node && typeof value !== 'string') node[key] = value;
    else node.setAttribute(key, value === true ? '' : value);
  }

  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** Replace all children of `parent` with `children`. */
export function mount(parent, ...children) {
  parent.replaceChildren(...children.flat().filter(Boolean));
}

/** Find a named slot (`data-slot="name"`) in a template. */
export const getSlot = (root, name) => root.querySelector(`[data-slot="${name}"]`);

/**
 * Re-render without losing the user's place: remembers which element (by id) had focus and where
 * the text cursor was, runs `render`, then puts focus and cursor back.
 * @param {() => void} render
 */
export function preserveFocus(render) {
  const active = document.activeElement;
  const id = active?.id;
  const selection = id && typeof active.selectionStart === 'number' ? [active.selectionStart, active.selectionEnd] : null;
  render();
  if (!id) return;
  const next = document.getElementById(id);
  if (!next || next === active) return;
  next.focus({ preventScroll: true });
  if (selection && typeof next.setSelectionRange === 'function') {
    try {
      next.setSelectionRange(...selection);
    } catch {
      // some input types (email, number) don't support selection
    }
  }
}
