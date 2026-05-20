/**
 * deep_cleanup.cjs
 * 
 * Properly removes duplicate farmers/apiaries by:
 * 1. Moving all hives to point to the canonical apiary
 * 2. Then deleting the duplicate apiary
 * 3. Moving apiaries to point to the canonical farmer
 * 4. Then deleting the duplicate farmer
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

const FLORA_TYPES = [
  "Acacia", "Sunflower", "Avocado", "Macadamia", "Mango",
  "Watermelon", "Tomato", "Coffee", "Passion Fruit"
];

async function main() {
  console.log('=== Deep Cleanup: Remove ALL duplicate farmers & apiaries ===\n');

  // ── Step 1: Identify canonical farmer and apiaries ────────
  const { data: allFarmers } = await supabase.from('farmers').select('*').order('created_at', { ascending: true });
  const { data: allApiaries } = await supabase.from('apiaries').select('*').order('created_at', { ascending: true });

  console.log(`Farmers found: ${allFarmers.length}`);
  allFarmers.forEach(f => console.log(`  [${f.id.slice(0,8)}] ${f.name} | ${f.email || 'no email'} | created: ${f.created_at}`));

  console.log(`\nApiaries found: ${allApiaries.length}`);
  allApiaries.forEach(a => console.log(`  [${a.id.slice(0,8)}] ${a.name} | farmer_id: ${a.farmer_id?.slice(0,8)}`));

  // Pick oldest real-data farmer as canonical (first in time)
  const canonicalFarmer = allFarmers.find(f => f.email?.includes('timothynduva')) || allFarmers[0];
  const dupFarmers = allFarmers.filter(f => f.id !== canonicalFarmer.id);

  // Pick oldest real-data apiary as canonical
  const canonicalApiary = allApiaries.find(a => a.farmer_id === canonicalFarmer.id) || allApiaries[0];
  const dupApiaries = allApiaries.filter(a => a.id !== canonicalApiary.id);

  console.log(`\nCanonical Farmer : ${canonicalFarmer.name} [${canonicalFarmer.id.slice(0,8)}]`);
  console.log(`Canonical Apiary : ${canonicalApiary.name} [${canonicalApiary.id.slice(0,8)}]`);

  // ── Step 2: Move all hives to canonical apiary first ─────
  console.log('\n[1] Moving all hives to canonical apiary...');
  const { error: hErr } = await supabase.from('hives').update({ apiary_id: canonicalApiary.id })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (hErr) console.error('   Hive move error:', hErr.message);
  else console.log('   ✓ All hives moved.');

  // ── Step 3: Move canonical apiary farmer_id to canonical farmer ─
  console.log('\n[2] Linking canonical apiary to canonical farmer...');
  await supabase.from('apiaries').update({ farmer_id: canonicalFarmer.id }).eq('id', canonicalApiary.id);
  console.log('   ✓ Apiary linked to farmer.');

  // ── Step 4: Delete duplicate apiaries (no more FK constraints) ──
  console.log('\n[3] Deleting duplicate apiaries...');
  for (const a of dupApiaries) {
    // First move their hives away
    await supabase.from('hives').update({ apiary_id: canonicalApiary.id }).eq('apiary_id', a.id);
    const { error } = await supabase.from('apiaries').delete().eq('id', a.id);
    if (error) console.error(`   [!] Could not delete apiary ${a.id.slice(0,8)}: ${error.message}`);
    else console.log(`   ✓ Deleted apiary: ${a.name} [${a.id.slice(0,8)}]`);
  }

  // ── Step 5: Move all apiaries to canonical farmer, then delete dup farmers ─
  console.log('\n[4] Moving all apiaries to canonical farmer...');
  await supabase.from('apiaries').update({ farmer_id: canonicalFarmer.id })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('\n[5] Deleting duplicate farmers...');
  for (const f of dupFarmers) {
    // Move their apiaries away first
    await supabase.from('apiaries').update({ farmer_id: canonicalFarmer.id }).eq('farmer_id', f.id);
    const { error } = await supabase.from('farmers').delete().eq('id', f.id);
    if (error) console.error(`   [!] Could not delete farmer ${f.id.slice(0,8)}: ${error.message}`);
    else console.log(`   ✓ Deleted duplicate farmer: ${f.name} [${f.id.slice(0,8)}]`);
  }

  // ── Step 6: Update canonical records with correct data ───
  console.log('\n[6] Updating canonical farmer & apiary data...');
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

  // Update all batches to reference canonical names
  await supabase.from('honey_batches').update({
    farmer_name: "Timothy Nduva",
    apiary_name: "BeeYield Apiary",
    location_county: "Makueni"
  }).neq('batch_code', '');

  console.log('   ✓ All canonical data updated.');

  // ── Final verification ────────────────────────────────────
  const { data: fFinal } = await supabase.from('farmers').select('id, name, email');
  const { data: aFinal } = await supabase.from('apiaries').select('id, name, flora_types');
  const { count: bTotal } = await supabase.from('honey_batches').select('*', { count: 'exact', head: true });
  const { count: bAcacia } = await supabase.from('honey_batches').select('*', { count: 'exact', head: true }).eq('honey_type', 'BeeYield Acacia');
  const { count: bPremium } = await supabase.from('honey_batches').select('*', { count: 'exact', head: true }).eq('honey_type', 'BeeYield Premium Acacia');
  const { data: prods } = await supabase.from('products').select('name').eq('is_active', true);

  console.log('\n=== FINAL STATE ===');
  console.log(`  Farmers  : ${fFinal.length}`);
  fFinal.forEach(f => console.log(`    -> ${f.name} <${f.email}>`));
  console.log(`  Apiaries : ${aFinal.length}`);
  aFinal.forEach(a => console.log(`    -> ${a.name} | ${a.flora_types?.length} crops`));
  if (aFinal[0]) console.log(`       Crops: ${aFinal[0].flora_types?.join(', ')}`);
  console.log(`  Batches  : ${bTotal} total (Acacia: ${bAcacia}, Premium Acacia: ${bPremium})`);
  console.log(`  Active Products: ${prods.map(p => p.name).join(', ')}`);
  console.log('\n=== DONE ===');
}

main().catch(console.error);
