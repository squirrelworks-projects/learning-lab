import { el } from '../../../../shared/js/core/dom.js';
import { Button } from '../../../../shared/js/components/atoms/Button.js';
import { Icon } from '../../../../shared/js/components/atoms/Icon.js';
import { Link } from '../atoms/Link.js';

/**
 * Organism: AppHeader – product name, main navigation, the logged-in teacher and Log out.
 * @param {Object} props
 * @param {{name: string, role: string}} props.user
 * @param {'assignments'|'courses'|'users'|'profile'} props.current - the active section
 * @param {() => void} props.onLogout
 * @returns {HTMLDivElement}
 */
export function AppHeader({ user, current, onLogout }) {
  const nav = [
    { key: 'assignments', href: '#/assignments', label: 'Assignments' },
    { key: 'courses', href: '#/courses', label: 'Courses' },
    user.role === 'admin' && { key: 'users', href: '#/users', label: 'Users' },
  ].filter(Boolean);

  return el(
    'div',
    { class: 'o-app-header' },
    el('a', { class: 'o-app-header__brand', href: '#/assignments' }, 'Learning Lab'),
    el(
      'nav',
      { class: 'o-app-header__nav', 'aria-label': 'Main' },
      nav.map((n) => Link({ href: n.href, label: n.label, variant: 'nav', current: n.key === current })),
    ),
    el(
      'div',
      { class: 'o-app-header__user' },
      Link({ href: '#/profile', label: user.name, variant: 'nav', current: current === 'profile' }),
      Button({ label: 'Log out', variant: 'ghost', icon: Icon({ name: 'logout' }), onClick: onLogout }),
    ),
  );
}
