import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, ShieldCheck, Microscope, History, ChevronRight, BarChart3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';

interface VarroaHive {
    id: string;
    hive_id: string;
    infestation_rate: number;
    mite_count: number;
    method: string;
    reading_date: string;
}

const VarroaView: React.FC = () => {
    const [hives, setHives] = useState<{ id: string; infestation: number; status: string; trend: string; method: string; date: string }[]>([]);
    const [treatments, setTreatments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [readings, treatmentData] = await Promise.all([
                    beeyieldService.getVarroaReadings(),
                    beeyieldService.getVarroaTreatments(),
                ]);

                if (readings && readings.length > 0) {
                    const mapped = readings.map((r: any) => ({
                        id: r.hive_id?.slice(0, 5) || r.id?.slice(0, 5) || 'H-???',
                        infestation: r.infestation_rate ?? 0,
                        status: r.infestation_rate >= 5 ? 'critical' : r.infestation_rate >= 3 ? 'warning' : 'safe',
                        trend: 'stable',
                        method: r.method || 'alcohol_wash',
                        date: r.reading_date || '-',
                    }));
                    setHives(mapped);
                } else {
                    // Fallback to demo data if no backend data
                    setHives([
                        { id: 'H-001', infestation: 1.2, status: 'safe', trend: 'down', method: 'alcohol_wash', date: '-' },
                        { id: 'H-002', infestation: 3.5, status: 'warning', trend: 'up', method: 'sticky_board', date: '-' },
                        { id: 'H-003', infestation: 0.8, status: 'safe', trend: 'stable', method: 'sugar_roll', date: '-' },
                        { id: 'H-004', infestation: 5.2, status: 'critical', trend: 'up', method: 'alcohol_wash', date: '-' },
                    ]);
                }

                setTreatments(treatmentData || []);
            } catch (err) {
                console.error('Error loading varroa data:', err);
                setHives([
                    { id: 'H-001', infestation: 1.2, status: 'safe', trend: 'down', method: 'alcohol_wash', date: '-' },
                    { id: 'H-002', infestation: 3.5, status: 'warning', trend: 'up', method: 'sticky_board', date: '-' },
                    { id: 'H-003', infestation: 0.8, status: 'safe', trend: 'stable', method: 'sugar_roll', date: '-' },
                    { id: 'H-004', infestation: 5.2, status: 'critical', trend: 'up', method: 'alcohol_wash', date: '-' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const criticalHive = hives.find(h => h.status === 'critical');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

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
            {criticalHive && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-red-900 uppercase text-[10px] tracking-wider mb-1">High Infestation Alert</h3>
                        <p className="text-sm text-red-700 font-medium font-bold">Hive {criticalHive.id} shows a {criticalHive.infestation}% infestation rate. Treatment recommended within 48 hours.</p>
                    </div>
                    <Button className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold">
                        Treatment Guide
                    </Button>
                </div>
            )}

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
                        {(treatments.length > 0 ? treatments.slice(0, 3) : [
                            { treatment_type: 'oxalic_acid', notes: 'Scheduled for next maintenance' },
                            { treatment_type: 'biotechnical', notes: 'Effective biological control' },
                            { treatment_type: 'formic_acid', notes: 'For high infestation levels' },
                        ]).map((t: any, i: number) => (
                            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-amber-50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm capitalize">{(t.treatment_type || 'treatment').replace(/_/g, ' ')}</h4>
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">{t.notes || 'No additional notes'}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default VarroaView;
