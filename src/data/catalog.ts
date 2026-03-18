export type ProductCategory = 'honey' | 'hardware' | 'merch' | 'education';

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
 * Exactly 8 items per category: honey, hardware (sensors), merch, education (learn).
 */
export const CATALOG: Product[] = [
  // --- HONEY (8 items) ---
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
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 4.9,
    review_count: 245,
    is_active: true,
    variants: [
      { id: "vh1-1", size: "250g", price_kes: 250, stock_quantity: 100, is_available: true, batch_code: "KIB-ACAC-121-250G" },
      { id: "vh1-2", size: "500g", price_kes: 500, stock_quantity: 75, is_available: true, batch_code: "KIB-ACAC-111-500G" },
      { id: "vh1-3", size: "1kg", price_kes: 1000, stock_quantity: 50, is_available: true, batch_code: "KIB-ACAC-101-1KG" }
    ]
  },
  {
    id: "h2",
    name: "BeeYield Acacia",
    description:
      "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "Premium",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 5.0,
    review_count: 182,
    is_active: true,
    variants: [
      { id: "vh2-1", size: "250g", price_kes: 250, stock_quantity: 80, is_available: true, batch_code: "KIB-WILD-122-250G" },
      { id: "vh2-2", size: "500g", price_kes: 500, stock_quantity: 60, is_available: true, batch_code: "KIB-WILD-112-500G" },
      { id: "vh2-3", size: "1kg", price_kes: 1000, stock_quantity: 30, is_available: true, batch_code: "KIB-WILD-102-1KG" }
    ]
  },
  {
    id: "h3",
    name: "BeeYield Acacia",
    description:
      "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "Rare",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 4.8,
    review_count: 96,
    is_active: true,
    variants: [
      { id: "vh3-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true, batch_code: "KIB-FOR-123-250G" },
      { id: "vh3-2", size: "500g", price_kes: 500, stock_quantity: 30, is_available: true, batch_code: "KIB-FOR-113-500G" },
      { id: "vh3-3", size: "1kg", price_kes: 1000, stock_quantity: 20, is_available: true, batch_code: "KIB-FOR-103-1KG" }
    ]
  },
  {
    id: "h4",
    name: "BeeYield Acacia",
    description:
      "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "Limited Edition",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 4.9,
    review_count: 54,
    is_active: true,
    variants: [
      { id: "vh4-1", size: "250g", price_kes: 250, stock_quantity: 30, is_available: true, batch_code: "KIB-THORN-124-250G" },
      { id: "vh4-2", size: "500g", price_kes: 500, stock_quantity: 25, is_available: true, batch_code: "KIB-THORN-114-500G" },
      { id: "vh4-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true, batch_code: "KIB-THORN-104-1KG" }
    ]
  },
  {
    id: "h5",
    name: "BeeYield Acacia",
    description:
      "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "100% Raw",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 5.0,
    review_count: 312,
    is_active: true,
    variants: [
      { id: "vh5-1", size: "250g", price_kes: 250, stock_quantity: 30, is_available: true, batch_code: "KIB-COMB-125-250G" },
      { id: "vh5-2", size: "500g", price_kes: 500, stock_quantity: 20, is_available: true, batch_code: "KIB-COMB-115-500G" },
      { id: "vh5-3", size: "1kg", price_kes: 1000, stock_quantity: 10, is_available: true, batch_code: "KIB-COMB-105-1KG" }
    ]
  },
  {
    id: "h6",
    name: "BeeYield Acacia",
    description:
      "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "New Arrival",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 4.7,
    review_count: 42,
    is_active: true,
    variants: [
      { id: "vh6-1", size: "250g", price_kes: 250, stock_quantity: 50, is_available: true, batch_code: "KIB-LAV-126-250G" },
      { id: "vh6-2", size: "500g", price_kes: 500, stock_quantity: 30, is_available: true, batch_code: "KIB-LAV-116-500G" },
      { id: "vh6-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true, batch_code: "KIB-LAV-106-1KG" }
    ]
  },
  {
    id: "h7",
    name: "BeeYield Acacia",
    description:
      "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "Wellness",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 4.8,
    review_count: 128,
    is_active: true,
    variants: [
      { id: "vh7-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true, batch_code: "KIB-GINGER-127-250G" },
      { id: "vh7-2", size: "500g", price_kes: 500, stock_quantity: 60, is_available: true, batch_code: "KIB-GINGER-117-500G" },
      { id: "vh7-3", size: "1kg", price_kes: 1000, stock_quantity: 25, is_available: true, batch_code: "KIB-GINGER-107-1KG" }
    ]
  },
  {
    id: "h8",
    name: "BeeYield Acacia",
    description:
      "Pure, light, and delicate Acacia honey harvested from the pristine northern plains. Known for its clarity and slow crystallization.",
    category: "honey",
    badge: "Gold Label",
    images: [
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_250g.png",
      "/images/products/beeyield_honey_500g.png",
      "/images/products/beeyield_honey_1kg.png"
    ],
    rating: 5.0,
    review_count: 15,
    is_active: true,
    variants: [
      { id: "vh8-1", size: "250g", price_kes: 250, stock_quantity: 10, is_available: true, batch_code: "KIB-SIGN-128-250G" },
      { id: "vh8-2", size: "500g", price_kes: 500, stock_quantity: 10, is_available: true, batch_code: "KIB-SIGN-118-500G" },
      { id: "vh8-3", size: "1kg", price_kes: 1000, stock_quantity: 5, is_available: true, batch_code: "KIB-SIGN-108-1KG" }
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

  // --- MERCH (8 items) ---
  {
    id: "m1",
    name: "BeeYield Premium Hoodie",
    description: "Heavyweight organic cotton hoodie with embroidered BeeYield logo. Stylish, warm, and built to last.",
    category: "merch",
    badge: "Premium Gear",
    images: ["/images/products/beeyield_hoodie.png"],
    rating: 4.9,
    review_count: 86,
    is_active: true,
    variants: [
      { id: "vm1-1", size: "M", price_kes: 3800, stock_quantity: 20, is_available: true },
      { id: "vm1-2", size: "L", price_kes: 3800, stock_quantity: 25, is_available: true }
    ]
  },
  {
    id: "m2",
    name: "BeeYield Trucker Cap",
    description: "Classic ventilated trucker cap with embroidered logo. Perfect for sunny days in the apiary.",
    category: "merch",
    badge: null,
    images: ["/images/products/beeyield_cap.png"],
    rating: 4.5,
    review_count: 42,
    is_active: true,
    variants: [{ id: "vm2-1", size: "Standard", price_kes: 1200, stock_quantity: 60, is_available: true }]
  },
  {
    id: "m3",
    name: "Sustainability Tote Bag",
    description: "Eco-friendly heavy canvas tote. Features stunning botanical bee artwork.",
    category: "merch",
    badge: "Eco-Choice",
    images: ["/images/products/beeyield_tote_bag.png"],
    rating: 4.7,
    review_count: 42,
    is_active: true,
    variants: [{ id: "vm3-1", size: "Large", price_kes: 1200, stock_quantity: 100, is_available: true }]
  },
  {
    id: "m4",
    name: "Signature Beekeeper Tee",
    description: "Soft, breathable 100% organic cotton. A minimalist design that makes a statement.",
    category: "merch",
    badge: null,
    images: ["/images/products/beekeeper_tshirt.png"],
    rating: 4.8,
    review_count: 124,
    is_active: true,
    variants: [
      { id: "vm4-1", size: "M", price_kes: 2200, stock_quantity: 30, is_available: true },
      { id: "vm4-2", size: "L", price_kes: 2200, stock_quantity: 40, is_available: true }
    ]
  },
  {
    id: "m5",
    name: "BeeYield Ceramic Mug",
    description: "A high-fire ceramic mug in matte charcoal. Ergonomic design for that perfect morning coffee.",
    category: "merch",
    badge: "Lifestyle",
    images: ["/images/products/beeyield_tote_bag.png"],
    rating: 4.6,
    review_count: 34,
    is_active: true,
    variants: [{ id: "vm5-1", size: "12oz", price_kes: 950, stock_quantity: 60, is_available: true }]
  },
  {
    id: "m6",
    name: "Beekeeping Enamel Pin",
    description: "Limited edition enamel pins featuring different bee species. Perfect for your jacket.",
    category: "merch",
    badge: "Collectible",
    images: ["/images/products/beeyield_cap.png"],
    rating: 5.0,
    review_count: 48,
    is_active: true,
    variants: [{ id: "vm6-1", size: "Set", price_kes: 1500, stock_quantity: 200, is_available: true }]
  },
  {
    id: "m7",
    name: "Bamboo Bee Hotel",
    description: "Support solitary bees in your garden with this sustainably sourced bamboo bee hotel.",
    category: "merch",
    badge: "Garden",
    images: ["/images/products/beeyield_tote_bag.png"],
    rating: 4.8,
    review_count: 29,
    is_active: true,
    variants: [{ id: "vm7-1", size: "Standard", price_kes: 3200, stock_quantity: 15, is_available: true }]
  },
  {
    id: "m8",
    name: "Wildflower Seed Mix",
    description: "A curated blend of 25 native wildflower species designed to provide forage for bees.",
    category: "merch",
    badge: "Impact",
    images: ["/images/products/beeyield_tote_bag.png"],
    rating: 4.7,
    review_count: 156,
    is_active: true,
    variants: [{ id: "vm8-1", size: "50g Pack", price_kes: 450, stock_quantity: 500, is_available: true }]
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

