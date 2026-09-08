import { buildTaggedUrl } from "@/lib/amazon";

// Amazon Creator Connections ("Affiliate+") lets you accept individual
// brand campaigns for a boosted commission rate — but that boost is
// per-ASIN and per-campaign, and it says nothing about whether the product
// is actually discounted right now. Adding an entry here does NOT put it
// on the site: fetchCreatorConnectionDeals() (see keepa.ts) checks Keepa's
// real price history for each ASIN and only includes it if it clears the
// same 15%+ real-discount bar every other deal on the site has to clear.
// A campaign that isn't a genuine deal just sits here unused.
//
// Amazon only exposes each campaign's real Affiliate+ tracking link via a
// "Get associate link" button that silently copies it to your clipboard —
// it's never shown or embedded on the page itself. So these entries use a
// regular `?tag=` link (same as everywhere else on the site) for now,
// which still earns the standard commission — just not the campaign's
// boosted rate. To capture the boost for a given campaign: open its
// campaign page in Associates Central (Creator Connections > Active),
// click "Get associate link", paste the copied link here as that entry's
// `affiliateUrl`, and replace the comment noting it's the real Affiliate+
// link.
export type CreatorConnectionCandidate = {
  asin: string;
  brand: string;
  campaignName: string;
  /** Ideally the campaign's exact Affiliate+ tracking link; falls back to a plain ?tag= link — see note above. */
  affiliateUrl: string;
};

// Accepted campaigns, Associates Central > Creator Connections > Active,
// checked 2026-09-08. "Honey Bae Honey Packs" was accepted but has no
// product attached on Amazon's side (empty Products section) — nothing to
// link, so it's left out until Amazon fixes it on their end. "Eggboards"
// shows "Currently unavailable" — kept below since it may restock; the
// Keepa check will simply exclude it while it has no valid price.
export const creatorConnectionCandidates: CreatorConnectionCandidate[] = [
  {
    asin: "B0CJB7PGHK",
    brand: "JRSGS",
    campaignName: "25KN Locking Climbing Carabiner Clips",
    affiliateUrl: buildTaggedUrl("https://www.amazon.com/dp/B0CJB7PGHK"),
  },
  {
    asin: "B0GQXKQWY8",
    brand: "BUARO8AGA",
    campaignName: "12\" Solar Garden Globe Light",
    affiliateUrl: buildTaggedUrl("https://www.amazon.com/dp/B0GQXKQWY8"),
  },
  {
    asin: "B0BYJGVX4T",
    brand: "COLEDRE",
    campaignName: "LED Gloves — Boys' Costume Accessories",
    affiliateUrl: buildTaggedUrl("https://www.amazon.com/dp/B0BYJGVX4T"),
  },
  {
    asin: "B0H6P6K3SK",
    brand: "canvage",
    campaignName: "Fiber Optic Whip, Rechargeable LED Whip Lights",
    affiliateUrl: buildTaggedUrl("https://www.amazon.com/dp/B0H6P6K3SK"),
  },
  {
    asin: "B0HGQZY94R",
    brand: "ChayWillow",
    campaignName: "Portable Pour-Over Coffee Mug",
    affiliateUrl: buildTaggedUrl("https://www.amazon.com/dp/B0HGQZY94R"),
  },
  {
    asin: "B0BWNPVC2S",
    brand: "Moontower",
    campaignName: "Mushroom Ground Coffee",
    affiliateUrl: buildTaggedUrl("https://www.amazon.com/dp/B0BWNPVC2S"),
  },
  {
    asin: "B08B7QNJXG",
    brand: "Eggboards",
    campaignName: "Electric Skateboard Lights for Night Riding",
    affiliateUrl: buildTaggedUrl("https://www.amazon.com/dp/B08B7QNJXG"),
  },
];
