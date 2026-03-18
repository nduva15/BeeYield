import type { Product } from "@/services/shopService";

/**
 * Static fallback products for Honey pages.
 * Used when the shop API returns no products (offline / empty DB).
 *
 * NOTE: Keep shape aligned with `src/services/shopService.ts` Product interface.
 */
export const initialHoneyProducts: Product[] = [
  {
    id: "h1",
    name: "BeeYield Premium Acacia",
    description:
      "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "Bestseller",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png",
    ],
    rating: 4.9,
    review_count: 245,
    is_active: true,
    variants: [
      { id: "vh1-1", size: "250g", price_kes: 250, stock_quantity: 100, is_available: true },
      { id: "vh1-2", size: "500g", price_kes: 500, stock_quantity: 75, is_available: true },
      { id: "vh1-3", size: "1kg", price_kes: 1000, stock_quantity: 50, is_available: true },
    ],
  },
  {
    id: "h2",
    name: "BeeYield Wildflower Reserve",
    description:
      "A complex seasonal blend from diverse wild forage. Balanced floral aroma with a smooth finish.",
    category: "honey",
    badge: "Premium",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png",
    ],
    rating: 5.0,
    review_count: 182,
    is_active: true,
    variants: [
      { id: "vh2-1", size: "250g", price_kes: 250, stock_quantity: 80, is_available: true },
      { id: "vh2-2", size: "500g", price_kes: 500, stock_quantity: 60, is_available: true },
      { id: "vh2-3", size: "1kg", price_kes: 1000, stock_quantity: 30, is_available: true },
    ],
  },
  {
    id: "h3",
    name: "BeeYield Forest Dark",
    description:
      "Rich and robust, with deep malt notes and a darker amber hue. Ideal for tea, baking, and marinades.",
    category: "honey",
    badge: "Rare",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png",
    ],
    rating: 4.8,
    review_count: 96,
    is_active: true,
    variants: [
      { id: "vh3-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true },
      { id: "vh3-2", size: "500g", price_kes: 500, stock_quantity: 30, is_available: true },
      { id: "vh3-3", size: "1kg", price_kes: 1000, stock_quantity: 20, is_available: true },
    ],
  },
  {
    id: "h4",
    name: "BeeYield Citrus Blossom",
    description:
      "Bright and aromatic with subtle citrus notes. A clean, uplifting profile from orchard bloom.",
    category: "honey",
    badge: "Limited Edition",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png",
    ],
    rating: 4.9,
    review_count: 54,
    is_active: true,
    variants: [
      { id: "vh4-1", size: "250g", price_kes: 250, stock_quantity: 35, is_available: true },
      { id: "vh4-2", size: "500g", price_kes: 500, stock_quantity: 25, is_available: true },
      { id: "vh4-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true },
    ],
  },
];
