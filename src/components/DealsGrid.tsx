"use client";

import { useMemo, useState } from "react";
import DealCard from "./DealCard";
import type { Deal } from "@/data/deals";

const CATEGORIES = ["All", "Electronics", "Home", "Tools", "Kitchen", "Outdoors", "Personal Care", "Under $25"];
const UNDER_25 = "Under $25";
const UNDER_25_THRESHOLD = 25;

const SORTS = {
  discount: "Biggest discount",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  newest: "Just checked",
} as const;
type SortKey = keyof typeof SORTS;
const SORT_KEYS = Object.keys(SORTS) as SortKey[];

const MIN_DISCOUNTS = [0, 20, 30, 50] as const;

function matchesCategory(deal: Deal, category: string): boolean {
  if (category === "All") return true;
  if (category === UNDER_25) return deal.price < UNDER_25_THRESHOLD;
  return deal.category === category;
}

function discountPercent(deal: Deal): number {
  if (deal.originalPrice <= 0) return 0;
  return (1 - deal.price / deal.originalPrice) * 100;
}

function matchesSearch(deal: Deal, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  return `${deal.title} ${deal.category} ${deal.note}`.toLowerCase().includes(trimmed);
}

function checkedAtMs(deal: Deal): number {
  return deal.priceCheckedAt ? new Date(deal.priceCheckedAt).getTime() : 0;
}

function compareDeals(a: Deal, b: Deal, sort: SortKey): number {
  switch (sort) {
    case "price-asc":
      return a.price - b.price;
    case "price-desc":
      return b.price - a.price;
    case "newest":
      return checkedAtMs(b) - checkedAtMs(a);
    case "discount":
    default:
      return discountPercent(b) - discountPercent(a);
  }
}

export default function DealsGrid({ deals }: { deals: Deal[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("discount");
  const [minDiscount, setMinDiscount] = useState<number>(0);

  const filteredDeals = useMemo(
    () =>
      deals
        .filter((deal) => matchesCategory(deal, activeCategory))
        .filter((deal) => matchesSearch(deal, search))
        .filter((deal) => discountPercent(deal) >= minDiscount)
        .sort((a, b) => compareDeals(a, b, sort)),
    [deals, activeCategory, search, minDiscount, sort],
  );

  return (
    <>
      <div className="controls">
        <input
          type="search"
          className="search-input"
          placeholder="Search deals…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search deals"
        />
        <label className="control-select">
          Sort
          <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} aria-label="Sort deals">
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {SORTS[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="control-select">
          Min discount
          <select
            value={minDiscount}
            onChange={(event) => setMinDiscount(Number(event.target.value))}
            aria-label="Minimum discount"
          >
            {MIN_DISCOUNTS.map((pct) => (
              <option key={pct} value={pct}>
                {pct === 0 ? "Any" : `${pct}%+`}
              </option>
            ))}
          </select>
        </label>
      </div>

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
        <p className="empty-state">
          {search.trim() || minDiscount > 0
            ? "No deals match your filters — try loosening them up."
            : "No deals in this category yet — check back soon."}
        </p>
      )}
    </>
  );
}
