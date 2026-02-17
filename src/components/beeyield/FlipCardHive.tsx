import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hexagon, Zap, Activity, Droplet, ArrowRight, Settings, BarChart2 } from 'lucide-react';
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
    const [isFlipped, setIsFlipped] = React.useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ok': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div
            className="group relative h-[280px] w-full perspective-1000 cursor-pointer"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <motion.div
                className="relative h-full w-full transition-all duration-500 preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front Face */}
                <Card className="absolute inset-0 h-full w-full backface-hidden border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl overflow-hidden rounded-3xl">
                    <div className={cn("absolute top-0 right-0 p-4 rounded-bl-3xl border-b border-l", getStatusColor(hive.status))}>
                        <Activity className="w-5 h-5 animate-pulse" />
                    </div>

                    <CardContent className="flex flex-col h-full justify-between p-6">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
                                <Hexagon className="w-6 h-6 text-white fill-white/20" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-1">
                                {hive.name}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Smart Hive Node
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-1 text-slate-400 dark:text-slate-500">
                                    <Zap className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase">Weight</span>
                                </div>
                                <span className="text-lg font-black text-slate-700 dark:text-slate-200">{hive.weight}kg</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-1 text-slate-400 dark:text-slate-500">
                                    <Droplet className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase">Humid</span>
                                </div>
                                <span className="text-lg font-black text-slate-700 dark:text-slate-200">{hive.humidity}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Back Face */}
                <Card
                    className="absolute inset-0 h-full w-full backface-hidden rotate-y-180 bg-slate-900 text-white border-none shadow-2xl rounded-3xl overflow-hidden"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 z-0" />

                    <CardContent className="relative z-10 flex flex-col h-full justify-center items-center p-6 gap-4">
                        <h4 className="text-lg font-bold text-slate-200 mb-2">Hive Actions</h4>

                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 hover:text-white justify-between group"
                            onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
                        >
                            <span className="text-xs font-bold uppercase tracking-wider">Analytics</span>
                            <BarChart2 className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 hover:text-white justify-between group"
                            onClick={(e) => { e.stopPropagation(); onMarkInspection(); }}
                        >
                            <span className="text-xs font-bold uppercase tracking-wider">Inspect</span>
                            <Settings className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </Button>

                        <Button
                            className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20 mt-2"
                            onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
                        >
                            View Details <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default FlipCardHive;
