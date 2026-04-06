import React from 'react';
import {
    ShoppingBag, Calculator, Zap, ShieldCheck, ArrowRight, CheckCircle2,
    RefreshCw, History as HistoryIcon, Database, ExternalLink, Lock as LockIcon, Globe, ArrowUpRight, Search, BookOpen,
    Activity, Key, Terminal, AlertCircle, Clock, ChevronRight, Layers, Box, Code,
    Shield, Share2, Binary, Cpu as Chip, Network, PlusCircle, LayoutGrid
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import { glass, PageHeader } from './GlassTheme';
import SettingsIntegrationsView from './SettingsIntegrationsView';

const IntegrationsView: React.FC = () => {
    const [configs, setConfigs] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<'ecosystem' | 'quickbooks' | 'shopify' | 'etims'>('ecosystem');
    const [auditLogs, setAuditLogs] = React.useState<Record<string, any[]>>({});
    const [activeConfig, setActiveConfig] = React.useState<any>(null);

    const [shopUrl, setShopUrl] = React.useState('');
    const [qboIncomeAccount, setQboIncomeAccount] = React.useState('Sales of Bee Products');
    const [qboExpenseAccount, setQboExpenseAccount] = React.useState('Apiary Operations');

    const fetchConfigs = React.useCallback(async (force = false) => {
        if (!force && configs.length > 0 && activeTab === 'ecosystem') return;
        
        setLoading(true);
        try {
            // Pre-fetch configs if missing
            if (force || configs.length === 0) {
                const data = await beeyieldService.getIntegrationConfigs();
                setConfigs(data || []);
                
                // PERFORMANCE: Pre-fetch logs for all known platforms in background
                ['quickbooks', 'shopify'].forEach(p => {
                    beeyieldService.getIntegrationAuditLogs(p).then(logs => {
                        setAuditLogs(prev => ({ ...prev, [p]: logs || [] }));
                    });
                });
            }

            const platform = activeTab === 'ecosystem' ? '' : activeTab;
            if (platform) {
                const current = configs?.find((c: any) => c.platform === platform);
                if (current) {
                    setActiveConfig(current.config_json || {});
                    if (platform === 'shopify') setShopUrl(current.store_url || '');
                    if (platform === 'quickbooks') {
                        setQboIncomeAccount(current.config_json?.account_mapping?.revenue || 'Sales of Bee Products');
                        setQboExpenseAccount(current.config_json?.account_mapping?.operating_costs || 'Apiary Operations');
                    }
                }

                // If not in cache and not already fetching, get it
                if (platform !== 'etims' && !auditLogs[platform]) {
                    const logs = await beeyieldService.getIntegrationAuditLogs(platform);
                    setAuditLogs(prev => ({ ...prev, [platform]: logs || [] }));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [activeTab, configs.length, auditLogs]);

    React.useEffect(() => {
        fetchConfigs();
    }, [activeTab]);

    const handleSyncNow = async (platform: string) => {
        const tid = toast.loading(`Synchronizing ${platform} records...`);
        try {
            let res;
            if (platform === 'quickbooks') res = await beeyieldService.syncQuickBooksLedger();
            if (platform === 'shopify') res = await beeyieldService.syncShopifyProducts();
            
            if (res?.success) {
                toast.success(`${platform} Sync Finalized`, { id: tid });
                fetchConfigs();
            } else {
                toast.error(`Sync failed for ${platform}`, { id: tid });
            }
        } catch (e) {
            toast.error("Sync cancelled", { id: tid });
        }
    };

    const handleConnectToggle = async (platform: 'quickbooks' | 'shopify') => {
        const isConnectedNode = isConnected(platform);
        const tid = toast.loading(isConnectedNode ? `Disconnecting ${platform}…` : `Opening ${platform} login…`);
        try {
            if (isConnectedNode) {
                const res = await beeyieldService.upsertIntegrationConfig({
                    platform,
                    is_active: false,
                    store_url: platform === 'shopify' ? shopUrl : undefined,
                });
                if (!res) throw new Error('Update failed');
                toast.success(`${platform} disconnected`, { id: tid });
                fetchConfigs();
                return;
            }

            // Start OAuth flow (redirect to provider).
            const STATE_KEY = 'beeyield_integration_oauth_state_v1';
            const saveState = (p: string, state: string) => {
                try {
                    const raw = sessionStorage.getItem(STATE_KEY);
                    const next = raw ? (JSON.parse(raw) as Record<string, string>) : {};
                    next[p] = state;
                    sessionStorage.setItem(STATE_KEY, JSON.stringify(next));
                } catch {
                    // ignore
                }
            };

            if (platform === 'quickbooks') {
                const { url, state } = await beeyieldService.getQuickBooksAuthorizeUrl();
                saveState(platform, state);
                toast.success('Redirecting to QuickBooks…', { id: tid });
                window.location.href = url;
                return;
            }

            // Shopify requires a shop domain
            const rawShop = (shopUrl || '').trim();
            if (!rawShop) {
                toast.error('Enter your Shopify store URL first.', { id: tid });
                return;
            }
            const shop = rawShop
                .replace(/^https?:\/\//, '')
                .replace(/\/.*$/, '')
                .trim();
            const { url, state } = await beeyieldService.getShopifyAuthorizeUrl(shop);
            saveState(platform, state);
            toast.success('Redirecting to Shopify…', { id: tid });
            window.location.href = url;
        } catch (e) {
            console.error(e);
            toast.error('Integration update failed', { id: tid });
        }
    };

    const isConnected = React.useCallback((p: string) => (configs || []).some(c => c.platform === p && c.is_active), [configs]);

    const renderEcosystem = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className={cn(glass.card, "p-6 lg:p-8 bg-white border-gray-200 relative overflow-hidden group")}>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <Badge className="bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20 px-3 py-1 rounded-lg font-bold text-[10px] tracking-wider">
                            Connected services
                        </Badge>
                        <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight leading-none">
                            Integrations
                        </h1>
                        <p className="text-gray-500 font-medium max-w-xl leading-relaxed text-sm">
                            Connect BeeYield with the tools you already use for bookkeeping and selling.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setActiveTab('quickbooks')} className={cn(glass.btnPrimary, "h-10 px-6 font-bold text-xs")}>QuickBooks settings</button>
                            <button onClick={() => setActiveTab('shopify')} className={cn(glass.btnSecondary, "h-10 px-6 font-bold text-xs")}>Shopify settings</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { name: 'QuickBooks', icon: Calculator, color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/10' },
                            { name: 'Shopify', icon: ShoppingBag, color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]/10' },
                            { name: 'eTIMS', icon: ShieldCheck, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' }
                        ].map((s, i) => (
                            <div key={i} className={cn(glass.card, "p-5 border-gray-100 bg-gray-50 space-y-3 hover:border-gray-200 transition-all cursor-pointer group")} onClick={() => setActiveTab(s.name.toLowerCase() as any)}>
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", s.bg)}>
                                    <s.icon className={cn("w-5 h-5", s.color)} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#1A1A1A]">{s.name}</h3>
                                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">Automatic sync</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { title: "Fast sync", desc: "Updates move quickly across connected services.", icon: Zap, theme: '#F4D03F' },
                    { title: "Secure connection", desc: "Encrypted connections for API requests.", icon: ShieldCheck, theme: '#1B9157' },
                    { title: "Sign-in support", desc: "Authentication and logs for key actions.", icon: Network, theme: '#3B82F6' }
                ].map((f, i) => (
                    <div key={i} className={cn(glass.card, "p-5 space-y-3 bg-white border-gray-100 group hover:border-gray-200 transition-all")}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform">
                            <f.icon className="w-5 h-5" style={{ color: f.theme }} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">{f.title}</h3>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{f.desc}</p>
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

        return (
            <div className="space-y-6 animate-in slide-in-from-right-1 duration-300">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                            <Icon className="w-6 h-6" style={{ color }} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight leading-none capitalize">{p} <span style={{ color }}>Industrial</span></h2>
                                <Badge className={cn("px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wider border-none", isConnectedNode ? "bg-[#1B9157]/10 text-[#1B9157]" : "bg-red-50 text-red-600")}>
                                    {isConnectedNode ? "Connected" : "Not connected"}
                                </Badge>
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 leading-none">Sync and settings</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleSyncNow(p)} disabled={!isConnectedNode} className={cn(glass.btnSecondary, "h-9 px-4 font-bold text-xs flex items-center gap-2", !isConnectedNode && "opacity-50 cursor-not-allowed")}>
                            Sync now <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                            className={cn(glass.btnSecondary, "h-9 px-4 font-bold text-xs bg-white text-[#1A1A1A]")}
                            onClick={() => handleConnectToggle(p as any)}
                        >
                            {isConnectedNode ? 'Disconnect' : 'Connect'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-4">
                        <div className={cn(glass.card, "p-0 overflow-hidden bg-white min-h-[300px]")}>
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Recent activity</h4>
                                    <p className="text-[10px] font-bold text-gray-500 tracking-wider mt-0.5">Sync history</p>
                                </div>
                                <Terminal className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 tracking-wider border-b border-gray-100">Timestamp</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 tracking-wider border-b border-gray-100">Event</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 tracking-wider border-b border-gray-100">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(auditLogs[p] || []).slice(0, 6).map((log, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-[11px] font-medium text-gray-600 tabular-nums">{new Date(log.created_at).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-[11px] font-bold text-[#1A1A1A]">{log.event_type}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", log.status === 'success' ? "bg-[#1B9157]/10 text-[#1B9157]" : "bg-red-50 text-red-600")}>{log.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(auditLogs[p] || []).length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-12 text-center text-[11px] font-medium text-gray-500">No sync events logged.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                        <div className={cn(glass.card, "p-4 space-y-4 bg-white")}>
                            <div>
                                <h4 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Target <span style={{ color }}>Config</span></h4>
                                <p className="text-[10px] font-bold text-gray-500 tracking-wider mt-1">Connection settings</p>
                            </div>
                            
                            {p === 'quickbooks' ? (
                                <>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 tracking-wider ml-1">Revenue account</Label>
                                        <Input value={qboIncomeAccount} onChange={(e) => setQboIncomeAccount(e.target.value)} className="h-9 text-xs font-medium bg-gray-50 border-gray-200 rounded-lg px-3" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 tracking-wider ml-1">Expense account</Label>
                                        <Input value={qboExpenseAccount} onChange={(e) => setQboExpenseAccount(e.target.value)} className="h-9 text-xs font-medium bg-gray-50 border-gray-200 rounded-lg px-3" />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-gray-500 tracking-wider ml-1">Shopify Store URL</Label>
                                    <Input value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} placeholder="name.myshopify.com" className="h-9 text-xs font-medium bg-gray-50 border-gray-200 rounded-lg px-3" />
                                </div>
                            )}

                            <button
                                onClick={async () => {
                                    const tid = toast.loading('Saving settings…');
                                    try {
                                        const platform = p;
                                        const payload: any = {
                                            platform,
                                            is_active: true,
                                            store_url: platform === 'shopify' ? shopUrl : undefined,
                                            config_json: platform === 'quickbooks'
                                                ? {
                                                    account_mapping: {
                                                        revenue: qboIncomeAccount,
                                                        operating_costs: qboExpenseAccount
                                                    }
                                                }
                                                : {
                                                    store_url: shopUrl
                                                }
                                        };
                                        await beeyieldService.upsertIntegrationConfig(payload);
                                        toast.success('Saved', { id: tid });
                                        fetchConfigs();
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

                        <div className={cn(glass.card, "p-4 space-y-3 bg-[#F9F7F2] border-[#F4D03F]/20")}>
                            <div className="flex items-center gap-2 text-[#1A1A1A]">
                                <LockIcon className="w-4 h-4 text-[#F4D03F]" />
                                <span className="text-xs font-bold tracking-tight">Secure</span>
                            </div>
                            <p className="text-[11px] font-medium text-gray-600 leading-relaxed border-l-2 border-[#F4D03F]/30 pl-3">
                                Credentials are encrypted and stored securely.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20 max-w-7xl mx-auto")}
        >
            <PageHeader
                icon={Network}
                label="Integrations"
                title={<>Connect your <span className="text-[#F4D03F]">tools</span></>}
                subtitle="Connect BeeYield with bookkeeping and e‑commerce tools."
                actions={
                    <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 gap-1 shrink-0 shadow-sm">
                        {[
                            { id: 'ecosystem', label: 'Connections', icon: LayoutGrid },
                            { id: 'quickbooks', label: 'QBO', icon: Calculator },
                            { id: 'shopify', label: 'Shopify', icon: ShoppingBag },
                            { id: 'etims', label: 'eTIMS', icon: ShieldCheck }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 h-8 rounded-md text-[10px] font-bold tracking-wider transition-all",
                                    activeTab === t.id
                                        ? "bg-white text-[#1A1A1A] shadow-sm border border-gray-200"
                                        : "text-gray-500 hover:text-[#1A1A1A]"
                                )}
                            >
                                <t.icon className={cn("w-3 h-3", activeTab === t.id ? "text-[#F4D03F]" : "text-gray-400")} />
                                {t.label}
                            </button>
                        ))}
                    </div>
                }
            />

            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3 opacity-50">
                        <RefreshCw className="w-6 h-6 text-[#1B9157] animate-spin" />
                        <span className="text-[10px] font-bold text-gray-500 tracking-wider">Loading…</span>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            {activeTab === 'ecosystem' && renderEcosystem()}
                            {activeTab === 'quickbooks' && renderPlatform('quickbooks')}
                            {activeTab === 'shopify' && renderPlatform('shopify')}
                            {activeTab === 'etims' && (
                                <div className="space-y-4">
                                    <div className={cn(glass.card, "p-5 bg-white border-gray-100")}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">KRA eTIMS</h2>
                                                <p className="text-[11px] font-medium text-gray-500 leading-relaxed max-w-2xl">
                                                    Enter your compliance details, then you’ll be redirected to eTIMS to sign in / sign up. After onboarding, you can issue and sync invoices from BeeYield Billing.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    try {
                                                        window.open('https://etims.kra.go.ke/', '_blank', 'noopener,noreferrer');
                                                    } catch {
                                                        // ignore (popup blocked)
                                                    }
                                                }}
                                                className={cn(glass.btnSecondary, "h-9 px-4 font-bold text-xs flex items-center gap-2 shrink-0")}
                                            >
                                                Open eTIMS <ExternalLink className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Reuse the existing compliance settings view, but pass configs down */}
                                    <div className="rounded-2xl overflow-hidden">
                                        <SettingsIntegrationsView initialConfigs={configs} />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <div className="pt-8 border-t border-gray-100 text-center space-y-3">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 mx-auto mb-2">
                    <HistoryIcon className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-xs font-bold text-[#1A1A1A] tracking-tight">Data & activity logs</h3>
                <p className="text-[11px] font-medium text-gray-500 max-w-xl mx-auto leading-relaxed">
                    We keep a record of sync activity so you can troubleshoot and audit changes.
                </p>
            </div>
        </motion.div>
    );
};

export default IntegrationsView;
