/**
 * GET /api/services
 *
 * Live service pricing from the Square catalog, so the shop's POS stays the
 * single source of truth. The site keeps hardcoded prices as fallbacks; a slot
 * only changes when Square actually has a matching item with a fixed price.
 *
 * Response:
 *   { configured: true, services: { "<slug>": { name, price, description } } }
 *
 * The slug comes from the item name (see slugify), so "Synthetic Oil Change "
 * in Square becomes "synthetic-oil-change" here and matches the markup's
 * data-sq-price="synthetic-oil-change".
 *
 * Items with VARIABLE_PRICING are skipped — a price of "whatever we decide at
 * the counter" is not something to publish on a website.
 */

import { square, toDollars, slugify } from './_square.js';

export default async function handler(req, res) {
  // Prices change rarely; an hour of edge cache is plenty and keeps the shop's
  // Square account from being hit on every page view.
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) {
    // Not wired: pages keep their hardcoded prices.
    return res.status(200).json({ configured: false, services: {} });
  }

  try {
    const catalog = await square('/v2/catalog/list?types=ITEM', token);
    const services = {};

    for (const obj of catalog.objects || []) {
      if (obj.type !== 'ITEM' || obj.is_deleted) continue;
      const data = obj.item_data || {};
      const variation = (data.variations || [])[0]?.item_variation_data;
      if (!variation) continue;
      if (variation.pricing_type !== 'FIXED_PRICING') continue;

      const price = toDollars(variation.price_money);
      if (price == null) continue;

      const slug = slugify(data.name);
      if (!slug) continue;

      services[slug] = {
        name: String(data.name || '').trim(),
        price,
        description: (data.description || '').trim()
      };
    }

    return res.status(200).json({ configured: true, services });
  } catch (err) {
    console.error('[api/services]', err.message);
    // Fall back to the hardcoded prices rather than showing nothing.
    return res.status(200).json({ configured: true, services: {}, error: 'pricing_unavailable' });
  }
}
