import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X, Plug, ShoppingBag, Receipt, Calculator, Loader2, RefreshCw, Save,
  CheckCircle2, AlertCircle, Unplug, ExternalLink, KeyRound, ListChecks, ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/use-device-id";
import {
  saveIntegration, testIntegration, syncIntegration, disconnectIntegration,
  type Check,
} from "@/lib/integrations.functions";
import SyncTimeline from "@/components/SyncTimeline";
import { toast } from "sonner";

type Provider = "shopify" | "quickbooks" | "etims";

type Connection = {
  provider: string;
  status: string;
  config: Record<string, string>;
  last_error: string | null;
  last_sync_at: string | null;
  sync_enabled: boolean;
};

type SyncLog = {
  id: string;
  provider: string;
  event: string;
  status: string;
  detail: string | null;
  created_at: string;
};

type Field = { key: string; label: string; placeholder: string; secret?: boolean; help?: string; type?: string };

const PROVIDERS: {
  id: Provider;
  name: string;
  tagline: string;
  icon: typeof ShoppingBag;
  docs: string;
  configFields: Field[];
  secretFields: Field[];
  steps: string[];
  capabilities: string[];
  required: string[];
}[] = [
  {
    id: "shopify",
    name: "Shopify",
    tagline: "Sell honey, wax and nucs — sync catalogue, orders and stock",
    icon: ShoppingBag,
    docs: "https://shopify.dev/docs/api/admin-rest",
    configFields: [
      { key: "storeUrl", label: "Shopify store URL", placeholder: "your-apiary.myshopify.com" },
      { key: "apiVersion", label: "Admin API version", placeholder: "2024-10" },
      { key: "locationName", label: "Default inventory location", placeholder: "Kiambu warehouse" },
      { key: "serviceOrderPrice", label: "Service order value (per synced record)", placeholder: "0.00",
        help: "Every inspection or acoustic audit is written to Shopify as an order line at this price." },
      { key: "orderEmail", label: "Order contact email (optional)", placeholder: "apiary@yourfarm.co.ke" },
    ],
    secretFields: [
      { key: "accessToken", label: "Admin API access token", placeholder: "shpat_••••••••", secret: true,
        help: "Custom app token from Settings → Apps and sales channels → Develop apps." },
      { key: "apiSecret", label: "API secret key (optional)", placeholder: "shpss_••••••••", secret: true },
    ],
    steps: [
      "In Shopify admin open Settings → Apps and sales channels → Develop apps.",
      "Create an app named “BeeYield” and configure Admin API scopes: read_products, write_products, read_orders, read_inventory, write_inventory, read_locations.",
      "Install the app and copy the Admin API access token (shown once).",
      "Paste your store domain and the token here, then run Test connection.",
    ],
    capabilities: ["Product & variant counts", "Order volume", "Inventory locations", "Sync activity log"],
    required: ["storeUrl", "accessToken"],
  },
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    tagline: "Push apiary revenue and costs into your books",
    icon: Calculator,
    docs: "https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/account",
    configFields: [
      { key: "realmId", label: "Realm / Company ID", placeholder: "4620816365000000000" },
      { key: "environment", label: "Environment (production | sandbox)", placeholder: "production" },
      { key: "incomeAccount", label: "Honey sales income account", placeholder: "Honey Sales" },
      { key: "expenseAccount", label: "Apiary expense account", placeholder: "Hive Supplies" },
      { key: "accountName", label: "Sync account name (chart of accounts)", placeholder: "BeeYield Hive Operations",
        help: "Created automatically if missing; every synced record stamps this account and files a note against it." },
      { key: "accountType", label: "Account type", placeholder: "Expense" },
    ],
    secretFields: [
      { key: "accessToken", label: "OAuth 2.0 access token", placeholder: "eyJ••••••••", secret: true,
        help: "Generated in the Intuit developer playground or your OAuth flow." },
      { key: "refreshToken", label: "Refresh token", placeholder: "AB11••••••••", secret: true },
      { key: "clientId", label: "Client ID", placeholder: "ABxx••••", secret: true },
      { key: "clientSecret", label: "Client secret", placeholder: "••••••••", secret: true },
    ],
    steps: [
      "Create an app at developer.intuit.com and add the Accounting scope (com.intuit.quickbooks.accounting).",
      "Run the OAuth 2.0 playground against your company to obtain the access + refresh tokens and Realm ID.",
      "Paste the Realm ID, environment and tokens here, then Test connection.",
      "Map the income and expense accounts that BeeYield should post to.",
    ],
    capabilities: ["Company info check", "Chart of accounts count", "Item & invoice totals", "Account mapping"],
    required: ["realmId", "accessToken"],
  },
  {
    id: "etims",
    name: "KRA eTIMS",
    tagline: "Kenyan tax compliance — device init, code lists and invoicing",
    icon: Receipt,
    docs: "https://www.kra.go.ke/business/etims",
    configFields: [
      { key: "tin", label: "KRA PIN (TIN)", placeholder: "P051234567X" },
      { key: "branchId", label: "Branch ID (bhfId)", placeholder: "00" },
      { key: "baseUrl", label: "eTIMS API base URL", placeholder: "https://etims.kra.go.ke/etims-api" },
      { key: "lastRequestDate", label: "Last request date (yyyyMMddHHmmss)", placeholder: "20240101000000" },
    ],
    secretFields: [
      { key: "deviceSerial", label: "Device serial number (dvcSrlNo)", placeholder: "BEEYIELD001", secret: true,
        help: "The serial you registered on the eTIMS taxpayer portal." },
      { key: "communicationKey", label: "Communication key (cmcKey)", placeholder: "••••••••", secret: true },
    ],
    steps: [
      "Sign in to the eTIMS taxpayer portal and register an OSCU/VSCU device for your apiary business.",
      "Note the device serial number and branch ID issued for the registration.",
      "Paste your KRA PIN, branch ID and device serial here, then Test connection — BeeYield calls selectInitOsdcInfo.",
      "Once initialised, pull code lists so sales invoices carry the right tax and classification codes.",
    ],
    capabilities: ["Device initialisation", "Code & classification lists", "Tax-ready sales invoicing", "Audit trail"],
    required: ["tin", "deviceSerial"],
  },
];

