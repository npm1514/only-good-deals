import type { AffiliateLinkable } from "@/lib/amazon";

export type Deal = AffiliateLinkable & {
  id: number;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  /** Never a scraped Amazon rating. */
  note: string;
  verifiedAt: string;
  /** Omitted for Keepa-sourced deals — no compliant image source yet. */
  image?: string;
  tag?: string;
  /** Set for Keepa-sourced deals; DealCard prefers this over verifiedAt when present. */
  priceCheckedAt?: string;
};
