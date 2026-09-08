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

jest.mock("../data/creator-connections", () => ({
  creatorConnectionCandidates: [
    {
      asin: "B000GOOD01",
      brand: "Acme",
      campaignName: "Fall Sale",
      affiliateUrl: "https://www.amazon.com/dp/B000GOOD01?ascsubtag=partner-good",
    },
    {
      asin: "B000BAD01",
      brand: "Acme",
      campaignName: "No Real Discount",
      affiliateUrl: "https://www.amazon.com/dp/B000BAD01?ascsubtag=partner-bad",
    },
  ],
}));

describe("fetchCreatorConnectionDeals", () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.KEEPA_API_KEY;

  beforeEach(() => {
    process.env.KEEPA_API_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.KEEPA_API_KEY = originalApiKey;
    jest.resetModules();
  });

  it("includes a candidate that clears the real-discount bar, using its Affiliate+ link verbatim, and drops one that doesn't", async () => {
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const asin = url.includes("B000GOOD01") ? "B000GOOD01" : "B000BAD01";
      const body =
        asin === "B000GOOD01"
          ? { title: "Acme Fall Jacket", stats: { current: [-1, 1999], avg90: [-1, 3999] } }
          : { title: "Acme Full-Price Mug", stats: { current: [-1, 1999], avg90: [-1, 2000] } };
      return {
        ok: true,
        json: async () => ({ products: [body] }),
      } as Response;
    }) as unknown as typeof fetch;

    const { fetchCreatorConnectionDeals } = await import("./keepa");
    const deals = await fetchCreatorConnectionDeals();

    expect(deals).toHaveLength(1);
    expect(deals[0].asin).toBe("B000GOOD01");
    expect(deals[0].title).toBe("Acme Fall Jacket");
    expect(deals[0].tag).toBe("Partner deal");
    expect(deals[0].price).toBeCloseTo(19.99);
    expect(deals[0].originalPrice).toBeCloseTo(39.99);
    // The Affiliate+ link is used exactly as given, not rebuilt with our own tag.
    const { buildAffiliateUrl } = await import("./amazon");
    expect(buildAffiliateUrl(deals[0])).toBe("https://www.amazon.com/dp/B000GOOD01?ascsubtag=partner-good");
  });
});

describe("fetchLiveHomepageDeals", () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.KEEPA_API_KEY;

  beforeEach(() => {
    process.env.KEEPA_API_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.KEEPA_API_KEY = originalApiKey;
    jest.resetModules();
  });

  function dealRow(asin: string, currentCents: number, avgCents: number) {
    return {
      asin,
      title: `Widget ${asin}`,
      rootCat: null,
      current: [undefined, currentCents],
      avg: [undefined, [undefined, avgCents]],
      deltaPercent: [undefined, [undefined, 50]],
      lastUpdate: -1,
    };
  }

  function mockDealsResponse(rows: ReturnType<typeof dealRow>[]) {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ deals: { categoryIds: [], categoryNames: [], dr: rows } }),
    })) as unknown as typeof fetch;
  }

  it("skips ASINs already shown to this visitor, surfacing a different qualifying deal instead", async () => {
    mockDealsResponse([dealRow("B000AAA01", 1999, 3999), dealRow("B000BBB01", 2999, 4999)]);

    const { fetchLiveHomepageDeals } = await import("./keepa");
    const deals = await fetchLiveHomepageDeals(new Set(["B000AAA01"]));

    expect(deals.map((d) => d.asin)).toEqual(["B000BBB01"]);
  });

  it("falls back to showing everything again rather than an empty grid once every qualifying deal has been seen", async () => {
    mockDealsResponse([dealRow("B000AAA01", 1999, 3999)]);

    const { fetchLiveHomepageDeals } = await import("./keepa");
    const deals = await fetchLiveHomepageDeals(new Set(["B000AAA01"]));

    expect(deals.map((d) => d.asin)).toEqual(["B000AAA01"]);
  });

  it("still returns nothing when there's genuinely no qualifying deal, exclude list aside", async () => {
    mockDealsResponse([]);

    const { fetchLiveHomepageDeals } = await import("./keepa");
    const deals = await fetchLiveHomepageDeals(new Set());

    expect(deals).toEqual([]);
  });
});
