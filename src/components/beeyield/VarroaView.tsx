import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, ShieldCheck, Microscope, History, ChevronRight, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VarroaView: React.FC = () => {
    const hives = [
        { id: 'H-001', infestation: 1.2, status: 'safe', trend: 'down' },
        { id: 'H-002', infestation: 3.5, status: 'warning', trend: 'up' },
        { id: 'H-003', infestation: 0.8, status: 'safe', trend: 'stable' },
        { id: 'H-004', infestation: 5.2, status: 'critical', trend: 'up' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Varroa Monitoring</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">AI-powered acoustic analysis for varroa mite detection.</p>
                </div>
                <div className="flex gap-2">
                    <Button className="bg-[#1B9157] text-white rounded-xl font-bold">
                        <Microscope className="w-4 h-4 mr-2" />
                        Run Diagnosis
                    </Button>
                </div>
            </div>

            {/* Alert Banner if high infestation */}
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-red-900 dark:text-red-400">High Infestation Alert</h3>
                    <p className="text-sm text-red-700 dark:text-red-500/70 font-medium">Hive H-004 shows a 5.2% infestation rate. Treatment recommended within 48 hours.</p>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold">
                    Treatment Guide
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hives.map(hive => (
                    <Card key={hive.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm p-6 relative overflow-hidden">
                        <div className={cn(
                            "absolute top-0 left-0 w-full h-[3px]",
                            hive.status === 'safe' ? "bg-[#1B9157]" : hive.status === 'warning' ? "bg-[#F4D03F]" : "bg-red-500"
                        )} />
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{hive.id}</span>
                            <Badge className={cn(
                                "border-none text-[10px] font-bold",
                                hive.status === 'safe' ? "bg-green-100 text-green-700" : hive.status === 'warning' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                            )}>
                                {hive.status.toUpperCase()}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{hive.infestation}%</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Mite Infestation Rate</p>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <TrendingUp className={cn("w-3 h-3", hive.trend === 'up' ? "text-red-500" : hive.trend === 'down' ? "text-green-500" : "text-gray-400")} />
                            <span className="text-xs font-bold text-gray-500 capitalize">{hive.trend} trend</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-[2.5rem] border-none bg-white dark:bg-[#09090b] shadow-sm p-8">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5 text-[#1B9157]" />
                            Historic Trend
                        </CardTitle>
                        <CardDescription>Infestation levels over the last 30 days.</CardDescription>
                    </CardHeader>
                    <div className="h-[300px] w-full bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center border border-dashed border-gray-200">
                        <BarChart3 className="w-12 h-12 text-gray-200" />
                    </div>
                </Card>

                <Card className="rounded-[2.5rem] border-none bg-white dark:bg-[#09090b] shadow-sm p-8 border-t-4 border-t-[#F4D03F]">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#F4D03F]" />
                            Recommended Actions
                        </CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-between group cursor-pointer hover:bg-[#F4D03F]/5 transition-colors">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Oxalic Acid Treatment</h4>
                                <p className="text-xs text-gray-500">Scheduled for next maintenance window.</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F4D03F] transition-colors" />
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-between group cursor-pointer hover:bg-[#F4D03F]/5 transition-colors">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Drone Brood Removal</h4>
                                <p className="text-xs text-gray-500">Effective biological control method.</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F4D03F] transition-colors" />
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-between group cursor-pointer hover:bg-[#F4D03F]/5 transition-colors">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Formic Pro Application</h4>
                                <p className="text-xs text-gray-500">Recommended for High infestation levels.</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#F4D03F] transition-colors" />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default VarroaView;
