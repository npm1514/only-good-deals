import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Only Good Deals | Deals actually worth buying",
  description: "A curated feed of unusually good deals. No junk. No fake bargains. Only good deals."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
