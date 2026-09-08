import { cookies } from "next/headers";
import Link from "next/link";
import DealsGrid from "@/components/DealsGrid";
import MembershipOffers from "@/components/MembershipOffers";
import SeenDealsTracker from "@/components/SeenDealsTracker";
import { Brand } from "@/components/Logo";
import { getDeals } from "@/lib/get-deals";
import { buildAffiliateUrl, buildTaggedUrl } from "@/lib/amazon";

const SEEN_DEALS_COOKIE = "seen_deal_asins";

// Fully dynamic: re-checks Keepa on every request rather than on a timer.
// At low traffic this is well inside the Keepa token budget (see the cost
// breakdown in keepa.ts) -- revisit if traffic grows enough to matter.
export const revalidate = 0;

const SITE_URL = "https://www.only-good-deals.com";

function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function Home() {
  // Skip live deals this visitor already saw (recorded client-side by
  // SeenDealsTracker below) so refreshing the page surfaces different
  // ones instead of the same feed. Partner (Creator Connections) deals are
  // never excluded this way -- see the comment on getDeals for why.
  const cookieStore = await cookies();
  const seenAsins = new Set(
    (cookieStore.get(SEEN_DEALS_COOKIE)?.value ?? "").split(",").filter(Boolean)
  );
  const deals = await getDeals(seenAsins);
  const liveDealAsins = deals
    .filter((deal) => deal.tag === "Live find" && deal.asin)
    .map((deal) => deal.asin as string);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Only Good Deals",
    url: SITE_URL,
    description: "Deals tracked live and checked against real price history. No junk. No fake bargains. Only good deals.",
    publisher: { "@type": "Organization", name: "Only Good Deals", url: SITE_URL },
  };

  const dealsJsonLd =
    deals.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Today's deals on Only Good Deals",
          itemListElement: deals.map((deal, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: deal.title,
            url: buildAffiliateUrl(deal),
          })),
        }
      : null;

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd) }} />
      {dealsJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(dealsJsonLd) }} />
      )}
      <header className="site-header">
        <Link className="brand" href="/"><Brand /></Link>
        <nav>
          <a href="#deals">Deals</a>
          <a href="#about">How it works</a>
        </nav>
      </header>

      <section className="hero">
        <div className="eyebrow">THE GOOD STUFF ONLY</div>
        <h1>Skip the fake sales.<br /><em>Find the good deals.</em></h1>
        <p>We dig through discounts and surface the stuff that&apos;s actually worth buying.</p>
        <div className="hero-ctas">
          <a className="hero-cta" href="#deals">Show me the deals ↓</a>
          <a className="hero-cta-secondary" href={buildTaggedUrl("https://www.amazon.com")} target="_blank" rel="sponsored noopener noreferrer">Just shop Amazon →</a>
        </div>
      </section>

      <section className="ticker" aria-label="site benefits">
        <span>REAL DISCOUNTS</span><b>✦</b><span>NO JUNK</span><b>✦</b><span>TRACKED LIVE</span><b>✦</b><span>ONLY GOOD DEALS</span>
      </section>

      <section className="deals-section" id="deals">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TODAY&apos;S FINDS</p>
            <h2>Good deals, right now.</h2>
          </div>
          <p className="updated">{deals.length} deals, tracked live</p>
        </div>

        <DealsGrid deals={deals} />
        <SeenDealsTracker asins={liveDealAsins} />
      </section>

      <MembershipOffers />

      <section className="manifesto" id="about">
        <div className="manifesto-number">01</div>
        <div>
          <p className="eyebrow">OUR ONE RULE</p>
          <h2>If it&apos;s not a good deal,<br />it doesn&apos;t make the cut.</h2>
          <p>Huge crossed-out prices don&apos;t impress us. The goal is simple: surface worthwhile products at genuinely compelling prices and leave the noise behind.</p>
        </div>
      </section>

      <footer>
        <Brand size={22} showBadge={false} className="footer-brand" />
        <p>As an Amazon Associate I earn from qualifying purchases.</p>
      </footer>
    </main>
  );
}
