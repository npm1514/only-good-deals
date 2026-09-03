/**
 * Amazon affiliate link helpers.
 *
 * Centralizing link-building here means every deal — whether it comes from
 * the static curated catalog (src/data/deals.ts) or, later, a live
 * Product Advertising API (PA-API) response — gets a correctly tagged link
 * built the same way, in exactly one place.
 */

// Not a secret — Associate tags are always visible in the resulting URL.
// The env var lets you override it locally/per-environment without a code change.
const DEFAULT_ASSOCIATE_TAG = "only-good-deals-20";

export const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || DEFAULT_ASSOCIATE_TAG;

export type AffiliateLinkable = {
  /**
   * Amazon Standard Identification Number for the exact product listing.
   * When present, we link straight to that product page.
   */
  asin?: string;
  /**
   * Fallback search terms used to build a tagged Amazon search-results link
   * when we don't (yet) have a confirmed ASIN for the exact listing.
   */
  searchQuery: string;
};

/**
 * Builds a correctly-tagged Amazon URL for a deal.
 *
 * Prefers a direct product-page deep link (`/dp/{asin}`) when we have a
 * confirmed ASIN; otherwise falls back to a tagged search-results link,
 * which still attributes the click (and the resulting order) to this
 * Associate tag, just without deep-linking to one exact listing.
 */
export function buildAffiliateUrl(deal: AffiliateLinkable): string {
  if (deal.asin) {
    return `https://www.amazon.com/dp/${deal.asin}?tag=${ASSOCIATE_TAG}`;
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(deal.searchQuery)}&tag=${ASSOCIATE_TAG}`;
}
