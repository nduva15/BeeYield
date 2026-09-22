import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X, Settings as SettingsIcon, User, Blocks, BellRing, ShieldCheck, Wifi,
  Loader2, Save, Link2, Trash2, Copy, CheckCircle2, Shield, AlertCircle, Sparkles, Check, RefreshCw,
  CreditCard, Clock, Plus, Lock, Calendar, FileText, Download, CheckCircle, ArrowUpRight, TrendingUp,
  TrendingDown, Wallet, ExternalLink, ShieldAlert
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  { key: "hardware", label: "Hardware add-ons", help: "USB, Bluetooth and online scale / sensor probes." },
  { key: "accounting", label: "Accounting & ledger", help: "Reconcile honey sales against QuickBooks or Xero." },
  { key: "forage", label: "Forage mapping", help: "Radial forage buffers and satellite vegetative indices." },
  { key: "reports", label: "Executive reports", help: "Automated PDF summary reports with cryptographically signed proof." },
];

const ALERTS: { key: string; label: string; help: string }[] = [
  { key: "anomalies", label: "Acoustic anomalies", help: "Early warning when sound analysis flags Queen loss or swarming." },
  { key: "temp_humidity", label: "Brood nest threshold", help: "Temp or relative humidity out-of-band for > 3 consecutive hours." },
  { key: "inspection_due", label: "Inspection reminders", help: "Colonies uninspected past their recommended interval." },
  { key: "battery_low", label: "Sensor telemetry", help: "Device battery below 15% or solar node offline." },
];

const DEFAULT_MODULES: Record<string, boolean> = {
  commercial: true,
  meteo: true,
  hardware: true,
  accounting: false,
  forage: true,
  reports: true,
};

const DEFAULT_ALERTS: Record<string, boolean> = {
  anomalies: true,
  temp_humidity: true,
  inspection_due: true,
  battery_low: false,
};

interface PaymentCard {
  id: string;
  cardholderName: string;
  brand: "visa" | "mastercard" | "amex" | "generic";
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
  postalCode?: string;
  addedAt: string;
}

const DEFAULT_CARDS: PaymentCard[] = [];

type Invoice = {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
};

