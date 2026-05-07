const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2MDE3OCwiZXhwIjoyMDgzMzM2MTc4fQ.cUAMauYI-cqpPjy-OWUhXIc9viL4PpX87rniDjYTjLI';
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkIot() {
  const { data, error } = await supabase.from('iot_devices').select('*').limit(1);
  if (error) {
    console.log('iot_devices error:', error.message);
  } else {
    console.log('iot_devices exists, columns:', Object.keys(data[0] || {}));
  }
}

checkIot().catch(console.error);

