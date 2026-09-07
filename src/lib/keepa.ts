// Server-side Keepa client. KEEPA_API_KEY never reaches the browser.

import type { Deal } from "@/data/deals";

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

// cacheOptions defaults to always-fresh; fetchLiveHomepageDeals overrides it
// with a time-based revalidate instead (see that function for why).
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

// Returns null if the candidate is missing price data or the real discount
// (current vs. avg) is too small/unreliable to show unverified.
export function keepaCandidateToDeal(candidate: KeepaCandidate, checkedAt: Date): Deal | null {
  if (candidate.currentPriceCents == null || candidate.avgPriceCents == null) return null;

  const price = candidate.currentPriceCents / 100;
  const originalPrice = candidate.avgPriceCents / 100;
  if (originalPrice <= price) return null;
  if (1 - price / originalPrice < 0.15) return null;

  return {
    id: stableIdFromAsin(candidate.asin),
    title: candidate.title,
    category: mapCategory(candidate.categoryName),
    price,
    originalPrice,
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

// Not re-fetched per visitor — Keepa's Deal Query costs 5 tokens/call and
// the Starter plan refills 20/minute, so that would exhaust the budget
// under real traffic. Instead the homepage revalidates on a timer (see
// `export const revalidate` in page.tsx), and every card shows exactly
// when it was checked, so freshness is honest rather than implied.
export async function fetchLiveHomepageDeals(excludeAsins: Set<string>): Promise<Deal[]> {
  const candidates = await fetchKeepaCandidates(HOMEPAGE_LIVE_FILTERS, {
    next: { revalidate: 300 },
  });
  const checkedAt = new Date();

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
