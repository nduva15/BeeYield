const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const userId = '10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6';
  
  // 1. Check harvests directly
  const { data: harvests, error } = await supabase
    .from('harvests')
    .select('*')
    .eq('user_id', userId)
    .limit(5);
    
  if (error) {
    console.error('Error fetching harvests:', error);
    return;
  }
  
  console.log(`Found ${harvests.length} harvests directly by user_id`);
  if (harvests[0]) {
    console.log('Sample harvest apiary_id:', harvests[0].apiary_id);
    console.log('Sample harvest date:', harvests[0].date || harvests[0].harvest_date);
  }
  
  // 2. Check apiaries
  const { data: apiaries } = await supabase
    .from('apiaries')
    .select('*')
    .eq('user_id', userId);
    
  console.log(`Found ${apiaries?.length || 0} apiaries directly by user_id`);
  
  if (apiaries && apiaries.length > 0) {
    const apiaryId = apiaries[0].id;
    console.log('Apiary ID:', apiaryId);
    
    // 3. Check harvests by apiary
    const { data: harvestsByApiary } = await supabase
      .from('harvests')
      .select('*')
      .eq('apiary_id', apiaryId);
      
    console.log(`Found ${harvestsByApiary?.length || 0} harvests when searching by apiary_id`);
  }
}

main().catch(console.error);
