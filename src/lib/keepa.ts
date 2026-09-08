// Server-side Keepa client. KEEPA_API_KEY never reaches the browser.

import type { Deal } from "@/data/deals";
import { creatorConnectionCandidates } from "@/data/creator-connections";

export type KeepaFilters = {
  maxPriceDollars: number;
  minDiscountPercent: number;
  days: number; // compared against 1 / 7 / 31 / 90 buckets
  priceType: "amazon" | "new" | "used" | "warehouse";
  lowest90: boolean;
  limit: number;
};

export type KeepaCandidate = {
  asin: string;
  title: string;
  categoryName: string | null;
  currentPriceCents: number | null;
  avgPriceCents: number | null;
  deltaPercent: number | null;
  lastUpdate: string | null;
  amazonUrl: string;
  keepaUrl: string;
};

export class KeepaConfigError extends Error {}

const PRICE_TYPE_CODES: Record<KeepaFilters["priceType"], number> = {
  amazon: 0,
  new: 1,
  used: 2,
  warehouse: 9,
};

function dateRangeCode(days: number): number {
  // Keepa's dateRange enum: 0=24h, 1=7d, 2=31d, 3=90d
  if (days <= 1) return 0;
  if (days <= 7) return 1;
  if (days <= 31) return 2;
  return 3;
}

// Keepa Time (minutes since their custom epoch) -> a real Date.
function keepaTimeToDate(keepaMinutes: number | null | undefined): Date | null {
  if (keepaMinutes == null || keepaMinutes < 0) return null;
  return new Date((keepaMinutes + 21564000) * 60000);
}

function positiveOrNull(cents: number | null | undefined): number | null {
  return cents != null && cents >= 0 ? cents : null;
}

type RawKeepaDeal = {
  asin: string;
  title: string;
  rootCat?: number;
  current?: number[];
  avg?: number[][];
  deltaPercent?: number[][];
  lastUpdate?: number;
};

