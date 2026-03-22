const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function check() {
  console.log('--- Database Check ---');
  
  // Get all farmers to see which user is the client
  const { data: farmers } = await supabase.from('farmers').select('*');
  console.log('Farmers:', farmers);
  
  // Get the apiaries
  const { data: apiaries } = await supabase.from('apiaries').select('*');
  console.log('Apiaries count:', apiaries.length);
  for (const a of apiaries) {
    console.log(`Apiary: ${a.name}, ID: ${a.id}, UserID: ${a.user_id}`);
  }
  
  // Get hives and their relationship
  const { data: hives } = await supabase.from('hives').select('id, apiary_id, user_id, hive_code').limit(10);
  console.log('Sample Hives:', hives);
  
  if (hives.length > 0) {
      const hiveUserId = hives[0].user_id;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', hiveUserId);
      console.log('Profile associated with hives:', profile);
  }
}

check();
