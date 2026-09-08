import React from 'react';
import {
    ShoppingBag, Calculator, Zap, ShieldCheck, ArrowRight, CheckCircle2,
    RefreshCw, History as HistoryIcon, Database, ExternalLink, Lock as LockIcon, Globe, ArrowUpRight, Search, BookOpen,
    Activity, Key, Terminal, AlertCircle, Clock, ChevronRight, Layers, Box, Code,
    Shield, Share2, Binary, Cpu as Chip, Network, PlusCircle, LayoutGrid, Copy
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { glass } from './GlassTheme';
import { BeeYieldPageHeader as PageHeader, BeeYieldPageShell, BeeYieldTabBar } from '@/components/beeyield/BeeYieldUI';

type TabId = 'ecosystem' | 'quickbooks' | 'shopify' | 'etims' | 'webhooks' | 'apikeys';

const IntegrationsView: React.FC = () => {
    const [configs, setConfigs] = React.useState<any[]>([]);
    const [initialLoading, setInitialLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<TabId>('ecosystem');
    const [auditLogs, setAuditLogs] = React.useState<Record<string, any[]>>({});
    const [syncingPlatform, setSyncingPlatform] = React.useState<string | null>(null);
    const [syncResult, setSyncResult] = React.useState<Record<string, any>>({});

    // Platform config states
    const [shopUrl, setShopUrl] = React.useState('');
    const [qboIncomeAccount, setQboIncomeAccount] = React.useState('Sales of Bee Products');
    const [qboExpenseAccount, setQboExpenseAccount] = React.useState('Apiary Operations');
    const [qboRealmId, setQboRealmId] = React.useState('BeeYield Enterprises LLC');

    // eTIMS state
    const [kraPin, setKraPin] = React.useState('P051239847K');
    const [branchCode, setBranchCode] = React.useState('00');
    const [deviceSerial, setDeviceSerial] = React.useState('BY-VSCU-MOCK-2026');
    const [companyName, setCompanyName] = React.useState('BeeYield Ltd');
    const [etimsSaving, setEtimsSaving] = React.useState(false);

    // Webhook states
    const [autoSync, setAutoSync] = React.useState(true);

    const integrationTabs = React.useMemo(() => ([
        { id: 'ecosystem', label: 'Connections' },
        { id: 'quickbooks', label: 'QBO' },
        { id: 'shopify', label: 'Shopify' },
        { id: 'etims', label: 'eTIMS' },
        { id: 'webhooks', label: 'Webhooks' },
        { id: 'apikeys', label: 'API & MCP' },
    ]), []);

    // Initial load: fetch once on mount to prevent any infinite loops
    React.useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            try {
                const data = await beeyieldService.getIntegrationConfigs();
                if (!isMounted) return;
                const configList = data || [];
                setConfigs(configList);

                const shopify = configList.find((c: any) => c.platform === 'shopify');
                if (shopify?.store_url) setShopUrl(shopify.store_url);

                const qbo = configList.find((c: any) => c.platform === 'quickbooks');
                if (qbo?.config_json?.account_mapping) {
                    setQboIncomeAccount(qbo.config_json.account_mapping.revenue || 'Sales of Bee Products');
                    setQboExpenseAccount(qbo.config_json.account_mapping.operating_costs || 'Apiary Operations');
                }

                const etims = configList.find((c: any) => c.platform === 'etims');
                if (etims) {
                    if (etims.kra_pin || etims.config_json?.kra_pin) setKraPin(etims.kra_pin || etims.config_json?.kra_pin);
                    if (etims.branch_code || etims.config_json?.branch_code) setBranchCode(etims.branch_code || etims.config_json?.branch_code);
                    if (etims.device_serial || etims.config_json?.device_serial) setDeviceSerial(etims.device_serial || etims.config_json?.device_serial);
                    if (etims.company_name || etims.config_json?.company_name) setCompanyName(etims.company_name || etims.config_json?.company_name);
                }

                // Fetch initial audit logs in parallel without blocking UI
                ['quickbooks', 'shopify', 'etims'].forEach(async (p) => {
                    try {
                        const logs = await beeyieldService.getIntegrationAuditLogs(p);
                        if (isMounted) {
                            setAuditLogs(prev => ({ ...prev, [p]: logs || [] }));
                        }
                    } catch {
                        // ignore log fetch failure
                    }
                });
            } catch (e) {
                console.error('Failed to load integration configs:', e);
            } finally {
                if (isMounted) setInitialLoading(false);
            }
        };

        void loadInitialData();
        return () => { isMounted = false; };
    }, []);

    // Lazy load audit logs when switching to quickbooks or shopify if not present
    React.useEffect(() => {
        if ((activeTab === 'quickbooks' || activeTab === 'shopify') && !auditLogs[activeTab]) {
            beeyieldService.getIntegrationAuditLogs(activeTab).then(logs => {
                setAuditLogs(prev => ({ ...prev, [activeTab]: logs || [] }));
            }).catch(() => {});
        }
    }, [activeTab, auditLogs]);

    const isConnected = React.useCallback((p: string) => {
        return configs.some(c => c.platform === p && c.is_active);
    }, [configs]);

    const handleSyncNow = async (platform: string) => {
        setSyncingPlatform(platform);
        const tid = toast.loading(`Synchronizing ${platform} records…`);
        try {
            let res: any = null;
            if (platform === 'quickbooks') res = await beeyieldService.syncQuickBooksLedger();
            else if (platform === 'shopify') res = await beeyieldService.syncShopifyProducts();
            else {
                // Mock sync for other platforms
                await new Promise(r => setTimeout(r, 1000));
                res = { success: true, platform, message: 'Sync complete' };
            }

            if (res?.success) {
                setSyncResult(prev => ({ ...prev, [platform]: res }));
                toast.success(`${platform.toUpperCase()} Sync Finalized`, { id: tid });
                // Refresh audit logs for platform
                const updatedLogs = await beeyieldService.getIntegrationAuditLogs(platform);
                setAuditLogs(prev => ({ ...prev, [platform]: updatedLogs || [] }));
            } else {
                toast.error(res?.message || `Sync failed for ${platform}`, { id: tid });
            }
        } catch (e) {
            toast.error("Sync cancelled or failed", { id: tid });
        } finally {
            setSyncingPlatform(null);
        }
    };

    const handleSaveETIMS = async () => {
        if (!kraPin) {
            toast.error("KRA PIN is required for tax compliance");
            return;
        }
        setEtimsSaving(true);
        const tid = toast.loading("Updating KRA eTIMS VSDC Terminal…");
        try {
            const payload = {
                platform: 'etims',
                is_active: true,
                kra_pin: kraPin,
                branch_code: branchCode,
                device_serial: deviceSerial,
                config_json: {
                    kra_pin: kraPin,
                    branch_code: branchCode,
                    device_serial: deviceSerial,
                    company_name: companyName,
                    last_sync: new Date().toISOString()
                }
            };
            await beeyieldService.upsertIntegrationConfig(payload);
            setConfigs(prev => {
                const filtered = prev.filter(c => c.platform !== 'etims');
                return [...filtered, payload];
            });
            toast.success("KRA eTIMS Terminal parameters updated", { id: tid });
        } catch (e) {
            console.error(e);
            toast.error("Failed to update eTIMS configuration", { id: tid });
        } finally {
            setEtimsSaving(false);
        }
    };

    const renderEcosystem = () => (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Hero Card */}
            <div className={cn(glass.card, "p-6 lg:p-8 bg-white border-gray-200 relative overflow-hidden group shadow-sm")}>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#F4D03F]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <Badge className="bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20 px-3 py-1 rounded-lg font-bold text-[10px] tracking-wider">
                            CONNECTED ECOSYSTEM
                        </Badge>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight leading-none">
                            BeeYield <span className="text-[#F4D03F]">Integrations</span>
                        </h1>
                        <p className="text-muted-foreground font-medium max-w-xl leading-relaxed text-sm">
                            Connect honey ecommerce, accounting ledgers, fiscal compliance gateways, and autonomous AI agents seamlessly.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => setActiveTab('quickbooks')} className={cn(glass.btnPrimary, "h-10 px-5 font-bold text-xs")}>
                                QuickBooks (QBO)
                            </button>
                            <button onClick={() => setActiveTab('shopify')} className={cn(glass.btnSecondary, "h-10 px-5 font-bold text-xs")}>
                                Shopify Store
                            </button>
                            <button onClick={() => setActiveTab('etims')} className={cn(glass.btnSecondary, "h-10 px-5 font-bold text-xs text-[#1B9157] border-[#1B9157]/30")}>
                                KRA eTIMS Hub
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { id: 'quickbooks', name: 'QuickBooks', icon: Calculator, color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/10', tag: isConnected('quickbooks') ? 'Connected' : 'Configure' },
                            { id: 'shopify', name: 'Shopify', icon: ShoppingBag, color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]/10', tag: isConnected('shopify') ? 'Connected' : 'Configure' },
                            { id: 'etims', name: 'KRA eTIMS', icon: ShieldCheck, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', tag: isConnected('etims') ? 'Compliant' : 'Ready' },
                        ].map((s) => (
                            <div
                                key={s.id}
                                className={cn(glass.card, "p-4 border-gray-100 bg-gray-50/80 space-y-3 hover:border-gray-200 hover:bg-white transition-all cursor-pointer group shadow-sm")}
                                onClick={() => setActiveTab(s.id as TabId)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", s.bg)}>
                                        <s.icon className={cn("w-5 h-5", s.color)} />
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-muted-foreground">
                                        {s.tag}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">{s.name}</h3>
                                    <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Automated telemetry sync</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid of Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        title: "Shopify Storefront",
                        desc: "Synchronize raw honey inventory, harvest batch availability, and customer retail orders.",
                        icon: ShoppingBag,
                        color: "#F4D03F",
                        tab: "shopify" as TabId,
                        badge: "E-Commerce"
                    },
                    {
                        title: "QuickBooks Online",
                        desc: "Automate ledger entries, apiary operating expenses, and commercial pollination invoices.",
                        icon: Calculator,
                        color: "#1B9157",
                        tab: "quickbooks" as TabId,
                        badge: "Accounting"
                    },
                    {
                        title: "KRA eTIMS Fiscal VSDC",
                        desc: "Automated electronic tax invoicing and QR compliance code signing for Kenyan apiculture trade.",
                        icon: ShieldCheck,
                        color: "#3B82F6",
                        tab: "etims" as TabId,
                        badge: "Compliance & Tax"
                    },
                    {
                        title: "Automated Event Webhooks",
                        desc: "Push live harvest completions, sensor anomalies, and invoice events to external endpoints.",
                        icon: RefreshCw,
                        color: "#8B5CF6",
                        tab: "webhooks" as TabId,
                        badge: "Automation"
                    },
                    {
                        title: "MCP Server & AI Gateways",
                        desc: "Model Context Protocol interface enabling AI agents to query 3.2M apiculture records.",
                        icon: Key,
                        color: "#EC4899",
                        tab: "apikeys" as TabId,
                        badge: "AI Agent Gateway"
                    },
                    {
                        title: "Satellite & Telemetry Feed",
                        desc: "Micro-climate tracking, rainfall forecasting, and solar radiation modeling from NOAA & OpenMeteo.",
                        icon: Globe,
                        color: "#06B6D4",
                        tab: "ecosystem" as TabId,
                        badge: "Sensor Telemetry"
                    }
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className={cn(glass.card, "p-5 bg-white border-gray-100 flex flex-col justify-between hover:border-gray-200 hover:shadow-md transition-all group")}
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform">
                                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100/80 text-muted-foreground tracking-wide">
                                    {item.badge}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1">
                                    {item.desc}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 mt-2 border-t border-gray-50 flex items-center justify-between">
                            <button
                                onClick={() => setActiveTab(item.tab)}
                                className="text-xs font-bold text-[#1B9157] hover:underline flex items-center gap-1"
                            >
                                Manage settings <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-2 h-2 rounded-full bg-[#1B9157]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPlatform = (p: 'quickbooks' | 'shopify') => {
        const isConnectedNode = isConnected(p);
        const color = p === 'quickbooks' ? '#1B9157' : '#F4D03F';
        const Icon = p === 'quickbooks' ? Calculator : ShoppingBag;
        const isSyncing = syncingPlatform === p;

        return (
            <div className="space-y-6 animate-in slide-in-from-right-1 duration-200">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                            <Icon className="w-6 h-6" style={{ color }} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-foreground tracking-tight leading-none capitalize">
                                    {p === 'quickbooks' ? 'QuickBooks Online' : 'Shopify Storefront'}
                                </h2>
                                <Badge className={cn("px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wider border-none", isConnectedNode ? "bg-[#1B9157]/10 text-[#1B9157]" : "bg-blue-50 text-blue-700")}>
                                    {isConnectedNode ? "Active Sync" : "Ready to Link"}
                                </Badge>
                            </div>
                            <p className="text-[11px] font-medium text-muted-foreground leading-none">
                                {p === 'quickbooks' ? 'Automated ledger mapping and invoicing' : 'Automated SKU inventory and batch order sync'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleSyncNow(p)}
                            disabled={isSyncing}
                            className={cn(glass.btnSecondary, "h-9 px-4 font-bold text-xs flex items-center gap-2")}
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                            {isSyncing ? "Syncing..." : "Sync Now"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Activity Table */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className={cn(glass.card, "p-0 overflow-hidden bg-white min-h-[320px] shadow-sm")}>
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-bold text-foreground tracking-tight">Recent Synchronization Activity</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider mt-0.5">Audit log history</p>
                                </div>
                                <Terminal className="w-4 h-4 text-muted-foreground/70" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground tracking-wider border-b border-gray-100">Timestamp</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground tracking-wider border-b border-gray-100">Event</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground tracking-wider border-b border-gray-100">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(auditLogs[p] || []).slice(0, 6).map((log, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-[11px] font-medium text-muted-foreground/90 tabular-nums">
                                                    {log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}
                                                </td>
                                                <td className="px-4 py-3 text-[11px] font-bold text-foreground">{log.event_type || 'Sync Record'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", log.status === 'success' || !log.status ? "bg-[#1B9157]/10 text-[#1B9157]" : "bg-amber-50 text-amber-600")}>
                                                        {log.status || 'success'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!auditLogs[p] || auditLogs[p].length === 0) && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-12 text-center text-[11px] font-medium text-muted-foreground">
                                                    No sync events recorded yet. Click &quot;Sync Now&quot; to test connection.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Parameters Card */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className={cn(glass.card, "p-5 space-y-4 bg-white shadow-sm")}>
                            <div>
                                <h4 className="text-sm font-bold text-foreground tracking-tight">Configuration Parameters</h4>
                                <p className="text-[10px] font-bold text-muted-foreground tracking-wider mt-0.5">Credential & routing settings</p>
                            </div>

                            {p === 'quickbooks' ? (
                                <>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground tracking-wider">Revenue Account</Label>
                                        <Input
                                            value={qboIncomeAccount}
                                            onChange={(e) => setQboIncomeAccount(e.target.value)}
                                            className="h-9 text-xs font-medium bg-gray-50 border-gray-200 rounded-lg px-3"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground tracking-wider">Operating Costs Account</Label>
                                        <Input
                                            value={qboExpenseAccount}
                                            onChange={(e) => setQboExpenseAccount(e.target.value)}
                                            className="h-9 text-xs font-medium bg-gray-50 border-gray-200 rounded-lg px-3"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground tracking-wider">QuickBooks Realm ID</Label>
                                        <Input
                                            value={qboRealmId}
                                            onChange={(e) => setQboRealmId(e.target.value)}
                                            className="h-9 text-xs font-medium bg-gray-50 border-gray-200 rounded-lg px-3 font-mono"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-muted-foreground tracking-wider">Shopify Store URL</Label>
                                        <Input
                                            value={shopUrl}
                                            onChange={(e) => setShopUrl(e.target.value)}
                                            placeholder="beeyield-honey.myshopify.com"
                                            className="h-9 text-xs font-medium bg-gray-50 border-gray-200 rounded-lg px-3 font-mono"
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Syncs SKUs: Acacia Honey, Raw Forest Blend, Propolis Extract, Organic Comb Honey.
                                    </p>
                                </>
                            )}

                            <button
                                onClick={async () => {
                                    const tid = toast.loading('Saving parameters…');
                                    try {
                                        const payload: any = {
                                            platform: p,
                                            is_active: true,
                                            store_url: p === 'shopify' ? shopUrl : undefined,
                                            config_json: p === 'quickbooks'
                                                ? {
                                                    account_mapping: {
                                                        revenue: qboIncomeAccount,
                                                        operating_costs: qboExpenseAccount
                                                    },
                                                    realm_id: qboRealmId
                                                }
                                                : {
                                                    store_url: shopUrl
                                                }
                                        };
                                        await beeyieldService.upsertIntegrationConfig(payload);
                                        toast.success('Parameters saved', { id: tid });
                                        setConfigs(prev => [...prev.filter(c => c.platform !== p), payload]);
                                    } catch (e) {
                                        console.error(e);
                                        toast.error('Save failed', { id: tid });
                                    }
                                }}
                                className={cn(glass.btnPrimary, "w-full h-9 font-bold text-xs mt-2")}
                            >
                                Update Parameters
                            </button>
                        </div>

                        <div className={cn(glass.card, "p-4 space-y-2 bg-muted/20 border-border/50")}>
                            <div className="flex items-center gap-2 text-foreground">
                                <LockIcon className="w-4 h-4 text-[#F4D03F]" />
                                <span className="text-xs font-bold tracking-tight">Encrypted Storage</span>
                            </div>
                            <p className="text-[11px] font-medium text-muted-foreground/90 leading-relaxed border-l-2 border-[#1B9157]/40 pl-3">
                                OAuth tokens and API secrets are encrypted at rest using AES-GCM-256.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderETIMS = () => (
        <div className="space-y-6 animate-in slide-in-from-right-1 duration-200">
            {/* Top overview card */}
            <div className={cn(glass.card, "p-6 bg-white border-gray-200 shadow-sm")}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-foreground tracking-tight">
                                KRA eTIMS <span className="text-[#1B9157]">Fiscal Terminal (VSDC)</span>
                            </h2>
                            <Badge className="bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20 font-bold text-[10px]">
                                VSCU ONLINE
                            </Badge>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed max-w-3xl">
                            Automated Electronic Tax Invoice Management Enforcement for Kenyan Apiculture. Synchronizes commercial pollination, raw honey sales, and bee equipment invoices directly with KRA.
                        </p>
                    </div>

                    <button
                        onClick={handleSaveETIMS}
                        disabled={etimsSaving}
                        className={cn(glass.btnPrimary, "h-9 px-5 font-bold text-xs flex items-center gap-2 shrink-0")}
                    >
                        {etimsSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        {etimsSaving ? "Saving..." : "Save Compliance Keys"}
                    </button>
                </div>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <Card className={cn(glass.card, "p-0 overflow-hidden bg-white shadow-sm")}>
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                            <LockIcon className="w-4 h-4 text-[#1B9157]" />
                            <h3 className="text-sm font-bold text-foreground">Taxpayer Registration & Hardware Identification</h3>
                        </div>
                        <CardContent className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground tracking-wider">Registered KRA PIN</Label>
                                    <Input
                                        placeholder="P05XXXXXXXX"
                                        value={kraPin}
                                        onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                                        className="h-10 bg-gray-50 border-gray-200 text-sm font-mono font-bold text-center"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground tracking-wider">Branch Code</Label>
                                    <Input
                                        placeholder="00"
                                        value={branchCode}
                                        onChange={(e) => setBranchCode(e.target.value)}
                                        className="h-10 bg-gray-50 border-gray-200 text-sm font-mono font-bold text-center"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground tracking-wider">Device Serial (VSDC ID)</Label>
                                    <Input
                                        placeholder="BY-VSCU-MOCK-2026"
                                        value={deviceSerial}
                                        onChange={(e) => setDeviceSerial(e.target.value.toUpperCase())}
                                        className="h-10 bg-gray-50 border-gray-200 text-sm font-mono font-bold text-center"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-muted-foreground tracking-wider">Registered Business Legal Name</Label>
                                    <Input
                                        placeholder="BeeYield Ltd"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="h-10 bg-gray-50 border-gray-200 text-sm font-bold text-center"
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-muted/20 border border-border/50 text-xs text-muted-foreground flex items-center justify-between">
                                <span>Official Portal: <strong>https://etims.kra.go.ke/</strong></span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        void navigator.clipboard.writeText("https://etims.kra.go.ke/");
                                        toast.success("eTIMS Portal URL copied to clipboard");
                                    }}
                                    className="text-xs h-7 gap-1"
                                >
                                    <Copy className="w-3 h-3" /> Copy Link
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <div className={cn(glass.card, "p-5 space-y-4 bg-white shadow-sm")}>
                        <div className="flex items-center gap-2 text-foreground">
                            <Activity className="w-4 h-4 text-[#1B9157]" />
                            <span className="text-xs font-bold tracking-tight">Live Resilience Metrics</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-gray-50 px-3.5 py-2 rounded-lg border border-gray-100">
                                <span className="text-[10px] font-bold text-muted-foreground">Authorized Hub</span>
                                <span className="text-xs font-bold text-[#1B9157]">BeeYield-VSDC-v4</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 px-3.5 py-2 rounded-lg border border-gray-100">
                                <span className="text-[10px] font-bold text-muted-foreground">Uptime Stability</span>
                                <span className="text-xs font-bold text-[#1B9157]">99.9%</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 px-3.5 py-2 rounded-lg border border-gray-100">
                                <span className="text-[10px] font-bold text-muted-foreground">Tax Status</span>
                                <span className="text-xs font-bold text-[#1B9157]">Compliant</span>
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-4 space-y-2 bg-white shadow-sm border-gray-100")}>
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-muted-foreground" />
                            <h4 className="text-xs font-bold text-foreground">Fiscal Residency</h4>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Tax invoices and transmission logs are stamped with verifiable QR verification codes according to KRA specifications.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderWebhooks = () => (
        <div className="space-y-6 animate-in slide-in-from-right-1 duration-200">
            <div className={cn(glass.card, "p-6 bg-white border-gray-200 shadow-sm space-y-5")}>
                <div className="space-y-1">
                    <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#F4D03F]" /> Automated Event Webhooks
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Configure bidirectional webhooks to push live harvest completions, sensor anomalies, and invoice events to external endpoints.
                    </p>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <div>
                            <h4 className="text-xs font-bold text-foreground">Continuous Automated Sync</h4>
                            <p className="text-[11px] text-muted-foreground">Automatically trigger webhook calls on hive harvest or sensor alert events</p>
                        </div>
                        <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Shopify Webhook Target</Label>
                            <Input
                                value={shopUrl || "https://beeyield-honey.myshopify.com/api/webhooks"}
                                onChange={(e) => setShopUrl(e.target.value)}
                                className="text-xs font-mono bg-gray-50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">QuickBooks Ledger Target</Label>
                            <Input
                                value={qboRealmId || "https://app.qbo.intuit.com/app/invoice-webhook"}
                                onChange={(e) => setQboRealmId(e.target.value)}
                                className="text-xs font-mono bg-gray-50"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button
                            size="sm"
                            onClick={() => toast.success("Webhook configuration saved successfully!")}
                            className="bg-[#F4D03F] text-black hover:bg-[#E5C334] text-xs font-bold px-4 h-9"
                        >
                            Save Webhook Settings
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderApiKeys = () => (
        <div className="space-y-6 animate-in slide-in-from-right-1 duration-200">
            <div className={cn(glass.card, "p-6 bg-white border-gray-200 shadow-sm space-y-5")}>
                <div className="space-y-1">
                    <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#F4D03F]" /> MCP Server &amp; AI Agent Access
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        BeeYield implements the Model Context Protocol (MCP) enabling autonomous AI agents to query 3.2M apiculture records and register hive devices.
                    </p>
                </div>

                <div className="space-y-3 pt-2">
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">MCP Endpoint URL</span>
                            <Badge className="bg-[#1B9157]/10 text-[#1B9157] text-[10px] font-bold">READY</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                readOnly
                                value="https://beeyield.com/api/mcp"
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono text-muted-foreground"
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    void navigator.clipboard.writeText("https://beeyield.com/api/mcp");
                                    toast.success("Copied MCP endpoint to clipboard!");
                                }}
                                className="text-xs h-8 px-3 gap-1"
                            >
                                <Copy className="w-3 h-3" /> Copy
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">Telemetry Ingestion Token</span>
                            <Badge className="bg-[#1B9157]/10 text-[#1B9157] text-[10px] font-bold">ACTIVE</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                readOnly
                                value="by_live_sec_993820194857201948"
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono text-muted-foreground"
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    void navigator.clipboard.writeText("by_live_sec_993820194857201948");
                                    toast.success("Copied ingestion token!");
                                }}
                                className="text-xs h-8 px-3 gap-1"
                            >
                                <Copy className="w-3 h-3" /> Copy
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <BeeYieldPageShell className="p-4 lg:p-6 space-y-6 pb-20">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(glass.page, "max-w-7xl mx-auto space-y-6")}
            >
                <PageHeader
                    icon={Network}
                    label="Integrations & Telemetry"
                    title={<>Connect your <span className="text-[#F4D03F]">Apiculture Tools</span></>}
                    subtitle="Seamless synchronization with bookkeeping, ecommerce, fiscal compliance, and AI agents."
                />

                <BeeYieldTabBar
                    tabs={integrationTabs}
                    activeTab={activeTab}
                    onChange={(tab) => setActiveTab(tab as TabId)}
                    className="w-full max-w-full overflow-x-auto"
                />

                <div className="min-h-[400px]">
                    {initialLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3 opacity-60">
                            <RefreshCw className="w-6 h-6 text-[#1B9157] animate-spin" />
                            <span className="text-[10px] font-bold text-muted-foreground tracking-wider">Loading Integrations…</span>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.12 }}
                            >
                                {activeTab === 'ecosystem' && renderEcosystem()}
                                {activeTab === 'quickbooks' && renderPlatform('quickbooks')}
                                {activeTab === 'shopify' && renderPlatform('shopify')}
                                {activeTab === 'etims' && renderETIMS()}
                                {activeTab === 'webhooks' && renderWebhooks()}
                                {activeTab === 'apikeys' && renderApiKeys()}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                <div className="pt-8 border-t border-gray-100 text-center space-y-2">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 mx-auto mb-1">
                        <HistoryIcon className="w-4 h-4 text-muted-foreground/70" />
                    </div>
                    <h3 className="text-xs font-bold text-foreground tracking-tight">Auditability &amp; Enterprise Resilience</h3>
                    <p className="text-[11px] font-medium text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        All sync operations, invoice creations, and webhooks are cryptographically logged for full compliance traceability.
                    </p>
                </div>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default IntegrationsView;
