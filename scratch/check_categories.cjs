const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnvValue(keyName) {
  if (process.env[keyName]) return process.env[keyName];
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envData = fs.readFileSync(envPath, 'utf8');
    for (const line of envData.split('\n')) {
      const parts = line.split('=');
      if (parts.length >= 2 && parts[0].trim() === keyName) {
        let val = parts.slice(1).join('=').trim();
        if (val.startsWith('\"') || val.startsWith('\'')) val = val.slice(1, -1);
        return val;
      }
    }
  }
  return '';
}

const SUPABASE_URL = getEnvValue('VITE_SUPABASE_URL_BEEYIELD') || getEnvValue('VITE_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnvValue('SUPABASE_SERVICE_ROLE_KEY_BEEYIELD') || getEnvValue('SUPABASE_SERVICE_ROLE_KEY') || getEnvValue('VITE_SUPABASE_ANON_KEY_BEEYIELD') || getEnvValue('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('products').select('id, name, category');
  if(error) console.error(error);
  else {
    const categories = new Set(data.map(d => d.category));
    console.log('Categories:', Array.from(categories));
    const merch = data.filter(d => d.category.toLowerCase().includes('merch') || d.category.toLowerCase().includes('apparel') || d.name.toLowerCase().includes('beanie') || d.name.toLowerCase().includes('tee'));
    console.log('Products matching merch:', merch);
  }
}
check();
