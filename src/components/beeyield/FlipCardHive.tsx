import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hexagon, Zap, Droplet, ArrowRight, Settings, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlipCardHiveProps {
    hive: {
        id: string;
        name: string;
        weight: number;
        temp: number;
        humidity: number;
        status: 'ok' | 'warning' | 'critical';
    };
    onViewHistory: () => void;
    onMarkInspection: () => void;
}

const FlipCardHive: React.FC<FlipCardHiveProps> = ({ hive, onViewHistory, onMarkInspection }) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'ok': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40';
            case 'warning': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/40';
            case 'critical': return 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/40';
            default: return 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-900 dark:text-white';
        }
    };

    const statusLabel = hive.status === 'ok' ? 'Operational' : hive.status === 'warning' ? 'Attention' : 'Critical';

    return (
        <Card className="h-full border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden group hover:border-amber-500/30 transition-all flex flex-col">
            <div className={cn("px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-center border-b", getStatusStyles(hive.status))}>
                Asset {statusLabel}
            </div>

            <CardContent className="flex-1 flex flex-col p-8 gap-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none mb-2">
                            {hive.name}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">
                            Industrial Colony Node
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                        <Hexagon className="w-5 h-5" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-colors group-hover:bg-amber-500/[0.03]">
                        <div className="flex items-center gap-2 mb-2 text-slate-400 dark:text-white/20">
                            <Zap className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Mass Status</span>
                        </div>
                        <span className="text-2xl font-black text-slate-900 dark:text-white italic">{hive.weight}kg</span>
                    </div>
                    <div className="p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-colors group-hover:bg-emerald-500/[0.03]">
                        <div className="flex items-center gap-2 mb-2 text-slate-400 dark:text-white/20">
                            <Droplet className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Ambient Saturation</span>
                        </div>
                        <span className="text-2xl font-black text-slate-900 dark:text-white italic">{hive.humidity}%</span>
                    </div>
                </div>

                <div className="mt-auto space-y-3">
                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/5 transition-all font-black text-[10px] uppercase tracking-widest"
                            onClick={onViewHistory}
                        >
                            <BarChart2 className="w-4 h-4 mr-2" /> Metrics
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/5 transition-all font-black text-[10px] uppercase tracking-widest"
                            onClick={onMarkInspection}
                        >
                            <Settings className="w-4 h-4 mr-2" /> Audit
                        </Button>
                    </div>
                    <Button
                        className="w-full h-14 rounded-2xl bg-neutral-900 dark:bg-white/5 dark:hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-black/10 dark:shadow-none transition-all group/btn"
                        onClick={onViewHistory}
                    >
                        Master Analysis <ArrowRight className="w-4 h-4 ml-2 text-amber-500 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default FlipCardHive;
