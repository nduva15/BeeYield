export type ProductCategory = 'honey' | 'hardware' | 'education';

export interface ProductVariant {
  id: string;
  size: string;
  price_kes: number;
  stock_quantity: number;
  is_available: boolean;
  batch_code?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  badge: string | null;
  images: string[];
  rating: number;
  review_count: number;
  is_active: boolean;
  variants: ProductVariant[];
}

/**
 * Canonical static catalog.
 * Exactly 8 items per category: honey, hardware (sensors), education (learn).
 */
export const CATALOG: Product[] = [
  // --- HONEY (8 Items - Kibwezi BeeYield Apiary) ---
  {
    id: "h1",
    name: "BeeYield Premium Acacia",
    description: "Harvested from our flagship BeeYield apiary in Kibwezi, this premium grade Acacia honey is known for its clarity and delicate floral notes.",
    category: "honey",
    badge: "Premium",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 4.9,
    review_count: 245,
    is_active: true,
    variants: [
      { id: "vh1-1", size: "250g", price_kes: 250, stock_quantity: 120, is_available: true, batch_code: "KIB-ACAC-211-250G" },
      { id: "vh1-2", size: "500g", price_kes: 500, stock_quantity: 84, is_available: true, batch_code: "KIB-ACAC-212-500G" },
      { id: "vh1-3", size: "1kg", price_kes: 1000, stock_quantity: 36, is_available: true, batch_code: "KIB-ACAC-213-1KG" }
    ]
  },
  {
    id: "h2",
    name: "BeeYield Acacia",
    description: "Pure Acacia honey sourced directly from our Kibwezi forest site. A classic Kenyan favorite with exceptional multi-floral complexity.",
    category: "honey",
    badge: "Top Seller",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 5,
    review_count: 182,
    is_active: true,
    variants: [
      { id: "vh2-1", size: "250g", price_kes: 250, stock_quantity: 95, is_available: true, batch_code: "KIB-ACAC-221-250G" },
      { id: "vh2-2", size: "500g", price_kes: 500, stock_quantity: 66, is_available: true, batch_code: "KIB-ACAC-222-500G" },
      { id: "vh2-3", size: "1kg", price_kes: 1000, stock_quantity: 28, is_available: true, batch_code: "KIB-ACAC-223-1KG" }
    ]
  },
  {
    id: "h3",
    name: "BeeYield Premium Acacia",
    description: "A limited selection from our Kibwezi reserve. Gravity-filtered to preserve the natural enzymes and the distinct aroma of local Acacia blossoms.",
    category: "honey",
    badge: "Reserve",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 4.8,
    review_count: 115,
    is_active: true,
    variants: [
      { id: "vh3-1", size: "250g", price_kes: 250, stock_quantity: 50, is_available: true, batch_code: "KIB-ACAC-231-250G" },
      { id: "vh3-2", size: "500g", price_kes: 500, stock_quantity: 35, is_available: true, batch_code: "KIB-ACAC-232-500G" },
      { id: "vh3-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true, batch_code: "KIB-ACAC-233-1KG" }
    ]
  },
  {
    id: "h4",
    name: "BeeYield Acacia",
    description: "Natural, raw Acacia honey from our sustainable Kibwezi apiary. Perfectly balanced sweetness with a smooth, lingering finish.",
    category: "honey",
    badge: null,
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 4.7,
    review_count: 92,
    is_active: true,
    variants: [
      { id: "vh4-1", size: "250g", price_kes: 250, stock_quantity: 150, is_available: true, batch_code: "KIB-ACAC-241-250G" },
      { id: "vh4-2", size: "500g", price_kes: 500, stock_quantity: 105, is_available: true, batch_code: "KIB-ACAC-242-500G" },
      { id: "vh4-3", size: "1kg", price_kes: 1000, stock_quantity: 45, is_available: true, batch_code: "KIB-ACAC-243-1KG" }
    ]
  },
  {
    id: "h5",
    name: "BeeYield Premium Acacia",
    description: "Our highest grade Acacia honey, harvested during the peak blossom season in Kibwezi. Unmatched purity and nutritional density.",
    category: "honey",
    badge: "LTD Edition",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 4.9,
    review_count: 140,
    is_active: true,
    variants: [
      { id: "vh5-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true, batch_code: "KIB-ACAC-251-250G" },
      { id: "vh5-2", size: "500g", price_kes: 500, stock_quantity: 28, is_available: true, batch_code: "KIB-ACAC-252-500G" },
      { id: "vh5-3", size: "1kg", price_kes: 1000, stock_quantity: 12, is_available: true, batch_code: "KIB-ACAC-253-1KG" }
    ]
  },
  {
    id: "h6",
    name: "BeeYield Acacia",
    description: "100% pure honey from our Kibwezi community apiary. Supporting local beekeeping while delivering the finest natural sweetness.",
    category: "honey",
    badge: "Community",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 5,
    review_count: 67,
    is_active: true,
    variants: [
      { id: "vh6-1", size: "250g", price_kes: 250, stock_quantity: 85, is_available: true, batch_code: "KIB-ACAC-261-250G" },
      { id: "vh6-2", size: "500g", price_kes: 500, stock_quantity: 59, is_available: true, batch_code: "KIB-ACAC-262-500G" },
      { id: "vh6-3", size: "1kg", price_kes: 1000, stock_quantity: 25, is_available: true, batch_code: "KIB-ACAC-263-1KG" }
    ]
  },
  {
    id: "h7",
    name: "BeeYield Premium Acacia",
    description: "Select harvest from our Kibwezi wild-forage zones. Rich in antioxidants and preserved in its rawest state for your wellness.",
    category: "honey",
    badge: "Raw",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 4.8,
    review_count: 89,
    is_active: true,
    variants: [
      { id: "vh7-1", size: "250g", price_kes: 250, stock_quantity: 60, is_available: true, batch_code: "KIB-ACAC-271-250G" },
      { id: "vh7-2", size: "500g", price_kes: 500, stock_quantity: 42, is_available: true, batch_code: "KIB-ACAC-272-500G" },
      { id: "vh7-3", size: "1kg", price_kes: 1000, stock_quantity: 18, is_available: true, batch_code: "KIB-ACAC-273-1KG" }
    ]
  },
  {
    id: "h8",
    name: "BeeYield Acacia",
    description: "Crafted by bees in the pristine acacia thickets of Kibwezi. Authentic, traceable, and deeply nutritious raw honey.",
    category: "honey",
    badge: "Authentic",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 4.9,
    review_count: 103,
    is_active: true,
    variants: [
      { id: "vh8-1", size: "250g", price_kes: 250, stock_quantity: 110, is_available: true, batch_code: "KIB-ACAC-281-250G" },
      { id: "vh8-2", size: "500g", price_kes: 500, stock_quantity: 77, is_available: true, batch_code: "KIB-ACAC-282-500G" },
      { id: "vh8-3", size: "1kg", price_kes: 1000, stock_quantity: 33, is_available: true, batch_code: "KIB-ACAC-283-1KG" }
    ]
  },
  // --- SENSORS / HARDWARE (8 items) ---
  {
    id: "hw1",
    name: "BeeHUB Queen - Lora Pro",
    description:
      "The primary gateway for your apiary. Manages multiple sensors and transmits data via Satellite or GSM. Includes solar charging capability.",
    category: "hardware",
    badge: "Gateway",
    images: ["/images/products/beeyield_hub_sensor.jpg"],
    rating: 5.0,
    review_count: 84,
    is_active: true,
    variants: [{ id: "vhw1-1", size: "Unit Only", price_kes: 38500, stock_quantity: 15, is_available: true }]
  },
  {
    id: "hw2",
    name: "BeeHUB Sense",
    description: "Internal hive sensor. Tracks temperature and humidity. Connects wirelessly to the BeeHUB Queen gateway.",
    category: "hardware",
    badge: "Sensor",
    images: ["/images/products/beehub_temp_humidity.png"],
    rating: 4.8,
    review_count: 56,
    is_active: true,
    variants: [{ id: "vhw2-1", size: "Sense V2", price_kes: 12500, stock_quantity: 50, is_available: true }]
  },
  {
    id: "hw3",
    name: "Precision Hive Scale",
    description:
      "Industrial-grade scale for monitoring nectar flow and honey stores. Highly precise sensors for real-time weight tracking.",
    category: "hardware",
    badge: "Production",
    images: ["/images/products/beehub_hive_scale.png"],
    rating: 4.9,
    review_count: 42,
    is_active: true,
    variants: [{ id: "vhw3-1", size: "150kg Max", price_kes: 24500, stock_quantity: 20, is_available: true }]
  },
  {
    id: "hw4",
    name: "BeeHUB Tracker (GPS)",
    description:
      "Anti-theft GPS tracking for your valuable colonies. Features movement alerts and geofencing via the BeeHUB dashboard.",
    category: "hardware",
    badge: "Security",
    images: ["/images/products/beehub_sim_card.png"],
    rating: 4.7,
    review_count: 31,
    is_active: true,
    variants: [{ id: "vhw4-1", size: "GPS Unit", price_kes: 8500, stock_quantity: 15, is_available: true }]
  },
  {
    id: "hw5",
    name: "Temp & Humidity Probe",
    description:
      "High-precision internal probe for monitoring brood nest climate. Essential for early disease detection and swarm prevention.",
    category: "hardware",
    badge: "Accessory",
    images: ["/images/products/beehub_temp_humidity.png"],
    rating: 4.6,
    review_count: 124,
    is_active: true,
    variants: [{ id: "vhw5-1", size: "Single Probe", price_kes: 4500, stock_quantity: 100, is_available: true }]
  },
  {
    id: "hw6",
    name: "BeeHUB Solar Panel",
    description: "Weatherproof solar panel for BeeHUB Queen and Sense sensors. Helps keep devices running in remote locations.",
    category: "hardware",
    badge: "Power",
    images: ["/images/products/beehub_solar_panel.png"],
    rating: 4.9,
    review_count: 28,
    is_active: true,
    variants: [{ id: "vhw6-1", size: "10W Panel", price_kes: 6500, stock_quantity: 40, is_available: true }]
  },
  {
    id: "hw7",
    name: "Acoustic Analysis Module",
    description: "Microphone sensor for analyzing hive sound signatures to detect queen presence and swarm behavior.",
    category: "hardware",
    badge: "Technical",
    images: ["/images/products/beehub_sound_sensor.png"],
    rating: 4.8,
    review_count: 19,
    is_active: true,
    variants: [{ id: "vhw7-1", size: "Pro Audio", price_kes: 11000, stock_quantity: 10, is_available: true }]
  },
  {
    id: "hw8",
    name: "Full BeeHUB Station Kit",
    description: "Starter kit: 1 BeeHUB Queen, 2 Sense sensors, 1 Tracker, and 1 Solar panel for your apiary.",
    category: "hardware",
    badge: "Best Value",
    images: ["/images/products/beeyield_hub_sensor.jpg"],
    rating: 5.0,
    review_count: 15,
    is_active: true,
    variants: [{ id: "vhw8-1", size: "Station Kit", price_kes: 72000, stock_quantity: 5, is_available: true }]
  },



  // --- EDUCATION / LEARN (8 items) ---
  {
    id: "edu-1",
    name: "BEEKEEPING STARTER GUIDE",
    description: "Entry-level handbook: hive setup, bee care, and your first honey harvest.",
    category: "education",
    badge: "DIGITAL",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 4.9,
    review_count: 215,
    is_active: true,
    variants: [{ id: "ve1-1", size: "PDF Download", price_kes: 1500, stock_quantity: 9999, is_available: true }]
  },
  {
    id: "edu-2",
    name: "PRECISION POLLINATION HANDBOOK",
    description: "Data-driven techniques for crop yields. For commercial farmers and professional beekeepers.",
    category: "education",
    badge: "PROFESSIONAL",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 5.0,
    review_count: 48,
    is_active: true,
    variants: [{ id: "ve2-1", size: "PDF Download", price_kes: 3500, stock_quantity: 9999, is_available: true }]
  },
  {
    id: "edu-3",
    name: "QUEEN REARING MASTERCLASS",
    description: "Video course with 12 hours of expert instruction on queen breeding, grafting, and colony management.",
    category: "education",
    badge: "VIDEO COURSE",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 4.8,
    review_count: 87,
    is_active: true,
    variants: [{ id: "ve3-1", size: "Online Access", price_kes: 5500, stock_quantity: 9999, is_available: true }]
  },
  {
    id: "edu-4",
    name: "HONEY PROCESSING MANUAL",
    description:
      "Complete guide to extraction, filtering, bottling, and quality certification for commercial honey production.",
    category: "education",
    badge: "BESTSELLER",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 4.7,
    review_count: 134,
    is_active: true,
    variants: [{ id: "ve4-1", size: "PDF Download", price_kes: 2500, stock_quantity: 9999, is_available: true }]
  },
  {
    id: "edu-5",
    name: "HIVE MONITORING COURSE",
    description: "Learn to set up, calibrate, and interpret data from BeeYield sensors. Includes troubleshooting guides.",
    category: "education",
    badge: "TECHNICAL",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 4.9,
    review_count: 56,
    is_active: true,
    variants: [{ id: "ve5-1", size: "Online Access", price_kes: 4000, stock_quantity: 9999, is_available: true }]
  },
  {
    id: "edu-6",
    name: "DISEASE & PEST MANAGEMENT",
    description:
      "Identify and treat common bee diseases and pests in East Africa. Includes natural and chemical treatment options.",
    category: "education",
    badge: "ESSENTIAL",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 4.8,
    review_count: 98,
    is_active: true,
    variants: [{ id: "ve6-1", size: "PDF Download", price_kes: 2000, stock_quantity: 9999, is_available: true }]
  },
  {
    id: "edu-7",
    name: "BUSINESS OF BEEKEEPING",
    description: "Transform your hobby into a profitable venture. Covers pricing, marketing, regulations, and scaling operations.",
    category: "education",
    badge: "ENTREPRENEUR",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 4.6,
    review_count: 73,
    is_active: true,
    variants: [{ id: "ve7-1", size: "PDF + Templates", price_kes: 4500, stock_quantity: 9999, is_available: true }]
  },
  {
    id: "edu-8",
    name: "COMPLETE BEEKEEPER BUNDLE",
    description: "All educational materials in one package! Includes all guides, courses, and lifetime updates.",
    category: "education",
    badge: "BEST VALUE",
    images: ["/images/products/beekeeping_guide.png"],
    rating: 5.0,
    review_count: 42,
    is_active: true,
    variants: [{ id: "ve8-1", size: "Full Bundle", price_kes: 15000, stock_quantity: 9999, is_available: true }]
  }
];

export const getCatalogByCategory = (category: ProductCategory): Product[] =>
  CATALOG.filter((p) => p.category === category).slice(0, 8);

