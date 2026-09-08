"use client";

import { useEffect } from "react";

const COOKIE_NAME = "seen_deal_asins";
const MAX_REMEMBERED = 40;
// Long enough that refreshing within one browsing session won't repeat
// deals, short enough that the full pool is back on your next visit.
const MAX_AGE_SECONDS = 60 * 60 * 6;

function readCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

// Renders nothing — on mount, records which live-deal ASINs this page load
// just showed, merged with whatever the browser already remembered, so the
// next request's exclude list (read server-side in page.tsx, applied in
// fetchLiveHomepageDeals) skips them and surfaces different deals instead.
//
// This has to happen client-side: Next.js only allows setting cookies from
// a Server Function or Route Handler, not during a Server Component's GET
// render (see the cookies() docs) — so a plain client-side write after the
// page has already rendered is the straightforward way to close the loop.
export default function SeenDealsTracker({ asins }: { asins: string[] }) {
  useEffect(() => {
    if (asins.length === 0) return;
    const previous = readCookie(COOKIE_NAME).split(",").filter(Boolean);
    const merged = [...previous, ...asins.filter((asin) => !previous.includes(asin))];
    const trimmed = merged.slice(-MAX_REMEMBERED);
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(trimmed.join(","))}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`;
  }, [asins]);

  return null;
}
