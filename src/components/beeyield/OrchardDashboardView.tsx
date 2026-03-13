import React from 'react';
import {
    Activity,
    Thermometer,
    Droplets,
    Wind,
    TrendingUp,
    TrendingDown,
    Hexagon,
    MapPin,
    Sun,
    Package,
    Loader2
} from 'lucide-react';
import { useHivesWithTelemetry } from '@/hooks/useHives';
import { Apiary } from '@/services/beeyieldService';
import beeyieldService from '@/services/beeyieldService';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface OrchardDashboardViewProps {
    apiary?: Apiary;
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const OrchardDashboardView: React.FC<OrchardDashboardViewProps> = ({ apiary, onTabChange }) => {
    const { hives, isLoading: hivesLoading } = useHivesWithTelemetry(apiary?.id);
    const [weather, setWeather] = React.useState<any>(null);
    const [isWeatherLoading, setIsWeatherLoading] = React.useState(false);

    React.useEffect(() => {
        if (apiary?.latitude && apiary?.longitude) {
            const fetchWeather = async () => {
                setIsWeatherLoading(true);
                const data = await beeyieldService.getWeatherData(apiary.latitude!, apiary.longitude!);
                if (data) setWeather(data);
                setIsWeatherLoading(false);
            };
            fetchWeather();
        }
    }, [apiary?.latitude, apiary?.longitude]);

    const stats = React.useMemo(() => {
        if (!hives.length) return null;
        const totalHives = hives.length;
        const activeHives = hives.filter(h => h.status === 'ACTIVE' || h.status === 'active').length;
        const avgStrength = hives.reduce((acc, h) => {
            let score = 0;
            const t = h.latest_temp || (h as any).telemetry?.temperature;
            const w = h.latest_weight || (h as any).telemetry?.weight;
            if (h.status === 'ACTIVE' || h.status === 'active') score += 50;
            if (w > 20) score += 30;
            if (t > 32 && t < 37) score += 20;
            return acc + score;
        }, 0) / (totalHives || 1);
        const avgWeight = hives.reduce((sum, h) => sum + (h.latest_weight || (h as any).telemetry?.weight || 0), 0) / (totalHives || 1);
        return {
            totalHives,
            activeHives,
            avgStrength: Math.round(avgStrength),
            avgWeight: avgWeight.toFixed(1),
            activityLevel: avgStrength > 80 ? 'High' : avgStrength > 50 ? 'Medium' : 'Low'
        };
    }, [hives]);

    const activityData = React.useMemo(() => [
        { time: '06:00', activity: 20, foraging: 8 },
        { time: '09:00', activity: 65, foraging: 40 },
        { time: '12:00', activity: 95, foraging: 72 },
        { time: '15:00', activity: 85, foraging: 60 },
        { time: '18:00', activity: 40, foraging: 20 },
        { time: '21:00', activity: 10, foraging: 3 },
    ], []);

    if (hivesLoading && !hives.length) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-[#1B9157] animate-spin opacity-30" />
            </div>
        );
    }

    if (!apiary) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto shadow-sm">
                        <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">No Apiary Selected</h3>
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
                        <MapPin className="w-4 h-4 text-[#1B9157]" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">{apiary.location_name || 'Orchard Sector'}</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Live Telemetry · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/20 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                    <Sun className="w-3.5 h-3.5 text-[#F4D03F]" />
                    <span className="text-xs font-bold text-[#1A1A1A]">Optimal</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <div key={i} className={cn(glass.card, "p-4 space-y-3 hover:border-gray-200 transition-all group")}>
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 transition-all">
                                <s.icon className={cn("w-4 h-4", s.color)} />
                            </div>
                            {s.trend && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1B9157]/10 text-[#1B9157]">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase">Live</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-0.5 mt-1">
                            <p className="text-xl font-bold tracking-tight text-[#1A1A1A]">{s.value}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={cn(glass.card, "lg:col-span-2 p-0 overflow-hidden flex flex-col")}>
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#1B9157]" />
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Foraging Activity</h3>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Today</span>
                    </div>
                    <div className="p-4 flex-1">
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
                                        backgroundColor: '#fff'
                                    }}
                                    itemStyle={{
                                        paddingTop: '2px'
                                    }}
                                />
                                <Area type="monotone" dataKey="activity" stroke="#1B9157" strokeWidth={2} fillOpacity={1} fill="url(#colorActivity)" dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#1B9157' }} name="Activity" />
                                <Area type="monotone" dataKey="foraging" stroke="#F4D03F" strokeWidth={2} fillOpacity={1} fill="url(#colorForaging)" dot={false} name="Foraging" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={cn(glass.card, "p-0 overflow-hidden flex flex-col")}>
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                        <Thermometer className="w-4 h-4 text-[#F4D03F]" />
                        <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Conditions</h3>
                    </div>
                    <div className="p-5 flex flex-col items-center gap-6 flex-1">
                        <div className="relative w-28 h-28 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                                <circle strokeWidth="8" stroke="#F3F4F6" fill="transparent" r="52" cx="64" cy="64" />
                                <circle strokeWidth="8" strokeDasharray={327} strokeDashoffset={327 - (327 * 0.75)} strokeLinecap="round" stroke="#1B9157" fill="transparent" r="52" cx="64" cy="64" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
                                    {isWeatherLoading ? '...' : (weather?.temperature ? `${Math.round(weather.temperature)}°` : '24°')}
                                </span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                    {weather?.summary || 'Sunny'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <Wind className="w-4 h-4 text-blue-500 mb-1.5" />
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-bold text-[#1A1A1A]">{weather?.wind_speed || '12'}</span>
                                    <span className="text-[10px] font-medium text-gray-500">km/h</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Wind</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <Droplets className="w-4 h-4 text-cyan-500 mb-1.5" />
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-bold text-[#1A1A1A]">{weather?.humidity || '45'}</span>
                                    <span className="text-[10px] font-medium text-gray-500">%</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Humidity</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => onTabChange && onTabChange('inspections', 'Filtering by apiary...', 'filter')}
                    className={cn(glass.card, "p-3.5 flex items-center gap-4 text-left group hover:bg-gray-50 hover:border-gray-300 transition-all")}
                >
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:bg-[#1B9157]/10 group-hover:border-[#1B9157]/20 transition-all shadow-sm">
                        <Activity className="w-4 h-4 text-[#1B9157]" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-[#1A1A1A]">Schedule Inspection</h4>
                        <p className="text-[10px] font-medium text-gray-500">Check colony health node</p>
                    </div>
                </button>
                <button
                    onClick={() => onTabChange && onTabChange('harvests')}
                    className={cn(glass.card, "p-3.5 flex items-center gap-4 text-left group hover:bg-gray-50 hover:border-gray-300 transition-all")}
                >
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:bg-[#F4D03F]/10 group-hover:border-[#F4D03F]/20 transition-all shadow-sm">
                        <Hexagon className="w-4 h-4 text-[#F4D03F]" />
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
