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
import { glass, PageHeader } from './GlassTheme';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';

const AcousticMoodTransformer: React.FC = ({ onTabChange }: any) => {
    const [mfccData, setMfccData] = React.useState<{ freq: number; db: number }[]>([]);
    const [status, setStatus] = React.useState<'queen-right' | 'queenless-roar' | 'swarm-intent'>('queen-right');
    const [confidence, setConfidence] = React.useState<number | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const rows = await beeyieldService.getAcousticReadings(undefined, 14);
                if (!mounted) return;

                // Convert latest readings into a simple spectral “shape”.
                // If frequency is present, chart it; otherwise create evenly spaced bins.
                const points = (rows || [])
                    .slice(0, 80)
                    .map((r: any, idx: number) => ({
                        freq: typeof r?.frequency_hz === 'number' ? r.frequency_hz : idx * 200,
                        db: typeof r?.amplitude_db === 'number' ? r.amplitude_db : 0,
                        health: typeof r?.health_index === 'number' ? r.health_index : null,
                        tags: r?.tags,
                    }))
                    .filter((p) => Number.isFinite(p.freq));

                if (points.length > 0) {
                    setMfccData(points.map(({ freq, db }) => ({ freq, db: Number(db || 0) })));
                    const health = points.find((p) => typeof p.health === 'number')?.health as number | undefined;
                    if (typeof health === 'number') setConfidence(Math.max(0, Math.min(100, health)));
                } else {
                    setMfccData([]);
                    setConfidence(null);
                }
            } catch (e: any) {
                console.error(e);
                if (mounted) toast.error(e?.message || 'Failed to load acoustic readings');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        const interval = setInterval(load, 30_000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    const STATUS_MAP = {
        'queen-right': {
            label: 'Healthy & Stable',
            desc: 'The queen is active and the hive is calm. Normal acoustic profile.',
            color: '#1B9157',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-700',
            icon: Heart
        },
        'queenless-roar': {
            label: 'Queenless Warning',
            desc: 'Potential queen loss. Low-frequency roar detected.',
            color: '#F4D03F',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-700',
            icon: AlertCircle
        },
        'swarm-intent': {
            label: 'Swarm Warning',
            desc: 'High congestion. Swarm likely within 72 hours.',
            color: '#ef4444',
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-700',
            icon: Zap
        }
    };

    const StatusIcon = STATUS_MAP[status].icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={BrainCircuit}
                label="Acoustic sensor"
                title={<>Hive <span className="text-[#1B9157]">Mood</span></>}
                subtitle="A quick sound check to spot unusual patterns."
                actions={
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        <Activity className={cn("w-3 h-3", loading ? "text-[#F4D03F] animate-spin" : "text-[#1B9157] animate-pulse")} />
                        <span className="text-xs font-bold text-gray-500 tracking-tight">
                            Sync:{' '}
                            <span className="text-[#1A1A1A]">
                                {typeof confidence === 'number' ? `${confidence.toFixed(1)}%` : (loading ? 'Loading…' : '—')}
                            </span>
                        </span>
                    </div>
                }
            />

            <div className={cn(glass.card, "p-0 flex flex-col xl:flex-row overflow-hidden bg-white")}>
                {/* Spectral View */}
                <div className="flex-1 p-5 lg:p-6 space-y-6 border-b xl:border-b-0 xl:border-r border-gray-100 bg-gray-50/30">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                <Waves className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Spectral Flow</h3>
                                <p className="text-[10px] font-bold text-gray-500 tracking-wider">Digital MFCC Array</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-[#1B9157] shadow-[0_0_8px_rgba(27,145,87,0.4)] animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-600 tracking-wider">Live Link</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full p-2 relative bg-white rounded-xl border border-gray-200 shadow-sm">
                         <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mfccData} margin={{ top: 10, right: 0, left: -40, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={STATUS_MAP[status].color} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={STATUS_MAP[status].color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                                <XAxis dataKey="freq" hide />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
                                                    <p className="text-[10px] font-bold text-gray-500 tracking-wider mb-1">{payload[0].payload.freq} Hz</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <p className="text-sm font-bold text-[#1A1A1A] tracking-tight tabular-nums">{payload[0].value?.toFixed(1)}</p>
                                                        <span className="text-[10px] font-medium text-gray-400">dB</span>
                                                    </div>
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
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorDb)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Freq', val: '225', unit: 'Hz', icon: Activity },
                            { label: 'Vibe', val: 'Normal', unit: '', icon: Zap },
                            { label: 'Gain', val: '58.2', unit: 'dB', icon: Volume2 }
                        ].map((stat, i) => (
                            <div key={i} className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center gap-1 group hover:border-[#1B9157]/30 hover:bg-[#F9F7F2]/50 transition-colors">
                                <p className="text-[10px] font-bold tracking-wider text-gray-500 group-hover:text-gray-600 transition-colors">{stat.label}</p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-base font-bold text-[#1A1A1A] leading-none tracking-tight">{stat.val}</p>
                                    {stat.unit && <span className="text-[10px] font-medium text-gray-400">{stat.unit}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Panel */}
                <div className="w-full xl:w-[360px] p-5 lg:p-6 space-y-6 bg-white">
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-gray-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Diagnosis Hub</h3>
                        </div>

                        <div className={cn(
                            "p-5 rounded-xl border transition-all duration-300 relative overflow-hidden shadow-sm",
                            STATUS_MAP[status].border,
                            STATUS_MAP[status].bg
                        )}>
                            <div className="flex items-center gap-3 mb-2 relative z-10">
                                <div className={cn("w-8 h-8 rounded-lg bg-white flex items-center justify-center border shadow-sm", STATUS_MAP[status].border)}>
                                    <StatusIcon className={cn("w-4 h-4", STATUS_MAP[status].text)} />
                                </div>
                                <h4 className={cn("text-sm font-bold tracking-tight", STATUS_MAP[status].text)}>{STATUS_MAP[status].label}</h4>
                            </div>
                            <p className={cn("text-xs font-medium leading-relaxed opacity-90", STATUS_MAP[status].text)}>
                                {STATUS_MAP[status].desc}
                            </p>
                        </div>
                    </section>

                    <Separator className="bg-gray-100" />

                    <section className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-bold tracking-wider text-gray-500">Choose a check</h4>
                            <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center border border-gray-200">
                                <Settings className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {[
                                { id: 'queen-right', label: 'Queen Vitality', icon: ShieldCheck, color: '#1B9157' },
                                { id: 'queenless-roar', label: 'Stress Signals', icon: Zap, color: '#F4D03F' },
                                { id: 'swarm-intent', label: 'Swarm Triggers', icon: Volume2, color: '#EF4444' }
                            ].map((btn) => (
                                <button
                                    key={btn.id}
                                    onClick={() => setStatus(btn.id as any)}
                                    className={cn(
                                        "w-full h-10 rounded-xl px-4 text-xs font-bold border transition-all group flex items-center justify-between outline-none",
                                        status === btn.id
                                            ? "bg-white text-[#1A1A1A] border-gray-300 shadow-sm"
                                            : "bg-gray-50 border-transparent text-gray-500 hover:bg-white hover:border-gray-200"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", status === btn.id ? "bg-[#1B9157] shadow-[0_0_6px_rgba(27,145,87,0.4)]" : "bg-gray-300")} />
                                        <span>{btn.label}</span>
                                    </div>
                                    <btn.icon className={cn("w-3.5 h-3.5", status === btn.id ? "text-gray-600" : "text-gray-400")} />
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-[#1B9157] animate-pulse rounded-full" />
                            <p className="text-[10px] font-bold tracking-wider text-[#1B9157]">Status</p>
                        </div>
                        <div className="font-mono text-[10px] text-gray-500 leading-relaxed">
                            <p className="flex gap-2"><span>&gt;</span> Analyzing…</p>
                            <p className="text-[#1B9157] font-bold flex gap-2"><span>&gt;</span> Up to date</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden group")}
            >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#F9F7F2] blur-2xl rounded-full" />
                <div className="flex items-start sm:items-center gap-4 relative z-10 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200 shadow-sm group-hover:bg-[#1B9157]/5 group-hover:border-[#1B9157]/20 transition-colors">
                        <Info className="w-5 h-5 text-gray-400 group-hover:text-[#1B9157] transition-colors" />
                    </div>
                    <div className="space-y-1">
                        <h5 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Sound check</h5>
                        <p className="text-[11px] font-medium text-gray-500 leading-relaxed max-w-2xl border-l-2 border-[#1B9157] pl-3">
                            The audio pattern looks normal. No swarm warning signs detected.
                        </p>
                    </div>
                </div>
                <button 
                  onClick={() => onTabChange && onTabChange('reports-exports')}
                  className={cn(glass.btnSecondary, "w-full sm:w-auto mt-2 sm:mt-0 h-9 px-4 relative z-10 text-xs font-bold")}
                >
                    View report
                </button>
            </motion.div>
        </motion.div>
    );
};

export default AcousticMoodTransformer;
