import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Volume2, Zap, AlertCircle, Activity, Timer, Database, ShieldAlert, BrainCircuit,
    ChevronRight, Search, Settings, ShieldCheck, Play, Info, Loader2, Waves, Heart, ArrowRight
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';

// Mock MFCC Data
const generateMFCC = () => {
    return Array.from({ length: 40 }, (_, i) => ({
        freq: i * 200,
        db: 20 + Math.random() * 40 + (i > 10 && i < 20 ? 15 : 0) // Peak for activity
    }));
};

const AcousticMoodTransformer: React.FC = () => {
    const [mfccData, setMfccData] = React.useState(generateMFCC());
    const [status, setStatus] = React.useState<'queen-right' | 'queenless-roar' | 'swarm-intent'>('queen-right');
    const [confidence, setConfidence] = React.useState(98.4);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMfccData(generateMFCC());
            setConfidence(prev => Math.max(95, Math.min(99.9, prev + (Math.random() - 0.5))));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const STATUS_MAP = {
        'queen-right': {
            label: 'Healthy & Stable',
            desc: 'The queen is active and the hive is calm. Everything is normal.',
            color: 'hsl(var(--honey))',
            bg: 'bg-honey/10',
            border: 'border-honey/20',
            text: 'text-honey',
            icon: Heart
        },
        'queenless-roar': {
            label: 'Queenless Warning',
            desc: 'The queen might be missing. We hear a low roar from the bees.',
            color: '#f59e0b',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            text: 'text-amber-600',
            icon: AlertCircle
        },
        'swarm-intent': {
            label: 'Swarm Warning',
            desc: 'The hive is getting crowded. A swarm may be coming in the next 3 days.',
            color: '#ef4444',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            text: 'text-red-600',
            icon: Zap
        }
    };

    const StatusIcon = STATUS_MAP[status].icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-20 pb-24")}
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 pb-12 border-b border-white/5">
                <div className="space-y-6">
                    <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 px-8 py-2.5 shadow-3xl skew-x-[-12deg]')}>
                        <div className="flex items-center gap-4 skew-x-[12deg]">
                            <BrainCircuit className="w-5 h-5" />
                            <span className="uppercase tracking-[0.4em] font-black italic text-[12px]">AI Sound Analysis</span>
                        </div>
                    </div>
                    <h1 className="text-8xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Hive <span className="text-honey">Mood</span>
                    </h1>
                    <p className={cn(glass.microLabel, 'opacity-40 italic font-black uppercase tracking-[0.4em] ml-2')}>
                        Real-time listening to detect colony health and queen status.
                    </p>
                </div>

                <div className="flex gap-6">
                    <div className={cn(glass.card, "px-12 py-6 bg-white/80 backdrop-blur-3xl border-white/5 rounded-[3rem] shadow-4xl text-right group")}>
                        <p className="text-[14px] font-black italic uppercase tracking-[0.3em] opacity-40 mb-2 group-hover:text-honey transition-colors">Confidence</p>
                        <p className="text-6xl font-black text-honey tabular-nums italic tracking-tighter leading-none">{confidence.toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            <div className={cn(glass.card, "flex flex-col xl:flex-row overflow-hidden bg-white/90 backdrop-blur-3xl rounded-[6rem] relative border-white/5 shadow-4xl")}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-honey/10 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40" />

                {/* Spectral View */}
                <div className="flex-1 p-16 lg:p-24 space-y-16 relative z-10 border-r border-white/5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-honey/10 flex items-center justify-center border-2 border-honey/20 shadow-4xl">
                                <Waves className="w-10 h-10 text-honey" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Sound <span className="text-honey">Waves</span></h3>
                                <p className="text-xl font-black italic opacity-40 uppercase tracking-widest pl-2 border-l-8 border-white/5">Live reading from hive sensors.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className={cn(glass.badge, 'bg-gray-100 border-white/5 px-8 py-3 rounded-full')}>
                                <span className="text-[12px] font-black uppercase italic tracking-[0.4em] opacity-40">Frequency Array</span>
                            </div>
                            <div className={cn(glass.badge, 'bg-honey text-black border-transparent px-8 py-3 rounded-full font-black italic shadow-4xl animate-pulse')}>
                                LIVE STREAMING
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.card, "h-[500px] w-full p-12 relative overflow-hidden bg-gray-50 border-none rounded-[4rem] shadow-inner")}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mfccData} margin={{ top: 20, right: 0, left: -40, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={STATUS_MAP[status].color} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={STATUS_MAP[status].color} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="white" strokeOpacity={0.05} />
                                <XAxis dataKey="freq" hide />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'currentColor', opacity: 0.3, fontWeight: 'black', fontSize: 16, fontStyle: 'italic' }}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#FBBE24', strokeWidth: 2, strokeDasharray: '8 8' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/90 backdrop-blur-3xl p-6 rounded-3xl border border-gray-200 shadow-4xl">
                                                    <p className="text-lg font-black text-honey uppercase italic tracking-widest mb-2">{payload[0].payload.freq} Hz</p>
                                                    <p className="text-4xl font-black text-gray-900 italic tracking-tighter tabular-nums">{payload[0].value?.toFixed(1)} <span className="text-xl opacity-40">dB</span></p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="db"
                                    stroke={STATUS_MAP[status].color}
                                    strokeWidth={8}
                                    fillOpacity={1}
                                    fill="url(#colorDb)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: 'Main Frequency', val: '225 Hz', icon: Activity },
                            { label: 'Vibration', val: 'Normal', icon: Zap },
                            { label: 'Loudness', val: '58.2 dB', icon: Volume2 }
                        ].map((stat, i) => (
                            <div key={i} className={cn(glass.card, "p-10 text-center shadow-4xl border-white/5 bg-white/40 group hover:border-honey/40 transition-all rounded-[3rem]")}>
                                <p className="text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40 mb-4 group-hover:text-honey transition-colors">{stat.label}</p>
                                <p className="text-4xl font-black italic uppercase tracking-tighter leading-none">{stat.val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Panel */}
                <div className="w-full xl:w-[550px] p-16 lg:p-24 space-y-20 relative z-10">
                    <section className="space-y-12">
                        <div className="flex items-center gap-6 border-honey border-l-8 pl-8">
                            <ShieldAlert className="w-10 h-10 text-honey" />
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Diagnosis</h3>
                        </div>

                        <div className={cn(
                            "p-16 rounded-[4rem] border shadow-4xl transition-all duration-1000 relative overflow-hidden group/diag",
                            STATUS_MAP[status].border,
                            STATUS_MAP[status].bg
                        )}>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover/diag:bg-white/20 transition-all duration-1000" />
                            <div className="flex items-center gap-6 mb-8 relative z-10">
                                <div className="w-20 h-20 rounded-[2rem] bg-white/80 flex items-center justify-center border-2 border-current shadow-4xl">
                                    <StatusIcon className={cn("w-10 h-10", STATUS_MAP[status].text)} />
                                </div>
                                <h4 className={cn("text-5xl font-black italic uppercase tracking-tighter leading-none", STATUS_MAP[status].text)}>{STATUS_MAP[status].label}</h4>
                            </div>
                            <p className={cn("text-2xl font-black italic leading-tight opacity-70 relative z-10", STATUS_MAP[status].text)}>
                                {STATUS_MAP[status].desc}
                            </p>
                        </div>
                    </section>

                    <Separator className="bg-white/5 h-[2px]" />

                    <section className="space-y-12">
                        <div className="flex justify-between items-center px-4">
                            <h4 className="text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Analysis Options</h4>
                            <div className="w-12 h-12 rounded-[1.5rem] bg-white/40 flex items-center justify-center border border-white/5">
                                <Settings className="w-6 h-6 text-foreground/20" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { id: 'queen-right', label: 'Check for Queen', icon: ShieldCheck, color: 'emerald' },
                                { id: 'queenless-roar', label: 'Check for Roar', icon: Zap, color: 'amber' },
                                { id: 'swarm-intent', label: 'Check for Swarm', icon: Volume2, color: 'red' }
                            ].map((btn) => (
                                <button
                                    key={btn.id}
                                    onClick={() => setStatus(btn.id as any)}
                                    className={cn(
                                        "w-full h-24 rounded-[3rem] px-12 font-black italic uppercase text-2xl border-2 transition-all group relative overflow-hidden flex items-center justify-between",
                                        status === btn.id
                                            ? `bg-${btn.color}-500 text-black border-${btn.color}-500 shadow-4xl scale-105`
                                            : "bg-white/5 border-white/5 text-foreground/40 hover:border-honey/20 hover:text-honey hover:bg-honey/5"
                                    )}
                                >
                                    <div className="flex items-center gap-8 relative z-10">
                                        <div className={cn("w-4 h-4 rounded-full", status === btn.id ? "bg-black" : "bg-white/20")} />
                                        <span>{btn.label}</span>
                                    </div>
                                    <btn.icon className={cn("w-8 h-8 relative z-10", status === btn.id ? "text-black" : "opacity-20 group-hover:opacity-100 transition-opacity")} />
                                    {status === btn.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Simulation logs - kept but simplified */}
                    <div className={cn(glass.card, "p-12 bg-black rounded-[4rem] flex flex-col gap-10 shadow-4xl relative overflow-hidden group/log")}>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24 group-hover/log:bg-emerald-500/20 transition-all" />
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-4 h-4 bg-emerald-500 animate-pulse rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                            <p className="text-[12px] font-black italic uppercase tracking-[0.4em] text-emerald-500">AI Processing</p>
                        </div>
                        <div className="font-mono text-[14px] text-gray-600 leading-relaxed italic relative z-10 space-y-2 uppercase tracking-widest">
                            <p className="animate-pulse">Analyzing sound patterns...</p>
                            <p className="text-emerald-500 font-black">Everything looks healthy</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={cn(glass.card, "p-16 lg:p-24 bg-white/80 backdrop-blur-3xl rounded-[6rem] border-white/5 shadow-4xl flex flex-col md:flex-row items-center gap-20 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-honey/5 rounded-full blur-[150px] pointer-events-none group-hover:bg-honey/10 transition-all duration-1000" />
                <div className="w-32 h-32 rounded-[4rem] bg-honey/10 flex items-center justify-center shrink-0 border-2 border-honey/20 shadow-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 relative z-10">
                    <Info className="w-16 h-16 text-honey" />
                </div>
                <div className="relative z-10 space-y-8 flex-1">
                    <h5 className="text-5xl font-black italic uppercase tracking-tighter leading-none">AI Sound <span className="text-honey">Insight</span></h5>
                    <p className="text-3xl font-black italic text-foreground opacity-60 leading-tight max-w-6xl pl-4 border-l-8 border-honey">
                        Our AI has analyzed the hive sounds and everything looks healthy.
                        The pattern is steady, the bees are calm, and the queen is doing her job well.
                        We don't see any signs of swarming in the next few days.
                    </p>
                </div>
                <button className={cn(glass.btnSecondary, "h-24 px-16 group/btn bg-white overflow-hidden rounded-[3.5rem] border-gray-200 shadow-4xl mt-8 md:mt-0")}>
                    <div className="absolute inset-0 bg-honey/0 group-hover/btn:bg-honey/10 transition-all" />
                    <div className="relative flex items-center gap-8">
                        <span className="text-2xl font-black italic uppercase">Details</span>
                        <ArrowRight className="w-10 h-10 group-hover/btn:translate-x-4 transition-transform" />
                    </div>
                </button>
            </motion.div>

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 3s infinite linear; }
            `}</style>
        </motion.div>
    );
};

export default AcousticMoodTransformer;
