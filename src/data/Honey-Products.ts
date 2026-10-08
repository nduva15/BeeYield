import type { Product } from "@/services/shopService";

/**
 * Static fallback products for Honey pages.
 * Used when the shop API returns no products (offline / empty DB).
 *
 * NOTE: Keep shape aligned with `src/services/shopService.ts` Product interface.
 */
export const initialHoneyProducts: Product[] = [
  // --- HONEY (8 Items - All 100% Pure Wild Acacia Honey From Kibwezi) ---
  {
    id: "h1",
    name: "BeeYield Premium Acacia",
    description: "Harvested during peak blossom in our flagship Kibwezi woodland. Exceptional clarity, delicate sweetness, and 100% pure wild Acacia honey.",
    category: "honey",
    badge: "Bestseller",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 245,
    is_active: true,
    floral_source: "Wild Acacia Blossom",
    origin_region: "Kibwezi Forest Apiary, Makueni",
    batch_code: "BEE-2026-01-0420",
    hive_code: "KIB-001 (Langstroth 10)",
    purity_guarantee: "100% Raw Unadulterated • 0% Added Sugars • <17% Moisture",
    traceability_features: ["Direct From Hive", "Wild Acacia Honey", "Half Left For Bees", "Cold Spun", "100% Pure Honey"],
    variants: [
      { id: "vh1-1", size: "250g", price_kes: 250, stock_quantity: 120, is_available: true },
      { id: "vh1-2", size: "500g", price_kes: 500, stock_quantity: 84, is_available: true },
      { id: "vh1-3", size: "1kg", price_kes: 1000, stock_quantity: 36, is_available: true }
    ]
  },
  {
    id: "h2",
    name: "BeeYield Acacia",
    description: "Pure organic wild Acacia honey cold-extracted from our bee boxes in Kibwezi. Naturally smooth with delicate floral sweetness and active enzymes.",
    category: "honey",
    badge: "Classic",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 182,
    is_active: true,
    floral_source: "Wild Acacia Blossom",
    origin_region: "Kibwezi Apiary, Makueni",
    batch_code: "BEE-2026-01-0419",
    hive_code: "KIB-014 (Langstroth 10)",
    purity_guarantee: "100% Pure Raw Honey • Wild Acacia Monofloral Certified",
    traceability_features: ["Wild Acacia Honey", "Check Your Jar", "Cold Spun Without Heat", "Half Left For Bees"],
    variants: [
      { id: "vh2-1", size: "250g", price_kes: 250, stock_quantity: 95, is_available: true },
      { id: "vh2-2", size: "500g", price_kes: 500, stock_quantity: 66, is_available: true },
      { id: "vh2-3", size: "1kg", price_kes: 1000, stock_quantity: 28, is_available: true }
    ]
  },
  {
    id: "h3",
    name: "BeeYield Acacia (Rare)",
    description: "A rare monofloral extraction from hives deployed during peak flowering acacia trees in Kibwezi. Rich amber hue, warm sweetness, and full enzyme preservation.",
    category: "honey",
    badge: "Rare Reserve",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.8,
    review_count: 115,
    is_active: true,
    floral_source: "Wild Acacia Blossom (Acacia mellifera)",
    origin_region: "Kibarani Dryland Apiary, Makueni",
    batch_code: "BEE-2026-01-0418",
    hive_code: "KIB-022 (Langstroth 10)",
    purity_guarantee: "Naturally Filtered • Zero Syrups • 100% Pure Honey",
    traceability_features: ["Local Wild Apiary", "Clean Glass Jars", "Grade A Pure Honey", "Verified Farm Origin"],
    variants: [
      { id: "vh3-1", size: "250g", price_kes: 250, stock_quantity: 50, is_available: true },
      { id: "vh3-2", size: "500g", price_kes: 500, stock_quantity: 35, is_available: true },
      { id: "vh3-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true }
    ]
  },
  {
    id: "h4",
    name: "BeeYield Acacia (Limited Edition)",
    description: "Small-batch seasonal harvest from protected Acacia woodlands. Tested negative for foreign sugars, with distinct smooth floral notes.",
    category: "honey",
    badge: "Limited Edition",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.7,
    review_count: 92,
    is_active: true,
    floral_source: "Wild Acacia Blossom (Acacia tortilis)",
    origin_region: "Makueni Acacia Woodland Reserve",
    batch_code: "BEE-2026-01-0422",
    hive_code: "KIB-045 (Langstroth 10)",
    purity_guarantee: "Bioactive Antioxidant Density • Zero Added Sugar Guarantee",
    traceability_features: ["Protected Woodlands", "Tested 100% Pure", "Cold Extraction Center", "Food Safety Certified"],
    variants: [
      { id: "vh4-1", size: "250g", price_kes: 250, stock_quantity: 150, is_available: true },
      { id: "vh4-2", size: "500g", price_kes: 500, stock_quantity: 105, is_available: true },
      { id: "vh4-3", size: "1kg", price_kes: 1000, stock_quantity: 45, is_available: true }
    ]
  },
  {
    id: "h5",
    name: "BeeYield Acacia (100% Raw)",
    description: "Produced strictly without GMOs, synthetic miticides, or artificial feed. Verifiable 50% reserve retained for colony wintering in pristine Acacia bushlands.",
    category: "honey",
    badge: "Naturally Grown",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 140,
    is_active: true,
    floral_source: "Wild Acacia Blossom (Naturally Grown)",
    origin_region: "Kibwezi Forest Apiary, Makueni",
    batch_code: "BEE-2026-01-0421",
    hive_code: "KIB-007 (Langstroth 10)",
    purity_guarantee: "Chemical-Free Hives • Half Left for Bees • 100% Natural",
    traceability_features: ["Naturally Grown", "Healthy Bees Promise", "Hive Records", "Forest Friendly"],
    variants: [
      { id: "vh5-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true },
      { id: "vh5-2", size: "500g", price_kes: 500, stock_quantity: 28, is_available: true },
      { id: "vh5-3", size: "1kg", price_kes: 1000, stock_quantity: 12, is_available: true }
    ]
  },
  {
    id: "h6",
    name: "BeeYield Acacia (New Arrival)",
    description: "Golden honey with a light floral aroma and gentle sweetness. Freshly extracted at our community collection center from managed smallholder apiary zones.",
    category: "honey",
    badge: "New Harvest",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 67,
    is_active: true,
    floral_source: "Wild Acacia Blossom",
    origin_region: "Mbuinzau Valley, Makueni",
    batch_code: "BEE-2026-01-0423",
    hive_code: "KIB-063 (Langstroth 10)",
    purity_guarantee: "Direct Smallholder Fair Pay • 100% Unblended Monofloral Acacia",
    traceability_features: ["Fair Pay Beekeepers", "Direct Farmer Records", "Kibwezi Center", "Fair Pay To Farmers"],
    variants: [
      { id: "vh6-1", size: "250g", price_kes: 250, stock_quantity: 85, is_available: true },
      { id: "vh6-2", size: "500g", price_kes: 500, stock_quantity: 59, is_available: true },
      { id: "vh6-3", size: "1kg", price_kes: 1000, stock_quantity: 25, is_available: true }
    ]
  },
  {
    id: "h7",
    name: "BeeYield Acacia (Wellness)",
    description: "Bioactive raw acacia honey gathered from wild acacia groves in Kibwezi. Preserves natural pollen granulates and immune-supporting antioxidants.",
    category: "honey",
    badge: "Wellness",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.8,
    review_count: 89,
    is_active: true,
    floral_source: "Wild Acacia Blossom & Savannah Flora",
    origin_region: "Kavita Sanctuary, Kibwezi",
    batch_code: "BEE-2026-01-0424",
    hive_code: "KIB-081 (Langstroth 10)",
    purity_guarantee: "Never Heated (<35°C) • Naturally Strained • Pure Bee Pollen",
    traceability_features: ["Forest Restoration", "Zero Added Sugars", "2,500 Trees Planted", "Pure Honey Standards"],
    variants: [
      { id: "vh7-1", size: "250g", price_kes: 250, stock_quantity: 60, is_available: true },
      { id: "vh7-2", size: "500g", price_kes: 500, stock_quantity: 42, is_available: true },
      { id: "vh7-3", size: "1kg", price_kes: 1000, stock_quantity: 18, is_available: true }
    ]
  },
  {
    id: "h8",
    name: "BeeYield Acacia (Gold Label)",
    description: "Pure liquid gold extracted during the dryland blooming surge. Every jar carries a unique QR code showing exact bee box origin, harvest date, and certified origin metrics.",
    category: "honey",
    badge: "Gold Label",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 103,
    is_active: true,
    floral_source: "Wild Acacia Blossom (Acacia senegal)",
    origin_region: "Kibwezi Valley, Makueni",
    batch_code: "BEE-2026-01-0425",
    hive_code: "KIB-099 (Langstroth 10)",
    purity_guarantee: "100% Pure Honey • Moisture Below 17% • Never Diluted",
    traceability_features: ["Jar QR Code", "Cold Spun", "Zero Added Sugar", "Tested 100% Pure"],
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
