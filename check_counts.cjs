
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

const url = getEnvValue('VITE_SUPABASE_URL_BEEYIELD') || getEnvValue('VITE_SUPABASE_URL') || 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const key = getEnvValue('SUPABASE_SERVICE_ROLE_KEY_BEEYIELD') || getEnvValue('SUPABASE_SERVICE_ROLE_KEY');
if (!key) {
  console.error('SUPABASE_SERVICE_ROLE_KEY_BEEYIELD environment variable is missing.');
  process.exit(1);
}
const supabase = createClient(url, key);

async function checkData() {
    const email = 'timothynduva349@gmail.com';
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) { console.error('Auth error:', authError); return; }
    
    const timothy = users.find(u => u.email === email);
    if (!timothy) {
        console.log('Timothy user not found!');
        return;
    }
    
    console.log('Timothy User ID:', timothy.id);
    
    const tables = ['farmers', 'apiaries', 'hives', 'harvests'];
    for (const table of tables) {
        let query = supabase.from(table).select('*', { count: 'exact', head: true });
        // Assume all these tables have user_id, or at least common for this check
        const { data, count, error } = await query.eq('user_id', timothy.id);
        
        if (error) {
            console.error(`Error checking ${table}:`, error);
        } else {
            console.log(`${table}: ${count} records`);
        }
    }
}

checkData();
