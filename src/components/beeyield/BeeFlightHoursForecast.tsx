import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from 'recharts';
import { Activity, ArrowRight, Calendar, Info, Sun, Thermometer, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';
import { motion } from 'framer-motion';
import { useApiaries } from '@/hooks/useHives';
import { useApiaryWeatherSummary } from '@/hooks/useApiaryWeatherSummary';
import { useSelectedApiary } from '@/hooks/useSelectedApiary';

type ForecastBucket = {
    day: string;
    hours: number;
    avgTemp: number;
    maxWind: number;
    lightIndex: number;
    status: 'optimal' | 'moderate' | 'low';
};

const CUSTOM_COLORS: Record<ForecastBucket['status'], string> = {
    optimal: '#1B9157',
    moderate: '#F4D03F',
    low: '#D6D3D1',
};

function toDateKey(timestamp?: string | null) {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
}

const BeeFlightHoursForecast: React.FC = () => {
    const { data: apiaries = [] } = useApiaries();
    const [selectedApiaryId] = useSelectedApiary(apiaries[0]?.id);
    const primaryApiary = apiaries.find((apiary) => apiary.id === selectedApiaryId) || apiaries[0] || null;
    const { data: weatherSummary, isLoading } = useApiaryWeatherSummary(primaryApiary?.id);

    const forecastData = React.useMemo<ForecastBucket[]>(() => {
        const hourly = weatherSummary?.hourly_forecast || [];
        const grouped = new Map<
            string,
            { label: string; hours: number; tempSum: number; tempCount: number; maxWind: number; lightIndex: number }
        >();

        hourly.forEach((point) => {
            const key = toDateKey(point.timestamp);
            if (!key) return;

            const date = new Date(point.timestamp as string);
            const label = date.toLocaleDateString('en-US', { weekday: 'short' });
            const bucket =
                grouped.get(key) || { label, hours: 0, tempSum: 0, tempCount: 0, maxWind: 0, lightIndex: 0 };

            const temp = typeof point.temperature_c === 'number' ? point.temperature_c : null;
            const wind = typeof point.wind_speed_kmh === 'number' ? point.wind_speed_kmh : null;
            const uv = typeof point.uv_index === 'number' ? point.uv_index : 0;

            if (temp !== null) {
                bucket.tempSum += temp;
                bucket.tempCount += 1;
            }
            if (wind !== null) {
                bucket.maxWind = Math.max(bucket.maxWind, wind);
            }
            bucket.lightIndex = Math.max(bucket.lightIndex, uv);

            const flyable =
                temp !== null &&
                temp >= 15 &&
                temp <= 35 &&
                (wind === null || wind <= 25);

            if (flyable) {
                bucket.hours += 1;
            }

            grouped.set(key, bucket);
        });

        return Array.from(grouped.values())
            .slice(0, 7)
            .map((bucket) => {
                const avgTemp = bucket.tempCount ? bucket.tempSum / bucket.tempCount : 0;
                const status: ForecastBucket['status'] =
                    bucket.hours >= 6 ? 'optimal' : bucket.hours >= 3 ? 'moderate' : 'low';
                return {
                    day: bucket.label,
                    hours: bucket.hours,
                    avgTemp,
                    maxWind: bucket.maxWind,
                    lightIndex: bucket.lightIndex,
                    status,
                };
            });
    }, [weatherSummary]);

    const totalFlightHours = forecastData.reduce((sum, day) => sum + day.hours, 0);
    const minFlightTemp =
        forecastData.length > 0 ? Math.round(Math.min(...forecastData.map((day) => day.avgTemp))) : null;
    const maxWindSpeed =
        forecastData.length > 0 ? Math.round(Math.max(...forecastData.map((day) => day.maxWind))) : null;
    const maxLightIndex =
        forecastData.length > 0 ? Math.max(...forecastData.map((day) => day.lightIndex)) : null;
    const bestWindow = forecastData.reduce<ForecastBucket | null>(
        (best, day) => (!best || day.hours > best.hours ? day : best),
        null,
    );

    const hasForecast = forecastData.length > 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={glass.page}>
            <PageHeader
                icon={Calendar}
                label="Forecast"
                title={
                    <>
                        Flight <span className="text-[#F4D03F]">Hours</span>
                    </>
                }
                subtitle="Real forecast windows derived from the selected apiary weather summary."
            />

            <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <GlassStatCard label="Min Flight Temp" value={minFlightTemp !== null ? `${minFlightTemp}°` : '—'} icon={Thermometer} index={0} />
                <GlassStatCard label="Max Wind Speed" value={maxWindSpeed !== null ? `${maxWindSpeed} km/h` : '—'} icon={Wind} index={1} color="text-red-500" />
                <GlassStatCard label="Light Index" value={maxLightIndex !== null ? maxLightIndex.toFixed(1) : '—'} icon={Sun} index={2} />
                <GlassStatCard label="Total Window" value={hasForecast ? `${totalFlightHours}h` : '—'} icon={Activity} index={3} color="text-[#1B9157]" />
            </div>

            <div className={cn(glass.section, 'mt-6 flex flex-col overflow-hidden')}>
                <div className="flex items-center justify-between border-b border-[#F4D03F]/10 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F4D03F]/20 bg-[#F9F7F2]">
                            <Activity className="h-4 w-4 text-[#F4D03F]" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Forecast Capacity</h3>
                            <p className="text-[9px] text-gray-500">Backend-derived flyable windows</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                            {primaryApiary?.name || 'No apiary'}
                        </p>
                    </div>
                </div>

                <div className="relative h-[380px] w-full bg-[#FFF9F0] p-6">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.01]"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    {!hasForecast && !isLoading ? (
                        <div className={cn(glass.card, 'flex h-full w-full items-center justify-center border border-[#F4D03F]/10 bg-white/50')}>
                            <div className="space-y-2 p-6 text-center">
                                <div className="inline-flex items-center justify-center gap-2 text-[#1A1A1A]">
                                    <Info className="h-4 w-4 text-[#F4D03F]" />
                                    <span className="text-sm font-bold">Forecast data unavailable</span>
                                </div>
                                <p className="max-w-md text-xs font-medium text-gray-500">
                                    This screen now waits for real backend weather summary data instead of rendering synthetic weekly placeholders.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 700 }} width={42} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(244,208,63,0.08)' }}
                                    contentStyle={{
                                        borderRadius: '10px',
                                        border: '1px solid #E5E7EB',
                                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                                        backgroundColor: '#fff',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                    }}
                                    formatter={(value: number, _name, item: any) => [
                                        `${value} hours`,
                                        `${item?.payload?.avgTemp?.toFixed?.(0) || 0}° avg | ${item?.payload?.maxWind?.toFixed?.(0) || 0} km/h max wind`,
                                    ]}
                                />
                                <ReferenceLine y={4} stroke="#F4D03F" strokeDasharray="4 4" />
                                <Bar dataKey="hours" radius={[10, 10, 0, 0]} barSize={42}>
                                    {forecastData.map((entry, index) => (
                                        <Cell key={`${entry.day}-${index}`} fill={CUSTOM_COLORS[entry.status]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className={cn(glass.card, 'relative mt-6 overflow-hidden border-transparent bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-8 text-white group')}>
                <div className="pointer-events-none absolute -right-64 -top-64 h-[500px] w-[500px] rounded-full bg-[#F4D03F]/10 blur-[120px] transition-all duration-1000 group-hover:bg-[#F4D03F]/15" />

                <div className="relative z-10 flex flex-col items-center gap-10 lg:flex-row">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F4D03F] shadow-[0_0_30px_rgba(244,208,63,0.3)]">
                        <Info className="h-8 w-8 text-[#1A1A1A]" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-xl font-bold tracking-tight">
                                Activity <span className="text-[#F4D03F]">Intelligence</span>
                            </h4>
                            <p className="text-[10px] font-bold text-[#F4D03F]/60">Forecast & Foraging Cycles</p>
                        </div>
                        <p className="border-l-2 border-[#F4D03F]/40 pl-6 text-sm font-medium leading-relaxed opacity-80">
                            {bestWindow
                                ? `${bestWindow.day} currently shows the strongest flyable window with about ${bestWindow.hours} productive hours, average temperatures near ${Math.round(bestWindow.avgTemp)}°C, and peak wind around ${Math.round(bestWindow.maxWind)} km/h.`
                                : 'We use selected-apiary weather telemetry to estimate likely bee work windows as real forecast data becomes available.'}
                        </p>
                    </div>
                    <button className={cn(glass.btnSecondary, 'h-12 border-transparent bg-white px-8 text-[#1A1A1A] hover:bg-white/90')}>
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default BeeFlightHoursForecast;
