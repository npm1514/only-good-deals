import { membershipOffers } from "@/data/memberships";

export default function MembershipOffers() {
  return (
    <section className="memberships" aria-label="Amazon membership free trials">
      <div className="section-heading">
        <div>
          <p className="eyebrow">FREE TRIALS</p>
          <h2>Worth grabbing too.</h2>
        </div>
      </div>
      <div className="membership-grid">
        {membershipOffers.map((offer) => (
          <article key={offer.id} className="membership-card">
            <h3>{offer.name}</h3>
            <p>{offer.pitch}</p>
            <a className="deal-button" href={offer.url} target="_blank" rel="sponsored noopener noreferrer">
              Try it free →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
