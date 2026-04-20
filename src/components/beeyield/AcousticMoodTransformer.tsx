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
import { BeeYieldPageHeader, BeeYieldPageShell } from './BeeYieldUI';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';

const AcousticMoodTransformer: React.FC<any> = ({ onTabChange }: any) => {
    const [soundData, setSoundData] = React.useState<{ freq: number; db: number }[]>([]);
    const [status, setStatus] = React.useState<'healthy' | 'missing-queen' | 'swarm-risk'>('healthy');
    const [confidence, setConfidence] = React.useState<number | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isOffline, setIsOffline] = React.useState(false);

    const LS_KEY = "beeyield_acoustic_mood_cache_v1";

    const readCache = React.useCallback(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }, []);

    const writeCache = React.useCallback((data: any) => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(data));
        } catch { /* ignore */ }
    }, []);

    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setIsOffline(false);
            try {
                const rows = await beeyieldService.getAcousticReadings(undefined, 14);
                if (!mounted) return;

                // Convert latest readings into a simple spectral “shape”.
                const points = (rows || [])
                    .slice(0, 80)
                    .map((r: any, idx: number) => ({
                        freq: typeof r?.frequency_hz === 'number' ? r.frequency_hz : idx * 200,
                        db: typeof r?.amplitude_db === 'number' ? r.amplitude_db : 0,
                        health: typeof r?.health_index === 'number' ? r.health_index : null,
                    }))
                    .filter((p) => Number.isFinite(p.freq));

                if (points.length > 0) {
                    const data = points.map(({ freq, db }) => ({ freq, db: Number(db || 0) }));
                    setSoundData(data);
                    const health = points.find((p) => typeof p.health === 'number')?.health as number | undefined;
                    const conf = typeof health === 'number' ? Math.max(0, Math.min(100, health)) : null;
                    setConfidence(conf);
                    writeCache({ soundData: data, confidence: conf, timestamp: Date.now() });
                } else {
                    setSoundData([]);
                    setConfidence(null);
                }
            } catch (e: any) {
                console.error(e);
                const cached = readCache();
                if (cached && mounted) {
                    setSoundData(cached.soundData);
                    setConfidence(cached.confidence);
                    setIsOffline(true);
                    toast.info("Offline: Showing last recorded acoustic signature");
                } else if (mounted) {
                    toast.error(e?.message || 'Failed to load acoustic readings');
                }
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
    }, [readCache, writeCache]);

    const STATUS_MAP = {
        'healthy': {
            label: 'Healthy & Stable',
            desc: 'The queen is active and the hive is calm. Normal sound profile.',
            color: '#1B9157',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-700',
            icon: Heart
        },
        'missing-queen': {
            label: 'Queen Missing',
            desc: 'Potential queen loss. Unusual distress sound detected.',
            color: '#F4D03F',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-700',
            icon: AlertCircle
        },
        'swarm-risk': {
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
        <BeeYieldPageShell className="p-4 lg:p-6 space-y-6 pb-20">
            <BeeYieldPageHeader
                icon={BrainCircuit}
                label="Sound Analysis"
                title={<>Hive <span className="text-[#1B9157]">Status</span></>}
                subtitle="Sound-based check to identify colony status and potential risks."
                actions={
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        <Activity className={cn("w-3 h-3", loading ? "text-[#F4D03F] animate-spin" : "text-[#1B9157] animate-pulse")} />
                        <span className="text-xs font-bold text-muted-foreground tracking-tight">
                            Confidence:{' '}
                            <span className="text-foreground">
                                {typeof confidence === 'number' ? `${confidence.toFixed(1)}%` : (loading ? 'Analyzing…' : '—')}
                            </span>
                        </span>
                    </div>
                }
            />

            {isOffline && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-amber-500" />
                        <p className="text-sm font-semibold text-amber-700">Displaying cached acoustic data. Reconnect to see live frequency sweeps.</p>
                    </div>
                </div>
            )}

            <div className={cn(glass.card, "p-0 flex flex-col xl:flex-row overflow-hidden bg-white shadow-xl")}>
                {/* Spectral View */}
                <div className="flex-1 p-5 lg:p-6 space-y-6 border-b xl:border-b-0 xl:border-r border-gray-100 bg-gray-50/10">
                    <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                        <Waves className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Sound pattern</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live sound display</p>
                    </div>
                </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-[#1B9157] shadow-[0_0_8px_rgba(27,145,87,0.4)] animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Active</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full p-2 relative bg-white rounded-xl border border-gray-100 shadow-inner">
                         <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={soundData} margin={{ top: 10, right: 0, left: -40, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={STATUS_MAP[status].color} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={STATUS_MAP[status].color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="3 3" />
                                <XAxis dataKey="freq" hide />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white p-3 rounded-xl shadow-2xl border border-gray-100">
                                                    <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">{payload[0].payload.freq} Hz</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <p className="text-sm font-black text-foreground tabular-nums">{payload[0].value?.toFixed(1)}</p>
                                                        <span className="text-[10px] font-medium text-muted-foreground/70">dB</span>
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
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorDb)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Frequency', val: '225', unit: 'Hz', icon: Activity },
                            { label: 'Intensity', val: 'Nominal', unit: '', icon: Zap },
                            { label: 'Volume', val: '58.2', unit: 'dB', icon: Volume2 }
                        ].map((stat, i) => (
                            <div key={i} className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center gap-1 group hover:border-[#1B9157]/30 transition-colors">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 group-hover:text-muted-foreground/90">{stat.label}</p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-base font-black text-foreground tracking-tighter">{stat.val}</p>
                                    {stat.unit && <span className="text-[9px] font-medium text-muted-foreground/70">{stat.unit}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Panel */}
                <div className="w-full xl:w-[360px] p-5 lg:p-6 space-y-6 bg-[#FCFAF5]">
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-muted-foreground/70" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Colony Analysis</h3>
                        </div>

                        <div className={cn(
                            "p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden shadow-sm bg-white",
                            STATUS_MAP[status].border
                        )}>
                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <div className={cn("w-10 h-10 rounded-xl bg-white flex items-center justify-center border shadow-sm", STATUS_MAP[status].border)}>
                                    <StatusIcon className={cn("w-5 h-5", STATUS_MAP[status].text)} />
                                </div>
                                <h4 className={cn("text-base font-black tracking-tight", STATUS_MAP[status].text)}>{STATUS_MAP[status].label}</h4>
                            </div>
                            <p className={cn("text-xs font-medium leading-relaxed", STATUS_MAP[status].text, "opacity-80")}>
                                {STATUS_MAP[status].desc}
                            </p>
                        </div>
                    </section>

                    <Separator className="bg-gray-200/50" />

                    <section className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Analysis Mode</h4>
                            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center border border-gray-200">
                                <Settings className="w-3.5 h-3.5 text-muted-foreground/70" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {[
                                { id: 'healthy', label: 'Colony Vitals', icon: ShieldCheck, color: '#1B9157' },
                                { id: 'missing-queen', label: 'Stress Signals', icon: Zap, color: '#F4D03F' },
                                { id: 'swarm-risk', label: 'Swarm Triggers', icon: Volume2, color: '#EF4444' }
                            ].map((btn) => (
                                <button
                                    key={btn.id}
                                    id={`acoustic-mode-${btn.id}`}
                                    onClick={() => setStatus(btn.id as any)}
                                    aria-label={`Switch to ${btn.label} analysis`}
                                    className={cn(
                                        "w-full h-11 rounded-xl px-4 text-xs font-bold border transition-all group flex items-center justify-between outline-none bg-white",
                                        status === btn.id
                                            ? "text-foreground border-gray-300 shadow-md scale-[1.02]"
                                            : "border-transparent text-muted-foreground/70 hover:border-gray-200"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", status === btn.id ? "bg-[#1B9157] shadow-[0_0_8px_rgba(27,145,87,0.4)]" : "bg-gray-200")} />
                                        <span>{btn.label}</span>
                                    </div>
                                    <btn.icon className={cn("w-4 h-4", status === btn.id ? "text-muted-foreground/90" : "text-gray-300")} />
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-inner">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-[#1B9157] animate-pulse rounded-full" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1B9157]">Processing</p>
                        </div>
                        <div className="font-mono text-[9px] text-muted-foreground/70 leading-relaxed">
                            <p className="flex gap-2 font-bold"><span>&gt;</span> Data verified</p>
                            <p className="text-[#1B9157] font-bold flex gap-2"><span>&gt;</span> Health confirmed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden group shadow-lg")}
            >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-muted/20 blur-3xl rounded-full" />
                <div className="flex items-start sm:items-center gap-4 relative z-10 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-muted/20 flex items-center justify-center shrink-0 border border-gray-100 shadow-sm group-hover:bg-[#1B9157]/10 group-hover:border-[#1B9157]/20 transition-all">
                        <Info className="w-5 h-5 text-[#1B9157]" />
                    </div>
                    <div className="space-y-1">
                        <h5 className="text-sm font-black text-foreground tracking-tight">Status Update</h5>
                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed max-w-2xl border-l-2 border-[#1B9157] pl-3">
                            The colony's acoustic profile is stable. Sensor data indicates normal foraging behavior and queen activity.
                        </p>
                    </div>
                </div>
                <button 
                  id="view-report-button"
                  onClick={() => onTabChange && onTabChange('reports-exports')}
                  className={cn(glass.btnSecondary, "w-full sm:w-auto mt-2 sm:mt-0 h-10 px-6 relative z-10 text-xs font-bold shadow-sm")}
                  aria-label="View detailed production report"
                >
                    View report
                </button>
            </motion.div>
            </BeeYieldPageShell>
    );
};

export default AcousticMoodTransformer;

