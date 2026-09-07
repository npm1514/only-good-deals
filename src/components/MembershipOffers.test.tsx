import { render, screen } from "@testing-library/react";
import MembershipOffers from "./MembershipOffers";
import { membershipOffers } from "@/data/memberships";

describe("MembershipOffers", () => {
  it("renders a card for every offer, each linking out with the Associate tag", () => {
    render(<MembershipOffers />);

    for (const offer of membershipOffers) {
      expect(screen.getByRole("heading", { name: offer.name, level: 3 })).toBeInTheDocument();
    }

    const links = screen.getAllByRole("link", { name: /try it free/i });
    expect(links).toHaveLength(membershipOffers.length);
    links.forEach((link) => {
      expect(link).toHaveAttribute("href", expect.stringContaining("tag=only-good-deals-20"));
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("sponsored");
    });
  });
});
