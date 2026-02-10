
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import type { Database } from '../types/database.types'; // Relaxing type for new tables

const supabaseUrl = 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjAxNzgsImV4cCI6MjA4MzMzNjE3OH0.y2Y_J_Rd45UNQjCV-qx1HzCmCyU2ozjTKH7iP5-WSsI';

console.log('Using Hardcoded Supabase URL:', supabaseUrl);

let supabase: SupabaseClient | null = null;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

export { supabase };


