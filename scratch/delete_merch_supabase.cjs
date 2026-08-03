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
const SERVICE_ROLE_KEY = getEnvValue('SUPABASE_SERVICE_ROLE_KEY_BEEYIELD') || getEnvValue('SUPABASE_SERVICE_ROLE_KEY') || getEnvValue('VITE_SUPABASE_ANON_KEY_BEEYIELD') || getEnvValue('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('Checking Supabase products table for merch items...');
  const { data: merchProducts, error } = await supabase
    .from('products')
    .select('id, name, category')
    .eq('category', 'merch');

  if (error) {
    console.error('Error querying products:', error);
  } else {
    console.log(`Found ${merchProducts ? merchProducts.length : 0} merch products in Supabase database.`);
    if (merchProducts && merchProducts.length > 0) {
      console.log('Deleting variants for merch products...');
      const merchIds = merchProducts.map(p => p.id);
      const { error: vErr } = await supabase.from('product_variants').delete().in('product_id', merchIds);
      if (vErr) console.error('Error deleting variants:', vErr);

      console.log('Deleting merch products...');
      const { error: pErr } = await supabase.from('products').delete().eq('category', 'merch');
      if (pErr) console.error('Error deleting products:', pErr);
      else console.log('Successfully deleted all merch products from Supabase database!');
    }
  }
}

main().catch(console.error);
