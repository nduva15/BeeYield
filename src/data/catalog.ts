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

  // --- MERCH (8 items) ---
  {
    id: "m1",
    name: "BeeYield Field Beanie",
    description: "Cold-weather rib knit beanie with a woven BeeYield front patch and clean apiary-ready styling.",
    category: "merch",
    badge: "New Drop",
    images: ["/images/products/beeyield_beanie.svg"],
    rating: 4.8,
    review_count: 38,
    is_active: true,
    variants: [
      { id: "vm1-1", size: "Standard", price_kes: 1400, stock_quantity: 55, is_available: true },
      { id: "vm1-2", size: "Premium Knit", price_kes: 1800, stock_quantity: 32, is_available: true }
    ]
  },
  {
    id: "m2",
    name: "BeeYield Apiary Field Cap",
    description: "Structured field cap with embroidered wordmark, breathable panels, and a low-glare bill for long hive days.",
    category: "merch",
    badge: "Core Uniform",
    images: ["/images/products/beeyield_field_cap.svg"],
    rating: 4.8,
    review_count: 64,
    is_active: true,
    variants: [
      { id: "vm2-1", size: "Classic Fit", price_kes: 1600, stock_quantity: 60, is_available: true },
      { id: "vm2-2", size: "Mesh Back", price_kes: 1750, stock_quantity: 44, is_available: true }
    ]
  },
  {
    id: "m3",
    name: "BeeYield Signature Tee",
    description: "Soft premium cotton tee with centered BeeYield hex mark on the chest and a clean logo-forward finish.",
    category: "merch",
    badge: "Best Seller",
    images: ["/images/products/beeyield_signature_tee.svg"],
    rating: 4.9,
    review_count: 112,
    is_active: true,
    variants: [
      { id: "vm3-1", size: "S", price_kes: 2200, stock_quantity: 24, is_available: true },
      { id: "vm3-2", size: "M", price_kes: 2200, stock_quantity: 38, is_available: true },
      { id: "vm3-3", size: "L", price_kes: 2200, stock_quantity: 36, is_available: true },
      { id: "vm3-4", size: "XL", price_kes: 2350, stock_quantity: 20, is_available: true }
    ]
  },
  {
    id: "m4",
    name: "BeeYield Long Sleeve Field Tee",
    description: "Performance-weight long sleeve tee with front chest branding and sleeve detailing for early-morning inspections.",
    category: "merch",
    badge: "Fieldwear",
    images: ["/images/products/beeyield_longsleeve.svg"],
    rating: 4.8,
    review_count: 58,
    is_active: true,
    variants: [
      { id: "vm4-1", size: "M", price_kes: 2800, stock_quantity: 26, is_available: true },
      { id: "vm4-2", size: "L", price_kes: 2800, stock_quantity: 34, is_available: true },
      { id: "vm4-3", size: "XL", price_kes: 2950, stock_quantity: 18, is_available: true }
    ]
  },
  {
    id: "m5",
    name: "BeeYield Heavyweight Hoodie",
    description: "Premium heavyweight fleece hoodie with oversized back identity panel and BeeYield chest application.",
    category: "merch",
    badge: "Premium Gear",
    images: ["/images/products/beeyield_heavyweight_hoodie.svg"],
    rating: 4.9,
    review_count: 86,
    is_active: true,
    variants: [
      { id: "vm5-1", size: "M", price_kes: 4200, stock_quantity: 18, is_available: true },
      { id: "vm5-2", size: "L", price_kes: 4200, stock_quantity: 24, is_available: true },
      { id: "vm5-3", size: "XL", price_kes: 4400, stock_quantity: 16, is_available: true }
    ]
  },
  {
    id: "m6",
    name: "BeeYield Crewneck Sweatshirt",
    description: "Relaxed crewneck with a bold BeeYield front seal, built for cool evenings and clean everyday wear.",
    category: "merch",
    badge: "Limited Run",
    images: ["/images/products/beeyield_crewneck.svg"],
    rating: 4.7,
    review_count: 46,
    is_active: true,
    variants: [
      { id: "vm6-1", size: "M", price_kes: 3600, stock_quantity: 22, is_available: true },
      { id: "vm6-2", size: "L", price_kes: 3600, stock_quantity: 28, is_available: true },
      { id: "vm6-3", size: "XL", price_kes: 3750, stock_quantity: 14, is_available: true }
    ]
  },
  {
    id: "m7",
    name: "BeeYield Canvas Tote",
    description: "Heavy-duty canvas tote with BeeYield honeycomb shield, sized for market runs, notebooks, or field gear.",
    category: "merch",
    badge: "Eco Carry",
    images: ["/images/products/beeyield_canvas_tote.svg"],
    rating: 4.8,
    review_count: 52,
    is_active: true,
    variants: [
      { id: "vm7-1", size: "Standard", price_kes: 1500, stock_quantity: 72, is_available: true },
      { id: "vm7-2", size: "Wide Gusset", price_kes: 1750, stock_quantity: 36, is_available: true }
    ]
  },
  {
    id: "m8",
    name: "BeeYield Pro Bee Suit",
    description: "Professional bee suit with BeeYield chest and back branding, reinforced seams, and visibility-focused field details.",
    category: "merch",
    badge: "Pro Kit",
    images: ["/images/products/beeyield_pro_bee_suit.svg"],
    rating: 4.9,
    review_count: 27,
    is_active: true,
    variants: [
      { id: "vm8-1", size: "M", price_kes: 9800, stock_quantity: 8, is_available: true },
      { id: "vm8-2", size: "L", price_kes: 9800, stock_quantity: 10, is_available: true },
      { id: "vm8-3", size: "XL", price_kes: 10200, stock_quantity: 6, is_available: true }
    ]
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

