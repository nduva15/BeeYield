import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hexagon, Zap, Droplet, ArrowRight, Settings, BarChart2, Activity, ShieldCheck, Thermometer, Binary, Box, Layers } from 'lucide-react';
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
        totalHarvestedKg?: number;
        batchCount?: number;
    };
    onViewHistory: () => void;
    onMarkInspection: () => void;
    onOpen?: () => void;
}

const FlipCardHive: React.FC<FlipCardHiveProps> = ({ hive, onViewHistory, onMarkInspection, onOpen }) => {
    const [isFlipped, setIsFlipped] = React.useState(false);

    const statusConfig = {
        ok: { label: 'Nominal', color: 'text-[#1A1A1A]', dot: 'bg-[#FFF9F0]' },
        warning: { label: 'Alert', color: 'text-[#F4D03F]', dot: 'bg-[#F4D03F]' },
        critical: { label: 'Critical', color: 'text-[#F4D03F]', dot: 'bg-[#F4D03F] shadow-[0_0_10px_#FF6B00]' },
    };

    const cfg = statusConfig[hive.status] || statusConfig.ok;

    return (
        <div 
            className="group h-[380px] w-full cursor-pointer relative"
            style={{ perspective: '1200px' }}
            onClick={() => { if (!isFlipped && onOpen) { onOpen(); } else { setIsFlipped(!isFlipped); } }}
        >
            {/* ── Front Face ── */}
            <motion.div 
                className="absolute inset-0 flex flex-col bg-white/40 border border-[#F4D03F]/20 rounded-[2rem] overflow-hidden shadow-xl backdrop-blur-md group-hover:border-[#F4D03F]/40 transition-colors"
                initial={false}
                animate={{ 
                    rotateY: isFlipped ? -180 : 0,
                    opacity: isFlipped ? 0 : 1
                }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ pointerEvents: isFlipped ? 'none' : 'auto' }}
            >
                <div className="p-5 border-b border-[#F4D03F]/10 bg-[#F4D03F][0.02] flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", cfg.dot)} />
                        <span className={cn("text-[8px] font-black", cfg.color)}>{cfg.label}</span>
                    </div>
                    <Hexagon className="w-4 h-4 text-gray-400 opacity-40" />
                </div>
                
                <div className="flex-1 p-6 flex flex-col justify-center gap-2 relative z-10">
                    <p className="text-[9px] font-black text-gray-400 opacity-60 uppercase tracking-widest">Hive Registry</p>
                    <h3 className="text-5xl font-black text-[#1A1A1A] tracking-tighter leading-none group-hover:text-[#F4D03F] transition-colors">
                        {hive.name}
                    </h3>
                </div>

                <div className="p-5 bg-white/30 border-t border-[#F4D03F]/10 flex items-center justify-between relative z-10">
                    <div className="space-y-0.5">
                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-wider">Hive Weight</p>
                        <p className="text-2xl font-black text-[#1A1A1A] tabular-nums tracking-tighter">{hive.weight}<span className="text-[10px] ml-1 text-gray-400">Kg</span></p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#F4D03F]/10 flex items-center justify-center group-hover:bg-[#F4D03F] group-hover:text-white transition-all shadow-sm">
                        <ArrowRight className="w-5 h-5 text-[#F4D03F] group-hover:text-white" />
                    </div>
                </div>

                {/* Industrial pattern background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F4D03F 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            </motion.div>

            {/* ── Back Face ── */}
            <motion.div 
                className="absolute inset-0 flex flex-col bg-white/80 border border-[#F4D03F]/30 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-xl"
                initial={false}
                animate={{ 
                    rotateY: isFlipped ? 0 : 180,
                    opacity: isFlipped ? 1 : 0
                }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ pointerEvents: isFlipped ? 'auto' : 'none' }}
            >
                <div className="p-5 border-b border-[#F4D03F]/10 bg-[#1A1A1A][0.02] flex items-center justify-between relative z-10">
                    <h4 className="text-[9px] font-black text-[#1A1A1A] opacity-60 uppercase tracking-widest">Hive Vitals & Yield</h4>
                    <Activity className="w-3.5 h-3.5 text-[#F4D03F]" />
                </div>

                <div className="flex-1 p-5 grid grid-cols-2 gap-2 relative z-10">
                    {[
                        { label: 'Temp', value: `${hive.temp}°C`, icon: Thermometer, color: 'text-[#1A1A1A]' },
                        { label: 'Humidity', value: `${hive.humidity}%`, icon: Droplet, color: 'text-[#1A1A1A]' },
                        { label: 'Total Yield', value: `${hive.totalHarvestedKg || 0} Kg`, icon: Box, color: 'text-[#F4D03F]' },
                        { label: 'Batches', value: `${hive.batchCount || 0}`, icon: Layers, color: 'text-[#1B9157]' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/50 p-3 rounded-xl border border-[#F4D03F]/5 flex flex-col justify-between group/item hover:border-[#F4D03F]/20 transition-all">
                            <s.icon className="w-3 h-3 text-[#F4D03F] mb-1.5 opacity-60 group-hover/item:opacity-100 transition-opacity" />
                            <div>
                                <p className={cn("text-lg font-black tracking-tighter tabular-nums leading-none mb-0.5", s.color)}>{s.value}</p>
                                <p className="text-[6px] font-black text-gray-400 uppercase">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-5 flex gap-2 relative z-10">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
                        className="flex-1 h-10 rounded-xl bg-white hover:bg-[#F4D03F]/5 text-[#1A1A1A] font-black text-[10px] transition-all border border-[#F4D03F]/10 shadow-sm"
                    >
                        History
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onMarkInspection(); }}
                        className="flex-1 h-10 rounded-xl bg-[#F4D03F] hover:bg-[#F4D03F]/80 text-[#1A1A1A] font-black text-[10px] transition-all shadow-lg shadow-[#F4D03F]/20"
                    >
                        Inspect
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default FlipCardHive;
