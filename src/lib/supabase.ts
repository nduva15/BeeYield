import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Base configuration - MUST be provided via environment variables in production
const defaultUrl = import.meta.env.VITE_SUPABASE_URL;
const defaultKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 1. Shop Backend (E-commerce, Customers, Orders)
const shopUrl = import.meta.env.VITE_SUPABASE_URL_SHOP || defaultUrl;
const shopKey = import.meta.env.VITE_SUPABASE_ANON_KEY_SHOP || defaultKey;

// 2. BeeYield Backend (Hives, IoT, Farmers)
const beeyieldUrl = import.meta.env.VITE_SUPABASE_URL_BEEYIELD || defaultUrl;
const beeyieldKey = import.meta.env.VITE_SUPABASE_ANON_KEY_BEEYIELD || defaultKey;

// 3. CEBA Backend (Content Engine, Admin, Dashboard)
const cebaUrl = import.meta.env.VITE_SUPABASE_URL_CEBA || defaultUrl;
const cebaKey = import.meta.env.VITE_SUPABASE_ANON_KEY_CEBA || defaultKey;

const createNamedClient = (url: string | undefined, key: string | undefined, storageKey: string) => {
  if (!url || !key) {
    if (import.meta.env.PROD) {
      console.error(`CRITICAL: Supabase client (${storageKey}) missing credentials in production!`);
    } else {
      console.warn(`Supabase client (${storageKey}) initialization skipped: Missing URL or Key. Please check your .env file.`);
    }
    return null;
  }

  try {
    return createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storageKey,
      }
    });
  } catch (error) {
    console.error(`Failed to initialize Supabase client (${storageKey}):`, error);
    return null;
  }
};

export const supabaseShop = createNamedClient(shopUrl, shopKey, 'sb-auth-token-shop') as SupabaseClient;
export const supabaseBeeYield = createNamedClient(beeyieldUrl, beeyieldKey, 'sb-auth-token-beeyield') as SupabaseClient;
export const supabaseCEBA = createNamedClient(cebaUrl, cebaKey, 'sb-auth-token-ceba') as SupabaseClient;

// Default export remains for backward compatibility
export const supabase = supabaseShop;
