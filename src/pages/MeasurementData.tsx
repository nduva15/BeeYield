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

    // --- Components ---

    const StatCard = ({ title, value, unit, icon: Icon, color, trend }: any) => (
        <Card className="bg-white/5 border-white/10 overflow-hidden relative group">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
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
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-none px-1 py-0 h-5 text-[10px]">
                        {trend}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">vs last period</span>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="container mx-auto p-6 space-y-8 min-h-screen bg-transparent">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-tr from-amber-200 via-amber-500 to-orange-600 bg-clip-text text-transparent tracking-tighter">
                        MEASUREMENT DATA
                    </h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-500" />
                        Real-time biological & environmental telemetry
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={selectedHive} onValueChange={setSelectedHive}>
                        <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                            <SelectValue placeholder="Select Hive" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0F1115] border-white/10 text-white">
                            <SelectItem value="184-hives">Kibwezi Main Apiary</SelectItem>
                            <SelectItem value="H-001">Hive-001 (Kibwezi)</SelectItem>
                            <SelectItem value="H-002">Hive-002 (Kibwezi)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Tabs value={timeRange} onValueChange={setTimeRange} className="bg-white/5 p-1 rounded-lg border border-white/5">
                        <TabsList className="bg-transparent border-none">
                            <TabsTrigger value="24h" className="data-[state=active]:bg-amber-600">24H</TabsTrigger>
                            <TabsTrigger value="7d" className="data-[state=active]:bg-amber-600">7D</TabsTrigger>
                            <TabsTrigger value="30d" className="data-[state=active]:bg-amber-600">30D</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Top Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Current Weight"
                    value="42.8"
                    unit="kg"
                    icon={Weight}
                    color="text-amber-500"
                    trend="+1.2kg"
                />
                <StatCard
                    title="Brood Temperature"
                    value="34.6"
                    unit="°C"
                    icon={Thermometer}
                    color="text-red-500"
                    trend="Stable"
                />
                <StatCard
                    title="Nest Humidity"
                    value="64"
                    unit="%"
                    icon={Droplets}
                    color="text-blue-500"
                    trend="+2%"
                />
                <StatCard
                    title="Rainfall Accumulation"
                    value="12.5"
                    unit="mm"
                    icon={CloudRain}
                    color="text-emerald-500"
                    trend="Low"
                />
            </div>

            {/* Main Analytics Tabs */}
            <Tabs defaultValue="colony" className="w-full">
                <TabsList className="bg-white/5 border border-white/10 w-full justify-start h-auto p-1 gap-1">
                    <TabsTrigger value="colony" className="data-[state=active]:bg-white/10 py-2">Colony Health</TabsTrigger>
                    <TabsTrigger value="land" className="data-[state=active]:bg-white/10 py-2">Land Context</TabsTrigger>
                    <TabsTrigger value="disease" className="data-[state=active]:bg-white/10 py-2">Disease Radar</TabsTrigger>
                </TabsList>

                {/* --- Colony Health Tab --- */}
                <TabsContent value="colony" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-md border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg">Weight & Temperature Correlation</CardTitle>
                                <CardDescription>Tracking foraging activity vs biological metabolic heat.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={hiveMetrics || []}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis
                                            dataKey="recorded_at"
                                            tickFormatter={(val) => format(new Date(val), 'HH:mm')}
                                            stroke="#ffffff30"
                                            fontSize={12}
                                        />
                                        <YAxis yAxisId="left" stroke="#ffffff30" fontSize={12} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#ffffff30" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ background: '#0F1115', border: '1px solid #ffffff10', borderRadius: '8px' }}
                                            labelFormatter={(val) => format(new Date(val), 'MMM dd, HH:mm')}
                                        />
                                        <Legend verticalAlign="top" height={36} />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="weight_kg"
                                            name="Weight (kg)"
                                            stroke="#f59e0b"
                                            fillOpacity={1}
                                            fill="url(#colorWeight)"
                                            strokeWidth={3}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="temp_internal"
                                            name="Temp (°C)"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="bg-card/50 border-white/10">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <Info className="w-4 h-4 text-amber-500" />
                                        <CardTitle className="text-sm">Health Insight</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-balance leading-relaxed">
                                        The current weight-to-temperature ratio suggests a strong nectar flow.
                                        Internal temp is stable at <span className="text-amber-500 font-bold">34.6°C</span>,
                                        indicating successful brood thermoregulation.
                                    </p>
                                    <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Possible swarm behavior predicted in 3 days.
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/50 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-sm">Humidity Distribution</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[180px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={hiveMetrics?.slice(-12) || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                            <XAxis dataKey="recorded_at" hide />
                                            <Tooltip
                                                contentStyle={{ background: '#0F1115', border: '1px solid #ffffff10' }}
                                            />
                                            <Bar dataKey="humidity_internal" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* --- Land Context Tab --- */}
                <TabsContent value="land" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-card/50 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg">Soil Moisture vs Precipitation</CardTitle>
                                <CardDescription>Key indicator for nectar secretion potential.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={[]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis hide />
                                        <YAxis stroke="#ffffff30" />
                                        <Tooltip />
                                        <Line type="step" dataKey="rainfall" stroke="#3b82f6" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-white/10 flex items-center justify-center p-12 text-center">
                            <div className="space-y-2">
                                <CloudRain className="w-12 h-12 text-muted-foreground mx-auto" />
                                <h3 className="font-medium">Weather Station Sync</h3>
                                <p className="text-sm text-muted-foreground">Kibwezi Station (SN: WS-012) is currently syncing...</p>
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- Disease Radar Tab --- */}
                <TabsContent value="disease" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 space-y-4">
                            {diseaseEvents?.length === 0 ? (
                                <div className="p-12 text-center bg-white/5 rounded-xl border border-dashed border-white/20">
                                    <ShieldAlert className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold">All Clear</h3>
                                    <p className="text-muted-foreground">No AI detections triggered in the last 7 days.</p>
                                </div>
                            ) : (
                                diseaseEvents?.map((event: any) => (
                                    <Card key={event.id} className="bg-card/50 border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                                        <div className="flex items-center p-4 gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                                                <Bug className="text-red-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white uppercase tracking-tight">{event.threat_type}</span>
                                                    <Badge className={event.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}>
                                                        {event.severity}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{event.hive_id} • {new Date(event.detected_at).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-mono text-muted-foreground">Confidence</span>
                                                <div className="font-bold text-amber-500">{(event.confidence * 100).toFixed(0)}%</div>
                                            </div>
                                            <div className="w-16 h-12 bg-black rounded border border-white/10 bg-cover bg-center" style={{ backgroundImage: `url(${event.image_evidence_url})` }} />
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
                                        <span className="text-red-400">Low Risk</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 w-[15%]" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>AFB Spores</span>
                                        <span className="text-green-400">Minimum</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[5%]" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Wasp Activity</span>
                                        <span className="text-yellow-400">Elevated</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500 w-[45%]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
