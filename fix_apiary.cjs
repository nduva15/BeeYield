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
  
  // Get Timothy's apiary
  const { data: apiary, error } = await supabase
    .from('apiaries')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .single();
    
  if (error || !apiary) {
    console.error('Failed to find apiary for user', error);
    return;
  }
  
  console.log('Found apiary', apiary.id);
  
  // Update all harvests
  const { data: updateData, error: updateError } = await supabase
    .from('harvests')
    .update({ apiary_id: apiary.id })
    .eq('user_id', userId)
    .is('apiary_id', null);
    
  if (updateError) {
    console.error('Update failed:', updateError);
  } else {
    console.log('Successfully updated harvests to use apiary_id');
  }
}

main().catch(console.error);
