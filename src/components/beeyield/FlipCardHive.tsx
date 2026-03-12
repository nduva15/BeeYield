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
    const [isFlipped, setIsFlipped] = React.useState(false);

    const statusConfig = {
        ok: { label: 'NOMINAL', color: 'text-[#1A1A1A]', dot: 'bg-[#FFF9F0]' },
        warning: { label: 'ALERT', color: 'text-[#F4D03F]', dot: 'bg-[#F4D03F]' },
        critical: { label: 'CRITICAL', color: 'text-[#F4D03F]', dot: 'bg-[#F4D03F] shadow-[0_0_10px_#FF6B00]' },
    };

    const cfg = statusConfig[hive.status] || statusConfig.ok;

    return (
        <div 
            className="group perspective-1000 h-[380px] w-full cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="relative w-full h-full transition-all duration-700 preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* ── Front Face ── */}
                <div className="absolute inset-0 backface-hidden flex flex-col bg-[#F9F7F2] border border-[#F4D03F]/40 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-[#F4D03F]/10 bg-[#F9F7F2] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full animate-pulse", cfg.dot)} />
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", cfg.color)}>{cfg.label}</span>
                        </div>
                        <Hexagon className="w-5 h-5 text-gray-400" />
                    </div>
                    
                    <div className="flex-1 p-10 flex flex-col justify-center gap-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Unit Registry</p>
                        <h3 className="text-6xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none group-hover:text-[#F4D03F] transition-colors">
                            {hive.name}
                        </h3>
                    </div>

                    <div className="p-8 bg-[#F9F7F2] border-t border-[#F4D03F]/10 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Weight Protocol</p>
                            <p className="text-3xl font-mono font-black text-[#1A1A1A] tabular-nums">{hive.weight} KG</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#F9F7F2] border border-[#F4D03F]/20 flex items-center justify-center group-hover:bg-[#F4D03F]/10 group-hover:border-[#F4D03F]/30 transition-all">
                            <ArrowRight className="w-6 h-6 text-[#F4D03F]" />
                        </div>
                    </div>
                </div>

                {/* ── Back Face ── */}
                <div 
                    className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col bg-[#000000] border border-[#F4D03F]/40 rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(255,107,0,0.1)]"
                >
                    <div className="p-8 border-b border-[#F4D03F]/20 bg-[#F4D03F]/5 flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-[#F4D03F] uppercase tracking-widest">Biometric Telemetry</h4>
                        <Activity className="w-4 h-4 text-[#F4D03F]" />
                    </div>

                    <div className="flex-1 p-8 grid grid-cols-2 gap-4">
                        {[
                            { label: 'TEMP', value: `${hive.temp}°C`, icon: Thermometer },
                            { label: 'HUMIDITY', value: `${hive.humidity}%`, icon: Droplet },
                            { label: 'HEALTH', value: 'NOMINAL', icon: ShieldCheck },
                            { label: 'SIGNAL', value: '-84dBm', icon: Binary },
                        ].map((s, i) => (
                            <div key={i} className="bg-[#F9F7F2] p-4 rounded-xl border border-[#F4D03F]/10">
                                <s.icon className="w-4 h-4 text-gray-400 mb-3" />
                                <p className="text-xl font-mono font-black text-[#1A1A1A] tabular-nums leading-none mb-1">{s.value}</p>
                                <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 flex gap-3">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
                            className="flex-1 h-12 rounded-xl bg-[#F9F7F2] hover:bg-[#F4D03F]/10 text-[#1A1A1A] font-black text-[9px] uppercase tracking-widest transition-all border border-[#F4D03F]/20"
                        >
                            History
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onMarkInspection(); }}
                            className="flex-1 h-12 rounded-xl bg-[#F4D03F] hover:bg-[#F4D03F]/80 text-[#000000] font-black text-[9px] uppercase tracking-widest transition-all shadow-lg"
                        >
                            Task
                        </button>
                    </div>
                </div>
            </motion.div>

            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
};

export default FlipCardHive;