function statusPill(status: string) {
  if (status === "connected") return { label: "Connected", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", Icon: CheckCircle2 };
  if (status === "error") return { label: "Error", cls: "text-red-400 border-red-500/30 bg-red-500/10", Icon: AlertCircle };
  if (status === "configured") return { label: "Configured", cls: "text-honey border-honey/30 bg-honey/10", Icon: KeyRound };
  return { label: "Not connected", cls: "text-muted-foreground border-border", Icon: Unplug };
}

export default function IntegrationsPage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const deviceId = useDeviceId();
  const [active, setActive] = useState<Provider>("shopify");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"" | "save" | "test" | "sync" | "disconnect">("");
  const [summary, setSummary] = useState<Record<string, string | number> | null>(null);
  const [checks, setChecks] = useState<Check[] | null>(null);

  const meta = useMemo(() => PROVIDERS.find((p) => p.id === active)!, [active]);
  const conn = useMemo(() => connections.find((c) => c.provider === active), [connections, active]);

  const load = useCallback(async () => {
    const [{ data: c }, { data: l }] = await Promise.all([
      supabase.from("integration_connections").select("provider,status,config,last_error,last_sync_at,sync_enabled").eq("device_id", deviceId),
      supabase.from("integration_sync_logs").select("*").eq("device_id", deviceId).order("created_at", { ascending: false }).limit(60),
    ]);
    setConnections((c as Connection[]) ?? []);
    setLogs((l as SyncLog[]) ?? []);
  }, [deviceId]);

  useEffect(() => { if (isOpen) void load(); }, [isOpen, load]);

  useEffect(() => {
    const existing = connections.find((c) => c.provider === active);
    setConfig((existing?.config as Record<string, string>) ?? {});
    setSecrets({});
    setSummary(null);
    setChecks(null);
  }, [active, connections]);

  const doSave = async () => {
    setBusy("save");
    try {
      await saveIntegration({ data: { deviceId, provider: active, config, secrets } });
      toast.success("Integration parameters saved securely");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally { setBusy(""); }
  };

  const doTest = async () => {
    // Client-side preflight so obvious gaps are named before any network call.
    const missing = [...meta.configFields, ...meta.secretFields]
      .filter((f) => meta.required.includes(f.key))
      .filter((f) => !(f.secret ? secrets[f.key] || conn?.status !== "disconnected" : config[f.key]?.trim()))
      .map((f) => f.label);
    if (missing.length > 0) {
      toast.error("Missing required credentials", { description: missing.join(", ") });
      setChecks(missing.map((label) => ({ label, ok: false, detail: "Required — fill this in before testing", critical: true })));
      return;
    }

    setBusy("test");
    setChecks(null);
    try {
      await saveIntegration({ data: { deviceId, provider: active, config, secrets } });
      const res = await testIntegration({ data: { deviceId, provider: active } });
      setChecks(res.checks ?? []);
      if (res.ok) toast.success(`${meta.name} verified — ${res.account}`, { description: res.detail });
      else toast.error(`${meta.name} not verified`, { description: res.error ?? "One or more checks failed" });
      setSecrets({});
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally { setBusy(""); }
  };

  const doSync = async () => {
    setBusy("sync");
    setSummary(null);
    try {
      const res = await syncIntegration({ data: { deviceId, provider: active } });
      if (res.ok) { setSummary(res.summary); toast.success("Sync completed"); }
      else toast.error(res.error);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally { setBusy(""); }
  };

  const doDisconnect = async () => {
    if (!confirm(`Disconnect ${meta.name} and delete its stored credentials?`)) return;
    setBusy("disconnect");
    try {
      await disconnectIntegration({ data: { deviceId, provider: active } });
      toast.success(`${meta.name} disconnected`);
      setSecrets({});
      await load();
    } finally { setBusy(""); }
  };

  if (!isOpen) return null;

  const pill = statusPill(conn?.status ?? "disconnected");
  const providerLogs = logs.filter((l) => l.provider === active);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Plug className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Integrations</h1>
              <p className="text-xs text-muted-foreground">
                Connect your storefront, accounting and tax systems directly to BeeYield
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-lg border border-border hover:bg-card">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider cards */}
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {PROVIDERS.map((p) => {
            const c = connections.find((x) => x.provider === p.id);
            const s = statusPill(c?.status ?? "disconnected");
            return (
              <button key={p.id} onClick={() => setActive(p.id)}
                className={`text-left rounded-xl border p-4 transition-colors ${active === p.id ? "border-honey bg-honey/5" : "border-border bg-card hover:border-honey/40"}`}>
                <div className="flex items-center gap-2">
                  <p.icon className="w-5 h-5 text-honey" />
                  <span className="font-semibold text-sm text-foreground">{p.name}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full border text-[10px] ${s.cls}`}>{s.label}</span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{p.tagline}</p>
                {c?.last_sync_at && (
                  <p className="mt-1 text-[10px] text-muted-foreground/70">Last sync {new Date(c.last_sync_at).toLocaleString()}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Active provider panel */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <meta.icon className="w-6 h-6 text-honey" />
            <div>
              <h2 className="font-display text-lg text-honey">{meta.name}</h2>
              <p className="text-[11px] text-muted-foreground">{meta.tagline}</p>
            </div>
            <span className={`ml-auto px-2.5 py-1 rounded-full border text-[11px] flex items-center gap-1 ${pill.cls}`}>
              <pill.Icon className="w-3 h-3" /> {pill.label}
            </span>
            <a href={meta.docs} target="_blank" rel="noreferrer"
              className="text-[11px] text-honey flex items-center gap-1 hover:underline">
              API docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {conn?.last_error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              <span className="font-semibold">Last error: </span>{conn.last_error}
            </div>
          )}

          {/* Setup steps */}
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
              <ListChecks className="w-3 h-3" /> Setup guide
            </p>
            <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
              {meta.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {meta.capabilities.map((c) => (
                <span key={c} className="px-2 py-0.5 rounded-full border border-honey/30 text-honey text-[10px]">{c}</span>
              ))}
            </div>
          </div>

          {/* Target configuration */}
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Target configuration</p>
            <div className="grid md:grid-cols-2 gap-3">
              {meta.configFields.map((f) => (
                <label key={f.key} className="text-xs space-y-1">
                  <span className="text-muted-foreground">{f.label}</span>
                  <input value={config[f.key] ?? ""} placeholder={f.placeholder}
                    onChange={(e) => setConfig({ ...config, [f.key]: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2 py-1.5" />
                  {f.help && <span className="block text-[10px] text-muted-foreground/70">{f.help}</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Credentials */}
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
              <KeyRound className="w-3 h-3" /> Credentials — stored server-side, never returned to the browser
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {meta.secretFields.map((f) => (
                <label key={f.key} className="text-xs space-y-1">
                  <span className="text-muted-foreground">{f.label}</span>
                  <input type="password" autoComplete="off" value={secrets[f.key] ?? ""} placeholder={f.placeholder}
                    onChange={(e) => setSecrets({ ...secrets, [f.key]: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2 py-1.5" />
                  {f.help && <span className="block text-[10px] text-muted-foreground/70">{f.help}</span>}
                </label>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground/70">
              Leave a credential blank to keep the value already stored. Values are written to a server-only table that
              browser code cannot read.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={doSave} disabled={busy !== ""}
              className="px-3 py-2 rounded-lg border border-border text-xs flex items-center gap-1.5 disabled:opacity-50">
              {busy === "save" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save parameters
            </button>
            <button onClick={doTest} disabled={busy !== ""}
              className="px-3 py-2 rounded-lg bg-honey text-background text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
              {busy === "test" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Test connection
            </button>
            <button onClick={doSync} disabled={busy !== "" || conn?.status !== "connected"}
              title={conn?.status !== "connected" ? "Run Test connection first — syncing stays locked until credentials verify" : undefined}
              className="px-3 py-2 rounded-lg border border-honey/50 text-honey text-xs flex items-center gap-1.5 disabled:opacity-40">
              {busy === "sync" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Run sync
            </button>
            {conn && conn.status !== "disconnected" && (
              <button onClick={doDisconnect} disabled={busy !== ""}
                className="px-3 py-2 rounded-lg border border-red-500/40 text-red-400 text-xs flex items-center gap-1.5 disabled:opacity-50">
                <Unplug className="w-3.5 h-3.5" /> Disconnect
              </button>
            )}
          </div>

          {conn?.status !== "connected" && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-honey" />
              Nothing is written to {meta.name} until a Test connection passes — inspections and audits saved before then
              are queued in the timeline below and can be re-synced with one click.
            </p>
          )}

          {checks && (
            <div className={`rounded-lg border p-4 ${checks.every((c) => c.ok || !c.critical) ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Credential validation
              </p>
              <ul className="space-y-1.5">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-start gap-2 text-xs">
                    {c.ok
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      : <AlertCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${c.critical ? "text-red-400" : "text-honey"}`} />}
                    <span className="text-foreground font-medium">{c.label}</span>
                    <span className="text-muted-foreground">— {c.detail}</span>
                    {!c.critical && !c.ok && <span className="ml-auto text-[10px] text-honey shrink-0">warning only</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}


          {summary && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <p className="text-[11px] uppercase tracking-wide text-emerald-400 mb-2">Latest sync snapshot</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {Object.entries(summary).map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-border bg-background p-2">
                    <p className="text-[10px] uppercase text-muted-foreground">{k}</p>
                    <p className="text-sm font-semibold text-foreground break-words">{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sync history */}
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Sync history</p>
            {providerLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No sync activity recorded for {meta.name} yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-background text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">When</th>
                      <th className="text-left px-3 py-2 font-medium">Event</th>
                      <th className="text-left px-3 py-2 font-medium">Status</th>
                      <th className="text-left px-3 py-2 font-medium">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providerLogs.map((l) => (
                      <tr key={l.id} className="border-t border-border">
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                        <td className="px-3 py-2">{l.event}</td>
                        <td className={`px-3 py-2 ${l.status === "ok" ? "text-emerald-400" : "text-red-400"}`}>{l.status}</td>
                        <td className="px-3 py-2 text-muted-foreground">{l.detail ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Per-record sync timeline across providers */}
        <div className="mt-6">
          <SyncTimeline deviceId={deviceId} />
        </div>
      </div>
    </div>
  );
}