// Always-fresh by default; every caller currently wants that (see
// fetchLiveHomepageDeals for the token-budget math behind why that's safe).
export async function fetchKeepaCandidates(
  filters: KeepaFilters,
  cacheOptions: RequestInit = { cache: "no-store" }
): Promise<KeepaCandidate[]> {
  const apiKey = process.env.KEEPA_API_KEY;
  if (!apiKey) {
    throw new KeepaConfigError("KEEPA_API_KEY is not set in .env.local");
  }

  const priceTypeCode = PRICE_TYPE_CODES[filters.priceType];
  const dateRangeIdx = dateRangeCode(filters.days);

  const selection = {
    page: 0,
    domainId: 1, // amazon.com
    priceTypes: [priceTypeCode],
    dateRange: dateRangeIdx,
    isRangeEnabled: true,
    currentRange: [0, Math.round(filters.maxPriceDollars * 100)],
    deltaPercentRange: [Math.max(filters.minDiscountPercent, 10), 100],
    salesRankRange: [0, -1],
    includeCategories: [],
    excludeCategories: [],
    isLowest: false,
    isLowest90: filters.lowest90,
    isLowestOffer: false,
    isOutOfStock: false,
    isBackInStock: false,
    hasReviews: false,
    minRating: -1,
    filterErotic: true,
    singleVariation: true,
    isPrimeExclusive: false,
    mustHaveAmazonOffer: false,
    mustNotHaveAmazonOffer: false,
    titleSearch: "",
    // Sales rank, not percent-delta (surfaces data artifacts first) or
    // dollar-delta (buries cheap items — a $1 item can't post a big swing).
    sortType: 3,
  };

  const url = `https://api.keepa.com/deal?key=${encodeURIComponent(apiKey)}&selection=${encodeURIComponent(
    JSON.stringify(selection)
  )}`;

  let res: Response;
  try {
    res = await fetch(url, cacheOptions);
  } catch {
    throw new Error(
      "Couldn't reach api.keepa.com — this looks like a network-allowlist issue, not a Keepa problem."
    );
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Keepa API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  if (data?.error) {
    throw new Error(`Keepa API error: ${JSON.stringify(data.error)}`);
  }

  const categoryIds: number[] = data.deals?.categoryIds ?? [];
  const categoryNames: string[] = data.deals?.categoryNames ?? [];
  const categoryMap = new Map<number, string>();
  categoryIds.forEach((id, i) => categoryMap.set(id, categoryNames[i]));

  const rows: RawKeepaDeal[] = data.deals?.dr ?? [];

  return rows.slice(0, filters.limit).map((deal) => {
    const current = deal.current?.[priceTypeCode];
    const avg = deal.avg?.[dateRangeIdx]?.[priceTypeCode];
    const deltaPercent = deal.deltaPercent?.[dateRangeIdx]?.[priceTypeCode];
    const lastUpdate = keepaTimeToDate(deal.lastUpdate);

    return {
      asin: deal.asin,
      title: deal.title,
      categoryName: deal.rootCat != null ? (categoryMap.get(deal.rootCat) ?? null) : null,
      currentPriceCents: positiveOrNull(current),
      avgPriceCents: positiveOrNull(avg),
      deltaPercent: deltaPercent != null && deltaPercent !== -1 ? deltaPercent : null,
      lastUpdate: lastUpdate ? lastUpdate.toISOString() : null,
      amazonUrl: `https://www.amazon.com/dp/${deal.asin}`,
      keepaUrl: `https://keepa.com/#!product/1-${deal.asin}`,
    };
  });
}

// --- Homepage merge: Keepa candidate -> site Deal -------------------------

// Best-effort mapping from Keepa/Amazon's root category names onto this
// site's fixed category filter set (see CATEGORIES in DealsGrid.tsx).
function mapCategory(categoryName: string | null): string {
  if (!categoryName) return "Home";
  const name = categoryName.toLowerCase();
  if (name.includes("electronic") || name.includes("computer") || name.includes("camera") || name.includes("cell phone")) {
    return "Electronics";
  }
  if (name.includes("tool") || name.includes("improvement") || name.includes("automotive")) return "Tools";
  if (name.includes("kitchen") || name.includes("dining")) return "Kitchen";
  if (name.includes("outdoor") || name.includes("patio") || name.includes("garden") || name.includes("sport")) {
    return "Outdoors";
  }
  if (name.includes("beauty") || name.includes("personal care") || name.includes("health")) return "Personal Care";
  return "Home";
}

// Deterministic id from the ASIN, offset clear of curated-catalog ids.
export function stableIdFromAsin(asin: string): number {
  let hash = 5381;
  for (let i = 0; i < asin.length; i++) {
    hash = (hash * 33) ^ asin.charCodeAt(i);
  }
  return 900000 + (Math.abs(hash) % 99999);
}

const MIN_REAL_DISCOUNT = 0.15;

// A Deal Query row's current/avg price is a snapshot from whenever Keepa
// last rescanned that ASIN -- for a low-traffic product that can be a long
// time ago, and the "deal" can have quietly expired since (real example: a
// listing shown here at $12.99 that was back to $49.99 on Amazon by the
// time it was clicked). 24h is a starting judgment call, not a measured
// number -- tight enough to drop obviously-expired snapshots, loose enough
// not to starve the page of infrequently-rescanned but still-valid deals.
const MAX_DEAL_AGE_HOURS = 24;

function isFreshEnough(lastUpdate: string | null, checkedAt: Date): boolean {
  if (!lastUpdate) return false;
  const ageMs = checkedAt.getTime() - new Date(lastUpdate).getTime();
  return ageMs <= MAX_DEAL_AGE_HOURS * 60 * 60 * 1000;
}

// Most-recently-verified first, so a "no fresh candidates at all" fallback
// still leads with whatever is least stale rather than an arbitrary order.
function byFreshnessDesc(a: KeepaCandidate, b: KeepaCandidate): number {
  const aTime = a.lastUpdate ? new Date(a.lastUpdate).getTime() : 0;
  const bTime = b.lastUpdate ? new Date(b.lastUpdate).getTime() : 0;
  return bTime - aTime;
}

// The one quality gate every deal on the site has to clear, regardless of
// where it was sourced from (live Keepa scan or a Creator Connections
// candidate) — real current price meaningfully below the real 90-day
// average, both actually known. Used by keepaCandidateToDeal below and by
// fetchCreatorConnectionDeals, so a sponsored campaign gets no exception.
function verifiedPricing(
  currentPriceCents: number | null,
  avgPriceCents: number | null
): { price: number; originalPrice: number } | null {
  if (currentPriceCents == null || avgPriceCents == null) return null;
  const price = currentPriceCents / 100;
  const originalPrice = avgPriceCents / 100;
  if (originalPrice <= price) return null;
  if (1 - price / originalPrice < MIN_REAL_DISCOUNT) return null;
  return { price, originalPrice };
}

// Returns null if the candidate is missing price data or the real discount
// (current vs. avg) is too small/unreliable to show unverified.
export function keepaCandidateToDeal(candidate: KeepaCandidate, checkedAt: Date): Deal | null {
  const pricing = verifiedPricing(candidate.currentPriceCents, candidate.avgPriceCents);
  if (!pricing) return null;

  return {
    id: stableIdFromAsin(candidate.asin),
    title: candidate.title,
    category: mapCategory(candidate.categoryName),
    price: pricing.price,
    originalPrice: pricing.originalPrice,
    note: "Found automatically by our Keepa price-tracker — not hand-reviewed, but the discount is checked against real price history.",
    verifiedAt: checkedAt.toISOString().slice(0, 10),
    priceCheckedAt: checkedAt.toISOString(),
    tag: "Live find",
    asin: candidate.asin,
    searchQuery: candidate.title,
  };
}

const HOMEPAGE_LIVE_FILTERS: KeepaFilters = {
  maxPriceDollars: 5000,
  minDiscountPercent: 65,
  days: 7,
  priceType: "new",
  lowest90: true,
  limit: 60,
};

// Re-fetched on every request now (see `export const revalidate = 0` in
// page.tsx) — the Deal Query's flat 5-token cost plus the Creator
// Connections product checks stay well inside the Starter plan's
// 20-tokens/minute budget at this traffic level. Every card still shows
// exactly when it was checked, so freshness is honest either way.
export async function fetchLiveHomepageDeals(excludeAsins: Set<string>): Promise<Deal[]> {
  const candidates = await fetchKeepaCandidates(HOMEPAGE_LIVE_FILTERS);
  const checkedAt = new Date();

  // Drop snapshots too old to trust (see MAX_DEAL_AGE_HOURS above). Only
  // fall back to the stale pool -- freshest first -- if literally nothing
  // qualifies as fresh, so a quiet Keepa rescan gap never empties the grid.
  const freshCandidates = candidates.filter((c) => isFreshEnough(c.lastUpdate, checkedAt));
  const usableCandidates =
    freshCandidates.length > 0 ? freshCandidates : [...candidates].sort(byFreshnessDesc);

  const deals = buildDeals(usableCandidates, checkedAt, excludeAsins);
  if (deals.length > 0 || excludeAsins.size === 0) return deals;

  // Every qualifying deal today has already been shown to this visitor
  // (see SeenDealsTracker / the seen_deal_asins cookie read in page.tsx) --
  // rather than render an empty grid, show them again instead of leaving
  // the page looking broken. Small qualifying pools cycle back faster than
  // large ones; that's an acceptable trade for never showing nothing.
  return buildDeals(usableCandidates, checkedAt, new Set());
}

function buildDeals(candidates: KeepaCandidate[], checkedAt: Date, excludeAsins: Set<string>): Deal[] {
  const deals: Deal[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    if (excludeAsins.has(candidate.asin) || seen.has(candidate.asin)) continue;
    const deal = keepaCandidateToDeal(candidate, checkedAt);
    if (!deal) continue;
    seen.add(candidate.asin);
    deals.push(deal);
  }
  return deals;
}

// --- Creator Connections: verify-then-include, never sponsored placement --

// Looks up one ASIN's real price history directly (Keepa's Product
// endpoint), as opposed to fetchKeepaCandidates' bulk Deal-query endpoint.
// Needed because a Creator Connections candidate isn't necessarily one of
// today's live Keepa deals — it might not be discounted at all, which is
// exactly what we're checking.
async function fetchKeepaProductStats(
  asin: string,
  priceType: KeepaFilters["priceType"] = "new"
): Promise<{ currentPriceCents: number | null; avgPriceCents: number | null; title: string | null } | null> {
  const apiKey = process.env.KEEPA_API_KEY;
  if (!apiKey) {
    throw new KeepaConfigError("KEEPA_API_KEY is not set in .env.local");
  }

  const priceTypeCode = PRICE_TYPE_CODES[priceType];
  const url = `https://api.keepa.com/product?key=${encodeURIComponent(apiKey)}&domain=1&asin=${encodeURIComponent(asin)}&stats=90`;

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new Error(
      "Couldn't reach api.keepa.com — this looks like a network-allowlist issue, not a Keepa problem."
    );
  }
  if (!res.ok) return null;

  const data = await res.json();
  const product = data?.products?.[0];
  if (!product) return null;

  return {
    currentPriceCents: positiveOrNull(product.stats?.current?.[priceTypeCode]),
    avgPriceCents: positiveOrNull(product.stats?.avg90?.[priceTypeCode]),
    title: typeof product.title === "string" ? product.title : null,
  };
}

