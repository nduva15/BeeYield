const fs = require('fs');

const HONEY_ITEMS = [
  {
    id: "h1",
    name: "BeeYield Premium Acacia",
    description: "Harvested from our flagship BeeYield apiary in Kibwezi, this premium grade Acacia honey is known for its clarity and delicate floral notes.",
    category: "honey",
    badge: "Premium",
    rating: 4.9,
    review_count: 245,
    is_active: true,
  },
  {
    id: "h2",
    name: "BeeYield Acacia",
    description: "Pure Acacia honey sourced directly from our Kibwezi forest site. A classic Kenyan favorite with exceptional multi-floral complexity.",
    category: "honey",
    badge: "Top Seller",
    rating: 5.0,
    review_count: 182,
    is_active: true,
  },
  {
    id: "h3",
    name: "BeeYield Premium Acacia",
    description: "A limited selection from our Kibwezi reserve. Gravity-filtered to preserve the natural enzymes and the distinct aroma of local Acacia blossoms.",
    category: "honey",
    badge: "Reserve",
    rating: 4.8,
    review_count: 115,
    is_active: true,
  },
  {
    id: "h4",
    name: "BeeYield Acacia",
    description: "Natural, raw Acacia honey from our sustainable Kibwezi apiary. Perfectly balanced sweetness with a smooth, lingering finish.",
    category: "honey",
    badge: null,
    rating: 4.7,
    review_count: 92,
    is_active: true,
  },
  {
    id: "h5",
    name: "BeeYield Premium Acacia",
    description: "Our highest grade Acacia honey, harvested during the peak blossom season in Kibwezi. Unmatched purity and nutritional density.",
    category: "honey",
    badge: "LTD Edition",
    rating: 4.9,
    review_count: 140,
    is_active: true,
  },
  {
    id: "h6",
    name: "BeeYield Acacia",
    description: "100% pure honey from our Kibwezi community apiary. Supporting local beekeeping while delivering the finest natural sweetness.",
    category: "honey",
    badge: "Community",
    rating: 5.0,
    review_count: 67,
    is_active: true,
  },
  {
    id: "h7",
    name: "BeeYield Premium Acacia",
    description: "Select harvest from our Kibwezi wild-forage zones. Rich in antioxidants and preserved in its rawest state for your wellness.",
    category: "honey",
    badge: "Raw",
    rating: 4.8,
    review_count: 89,
    is_active: true,
  },
  {
    id: "h8",
    name: "BeeYield Acacia",
    description: "Crafted by bees in the pristine acacia thickets of Kibwezi. Authentic, traceable, and deeply nutritious raw honey.",
    category: "honey",
    badge: "Authentic",
    rating: 4.9,
    review_count: 103,
    is_active: true,
  }
];

// Add variants logic
HONEY_ITEMS.forEach((item, idx) => {
  const stock = [120, 95, 50, 150, 40, 85, 60, 110][idx];
  item.variants = [
    { id: `vh${idx+1}-1`, size: "250g", price_kes: 250, stock_quantity: stock, is_available: true, batch_code: `KIB-ACAC-2${idx+1}1-250G` },
    { id: `vh${idx+1}-2`, size: "500g", price_kes: 500, stock_quantity: Math.floor(stock*0.7), is_available: true, batch_code: `KIB-ACAC-2${idx+1}2-500G` },
    { id: `vh${idx+1}-3`, size: "1kg", price_kes: 1000, stock_quantity: Math.floor(stock*0.3), is_available: true, batch_code: `KIB-ACAC-2${idx+1}3-1KG` }
  ];
});

// Update catalog.ts
let catalogContent = fs.readFileSync('src/data/catalog.ts', 'utf8');
const cStart = catalogContent.indexOf('  // --- HONEY (8 Items) ---'); // Previous script used this header
const cEnd = catalogContent.indexOf('  // --- SENSORS / HARDWARE (8 items) ---');

let cNew = '  // --- HONEY (8 Items - Kibwezi BeeYield Apiary) ---\n';
HONEY_ITEMS.forEach(item => {
  cNew += `  {\n    id: "${item.id}",\n    name: "${item.name}",\n    description: "${item.description}",\n    category: "honey",\n`;
  cNew += item.badge ? `    badge: "${item.badge}",\n` : `    badge: null,\n`;
  cNew += `    images: [\n      "/images/products/beeyield_honey_500g.png",\n      "/images/products/beeyield_honey_250g.png",\n      "/images/products/beeyield_honey_500g.png",\n      "/images/products/beeyield_honey_1kg.png"\n    ],\n`;
  cNew += `    rating: ${item.rating},\n    review_count: ${item.review_count},\n    is_active: true,\n`;
  cNew += `    variants: [\n`;
  item.variants.forEach((v, i) => {
    cNew += `      { id: "${v.id}", size: "${v.size}", price_kes: ${v.price_kes}, stock_quantity: ${v.stock_quantity}, is_available: true, batch_code: "${v.batch_code}" }${i < 2 ? ',' : ''}\n`;
  });
  cNew += `    ]\n  },\n`;
});

if (cStart !== -1 && cEnd !== -1) {
    catalogContent = catalogContent.substring(0, cStart) + cNew + catalogContent.substring(cEnd);
    fs.writeFileSync('src/data/catalog.ts', catalogContent);
    console.log('Updated catalog.ts');
}

// Update Honey-Products.ts
let hpContent = fs.readFileSync('src/data/Honey-Products.ts', 'utf8');
const hpStart = hpContent.indexOf('  // --- HONEY (8 Items) ---');
const hpEnd = hpContent.indexOf('  // --- SENSORS (8 Items) ---');

let hpNew = '  // --- HONEY (8 Items - Kibwezi BeeYield Apiary) ---\n';
HONEY_ITEMS.forEach(item => {
  hpNew += `  {\n    id: "${item.id}",\n    name: "${item.name}",\n    description: "${item.description}",\n    category: "honey",\n`;
  hpNew += item.badge ? `    badge: "${item.badge}",\n` : `    badge: null,\n`;
  hpNew += `    images: ["/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_250g.png", "/images/products/beeyield_honey_500g.png", "/images/products/beeyield_honey_1kg.png"],\n`;
  hpNew += `    rating: ${item.rating},\n    review_count: ${item.review_count},\n    is_active: true,\n`;
  hpNew += `    variants: [\n`;
  item.variants.forEach((v, i) => {
    hpNew += `      { id: "${v.id}", size: "${v.size}", price_kes: ${v.price_kes}, stock_quantity: ${v.stock_quantity}, is_available: true }${i < 2 ? ',' : ''}\n`;
  });
  hpNew += `    ]\n  },\n`;
});

if (hpStart !== -1 && hpEnd !== -1) {
    hpContent = hpContent.substring(0, hpStart) + hpNew + hpContent.substring(hpEnd);
    fs.writeFileSync('src/data/Honey-Products.ts', hpContent);
    console.log('Updated Honey-Products.ts');
}
