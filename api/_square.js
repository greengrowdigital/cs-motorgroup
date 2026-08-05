/**
 * Shared Square helpers. The leading underscore keeps Vercel from routing this
 * file as an endpoint.
 */

const SQUARE_VERSION = '2025-01-23';

export const host = () =>
  process.env.SQUARE_ENVIRONMENT === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com';

export async function square(path, token, options = {}) {
  const res = await fetch(host() + path, {
    ...options,
    headers: {
      'Square-Version': SQUARE_VERSION,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = body?.errors?.[0]?.detail || res.statusText;
    const err = new Error(`Square ${path} failed: ${detail}`);
    err.status = res.status;
    throw err;
  }
  return body;
}

/** Square money is in the smallest denomination (cents). */
export const toDollars = (money) =>
  money && money.amount != null ? Number(money.amount) / 100 : null;

/**
 * Stable slug from a catalog item name. Sellers type inconsistently
 * ("Synthetic Oil Change " with a trailing space, "NEW YORK STATE INSPECTION"
 * in caps), so normalise hard: lowercase, strip accents and punctuation,
 * collapse whitespace to single dashes.
 */
export const slugify = (name) =>
  String(name || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
