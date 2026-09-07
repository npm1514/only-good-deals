import type { Deal } from "@/data/deals";
import { fetchLiveHomepageDeals } from "@/lib/keepa";

// Falls back to an empty list (rather than throwing) if Keepa is
// unreachable or KEEPA_API_KEY isn't set — DealsGrid already handles an
// empty catalog, so a Keepa outage degrades the homepage instead of
// breaking it.
export async function getDeals(): Promise<Deal[]> {
  try {
    return await fetchLiveHomepageDeals(new Set());
  } catch (err) {
    console.error("Live Keepa fetch failed; showing no deals for this request.", err);
    return [];
  }
}
