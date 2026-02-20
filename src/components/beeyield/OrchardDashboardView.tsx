import React, { useMemo } from 'react';
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
    Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHivesWithTelemetry } from '@/hooks/useHives';
import { Apiary } from '@/services/beeyieldService';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';

interface OrchardDashboardViewProps {
    apiary?: Apiary;
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const StatCard: React.FC<{
    label: string;
    value: string | number;
    icon: React.ElementType;
    iconColor?: string;
    iconBg?: string;
    subtitle?: string;
    trend?: 'up' | 'down';
}> = ({ label, value, icon: Icon, iconColor = 'text-beeyield-forest', iconBg = 'bg-beeyield-forest/5', subtitle, trend }) => (
    <motion.div whileHover={{ y: -4, scale: 1.01 }}>
        <Card className="border border-[#E0E0E0] bg-white shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-beeyield-forest/5 transition-all duration-500">
            <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                    <div className={cn('p-3.5 rounded-2xl border border-beeyield-forest/10 transition-all duration-500 group-hover:bg-beeyield-forest group-hover:text-white', iconBg)}>
                        <Icon className={cn('w-5 h-5 stroke-[2] transition-colors duration-500 group-hover:text-white', iconColor)} />
                    </div>
                    {trend && (
                        <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border',
                            trend === 'up' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                        )}>
                            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            Live
                        </div>
                    )}
                </div>
                <h3 className="text-3xl font-bold text-beeyield-charcoal tracking-tight mb-1">{value}</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">{label}</p>
                {subtitle && <p className="text-[10px] text-gray-400 mt-2 font-medium">{subtitle}</p>}
            </CardContent>
        </Card>
    </motion.div>
);

