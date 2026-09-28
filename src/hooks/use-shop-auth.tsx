import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseShop, isDedicatedShopBackendConfigured } from "@/lib/supabase";
import { toast } from "sonner";

export interface ShopCustomerAddress {
  street: string;
  apartment?: string;
  city: string;
  county: string;
  postal_code?: string;
}

export interface ShopCustomerProfile {
  id: string;
  email: string | null;
  full_name: string;
  phone: string;
  role: "customer" | "wholesale" | "store_admin";
  avatar_url?: string | null;
  shipping_address?: ShopCustomerAddress;
  company_name?: string;
  total_orders_count?: number;
  created_at?: string;
}

interface ShopAuthContextType {
  shopUser: ShopCustomerProfile | null;
  shopSession: Session | null;
  loading: boolean;
  isShopAuthenticated: boolean;
  isDedicatedBackend: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    street?: string;
    city?: string;
    county?: string;
    role?: "customer" | "wholesale";
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInDemoCustomer: (type?: "retail" | "wholesale" | "manager") => void;
  updateProfile: (data: Partial<ShopCustomerProfile>) => Promise<boolean>;
  refreshShopUser: () => Promise<void>;
}

const STORAGE_KEY_SHOP_USER = "shop_local_user";
const STORAGE_KEY_SHOP_ACCOUNTS = "shop_registered_accounts";

const DEMO_ACCOUNTS: Record<string, ShopCustomerProfile> = {
  retail: {
    id: "shop_usr_grace_wanjiku_01",
    email: "grace.wanjiku@beeyield-shop.com",
    full_name: "Grace Wanjiku",
    phone: "+254 722 102 304",
    role: "customer",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    shipping_address: {
      street: "Ngong Road, Kilimani Heights Apt 4B",
      city: "Nairobi",
      county: "Nairobi",
      postal_code: "00100",
    },
    total_orders_count: 5,
    created_at: "2026-01-15T09:00:00Z",
  },
  wholesale: {
    id: "shop_usr_kenya_organics_02",
    email: "procurement@kenya-organics.co.ke",
    full_name: "Kenya Organics Co-operative",
    phone: "+254 711 445 566",
    role: "wholesale",
    company_name: "Kenya Organics Export Ltd",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    shipping_address: {
      street: "Mombasa Road Inland Depot Hub 12",
      city: "Athi River",
      county: "Machakos",
      postal_code: "00204",
    },
    total_orders_count: 14,
    created_at: "2025-11-20T14:30:00Z",
  },
  manager: {
    id: "shop_usr_timothy_store_03",
    email: "timothy.store@beeyield.com",
    full_name: "Timothy Nduva (Store Dispatcher)",
    phone: "+254 712 345 678",
    role: "store_admin",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    shipping_address: {
      street: "Kibwezi Apiary Road Stand #42",
      city: "Kibwezi",
      county: "Makueni",
      postal_code: "90137",
    },
    total_orders_count: 28,
    created_at: "2025-08-10T10:00:00Z",
  },
};

const ShopAuthContext = createContext<ShopAuthContextType | null>(null);

