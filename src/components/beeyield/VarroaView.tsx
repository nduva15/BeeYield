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
    LineChart as LineChartIcon,
    Play,
    Thermometer,
    Zap,
    ThumbsUp,
    ThumbsDown,
    Search,
    Settings,
    Sparkles,
    Wand2,
    FlaskConical,
    Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { glass, PageHeader } from './GlassTheme';
import { BeeYieldPageShell } from './BeeYieldUI';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import {
    runTrajectory,
    calculateTreatmentWindows,
    VarroaModelInputs,
    VarroaModelPoint,
    VarroaTreatmentWindow
} from '@/lib/varroaModel';

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

interface VarroaViewProps {
    embedded?: boolean;
}

const VarroaView: React.FC<VarroaViewProps> = ({ embedded = false }) => {
    const [hives, setHives] = React.useState<VarroaHiveCard[]>([]);
    const [treatments, setTreatments] = React.useState<TreatmentCard[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    // Simulation state
    const [simInputs, setSimInputs] = React.useState<VarroaModelInputs>({
        startDate: new Date().toISOString(),
        startMode: 'default',
        measurementType: 'Alcohol wash',
        region: 'Standard',
        initialMiteCount: 50,
        adultBeePopulation: 30000,
        simulationDays: 180,
        collapseThreshold: 3500,
        colonyStrength: 'Medium',
        broodMode: 'Seasonal (auto)',
        reinvasionPressure: 'Medium',
        hygieneProfile: 'Standard',
        treatmentType: 'None',
        treatmentDay: 90,
        temperature: 20,
        mitesPerDay: 5,
        colonyMultiplier: 120,
        hasBrood: true
    });

    const [simulationResult, setSimulationResult] = React.useState<any>(null);
    const [treatmentWindows, setTreatmentWindows] = React.useState<VarroaTreatmentWindow[]>([]);

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

            // Run initial simulation
            runSimulation(simInputs);
        } catch (err) {
            console.error('Error loading varroa data:', err);
            setHives([]);
            setTreatments([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const runSimulation = (inputs: VarroaModelInputs) => {
        const adj = {
            reproductionMultiplier: 1,
            reinvasionMultiplier: 1,
            treatmentMultiplier: 1,
            naturalDropMultiplier: 1,
            adultLossMultiplier: 1,
            adultRecoveryMultiplier: 1,
            broodMultiplier: 1,
            seasonalityShiftDays: 0,
            temperatureBias: 0,
        };
        const result = runTrajectory(inputs, adj);
        setSimulationResult(result);

        const windows = calculateTreatmentWindows(result.timeline, {
             key: inputs.treatmentType.toLowerCase(),
             label: inputs.treatmentType,
             durationDays: 14,
             phoreticKill: 0.06,
             broodKill: 0.01,
             optimalMinC: 10,
             optimalMaxC: 28,
             broodSensitive: false
        });
        setTreatmentWindows(windows);
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

    // Derived simulation data for chart
    const chartData = React.useMemo(() => {
        if (!simulationResult) return [];
        return simulationResult.timeline.map((point: VarroaModelPoint) => ({
             day: point.day,
             mites: point.totalMites,
             risk: point.scenarioRisk,
             brood: point.allBrood,
             infestation: point.infectionPer100,
             alcoholWash: point.alcoholWash
        }));
    }, [simulationResult]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin text-[#F4D03F]" />
            </div>
        );
    }

    const content = (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(glass.page, 'space-y-6 pb-20')}>
            <PageHeader
                icon={Microscope}
                label="Hive health"
                title="Varroa Command Center"
                subtitle="Track infestation pressure, isolate the most vulnerable colonies, and run predictive scenarios."
                actions={(
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => void fetchData('refresh')} className={cn(glass.btnSecondary, 'h-10 px-4 rounded-xl')}>
                            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
                            <span>{refreshing ? 'Refreshing' : 'Sync board'}</span>
                        </button>
                        <button type="button" onClick={() => runSimulation(simInputs)} className={cn(glass.btnPrimary, 'h-10 px-5 rounded-xl')}>
                            <Play className="w-4 h-4" />
                            <span>Run simulation</span>
                        </button>
                    </div>
                )}
            />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
                <div className="space-y-4">
                    {/* Hero Stats */}
                    <section className={cn(glass.card, 'p-6')}>
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-red-500/15 bg-red-500/[0.08] px-3 py-1 text-[10px] font-black tracking-[0.18em] text-red-500 uppercase">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Active Pressure Analysis
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                                        {priorityHive ? `${priorityHive.infestation}% peak pressure detected` : 'No varroa readings available'}
                                    </h2>
                                    <p className="max-w-2xl text-base text-foreground/70">
                                        {priorityHive
                                            ? `Latest ${priorityHive.method.toLowerCase()} sample shows hive ${priorityHive.id} at the threshold. Our predictive engine suggests intervention if infection rises above 3%.`
                                            : 'Initialize your apiary monitors or conduct an alcohol wash to start receiving intelligence.'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { label: 'Low risk', value: stats.safe, color: 'text-[#1B9157]' },
                                        { label: 'Warning', value: stats.warning, color: 'text-[#B98A00]' },
                                        { label: 'Critical', value: stats.critical, color: 'text-red-500' },
                                    ].map(b => (
                                        <div key={b.label} className="rounded-2xl border border-border/40 bg-muted/30 px-4 py-2 flex items-center gap-3">
                                            <div className={cn("w-2 h-2 rounded-full", b.color.replace('text', 'bg'))} />
                                            <span className="text-sm font-bold">{b.value} {b.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:w-[280px] rounded-3xl border border-border/ bg-muted/40 p-5 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-4">Response Score</p>
                                <div className="space-y-4">
                                    <div className="flex items-end gap-2">
                                        <span className="text-5xl font-black tracking-tighter">{stats.avg}%</span>
                                        <span className="pb-1.5 text-[10px] font-bold uppercase text-foreground/40 tracking-widest leading-none">Apiary impact</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500" style={{ width: `${Math.min(100, stats.avg * 10)}%` }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-2xl bg-white/50 p-3">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Recent</p>
                                            <p className="text-lg font-black">{stats.sampledThisWeek}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/50 p-3">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Spikes</p>
                                            <p className="text-lg font-black">{risingHives}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Chart Section */}
                    <section className={cn(glass.card, 'p-6')}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black tracking-tight">Predictive Trajectory</h3>
                                <p className="text-sm text-foreground/60">Simulated mite growth over {simInputs.simulationDays} days</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Mites</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Brood</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Risk %</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis
                                        dataKey="day"
                                        stroke="rgba(0,0,0,0.4)"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `D${val}`}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="rgba(0,0,0,0.4)"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="rgba(0,0,0,0.4)"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                            borderRadius: '20px',
                                            border: 'none',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                            padding: '12px 16px'
                                        }}
                                        labelStyle={{ fontWeight: 'black', marginBottom: '4px' }}
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="mites"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff' }}
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="brood"
                                        stroke="#fb923c"
                                        strokeWidth={2}
                                        strokeDasharray="4 4"
                                        dot={false}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="risk"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Simulation Parameters */}
                    <section className={cn(glass.card, 'p-6')}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                <Settings className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Simulator Inputs</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Colony strength</p>
                                <select
                                    value={simInputs.colonyStrength}
                                    onChange={(e) => setSimInputs({ ...simInputs, colonyStrength: e.target.value as any })}
                                    className="w-full h-11 rounded-2xl border border-border/40 bg-muted/30 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                >
                                    <option>Weak</option>
                                    <option>Medium</option>
                                    <option>Strong</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Initial mites</p>
                                <input
                                    type="number"
                                    value={simInputs.initialMiteCount}
                                    onChange={(e) => setSimInputs({ ...simInputs, initialMiteCount: Number(e.target.value) })}
                                    className="w-full h-11 rounded-2xl border border-border/40 bg-muted/30 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Treatment type</p>
                                <select
                                    value={simInputs.treatmentType}
                                    onChange={(e) => setSimInputs({ ...simInputs, treatmentType: e.target.value })}
                                    className="w-full h-11 rounded-2xl border border-border/40 bg-muted/30 px-4 text-sm font-bold appearance-none"
                                >
                                    <option>None</option>
                                    <option>Amitraz</option>
                                    <option>Formic acid</option>
                                    <option>Oxalic acid</option>
                                    <option>Thymol</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Day of treatment</p>
                                <input
                                    type="number"
                                    value={simInputs.treatmentDay}
                                    onChange={(e) => setSimInputs({ ...simInputs, treatmentDay: Number(e.target.value) })}
                                    className="w-full h-11 rounded-2xl border border-border/40 bg-muted/30 px-4 text-sm font-bold"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-4">
                    {/* Treatment Advisor */}
                    <section className={cn(glass.card, 'p-5')}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight">Smart Advisor</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-3xl bg-muted/40 border border-border/40">
                                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mb-2">Formic Suitability</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold">{simInputs.temperature}°C ambient</span>
                                    {simInputs.temperature >= 10 && simInputs.temperature <= 29 ? (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <ThumbsUp className="w-4 h-4" />
                                            <span className="text-xs font-black uppercase">Optimal</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-500">
                                            <ThumbsDown className="w-4 h-4" />
                                            <span className="text-xs font-black uppercase">Unsafe</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 rounded-3xl bg-muted/40 border border-border/40">
                                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mb-2">Optimal Windows</p>
                                <div className="space-y-2">
                                    {treatmentWindows.slice(0, 2).map((win, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-foreground/60">Day {win.day}</span>
                                            <span className="font-black text-primary">{win.score}% Score</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Watchlist */}
                    <section className={cn(glass.card, 'p-5')}>
                         <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-black tracking-tight">Top Hives</h3>
                            <div className="px-2 py-1 rounded-lg bg-muted text-[9px] font-black uppercase tracking-widest text-foreground/40">By Mite Count</div>
                        </div>
                        <div className="space-y-3">
                            {hives.slice(0, 5).map(hive => (
                                <div key={hive.id} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-1.5 h-8 rounded-full", hive.status === 'critical' ? 'bg-red-500' : hive.status === 'warning' ? 'bg-yellow-400' : 'bg-green-500')} />
                                        <div>
                                            <p className="text-xs font-black">Hive {hive.id}</p>
                                            <p className="text-[10px] text-foreground/50 font-medium">{hive.method}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black">{hive.infestation}%</p>
                                        <div className="flex items-center gap-1 justify-end">
                                            {hive.trend === 'up' ? <TrendingUp className="w-2.5 h-2.5 text-red-500" /> : <TrendingDown className="w-2.5 h-2.5 text-green-500" />}
                                            <span className={cn("text-[8px] font-bold", hive.trend === 'up' ? 'text-red-500' : 'text-green-500')}>{Math.abs(hive.trendDelta)}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Intervention History */}
                    <section className={cn(glass.card, 'p-5')}>
                        <h3 className="text-lg font-black tracking-tight mb-5">Recent Actions</h3>
                        <div className="space-y-3">
                            {treatments.map(t => (
                                <div key={t.id} className="p-3 rounded-2xl bg-muted/30 border border-border/30">
                                    <p className="text-xs font-black mb-1">{t.title}</p>
                                    <div className="flex items-center justify-between text-[10px] text-foreground/50">
                                        <span>{formatDate(t.date)}</span>
                                        <span className="font-bold text-primary uppercase">{t.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>

            {/* Readings Table Section */}
            <section className={cn(glass.card, 'p-6')}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black tracking-tight">Detailed Reading History</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                            <input
                                type="text"
                                placeholder="Search hives..."
                                className="h-10 pl-9 pr-4 rounded-xl border border-border/40 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/10">
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Hive ID</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Date</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Method</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Infestation</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Status</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/5">
                            {hives.map(hive => (
                                <tr key={hive.id} className="group hover:bg-muted/10 transition-colors">
                                    <td className="py-4 px-2 font-black text-sm">{hive.id}</td>
                                    <td className="py-4 px-2 text-xs text-foreground/60">{formatDate(hive.date, true)}</td>
                                    <td className="py-4 px-2 text-xs font-bold text-foreground/70">{hive.method}</td>
                                    <td className="py-4 px-2 font-black text-sm">{hive.infestation}%</td>
                                    <td className="py-4 px-2">
                                        <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase", statusStyles[hive.status])}>
                                            {hive.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="flex items-center gap-1.5">
                                            {hive.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-red-500" /> : hive.trend === 'down' ? <TrendingDown className="w-3.5 h-3.5 text-green-500" /> : <History className="w-3.5 h-3.5 text-foreground/20" />}
                                            <span className={cn("text-[10px] font-bold", hive.trend === 'up' ? 'text-red-500' : 'text-green-500')}>{hive.trendDelta === 0 ? '' : hive.trendDelta}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </motion.div>
    );

    return (
        <BeeYieldPageShell embedded={embedded}>
            {content}
        </BeeYieldPageShell>
    );
};

export default VarroaView;
