
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import type { Database } from '../types/database.types'; // Relaxing type for new tables

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
} else {
  console.warn('Missing Supabase environment variables - some features may not work');
}

export { supabase };


