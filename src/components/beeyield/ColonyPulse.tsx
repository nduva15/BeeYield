import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Droplets, Wind, Shield, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ColonyPulse: React.FC = () => {
    // Simulated Sensor Nodes
    const nodes = Array.from({ length: 9 }, (_, i) => ({
        id: i,
        status: Math.random() > 0.1 ? 'active' : 'idle',
        temp: (32 + Math.random() * 4).toFixed(1),
        humidity: (60 + Math.random() * 10).toFixed(0)
    }));

    return (
        <div className="bg-[#111111] border border-white/10 rounded-[2rem] overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-beeyield-gold/10 via-transparent to-transparent opacity-50" />

            <div className="relative p-8">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] font-mono">Precision Monitoring</span>
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                            Colony <span className="text-beeyield-gold">Digital Twin</span>
                        </h3>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-black text-white tabular-nums leading-none">94.8</p>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Health Index</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Visualizer - The "WOW" Part */}
                    <div className="relative aspect-square max-w-[320px] mx-auto">
                        {/* Outer Ring */}
                        <div className="absolute inset-0 border-2 border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
                        <div className="absolute inset-8 border-[1px] border-beeyield-gold/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

                        {/* Hive Hexagon Model */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-48 h-48">
                                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                                    <defs>
                                        <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#064E3B" stopOpacity="0.8" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                                        fill="url(#hexGrad)"
                                        stroke="#F59E0B"
                                        strokeWidth="0.5"
                                        className="animate-pulse"
                                    />
                                    {/* Sensory Points */}
                                    {nodes.map((node, i) => {
                                        const angle = (i * 45) * (Math.PI / 180);
                                        const r = 30;
                                        const x = 50 + r * Math.cos(angle);
                                        const y = 50 + r * Math.sin(angle);
                                        return (
                                            <motion.circle
                                                key={node.id}
                                                cx={x}
                                                cy={y}
                                                r="2.5"
                                                fill={node.status === 'active' ? '#10B981' : '#F87171'}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: [1, 1.5, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                            />
                                        );
                                    })}
                                </svg>

                                {/* Core Pulse */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-beeyield-gold/20 rounded-full blur-2xl animate-pulse" />
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="w-8 h-8 bg-beeyield-gold rounded-full flex items-center justify-center shadow-[0_0_30px_#F59E0B]"
                                    >
                                        <Shield className="w-4 h-4 text-black" />
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Tooltips */}
                        <div className="absolute top-0 right-0 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <Thermometer className="w-3 h-3 text-beeyield-orange" />
                                <span className="text-[10px] font-black text-white font-mono">35.4°C</span>
                            </div>
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block font-mono">CORE_TEMP</span>
                        </div>
                    </div>

                    {/* Stats & Analysis */}
                    <div className="space-y-6">
                        <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 font-mono">Anomalies Detected</p>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-4 h-4 text-red-400" />
                                        <span className="text-xs font-bold text-white">Vibration Surge</span>
                                    </div>
                                    <span className="text-[10px] font-black text-white/40 font-mono">0.02ms ago</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-beeyield-gold/10 border border-beeyield-gold/20 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-4 h-4 text-beeyield-gold" />
                                        <span className="text-xs font-bold text-white">Bloom Alignment</span>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-400 font-mono">NOMINAL</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2 text-beeyield-gold">
                                    <Droplets className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest font-mono">Humidity</span>
                                </div>
                                <p className="text-xl font-black text-white tabular-nums">64%</p>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2 text-beeyield-green">
                                    <Wind className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest font-mono">Air Flow</span>
                                </div>
                                <p className="text-xl font-black text-white tabular-nums">1.2m/s</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-beeyield-gold/50 to-transparent" />
        </div>
    );
};

export default ColonyPulse;
