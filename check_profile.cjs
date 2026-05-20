
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

async function checkProfile() {
    const email = 'timothynduva349@gmail.com';
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const timothy = users.find(u => u.email === email);
    if (!timothy) return;

    console.log('User ID:', timothy.id);
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', timothy.id).single();
    console.log('Profile:', profile);
    
    // Also check if they are in admin_users
    const { data: admin } = await supabase.from('admin_users').select('*').eq('user_id', timothy.id);
    console.log('Admin Users Records:', admin);
}

checkProfile();
