import { render, screen } from "@testing-library/react";
import DealCard from "./DealCard";
import { buildAffiliateUrl } from "@/lib/amazon";
import type { Deal } from "@/data/deals";

const sampleDeal: Deal = {
  id: 1,
  title: "Test Speaker",
  category: "Electronics",
  price: 25,
  originalPrice: 100,
  note: "A great test speaker for the price.",
  image: "https://placehold.co/900x700/e8e3d9/1a1a1a?text=Test+Speaker",
  searchQuery: "Test Speaker",
  tag: "Huge drop",
};

describe("DealCard", () => {
  it("renders the deal's title, note, price, and original price", () => {
    render(<DealCard deal={sampleDeal} />);

    expect(screen.getByText("Test Speaker")).toBeInTheDocument();
    expect(screen.getByText(sampleDeal.note)).toBeInTheDocument();
    expect(screen.getByText("$25.00")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
  });

  it("computes and displays the correct discount percentage", () => {
    render(<DealCard deal={sampleDeal} />);

    // 25 vs 100 is a 75% discount.
    expect(screen.getByText("-75%")).toBeInTheDocument();
  });

  it("links out to a correctly tagged affiliate URL, marked as sponsored", () => {
    render(<DealCard deal={sampleDeal} />);

    const link = screen.getByRole("link", { name: /see the deal/i });
    expect(link).toHaveAttribute("href", buildAffiliateUrl(sampleDeal));
    expect(link).toHaveAttribute("rel", expect.stringContaining("sponsored"));
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("deep-links straight to the product page when an ASIN is known", () => {
    const dealWithAsin: Deal = { ...sampleDeal, asin: "B0TESTASIN1" };
    render(<DealCard deal={dealWithAsin} />);

    const link = screen.getByRole("link", { name: /see the deal/i });
    expect(link.getAttribute("href")).toContain("/dp/B0TESTASIN1");
  });

  it("renders an optional tag badge when present", () => {
    render(<DealCard deal={sampleDeal} />);
    expect(screen.getByText("Huge drop")).toBeInTheDocument();
  });

  it("omits the tag badge when the deal has none", () => {
    const { tag: _tag, ...noTagDeal } = sampleDeal;
    render(<DealCard deal={noTagDeal as Deal} />);
    expect(screen.queryByText("Huge drop")).not.toBeInTheDocument();
  });

  it("hides the discount badge and strikethrough price when there's no actual discount", () => {
    const noDiscountDeal: Deal = { ...sampleDeal, price: 19, originalPrice: 19 };
    render(<DealCard deal={noDiscountDeal} />);
    expect(screen.queryByText("-0%")).not.toBeInTheDocument();
    expect(screen.queryByText("$19.00", { selector: "del" })).not.toBeInTheDocument();
  });
});
