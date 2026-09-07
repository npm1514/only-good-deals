import { keepaCandidateToDeal, stableIdFromAsin, type KeepaCandidate } from "./keepa";

function candidate(overrides: Partial<KeepaCandidate> = {}): KeepaCandidate {
  return {
    asin: "B000TEST01",
    title: "Test Widget",
    categoryName: "Home & Kitchen",
    currentPriceCents: 1999,
    avgPriceCents: 3999,
    deltaPercent: 50,
    lastUpdate: "2026-09-01T00:00:00.000Z",
    amazonUrl: "https://www.amazon.com/dp/B000TEST01",
    keepaUrl: "https://keepa.com/#!product/1-B000TEST01",
    ...overrides,
  };
}

const CHECKED_AT = new Date("2026-09-07T12:00:00.000Z");

describe("keepaCandidateToDeal", () => {
  it("maps a healthy candidate into a Deal with no image and a live-checked timestamp", () => {
    const deal = keepaCandidateToDeal(candidate(), CHECKED_AT);
    expect(deal).not.toBeNull();
    expect(deal?.image).toBeUndefined();
    expect(deal?.price).toBeCloseTo(19.99);
    expect(deal?.originalPrice).toBeCloseTo(39.99);
    expect(deal?.priceCheckedAt).toBe(CHECKED_AT.toISOString());
    expect(deal?.asin).toBe("B000TEST01");
    expect(deal?.tag).toBe("Live find");
  });

  it("rejects a candidate missing a current or average price", () => {
    expect(keepaCandidateToDeal(candidate({ currentPriceCents: null }), CHECKED_AT)).toBeNull();
    expect(keepaCandidateToDeal(candidate({ avgPriceCents: null }), CHECKED_AT)).toBeNull();
  });

  it("rejects a candidate whose average isn't actually above its current price", () => {
    expect(
      keepaCandidateToDeal(candidate({ currentPriceCents: 2999, avgPriceCents: 2999 }), CHECKED_AT)
    ).toBeNull();
  });

  it("rejects a discount under the ~15% quality bar", () => {
    // 1900 -> 2000 is only a 5% drop.
    expect(
      keepaCandidateToDeal(candidate({ currentPriceCents: 1900, avgPriceCents: 2000 }), CHECKED_AT)
    ).toBeNull();
  });

  it("gives every ASIN a stable id clear of the curated catalog's low integer ids", () => {
    expect(stableIdFromAsin("B000TEST01")).toBeGreaterThanOrEqual(900000);
    expect(stableIdFromAsin("B000TEST01")).toBe(stableIdFromAsin("B000TEST01"));
  });
});
