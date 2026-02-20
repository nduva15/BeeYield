import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    TrendingUp, TrendingDown, Minus, Activity, Hexagon, MapPin,
    Droplet, Thermometer, Wind, Gauge, Zap, Calendar, ArrowRight,
    BarChart3, PieChart, LineChart, Users, Package, AlertCircle,
    CheckCircle2, Clock, Target, Sparkles, Orbit, Binary, Waves,
    Cpu, Globe, ShieldCheck, RefreshCw, Terminal, LayoutDashboard
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { beeyieldService } from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
        return 'text-gray-400 bg-gray-50 border-gray-100';
    };

    return (
        <Card className="border-[#E0E0E0] bg-white shadow-sm hover:shadow-2xl hover:shadow-beeyield-forest/5 transition-all duration-500 rounded-[3rem] overflow-hidden group">
            <CardContent className="p-10">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-[11px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">{title}</p>
                        <div className="flex items-baseline gap-4">
                            <h3 className="text-5xl font-black text-beeyield-charcoal tracking-tighter leading-none">{value}</h3>
                            {change !== undefined && (
                                <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest", getTrendColor())}>
                                    {getTrendIcon()}
                                    <span>{Math.abs(change)}%</span>
                                </div>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-[10px] text-gray-400 mt-4 font-black uppercase tracking-[0.15em] opacity-60">{subtitle}</p>
                        )}
                    </div>
                    <div className={cn(
                        "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-500 group-hover:bg-beeyield-forest group-hover:text-white border border-beeyield-forest/10 bg-beeyield-forest/5 text-beeyield-forest shadow-sm",
                        color === 'blue' && "text-blue-600 bg-blue-50 border-blue-100",
                        color === 'green' && "text-emerald-600 bg-emerald-50 border-emerald-100",
                        color === 'purple' && "text-purple-600 bg-purple-50 border-purple-100"
                    )}>
                        <Icon className="w-7 h-7 stroke-[1.5]" />
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
                title: `Cluster Initialized: ${apiary.name}`,
                time: new Date(apiary.created_at).toLocaleDateString(),
                icon: MapPin,
                color: 'text-blue-600 bg-blue-50 border-blue-100'
            });
        });
        hives.slice(0, 2).forEach(hive => {
            activities.push({
                type: 'hive',
                title: `Node Auth: ${hive.hive_code}`,
                time: new Date(hive.created_at).toLocaleDateString(),
                icon: Hexagon,
                color: 'text-beeyield-forest bg-beeyield-forest/5 border-beeyield-forest/10'
            });
        });
        if (readings.length > 0) {
            activities.push({
                type: 'reading',
                title: 'Packet Received: Telemetry v4',
                time: new Date(readings[0].timestamp).toLocaleTimeString(),
                icon: Activity,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
            });
        }
        return activities.slice(0, 5);
    };

    const hiveHealthData = [
        { name: 'Healthy', value: stats?.active_hives || 0, color: '#1B4332' },
        { name: 'Warning', value: Math.floor((stats?.total_hives || 0) * 0.15), color: '#38A3A5' },
        { name: 'Critical', value: Math.floor((stats?.total_hives || 0) * 0.05), color: '#E9D8A6' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="flex flex-col items-center gap-8">
                    <div className="relative">
                        <div className="w-20 h-20 border-[6px] border-beeyield-forest border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-beeyield-forest/10 rounded-full animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-[12px] font-black text-beeyield-charcoal uppercase tracking-[0.4em] animate-pulse">Synchronizing Global Hub</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bridging Biometric Streams</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-16 animate-in fade-in duration-1000 pb-20">
            {/* Cinematic Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div>
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-8">
                        <div className="w-2.5 h-2.5 rounded-full bg-beeyield-forest animate-pulse" />
                        <span className="text-[11px] font-black text-beeyield-forest uppercase tracking-[0.2em]">Live Infrastructure Link</span>
                    </div>
                    <h1 className="text-6xl font-black text-beeyield-charcoal tracking-tighter leading-none">
                        Ecosystem <span className="text-beeyield-forest">Intelligence.</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-6 text-xl max-w-2xl leading-relaxed">
                        Secure telemetry analysis and sovereign harvest synchronization for your global apiary network.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden lg:block mr-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Update</p>
                        <p className="text-sm font-bold text-beeyield-charcoal uppercase tracking-tighter flex items-center gap-2">
                            <Clock className="w-4 h-4 text-beeyield-forest" /> Just Now
                        </p>
                    </div>
                    <Button
                        onClick={loadDashboardData}
                        variant="ghost"
                        className="h-16 px-10 rounded-[2rem] border-2 border-beeyield-sand bg-white hover:bg-beeyield-forest hover:text-white hover:border-beeyield-forest shadow-sm transition-all duration-500 font-black text-[12px] uppercase tracking-widest flex items-center gap-4"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Push Cycle Sync
                    </Button>
                </div>
            </div>

            {/* Tactical Metrics Deck */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <MetricCard
                    title="Active Clusters"
                    value={stats?.total_apiaries || 0}
                    change={12}
                    trend="up"
                    icon={MapPin}
                    color="blue"
                    subtitle="Regional Topology"
                />
                <MetricCard
                    title="Auth Hives"
                    value={stats?.total_hives || 0}
                    change={8}
                    trend="up"
                    icon={Hexagon}
                    color="amber"
                    subtitle={`${stats?.active_hives || 0} Telemetry Live`}
                />
                <MetricCard
                    title="Seeded Yield"
                    value={`${stats?.total_honey_kg || 0} kg`}
                    change={15}
                    trend="up"
                    icon={Package}
                    color="green"
                    subtitle="Certified Harvest"
                />
                <MetricCard
                    title="Active Ops"
                    value={stats?.pending_tasks || 0}
                    icon={Terminal}
                    color="purple"
                    subtitle="Actionable Deck"
                />
            </div>

            {/* Primary Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Telemetry Spectrum Chart */}
                <Card className="lg:col-span-8 border-[#E0E0E0] bg-white rounded-[4rem] shadow-sm overflow-hidden group">
                    <CardHeader className="p-12 pb-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <CardTitle className="text-3xl font-black text-beeyield-charcoal tracking-tighter flex items-center gap-4">
                                    <Waves className="w-8 h-8 text-beeyield-forest" />
                                    Telemetry Spectrum
                                </CardTitle>
                                <p className="text-[12px] text-gray-400 font-bold uppercase tracking-[0.2em]">Dynamic Biological Performance Log</p>
                            </div>
                            <div className="flex gap-3">
                                <Badge className="bg-beeyield-sand text-beeyield-forest border-none px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">7 Day Interval</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-12 pt-4">
                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sensorData}>
                                    <CartesianGrid vertical={false} strokeDasharray="0" stroke="#F0F0F0" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9ca3af"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 900, fill: '#9ca3af' }}
                                        dy={20}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 900, fill: '#9ca3af' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(27, 67, 50, 0.03)', radius: 24 }}
                                        contentStyle={{
                                            borderRadius: '32px',
                                            border: 'none',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                                            padding: '24px',
                                            backgroundColor: '#1E1E1E',
                                            color: '#fff'
                                        }}
                                        itemStyle={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                                    />
                                    <Bar dataKey="activity" fill="#1B4332" radius={[16, 16, 0, 0]} barSize={32} />
                                    <Bar dataKey="temperature" fill="#B7E4C7" radius={[16, 16, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Health Integrity Gauge */}
                <Card className="lg:col-span-4 border-[#E0E0E0] bg-white rounded-[4rem] shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="p-12 pb-4">
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-black text-beeyield-charcoal tracking-tighter flex items-center gap-4">
                                <ShieldCheck className="w-7 h-7 text-beeyield-forest" />
                                Registry Health
                            </CardTitle>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">Verified Consensus</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-12 pt-6 flex-1 flex flex-col justify-between">
                        <div className="h-[240px] relative">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <p className="text-4xl font-black text-beeyield-charcoal tracking-tighter">98<span className="text-beeyield-forest">.4</span>%</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Uptime</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={hiveHealthData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={105}
                                        paddingAngle={12}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {hiveHealthData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-5 mt-10">
                            {hiveHealthData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-3xl bg-beeyield-sand/10 border border-beeyield-sand/20 hover:border-beeyield-forest/20 transition-all cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                                        <span className="text-gray-500 font-black uppercase text-[10px] tracking-[0.2em]">{item.name} Protocol</span>
                                    </div>
                                    <span className="font-black text-beeyield-charcoal text-lg tracking-tighter">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Analysis Deck */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Atmospheric Persistence */}
                <Card className="border-[#E0E0E0] bg-white rounded-[4rem] shadow-sm overflow-hidden">
                    <CardHeader className="p-12 pb-4 border-b border-[#F9F7F2]">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <CardTitle className="text-2xl font-black text-beeyield-charcoal tracking-tighter flex items-center gap-4">
                                    <Thermometer className="w-7 h-7 text-beeyield-forest" />
                                    Persistence Log
                                </CardTitle>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">Isobaric & Thermal Stability</p>
                            </div>
                            <Button variant="ghost" className="h-10 px-6 rounded-full text-[10px] font-black text-beeyield-forest uppercase tracking-[0.2em] hover:bg-beeyield-forest/5 border border-beeyield-forest/10">Full Archive</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-12 bg-gradient-to-b from-[#F9F7F2]/30 to-white">
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ReLineChart data={sensorData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F0F0F0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '24px',
                                            border: 'none',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                                            padding: '20px',
                                            backgroundColor: '#fff',
                                            color: '#1B4332'
                                        }}
                                    />
                                    <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                    <Line type="monotone" dataKey="temperature" stroke="#1B4332" strokeWidth={5} dot={{ r: 0 }} activeDot={{ r: 8, strokeWidth: 0, fill: '#1B4332' }} name="Thermal Index" />
                                    <Line type="monotone" dataKey="humidity" stroke="#38A3A5" strokeWidth={5} dot={{ r: 0 }} activeDot={{ r: 8, strokeWidth: 0, fill: '#38A3A5' }} name="Bioload Index" />
                                </ReLineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Registry Stream */}
                <Card className="border-[#E0E0E0] bg-white rounded-[4rem] shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="p-12 pb-4 border-b border-[#F9F7F2]">
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-black text-beeyield-charcoal tracking-tighter flex items-center gap-4">
                                <Activity className="w-7 h-7 text-beeyield-forest" />
                                Audit Stream
                            </CardTitle>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">Verified Event Propagation</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-12 space-y-8 flex-1">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start gap-8 group cursor-pointer transition-all hover:bg-beeyield-sand/10 p-4 -ml-4 -mr-4 rounded-[2.5rem] border border-transparent hover:border-beeyield-sand">
                                <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all shadow-sm border shrink-0", activity.color)}>
                                    <activity.icon className="w-7 h-7 stroke-[1.5]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-lg font-black text-beeyield-charcoal truncate tracking-tight">{activity.title}</p>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">{activity.time}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.1em]">Signature: Verified v4.2</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-6 h-6 text-beeyield-forest opacity-0 group-hover:opacity-100 transition-all self-center -translate-x-4 group-hover:translate-x-0" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Sovereign Command Center CTA */}
            <div className="bg-beeyield-charcoal rounded-[4rem] p-20 text-white overflow-hidden relative group shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-beeyield-forest/10 rounded-full blur-[120px] -mr-64 -mt-64 transition-transform duration-1000 group-hover:scale-125" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-20">
                    <div className="max-w-2xl text-center lg:text-left space-y-10">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10">
                            <Cpu className="w-4 h-4 text-beeyield-forest" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Master Protocol Access</span>
                        </div>
                        <h3 className="text-6xl font-black tracking-tighter leading-none">Command <br /><span className="text-beeyield-forest">The Hive.</span></h3>
                        <p className="text-white/40 font-medium text-2xl leading-relaxed max-w-xl">
                            Deploy regional clusters, audit secure datasets, and orchestrate precision bio-intelligence from a single sovereign terminal.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-8 w-full lg:w-auto">
                        {[
                            { icon: Target, label: 'Protocols', tab: 'inspections', action: 'open_add_new', color: 'hover:border-blue-500' },
                            { icon: Package, label: 'Payloads', tab: 'harvests', action: 'open_add_new', color: 'hover:border-emerald-500' },
                            { icon: MapPin, label: 'Topology', tab: 'places', color: 'hover:border-amber-500' },
                            { icon: BarChart3, label: 'Analytics', tab: 'reports-exports', color: 'hover:border-purple-500' }
                        ].map((action, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ y: -10, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onTabChange?.(action.tab, undefined, action.action)}
                                className={cn(
                                    "bg-white/5 backdrop-blur-2xl rounded-[3rem] p-12 flex flex-col items-center gap-6 border border-white/10 transition-all duration-500 min-w-[200px] group/btn",
                                    "hover:bg-white hover:text-beeyield-charcoal hover:shadow-2xl hover:shadow-beeyield-forest/20"
                                )}
                            >
                                <action.icon className="w-10 h-10 stroke-[1.5] group-hover/btn:scale-110 transition-transform" />
                                <span className="text-[12px] font-black uppercase tracking-[0.3em]">{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHomeView;
