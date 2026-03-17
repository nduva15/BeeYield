import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calculator,
    Droplet,
    Flame,
    Wallet,
    TrendingUp,
    History,
    ChevronRight,
    ArrowUpRight,
    Zap,
    Scale,
    Activity,
    Hash
} from 'lucide-react';
import { glass } from '@/components/beeyield/GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import VarroaWashInterpreter from '@/components/calculators/VarroaWashInterpreter';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const BeeCalculatorSuite: React.FC = () => {
    return (
        <BeeYieldPageShell className="space-y-6 animate-in fade-in duration-500">
            <BeeYieldPageHeader
                icon={Calculator}
                label="Universal Calculator Suite"
                title={<>Precision <span className="text-[#F4D03F]">Forecasting</span></>}
                subtitle="Feeding Math · Treatment Cycles · Pollination Economics"
                actions={
                    <button className={cn(glass.btnSecondary, "h-9 text-[10px]")} aria-label="Open audit history" title="Audit history">
                        <History className="w-3.5 h-3.5" />
                        Audit History
                    </button>
                }
            />

            <Tabs defaultValue="economic" className="w-full">
                <TabsList className="w-full h-11 p-1 bg-[#F4D03F]/5 border border-[#F4D03F]/10 rounded-xl flex gap-1 mb-8 overflow-x-auto">
                    {[
                        { id: 'feeding', label: 'Nutritional', icon: Droplet },
                        { id: 'health', label: 'Treatment', icon: Flame },
                        { id: 'economic', label: 'Economic ROI', icon: Wallet },
                        { id: 'logistics', label: 'Deployment', icon: Zap },
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex-1 h-full rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#F4D03F] data-[state=active]:shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all flex items-center gap-2"
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="economic" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Featured Economic Calculator */}
                        <Card className={cn(glass.card, "bg-white/40 border-[#F4D03F]/10 backdrop-blur-md")}>
                            <CardHeader className="px-5 py-4 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10 shadow-sm">
                                        <Wallet className="w-4 h-4 text-[#F4D03F]" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-[10px] font-black tracking-widest uppercase text-[#1A1A1A]">Pollination Contract Optimizer</CardTitle>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Pricing Strategy Engine</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5 space-y-6">
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/50 rounded-xl border border-[#F4D03F]/10">
                                        <p className="text-[9px] font-bold text-gray-500 uppercase leading-relaxed mb-4 tracking-wider">
                                            Determine ideal price lift for certified Grade A pallets based on spot prices.
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg border border-[#F4D03F]/20">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Spot Price / Hive</span>
                                                <span className="text-lg font-black text-[#1B9157] tabular-nums">$185.00</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg border border-[#F4D03F]/20">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Grade A Premium</span>
                                                <span className="text-lg font-black text-[#F4D03F] tabular-nums">+25.8%</span>
                                            </div>
                                        </div>
                                        <button className={cn(glass.btnPrimary, "w-full h-11 mt-6 text-[10px] tracking-[0.2em]")}>
                                            Calculate ROI Lift
                                            <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent PERSISTED Logs */}
                        <Card className={cn(glass.card, "bg-white/40 border-[#F4D03F]/10 backdrop-blur-md")}>
                            <CardHeader className="px-5 py-4 border-b border-[#F4D03F]/10 bg-[#1A1A1A]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10 shadow-sm">
                                        <History className="w-4 h-4 text-[#F4D03F]" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-[10px] font-black tracking-widest uppercase text-white/90 italic">Cloud Sync Audit</CardTitle>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Persisted Log Registry</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {[
                                        { type: 'Feeding', name: 'Winter Syrup Prep', date: '2026-02-19', status: 'SYNCED', icon: Droplet },
                                        { type: 'Economic', name: 'Almond Delta Calc', date: '2026-02-18', status: 'SYNCED', icon: Wallet },
                                        { type: 'Logistics', name: 'Pallet Saturation', date: '2026-02-15', status: 'ARCHIVED', icon: Zap },
                                    ].map((log, idx) => (
                                        <div key={idx} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#F4D03F]/5 transition-colors group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-lg border border-[#F4D03F]/20 bg-white flex items-center justify-center">
                                                    <log.icon className="w-4 h-4 text-[#F4D03F]" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-tighter">{log.name}</h4>
                                                    <p className="text-[8px] font-bold uppercase text-gray-400">{log.date} · {log.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={cn(glass.badge, "h-5 flex items-center")}>{log.status}</span>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F4D03F] transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full h-11 border-t border-gray-100 font-black uppercase text-[9px] tracking-[0.2em] text-gray-400 hover:text-[#1A1A1A] transition-colors bg-[#F9F7F2]/30">
                                    Load full history
                                </button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="health" className="mt-0">
                    <VarroaWashInterpreter />
                </TabsContent>

                <TabsContent value="feeding" className="mt-0">
                    <div className={cn(glass.emptyState, "py-20 bg-white/40 border-[#F4D03F]/20 backdrop-blur-md")}>
                        <div className="w-16 h-16 rounded-2xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10 mb-4">
                            <Droplet className="w-8 h-8 text-[#F4D03F] opacity-40" />
                        </div>
                        <h3 className="text-sm font-black uppercase text-[#1A1A1A] tracking-widest">Feeding tools are loading…</h3>
                        <p className="text-[10px] font-bold uppercase text-gray-400 mt-2 tracking-widest">Please wait</p>
                    </div>
                </TabsContent>

                <TabsContent value="logistics" className="mt-0">
                    <div className={cn(glass.emptyState, "py-20 bg-white/40 border-[#F4D03F]/20 backdrop-blur-md")}>
                        <div className="w-16 h-16 rounded-2xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10 mb-4">
                            <Zap className="w-8 h-8 text-[#F4D03F] opacity-40" />
                        </div>
                        <h3 className="text-sm font-black uppercase text-[#1A1A1A] tracking-widest">Logistics tools are loading…</h3>
                        <p className="text-[10px] font-bold uppercase text-gray-400 mt-2 tracking-widest">Please wait</p>
                    </div>
                </TabsContent>
            </Tabs>
        </BeeYieldPageShell>
    );
};

export default BeeCalculatorSuite;

