export type Deal = {
  id: number;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  url: string;
  tag?: string;
};

export const deals: Deal[] = [
  {
    id: 1,
    title: "Portable Bluetooth Speaker",
    category: "Electronics",
    price: 29.99,
    originalPrice: 79.99,
    rating: 4.6,
    reviews: 8432,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",
    url: "#",
    tag: "Huge drop"
  },
  {
    id: 2,
    title: "Cordless Power Drill Kit",
    category: "Tools",
    price: 42.0,
    originalPrice: 99.0,
    rating: 4.7,
    reviews: 5219,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
    url: "#",
    tag: "Worth grabbing"
  },
  {
    id: 3,
    title: "Minimal Desk Lamp",
    category: "Home",
    price: 18.49,
    originalPrice: 44.99,
    rating: 4.5,
    reviews: 3114,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    url: "#"
  },
  {
    id: 4,
    title: "Compact Camp Stove",
    category: "Outdoors",
    price: 24.99,
    originalPrice: 64.99,
    rating: 4.8,
    reviews: 1964,
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=900&q=80",
    url: "#",
    tag: "Deep discount"
  },
  {
    id: 5,
    title: "Noise-Isolating Headphones",
    category: "Electronics",
    price: 39.95,
    originalPrice: 89.95,
    rating: 4.4,
    reviews: 10488,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    url: "#"
  },
  {
    id: 6,
    title: "Stainless Kitchen Knife Set",
    category: "Kitchen",
    price: 34.5,
    originalPrice: 84.99,
    rating: 4.7,
    reviews: 6251,
    image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=900&q=80",
    url: "#",
    tag: "Editor pick"
  }
];
