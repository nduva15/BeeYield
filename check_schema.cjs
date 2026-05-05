const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkColumns() {
  const { data, error } = await supabase.from('harvests').select('*').limit(1);
  if (error) {
    console.error('Error selecting from harvests:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns in harvests:', Object.keys(data[0]));
  } else {
    console.log('No data in harvests, trying to insert a dummy record to see schema error...');
    const { error: insertError } = await supabase.from('harvests').insert({ notes: 'schema_check' });
    console.log('Insert error:', insertError);
  }
}

checkColumns().catch(console.error);
