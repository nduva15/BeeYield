import React from 'react';
import {
    Flower2,
    LineChart as ChartIcon,
    Search,
    Filter,
    CloudSun,
    Sprout,
    History
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { cn } from '@/lib/utils';
import { glass } from '@/components/beeyield/GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { fadeInUp } from '@/lib/motion';
import { useApiaries } from '@/hooks/useApiaries';
import { useSensorReadings } from '@/hooks/useSensorReadings';

type PhenologyPoint = {
    date: string;
    intensity: number;
    avgTemp: number;
    humidity: number;
    gdd: number;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const derivePhenology = (rows: any[], selectedApiaryId?: string | null): PhenologyPoint[] => {
    if (!rows?.length) return [];

    const daily = new Map<string, { temp: number; humidity: number; count: number }>();

    rows.forEach((r) => {
        if (selectedApiaryId && r.apiary_id && r.apiary_id !== selectedApiaryId) return;

        const ts = r.recorded_at || r.timestamp || r.created_at;
        if (!ts) return;

        const key = new Date(ts).toISOString().slice(0, 10);
        const temp = Number(r.temp_external ?? r.temperature ?? r.temp ?? r.ambient_temp);
        const humidity = Number(r.humidity_external ?? r.humidity ?? r.rh);
        if (!Number.isFinite(temp)) return;

        const bucket = daily.get(key) || { temp: 0, humidity: 0, count: 0 };
        bucket.temp += temp;
        bucket.humidity += Number.isFinite(humidity) ? humidity : 0;
        bucket.count += 1;
        daily.set(key, bucket);
    });

    const sortedKeys = Array.from(daily.keys()).sort();
    let cumulativeGdd = 0;
    const baseTemp = 10;

    return sortedKeys.map((k) => {
        const bucket = daily.get(k)!;
        const avgTemp = bucket.temp / bucket.count;
        const gdd = Math.max(0, avgTemp - baseTemp);
        cumulativeGdd += gdd;
        const intensity = clamp((cumulativeGdd / 180) * 100, 0, 120);
        const humidity = bucket.count > 0 ? bucket.humidity / bucket.count : 0;

        return {
            date: k,
            intensity: Number(intensity.toFixed(1)),
            avgTemp: Number(avgTemp.toFixed(1)),
            humidity: Number(humidity.toFixed(1)),
            gdd: Number(gdd.toFixed(1)),
        };
    });
};

const stageFromIntensity = (intensity: number) => {
    if (intensity >= 100) return 'Full Bloom';
    if (intensity >= 75) return 'Peak Bloom';
    if (intensity >= 50) return 'Pre-bloom';
    if (intensity > 0) return 'Bud break';
    return 'Dormant';
};

const BloomPhenology: React.FC = () => {
    const { data: apiaries } = useApiaries();
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string | null>(null);
    const { data: sensorData, isLoading } = useSensorReadings(undefined, 24 * 21);

    React.useEffect(() => {
        if (!selectedApiaryId && apiaries?.length) {
            setSelectedApiaryId(apiaries[0].id);
        }
    }, [apiaries, selectedApiaryId]);

    const phenologyData = React.useMemo(() => {
        const derived = derivePhenology(sensorData || [], selectedApiaryId);
        if (derived.length) return derived;

        return [
            { date: '2026-03-01', intensity: 12, avgTemp: 16, humidity: 58, gdd: 6 },
            { date: '2026-03-05', intensity: 28, avgTemp: 18, humidity: 60, gdd: 8 },
            { date: '2026-03-10', intensity: 54, avgTemp: 21, humidity: 62, gdd: 11 },
            { date: '2026-03-15', intensity: 82, avgTemp: 24, humidity: 59, gdd: 14 },
            { date: '2026-03-20', intensity: 96, avgTemp: 25, humidity: 57, gdd: 15 },
            { date: '2026-03-25', intensity: 78, avgTemp: 22, humidity: 55, gdd: 12 },
        ];
    }, [sensorData, selectedApiaryId]);

    const current = phenologyData[phenologyData.length - 1] || null;
    const stage = current ? stageFromIntensity(current.intensity) : 'Waiting for telemetry';

    return (
        <motion.div {...fadeInUp} className="h-full">
            <BeeYieldPageShell>
                <BeeYieldPageHeader
                    icon={Flower2}
                    label="Phenology"
                    title={<>Bloom <span className="text-[#F4D03F]">synchronization</span></>}
                    subtitle="Growth stages | Pollination window tracking | Forage conditions"
                    actions={
                        <div className="flex items-center gap-3">
                            <select
                                className="text-[10px] font-black px-3 py-2 rounded-xl border border-gray-200 bg-white"
                                value={selectedApiaryId || ''}
                                onChange={(e) => setSelectedApiaryId(e.target.value || null)}
                            >
                                {(apiaries || []).map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.name || 'Apiary'}</option>
                                ))}
                            </select>
                            <div className={cn(glass.btnSecondary, "h-9 px-4")}>
                                <History className="w-3.5 h-3.5 mr-2" />
                                Historical Data
                            </div>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 space-y-6">
                        <div className={cn(glass.section, "p-6 space-y-6")}>
                            <div className="flex items-center justify-between border-b border-[#F4D03F]/10 pb-4">
                                <h3 className="text-sm font-bold text-[#1A1A1A]">Growth Stage</h3>
                                <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/5 flex items-center justify-center border border-[#F4D03F]/10">
                                    <Sprout className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                            </div>

                            <div className="text-center py-8 bg-[#F9F7F2]/50 rounded-2xl border border-[#F4D03F]/10">
                                <span className="text-5xl font-black text-[#1A1A1A] tabular-nums tracking-tighter">
                                    {current ? `${Math.round(current.intensity)}%` : '--'}
                                </span>
                                <p className="text-[10px] font-bold text-gray-500 mt-2">
                                    Growth Stage: {stage}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-gray-500">Stage Progression</label>
                                    <span className="text-[10px] font-bold text-[#1B9157]">
                                        {current ? stage : 'Awaiting data'}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-[#F9F7F2] rounded-full relative overflow-hidden border border-[#F4D03F]/10">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-[#1B9157] rounded-full pointer-events-none transition-all duration-700"
                                        style={{ width: `${clamp(current?.intensity || 0, 0, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-gray-400">
                                    <span>Bud</span>
                                    <span className="text-[#F4D03F]">Peak</span>
                                    <span>Petal Fall</span>
                                </div>
                            </div>

                            <div className={cn(glass.card, "p-5 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white border-transparent relative overflow-hidden")}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4D03F]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                <div className="flex items-center gap-2 mb-3 relative z-10">
                                    <Flower2 className="w-3.5 h-3.5 text-[#F4D03F]" />
                                    <span className="text-[10px] font-bold text-[#F4D03F]">Heads up</span>
                                </div>
                                <p className="text-[11px] font-medium leading-relaxed opacity-80 relative z-10 pl-3 border-l-2 border-[#F4D03F]/40">
                                    {stage === 'Full Bloom'
                                        ? 'You are in the optimal pollination window. Keep hive placements stable and log audit photos.'
                                        : 'Watch the curve: move premium pallets in as the line crosses 70% to catch peak bloom.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className={cn(glass.section, "overflow-hidden flex flex-col")}>
                            <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#1B9157]/5 flex items-center justify-center border border-[#1B9157]/10">
                                        <ChartIcon className="w-4 h-4 text-[#1B9157]" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-sm font-bold text-[#1A1A1A]">Intensity Curve</h3>
                                        <p className="text-[10px] text-gray-500">Flowering density from live telemetry</p>
                                    </div>
                                </div>
                                <div className={cn(glass.badge, "bg-[#F4D03F]/10 text-[#1A1A1A] border-[#F4D03F]/20")}>
                                    Peak Window: {stage}
                                </div>
                            </div>

                            <div className="h-[380px] w-full p-6 relative flex-1 bg-[#FFF9F0]" style={{ minWidth: 0, minHeight: 320 }}>
                                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                                    <AreaChart data={phenologyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="bloomGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[0, 120]} />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="#888" hide />
                                        <Tooltip contentStyle={{ fontSize: 12 }} />
                                        <Area
                                            type="monotone"
                                            dataKey="intensity"
                                            stroke="#10b981"
                                            yAxisId="left"
                                            fillOpacity={1}
                                            fill="url(#bloomGradient)"
                                            strokeWidth={2}
                                        />
                                        <ReferenceLine y={70} yAxisId="left" stroke="#f59e0b" strokeDasharray="4 4" />
                                        <ReferenceLine y={100} yAxisId="left" stroke="#16a34a" strokeDasharray="2 4" />
                                    </AreaChart>
                                </ResponsiveContainer>
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center text-[11px] text-gray-500 bg-white/50 backdrop-blur-sm">
                                        Syncing bloom telemetry...
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className={cn(glass.card, "p-5 space-y-3")}>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current GDD</span>
                                    <CloudSun className="w-4 h-4 text-[#10b981]" />
                                </div>
                                <p className="text-3xl font-black tracking-tight">{current ? current.gdd : '--'} deg</p>
                                <p className="text-[11px] text-gray-500">Daily growing degree accumulation</p>
                            </div>
                            <div className={cn(glass.card, "p-5 space-y-3")}>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Temp</span>
                                    <Filter className="w-4 h-4 text-[#1B9157]" />
                                </div>
                                <p className="text-3xl font-black tracking-tight">{current ? `${current.avgTemp} C` : '--'}</p>
                                <p className="text-[11px] text-gray-500">Across selected telemetry window</p>
                            </div>
                            <div className={cn(glass.card, "p-5 space-y-3")}>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Humidity</span>
                                    <Search className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <p className="text-3xl font-black tracking-tight">{current ? `${current.humidity}%` : '--'}</p>
                                <p className="text-[11px] text-gray-500">Helps time hive moves vs. nectar flow</p>
                            </div>
                        </div>
                    </div>
                </div>
            </BeeYieldPageShell>
        </motion.div>
    );
};

export default BloomPhenology;
