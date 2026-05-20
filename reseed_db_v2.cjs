const { createClient } = require('@supabase/supabase-js');

const fs = require('fs');
const path = require('path');

function getEnvValue(keyName, defaultValue = '') {
  if (process.env[keyName]) return process.env[keyName];
  let dir = __dirname;
  while (dir) {
    const envPath = path.join(dir, '.env');
    if (fs.existsSync(envPath)) {
      try {
        const envData = fs.readFileSync(envPath, 'utf8');
        for (const line of envData.split('\n')) {
          const parts = line.split('=');
          if (parts.length >= 2 && parts[0].trim() === keyName) {
            let val = parts.slice(1).join('=').trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            return val;
          }
        }
      } catch (e) {}
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return defaultValue;
}

const supabaseUrl = getEnvValue('VITE_SUPABASE_URL_BEEYIELD') || getEnvValue('VITE_SUPABASE_URL') || 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const supabaseKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY_BEEYIELD') || getEnvValue('SUPABASE_SERVICE_ROLE_KEY');
if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY_BEEYIELD environment variable is missing.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const HONEY_ITEMS = [
  {
    id: "h1",
    name: "BeeYield Premium Acacia",
    description: "Premium grade select Acacia honey. High enzyme content, smooth texture, and exceptional clarity. Harvested from the pristine northern plains.",
    category: "honey",
    badge: "Premium",
    rating: 4.9,
    review_count: 245,
    is_active: true,
  },
  {
    id: "h2",
    name: "BeeYield Acacia",
    description: "Pure organic Acacia honey. 100% natural, harvested from the pristine plains of Makueni. Light golden color with a mild, sweet flavour.",
    category: "honey",
    badge: "Top Seller",
    rating: 5.0,
    review_count: 182,
    is_active: true,
  },
  {
    id: "h3",
    name: "BeeYield Premium Acacia",
    description: "Raw, unfiltered honey straight from Kitui county. Rich in natural enzymes.",
    category: "honey",
    badge: "Raw",
    rating: 4.8,
    review_count: 115,
    is_active: true,
  },
  {
    id: "h4",
    name: "BeeYield Acacia",
    description: "A beautiful blend of nectars from the diverse flora of Baringo.",
    category: "honey",
    badge: null,
    rating: 4.7,
    review_count: 92,
    is_active: true,
  },
  {
    id: "h5",
    name: "BeeYield Premium Acacia",
    description: "Deep, dark, and intensely flavored honey from West Pokot forests.",
    category: "honey",
    badge: "Wild",
    rating: 4.9,
    review_count: 140,
    is_active: true,
  },
  {
    id: "h6",
    name: "BeeYield Acacia",
    description: "A rare nectar collected by bees in the Taita Hills forests.",
    category: "honey",
    badge: "Rare",
    rating: 5.0,
    review_count: 67,
    is_active: true,
  },
  {
    id: "h7",
    name: "BeeYield Premium Acacia",
    description: "Crystal clear honey from the alpine forage zones of Mt. Kenya.",
    category: "honey",
    badge: null,
    rating: 4.8,
    review_count: 89,
    is_active: true,
  },
  {
    id: "h8",
    name: "BeeYield Acacia",
    description: "A highly unique honey from coastal mangrove forests. Salty-sweet.",
    category: "honey",
    badge: "Unique",
    rating: 4.9,
    review_count: 103,
    is_active: true,
  }
];

HONEY_ITEMS.forEach((item, idx) => {
  const stock = [100, 80, 45, 110, 65, 30, 70, 40][idx];
  item.variants = [
    { id: `v${item.id}-1`, size: "250g", price_kes: 250, stock_quantity: stock, is_available: true, batch_code: `KIB-ACAC-1${idx+1}1-250G` },
    { id: `v${item.id}-2`, size: "500g", price_kes: 500, stock_quantity: Math.floor(stock*0.8), is_available: true, batch_code: `KIB-ACAC-1${idx+1}2-500G` },
    { id: `v${item.id}-3`, size: "1kg", price_kes: 1000, stock_quantity: Math.floor(stock*0.4), is_available: true, batch_code: `KIB-ACAC-1${idx+1}3-1KG` }
  ];
});

async function reseedSupabase() {
  console.log("Fetching existing honey products...");
  const { data: honeyProducts, error } = await supabase
    .from('products')
    .select('id')
    .eq('category', 'honey');

  if (!error) {
    for (const p of honeyProducts) {
      console.log(`Deleting existing product ${p.id}...`);
      await supabase.from('product_variants').delete().eq('product_id', p.id);
      await supabase.from('products').delete().eq('id', p.id);
    }
  }

  console.log("Inserting new 8 products...");
  for (const item of HONEY_ITEMS) {
    const { data: insertedProduct, error: pError } = await supabase
      .from('products')
      .insert({
        name: item.name,
        description: item.description,
        category: item.category,
        badge: item.badge,
        rating: item.rating,
        review_count: item.review_count,
        is_active: item.is_active,
        price_kes: 250 // Base price indicator
      })
      .select()
      .single();

    if (pError) {
        console.log("Error inserting product:", pError);
        continue;
    }

    for (const v of item.variants) {
      await supabase
        .from('product_variants')
        .insert({
          product_id: insertedProduct.id,
          size: v.size,
          price_kes: v.price_kes,
          stock_quantity: v.stock_quantity,
          is_available: v.is_available,
          batch_code: v.batch_code
        });
    }
    console.log(`Successfully inserted ${item.name} with variants.`);
  }
}

reseedSupabase();
