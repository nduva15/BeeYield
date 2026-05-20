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
  const userId = '10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6';
  
  // 1. Check harvests directly
  const { data: harvests, error } = await supabase
    .from('harvests')
    .select('*')
    .eq('user_id', userId)
    .limit(5);
    
  if (error) {
    console.error('Error fetching harvests:', error);
    return;
  }
  
  console.log(`Found ${harvests.length} harvests directly by user_id`);
  if (harvests[0]) {
    console.log('Sample harvest apiary_id:', harvests[0].apiary_id);
    console.log('Sample harvest date:', harvests[0].date || harvests[0].harvest_date);
  }
  
  // 2. Check apiaries
  const { data: apiaries } = await supabase
    .from('apiaries')
    .select('*')
    .eq('user_id', userId);
    
  console.log(`Found ${apiaries?.length || 0} apiaries directly by user_id`);
  
  if (apiaries && apiaries.length > 0) {
    const apiaryId = apiaries[0].id;
    console.log('Apiary ID:', apiaryId);
    
    // 3. Check harvests by apiary
    const { data: harvestsByApiary } = await supabase
      .from('harvests')
      .select('*')
      .eq('apiary_id', apiaryId);
      
    console.log(`Found ${harvestsByApiary?.length || 0} harvests when searching by apiary_id`);
  }
}

main().catch(console.error);
