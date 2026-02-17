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

interface DashboardHomeViewProps {
    onTabChange?: (tab: string) => void;
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
        if (trend === 'up') return 'text-green-600 dark:text-green-400';
        if (trend === 'down') return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    return (
        <Card className="border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#0a0a0a] hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
                            {change !== undefined && (
                                <div className={cn("flex items-center gap-1 text-xs font-semibold", getTrendColor())}>
                                    {getTrendIcon()}
                                    <span>{Math.abs(change)}%</span>
                                </div>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
                        )}
                    </div>
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        color === 'primary' && "bg-primary/10 text-primary",
                        color === 'green' && "bg-green-500/10 text-green-600 dark:text-green-400",
                        color === 'blue' && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                        color === 'amber' && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        color === 'purple' && "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    )}>
                        <Icon className="w-6 h-6" />
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
    const [pollinationData, setPollinationData] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load all dashboard data in parallel
            const [statsData, readings, apiaries, hives] = await Promise.all([
                beeyieldService.getStats(),
                beeyieldService.getSensorReadings(undefined, 168), // Last 7 days
                beeyieldService.getApiaries(),
                beeyieldService.getHives()
            ]);

            setStats(statsData);

            // Process sensor data for charts
            const processedData = processSensorDataForCharts(readings);
            setSensorData(processedData);

            // Generate recent activity from various sources
            const activity = generateRecentActivity(apiaries, hives, readings);
            setRecentActivity(activity);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const processSensorDataForCharts = (readings: any[]) => {
        // Group readings by date and calculate averages
        const groupedByDate: { [key: string]: any } = {};

        readings.forEach(reading => {
            const date = new Date(reading.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!groupedByDate[date]) {
                groupedByDate[date] = {
                    date,
                    temperature: [],
                    humidity: [],
                    weight: [],
                    activity: []
                };
            }

            const r = reading.readings || {};
            if (r.temperature) groupedByDate[date].temperature.push(r.temperature);
            if (r.humidity) groupedByDate[date].humidity.push(r.humidity);
            if (r.hive_weight) groupedByDate[date].weight.push(r.hive_weight);
            if (r.bee_activity) groupedByDate[date].activity.push(r.bee_activity);
        });

        // Calculate averages
        return Object.values(groupedByDate).map(day => ({
            date: day.date,
            temperature: day.temperature.length > 0 ? Math.round(day.temperature.reduce((a: number, b: number) => a + b, 0) / day.temperature.length) : 0,
            humidity: day.humidity.length > 0 ? Math.round(day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length) : 0,
            weight: day.weight.length > 0 ? Math.round(day.weight.reduce((a: number, b: number) => a + b, 0) / day.weight.length) : 0,
            activity: day.activity.length > 0 ? Math.round(day.activity.reduce((a: number, b: number) => a + b, 0) / day.activity.length) : 0
        })).slice(-7); // Last 7 days
    };

    const generateRecentActivity = (apiaries: any[], hives: any[], readings: any[]) => {
        const activities = [];

        // Recent apiaries
        apiaries.slice(0, 2).forEach(apiary => {
            activities.push({
                type: 'apiary',
                title: `New apiary: ${apiary.name}`,
                time: new Date(apiary.created_at).toLocaleDateString(),
                icon: MapPin,
                color: 'text-blue-600'
            });
        });

        // Recent hives
        hives.slice(0, 2).forEach(hive => {
            activities.push({
                type: 'hive',
                title: `Hive ${hive.hive_code} added`,
                time: new Date(hive.created_at).toLocaleDateString(),
                icon: Hexagon,
                color: 'text-amber-600'
            });
        });

        // Recent readings
        if (readings.length > 0) {
            activities.push({
                type: 'reading',
                title: 'Latest sensor data received',
                time: new Date(readings[0].timestamp).toLocaleTimeString(),
                icon: Activity,
                color: 'text-green-600'
            });
        }

        return activities.slice(0, 5);
    };

    // Prepare data for bee activity chart
    const beeActivityData = sensorData.map(d => ({
        date: d.date,
        activity: d.activity,
        temperature: d.temperature
    }));

    // Prepare data for environmental conditions
    const environmentalData = sensorData.map(d => ({
        date: d.date,
        temperature: d.temperature,
        humidity: d.humidity
    }));

    // Prepare data for hive health distribution
    const hiveHealthData = [
        { name: 'Healthy', value: stats?.active_hives || 0, color: '#22c55e' },
        { name: 'Warning', value: Math.floor((stats?.total_hives || 0) * 0.15), color: '#f59e0b' },
        { name: 'Critical', value: Math.floor((stats?.total_hives || 0) * 0.05), color: '#ef4444' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary" />
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Welcome back! Here's what's happening with your hives.
                    </p>
                </div>
                <Button onClick={loadDashboardData} variant="outline" size="sm">
                    <Activity className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Apiaries"
                    value={stats?.total_apiaries || 0}
                    change={12}
                    trend="up"
                    icon={MapPin}
                    color="blue"
                    subtitle="Active locations"
                />
                <MetricCard
                    title="Total Hives"
                    value={stats?.total_hives || 0}
                    change={8}
                    trend="up"
                    icon={Hexagon}
                    color="amber"
                    subtitle={`${stats?.active_hives || 0} active`}
                />
                <MetricCard
                    title="Honey Harvested"
                    value={`${stats?.total_honey_kg || 0} kg`}
                    change={15}
                    trend="up"
                    icon={Package}
                    color="green"
                    subtitle="This season"
                />
                <MetricCard
                    title="Pending Tasks"
                    value={stats?.pending_tasks || 0}
                    icon={Clock}
                    color="purple"
                    subtitle={`${stats?.total_tasks || 0} total tasks`}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bee Activity Chart */}
                <Card className="lg:col-span-2 border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#0a0a0a]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Bee Flight Time & Activity
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aggregate activity levels over the past week</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300} minWidth={0}>
                            <AreaChart data={beeActivityData}>
                                <defs>
                                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" className="dark:stroke-[#2a2a2a]" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9ca3af"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="activity"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    fill="url(#activityGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Hive Health Distribution */}
                <Card className="border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#0a0a0a]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-primary" />
                            Hive Health
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current status distribution</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200} minWidth={0}>
                            <RePieChart>
                                <Pie
                                    data={hiveHealthData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {hiveHealthData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {hiveHealthData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Environmental Conditions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Environmental Conditions */}
                <Card className="border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#0a0a0a]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Thermometer className="w-5 h-5 text-primary" />
                            Environmental Conditions
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Temperature & humidity trends</p>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250} minWidth={0}>
                            <ReLineChart data={environmentalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" className="dark:stroke-[#2a2a2a]" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9ca3af"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    name="Temperature (°C)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="humidity"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="Humidity (%)"
                                />
                            </ReLineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#0a0a0a]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Recent Activity
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Latest updates from your apiaries</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-[#2a2a2a] last:border-0 last:pb-0">
                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-[#1a1a1a]", activity.color)}>
                                        <activity.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-[#e5e5e5] dark:border-[#2a2a2a] bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button
                            variant="outline"
                            className="h-auto flex-col gap-2 py-4"
                            onClick={() => onTabChange?.('inspections', undefined, 'open_add_new')}
                        >
                            <Target className="w-5 h-5" />
                            <span className="text-sm">New Inspection</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto flex-col gap-2 py-4"
                            onClick={() => onTabChange?.('harvests', undefined, 'open_add_new')}
                        >
                            <Package className="w-5 h-5" />
                            <span className="text-sm">Log Harvest</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto flex-col gap-2 py-4"
                            onClick={() => onTabChange?.('places')}
                        >
                            <MapPin className="w-5 h-5" />
                            <span className="text-sm">Add Apiary</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto flex-col gap-2 py-4"
                            onClick={() => onTabChange?.('reports-exports')}
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span className="text-sm">View Reports</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardHomeView;
