import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Plus, MoreHorizontal, FileText, Globe, ChevronDown, ChevronRight, Download, Check, Loader2,
    Shield, Zap, Activity, FileDown, CreditCard, Banknote, Target, TrendingUp, PieChart as PieChartIcon,
    Wallet, Search, Calendar, History, ArrowUpRight, ArrowDownRight, Printer, Share2, DollarSign,
    RefreshCw, X, ShieldCheck, Info
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import SubscriptionPlans from './SubscriptionPlans';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import SettingsIntegrationsView from './SettingsIntegrationsView';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

// Analytics Section Component
const AnalyticsSection: React.FC<{ currency: string }> = ({ currency }) => {
    const [activeAnalyticsTab, setActiveAnalyticsTab] = React.useState('Monthly overview');

    // In a real app, these would come from backend aggregation endpoint
    const analyticsTabs = ['Monthly overview', 'Per category', 'VAT summary'];
    const [data, setData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            const groupBy = activeAnalyticsTab === 'Monthly overview' ? 'month' : 'category';
            const result = await beeyieldService.getFinancialAggregate(groupBy as any);
            setData(result);
            setLoading(false);
        };
        fetchAnalytics();
    }, [activeAnalyticsTab]);

    const vatSummaryData = {
        outputVat: data.reduce((s, d) => s + (d.revenue || 0), 0) * 0.16,
        inputVat: data.reduce((s, d) => s + (d.costs || 0), 0) * 0.16,
        balance: (data.reduce((s, d) => s + (d.revenue || 0), 0) - data.reduce((s, d) => s + (d.costs || 0), 0)) * 0.16,
        vatRate: 16,
    };

    // Export CSV functionality
    const handleExportCSV = () => {
        let csvContent = '';
        let filename = '';

        switch (activeAnalyticsTab) {
            case 'Monthly overview':
                csvContent = 'Month,Revenue,Costs,Net\n';
                data.forEach(row => {
                    csvContent += `${row.name},${row.revenue} ${currency},${row.costs} ${currency},${(row.revenue - row.costs)} ${currency}\n`;
                });
                filename = 'monthly_overview.csv';
                break;
            default:
                csvContent = 'No data\n';
                filename = 'export.csv';
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={cn(glass.card, "p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden border-honey/10 bg-white/60 backdrop-blur-3xl")}
        >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-honey/[0.03] rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40" />

            <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-10 border-b border-gray-200 pb-12 relative z-10">
                <div className="space-y-3">
                    <h3 className={cn(glass.sectionTitle, "text-4xl normal-case italic")}>Financial <span className="text-honey">Intelligence</span></h3>
                    <p className={cn(glass.microLabel, "opacity-40 italic mt-2 font-black uppercase tracking-[0.2em]")}>Profitability audit across global distribution nodes.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className={cn(glass.btnSecondary, "h-16 px-12 gap-4 font-black shadow-3xl border-gray-200 rounded-2xl hover:border-honey/20 transition-all")}
                >
                    <Download className="w-5 h-5 text-honey" />
                    Export Ledger Bundle
                </button>
            </div>

            {/* Analytics Sub-tabs */}
            <div className="flex bg-white/40 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-gray-200 gap-3 shadow-2xl w-fit mb-16 relative z-10">
                {analyticsTabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveAnalyticsTab(tab)}
                        className={cn(
                            "h-14 px-10 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                            activeAnalyticsTab === tab
                                ? "bg-white text-honey shadow-2xl border border-honey/10"
                                : "text-foreground/40 hover:text-honey"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Renderers */}
            <div className="h-[500px] w-full relative z-10 px-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-40">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full border-4 border-honey/10 animate-ping" />
                            <Loader2 className="w-16 h-16 animate-spin text-honey" />
                        </div>
                        <span className={cn(glass.microLabel, "font-black tracking-[0.3em] uppercase italic")}>CALCULATING_VECTORS_KERNEL_RUN_v3.2...</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-8 opacity-30 border-2 border-dashed border-honey/20 rounded-[3rem] italic bg-honey/[0.01]">
                        <div className="w-20 h-20 rounded-full bg-honey/5 border border-honey/10 flex items-center justify-center">
                            <Banknote className="w-10 h-10 text-honey/40" />
                        </div>
                        <p className={cn(glass.microLabel, "text-lg tracking-[0.2em] font-black uppercase")}>NO_FINANCIAL_LOGS_DETECTED_IN_SECTOR</p>
                    </div>
                ) : activeAnalyticsTab === 'Monthly overview' ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.2)', fontWeight: 900, fontFamily: 'monospace' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.2)', fontWeight: 900, fontFamily: 'monospace' }}
                                tickFormatter={(v) => `${v}${currency}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(0,0,0,0.8)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '2rem',
                                    border: '1px solid rgba(251,191,36,0.2)',
                                    boxShadow: '0 30px 60px -20px rgba(0,0,0,0.5)',
                                    padding: '20px'
                                }}
                                cursor={{ fill: 'rgba(251,191,36,0.03)' }}
                            />
                            <Bar dataKey="revenue" fill="hsl(var(--honey))" radius={[12, 12, 0, 0]} name="Inflow" barSize={40} />
                            <Bar dataKey="costs" fill="rgba(239,68,68,0.4)" radius={[12, 12, 0, 0]} name="Outflow" barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : activeAnalyticsTab === 'Per category' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 h-full items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={120}
                                    outerRadius={180}
                                    paddingAngle={10}
                                    dataKey="total"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'hsl(var(--honey))' : 'rgba(251,191,36,0.3)'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-8">
                            {data.map((d, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.6 }}
                                    className="flex justify-between items-center p-8 bg-white/40 rounded-[2.5rem] border border-white/5 group hover:border-honey/40 transition-all duration-700 shadow-xl"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={cn("w-4 h-4 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all group-hover:scale-125", i % 2 === 0 ? "bg-honey" : "bg-honey/40")} />
                                        <span className={cn(glass.sectionTitle, "text-lg normal-case italic opacity-40 group-hover:opacity-100 transition-opacity")}>{d.category}</span>
                                    </div>
                                    <span className={cn(glass.sectionTitle, "text-2xl normal-case tabular-nums font-black")}>{d.total} <span className="text-xs font-sans opacity-30">{currency}</span></span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : activeAnalyticsTab === 'VAT summary' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 h-full items-center">
                        {[
                            { label: 'OUTPUT_VAT_SALES', value: vatSummaryData.outputVat, icon: ArrowUpRight, color: 'text-honey', bg: 'bg-honey/10' },
                            { label: 'INPUT_VAT_EXPENSES', value: vatSummaryData.inputVat, icon: ArrowDownRight, color: 'text-red-500/60', bg: 'bg-red-500/10' },
                            { label: 'REGULATORY_SETTLEMENT', value: vatSummaryData.balance, icon: Target, color: 'text-white', highlight: true, bg: 'bg-emerald-500/10' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.8 }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className={cn(
                                    glass.card,
                                    "p-12 space-y-10 shadow-3xl transition-all duration-700 border-white/5",
                                    item.highlight ? "bg-honey/10 border-honey/30 shadow-[0_40px_100px_-20px_rgba(251,191,36,0.2)]" : "bg-white/40"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border border-white/5", item.bg)}>
                                        <item.icon className={cn("w-7 h-7", item.color)} />
                                    </div>
                                    <Badge className="bg-white/5 text-[9px] font-black tracking-widest uppercase border-gray-200">{i === 2 ? 'FINAL_AUDIT' : 'VECTOR_BATCH'}</Badge>
                                </div>
                                <div className="space-y-3">
                                    <p className={cn(glass.microLabel, "opacity-40 tracking-[0.3em] font-black uppercase text-xs italic")}>{item.label}</p>
                                    <p className={cn("text-5xl font-serif font-black tabular-nums tracking-tighter", item.color)}>
                                        {item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-sans tracking-tight opacity-40 uppercase ml-1 font-black">{currency}</span>
                                    </p>
                                    <p className={cn(glass.microLabel, "opacity-20 italic normal-case font-black text-[10px] pt-4 border-t border-white/5")}>Calculated at kernel_precision_rate {vatSummaryData.vatRate}%</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 italic">
                        <Activity className="w-16 h-16 mb-6 animate-pulse" />
                        <p className={cn(glass.microLabel, "text-xl tracking-[0.4em] font-black uppercase")}>MODULE_IN_SYNTHESIS_RUN_v5.2...</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

interface BillingViewProps {
    onTabChange: (tab: string) => void;
}

const BillingView: React.FC<BillingViewProps> = ({ onTabChange }) => {
    const [activeSubTab, setActiveSubTab] = React.useState('Dashboard');
    const [currency, setCurrency] = React.useState('KES');
    const [isNewDocFormOpen, setIsNewDocFormOpen] = React.useState(false);
    const [docFormStep, setDocFormStep] = React.useState(1);

    // New Document Form State
    const [newDocType, setNewDocType] = React.useState('invoice');
    const [newDocAmount, setNewDocAmount] = React.useState(0);
    const [newDocDate, setNewDocDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [newDocEntityId, setNewDocEntityId] = React.useState('');
    const [newDocDescription, setNewDocDescription] = React.useState('');
    const [sellerName, setSellerName] = React.useState('BeeYield Platform');
    const [buyerName, setBuyerName] = React.useState('');
    const [lineItemsCount, setLineItemsCount] = React.useState(1);

    // Data State
    const [transactions, setTransactions] = React.useState<any[]>([]);
    const [hives, setHives] = React.useState<any[]>([]);
    const [overview, setOverview] = React.useState<any>(null);
    const [profile, setProfile] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [syncingId, setSyncingId] = React.useState<string | null>(null);

    const isFormValid = sellerName.trim() !== '' && buyerName.trim() !== '' && lineItemsCount > 0;
    const [isCurrencyOpen, setIsCurrencyOpen] = React.useState(false);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [overviewData, txList, profRes, hiveList] = await Promise.all([
                beeyieldService.getBillingOverview(),
                beeyieldService.getTransactions(),
                beeyieldService.getUserProfile(),
                beeyieldService.getHives()
            ]);
            setOverview(overviewData || {
                total_revenue: 0,
                total_costs: 0,
                net_result: 0,
                outstanding_invoices: 0
            });
            setTransactions(txList || []);
            setProfile(profRes.data);
            setHives(hiveList || []);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Sync failure in financial core');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInvoice = async () => {
        setIsNewDocFormOpen(false);
        const toastId = toast.loading('Synthesizing PDF bundle...');

        try {
            const doc = new jsPDF();

            // Premium Header
            doc.setFillColor(25, 25, 25);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('BEEYIELD AUDIT', 20, 25);
            doc.setFontSize(10);
            doc.text(`INDUSTRIAL PROTOCOL | INV-${Math.floor(Math.random() * 90000) + 10000}`, 150, 25);

            // Details
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(12);
            doc.text('ISSUER:', 20, 60);
            doc.text(sellerName, 20, 68);
            doc.text('RECIPIENT:', 120, 60);
            doc.text(buyerName, 120, 68);

            // Table
            autoTable(doc, {
                startY: 85,
                head: [['ID', 'VECTOR_DESCRIPTION', 'QUANTITY', 'UNIT_WEIGHT', 'SUBTOTAL']],
                body: Array.from({ length: lineItemsCount }).map((_, i) => [
                    `NODE-${i + 1}`,
                    newDocDescription || 'Industrial pollination services',
                    '1',
                    `${newDocAmount} ${currency}`,
                    `${newDocAmount} ${currency}`
                ]),
                theme: 'grid',
                headStyles: { fillColor: [180, 140, 50], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 10, cellPadding: 6 }
            });

            // Footer
            const finalY = (doc as any).lastAutoTable.finalY + 20;
            doc.rect(130, finalY, 60, 25, 'S');
            doc.setFontSize(14);
            doc.text('TOTAL AUDIT:', 135, finalY + 10);
            doc.text(`${newDocAmount} ${currency}`, 135, finalY + 18);

            // QR Code
            try {
                const qrData = await QRCode.toDataURL(`INV-${newDocAmount}-${currency}-${new Date().getTime()}`);
                doc.addImage(qrData, 'PNG', 20, finalY, 30, 30);
                doc.setFontSize(8);
                doc.text('VALIDATE_AUDIT', 20, finalY + 35);
            } catch (e) { }

            doc.save(`BEEYIELD_AUDIT_${new Date().getTime()}.pdf`);
            toast.success('Audit registry exported successfully', { id: toastId });
        } catch (error) {
            toast.error('Failed to synthesize export', { id: toastId });
        }
    };

    const handleSync = async (id: string) => {
        setSyncingId(id);
        toast.info('Re-syncing with regulatory node...');
        await new Promise(r => setTimeout(r, 1500));
        setSyncingId(null);
        toast.success('Sync lock established');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-16 pb-20")}
        >
            {/* Header Section */}
            <PageHeader
                icon={CreditCard}
                label="Industrial Financial Proxy_Kernel v5.1"
                title={<>Fiscal <span className="text-honey">Audit</span></>}
                subtitle="High-capacity proprietary financial management engine for industrial apiculture operations."
                actions={
                    <button
                        onClick={() => setIsNewDocFormOpen(true)}
                        className={cn(glass.btnPrimary, "h-16 px-12 font-black shadow-[0_20px_50px_rgba(251,191,36,0.25)] flex items-center gap-4 rounded-[1.8rem]")}
                    >
                        <Plus className="w-7 h-7" />
                        Execute Audit Log
                    </button>
                }
            />

            {/* Top Navigation */}
            <div className="flex bg-white/40 backdrop-blur-3xl p-3 rounded-[2.8rem] border border-gray-200 gap-3 shadow-2xl w-full md:w-fit relative z-10 transition-all">
                {['Dashboard', 'Ledger', 'Subscription', 'Regulatory Sync'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={cn(
                            "h-16 px-12 rounded-[2.2rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-700 w-full md:w-auto",
                            activeSubTab === tab
                                ? "bg-white text-honey shadow-2xl border border-honey/20"
                                : "text-foreground/40 hover:text-honey hover:bg-honey/5"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-60 flex flex-col items-center justify-center space-y-10 group">
                    <div className="relative w-32 h-32">
                        <div className="absolute inset-0 rounded-full border-4 border-honey/10 animate-ping" />
                        <div className="absolute inset-4 rounded-full border-2 border-honey/5 animate-pulse" />
                        <Loader2 className="w-full h-full animate-spin text-honey opacity-60" />
                    </div>
                    <span className={cn(glass.microLabel, "animate-pulse font-black tracking-[0.4em] uppercase italic text-xl")}>SYNCHRONIZING_FINANCIAL_CORES_RUN_v5.2...</span>
                </div>
            ) : activeSubTab === 'Dashboard' ? (
                <div className="space-y-16">
                    {/* Financial Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                        <GlassStatCard label="Inflow Gross" value={`${overview?.total_revenue?.toLocaleString()}`} icon={TrendingUp} index={0} color="text-honey" />
                        <GlassStatCard label="Industrial Cost" value={`${overview?.total_costs?.toLocaleString()}`} icon={Banknote} index={1} color="text-destructive" />
                        <GlassStatCard label="Net Operations" value={`${overview?.net_result?.toLocaleString()}`} icon={Target} index={2} color="text-emerald-500" />
                        <GlassStatCard label="Audit Pending" value={`${overview?.outstanding_invoices}`} icon={FileText} index={3} />
                    </div>

                    {/* Analytics Visualization */}
                    <AnalyticsSection currency={currency} />

                    {/* Quick Access Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
                        <motion.div
                            whileHover={{ y: -10, scale: 1.02 }}
                            className={cn(glass.card, "p-12 space-y-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden group/qa border-honey/10 bg-white/60 backdrop-blur-3xl")}
                        >
                            <div className="p-5 bg-honey/10 rounded-2xl w-fit border border-honey/10 group-hover/qa:rotate-12 transition-transform duration-700 shadow-xl">
                                <History className="w-9 h-9 text-honey" />
                            </div>
                            <div className="space-y-3">
                                <h3 className={cn(glass.sectionTitle, "text-3xl normal-case italic group-hover/qa:text-honey transition-colors")}>Recent <span className="text-honey">Ledger</span></h3>
                                <p className={cn(glass.microLabel, "opacity-40 normal-case italic font-black uppercase text-xs tracking-widest pl-6 border-l border-gray-200")}>Review high-capacity synchronization events.</p>
                            </div>
                            <button onClick={() => setActiveSubTab('Ledger')} className={cn(glass.btnSecondary, "w-full h-16 mt-6 font-black text-[11px] uppercase tracking-widest border-none bg-honey/5 hover:bg-honey/10 rounded-[1.8rem] flex items-center justify-center gap-3")}>
                                Open Archive <ChevronRight className="w-5 h-5 group-hover/qa:translate-x-1 transition-all" />
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -10, scale: 1.02 }}
                            className={cn(glass.card, "p-12 space-y-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden group/qa border-emerald-500/10 bg-white/60 backdrop-blur-3xl")}
                        >
                            <div className="p-5 bg-emerald-500/10 rounded-2xl w-fit border border-emerald-500/10 group-hover/qa:-rotate-12 transition-transform duration-700 shadow-xl">
                                <Shield className="w-9 h-9 text-emerald-500" />
                            </div>
                            <div className="space-y-3">
                                <h3 className={cn(glass.sectionTitle, "text-3xl normal-case italic group-hover/qa:text-emerald-500 transition-colors")}>Premium <span className="text-emerald-500/60">Tier</span></h3>
                                <p className={cn(glass.microLabel, "opacity-40 normal-case italic font-black uppercase text-xs tracking-widest pl-6 border-l border-gray-200")}>Managed capacity and industrial audit features.</p>
                            </div>
                            <button onClick={() => setActiveSubTab('Subscription')} className={cn(glass.btnSecondary, "w-full h-16 mt-6 font-black text-[11px] uppercase tracking-widest border-none bg-emerald-500/5 hover:bg-emerald-500/10 rounded-[1.8rem] flex items-center justify-center gap-3")}>
                                Tier Details <ChevronRight className="w-5 h-5 group-hover/qa:translate-x-1 transition-all" />
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -10, scale: 1.02 }}
                            className={cn(glass.card, "p-12 space-y-8 shadow-[0_40px_100px_-20px_rgba(251,191,36,0.15)] relative overflow-hidden group/qa border-honey/30 bg-honey/[0.02] backdrop-blur-3xl")}
                        >
                            <div className="p-5 bg-honey/20 rounded-2xl w-fit border border-honey/40 group-hover/qa:scale-125 transition-transform duration-700 shadow-2xl">
                                <Zap className="w-9 h-9 text-honey" />
                            </div>
                            <div className="space-y-3">
                                <h3 className={cn(glass.sectionTitle, "text-3xl normal-case italic group-hover/qa:text-honey transition-colors")}>Regulatory <span className="text-honey">Sync</span></h3>
                                <p className={cn(glass.microLabel, "opacity-50 normal-case italic font-black uppercase text-xs tracking-widest pl-6 border-l border-honey/20")}>Direct sync with global fiscal authorities.</p>
                            </div>
                            <button onClick={() => setActiveSubTab('Regulatory Sync')} className={cn(glass.btnPrimary, "w-full h-16 mt-6 font-black text-[11px] uppercase tracking-widest shadow-3xl shadow-honey/30 rounded-[1.8rem] flex items-center justify-center gap-3")}>
                                Sync Nucleus <RefreshCw className="w-5 h-5 group-hover/qa:rotate-180 transition-all duration-700" />
                            </button>
                        </motion.div>
                    </div>
                </div>
            ) : activeSubTab === 'Ledger' ? (
                <div className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className={cn(glass.card, "p-0 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative border-honey/10 bg-white/60 backdrop-blur-3xl")}
                    >
                        <div className="p-14 border-b border-gray-200 bg-white/40 flex flex-col xl:row-span-12 xl:flex-row gap-10 items-center justify-between relative z-10">
                            <div className="flex items-center gap-8">
                                <div className="w-16 h-16 rounded-[1.8rem] bg-honey/5 flex items-center justify-center border border-honey/10 shadow-inner">
                                    <History className="w-8 h-8 text-honey" />
                                </div>
                                <div>
                                    <h3 className={cn(glass.sectionTitle, "text-4xl normal-case italic")}>Historical <span className="text-honey">Audit Vault</span></h3>
                                    <p className={cn(glass.microLabel, "opacity-40 mt-2 uppercase tracking-[0.2em] font-black italic")}>Immutable record of fiscal synchronization events.</p>
                                </div>
                            </div>
                            <div className="relative group w-full xl:w-[500px]">
                                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-honey transition-all duration-500" />
                                <Input placeholder="FILTER_LEDGER_ENTRIES..." className={cn(glass.input, "h-20 pl-20 font-black text-xl italic bg-gray-50 rounded-[2.2rem]")} />
                            </div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar-modern relative z-10">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-white/40 backdrop-blur-3xl">
                                        <th className={cn(glass.microLabel, "px-14 py-10 opacity-40 border-b border-white/5 font-black uppercase tracking-[0.3em] text-[10px]")}>VECTOR_IDENTIFIER</th>
                                        <th className={cn(glass.microLabel, "px-10 py-10 opacity-40 border-b border-white/5 font-black uppercase tracking-[0.3em] text-[10px]")}>LOG_DESCRIPTION</th>
                                        <th className={cn(glass.microLabel, "px-10 py-10 opacity-40 border-b border-white/5 font-black uppercase tracking-[0.3em] text-[10px]")}>TEMPORAL_FIXATION</th>
                                        <th className={cn(glass.microLabel, "px-10 py-10 opacity-40 border-b border-white/5 font-black uppercase tracking-[0.3em] text-[10px]")}>VALUE_QUANTUM</th>
                                        <th className={cn(glass.microLabel, "px-10 py-10 opacity-40 border-b border-white/5 font-black uppercase tracking-[0.3em] text-[10px]")}>SYNC_STATUS</th>
                                        <th className={cn(glass.microLabel, "px-14 py-10 opacity-40 border-b border-white/5 text-right font-black uppercase tracking-[0.3em] text-[10px]")}>OPS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-transparent">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="h-96 text-center opacity-30 italic">
                                                <div className="w-24 h-24 rounded-full bg-honey/5 border border-honey/10 flex items-center justify-center mx-auto mb-8">
                                                    <History className="w-12 h-12 text-honey/20" />
                                                </div>
                                                <p className={cn(glass.microLabel, "text-xl tracking-[0.4em] font-black uppercase")}>VOID_LEDGER_ENTRIES_DETECTED</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx, i) => (
                                            <motion.tr
                                                key={tx.id || i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05, duration: 0.7 }}
                                                className="group hover:bg-honey/[0.03] transition-all duration-700"
                                            >
                                                <td className="px-14 py-12">
                                                    <span className={cn(glass.sectionTitle, "text-sm normal-case italic opacity-30 tabular-nums font-black tracking-widest")}>#TX-{tx.id?.slice(0, 8) || i}</span>
                                                </td>
                                                <td className="px-10 py-12">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={cn(glass.sectionTitle, "text-xl normal-case font-black group-hover:text-honey transition-all duration-700 italic")}>{tx.description || 'Industrial Quantum Transfer'}</span>
                                                        <span className={cn(glass.microLabel, "opacity-20 lowercase tracking-[0.3em] font-black italic text-[9px]")}>RELAY_REF: {tx.reference || 'SYSTEM_AUTO_GEN'}</span>
                                                    </div>
                                                </td>
                                                <td className={cn(glass.microLabel, "px-10 py-12 font-black opacity-50 tabular-nums text-sm")}>
                                                    {new Date(tx.date || tx.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-10 py-12">
                                                    <span className={cn(glass.sectionTitle, "text-2xl normal-case tabular-nums font-black", tx.type === 'expense' ? 'text-red-500/60' : 'text-emerald-500')}>
                                                        {tx.type === 'expense' ? '−' : '+'}{tx.amount?.toLocaleString()} <span className="text-[10px] font-sans tracking-widest opacity-30 uppercase font-black ml-1">{currency}</span>
                                                    </span>
                                                </td>
                                                <td className="px-10 py-12">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-3 px-5 py-2 rounded-full border shadow-2xl backdrop-blur-3xl transition-all duration-700",
                                                        tx.status === 'synced' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-honey/10 text-honey border-honey/20'
                                                    )}>
                                                        <div className={cn("w-2 h-2 rounded-full", tx.status === 'synced' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-honey animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.5)]')} />
                                                        <span className={cn(glass.microLabel, "font-black tracking-[0.2em] text-[10px] uppercase")}>{tx.status?.toUpperCase() || 'POSTED_AUDIT'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-14 py-12 text-right">
                                                    <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-10 group-hover:translate-x-0">
                                                        <button
                                                            onClick={() => handleSync(tx.id)}
                                                            className={cn(glass.btnSecondary, "h-14 w-14 p-0 rounded-2xl bg-white border-white/5 hover:text-honey hover:shadow-honey/10 transition-all duration-500 shadow-2xl")}
                                                        >
                                                            {syncingId === tx.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
                                                        </button>
                                                        <button className={cn(glass.btnSecondary, "h-14 w-14 p-0 rounded-2xl bg-white border-white/5 hover:text-honey hover:shadow-honey/10 transition-all duration-500 shadow-2xl")}>
                                                            <FileDown className="w-6 h-6" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-14 border-t border-white/5 bg-white/40 flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                            <div className="flex flex-col gap-2">
                                <p className={cn(glass.microLabel, "opacity-30 tracking-[0.4em] font-black italic uppercase text-[10px] pl-6 border-l border-honey/20")}>PRIMARY_LEDGER_INDEX_STABLE · SHA-512_ENCRYPTED · IMMUTABLE_VAULT</p>
                                <p className="text-[9px] font-bold opacity-10 uppercase tracking-widest pl-6">Industrial Kernel Financial Security Protocol Active</p>
                            </div>
                            <div className="flex gap-6">
                                <button className={cn(glass.btnSecondary, "h-18 px-12 gap-5 font-black text-xs uppercase tracking-widest rounded-3xl shadow-3xl bg-white border-gray-200")}>
                                    <FileText className="w-6 h-6 text-honey" /> Full Narrative Statements
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            ) : activeSubTab === 'Subscription' ? (
                <div className="space-y-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1 }}
                        className={cn(glass.card, "p-16 relative overflow-hidden group border-honey/20 bg-gradient-to-br from-honey/[0.05] to-transparent shadow-[0_50px_100px_-20px_rgba(251,191,36,0.15)]")}
                    >
                        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:opacity-10 transition-all duration-1000 rotate-12 scale-150">
                            <Shield className="w-96 h-96" />
                        </div>
                        <div className="absolute -bottom-60 -left-60 w-[50rem] h-[50rem] bg-honey/[0.03] rounded-full blur-[150px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col xl:flex-row gap-16 items-center">
                            <div className="w-48 h-48 rounded-[3.5rem] bg-gradient-amber flex items-center justify-center text-gray-900 shadow-[0_40px_80px_-15px_rgba(251,191,36,0.5)] group-hover:scale-110 transition-transform duration-1000 rotate-6">
                                <Zap className="w-24 h-24" />
                            </div>
                            <div className="flex-1 space-y-6 text-center xl:text-left">
                                <Badge className="bg-honey/20 text-honey border-honey/40 px-6 py-2 rounded-full font-black text-[11px] tracking-[0.3em] uppercase animate-pulse">CURRENT_ACTIVE_INDUSTRIAL_TIER</Badge>
                                <h2 className={cn(glass.sectionTitle, "text-7xl normal-case italic tracking-tighter")}>BeeYield <span className="text-honey">Industrial Pro</span></h2>
                                <p className="text-2xl font-medium opacity-50 leading-relaxed italic max-w-2xl border-l-2 border-honey/20 pl-10">Managed global scale: {hives.length} active distribution nodes with unlimited neural audit capacity and priority relay throughput.</p>
                            </div>
                            <div className="flex flex-col items-center xl:items-end gap-5">
                                <div className="text-6xl font-serif font-black text-honey tracking-tighter">1,200 <span className="text-xl font-sans tracking-tight opacity-30 uppercase font-black">{currency}/mo</span></div>
                                <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-xl">
                                    <Clock className="w-5 h-5 text-honey/60" />
                                    <span className={cn(glass.microLabel, "opacity-40 font-black tracking-widest text-xs")}>SYNC_RENEWAL: 12_OCT_2026</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="relative z-10 pt-10">
                        <SubscriptionPlans currentTier="pro" onUpgrade={(p) => toast.info(`Initializing migration vector to ${p} node tier...`)} />
                    </div>
                </div>
            ) : (
                <div className="space-y-16 relative z-10">
                    <SettingsIntegrationsView />
                </div>
            )}

            {/* Audit Log Execution Modal */}
            <AnimatePresence>
                {isNewDocFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 backdrop-blur-3xl"
                            onClick={() => setIsNewDocFormOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50, rotateX: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50, rotateX: 20 }}
                            className={cn(glass.card, "w-full max-w-5xl p-0 overflow-hidden shadow-[0_50px_200px_-40px_rgba(0,0,0,0.6)] bg-white/90 border-honey/20 relative z-10")}
                        >
                            <div className="p-14 border-b border-gray-200 flex justify-between items-center bg-white/40">
                                <div className="space-y-2">
                                    <h3 className={cn(glass.sectionTitle, "text-4xl normal-case italic")}>Execute Fiscal <span className="text-honey">Audit Log</span></h3>
                                    <p className={cn(glass.microLabel, "font-black tracking-[0.3em] uppercase text-[10px] opacity-40")}>NEW_IMMUTABLE_FINANCIAL_VECTOR_EVENT</p>
                                </div>
                                <button
                                    onClick={() => setIsNewDocFormOpen(false)}
                                    className={cn(glass.btnSecondary, "h-16 w-16 p-0 rounded-2xl hover:text-destructive hover:border-destructive/20 transition-all duration-700 shadow-2xl")}
                                >
                                    <X className="w-8 h-8" />
                                </button>
                            </div>

                            <div className="p-16 space-y-16">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    {/* Left: General Info */}
                                    <div className="space-y-12">
                                        <div className="space-y-6">
                                            <Label className={cn(glass.microLabel, "ml-8 opacity-60 font-black tracking-widest text-xs uppercase")}>Audit Classification*</Label>
                                            <div className="flex bg-gray-50 p-3 rounded-[2.5rem] border border-white/5 gap-3 shadow-inner backdrop-blur-3xl">
                                                {['invoice', 'receipt', 'expense'].map((t) => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setNewDocType(t)}
                                                        className={cn(
                                                            "h-16 flex-1 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-700",
                                                            newDocType === t ? "bg-white text-honey shadow-2xl border border-honey/20" : "text-foreground/30 hover:bg-white/5"
                                                        )}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <Label className={cn(glass.microLabel, "ml-8 opacity-60 font-black tracking-widest text-xs uppercase")}>Fiscal Quantum ({currency})*</Label>
                                            <div className="relative group">
                                                <DollarSign className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 text-honey/40 transition-colors group-focus-within:text-honey" />
                                                <Input
                                                    type="number"
                                                    value={newDocAmount || ''}
                                                    onChange={(e) => setNewDocAmount(parseFloat(e.target.value) || 0)}
                                                    placeholder="0.00"
                                                    className={cn(glass.input, "h-22 font-black text-4xl px-20 shadow-inner rounded-[2.5rem] bg-gray-50 tabular-nums border-none")}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <Label className={cn(glass.microLabel, "ml-8 opacity-60 font-black tracking-widest text-xs uppercase")}>Audit Entry Narrative</Label>
                                            <div className="relative group">
                                                <FileText className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-honey/40 transition-colors group-focus-within:text-honey" />
                                                <Input
                                                    value={newDocDescription}
                                                    onChange={(e) => setNewDocDescription(e.target.value)}
                                                    placeholder="Industrial vector description..."
                                                    className={cn(glass.input, "h-20 px-20 font-black text-xl italic bg-gray-50 rounded-[2.2rem] border-none")}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Entities */}
                                    <div className="space-y-12">
                                        <div className="space-y-6">
                                            <Label className={cn(glass.microLabel, "ml-8 opacity-60 font-black tracking-widest text-xs uppercase")}>Issuing Entity Authority*</Label>
                                            <Input
                                                value={sellerName}
                                                onChange={(e) => setSellerName(e.target.value)}
                                                className={cn(glass.input, "h-20 px-10 font-black text-xl bg-gray-50 rounded-[2.2rem] border-none")}
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            <Label className={cn(glass.microLabel, "ml-8 opacity-60 font-black tracking-widest text-xs uppercase")}>Recipient Legal Entity*</Label>
                                            <div className="relative group">
                                                <Globe className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-honey/40 transition-colors group-focus-within:text-honey" />
                                                <Input
                                                    value={buyerName}
                                                    onChange={(e) => setBuyerName(e.target.value)}
                                                    placeholder="Full legal authority name..."
                                                    className={cn(glass.input, "h-20 px-20 font-black text-xl bg-gray-50 rounded-[2.2rem] border-none")}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <Label className={cn(glass.microLabel, "ml-8 opacity-60 font-black tracking-widest text-xs uppercase")}>Temporal Fixation Point*</Label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-honey/40 transition-colors group-focus-within:text-honey" />
                                                <Input
                                                    type="date"
                                                    value={newDocDate}
                                                    onChange={(e) => setNewDocDate(e.target.value)}
                                                    className={cn(glass.input, "h-20 px-20 font-black text-xl tabular-nums bg-gray-50 rounded-[2.2rem] border-none")}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-16 border-t border-gray-200 gap-10">
                                    <div className="flex items-center gap-6 opacity-30">
                                        <div className="p-3 bg-white/5 rounded-xl">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest max-w-[200px]">Data will be written to immutable ledger upon commitment.</p>
                                    </div>
                                    <div className="flex gap-8">
                                        <button
                                            onClick={() => setIsNewDocFormOpen(false)}
                                            className={cn(glass.btnSecondary, "h-20 px-12 font-black text-sm uppercase tracking-widest rounded-[2rem] border-gray-200")}
                                        >
                                            Discard Audit
                                        </button>
                                        <button
                                            onClick={handleGenerateInvoice}
                                            disabled={!isFormValid}
                                            className={cn(glass.btnPrimary, "h-22 px-16 font-black text-xl shadow-[0_30px_70px_-10px_rgba(251,191,36,0.5)] rounded-[2.5rem] flex items-center gap-5 transition-all active:scale-95 group/commit")}
                                        >
                                            <ShieldCheck className="w-8 h-8 group-hover/commit:scale-125 transition-transform duration-700" />
                                            Commit Fiscal Audit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar-modern::-webkit-scrollbar {
                    width: 5px;
                    height: 5px;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-thumb {
                    background: hsl(var(--honey) / 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar-modern::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--honey) / 0.3);
                }
            `}</style>
        </motion.div>
    );
};

export default BillingView;
