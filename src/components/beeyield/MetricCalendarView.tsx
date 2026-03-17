import React from 'react';
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    isSameMonth, 
    isToday, 
    addDays,
    eachDayOfInterval,
    isSameDay
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, 
    ChevronRight, 
    Activity, 
    TrendingUp, 
    Zap, 
    Droplets, 
    Thermometer,
    Info,
    ArrowUpRight,
    Search,
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import beeyieldService, { SensorReading } from '@/services/beeyieldService';

interface MetricCalendarViewProps {
    onTabChange?: (tab: string) => void;
}

type MetricType = 'VPM' | 'YIELD' | 'TEMP' | 'VIBE';

interface DayMetric {
    date: Date;
    value: number;
    intensity: number; // 0 to 1
}

const MetricCalendarView: React.FC<MetricCalendarViewProps> = ({ onTabChange }) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [activeMetric, setActiveMetric] = React.useState<MetricType>('VPM');
    const [hoveredDay, setHoveredDay] = React.useState<Date | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [dayMetrics, setDayMetrics] = React.useState<Map<string, DayMetric>>(new Map());

    const generateCalendarDays = () => {
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    };

    const metricConfig = {
        VPM: { label: 'Visits/Min', icon: Activity, color: '#F4D03F', unit: 'vpm' },
        YIELD: { label: 'Honey Yield', icon: TrendingUp, color: '#1B9157', unit: 'kg' },
        TEMP: { label: 'Temperature', icon: Thermometer, color: '#FF6B00', unit: '°C' },
        VIBE: { label: 'Vibration', icon: Zap, color: '#6366F1', unit: 'Hz' },
    };

    const days = generateCalendarDays();
    const config = metricConfig[activeMetric];

    React.useEffect(() => {
        let mounted = true;

        const extractValue = (r: any, metric: MetricType) => {
            if (!r) return null;
            if (metric === 'VPM') {
                const v =
                    typeof r?.vpm === 'number'
                        ? r.vpm
                        : typeof r?.visits_per_minute === 'number'
                            ? r.visits_per_minute
                            : typeof r?.activity_vpm === 'number'
                                ? r.activity_vpm
                                : null;
                return typeof v === 'number' ? v : null;
            }
            if (metric === 'TEMP') {
                const t =
                    typeof r?.temperature === 'number'
                        ? r.temperature
                        : typeof r?.temperature_celsius === 'number'
                            ? r.temperature_celsius
                            : typeof r?.temp_c === 'number'
                                ? r.temp_c
                                : null;
                return typeof t === 'number' ? t : null;
            }
            if (metric === 'VIBE') {
                const hz =
                    typeof r?.vibration_hz === 'number'
                        ? r.vibration_hz
                        : typeof r?.vibe_hz === 'number'
                            ? r.vibe_hz
                            : typeof r?.frequency_hz === 'number'
                                ? r.frequency_hz
                                : null;
                return typeof hz === 'number' ? hz : null;
            }
            // YIELD proxy: daily positive delta of weight_kg (when present)
            const w =
                typeof r?.weight_kg === 'number'
                    ? r.weight_kg
                    : typeof r?.weight === 'number'
                        ? r.weight
                        : typeof r?.hive_weight_kg === 'number'
                            ? r.hive_weight_kg
                            : null;
            return typeof w === 'number' ? w : null;
        };

        const toDayKey = (d: Date) => format(d, 'yyyy-MM-dd');

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
                const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
                const hoursBack = Math.min(24 * 60, Math.max(24, Math.ceil((Date.now() - start.getTime()) / 3600000) + 12));

                const rows: SensorReading[] = await beeyieldService.getSensorReadings(undefined, hoursBack);
                if (!mounted) return;

                // Bucket readings by day for the displayed range.
                const buckets = new Map<string, SensorReading[]>();
                (rows || []).forEach((r: any) => {
                    const tsRaw = r?.recorded_at || r?.timestamp || r?.created_at;
                    const d = tsRaw ? new Date(tsRaw) : null;
                    if (!d || Number.isNaN(d.getTime())) return;
                    if (d < start || d > end) return;
                    const k = toDayKey(d);
                    const arr = buckets.get(k) || [];
                    arr.push(r);
                    buckets.set(k, arr);
                });

                const next = new Map<string, DayMetric>();
                const values: number[] = [];

                days.forEach((date) => {
                    const k = toDayKey(date);
                    const list = buckets.get(k) || [];
                    if (list.length === 0) return;

                    if (activeMetric === 'YIELD') {
                        // Sort by time then sum positive weight deltas.
                        const points = list
                            .map((r: any) => {
                                const tsRaw = r?.recorded_at || r?.timestamp || r?.created_at;
                                const ts = tsRaw ? new Date(tsRaw).getTime() : NaN;
                                const w = extractValue(r, 'YIELD');
                                return Number.isFinite(ts) && typeof w === 'number' ? { ts, w } : null;
                            })
                            .filter(Boolean) as { ts: number; w: number }[];
                        points.sort((a, b) => a.ts - b.ts);
                        let sum = 0;
                        for (let i = 1; i < points.length; i++) {
                            const dw = points[i].w - points[i - 1].w;
                            if (dw > 0) sum += dw;
                        }
                        const v = Number(sum.toFixed(2));
                        values.push(v);
                        next.set(k, { date, value: v, intensity: 0 });
                        return;
                    }

                    const vals = list
                        .map((r: any) => extractValue(r, activeMetric))
                        .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
                    if (vals.length === 0) return;

                    const v = activeMetric === 'VPM' ? vals.reduce((s, x) => s + x, 0) / vals.length : Math.max(...vals);
                    const vRounded = Number(v.toFixed(2));
                    values.push(vRounded);
                    next.set(k, { date, value: vRounded, intensity: 0 });
                });

                // Normalize intensity across visible month (robust against outliers)
                const sorted = values.slice().sort((a, b) => a - b);
                const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 1;
                const denom = Math.max(1e-9, p95 || 1);
                next.forEach((m, k) => {
                    const intensity = Math.max(0, Math.min(1, m.value / denom));
                    next.set(k, { ...m, intensity });
                });

                setDayMetrics(next);
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message || 'Failed to load calendar metrics.');
                setDayMetrics(new Map());
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate, activeMetric]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-8 pb-20 min-h-screen")}
        >
            <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-[#F4D03F]/[0.05] rounded-full blur-[160px] -mr-40 -mt-40 pointer-events-none" />

            {/* Header Area */}
            <PageHeader
                icon={config.icon}
                label="METRICS"
                title={<>Metric <span className="text-[#F4D03F]">Calendar</span></>}
                subtitle="See how your hive metrics change over time."
                actions={
                    <div className="flex gap-3 bg-white/30 p-1.5 rounded-2xl border border-white/40 shadow-inner backdrop-blur-xl relative z-10">
                        {(['VPM', 'YIELD', 'TEMP', 'VIBE'] as MetricType[]).map((m) => {
                            const Icon = metricConfig[m].icon;
                            return (
                                <button
                                    key={m}
                                    onClick={() => setActiveMetric(m)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl flex items-center gap-2 transition-all",
                                        activeMetric === m 
                                            ? "bg-white text-[#1A1A1A] shadow-lg scale-105" 
                                            : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{m}</span>
                                </button>
                            );
                        })}
                    </div>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
                {/* Main Calendar View */}
                <div className="xl:col-span-8 space-y-6">
                    <div className={cn(glass.card, "p-8 space-y-10 bg-white/40 backdrop-blur-3xl border-white/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden")}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F4D03F]/40 to-transparent opacity-60" />
                        
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <h3 className="text-sm font-black text-black tracking-tighter uppercase leading-none">
                                    {format(currentDate, "MMMM")} <span className="text-[#F4D03F]">{format(currentDate, "yyyy")}</span>
                                </h3>
                                <p className="text-[6px] font-black text-black opacity-50 uppercase tracking-[0.2em] mt-0.5">Monthly view</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                                    aria-label="Previous month"
                                    title="Previous month"
                                    className={cn(glass.btnSecondary, "w-9 h-9 p-0 flex items-center justify-center rounded-xl bg-white/40 border-white/40 hover:bg-white/60 shadow-sm transition-all text-black")}
                                >
                                    <ChevronLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                                    aria-label="Next month"
                                    title="Next month"
                                    className={cn(glass.btnSecondary, "w-9 h-9 p-0 flex items-center justify-center rounded-xl bg-white/40 border-white/40 hover:bg-white/60 shadow-sm transition-all text-black")}
                                >
                                    <ChevronRight className="w-4 h-4" aria-hidden="true" focusable="false" />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-3">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                                <div key={d} className="text-center py-2">
                                    <span className="text-[8px] font-black text-black tracking-[0.2em]">{d}</span>
                                </div>
                            ))}
                            {days.map((date, i) => {
                                const isCurrentMonth = isSameMonth(date, currentDate);
                                const isTodayDate = isToday(date);
                                const isHovered = hoveredDay && isSameDay(date, hoveredDay);
                                const dayKey = format(date, 'yyyy-MM-dd');
                                const metric = dayMetrics.get(dayKey);
                                const bg = metric
                                    ? `linear-gradient(180deg, rgba(255,255,255,0.0), ${config.color}${Math.round(metric.intensity * 35 + 5).toString(16).padStart(2, '0')})`
                                    : undefined;

                                return (
                                    <motion.div
                                        key={i}
                                        onMouseEnter={() => isCurrentMonth && setHoveredDay(date)}
                                        onMouseLeave={() => setHoveredDay(null)}
                                        className={cn(
                                            "min-h-[80px] rounded-[1.2rem] p-3 border transition-all duration-500 group/day relative overflow-hidden flex flex-col justify-between",
                                            isCurrentMonth ? "bg-white/20 border-white/40 hover:border-[#F4D03F]/60 shadow-sm" : "bg-transparent border-transparent opacity-[0.05] pointer-events-none",
                                            isTodayDate ? "ring-2 ring-[#F4D03F]/50 border-[#F4D03F]/60 bg-white/70 shadow-lg" : ""
                                        )}
                                        style={bg ? { backgroundImage: bg } : undefined}
                                    >
                                        <div className="flex justify-between items-start relative z-10">
                                            <span className={cn(
                                                "text-[10px] font-black tracking-tight tabular-nums transition-all",
                                                isTodayDate ? "text-[#F4D03F]" : "text-black group-hover/day:scale-110"
                                            )}>
                                                {format(date, 'd')}
                                            </span>
                                            {isCurrentMonth && (
                                                <div className="w-1 h-1 rounded-full bg-black/10" />
                                            )}
                                        </div>

                                        <div className="relative z-10 mt-auto">
                                            <p className={cn(
                                                "text-[8px] font-black tracking-tight tabular-nums transition-all text-black",
                                                isHovered ? "opacity-100" : "opacity-0"
                                            )}>
                                                {metric ? metric.value : '—'}
                                                <span className="text-[6px] font-bold uppercase tracking-widest ml-1 opacity-30">{config.unit}</span>
                                            </p>
                                        </div>

                                        {/* Micro Sparkline Placeholder */}
                                        <div className="h-1 w-full flex gap-0.5 mt-2 opacity-30 relative z-10">
                                            {Array.from({ length: 5 }).map((_, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="flex-1 rounded-full" 
                                                    style={{ 
                                                        backgroundColor: config.color,
                                                        opacity: 0.15
                                                    }} 
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar Diagnostics */}
                <div className="xl:col-span-4 space-y-6">
                    {/* Insights Card */}
                    <div className={cn(glass.card, "p-8 space-y-6 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl overflow-hidden group")}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Summary</h3>
                            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center border border-white/40 shadow-sm group-hover:scale-110 transition-transform">
                                <Info className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-white/60 border border-white/40 space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly peak</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black text-[#1A1A1A] tracking-tighter tabular-nums">—</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">Max ({config.unit})</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <ArrowUpRight className="w-3 h-3" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Needs real telemetry</span>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/60 border border-white/40 space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly average</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black text-[#1A1A1A] tracking-tighter tabular-nums">—</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">Avg ({config.unit})</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                disabled={loading || !!error || dayMetrics.size === 0}
                                onClick={() => {
                                    const header = 'date,metric,value\n';
                                    const rows = Array.from(dayMetrics.values())
                                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                                        .map((m) => `${format(m.date, 'yyyy-MM-dd')},${activeMetric},${m.value}`)
                                        .join('\n');
                                    const blob = new Blob([header + rows + '\n'], { type: 'text/csv;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `beeyield-metric-calendar-${activeMetric}-${format(currentDate, 'yyyy-MM')}.csv`;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    URL.revokeObjectURL(url);
                                }}
                                className={cn(
                                    glass.btnSecondary,
                                    "w-full h-12 rounded-2xl border-white/60 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-[#1A1A1A] transition-all",
                                    (loading || !!error || dayMetrics.size === 0) && "opacity-60 cursor-not-allowed"
                                )}
                            >
                                {loading ? 'Loading…' : error ? 'Unavailable' : 'Download data'}
                            </button>
                        </div>
                    </div>

                    {/* Summary Graph Card */}
                    <div className={cn(glass.card, "p-8 space-y-6 bg-white/40 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl overflow-hidden")}>
                        <h3 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] mb-4">Trend</h3>
                        <div className="h-24 flex items-end gap-1.5 px-2">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `20%` }}
                                    transition={{ delay: i * 0.05, duration: 1 }}
                                    className="flex-1 rounded-full bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 relative group"
                                >
                                    <div className="absolute inset-0 bg-[#F4D03F]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            ))}
                        </div>
                        <p className="text-[9px] font-medium text-gray-400 italic leading-relaxed pt-4 border-t border-white/40">
                            Metrics will populate here once real telemetry is ingested.
                        </p>
                    </div>
                </div>
            </div>

            {/* Comparison Logic Summary */}
            <div className={cn(glass.card, "p-8 bg-[#1A1A1A] text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group")}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4D03F]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#F4D03F]/15 transition-colors" />
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-xl group-hover:rotate-12 transition-transform duration-500">
                        <Activity className="w-8 h-8 text-[#F4D03F]" />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                        <h4 className="text-2xl font-black tracking-tighter uppercase">No issues <span className="text-[#F4D03F]">found</span></h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed max-w-4xl">
                            {error ? error : "Check the calendar to spot peaks and drops, and compare weeks or months."}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MetricCalendarView;
