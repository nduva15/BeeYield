import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search, Moon, Sun, Bell, Headphones, Wifi, Settings, LogOut,
    ChevronDown, Plus, MoreHorizontal, FileText, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';

interface BillingViewProps {
    onTabChange: (tab: string) => void;
}

const BillingView: React.FC<BillingViewProps> = ({ onTabChange }) => {
    const [activeSubTab, setActiveSubTab] = useState('Dashboard');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const tabs = ['Dashboard', 'Revenue', 'Costs', 'Documents', 'Analytics', 'Settings'];

    const summaryCards = [
        { title: 'Total revenue (month)', value: '0 PLN', subtitle: 'Invoices and receipts' },
        { title: 'Total costs (month)', value: '0 PLN', subtitle: 'Expenses and recurring fees' },
        { title: 'Net result', value: '0 PLN', subtitle: 'Revenue minus costs' },
        { title: 'Outstanding documents', value: '0', subtitle: 'Draft, issued, overdue' },
    ];

    const revenueVsCosts = [
        { month: '2025-08', revenue: '0 PLN', costs: '0 PLN' },
        { month: '2025-09', revenue: '0 PLN', costs: '0 PLN' },
        { month: '2025-10', revenue: '0 PLN', costs: '0 PLN' },
        { month: '2025-11', revenue: '0 PLN', costs: '0 PLN' },
        { month: '2025-12', revenue: '0 PLN', costs: '0 PLN' },
        { month: '2026-01', revenue: '0 PLN', costs: '0 PLN' },
    ];

    const profitByEntityType = [
        { type: 'Apiary', value: '0 PLN' },
        { type: 'Hive', value: '0 PLN' },
        { type: 'Meter', value: '0 PLN' },
        { type: 'Medical facility', value: '0 PLN' },
        { type: 'Patient', value: '0 PLN' },
        { type: 'Project', value: '0 PLN' },
        { type: 'Other', value: '0 PLN' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <FirstStepsBanner onTabChange={onTabChange} />

            {/* Platform Module Header */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">PLATFORM MODULE</p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Billing & Accounting</h1>
                        <Badge className="bg-[#1E293B] text-white rounded-md text-[10px] px-2 py-0.5 border-none font-bold uppercase">BETA</Badge>
                    </div>
                </div>
                <Button className="bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-full px-6 h-10 font-bold flex items-center gap-2">
                    New document
                </Button>
            </div>

            {/* Toolbar (Search & Icons) */}
            <div className="flex items-center justify-between py-2 px-1 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search apiaries, beehives"
                        className="pl-12 bg-white dark:bg-[#141414] border-gray-100 dark:border-[#1e1e1e] rounded-full h-11 w-full focus-visible:ring-1 focus-visible:ring-[#2D506C]/30 shadow-sm text-sm"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-full gap-2 bg-white dark:bg-[#141414] border-gray-100 dark:border-[#1e1e1e] h-11 px-4 shadow-sm">
                        <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-auto rounded-sm" />
                        <span className="font-bold text-xs">English</span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </Button>

                    <div className="flex items-center gap-1 bg-white dark:bg-[#141414] p-1 rounded-full border border-gray-100 dark:border-[#1e1e1e] shadow-sm">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-white/10 text-gray-500 transition-colors">
                            {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>

                    <button className="p-2.5 rounded-full bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#1e1e1e] text-gray-500 shadow-sm hover:bg-gray-50 transition-colors">
                        <Bell className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 rounded-full bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#1e1e1e] text-gray-500 shadow-sm hover:bg-gray-50 transition-colors">
                        <Headphones className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 rounded-full bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#1e1e1e] text-gray-500 shadow-sm hover:bg-gray-50 transition-colors">
                        <Wifi className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onTabChange('settings')}
                        className="p-2.5 rounded-full bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#1e1e1e] text-gray-500 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 rounded-full bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#1e1e1e] text-gray-500 shadow-sm hover:bg-gray-50 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
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
                                ? "bg-[#1E293B] text-white border-[#1E293B]"
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
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{card.title}</p>
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

                        {/* KSeF readiness */}
                        <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-lg font-bold">KSeF readiness</h3>
                                    <Badge className="rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold px-3 border-none">UI only</Badge>
                                </div>
                                <p className="text-xs text-gray-400 font-medium mb-6">Structured invoicing status</p>

                                <div className="flex items-center gap-2 mb-6">
                                    <span className="text-[10px] text-gray-400 uppercase font-black">Status:</span>
                                    <Badge className="bg-orange-50 text-orange-500 border border-orange-100 rounded-md text-[10px] px-2 py-0.5 font-bold uppercase">Not connected</Badge>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Required fields coverage: 72%.</p>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                        Company profile complete, buyer registry pending.
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" className="rounded-full bg-gray-50 border-gray-200 text-gray-600 text-xs font-bold px-4 h-9">
                                        View checklist
                                    </Button>
                                    <Button className="rounded-full bg-[#60A5FA] hover:bg-[#3B82F6] text-white text-xs font-bold px-4 h-9 border-none shadow-sm">
                                        Configure KSeF
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingView;