export function ShopAuthProvider({ children }: { children: ReactNode }) {
  const [shopSession, setShopSession] = useState<Session | null>(null);
  const [shopUser, setShopUser] = useState<ShopCustomerProfile | null>(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY_SHOP_USER);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to parse stored shop customer:", e);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const buildCustomerProfileFromUser = useCallback((user: User) => {
    const meta = user.user_metadata || {};
    const profile: ShopCustomerProfile = {
      id: user.id,
      email: user.email || null,
      full_name: meta.full_name || meta.name || user.email?.split("@")[0] || "Shop Customer",
      phone: meta.phone || "",
      role: meta.role || "customer",
      avatar_url: meta.avatar_url || null,
      shipping_address: meta.shipping_address || (meta.city ? {
        street: meta.street || "",
        apartment: meta.apartment || "",
        city: meta.city || "Nairobi",
        county: meta.county || "Nairobi",
        postal_code: meta.postal_code || "",
      } : undefined),
      company_name: meta.company_name,
      created_at: user.created_at,
    };

    setShopUser(profile);
    try {
      localStorage.setItem(STORAGE_KEY_SHOP_USER, JSON.stringify(profile));
    } catch {}
  }, []);

  // Sync Supabase Shop session on mount and auth changes
  useEffect(() => {
    if (!supabaseShop) {
      setLoading(false);
      return;
    }

    // 1. Get initial session from Supabase Shop client
    supabaseShop.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setShopSession(session);
          buildCustomerProfileFromUser(session.user);
        }
      })
      .catch((err) => {
        console.warn("Shop Supabase getSession error:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Listen to Shop Supabase auth state changes
    const { data: { subscription } } = supabaseShop.auth.onAuthStateChange(
      async (_event, session) => {
        setShopSession(session);
        if (session?.user) {
          buildCustomerProfileFromUser(session.user);
        } else {
          // Check if local shop user exists
          try {
            const stored = localStorage.getItem(STORAGE_KEY_SHOP_USER);
            if (!stored) {
              setShopUser(null);
            }
          } catch {
            setShopUser(null);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [buildCustomerProfileFromUser]);

  const signIn = async ({ email, password }: { email: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Check if matching any Demo accounts first
      for (const [key, demo] of Object.entries(DEMO_ACCOUNTS)) {
        if (demo.email?.toLowerCase() === cleanEmail) {
          signInDemoCustomer(key as "retail" | "wholesale" | "manager");
          setLoading(false);
          return { success: true };
        }
      }

      // 2. Try Supabase Shop Auth
      if (supabaseShop) {
        try {
          const { data, error } = await supabaseShop.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!error && data.user) {
            setShopSession(data.session);
            buildCustomerProfileFromUser(data.user);
            setLoading(false);
            return { success: true };
          }

          // If Supabase returned an invalid credentials error, check local registered store accounts
          if (error && error.message.toLowerCase().includes("invalid login credentials")) {
            const registeredStr = localStorage.getItem(STORAGE_KEY_SHOP_ACCOUNTS);
            if (registeredStr) {
              const accounts: Array<{ email: string; password: string; profile: ShopCustomerProfile }> = JSON.parse(registeredStr);
              const found = accounts.find(
                (a) => a.email.toLowerCase() === cleanEmail && a.password === password
              );
              if (found) {
                setShopUser(found.profile);
                localStorage.setItem(STORAGE_KEY_SHOP_USER, JSON.stringify(found.profile));
                setLoading(false);
                return { success: true };
              }
            }
          }

          if (error) {
            setLoading(false);
            return { success: false, error: error.message };
          }
        } catch (sbErr: any) {
          console.warn("Supabase Shop login error:", sbErr);
        }
      }

      // 3. Fallback: check locally registered accounts for dev/offline resilience
      const registeredStr = localStorage.getItem(STORAGE_KEY_SHOP_ACCOUNTS);
      if (registeredStr) {
        const accounts: Array<{ email: string; password: string; profile: ShopCustomerProfile }> = JSON.parse(registeredStr);
        const found = accounts.find(
          (a) => a.email.toLowerCase() === cleanEmail && a.password === password
        );
        if (found) {
          setShopUser(found.profile);
          localStorage.setItem(STORAGE_KEY_SHOP_USER, JSON.stringify(found.profile));
          setLoading(false);
          return { success: true };
        }
      }

      setLoading(false);
      return { success: false, error: "Invalid email or password for Shop account." };
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e?.message || "Failed to sign in to Shop." };
    }
  };

  const signUp = async (params: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    street?: string;
    city?: string;
    county?: string;
    role?: "customer" | "wholesale";
  }): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const cleanEmail = params.email.trim().toLowerCase();
      const newUserId = `shop_usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

      const shipping_address: ShopCustomerAddress = {
        street: params.street || "Main Street",
        city: params.city || "Nairobi",
        county: params.county || "Nairobi",
      };

      const newProfile: ShopCustomerProfile = {
        id: newUserId,
        email: cleanEmail,
        full_name: params.full_name.trim(),
        phone: params.phone.trim(),
        role: params.role || "customer",
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.full_name)}&backgroundColor=d97706,059669`,
        shipping_address,
        created_at: new Date().toISOString(),
      };

      // 1. Try Supabase Shop Auth Registration
      if (supabaseShop) {
        try {
          const { data, error } = await supabaseShop.auth.signUp({
            email: cleanEmail,
            password: params.password,
            options: {
              data: {
                full_name: newProfile.full_name,
                phone: newProfile.phone,
                role: newProfile.role,
                avatar_url: newProfile.avatar_url,
                shipping_address,
                street: params.street,
                city: params.city,
                county: params.county,
              },
            },
          });

          if (!error && data.user) {
            if (data.session) {
              setShopSession(data.session);
            }
            newProfile.id = data.user.id;
          }
        } catch (sbErr) {
          console.warn("Supabase Shop signUp error (continuing with local registration):", sbErr);
        }
      }

      // 2. Persist locally to registered accounts storage
      try {
        const registeredStr = localStorage.getItem(STORAGE_KEY_SHOP_ACCOUNTS);
        const accounts = registeredStr ? JSON.parse(registeredStr) : [];
        accounts.push({
          email: cleanEmail,
          password: params.password,
          profile: newProfile,
        });
        localStorage.setItem(STORAGE_KEY_SHOP_ACCOUNTS, JSON.stringify(accounts));
      } catch {}

      // 3. Set as active shop user
      setShopUser(newProfile);
      try {
        localStorage.setItem(STORAGE_KEY_SHOP_USER, JSON.stringify(newProfile));
      } catch {}

      setLoading(false);
      return { success: true };
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e?.message || "Failed to create shop account." };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem(STORAGE_KEY_SHOP_USER);
    } catch {}

    if (supabaseShop) {
      try {
        await supabaseShop.auth.signOut();
      } catch (err) {
        console.warn("Shop Supabase signOut error:", err);
      }
    }

    setShopSession(null);
    setShopUser(null);
    toast.success("Signed out of BeeYield Shop Dashboard account.");
  };

  const signInDemoCustomer = (type: "retail" | "wholesale" | "manager" = "retail") => {
    const demo = DEMO_ACCOUNTS[type] || DEMO_ACCOUNTS.retail;
    setShopUser(demo);
    try {
      localStorage.setItem(STORAGE_KEY_SHOP_USER, JSON.stringify(demo));
    } catch {}
    toast.success(`Logged in as Shop ${demo.role === "wholesale" ? "Wholesale Buyer" : "Customer"}: ${demo.full_name}`);
  };

  const updateProfile = async (data: Partial<ShopCustomerProfile>): Promise<boolean> => {
    if (!shopUser) return false;

    const updated: ShopCustomerProfile = {
      ...shopUser,
      ...data,
      shipping_address: {
        ...(shopUser.shipping_address || { street: "", city: "", county: "" }),
        ...(data.shipping_address || {}),
      },
    };

    setShopUser(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SHOP_USER, JSON.stringify(updated));
    } catch {}

    if (supabaseShop && shopSession?.user) {
      try {
        await supabaseShop.auth.updateUser({
          data: {
            full_name: updated.full_name,
            phone: updated.phone,
            avatar_url: updated.avatar_url,
            shipping_address: updated.shipping_address,
          },
        });
      } catch (err) {
        console.warn("Supabase Shop update profile error:", err);
      }
    }

    return true;
  };

  const refreshShopUser = useCallback(async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SHOP_USER);
      if (stored) {
        setShopUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  return (
    <ShopAuthContext.Provider
      value={{
        shopUser,
        shopSession,
        loading,
        isShopAuthenticated: Boolean(shopUser),
        isDedicatedBackend: isDedicatedShopBackendConfigured,
        signIn,
        signUp,
        signOut,
        signInDemoCustomer,
        updateProfile,
        refreshShopUser,
      }}
    >
      {children}
    </ShopAuthContext.Provider>
  );
}

export function useShopAuth() {
  const ctx = useContext(ShopAuthContext);
  if (!ctx) {
    throw new Error("useShopAuth must be used within a ShopAuthProvider");
  }
  return ctx;
}
