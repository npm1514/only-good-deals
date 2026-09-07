import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DealsGrid from "./DealsGrid";
import type { Deal } from "@/data/deals";

const testDeals: Deal[] = [
  {
    id: 1,
    title: "Cheap Gadget",
    category: "Electronics",
    price: 15,
    originalPrice: 20, // 25% off
    note: "A cheap electronics deal.",
    verifiedAt: "2026-09-03",
    priceCheckedAt: "2026-09-01T00:00:00.000Z",
    image: "https://placehold.co/900x700?text=Cheap+Gadget",
    searchQuery: "Cheap Gadget",
  },
  {
    id: 2,
    title: "Pricey Grill",
    category: "Outdoors",
    price: 200,
    originalPrice: 300, // 33.3% off
    note: "An expensive outdoor deal.",
    verifiedAt: "2026-09-03",
    priceCheckedAt: "2026-09-03T00:00:00.000Z",
    image: "https://placehold.co/900x700?text=Pricey+Grill",
    searchQuery: "Pricey Grill",
  },
  {
    id: 3,
    title: "Mid Kitchen Tool",
    category: "Kitchen",
    price: 40,
    originalPrice: 50, // 20% off
    note: "A mid-priced kitchen deal.",
    verifiedAt: "2026-09-03",
    priceCheckedAt: "2026-09-02T00:00:00.000Z",
    image: "https://placehold.co/900x700?text=Mid+Kitchen+Tool",
    searchQuery: "Mid Kitchen Tool",
  },
  {
    id: 4,
    title: "Budget Earbuds",
    category: "Electronics",
    price: 10,
    originalPrice: 40, // 75% off
    note: "A steep discount on basic earbuds.",
    verifiedAt: "2026-09-04",
    priceCheckedAt: "2026-09-04T00:00:00.000Z",
    image: "https://placehold.co/900x700?text=Budget+Earbuds",
    searchQuery: "Budget Earbuds",
  },
];

function headingTexts() {
  return screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
}

