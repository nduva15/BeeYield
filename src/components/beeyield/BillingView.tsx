import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Plus, FileText, ChevronRight, Download, Loader2,
    Shield, Zap, Banknote, Target, TrendingUp,
    Search, Calendar, History, ArrowUpRight, ArrowDownRight, Printer, Share2, DollarSign,
    RefreshCw, X, ShieldCheck, Clock, Lock, CreditCard
} from 'lucide-react';
import { Label } from '@/components/ui/label';
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
import { glass, PageHeader } from './GlassTheme';

// Analytics Section Component
const AnalyticsSection: React.FC<{ currency: string }> = ({ currency }) => {
    const [activeAnalyticsTab, setActiveAnalyticsTab] = React.useState('Overview');
    const analyticsTabs = ['Overview', 'Categories', 'VAT'];
    const [data, setData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            const groupBy = activeAnalyticsTab === 'Overview' ? 'month' : 'category';
            try {
                const result = await beeyieldService.getFinancialAggregate(groupBy as any);
                setData(result || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [activeAnalyticsTab]);

    const vatSummaryData = {
        outputVat: (data || []).reduce((s, d) => s + (d.revenue || 0), 0) * 0.16,
        inputVat: (data || []).reduce((s, d) => s + (d.costs || 0), 0) * 0.16,
        balance: ((data || []).reduce((s, d) => s + (d.revenue || 0), 0) - (data || []).reduce((s, d) => s + (d.costs || 0), 0)) * 0.16,
        vatRate: 16,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(glass.card, "p-5 border-[#1A1A1A]/5 bg-[#FFF9F0]/80 rounded-2xl relative overflow-hidden")}
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-[#1A1A1A]/5 pb-4 relative z-10">
                <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-[#1A1A1A] tracking-tighter uppercase italic">Financial <span className="text-[#F4D03F]">Intelligence</span></h3>
                    <p className="text-[8px] font-black text-[#1A1A1A]/30 uppercase tracking-widest italic">Profitability audit across global distribution nodes.</p>
                </div>
                <button
                    onClick={() => toast.info("Exporting...")}
                    className="h-8 px-4 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A]/60 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic"
                >
                    <Download className="w-3 h-3 text-[#F4D03F]" />
                    Export Ledger
                </button>
            </div>

            <div className="flex bg-[#1A1A1A]/5 p-1 rounded-xl border border-[#1A1A1A]/5 gap-1 w-fit mb-6 relative z-10">
                {analyticsTabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveAnalyticsTab(tab)}
                        className={cn(
                            "h-7 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all italic",
                            activeAnalyticsTab === tab
                                ? "bg-white text-[#1A1A1A] shadow-sm"
                                : "text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="h-[240px] w-full relative z-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-20 italic">
                        <Loader2 className="w-6 h-6 animate-spin text-[#F4D03F]" />
                        <span className="text-[8px] font-black tracking-widest uppercase">SYnthesizing_Vectors...</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 italic">
                        <Banknote className="w-10 h-10 mb-2" />
                        <p className="text-[10px] tracking-widest font-black uppercase">Null_Records_Detected</p>
                    </div>
                ) : activeAnalyticsTab === 'Overview' ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: 'rgba(26,26,26,0.3)', fontWeight: 900 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: 'rgba(26,26,26,0.3)', fontWeight: 900 }}
                                tickFormatter={(v) => `${v}${currency}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#FFF9F0',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(244, 208, 63, 0.2)',
                                    padding: '12px',
                                    fontSize: '10px',
                                    fontWeight: 900,
                                    fontStyle: 'italic'
                                }}
                            />
                            <Bar dataKey="revenue" fill="#F4D03F" radius={[4, 4, 0, 0]} name="Inflow" barSize={32} />
                            <Bar dataKey="costs" fill="#EF4444" opacity={0.4} radius={[4, 4, 0, 0]} name="Outflow" barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : activeAnalyticsTab === 'Categories' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-center px-4">
                        <div className="h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="total"
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#F4D03F' : '#F4D03F/40'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            {data.slice(0, 4).map((d, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-[#1A1A1A]/5 italic">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", i % 2 === 0 ? "bg-[#F4D03F]" : "bg-[#F4D03F]/40")} />
                                        <span className="text-[10px] font-black uppercase text-[#1A1A1A]/60">{d.category}</span>
                                    </div>
                                    <span className="text-[11px] font-black tabular-nums">{d.total} <span className="text-[8px] opacity-30">{currency}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full items-center p-4">
                        {[
                            { label: 'Output_Sales', value: vatSummaryData.outputVat, icon: ArrowUpRight, color: 'text-[#F4D03F]' },
                            { label: 'Input_Expenses', value: vatSummaryData.inputVat, icon: ArrowDownRight, color: 'text-red-500/60' },
                            { label: 'Reg_Settlement', value: vatSummaryData.balance, icon: Target, color: 'text-[#1B9157]', highlight: true },
                        ].map((item, i) => (
                            <div key={i} className={cn("p-6 space-y-4 rounded-2xl border bg-white/50", item.highlight ? "border-[#1B9157]/20" : "border-[#1A1A1A]/5")}>
                                <div className="flex justify-between items-start">
                                    <item.icon className={cn("w-5 h-5", item.color)} />
                                    <Badge className="bg-[#1A1A1A]/5 text-[7px] font-black italic uppercase text-[#1A1A1A]/30 border-none px-2">{i === 2 ? 'AUDIT' : 'VECTOR'}</Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black uppercase opacity-30 italic">{item.label}</p>
                                    <p className={cn("text-xl font-black tabular-nums tracking-tighter italic", item.color)}>
                                        {item.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                        <span className="text-[8px] opacity-30 ml-1 uppercase">{currency}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
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
    const [activeSubTab, setActiveSubTab] = React.useState('Overview');
    const [currency, setCurrency] = React.useState('KES');
    const [isNewDocFormOpen, setIsNewDocFormOpen] = React.useState(false);

    const [newDocType, setNewDocType] = React.useState('invoice');
    const [newDocAmount, setNewDocAmount] = React.useState(0);
    const [newDocDate, setNewDocDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [newDocDescription, setNewDocDescription] = React.useState('');
    const [sellerName, setSellerName] = React.useState('BeeYield Platform');
    const [buyerName, setBuyerName] = React.useState('');

    const [transactions, setTransactions] = React.useState<any[]>([]);
    const [overview, setOverview] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [syncingId, setSyncingId] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ovData, txList] = await Promise.all([
                beeyieldService.getBillingOverview(),
                beeyieldService.getTransactions()
            ]);
            setOverview(ovData || { total_revenue: 0, total_costs: 0, net_result: 0, outstanding_invoices: 0 });
            setTransactions(txList || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInvoice = async () => {
        if (!buyerName || !newDocAmount) return toast.error("Required fields missing.");
        const tid = toast.loading('Synthesizing Export...');
        try {
            const doc = new jsPDF();
            doc.setFillColor(26, 26, 26);
            doc.rect(0, 0, 210, 30, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text('BEEYIELD FISCAL AUDIT', 20, 20);
            
            doc.setTextColor(26, 26, 26);
            doc.setFontSize(10);
            doc.text(`Origin: ${sellerName}`, 20, 50);
            doc.text(`Target: ${buyerName}`, 20, 58);
            
            autoTable(doc, {
                startY: 70,
                head: [['SEQUENCE', 'DESCRIPTION', 'QUANTITY', 'TOTAL']],
                body: [['#01', newDocDescription || 'Industrial Logistics', '1', `${newDocAmount} ${currency}`]],
                theme: 'grid',
                headStyles: { fillColor: [244, 208, 63], textColor: [26, 26, 26], fontStyle: 'bold' }
            });
            
            doc.save(`BY_AUDIT_${Date.now()}.pdf`);
            setIsNewDocFormOpen(false);
            toast.success('Audit Dispatched', { id: tid });
        } catch (e) {
            toast.error('Synthesis Failed', { id: tid });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20 max-w-7xl mx-auto")}
        >
            <PageHeader
                icon={CreditCard}
                label="Fiscal Audit Kernel v5.2"
                title={<>Industrial <span className="text-[#F4D03F]">Ledger</span></>}
                subtitle="Managed financial telemetry for high-capacity apiculture ops."
                actions={
                    <Button
                        onClick={() => setIsNewDocFormOpen(true)}
                        className="h-10 bg-[#1B9157] text-white hover:bg-[#1B9157]/90 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#1B9157]/20"
                    >
                        <Plus className="w-4 h-4" /> New Entry
                    </Button>
                }
            />

            <div className="flex bg-[#1A1A1A]/5 p-1 rounded-xl border border-[#1A1A1A]/5 gap-1 w-fit relative z-10">
                {['Overview', 'Ledger', 'Subscription', 'Sync'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={cn(
                            "h-8 px-5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all italic",
                            activeSubTab === tab
                                ? "bg-white text-[#1A1A1A] shadow-sm"
                                : "text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-20 italic">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F4D03F] mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Hydrating_Fiscal_Core...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {activeSubTab === 'Overview' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {[
                                    { label: 'Inflow Gross', value: `${overview?.total_revenue?.toLocaleString()}`, icon: TrendingUp, color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]' },
                                    { label: 'Industrial OpEx', value: `${overview?.total_costs?.toLocaleString()}`, icon: Banknote, color: 'text-red-500', bg: 'bg-red-500' },
                                    { label: 'Net Operations', value: `${overview?.net_result?.toLocaleString()}`, icon: Target, color: 'text-[#1B9157]', bg: 'bg-[#1B9157]' },
                                    { label: 'Pending Audit', value: `${overview?.outstanding_invoices}`, icon: FileText, color: 'text-[#1A1A1A]', bg: 'bg-[#1A1A1A]' },
                                ].map((stat, i) => (
                                    <div key={i} className={cn(glass.card, "p-4 space-y-2 border-[#1A1A1A]/5 bg-[#FFF9F0]/80 rounded-2xl relative overflow-hidden group")}>
                                        <div className={cn("absolute top-0 left-0 w-full h-[2px] opacity-10", stat.bg)} />
                                        <p className="text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-widest italic">{stat.label}</p>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn("text-2xl font-black tracking-tighter truncate", stat.color)}>{stat.value}</p>
                                            <stat.icon className={cn("w-4 h-4 opacity-10 group-hover:opacity-30 transition-opacity", stat.color)} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <AnalyticsSection currency={currency} />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { title: 'Ledger Hash', sub: 'Review sync history', icon: History, action: 'Ledger', theme: '#F4D03F' },
                                    { title: 'Nexus Tier', sub: 'Manage industrial tier', icon: Shield, action: 'Subscription', theme: '#1B9157' },
                                    { title: 'Registry Sync', sub: 'Regulatory handshakes', icon: RefreshCw, action: 'Sync', theme: '#3B82F6' },
                                ].map((card, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveSubTab(card.action)}
                                        className={cn(glass.card, "p-5 flex items-center gap-5 border-[#1A1A1A]/5 bg-[#FFF9F0]/80 rounded-2xl group text-left transition-all hover:border-[#1A1A1A]/10 hover:shadow-xl hover:shadow-[#1A1A1A]/5")}
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#1A1A1A]/5 group-hover:scale-110 transition-transform">
                                            <card.icon className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: card.theme }} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xs font-black uppercase tracking-tight italic group-hover:text-[#F4D03F] transition-colors">{card.title}</h4>
                                            <p className="text-[9px] font-bold text-[#1A1A1A]/30 uppercase italic">{card.sub}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#1A1A1A]/20" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'Ledger' && (
                        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-black text-[#1A1A1A] tracking-tighter uppercase italic">Audit <span className="text-[#F4D03F]">Vault</span></h3>
                                    <p className="text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-widest italic">Immutable record of fiscal synchronization.</p>
                                </div>
                                <div className="relative group w-full md:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1A1A1A]/20 group-focus-within:text-[#F4D03F] transition-all" />
                                    <input
                                        placeholder="Search archives..."
                                        className="w-full h-10 bg-[#FFF9F0]/80 border border-[#1A1A1A]/5 rounded-xl pl-10 pr-4 text-[11px] font-black italic text-[#1A1A1A] outline-none focus:ring-1 focus:ring-[#F4D03F]/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div className={cn(glass.card, "p-0 overflow-hidden bg-[#FFF9F0]/80 rounded-3xl min-h-[400px]")}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#1A1A1A]/5">
                                            <tr>
                                                <th className="px-8 py-4 text-left text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em] italic">Sequence_Hash</th>
                                                <th className="px-8 py-4 text-left text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em] italic">Audit_Event</th>
                                                <th className="px-8 py-4 text-left text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em] italic">Temporal</th>
                                                <th className="px-8 py-4 text-left text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em] italic">Quantum</th>
                                                <th className="px-8 py-4 text-left text-[9px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em] italic text-right">Ops</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1A1A1A]/5">
                                            {transactions.map((tx, i) => (
                                                <tr key={i} className="hover:bg-[#1A1A1A]/[0.02] transition-colors group italic">
                                                    <td className="px-8 py-4 text-[10px] font-black text-[#1A1A1A]/40 tabular-nums">#{(tx.id || i).toString().slice(0, 8)}</td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-[#1A1A1A] group-hover:text-[#F4D03F] transition-colors">{tx.description || 'Industrial Transfer'}</span>
                                                            <span className="text-[8px] font-black text-[#1A1A1A]/20 uppercase tracking-widest mt-1">Ref: {tx.reference || 'Auto_Dispatch'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4 text-[10px] font-black text-[#1A1A1A]/40 tabular-nums">
                                                        {new Date(tx.date || tx.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className={cn("text-lg font-black tabular-nums", tx.type === 'expense' ? 'text-red-500/60' : 'text-[#1B9157]')}>
                                                            {tx.type === 'expense' ? '-' : '+'}{tx.amount?.toLocaleString()} <span className="text-[8px] opacity-30">{currency}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => setSyncingId(tx.id || i)}
                                                                className="h-8 w-8 rounded-lg bg-white border border-[#1A1A1A]/5 flex items-center justify-center text-[#1A1A1A]/40 hover:text-[#F4D03F] transition-colors"
                                                            >
                                                                {syncingId === (tx.id || i) ? <Loader2 className="w-4 h-4 animate-spin text-[#F4D03F]" /> : <RefreshCw className="w-4 h-4" />}
                                                            </button>
                                                            <button className="h-8 w-8 rounded-lg bg-white border border-[#1A1A1A]/5 flex items-center justify-center text-[#1A1A1A]/40 hover:text-[#1A1A1A]/80 transition-colors">
                                                                <FileText className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'Subscription' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className={cn(glass.card, "p-8 relative overflow-hidden group border-[#F4D03F]/10 bg-[#FFF9F0]/80 rounded-[2.5rem] shadow-sm")}>
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F4D03F]/5 rounded-full blur-3xl" />
                                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-[#F4D03F] flex items-center justify-center text-[#1A1A1A] shadow-lg shadow-[#F4D03F]/20">
                                        <Zap className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1 space-y-1 text-center md:text-left italic">
                                        <Badge className="bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20 px-3 py-0.5 rounded-full font-black text-[8px] tracking-[0.2em] uppercase">ACTIVE_NODE_TIER</Badge>
                                        <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none">Industrial <span className="text-[#F4D03F]">Pro</span></h2>
                                        <p className="text-[11px] font-medium text-[#1A1A1A]/40 uppercase tracking-widest">Managed global scale · Unlimited audits</p>
                                    </div>
                                    <div className="flex flex-col items-center md:items-end gap-2">
                                        <div className="text-3xl font-black text-[#F4D03F] tracking-tighter italic">1,200 <span className="text-[10px] font-black uppercase opacity-20">{currency}/mo</span></div>
                                        <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-xl border border-[#1A1A1A]/5 text-[9px] font-black text-[#1A1A1A]/40 uppercase tracking-widest italic">
                                            <Clock className="w-3.5 h-3.5 opacity-20" /> Renewal: 12 OCT
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <SubscriptionPlans currentTier="pro" onUpgrade={(p) => toast.info(`Initializing migration to ${p} node tier...`)} />
                        </div>
                    )}

                    {activeSubTab === 'Sync' && (
                        <div className="animate-in fade-in duration-500">
                            <SettingsIntegrationsView />
                        </div>
                    )}
                </div>
            )}

            {/* Audit Entry Modal */}
            <AnimatePresence>
                {isNewDocFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#FFF9F0]/80 backdrop-blur-xl" onClick={() => setIsNewDocFormOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className={cn(glass.card, "w-full max-w-2xl p-0 overflow-hidden shadow-2xl bg-[#FFF9F0] border-[#1A1A1A]/5 relative z-10 rounded-[2.5rem]")}>
                            <div className="p-8 border-b border-[#1A1A1A]/5 flex justify-between items-center bg-[#1A1A1A]/5 italic">
                                <div>
                                    <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none">Execute <span className="text-[#F4D03F]">Audit</span> Entry</h3>
                                    <p className="text-[9px] font-black tracking-widest uppercase opacity-30 mt-1">Immutable Financial Committment Protocol v4.1</p>
                                </div>
                                <button onClick={() => setIsNewDocFormOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-[#1A1A1A]/5 text-[#1A1A1A]/20 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-[#1A1A1A]/30 italic ml-4 tracking-widest">Classification</Label>
                                            <div className="flex bg-[#1A1A1A]/5 p-1 rounded-xl border border-[#1A1A1A]/5 gap-1">
                                                {['invoice', 'receipt', 'expense'].map(t => (
                                                    <button key={t} onClick={() => setNewDocType(t)} className={cn("h-10 flex-1 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all italic", newDocType === t ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#1A1A1A]/20")}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-[#1A1A1A]/30 italic ml-4 tracking-widest">Audit Value ({currency})</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F4D03F]/40" />
                                                <Input type="number" value={newDocAmount || ''} onChange={(e) => setNewDocAmount(parseFloat(e.target.value) || 0)} className="h-14 font-black italic text-3xl pl-14 bg-[#1A1A1A]/5 border-none rounded-2xl" placeholder="0.00" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-[#1A1A1A]/30 italic ml-4 tracking-widest">Issuing Authority</Label>
                                            <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="h-12 px-6 font-black italic bg-[#1A1A1A]/5 border-none rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-[#1A1A1A]/30 italic ml-4 tracking-widest">Recipient Node</Label>
                                            <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Full legal name..." className="h-12 px-6 font-black italic bg-[#1A1A1A]/5 border-none rounded-xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase text-[#1A1A1A]/30 italic ml-4 tracking-widest">Mission Narrative</Label>
                                    <Input value={newDocDescription} onChange={(e) => setNewDocDescription(e.target.value)} placeholder="Detailed audit context..." className="h-14 px-6 font-black italic bg-[#1A1A1A]/5 border-none rounded-2xl" />
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-[#1A1A1A]/5">
                                    <div className="flex items-center gap-3 opacity-20 italic">
                                        <Lock className="w-5 h-5 text-[#F4D03F]" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em]">Payload_Encrypted</p>
                                    </div>
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <Button variant="ghost" type="button" onClick={() => setIsNewDocFormOpen(false)} className="h-14 flex-1 md:px-8 rounded-2xl font-black uppercase tracking-widest text-[9px] text-[#1A1A1A]/40 hover:text-[#1A1A1A] italic">Abort</Button>
                                        <Button onClick={handleGenerateInvoice} className="h-14 flex-1 md:px-12 rounded-2xl bg-[#1B9157] hover:bg-[#1B9157]/90 text-white font-black uppercase tracking-widest text-[10px] italic shadow-xl shadow-green-500/10"><ShieldCheck className="w-5 h-5 mr-3" /> Commit Audit</Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BillingView;
