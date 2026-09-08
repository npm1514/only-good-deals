import Image from "next/image";
import type { Deal } from "@/data/deals";
import { buildAffiliateUrl } from "@/lib/amazon";

function formatVerifiedDate(isoDate: string): string {
  // Parse as UTC to avoid a timezone off-by-one day.
  const date = new Date(`${isoDate}T00:00:00Z`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function formatCheckedTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DealCard({ deal }: { deal: Deal }) {
  const discount = Math.round((1 - deal.price / deal.originalPrice) * 100);
  const url = buildAffiliateUrl(deal);

  return (
    <article className="deal-card">
      {deal.image ? (
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
      ) : (
        <div className="no-image-header">
          {deal.tag && <span className="deal-tag">{deal.tag}</span>}
          {discount > 0 && <span className="discount">-{discount}%</span>}
        </div>
      )}
      <div className="deal-body">
        <p className="category">{deal.category}</p>
        <h3>{deal.title}</h3>
        <p className="note">{deal.note}</p>
        <div className="price-row" data-nosnippet>
          <strong>${deal.price.toFixed(2)}</strong>
          {deal.originalPrice > deal.price && <del>${deal.originalPrice.toFixed(2)}</del>}
        </div>
        {deal.priceCheckedAt ? (
          <p className="verified live">Price checked via Keepa {formatCheckedTime(deal.priceCheckedAt)}</p>
        ) : (
          <p className="verified">Price verified {formatVerifiedDate(deal.verifiedAt)}</p>
        )}
        <a className="deal-button" href={url} target="_blank" rel="sponsored noopener noreferrer">
          See the deal →
        </a>
      </div>
    </article>
  );
}
