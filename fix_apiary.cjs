const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const userId = '10c9b5b3-f9c4-47cf-bc6b-c7d6e8e4bce6';
  
  // Get Timothy's apiary
  const { data: apiary, error } = await supabase
    .from('apiaries')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .single();
    
  if (error || !apiary) {
    console.error('Failed to find apiary for user', error);
    return;
  }
  
  console.log('Found apiary', apiary.id);
  
  // Update all harvests
  const { data: updateData, error: updateError } = await supabase
    .from('harvests')
    .update({ apiary_id: apiary.id })
    .eq('user_id', userId)
    .is('apiary_id', null);
    
  if (updateError) {
    console.error('Update failed:', updateError);
  } else {
    console.log('Successfully updated harvests to use apiary_id');
  }
}

main().catch(console.error);
