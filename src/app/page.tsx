import DealCard from "@/components/DealCard";
import { deals } from "@/data/deals";

const categories = ["All", "Electronics", "Home", "Tools", "Kitchen", "Outdoors", "Under $25"];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#">ONLY GOOD DEALS<span>.</span></a>
        <nav>
          <a href="#deals">Deals</a>
          <a href="#about">How it works</a>
        </nav>
      </header>

      <section className="hero">
        <div className="eyebrow">THE GOOD STUFF ONLY</div>
        <h1>Skip the fake sales.<br /><em>Find the good deals.</em></h1>
        <p>We dig through discounts and surface the stuff that&apos;s actually worth buying.</p>
        <a className="hero-cta" href="#deals">Show me the deals ↓</a>
      </section>

      <section className="ticker" aria-label="site benefits">
        <span>REAL DISCOUNTS</span><b>✦</b><span>NO JUNK</span><b>✦</b><span>CURATED DAILY</span><b>✦</b><span>ONLY GOOD DEALS</span>
      </section>

      <section className="deals-section" id="deals">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TODAY&apos;S FINDS</p>
            <h2>Good deals, right now.</h2>
          </div>
          <p className="updated">Sample data for MVP</p>
        </div>

        <div className="filters">
          {categories.map((category, index) => (
            <button className={index === 0 ? "active" : ""} key={category}>{category}</button>
          ))}
        </div>

        <div className="deal-grid">
          {deals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
        </div>
      </section>

      <section className="manifesto" id="about">
        <div className="manifesto-number">01</div>
        <div>
          <p className="eyebrow">OUR ONE RULE</p>
          <h2>If it&apos;s not a good deal,<br />it doesn&apos;t make the cut.</h2>
          <p>Huge crossed-out prices don&apos;t impress us. The goal is simple: surface worthwhile products at genuinely compelling prices and leave the noise behind.</p>
        </div>
      </section>

      <footer>
        <div className="brand">ONLY GOOD DEALS<span>.</span></div>
        <p>As an Amazon Associate I earn from qualifying purchases.</p>
      </footer>
    </main>
  );
}
