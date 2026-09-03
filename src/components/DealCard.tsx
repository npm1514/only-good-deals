import type { Deal } from "@/data/deals";

export default function DealCard({ deal }: { deal: Deal }) {
  const discount = Math.round((1 - deal.price / deal.originalPrice) * 100);

  return (
    <article className="deal-card">
      <div className="image-wrap">
        <img src={deal.image} alt={deal.title} />
        <span className="discount">-{discount}%</span>
        {deal.tag && <span className="deal-tag">{deal.tag}</span>}
      </div>
      <div className="deal-body">
        <p className="category">{deal.category}</p>
        <h3>{deal.title}</h3>
        <div className="rating">★ {deal.rating} <span>({deal.reviews.toLocaleString()})</span></div>
        <div className="price-row">
          <strong>${deal.price.toFixed(2)}</strong>
          <del>${deal.originalPrice.toFixed(2)}</del>
        </div>
        <a className="deal-button" href={deal.url} target="_blank" rel="sponsored noopener noreferrer">
          See the deal →
        </a>
      </div>
    </article>
  );
}
