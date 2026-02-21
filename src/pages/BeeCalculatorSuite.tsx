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
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import VarroaWashInterpreter from '@/components/calculators/VarroaWashInterpreter';

// We'll import individual calculator components here as we build them
// For now, we'll implement the shell and the list of logs

const BeeCalculatorSuite: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                        <Calculator className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Universal Calculator Suite</span>
                    </div>
                    <h1 className="text-6xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                        Precision <span className="text-[#10b981]">Forecasting</span>
                    </h1>
                    <p className="text-[#064e3b]/40 font-black text-sm uppercase tracking-widest mt-2 px-1">
                        Feeding Math · Treatment Cycles · Pollination Economics
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button className="h-16 px-8 rounded-none border-4 border-[#064e3b] bg-[#facc15] text-[#064e3b] font-black uppercase tracking-widest text-xs shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] hover:shadow-none translate-y-[-2px] hover:translate-y-0 transition-all">
                        <History className="w-4 h-4 mr-2" />
                        Audit History
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="economic" className="w-full">
                <TabsList className="w-full h-auto p-0 bg-transparent border-b-4 border-[#064e3b]/5 flex flex-wrap gap-2 mb-8">
                    {[
                        { id: 'feeding', label: 'Nutritional Math', icon: Droplet },
                        { id: 'health', label: 'Treatment Cycles', icon: Flame },
                        { id: 'economic', label: 'Economic ROI', icon: Wallet },
                        { id: 'logistics', label: 'Deployment Math', icon: Zap },
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex-1 py-6 rounded-none border-t-4 border-l-4 border-r-4 border-transparent data-[state=active]:border-[#064e3b] data-[state=active]:bg-white text-xs font-black uppercase tracking-widest text-[#064e3b]/40 data-[state=active]:text-[#064e3b] transition-all"
                        >
                            <tab.icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="economic" className="mt-0 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Featured Economic Calculator */}
                        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)]">
                            <CardHeader className="p-8 border-b-4 border-[#064e3b]/5">
                                <CardTitle className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter">Pollination Contract Optimizer</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="p-6 bg-neutral-50/50 border-2 border-[#064e3b]/5">
                                    <p className="text-[10px] font-bold text-[#064e3b]/60 uppercase leading-relaxed mb-6">
                                        Determine the ideal price lift for certified Grade A pallets based on current spot prices and yield projections.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-white p-4 border-2 border-[#064e3b]">
                                            <span className="text-xs font-black uppercase">Current Spot Price / Hive</span>
                                            <span className="text-xl font-black text-[#10b981]">$185.00</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white p-4 border-2 border-[#064e3b]">
                                            <span className="text-xs font-black uppercase">Grade A Premium Cap</span>
                                            <span className="text-xl font-black text-[#064e3b]">+25.8%</span>
                                        </div>
                                    </div>
                                    <Button className="w-full h-14 mt-8 rounded-none bg-[#064e3b] text-white font-black uppercase tracking-[0.2em] text-[10px]">
                                        Calculate ROI Lift
                                        <ArrowUpRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent PERSISTED Logs */}
                        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(16,185,129,1)]">
                            <CardHeader className="p-8 border-b-4 border-[#064e3b]/5 bg-[#064e3b] text-white">
                                <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">Cloud Sync Audit</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y-2 divide-[#064e3b]/5">
                                    {[
                                        { type: 'Feeding', name: 'Winter Syrup Prep', date: '2026-02-19', status: 'SYNCED' },
                                        { type: 'Economic', name: 'Almond Delta Calc', date: '2026-02-18', status: 'SYNCED' },
                                        { type: 'Logistics', name: 'Pallet Saturation', date: '2026-02-15', status: 'ARCHIVED' },
                                    ].map((log, idx) => (
                                        <div key={idx} className="p-6 flex items-center justify-between hover:bg-[#10b981]/5 transition-colors group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-none border-2 border-[#064e3b] flex items-center justify-center font-black text-[10px]">
                                                    {log.type[0]}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-[#064e3b] uppercase tracking-tighter">{log.name}</h4>
                                                    <p className="text-[8px] font-black uppercase text-[#064e3b]/40">{log.date} · {log.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge className="bg-transparent border-2 border-[#064e3b] text-[#064e3b] rounded-none text-[8px] font-black">{log.status}</Badge>
                                                <ChevronRight className="w-4 h-4 text-[#064e3b]/20 group-hover:text-[#064e3b] transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full h-12 rounded-none font-black uppercase text-[10px] tracking-widest text-[#064e3b]/40 hover:text-[#064e3b]">
                                    Load Full Audit Ledger
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="health" className="mt-0">
                    <VarroaWashInterpreter />
                </TabsContent>

                {/* Other tabs will be implemented as sections or components */}
                <TabsContent value="feeding" className="mt-0">
                    <div className="border-4 border-[#064e3b] border-dashed p-12 text-center bg-neutral-50">
                        <Droplet className="w-12 h-12 text-[#064e3b]/20 mx-auto mb-4" />
                        <h3 className="text-xl font-black uppercase text-[#064e3b]">Feeding Engine Initializing...</h3>
                        <p className="text-[10px] font-black uppercase text-[#064e3b]/40 mt-2">Loading Syrup Concentration & Protein Supplement Matrices</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BeeCalculatorSuite;
