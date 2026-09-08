import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X, Settings as SettingsIcon, User, Blocks, BellRing, ShieldCheck, CreditCard,
  Loader2, Save, Link2, Trash2, Copy, Plus, TrendingUp, TrendingDown, Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type Tab = "profile" | "modules" | "alerting" | "security" | "billing";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "modules", label: "Modules", icon: Blocks },
  { id: "alerting", label: "Alerting", icon: BellRing },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const MODULES: { key: string; label: string; help: string }[] = [
  { key: "commercial", label: "Commercial apiaries", help: "Multi-site apiary management, batches and yield ledgers." },
  { key: "meteo", label: "Meteo & Bloom", help: "Weather feeds, bloom phenology and forecast snapshots." },
  { key: "hardware", label: "Hardware add-ons", help: "USB, Bluetooth and online scale / sensor pairing." },
  { key: "biolab", label: "Biometric Lab", help: "Acoustic audits, varroa simulation and disease diagnostics." },
  { key: "commerce", label: "Commerce & tax", help: "Shopify, QuickBooks and eTIMS integrations." },
];

const ALERTS: { key: string; label: string; help: string }[] = [
  { key: "unusual", label: "Unusual readings", help: "Temperature, humidity or weight outside your learned baseline." },
  { key: "swarm", label: "Swarm risk", help: "Queen piping, swarm cells or activity spikes." },
  { key: "device", label: "Device issues", help: "Sensors offline or reporting inconsistent data." },
  { key: "battery", label: "Low battery", help: "Any paired device below 20% charge." },
];

