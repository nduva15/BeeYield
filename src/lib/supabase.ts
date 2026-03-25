
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Base configuration
const defaultUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ezfccfypwmuvbpujkqrg.supabase.co';
const defaultKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjAxNzgsImV4cCI6MjA4MzMzNjE3OH0.y2Y_J_Rd45UNQjCV-qx1HzCmCyU2ozjTKH7iP5-WSsI';

// 1. Shop Backend (E-commerce, Customers, Orders)
const shopUrl = import.meta.env.VITE_SUPABASE_URL_SHOP || defaultUrl;
const shopKey = import.meta.env.VITE_SUPABASE_ANON_KEY_SHOP || defaultKey;

// 2. BeeYield Backend (Hives, IoT, Farmers)
const beeyieldUrl = import.meta.env.VITE_SUPABASE_URL_BEEYIELD || defaultUrl;
const beeyieldKey = import.meta.env.VITE_SUPABASE_ANON_KEY_BEEYIELD || defaultKey;

// 3. CEBA Backend (Content Engine, Admin, Dashboard)
const cebaUrl = import.meta.env.VITE_SUPABASE_URL_CEBA || defaultUrl;
const cebaKey = import.meta.env.VITE_SUPABASE_ANON_KEY_CEBA || defaultKey;

const createNamedClient = (url: string, key: string, storageKey: string) => {
  try {
    return createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey, // Unique per client to avoid multiple GoTrueClient instance warnings
      }
    });
  } catch (error) {
    console.error(`Failed to initialize Supabase client (${storageKey}):`, error);
    return null;
  }
};

export const supabaseShop = createNamedClient(shopUrl, shopKey, 'sb-auth-token-shop');
export const supabaseBeeYield = createNamedClient(beeyieldUrl, beeyieldKey, 'sb-auth-token-beeyield');
export const supabaseCEBA = createNamedClient(cebaUrl, cebaKey, 'sb-auth-token-ceba');

// Default export remains for backward compatibility, pointing to shop by default
export const supabase = supabaseShop;


