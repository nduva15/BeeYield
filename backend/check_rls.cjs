const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('--- Checking RLS Policies ---');
  let { data: policies } = await supabase.from('hives').select('*').limit(1);
  console.log('Got a hive via service role:', !!policies.length);

  // Now let's try reading it as an anonymous user, or we can just fetch policies from pg_policies
  let { data: pg_policies, error } = await supabase.rpc('query_pg_policies', {});
  console.log('pg_policies error:', error);
  
  if (error) {
     const { data: db_info } = await supabase.rpc('exec_sql', { sql: "SELECT * FROM pg_policies WHERE tablename IN ('hives', 'apiaries')" });
     console.log('db_info:', db_info);
  } else {
     console.log('pg_policies:', pg_policies);
  }
}

main().catch(console.error);
