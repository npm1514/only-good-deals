import Image from "next/image";
import type { Deal } from "@/data/deals";
import { buildAffiliateUrl } from "@/lib/amazon";

export default function DealCard({ deal }: { deal: Deal }) {
  const discount = Math.round((1 - deal.price / deal.originalPrice) * 100);
  const url = buildAffiliateUrl(deal);

  return (
    <article className="deal-card">
      <div className="image-wrap">
        <Image
          src={deal.image}
          alt={deal.title}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          style={{ objectFit: "cover" }}
        />
        {discount > 0 && <span className="discount">-{discount}%</span>}
        {deal.tag && <span className="deal-tag">{deal.tag}</span>}
      </div>
      <div className="deal-body">
        <p className="category">{deal.category}</p>
        <h3>{deal.title}</h3>
        <p className="note">{deal.note}</p>
        <div className="price-row">
          <strong>${deal.price.toFixed(2)}</strong>
          {deal.originalPrice > deal.price && <del>${deal.originalPrice.toFixed(2)}</del>}
        </div>
        <a className="deal-button" href={url} target="_blank" rel="sponsored noopener noreferrer">
          See the deal →
        </a>
      </div>
    </article>
  );
}
