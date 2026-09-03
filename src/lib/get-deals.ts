import { deals as curatedDeals, type Deal } from "@/data/deals";

/**
 * Returns the current catalog of deals shown on the site.
 *
 * Today this just returns the hand-curated static list in
 * src/data/deals.ts. Once this Associates account is approved for the
 * Amazon Product Advertising API (PA-API) — which requires 3 qualifying
 * sales within 180 days of Associates approval — swap the body of this
 * function for a live PA-API call (credentials go in .env.local, see
 * .env.local.example) that returns data in the same Deal shape.
 *
 * Every consumer (the homepage, tests, etc.) calls this one function, so
 * that swap is a one-file change — nothing else needs to know where the
 * data actually came from.
 */
export async function getDeals(): Promise<Deal[]> {
  return curatedDeals;
}
