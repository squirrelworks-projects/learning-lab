/**
 * Talks to the PHP API in /api. Used by the player, the admin and module editors.
 * The API's address is worked out from this file's own URL, so the site also works in a sub-folder.
 */

/** The site root (the folder with play.html), e.g. https://example.dk/ or https://example.dk/learning-lab/. */
export const SITE_ROOT = new URL('../../../', import.meta.url);
const API_BASE = new URL('api/', SITE_ROOT);

/** An error response from the API: `{ error: { code, message, details? } }`. */
export class ApiError extends Error {
  /**
   * @param {number} status - HTTP status
   * @param {string} code - e.g. 'invalid', 'conflict', 'unauthenticated'
   * @param {string} message - human-readable, safe to show
   * @param {Object} [details] - e.g. `{ field: 'title' }`
   */
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details ?? null;
  }
}

let csrfToken = '';

/** Turn a path from a config ("media/x.png", "modules/match-word/…") into a full URL. */
export function siteUrl(path) {
  return new URL(path, SITE_ROOT).href;
}

export const api = {
  /** Set the CSRF token from /auth/me or /auth/login. It is sent with every request that changes data. */
  setCsrf(token) {
    csrfToken = token ?? '';
  },
  get: (path, query) => request('GET', path, { query }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  delete: (path) => request('DELETE', path),
  /** Upload one file as multipart/form-data in the field "file". */
  upload(path, file) {
    const form = new FormData();
    form.append('file', file);
    return request('POST', path, { form });
  },
};

async function request(method, path, { query, body, form } = {}) {
  const url = new URL(path.replace(/^\//, ''), API_BASE);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== '' && value !== null && value !== undefined) url.searchParams.set(key, value);
  }
  const headers = { Accept: 'application/json' };
  if (method !== 'GET') headers['X-CSRF-Token'] = csrfToken;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, { method, headers, body: payload, credentials: 'same-origin' });
  } catch {
    throw new ApiError(0, 'network', 'Could not reach the server. Check your connection.');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = data?.error ?? {};
    throw new ApiError(res.status, error.code ?? 'http_error', error.message ?? `The request failed (${res.status}).`, error.details);
  }
  return data;
}
