# Only Good Deals

An Amazon affiliate deal discovery site built with Next.js and TypeScript.

## Run locally

```bash
yarn install
yarn dev
```

Then visit http://localhost:3000.

## How it works

The homepage (`src/app/page.tsx`) shows deals sourced live from Keepa's
price-history API — no manual curation step in between. The pipeline:

- `src/lib/keepa.ts` queries Keepa's Deal API for products with a genuine,
  recent price drop (tuned filters in `HOMEPAGE_LIVE_FILTERS`), then
  quality-filters and maps each candidate into the site's `Deal` shape.
- `src/lib/get-deals.ts` (`getDeals()`) is what the homepage calls. If Keepa
  is unreachable or `KEEPA_API_KEY` isn't set, it degrades to an empty list
  rather than breaking the page.
- Every deal links out through `buildAffiliateUrl()` (`src/lib/amazon.ts`),
  which tags the URL with the real Associates tag.
- The homepage revalidates every 5 minutes (`export const revalidate` in
  `page.tsx`) rather than re-checking Keepa per visitor — see the comment
  on `fetchLiveHomepageDeals` in `keepa.ts` for why.

Requires `KEEPA_API_KEY` in `.env.local` (get one at
https://keepa.com/#!api). Without it, the homepage still builds and runs,
just with no deals shown.

## Membership free trials

The site also links out to Prime, Audible, Kindle Unlimited, and Music
Unlimited (`src/data/memberships.ts`). Keepa has no data on subscriptions,
so this is a small hand-maintained list, not live-tracked. The links use
a regular `?tag=` Associate link, which Amazon's bounty FAQ confirms earns
the same flat bounty as an Associates Central "Special Link" — no separate
tracking URL needed. Landing pages and rates are verified against the
account's live rate card (Associates Central > Rate Plan): Prime $3/signup,
Audible $5 trial / $10 paid monthly, Kindle Unlimited $3/trial, Music
Unlimited $3/trial.

## Creator Connections (partner deals)

Amazon's Creator Connections program lets you accept individual brand
campaigns for a boosted commission rate — but that's a per-ASIN, per-campaign
deal with Amazon, and says nothing about whether the product is actually
discounted. `src/data/creator-connections.ts` holds a list of ASINs you've
accepted; `fetchCreatorConnectionDeals()` in `src/lib/keepa.ts` checks each
one against Keepa's real price history and only shows it if it clears the
same 15%+ real-discount bar as every other deal on the site. A campaign
that isn't a genuine deal right now is silently skipped, not shown anyway —
the extra commission is never a reason to lower the bar. To add one: accept
the campaign in Associates Central (Promotions > Creator Connections), then
add its ASIN and the Affiliate+ link it gives you to that file.

## Next step

Once this Associates account is approved for the Amazon Product
Advertising API (PA-API) — which requires 3 qualifying sales within 180
days of Associates approval — product images can be sourced compliantly
(see the comment on `Deal.image` in `src/data/deals.ts` for why there's no
image today).
