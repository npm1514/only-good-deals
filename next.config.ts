import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Placeholder product images until real Amazon images come in via PA-API.
      { protocol: "https", hostname: "placehold.co" }
    ]
  }
};

export default nextConfig;
