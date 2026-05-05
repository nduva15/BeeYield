const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkColumns() {
  const { data: userIdData } = await supabase.auth.admin.listUsers();
  const userId = userIdData.users.find(u => u.email === 'timothynduva349@gmail.com').id;
  
  const { data: apiaries } = await supabase.from('apiaries').select('id').eq('user_id', userId).limit(1);
  const { data: hives } = await supabase.from('hives').select('id').eq('user_id', userId).limit(1);
  
  if (!apiaries.length || !hives.length) {
    console.log('Need apiary and hive to test harvest insert.');
    return;
  }

  const testRecord = {
    user_id: userId,
    apiary_id: apiaries[0].id,
    hive_id: hives[0].id,
    harvest_date: '2026-01-01',
    quantity_kg: 2.0,
    notes: 'schema_check_2'
  };

  console.log('Testing insert with harvest_date and quantity_kg...');
  const { data, error } = await supabase.from('harvests').insert(testRecord).select();
  if (error) {
    console.log('Insert error:', error);
  } else {
    console.log('Insert successful! Columns in harvests:', Object.keys(data[0]));
  }
}

checkColumns().catch(console.error);
