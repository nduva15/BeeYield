import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Activity, MapPin, Droplet, Thermometer, Gauge, Zap, Calendar,
    ArrowRight, BarChart3, Package, AlertCircle, Clock, Check,
    Terminal, LayoutDashboard, Database, Shield, RefreshCw, Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { beeyieldService } from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import StatCard from './StatCard';

interface DashboardHomeViewProps {
    onTabChange?: (tab: string, item1?: any, item2?: any) => void;
}

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
            console.error('Data error:', error);
            toast.error('Failed to load system data');
        } finally {
            setLoading(false);
        }
    };

    const processSensorDataForCharts = (readings: any[]) => {
        const groupedByDate: { [key: string]: any } = {};
        readings.forEach(reading => {
            const date = new Date(reading.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!groupedByDate[date]) {
                groupedByDate[date] = { date, activity: [], temp: [] };
            }
            const r = reading.readings || {};
            if (r.bee_activity) groupedByDate[date].activity.push(r.bee_activity);
            if (r.temperature) groupedByDate[date].temp.push(r.temperature);
        });

        return Object.values(groupedByDate).map(day => ({
            date: day.date,
            activity: day.activity.length > 0 ? Math.round(day.activity.reduce((a: any, b: any) => a + b, 0) / day.activity.length) : 0,
            temp: day.temp.length > 0 ? Math.round(day.temp.reduce((a: any, b: any) => a + b, 0) / day.temp.length) : 0
        })).slice(-7);
    };

    const generateRecentActivity = (apiaries: any[], hives: any[], readings: any[]) => {
        const activities = [];
        apiaries.slice(0, 2).forEach(apiary => {
            activities.push({
                type: 'LOG',
                title: `NEW APIARY: ${apiary.name.toUpperCase()}`,
                time: new Date(apiary.created_at).toLocaleDateString(),
                icon: MapPin,
                color: 'bg-white'
            });
        });
        hives.slice(0, 2).forEach(hive => {
            activities.push({
                type: 'LOG',
                title: `NEW HIVE: ${hive.hive_code.toUpperCase()}`,
                time: new Date(hive.created_at).toLocaleDateString(),
                icon: Database,
                color: 'bg-white'
            });
        });
        return activities.slice(0, 5);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="border-4 border-black border-t-emerald-500 w-12 h-12 animate-spin rounded-none"></div>
                <span className="ml-4 font-black uppercase text-xs tracking-widest">Loading system data...</span>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 bg-[#F5F5F5] min-h-screen antialiased">
            {/* Functional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-black pb-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-black tracking-tighter uppercase">
                        System Overview
                    </h1>
                    <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">
                        Network Status: <span className="text-emerald-600">Active</span> // Registry: Verified
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadDashboardData}
                        className="h-12 px-6 border-2 border-black bg-white font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center gap-3"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="TOTAL APIARIES"
                    value={stats?.total_apiaries || 0}
                    icon={MapPin}
                    trend="+2"
                    trendType="positive"
                />
                <StatCard
                    title="ACTIVE HIVES"
                    value={stats?.total_hives || 0}
                    icon={Database}
                    trend="+5"
                    trendType="positive"
                />
                <StatCard
                    title="TOTAL YIELD"
                    value={`${stats?.total_honey_kg || 0} KG`}
                    icon={Package}
                    trend="+12%"
                    trendType="positive"
                />
                <StatCard
                    title="OPEN TASKS"
                    value={stats?.pending_tasks || 0}
                    icon={Terminal}
                    trend="-1"
                    trendType="negative"
                />
            </div>

            {/* Primary Data Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Yield Chart */}
                <Card className="lg:col-span-8 border-2 border-black bg-white rounded-none shadow-none">
                    <CardHeader className="border-b-2 border-black p-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <Activity className="w-6 h-6" />
                                Hive Activity Log
                            </CardTitle>
                            <span className="text-[10px] font-bold text-gray-500 uppercase px-2 py-1 border border-black/10">PERIOD: 7 DAYS</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sensorData}>
                                    <CartesianGrid vertical={false} strokeDasharray="0" stroke="#E0E0E0" strokeWidth={1} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#000"
                                        tick={{ fontSize: 10, fontWeight: 900 }}
                                        axisLine={{ strokeWidth: 2 }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#000"
                                        tick={{ fontSize: 10, fontWeight: 900 }}
                                        axisLine={{ strokeWidth: 2 }}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F5F5F5' }}
                                        contentStyle={{ borderRadius: '0', border: '2px solid black', padding: '12px', fontWeight: '900', fontSize: '10px' }}
                                    />
                                    <Bar dataKey="activity" fill="#10B981" radius={0} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Registry */}
                <Card className="lg:col-span-4 border-2 border-black bg-white rounded-none shadow-none">
                    <CardHeader className="border-b-2 border-black p-6">
                        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                            <Shield className="w-6 h-6" />
                            Health Registry
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-4">
                            {[
                                { label: 'CRITICAL', value: '00', color: 'bg-red-500' },
                                { label: 'WARNING', value: '02', color: 'bg-yellow-500' },
                                { label: 'HEALTHY', value: stats?.active_hives || '00', color: 'bg-emerald-500' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border-2 border-black hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-3 h-3 border border-black", item.color)} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label} NODES</span>
                                    </div>
                                    <span className="text-2xl font-black">{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-3 mt-4 border-2 border-black bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                            Run Diagnostics
                        </button>
                    </CardContent>
                </Card>
            </div>

            {/* Event Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-black bg-white rounded-none shadow-none">
                    <CardHeader className="border-b-2 border-black p-6">
                        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                            <Clock className="w-6 h-6" />
                            System Event Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y-2 divide-black">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 border-2 border-black flex items-center justify-center bg-white">
                                            <activity.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-tight">{activity.title}</p>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase">{activity.type} // {activity.time}</p>
                                        </div>
                                    </div>
                                    <button className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Table */}
                <Card className="border-2 border-black bg-white rounded-none shadow-none">
                    <CardHeader className="border-b-2 border-black p-6">
                        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                            <Filter className="w-6 h-6" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-2 gap-4">
                        {[
                            { label: 'Add Apiary', icon: MapPin },
                            { label: 'Add Hive', icon: Database },
                            { label: 'Export PDF', icon: Package },
                            { label: 'Open Logs', icon: Terminal }
                        ].map((action, i) => (
                            <button key={i} className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-black hover:bg-emerald-500 hover:text-black transition-all bg-white font-black text-[10px] uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                                <action.icon className="w-8 h-8" />
                                {action.label}
                            </button>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardHomeView;
