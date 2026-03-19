const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const crops = [
  "Acacia",
  "Sunflower",
  "Mangoes",
  "Avocados",
  "Beans",
  "Oranges",
  "Tomatoes",
  "Onions"
];

const prices = [
  { size: '250g', price_kes: 250, stock: 100 },
  { size: '500g', price_kes: 500, stock: 100 },
  { size: '1kg', price_kes: 1000, stock: 100 }
];

async function main() {
  console.log('Linking Batches to Shop and Traceability...');

  // 1. Get User ID (Timothy)
  const { data: users, error: ue } = await supabase.auth.admin.listUsers();
  if (ue) throw ue;
  const user = users.users.find(u => u.email === 'timothynduva349@gmail.com');
  if (!user) throw new Error('User not found');
  const userId = user.id;

  // 2. Clear existing products and variants
  console.log('Clearing existing shop items...');
  await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 3. Create 8 Products (one for each crop)
  console.log('Creating 8 products for crops...');
  const productInserts = crops.map((crop, i) => ({
    name: `BeeYield ${crop} Honey`,
    description: `Premium ${crop} honey harvested through precision pollination in Makueni. High quality, 100% organic.`,
    category: 'honey',
    badge: i === 0 ? 'Bestseller' : (i === 1 ? 'Premium' : null),
    rating: 5,
    review_count: 0,
    is_active: true,
    price_kes: 0 // Variants will set the actual price
  }));

  const { data: products, error: pe } = await supabase.from('products').insert(productInserts).select();
  if (pe) throw pe;

  // 4. Create variants for each product
  console.log('Creating variants (250g, 500g, 1kg) for each product...');
  const variantInserts = [];
  for (const product of products) {
    for (const p of prices) {
      variantInserts.push({
        product_id: product.id,
        size: p.size,
        price_kes: p.price_kes,
        stock_quantity: p.stock,
        is_available: true
      });
    }
  }
  const { error: ve } = await supabase.from('product_variants').insert(variantInserts);
  if (ve) throw ve;

  // 5. Get existing batches
  const { data: batches, error: be } = await supabase.from('honey_batches').select('*').limit(8);
  if (be) throw be;
  
  // 6. Update honey_batches and harvests with better traceability data
  console.log(`Updating ${batches.length} traceability records with crops and harvest details...`);
  for (let i = 0; i < Math.min(batches.length, 8); i++) {
    const crop = crops[i];
    const batch = batches[i];
    
    const updateData = {
      honey_type: `${crop} Honey`,
      color_grade: i % 2 === 0 ? 'Light Amber' : 'Extra Light Amber',
      quality_grade: 'A',
      location_region: 'Kibwezi East',
      status: 'verified'
    };
    
    await supabase.from('honey_batches').update(updateData).eq('id', batch.id);

    // Also update the corresponding harvest record if possible by batch_code
    await supabase.from('harvests').update({
      honey_type: `${crop} Honey`,
      floral_source: `${crop} Blossom`,
      notes: `Harvested from hives pollinating ${crop} fields.`
    }).eq('batch_code', batch.batch_code);
  }

  console.log('Linking complete!');
}

main().catch(console.error);
