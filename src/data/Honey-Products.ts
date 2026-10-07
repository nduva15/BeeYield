import type { Product } from "@/services/shopService";

/**
 * Static fallback products for Honey pages.
 * Used when the shop API returns no products (offline / empty DB).
 *
 * NOTE: Keep shape aligned with `src/services/shopService.ts` Product interface.
 */
export const initialHoneyProducts: Product[] = [
  // --- HONEY (8 Items - Monofloral & Hive-to-Honey Traceability Verified) ---
  {
    id: "h1",
    name: "BeeYield Monofloral Acacia",
    description: "Harvested during peak blossom in our flagship Kibwezi woodland. Exceptional clarity, delicate sweetness, and 100% monofloral Acacia pollen verification.",
    category: "honey",
    badge: "Monofloral Verified",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 245,
    is_active: true,
    floral_source: "Acacia tortilis / senegal (Monofloral)",
    origin_region: "Kibwezi Forest Apiary Zone A (-2.4167° S, 37.9667° E)",
    batch_code: "BEE-2026-01-0420",
    hive_code: "KIB-001 (Langstroth 10)",
    purity_guarantee: "100% Raw Unadulterated • 0% Added Sugars • <17% Moisture",
    traceability_features: ["GPS Geo-Tagged Box", "Monofloral Pollen Test", "50/50 Bee Reserve Kept", "Centrifugal Cold Extract", "FAO & EU DPP Ready"],
    variants: [
      { id: "vh1-1", size: "250g", price_kes: 250, stock_quantity: 120, is_available: true },
      { id: "vh1-2", size: "500g", price_kes: 500, stock_quantity: 84, is_available: true },
      { id: "vh1-3", size: "1kg", price_kes: 1000, stock_quantity: 36, is_available: true }
    ]
  },
  {
    id: "h2",
    name: "BeeYield Monofloral Citrus Blossom",
    description: "Cold-extracted from bee boxes placed alongside blooming orange and citrus groves in Kiunduani. Bursting with aromatic citrus undertones and active enzymes.",
    category: "honey",
    badge: "Top Seller",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 182,
    is_active: true,
    floral_source: "Citrus sinensis (Orange Blossom Monofloral)",
    origin_region: "Kiunduani Partner Orchards (-2.3812° S, 37.9214° E)",
    batch_code: "BEE-2026-01-0419",
    hive_code: "KIB-014 (Langstroth 10)",
    purity_guarantee: "100% Pure Raw Honey • Citrus Nectar Monofloral Certified",
    traceability_features: ["Orchard Anthesis Sync", "QR Jar Verification", "Centrifugal Spin <35°C", "50/50 Reserve Met"],
    variants: [
      { id: "vh2-1", size: "250g", price_kes: 250, stock_quantity: 95, is_available: true },
      { id: "vh2-2", size: "500g", price_kes: 500, stock_quantity: 66, is_available: true },
      { id: "vh2-3", size: "1kg", price_kes: 1000, stock_quantity: 28, is_available: true }
    ]
  },
  {
    id: "h3",
    name: "BeeYield Mango Bloom Reserve",
    description: "A rare monofloral extraction from hives deployed during Apple Mango anthesis in Kibarani. Rich amber hue, tropical sweetness, and full enzyme preservation.",
    category: "honey",
    badge: "Reserve",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.8,
    review_count: 115,
    is_active: true,
    floral_source: "Mangifera indica (Mango Anthesis Monofloral)",
    origin_region: "Kibarani Commercial Orchards (-2.4055° S, 37.9421° E)",
    batch_code: "BEE-2026-01-0418",
    hive_code: "KIB-022 (Langstroth 10)",
    purity_guarantee: "Gravity Filtered • Zero High-Fructose Syrup • 100% Natural",
    traceability_features: ["Pollination Partner Trace", "Batch Sealed SS304", "Export Grade A", "GeoJSON Mapped"],
    variants: [
      { id: "vh3-1", size: "250g", price_kes: 250, stock_quantity: 50, is_available: true },
      { id: "vh3-2", size: "500g", price_kes: 500, stock_quantity: 35, is_available: true },
      { id: "vh3-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true }
    ]
  },
  {
    id: "h4",
    name: "BeeYield Highland Eucalyptus & Jamun",
    description: "Bold, medicinal, and mineral-rich honey sourced from highland floral corridors. Tested negative for foreign sugars, with distinct cooling herbal notes.",
    category: "honey",
    badge: "Bioactive",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.7,
    review_count: 92,
    is_active: true,
    floral_source: "Eucalyptus globulus & Syzygium cumini (Jamun)",
    origin_region: "Makueni Highland Watershed (-2.3211° S, 37.8932° E)",
    batch_code: "BEE-2025-12-0112",
    hive_code: "KIB-045 (Langstroth 10)",
    purity_guarantee: "Bioactive Antioxidant Density • 0% Adulteration Guarantee",
    traceability_features: ["Geo-Tagged Watershed", "Isotope Purity Screened", "Collection Center Intake #KIB-CC4", "FSSAI Aligned"],
    variants: [
      { id: "vh4-1", size: "250g", price_kes: 250, stock_quantity: 150, is_available: true },
      { id: "vh4-2", size: "500g", price_kes: 500, stock_quantity: 105, is_available: true },
      { id: "vh4-3", size: "1kg", price_kes: 1000, stock_quantity: 45, is_available: true }
    ]
  },
  {
    id: "h5",
    name: "BeeYield Certified Naturally Grown (CNG) Acacia",
    description: "Produced strictly without GMOs, synthetic miticides, or artificial feed. Verifiable 50% reserve retained for colony wintering in pristine Acacia bushlands.",
    category: "honey",
    badge: "CNG Certified",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 140,
    is_active: true,
    floral_source: "Wild Acacia tortilis (Certified Naturally Grown)",
    origin_region: "Kibwezi Conservation Apiary (-2.4190° S, 37.9710° E)",
    batch_code: "BEE-2026-01-0421",
    hive_code: "KIB-007 (Langstroth 10)",
    purity_guarantee: "Chemical-Free Apiary • 50/50 Harvest Ethics • 100% Organic Origin",
    traceability_features: ["CNG Standard Compliant", "Bee Welfare Verified", "Digital Hive Log", "EUDR Deforestation-Free"],
    variants: [
      { id: "vh5-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true },
      { id: "vh5-2", size: "500g", price_kes: 500, stock_quantity: 28, is_available: true },
      { id: "vh5-3", size: "1kg", price_kes: 1000, stock_quantity: 12, is_available: true }
    ]
  },
  {
    id: "h6",
    name: "BeeYield Monofloral Mustard & Coriander",
    description: "Golden honey with a light floral aroma and gentle spice note. Extracted at our community collection center from managed smallholder agricultural zones.",
    category: "honey",
    badge: "Community",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 5.0,
    review_count: 67,
    is_active: true,
    floral_source: "Brassica & Coriandrum sativum (Mustard / Coriander)",
    origin_region: "Mbuinzau Agro-Corridor (-2.3644° S, 37.9056° E)",
    batch_code: "BEE-2025-10-0089",
    hive_code: "KIB-063 (Langstroth 10)",
    purity_guarantee: "Direct Smallholder Fair Pay • 100% Unblended Monofloral",
    traceability_features: ["Beekeeper KYC Verified", "Offline Mobile Sync", "Regional Center Intake", "Fair-Trade Settlement"],
    variants: [
      { id: "vh6-1", size: "250g", price_kes: 250, stock_quantity: 85, is_available: true },
      { id: "vh6-2", size: "500g", price_kes: 500, stock_quantity: 59, is_available: true },
      { id: "vh6-3", size: "1kg", price_kes: 1000, stock_quantity: 25, is_available: true }
    ]
  },
  {
    id: "h7",
    name: "BeeYield Raw Forest Wildflora",
    description: "Multifloral raw honey gathered from wild savannah shrubs, baobabs, and desert dates. Preserves natural pollen granulates and floral biodiversity.",
    category: "honey",
    badge: "Raw Forest",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.8,
    review_count: 89,
    is_active: true,
    floral_source: "Savannah Flora (Acacia, Adansonia, Balanites)",
    origin_region: "Kavita Ecological Sanctuary (-2.4312° S, 37.9540° E)",
    batch_code: "BEE-2025-08-0056",
    hive_code: "KIB-081 (Langstroth 10)",
    purity_guarantee: "Unheated (<35°C) • Coarse Strained • Intact Bee Pollen",
    traceability_features: ["Ecosystem Restoration Tag", "Zero Sugar Syrup Test", "2,500 Trees Partnered", "Codex Standard 12-1981"],
    variants: [
      { id: "vh7-1", size: "250g", price_kes: 250, stock_quantity: 60, is_available: true },
      { id: "vh7-2", size: "500g", price_kes: 500, stock_quantity: 42, is_available: true },
      { id: "vh7-3", size: "1kg", price_kes: 1000, stock_quantity: 18, is_available: true }
    ]
  },
  {
    id: "h8",
    name: "BeeYield Authentic Mono-Acacia Gold",
    description: "Pure liquid gold extracted during the dryland blooming surge. Every jar carries a unique QR code showing exact bee box GPS, harvest date, and lab purity metrics.",
    category: "honey",
    badge: "Authentic",
    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],
    rating: 4.9,
    review_count: 103,
    is_active: true,
    floral_source: "Acacia senegal Monofloral",
    origin_region: "Kibwezi Core Apiary Zone B (-2.4175° S, 37.9680° E)",
    batch_code: "BEE-2025-06-0031",
    hive_code: "KIB-099 (Langstroth 10)",
    purity_guarantee: "Full Hive-to-Jar Provenance • Refractometer Moisture 16.8%",
    traceability_features: ["QR Blockchain Ledger", "Centrifugal Extraction", "0% Adulteration", "FAO Quality Assurance"],
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
