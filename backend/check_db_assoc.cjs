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

async function check() {
  console.log('--- Database Check ---');
  
  // Get all farmers to see which user is the client
  const { data: farmers } = await supabase.from('farmers').select('*');
  console.log('Farmers:', farmers);
  
  // Get the apiaries
  const { data: apiaries } = await supabase.from('apiaries').select('*');
  console.log('Apiaries count:', apiaries.length);
  for (const a of apiaries) {
    console.log(`Apiary: ${a.name}, ID: ${a.id}, UserID: ${a.user_id}`);
  }
  
  // Get hives and their relationship
  const { data: hives } = await supabase.from('hives').select('id, apiary_id, user_id, hive_code').limit(10);
  console.log('Sample Hives:', hives);
  
  if (hives.length > 0) {
      const hiveUserId = hives[0].user_id;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', hiveUserId);
      console.log('Profile associated with hives:', profile);
  }
}

check();
