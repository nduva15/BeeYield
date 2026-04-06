import React from 'react';
import {
    Activity,
    Hexagon,
    Loader2,
    MapPin,
    Package,
    Sun,
    TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import { useHivesWithTelemetry } from '@/hooks/useHives';
import { useApiaryWeatherSummary } from '@/hooks/useApiaryWeatherSummary';
import { Apiary } from '@/services/beeyieldService';
import beeyieldService from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import WeatherTelemetryPanel from './WeatherTelemetryPanel';

interface OrchardDashboardViewProps {
    apiary?: Apiary;
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const OrchardDashboardView: React.FC<OrchardDashboardViewProps> = ({ apiary, onTabChange }) => {
    const { hives, isLoading: hivesLoading } = useHivesWithTelemetry(apiary?.id);
    const { data: weatherSummary, isLoading: isWeatherLoading } = useApiaryWeatherSummary(apiary?.id);
    const [historicalReadings, setHistoricalReadings] = React.useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = React.useState(false);

    React.useEffect(() => {
        const fetchHistory = async () => {
            setIsHistoryLoading(true);
            try {
                const data = await beeyieldService.getSensorReadings(undefined, 24);
                if (data) {
                    const apiaryHiveIds = new Set(hives.map((h) => h.id));
                    const filtered = data.filter((r) => r.hive_id && apiaryHiveIds.has(r.hive_id));
                    setHistoricalReadings(filtered);
                }
            } finally {
                setIsHistoryLoading(false);
            }
        };
        if (hives.length > 0) {
            fetchHistory();
        } else {
            setHistoricalReadings([]);
        }
    }, [hives, apiary?.id]);

    const stats = React.useMemo(() => {
        if (!hives.length) return null;
        const totalHives = hives.length;
        const activeStatuses = ['active', 'healthy', 'ok', 'Active', 'Healthy', 'OK'];

        const avgStrength =
            hives.reduce((acc, h) => {
                let score = 0;
                const temp = h.latest_temp || (h as any).temp || (h as any).telemetry?.temperature;
                const weight = h.latest_weight || (h as any).weight || (h as any).telemetry?.weight;

                if (activeStatuses.includes(h.status || '')) score += 50;
                if (weight > 20) score += 30;
                if (temp > 32 && temp < 37) score += 20;
                return acc + score;
            }, 0) / totalHives;

        const avgWeight =
            hives.reduce(
                (sum, h) => sum + (h.latest_weight || (h as any).weight || (h as any).telemetry?.weight || 0),
                0,
            ) / totalHives;

        const avgBattery =
            hives.reduce((sum, h) => {
                const battery =
                    (h as any).latest_battery ||
                    (h as any).telemetry?.battery_level ||
                    (h as any).telemetry?.battery_voltage ||
                    100;
                return sum + (battery > 100 ? 100 : battery);
            }, 0) / totalHives;

        const activeHives = hives.filter((h) => !h.status || activeStatuses.includes(h.status)).length;

        return {
            totalHives,
            activeHives,
            avgStrength: Math.round(avgStrength),
            avgWeight: avgWeight.toFixed(1),
            avgBattery: Math.round(avgBattery),
        };
    }, [hives]);

    const activityData = React.useMemo(() => {
        if (!historicalReadings.length) return [];

        const hours: Record<string, { activity: number; foraging: number; count: number }> = {};

        historicalReadings.forEach((reading) => {
            const date = new Date(reading.timestamp || reading.recorded_at);
            const hourStr = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

            if (!hours[hourStr]) {
                hours[hourStr] = { activity: 0, foraging: 0, count: 0 };
            }

            const payload = reading.readings || {};
            const itemActivity = (payload as any).bee_activity || 0;
            const itemForaging = (payload as any).foraging_rate || itemActivity * 0.7;

            hours[hourStr].activity += itemActivity;
            hours[hourStr].foraging += itemForaging;
            hours[hourStr].count += 1;
        });

        return Object.entries(hours)
            .map(([time, data]) => ({
                time,
                activity: Math.round(data.activity / data.count),
                foraging: Math.round(data.foraging / data.count),
            }))
            .reverse()
            .slice(-12);
    }, [historicalReadings]);

    if (hivesLoading && !hives.length) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#1B9157] opacity-30" />
            </div>
        );
    }

    if (!apiary) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="space-y-3 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
                        <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-bold tracking-tight text-[#1A1A1A]">No Apiary Selected</h3>
                    <p className="text-xs font-medium text-gray-500">Select an apiary to view telemetry.</p>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Hives', value: stats?.totalHives || 0, icon: Hexagon, color: 'text-[#1A1A1A]' },
        { label: 'Active', value: stats?.activeHives || 0, icon: Activity, color: 'text-[#1B9157]', trend: 'up' as const },
        { label: 'Strength', value: `${stats?.avgStrength || 0}%`, icon: TrendingUp, color: 'text-[#F4D03F]' },
        { label: 'Avg Weight', value: `${stats?.avgWeight || 0} kg`, icon: Package, color: 'text-[#1A1A1A]' },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(glass.page, 'space-y-6 p-4 lg:p-6 pb-20')}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 shadow-sm">
                        <MapPin className="h-4 w-4 text-[#1B9157]" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">{apiary.location_name || 'Orchard Sector'}</h2>
                        <p className="text-sm text-gray-500">
                            Live readings | {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div
                    className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-1.5 shadow-sm',
                        (stats?.avgStrength || 0) > 70 ? 'border-[#1B9157]/20 bg-[#1B9157]/5' : 'border-[#F4D03F]/20 bg-[#F4D03F]/5',
                    )}
                >
                    <div
                        className={cn(
                            'h-1.5 w-1.5 animate-pulse rounded-full',
                            (stats?.avgStrength || 0) > 70 ? 'bg-[#1B9157]' : 'bg-[#F4D03F]',
                        )}
                    />
                    <Sun className={cn('h-3.5 w-3.5', (stats?.avgStrength || 0) > 70 ? 'text-[#1B9157]' : 'text-[#F4D03F]')} />
                    <span className="text-xs font-bold text-[#1A1A1A]">
                        {(stats?.avgStrength || 0) > 70 ? 'Optimal' : (stats?.avgStrength || 0) > 40 ? 'Fair' : 'Alert'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {statCards.map((card, index) => (
                    <div key={index} className={cn(glass.card, 'group space-y-3 p-4 transition-all hover:border-gray-200')}>
                        <div className="flex items-center justify-between">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 transition-all">
                                <card.icon className={cn('h-4 w-4', card.color)} />
                            </div>
                            {card.trend && (
                                <div className="flex items-center gap-1.5 rounded-md bg-[#1B9157]/10 px-2 py-0.5 text-[#1B9157]">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="text-[10px] font-bold">Live</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-1 space-y-0.5">
                            <div className="flex items-baseline gap-1">
                                <p className="text-xl font-bold tracking-tight text-[#1A1A1A]">
                                    {card.label === 'Strength' ? stats?.avgStrength : card.value}
                                </p>
                                {card.label === 'Strength' && <span className="text-xs font-bold text-gray-400">%</span>}
                                {card.label === 'Avg Weight' && <span className="text-xs font-bold text-gray-400">kg</span>}
                            </div>
                            <p className="text-[10px] font-bold tracking-wider text-gray-500">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className={cn(glass.card, 'lg:col-span-2 flex flex-col overflow-hidden p-0')}>
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-[#1B9157]" />
                            <h3 className="text-sm font-bold tracking-tight text-[#1A1A1A]">Foraging Activity</h3>
                        </div>
                        <span className="text-[10px] font-bold tracking-wider text-gray-500">Today</span>
                    </div>
                    <div className="min-h-[220px] flex-1 p-4">
                        {(isHistoryLoading || hivesLoading) && !activityData.length ? (
                            <div className="flex h-full items-center justify-center opacity-30">
                                <Loader2 className="h-6 w-6 animate-spin text-[#1B9157]" />
                            </div>
                        ) : !activityData.length ? (
                            <div className="flex h-full flex-col items-center justify-center py-8 text-center opacity-40">
                                <Activity className="mb-2 h-8 w-8 text-gray-300" />
                                <p className="text-[10px] font-bold text-gray-400">Waiting for live sensor stream...</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="99%" height={220}>
                                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1B9157" stopOpacity={0.12} />
                                            <stop offset="95%" stopColor="#1B9157" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorForaging" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#F4D03F" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} width={40} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid #E5E7EB',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                            padding: '8px 12px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            backgroundColor: '#fff',
                                        }}
                                        itemStyle={{ paddingTop: '2px' }}
                                    />
                                    <Area type="monotone" dataKey="activity" stroke="#1B9157" strokeWidth={2} fillOpacity={1} fill="url(#colorActivity)" dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#1B9157' }} name="Activity" />
                                    <Area type="monotone" dataKey="foraging" stroke="#F4D03F" strokeWidth={2} fillOpacity={1} fill="url(#colorForaging)" dot={false} name="Foraging" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <WeatherTelemetryPanel
                    summary={weatherSummary}
                    isLoading={isWeatherLoading}
                    title={`${apiary.name || apiary.location_name || 'Apiary'} conditions`}
                    compact
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                    onClick={() => onTabChange && onTabChange('inspections', 'Filtering by apiary...', 'filter')}
                    className={cn(glass.card, 'group flex items-center gap-4 p-3.5 text-left transition-all hover:border-gray-300 hover:bg-gray-50')}
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition-all group-hover:border-[#1B9157]/20 group-hover:bg-[#1B9157]/10">
                        <Activity className="h-4 w-4 text-[#1B9157]" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-[#1A1A1A]">Schedule Inspection</h4>
                        <p className="text-[10px] font-medium text-gray-500">Check colony health</p>
                    </div>
                </button>
                <button
                    onClick={() => onTabChange && onTabChange('harvests')}
                    className={cn(glass.card, 'group flex items-center gap-4 p-3.5 text-left transition-all hover:border-gray-300 hover:bg-gray-50')}
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition-all group-hover:border-[#F4D03F]/20 group-hover:bg-[#F4D03F]/10">
                        <Hexagon className="h-4 w-4 text-[#F4D03F]" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-[#1A1A1A]">Log Harvest</h4>
                        <p className="text-[10px] font-medium text-gray-500">Record production metrics</p>
                    </div>
                </button>
            </div>
        </motion.div>
    );
};

export default OrchardDashboardView;
