/** Date and text formatting for the admin. Not a component. */

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/** "2026-11-16T09:30:00Z" → "16 Nov 2026, 10:30" in the browser's language and time zone. */
export function formatDate(iso) {
  return iso ? dateTime.format(new Date(iso)) : '';
}

/** "Bo, 16 Nov 2026, 10:30" */
export function formatEdited(person, iso) {
  return [person?.name, formatDate(iso)].filter(Boolean).join(', ');
}
