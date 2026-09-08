// Not a secret — Associate tags are always visible in the resulting URL.
const DEFAULT_ASSOCIATE_TAG = "only-good-deals-20";

export const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || DEFAULT_ASSOCIATE_TAG;

export type AffiliateLinkable = {
  /** Direct product-page link when present; otherwise falls back to search. */
  asin?: string;
  searchQuery: string;
  /** A specific tracking link to use verbatim instead (e.g. a Creator Connections Affiliate+ link). */
  affiliateUrlOverride?: string;
};

export function buildAffiliateUrl(deal: AffiliateLinkable): string {
  if (deal.affiliateUrlOverride) {
    return deal.affiliateUrlOverride;
  }
  if (deal.asin) {
    return `https://www.amazon.com/dp/${deal.asin}?tag=${ASSOCIATE_TAG}`;
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(deal.searchQuery)}&tag=${ASSOCIATE_TAG}`;
}

/** Appends our Associate tag to an arbitrary Amazon URL (e.g. a membership signup page). */
export function buildTaggedUrl(url: string): string {
  const tagged = new URL(url);
  tagged.searchParams.set("tag", ASSOCIATE_TAG);
  return tagged.toString();
}
