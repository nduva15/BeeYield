const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const FARMER_ID = "a1b2c3d4-0001-0001-0001-000000000001";
const APIARY_ID = "a1b2c3d4-0002-0002-0002-000000000002";

// 9 pollination crop flora types
const FLORA_TYPES = [
  "Acacia",
  "Sunflower",
  "Avocado",
  "Macadamia",
  "Mango",
  "Watermelon",
  "Tomato",
  "Coffee",
  "Passion Fruit"
];

async function main() {
  console.log('=== Normalizing: Timothy Nduva | BeeYield Apiary | 9 Flora ===\n');

  // 1. Upsert the single canonical farmer
  const { error: fErr } = await supabase.from('farmers').upsert({
    id: FARMER_ID,
    name: "Timothy Nduva",
    phone: "0742004187",
    email: "timothynduva349@gmail.com",
    experience_years: 15,
    story: "Timothy Nduva is a master beekeeper and conservationist in Kibwezi, Makueni County. With 15 years of experience, he pioneered sustainable Acacia honey production and provides pollination services to 9 different crops across the region.",
    location_name: "Kibwezi, Makueni",
    county: "Makueni",
    region: "Eastern",
    latitude: -2.41,
    longitude: 37.97,
    status: "active",
    certification_status: "Certified"
  });
  if (fErr) console.error('Farmer error:', fErr);
  else console.log('✓ Farmer: Timothy Nduva (timothynduva349)');

  // 2. Upsert the single canonical apiary: "BeeYield Apiary"
  const { error: aErr } = await supabase.from('apiaries').upsert({
    id: APIARY_ID,
    name: "BeeYield Apiary",
    location_name: "Kibwezi West, Makueni",
    county: "Makueni",
    region: "Eastern",
    latitude: -2.412,
    longitude: 37.975,
    farmer_id: FARMER_ID,
    status: "active",
    flora_types: FLORA_TYPES
  });
  if (aErr) console.error('Apiary error:', aErr);
  else console.log(`✓ Apiary: BeeYield Apiary | ${FLORA_TYPES.length} crops: ${FLORA_TYPES.join(', ')}`);

  // 3. Link all hives to the single apiary
  const { error: hvErr } = await supabase
    .from('hives')
    .update({ apiary_id: APIARY_ID })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (hvErr) console.error('Hive link error:', hvErr);
  else console.log('✓ All hives linked to BeeYield Apiary');

  // 4. Update all honey batches to show correct farmer & apiary
  const { error: bErr } = await supabase.from('honey_batches').update({
    farmer_name: "Timothy Nduva",
    apiary_name: "BeeYield Apiary",
    location_county: "Makueni"
  }).neq('batch_code', '');
  if (bErr) console.error('Batch update error:', bErr);
  else console.log('✓ All batches attributed to Timothy Nduva / BeeYield Apiary');

  // 5. Verify
  console.log('\n=== VERIFICATION ===');
  const { data: farmers } = await supabase.from('farmers').select('name, email');
  const { data: apiaries } = await supabase.from('apiaries').select('name, flora_types');
  const { count: totalBatches } = await supabase.from('honey_batches').select('*', { count: 'exact', head: true });
  const { count: acaciaCount } = await supabase.from('honey_batches').select('*', { count: 'exact', head: true }).eq('honey_type', 'BeeYield Acacia');
  const { count: premiumCount } = await supabase.from('honey_batches').select('*', { count: 'exact', head: true }).eq('honey_type', 'BeeYield Premium Acacia');
  const { data: activeProducts } = await supabase.from('products').select('name').eq('is_active', true);

  console.log(`  Farmers  : ${farmers.length} → ${farmers.map(f => f.name).join(', ')}`);
  console.log(`  Apiaries : ${apiaries.length} → ${apiaries.map(a => a.name).join(', ')}`);
  console.log(`  Flora    : ${apiaries[0]?.flora_types?.length || 0} → ${(apiaries[0]?.flora_types || []).join(', ')}`);
  console.log(`  Batches  : ${totalBatches} total`);
  console.log(`    BeeYield Acacia         : ${acaciaCount}`);
  console.log(`    BeeYield Premium Acacia : ${premiumCount}`);
  console.log(`  Active Products: ${activeProducts.map(p => p.name).join(', ')}`);

  console.log('\n=== DONE ===');
}

main().catch(console.error);
