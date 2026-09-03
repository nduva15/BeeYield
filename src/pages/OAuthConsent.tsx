import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type AuthDetails = {
  client?: { name?: string; redirect_uri?: string };
  scopes?: string[];
  redirect_url?: string;
  redirect_to?: string;
};

// Typed shim for the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthDetails | null; error: { message: string } | null }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const nextUrl = window.location.pathname + window.location.search;
        window.location.href = "/beeyield-login?next=" + encodeURIComponent(nextUrl);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!alive) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      alive = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md bg-card border border-destructive/40 rounded-2xl p-6">
          <h1 className="font-display text-lg font-bold text-destructive mb-2">Authorization error</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </main>
    );
  }

  const clientName = details.client?.name ?? "an external app";

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🐝</div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Connect {clientName} to BeeYield
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            This lets {clientName} use BeeYield's apiary tools as you while you are signed in.
          </p>
        </div>

        <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground space-y-1 mb-6">
          <div>Read-only access to bee species, diseases, florage, and knowledge base.</div>
          <div>Runs stocking-density and harvest calculations on your behalf.</div>
          <div>Does not bypass BeeYield permissions or backend policies.</div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => decide(false)} disabled={busy} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => decide(true)} disabled={busy} className="flex-1">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve"}
          </Button>
        </div>
      </div>
    </main>
  );
}
