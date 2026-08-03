import type { Product } from "@/services/shopService";

/**
 * Static fallback products for Honey pages.
 * Used when the shop API returns no products (offline / empty DB).
 *
 * NOTE: Keep shape aligned with `src/services/shopService.ts` Product interface.
 */
export const initialHoneyProducts: Product[] = [
  // --- HONEY (8 Items - Kibwezi BeeYield Apiary) ---
  {
    id: "h1",
    name: "BeeYield Premium Acacia",
    description: "Harvested from our flagship BeeYield apiary in Kibwezi, this premium grade Acacia honey is known for its clarity and delicate floral notes.",
    category: "honey",
    badge: "Premium",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 245,
    is_active: true,
    variants: [
      { id: "vh1-1", size: "250g", price_kes: 250, stock_quantity: 120, is_available: true },
      { id: "vh1-2", size: "500g", price_kes: 500, stock_quantity: 84, is_available: true },
      { id: "vh1-3", size: "1kg", price_kes: 1000, stock_quantity: 36, is_available: true }
    ]
  },
  {
    id: "h2",
    name: "BeeYield Acacia",
    description: "Pure Acacia honey sourced directly from our Kibwezi forest site. A classic Kenyan favorite with exceptional multi-floral complexity.",
    category: "honey",
    badge: "Top Seller",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5,
    review_count: 182,
    is_active: true,
    variants: [
      { id: "vh2-1", size: "250g", price_kes: 250, stock_quantity: 95, is_available: true },
      { id: "vh2-2", size: "500g", price_kes: 500, stock_quantity: 66, is_available: true },
      { id: "vh2-3", size: "1kg", price_kes: 1000, stock_quantity: 28, is_available: true }
    ]
  },
  {
    id: "h3",
    name: "BeeYield Premium Acacia",
    description: "A limited selection from our Kibwezi reserve. Gravity-filtered to preserve the natural enzymes and the distinct aroma of local Acacia blossoms.",
    category: "honey",
    badge: "Reserve",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.8,
    review_count: 115,
    is_active: true,
    variants: [
      { id: "vh3-1", size: "250g", price_kes: 250, stock_quantity: 50, is_available: true },
      { id: "vh3-2", size: "500g", price_kes: 500, stock_quantity: 35, is_available: true },
      { id: "vh3-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true }
    ]
  },
  {
    id: "h4",
    name: "BeeYield Acacia",
    description: "Natural, raw Acacia honey from our sustainable Kibwezi apiary. Perfectly balanced sweetness with a smooth, lingering finish.",
    category: "honey",
    badge: null,
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.7,
    review_count: 92,
    is_active: true,
    variants: [
      { id: "vh4-1", size: "250g", price_kes: 250, stock_quantity: 150, is_available: true },
      { id: "vh4-2", size: "500g", price_kes: 500, stock_quantity: 105, is_available: true },
      { id: "vh4-3", size: "1kg", price_kes: 1000, stock_quantity: 45, is_available: true }
    ]
  },
  {
    id: "h5",
    name: "BeeYield Premium Acacia",
    description: "Our highest grade Acacia honey, harvested during the peak blossom season in Kibwezi. Unmatched purity and nutritional density.",
    category: "honey",
    badge: "LTD Edition",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 140,
    is_active: true,
    variants: [
      { id: "vh5-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true },
      { id: "vh5-2", size: "500g", price_kes: 500, stock_quantity: 28, is_available: true },
      { id: "vh5-3", size: "1kg", price_kes: 1000, stock_quantity: 12, is_available: true }
    ]
  },
  {
    id: "h6",
    name: "BeeYield Acacia",
    description: "100% pure honey from our Kibwezi community apiary. Supporting local beekeeping while delivering the finest natural sweetness.",
    category: "honey",
    badge: "Community",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5,
    review_count: 67,
    is_active: true,
    variants: [
      { id: "vh6-1", size: "250g", price_kes: 250, stock_quantity: 85, is_available: true },
      { id: "vh6-2", size: "500g", price_kes: 500, stock_quantity: 59, is_available: true },
      { id: "vh6-3", size: "1kg", price_kes: 1000, stock_quantity: 25, is_available: true }
    ]
  },
  {
    id: "h7",
    name: "BeeYield Premium Acacia",
    description: "Select harvest from our Kibwezi wild-forage zones. Rich in antioxidants and preserved in its rawest state for your wellness.",
    category: "honey",
    badge: "Raw",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.8,
    review_count: 89,
    is_active: true,
    variants: [
      { id: "vh7-1", size: "250g", price_kes: 250, stock_quantity: 60, is_available: true },
      { id: "vh7-2", size: "500g", price_kes: 500, stock_quantity: 42, is_available: true },
      { id: "vh7-3", size: "1kg", price_kes: 1000, stock_quantity: 18, is_available: true }
    ]
  },
  {
    id: "h8",
    name: "BeeYield Acacia",
    description: "Crafted by bees in the pristine acacia thickets of Kibwezi. Authentic, traceable, and deeply nutritious raw honey.",
    category: "honey",
    badge: "Authentic",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 103,
    is_active: true,
    variants: [
      { id: "vh8-1", size: "250g", price_kes: 250, stock_quantity: 110, is_available: true },
      { id: "vh8-2", size: "500g", price_kes: 500, stock_quantity: 77, is_available: true },
      { id: "vh8-3", size: "1kg", price_kes: 1000, stock_quantity: 33, is_available: true }
    ]
  },
  // --- SENSORS (8 Items) ---
  {
    id: "s1",
    name: "BeeYield Smart Hive Monitor",
    description: "Advanced acoustic and temperature monitoring for optimal hive health.",
    category: "hardware",
    badge: "Featured",
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.8,
    review_count: 42,
    is_active: true,
    variants: [{ id: "vs1", size: "Standard", price_kes: 15000, stock_quantity: 50, is_available: true }]
  },
  {
    id: "s2",
    name: "Hive Heat Sensor",
    description: "Precise brood nest temperature tracking in any climate.",
    category: "hardware",
    badge: null,
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.6,
    review_count: 28,
    is_active: true,
    variants: [{ id: "vs2", size: "Standard", price_kes: 4500, stock_quantity: 100, is_available: true }]
  },
  {
    id: "s3",
    name: "Humidity Controller",
    description: "Maintain optimal hive environment to prevent mold and moisture.",
    category: "hardware",
    badge: null,
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.7,
    review_count: 15,
    is_active: true,
    variants: [{ id: "vs3", size: "Standard", price_kes: 6200, stock_quantity: 30, is_available: true }]
  },
  {
    id: "s4",
    name: "Activity Monitor",
    description: "Track bee flight patterns and traffic in real-time.",
    category: "hardware",
    badge: "New",
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.9,
    review_count: 12,
    is_active: true,
    variants: [{ id: "vs4", size: "Standard", price_kes: 8500, stock_quantity: 25, is_available: true }]
  },
  {
    id: "s5",
    name: "Queen Cell Sensor",
    description: "Early detection of swarming or supersedure cells.",
    category: "hardware",
    badge: null,
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.5,
    review_count: 9,
    is_active: true,
    variants: [{ id: "vs5", size: "Standard", price_kes: 5800, stock_quantity: 40, is_available: true }]
  },
  {
    id: "s6",
    name: "Propolis Weight Sensor",
    description: "Monitor hive productivity by tracking weight changes.",
    category: "hardware",
    badge: null,
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.4,
    review_count: 21,
    is_active: true,
    variants: [{ id: "vs6", size: "Standard", price_kes: 12500, stock_quantity: 15, is_available: true }]
  },
  {
    id: "s7",
    name: "Smart Hive Battery Pack",
    description: "Extended power for remote honey production sites.",
    category: "hardware",
    badge: null,
    images: ["/images/products/beeyield_sensor.png"],
    rating: 4.7,
    review_count: 34,
    is_active: true,
    variants: [{ id: "vs7", size: "Standard", price_kes: 3500, stock_quantity: 60, is_available: true }]
  },
  {
    id: "s8",
    name: "Apiary Solar Station",
    description: "Renewable energy for all your sensors and connectivity.",
    category: "hardware",
    badge: "Eco",
    images: ["/images/products/beeyield_sensor.png"],
    rating: 5.0,
    review_count: 7,
    is_active: true,
    variants: [{ id: "vs8", size: "Standard", price_kes: 22000, stock_quantity: 10, is_available: true }]
  },



  // --- LEARN (8 Items) ---
  {
    id: "l1",
    name: "Introduction to Apiculture",
    description: "Complete guide for beginners to start their first hive.",
    category: "education",
    badge: "Free Extract",
    images: ["/images/products/beeyield_course.png"],
    rating: 4.9,
    review_count: 320,
    is_active: true,
    variants: [{ id: "vl1", size: "E-Book", price_kes: 1500, stock_quantity: 999, is_available: true }]
  },
  {
    id: "l2",
    name: "Advanced Hive Management",
    description: "Master the art of high-yield sustainable beekeeping.",
    category: "education",
    badge: "Bestseller",
    images: ["/images/products/beeyield_course.png"],
    rating: 5.0,
    review_count: 215,
    is_active: true,
    variants: [{ id: "vl2", size: "Video Course", price_kes: 5500, stock_quantity: 999, is_available: true }]
  },
  {
    id: "l3",
    name: "Pest & Disease Control",
    description: "Keep your colonies healthy and strong throughout the year.",
    category: "education",
    badge: null,
    images: ["/images/products/beeyield_course.png"],
    rating: 4.8,
    review_count: 142,
    is_active: true,
    variants: [{ id: "vl3", size: "Digital Guide", price_kes: 2200, stock_quantity: 999, is_available: true }]
  },
  {
    id: "l4",
    name: "Organic Honey Certification",
    description: "Learn how to meet global organic standards for your harvest.",
    category: "education",
    badge: null,
    images: ["/images/products/beeyield_course.png"],
    rating: 4.7,
    review_count: 88,
    is_active: true,
    variants: [{ id: "vl4", size: "Certification Course", price_kes: 8500, stock_quantity: 999, is_available: true }]
  },
  {
    id: "l5",
    name: "Wintering Success Guide",
    description: "Ensure your bees survive the cold season with expert techniques.",
    category: "education",
    badge: "Seasonal",
    images: ["/images/products/beeyield_course.png"],
    rating: 4.9,
    review_count: 67,
    is_active: true,
    variants: [{ id: "vl5", size: "E-Book", price_kes: 1800, stock_quantity: 999, is_available: true }]
  },
  {
    id: "l6",
    name: "Pollination Services 101",
    description: "Turn your beekeeping hobby into a professional pollination service.",
    category: "education",
    badge: "Pro",
    images: ["/images/products/beeyield_course.png"],
    rating: 5.0,
    review_count: 94,
    is_active: true,
    variants: [{ id: "vl6", size: "Workshop", price_kes: 12000, stock_quantity: 50, is_available: true }]
  },
  {
    id: "l7",
    name: "Queen Rearing Masterclass",
    description: "Techniques for breeding superior queens and colony genetics.",
    category: "education",
    badge: "Advanced",
    images: ["/images/products/beeyield_course.png"],
    rating: 4.8,
    review_count: 53,
    is_active: true,
    variants: [{ id: "vl7", size: "Full Course", price_kes: 9500, stock_quantity: 999, is_available: true }]
  },
  {
    id: "l8",
    name: "Urban Beekeeping Essentials",
    description: "Thrive with hives in any city landscape or small space.",
    category: "education",
    badge: null,
    images: ["/images/products/beeyield_course.png"],
    rating: 4.6,
    review_count: 121,
    is_active: true,
    variants: [{ id: "vl8", size: "E-Book", price_kes: 1400, stock_quantity: 999, is_available: true }]
  }
];
