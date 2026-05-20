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

async function main() {
  console.log('--- Inspecting Apiaries ---');
  let { data: apiaries, error: apiaryErr } = await supabase.from('apiaries').select('*');
  if (apiaryErr) throw apiaryErr;
  
  for (const a of apiaries) {
    console.log(`Apiary: ID=${a.id}, Name="${a.name}", Acreage=${a.size_acres || 'N/A'}`);
    let { count: hiveCount } = await supabase.from('hives').select('*', { count: 'exact', head: true }).eq('apiary_id', a.id);
    console.log(`  -> Hives: ${hiveCount}`);
  }

  // Find BeeYield Apiary
  const beeyield = apiaries.find(a => a.name.toLowerCase().includes('beeyield'));
  if (beeyield) {
    console.log('\nUpdating BeeYield Apiary size to 5 acres...');
    const { error: updErr } = await supabase.from('apiaries')
      .update({ size_acres: 5 })
      .eq('id', beeyield.id);
    if (updErr) console.error('  Update error:', updErr);
    else console.log('  -> Success');
  }

  // Identify any apiary with "kibwezi" in the name but not beeyield, or just any apiary that is NOT beeyield
  const toDelete = apiaries.filter(a => a.id !== beeyield?.id);
  
  if (toDelete.length > 0) {
    console.log(`\nFound ${toDelete.length} other apiaries to process...`);
    for (const apiary of toDelete) {
        console.log(`\nDeleting apiary: "${apiary.name}" (${apiary.id})`);
        
        // Find hives
        const { data: hives } = await supabase.from('hives').select('id, hive_code').eq('apiary_id', apiary.id);
        console.log(`  -> Has ${hives.length} hives to delete`);
        
        for (const h of hives) {
            console.log(`  -> Deleting hive ${h.hive_code} (${h.id})`);
            // Clean up dependencies first just in case
            await supabase.from('harvests').delete().eq('hive_id', h.id);
            await supabase.from('honey_batches').delete().eq('hive_id', h.id);
            await supabase.from('sensor_readings').delete().eq('hive_id', h.id);
            
            const { error: delHiveErr } = await supabase.from('hives').delete().eq('id', h.id);
            if (delHiveErr) console.error('    x Error deleting hive:', delHiveErr.message);
        }
        
        // Delete apiary
        const { error: delApiaryErr } = await supabase.from('apiaries').delete().eq('id', apiary.id);
        if (delApiaryErr) console.error('  x Error deleting apiary:', delApiaryErr.message);
        else console.log(`  -> Successfully deleted apiary: ${apiary.name}`);
    }
  } else {
    console.log('\nNo other apiaries found. Only BeeYield Apiary exists.');
  }

  let { data: finalApiaries } = await supabase.from('apiaries').select('id, name, size_acres');
  console.log('\n--- FINAL APIARIES ---');
  for (const a of finalApiaries) {
    console.log(`- ${a.name} (${a.size_acres} acres)`);
  }
}

main().catch(console.error);
