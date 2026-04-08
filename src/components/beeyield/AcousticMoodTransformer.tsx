import React from 'react';
import {
    Activity,
    AlertCircle,
    ArrowRight,
    BrainCircuit,
    Heart,
    Info,
    Loader2,
    ShieldAlert,
    Thermometer,
    Volume2,
    Waves,
    Zap,
} from 'lucide-react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from './BeeYieldUI';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import { predictSwarmState, type SwarmPredictionResult, type SwarmTelemetryPoint } from '@/lib/swarmPrediction';

const STATUS_MAP = {
    healthy: {
        label: 'Stable Homeostasis',
        color: '#1B9157',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        icon: Heart,
    },
    'missing-queen': {
        label: 'Queenlessness Watch',
        color: '#F4D03F',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: AlertCircle,
    },
    'swarm-risk': {
        label: 'Pre-Swarm Alert',
        color: '#ef4444',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: Zap,
    },
} as const;

const EMPTY_ANALYSIS: SwarmPredictionResult = {
    status: 'healthy',
    stateLabel: 'Gathering Baseline Data',
    probability: 0,
    confidence: 0,
    alert: false,
    etaHours: null,
    summary: 'No acoustic telemetry yet.',
    recommendation: 'Connect a hive sensor or wait for telemetry sync.',
    features: {
        baselineFreqHz: 0,
        recentFreqHz: 0,
        freqShiftHz: 0,
        highFreqHours: 0,
        pipingHours: 0,
        maxTempC: 0,
        thermalSpikeHours: 0,
        humidityDrop: 0,
        acousticVolatility: 0,
        queenlessnessRisk: 0,
        swarmRisk: 0,
    },
    pollinationImpact: {
        currentForagers: 0,
        atRiskForagers: 0,
        workforceLossPercent: 60,
    },
    drivers: [],
};

function getTimestamp(row: any) {
    return row?.timestamp || row?.recorded_at || row?.created_at || row?.reading_time || row?.measured_at || new Date().toISOString();
}

function toTelemetryPoint(row: any): SwarmTelemetryPoint {
    return {
        timestamp: getTimestamp(row),
        peakFreqHz: typeof row?.peak_freq_hz === 'number'
            ? row.peak_freq_hz
            : typeof row?.frequency_hz === 'number'
                ? row.frequency_hz
                : null,
        tempC: typeof row?.temp_c === 'number'
            ? row.temp_c
            : typeof row?.temperature_c === 'number'
                ? row.temperature_c
                : typeof row?.brood_temperature_c === 'number'
                    ? row.brood_temperature_c
                    : null,
        humidity: typeof row?.humidity === 'number'
            ? row.humidity
            : typeof row?.humidity_pct === 'number'
                ? row.humidity_pct
                : typeof row?.relative_humidity === 'number'
                    ? row.relative_humidity
                    : null,
        amplitudeDb: typeof row?.amplitude_db === 'number' ? row.amplitude_db : null,
        healthIndex: typeof row?.health_index === 'number' ? row.health_index : null,
    };
}

