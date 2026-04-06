import React from 'react';
import {
    AlertTriangle,
    BarChart3,
    CalendarClock,
    ChevronRight,
    History,
    Microscope,
    RefreshCw,
    ShieldCheck,
    ShieldPlus,
    Syringe,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { glass, PageHeader } from './GlassTheme';

type RiskStatus = 'safe' | 'warning' | 'critical';
type HiveTrend = 'up' | 'down' | 'stable';

interface VarroaHiveCard {
    id: string;
    infestation: number;
    status: RiskStatus;
    trend: HiveTrend;
    trendDelta: number;
    method: string;
    date: string;
    sampleSize: number;
    miteCount: number;
    notes: string;
}

interface TreatmentCard {
    id: string;
    title: string;
    note: string;
    status: string;
    date: string;
}

const humanize = (value?: string | null) =>
    String(value || '')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()) || 'Not specified';

const formatDate = (value?: string | null, full = false) => {
    if (!value) return full ? 'Unscheduled' : 'No date';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString(undefined, full
        ? { month: 'short', day: 'numeric', year: 'numeric' }
        : { month: 'short', day: 'numeric' });
};

const getStatus = (infestation: number): RiskStatus => infestation >= 5 ? 'critical' : infestation >= 3 ? 'warning' : 'safe';
const getTrend = (delta: number): HiveTrend => delta > 0.2 ? 'up' : delta < -0.2 ? 'down' : 'stable';

const statusStyles: Record<RiskStatus, string> = {
    safe: 'bg-[#1B9157]/10 text-[#1B9157]',
    warning: 'bg-[#F4D03F]/18 text-[#B98A00]',
    critical: 'bg-red-500/10 text-red-500',
};