const OrchardDashboardView: React.FC<OrchardDashboardViewProps> = ({ apiary, onTabChange }) => {
    const { hives, isLoading } = useHivesWithTelemetry(apiary?.id);

    const stats = useMemo(() => {
        if (!hives.length) return null;
        const totalHives = hives.length;
        const activeHives = hives.filter(h => h.status === 'ACTIVE').length;
        const avgStrength = hives.reduce((acc, h) => {
            let score = 0;
            if (h.status === 'ACTIVE') score += 50;
            if ((h.latest_weight || 0) > 20) score += 30;
            if ((h.latest_temp || 0) > 32 && (h.latest_temp || 0) < 36) score += 20;
            return acc + score;
        }, 0) / (totalHives || 1);
        const avgWeight = hives.reduce((sum, h) => sum + (h.latest_weight || 0), 0) / (totalHives || 1);
        return {
            totalHives,
            activeHives,
            avgStrength: Math.round(avgStrength),
            avgWeight: avgWeight.toFixed(1),
            activityLevel: avgStrength > 80 ? 'High' : avgStrength > 50 ? 'Medium' : 'Low'
        };
    }, [hives]);

    const activityData = [
        { time: '06:00', activity: 20, foraging: 8 },
        { time: '09:00', activity: 65, foraging: 40 },
        { time: '12:00', activity: 95, foraging: 72 },
        { time: '15:00', activity: 85, foraging: 60 },
        { time: '18:00', activity: 40, foraging: 20 },
        { time: '21:00', activity: 10, foraging: 3 },
    ];

    if (!apiary) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center mx-auto mb-6">
                        <MapPin className="w-10 h-10 text-beeyield-forest/30" />
                    </div>
                    <h3 className="text-xl font-bold text-beeyield-charcoal mb-2">No Apiary Selected</h3>
                    <p className="text-gray-400 font-medium">Select an apiary from the list to view its telemetry dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-beeyield-forest" />
                        </div>
                        <h2 className="text-2xl font-bold text-beeyield-charcoal tracking-tight">
                            {apiary.location_name || 'Orchard Sector'}
                        </h2>
                    </div>
                    <p className="text-sm text-gray-400 font-medium pl-1">
                        Live telemetry · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <Sun className="w-4 h-4 text-beeyield-forest" />
                    <span className="text-[11px] font-bold text-beeyield-forest uppercase tracking-widest">Optimal</span>
                </div>
            </div>

            {/* Key Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard
                    label="Total Hives"
                    value={stats?.totalHives || 0}
                    icon={Hexagon}
                />
                <StatCard
                    label="Active Colonies"
                    value={stats?.activeHives || 0}
                    icon={Activity}
                    trend="up"
                    subtitle="+2 this week"
                />
                <StatCard
                    label="Avg Strength"
                    value={`${stats?.avgStrength || 0}%`}
                    icon={TrendingUp}
                />
                <StatCard
                    label="Avg Weight"
                    value={`${stats?.avgWeight || 0} kg`}
                    icon={Package}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Activity Chart */}
                <Card className="lg:col-span-2 border-[#E0E0E0] bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
                    <CardHeader className="p-10 pb-4">
                        <CardTitle className="text-xl font-bold text-beeyield-charcoal flex items-center gap-3">
                            <Activity className="w-6 h-6 text-beeyield-forest" />
                            Foraging Activity
                        </CardTitle>
                        <p className="text-sm text-gray-400 font-medium mt-1">Colony movement pattern for today's cycle</p>
                    </CardHeader>
                    <CardContent className="p-10 pt-2">
                        <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B4332" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorForaging" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#52B788" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#52B788" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 700 }}
                                    dy={12}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: '1px solid #E0E0E0',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08)',
                                        padding: '16px 20px',
                                        fontSize: '13px',
                                        fontWeight: 700
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="activity"
                                    stroke="#1B4332"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorActivity)"
                                    dot={{ r: 6, strokeWidth: 3, fill: '#fff', stroke: '#1B4332' }}
                                    activeDot={{ r: 8 }}
                                    name="Activity"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="foraging"
                                    stroke="#52B788"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorForaging)"
                                    dot={false}
                                    name="Foraging"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Conditions Widget */}
                <Card className="border-[#E0E0E0] bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
                    <CardHeader className="p-10 pb-4">
                        <CardTitle className="text-xl font-bold text-beeyield-charcoal flex items-center gap-3">
                            <Thermometer className="w-6 h-6 text-beeyield-forest" />
                            Conditions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pt-4 flex flex-col items-center gap-8">
                        {/* Temperature Gauge */}
                        <div className="relative w-36 h-36 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                                <circle
                                    strokeWidth="12"
                                    stroke="#F0F0F0"
                                    fill="transparent"
                                    r="52"
                                    cx="64"
                                    cy="64"
                                />
                                <circle
                                    strokeWidth="12"
                                    strokeDasharray={327}
                                    strokeDashoffset={327 - (327 * 0.75)}
                                    strokeLinecap="round"
                                    stroke="#1B4332"
                                    fill="transparent"
                                    r="52"
                                    cx="64"
                                    cy="64"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-bold text-beeyield-charcoal">24°</span>
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Sunny</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col items-center p-4 bg-beeyield-sand/30 border border-[#E8E0D5] rounded-2xl">
                                <Wind className="w-5 h-5 text-blue-500 mb-2" />
                                <span className="text-base font-bold text-beeyield-charcoal">12 km/h</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Wind</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-beeyield-sand/30 border border-[#E8E0D5] rounded-2xl">
                                <Droplets className="w-5 h-5 text-cyan-500 mb-2" />
                                <span className="text-base font-bold text-beeyield-charcoal">45%</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Humidity</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.button
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onTabChange && onTabChange('inspections', 'Filtering by apiary...', 'filter')}
                    className="p-8 flex items-center gap-6 bg-white border border-[#E0E0E0] rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-beeyield-forest/5 transition-all text-left group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center group-hover:bg-beeyield-forest transition-all duration-500">
                        <Activity className="w-7 h-7 text-beeyield-forest group-hover:text-white transition-colors duration-500" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-beeyield-charcoal">Schedule Inspection</h4>
                        <p className="text-sm text-gray-400 font-medium mt-1">Check colony health for this apiary</p>
                    </div>
                </motion.button>

                <motion.button
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onTabChange && onTabChange('harvests')}
                    className="p-8 flex items-center gap-6 bg-white border border-[#E0E0E0] rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-beeyield-forest/5 transition-all text-left group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center group-hover:bg-beeyield-forest transition-all duration-500">
                        <Hexagon className="w-7 h-7 text-beeyield-forest group-hover:text-white transition-colors duration-500" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-beeyield-charcoal">Log Harvest</h4>
                        <p className="text-sm text-gray-400 font-medium mt-1">Record honey production for this location</p>
                    </div>
                </motion.button>
            </div>
        </div>
    );
};

export default OrchardDashboardView;
