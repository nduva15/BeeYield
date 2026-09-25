import { supabase } from "@/integrations/supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: "google" | "apple" | "microsoft" | "lovable",
      opts?: SignInOptions
    ) => {
      try {
        if (provider === "lovable") {
          return { error: new Error("Lovable cloud auth provider not configured") };
        }
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: provider as "google" | "apple",
          options: {
            redirectTo: opts?.redirect_uri,
            queryParams: opts?.extraParams,
          },
        });
        if (error) {
          return { error };
        }
        return { redirected: true, data };
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
    },
  },
};

export default lovable;
