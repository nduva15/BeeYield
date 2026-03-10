import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hexagon, Zap, Droplet, ArrowRight, Settings, BarChart2, Activity, ShieldCheck, Thermometer, Binary } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { glass } from './GlassTheme';

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
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ok': return 'bg-emerald-500';
            case 'warning': return 'bg-amber-500';
            case 'critical': return 'bg-red-500';
            default: return 'bg-honey';
        }
    };

    const statusLabel = hive.status === 'ok' ? 'Healthy' : hive.status === 'warning' ? 'Check Unit' : 'Needs Help';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -15, scale: 1.02 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <Card className="h-full border border-white/5 bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-3xl rounded-[4rem] shadow-[0_80px_150px_-30px_rgba(0,0,0,0.4)] overflow-hidden group hover:border-honey/60 transition-all duration-1000 flex flex-col relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-honey/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-honey/15 transition-all duration-2000" />

                <div className={cn("px-10 py-5 text-[12px] font-black uppercase tracking-[0.5em] italic text-center border-b border-white/5 relative z-10",
                    hive.status === 'ok' ? 'text-emerald-500 bg-emerald-500/10' :
                        hive.status === 'warning' ? 'text-amber-500 bg-amber-500/10' :
                            'text-red-500 bg-red-500/10'
                )}>
                    Status: {statusLabel}
                </div>

                <CardContent className="flex-1 flex flex-col p-12 gap-12 relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Binary className="w-6 h-6 text-honey/20" />
                                <span className="text-[10px] font-black text-honey/20 uppercase tracking-[0.6em] italic leading-none">Hive Registry</span>
                            </div>
                            <h3 className="text-6xl font-black text-foreground tracking-tighter uppercase leading-[0.8] italic group-hover:text-honey transition-colors duration-1000">
                                {hive.name}
                            </h3>
                        </div>
                        <div className="w-18 h-18 rounded-[1.8rem] bg-black/5 dark:bg-white/5 flex items-center justify-center text-honey group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-[1.5s] border border-white/5 shadow-4xl backdrop-blur-3xl">
                            <Hexagon className="w-10 h-10" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="p-10 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-white/5 transition-all duration-1000 group-hover:bg-honey/10 group-hover:border-honey/40 shadow-inner overflow-hidden relative">
                            <div className="absolute inset-0 bg-honey/[0.02] animate-shimmer" />
                            <div className="flex items-center gap-4 mb-4 text-foreground/20 group-hover:text-honey/60 transition-colors relative z-10">
                                <Zap className="w-5 h-5" />
                                <span className="text-[11px] font-black uppercase tracking-widest italic leading-none">Weight</span>
                            </div>
                            <div className="flex items-end gap-3 relative z-10">
                                <span className="text-5xl font-black text-foreground italic tracking-tighter tabular-nums">{hive.weight}</span>
                                <span className="text-sm font-black text-foreground/20 uppercase tracking-widest italic mb-3">KG</span>
                            </div>
                        </div>
                        <div className="p-10 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-white/5 transition-all duration-1000 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/40 shadow-inner overflow-hidden relative">
                            <div className="absolute inset-0 bg-emerald-500/[0.02] animate-shimmer" />
                            <div className="flex items-center gap-4 mb-4 text-foreground/20 group-hover:text-emerald-500/60 transition-colors relative z-10">
                                <Activity className="w-5 h-5" />
                                <span className="text-[11px] font-black uppercase tracking-widest italic leading-none">Humidity</span>
                            </div>
                            <div className="flex items-end gap-3 relative z-10">
                                <span className="text-5xl font-black text-foreground italic tracking-tighter tabular-nums">{hive.humidity}</span>
                                <span className="text-sm font-black text-foreground/20 uppercase tracking-widest italic mb-3">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto space-y-6">
                        <div className="flex gap-6">
                            <Button
                                variant="ghost"
                                className="flex-1 h-20 rounded-[2rem] bg-black/5 dark:bg-white/5 text-foreground/40 hover:text-honey hover:bg-honey/10 transition-all duration-1000 font-black text-[12px] uppercase tracking-[0.4em] italic border border-white/5 shadow-4xl"
                                onClick={onViewHistory}
                            >
                                <BarChart2 className="w-6 h-6 mr-4" /> Stats
                            </Button>
                            <Button
                                variant="ghost"
                                className="flex-1 h-20 rounded-[2rem] bg-black/5 dark:bg-white/5 text-foreground/40 hover:text-honey hover:bg-honey/10 transition-all duration-1000 font-black text-[12px] uppercase tracking-[0.4em] italic border border-white/5 shadow-4xl"
                                onClick={onMarkInspection}
                            >
                                <Settings className="w-6 h-6 mr-4" /> Schedule
                            </Button>
                        </div>
                        <button
                            className="w-full h-24 rounded-[2.5rem] bg-black text-white font-black text-[14px] uppercase tracking-[0.5em] italic shadow-[0_45px_100px_-20px_rgba(0,0,0,0.6)] transition-all duration-1000 group/btn flex items-center justify-center gap-6 relative overflow-hidden"
                            onClick={onViewHistory}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1500ms]" />
                            <span className="relative z-10">View Details</span>
                            <ArrowRight className="w-7 h-7 text-honey group-hover/btn:translate-x-5 transition-transform duration-1000 relative z-10" />
                        </button>
                    </div>
                </CardContent>

                {/* Status Pulsar */}
                <div className="absolute bottom-10 right-10 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-1500">
                    <div className="relative">
                        <div className={cn("absolute inset-0 blur-2xl opacity-60 animate-pulse", getStatusColor(hive.status))} />
                        <div className={cn("w-3 h-3 rounded-full relative z-10 shadow-4xl border border-white/20", getStatusColor(hive.status))} />
                    </div>
                </div>

                <style>{`
                    @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                    .animate-shimmer { animation: shimmer 4s infinite linear; }
                `}</style>
            </Card>
        </motion.div>
    );
};

export default FlipCardHive;