const DEFAULT_MODULES = { commercial: true, meteo: true, hardware: false, biolab: true, commerce: false };
const DEFAULT_ALERTS = { unusual: true, swarm: true, device: true, battery: false };

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-honey" : "bg-border"}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function SettingsPage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const deviceId = useDeviceId();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [modules, setModules] = useState<Record<string, boolean>>(DEFAULT_MODULES);
  const [alerts, setAlerts] = useState<Record<string, boolean>>(DEFAULT_ALERTS);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [accessLink, setAccessLink] = useState<string | null>(null);
  const [revenue, setRevenue] = useState<{ revenue: number; costs: number }>({ revenue: 0, costs: 0 });

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setCountry(profile?.country ?? "");
  }, [profile]);

  const loadPrefs = useCallback(async () => {
    const { data } = await supabase
      .from("app_settings").select("modules,alert_prefs").eq("device_id", deviceId).maybeSingle();
    if (data) {
      setModules({ ...DEFAULT_MODULES, ...((data.modules ?? {}) as Record<string, boolean>) });
      setAlerts({ ...DEFAULT_ALERTS, ...((data.alert_prefs ?? {}) as Record<string, boolean>) });
    }
  }, [deviceId]);

  const loadBilling = useCallback(async () => {
    const { data } = await supabase
      .from("yield_projections").select("outputs").eq("device_id", deviceId).limit(50);
    let revenueSum = 0;
    let costSum = 0;
    for (const row of (data ?? []) as { outputs: Record<string, unknown> }[]) {
      const o = row.outputs ?? {};
      const r = Number(o.revenue ?? o.gross_revenue ?? o.revenue_kes ?? 0);
      const c = Number(o.costs ?? o.total_costs ?? o.cost_kes ?? 0);
      if (Number.isFinite(r)) revenueSum += r;
      if (Number.isFinite(c)) costSum += c;
    }
    setRevenue({ revenue: Math.round(revenueSum), costs: Math.round(costSum) });
  }, [deviceId]);

  useEffect(() => {
    if (!isOpen) return;
    void loadPrefs();
    void loadBilling();
  }, [isOpen, loadPrefs, loadBilling]);

  const savePrefs = async (nextModules = modules, nextAlerts = alerts) => {
    setSavingPrefs(true);
    const { error } = await supabase.from("app_settings").upsert(
      { device_id: deviceId, modules: nextModules, alert_prefs: nextAlerts, updated_at: new Date().toISOString() },
      { onConflict: "device_id" },
    );
    setSavingPrefs(false);
    if (error) toast.error(error.message);
    else toast.success("Preferences saved");
  };

  const saveProfile = async () => {
    if (!user) { toast.error("Sign in to edit your profile"); return; }
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName || null, phone: phone || null, country: country || null })
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Profile updated");
  };

  const sendReset = async () => {
    if (!user?.email) { toast.error("No email on this account"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your email");
  };

  const createAccessLink = () => {
    const token = crypto.randomUUID();
    const url = `${window.location.origin}/?access=${token}`;
    setAccessLink(url);
    void navigator.clipboard?.writeText(url);
    toast.success("Access link created and copied");
  };

  const net = useMemo(() => revenue.revenue - revenue.costs, [revenue]);
  const fmt = (n: number) => `KES ${n.toLocaleString()}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Control Center</h1>
              <p className="text-xs text-muted-foreground">Profile, modules, alerting, security and billing</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg border border-border hover:bg-card">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 border transition-colors ${
                tab === t.id ? "border-honey bg-honey/10 text-honey" : "border-border text-muted-foreground hover:border-honey/40"
              }`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-display text-lg text-honey">Profile</h2>
            {!user ? (
              <p className="text-sm text-muted-foreground">Sign in to manage your profile details.</p>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-3">
                  <label className="text-xs space-y-1">
                    <span className="text-muted-foreground">Full name</span>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Nduva"
                      className="w-full bg-background border border-border rounded-lg px-2 py-2" />
                  </label>
                  <label className="text-xs space-y-1">
                    <span className="text-muted-foreground">Verified email</span>
                    <input value={user.email ?? ""} readOnly
                      className="w-full bg-background/60 border border-border rounded-lg px-2 py-2 text-muted-foreground" />
                  </label>
                  <label className="text-xs space-y-1">
                    <span className="text-muted-foreground">Phone number</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7xx xxx xxx"
                      className="w-full bg-background border border-border rounded-lg px-2 py-2" />
                  </label>
                  <label className="text-xs space-y-1">
                    <span className="text-muted-foreground">Physical sector / country</span>
                    <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Kenya — Kiambu"
                      className="w-full bg-background border border-border rounded-lg px-2 py-2" />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={saveProfile} disabled={savingProfile}
                    className="px-3 py-2 rounded-lg bg-honey text-background text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
                    {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save profile
                  </button>
                  <button onClick={sendReset} className="px-3 py-2 rounded-lg border border-border text-xs">
                    Send password reset
                  </button>
                  <button onClick={() => void signOut()} className="px-3 py-2 rounded-lg border border-border text-xs">
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "modules" && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="font-display text-lg text-honey">Modules</h2>
            <p className="text-xs text-muted-foreground">Enable only the capability groups this apiary needs.</p>
            {MODULES.map((m) => (
              <div key={m.key} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
                <div className="flex-1">
                  <p className="text-sm text-foreground">{m.label}</p>
                  <p className="text-[11px] text-muted-foreground">{m.help}</p>
                </div>
                <Toggle label={m.label} on={!!modules[m.key]}
                  onChange={(v) => { const next = { ...modules, [m.key]: v }; setModules(next); void savePrefs(next, alerts); }} />
              </div>
            ))}
            {savingPrefs && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</p>}
          </div>
        )}

        {tab === "alerting" && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="font-display text-lg text-honey">Alerting</h2>
            <p className="text-xs text-muted-foreground">Choose which colony events raise a notification.</p>
            {ALERTS.map((a) => (
              <div key={a.key} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
                <div className="flex-1">
                  <p className="text-sm text-foreground">{a.label}</p>
                  <p className="text-[11px] text-muted-foreground">{a.help}</p>
                </div>
                <Toggle label={a.label} on={!!alerts[a.key]}
                  onChange={(v) => { const next = { ...alerts, [a.key]: v }; setAlerts(next); void savePrefs(modules, next); }} />
              </div>
            ))}
            <button onClick={async () => {
              if (!("Notification" in window)) { toast.error("Notifications unsupported on this device"); return; }
              const p = await Notification.requestPermission();
              if (p === "granted") toast.success("Device notifications enabled");
              else toast.error("Permission denied");
            }} className="px-3 py-2 rounded-lg border border-honey/50 text-honey text-xs">
              Enable device notifications
            </button>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h2 className="font-display text-lg text-honey">Access</h2>
              <p className="text-xs text-muted-foreground">
                Share a read-only access link with a co-operative member or agronomist.
              </p>
              <button onClick={createAccessLink}
                className="px-3 py-2 rounded-lg bg-honey text-background text-xs font-semibold flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Create access link
              </button>
              {accessLink && (
                <div className="rounded-lg border border-border bg-background p-3 flex items-center gap-2">
                  <code className="text-[11px] text-muted-foreground break-all flex-1">{accessLink}</code>
                  <button onClick={() => { void navigator.clipboard?.writeText(accessLink); toast.success("Copied"); }}
                    aria-label="Copy link" className="text-honey"><Copy className="w-3.5 h-3.5" /></button>
                </div>
              )}
              <div className="text-[11px] text-muted-foreground space-y-1 pt-2 border-t border-border">
                <p>Session device ID: <code className="text-foreground">{deviceId}</code></p>
                <p>Signed in as: <code className="text-foreground">{user?.email ?? "guest device session"}</code></p>
              </div>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 space-y-3">
              <h2 className="font-display text-lg text-red-400">Delete account</h2>
              <p className="text-xs text-muted-foreground">
                Permanently remove your BeeYield profile and all device-scoped records on this device. This cannot be undone.
              </p>
              <button
                onClick={async () => {
                  if (!confirm("Delete all local apiary records for this device? This cannot be undone.")) return;
                  const tables = ["inspections", "sound_analyses", "app_settings", "integration_connections", "integration_sync_logs"] as const;
                  for (const t of tables) await supabase.from(t).delete().eq("device_id", deviceId);
                  toast.success("Device records deleted. Contact support to erase the auth account.");
                }}
                className="px-3 py-2 rounded-lg border border-red-500/40 text-red-400 text-xs flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Delete my data
              </button>
            </div>
          </div>
        )}

        {tab === "billing" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Revenue</span>
                <p className="mt-1 font-display text-2xl font-bold text-emerald-400">{fmt(revenue.revenue)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Costs</span>
                <p className="mt-1 font-display text-2xl font-bold text-orange-400">{fmt(revenue.costs)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Wallet className="w-3 h-3" /> Net</span>
                <p className={`mt-1 font-display text-2xl font-bold ${net >= 0 ? "text-honey" : "text-red-400"}`}>{fmt(net)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h2 className="font-display text-lg text-honey">Payment cards</h2>
              <p className="text-xs text-muted-foreground">
                No cards on file. BeeYield is free while in preview — card management activates once billing is enabled
                for your workspace.
              </p>
              <button onClick={() => toast.info("Billing is not enabled for this workspace yet")}
                className="px-3 py-2 rounded-lg border border-honey/50 text-honey text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add payment card
              </button>
              <div className="pt-3 border-t border-border">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">History</p>
                <p className="text-xs text-muted-foreground">
                  Revenue and cost totals above are derived from your saved honey yield projections. Connect QuickBooks
                  under Integrations to reconcile against your books.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
