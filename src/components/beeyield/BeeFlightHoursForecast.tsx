import React from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Calendar, Thermometer, Wind, Sun, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';
import { motion } from 'framer-motion';
import { useApiaries } from '@/hooks/useApiaries';
import { useApiaryWeatherSummary } from '@/hooks/useApiaryWeatherSummary';
import { cn } from '@/lib/utils';

function computeFlightHours(temp?: number | null, wind?: number | null, uv?: number | null) {
    if (temp == null || wind == null) return 0;
    if (temp < 12 || temp > 38) return 0;
    if (wind > 28) return 0;
    const uvFactor = uv == null ? 1 : Math.min(Math.max(uv / 6, 0.4), 1.15);
    const tempFactor = temp >= 16 && temp <= 30 ? 1 : 0.65;
    const windFactor = wind <= 12 ? 1 : wind <= 20 ? 0.75 : 0.45;
    return Number((8 * uvFactor * tempFactor * windFactor).toFixed(1));
}

const BeeFlightHoursForecast: React.FC = () => {
    const { data: apiaries = [] } = useApiaries();
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('');

    React.useEffect(() => {
        if (!selectedApiaryId && apiaries.length > 0) {
            setSelectedApiaryId(apiaries[0].id);
        }
    }, [apiaries, selectedApiaryId]);

    const { data: summary, isLoading } = useApiaryWeatherSummary(selectedApiaryId || undefined);

    const chartData = React.useMemo(
        () =>
            (summary?.hourly_forecast || []).slice(0, 12).map((point) => ({
                time: point.time ? new Date(point.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                hours: computeFlightHours(point.temperature_c, point.wind_speed_kmh, point.uv_index),
                temp: point.temperature_c ?? 0,
                wind: point.wind_speed_kmh ?? 0,
                uv: point.uv_index ?? 0,
            })),
        [summary],
    );

    const totalWeek = chartData.reduce((sum, item) => sum + item.hours, 0).toFixed(1);
    const minFlightTemp = chartData.length ? Math.min(...chartData.map((item) => item.temp || 0)).toFixed(1) : 'N/A';
    const maxWind = chartData.length ? Math.max(...chartData.map((item) => item.wind || 0)).toFixed(1) : 'N/A';
    const maxUv = chartData.length ? Math.max(...chartData.map((item) => item.uv || 0)).toFixed(1) : 'N/A';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={glass.page}>
            <PageHeader
                icon={Calendar}
                label="Forecast"
                title={<>Flight <span className="text-[#F4D03F]">Hours</span></>}
                subtitle="Live weather-driven flight capacity from your selected apiary."
            />

            <div className="mb-4 flex max-w-xs">
                <Select value={selectedApiaryId} onValueChange={setSelectedApiaryId}>
                    <SelectTrigger className="h-11 rounded-2xl border border-white/60 bg-white/70 font-bold text-xs">
                        <SelectValue placeholder="Select apiary" />
                    </SelectTrigger>
                    <SelectContent>
                        {apiaries.map((apiary) => (
                            <SelectItem key={apiary.id} value={apiary.id}>
                                {apiary.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <GlassStatCard label="Min Flight Temp" value={isLoading ? '...' : `${minFlightTemp}°`} icon={Thermometer} index={0} />
                <GlassStatCard label="Max Wind Speed" value={isLoading ? '...' : `${maxWind} km/h`} icon={Wind} index={1} color="text-red-500" />
                <GlassStatCard label="Light Index" value={isLoading ? '...' : maxUv} icon={Sun} index={2} />
                <GlassStatCard label="Total Window" value={isLoading ? '...' : `${totalWeek}h`} icon={Activity} index={3} color="text-[#1B9157]" />
            </div>

            <div className={cn(glass.section, 'overflow-hidden flex flex-col mt-6')}>
                <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-[#1A1A1A]">Hourly Flight Capacity</h3>
                        <p className="text-[10px] text-gray-500">Computed from live temperature, wind, and UV conditions</p>
                    </div>
                </div>

                <div className="h-[380px] w-full p-6 relative bg-[#FFF9F0]">
                    <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    {chartData.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(244, 208, 63, 0.2)', background: 'rgba(255,255,255,0.96)' }}
                                    formatter={(value: number) => [`${value}h`, 'Flight window']}
                                />
                                <Bar dataKey="hours" radius={[12, 12, 0, 0]} fill="#F4D03F" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={cn(glass.card, 'h-full w-full flex items-center justify-center bg-white/50 border border-[#F4D03F]/10')}>
                            <div className="text-center space-y-2 p-6">
                                <div className="text-sm font-bold text-[#1A1A1A]">No forecast data yet</div>
                                <p className="text-xs font-medium text-gray-500 max-w-md">
                                    Select an apiary with linked coordinates and weather data to compute real flight windows.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default BeeFlightHoursForecast;
