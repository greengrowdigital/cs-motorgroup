/**
 * GET /api/inventory
 *
 * Returns the used-car inventory for sales.html, sourced from Square.
 *
 * Each vehicle is one Square catalog ITEM with a single variation. Sold cars
 * drop off automatically because we filter out anything whose tracked stock is
 * not IN_STOCK with a positive quantity.
 *
 * Vehicle-specific fields (year, mileage, drivetrain, VIN, lot...) live in the
 * item's custom attributes. Square's custom attribute keys come back namespaced
 * (e.g. "SQ_ABC123:mileage"), so we match on the suffix after the colon.
 *
 * Env:
 *   SQUARE_ACCESS_TOKEN  required — production access token (starts with EAAA)
 *   SQUARE_ENVIRONMENT   optional — "sandbox" to hit the sandbox host
 *   SQUARE_CATEGORY_ID   optional — only return items in this category
 *
 * Without SQUARE_ACCESS_TOKEN the endpoint returns an empty list and
 * configured:false, which keeps sales.html in its standby state instead of
 * showing an error to visitors.
 */

const SQUARE_VERSION = '2025-01-23';

const host = () =>
  process.env.SQUARE_ENVIRONMENT === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com';

async function square(path, token, options = {}) {
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
const toDollars = (money) =>
  money && money.amount != null ? Math.round(Number(money.amount) / 100) : null;

/**
 * Custom attribute keys arrive namespaced as "<app-id>:<key>". Build a plain
 * lookup keyed by the bare name so callers can ask for "mileage" directly.
 */
function readAttributes(item) {
  const out = {};
  const values = item?.custom_attribute_values || {};
  for (const [key, entry] of Object.entries(values)) {
    const name = (entry?.name || key.split(':').pop() || '').trim().toLowerCase();
    if (!name) continue;
    out[name] =
      entry.string_value ??
      entry.number_value ??
      entry.selection_uid_values ??
      entry.boolean_value ??
      null;
  }
  return out;
}

const num = (v) => {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

/** Normalise free-text body style down to the four buckets the UI filters on. */
function bodyBucket(raw) {
  const v = String(raw || '').toLowerCase();
  if (/truck|pickup|f-150|silverado|tacoma|ram/.test(v)) return 'truck';
  if (/suv|crossover|wagon|4runner|explorer|tahoe/.test(v)) return 'suv';
  if (/coupe|convertible|roadster/.test(v)) return 'coupe';
  if (/sedan|saloon|hatch/.test(v)) return 'sedan';
  return v || null;
}

function toVehicle(item, imageMap, inStockIds) {
  const data = item.item_data || {};
  const variations = data.variations || [];
  // One variation per vehicle; fall back to the first if a seller added more.
  const variation = variations[0];
  const varData = variation?.item_variation_data || {};

  // Stock gate: if we tracked inventory for this variation, it must be in stock.
  const anyInStock = variations.some(v => inStockIds.has(v.id));
  if (!anyInStock) return null;

  const attrs = readAttributes(item);
  const price = toDollars(varData.price_money);
  if (price == null) return null; // no price = not ready to list

  const imgs = (data.image_ids || []).map(id => imageMap.get(id)).filter(Boolean);

  return {
    id:         item.id,
    title:      data.name || 'Vehicle',
    trim:       attrs.trim || varData.name || '',
    price,
    miles:      num(attrs.mileage ?? attrs.miles) ?? 0,
    drivetrain: attrs.drivetrain || '',
    trans:      attrs.transmission || '',
    body:       bodyBucket(attrs.body || attrs['body type']),
    make:       attrs.make || (data.name || '').split(' ')[1] || '',
    year:       num(attrs.year),
    vin:        attrs.vin || '',
    lot:        attrs.lot || attrs['stock id'] || '',
    img:        imgs[0] || '',
    photos:     imgs.length,
    badge:      /pending/i.test(String(attrs.status || '')) ? 'pending' : null
  };
}

export default async function handler(req, res) {
  // The lot changes a few times a week; a short cache keeps Square calls down
  // while still letting a newly listed car show up quickly.
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) {
    // Not wired yet — sales.html stays in standby rather than showing an error.
    return res.status(200).json({ configured: false, vehicles: [] });
  }

  try {
    // 1. Catalog: items (the vehicles) plus images, in one pass.
    const catalog = await square('/v2/catalog/list?types=ITEM,IMAGE', token);
    const objects = catalog.objects || [];

    const imageMap = new Map(
      objects
        .filter(o => o.type === 'IMAGE')
        .map(o => [o.id, o.image_data?.url])
    );

    let items = objects.filter(o => o.type === 'ITEM' && !o.is_deleted);

    if (process.env.SQUARE_CATEGORY_ID) {
      const wanted = process.env.SQUARE_CATEGORY_ID;
      items = items.filter(o =>
        o.item_data?.category_id === wanted ||
        (o.item_data?.categories || []).some(c => c.id === wanted)
      );
    }

    // 2. Inventory: which variations are actually still on the lot.
    const variationIds = items.flatMap(o =>
      (o.item_data?.variations || []).map(v => v.id)
    );

    const inStockIds = new Set();
    // batch-retrieve-counts caps at 1000 ids per call.
    for (let i = 0; i < variationIds.length; i += 500) {
      const chunk = variationIds.slice(i, i + 500);
      if (!chunk.length) continue;
      const counts = await square('/v2/inventory/counts/batch-retrieve', token, {
        method: 'POST',
        body: JSON.stringify({ catalog_object_ids: chunk })
      });
      for (const c of counts.counts || []) {
        if (c.state === 'IN_STOCK' && Number(c.quantity) > 0) {
          inStockIds.add(c.catalog_object_id);
        }
      }
    }

    const vehicles = items
      .map(item => toVehicle(item, imageMap, inStockIds))
      .filter(Boolean);

    return res.status(200).json({ configured: true, vehicles });
  } catch (err) {
    // Never surface a broken page: log for us, empty list for the visitor.
    console.error('[api/inventory]', err.message);
    return res.status(200).json({
      configured: true,
      vehicles: [],
      error: 'inventory_unavailable'
    });
  }
}
