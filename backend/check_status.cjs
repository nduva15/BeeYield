const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('--- DB Check ---');
  let { data: apiaries, error: apiaryErr } = await supabase.from('apiaries').select('*');
  console.log('Apiaries count:', apiaries?.length);
  for (const a of apiaries || []) console.log(`- ${a.name} (status: ${a.status}, is_active: ${a.is_active}) user_id: ${a.user_id} farmer_id: ${a.farmer_id}`);

  let { count: hiveCount } = await supabase.from('hives').select('*', { count: 'exact', head: true });
  console.log('Hives count:', hiveCount);
}

main().catch(console.error);