const VarroaView: React.FC = () => {
    const [hives, setHives] = React.useState<VarroaHiveCard[]>([]);
    const [treatments, setTreatments] = React.useState<TreatmentCard[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchData = async (mode: 'initial' | 'refresh' = 'initial') => {
        if (mode === 'initial') setLoading(true);
        if (mode === 'refresh') setRefreshing(true);

        try {
            const [readings, treatmentData] = await Promise.all([
                beeyieldService.getVarroaReadings(),
                beeyieldService.getVarroaTreatments(),
            ]);

            const sorted = [...(readings || [])].sort((a: any, b: any) =>
                new Date(b?.reading_date || b?.created_at || 0).getTime() -
                new Date(a?.reading_date || a?.created_at || 0).getTime()
            );

            const byHive = new Map<string, any[]>();
            sorted.forEach((reading: any) => {
                const hiveId = String(reading?.hive_id || reading?.id || 'Unknown');
                byHive.set(hiveId, [...(byHive.get(hiveId) || []), reading]);
            });

            const mappedHives = Array.from(byHive.entries()).map(([rawId, rows]) => {
                const latest = rows[0] || {};
                const previous = rows[1] || {};
                const infestation = Number(latest?.infestation_rate ?? latest?.infestation ?? latest?.rate ?? 0);
                const previousInfestation = Number(previous?.infestation_rate ?? previous?.infestation ?? previous?.rate ?? infestation);
                const trendDelta = Number((infestation - previousInfestation).toFixed(1));

                return {
                    id: rawId.slice(0, 8).toUpperCase(),
                    infestation,
                    status: getStatus(infestation),
                    trend: getTrend(trendDelta),
                    trendDelta,
                    method: humanize(latest?.method || latest?.detection_method || 'Alcohol wash'),
                    date: latest?.reading_date || latest?.created_at || '',
                    sampleSize: Number(latest?.sample_size ?? latest?.sample ?? 300),
                    miteCount: Number(latest?.mite_count ?? latest?.count ?? 0),
                    notes: latest?.notes || latest?.observation || '',
                } satisfies VarroaHiveCard;
            }).sort((a, b) => b.infestation - a.infestation);

            const mappedTreatments = (treatmentData || [])
                .sort((a: any, b: any) =>
                    new Date(b?.inspection_date || b?.created_at || 0).getTime() -
                    new Date(a?.inspection_date || a?.created_at || 0).getTime()
                )
                .slice(0, 4)
                .map((t: any, index: number) => ({
                    id: String(t?.id || index),
                    title: humanize(t?.treatment_type || t?.actions_taken || t?.health_status || 'Treatment recorded'),
                    note: t?.notes || t?.apiary_name || 'Field note pending',
                    status: humanize(t?.health_status || 'treated'),
                    date: t?.inspection_date || t?.start_date || t?.created_at || '',
                }));

            setHives(mappedHives);
            setTreatments(mappedTreatments);
        } catch (err) {
            console.error('Error loading varroa data:', err);
            setHives([]);
            setTreatments([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        void fetchData();
    }, []);

    const stats = React.useMemo(() => {
        const safe = hives.filter((hive) => hive.status === 'safe').length;
        const warning = hives.filter((hive) => hive.status === 'warning').length;
        const critical = hives.filter((hive) => hive.status === 'critical').length;
        const avg = hives.length ? Number((hives.reduce((sum, hive) => sum + hive.infestation, 0) / hives.length).toFixed(1)) : 0;
        const sampledThisWeek = hives.filter((hive) => {
            const time = new Date(hive.date).getTime();
            return !Number.isNaN(time) && (Date.now() - time) / 86400000 <= 7;
        }).length;
        return { total: hives.length, safe, warning, critical, avg, sampledThisWeek };
    }, [hives]);

    const priorityHive = hives[0];
    const risingHives = hives.filter((hive) => hive.trend === 'up').length;
    const trendSeries = hives.slice(0, 6);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin text-[#F4D03F]" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(glass.page, 'p-4 lg:p-6 space-y-6 pb-20')}>
            <PageHeader
                icon={Microscope}
                label="Hive health"
                title="Varroa Command Center"
                subtitle="Track infestation pressure, isolate the most vulnerable colonies, and keep treatment timing visible at a glance."
                actions={(
                    <button type="button" onClick={() => void fetchData('refresh')} className={cn(glass.btnPrimary, 'h-10 px-5 rounded-xl font-black text-[10px]')}>
                        <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
                        <span>{refreshing ? 'Refreshing' : 'Refresh board'}</span>
                    </button>
                )}
            />

            <section className="grid grid-cols-1 xl:grid-cols-[1.45fr_0.95fr] gap-4">
                <div className={cn(glass.card, 'p-5 md:p-6 border-[#F4D03F]/35 shadow-[0_24px_80px_-48px_rgba(212,172,13,0.65)]')}>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-red-500/15 bg-red-500/[0.08] px-3 py-1 text-[10px] font-black tracking-[0.18em] text-red-500 uppercase">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Priority Hive Signal
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl md:text-[2.4rem] font-black tracking-[-0.06em] text-[#1A1A1A]">
                                        {priorityHive ? `${priorityHive.infestation}% pressure in hive ${priorityHive.id}` : 'No varroa readings available'}
                                    </h2>
                                    <p className="max-w-2xl text-sm md:text-[15px] leading-7 text-[#1A1A1A]/65">
                                        {priorityHive
                                            ? `Latest ${priorityHive.method.toLowerCase()} sample was logged ${formatDate(priorityHive.date, true)}. The page now uses a stronger hero, grouped risk counts, and dedicated reading and treatment sections to match the shared design more closely.`
                                            : 'Once readings start coming in, this board will show the highest-risk colony, the latest sampling window, and the treatment queue.'}
                                    </p>
                                </div>
                            </div>

                            <div className="min-w-[220px] rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_-40px_rgba(26,26,26,0.55)]">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]/45">Response window</span>
                                    <span className="rounded-full bg-[#F9F7F2] px-2.5 py-1 text-[10px] font-black text-[#1A1A1A]/60">{stats.critical > 0 ? '48h' : 'Routine'}</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black tracking-[-0.08em] text-[#1A1A1A]">{stats.avg}%</span>
                                        <span className="pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A1A1A]/45">avg infestation</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-[#F9F2D7] overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-[#1B9157] via-[#F4D03F] to-red-500" style={{ width: `${Math.min(100, Math.max(8, stats.avg * 12))}%` }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div className="rounded-2xl border border-[#F4D03F]/20 bg-[#F9F7F2] p-3">
                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1A1A1A]/40">Sampled this week</p>
                                            <p className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#1A1A1A]">{stats.sampledThisWeek}</p>
                                        </div>
                                        <div className="rounded-2xl border border-[#F4D03F]/20 bg-[#F9F7F2] p-3">
                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1A1A1A]/40">Rising signals</p>
                                            <p className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#1A1A1A]">{risingHives}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { label: 'Low risk colonies', value: stats.safe, icon: ShieldCheck, tone: 'border-[#1B9157]/15 bg-[#1B9157]/10 text-[#1B9157]' },
                                { label: 'Monitor closely', value: stats.warning, icon: BarChart3, tone: 'border-[#F4D03F]/20 bg-[#F4D03F]/12 text-[#B98A00]' },
                                { label: 'Treatment queue', value: treatments.length, icon: Syringe, tone: 'border-red-500/15 bg-red-500/10 text-red-500' },
                            ].map((item) => (
                                <div key={item.label} className="rounded-[26px] border border-[#F4D03F]/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(249,247,242,0.72))] p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl border', item.tone)}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1A1A1A]/40">{item.label}</p>
                                            <p className="text-2xl font-black tracking-[-0.05em] text-[#1A1A1A]">{item.value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
                    {(['critical', 'warning', 'safe'] as RiskStatus[]).map((status) => {
                        const count = hives.filter((hive) => hive.status === status).length;
                        const percent = hives.length ? Math.round((count / hives.length) * 100) : 0;
                        return (
                            <div key={status} className={cn(glass.card, 'p-4 md:p-5', status === 'critical' ? 'border-red-500/25 bg-red-500/[0.07]' : status === 'warning' ? 'border-[#F4D03F]/30 bg-[#F4D03F]/[0.12]' : 'border-[#1B9157]/20 bg-[#1B9157]/[0.06]')}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A1A]/45">{humanize(status)} band</p>
                                        <p className="mt-1 text-3xl font-black tracking-[-0.08em] text-[#1A1A1A]">{count}</p>
                                    </div>
                                    <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#1A1A1A]/55">{percent}%</span>
                                </div>
                                <div className="mt-4 h-2 rounded-full bg-white/70 overflow-hidden">
                                    <div className={cn('h-full rounded-full', status === 'critical' ? 'bg-red-500' : status === 'warning' ? 'bg-[#F4D03F]' : 'bg-[#1B9157]')} style={{ width: `${Math.max(percent, count > 0 ? 12 : 0)}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
                <div className={cn(glass.card, 'p-5 md:p-6')}>
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A1A]/40">Hive watchlist</p>
                            <h3 className="mt-1 text-2xl font-black tracking-[-0.06em] text-[#1A1A1A]">Field readings by colony</h3>
                        </div>
                        <div className="rounded-full border border-[#F4D03F]/20 bg-[#F9F7F2] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#1A1A1A]/50">Latest samples first</div>
                    </div>
                    <div className="space-y-3">
                        {hives.length > 0 ? hives.map((hive) => (
                            <div key={hive.id} className="rounded-[28px] border border-[#F4D03F]/18 bg-white/75 p-4 md:p-5 shadow-[0_22px_60px_-48px_rgba(26,26,26,0.4)]">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span className="rounded-full border border-[#F4D03F]/15 bg-[#F9F7F2] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A1A]/45">Hive {hive.id}</span>
                                            <span className={cn('rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]', statusStyles[hive.status])}>{hive.status}</span>
                                            <span className="text-[11px] font-bold text-[#1A1A1A]/45">{formatDate(hive.date, true)}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-3 md:gap-6 items-end">
                                            <div>
                                                <p className="text-[42px] leading-none font-black tracking-[-0.08em] text-[#1A1A1A]">{hive.infestation}%</p>
                                                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]/40">Infestation rate</p>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                <div className="rounded-2xl border border-[#F4D03F]/15 bg-[#F9F7F2] px-3 py-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#1A1A1A]/38">Method</p>
                                                    <p className="mt-1 text-sm font-black text-[#1A1A1A]">{hive.method}</p>
                                                </div>
                                                <div className="rounded-2xl border border-[#F4D03F]/15 bg-[#F9F7F2] px-3 py-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#1A1A1A]/38">Mites</p>
                                                    <p className="mt-1 text-sm font-black text-[#1A1A1A]">{hive.miteCount}</p>
                                                </div>
                                                <div className="rounded-2xl border border-[#F4D03F]/15 bg-[#F9F7F2] px-3 py-3 col-span-2 md:col-span-1">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#1A1A1A]/38">Sample size</p>
                                                    <p className="mt-1 text-sm font-black text-[#1A1A1A]">{hive.sampleSize} bees</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 lg:min-w-[240px]">
                                        <div className="rounded-2xl border border-[#F4D03F]/15 bg-[#F9F7F2] p-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', hive.trend === 'up' ? 'border-red-500/15 bg-red-500/10' : hive.trend === 'down' ? 'border-[#1B9157]/15 bg-[#1B9157]/10' : 'border-[#F4D03F]/15 bg-[#FFF6D9]')}>
                                                    {hive.trend === 'up' ? <TrendingUp className="w-4 h-4 text-red-500" /> : hive.trend === 'down' ? <TrendingDown className="w-4 h-4 text-[#1B9157]" /> : <History className="w-4 h-4 text-[#B98A00]" />}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1A1A1A]/40">Trend</p>
                                                    <p className="text-sm font-black text-[#1A1A1A]">{hive.trend === 'up' ? `Up ${Math.abs(hive.trendDelta)} pts` : hive.trend === 'down' ? `Down ${Math.abs(hive.trendDelta)} pts` : 'Stable'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border border-[#F4D03F]/15 bg-white px-3.5 py-3">
                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1A1A1A]/40">Field note</p>
                                            <p className="mt-1 text-sm leading-6 text-[#1A1A1A]/68">{hive.notes || 'No technician note attached to this reading yet.'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className={cn(glass.emptyState, 'min-h-[240px]')}>
                                <Microscope className="w-8 h-8 text-[#F4D03F]" />
                                <div className="space-y-1">
                                    <p className="text-lg font-black text-[#1A1A1A]">No readings yet</p>
                                    <p className="text-sm text-[#1A1A1A]/55">Add a mite count and this board will populate automatically.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className={cn(glass.card, 'p-5 md:p-6')}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F4D03F]/15 bg-[#FFF3C7]">
                                <BarChart3 className="w-5 h-5 text-[#B98A00]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A1A]/40">Trend strip</p>
                                <h3 className="text-xl font-black tracking-[-0.05em] text-[#1A1A1A]">Pressure snapshot</h3>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {trendSeries.length > 0 ? trendSeries.map((hive) => (
                                <div key={hive.id} className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="font-black text-[#1A1A1A]">Hive {hive.id}</span>
                                        <span className="font-black text-[#1A1A1A]/55">{hive.infestation}%</span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-[#F9F2D7] overflow-hidden">
                                        <div className={cn('h-full rounded-full', hive.status === 'safe' ? 'bg-[#1B9157]' : hive.status === 'warning' ? 'bg-[#F4D03F]' : 'bg-red-500')} style={{ width: `${Math.max(8, Math.min(100, hive.infestation * 12))}%` }} />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-[#1A1A1A]/55">Trend bars will appear once readings are available.</p>
                            )}
                        </div>
                    </div>

                    <div className={cn(glass.card, 'p-5 md:p-6')}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1B9157]/15 bg-[#1B9157]/10">
                                <CalendarClock className="w-5 h-5 text-[#1B9157]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A1A]/40">Treatment activity</p>
                                <h3 className="text-xl font-black tracking-[-0.05em] text-[#1A1A1A]">Recent interventions</h3>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {treatments.length > 0 ? treatments.map((treatment) => (
                                <div key={treatment.id} className="rounded-[24px] border border-[#F4D03F]/15 bg-white/80 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1.5">
                                            <p className="text-sm font-black text-[#1A1A1A]">{treatment.title}</p>
                                            <p className="text-sm leading-6 text-[#1A1A1A]/62">{treatment.note}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#1A1A1A]/28 shrink-0 mt-0.5" />
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2.5">
                                        <span className="rounded-full bg-[#F9F7F2] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#1A1A1A]/48">{treatment.status}</span>
                                        <span className="text-[11px] font-bold text-[#1A1A1A]/45">{formatDate(treatment.date, true)}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="rounded-[24px] border border-dashed border-[#F4D03F]/30 bg-[#F9F7F2]/80 p-4 text-sm leading-6 text-[#1A1A1A]/58">
                                    No treatment events are recorded yet. As entries appear, this panel will mirror the intervention queue more clearly.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={cn(glass.card, 'p-5 md:p-6 lg:col-span-2')}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/15 bg-red-500/10">
                            <ShieldPlus className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A1A]/40">Page changes</p>
                            <h3 className="text-xl font-black tracking-[-0.05em] text-[#1A1A1A]">What changed on this screen</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            'The top of the page is now a proper hero section with one dominant message instead of several equal-weight cards.',
                            'Risk distribution has been pulled into a tight side stack so critical, warning, and safe counts are visible immediately.',
                            'The lower half now separates readings, pressure bars, and treatment history into clearer blocks that read closer to a polished reference layout.',
                        ].map((item) => (
                            <div key={item} className="rounded-[24px] border border-[#F4D03F]/15 bg-white/80 p-4 text-sm leading-6 text-[#1A1A1A]/68">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={cn(glass.card, 'p-5 md:p-6')}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F4D03F]/15 bg-[#FFF3C7]">
                            <History className="w-5 h-5 text-[#B98A00]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1A1A1A]/40">Sampling cadence</p>
                            <h3 className="text-xl font-black tracking-[-0.05em] text-[#1A1A1A]">Next focus</h3>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[
                            `Critical hives: ${stats.critical > 0 ? 'retest within 48 hours' : 'none flagged right now'}`,
                            `Warning band: ${stats.warning > 0 ? 'schedule a follow-up wash this week' : 'stable across the current board'}`,
                            `Coverage: ${stats.sampledThisWeek}/${stats.total || 0} hives sampled in the last 7 days`,
                        ].map((item) => (
                            <div key={item} className="rounded-2xl border border-[#F4D03F]/15 bg-[#F9F7F2] px-3.5 py-3 text-sm font-medium leading-6 text-[#1A1A1A]/68">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </motion.div>
    );
};

export default VarroaView;