const AcousticMoodTransformer: React.FC<{ onTabChange?: (tab: string) => void }> = ({ onTabChange }) => {
    const { data: apiaries = [] } = useApiaries();
    const [selectedApiaryId, setSelectedApiaryId] = React.useState('all_apiaries');
    const { data: allHives = [] } = useHives(selectedApiaryId === 'all_apiaries' ? undefined : selectedApiaryId);
    const [selectedHiveId, setSelectedHiveId] = React.useState('');
    const [telemetry, setTelemetry] = React.useState<SwarmTelemetryPoint[]>([]);
    const [analysis, setAnalysis] = React.useState<SwarmPredictionResult>(EMPTY_ANALYSIS);
    const [loading, setLoading] = React.useState(true);
    const [isOffline, setIsOffline] = React.useState(false);

    const LS_KEY = 'beeyield_swarm_predictor_cache_v1';
    const selectedHive = React.useMemo(() => allHives.find((hive) => hive.id === selectedHiveId) || null, [allHives, selectedHiveId]);

    React.useEffect(() => {
        if (!allHives.length) {
            setSelectedHiveId('');
            return;
        }
        if (!allHives.some((hive) => hive.id === selectedHiveId)) {
            setSelectedHiveId(allHives[0].id);
        }
    }, [allHives, selectedHiveId]);

    const readCache = React.useCallback((hiveId: string) => {
        try {
            const raw = localStorage.getItem(`${LS_KEY}:${hiveId}`);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, []);

    const writeCache = React.useCallback((hiveId: string, data: { telemetry: SwarmTelemetryPoint[]; analysis: SwarmPredictionResult }) => {
        try {
            localStorage.setItem(`${LS_KEY}:${hiveId}`, JSON.stringify(data));
        } catch {
            // ignore cache failures
        }
    }, []);

    React.useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (!selectedHiveId) {
                setTelemetry([]);
                setAnalysis(EMPTY_ANALYSIS);
                setLoading(false);
                return;
            }

            setLoading(true);
            setIsOffline(false);

            try {
                const rows = await beeyieldService.getAcousticReadings(selectedHiveId, 7);
                if (!mounted) return;

                const mapped = (rows || [])
                    .map(toTelemetryPoint)
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                const nextAnalysis = predictSwarmState(mapped, { frameCount: selectedHive?.frame_count });
                setTelemetry(mapped);
                setAnalysis(nextAnalysis);
                writeCache(selectedHiveId, { telemetry: mapped, analysis: nextAnalysis });
            } catch (error: any) {
                const cached = readCache(selectedHiveId);
                if (cached && mounted) {
                    setTelemetry(cached.telemetry || []);
                    setAnalysis(cached.analysis || EMPTY_ANALYSIS);
                    setIsOffline(true);
                    toast.info('Offline: showing cached swarm telemetry');
                } else if (mounted) {
                    setTelemetry([]);
                    setAnalysis(EMPTY_ANALYSIS);
                    toast.error(error?.message || 'Failed to load acoustic telemetry');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        const interval = setInterval(load, 60_000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [readCache, selectedHive?.frame_count, selectedHiveId, writeCache]);

    const chartData = React.useMemo(
        () =>
            telemetry.slice(-48).map((point, index) => ({
                hour: index + 1,
                label: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                freqHz: point.peakFreqHz,
                tempC: point.tempC,
                humidity: point.humidity,
            })),
        [telemetry],
    );

    const statusMeta = STATUS_MAP[analysis.status];
    const StatusIcon = statusMeta.icon;

    return (
        <BeeYieldPageShell className="p-4 lg:p-6 space-y-6 pb-20">
            <BeeYieldPageHeader
                icon={BrainCircuit}
                label="Swarm Prediction"
                title={<>In-Hive <span className="text-[#1B9157]">Telemetry</span></>}
                subtitle="Acoustic and thermal anomaly detection for pre-swarm intervention and pollination-force protection."
                actions={
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
                        {loading ? <Loader2 className="h-3 w-3 animate-spin text-[#F4D03F]" /> : <Activity className="h-3 w-3 text-[#1B9157]" />}
                        <span className="text-xs font-bold text-gray-500">
                            Confidence <span className="text-[#1A1A1A]">{analysis.confidence.toFixed(0)}%</span>
                        </span>
                    </div>
                }
            />

            <section className={cn(glass.filterBar, 'flex flex-col gap-3 bg-white md:flex-row md:items-end')}>
                <label className="min-w-[220px] flex-1">
                    <div className={glass.microLabel}>Apiary</div>
                    <select value={selectedApiaryId} onChange={(e) => setSelectedApiaryId(e.target.value)} className={glass.select}>
                        <option value="all_apiaries">All apiaries</option>
                        {apiaries.map((apiary) => (
                            <option key={apiary.id} value={apiary.id}>{apiary.name}</option>
                        ))}
                    </select>
                </label>
                <label className="min-w-[240px] flex-1">
                    <div className={glass.microLabel}>Hive</div>
                    <select value={selectedHiveId} onChange={(e) => setSelectedHiveId(e.target.value)} className={glass.select}>
                        {!allHives.length ? <option value="">No hives available</option> : null}
                        {allHives.map((hive) => (
                            <option key={hive.id} value={hive.id}>{hive.hive_code}</option>
                        ))}
                    </select>
                </label>
                <div className="rounded-xl border border-[#F4D03F]/20 bg-[#FFF9F0] px-4 py-3 text-sm text-gray-600">
                    <div className="font-semibold text-[#1A1A1A]">{selectedHive?.hive_code || 'No hive selected'}</div>
                    <div className="text-xs">Frames {selectedHive?.frame_count || 0} • Sensors {selectedHive?.has_sensors ? 'Online' : 'Unknown'}</div>
                </div>
            </section>

            {isOffline ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700 shadow-sm">
                    Showing cached telemetry. Reconnect to refresh the live swarm predictor.
                </div>
            ) : null}

            <div className={cn(glass.card, 'overflow-hidden bg-white p-0 shadow-xl')}>
                <div className="grid xl:grid-cols-[1.45fr_0.85fr]">
                    <div className="space-y-5 border-b border-gray-100 p-5 lg:p-6 xl:border-b-0 xl:border-r">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <Waves className="h-5 w-5 text-gray-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#1A1A1A]">48-hour telemetry window</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Frequency and brood temperature</p>
                                </div>
                            </div>
                            <div className={cn('rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider', statusMeta.bg, statusMeta.text, statusMeta.border, 'border')}>
                                {statusMeta.label}
                            </div>
                        </div>

                        <div className="h-[340px] rounded-2xl border border-gray-100 bg-white p-2 shadow-inner">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 12, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" />
                                    <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={28} />
                                    <YAxis yAxisId="left" tick={{ fill: '#9CA3AF', fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9CA3AF', fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (!active || !payload?.length) return null;
                                            const freq = payload.find((entry) => entry.dataKey === 'freqHz')?.value;
                                            const temp = payload.find((entry) => entry.dataKey === 'tempC')?.value;
                                            return (
                                                <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-2xl">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{payload[0]?.payload?.label}</p>
                                                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                                                        <div>Frequency <span className="font-bold text-[#1A1A1A]">{typeof freq === 'number' ? `${freq.toFixed(0)} Hz` : 'n/a'}</span></div>
                                                        <div>Temperature <span className="font-bold text-[#1A1A1A]">{typeof temp === 'number' ? `${temp.toFixed(1)}°C` : 'n/a'}</span></div>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                    <ReferenceLine yAxisId="left" y={300} stroke="#EF4444" strokeDasharray="5 5" />
                                    <ReferenceLine yAxisId="right" y={34.5} stroke="#F59E0B" strokeDasharray="5 5" />
                                    <Line yAxisId="left" type="monotone" dataKey="freqHz" stroke={statusMeta.color} strokeWidth={2.8} dot={false} connectNulls />
                                    <Line yAxisId="right" type="monotone" dataKey="tempC" stroke="#F59E0B" strokeWidth={2.2} dot={false} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                { label: 'Baseline freq', value: `${analysis.features.baselineFreqHz.toFixed(0)} Hz`, icon: Activity },
                                { label: 'Recent freq', value: `${analysis.features.recentFreqHz.toFixed(0)} Hz`, icon: Volume2 },
                                { label: 'Max temperature', value: `${analysis.features.maxTempC.toFixed(1)}°C`, icon: Thermometer },
                                { label: 'Piping hours', value: `${analysis.features.pipingHours}`, icon: Zap },
                            ].map((stat) => (
                                <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                    <div className="mb-2 flex items-center gap-2">
                                        <stat.icon className="h-4 w-4 text-gray-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</span>
                                    </div>
                                    <div className="text-lg font-black tracking-tight text-[#1A1A1A]">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-5 bg-[#FCFAF5] p-5 lg:p-6">
                        <div className={cn('rounded-2xl border p-5 shadow-sm', statusMeta.border, statusMeta.bg)}>
                            <div className="mb-3 flex items-center gap-3">
                                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl border bg-white shadow-sm', statusMeta.border)}>
                                    <StatusIcon className={cn('h-5 w-5', statusMeta.text)} />
                                </div>
                                <div>
                                    <div className={cn('text-sm font-black tracking-tight', statusMeta.text)}>{analysis.stateLabel}</div>
                                    <div className="text-[11px] font-semibold text-gray-500">Swarm probability {analysis.probability.toFixed(0)}%</div>
                                </div>
                            </div>
                            <p className={cn('text-sm leading-relaxed', statusMeta.text)}>{analysis.summary}</p>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-white/70 bg-white/70 p-3">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ETA</div>
                                    <div className="mt-1 text-lg font-black text-[#1A1A1A]">{analysis.etaHours === null ? 'n/a' : `< ${analysis.etaHours}h`}</div>
                                </div>
                                <div className="rounded-xl border border-white/70 bg-white/70 p-3">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Thermal spikes</div>
                                    <div className="mt-1 text-lg font-black text-[#1A1A1A]">{analysis.features.thermalSpikeHours}</div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-gray-400" />
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pollination Impact</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-end justify-between gap-3">
                                    <div>
                                        <div className="text-xs text-gray-500">Current foragers</div>
                                        <div className="text-xl font-black text-[#1A1A1A]">{analysis.pollinationImpact.currentForagers.toLocaleString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">At risk if swarm leaves</div>
                                        <div className="text-xl font-black text-red-500">{analysis.pollinationImpact.atRiskForagers.toLocaleString()}</div>
                                    </div>
                                </div>
                                <p className="text-xs leading-relaxed text-gray-500">
                                    A swarm event can remove about {analysis.pollinationImpact.workforceLossPercent}% of the working pollination force immediately.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <Info className="h-4 w-4 text-gray-400" />
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Top Drivers</h4>
                            </div>
                            <div className="space-y-3">
                                {analysis.drivers.slice(0, 4).map((driver) => (
                                    <div key={driver.label} className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm font-semibold text-[#1A1A1A]">{driver.label}</div>
                                            <div className="rounded-full bg-[#F9F7F2] px-2.5 py-1 text-[10px] font-bold text-gray-600">{driver.score.toFixed(0)}</div>
                                        </div>
                                        <p className="mt-2 text-xs leading-relaxed text-gray-500">{driver.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cn(glass.card, 'flex flex-col gap-4 bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between')}>
                <div className="flex flex-1 items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 bg-[#F9F7F2] shadow-sm">
                        <Info className="h-5 w-5 text-[#1B9157]" />
                    </div>
                    <div>
                        <h5 className="text-sm font-black tracking-tight text-[#1A1A1A]">Operational recommendation</h5>
                        <p className="mt-1 text-sm leading-relaxed text-gray-500">{analysis.recommendation}</p>
                    </div>
                </div>
                <button
                    id="view-report-button"
                    onClick={() => onTabChange && onTabChange('reports-exports')}
                    className={cn(glass.btnSecondary, 'h-10 w-full px-6 text-xs font-bold shadow-sm sm:w-auto')}
                    aria-label="View detailed production report"
                >
                    View report
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </BeeYieldPageShell>
    );
};

export default AcousticMoodTransformer;
