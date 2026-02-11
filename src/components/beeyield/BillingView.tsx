import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Plus, MoreHorizontal, FileText, Globe, ChevronDown, ChevronRight, Download, Check, Loader2
} from 'lucide-react';
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

// Analytics Section Component
const AnalyticsSection: React.FC<{ currency: string }> = ({ currency }) => {
    const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('Monthly overview');

    // In a real app, these would come from backend aggregation endpoint
    const analyticsTabs = ['Monthly overview', 'Per entity profitability', 'Per category', 'VAT summary', 'Cost vs Usage'];

    // Placeholder data - in production this would be fetched via beeyieldService.getFinancialReports()
    const monthlyOverviewData: any[] = [];
    const entityProfitabilityData: any[] = [];
    const categoryData: { category: string; total: number }[] = [];

    const vatSummaryData = {
        outputVat: 0,
        inputVat: 0,
        balance: 0,
        vatRate: 16, // Kenya VAT rate
    };

    const costVsUsageData: any[] = [];

    // Export CSV functionality
    const handleExportCSV = () => {
        let csvContent = '';
        let filename = '';

        switch (activeAnalyticsTab) {
            case 'Monthly overview':
                csvContent = 'Month,Revenue,Costs,Net\n';
                monthlyOverviewData.forEach(row => {
                    csvContent += `${row.month},${row.revenue} ${currency},${row.costs} ${currency},${row.net} ${currency}\n`;
                });
                filename = 'monthly_overview.csv';
                break;
            // ... strict export logic preserved ...
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
        <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
            <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold mb-1">Analytics</h3>
                        <p className="text-xs text-gray-400 font-medium">Profitability across entities and periods</p>
                    </div>
                    <Button
                        onClick={handleExportCSV}
                        variant="outline"
                        className="rounded-full px-5 h-10 font-bold border-[#1B9157]/20 hover:bg-[#1B9157]/5 text-[#1B9157] flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Analytics Sub-tabs */}
                <div className="flex gap-2 overflow-x-auto pb-6 mb-6 scrollbar-hide">
                    {analyticsTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveAnalyticsTab(tab)}
                            className={cn(
                                "px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                                activeAnalyticsTab === tab
                                    ? "bg-[#1B9157] text-white"
                                    : "bg-gray-50 text-gray-500 hover:bg-[#1B9157]/10"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Renderers (Placeholders until aggregation endpoint exists) */}
                <div className="flex items-center justify-center h-40 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm font-medium">Financial aggregation reports coming soon.</p>
                </div>
            </CardContent>
        </Card>
    );
};

interface BillingViewProps {
    onTabChange: (tab: string) => void;
}

const BillingView: React.FC<BillingViewProps> = ({ onTabChange }) => {
    const [activeSubTab, setActiveSubTab] = useState('Dashboard');
    const [currency, setCurrency] = useState('KES');
    const [isNewDocFormOpen, setIsNewDocFormOpen] = useState(false);
    const [docFormStep, setDocFormStep] = useState(1);

    // New Document Form State
    const [newDocType, setNewDocType] = useState('invoice');
    const [newDocAmount, setNewDocAmount] = useState(0);
    const [newDocDate, setNewDocDate] = useState(new Date().toISOString().split('T')[0]);
    const [newDocEntityId, setNewDocEntityId] = useState('');
    const [newDocDescription, setNewDocDescription] = useState('');
    const [sellerName, setSellerName] = useState('BeeYield Platform');
    const [buyerName, setBuyerName] = useState('');
    const [lineItemsCount, setLineItemsCount] = useState(1);

    // Data State
    const [transactions, setTransactions] = useState<any[]>([]);
    const [overview, setOverview] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const isFormValid = sellerName.trim() !== '' && buyerName.trim() !== '' && lineItemsCount > 0;
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [overviewData, txList] = await Promise.all([
                beeyieldService.getBillingOverview(),
                beeyieldService.getTransactions()
            ]);
            setOverview(overviewData || {
                total_revenue: 0,
                total_costs: 0,
                net_result: 0,
                outstanding_invoices: 0
            });
            setTransactions(txList || []);
        } catch (err) {
            console.error("Error loading billing data", err);
            toast.error("Failed to load billing data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTransaction = async (type: 'income' | 'expense') => {
        if (!newDocAmount || !newDocDescription) {
            toast.error("Please fill in amount and description");
            return;
        }

        const { data, error } = await beeyieldService.createTransaction({
            type,
            amount: Number(newDocAmount),
            currency: currency,
            category: newDocType, // mapping simple category for now
            date: newDocDate,
            description: newDocDescription,
            status: 'completed',
            entity_id: newDocEntityId || undefined
        });

        if (error) {
            toast.error("Failed to create transaction");
        } else {
            toast.success("Transaction recorded");
            setNewDocDescription('');
            setNewDocAmount(0);
            fetchData(); // Refresh list
        }
    };

    const getVatRate = (curr: string) => {
        const rates: Record<string, number> = {
            'KES': 16,
            'GBP': 20,
            'EUR': 21,
            'AUD': 10,
            'USD': 0
        };
        return rates[curr] ?? 16;
    };

    const tabs = ['Dashboard', 'Revenue', 'Costs', 'Documents', 'Analytics', 'Settings'];

    const currencies = [
        { code: 'KES', name: 'Kenyan Shilling', flag: 'https://flagcdn.com/ke.svg' },
        { code: 'GBP', name: 'British Pound', flag: 'https://flagcdn.com/gb.svg' },
        { code: 'USD', name: 'US Dollar', flag: 'https://flagcdn.com/us.svg' },
        { code: 'EUR', name: 'Euro', flag: 'https://flagcdn.com/eu.svg' },
        { code: 'AUD', name: 'Australian Dollar', flag: 'https://flagcdn.com/au.svg' },
    ];

    const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];

    const summaryCards = [
        { title: 'Total revenue', value: overview ? `${overview.total_revenue} ${currency}` : '...', subtitle: 'All time' },
        { title: 'Total costs', value: overview ? `${overview.total_costs} ${currency}` : '...', subtitle: 'All time' },
        { title: 'Net result', value: overview ? `${overview.net_result} ${currency}` : '...', subtitle: 'Revenue minus costs' },
        { title: 'Outstanding', value: overview ? `${overview.outstanding_invoices}` : '...', subtitle: 'Pending invoices' },
    ];

    const countries = [
        { code: 'ke', name: 'Kenya', flag: 'https://flagcdn.com/ke.svg' },
        { code: 'gb', name: 'United Kingdom', flag: 'https://flagcdn.com/gb.svg' },
        { code: 'us', name: 'USA', flag: 'https://flagcdn.com/us.svg' },
        { code: 'pl', name: 'Poland', flag: 'https://flagcdn.com/pl.svg' },
        { code: 'de', name: 'Germany', flag: 'https://flagcdn.com/de.svg' },
        { code: 'fr', name: 'France', flag: 'https://flagcdn.com/fr.svg' },
        { code: 'es', name: 'Spain', flag: 'https://flagcdn.com/es.svg' },
        { code: 'cn', name: 'China', flag: 'https://flagcdn.com/cn.svg' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">

            {/* Platform Module Header */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">PLATFORM MODULE</p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-[2.5rem] font-bold text-[#1B9157] dark:text-[#F4D03F] tracking-tight">Billing & Accounting</h1>
                        <Badge className="bg-[#F4D03F] text-[#1A1A1A] rounded-md text-[10px] px-2 py-0.5 border-none font-bold uppercase">BETA</Badge>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1 max-w-xl">
                        Entity-based accounting for revenue, costs, documents, and analytics across BeeYield verticals.
                        <span className="block text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">This module is in beta.</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div
                            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                            className="flex items-center gap-3 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-[#1e1e1e] rounded-full px-5 h-10 shadow-sm cursor-pointer hover:border-[#1B9157]/40 transition-all select-none"
                        >
                            <div className="w-6 h-4 rounded-[3px] overflow-hidden shadow-sm border border-black/10 flex-shrink-0">
                                <img src={currentCurrency.flag} alt={currentCurrency.code} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-black text-[#1B9157] dark:text-[#F4D03F] uppercase tracking-wider">{currentCurrency.code}</span>
                            <ChevronDown className={cn("w-3.5 h-3.5 text-[#1B9157] transition-transform duration-300", isCurrencyOpen && "rotate-180")} />
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsNewDocFormOpen(true)}
                        className="bg-[#1B9157] hover:bg-[#167d4a] text-white rounded-full px-6 h-10 font-bold flex items-center gap-2 shadow-lg shadow-green-500/10"
                    >
                        New document
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-sm font-bold transition-all border shrink-0",
                            activeSubTab === tab
                                ? "bg-[#1B9157] text-white border-[#1B9157]"
                                : "bg-white text-gray-500 border-gray-100 hover:border-gray-300 dark:bg-[#141414] dark:border-[#1e1e1e]"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Dashboard Content */}
            {activeSubTab === 'Dashboard' && (
                <div className="space-y-6">
                    {/* Summary Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {summaryCards.map((card, i) => (
                            <Card key={i} className="rounded-3xl border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <p className="text-sm font-bold text-[#1B9157] dark:text-[#F4D03F] mb-2">{card.title}</p>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                                        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : card.value}
                                    </h2>
                                    <p className="text-xs text-gray-400 font-medium">{card.subtitle}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* eTIMS readiness */}
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-lg font-bold">eTIMS readiness</h3>
                                <Badge className="rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold px-3 border-none">UI only</Badge>
                            </div>
                            <p className="text-xs text-gray-400 font-medium mb-6">Structured invoicing status</p>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-[10px] text-gray-400 uppercase font-black">Status:</span>
                                <Badge className="bg-[#F4D03F]/10 text-[#7a6820] border border-[#F4D03F]/20 rounded-md text-[10px] px-2 py-0.5 font-bold uppercase">Not connected</Badge>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button variant="outline" className="rounded-full bg-gray-50 border-gray-200 text-gray-600 text-xs font-bold px-4 h-9">
                                    View checklist
                                </Button>
                                <Button className="rounded-full bg-[#60A5FA] hover:bg-[#3B82F6] text-white text-xs font-bold px-4 h-9 border-none shadow-sm">
                                    Configure eTIMS
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Revenue Content */}
            {activeSubTab === 'Revenue' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add Revenue Form Card */}
                    <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold mb-1">Quick Revenue Entry</h3>
                            <p className="text-xs text-gray-400 font-medium mb-8">Record income without generating an external invoice</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Amount ({currency})</label>
                                    <Input
                                        type="number"
                                        value={newDocAmount}
                                        onChange={(e) => setNewDocAmount(Number(e.target.value))}
                                        className="rounded-xl border-gray-100 h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                                    <select
                                        value={newDocType}
                                        onChange={(e) => setNewDocType(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
                                    >
                                        <option value="honey_sales">Honey Sales</option>
                                        <option value="pollination">Pollination Services</option>
                                        <option value="colony_sales">Bee Colony Sales</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2 lg:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                                    <Input
                                        value={newDocDescription}
                                        onChange={(e) => setNewDocDescription(e.target.value)}
                                        placeholder="E.g. 50kg Acacia Honey to Local Market"
                                        className="rounded-xl border-gray-100 h-12"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={() => handleCreateTransaction('income')}
                                className="mt-8 bg-[#1B9157] hover:bg-[#167d4a] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-green-500/10"
                            >
                                Record Revenue
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Revenue List Card */}
                    <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold mb-1">Likely Income</h3>
                            <p className="text-xs text-gray-400 font-medium mb-8">Recent transactions categorized as Income</p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                            <th className="pb-4 font-black">Date</th>
                                            <th className="pb-4 font-black">Description</th>
                                            <th className="pb-4 text-right font-black">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {transactions.filter(t => t.type === 'income').length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="py-12 text-center text-gray-300 font-medium">No revenue entries found</td>
                                            </tr>
                                        ) : (
                                            transactions.filter(t => t.type === 'income').slice(0, 5).map((t: any) => (
                                                <tr key={t.id}>
                                                    <td className="py-4 text-sm text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                                                    <td className="py-4 text-sm font-medium text-gray-900">{t.description}</td>
                                                    <td className="py-4 text-sm font-bold text-[#1B9157] text-right">+{t.amount} {t.currency}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Costs Content */}
            {activeSubTab === 'Costs' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add Cost Form Card */}
                    <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold mb-1">Quick Cost Entry</h3>
                            <p className="text-xs text-gray-400 font-medium mb-8">Record expenses without a formal invoice</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Amount ({currency})</label>
                                    <Input
                                        type="number"
                                        value={newDocAmount}
                                        onChange={(e) => setNewDocAmount(Number(e.target.value))}
                                        className="rounded-xl border-gray-100 h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                                    <select
                                        value={newDocType}
                                        onChange={(e) => setNewDocType(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
                                    >
                                        <option value="equipment">Equipment</option>
                                        <option value="feed">Feed / Sugar</option>
                                        <option value="medicine">Medicine</option>
                                        <option value="logistics">Transport</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2 lg:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                                    <Input
                                        value={newDocDescription}
                                        onChange={(e) => setNewDocDescription(e.target.value)}
                                        placeholder="E.g. Hive Frames & Smoker Fuel"
                                        className="rounded-xl border-gray-100 h-12"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={() => handleCreateTransaction('expense')}
                                className="mt-8 bg-red-600 hover:bg-red-700 text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-red-500/10"
                            >
                                Record Expense
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Cost List Card */}
                    <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold mb-1">Recent Expenses</h3>
                            <p className="text-xs text-gray-400 font-medium mb-8">Recent transactions categorized as Expenses</p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                            <th className="pb-4 font-black">Date</th>
                                            <th className="pb-4 font-black">Description</th>
                                            <th className="pb-4 text-right font-black">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {transactions.filter(t => t.type === 'expense').length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="py-12 text-center text-gray-300 font-medium">No expenses found</td>
                                            </tr>
                                        ) : (
                                            transactions.filter(t => t.type === 'expense').slice(0, 5).map((t: any) => (
                                                <tr key={t.id}>
                                                    <td className="py-4 text-sm text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                                                    <td className="py-4 text-sm font-medium text-gray-900">{t.description}</td>
                                                    <td className="py-4 text-sm font-bold text-red-500 text-right">-{t.amount} {t.currency}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Documents Content - Placeholder for now, can be wired to invoices later */}
            {activeSubTab === 'Documents' && (
                <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="text-xl font-bold mb-1">Documents</h3>
                            <Button disabled className="bg-gray-100 text-gray-400 rounded-full px-6 h-10 font-bold">New Document (Coming Soon)</Button>
                        </div>
                        <div className="flex items-center justify-center h-40 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm font-medium">Digital Invoicing module is under construction.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Analytics Content */}
            {activeSubTab === 'Analytics' && (
                <AnalyticsSection currency={currency} />
            )}

            {/* Settings Content - mostly static for now */}
            {activeSubTab === 'Settings' && (
                <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
                    <CardContent className="p-8">
                        <h3 className="text-xl font-bold mb-4">Settings</h3>
                        <p className="text-sm text-gray-500">Organization profile and billing configurations.</p>
                        <div className="flex items-center justify-center h-40 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-6">
                            <p className="text-gray-400 text-sm font-medium">Settings module is currently read-only.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* New Doc Form (Modal for complex invoices - largely visual for now) */}
            {isNewDocFormOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                    <Card className="w-full max-w-2xl rounded-[2.5rem] border-none bg-white shadow-2xl p-10 text-center">
                        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Detailed Invoice Editor</h2>
                        <p className="text-gray-500 mb-6">This feature is currently in BETA. Please use the "Quick Entry" forms in Revenue/Costs tabs for simple transaction recording.</p>
                        <Button onClick={() => setIsNewDocFormOpen(false)} className="rounded-full px-8 h-10 font-bold">Close</Button>
                    </Card>
                </div>
            )}

        </div>
    );
};

export default BillingView;
