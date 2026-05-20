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

async function checkColumns() {
  const { data: userIdData } = await supabase.auth.admin.listUsers();
  const userId = userIdData.users.find(u => u.email === 'timothynduva349@gmail.com').id;
  
  const { data: apiaries } = await supabase.from('apiaries').select('id').eq('user_id', userId).limit(1);
  const { data: hives } = await supabase.from('hives').select('id').eq('user_id', userId).limit(1);
  
  if (!apiaries.length || !hives.length) {
    console.log('Need apiary and hive to test harvest insert.');
    return;
  }

  const testRecord = {
    user_id: userId,
    apiary_id: apiaries[0].id,
    hive_id: hives[0].id,
    harvest_date: '2026-01-01',
    quantity_kg: 2.0,
    notes: 'schema_check_2'
  };

  console.log('Testing insert with harvest_date and quantity_kg...');
  const { data, error } = await supabase.from('harvests').insert(testRecord).select();
  if (error) {
    console.log('Insert error:', error);
  } else {
    console.log('Insert successful! Columns in harvests:', Object.keys(data[0]));
  }
}

checkColumns().catch(console.error);