// Checks every accepted Creator Connections candidate (see
// src/data/creator-connections.ts) against its real Keepa price history and
// only returns the ones that clear the same MIN_REAL_DISCOUNT bar as every
// other deal on the site. A campaign that isn't a genuine deal right now is
// silently skipped — accepting it earns a boosted commission on Amazon's
// side, but that's irrelevant to whether it belongs on Only Good Deals.
export async function fetchCreatorConnectionDeals(): Promise<Deal[]> {
  const checkedAt = new Date();

  const results = await Promise.all(
    creatorConnectionCandidates.map(async (candidate) => {
      const stats = await fetchKeepaProductStats(candidate.asin);
      const pricing = stats ? verifiedPricing(stats.currentPriceCents, stats.avgPriceCents) : null;
      if (!pricing) return null;

      const deal: Deal = {
        id: stableIdFromAsin(candidate.asin),
        title: stats?.title ?? `${candidate.brand} — ${candidate.campaignName}`,
        category: "Home",
        price: pricing.price,
        originalPrice: pricing.originalPrice,
        note: "A Creator Connections partner product — still checked against real Keepa price history, same bar as every other deal here.",
        verifiedAt: checkedAt.toISOString().slice(0, 10),
        priceCheckedAt: checkedAt.toISOString(),
        tag: "Partner deal",
        asin: candidate.asin,
        searchQuery: candidate.campaignName,
        affiliateUrlOverride: candidate.affiliateUrl,
      };
      return deal;
    })
  );

  return results.filter((deal): deal is Deal => deal !== null);
}
