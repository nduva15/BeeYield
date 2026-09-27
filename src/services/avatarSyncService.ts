import { supabase } from "@/integrations/supabase/client";

export interface AvatarSyncPayload {
  avatar_url: string;
  user_id: string;
  timestamp: number;
}

const BROADCAST_CHANNEL_NAME = "beeyield_avatar_sync";

export const getCachedAvatar = (userId?: string | null): string | null => {
  if (typeof window === "undefined") return null;
  const uid = userId || "usr_kibwezi_owner_01";
  return (
    localStorage.getItem(`beeyield_user_avatar_${uid}`) ||
    localStorage.getItem("beeyield_user_avatar") ||
    null
  );
};

/**
 * Broadcast an avatar update to all open tabs, windows, and cross-devices (laptop, phone, tablet)
 */
export const broadcastAvatarUpdate = async (userId: string, avatarUrl: string): Promise<void> => {
  const uid = userId || "usr_kibwezi_owner_01";
  const now = Date.now();
  const payload: AvatarSyncPayload = {
    avatar_url: avatarUrl,
    user_id: uid,
    timestamp: now,
  };

  // 1. LocalStorage persistence for instant local sync
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`beeyield_user_avatar_${uid}`, avatarUrl);
      localStorage.setItem("beeyield_user_avatar", avatarUrl);
      const stored = localStorage.getItem("beeyield_local_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user) {
          parsed.user.user_metadata = {
            ...(parsed.user.user_metadata || {}),
            avatar_url: avatarUrl,
          };
        }
        if (parsed.profile) {
          parsed.profile.avatar_url = avatarUrl;
        }
        localStorage.setItem("beeyield_local_user", JSON.stringify(parsed));
      }
    } catch {
      // Non-blocking
    }

    // 2. Dispatch local CustomEvent within the current window
    try {
      window.dispatchEvent(
        new CustomEvent("beeyield-avatar-updated", { detail: { avatar_url: avatarUrl } }),
      );
    } catch {
      // Non-blocking
    }

    // 3. Post to BroadcastChannel for other open tabs/windows on this device
    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage(payload);
        bc.close();
      }
    } catch {
      // Non-blocking
    }
  }

  // 4. Persist to Supabase Auth metadata
  if (supabase) {
    try {
      await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
    } catch {
      // Non-blocking
    }

    // 5. Persist to Supabase profiles table
    try {
      await (
        supabase.from("profiles") as unknown as {
          upsert: (values: Record<string, unknown>) => Promise<unknown>;
        }
      ).upsert({
        id: uid,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Non-blocking
    }

    // 6. Broadcast via Supabase Realtime channel to reach phones, tablets, and laptops
    try {
      const channel = supabase.channel(`realtime:avatar-sync-${uid}`);
      await channel.send({
        type: "broadcast",
        event: "avatar_updated",
        payload,
      });
      supabase.removeChannel(channel);
    } catch {
      // Non-blocking
    }
  }
};

/**
 * Subscribe to automated avatar synchronization across all devices (laptop, phone, tablet)
 */
export const subscribeToAvatarSync = (
  userId: string | undefined | null,
  onUpdate: (avatarUrl: string) => void,
): (() => void) => {
  const uid = userId || "usr_kibwezi_owner_01";
  let isSubscribed = true;

  // Handler for all events
  const handleUpdate = (newUrl: string) => {
    if (!isSubscribed) return;
    if (typeof newUrl === "string") {
      onUpdate(newUrl);
    }
  };

  // 1. Listen for local window CustomEvent
  const customEventHandler = (e: Event) => {
    const detail = (e as CustomEvent<{ avatar_url: string }>).detail;
    if (detail && typeof detail.avatar_url === "string") {
      handleUpdate(detail.avatar_url);
    }
  };

  // 2. Listen for storage events (cross-tab on same browser)
  const storageHandler = (e: StorageEvent) => {
    if (e.key === "beeyield_user_avatar" || e.key === `beeyield_user_avatar_${uid}`) {
      if (e.newValue !== null) {
        handleUpdate(e.newValue);
      }
    }
  };

  // 3. Listen on BroadcastChannel (instant zero-delay tab sync)
  let bc: BroadcastChannel | null = null;
  if (typeof window !== "undefined") {
    window.addEventListener("beeyield-avatar-updated", customEventHandler);
    window.addEventListener("storage", storageHandler);

    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.onmessage = (event: MessageEvent<AvatarSyncPayload>) => {
          if (event.data && typeof event.data.avatar_url === "string") {
            handleUpdate(event.data.avatar_url);
          }
        };
      }
    } catch {
      // Non-blocking
    }
  }

  // 4. Supabase Realtime subscription for cross-device sync (laptop <-> phone <-> tablet)
  let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
  if (supabase && uid) {
    try {
      realtimeChannel = supabase
        .channel(`realtime:avatar-sync-${uid}`)
        .on(
          "broadcast",
          { event: "avatar_updated" },
          (payload: { payload?: { avatar_url?: string } }) => {
            const newUrl = payload?.payload?.avatar_url;
            if (typeof newUrl === "string") {
              handleUpdate(newUrl);
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${uid}`,
          },
          (payload: { new?: { avatar_url?: string } }) => {
            const newUrl = payload?.new?.avatar_url;
            if (typeof newUrl === "string") {
              handleUpdate(newUrl);
            }
          },
        )
        .subscribe();
    } catch (e) {
      console.warn("Supabase Realtime avatar sync setup warning:", e);
    }
  }

  // 5. Visibility / focus check for phones and tablets resuming from sleep
  const checkRemoteAvatar = async () => {
    if (!supabase || !uid || !isSubscribed) return;
    try {
      const { data } = await (
        supabase.from("profiles") as unknown as {
          select: (cols: string) => {
            eq: (
              col: string,
              val: string,
            ) => {
              maybeSingle: () => Promise<{ data: { avatar_url?: string | null } | null }>;
            };
          };
        }
      )
        .select("avatar_url")
        .eq("id", uid)
        .maybeSingle();
      if (data && typeof data.avatar_url === "string") {
        const cached = getCachedAvatar(uid);
        if (data.avatar_url !== cached) {
          handleUpdate(data.avatar_url);
        }
      }
    } catch {
      // Non-blocking
    }
  };

  const visibilityHandler = () => {
    if (typeof document !== "undefined" && !document.hidden) {
      void checkRemoteAvatar();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("focus", checkRemoteAvatar);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", visibilityHandler);
    }
  }

  // Cleanup
  return () => {
    isSubscribed = false;
    if (typeof window !== "undefined") {
      window.removeEventListener("beeyield-avatar-updated", customEventHandler);
      window.removeEventListener("storage", storageHandler);
      window.removeEventListener("focus", checkRemoteAvatar);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", visibilityHandler);
      }
      if (bc) {
        bc.close();
      }
    }
    if (supabase && realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
  };
};
