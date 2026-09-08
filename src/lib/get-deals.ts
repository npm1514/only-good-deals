import type { Deal } from "@/data/deals";
import { fetchLiveHomepageDeals, fetchCreatorConnectionDeals } from "@/lib/keepa";

// Falls back to an empty list (rather than throwing) if Keepa is
// unreachable or KEEPA_API_KEY isn't set — DealsGrid already handles an
// empty catalog, so a Keepa outage degrades the homepage instead of
// breaking it. Creator Connections candidates are fetched separately and
// merged in — see fetchCreatorConnectionDeals for why they still have to
// pass the site's normal discount bar, and a failure there is swallowed
// the same way so one bad campaign lookup can't take down the whole page.
//
// excludeAsins lets a caller (page.tsx, from the seen_deal_asins cookie)
// skip live deals already shown to this visitor so a refresh surfaces
// different ones. It's only applied to the live Keepa pool, not partner
// deals — Creator Connections has a fixed, small candidate list with
// nothing to rotate in, so hiding one after a single view would just make
// it disappear rather than get swapped for something new.
export async function getDeals(excludeAsins: Set<string> = new Set()): Promise<Deal[]> {
  const [liveDeals, partnerDeals] = await Promise.all([
    fetchLiveHomepageDeals(excludeAsins).catch((err) => {
      console.error("Live Keepa fetch failed; showing no live deals for this request.", err);
      return [] as Deal[];
    }),
    fetchCreatorConnectionDeals().catch((err) => {
      console.error("Creator Connections verification failed; showing no partner deals for this request.", err);
      return [] as Deal[];
    }),
  ]);

  const seenAsins = new Set(liveDeals.map((deal) => deal.asin).filter(Boolean));
  const newPartnerDeals = partnerDeals.filter((deal) => !deal.asin || !seenAsins.has(deal.asin));

  return [...liveDeals, ...newPartnerDeals];
}
