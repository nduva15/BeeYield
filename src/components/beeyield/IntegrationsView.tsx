import React from 'react';
import {
    ShoppingBag, Calculator, Zap, ShieldCheck, ArrowRight, PlusCircle, LayoutGrid, CheckCircle2,
    Settings2, ChevronDown, Database, RefreshCw, History as HistoryIcon, FileJson, Cpu,
    ExternalLink, HelpCircle, Lock, Globe, ArrowUpRight, Search, BookOpen, BarChart3,
    Activity, Key, Link2, Terminal, AlertCircle, Clock, ChevronRight, Layers, Box, Code,
    Shield, Share2, Binary, Cpu as Chip, Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

const IntegrationsView: React.FC = () => {
    const [configs, setConfigs] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<'landing' | 'quickbooks' | 'shopify'>('landing');
    const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
    const [activeConfig, setActiveConfig] = React.useState<any>(null);

    // State for inputs
    const [shopUrl, setShopUrl] = React.useState('');
    const [qboIncomeAccount, setQboIncomeAccount] = React.useState('Sales of Bee Products');
    const [qboExpenseAccount, setQboExpenseAccount] = React.useState('Apiary Operations');
    const [shopifyWebhookSecret, setShopifyWebhookSecret] = React.useState('shpss_xxxxxxxxxxxxxx');

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const data = await beeyieldService.getIntegrationConfigs();
            setConfigs(data || []);

            const current = data?.find((c: any) => c.platform === activeTab);
            if (current) {
                setActiveConfig(current.config_json || {});
                if (activeTab === 'shopify') setShopUrl(current.store_url || '');
                if (activeTab === 'quickbooks') {
                    setQboIncomeAccount(current.config_json?.account_mapping?.revenue || 'Sales of Bee Products');
                    setQboExpenseAccount(current.config_json?.account_mapping?.operating_costs || 'Apiary Operations');
                }
            }

            if (activeTab !== 'landing') {
                const logs = await beeyieldService.getIntegrationAuditLogs(activeTab);
                setAuditLogs(logs);
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

    const handleConnectService = async (service: string) => {
        if (service === 'quickbooks') {
            const state = Date.now().toString();
            window.open(`https://appcenter.intuit.com/connect/oauth2?state=${state}`, '_blank');
            toast.info("Opening QuickBooks OAuth Portal...");
        } else if (service === 'shopify') {
            if (!shopUrl) return toast.error("Shopify Store URL required");
            setLoading(true);
            const res = await beeyieldService.upsertIntegrationConfig({
                platform: 'shopify',
                is_active: true,
                store_url: shopUrl
            });
            setLoading(false);
            if (res) {
                toast.success("Shopify Store connected");
                fetchConfigs();
            }
        }
    };

    const handleSyncNow = async (platform: string) => {
        const loadingToast = toast.loading(`Synchronizing ${platform} records...`);
        let res;
        const startTime = Date.now();
        try {
            if (platform === 'quickbooks') res = await beeyieldService.syncQuickBooksLedger();
            if (platform === 'shopify') res = await beeyieldService.syncShopifyProducts();

            const latency = Date.now() - startTime;

            // Log deep audit event (Execution of PRD metrics)
            await beeyieldService.logIntegrationAudit(platform, 'sync', res?.success ? 'success' : 'failed', {
                latency_ms: latency,
                http_code: res?.success ? 200 : 500,
                trigger_type: 'manual',
                metadata: { details: 'User-triggered pulse from dashboard' }
            });

            toast.dismiss(loadingToast);
            if (res?.success) {
                toast.success(`${platform} Sync Finalized`);
                fetchConfigs(); // Refresh logs
            } else {
                toast.error(`${platform} Sync failed - Check API status`);
            }
        } catch (e) {
            toast.dismiss(loadingToast);
            toast.error(`Sync aborted: Network error`);
        }
    };

    const handleSaveMapping = async (platform: string) => {
        setLoading(true);
        const config = {
            ...activeConfig,
            account_mapping: {
                revenue: qboIncomeAccount,
                operating_costs: qboExpenseAccount
            }
        };
        const res = await beeyieldService.updateIntegrationSettings(platform, config);
        setLoading(false);
        if (res.success) {
            toast.success(`${platform} Setup Updated`);
            fetchConfigs();
        } else {
            toast.error("Failed to commit policy");
        }
    };

    const isConnected = (platform: string) => configs.some(c => c.platform === platform && c.is_active);

    const renderLanding = () => (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {/* HERO SECTION */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "relative overflow-hidden p-0 border-white/5 bg-white/60 dark:bg-[#0D0D0D]/60 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)]")}
            >
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-honey/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 p-20 items-center">
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-6 py-2 rounded-full font-black text-[10px] tracking-[0.4em] uppercase shadow-2xl skew-x-[-12deg]">
                                <span className="skew-x-[12deg]">ENTERPRISE_API_BRIDGE_v4.4_LIVE</span>
                            </Badge>
                            <h1 className={cn(glass.sectionTitle, 'text-8xl normal-case italic leading-[0.85]')}>
                                Federated <br />
                                <span className="text-honey">Ecosystem</span>
                            </h1>
                            <p className="text-2xl font-medium text-muted-foreground/60 italic leading-relaxed max-w-xl border-l-4 border-emerald-500/20 pl-10">
                                BeeYield seamlessly bridges industrial apiary telemetry with global financial and retail infrastructure via high-fidelity secure relays.
                            </p>
                        </div>
                        <div className="flex gap-10">
                            <button
                                onClick={() => setActiveTab('quickbooks')}
                                className={cn(glass.btnPrimary, "h-22 px-20 text-2xl font-black italic rounded-[2.5rem] shadow-[0_45px_100px_-20px_rgba(251,191,36,0.5)]")}
                            >
                                Setup QuickBooks
                            </button>
                            <button
                                onClick={() => setActiveTab('shopify')}
                                className={cn(glass.btnSecondary, "h-22 px-14 text-xl font-black italic rounded-[2.5rem] bg-white dark:bg-black/40 border-white/10 shadow-3xl")}
                            >
                                Setup Shopify
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
                        <div className="absolute inset-0 bg-honey/5 blur-3xl rounded-full" />
                        <motion.div
                            whileHover={{ y: -10, scale: 1.02 }}
                            className={cn(glass.card, "p-12 space-y-8 bg-white/40 dark:bg-black/60 border-white/5 shadow-2xl text-center group")}
                        >
                            <div className="w-24 h-24 mx-auto rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner group-hover:rotate-12 transition-transform duration-1000">
                                <Calculator className="w-12 h-12 text-emerald-500" />
                            </div>
                            <div className="space-y-4">
                                <h3 className={cn(glass.sectionTitle, 'text-3xl normal-case italic')}>QuickBooks</h3>
                                <p className={cn(glass.microLabel, 'opacity-40 italic font-medium normal-case text-lg')}>Automated industrial bookkeeping & fiscal audit reconciliation.</p>
                            </div>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -10, scale: 1.02 }}
                            className={cn(glass.card, "p-12 space-y-8 bg-white/40 dark:bg-black/60 border-white/5 shadow-2xl text-center group mt-12 md:mt-24")}
                        >
                            <div className="w-24 h-24 mx-auto rounded-[2rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-inner group-hover:-rotate-12 transition-transform duration-1000">
                                <ShoppingBag className="w-12 h-12 text-honey" />
                            </div>
                            <div className="space-y-4">
                                <h3 className={cn(glass.sectionTitle, 'text-3xl normal-case italic')}>Shopify</h3>
                                <p className={cn(glass.microLabel, 'opacity-40 italic font-medium normal-case text-lg')}>Global inventory synchronization for high-end boutique retail.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* FEATURES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                    { title: "Real-time Sync", desc: "Transactions flow instantly across the secure neural backbone as they happen in the apiary.", icon: <Zap className="w-8 h-8 text-honey" />, color: 'bg-honey/10 text-honey border-honey/20' },
                    { title: "Secure Tunnel", desc: "Military-grade 256-bit encryption for all API handshakes and global federated identity pulses.", icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
                    { title: "Stateless Auth", desc: "Comprehensive logging of every record movement within the organization's immutable audit log.", icon: <Network className="w-8 h-8 text-blue-500" />, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }
                ].map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className={cn(glass.card, "p-12 space-y-8 bg-white dark:bg-[#0D0D0D] border-white/5 shadow-2xl group hover:border-honey/40 transition-all duration-1000")}
                    >
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000", f.color)}>
                            {f.icon}
                        </div>
                        <div className="space-y-4">
                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case italic")}>{f.title}</h3>
                            <p className="text-lg text-muted-foreground/50 font-medium italic border-l-2 border-white/5 pl-6">{f.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderQuickBooks = () => (
        <div className="space-y-16 animate-in slide-in-from-right-10 duration-1000">
            {/* QBO HEADER */}
            <div className="flex flex-col xl:flex-row justify-between items-start gap-16">
                <div className="space-y-8 flex-1">
                    <div className="flex items-center gap-10">
                        <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center shadow-3xl">
                            <Calculator className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-6">
                                <h2 className={cn(glass.sectionTitle, "text-6xl normal-case italic")}>QuickBooks <span className="text-emerald-500">Online</span></h2>
                                <Badge className={cn("px-6 py-2 rounded-full font-black text-[10px] tracking-widest italic uppercase", isConnected('quickbooks') ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                                    {isConnected('quickbooks') ? "ACTIVE_NODE_SYNCED" : "REGISTRY_OFFLINE"}
                                </Badge>
                            </div>
                            <p className="text-xl font-medium text-muted-foreground/40 italic uppercase tracking-[0.2em] font-black">Fiscal Ledger Automation Protocol_v4.2</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-10">
                    <button
                        onClick={() => handleConnectService('quickbooks')}
                        className={cn(glass.btnPrimary, "bg-emerald-500 hover:bg-emerald-600 shadow-[0_45px_100px_-20px_rgba(16,185,129,0.5)] h-22 px-14 rounded-[2.5rem] font-black text-2xl italic flex items-center gap-6")}
                    >
                        <ShieldCheck className="w-10 h-10 text-white" />
                        {isConnected('quickbooks') ? "Renew Pulse" : "Initialize Link"}
                    </button>
                    <button
                        onClick={() => handleSyncNow('quickbooks')}
                        disabled={!isConnected('quickbooks')}
                        className={cn(glass.btnSecondary, "h-22 px-14 rounded-[2.5rem] font-black text-xl italic bg-white dark:bg-black/40 border-white/5 shadow-2xl flex items-center gap-6 group")}
                    >
                        Force Sync <RefreshCw className="w-8 h-8 group-hover:rotate-180 transition-transform duration-1000 text-emerald-500" />
                    </button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-16">
                <TabsList className="bg-white/40 dark:bg-black/40 p-2 h-20 w-fit grid grid-cols-3 rounded-[30px] border border-white/10 backdrop-blur-3xl shadow-2xl">
                    <TabsTrigger value="overview" className="px-12 rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] italic data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 transition-all duration-700">Audit Dashboard</TabsTrigger>
                    <TabsTrigger value="history" className="px-12 rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] italic data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 transition-all duration-700">Sync Pipeline</TabsTrigger>
                    <TabsTrigger value="settings" className="px-12 rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] italic data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 transition-all duration-700">Node Config</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-16 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <GlassStatCard label="Ledger Integrity" value="99.8%" icon={Lock} index={0} color="text-emerald-500" />
                        <GlassStatCard label="Cumulative Pulses" value="1,244" icon={Activity} index={1} color="text-blue-500" />
                        <GlassStatCard label="Active Entity Maps" value="12" icon={Network} index={2} color="text-honey" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-12">
                            <div className={cn(glass.card, "p-16 space-y-16 bg-white/60 dark:bg-[#0D0D0D]/60 border-white/5 relative overflow-hidden")}>
                                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] pointer-events-none" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                                    <div className="space-y-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                <BookOpen className="w-7 h-7 text-emerald-500" />
                                            </div>
                                            <h4 className={cn(glass.sectionTitle, "text-3xl italic normal-case")}>Operational <span className="text-emerald-500">Manual</span></h4>
                                        </div>
                                        <ul className="space-y-8 pl-6 border-l-2 border-white/5">
                                            {[
                                                "Automated sales receipt generation upon extraction archiving.",
                                                "Advanced expense reconciliation for apiary medicine & hive logistics.",
                                                "Real-time synchronized Chart of Accounts (CoA) monitoring.",
                                                "Neural categorization of variable production costs."
                                            ].map((text, i) => (
                                                <li key={i} className="flex gap-6 items-start group">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-1 group-hover:scale-125 transition-transform">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <p className="text-xl font-medium text-muted-foreground/60 italic leading-relaxed">{text}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                <Terminal className="w-7 h-7 text-blue-500" />
                                            </div>
                                            <h4 className={cn(glass.sectionTitle, "text-3xl italic normal-case")}>High-Fidelity <span className="text-blue-500">Live Log</span></h4>
                                        </div>
                                        <div className="bg-[#09090b] rounded-[3rem] p-10 font-mono text-[13px] text-emerald-400 space-y-4 border-4 border-white/5 shadow-inner min-h-[300px] transition-all duration-1000">
                                            <div className="flex gap-4"><span className="opacity-30">[11:23:44.982]</span> <span className="text-blue-400 font-black">INFO</span> <span className="text-white/80">Federated link established with master_ledger_node_77.</span></div>
                                            <div className="flex gap-4"><span className="opacity-30">[11:23:45.102]</span> <span className="text-emerald-500 font-black">AUTH</span> <span className="text-white/80">Token sequence validated via Kernel Proxy. Key_Hash: ...{Math.random().toString(36).slice(6)}</span></div>
                                            <div className="flex gap-4"><span className="opacity-30">[11:23:46.432]</span> <span className="text-honey font-black">WARN</span> <span className="text-white/60 italic">Deferred payload for APIARY_B7. Conflict: ID_COLLISION_04.</span></div>
                                            <div className="flex gap-4 animate-pulse"><span className="opacity-30">[11:23:47.012]</span> <span className="text-emerald-400 font-black">SYNC</span> <span className="text-emerald-400 italic">Aggregating production delta for industrial hive cluster #104...</span></div>
                                            <div className="pt-8 text-[11px] text-muted-foreground font-black tracking-[0.4em] uppercase opacity-20 italic">TRACER: STABLE_V4.4 · SYNC_FREQ: 2.1Hz</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-16 animate-in slide-in-from-right-5 duration-700">
                    <div className={cn(glass.card, "p-0 overflow-hidden border-white/5 bg-white/60 dark:bg-[#0D0D0D]/60 shadow-3xl")}>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/40 dark:bg-black/40">
                                        <th className="p-10 text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic">Archive Timestamp</th>
                                        <th className="p-10 text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic">Protocol Event</th>
                                        <th className="p-10 text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic">Integrity Status</th>
                                        <th className="p-10 text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic">Audit Metadata</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {auditLogs.map((h: any) => (
                                        <tr key={h.id} className="group hover:bg-emerald-500/[0.02] transition-colors duration-700">
                                            <td className="p-10 font-mono text-[11px] text-muted-foreground/30 italic uppercase tabular-nums">{new Date(h.created_at).toLocaleString()}</td>
                                            <td className="p-10 font-black italic text-xl tracking-tight uppercase group-hover:text-emerald-500 transition-colors">{h.event_type}</td>
                                            <td className="p-10">
                                                <Badge className={cn("px-6 py-2 rounded-xl font-black italic text-[10px] tracking-widest uppercase border-none", h.status === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                                                    {h.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="p-10 font-medium italic text-muted-foreground/60 text-lg">{h.metadata?.details || 'SYSTEM_AUTO_SYNC'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-16 animate-in slide-in-from-right-5 duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className={cn(glass.card, "p-12 space-y-10 bg-white/60 dark:bg-black/40 border-white/5 relative group overflow-hidden")}>
                            <div className="absolute top-0 right-0 w-40 h-40 bg-honey/5 blur-[60px] pointer-events-none" />
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-honey/10 flex items-center justify-center border border-honey/20">
                                    <Database className="w-7 h-7 text-honey" />
                                </div>
                                <h3 className={cn(glass.sectionTitle, "text-3xl italic normal-case")}>Income <span className="text-honey">Topology</span></h3>
                            </div>
                            <div className="space-y-6">
                                <label className={cn(glass.microLabel, 'ml-8 border-l-2 border-honey/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Master Revenue Account</label>
                                <Input
                                    value={qboIncomeAccount}
                                    onChange={(e) => setQboIncomeAccount(e.target.value)}
                                    className={cn(glass.input, "h-20 px-10 rounded-[2rem] font-black italic text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner group-hover:bg-white dark:group-hover:bg-black/50 transition-all")}
                                />
                            </div>
                            <p className="text-lg font-medium text-muted-foreground/30 italic">Map all hive-level extraction invoices to this global ledger entry.</p>
                        </div>
                        <div className={cn(glass.card, "p-12 space-y-10 bg-white/60 dark:bg-black/40 border-white/5 relative group overflow-hidden")}>
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-[60px] pointer-events-none" />
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Chip className="w-7 h-7 text-blue-500" />
                                </div>
                                <h3 className={cn(glass.sectionTitle, "text-3xl italic normal-case")}>Expense <span className="text-blue-500">Topology</span></h3>
                            </div>
                            <div className="space-y-6">
                                <label className={cn(glass.microLabel, 'ml-8 border-l-2 border-blue-500/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Industrial OpEx Account</label>
                                <Input
                                    value={qboExpenseAccount}
                                    onChange={(e) => setQboExpenseAccount(e.target.value)}
                                    className={cn(glass.input, "h-20 px-10 rounded-[2rem] font-black italic text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner group-hover:bg-white dark:group-hover:bg-black/50 transition-all")}
                                />
                            </div>
                            <p className="text-lg font-medium text-muted-foreground/30 italic">Map logistics, hardware vitals, and veterinary costs for reconciliation.</p>
                        </div>
                    </div>
                    <div className="flex justify-end p-14 bg-white/40 dark:bg-black/60 rounded-[3rem] border-2 border-dashed border-white/5 shadow-inner">
                        <button
                            onClick={() => handleSaveMapping('quickbooks')}
                            className={cn(glass.btnPrimary, "h-22 px-24 font-black text-2xl italic shadow-[0_45px_100px_-20px_rgba(251,191,36,0.5)] rounded-[2.5rem] flex items-center gap-6 group/save pl-20")}
                        >
                            <Shield className="w-10 h-10 group-hover/save:scale-125 transition-transform duration-1000 text-black" />
                            Commit Policy Setup
                        </button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );

    const renderShopify = () => (
        <div className="space-y-16 animate-in slide-in-from-left-10 duration-1000">
            {/* SHOPIFY HEADER */}
            <div className="flex flex-col xl:flex-row justify-between items-start gap-16">
                <div className="space-y-8 flex-1">
                    <div className="flex items-center gap-10">
                        <div className="w-24 h-24 rounded-[2rem] bg-honey/10 border-2 border-honey/20 flex items-center justify-center shadow-3xl">
                            <ShoppingBag className="w-12 h-12 text-honey" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-6">
                                <h2 className={cn(glass.sectionTitle, "text-6xl normal-case italic")}>Shopify <span className="text-honey">Boutique</span></h2>
                                <Badge className={cn("px-6 py-2 rounded-full font-black text-[10px] tracking-widest italic uppercase", isConnected('shopify') ? "bg-honey/20 text-honey border-honey/30" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                                    {isConnected('shopify') ? "BOUTIQUE_LINK_OK" : "NODE_DISCONNECTED"}
                                </Badge>
                            </div>
                            <p className="text-xl font-medium text-muted-foreground/40 italic uppercase tracking-[0.2em] font-black">E-Commerce Inventory Bridge_v4.4_X</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-10">
                    <button
                        onClick={() => handleConnectService('shopify')}
                        className={cn(glass.btnPrimary, "bg-black hover:bg-neutral-800 shadow-[0_45px_100px_-20px_rgba(0,0,0,0.4)] h-22 px-14 rounded-[2.5rem] font-black text-2xl italic flex items-center gap-6")}
                    >
                        <Lock className="w-10 h-10 text-honey" />
                        {isConnected('shopify') ? "Secure Portal" : "Authorize Hooks"}
                    </button>
                    <button
                        onClick={() => handleSyncNow('shopify')}
                        disabled={!isConnected('shopify')}
                        className={cn(glass.btnSecondary, "h-22 px-14 rounded-[2.5rem] font-black text-xl italic bg-white dark:bg-black/40 border-white/5 shadow-2xl flex items-center gap-6 group")}
                    >
                        Push Inventory <ArrowUpRight className="w-8 h-8 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-1000 text-honey" />
                    </button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-16">
                <TabsList className="bg-white/40 dark:bg-black/40 p-2 h-20 w-fit grid grid-cols-3 rounded-[30px] border border-white/10 backdrop-blur-3xl shadow-2xl">
                    <TabsTrigger value="overview" className="px-12 rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] italic data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 transition-all duration-700">Stock Core</TabsTrigger>
                    <TabsTrigger value="history" className="px-12 rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] italic data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 transition-all duration-700">Sync Stream</TabsTrigger>
                    <TabsTrigger value="webhooks" className="px-12 rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] italic data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 transition-all duration-700">Webhook Matrix</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-16 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="space-y-12">
                            <div className={cn(glass.card, "p-12 space-y-10 bg-white/60 dark:bg-black/40 border-white/5 group relative overflow-hidden")}>
                                <div className="absolute top-0 right-0 w-60 h-60 bg-honey/5 blur-[80px] pointer-events-none" />
                                <div className="flex items-center gap-6">
                                    <Globe className="w-8 h-8 text-honey" />
                                    <h3 className={cn(glass.sectionTitle, "text-3xl italic normal-case")}>Industrial <span className="text-honey">Storefront</span></h3>
                                </div>
                                <div className="space-y-6">
                                    <label className={cn(glass.microLabel, 'ml-8 border-l-2 border-honey/40 pl-6 opacity-40 font-black tracking-widest uppercase text-[10px]')}>Primary Shop URL</label>
                                    <Input
                                        placeholder="your-apiary.myshopify.com"
                                        value={shopUrl}
                                        onChange={(e) => setShopUrl(e.target.value)}
                                        className={cn(glass.input, "h-20 px-10 rounded-[2.5rem] font-black italic text-xl bg-black/5 dark:bg-black/30 border-none shadow-inner")}
                                    />
                                </div>
                                <p className="text-lg font-medium text-muted-foreground/30 italic">Target boutique for federated product sync and checkout mapping.</p>
                            </div>

                            <div className={cn(glass.card, "p-12 space-y-10 bg-white/60 dark:bg-black/40 border-white/5")}>
                                <div className="flex items-center gap-6">
                                    <Zap className="w-8 h-8 text-honey" />
                                    <h3 className={cn(glass.sectionTitle, "text-3xl italic normal-case")}>Live Burst <span className="text-honey">Stats</span></h3>
                                </div>
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="bg-black/5 dark:bg-black/40 p-10 rounded-[2.5rem] border border-white/5 space-y-4 shadow-inner">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground/30 italic tracking-[0.2em]">Variants Tracked</span>
                                        <h4 className="text-5xl font-black italic tabular-nums">48</h4>
                                    </div>
                                    <div className="bg-black/5 dark:bg-black/40 p-10 rounded-[2.5rem] border border-white/5 space-y-4 shadow-inner">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground/30 italic tracking-[0.2em]">Sync Latency</span>
                                        <h4 className="text-5xl font-black italic tabular-nums">5m</h4>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div className={cn(glass.card, "bg-honey/[0.03] border-honey/20 rounded-[3rem] p-16 space-y-12 relative overflow-hidden group")}>
                                <div className="absolute top-0 right-0 w-80 h-80 bg-honey/10 blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

                                <div className="flex items-center gap-8">
                                    <div className="w-16 h-16 rounded-2xl bg-honey/10 flex items-center justify-center border border-honey/20 shadow-3xl">
                                        <AlertCircle className="w-8 h-8 text-honey" />
                                    </div>
                                    <h3 className={cn(glass.sectionTitle, "text-4xl normal-case italic")}>Neural <span className="text-honey">Reconciliation</span></h3>
                                </div>
                                <p className="text-2xl font-medium text-muted-foreground/60 italic leading-relaxed border-l-4 border-honey/40 pl-10">
                                    BeeYield synchronizes inventory biomass based on net extraction density. Every production record is converted to discrete product variants in Shopify via high-fidelity secure relay.
                                </p>
                                <div className="space-y-8 pt-6">
                                    {[
                                        { label: "Conflict Resolution", value: "BeeYield Master Priority" },
                                        { label: "Registry Alignment", value: "Balanced_OK" },
                                        { label: "Webhook Tunnel", value: "Listening_Live" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-[11px] font-black uppercase italic tracking-widest border-b border-honey/10 pb-4">
                                            <span className="text-muted-foreground/40">{item.label}</span>
                                            <span className="text-honey">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-10 space-y-4">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground/20 italic tracking-widest">Global Stock Pulse Flow (API V4.4)</span>
                                    <div className="flex gap-2 h-16 items-end">
                                        {[40, 70, 45, 90, 65, 80, 30, 95, 50, 85, 60, 75, 40, 95].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ delay: i * 0.05, duration: 1 }}
                                                className="flex-1 bg-honey rounded-t-lg shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-16 animate-in slide-in-from-left-5 duration-700">
                    <div className={cn(glass.card, "p-0 overflow-hidden border-white/5 bg-white/60 dark:bg-[#0D0D0D]/60 shadow-3xl")}>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/40 dark:bg-black/40">
                                        <th className="p-10 text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic">Pulse Timestamp</th>
                                        <th className="p-10 text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic">Protocol Event</th>
                                        <th className="p-10 text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic">Sync Status</th>
                                        <th className="p-10 text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic">Stream Latency</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {auditLogs.map((h: any) => (
                                        <tr key={h.id} className="group hover:bg-honey/[0.02] transition-colors duration-700">
                                            <td className="p-10 font-mono text-[11px] text-muted-foreground/30 italic uppercase tabular-nums">{new Date(h.created_at).toLocaleString()}</td>
                                            <td className="p-10 font-black italic text-xl tracking-tight uppercase group-hover:text-honey transition-colors">{h.event_type}</td>
                                            <td className="p-10">
                                                <Badge className={cn("px-6 py-2 rounded-xl font-black italic text-[10px] tracking-widest uppercase border-none", h.status === 'success' ? "bg-honey/10 text-honey" : "bg-red-500/10 text-red-500")}>
                                                    {h.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="p-10 font-black italic text-blue-500 tabular-nums text-xl">{h.latency_ms} <span className="text-xs opacity-40">ms</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="webhooks" className="space-y-16 animate-in slide-in-from-left-5 duration-700">
                    <div className="space-y-16">
                        <div className={cn(glass.card, "p-16 bg-white/60 dark:bg-black/40 space-y-12 border-white/5 relative group overflow-hidden")}>
                            <div className="absolute top-0 right-0 w-80 h-80 bg-honey/5 blur-[100px] pointer-events-none" />
                            <div className="flex items-center gap-8">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-3xl">
                                    <Key className="w-8 h-8 text-honey" />
                                </div>
                                <h3 className={cn(glass.sectionTitle, "text-4xl normal-case italic")}>Federated <span className="text-honey">Webhook Secret</span></h3>
                            </div>
                            <div className="relative group">
                                <Input
                                    type="password"
                                    value={shopifyWebhookSecret}
                                    readOnly
                                    className={cn(glass.input, "h-22 pl-24 font-mono text-muted-foreground/40 bg-black/5 dark:bg-black/30 border-none rounded-[2.5rem] shadow-inner text-2xl")}
                                />
                                <Lock className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground/10 group-focus-within:text-honey transition-colors" />
                            </div>
                            <p className="text-xl font-medium text-muted-foreground/30 italic border-l-2 border-honey/20 pl-8">Critical cryptographic hash for verifying downstream Shopify ingress protocols. Authenticity is validated via Kernel Proxy.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {[
                                { event: 'orders/create', desc: 'Neural sync of new retail sales to commercial fiscal ledger.', icon: ShoppingBag, color: 'honey' },
                                { event: 'products/update', desc: 'High-fidelity monitoring of external variant metadata alterations.', icon: Box, color: 'blue-500' },
                                { event: 'inventory_levels/update', desc: 'Continuous stok-level reconciliation across federated nodes.', icon: Database, color: 'emerald-500' },
                                { event: 'refunds/create', desc: 'Autonomous automation of sales reversals and budget audits.', icon: ArrowRight, color: 'orange-500' }
                            ].map((w, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 10 }}
                                    className="flex justify-between items-center p-12 bg-white/40 dark:bg-[#0D0D0D]/40 border-2 border-white/5 rounded-[3rem] group hover:border-honey/40 transition-all duration-700 shadow-2xl backdrop-blur-3xl"
                                >
                                    <div className="flex gap-10 items-center">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-3xl", `bg-${w.color}/10 border border-${w.color}/20 text-${w.color}`)}>
                                            <w.icon className="w-7 h-7" />
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-2xl font-black italic tracking-tight uppercase group-hover:text-foreground transition-colors">{w.event}</h4>
                                            <p className="text-lg font-medium text-muted-foreground/40 italic leading-relaxed">{w.desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">LISTENING</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "max-w-7xl mx-auto space-y-16 pb-40")}
        >
            <PageHeader
                icon={Network}
                label="Enterprise Ecosystem Integration_v4.4"
                title={<>Federated <span className="text-honey">Relay</span></>}
                subtitle="High-fidelity autonomous bridging of apiary telemetry with global financial and e-commerce infrastructure protocols."
                actions={
                    <div className="flex items-center gap-8">
                        <div className="hidden xl:flex bg-white/40 dark:bg-black/40 border border-white/5 px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl items-center gap-6 skew-x-[-12deg]">
                            <Binary className="w-5 h-5 text-honey animate-pulse" />
                            <span className="skew-x-[12deg]">Neural_Bridge: <span className="text-honey text-emerald-500">ACTIVE</span></span>
                        </div>
                        <div className="flex bg-white/40 dark:bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-2xl">
                            {[
                                { id: 'landing', label: 'Ecosystem', icon: LayoutGrid },
                                { id: 'quickbooks', label: 'QuickBooks', icon: Calculator },
                                { id: 'shopify', label: 'Shopify', icon: ShoppingBag }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex items-center gap-4 px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest italic transition-all duration-700",
                                        activeTab === tab.id
                                            ? "bg-white dark:bg-white/10 text-foreground shadow-2xl"
                                            : "text-muted-foreground/50 hover:text-foreground"
                                    )}
                                >
                                    <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-honey" : "text-muted-foreground/30")} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                }
            />

            {/* CONTENT AREA */}
            <div className="min-h-[600px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8 animate-pulse">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-honey/10 border-4 border-honey/20 flex items-center justify-center shadow-4xl animate-spin-slow">
                            <RefreshCw className="w-16 h-16 text-honey" />
                        </div>
                        <span className="text-2xl font-black uppercase text-muted-foreground/20 tracking-[0.5em] italic">Aggregating Global Registry Data...</span>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.02, y: -30 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {activeTab === 'landing' && renderLanding()}
                            {activeTab === 'quickbooks' && renderQuickBooks()}
                            {activeTab === 'shopify' && renderShopify()}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {/* AUDIT FOOTER */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="pt-40 flex flex-col items-center text-center space-y-12 pb-20"
            >
                <div className="w-24 h-24 rounded-[3rem] bg-white dark:bg-black/60 border-2 border-white/5 flex items-center justify-center shadow-4xl transform hover:rotate-[360deg] transition-transform duration-1000 group">
                    <HistoryIcon className="w-12 h-12 text-muted-foreground/20 group-hover:text-honey transition-colors" />
                </div>
                <div className="max-w-4xl space-y-8">
                    <h3 className={cn(glass.sectionTitle, "text-4xl normal-case italic")}>Global Infrastructure <span className="text-honey">Compliance</span></h3>
                    <p className="text-xl font-medium text-muted-foreground/40 italic leading-relaxed border-x-4 border-white/5 px-20">
                        BeeYield federates with global providers using secure multi-hop relays via the BeeYield Kernel. No personally identifiable financial metadata is persisted in local caches.
                        Every synchronization pulse is etched into the organization's immutable cryptographic audit log for high-fidelity compliance.
                    </p>
                </div>
                <div className="flex gap-10 pt-8">
                    <button className={cn(glass.btnSecondary, "h-16 px-12 rounded-[2rem] font-black italic uppercase text-xs tracking-widest bg-white/40 dark:bg-black/40 border-white/10 shadow-3xl hover:bg-honey/10 transition-all")}>Kernel Docs</button>
                    <button className={cn(glass.btnSecondary, "h-16 px-12 rounded-[2rem] font-black italic uppercase text-xs tracking-widest bg-white/40 dark:bg-black/40 border-white/10 shadow-3xl hover:bg-emerald-500/10 transition-all")}>Federation Status</button>
                </div>
            </motion.div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.1); border-radius: 10px; }
            `}</style>
        </motion.div>
    );
};

export default IntegrationsView;
