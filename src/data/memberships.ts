import { buildTaggedUrl } from "@/lib/amazon";

export type MembershipOffer = {
  id: string;
  name: string;
  pitch: string;
  url: string;
};

// Regular `?tag=` links, not Associates Central "Special Links" — Amazon's
// own bounty FAQ confirms these earn the same flat bounty as a Special
// Link. Landing pages and rates below are verified against the account's
// live rate card (Associates Central > Rate Plan > Special Program
// Commissions), Store npmarucci-20, checked 2026-09.
export const membershipOffers: MembershipOffer[] = [
  {
    id: "prime",
    name: "Amazon Prime",
    pitch: "Free 30-day trial — fast shipping, Prime Video, Prime Music.",
    url: buildTaggedUrl("https://www.amazon.com/prime"), // $3 per sign-up (trial or paid)
  },
  {
    id: "prime-young-adults",
    name: "Prime for Young Adults",
    pitch: "For students & ages 18–24 — $0 for your first 6 months, plus 5% cash back on eligible purchases.",
    // $30 bounty (10x standard) through Oct 9, 2026, then reverts to the
    // standard $3 Prime rate — reconsider keeping this card after that date.
    url: buildTaggedUrl("https://www.amazon.com/joinyoungadult"),
  },
  {
    id: "audible",
    name: "Audible",
    pitch: "Free 30-day trial — one credit for any audiobook, yours to keep.",
    url: buildTaggedUrl("https://www.amazon.com/hz/audible/mlp"), // $5 trial, $10 paid monthly
  },
  {
    id: "kindle-unlimited",
    name: "Kindle Unlimited",
    pitch: "Free 30-day trial — unlimited reading across millions of titles.",
    url: buildTaggedUrl("https://www.amazon.com/kindleunlimited"), // $3 per trial sign-up
  },
  {
    id: "music-unlimited",
    name: "Amazon Music Unlimited",
    pitch: "Free 30-day trial — ad-free music, offline listening.",
    url: buildTaggedUrl("https://www.amazon.com/music/unlimited"), // $3 per trial sign-up
  },
];
