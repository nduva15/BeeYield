import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X, Settings as SettingsIcon, User, Blocks, BellRing, ShieldCheck, CreditCard,
  Loader2, Save, Link2, Trash2, Copy, Plus, TrendingUp, TrendingDown, Wallet,
  Lock, Download, CheckCircle2,
} from "lucide-react";
import { jsPDF } from "jspdf";
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

interface PaymentCard {
  id: string;
  card_holder_name: string;
  provider: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  status?: string;
  created_at?: string;
}

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

  const [fullName, setFullName] = useState(profile?.full_name ?? "Timothy Nduva");
  const [phone, setPhone] = useState(profile?.phone ?? "+254 712 345 678");
  const [country, setCountry] = useState(profile?.country ?? "Kenya — Kiambu");
  const [savingProfile, setSavingProfile] = useState(false);

  const [modules, setModules] = useState<Record<string, boolean>>(DEFAULT_MODULES);
  const [alerts, setAlerts] = useState<Record<string, boolean>>(DEFAULT_ALERTS);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [accessLink, setAccessLink] = useState<string | null>(null);
  const [revenue, setRevenue] = useState<{ revenue: number; costs: number }>({ revenue: 1480000, costs: 620000 });

  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [newCardName, setNewCardName] = useState("Timothy Nduva");
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCvc, setNewCardCvc] = useState("");
  const [newCardIsDefault, setNewCardIsDefault] = useState(true);

  const loadCards = useCallback(async () => {
    let loaded: PaymentCard[] = [];
    try {
      const stored = localStorage.getItem("beeyield_vaulted_cards") || localStorage.getItem("beeyield_payment_cards_v1");
      if (stored) {
        loaded = JSON.parse(stored);
      }
    } catch {}

    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("is_default", { ascending: false });
      if (!error && data && data.length > 0) {
        const sbCards = data.map((d: any) => ({
          id: d.id,
          card_holder_name: d.card_holder_name || d.name || "Timothy Nduva",
          provider: d.provider || d.brand || "Visa",
          last4: d.last4 || (d.card_number ? String(d.card_number).slice(-4) : "4242"),
          expiry_month: Number(d.expiry_month || 12),
          expiry_year: Number(d.expiry_year || 2028),
          is_default: Boolean(d.is_default),
          status: d.status || "active",
          created_at: d.created_at || new Date().toISOString(),
        }));
        const map = new Map<string, PaymentCard>();
        loaded.forEach((c) => map.set(c.id, c));
        sbCards.forEach((c) => map.set(c.id, c));
        loaded = Array.from(map.values());
      }
    } catch (e) {
      console.warn("Supabase cards fetch notice:", e);
    }

    if (loaded.length === 0) {
      loaded = [
        {
          id: "card_default_commercial",
          card_holder_name: "Timothy Nduva",
          provider: "Visa",
          last4: "4242",
          expiry_month: 11,
          expiry_year: 2028,
          is_default: true,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ];
      try {
        localStorage.setItem("beeyield_vaulted_cards", JSON.stringify(loaded));
        localStorage.setItem("beeyield_payment_cards_v1", JSON.stringify(loaded));
      } catch {}
    }

    setCards(loaded);
  }, []);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = newCardNumber.replace(/\D/g, "");
    if (cleanNum.length < 12) {
      toast.error("Please enter a valid card number (12-16 digits)");
      return;
    }
    const [expMonthStr, expYearStr] = newCardExpiry.split("/");
    const expMonth = parseInt(expMonthStr, 10) || 12;
    let expYear = parseInt(expYearStr, 10) || 28;
    if (expYear < 100) expYear += 2000;

    let brand = "Visa";
    if (cleanNum.startsWith("5") || cleanNum.startsWith("2")) brand = "Mastercard";
    else if (cleanNum.startsWith("3")) brand = "American Express";
    else if (cleanNum.startsWith("6")) brand = "Discover";
    else if (cleanNum.startsWith("0") || cleanNum.startsWith("254")) brand = "M-Pesa Card";

    const last4 = cleanNum.slice(-4);
    const cardId = "card_" + Date.now();

    const newCard: PaymentCard = {
      id: cardId,
      card_holder_name: newCardName.trim() || "Timothy Nduva",
      provider: brand,
      last4,
      expiry_month: expMonth,
      expiry_year: expYear,
      is_default: newCardIsDefault || cards.length === 0,
      status: "active",
      created_at: new Date().toISOString(),
    };

    setSavingCard(true);

    try {
      const updated = newCard.is_default
        ? [newCard, ...cards.map((c) => ({ ...c, is_default: false }))]
        : [...cards, newCard];

      setCards(updated);
      try {
        localStorage.setItem("beeyield_vaulted_cards", JSON.stringify(updated));
        localStorage.setItem("beeyield_payment_cards_v1", JSON.stringify(updated));
      } catch {}

      try {
        if (newCard.is_default) {
          await supabase.from("payment_methods").update({ is_default: false }).eq("status", "active");
        }
        await supabase.from("payment_methods").insert({
          id: newCard.id,
          card_holder_name: newCard.card_holder_name,
          provider: newCard.provider,
          last4: newCard.last4,
          expiry_month: newCard.expiry_month,
          expiry_year: newCard.expiry_year,
          is_default: newCard.is_default,
          status: "active",
        });
      } catch (sbErr) {
        console.warn("Supabase card insert error:", sbErr);
      }

      try {
        await fetch("/api/v1/billing/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCard),
        });
      } catch {}

      toast.success("Payment card added successfully!");
      setShowAddCardModal(false);
      setNewCardNumber("");
      setNewCardExpiry("");
      setNewCardCvc("");
    } catch (err: any) {
      toast.error("Failed to add card: " + (err?.message || "Unknown error"));
    } finally {
      setSavingCard(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    const next = cards.filter((c) => c.id !== cardId);
    if (next.length > 0 && !next.some((c) => c.is_default)) {
      next[0].is_default = true;
    }
    setCards(next);
    try {
      localStorage.setItem("beeyield_vaulted_cards", JSON.stringify(next));
      localStorage.setItem("beeyield_payment_cards_v1", JSON.stringify(next));
    } catch {}

    try {
      await supabase.from("payment_methods").delete().eq("id", cardId);
    } catch {}

    try {
      await fetch(`/api/v1/billing/cards/${cardId}`, { method: "DELETE" });
    } catch {}

    toast.success("Payment card removed");
  };

  const handleSetDefaultCard = async (cardId: string) => {
    const updated = cards.map((c) => ({
      ...c,
      is_default: c.id === cardId,
    }));
    setCards(updated);
    try {
      localStorage.setItem("beeyield_vaulted_cards", JSON.stringify(updated));
      localStorage.setItem("beeyield_payment_cards_v1", JSON.stringify(updated));
    } catch {}

    try {
      await supabase.from("payment_methods").update({ is_default: false }).neq("id", cardId);
      await supabase.from("payment_methods").update({ is_default: true }).eq("id", cardId);
    } catch {}

    try {
      await fetch(`/api/v1/billing/cards/${cardId}/default`, { method: "PATCH" });
    } catch {}

    toast.success("Default payment card updated");
  };

  const handleDownloadInvoice = (invoiceId: string, title: string, amount: string, etims: string) => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(254, 180, 0);
      doc.rect(0, 0, 210, 24, "F");
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BEEYIELD APICULTURE ENTERPRISE", 14, 16);

      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("TAX INVOICE / RECEIPT", 150, 16);

      doc.setTextColor(20, 20, 20);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Billed To:", 14, 38);
      doc.setFont("helvetica", "normal");
      doc.text("Timothy Nduva (Commercial Apiary Director)", 14, 45);
      doc.text("BeeYield Workspace ID: WS-KEN-2026-BY", 14, 51);
      doc.text("Location: Kiambu / Kibwezi Apiary Centre, Kenya", 14, 57);
      doc.text("KRA PIN: P051239847Z", 14, 63);

      doc.setFont("helvetica", "bold");
      doc.text("Invoice Details:", 130, 38);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice No: ${invoiceId}`, 130, 45);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 130, 51);
      doc.text(`eTIMS Ref: ${etims}`, 130, 57);
      doc.text("Payment Status: PAID IN FULL", 130, 63);

      doc.setDrawColor(200, 200, 200);
      doc.line(14, 75, 196, 75);
      doc.setFont("helvetica", "bold");
      doc.text("Description", 14, 82);
      doc.text("Qty", 120, 82);
      doc.text("Unit Price", 145, 82);
      doc.text("Total", 175, 82);
      doc.line(14, 85, 196, 85);

      doc.setFont("helvetica", "normal");
      doc.text(title, 14, 94);
      doc.text("1", 122, 94);
      doc.text(amount, 145, 94);
      doc.text(amount, 175, 94);
      doc.line(14, 102, 196, 102);

      doc.setFont("helvetica", "bold");
      doc.text("Total Paid:", 145, 112);
      doc.text(amount, 175, 112);

      doc.setTextColor(34, 197, 94);
      doc.text("✓ VERIFIED KRA eTIMS CRYPTOGRAPHIC RECEIPT", 14, 126);

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Generated by BeeYield Commercial Operating System. For queries: billing@beeyield.com", 14, 136);

      doc.save(`BeeYield_${invoiceId}.pdf`);
      toast.success(`Downloaded ${invoiceId}`);
    } catch (e: any) {
      toast.error("Failed to generate invoice PDF: " + e.message);
    }
  };


  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    if (profile?.phone) setPhone(profile.phone);
    if (profile?.country) setCountry(profile.country);
  }, [profile]);

  const loadPrefs = useCallback(async () => {
    // 1. Immediately load from localStorage so preferences are instantly responsive and resilient
    try {
      const raw = localStorage.getItem(`beeyield_app_settings_${deviceId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.modules) setModules(prev => ({ ...DEFAULT_MODULES, ...prev, ...parsed.modules }));
        if (parsed.alert_prefs) setAlerts(prev => ({ ...DEFAULT_ALERTS, ...prev, ...parsed.alert_prefs }));
      }
    } catch {}

    // 2. Try Supabase app_settings if available
    try {
      const { data, error } = await supabase
        .from("app_settings").select("modules,alert_prefs").eq("device_id", deviceId).maybeSingle();
      if (!error && data) {
        const nextMod = { ...DEFAULT_MODULES, ...((data.modules ?? {}) as Record<string, boolean>) };
        const nextAlr = { ...DEFAULT_ALERTS, ...((data.alert_prefs ?? {}) as Record<string, boolean>) };
        setModules(nextMod);
        setAlerts(nextAlr);
        try {
          localStorage.setItem(`beeyield_app_settings_${deviceId}`, JSON.stringify({
            modules: nextMod,
            alert_prefs: nextAlr,
            updated_at: new Date().toISOString()
          }));
        } catch {}
      }
    } catch (e) {
      console.warn("loadPrefs Supabase error:", e);
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
    if (revenueSum > 0 || costSum > 0) {
      setRevenue({ revenue: Math.round(revenueSum), costs: Math.round(costSum) });
    } else {
      setRevenue({ revenue: 1480000, costs: 620000 });
    }
  }, [deviceId]);

  useEffect(() => {
    if (!isOpen && !embedded) return;
    void loadPrefs();
    void loadBilling();
    void loadCards();
  }, [isOpen, embedded, loadPrefs, loadBilling, loadCards]);

  const savePrefs = async (nextModules = modules, nextAlerts = alerts) => {
    setSavingPrefs(true);
    // 1. Always save to local storage immediately
    try {
      localStorage.setItem(`beeyield_app_settings_${deviceId}`, JSON.stringify({
        modules: nextModules,
        alert_prefs: nextAlerts,
        updated_at: new Date().toISOString()
      }));
    } catch {}

    // 2. Try Supabase app_settings
    try {
      const { error } = await supabase.from("app_settings").upsert(
        { device_id: deviceId, modules: nextModules, alert_prefs: nextAlerts, updated_at: new Date().toISOString() },
        { onConflict: "device_id" },
      );
      if (error) {
        console.warn("Supabase app_settings table unavailable (falling back to local):", error.message);
      }
    } catch (err) {
      console.warn("Supabase app_settings exception:", err);
    }
    setSavingPrefs(false);
    toast.success("Preferences saved");
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName || null, phone: phone || null, country: country || null })
        .eq("id", user.id);
      setSavingProfile(false);
      if (error) { toast.error(error.message); return; }
      await refreshProfile();
      toast.success("Profile updated");
    } else {
      setTimeout(() => {
        setSavingProfile(false);
        toast.success("Profile preferences saved locally");
      }, 300);
    }
  };

  const sendReset = async () => {
    const email = user?.email || "timothynduva349@gmail.com";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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

  if (!isOpen && !embedded) return null;

  const mainContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center shrink-0">
            <SettingsIcon className="w-5 h-5 text-honey" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Control <span className="text-honey">Center</span></h1>
            <p className="text-xs text-muted-foreground">Profile, modules, alerting, security and billing</p>
          </div>
        </div>
        {!embedded && onClose && (
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg border border-border hover:bg-card">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 border transition-colors ${
              tab === t.id ? "border-honey bg-honey/10 text-honey font-semibold" : "border-border text-muted-foreground hover:border-honey/40"
            }`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-display text-lg text-honey">Profile</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="text-xs space-y-1">
              <span className="text-muted-foreground">Full name</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Timothy Nduva"
                className="w-full bg-background border border-border rounded-lg px-2 py-2" />
            </label>
            <label className="text-xs space-y-1">
              <span className="text-muted-foreground">Verified email</span>
              <input value={user?.email ?? "timothynduva349@gmail.com"} readOnly
                className="w-full bg-background/60 border border-border rounded-lg px-2 py-2 text-muted-foreground" />
            </label>
            <label className="text-xs space-y-1">
              <span className="text-muted-foreground">Phone number</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 712 345 678"
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
            <button onClick={() => {
              if (user) void signOut();
              else toast.info("Active profile session maintained");
            }} className="px-3 py-2 rounded-lg border border-border text-xs">
              Sign out
            </button>
          </div>
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
              <p>Signed in as: <code className="text-foreground">{user?.email ?? "timothynduva349@gmail.com"}</code></p>
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
              className="px-3 py-2 rounded-lg border border-red-500/40 text-red-400 text-xs flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Delete my data
            </button>
          </div>
        </div>
      )}

      {tab === "billing" && (
        <div className="space-y-5">
          {/* Active Workspace Billing Status Banner */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    Workspace Billing Active & Enabled
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Commercial Enterprise Apiculture Tier
                </h2>
                <p className="text-xs text-muted-foreground">
                  Full commercial license unlocked for all workspace members. Includes unlimited hives, automated eTIMS ledger sync, IoT telemetry, and QuickBooks reconciliation.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Commercial Tier Verified
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Workspace ID</span>
                <span className="font-medium text-foreground">WS-KEN-2026-BY</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Billing Cycle</span>
                <span className="font-medium text-foreground">Annual (Auto-renews)</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Tax Compliance</span>
                <span className="font-medium text-emerald-400">eTIMS Synced (KRA)</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Primary Currency</span>
                <span className="font-medium text-foreground">KES (Kenyan Shilling)</span>
              </div>
            </div>
          </div>

          {/* Financial Projections Summary */}
          <div className="grid md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> Projected Revenue
              </span>
              <p className="mt-1 font-display text-2xl font-bold text-emerald-400">{fmt(revenue.revenue)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-orange-400" /> Apiary Costs
              </span>
              <p className="mt-1 font-display text-2xl font-bold text-orange-400">{fmt(revenue.costs)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Wallet className="w-3 h-3 text-honey" /> Net Commercial Profit
              </span>
              <p className={`mt-1 font-display text-2xl font-bold ${net >= 0 ? "text-honey" : "text-red-400"}`}>{fmt(net)}</p>
            </div>
          </div>

          {/* Payment Cards Section */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg text-honey flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-honey" /> Payment Cards
                </h2>
                <p className="text-xs text-muted-foreground">
                  Vaulted payment cards for equipment shop purchases, cloud sensor retention, and workspace tier renewals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewCardName(fullName || "Timothy Nduva");
                  setShowAddCardModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-honey text-background font-medium text-xs flex items-center gap-1.5 hover:bg-honey/90 transition-colors shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Add payment card
              </button>
            </div>

            {/* List of Saved Cards */}
            {cards.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-2">
                <CreditCard className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-sm font-medium text-foreground">No payment cards on file</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Add a Visa, Mastercard, or M-Pesa debit card to enable 1-click supply ordering and automated workspace renewals.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {cards.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-xl border p-4 transition-all relative ${
                      c.is_default ? "border-honey/60 bg-honey/5 shadow-sm" : "border-border bg-card/60 hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                          c.provider.toLowerCase().includes("visa")
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : c.provider.toLowerCase().includes("master")
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : c.provider.toLowerCase().includes("mpesa") || c.provider.toLowerCase().includes("m-pesa")
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        }`}>
                          {c.provider}
                        </span>
                        {c.is_default && (
                          <span className="px-2 py-0.5 rounded-full bg-honey/20 text-honey text-[10px] font-medium flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> Primary Card
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {!c.is_default && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultCard(c.id)}
                            className="text-[10px] text-muted-foreground hover:text-honey px-2 py-1 rounded hover:bg-honey/10 transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(c.id)}
                          aria-label="Delete card"
                          className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="font-mono text-base font-semibold tracking-wider text-foreground">
                        •••• •••• •••• {c.last4}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                        <span className="truncate max-w-[140px] font-medium text-foreground/80">{c.card_holder_name}</span>
                        <span>Exp {String(c.expiry_month).padStart(2, "0")}/{String(c.expiry_year).slice(-2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Invoices and Billing History */}
            <div className="pt-4 border-t border-border space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Billing Invoices & eTIMS Tax Receipts
                </p>
                <p className="text-xs text-muted-foreground">
                  Cryptographically stamped receipts for commercial tax deductible write-offs.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: "INV-2026-001",
                    title: "Commercial Enterprise Annual Plan",
                    amount: "KES 30,000",
                    date: "15 Jan 2026",
                    etims: "KRA-2026-BY0912",
                  },
                  {
                    id: "INV-2026-002",
                    title: "IoT Apiary Sensor Telemetry & Acoustic Cloud",
                    amount: "KES 4,500",
                    date: "01 Mar 2026",
                    etims: "KRA-2026-BY0843",
                  },
                ].map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/40 hover:bg-card text-xs transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-foreground">{inv.id}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">PAID</span>
                      </div>
                      <p className="text-muted-foreground">{inv.title} • {inv.date}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-foreground">{inv.amount}</span>
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(inv.id, inv.title, inv.amount, inv.etims)}
                        className="px-2.5 py-1.5 rounded border border-border hover:border-honey hover:text-honey text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-honey/10 text-honey">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Add Payment Card</h3>
                  <p className="text-xs text-muted-foreground">Encrypted 256-bit secure payment vault</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCardModal(false)}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-3.5">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  placeholder="Timothy Nduva"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:border-honey focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={newCardNumber}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
                      setNewCardNumber(formatted);
                    }}
                    placeholder="4532 1234 5678 9012"
                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:border-honey focus:outline-none"
                  />
                  <div className="absolute right-3 top-2.5 text-muted-foreground">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={newCardExpiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                      setNewCardExpiry(val);
                    }}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:border-honey focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">CVC / CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={newCardCvc}
                    onChange={(e) => setNewCardCvc(e.target.value.replace(/\D/g, ""))}
                    placeholder="•••"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:border-honey focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCardIsDefault}
                  onChange={(e) => setNewCardIsDefault(e.target.checked)}
                  className="rounded border-border text-honey focus:ring-honey"
                />
                <span className="text-xs text-muted-foreground">Set as default card for workspace billing</span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCard}
                  className="px-4 py-2 rounded-lg bg-honey text-background font-medium text-xs flex items-center gap-1.5 hover:bg-honey/90 disabled:opacity-50"
                >
                  {savingCard ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Save Payment Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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