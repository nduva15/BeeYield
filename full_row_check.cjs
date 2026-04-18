const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fullCheck() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log("Full row data:", JSON.stringify(data[0], null, 2));
  }
}
fullCheck();
