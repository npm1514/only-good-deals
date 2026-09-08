import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Only Good Deals",
    short_name: "Only Good Deals",
    description: "Deals tracked live and checked against real price history. No junk. No fake bargains. Only good deals.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0e7",
    theme_color: "#f5f0e7",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
