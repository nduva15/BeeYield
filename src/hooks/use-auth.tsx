import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { TIMOTHY_DEFAULT_AVATAR } from "@/lib/preset-avatars";
import { broadcastAvatarUpdate, subscribeToAvatarSync } from "@/services/avatarSyncService";

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

  // Synchronize avatar updates across laptop, phone, and tablet automatedly
  useEffect(() => {
    const uid = user?.id || profile?.id || "usr_kibwezi_owner_01";
    const unsubscribe = subscribeToAvatarSync(uid, (newUrl) => {
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
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id, profile?.id]);

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
        try {
          const stored = localStorage.getItem("beeyield_local_user");
          const parsed = stored ? JSON.parse(stored) : {};
          localStorage.setItem("beeyield_local_user", JSON.stringify({ ...parsed, profile: p }));
        } catch {}
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
        try {
          const rawName = s.user.user_metadata?.full_name || s.user.user_metadata?.name || (s.user.email ? s.user.email.split("@")[0] : null);
          const initialProfile: Profile = {
            id: s.user.id,
            email: s.user.email || null,
            full_name: rawName,
            phone: s.user.user_metadata?.phone || null,
            country: s.user.user_metadata?.country || null,
            avatar_url: cachedAvatar || null,
          };
          localStorage.setItem(
            "beeyield_local_user",
            JSON.stringify({ user: s.user, profile: initialProfile })
          );
        } catch {}
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
        try {
          const rawName = data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || (data.session.user.email ? data.session.user.email.split("@")[0] : null);
          const initialProfile: Profile = {
            id: data.session.user.id,
            email: data.session.user.email || null,
            full_name: rawName,
            phone: data.session.user.user_metadata?.phone || null,
            country: data.session.user.user_metadata?.country || null,
            avatar_url: cachedAvatar || null,
          };
          localStorage.setItem(
            "beeyield_local_user",
            JSON.stringify({ user: data.session.user, profile: initialProfile })
          );
        } catch {}
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

      // 2. Broadcast and persist across laptop, phone, and tablet automatedly
      await broadcastAvatarUpdate(uid, url);

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
