import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Plus, FileText, ChevronRight, Download, Loader2,
    Shield, Zap, Banknote, Target, TrendingUp,
    Search, Calendar, History, ArrowUpRight, ArrowDownRight, Printer, Share2, DollarSign,
    RefreshCw, X, ShieldCheck, Clock, Lock as LockIcon, CreditCard
} from "lucide-react";
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
import { glass } from './GlassTheme';
import { BeeYieldCard, BeeYieldPageHeader, BeeYieldPageShell, BeeYieldTabBar, BeeYieldFormField, BeeYieldTextInput } from '@/components/beeyield/BeeYieldUI';

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

    const exportLedgerCsv = async () => {
        const tid = toast.loading('Preparing export…');
        try {
            const txs = await beeyieldService.getTransactions();
            const rows = (txs || []).map((t: any) => ({
                date: t.date || '',
                type: t.transaction_type || t.type || '',
                amount: t.amount ?? '',
                currency: t.currency || '',
                category: t.module_type || t.category || '',
                description: t.description || '',
                status: t.etims_status || t.status || '',
            }));

            if (rows.length === 0) {
                toast.info('No ledger entries to export', { id: tid });
                return;
            }

            const escapeCsv = (v: unknown) => {
                const s = String(v ?? '');
                if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
                return s;
            };

            const header = Object.keys(rows[0]).join(',');
            const body = rows.map((r) => Object.values(r).map(escapeCsv).join(',')).join('\n');
            const csv = `${header}\n${body}\n`;

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `beeyield-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            toast.success('Ledger exported', { id: tid });
        } catch (e) {
            console.error(e);
            toast.error('Export failed', { id: tid });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <BeeYieldCard
                padded={false}
                className={cn("p-5 border-white/20 bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-xl relative overflow-hidden")}
            >
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-[#1A1A1A]/5 pb-4 relative z-10">
                <div className="space-y-0.5">
                    <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight">Financial overview</h3>
                    <p className="text-sm text-gray-500">Revenue, costs, and invoices</p>
                </div>
                <button
                    onClick={exportLedgerCsv}
                    className="h-8 px-3 bg-white/40 hover:bg-white/60 text-[#1A1A1A]/60 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-white/40"
                >
                    <Download className="w-3 h-3 text-[#F4D03F]" />
                    Export
                </button>
            </div>

            <BeeYieldTabBar
                className="mb-6 relative z-10"
                tabs={analyticsTabs.map((t) => ({ id: t, label: t }))}
                activeTab={activeAnalyticsTab}
                onChange={setActiveAnalyticsTab}
            />

            <div className="h-[240px] w-full relative z-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-20 italic">
                        <Loader2 className="w-6 h-6 animate-spin text-[#F4D03F]" />
                        <span className="text-sm font-semibold text-gray-600">Loading…</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 italic">
                        <Banknote className="w-10 h-10 mb-2" />
                        <p className="text-sm font-semibold">No records yet</p>
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
                                        {data.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#F4D03F' : 'rgba(244,208,63,0.4)'} />
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
                                        <span className="text-sm font-semibold text-[#1A1A1A]/70">{d.category}</span>
                                    </div>
                                    <span className="text-[11px] font-black tabular-nums">{d.total} <span className="text-[8px] opacity-30">{currency}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full items-center p-4">
                        {[
                            { label: 'Sales VAT', value: vatSummaryData.outputVat, icon: ArrowUpRight, color: 'text-[#F4D03F]' },
                            { label: 'Expense VAT', value: vatSummaryData.inputVat, icon: ArrowDownRight, color: 'text-red-500/60' },
                            { label: 'VAT balance', value: vatSummaryData.balance, icon: Target, color: 'text-[#1B9157]', highlight: true },
                        ].map((item, i) => (
                            <div key={i} className={cn("p-6 space-y-4 rounded-2xl border bg-white/50", item.highlight ? "border-[#1B9157]/20" : "border-[#1A1A1A]/5")}>
                                <div className="flex justify-between items-start">
                                    <item.icon className={cn("w-5 h-5", item.color)} />
                                    <Badge className="bg-[#1A1A1A]/5 text-xs font-semibold text-[#1A1A1A]/50 border-none px-2">{i === 2 ? 'Summary' : 'VAT'}</Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-[#1A1A1A]/50">{item.label}</p>
                                    <p className={cn("text-xl font-black tabular-nums tracking-tighter italic", item.color)}>
                                        {item.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                        <span className="text-xs opacity-60 ml-1">{currency}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </BeeYieldCard>
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
        const tid = toast.loading('Generating PDF…');
        try {
            const doc = new jsPDF();
            doc.setFillColor(26, 26, 26);
            doc.rect(0, 0, 210, 30, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text('BeeYield invoice', 20, 20);
            
            doc.setTextColor(26, 26, 26);
            doc.setFontSize(10);
            doc.text(`Origin: ${sellerName}`, 20, 50);
            doc.text(`Target: ${buyerName}`, 20, 58);
            
            autoTable(doc, {
                startY: 70,
                head: [['Item', 'Description', 'Qty', 'Total']],
                body: [['1', newDocDescription || 'Invoice item', '1', `${newDocAmount} ${currency}`]],
                theme: 'grid',
                headStyles: { fillColor: [244, 208, 63], textColor: [26, 26, 26], fontStyle: 'bold' }
            });
            
            doc.save(`beeyield-invoice-${Date.now()}.pdf`);
            setIsNewDocFormOpen(false);
            toast.success('Saved', { id: tid });
        } catch (e) {
            toast.error('Could not generate PDF', { id: tid });
        }
    };

    return (
        <BeeYieldPageShell className="p-4 lg:p-6 space-y-6 pb-20 max-w-7xl mx-auto">
            <BeeYieldPageHeader
                icon={CreditCard}
                label="Billing"
                onBack={() => onTabChange('home')}
                title={<>Billing <span className="text-[#F4D03F]">overview</span></>}
                subtitle="Track revenue, costs, and invoices."
                actions={
                    <Button
                        onClick={() => setIsNewDocFormOpen(true)}
                        className={cn(glass.btnPrimary, "h-8 px-4 text-xs font-semibold flex items-center gap-2")}
                    >
                        <Plus className="w-3.5 h-3.5" /> New entry
                    </Button>
                }
            />

            <BeeYieldTabBar
                tabs={['Overview', 'Ledger', 'Subscription', 'Sync'].map((t) => ({ id: t, label: t }))}
                activeTab={activeSubTab}
                onChange={setActiveSubTab}
                className="relative z-10"
            />

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-40">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F4D03F] mb-4" />
                    <span className="text-sm font-semibold text-gray-600">Loading billing data…</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {activeSubTab === 'Overview' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Revenue', value: `${overview?.total_revenue?.toLocaleString()}`, icon: TrendingUp, color: 'text-[#1B9157]', bg: 'bg-[#1B9157]' },
                                    { label: 'Total Costs', value: `${overview?.total_costs?.toLocaleString()}`, icon: Banknote, color: 'text-red-500', bg: 'bg-red-500' },
                                    { label: 'Net Result', value: `${overview?.net_result?.toLocaleString()}`, icon: Target, color: 'text-[#1A1A1A]', bg: 'bg-[#1A1A1A]' },
                                    { label: 'Outstanding', value: `${overview?.outstanding_invoices}`, icon: FileText, color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]' },
                                ].map((stat, i) => (
                                    <div key={i} className={cn(glass.card, "p-4 space-y-1.5 bg-white/40 backdrop-blur-xl shadow-xl border-white/20 rounded-[2rem] relative overflow-hidden group")}>
                                        <div className={cn("absolute top-0 left-0 w-full h-[3px] opacity-20", stat.bg)} />
                                        <p className="text-xs text-gray-500">{stat.label}</p>
                                        <div className="flex items-baseline justify-between gap-2">
                                            <p className={cn("text-xl font-black tracking-tighter truncate", stat.color)}>{stat.value}</p>
                                            <span className="text-xs font-semibold text-gray-500">{currency}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <AnalyticsSection currency={currency} />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { title: 'Transaction history', sub: 'See past transactions', icon: History, action: 'Ledger', theme: '#F4D03F' },
                                    { title: 'Plan & limits', sub: 'Manage your plan', icon: Shield, action: 'Subscription', theme: '#1B9157' },
                                    { title: 'Sync', sub: 'Connect billing and integrations', icon: RefreshCw, action: 'Sync', theme: '#3B82F6' },
                                ].map((card, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveSubTab(card.action)}
                                        className={cn(glass.card, "p-5 flex items-center gap-4 border-white/20 bg-white/40 backdrop-blur-xl rounded-[2rem] group text-left transition-all hover:border-[#F4D03F]/40 hover:shadow-xl")}
                                    >
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/40 bg-white shadow-sm group-hover:scale-105 transition-transform">
                                            <card.icon className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: card.theme }} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold group-hover:text-[#F4D03F] transition-colors">{card.title}</h4>
                                            <p className="text-xs text-gray-500">{card.sub}</p>
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
                                    <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight">Transaction <span className="text-[#1B9157]">history</span></h3>
                                    <p className="text-sm text-gray-500">A record of your recent transactions.</p>
                                </div>
                                <div className="relative group w-full md:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#1B9157] transition-all" />
                                    <input
                                        placeholder="Search records..."
                                        className="w-full h-9 bg-white border border-gray-200 rounded-xl pl-9 pr-4 text-[11px] font-medium text-[#1A1A1A] outline-none focus:ring-1 focus:ring-[#1B9157]/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div className={cn(glass.card, "p-0 overflow-hidden bg-white/50 backdrop-blur-md rounded-2xl min-h-[400px] shadow-sm")}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {transactions.map((tx, i) => (
                                                <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                                                    <td className="px-6 py-4 text-[10px] font-medium text-gray-400 tabular-nums">#{(tx.id || i).toString().slice(0, 8)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1B9157] transition-colors">{tx.description || 'Service Payment'}</span>
                                                            <span className="text-xs text-gray-500 mt-0.5">Ref: {tx.reference || 'Auto'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-[10px] font-medium text-gray-500">
                                                        {new Date(tx.date || tx.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn("text-sm font-bold tabular-nums", tx.type === 'expense' ? 'text-red-500' : 'text-[#1B9157]')}>
                                                            {tx.type === 'expense' ? '-' : '+'}{tx.amount?.toLocaleString()} <span className="text-[10px] opacity-40">{currency}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => setSyncingId(tx.id || i)}
                                                                className="h-8 w-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#F4D03F] transition-colors shadow-sm"
                                                                aria-label="Sync transaction"
                                                                title="Sync transaction"
                                                            >
                                                                {syncingId === (tx.id || i) ? <Loader2 className="w-4 h-4 animate-spin text-[#F4D03F]" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                                            </button>
                                                            <button
                                                                className="h-8 w-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] transition-colors shadow-sm"
                                                                aria-label="View transaction details"
                                                                title="View transaction details"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
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
                            <div className={cn(glass.card, "p-6 relative overflow-hidden group border-gray-100 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm")}>
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#1B9157]/5 rounded-full blur-3xl" />
                                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                                    <div className="w-12 h-12 rounded-xl bg-[#1B9157] flex items-center justify-center text-white shadow-lg shadow-[#1B9157]/20">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 space-y-0.5 text-center md:text-left">
                                        <Badge className="bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20 px-2 py-0.5 rounded-md font-semibold text-xs">Current plan</Badge>
                                        <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">BeeYield <span className="text-[#F4D03F]">Pro</span></h2>
                                        <p className="text-sm text-gray-500">Enterprise scale · Unlimited analytics</p>
                                    </div>
                                    <div className="flex flex-col items-center md:items-end gap-1.5">
                                        <div className="text-2xl font-bold text-[#1A1A1A] tracking-tight">1,200 <span className="text-xs font-semibold opacity-60">{currency}/mo</span></div>
                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 text-xs font-semibold text-gray-500">
                                            <Clock className="w-3.5 h-3.5 opacity-40" /> Renewal: 12 OCT
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <SubscriptionPlans currentTier="pro" onUpgrade={(p) => toast.info(`Upgrading to ${p} tier...`)} />
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={() => setIsNewDocFormOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className={cn(glass.card, "w-full max-w-xl p-0 overflow-hidden shadow-2xl bg-white border-gray-100 relative z-10 rounded-3xl")}>
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-bold text-[#1A1A1A] tracking-tight leading-none">New <span className="text-[#1B9157]">entry</span></h3>
                                    <p className="text-sm text-gray-500 mt-1">Add a record to your billing history.</p>
                                </div>
                                <button
                                    onClick={() => setIsNewDocFormOpen(false)}
                                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                                    aria-label="Close new entry dialog"
                                    title="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-semibold text-gray-600 ml-1">Type</Label>
                                            <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-100 gap-1">
                                                {['invoice', 'receipt', 'expense'].map(t => (
                                                    <button key={t} onClick={() => setNewDocType(t)} className={cn("h-8 flex-1 rounded-lg text-sm font-semibold transition-all capitalize", newDocType === t ? "bg-white text-[#1A1A1A] shadow-sm border border-gray-100" : "text-gray-500")}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-semibold text-gray-600 ml-1">Amount ({currency})</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input type="number" value={newDocAmount || ''} onChange={(e) => setNewDocAmount(parseFloat(e.target.value) || 0)} className="h-10 font-bold text-xl pl-10 bg-gray-50 border-gray-100 rounded-xl" placeholder="0.00" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <BeeYieldFormField id="sellerName" label="Issuing Entity">
                                            <BeeYieldTextInput id="sellerName" value={sellerName} onChange={(e) => setSellerName(e.target.value)} />
                                        </BeeYieldFormField>
                                        <BeeYieldFormField id="buyerName" label="Recipient">
                                            <BeeYieldTextInput id="buyerName" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Legal name..." />
                                        </BeeYieldFormField>
                                    </div>
                                </div>

                                <BeeYieldFormField id="newDocDescription" label="Description">
                                    <BeeYieldTextInput id="newDocDescription" value={newDocDescription} onChange={(e) => setNewDocDescription(e.target.value)} placeholder="Record details..." />
                                </BeeYieldFormField>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2.5 opacity-40">
                                        <ShieldCheck className="w-5 h-5 text-[#1B9157]" />
                                        <p className="text-xs font-semibold text-gray-600">Secure entry</p>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <Button variant="ghost" type="button" onClick={() => setIsNewDocFormOpen(false)} className="h-10 flex-1 md:px-6 rounded-xl text-sm font-semibold text-gray-500 hover:text-[#1A1A1A]">Cancel</Button>
                                        <Button onClick={handleGenerateInvoice} className={cn(glass.btnPrimary, "h-10 flex-1 md:px-10 rounded-xl text-sm font-semibold shadow-lg shadow-[#1B9157]/10")}><ShieldCheck className="w-4 h-4 mr-2" /> Save entry</Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </BeeYieldPageShell>
    );
};

export default BillingView;
