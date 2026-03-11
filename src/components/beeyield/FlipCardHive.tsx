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
        ok: { label: 'NOMINAL', color: 'text-white', dot: 'bg-white' },
        warning: { label: 'ALERT', color: 'text-[#FF6B00]', dot: 'bg-[#FF6B00]' },
        critical: { label: 'CRITICAL', color: 'text-[#FF6B00]', dot: 'bg-[#FF6B00] shadow-[0_0_10px_#FF6B00]' },
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
                <div className="absolute inset-0 backface-hidden flex flex-col bg-[#0A0A0A] border border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full animate-pulse", cfg.dot)} />
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", cfg.color)}>{cfg.label}</span>
                        </div>
                        <Hexagon className="w-5 h-5 text-white/10" />
                    </div>
                    
                    <div className="flex-1 p-10 flex flex-col justify-center gap-4">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Unit Registry</p>
                        <h3 className="text-6xl font-black text-white tracking-tighter uppercase leading-none group-hover:text-[#FF6B00] transition-colors">
                            {hive.name}
                        </h3>
                    </div>

                    <div className="p-8 bg-white/5 border-t border-white/5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Weight Protocol</p>
                            <p className="text-3xl font-mono font-black text-white tabular-nums">{hive.weight} KG</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#FF6B00]/10 group-hover:border-[#FF6B00]/30 transition-all">
                            <ArrowRight className="w-6 h-6 text-[#FF6B00]" />
                        </div>
                    </div>
                </div>

                {/* ── Back Face ── */}
                <div 
                    className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col bg-[#000000] border border-[#FF6B00]/40 rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(255,107,0,0.1)]"
                >
                    <div className="p-8 border-b border-[#FF6B00]/20 bg-[#FF6B00]/5 flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest">Biometric Telemetry</h4>
                        <Activity className="w-4 h-4 text-[#FF6B00]" />
                    </div>

                    <div className="flex-1 p-8 grid grid-cols-2 gap-4">
                        {[
                            { label: 'TEMP', value: `${hive.temp}°C`, icon: Thermometer },
                            { label: 'HUMIDITY', value: `${hive.humidity}%`, icon: Droplet },
                            { label: 'HEALTH', value: 'NOMINAL', icon: ShieldCheck },
                            { label: 'SIGNAL', value: '-84dBm', icon: Binary },
                        ].map((s, i) => (
                            <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <s.icon className="w-4 h-4 text-white/20 mb-3" />
                                <p className="text-xl font-mono font-black text-white tabular-nums leading-none mb-1">{s.value}</p>
                                <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 flex gap-3">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
                            className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-widest transition-all border border-white/10"
                        >
                            History
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onMarkInspection(); }}
                            className="flex-1 h-12 rounded-xl bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-[#000000] font-black text-[9px] uppercase tracking-widest transition-all shadow-lg"
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
