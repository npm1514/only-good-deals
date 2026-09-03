import { render, screen } from "@testing-library/react";
import DealCard from "./DealCard";
import type { Deal } from "@/data/deals";

const sampleDeal: Deal = {
  id: 1,
  title: "Test Speaker",
  category: "Electronics",
  price: 25,
  originalPrice: 100,
  rating: 4.5,
  reviews: 1234,
  image: "https://images.unsplash.com/test.jpg",
  url: "https://amazon.com/dp/TEST123?tag=onlygooddeals-20",
  tag: "Huge drop",
};

describe("DealCard", () => {
  it("renders the deal's title, price, and original price", () => {
    render(<DealCard deal={sampleDeal} />);

    expect(screen.getByText("Test Speaker")).toBeInTheDocument();
    expect(screen.getByText("$25.00")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
  });

  it("computes and displays the correct discount percentage", () => {
    render(<DealCard deal={sampleDeal} />);

    // 25 vs 100 is a 75% discount.
    expect(screen.getByText("-75%")).toBeInTheDocument();
  });

  it("links out to the deal URL and marks it as a sponsored link", () => {
    render(<DealCard deal={sampleDeal} />);

    const link = screen.getByRole("link", { name: /see the deal/i });
    expect(link).toHaveAttribute("href", sampleDeal.url);
    expect(link).toHaveAttribute("rel", expect.stringContaining("sponsored"));
    expect(link.getAttribute("target")).toBe("_blank");
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
});
