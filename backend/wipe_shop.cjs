const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('Clearing ALL products and variants from database...');

  const { error: ve } = await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (ve) console.error('Error deleting variants:', ve);

  const { error: pe } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (pe) console.error('Error deleting products:', pe);

  console.log('Database cleared!');
}

main().catch(console.error);
