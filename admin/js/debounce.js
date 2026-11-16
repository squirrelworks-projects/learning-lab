/** Call `fn` only after `ms` without new calls (e.g. while typing in a search field). Not a component. */
export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
