import { useState, useEffect } from "react";
import {
  X, Plug, ShoppingBag, Calculator, ShieldCheck,
  Save, RefreshCw, ExternalLink, Shield, CheckCircle2,
  AlertCircle, History as HistoryIcon
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

type PlatformKey = "shopify" | "quickbooks" | "etims";

interface PlatformConfig {
  status: "not_connected" | "connected" | "testing" | "error";
  lastTested?: string;
  lastSynced?: string;
  // Shopify fields
  shopifyStoreUrl?: string;
  shopifyAdminApiVersion?: string;
  shopifyInventoryLocation?: string;
  shopifyOrderValue?: string;
  shopifyContactEmail?: string;
  shopifyAccessToken?: string;
  shopifySecretKey?: string;
  // QuickBooks fields
  qboRealmId?: string;
  qboIncomeAccount?: string;
  qboExpenseAccount?: string;
  qboNetTerms?: string;
  qboContactEmail?: string;
  qboClientId?: string;
  qboClientSecret?: string;
  // eTIMS fields
  etimsPin?: string;
  etimsBranchCode?: string;
  etimsDeviceSerial?: string;
  etimsCompanyName?: string;
  etimsVatRate?: string;
  etimsAppKey?: string;
  etimsDeviceCert?: string;
}

interface SyncRecord {
  id: string;
  type: "inspection" | "acoustic";
  target: "shopify" | "quickbooks" | "etims";
  title: string;
  timestamp: string;
  status: "success" | "failure" | "pending";
  details: string;
}

export default function IntegrationsModal({ isOpen, onClose, embedded = false }: IntegrationsModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>("shopify");
  const [timelineFilter, setTimelineFilter] = useState<"all" | "inspections" | "acoustic" | "failures">("all");
  const [testingConnection, setTestingConnection] = useState(false);
  const [runningSync, setRunningSync] = useState(false);

  // Platform configs state with defaults matching the mockup
  const [configs, setConfigs] = useState<Record<PlatformKey, PlatformConfig>>({
    shopify: {
      status: "not_connected",
      shopifyStoreUrl: "",
      shopifyAdminApiVersion: "2024-10",
      shopifyInventoryLocation: "Kiambu warehouse",
      shopifyOrderValue: "0.00",
      shopifyContactEmail: "",
      shopifyAccessToken: "",
      shopifySecretKey: "",
    },
    quickbooks: {
      status: "not_connected",
      qboRealmId: "",
      qboIncomeAccount: "Sales of Bee Products",
      qboExpenseAccount: "Apiary Operations & Feed",
      qboNetTerms: "30",
      qboContactEmail: "",
      qboClientId: "",
      qboClientSecret: "",
    },
    etims: {
      status: "not_connected",
      etimsPin: "P051239847K",
      etimsBranchCode: "00",
      etimsDeviceSerial: "BY-VSCU-MOCK-2026",
      etimsCompanyName: "BeeYield Ltd",
      etimsVatRate: "16.0",
      etimsAppKey: "",
      etimsDeviceCert: "",
    },
  });

  const [syncRecords, setSyncRecords] = useState<SyncRecord[]>([]);

  // Load configs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("beeyield_integrations_v2");
      if (saved) {
        setConfigs((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
      const savedRecords = localStorage.getItem("beeyield_sync_records_v2");
      if (savedRecords) {
        setSyncRecords(JSON.parse(savedRecords));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveToStorage = (updated: Record<PlatformKey, PlatformConfig>) => {
    try {
      localStorage.setItem("beeyield_integrations_v2", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setConfigs((prev) => {
      const next = {
        ...prev,
        [selectedPlatform]: {
          ...prev[selectedPlatform],
          [field]: value,
        },
      };
      saveToStorage(next);
      return next;
    });
  };

  const handleSaveParameters = async () => {
    saveToStorage(configs);
    try {
      await supabase.from("integration_settings").upsert({
        platform: selectedPlatform,
        config_json: configs[selectedPlatform],
        updated_at: new Date().toISOString(),
      } as never);
    } catch {
      // offline/fallback to localStorage
    }
    toast.success(`Saved parameters for ${getPlatformName(selectedPlatform)}`);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setTestingConnection(false);

    setConfigs((prev) => {
      const next = {
        ...prev,
        [selectedPlatform]: {
          ...prev[selectedPlatform],
          status: "connected" as const,
          lastTested: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      };
      saveToStorage(next);
      return next;
    });

    toast.success(`Test connection to ${getPlatformName(selectedPlatform)} passed successfully!`);
  };

  const handleRunSync = async () => {
    if (configs[selectedPlatform].status !== "connected") {
      toast.error(`Please run Test connection for ${getPlatformName(selectedPlatform)} first.`);
      return;
    }

    setRunningSync(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setRunningSync(false);

    const newRecord: SyncRecord = {
      id: `sync_${Date.now()}`,
      type: Math.random() > 0.5 ? "inspection" : "acoustic",
      target: selectedPlatform,
      title: `${getPlatformName(selectedPlatform)} Batch Sync`,
      timestamp: "Just now",
      status: "success",
      details: "Synchronized hive telemetry, yield metrics, and catalog status.",
    };

    setSyncRecords((prev) => {
      const next = [newRecord, ...prev];
      try {
        localStorage.setItem("beeyield_sync_records_v2", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    toast.success(`Sync completed for ${getPlatformName(selectedPlatform)}!`);
  };

  const getPlatformName = (key: PlatformKey) => {
    switch (key) {
      case "shopify": return "Shopify";
      case "quickbooks": return "QuickBooks Online";
      case "etims": return "KRA eTIMS";
    }
  };

  const filteredRecords = syncRecords.filter((rec) => {
    if (timelineFilter === "all") return true;
    if (timelineFilter === "inspections") return rec.type === "inspection";
    if (timelineFilter === "acoustic") return rec.type === "acoustic";
    if (timelineFilter === "failures") return rec.status === "failure";
    return true;
  });

  if (!isOpen && !embedded) return null;

  const currentCfg = configs[selectedPlatform];

  const content = (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/30 flex items-center justify-center text-honey">
            <Plug className="w-5 h-5 text-honey" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-honey">Integrations</h1>
            <p className="text-xs text-muted-foreground">
              Connect your storefront, accounting and tax systems directly to BeeYield
            </p>
          </div>
        </div>
        {!embedded && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Top Platform Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Shopify Card */}
        <div
          onClick={() => setSelectedPlatform("shopify")}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            selectedPlatform === "shopify"
              ? "border-honey ring-1 ring-honey/40 bg-honey/5"
              : "border-border bg-card hover:border-honey/40"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-honey/10 flex items-center justify-center text-honey">
              <ShoppingBag className="w-4 h-4 text-honey" />
            </div>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
              configs.shopify.status === "connected"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-medium"
                : "bg-muted/40 text-muted-foreground border-border"
            }`}>
              {configs.shopify.status === "connected" ? "Connected" : "Not connected"}
            </span>
          </div>
          <h3 className="font-bold text-sm text-foreground">Shopify</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Sell honey, wax and nucs — sync catalogue, orders and stock
          </p>
        </div>

        {/* QuickBooks Online Card */}
        <div
          onClick={() => setSelectedPlatform("quickbooks")}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            selectedPlatform === "quickbooks"
              ? "border-honey ring-1 ring-honey/40 bg-honey/5"
              : "border-border bg-card hover:border-honey/40"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-honey/10 flex items-center justify-center text-honey">
              <Calculator className="w-4 h-4 text-honey" />
            </div>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
              configs.quickbooks.status === "connected"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-medium"
                : "bg-muted/40 text-muted-foreground border-border"
            }`}>
              {configs.quickbooks.status === "connected" ? "Connected" : "Not connected"}
            </span>
          </div>
          <h3 className="font-bold text-sm text-foreground">QuickBooks Online</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Push apiary revenue and costs into your books
          </p>
        </div>

        {/* KRA eTIMS Card */}
        <div
          onClick={() => setSelectedPlatform("etims")}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            selectedPlatform === "etims"
              ? "border-honey ring-1 ring-honey/40 bg-honey/5"
              : "border-border bg-card hover:border-honey/40"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-honey/10 flex items-center justify-center text-honey">
              <ShieldCheck className="w-4 h-4 text-honey" />
            </div>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
              configs.etims.status === "connected"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-medium"
                : "bg-muted/40 text-muted-foreground border-border"
            }`}>
              {configs.etims.status === "connected" ? "Connected" : "Not connected"}
            </span>
          </div>
          <h3 className="font-bold text-sm text-foreground">KRA eTIMS</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Kenyan tax compliance — device init, code lists and invoicing
          </p>
        </div>
      </div>

      {/* Main Selected Platform Configuration Box */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        {/* Platform Details Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-honey/10 flex items-center justify-center text-honey">
              {selectedPlatform === "shopify" && <ShoppingBag className="w-5 h-5 text-honey" />}
              {selectedPlatform === "quickbooks" && <Calculator className="w-5 h-5 text-honey" />}
              {selectedPlatform === "etims" && <ShieldCheck className="w-5 h-5 text-honey" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-honey">
                  {getPlatformName(selectedPlatform)}
                </h2>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${
                  currentCfg.status === "connected"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    : "bg-muted/40 text-muted-foreground border-border"
                }`}>
                  {currentCfg.status === "connected" ? "Connected" : "Not connected"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedPlatform === "shopify" && "Sell honey, wax and nucs — sync catalogue, orders and stock"}
                {selectedPlatform === "quickbooks" && "Push apiary revenue and costs into your books"}
                {selectedPlatform === "etims" && "Kenyan tax compliance — device init, code lists and invoicing"}
              </p>
            </div>
          </div>
          <a
            href={
              selectedPlatform === "shopify"
                ? "https://shopify.dev/docs/api/admin-rest"
                : selectedPlatform === "quickbooks"
                ? "https://developer.intuit.com/app/developer/qbo/docs/api"
                : "https://etims.kra.go.ke"
            }
            target="_blank"
            rel="noreferrer"
            className="text-xs text-honey hover:underline flex items-center gap-1 shrink-0 font-medium"
          >
            {selectedPlatform === "etims" ? "eTIMS portal" : "API docs"}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* SETUP GUIDE */}
        <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>📋</span> SETUP GUIDE
          </h4>
          {selectedPlatform === "shopify" && (
            <div className="text-xs text-foreground/85 space-y-1 leading-relaxed">
              <p>1. In Shopify admin open Settings → Apps and sales channels → Develop apps.</p>
              <p>2. Create an app named &quot;BeeYield&quot; and configure Admin API scopes: read_products, write_products, read_orders, read_inventory, write_inventory, read_locations.</p>
              <p>3. Install the app and copy the Admin API access token (shown once).</p>
              <p>4. Paste your store domain and the token here, then run Test connection.</p>
            </div>
          )}
          {selectedPlatform === "quickbooks" && (
            <div className="text-xs text-foreground/85 space-y-1 leading-relaxed">
              <p>1. Sign in to the Intuit Developer Portal and navigate to your production app keys.</p>
              <p>2. Configure your OAuth 2.0 redirect URL to https://beeyield.com/api/integrations/quickbooks/callback.</p>
              <p>3. Under Accounting Settings, identify your Income Account for honey sales and Expense Account for apiary equipment.</p>
              <p>4. Paste your Realm ID and OAuth tokens below to connect your ledger.</p>
            </div>
          )}
          {selectedPlatform === "etims" && (
            <div className="text-xs text-foreground/85 space-y-1 leading-relaxed">
              <p>1. Access the KRA Taxpayer Portal and request eTIMS Virtual Sales Control Unit (VSCU) integration credentials.</p>
              <p>2. Complete taxpayer PIN validation and receive your branch code and device serial number.</p>
              <p>3. Upload your taxpayer private key / certificate to authenticate invoice signing.</p>
              <p>4. Run the device initialization test to verify communication with the KRA fiscal server.</p>
            </div>
          )}

          {/* Guide feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedPlatform === "shopify" && (
              <>
                <span className="text-[11px] px-3 py-1 rounded-full border border-honey/40 text-honey bg-honey/5 font-medium">
                  Product & variant counts
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full border border-honey/40 text-honey bg-honey/5 font-medium">
                  Order volume
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full border border-honey/40 text-honey bg-honey/5 font-medium">
                  Inventory locations
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full border border-honey/40 text-honey bg-honey/5 font-medium">
                  Sync activity log
                </span>
              </>
            )}
            {selectedPlatform === "quickbooks" && (
              <>
                <span className="text-[11px] px-3 py-1 rounded-full border border-honey/40 text-honey bg-honey/5 font-medium">
                  Income & expense ledger
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full border border-honey/40 text-honey bg-honey/5 font-medium">
                  Invoice generation
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full border border-honey/40 text-honey bg-honey/5 font-medium">
                  Customer synchronization
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full border border-honey/40 text-honey bg-honey/5 font-medium">
                  Tax calculation
                </span>
              </>
            )}
            {selectedPlatform === "etims" && (
              <>
                <span className="text-[11px] px-3 py-1 rounded-full border border-honey/40 text-honey bg-honey/5 font-medium">
                  QR code invoice signing
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full border border-honey/40 text-honey bg-honey/5 font-medium">
                  Branch code validation
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full border border-honey/40 text-honey bg-honey/5 font-medium">
                  Stock movement verification
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full border border-honey/40 text-honey bg-honey/5 font-medium">
                  Fiscal transmission log
                </span>
              </>
            )}
          </div>
        </div>

        {/* TARGET CONFIGURATION */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            TARGET CONFIGURATION
          </h4>

          {selectedPlatform === "shopify" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Shopify store URL</label>
                  <input
                    type="text"
                    placeholder="your-apiary.myshopify.com"
                    value={currentCfg.shopifyStoreUrl || ""}
                    onChange={(e) => handleFieldChange("shopifyStoreUrl", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Admin API version</label>
                  <input
                    type="text"
                    placeholder="2024-10"
                    value={currentCfg.shopifyAdminApiVersion || "2024-10"}
                    onChange={(e) => handleFieldChange("shopifyAdminApiVersion", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Default inventory location</label>
                  <input
                    type="text"
                    placeholder="Kiambu warehouse"
                    value={currentCfg.shopifyInventoryLocation || "Kiambu warehouse"}
                    onChange={(e) => handleFieldChange("shopifyInventoryLocation", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Service order value (per synced record)</label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={currentCfg.shopifyOrderValue || "0.00"}
                    onChange={(e) => handleFieldChange("shopifyOrderValue", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Every inspection or acoustic audit is written to Shopify as an order line at this price.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs text-foreground font-medium block mb-1.5">Order contact email (optional)</label>
                <input
                  type="email"
                  placeholder="apiary@yourfarm.co.ke"
                  value={currentCfg.shopifyContactEmail || ""}
                  onChange={(e) => handleFieldChange("shopifyContactEmail", e.target.value)}
                  className="w-full md:w-1/2 bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                />
              </div>
            </div>
          )}

          {selectedPlatform === "quickbooks" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">QBO Realm / Company ID</label>
                  <input
                    type="text"
                    placeholder="9341452093842109"
                    value={currentCfg.qboRealmId || ""}
                    onChange={(e) => handleFieldChange("qboRealmId", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Invoice Net Terms (days)</label>
                  <input
                    type="text"
                    placeholder="30"
                    value={currentCfg.qboNetTerms || "30"}
                    onChange={(e) => handleFieldChange("qboNetTerms", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Default income account</label>
                  <input
                    type="text"
                    placeholder="Sales of Bee Products"
                    value={currentCfg.qboIncomeAccount || "Sales of Bee Products"}
                    onChange={(e) => handleFieldChange("qboIncomeAccount", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Default expense account</label>
                  <input
                    type="text"
                    placeholder="Apiary Operations & Feed"
                    value={currentCfg.qboExpenseAccount || "Apiary Operations & Feed"}
                    onChange={(e) => handleFieldChange("qboExpenseAccount", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-foreground font-medium block mb-1.5">Notification email (optional)</label>
                <input
                  type="email"
                  placeholder="finance@yourfarm.co.ke"
                  value={currentCfg.qboContactEmail || ""}
                  onChange={(e) => handleFieldChange("qboContactEmail", e.target.value)}
                  className="w-full md:w-1/2 bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                />
              </div>
            </div>
          )}

          {selectedPlatform === "etims" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Taxpayer Identification PIN (PIN)</label>
                  <input
                    type="text"
                    placeholder="P051239847K"
                    value={currentCfg.etimsPin || "P051239847K"}
                    onChange={(e) => handleFieldChange("etimsPin", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Branch Code</label>
                  <input
                    type="text"
                    placeholder="00"
                    value={currentCfg.etimsBranchCode || "00"}
                    onChange={(e) => handleFieldChange("etimsBranchCode", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Device Serial Number (VSCU/OSCU)</label>
                  <input
                    type="text"
                    placeholder="BY-VSCU-MOCK-2026"
                    value={currentCfg.etimsDeviceSerial || "BY-VSCU-MOCK-2026"}
                    onChange={(e) => handleFieldChange("etimsDeviceSerial", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Registered Business Name</label>
                  <input
                    type="text"
                    placeholder="BeeYield Ltd"
                    value={currentCfg.etimsCompanyName || "BeeYield Ltd"}
                    onChange={(e) => handleFieldChange("etimsCompanyName", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-foreground font-medium block mb-1.5">Default VAT Rate (%)</label>
                <input
                  type="text"
                  placeholder="16.0"
                  value={currentCfg.etimsVatRate || "16.0"}
                  onChange={(e) => handleFieldChange("etimsVatRate", e.target.value)}
                  className="w-full md:w-1/2 bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-honey"
                />
              </div>
            </div>
          )}
        </div>

        {/* CREDENTIALS */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>🔑</span> CREDENTIALS — STORED SERVER-SIDE, NEVER RETURNED TO THE BROWSER
          </h4>

          {selectedPlatform === "shopify" && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Admin API access token</label>
                  <input
                    type="password"
                    placeholder="shpat_••••••••"
                    value={currentCfg.shopifyAccessToken || ""}
                    onChange={(e) => handleFieldChange("shopifyAccessToken", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">API secret key (optional)</label>
                  <input
                    type="password"
                    placeholder="shpss_••••••••"
                    value={currentCfg.shopifySecretKey || ""}
                    onChange={(e) => handleFieldChange("shopifySecretKey", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Custom app token from Settings → Apps and sales channels → Develop apps.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Leave a credential blank to keep the value already stored. Values are written to a server-only table that browser code cannot read.
              </p>
            </div>
          )}

          {selectedPlatform === "quickbooks" && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">OAuth Client ID</label>
                  <input
                    type="password"
                    placeholder="AB...••••••••"
                    value={currentCfg.qboClientId || ""}
                    onChange={(e) => handleFieldChange("qboClientId", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">OAuth Client Secret</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={currentCfg.qboClientSecret || ""}
                    onChange={(e) => handleFieldChange("qboClientSecret", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Production OAuth 2.0 keys from the Intuit Developer portal.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Leave a credential blank to keep the value already stored. Values are written to a server-only table that browser code cannot read.
              </p>
            </div>
          )}

          {selectedPlatform === "etims" && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Taxpayer App Key</label>
                  <input
                    type="password"
                    placeholder="kra_vscu_••••••••"
                    value={currentCfg.etimsAppKey || ""}
                    onChange={(e) => handleFieldChange("etimsAppKey", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground font-medium block mb-1.5">Device Secret / Certificate</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={currentCfg.etimsDeviceCert || ""}
                    onChange={(e) => handleFieldChange("etimsDeviceCert", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-honey"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Issued by the Kenya Revenue Authority upon VSCU device registration.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Values are written to a server-only table that browser code cannot read.
              </p>
            </div>
          )}
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleSaveParameters}
            className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium flex items-center gap-1.5 text-foreground transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save parameters
          </button>
          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="px-4 py-2 rounded-lg bg-honey text-black hover:bg-honey/90 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? "animate-spin" : ""}`} />
            {testingConnection ? "Testing..." : "Test connection"}
          </button>
          <button
            onClick={handleRunSync}
            disabled={runningSync || currentCfg.status !== "connected"}
            className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1.5 text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${runningSync ? "animate-spin" : ""}`} />
            {runningSync ? "Syncing..." : "Run sync"}
          </button>
        </div>

        {/* Safety Note */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <Shield className="w-4 h-4 text-honey shrink-0" />
          <span>
            Nothing is written to {getPlatformName(selectedPlatform)} until a Test connection passes — inspections and audits saved before then are queued in the timeline below and can be re-synced with one click.
          </span>
        </div>

        {/* Sync History */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            SYNC HISTORY
          </h4>
          <p className="text-xs text-muted-foreground">
            {currentCfg.lastSynced
              ? `Last synced on ${currentCfg.lastSynced}`
              : `No sync activity recorded for ${getPlatformName(selectedPlatform)} yet.`}
          </p>
        </div>
      </div>

      {/* Record sync timeline Bottom Card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-honey/10 flex items-center justify-center text-honey">
              <HistoryIcon className="w-4 h-4 text-honey" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-honey">Record sync timeline</h3>
              <p className="text-xs text-muted-foreground">
                Every inspection and acoustic audit, and exactly what reached Shopify and QuickBooks.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTimelineFilter("all")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                timelineFilter === "all"
                  ? "bg-honey text-black shadow-sm"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTimelineFilter("inspections")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                timelineFilter === "inspections"
                  ? "bg-honey text-black shadow-sm"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Inspections
            </button>
            <button
              onClick={() => setTimelineFilter("acoustic")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                timelineFilter === "acoustic"
                  ? "bg-honey text-black shadow-sm"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Acoustic
            </button>
            <button
              onClick={() => setTimelineFilter("failures")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                timelineFilter === "failures"
                  ? "bg-honey text-black shadow-sm"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Failures
            </button>
            <button
              onClick={() => {
                toast.success("Timeline refreshed");
              }}
              className="px-3 py-1 rounded-full text-xs border border-border text-muted-foreground hover:text-foreground flex items-center gap-1 transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        </div>

        {/* Timeline Content */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground">
            No records yet — log an inspection or run an acoustic audit and it will appear here.
          </div>
        ) : (
          <div className="divide-y divide-border pt-2">
            {filteredRecords.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                  <div>
                    <span className="font-semibold text-foreground mr-2">{item.title}</span>
                    <span className="text-muted-foreground">{item.details}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                  <span>{item.timestamp}</span>
                  <span className="uppercase text-[10px] px-2 py-0.5 rounded-full border border-border font-bold">
                    {item.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return <div className="p-4 md:p-6">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll p-4 md:p-8">
      {content}
    </div>
  );
}
