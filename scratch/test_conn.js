import { createClient } from '@supabase/supabase-js';

const url = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjAxNzgsImV4cCI6MjA4MzMzNjE3OH0.y2Y_J_Rd45UNQjCV-qx1HzCmCyU2ozjTKH7iP5-WSsI';

const supabase = createClient(url, anonKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Connection failed with error:', error.message);
    } else {
      console.log('✅ Connection successful! Profile count:', data);
    }
  } catch (err) {
    console.error('❌ Connection threw an exception:', err);
  }
}

testConnection();
