const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const P_ACACIA_ID = "e8a9f7d2-4b2a-4a2a-8b2a-4a2a4a2a4a2a";
const P_PREMIUM_ID = "f1b1a1a1-1b1b-1b1b-1b1b-1b1b1b1b1b1b";

async function main() {
  console.log('Finalizing Honey Products and Synchronizing Batch Data...');

  // 1. Update/Clean Products
  console.log('Cleaning products...');
  // Ensure we only have these two honeys active
  await supabase.from('products').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Update BeeYield Acacia
  await supabase.from('products').upsert({
    id: P_ACACIA_ID,
    name: "BeeYield Acacia",
    description: "Pure organic Acacia honey. 100% natural, harvested from the pristine plains of Makueni.",
    category: "honey",
    is_active: true,
    badge: "Top Seller"
  });

  // Rename and set BeeYield Premium Acacia
  await supabase.from('products').upsert({
    id: P_PREMIUM_ID,
    name: "BeeYield Premium Acacia",
    description: "Premium grade select Acacia honey. High enzyme content, smooth texture, and exceptional clarity.",
    category: "honey",
    is_active: true,
    badge: "Premium"
  });

  // 2. Clean and Set Variants for both
  console.log('Setting variants (250g, 500g, 1kg) for both products...');
  const productIds = [P_ACACIA_ID, P_PREMIUM_ID];
  const prices = [
    { size: '250g', price: 250 },
    { size: '500g', price: 500 },
    { size: '1kg', price: 1000 }
  ];

  for (const pid of productIds) {
    // Delete existing variants for these products
    await supabase.from('product_variants').delete().eq('product_id', pid);
    
    // Insert fresh variants
    const variantInserts = prices.map(p => ({
        product_id: pid,
        size: p.size,
        price_kes: p.price,
        stock_quantity: 100,
        is_available: true
    }));
    await supabase.from('product_variants').insert(variantInserts);
  }

  // 3. Update ALL Batches and Harvests
  console.log('Updating ALL honey batches and harvests to match these types...');
  // We'll alternate between the two types
  const { data: batches } = await supabase.from('honey_batches').select('id, batch_code');
  if (batches) {
      for (let i = 0; i < batches.length; i++) {
          const type = i % 2 === 0 ? "BeeYield Acacia" : "BeeYield Premium Acacia";
          const batch = batches[i];
          
          await supabase.from('honey_batches').update({
              honey_type: type,
              status: 'verified',
              quality_grade: 'A'
          }).eq('id', batch.id);

          await supabase.from('harvests').update({
              honey_type: type,
              notes: `Verified ${type} harvest.`
          }).eq('batch_code', batch.batch_code);
      }
  }

  console.log('Seeding and Synchronization complete! Only two honeys active now.');
}

main().catch(console.error);
