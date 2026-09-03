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
    originalPrice: 20,
    note: "A cheap electronics deal.",
    verifiedAt: "2026-09-03",
    image: "https://placehold.co/900x700?text=Cheap+Gadget",
    searchQuery: "Cheap Gadget",
  },
  {
    id: 2,
    title: "Pricey Grill",
    category: "Outdoors",
    price: 200,
    originalPrice: 300,
    note: "An expensive outdoor deal.",
    verifiedAt: "2026-09-03",
    image: "https://placehold.co/900x700?text=Pricey+Grill",
    searchQuery: "Pricey Grill",
  },
  {
    id: 3,
    title: "Mid Kitchen Tool",
    category: "Kitchen",
    price: 40,
    originalPrice: 60,
    note: "A mid-priced kitchen deal.",
    verifiedAt: "2026-09-03",
    image: "https://placehold.co/900x700?text=Mid+Kitchen+Tool",
    searchQuery: "Mid Kitchen Tool",
  },
];

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
});
