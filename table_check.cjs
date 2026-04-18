const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const { data, error } = await supabase.rpc('get_tables'); // This might not work if RPC isn't defined
  if (error) {
    // Fallback: Try a generic query to common tables
    console.error("RPC failed, trying direct select from common tables...");
    const tables = ['products', 'product_variants', 'product_images', 'variants'];
    for (const t of tables) {
      const { error: tError } = await supabase.from(t).select('*').limit(1);
      if (!tError) console.log(`Table exists: ${t}`);
      else console.log(`Table missing or error: ${t} (${tError.message})`);
    }
  } else {
    console.log(data);
  }
}
checkTables();
