const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';
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