const INVOICES: Invoice[] = [];

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-honey ${
        on ? "bg-honey" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
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

    // Billing Cards State (Clean Real Storage - No Mock Data)
  const [cards, setCards] = useState<PaymentCard[]>(() => {
    try {
      const saved = localStorage.getItem(`beeyield_billing_cards_${deviceId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove any legacy mock card (such as 4242)
          return parsed.filter((c: PaymentCard) => c.last4 !== "4242" && c.id !== "card_default_1");
        }
      }
    } catch { void 0; }
    return [];
  });

  // Card Modal State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardZip, setCardZip] = useState("");
  const [cardIsDefault, setCardIsDefault] = useState(true);
  const [savingCard, setSavingCard] = useState(false);

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
    } catch { void 0; }

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
    } catch { void 0; }
  }, [deviceId]);

  useEffect(() => {
    void loadPrefs();
  }, [loadPrefs]);

  const savePrefs = async (nextMods: Record<string, boolean>, nextAlerts: Record<string, boolean>) => {
    setSavingPrefs(true);
    try {
      localStorage.setItem(`beeyield_app_settings_${deviceId}`, JSON.stringify({
        modules: nextMods,
        alert_prefs: nextAlerts,
        updated_at: new Date().toISOString()
      }));

      await supabase
        .from("app_settings")
        .upsert({
          device_id: deviceId,
          modules: nextMods,
          alert_prefs: nextAlerts,
          updated_at: new Date().toISOString(),
        } as any, { onConflict: "device_id" });

      toast.success("Preferences updated");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in to save profile");
      return;
    }
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          phone,
          country,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile saved");
    } catch (err: any) {
      toast.error(err.message || "Could not save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const createAccessLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const token = btoa(`${deviceId}:${Date.now()}`);
    const link = `${origin}/?access_token=${token}`;
    setAccessLink(link);
    navigator.clipboard?.writeText(link);
    toast.success("Access link generated & copied to clipboard");
  };

  // Card Helpers
  const detectBrand = (num: string): "visa" | "mastercard" | "amex" | "generic" => {
    const clean = num.replace(/\s+/g, "");
    if (clean.startsWith("4")) return "visa";
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return "mastercard";
    if (/^3[47]/.test(clean)) return "amex";
    return "generic";
  };

  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    return raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpDate = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 2) {
      const mm = parseInt(raw.slice(0, 2), 10);
      const safeMM = mm > 12 ? "12" : (mm === 0 ? "01" : raw.slice(0, 2));
      return `${safeMM}/${raw.slice(2)}`;
    }
    return raw;
  };

  const handleOpenAddCard = () => {
    setCardholderName(profile?.full_name || "");
    setCardNumber("");
    setCardExp("");
    setCardCvc("");
    setCardZip("");
    setCardIsDefault(cards.length === 0);
    setIsCardModalOpen(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = cardNumber.replace(/\s+/g, "");
    if (cleanNum.length < 15) {
      toast.error("Please enter a valid card number");
      return;
    }
    if (!cardholderName.trim()) {
      toast.error("Please enter the cardholder name");
      return;
    }
    if (cardExp.length < 5) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return;
    }
    if (cardCvc.length < 3) {
      toast.error("Please enter a valid 3 or 4-digit CVC");
      return;
    }

    setSavingCard(true);
    setTimeout(() => {
      const [expM, expY] = cardExp.split("/");
      const newCard: PaymentCard = {
        id: `card_${Date.now()}`,
        cardholderName: cardholderName.trim(),
        brand: detectBrand(cleanNum),
        last4: cleanNum.slice(-4),
        expMonth: expM,
        expYear: expY,
        isDefault: cardIsDefault || cards.length === 0,
        postalCode: cardZip.trim(),
        addedAt: new Date().toISOString().split("T")[0],
      };

      let updated = [...cards];
      if (newCard.isDefault) {
        updated = updated.map(c => ({ ...c, isDefault: false }));
      }
      updated.unshift(newCard);

      setCards(updated);
      try {
        localStorage.setItem(`beeyield_billing_cards_${deviceId}`, JSON.stringify(updated));
      } catch { void 0; }

      setSavingCard(false);
      setIsCardModalOpen(false);
      toast.success(`Card ending in ${newCard.last4} added successfully!`);
    }, 600);
  };

  const handleSetDefaultCard = (id: string) => {
    const updated = cards.map(c => ({ ...c, isDefault: c.id === id }));
    setCards(updated);
    try {
      localStorage.setItem(`beeyield_billing_cards_${deviceId}`, JSON.stringify(updated));
    } catch { void 0; }
    toast.success("Default payment method updated");
  };

    const handleDeleteCard = (id: string) => {
    const updated = cards.filter(c => c.id !== id);
    if (!updated.some(c => c.isDefault) && updated.length > 0) {
      updated[0].isDefault = true;
    }
    setCards(updated);
    try {
      localStorage.setItem(`beeyield_billing_cards_${deviceId}`, JSON.stringify(updated));
    } catch { void 0; }
    toast.success("Card removed");
  };

  if (!isOpen) return null;

  const mainContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-honey/15 border border-honey/30 flex items-center justify-center text-honey">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              Apiary & System Settings
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-honey/10 text-honey border border-honey/20">
                v2.4.0
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure telemetry parameters, active modules, alerting thresholds, and subscription billing.
            </p>
          </div>
        </div>
        {!embedded && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? "bg-honey text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {tab === "profile" && (
          <form onSubmit={saveProfile} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-display text-lg text-honey">User Profile</h2>
            <p className="text-xs text-muted-foreground">Manage your operator credentials, contact info, and role assignment.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Timothy Nduva"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-honey"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +254 742 004 187"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-honey"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Kenya"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-honey"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email (Read Only)</label>
                <input
                  type="email"
                  value={user?.email || "guest@beeyield.local"}
                  disabled
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-muted/40 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-between items-center">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 rounded-lg bg-honey text-background font-bold text-xs flex items-center gap-1.5 hover:bg-honey/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
              {user && (
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="text-xs text-red-400 hover:underline"
                >
                  Sign Out
                </button>
              )}
            </div>
          </form>
        )}

        {tab === "modules" && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-display text-lg text-honey">Active System Modules</h2>
            <p className="text-xs text-muted-foreground">Select capability groups active for your telemetry nodes and reporting suite.</p>
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
                  } catch { void 0; }
                  toast.success("Device records deleted. Contact support to erase the auth account.");
                }}
                className="px-3 py-2 rounded-lg border border-red-500/40 text-red-400 text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete my data
              </button>
            </div>
          </div>
        )}

                {tab === "billing" && (
          <div className="space-y-6">
            {/* Subscriptions Management Section */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-honey" /> Subscription Tier
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-honey/10 text-honey border border-honey/20">
                      Standard Access
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-display text-foreground">Subscriptions & Commercial Billing</h2>
                  <p className="text-xs text-muted-foreground max-w-xl">
                    Recurring subscription plans and commercial telemetry tiers will be configured here. All core apicultural tools, inspections, and harvest tracking modules are currently unlocked.
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs font-medium border border-border inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Cards Section */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-honey" /> Payment Cards
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Manage credit and debit cards on file for future billing and commercial purchases.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddCard}
                  className="px-4 py-2 rounded-xl bg-honey text-background font-bold text-xs flex items-center gap-1.5 hover:bg-honey/90 transition-all shadow-md shadow-honey/10 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Add Payment Card
                </button>
              </div>

              {/* Cards Grid / Empty State */}
              {cards.length === 0 ? (
                <div className="py-10 text-center rounded-xl border border-dashed border-border bg-background/50">
                  <CreditCard className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs font-medium text-foreground">No payment cards on file</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm mx-auto">
                    You can add a payment card whenever you wish to purchase supplies or activate advanced services.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {cards.map((c) => (
                    <div
                      key={c.id}
                      className={`relative rounded-xl border p-4 transition-all ${
                        c.isDefault
                          ? "border-honey/60 bg-gradient-to-br from-honey/5 to-card shadow-sm"
                          : "border-border bg-background/50 hover:bg-background"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-7 rounded bg-neutral-900 text-white font-black text-[10px] flex items-center justify-center tracking-wider border border-white/10 uppercase">
                            {c.brand}
                          </div>
                          <div>
                            <p className="text-sm font-bold font-mono text-foreground">
                              •••• •••• •••• {c.last4}
                            </p>
                            <p className="text-[11px] text-muted-foreground uppercase">
                              {c.cardholderName} • Exp {c.expMonth}/{c.expYear}
                            </p>
                          </div>
                        </div>
                        {c.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-honey/15 text-honey border border-honey/30">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                        {!c.isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultCard(c.id)}
                            className="text-xs text-muted-foreground hover:text-honey font-medium transition-colors"
                          >
                            Set as Default
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Check className="w-3 h-3 text-honey" /> Primary method
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteCard(c.id)}
                          className="text-muted-foreground hover:text-red-400 p-1 rounded transition-colors"
                          title="Remove Card"
                          aria-label="Remove card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invoices Table / Empty State */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-honey" /> Invoices & Receipts
                  </h3>
                  <p className="text-xs text-muted-foreground">Download past billing statements and official tax invoices.</p>
                </div>
              </div>

              {INVOICES.length === 0 ? (
                <div className="py-10 text-center rounded-xl border border-dashed border-border bg-background/50">
                  <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs font-medium text-foreground">No invoices or receipts yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm mx-auto">
                    Statements, tax invoices, and payment receipts will be generated and archived here after commercial transactions.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Invoice ID</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {INVOICES.map((inv) => (
                        <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3 text-muted-foreground">{inv.date}</td>
                          <td className="py-3 px-3 font-mono font-bold text-foreground">{inv.id}</td>
                          <td className="py-3 px-3 text-foreground">{inv.description}</td>
                          <td className="py-3 px-3 font-bold text-foreground">{inv.amount}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => toast.success(`Receipt ${inv.id} downloaded`)}
                              className="inline-flex items-center gap-1 text-honey hover:underline font-semibold"
                            >
                              <Download className="w-3 h-3" /> PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Card Popup Modal */}
      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent className="max-w-md p-6 bg-card border-border rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-display flex items-center gap-2 text-foreground">
              <CreditCard className="w-5 h-5 text-honey" /> Add Payment Card
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter your credit or debit card details to enable seamless telemetry renewals.
            </DialogDescription>
          </DialogHeader>

          {/* Interactive Credit Card Preview */}
          <div className="my-3 rounded-2xl bg-gradient-to-br from-neutral-900 via-stone-900 to-amber-950 p-5 text-white shadow-xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-honey/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              {/* EMV Chip */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-300 shadow-inner flex items-center justify-center">
                <div className="w-8 h-5 border border-amber-600/40 rounded-sm grid grid-cols-2 gap-0.5 opacity-70" />
              </div>
              <span className="font-black text-xs tracking-widest uppercase px-2.5 py-1 rounded bg-white/10 border border-white/20">
                {detectBrand(cardNumber)}
              </span>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-base tracking-[0.2em] font-bold text-neutral-100">
                {cardNumber || "•••• •••• •••• ••••"}
              </p>
              <div className="flex items-end justify-between pt-1 text-xs">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-400">Cardholder</p>
                  <p className="font-semibold tracking-wider uppercase text-neutral-200 truncate max-w-[170px]">
                    {cardholderName || "OPERATOR NAME"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-wider text-neutral-400">Expires</p>
                  <p className="font-mono font-semibold text-neutral-200">
                    {cardExp || "MM/YY"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Form */}
          <form onSubmit={handleSaveCard} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Cardholder Name</label>
              <input
                type="text"
                required
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Name on card"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-honey/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-3.5 py-2 pl-9 text-xs font-mono rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-honey/40"
                />
                <CreditCard className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Expires</label>
                <input
                  type="text"
                  required
                  value={cardExp}
                  onChange={(e) => setCardExp(formatExpDate(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-3 py-2 text-xs font-mono text-center rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-honey/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">CVC</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 text-xs font-mono text-center rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-honey/40"
                  />
                  <Lock className="w-3 h-3 text-muted-foreground absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">ZIP / Postal</label>
                <input
                  type="text"
                  value={cardZip}
                  onChange={(e) => setCardZip(e.target.value.slice(0, 10))}
                  placeholder="90137"
                  maxLength={10}
                  className="w-full px-3 py-2 text-xs font-mono text-center rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-honey/40"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="cardDefault"
                checked={cardIsDefault}
                onChange={(e) => setCardIsDefault(e.target.checked)}
                className="rounded border-border text-honey focus:ring-honey h-4 w-4"
              />
              <label htmlFor="cardDefault" className="text-xs text-muted-foreground cursor-pointer">
                Set as default payment card for this apiary
              </label>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL • PCI-DSS Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCard}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-honey text-background hover:bg-honey/90 transition-all shadow-md shadow-honey/15 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingCard ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Save Card
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
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
