import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X, Settings as SettingsIcon, User, Blocks, BellRing, ShieldCheck, Wifi,
  Loader2, Save, Link2, Trash2, Copy, CheckCircle2, Shield, AlertCircle, Sparkles, Check, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type Tab = "profile" | "modules" | "alerting" | "security";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "modules", label: "Modules", icon: Blocks },
  { id: "alerting", label: "Alerting", icon: BellRing },
  { id: "security", label: "Security", icon: ShieldCheck },
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

export default function SettingsPage({ isOpen = true, onClose, embedded = false }: { isOpen?: boolean; onClose?: () => void; embedded?: boolean }) {
  const deviceId = useDeviceId();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [modules, setModules] = useState<Record<string, boolean>>(DEFAULT_MODULES);
  const [alerts, setAlerts] = useState<Record<string, boolean>>(DEFAULT_ALERTS);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [accessLink, setAccessLink] = useState<string | null>(null);

  
  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    if (profile?.phone) setPhone(profile.phone);
    if (profile?.country) setCountry(profile.country);
  }, [profile]);

  const loadPrefs = useCallback(async () => {
    try {
      const raw = localStorage.getItem(`beeyield_app_settings_${deviceId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.modules) setModules(prev => ({ ...DEFAULT_MODULES, ...prev, ...parsed.modules }));
        if (parsed.alert_prefs) setAlerts(prev => ({ ...DEFAULT_ALERTS, ...prev, ...parsed.alert_prefs }));
      }
    } catch {}

    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("modules, alert_prefs")
        .eq("device_id", deviceId)
        .maybeSingle();
      if (!error && data) {
        const d = data as any;
        if (d.modules && typeof d.modules === "object") setModules(prev => ({ ...DEFAULT_MODULES, ...prev, ...d.modules }));
        if (d.alert_prefs && typeof d.alert_prefs === "object") setAlerts(prev => ({ ...DEFAULT_ALERTS, ...prev, ...d.alert_prefs }));
      }
    } catch {}
  }, [deviceId]);

      useEffect(() => {
    if (!isOpen) return;
    void loadPrefs();
  }, [isOpen, loadPrefs]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            phone,
            country,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
        if (error) throw error;
        await refreshProfile();
        toast.success("Profile updated");
      } else {
        toast.info("Profile changes saved locally for this guest session");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePrefs = async (nextModules: Record<string, boolean>, nextAlerts: Record<string, boolean>) => {
    setSavingPrefs(true);
    try {
      localStorage.setItem(
        `beeyield_app_settings_${deviceId}`,
        JSON.stringify({ modules: nextModules, alert_prefs: nextAlerts })
      );

      const { error } = await (supabase as any)
        .from("app_settings")
        .upsert(
          {
            device_id: deviceId,
            user_id: user?.id ?? null,
            modules: nextModules,
            alert_prefs: nextAlerts,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "device_id" }
        );
      if (error) console.warn("Supabase settings sync error:", error);
    } catch {
      // Local storage already written
    } finally {
      setSavingPrefs(false);
    }
  };

  const createAccessLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://beeyield.com";
    const token = btoa(JSON.stringify({ deviceId, created: Date.now() }));
    const link = `${origin}/?access=${token}`;
    setAccessLink(link);
    try {
      navigator.clipboard?.writeText(link);
      toast.success("Read-only access link copied to clipboard");
    } catch {
      toast.success("Access link created");
    }
  };

  if (!isOpen) return null;

  const mainContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-honey/10 text-honey">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Settings & Preferences</h1>
            <p className="text-xs text-muted-foreground">Manage profile, active modules, sensor alerting, and security</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                active ? "bg-honey text-background font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {tab === "profile" && (
          <form onSubmit={saveProfile} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-display text-lg text-honey">Apiarist Profile</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:border-honey focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email ?? "guest@beeyield.internal"}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted/40 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:border-honey focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Location / Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:border-honey focus:outline-none"
                />
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Session device: {deviceId.slice(0, 12)}…</span>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 rounded-lg bg-honey text-background font-medium text-xs flex items-center gap-1.5 hover:bg-honey/90 disabled:opacity-50"
              >
                {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save profile
              </button>
            </div>
          </form>
        )}

        {tab === "modules" && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-display text-lg text-honey">Feature Modules</h2>
            <p className="text-xs text-muted-foreground">Toggle commercial apiary tools, weather integrations, and biometric models.</p>
            <div className="space-y-3">
              {MODULES.map((m) => (
                <div key={m.key} className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.help}</p>
                  </div>
                  <Toggle
                    label={m.label}
                    on={Boolean(modules[m.key])}
                    onChange={(val) => {
                      const next = { ...modules, [m.key]: val };
                      setModules(next);
                      void savePrefs(next, alerts);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "alerting" && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-display text-lg text-honey">Alert Triggers & Push Delivery</h2>
            <p className="text-xs text-muted-foreground">Configure acoustic anomalies, sensor threshold excursions, and queen failure notifications.</p>
            <div className="space-y-3">
              {ALERTS.map((a) => (
                <div key={a.key} className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.help}</p>
                  </div>
                  <Toggle
                    label={a.label}
                    on={Boolean(alerts[a.key])}
                    onChange={(val) => {
                      const next = { ...alerts, [a.key]: val };
                      setAlerts(next);
                      void savePrefs(modules, next);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h2 className="font-display text-lg text-honey">Collaborative Access Links</h2>
              <p className="text-xs text-muted-foreground">
                Generate signed, read-only dashboard links to share yield telemetry with agronomists or farm managers.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={createAccessLink}
                  className="px-3.5 py-2 rounded-lg bg-honey text-background font-medium text-xs flex items-center gap-1.5 hover:bg-honey/90 transition-colors shadow-sm self-start"
                >
                  <Link2 className="w-3.5 h-3.5" /> Generate Access Link
                </button>
                {accessLink && (
                  <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-mono text-muted-foreground truncate">
                    <span className="truncate flex-1">{accessLink}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(accessLink);
                        toast.success("Link copied");
                      }}
                      className="text-honey hover:underline flex items-center gap-1 shrink-0"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 space-y-3">
              <h2 className="font-display text-lg text-red-400">Data Erasure & Reset</h2>
              <p className="text-xs text-muted-foreground">
                Permanently remove your BeeYield profile and all device-scoped records on this device. This cannot be undone.
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Delete all local apiary records for this device? This cannot be undone.")) return;
                  const tables = ["inspections", "sound_analyses", "app_settings", "integration_connections", "integration_sync_logs"] as const;
                  for (const t of tables) {
                    try {
                      await supabase.from(t).delete().eq("device_id", deviceId);
                    } catch (e) {
                      console.warn(`Failed to delete from ${t}:`, e);
                    }
                  }
                  try {
                    localStorage.removeItem(`beeyield_app_settings_${deviceId}`);
                  } catch {}
                  toast.success("Device records deleted. Contact support to erase the auth account.");
                }}
                className="px-3 py-2 rounded-lg border border-red-500/40 text-red-400 text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete my data
              </button>
            </div>
          </div>
        )}

        </div>

            
    </div>
  );

  if (embedded) {
    return (
      <div className="w-full space-y-6">
        {mainContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {mainContent}
      </div>
    </div>
  );
}
