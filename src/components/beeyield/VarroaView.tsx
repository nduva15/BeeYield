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
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Varroa Monitoring</h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium">Scientific analysis for varroa mite detection.</p>
                </div>
                <div className="flex gap-2">
                    <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">
                        <Microscope className="w-4 h-4 mr-2" />
                        Run Diagnosis
                    </Button>
                </div>
            </div>

            {/* Alert Banner if high infestation */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-red-900 uppercase text-[10px] tracking-wider mb-1">High Infestation Alert</h3>
                    <p className="text-sm text-red-700 font-medium font-bold">Hive H-004 shows a 5.2% infestation rate. Treatment recommended within 48 hours.</p>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold">
                    Treatment Guide
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hives.map(hive => (
                    <Card key={hive.id} className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 relative overflow-hidden">
                        <div className={cn(
                            "absolute top-0 left-0 w-full h-[3px]",
                            hive.status === 'safe' ? "bg-green-600" : hive.status === 'warning' ? "bg-amber-400" : "bg-red-500"
                        )} />
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{hive.id}</span>
                            <Badge className={cn(
                                "border-none text-[10px] font-bold",
                                hive.status === 'safe' ? "bg-green-100 text-green-700" : hive.status === 'warning' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                            )}>
                                {hive.status.toUpperCase()}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-bold text-slate-800">{hive.infestation}%</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Infestation Rate</p>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <TrendingUp className={cn("w-3 h-3", hive.trend === 'up' ? "text-red-500" : hive.trend === 'down' ? "text-green-600" : "text-slate-400")} />
                            <span className="text-xs font-bold text-slate-500 capitalize">{hive.trend} trend</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-8">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                            <History className="w-5 h-5 text-green-600" />
                            Historic Trend
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-500">Infestation levels over the last 30 days.</CardDescription>
                    </CardHeader>
                    <div className="h-[250px] w-full bg-slate-50 rounded-[1.5rem] flex items-center justify-center border border-dashed border-slate-200">
                        <BarChart3 className="w-12 h-12 text-slate-200" />
                    </div>
                </Card>

                <Card className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm p-8 border-t-4 border-t-amber-400">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                            <ShieldCheck className="w-5 h-5 text-amber-500" />
                            Recommended Actions
                        </CardTitle>
                    </CardHeader>
                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-amber-50 transition-colors">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Oxalic Acid Treatment</h4>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">Scheduled for next maintenance</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-amber-50 transition-colors">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Drone Brood Removal</h4>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">Effective biological control</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-amber-50 transition-colors">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Formic Pro Application</h4>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">For high infestation levels</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default VarroaView;
