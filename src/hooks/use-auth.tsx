import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  country: string | null;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signInDemoOwner: (email?: string, name?: string) => void;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  signInDemoOwner: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore local user if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("beeyield_local_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user && parsed?.profile) {
          setUser(parsed.user);
          setProfile(parsed.profile);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        setUser(s.user);
      } else {
        // If logged out from supabase, check if local user exists
        try {
          const stored = localStorage.getItem("beeyield_local_user");
          if (!stored) {
            setUser(null);
            setProfile(null);
          }
        } catch {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const loadProfile = async (uid: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id,email,full_name,phone,country")
        .eq("id", uid)
        .maybeSingle();
      if (data) {
        setProfile(data as Profile);
      }
    } catch (e) {
      console.warn("Failed to load profile from Supabase:", e);
    }
  };

  useEffect(() => {
    if (session?.user?.id) void loadProfile(session.user.id);
  }, [session?.user?.id]);

  const signInDemoOwner = (email = "timothy@beeyield.com", name = "Timothy (Owner)") => {
    const demoUser = {
      id: "usr_kibwezi_owner_01",
      email,
      user_metadata: {
        full_name: name,
        phone: "+254 700 000 000",
        country: "Kenya",
      },
      aud: "authenticated",
      role: "authenticated",
      created_at: new Date().toISOString(),
      app_metadata: { provider: "email" },
    } as unknown as User;

    const demoProfile: Profile = {
      id: "usr_kibwezi_owner_01",
      email,
      full_name: name,
      phone: "+254 700 000 000",
      country: "Kenya",
    };

    try {
      localStorage.setItem(
        "beeyield_local_user",
        JSON.stringify({ user: demoUser, profile: demoProfile })
      );
    } catch {}

    setUser(demoUser);
    setProfile(demoProfile);
  };

  const signOut = async () => {
    try {
      localStorage.removeItem("beeyield_local_user");
    } catch {}
    try {
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <Ctx.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signOut,
        refreshProfile: async () => {
          if (session?.user?.id) await loadProfile(session.user.id);
        },
        signInDemoOwner,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(Ctx);
}
