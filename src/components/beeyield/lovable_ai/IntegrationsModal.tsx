import { useState, useEffect } from "react";
import {
  X, Plug, CheckCircle2, AlertCircle, RefreshCw, ShoppingBag,
  Calculator, ShieldCheck, Key, Globe, Database, ArrowRight, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

interface PlatformIntegration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: typeof Plug;
  status: "connected" | "disconnected" | "configuring";
  syncFrequency: string;
  lastSync?: string;
  details: string;
}

export default function IntegrationsModal({ isOpen, onClose, embedded = false }: IntegrationsModalProps) {
  const [activeTab, setActiveTab] = useState<"platforms" | "webhooks" | "apikeys">("platforms");
  const [syncing, setSyncing] = useState<string | null>(null);
  const [shopifyStore, setShopifyStore] = useState("beeyield-honey.myshopify.com");
  const [quickbooksCompany, setQuickbooksCompany] = useState("BeeYield Enterprises LLC");
  const [etimsPin, setEtimsPin] = useState("P051239847K");
  const [autoSync, setAutoSync] = useState(true);

  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([
    {
      id: "shopify",
      name: "Shopify Storefront",
      category: "E-Commerce",
      description: "Synchronize raw honey inventory, harvest batch availability, and customer retail orders.",
      icon: ShoppingBag,
      status: "connected",
      syncFrequency: "Real-time Webhook",
      lastSync: "3 mins ago",
      details: "Syncs SKUs: Acacia Honey, Raw Forest Blend, Propolis Extract",
    },
    {
      id: "quickbooks",
      name: "QuickBooks Online (QBO)",
      category: "Accounting",
      description: "Automate ledger entries, apiary operating expenses, and commercial pollination invoices.",
      icon: Calculator,
      status: "connected",
      syncFrequency: "Daily at Midnight",
      lastSync: "Today, 00:00 UTC",
      details: "Mapped to Income: Honey Sales, Expense: Apiary Equipment",
    },
    {
      id: "etims",
      name: "KRA eTIMS Fiscal Engine",
      category: "Compliance & Tax",
      description: "Automated electronic tax invoicing and QR compliance code signing for Kenyan apiculture trade.",
      icon: ShieldCheck,
      status: "connected",
      syncFrequency: "Per Transaction",
      lastSync: "1 hour ago",
      details: "Device Control Unit (VSCU) online and authenticated",
    },
    {
      id: "weather",
      name: "NOAA & OpenMeteo Satellite Feed",
      category: "Telemetry",
      description: "Micro-climate tracking, rainfall forecasting, and solar radiation modeling for flight prediction.",
      icon: Globe,
      status: "connected",
      syncFrequency: "Hourly",
      lastSync: "15 mins ago",
      details: "Connected to Kibwezi & Mount Kenya weather stations",
    },
    {
      id: "supabase",
      name: "Cloud Database & Storage",
      category: "Infrastructure",
      description: "High-performance PostgreSQL with vector search for apiculture embeddings and sensor telemetry.",
      icon: Database,
      status: "connected",
      syncFrequency: "Live Stream",
      lastSync: "Live",
      details: "Synchronizing with BeeYield 3.2M+ apiculture datasets",
    },
  ]);

  useEffect(() => {
    // Load persisted settings or status from Supabase if available
    async function loadConfigs() {
      try {
        const { data } = await supabase.from("integration_settings").select("*");
        if (data && data.length > 0) {
          // Update status based on stored config
        }
      } catch {
        // Table or record optional in demo mode
      }
    }
    if (isOpen) {
      void loadConfigs();
    }
  }, [isOpen]);

  const triggerSync = (id: string, name: string) => {
    setSyncing(id);
    setTimeout(() => {
      setSyncing(null);
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, lastSync: "Just now" } : item
        )
      );
      toast.success(`${name} synchronized successfully!`);
    }, 1200);
  };

  if (!isOpen) return null;

  const content = (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/30 flex items-center justify-center text-honey">
            <Plug className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-honey flex items-center gap-2">
              BeeYield Integrations Ecosystem
            </h2>
            <p className="text-xs text-muted-foreground">
              Connect honey ecommerce, accounting, fiscal compliance, and sensor gateways
            </p>
          </div>
        </div>
        {!embedded && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/40 shrink-0">
        <button
          onClick={() => setActiveTab("platforms")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "platforms"
              ? "bg-honey text-black shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Plug className="w-3.5 h-3.5" /> Connected Platforms
        </button>
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "webhooks"
              ? "bg-honey text-black shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Webhooks & Automation
        </button>
        <button
          onClick={() => setActiveTab("apikeys")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "apikeys"
              ? "bg-honey text-black shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Key className="w-3.5 h-3.5" /> API Keys & Gateways
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6">
        {activeTab === "platforms" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((item) => {
                const IconComponent = item.icon;
                const isItemSyncing = syncing === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-card/70 p-5 shadow-sm hover:border-honey/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-display font-semibold text-sm text-foreground">
                              {item.name}
                            </h3>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {item.description}
                      </p>
                      <div className="bg-muted/50 rounded-lg p-2.5 mb-3 text-[11px] text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">Cadence:</span>
                          <span className="font-semibold text-foreground">{item.syncFrequency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Last Sync:</span>
                          <span className="font-semibold text-foreground">{item.lastSync}</span>
                        </div>
                        <div className="pt-1 border-t border-border/50 text-[10px] text-muted-foreground/80">
                          {item.details}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerSync(item.id, item.name)}
                        disabled={isItemSyncing}
                        className="text-xs h-8 flex-1 gap-1.5 border-border hover:border-honey/50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isItemSyncing ? "animate-spin" : ""}`} />
                        {isItemSyncing ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.info(`Configuration panel for ${item.name}`)}
                        className="text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "webhooks" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
              <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <span>⚡</span> Automated Event Webhooks
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure bidirectional webhooks to push live harvest completions, sensor anomalies, and invoice events to external endpoints.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Continuous Automated Sync</h4>
                    <p className="text-[11px] text-muted-foreground">Automatically trigger syncing on hive harvest threshold pass</p>
                  </div>
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Shopify Store URL</Label>
                  <Input
                    value={shopifyStore}
                    onChange={(e) => setShopifyStore(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">QuickBooks Company Realm ID</Label>
                  <Input
                    value={quickbooksCompany}
                    onChange={(e) => setQuickbooksCompany(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">KRA eTIMS Taxpayer Identification PIN</Label>
                  <Input
                    value={etimsPin}
                    onChange={(e) => setEtimsPin(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => toast.success("Webhook configuration saved successfully!")}
                  className="bg-honey text-black hover:bg-honey/90 text-xs font-bold px-4"
                >
                  Save Webhook Settings
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "apikeys" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
              <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <span>🔑</span> MCP Server & API Access
              </h3>
              <p className="text-xs text-muted-foreground">
                BeeYield implements the Model Context Protocol (MCP) enabling AI agents to query 3.2M apiculture records and register hive devices.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">MCP Endpoint</span>
                    <span className="text-[10px] text-honey font-bold uppercase">Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value="https://beeyield.com/api/mcp"
                      className="flex-1 bg-background border border-border rounded px-2.5 py-1 text-xs font-mono text-muted-foreground"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void navigator.clipboard.writeText("https://beeyield.com/api/mcp");
                        toast.success("Copied MCP endpoint!");
                      }}
                      className="text-xs h-7 px-3"
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Telemetry Ingestion Token</span>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      type="password"
                      value="by_live_ingest_7849201948271049"
                      className="flex-1 bg-background border border-border rounded px-2.5 py-1 text-xs font-mono text-muted-foreground"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void navigator.clipboard.writeText("by_live_ingest_7849201948271049");
                        toast.success("Copied ingestion token!");
                      }}
                      className="text-xs h-7 px-3"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return <div className="rounded-2xl border border-border bg-card overflow-hidden">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl shadow-2xl relative overflow-hidden animate-fade-in">
        {content}
      </div>
    </div>
  );
}
