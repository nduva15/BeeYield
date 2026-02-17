import React, { useMemo } from 'react';
import {
    Activity,
    Thermometer,
    Droplets,
    Wind,
    TrendingUp,
    TrendingDown,
    Calendar as CalendarIcon,
    Hexagon,
    MapPin,
    Sun
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHivesWithTelemetry } from '@/hooks/useHives';
import { Apiary } from '@/services/beeyieldService';
import { motion } from 'framer-motion';
import { StatCard, SectionHeader } from './SharedPageComponents';
import { cn } from '@/lib/utils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface OrchardDashboardViewProps {
    apiary?: Apiary;
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const OrchardDashboardView: React.FC<OrchardDashboardViewProps> = ({ apiary, onTabChange }) => {
    // If no apiary is passed, we might be in a "global" context or error state, 
    // but for now we assume it's used in the context of a selected apiary.
    // If we wanted global orchard dashboard, we'd aggregate all. 
    // But let's handle the single apiary case primarily as per usage in MyPlacesView.

    const { hives, isLoading } = useHivesWithTelemetry(apiary?.id);

    // Calculate statistics
    const stats = useMemo(() => {
        if (!hives.length) return null;

        const totalHives = hives.length;
        const activeHives = hives.filter(h => h.status === 'ACTIVE').length;

        // Calculate average hive strength/health
        const avgStrength = hives.reduce((acc, h) => {
            // Simplified strength metric
            let score = 0;
            if (h.status === 'ACTIVE') score += 50;
            if ((h.latest_weight || 0) > 20) score += 30; // Good weight
            if ((h.latest_temp || 0) > 32 && (h.latest_temp || 0) < 36) score += 20; // Optimal temp
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

    // Mock Chart Data for visuals (replace with real historical data if available)
    const activityData = [
        { time: '06:00', activity: 20 },
        { time: '09:00', activity: 65 },
        { time: '12:00', activity: 95 },
        { time: '15:00', activity: 85 },
        { time: '18:00', activity: 40 },
        { time: '21:00', activity: 10 },
    ];

    const distributionData = [
        { range: 'Strong', count: hives.filter(h => h.status === 'ACTIVE').length },
        { range: 'Weak', count: hives.filter(h => h.status !== 'ACTIVE').length },
        { range: 'Crit', count: 0 }, // Placeholder
    ];

    if (!apiary) {
        return <div className="p-8 text-center text-gray-500">Please select an apiary to view its dashboard.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Intro / Location Context */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        {apiary.location_name || "Orchard Location"}
                    </h2>
                    <p className="text-sm text-gray-500">Data for today, {new Date().toLocaleDateString()}</p>
                </div>
                <Badge variant="outline" className="gap-1">
                    <Sun className="w-3 h-3 text-amber-500" />
                    Optimal Conditions
                </Badge>
            </div>

            {/* Key Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Hives"
                    value={stats?.totalHives || 0}
                    icon={Hexagon}
                    color="blue"
                />
                <StatCard
                    label="Active Colonies"
                    value={stats?.activeHives || 0}
                    icon={Activity}
                    color="green"
                    trend="up"
                    subtitle="+2 this week"
                />
                <StatCard
                    label="Avg Strength"
                    value={`${stats?.avgStrength || 0}%`}
                    icon={TrendingUp}
                    color="amber"
                />
                <StatCard
                    label="Avg Weight"
                    value={`${stats?.avgWeight || 0} kg`}
                    icon={TrendingDown} // Just an icon
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Activity Chart */}
                <Card className="lg:col-span-2 shadow-sm border-gray-100 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase text-gray-500">Foraging Activity (Today)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="activity" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorActivity)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Weather / Conditions Widget */}
                <Card className="shadow-sm border-gray-100 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase text-gray-500">Conditions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-6">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    className="text-gray-100 dark:text-gray-800"
                                    strokeWidth="10"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="58"
                                    cx="64"
                                    cy="64"
                                />
                                <circle
                                    className="text-amber-500"
                                    strokeWidth="10"
                                    strokeDasharray={360}
                                    strokeDashoffset={360 - (360 * 0.75)} // 75%
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="58"
                                    cx="64"
                                    cy="64"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">24°</span>
                                <span className="text-xs text-gray-500">Sunny</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <Wind className="w-4 h-4 text-blue-500 mb-1" />
                                <span className="text-sm font-bold">12 km/h</span>
                                <span className="text-[10px] text-gray-400 uppercase">Wind</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <Droplets className="w-4 h-4 text-cyan-500 mb-1" />
                                <span className="text-sm font-bold">45%</span>
                                <span className="text-[10px] text-gray-400 uppercase">Humidity</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                    onClick={() => onTabChange && onTabChange('inspections', 'Filtering by apiary...', 'filter')}
                    className="h-auto py-4 flex items-center justify-start gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                    variant="ghost"
                >
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                        <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Schedule Inspection</h4>
                        <p className="text-sm text-gray-500">Check colony health for this apiary</p>
                    </div>
                </Button>

                <Button
                    onClick={() => onTabChange && onTabChange('harvests')}
                    className="h-auto py-4 flex items-center justify-start gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                    variant="ghost"
                >
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                        <Hexagon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Log Harvest</h4>
                        <p className="text-sm text-gray-500">Record honey production for this location</p>
                    </div>
                </Button>
            </div>
        </div>
    );
};

export default OrchardDashboardView;