describe("DealsGrid", () => {
  it("shows every deal under the 'All' filter by default", () => {
    render(<DealsGrid deals={testDeals} />);
    expect(screen.getByText("Cheap Gadget")).toBeInTheDocument();
    expect(screen.getByText("Pricey Grill")).toBeInTheDocument();
    expect(screen.getByText("Mid Kitchen Tool")).toBeInTheDocument();
  });

  it("filters down to only the selected category", async () => {
    const user = userEvent.setup();
    render(<DealsGrid deals={testDeals} />);

    await user.click(screen.getByRole("button", { name: "Outdoors" }));

    expect(screen.getByText("Pricey Grill")).toBeInTheDocument();
    expect(screen.queryByText("Cheap Gadget")).not.toBeInTheDocument();
    expect(screen.queryByText("Mid Kitchen Tool")).not.toBeInTheDocument();
  });

  it("filters by price for the 'Under $25' pseudo-category, across real categories", async () => {
    const user = userEvent.setup();
    render(<DealsGrid deals={testDeals} />);

    await user.click(screen.getByRole("button", { name: "Under $25" }));

    expect(screen.getByText("Cheap Gadget")).toBeInTheDocument();
    expect(screen.queryByText("Pricey Grill")).not.toBeInTheDocument();
    expect(screen.queryByText("Mid Kitchen Tool")).not.toBeInTheDocument();
  });

  it("marks the active filter button, and only that one, as pressed", async () => {
    const user = userEvent.setup();
    render(<DealsGrid deals={testDeals} />);

    await user.click(screen.getByRole("button", { name: "Kitchen" }));

    expect(screen.getByRole("button", { name: "Kitchen" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
  });

  it("shows a friendly empty state when a category has no matches", async () => {
    const user = userEvent.setup();
    render(<DealsGrid deals={testDeals} />);

    await user.click(screen.getByRole("button", { name: "Tools" }));

    expect(screen.getByText(/no deals in this category yet/i)).toBeInTheDocument();
  });

  it("returns to showing everything when 'All' is clicked again", async () => {
    const user = userEvent.setup();
    render(<DealsGrid deals={testDeals} />);

    await user.click(screen.getByRole("button", { name: "Outdoors" }));
    await user.click(screen.getByRole("button", { name: "All" }));

    expect(screen.getByText("Cheap Gadget")).toBeInTheDocument();
    expect(screen.getByText("Pricey Grill")).toBeInTheDocument();
    expect(screen.getByText("Mid Kitchen Tool")).toBeInTheDocument();
  });

  describe("search", () => {
    it("narrows results by title", async () => {
      const user = userEvent.setup();
      render(<DealsGrid deals={testDeals} />);

      await user.type(screen.getByLabelText("Search deals"), "grill");

      expect(screen.getByText("Pricey Grill")).toBeInTheDocument();
      expect(screen.queryByText("Cheap Gadget")).not.toBeInTheDocument();
      expect(screen.queryByText("Mid Kitchen Tool")).not.toBeInTheDocument();
      expect(screen.queryByText("Budget Earbuds")).not.toBeInTheDocument();
    });

    it("also matches on category, case-insensitively", async () => {
      const user = userEvent.setup();
      render(<DealsGrid deals={testDeals} />);

      await user.type(screen.getByLabelText("Search deals"), "KITCHEN");

      expect(screen.getByText("Mid Kitchen Tool")).toBeInTheDocument();
      expect(screen.queryByText("Pricey Grill")).not.toBeInTheDocument();
    });

    it("shows a 'no matches' empty state, distinct from the category one, for a search miss", async () => {
      const user = userEvent.setup();
      render(<DealsGrid deals={testDeals} />);

      await user.type(screen.getByLabelText("Search deals"), "nonexistent product xyz");

      expect(screen.getByText(/no deals match your filters/i)).toBeInTheDocument();
    });
  });

  describe("minimum discount filter", () => {
    it("keeps only deals at or above the chosen discount", async () => {
      const user = userEvent.setup();
      render(<DealsGrid deals={testDeals} />);

      await user.selectOptions(screen.getByLabelText("Minimum discount"), "50");

      expect(screen.getByText("Budget Earbuds")).toBeInTheDocument();
      expect(screen.queryByText("Cheap Gadget")).not.toBeInTheDocument();
      expect(screen.queryByText("Pricey Grill")).not.toBeInTheDocument();
      expect(screen.queryByText("Mid Kitchen Tool")).not.toBeInTheDocument();
    });
  });

  describe("sort", () => {
    it("defaults to biggest discount first", () => {
      render(<DealsGrid deals={testDeals} />);

      expect(headingTexts()).toEqual(["Budget Earbuds", "Pricey Grill", "Cheap Gadget", "Mid Kitchen Tool"]);
    });

    it("sorts by price, low to high", async () => {
      const user = userEvent.setup();
      render(<DealsGrid deals={testDeals} />);

      await user.selectOptions(screen.getByLabelText("Sort deals"), "price-asc");

      expect(headingTexts()).toEqual(["Budget Earbuds", "Cheap Gadget", "Mid Kitchen Tool", "Pricey Grill"]);
    });

    it("sorts by price, high to low", async () => {
      const user = userEvent.setup();
      render(<DealsGrid deals={testDeals} />);

      await user.selectOptions(screen.getByLabelText("Sort deals"), "price-desc");

      expect(headingTexts()).toEqual(["Pricey Grill", "Mid Kitchen Tool", "Cheap Gadget", "Budget Earbuds"]);
    });

    it("sorts by most recently price-checked", async () => {
      const user = userEvent.setup();
      render(<DealsGrid deals={testDeals} />);

      await user.selectOptions(screen.getByLabelText("Sort deals"), "newest");

      expect(headingTexts()).toEqual(["Budget Earbuds", "Pricey Grill", "Mid Kitchen Tool", "Cheap Gadget"]);
    });
  });
});
