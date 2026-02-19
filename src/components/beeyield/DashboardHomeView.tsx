import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    TrendingUp, TrendingDown, Minus, Activity, Hexagon, MapPin,
    Droplet, Thermometer, Wind, Gauge, Zap, Calendar, ArrowRight,
    BarChart3, PieChart, LineChart, Users, Package, AlertCircle,
    CheckCircle2, Clock, Target, Sparkles
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { beeyieldService } from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DashboardHomeViewProps {
    onTabChange?: (tab: string, item1?: any, item2?: any) => void;
}

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    subtitle?: string;
    color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, trend, subtitle, color = 'primary' }) => {
    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="w-3 h-3" />;
        if (trend === 'down') return <TrendingDown className="w-3 h-3" />;
        return <Minus className="w-3 h-3" />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (trend === 'down') return 'text-red-600 bg-red-50 border-red-100';
        return 'text-gray-500 bg-gray-50 border-gray-100';
    };

    return (
        <Card className="border-[#E0E0E0] bg-white shadow-sm hover:shadow-xl hover:shadow-beeyield-forest/5 transition-all duration-500 rounded-[2rem] overflow-hidden group">
            <CardContent className="p-8">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[0.15em]">{title}</p>
                        <div className="flex items-baseline gap-4">
                            <h3 className="text-4xl font-bold text-beeyield-charcoal tracking-tight">{value}</h3>
                            {change !== undefined && (
                                <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border", getTrendColor())}>
                                    {getTrendIcon()}
                                    <span>{Math.abs(change)}%</span>
                                </div>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-[11px] text-gray-400 mt-3 font-medium uppercase tracking-tight">{subtitle}</p>
                        )}
                    </div>
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-beeyield-forest group-hover:text-white border border-beeyield-forest/10 bg-beeyield-forest/5 text-beeyield-forest",
                        color === 'blue' && "text-blue-600 bg-blue-50 border-blue-100",
                        color === 'amber' && "text-beeyield-forest bg-beeyield-forest/5",
                        color === 'green' && "text-emerald-600 bg-emerald-50 border-emerald-100",
                        color === 'purple' && "text-purple-600 bg-purple-50 border-purple-100"
                    )}>
                        <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ onTabChange }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [sensorData, setSensorData] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsData, readings, apiaries, hives] = await Promise.all([
                beeyieldService.getStats(),
                beeyieldService.getSensorReadings(undefined, 168),
                beeyieldService.getApiaries(),
                beeyieldService.getHives()
            ]);

            setStats(statsData);
            setSensorData(processSensorDataForCharts(readings));
            setRecentActivity(generateRecentActivity(apiaries, hives, readings));

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const processSensorDataForCharts = (readings: any[]) => {
        const groupedByDate: { [key: string]: any } = {};
        readings.forEach(reading => {
            const date = new Date(reading.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!groupedByDate[date]) {
                groupedByDate[date] = { date, temperature: [], humidity: [], weight: [], activity: [] };
            }
            const r = reading.readings || {};
            if (r.temperature) groupedByDate[date].temperature.push(r.temperature);
            if (r.humidity) groupedByDate[date].humidity.push(r.humidity);
            if (r.hive_weight) groupedByDate[date].weight.push(r.hive_weight);
            if (r.bee_activity) groupedByDate[date].activity.push(r.bee_activity);
        });

        return Object.values(groupedByDate).map(day => ({
            date: day.date,
            temperature: day.temperature.length > 0 ? Math.round(day.temperature.reduce((a: number, b: number) => a + b, 0) / day.temperature.length) : 0,
            humidity: day.humidity.length > 0 ? Math.round(day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length) : 0,
            weight: day.weight.length > 0 ? Math.round(day.weight.reduce((a: number, b: number) => a + b, 0) / day.weight.length) : 0,
            activity: day.activity.length > 0 ? Math.round(day.activity.reduce((a: number, b: number) => a + b, 0) / day.activity.length) : 0
        })).slice(-7);
    };

    const generateRecentActivity = (apiaries: any[], hives: any[], readings: any[]) => {
        const activities = [];
        apiaries.slice(0, 2).forEach(apiary => {
            activities.push({
                type: 'apiary',
                title: `New apiary: ${apiary.name}`,
                time: new Date(apiary.created_at).toLocaleDateString(),
                icon: MapPin,
                color: 'text-blue-600 bg-blue-50 border-blue-100'
            });
        });
        hives.slice(0, 2).forEach(hive => {
            activities.push({
                type: 'hive',
                title: `Hive ${hive.hive_code} added`,
                time: new Date(hive.created_at).toLocaleDateString(),
                icon: Hexagon,
                color: 'text-beeyield-forest bg-beeyield-forest/5 border-beeyield-forest/10'
            });
        });
        if (readings.length > 0) {
            activities.push({
                type: 'reading',
                title: 'Latest sensor data received',
                time: new Date(readings[0].timestamp).toLocaleTimeString(),
                icon: Activity,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
            });
        }
        return activities.slice(0, 5);
    };

    const hiveHealthData = [
        { name: 'Healthy', value: stats?.active_hives || 0, color: '#1B4332' },
        { name: 'Warning', value: Math.floor((stats?.total_hives || 0) * 0.15), color: '#52B788' },
        { name: 'Critical', value: Math.floor((stats?.total_hives || 0) * 0.05), color: '#D8E2DC' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-14 h-14 border-[4px] border-beeyield-forest border-t-transparent rounded-full animate-spin" />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">Synchronizing Core...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-6">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-beeyield-forest uppercase tracking-[0.15em]">System Node Active</span>
                    </div>
                    <h1 className="text-5xl font-bold text-beeyield-charcoal tracking-tight">
                        Ecosystem Overview
                    </h1>
                    <p className="text-gray-500 font-medium mt-3 text-lg">
                        Telemetry analysis and harvest synchronization for the current cycle.
                    </p>
                </div>
                <Button
                    onClick={loadDashboardData}
                    variant="outline"
                    className="h-14 px-8 rounded-2xl border-[#E0E0E0] bg-white hover:bg-gray-50 shadow-sm transition-all font-bold text-sm flex items-center gap-3"
                >
                    <Activity className="w-4 h-4 text-beeyield-forest" />
                    Refresh Core
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard
                    title="Active Apiaries"
                    value={stats?.total_apiaries || 0}
                    change={12}
                    trend="up"
                    icon={MapPin}
                    color="blue"
                    subtitle="Regional clusters"
                />
                <MetricCard
                    title="Monitored Hives"
                    value={stats?.total_hives || 0}
                    change={8}
                    trend="up"
                    icon={Hexagon}
                    color="amber"
                    subtitle={`${stats?.active_hives || 0} online`}
                />
                <MetricCard
                    title="Aggregate Harvest"
                    value={`${stats?.total_honey_kg || 0} kg`}
                    change={15}
                    trend="up"
                    icon={Package}
                    color="green"
                    subtitle="Current season"
                />
                <MetricCard
                    title="Active Protocols"
                    value={stats?.pending_tasks || 0}
                    icon={Clock}
                    color="purple"
                    subtitle="Maintenance queue"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-[#E0E0E0] bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
                    <CardHeader className="p-10 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-beeyield-charcoal flex items-center gap-3">
                                    <Activity className="w-6 h-6 text-beeyield-forest" />
                                    Telemetry Spectrum
                                </CardTitle>
                                <p className="text-sm text-gray-400 font-medium mt-1">Real-time activity and temperature fluctuations</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-2">
                        <ResponsiveContainer width="100%" height={340}>
                            <BarChart data={sensorData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F5F5F5" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9ca3af"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 700 }}
                                    dy={15}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F9F7F2', opacity: 0.4 }}
                                    contentStyle={{ borderRadius: '24px', border: '1px solid #E0E0E0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '20px' }}
                                />
                                <Bar dataKey="activity" fill="#1B4332" radius={[12, 12, 0, 0]} barSize={28} />
                                <Bar dataKey="temperature" fill="#B7E4C7" radius={[12, 12, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-[#E0E0E0] bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
                    <CardHeader className="p-10 pb-4">
                        <CardTitle className="text-xl font-bold text-beeyield-charcoal flex items-center gap-3">
                            <PieChart className="w-6 h-6 text-beeyield-forest" />
                            Health Integrity
                        </CardTitle>
                        <p className="text-sm text-gray-400 font-medium mt-1">Ecosystem distribution</p>
                    </CardHeader>
                    <CardContent className="p-10 pt-2">
                        <ResponsiveContainer width="100%" height={220}>
                            <RePieChart>
                                <Pie
                                    data={hiveHealthData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={10}
                                    dataKey="value"
                                >
                                    {hiveHealthData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="mt-10 space-y-4">
                            {hiveHealthData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-gray-400 font-bold uppercase text-[11px] tracking-widest">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-beeyield-charcoal text-lg">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Environmental & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-[#E0E0E0] bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
                    <CardHeader className="p-10 pb-4 border-b border-[#F9F7F2]">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold text-beeyield-charcoal flex items-center gap-3">
                                <Thermometer className="w-6 h-6 text-beeyield-forest" />
                                Atmospheric Metrics
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="text-xs font-bold text-beeyield-forest uppercase tracking-widest hover:bg-beeyield-forest/5">Full Log</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        <ResponsiveContainer width="100%" height={280}>
                            <ReLineChart data={sensorData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F5F5F5" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                                <Tooltip />
                                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                                <Line type="monotone" dataKey="temperature" stroke="#1B4332" strokeWidth={4} dot={{ r: 6, strokeWidth: 3, fill: '#fff' }} activeDot={{ r: 8 }} name="Temp °C" />
                                <Line type="monotone" dataKey="humidity" stroke="#B7E4C7" strokeWidth={4} dot={{ r: 6, strokeWidth: 3, fill: '#fff' }} name="Humidity %" />
                            </ReLineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-[#E0E0E0] bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
                    <CardHeader className="p-10 pb-4 border-b border-[#F9F7F2]">
                        <CardTitle className="text-xl font-bold text-beeyield-charcoal flex items-center gap-3">
                            <Clock className="w-6 h-6 text-beeyield-forest" />
                            Protocol History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start gap-6 group cursor-pointer transition-all hover:translate-x-2">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm border", activity.color)}>
                                    <activity.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-base font-bold text-beeyield-charcoal">{activity.title}</p>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activity.time}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-bold mt-2 uppercase tracking-[0.1em]">Neural Hub Signature Authenticated</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 opacity-0 group-hover:opacity-100 transition-all self-center" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="bg-beeyield-forest rounded-[3rem] p-16 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-beeyield-gold/10 rounded-full blur-[80px] -ml-20 -mb-20" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                    <div className="max-w-xl text-center lg:text-left">
                        <h3 className="text-4xl font-bold tracking-tight">System Terminal</h3>
                        <p className="text-white/70 mt-6 font-medium text-xl leading-relaxed">
                            Interface directly with the Neural Hive protocols to manage inspections, analyze harvest yields, or synchronize regional apiary nodes.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full lg:w-auto">
                        {[
                            { icon: Target, label: 'Inspect', tab: 'inspections', action: 'open_add_new' },
                            { icon: Package, label: 'Harvest', tab: 'harvests', action: 'open_add_new' },
                            { icon: MapPin, label: 'Apiary', tab: 'places' },
                            { icon: BarChart3, label: 'Export', tab: 'reports-exports' }
                        ].map((action, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ y: -8, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onTabChange?.(action.tab, undefined, action.action)}
                                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center gap-4 border border-white/10 hover:bg-white hover:text-beeyield-forest transition-all"
                            >
                                <action.icon className="w-8 h-8 stroke-[2]" />
                                <span className="text-xs font-bold uppercase tracking-widest">{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHomeView;
