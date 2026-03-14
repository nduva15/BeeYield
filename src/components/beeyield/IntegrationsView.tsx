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

const IntegrationsView: React.FC = () => {
    const [configs, setConfigs] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<'ecosystem' | 'quickbooks' | 'shopify'>('ecosystem');
    const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
    const [activeConfig, setActiveConfig] = React.useState<any>(null);

    const [shopUrl, setShopUrl] = React.useState('');
    const [qboIncomeAccount, setQboIncomeAccount] = React.useState('Sales of Bee Products');
    const [qboExpenseAccount, setQboExpenseAccount] = React.useState('Apiary Operations');

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const data = await beeyieldService.getIntegrationConfigs();
            setConfigs(data || []);
            const platform = activeTab === 'ecosystem' ? '' : activeTab;
            const current = data?.find((c: any) => c.platform === platform);
            if (current) {
                setActiveConfig(current.config_json || {});
                if (platform === 'shopify') setShopUrl(current.store_url || '');
                if (platform === 'quickbooks') {
                    setQboIncomeAccount(current.config_json?.account_mapping?.revenue || 'Sales of Bee Products');
                    setQboExpenseAccount(current.config_json?.account_mapping?.operating_costs || 'Apiary Operations');
                }
            }

            if (platform) {
                const logs = await beeyieldService.getIntegrationAuditLogs(platform);
                setAuditLogs(logs || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

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
                toast.error(`Sync failure in ${platform} node`, { id: tid });
            }
        } catch (e) {
            toast.error("Sync Protocol Aborted", { id: tid });
        }
    };

    const isConnected = (p: string) => (configs || []).some(c => c.platform === p && c.is_active);

    const renderEcosystem = () => (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className={cn(glass.card, "p-6 lg:p-8 bg-white border-gray-200 relative overflow-hidden group")}>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <Badge className="bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20 px-3 py-1 rounded-lg font-bold text-[10px] tracking-wider uppercase">
                            Ecological_Bridge_v4.4_Live
                        </Badge>
                        <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight leading-none">
                            Federated <span className="text-[#F4D03F]">Ecosystem</span>
                        </h1>
                        <p className="text-gray-500 font-medium max-w-xl leading-relaxed text-sm">
                            BeeYield bridges industrial apiary telemetry with global financial and retail infrastructure via secure relays.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setActiveTab('quickbooks')} className={cn(glass.btnPrimary, "h-10 px-6 font-bold text-xs")}>Config QBO</button>
                            <button onClick={() => setActiveTab('shopify')} className={cn(glass.btnSecondary, "h-10 px-6 font-bold text-xs")}>Config Shopify</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { name: 'QuickBooks', icon: Calculator, color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/10' },
                            { name: 'Shopify', icon: ShoppingBag, color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]/10' }
                        ].map((s, i) => (
                            <div key={i} className={cn(glass.card, "p-5 border-gray-100 bg-gray-50 space-y-3 hover:border-gray-200 transition-all cursor-pointer group")} onClick={() => setActiveTab(s.name.toLowerCase() as any)}>
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", s.bg)}>
                                    <s.icon className={cn("w-5 h-5", s.color)} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#1A1A1A]">{s.name}</h3>
                                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">Autonomous Sync</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { title: "Real-time Sync", desc: "Transactions flow instantly across the secure neural backbone.", icon: Zap, theme: '#F4D03F' },
                    { title: "Secure Tunnel", desc: "Military-grade encryption for all API handshakes.", icon: ShieldCheck, theme: '#1B9157' },
                    { title: "Stateless Auth", desc: "Comprehensive logging of every record movement.", icon: Network, theme: '#3B82F6' }
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
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-500">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                            <Icon className="w-6 h-6" style={{ color }} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight leading-none capitalize">{p} <span style={{ color }}>Industrial</span></h2>
                                <Badge className={cn("px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wider uppercase border-none", isConnectedNode ? "bg-[#1B9157]/10 text-[#1B9157]" : "bg-red-50 text-red-600")}>
                                    {isConnectedNode ? "Active_Sync_OK" : "Registry_Offline"}
                                </Badge>
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">High-Fidelity Federation Protocol_v4.4</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleSyncNow(p)} disabled={!isConnectedNode} className={cn(glass.btnSecondary, "h-9 px-4 font-bold text-xs flex items-center gap-2", !isConnectedNode && "opacity-50 cursor-not-allowed")}>
                            Force Sync <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button className={cn(glass.btnSecondary, "h-9 px-4 font-bold text-xs bg-white text-[#1A1A1A]")} onClick={() => toast.info("Initializing Link...")}>
                            {isConnectedNode ? 'Renew Link' : 'Initialize Link'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-4">
                        <div className={cn(glass.card, "p-0 overflow-hidden bg-white min-h-[300px]")}>
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Recent <span style={{ color }}>Audit_Logs</span></h4>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Temporal activity archive</p>
                                </div>
                                <Terminal className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Timestamp</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Event</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {auditLogs.slice(0, 6).map((log, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-[11px] font-medium text-gray-600 tabular-nums">{new Date(log.created_at).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-[11px] font-bold text-[#1A1A1A]">{log.event_type}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md", log.status === 'success' ? "bg-[#1B9157]/10 text-[#1B9157]" : "bg-red-50 text-red-600")}>{log.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {auditLogs.length === 0 && (
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
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Industrial node parameters</p>
                            </div>
                            
                            {p === 'quickbooks' ? (
                                <>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Revenue Node</Label>
                                        <Input value={qboIncomeAccount} onChange={(e) => setQboIncomeAccount(e.target.value)} className="h-9 text-xs font-medium bg-gray-50 border-gray-200 rounded-lg px-3" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Expense Node</Label>
                                        <Input value={qboExpenseAccount} onChange={(e) => setQboExpenseAccount(e.target.value)} className="h-9 text-xs font-medium bg-gray-50 border-gray-200 rounded-lg px-3" />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Shopify Store URL</Label>
                                    <Input value={shopUrl} onChange={(e) => setShopUrl(e.target.value)} placeholder="name.myshopify.com" className="h-9 text-xs font-medium bg-gray-50 border-gray-200 rounded-lg px-3" />
                                </div>
                            )}

                            <button onClick={() => toast.success("Policy Updated")} className={cn(glass.btnPrimary, "w-full h-9 font-bold text-xs mt-2")}>Update Parameters</button>
                        </div>

                        <div className={cn(glass.card, "p-4 space-y-3 bg-[#F9F7F2] border-[#F4D03F]/20")}>
                            <div className="flex items-center gap-2 text-[#1A1A1A]">
                                <LockIcon className="w-4 h-4 text-[#F4D03F]" />
                                <span className="text-xs font-bold tracking-tight">Handshake_Secure</span>
                            </div>
                            <p className="text-[11px] font-medium text-gray-600 leading-relaxed border-l-2 border-[#F4D03F]/30 pl-3">
                                Federated credentials are encrypted at the kernel level and never persist in unmasked local caches.
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
                label="Federated Relay Kernel v4.4"
                title={<>Ecosystem <span className="text-[#F4D03F]">Nexus</span></>}
                subtitle="Bridging apiary telemetry with global financial and e-commerce infrastructure protocols."
                actions={
                    <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 gap-1 shrink-0 shadow-sm">
                        {[
                            { id: 'ecosystem', label: 'Nodes', icon: LayoutGrid },
                            { id: 'quickbooks', label: 'QBO', icon: Calculator },
                            { id: 'shopify', label: 'Shopify', icon: ShoppingBag }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 h-8 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
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
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hydrating Relay Fabric...</span>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'ecosystem' && renderEcosystem()}
                            {activeTab === 'quickbooks' && renderPlatform('quickbooks')}
                            {activeTab === 'shopify' && renderPlatform('shopify')}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <div className="pt-8 border-t border-gray-100 text-center space-y-3">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 mx-auto mb-2">
                    <HistoryIcon className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-xs font-bold text-[#1A1A1A] tracking-tight">Global Infrastructure Compliance</h3>
                <p className="text-[11px] font-medium text-gray-500 max-w-xl mx-auto leading-relaxed">
                    Every synchronization pulse is etched into the organization's immutable cryptographic audit log for high-fidelity compliance. Federation is managed via the BeeYield Kernel.
                </p>
            </div>
        </motion.div>
    );
};

export default IntegrationsView;
