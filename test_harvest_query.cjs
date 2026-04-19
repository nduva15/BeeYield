const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase
    .from('harvests')
    .select('*,hive:hives(*,apiary:apiaries(*)),farmer:farmers(*)')
    .eq('user_id', '10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6')
    .limit(10);
    
  if (error) {
    console.error('Supabase query error:', error);
  } else {
    console.log(`Success! Fetched ${data.length} rows.`);
    if (data.length > 0) {
      console.log(JSON.stringify(data[0], null, 2));
    }
  }
}

main().catch(console.error);
