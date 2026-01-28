import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Plus, MoreHorizontal, FileText, Globe, ChevronDown, ChevronRight, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Analytics Section Component
const AnalyticsSection: React.FC<{ currency: string }> = ({ currency }) => {
    const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('Monthly overview');

    const analyticsTabs = ['Monthly overview', 'Per entity profitability', 'Per category', 'VAT summary', 'Cost vs Usage'];

    // Data for each tab
    const monthlyOverviewData = [
        { month: '2025-08', revenue: 0, costs: 0, net: 0 },
        { month: '2025-09', revenue: 0, costs: 0, net: 0 },
        { month: '2025-10', revenue: 0, costs: 0, net: 0 },
        { month: '2025-11', revenue: 0, costs: 0, net: 0 },
        { month: '2025-12', revenue: 0, costs: 0, net: 0 },
        { month: '2026-01', revenue: 0, costs: 0, net: 0 },
    ];

    const entityProfitabilityData = [
        { type: 'Apiary', revenue: 0, costs: 0, net: 0 },
        { type: 'Hive', revenue: 0, costs: 0, net: 0 },
        { type: 'Meter', revenue: 0, costs: 0, net: 0 },
        { type: 'Medical facility', revenue: 0, costs: 0, net: 0 },
        { type: 'Patient', revenue: 0, costs: 0, net: 0 },
        { type: 'Project', revenue: 0, costs: 0, net: 0 },
        { type: 'Other', revenue: 0, costs: 0, net: 0 },
    ];

    const categoryData: { category: string; total: number }[] = [];

    const vatSummaryData = {
        outputVat: 0,
        inputVat: 0,
        balance: 0,
        vatRate: 16, // Kenya VAT rate
    };

    const costVsUsageData = [
        { period: '2025-08', costs: 0, usage: 0 },
        { period: '2025-09', costs: 0, usage: 0 },
        { period: '2025-10', costs: 0, usage: 0 },
        { period: '2025-11', costs: 0, usage: 0 },
        { period: '2025-12', costs: 0, usage: 0 },
        { period: '2026-01', costs: 0, usage: 0 },
    ];

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
            case 'Per entity profitability':
                csvContent = 'Entity Type,Revenue,Costs,Net\n';
                entityProfitabilityData.forEach(row => {
                    csvContent += `${row.type},${row.revenue} ${currency},${row.costs} ${currency},${row.net} ${currency}\n`;
                });
                filename = 'entity_profitability.csv';
                break;
            case 'Per category':
                csvContent = 'Category,Total\n';
                categoryData.forEach(row => {
                    csvContent += `${row.category},${row.total} ${currency}\n`;
                });
                filename = 'costs_by_category.csv';
                break;
            case 'VAT summary':
                csvContent = 'Description,Amount\n';
                csvContent += `Output VAT (16%),${vatSummaryData.outputVat} ${currency}\n`;
                csvContent += `VAT Input,${vatSummaryData.inputVat} ${currency}\n`;
                csvContent += `Balance,${vatSummaryData.balance} ${currency}\n`;
                filename = 'vat_summary.csv';
                break;
            case 'Cost vs Usage':
                csvContent = 'Period,Costs,Usage\n';
                costVsUsageData.forEach(row => {
                    csvContent += `${row.period},${row.costs} ${currency},${row.usage}\n`;
                });
                filename = 'cost_vs_usage.csv';
                break;
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

                {/* Monthly Overview */}
                {activeAnalyticsTab === 'Monthly overview' && (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <h4 className="text-lg font-bold mb-4">Monthly overview</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                        <th className="pb-4 font-black">Month</th>
                                        <th className="pb-4 font-black">Revenue</th>
                                        <th className="pb-4 font-black">Costs</th>
                                        <th className="pb-4 font-black">Net</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {monthlyOverviewData.map((row, i) => (
                                        <tr key={i}>
                                            <td className="py-4 text-sm font-medium text-gray-600">{row.month}</td>
                                            <td className="py-4 text-sm font-bold text-[#1B9157]">{row.revenue} {currency}</td>
                                            <td className="py-4 text-sm font-bold text-red-500">{row.costs} {currency}</td>
                                            <td className="py-4 text-sm font-bold text-gray-900">{row.net} {currency}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Per Entity Profitability */}
                {activeAnalyticsTab === 'Per entity profitability' && (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <h4 className="text-lg font-bold mb-4">Profitability per entity type</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                        <th className="pb-4 font-black">Entity Type</th>
                                        <th className="pb-4 font-black">Revenue</th>
                                        <th className="pb-4 font-black">Costs</th>
                                        <th className="pb-4 font-black">Net</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {entityProfitabilityData.map((row, i) => (
                                        <tr key={i}>
                                            <td className="py-4 text-sm font-medium text-[#1B9157] hover:underline cursor-pointer">{row.type}</td>
                                            <td className="py-4 text-sm font-bold text-[#1B9157]">{row.revenue} {currency}</td>
                                            <td className="py-4 text-sm font-bold text-red-500">{row.costs} {currency}</td>
                                            <td className="py-4 text-sm font-bold text-gray-900">{row.net} {currency}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Per Category */}
                {activeAnalyticsTab === 'Per category' && (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <h4 className="text-lg font-bold mb-4">Costs by category</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                        <th className="pb-4 font-black">Category</th>
                                        <th className="pb-4 font-black text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {categoryData.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="py-12 text-center text-gray-300 font-medium">
                                                No category data available
                                            </td>
                                        </tr>
                                    ) : (
                                        categoryData.map((row, i) => (
                                            <tr key={i}>
                                                <td className="py-4 text-sm font-medium text-gray-600">{row.category}</td>
                                                <td className="py-4 text-sm font-bold text-gray-900 text-right">{row.total} {currency}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* VAT Summary (Kenya info) */}
                {activeAnalyticsTab === 'VAT summary' && (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <h4 className="text-lg font-bold mb-4">VAT summary</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                <span className="text-sm text-gray-600">Output VAT (16% - Kenya Standard Rate):</span>
                                <span className="text-sm font-bold text-gray-900">{vatSummaryData.outputVat} {currency}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                <span className="text-sm text-gray-600">VAT Input:</span>
                                <span className="text-sm font-bold text-gray-900">{vatSummaryData.inputVat} {currency}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                <span className="text-sm font-bold text-gray-900">Balance:</span>
                                <span className="text-lg font-black text-gray-900">{vatSummaryData.balance} {currency}</span>
                            </div>
                            <div className="mt-6">
                                <Badge className="bg-gray-100 text-gray-500 rounded-md text-[10px] px-3 py-1 border-none font-bold">
                                    Placeholder
                                </Badge>
                                <p className="text-xs text-gray-400 mt-2">
                                    VAT calculations based on Kenya Revenue Authority (KRA) standard rate of 16%.
                                    For exempt or zero-rated supplies, consult your tax advisor.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cost vs Usage */}
                {activeAnalyticsTab === 'Cost vs Usage' && (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <h4 className="text-lg font-bold mb-4">Cost vs Usage</h4>
                        <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/30">
                            <p className="text-sm text-gray-500">
                                Placeholder for IoT usage-based billing comparisons (meters, patients, devices).
                            </p>
                        </div>
                    </div>
                )}
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
    const [sellerName, setSellerName] = useState('BeeYield Platform');
    const [buyerName, setBuyerName] = useState('');
    const [lineItemsCount, setLineItemsCount] = useState(1);

    const isFormValid = sellerName.trim() !== '' && buyerName.trim() !== '' && lineItemsCount > 0;

    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

    const getVatRate = (curr: string) => {
        const rates: Record<string, number> = {
            'KES': 16,
            'GBP': 20,
            'EUR': 21,
            'AUD': 10,
            'USD': 0
        };
        return rates[curr] ?? 23;
    };

    const tabs = ['Dashboard', 'Revenue', 'Costs', 'Documents', 'Analytics', 'Settings'];

    const currencies = [
        { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
        { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
        { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
        { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
        { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    ];

    const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];

    const summaryCards = [
        { title: 'Total revenue (month)', value: `0 ${currency}`, subtitle: 'Invoices and receipts' },
        { title: 'Total costs (month)', value: `0 ${currency}`, subtitle: 'Expenses and recurring fees' },
        { title: 'Net result', value: `0 ${currency}`, subtitle: 'Revenue minus costs' },
        { title: 'Outstanding documents', value: '0', subtitle: 'Draft, issued, overdue' },
    ];

    const revenueVsCosts = [
        { month: '2025-08', revenue: `0 ${currency}`, costs: `0 ${currency}` },
        { month: '2025-09', revenue: `0 ${currency}`, costs: `0 ${currency}` },
        { month: '2025-10', revenue: `0 ${currency}`, costs: `0 ${currency}` },
        { month: '2025-11', revenue: `0 ${currency}`, costs: `0 ${currency}` },
        { month: '2025-12', revenue: `0 ${currency}`, costs: `0 ${currency}` },
        { month: '2026-01', revenue: `0 ${currency}`, costs: `0 ${currency}` },
    ];

    const profitByEntityType = [
        { type: 'Apiary', value: `0 ${currency}` },
        { type: 'Hive', value: `0 ${currency}` },
        { type: 'Meter', value: `0 ${currency}` },
        { type: 'Medical facility', value: `0 ${currency}` },
        { type: 'Patient', value: `0 ${currency}` },
        { type: 'Project', value: `0 ${currency}` },
        { type: 'Other', value: `0 ${currency}` },
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
                            <span className="text-lg">{currentCurrency.flag}</span>
                            <span className="text-sm font-black text-[#1B9157] dark:text-[#F4D03F] uppercase tracking-wider">{currentCurrency.code}</span>
                            <ChevronDown className={cn("w-3.5 h-3.5 text-[#1B9157] transition-transform duration-300", isCurrencyOpen && "rotate-180")} />
                        </div>

                        {isCurrencyOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsCurrencyOpen(false)} />
                                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-[#1e1e1e] rounded-[1.5rem] shadow-2xl z-50 p-2 animate-in fade-in zoom-in duration-200">
                                    <div className="px-4 py-3 mb-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select currency</p>
                                    </div>
                                    <div className="space-y-1">
                                        {currencies.map((c) => (
                                            <button
                                                key={c.code}
                                                onClick={() => {
                                                    setCurrency(c.code);
                                                    setIsCurrencyOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                                                    currency === c.code
                                                        ? "bg-[#F8FAFC] dark:bg-[#1e1e1e]"
                                                        : "hover:bg-gray-50 dark:hover:bg-[#141414]"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{c.flag}</span>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-[#0F172A] dark:text-white">{c.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase">{c.code}</p>
                                                    </div>
                                                </div>
                                                {currency === c.code && <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <Button
                        onClick={() => setActiveSubTab('Documents')}
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
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{card.value}</h2>
                                    <p className="text-xs text-gray-400 font-medium">{card.subtitle}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Charts/Details Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Revenue vs costs */}
                        <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-lg font-bold">Revenue vs costs</h3>
                                    <Badge variant="secondary" className="rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold px-3 border-none">Series</Badge>
                                </div>
                                <p className="text-xs text-gray-400 font-medium mb-6">Last 6 months</p>
                                <div className="space-y-4">
                                    {revenueVsCosts.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">{item.month}</span>
                                            <span className="text-gray-900 dark:text-white font-bold">{item.revenue} / {item.costs}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profit per entity type */}
                        <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-lg font-bold">Profit per entity type</h3>
                                    <Badge variant="secondary" className="rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold px-3 border-none">Series</Badge>
                                </div>
                                <p className="text-xs text-gray-400 font-medium mb-6">Revenue minus costs</p>
                                <div className="space-y-4">
                                    {profitByEntityType.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">{item.type}</span>
                                            <span className="text-gray-900 dark:text-white font-bold">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

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
                </div>
            )}

            {/* Revenue Content */}
            {activeSubTab === 'Revenue' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Add Revenue Form Card */}
                    <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold mb-1">Revenue</h3>
                            <p className="text-xs text-gray-400 font-medium mb-8">All revenue entries linked to entities</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Date</label>
                                    <Input type="date" defaultValue="2026-01-17" className="rounded-xl border-gray-100 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Source</label>
                                    <Input placeholder="e.g. Honey Sale" className="rounded-xl border-gray-100 h-12" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Amount ({currency})</label>
                                    <Input type="number" defaultValue="0" className="rounded-xl border-gray-100 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                                    <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none">
                                        <option>Honey Sales</option>
                                        <option>Pollination Services</option>
                                        <option>Bee Colony Sales</option>
                                        <option>Equipment Rental</option>
                                        <option>Consulting</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Entity type</label>
                                    <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none">
                                        <option>Apiary</option>
                                        <option>Hive</option>
                                        <option>Meter</option>
                                        <option>Project</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Entities</label>
                                    <Input placeholder="e.g. Apiary North" className="rounded-xl border-gray-100 h-12" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Payment Method</label>
                                    <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none">
                                        <option>Bank Transfer</option>
                                        <option>Cash</option>
                                        <option>Card</option>
                                        <option>Mobile Payment</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                                    <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none">
                                        <option>Paid</option>
                                        <option>Pending</option>
                                        <option>Overdue</option>
                                        <option>Draft</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Reference #</label>
                                    <Input placeholder="REF-2026-001" className="rounded-xl border-gray-100 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Project Code</label>
                                    <Input placeholder="PROJ-01" className="rounded-xl border-gray-100 h-12" />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Internal Notes</label>
                                    <Input placeholder="For internal reference only..." className="rounded-xl border-gray-100 h-12" />
                                </div>

                                <div className="space-y-2 md:col-span-2 lg:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                                    <Input placeholder="Additional details..." className="rounded-xl border-gray-100 h-12" />
                                </div>
                            </div>

                            <Button className="mt-8 bg-[#1B9157] hover:bg-[#167d4a] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-green-500/10">
                                Add revenue
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Revenue List Card */}
                    <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold mb-1">Revenue list</h3>
                            <p className="text-xs text-gray-400 font-medium mb-8">Tracked income outside invoices</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Date from</label>
                                    <Input type="date" className="rounded-xl border-gray-100 h-10" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Date to</label>
                                    <Input type="date" className="rounded-xl border-gray-100 h-10" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Entity type</label>
                                    <select className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none appearance-none">
                                        <option>All</option>
                                        <option>Apiary</option>
                                        <option>Hive</option>
                                    </select>
                                </div>
                                <div className="space-y-1 md:col-span-3">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Entities</label>
                                    <select className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none appearance-none">
                                        <option>All</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                            <th className="pb-4 font-black">Date</th>
                                            <th className="pb-4 font-black">Source</th>
                                            <th className="pb-4 font-black">Description</th>
                                            <th className="pb-4 font-black">Entities</th>
                                            <th className="pb-4 text-right font-black">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {/* Empty state or list items */}
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-gray-300 font-medium">
                                                No revenue entries found
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination/Scrollbar UI from screenshot */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="h-1.5 bg-gray-100 rounded-full flex-1 mx-4 relative overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 w-1/3 bg-[#1B9157] rounded-full" />
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-1 hover:bg-gray-50 rounded text-[#1B9157]"><Plus className="w-3 h-3 rotate-45" /></button>
                                    <button className="p-1 hover:bg-gray-50 rounded text-[#1B9157]"><Plus className="w-3 h-3 rotate-45" /></button>
                                </div>
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
                            <h3 className="text-xl font-bold mb-1">Costs</h3>
                            <p className="text-xs text-gray-400 font-medium mb-8">Add and allocate expenses to entities</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Date</label>
                                    <Input type="date" defaultValue="2026-01-17" className="rounded-xl border-gray-100 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                                    <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none">
                                        <option>Services</option>
                                        <option>Materials</option>
                                        <option>Energy</option>
                                        <option>Rent</option>
                                        <option>Logistics</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Amount ({currency})</label>
                                    <Input type="number" defaultValue="0" className="rounded-xl border-gray-100 h-12" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">VAT %</label>
                                    <Input
                                        type="number"
                                        value={getVatRate(currency)}
                                        readOnly
                                        className="rounded-xl border-gray-100 h-12 bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Entity type</label>
                                    <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none">
                                        <option>Apiary</option>
                                        <option>Hive</option>
                                        <option>Meter</option>
                                        <option>Project</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Entities</label>
                                    <Input placeholder="e.g. Apiary North" className="rounded-xl border-gray-100 h-12" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Vendor</label>
                                    <Input placeholder="Vendor name" className="rounded-xl border-gray-100 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Document number</label>
                                    <Input placeholder="FV/2026/001" className="rounded-xl border-gray-100 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                                    <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none">
                                        <option>Paid</option>
                                        <option>Pending</option>
                                        <option>Overdue</option>
                                        <option>Draft</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Payment Terms</label>
                                    <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none">
                                        <option>Immediate</option>
                                        <option>Net 15</option>
                                        <option>Net 30</option>
                                        <option>Net 60</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Department</label>
                                    <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none">
                                        <option>Operations</option>
                                        <option>Sales</option>
                                        <option>Maintenance</option>
                                        <option>Logistics</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Source Link</label>
                                    <Input placeholder="https://..." className="rounded-xl border-gray-100 h-12" />
                                </div>

                                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                                    <Input placeholder="Additional details..." className="rounded-xl border-gray-100 h-12" />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-4">
                                <Button className="bg-[#1B9157] hover:bg-[#167d4a] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-green-500/10 self-start">
                                    Add cost
                                </Button>

                                <div className="flex items-center gap-3 pt-4">
                                    <div className="w-12 h-6 bg-gray-100 rounded-full relative p-1 cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">Recurring cost (meters)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Costs Card */}
                    <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold mb-1">Recent costs</h3>
                            <p className="text-xs text-gray-400 font-medium mb-8">25 mock entries</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Date from</label>
                                    <Input type="date" className="rounded-xl border-gray-100 h-10" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Date to</label>
                                    <Input type="date" className="rounded-xl border-gray-100 h-10" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                                    <select className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none appearance-none">
                                        <option>All</option>
                                        <option>Services</option>
                                        <option>Materials</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Entity type</label>
                                    <select className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none appearance-none">
                                        <option>All</option>
                                        <option>Apiary</option>
                                        <option>Hive</option>
                                    </select>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Entities</label>
                                    <select className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none appearance-none">
                                        <option>All</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                            <th className="pb-4 font-black">Date</th>
                                            <th className="pb-4 font-black">Category</th>
                                            <th className="pb-4 font-black">Document</th>
                                            <th className="pb-4 font-black">Description</th>
                                            <th className="pb-4 font-black">Entities</th>
                                            <th className="pb-4 text-right font-black">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-gray-300 font-medium">
                                                No cost entries found
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination/Scrollbar UI */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="h-1.5 bg-gray-100 rounded-full flex-1 mx-4 relative overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 w-1/3 bg-orange-400 rounded-full" />
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-1 hover:bg-gray-50 rounded text-orange-400"><Plus className="w-3 h-3 rotate-45" /></button>
                                    <button className="p-1 hover:bg-gray-50 rounded text-orange-400"><Plus className="w-3 h-3 rotate-45" /></button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Documents Content */}
            {activeSubTab === 'Documents' && (
                <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Documents</h3>
                                <p className="text-xs text-gray-400 font-medium tracking-tight">Invoices and receipts across entities</p>
                            </div>
                            <Button
                                onClick={() => setIsNewDocFormOpen(true)}
                                className="bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-full px-6 h-10 font-bold flex items-center gap-2"
                            >
                                New document
                            </Button>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Date from</label>
                                <Input type="date" className="rounded-xl border-gray-100 h-10" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Date it</label>
                                <Input type="date" className="rounded-xl border-gray-100 h-10" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Document type</label>
                                <select className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none appearance-none">
                                    <option>All</option>
                                    <option>Invoice</option>
                                    <option>Receipt</option>
                                    <option>Proforma</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Entity type</label>
                                <select className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none appearance-none">
                                    <option>All</option>
                                    <option>Apiary</option>
                                    <option>Hive</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Entity name</label>
                                <Input placeholder="Search..." className="rounded-xl border-gray-100 h-10" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                                <select className="flex h-10 w-full rounded-xl border border-gray-100 bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none appearance-none">
                                    <option>All</option>
                                    <option>Paid</option>
                                    <option>Pending</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                        <th className="pb-4 font-black">Number</th>
                                        <th className="pb-4 font-black">Type</th>
                                        <th className="pb-4 font-black">Issue Date</th>
                                        <th className="pb-4 font-black">Contractor</th>
                                        <th className="pb-4 font-black">Entities</th>
                                        <th className="pb-4 font-black">Status</th>
                                        <th className="pb-4 font-black">Gross</th>
                                        <th className="pb-4 text-right font-black">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="p-4 bg-gray-50 rounded-full">
                                                    <FileText className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-300 font-medium">No documents found</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Analytics Content */}
            {activeSubTab === 'Analytics' && (
                <AnalyticsSection currency={currency} />
            )}

            {/* Settings Content */}
            {activeSubTab === 'Settings' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Organization profile */}
                        <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">Organization profile</h3>
                                        <p className="text-xs text-gray-400 font-medium">Default settings for billing</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Organization name</label>
                                        <Input defaultValue="BeeYield" className="rounded-xl border-gray-100 h-12 shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">VAT EU (KRA PIN)</label>
                                        <Input defaultValue="P051234567A" className="rounded-xl border-gray-100 h-12 shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">KRS (Register No)</label>
                                        <Input defaultValue="PVT-ABC1234" className="rounded-xl border-gray-100 h-12 shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">REGON</label>
                                        <Input defaultValue="123456789" className="rounded-xl border-gray-100 h-12 shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Street address</label>
                                        <Input defaultValue="Waiyaki Way, Westlands" className="rounded-xl border-gray-100 h-12 shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">City</label>
                                        <Input defaultValue="Nairobi" className="rounded-xl border-gray-100 h-12 shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Postal code</label>
                                        <Input defaultValue="00100" className="rounded-xl border-gray-100 h-12 shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Country</label>
                                        <Input defaultValue="Kenya" className="rounded-xl border-gray-100 h-12 shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Tax status</label>
                                        <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none appearance-none shadow-sm">
                                            <option>VAT registered</option>
                                            <option>Non-VAT payer</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Default numbering</label>
                                        <Input defaultValue="INV/{YYYY}/{NNN}" className="rounded-xl border-gray-100 h-12 shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Other info</label>
                                        <textarea className="flex min-h-[48px] w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm" placeholder="Additional details..."></textarea>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Logo (mock upload)</label>
                                        <div className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm items-center shadow-sm">
                                            <input type="file" className="text-[10px] text-gray-400 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer w-full" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <Button className="bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-gray-200">
                                        Save settings
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Entity Registry */}
                        <Card className="rounded-[2rem] border-none bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">Entity registry</h3>
                                        <p className="text-xs text-gray-400 font-medium">Central list of entities for allocation</p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                                <th className="pb-4 font-black">Type</th>
                                                <th className="pb-4 font-black">Name</th>
                                                <th className="pb-4 font-black">Metadata</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-xs">
                                            <tr>
                                                <td colSpan={3} className="py-12 text-center text-gray-300 font-medium">
                                                    No entities registered
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* eTIMS settings */}
                    <Card className="rounded-[2.5rem] border-none bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold">eTIMS settings</h3>
                                        <Badge className="bg-orange-50 text-orange-500 border border-orange-100 rounded-md text-[10px] px-2 py-0.5 font-bold uppercase">Placeholder</Badge>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium mt-1">Structured invoice readiness (KRA eTIMS compliance)</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Status:</span>
                                    <Badge className="bg-orange-50 text-orange-500 border border-orange-100 rounded-md text-[10px] px-2 py-0.5 font-bold uppercase">Not connected</Badge>
                                </div>
                            </div>

                            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-gray-100 mb-8">
                                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                    <strong className="text-[#0F172A]">What is eTIMS?</strong><br />
                                    eTIMS (Electronic Tax Invoice Management System) is an initiative by the Kenya Revenue Authority (KRA) to automate tax invoice management. It is designed to foster transparency and reduce compliance costs by requiring taxpayers to generate and transmit structured invoices to the KRA in real-time or periodically.
                                </p>
                                <p className="text-xs text-gray-400 font-medium font-mono">
                                    eTIMS integration options, digital certificates, and transmission toggles will appear here once the connection is established.
                                </p>
                            </div>

                            <Button className="bg-[#1B9157] hover:bg-[#146c43] text-white rounded-full px-8 h-11 font-bold shadow-md shadow-green-100 transition-all">
                                Connect to eTIMS
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* New Document Form Overflow */}
            {isNewDocFormOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                    <Card className="w-full max-w-5xl rounded-[2.5rem] border-none bg-white shadow-2xl overflow-hidden">
                        <CardContent className="p-10">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#0F172A]">New document</h2>
                                    <p className="text-xs text-gray-400 font-medium tracking-tight">Multi-step editor with entity allocation</p>
                                </div>
                                <Badge className="bg-[#F1F5F9] text-[#64748B] hover:bg-[#F1F5F9] rounded-lg px-3 py-1 text-[10px] font-bold border-none uppercase">Reactive form</Badge>
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-8 mb-4">
                                {[
                                    '1. Document meta', '2. Seller / Provider', '3. Buyer / Recipient',
                                    '4. Line items', '5. Entity allocation', '6. Summary & preview'
                                ].map((stepLabel, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all select-none cursor-default",
                                            docFormStep === idx + 1
                                                ? "bg-[#1E293B] text-white"
                                                : "bg-[#F1F5F9] text-[#64748B]"
                                        )}
                                    >
                                        {stepLabel}
                                    </div>
                                ))}
                            </div>

                            {/* Step Content */}
                            {docFormStep === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Type</label>
                                        <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none">
                                            <option>VAT invoice</option>
                                            <option>Receipt</option>
                                            <option>Proforma</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Issue date</label>
                                        <Input type="date" defaultValue="2026-01-17" className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Sale date</label>
                                        <Input type="date" className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Due date</label>
                                        <Input type="date" className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Numbering</label>
                                        <Input placeholder="Number assigned on issue" className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Currency</label>
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
                                        >
                                            {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Language</label>
                                        <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none">
                                            <option>English</option>
                                            <option>Polish</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Reference #</label>
                                        <Input placeholder="REF-001" className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Sale method</label>
                                        <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none">
                                            <option>Direct</option>
                                            <option>Online</option>
                                            <option>Wholesale</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {docFormStep === 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Seller name</label>
                                        <Input
                                            value={sellerName}
                                            onChange={(e) => setSellerName(e.target.value)}
                                            className="rounded-xl border-gray-100 h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Tax ID</label>
                                        <Input defaultValue="PL6352011815" className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Address</label>
                                        <Input defaultValue="Marszalkowska 1, 00-001 Warsaw, Poland" className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Email</label>
                                        <Input defaultValue="billing@beeyield.app" className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
                                        <Input placeholder="Enter phone..." className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                </div>
                            )}

                            {docFormStep === 3 && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Buyer name</label>
                                        <Input
                                            value={buyerName}
                                            onChange={(e) => setBuyerName(e.target.value)}
                                            placeholder="Enter buyer name..."
                                            className="rounded-xl border-gray-100 h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Tax ID</label>
                                        <Input placeholder="Enter tax ID..." className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Address</label>
                                        <Input placeholder="Enter address..." className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Email</label>
                                        <Input placeholder="Enter email..." className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
                                        <Input placeholder="Enter phone..." className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                </div>
                            )}

                            {docFormStep === 4 && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-4">
                                        {/* Line Item Card 1 */}
                                        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-sm relative overflow-hidden group">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-black text-[#0F172A] tracking-tight">Line item 1</h4>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setLineItemsCount(Math.max(0, lineItemsCount - 1))}
                                                    className="h-8 px-3 rounded-lg text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    Remove
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                <div className="space-y-2 md:col-span-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Product / service</label>
                                                    <Input placeholder="Enter details..." className="rounded-xl border-gray-100 h-11" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Qty</label>
                                                    <Input type="number" defaultValue="1" className="rounded-xl border-gray-100 h-11" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Unit price (net)</label>
                                                    <Input type="number" defaultValue="0" className="rounded-xl border-gray-100 h-11" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">VAT %</label>
                                                    <Input type="number" value={getVatRate(currency)} readOnly className="rounded-xl border-gray-100 h-11 bg-gray-50/50" />
                                                </div>
                                            </div>

                                            {/* Calculation Summary Bar */}
                                            <div className="mt-4 p-4 border border-dashed border-gray-100 rounded-2xl bg-gray-50/30 flex items-center justify-start gap-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Net:</span>
                                                    <span className="text-xs font-bold text-gray-600">0.00 {currency}</span>
                                                </div>
                                                <div className="flex items-center gap-2 border-l border-gray-100 pl-6">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">VAT:</span>
                                                    <span className="text-xs font-bold text-gray-600">0.00 {currency}</span>
                                                </div>
                                                <div className="flex items-center gap-2 border-l border-gray-100 pl-6">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Gross:</span>
                                                    <span className="text-xs font-black text-[#0F172A]">0.00 {currency}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={() => setLineItemsCount(lineItemsCount + 1)}
                                            className="flex items-center gap-2 text-xs font-black text-gray-600 hover:text-orange-400 transition-colors uppercase tracking-widest pl-2 group"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-50">
                                                <Plus className="w-3 h-3" />
                                            </div>
                                            Add line
                                        </button>
                                    </div>
                                </div>
                            )}

                            {docFormStep === 5 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Entity type</label>
                                        <select className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none appearance-none">
                                            <option>Apiary</option>
                                            <option>Hive</option>
                                            <option>Project</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Entities</label>
                                        <Input placeholder="Apiary North" className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Project / grant</label>
                                        <Input placeholder="Search..." className="rounded-xl border-gray-100 h-12" />
                                    </div>
                                </div>
                            )}

                            {docFormStep === 6 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-in slide-in-from-bottom-2 duration-300">
                                    {/* Column 1: Summary */}
                                    <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6 shadow-sm">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Summary</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-medium">Net:</span>
                                                <span className="font-bold text-[#0F172A]">0 {currency}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-medium">Tax:</span>
                                                <span className="font-bold text-[#0F172A]">0 {currency}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                                <span className="text-sm font-black text-[#0F172A] uppercase">Gross:</span>
                                                <span className="text-xl font-black text-[#0F172A]">0 {currency}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: PDF Preview Placeholder */}
                                    <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6 shadow-sm">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PDF preview</h4>
                                        <div className="h-40 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 flex items-center justify-center p-6 text-center">
                                            <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                                Placeholder PDF preview for invoice layout and structured fields.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Column 3: eTIMS fields */}
                                    <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6 shadow-sm">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">eTIMS fields</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400">eTIMS Receipt #</label>
                                                <Input defaultValue="ETM-0000000000" className="rounded-xl border-gray-100 h-11 text-xs" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400">eTIMS status</label>
                                                <Input defaultValue="Not connected" readOnly className="rounded-xl border-gray-100 h-11 text-xs bg-gray-50/50" />
                                            </div>
                                            <button className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-[#0F172A] transition-colors pt-2">
                                                <ChevronRight className="w-3 h-3 transform rotate-90" />
                                                Structured invoice mapping
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-12 flex justify-between items-center border-t border-gray-50 pt-8">
                                <button
                                    onClick={() => docFormStep > 1 ? setDocFormStep(docFormStep - 1) : setIsNewDocFormOpen(false)}
                                    className="text-xs font-bold text-gray-400 hover:text-[#0F172A] transition-colors"
                                >
                                    {docFormStep === 1 ? 'Cancel' : 'Back'}
                                </button>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        disabled={true}
                                        className="text-xs font-bold transition-all px-6 h-10 rounded-full text-gray-200"
                                    >
                                        Next
                                    </Button>

                                    {docFormStep === 6 && (
                                        <>
                                            <Button
                                                onClick={() => {
                                                    console.log("Saving draft...");
                                                    alert("Draft saved successfully!");
                                                }}
                                                variant="outline"
                                                className="border-gray-200 text-gray-400 text-xs font-bold rounded-full px-6 h-10 hover:bg-gray-50 transition-all ml-2"
                                            >
                                                Save draft
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    alert("Document issued successfully!");
                                                    setIsNewDocFormOpen(false);
                                                }}
                                                disabled={!isFormValid}
                                                className={cn(
                                                    "rounded-full px-8 h-10 font-black text-xs uppercase shadow-lg transition-all animate-in zoom-in-95 ml-2",
                                                    isFormValid
                                                        ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100"
                                                        : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                                                )}
                                            >
                                                Issue document
                                            </Button>
                                        </>
                                    )}

                                    {docFormStep < 6 && (
                                        <Button
                                            onClick={() => setDocFormStep(docFormStep + 1)}
                                            className="bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-full px-8 h-10 font-bold shadow-lg shadow-gray-200 transition-all"
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default BillingView;
