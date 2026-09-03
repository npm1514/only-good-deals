import { deals } from "./deals";

describe("deals data", () => {
  it("has at least one deal", () => {
    expect(deals.length).toBeGreaterThan(0);
  });

  it("gives every deal a unique id", () => {
    const ids = deals.map((deal) => deal.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(deals)("prices out deal #%# as an actual discount ($price < $originalPrice)", (deal) => {
    expect(deal.price).toBeGreaterThan(0);
    expect(deal.price).toBeLessThan(deal.originalPrice);
  });

  it.each(deals)("keeps ratings within a sane 0-5 range for deal #%#", (deal) => {
    expect(deal.rating).toBeGreaterThanOrEqual(0);
    expect(deal.rating).toBeLessThanOrEqual(5);
  });
});
