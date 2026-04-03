import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Thermometer, Weight, Droplets, CloudRain,
    AlertTriangle, ShieldAlert, Bug, Activity,
    Calendar, Info
} from 'lucide-react';
import { format } from 'date-fns';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

type StatCardProps = {
    title: string;
    value: string;
    unit: string;
    icon: any;
    color: string;
    trend: string;
};

const StatCard = ({ title, value, unit, icon: Icon, color, trend }: StatCardProps) => (
    <Card className="bg-[#F9F7F2] border-[#F4D03F]/20 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon size={64} className={color} />
        </div>
        <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">{title}</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-baseline gap-1">
                {value}<span className="text-sm font-normal text-muted-foreground">{unit}</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[#1B9157] text-[#1B9157] border-none px-1 py-0 h-5 text-[10px]">
                    {trend}
                </Badge>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">vs last period</span>
            </div>
        </CardContent>
    </Card>
);

export default function MeasurementData() {
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedHive, setSelectedHive] = useState('184-hives');

    // --- Queries ---

    const { data: hiveMetrics, isLoading: isLoadingMetrics } = useQuery({
        queryKey: ['hive_metrics', selectedHive, timeRange],
        queryFn: async () => {
            // In production, this calls our new FastAPI endpoint
            // For now, we'll try the direct Supabase fetch for fallback
            const { data: { user } } = await supabase!.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
            const startTime = new Date();
            startTime.setDate(startTime.getDate() - days);

            const { data, error } = await supabase!
                .from('sensor_readings')
                .select('*')
                // .eq('hive_id', selectedHive) // Only if it's a real UUID
                .gte('recorded_at', startTime.toISOString())
                .order('recorded_at', { ascending: true });

            if (error) throw error;
            return data;
        },
    });

    const { data: diseaseEvents } = useQuery({
        queryKey: ['disease_detections'],
        queryFn: async () => {
            const { data, error } = await supabase!
                .from('disease_detections')
                .select('*')
                .order('detected_at', { ascending: false })
                .limit(5);
            if (error) throw error;
            return data;
        },
    });

    return (
        <BeeYieldPageShell className="container mx-auto my-0 p-6 space-y-8 min-h-screen bg-transparent">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-tr from-amber-200 via-amber-500 to-orange-600 bg-clip-text text-transparent tracking-tighter">
                        MEASUREMENT DATA
                    </h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#F4D03F]" />
                        Real-time biological & environmental telemetry
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={selectedHive} onValueChange={setSelectedHive}>
                        <SelectTrigger className="w-[180px] bg-[#F9F7F2] border-[#F4D03F]/20">
                            <SelectValue placeholder="Select Hive" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="184-hives">Hive 184 (Main)</SelectItem>
                            <SelectItem value="202-hives">Hive 202 (North)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Tabs value={timeRange} onValueChange={setTimeRange} className="bg-[#F9F7F2] p-1 rounded-lg border border-[#F4D03F]/20">
                        <TabsList className="bg-transparent border-none">
                            <TabsTrigger value="24h" className="data-[state=active]:bg-[#F4D03F] data-[state=active]:text-[#1A1A1A]">24h</TabsTrigger>
                            <TabsTrigger value="7d" className="data-[state=active]:bg-[#F4D03F] data-[state=active]:text-[#1A1A1A]">7d</TabsTrigger>
                            <TabsTrigger value="30d" className="data-[state=active]:bg-[#F4D03F] data-[state=active]:text-[#1A1A1A]">30d</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Brood Temp" value="34.8" unit="°C" icon={Thermometer} color="text-orange-500" trend="+0.2°" />
                <StatCard title="Hive Weight" value="42.5" unit="kg" icon={Weight} color="text-[#F4D03F]" trend="+1.2kg" />
                <StatCard title="Humidity" value="62" unit="%" icon={Droplets} color="text-blue-500" trend="-2%" />
                <StatCard title="Rain Probability" value="15" unit="%" icon={CloudRain} color="text-slate-500" trend="Stable" />
            </div>

            <Tabs defaultValue="charts" className="space-y-6">
                <TabsList className="bg-[#F9F7F2] border border-[#F4D03F]/20">
                    <TabsTrigger value="charts">Analytics</TabsTrigger>
                    <TabsTrigger value="detections">Bio-Detections</TabsTrigger>
                </TabsList>

                <TabsContent value="charts" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Temperature Chart */}
                        <Card className="bg-[#F9F7F2] border-[#F4D03F]/20">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Internal Hive Temperature</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]" style={{ minWidth: 0, minHeight: 240 }}>
                                <ResponsiveContainer width="100%" height="100%" minWidth={120} minHeight={200}>
                                    <AreaChart data={hiveMetrics}>
                                        <defs>
                                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis
                                            dataKey="recorded_at"
                                            tickFormatter={(val) => format(new Date(val), 'MMM d')}
                                            stroke="#ffffff40"
                                            fontSize={10}
                                        />
                                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#ffffff40" fontSize={10} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }}
                                            labelFormatter={(val) => format(new Date(val), 'PPP p')}
                                        />
                                        <Area type="monotone" dataKey="temperature" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Weight Change Chart */}
                        <Card className="bg-[#F9F7F2] border-[#F4D03F]/20">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Hive Weight Gain/Loss</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]" style={{ minWidth: 0, minHeight: 240 }}>
                                <ResponsiveContainer width="100%" height="100%" minWidth={120} minHeight={200}>
                                    <LineChart data={hiveMetrics}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis
                                            dataKey="recorded_at"
                                            tickFormatter={(val) => format(new Date(val), 'MMM d')}
                                            stroke="#ffffff40"
                                            fontSize={10}
                                        />
                                        <YAxis stroke="#ffffff40" fontSize={10} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }}
                                            labelFormatter={(val) => format(new Date(val), 'PPP p')}
                                        />
                                        <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Humidity Distribution */}
                        <Card className="bg-[#F9F7F2] border-[#F4D03F]/20 lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Humidity Levels</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[250px]" style={{ minWidth: 0, minHeight: 200 }}>
                                <ResponsiveContainer width="100%" height="100%" minWidth={120} minHeight={180}>
                                    <BarChart data={hiveMetrics}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis
                                            dataKey="recorded_at"
                                            tickFormatter={(val) => format(new Date(val), 'HH:mm')}
                                            stroke="#ffffff40"
                                            fontSize={10}
                                        />
                                        <YAxis stroke="#ffffff40" fontSize={10} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }}
                                        />
                                        <Bar dataKey="humidity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* System Health Status */}
                        <Card className="bg-[#F9F7F2] border-[#F4D03F]/20">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Sensor Health</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Battery Level</span>
                                        <span className="text-[#1B9157] font-bold">84%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[#F9F7F2] rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[84%]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Signal Strength (LoRa)</span>
                                        <span className="text-[#F4D03F] font-bold">-82 dBm</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[#F9F7F2] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#F4D03F] w-[65%]" />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-[#F4D03F]/10">
                                    <div className="flex items-center gap-2 text-xs text-[#1B9157]">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Telemetric uplink stable
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Last sync: {format(new Date(), 'pp')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="detections">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {!diseaseEvents || diseaseEvents.length === 0 ? (
                                <div className="bg-[#F9F7F2] border border-[#F4D03F]/20 rounded-2xl p-12 text-center">
                                    <ShieldAlert className="w-12 h-12 text-[#1B9157]/50 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold">All Clear</h3>
                                    <p className="text-muted-foreground">No detections triggered in the last 7 days.</p>
                                </div>
                            ) : (
                                diseaseEvents.map((event: any) => (
                                    <Card key={event.id} className="bg-[#F9F7F2] border-[#F4D03F]/20 hover:bg-[#F4D03F]/10 transition-colors">
                                        <div className="p-4 flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[#1A1A1A] uppercase tracking-tight">{event.threat_type}</span>
                                                    <Badge className={event.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}>
                                                        {event.severity}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{event.hive_id} • {new Date(event.detected_at).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-mono text-muted-foreground">Confidence</span>
                                                <div className="font-bold text-[#F4D03F]">{(event.confidence * 100).toFixed(0)}%</div>
                                            </div>
                                            <div className="w-16 h-12 bg-[#FFF9F0] rounded border border-[#F4D03F]/20 bg-cover bg-center" style={{ backgroundImage: `url(${event.image_evidence_url})` }} />
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>

                        <Card className="bg-red-500/5 border-red-500/20">
                            <CardHeader>
                                <CardTitle className="text-red-500 text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Threat Landscape
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Varroa Mites</span>
                                        <span className="text-[#1B9157]">Low Risk</span>
                                    </div>
                                    <div className="w-full h-1 bg-[#F4D03F]/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[15%]" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Nosema Ceranae</span>
                                        <span className="text-[#F4D03F]">Moderate</span>
                                    </div>
                                    <div className="w-full h-1 bg-[#F4D03F]/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#F4D03F] w-[45%]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </BeeYieldPageShell>
    );
}
