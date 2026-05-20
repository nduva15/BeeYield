/**
 * cleanup_duplicates.cjs
 *
 * Looks up Timothy Nduva and BeeYield Apiary by their actual
 * saved names (no hardcoded IDs), keeps exactly 1 of each,
 * deletes every other record.
 */
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

const SUPABASE_URL = getEnvValue('VITE_SUPABASE_URL_BEEYIELD') || getEnvValue('VITE_SUPABASE_URL') || 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = getEnvValue('SUPABASE_SERVICE_ROLE_KEY_BEEYIELD') || getEnvValue('SUPABASE_SERVICE_ROLE_KEY');
if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY_BEEYIELD environment variable is missing.');
}
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// 9 pollination crop flora types for BeeYield Apiary
const FLORA_TYPES = [
  "Acacia", "Sunflower", "Avocado", "Macadamia", "Mango",
  "Watermelon", "Tomato", "Coffee", "Passion Fruit"
];

async function deleteAllExceptOne(table, records, keepName, nameField = 'name') {
  // Sort: prefer records that already have more data (longer created_at = newer upsert)
  // or whichever has the email set for farmer
  const keep = records[0]; // first match from DB — we update it directly
  const toDelete = records.slice(1);

  for (const r of toDelete) {
    const { error } = await supabase.from(table).delete().eq('id', r.id);
    if (error) console.error(`  [!] Could not delete ${table} id=${r.id}:`, error.message);
    else console.log(`  Deleted extra ${table}: id=${r.id.slice(0,8)}...`);
  }

  return keep;
}

async function main() {
  console.log('=== Cleanup: Keep 1 Farmer, 1 Apiary, delete all duplicates ===\n');

  // ── FARMERS ──────────────────────────────────────────────
  const { data: allFarmers } = await supabase
    .from('farmers')
    .select('*')
    .order('created_at', { ascending: true }); // oldest first = real client data

  console.log(`Found ${allFarmers.length} farmer(s) total.`);

  const timoFarmers = allFarmers.filter(f =>
    f.name?.toLowerCase().includes('timothy') || f.email?.includes('timothynduva')
  );
  const otherFarmers = allFarmers.filter(f =>
    !f.name?.toLowerCase().includes('timothy') && !f.email?.includes('timothynduva')
  );

  // Delete completely unrelated farmers
  for (const f of otherFarmers) {
    const { error } = await supabase.from('farmers').delete().eq('id', f.id);
    if (error) console.error(`  [!] Delete failed for farmer ${f.id}:`, error.message);
    else console.log(`  Deleted unrelated farmer: ${f.name}`);
  }

  // From Timothy duplicates, keep the oldest (real client record), delete rest
  let canonicalFarmer = timoFarmers[0];
  if (timoFarmers.length > 1) {
    canonicalFarmer = await deleteAllExceptOne('farmers', timoFarmers, 'Timothy Nduva');
  }

  console.log(`\n✓ Canonical Farmer: ${canonicalFarmer.name} (id=${canonicalFarmer.id.slice(0,8)}...)`);

  // Update it with the correct details
  await supabase.from('farmers').update({
    name: "Timothy Nduva",
    email: "timothynduva349@gmail.com",
    phone: "0742004187",
    experience_years: 15,
    story: "Timothy Nduva is a master beekeeper in Kibwezi, Makueni County. With 15 years of experience, he specializes in organic Acacia honey production and provides pollination services across 9 crops in the region.",
    location_name: "Kibwezi, Makueni",
    county: "Makueni",
    region: "Eastern",
    latitude: -2.41,
    longitude: 37.97,
    status: "active",
    certification_status: "Certified"
  }).eq('id', canonicalFarmer.id);

  // ── APIARIES ─────────────────────────────────────────────
  const { data: allApiaries } = await supabase
    .from('apiaries')
    .select('*')
    .order('created_at', { ascending: true });

  console.log(`\nFound ${allApiaries.length} apiary(s) total.`);

  const beeyieldApiaries = allApiaries.filter(a =>
    a.name?.toLowerCase().includes('beeyield') || a.name?.toLowerCase().includes('kibwezi')
  );
  const otherApiaries = allApiaries.filter(a =>
    !a.name?.toLowerCase().includes('beeyield') && !a.name?.toLowerCase().includes('kibwezi')
  );

  for (const a of otherApiaries) {
    const { error } = await supabase.from('apiaries').delete().eq('id', a.id);
    if (error) console.error(`  [!] Delete failed for apiary ${a.id}:`, error.message);
    else console.log(`  Deleted unrelated apiary: ${a.name}`);
  }

  let canonicalApiary = beeyieldApiaries[0];
  if (beeyieldApiaries.length > 1) {
    canonicalApiary = await deleteAllExceptOne('apiaries', beeyieldApiaries, 'BeeYield Apiary');
  }

  console.log(`\n✓ Canonical Apiary: ${canonicalApiary.name} (id=${canonicalApiary.id.slice(0,8)}...)`);

  // Update with correct name and 9 flora types
  await supabase.from('apiaries').update({
    name: "BeeYield Apiary",
    location_name: "Kibwezi West, Makueni",
    county: "Makueni",
    region: "Eastern",
    latitude: -2.412,
    longitude: 37.975,
    farmer_id: canonicalFarmer.id,
    status: "active",
    flora_types: FLORA_TYPES
  }).eq('id', canonicalApiary.id);

  // ── LINK EVERYTHING ──────────────────────────────────────
  // All hives → canonical apiary
  await supabase.from('hives').update({ apiary_id: canonicalApiary.id })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  // All batches → canonical farmer & apiary names
  await supabase.from('honey_batches').update({
    farmer_name: "Timothy Nduva",
    apiary_name: "BeeYield Apiary",
    location_county: "Makueni"
  }).neq('batch_code', '');

  console.log('✓ All hives & batches re-linked to canonical records');

  // ── FINAL VERIFICATION ───────────────────────────────────
  console.log('\n=== FINAL VERIFICATION ===');
  const { data: fCheck } = await supabase.from('farmers').select('id, name, email');
  const { data: aCheck } = await supabase.from('apiaries').select('id, name, flora_types');
  const { count: bTotal } = await supabase.from('honey_batches').select('*', { count: 'exact', head: true });
  const { count: bAcacia } = await supabase.from('honey_batches').select('*', { count: 'exact', head: true }).eq('honey_type', 'BeeYield Acacia');
  const { count: bPremium } = await supabase.from('honey_batches').select('*', { count: 'exact', head: true }).eq('honey_type', 'BeeYield Premium Acacia');
  const { data: activeProds } = await supabase.from('products').select('name').eq('is_active', true);

  console.log(`  Farmers  : ${fCheck.length}`);
  fCheck.forEach(f => console.log(`    -> ${f.name} | ${f.email}`));

  console.log(`  Apiaries : ${aCheck.length}`);
  aCheck.forEach(a => console.log(`    -> ${a.name} | ${a.flora_types?.length || 0} crops: ${(a.flora_types || []).join(', ')}`));

  console.log(`  Batches  : ${bTotal} (Acacia: ${bAcacia}, Premium: ${bPremium})`);
  console.log(`  Active Products: ${activeProds.map(p => p.name).join(', ')}`);
  console.log('\n=== DONE ===');
}

main().catch(console.error);
