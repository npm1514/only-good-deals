"use client";

import { useMemo, useState } from "react";
import DealCard from "./DealCard";
import type { Deal } from "@/data/deals";

const CATEGORIES = ["All", "Electronics", "Home", "Tools", "Kitchen", "Outdoors", "Personal Care", "Under $25"];
const UNDER_25 = "Under $25";
const UNDER_25_THRESHOLD = 25;

function matchesCategory(deal: Deal, category: string): boolean {
  if (category === "All") return true;
  if (category === UNDER_25) return deal.price < UNDER_25_THRESHOLD;
  return deal.category === category;
}

export default function DealsGrid({ deals }: { deals: Deal[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredDeals = useMemo(
    () => deals.filter((deal) => matchesCategory(deal, activeCategory)),
    [deals, activeCategory],
  );

  return (
    <>
      <div className="filters" role="group" aria-label="Filter deals by category">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={category === activeCategory ? "active" : ""}
            aria-pressed={category === activeCategory}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredDeals.length > 0 ? (
        <div className="deal-grid">
          {filteredDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
        </div>
      ) : (
        <p className="empty-state">No deals in this category yet — check back soon.</p>
      )}
    </>
  );
}
