import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { TIMOTHY_DEFAULT_AVATAR } from "@/lib/preset-avatars";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  avatar_url?: string | null;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  beeyieldUser: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signInDemoOwner: (email?: string, name?: string) => void;
  updateAvatar: (url: string) => Promise<boolean>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  beeyieldUser: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  signInDemoOwner: () => {},
  updateAvatar: async () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored =
        typeof window !== "undefined" ? localStorage.getItem("beeyield_local_user") : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user) {
          const cachedAvatar =
            localStorage.getItem(`beeyield_user_avatar_${parsed.user.id}`) ||
            localStorage.getItem("beeyield_user_avatar");
          if (cachedAvatar) {
            parsed.user.user_metadata = {
              ...(parsed.user.user_metadata || {}),
              avatar_url: cachedAvatar,
            };
          }
          return parsed.user;
        }
      }
    } catch {}
    return null;
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const stored =
        typeof window !== "undefined" ? localStorage.getItem("beeyield_local_user") : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.profile) {
          const cachedAvatar =
            localStorage.getItem(`beeyield_user_avatar_${parsed.profile.id}`) ||
            localStorage.getItem("beeyield_user_avatar");
          if (cachedAvatar) {
            parsed.profile.avatar_url = cachedAvatar;
          }
          return parsed.profile;
        }
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Synchronize avatar updates across components
  useEffect(() => {
    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatar_url: string }>;
      const newUrl = customEvent?.detail?.avatar_url;
      if (newUrl) {
        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            user_metadata: {
              ...(prev.user_metadata || {}),
              avatar_url: newUrl,
            },
          } as User;
        });
        setProfile((prev) => (prev ? { ...prev, avatar_url: newUrl } : prev));
      }
    };

    window.addEventListener("beeyield-avatar-updated", handleAvatarUpdate);
    return () => window.removeEventListener("beeyield-avatar-updated", handleAvatarUpdate);
  }, []);

  const loadProfile = useCallback(async (uid: string) => {
    try {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("id,email,full_name,phone,country,avatar_url")
        .eq("id", uid)
        .maybeSingle();

      const cachedAvatar =
        localStorage.getItem(`beeyield_user_avatar_${uid}`) ||
        localStorage.getItem("beeyield_user_avatar");

      if (data) {
        const p = data as Profile;
        if (!p.avatar_url && cachedAvatar) {
          p.avatar_url = cachedAvatar;
        }
        setProfile(p);
      } else if (cachedAvatar) {
        setProfile((prev) => (prev ? { ...prev, avatar_url: cachedAvatar } : prev));
      }
    } catch (e) {
      console.warn("Failed to load profile from Supabase:", e);
    }
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        const cachedAvatar =
          localStorage.getItem(`beeyield_user_avatar_${s.user.id}`) ||
          localStorage.getItem("beeyield_user_avatar");
        if (cachedAvatar && !s.user.user_metadata?.avatar_url) {
          s.user.user_metadata = { ...(s.user.user_metadata || {}), avatar_url: cachedAvatar };
        }
        setUser(s.user);
        void loadProfile(s.user.id);
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
        const cachedAvatar =
          localStorage.getItem(`beeyield_user_avatar_${data.session.user.id}`) ||
          localStorage.getItem("beeyield_user_avatar");
        if (cachedAvatar && !data.session.user.user_metadata?.avatar_url) {
          data.session.user.user_metadata = {
            ...(data.session.user.user_metadata || {}),
            avatar_url: cachedAvatar,
          };
        }
        setUser(data.session.user);
        void loadProfile(data.session.user.id);
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const updateAvatar = async (url: string): Promise<boolean> => {
    try {
      const uid = user?.id || profile?.id || "usr_kibwezi_owner_01";

      // 1. Update React state immediately
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          user_metadata: {
            ...(prev.user_metadata || {}),
            avatar_url: url,
          },
        } as User;
      });

      setProfile((prev) => (prev ? { ...prev, avatar_url: url } : prev));

      // 2. Persist in localStorage
      try {
        localStorage.setItem(`beeyield_user_avatar_${uid}`, url);
        localStorage.setItem("beeyield_user_avatar", url);

        const stored = localStorage.getItem("beeyield_local_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.user) {
            parsed.user.user_metadata = { ...(parsed.user.user_metadata || {}), avatar_url: url };
          }
          if (parsed.profile) {
            parsed.profile.avatar_url = url;
          }
          localStorage.setItem("beeyield_local_user", JSON.stringify(parsed));
        }
      } catch {}

      // 3. Persist to Supabase Auth metadata
      if (session?.user) {
        await supabase.auth.updateUser({ data: { avatar_url: url } }).catch(() => {});
      }

      // 4. Persist to Supabase profiles database table
      if (uid) {
        try {
          await (supabase as any).from("profiles").upsert({
            id: uid,
            avatar_url: url,
            updated_at: new Date().toISOString(),
          });
        } catch {}
      }

      // 5. Broadcast custom event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("beeyield-avatar-updated", { detail: { avatar_url: url } })
        );
      }

      return true;
    } catch (err) {
      console.error("updateAvatar error:", err);
      return false;
    }
  };

  const signInDemoOwner = (email = "timothy@beeyield.com", name = "Timothy (Owner)") => {
    const cachedAvatar =
      localStorage.getItem("beeyield_user_avatar_usr_kibwezi_owner_01") ||
      localStorage.getItem("beeyield_user_avatar") ||
      TIMOTHY_DEFAULT_AVATAR;

    const demoUser = {
      id: "usr_kibwezi_owner_01",
      email,
      user_metadata: {
        full_name: name,
        phone: "+254 700 000 000",
        country: "Kenya",
        avatar_url: cachedAvatar,
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
      avatar_url: cachedAvatar,
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
        beeyieldUser: user,
        profile,
        loading,
        signOut,
        refreshProfile: async () => {
          if (session?.user?.id) await loadProfile(session.user.id);
        },
        signInDemoOwner,
        updateAvatar,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
