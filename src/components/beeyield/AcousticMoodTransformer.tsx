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
