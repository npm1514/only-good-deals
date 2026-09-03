import { deals } from "./deals";

const KNOWN_CATEGORIES = ["Electronics", "Home", "Tools", "Kitchen", "Outdoors"];

describe("deals data", () => {
  it("has a healthy number of deals", () => {
    expect(deals.length).toBeGreaterThan(10);
  });

  it("gives every deal a unique id", () => {
    const ids = deals.map((deal) => deal.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(deals)("never prices deal #%# above its own original price ($title)", (deal) => {
    expect(deal.price).toBeGreaterThan(0);
    expect(deal.price).toBeLessThanOrEqual(deal.originalPrice);
  });

  it.each(deals)("gives deal #%# a real editorial note, not a placeholder ($title)", (deal) => {
    expect(deal.note.trim().length).toBeGreaterThan(0);
  });

  it.each(deals)("gives deal #%# something to build an affiliate link from ($title)", (deal) => {
    const hasAsin = typeof deal.asin === "string" && deal.asin.trim().length > 0;
    const hasSearchQuery = typeof deal.searchQuery === "string" && deal.searchQuery.trim().length > 0;
    expect(hasAsin || hasSearchQuery).toBe(true);
  });

  it.each(deals)("assigns deal #%# to a known category ($title)", (deal) => {
    expect(KNOWN_CATEGORIES).toContain(deal.category);
  });

  it.each(deals)("gives deal #%# a valid, non-future verifiedAt date ($title)", (deal) => {
    expect(deal.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(deal.verifiedAt).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("never shows an Amazon-scraped rating or review count (Associates Program rule)", () => {
    for (const deal of deals) {
      expect(deal).not.toHaveProperty("rating");
      expect(deal).not.toHaveProperty("reviews");
    }
  });
});
