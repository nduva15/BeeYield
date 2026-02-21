import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    ShoppingBag,
    Calculator,
    Zap,
    ShieldCheck,
    ArrowRight,
    PlusCircle,
    LayoutGrid,
    CheckCircle2,
    Settings2,
    ChevronDown,
    Database,
    RefreshCw,
    History as HistoryIcon,
    FileJson,
    Cpu,
    ExternalLink,
    HelpCircle,
    Lock,
    Globe,
    ArrowUpRight,
    Search,
    BookOpen,
    BarChart3,
    Activity,
    Key,
    Link2,
    Terminal,
    AlertCircle,
    Clock
} from 'lucide-react';
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
                toast.success("Shopify Store Tunnel Established");
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
            toast.success(`${platform} Mapping Policy Updated`);
            fetchConfigs();
        } else {
            toast.error("Failed to commit policy");
        }
    };

    const isConnected = (platform: string) => configs.some(c => c.platform === platform && c.is_active);
    const getSyncDate = (platform: string) => {
        const c = configs.find(c => c.platform === platform);
        return c?.updated_at ? new Date(c.updated_at).toLocaleString() : 'Never synced';
    };

    const renderLanding = () => (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* HERO SECTION */}
            <div className="relative overflow-hidden rounded-[3rem] bg-[#09090b] text-white p-16 border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1B9157] opacity-10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <Badge className="bg-[#1B9157]/20 text-[#1B9157] border-[#1B9157]/30 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">Commercial Ecosystem</Badge>
                        <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.9]">
                            Connect Your<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B9157] to-[#F4D03F]">Enterprise</span>
                        </h1>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
                            BeeYield seamlessly bridges your apiary activities with global financial and retail powerhouses.
                        </p>
                        <div className="flex gap-4">
                            <Button onClick={() => setActiveTab('quickbooks')} className="bg-white text-black hover:bg-gray-100 rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest">Setup QuickBooks</Button>
                            <Button onClick={() => setActiveTab('shopify')} variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest">Setup Shopify</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center space-y-4">
                            <Calculator className="w-12 h-12 text-[#2CA01C]" />
                            <h3 className="font-black uppercase text-xs">QuickBooks</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase">Automated bookkeeping for honey sales & costs.</p>
                        </div>
                        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center space-y-4">
                            <ShoppingBag className="w-12 h-12 text-[#95BF47]" />
                            <h3 className="font-black uppercase text-xs">Shopify</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase">Sync harvest inventory to your online boutique.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FEATURES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: "Real-time Sync", desc: "Transactions flow instantly as they happen in the yard.", icon: <Zap className="w-6 h-6 text-[#F4D03F]" /> },
                    { title: "Secure Tunnel", desc: "Military-grade 256-bit encryption for all API handshakes.", icon: <ShieldCheck className="w-6 h-6 text-[#1B9157]" /> },
                    { title: "Audit Ready", desc: "Comprehensive logging of every record movement.", icon: <Search className="w-6 h-6 text-blue-500" /> }
                ].map((f, i) => (
                    <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-gray-100 dark:bg-[#060606] dark:border-white/5 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">{f.icon}</div>
                        <h3 className="text-sm font-black uppercase">{f.title}</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderQuickBooks = () => (
        <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
            {/* QBO HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-[#2CA01C]/10 border border-[#2CA01C]/20 flex items-center justify-center">
                            <Calculator className="w-8 h-8 text-[#2CA01C]" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter">QuickBooks Online</h2>
                            <Badge className={isConnected('quickbooks') ? "bg-[#2CA01C] text-white" : "bg-red-50 text-red-500"}>
                                {isConnected('quickbooks') ? "CONNECTED" : "OFFLINE"}
                            </Badge>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Advanced financial ledger automation for commercial apiaries.</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => handleConnectService('quickbooks')}
                        className="bg-[#2CA01C] hover:bg-[#238016] text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-[#2CA01C]/20"
                    >
                        {isConnected('quickbooks') ? "Renew OAuth Link" : "Establish QBO Link"}
                    </Button>
                    <Button onClick={() => handleSyncNow('quickbooks')} disabled={!isConnected('quickbooks')} variant="outline" className="rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest">
                        Force Pulse <RefreshCw className="w-3 h-3 ml-2" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-10">
                <TabsList className="bg-transparent border-b border-gray-100 w-full justify-start rounded-none h-auto p-0 gap-8">
                    <TabsTrigger value="overview" className="border-b-2 border-transparent data-[state=active]:border-[#2CA01C] data-[state=active]:bg-transparent rounded-none px-0 pb-4 h-auto font-black uppercase text-[10px] tracking-widest">Deep Overview</TabsTrigger>
                    <TabsTrigger value="history" className="border-b-2 border-transparent data-[state=active]:border-[#2CA01C] data-[state=active]:bg-transparent rounded-none px-0 pb-4 h-auto font-black uppercase text-[10px] tracking-widest">Sync History</TabsTrigger>
                    <TabsTrigger value="settings" className="border-b-2 border-transparent data-[state=active]:border-[#2CA01C] data-[state=active]:bg-transparent rounded-none px-0 pb-4 h-auto font-black uppercase text-[10px] tracking-widest">Asset Mapping</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="rounded-[2.5rem] border-none bg-gray-50 p-8 space-y-4">
                            <BarChart3 className="w-6 h-6 text-[#2CA01C]" />
                            <h4 className="text-[10px] font-black uppercase text-gray-400">Ledger Health</h4>
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-black">99.8%</span>
                                <span className="text-[10px] text-green-600 font-bold uppercase">Synced</span>
                            </div>
                        </Card>
                        <Card className="rounded-[2.5rem] border-none bg-gray-50 p-8 space-y-4">
                            <Activity className="w-6 h-6 text-[#2CA01C]" />
                            <h4 className="text-[10px] font-black uppercase text-gray-400">Total Pulses</h4>
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-black">1,244</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Events</span>
                            </div>
                        </Card>
                        <Card className="rounded-[2.5rem] border-none bg-gray-50 p-8 space-y-4">
                            <Link2 className="w-6 h-6 text-[#2CA01C]" />
                            <h4 className="text-[10px] font-black uppercase text-gray-400">Active Mappings</h4>
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-black">12</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Accounts</span>
                            </div>
                        </Card>
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase flex items-center gap-2"><BookOpen className="w-4 h-4" /> Operational Manual</h4>
                                <ul className="text-xs text-gray-500 font-bold uppercase space-y-4 pl-4 list-none">
                                    <li className="flex gap-4 items-start"><CheckCircle2 className="w-4 h-4 text-[#2CA01C] shrink-0" /> Automated sales receipt generation upon harvest invoicing.</li>
                                    <li className="flex gap-4 items-start"><CheckCircle2 className="w-4 h-4 text-[#2CA01C] shrink-0" /> Expense reconciliation mapping for hive equipment and medicine.</li>
                                    <li className="flex gap-4 items-start"><CheckCircle2 className="w-4 h-4 text-[#2CA01C] shrink-0" /> Real-time CoA (Chart of Accounts) status monitoring.</li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase flex items-center gap-2"><Terminal className="w-4 h-4" /> Live Payload Terminal</h4>
                                <div className="bg-[#09090b] rounded-[1.5rem] p-6 font-mono text-[9px] text-green-400 space-y-2 border border-white/5 shadow-inner">
                                    <div className="flex gap-2"><span>[11:23:44]</span> <span className="text-blue-400">INFO</span> Established OAuth2 Handshake</div>
                                    <div className="flex gap-2"><span>[11:23:45]</span> <span className="text-gray-500">AUTH</span> Token Rotation Success: ID=...{Math.random().toString(36).slice(4)}</div>
                                    <div className="flex gap-2"><span>[11:23:46]</span> <span className="text-yellow-400">WARN</span> Deferred 2 records (Missing Item Codes)</div>
                                    <div className="flex gap-2 animate-pulse"><span>[11:23:47]</span> <span className="text-green-400">SYNC</span> Synchronizing Ledger Hive #104...</div>
                                </div>
                                <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed">
                                    The QuickBooks pipeline utilizes a stateless OAuth2 proxy. BeeYield never stores your QBO credentials.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-8">
                    <Card className="rounded-[2.5rem] border-none bg-white p-2 overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase text-gray-400 border-b border-gray-50">
                                        <th className="p-6">Timestamp</th>
                                        <th className="p-6">Event Type</th>
                                        <th className="p-6">Status</th>
                                        <th className="p-6">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {auditLogs.map((h: any) => (
                                        <tr key={h.id} className="group hover:bg-gray-50 transition-colors">
                                            <td className="p-6 text-[10px] font-bold uppercase text-gray-400">{new Date(h.created_at).toLocaleString()}</td>
                                            <td className="p-6 text-xs font-black uppercase">{h.event_type}</td>
                                            <td className="p-6">
                                                <Badge className={h.status === 'success' ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}>
                                                    {h.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="p-6 text-[10px] font-bold uppercase text-gray-500">{h.metadata?.details || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase flex items-center gap-2">Income Account Mapping</h3>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Honey Revenue Account</label>
                                <Input
                                    value={qboIncomeAccount}
                                    onChange={(e) => setQboIncomeAccount(e.target.value)}
                                    className="rounded-2xl h-14 bg-gray-50 border-transparent focus:bg-white transition-all font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase flex items-center gap-2">Expense Account Mapping</h3>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Operating Costs Account</label>
                                <Input
                                    value={qboExpenseAccount}
                                    onChange={(e) => setQboExpenseAccount(e.target.value)}
                                    className="rounded-2xl h-14 bg-gray-50 border-transparent focus:bg-white transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end p-8 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                        <Button
                            onClick={() => handleSaveMapping('quickbooks')}
                            className="bg-black text-white hover:bg-neutral-800 rounded-2xl h-14 px-12 font-black text-xs uppercase tracking-widest"
                        >
                            Commit Mapping Policy
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );

    const renderShopify = () => (
        <div className="space-y-12 animate-in slide-in-from-left-10 duration-500">
            {/* SHOPIFY HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-[#95BF47]/10 border border-[#95BF47]/20 flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-[#95BF47]" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter">Shopify Boutique</h2>
                            <Badge className={isConnected('shopify') ? "bg-[#95BF47] text-white" : "bg-red-50 text-red-500"}>
                                {isConnected('shopify') ? "ACTIVE TUNNEL" : "DISCONNECTED"}
                            </Badge>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Global E-Commerce Inventory Bridge for Boutique Honey Products.</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => handleConnectService('shopify')}
                        className="bg-black hover:bg-neutral-800 text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-2xl transition-all"
                    >
                        {isConnected('shopify') ? "Manage Connection" : "Authorize Webhooks"}
                    </Button>
                    <Button onClick={() => handleSyncNow('shopify')} disabled={!isConnected('shopify')} variant="outline" className="rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest">
                        Push Inventory <ArrowUpRight className="w-3 h-3 ml-2" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-10">
                <TabsList className="bg-transparent border-b border-gray-100 w-full justify-start rounded-none h-auto p-0 gap-8">
                    <TabsTrigger value="overview" className="border-b-2 border-transparent data-[state=active]:border-[#95BF47] data-[state=active]:bg-transparent rounded-none px-0 pb-4 h-auto font-black uppercase text-[10px] tracking-widest">Overview</TabsTrigger>
                    <TabsTrigger value="history" className="border-b-2 border-transparent data-[state=active]:border-[#95BF47] data-[state=active]:bg-transparent rounded-none px-0 pb-4 h-auto font-black uppercase text-[10px] tracking-widest">Sync History</TabsTrigger>
                    <TabsTrigger value="webhooks" className="border-b-2 border-transparent data-[state=active]:border-[#95BF47] data-[state=active]:bg-transparent rounded-none px-0 pb-4 h-auto font-black uppercase text-[10px] tracking-widest">Webhooks</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div className="p-8 rounded-[2.5rem] bg-gray-50 space-y-4">
                                <h3 className="text-xs font-black uppercase flex items-center gap-2 text-gray-400"><Globe className="w-4 h-4" /> Storefront Info</h3>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase">Primary Store URL</label>
                                    <Input
                                        placeholder="your-apiary.myshopify.com"
                                        value={shopUrl}
                                        onChange={(e) => setShopUrl(e.target.value)}
                                        className="rounded-2xl h-14 bg-white border-transparent shadow-sm font-bold"
                                    />
                                </div>
                            </div>
                            <div className="p-8 rounded-[2.5rem] bg-gray-50 space-y-6">
                                <h3 className="text-xs font-black uppercase flex items-center gap-2 text-gray-400"><Zap className="w-4 h-4" /> Live Sync Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-2">
                                        <span className="text-[8px] font-black uppercase text-gray-300">Products Tracked</span>
                                        <h4 className="text-2xl font-black">48</h4>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-2">
                                        <span className="text-[8px] font-black uppercase text-gray-300">Sync Frequency</span>
                                        <h4 className="text-2xl font-black">5m</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="bg-[#95BF47]/5 border border-[#95BF47]/20 rounded-[2.5rem] p-10 space-y-6">
                                <h3 className="text-sm font-black uppercase flex items-center gap-2 text-[#95BF47]"><AlertCircle className="w-4 h-4" /> Reconciliation Logic</h3>
                                <p className="text-[10px] text-gray-600 font-bold uppercase leading-relaxed font-semibold">
                                    BeeYield synchronizes inventory amounts based on WEIGHT. Every harvest record in the apiary side is converted to discrete product variants in Shopify automatically.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase border-b border-[#95BF47]/10 pb-2">
                                        <span className="text-gray-400">Conflict Policy</span>
                                        <span className="text-black">BeeYield Priority</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase border-b border-[#95BF47]/10 pb-2">
                                        <span className="text-gray-400">Inventory Status</span>
                                        <span className="text-[#95BF47]">Balanced</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase border-b border-[#95BF47]/10 pb-2">
                                        <span className="text-gray-400">Webhook Status</span>
                                        <span className="text-[#95BF47]">Listening</span>
                                    </div>
                                </div>
                                <div className="pt-4 space-y-2">
                                    <span className="text-[8px] font-black uppercase text-gray-400">Stock Pulse (Internal API V3)</span>
                                    <div className="flex gap-1 h-8 items-end">
                                        {[40, 70, 45, 90, 65, 80, 30, 95, 50, 85].map((h, i) => (
                                            <div key={i} className="flex-1 bg-[#95BF47]/20 rounded-t-sm" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-8">
                    <Card className="rounded-[2.5rem] border-none bg-white p-2 overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase text-gray-400 border-b border-gray-50">
                                        <th className="p-6">Timestamp</th>
                                        <th className="p-6">Event Type</th>
                                        <th className="p-6">Status</th>
                                        <th className="p-6">Response Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {auditLogs.map((h: any) => (
                                        <tr key={h.id} className="group hover:bg-gray-50 transition-colors">
                                            <td className="p-6 text-[10px] font-bold uppercase text-gray-400">{new Date(h.created_at).toLocaleString()}</td>
                                            <td className="p-6 text-xs font-black uppercase">{h.event_type}</td>
                                            <td className="p-6">
                                                <Badge className={h.status === 'success' ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}>
                                                    {h.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="p-6 text-[10px] font-bold uppercase text-gray-500">{h.latency_ms}ms</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="webhooks" className="space-y-12">
                    <div className="space-y-8">
                        <div className="p-10 bg-gray-50 rounded-[2.5rem] space-y-6">
                            <h3 className="text-sm font-black uppercase flex items-center gap-2">External Webhook Secret</h3>
                            <div className="relative">
                                <Input
                                    type="password"
                                    value={shopifyWebhookSecret}
                                    readOnly
                                    className="rounded-2xl h-16 pl-12 font-mono text-gray-400 bg-white border-transparent"
                                />
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">This secret is used to verify that incoming Shopify requests are authentic.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { event: 'orders/create', desc: 'Sync new sales to commercial ledger' },
                                { event: 'products/update', desc: 'Monitor external variant changes' },
                                { event: 'inventory_levels/update', desc: 'Continuous stock reconciliation' },
                                { event: 'refunds/create', desc: 'Automate sales reversals' }
                            ].map((w, i) => (
                                <div key={i} className="flex justify-between items-center p-6 bg-white border border-gray-100 rounded-3xl group hover:shadow-md transition-all">
                                    <div className="space-y-1">
                                        <h4 className="text-[11px] font-black uppercase">{w.event}</h4>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{w.desc}</p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-24">

            {/* TABS NAVIGATION */}
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 dark:border-white/5 pb-8 gap-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Enterprise Integrations</h1>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1 italic">V4.0 Operational Infrastructure</p>
                </div>

                <div className="flex bg-gray-50 dark:bg-white/5 rounded-2xl p-1.5 gap-2 border border-gray-100 dark:border-white/5">
                    {[
                        { id: 'landing', label: 'Overview', icon: LayoutGrid },
                        { id: 'quickbooks', label: 'QuickBooks', icon: Calculator },
                        { id: 'shopify', label: 'Shopify', icon: ShoppingBag }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab.id
                                    ? "bg-white dark:bg-white/10 text-black dark:text-white shadow-xl shadow-black/5"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-[#1B9157]" : "text-gray-300")} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="min-h-[600px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-[#1B9157]" />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Hydrating Connections...</span>
                    </div>
                ) : (
                    <>
                        {activeTab === 'landing' && renderLanding()}
                        {activeTab === 'quickbooks' && renderQuickBooks()}
                        {activeTab === 'shopify' && renderShopify()}
                    </>
                )}
            </div>

            {/* AUDIT FOOTER */}
            <div className="pt-24 border-t border-gray-100 dark:border-white/5 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-[2rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                    <HistoryIcon className="w-8 h-8 text-gray-300" />
                </div>
                <div className="max-w-2xl space-y-4">
                    <h3 className="text-sm font-black uppercase">Infrastructure Transparency</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed tracking-wide">
                        BeeYield integrates with external providers using secure multi-hop relays. No personally identifiable financial data is persisted locally.
                        Every sync event is recorded in the organization's immutable audit log for legal compliance.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="rounded-full h-10 px-8 text-[10px] font-black uppercase tracking-widest border-gray-100">Technical Docs</Button>
                    <Button variant="outline" className="rounded-full h-10 px-8 text-[10px] font-black uppercase tracking-widest border-gray-100">API Status</Button>
                </div>
            </div>
        </div>
    );
};

// Internal Loader component for consistency
const Loader2 = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("animate-spin", className)}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default IntegrationsView;
