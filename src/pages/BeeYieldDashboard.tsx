import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { beeyieldService, SensorReading, IoTDevice, ClientHive, InfieldReadings, InlandReadings, DiseaseReadings } from '@/services/beeyieldService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
    Activity, Cpu, Droplets, ThermometerSun, Weight, Bug, Leaf,
    MapPin, Battery, Wifi, Clock, RefreshCw, LogIn, UserPlus,
    LayoutDashboard, Settings, FileText, Github, ExternalLink,
    ChevronRight, Hexagon, Shield, AlertTriangle, CheckCircle2
} from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import DashboardLayout from '@/components/beeyield/DashboardLayout';
import MetricCard from '@/components/beeyield/MetricCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BeeYieldDashboard: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    // Role-based access control
    // If user is logged in but not a farmer/admin, treat as guest so they can login as farmer
    const isAuthorized = user && (
        user.user_metadata?.role === 'farmer' ||
        user.user_metadata?.role === 'client' ||
        user.user_metadata?.role === 'admin' ||
        user.user_metadata?.role === 'super_admin'
    );
    const displayUser = isAuthorized ? user : null;

    // Dashboard state
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState<IoTDevice[]>([]);
    const [readings, setReadings] = useState<SensorReading[]>([]);
    const [clientHives, setClientHives] = useState<ClientHive[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    // Fetch dashboard data
    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [devicesData, readingsData, statsData, hivesData] = await Promise.all([
                beeyieldService.getDevices(),
                beeyieldService.getSensorReadings(),
                beeyieldService.getDashboardStats(),
                beeyieldService.getClientHives(displayUser?.id)
            ]);

            setDevices(devicesData);
            setReadings(readingsData);
            setStats(statsData);
            setClientHives(hivesData);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, [displayUser]);

    // Get latest readings by type
    const getLatestReading = (type: 'infield' | 'inland' | 'disease') => {
        return readings.find(r => r.sensor_type === type);
    };

    const infieldReading = getLatestReading('infield');
    const inlandReading = getLatestReading('inland');
    const diseaseReading = getLatestReading('disease');

    // Device status indicator
    const DeviceStatusBadge = ({ device }: { device: IoTDevice }) => {
        const lastPing = device.last_ping ? new Date(device.last_ping) : null;
        const isRecent = lastPing && (Date.now() - lastPing.getTime()) < 15 * 60000;

        return (
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-xl ${isRecent ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <span className="text-xs text-[#71717a]">
                    {lastPing ? `${Math.floor((Date.now() - lastPing.getTime()) / 60000)}m ago` : 'N/A'}
                </span>
            </div>
        );
    };

    return (
    const navItems = [
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'infield', label: 'Infield', icon: ThermometerSun },
            { id: 'inland', label: 'Inland', icon: Weight },
            { id: 'disease', label: 'Disease', icon: Bug },
            { id: 'hives', label: 'My Hives', icon: Hexagon },
        ];

    return (
        <DashboardLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={signOut}
            navItems={navItems}
        >
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">IoT Dashboard</h1>
                        <p className="text-[#a1a1aa] text-sm mt-1">Real-time sensor metrics and hive analytics</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={loadDashboardData} variant="outline" size="sm" className="rounded-xl bg-[#1e1e1e] border-[#1e1e1e] text-white hover:bg-[#27272a]">
                            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Refresh
                        </Button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Quick Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            value={stats?.totalDevices || 0}
                            trend="+12%"
                            description={`${stats?.activeDevices || 0} active devices`}
                            icon={Cpu}
                        />
                        <MetricCard
                            value={`${stats?.avgTemperature || '--'}°C`}
                            trend="-2.4%"
                            description="AVERAGE TEMPERATURE"
                            icon={ThermometerSun}
                        />
                        <MetricCard
                            value={`${stats?.avgHiveWeight || '--'} kg`}
                            trend="+5.1%"
                            description="AVERAGE HIVE WEIGHT"
                            icon={Weight}
                        />
                        <MetricCard
                            value={`${stats?.healthScore || '--'}%`}
                            trend="+0.8%"
                            description="COLONY HEALTH SCORE"
                            icon={Shield}
                        />
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <div className="hidden">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="infield">Infield</TabsTrigger>
                                <TabsTrigger value="inland">Inland</TabsTrigger>
                                <TabsTrigger value="disease">Disease</TabsTrigger>
                                <TabsTrigger value="hives">My Hives</TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Infield Sensor Card */}
                                <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-[#1e1e1e]/30 border-b border-[#1e1e1e]">
                                        <CardTitle className="flex items-center gap-2">
                                            <ThermometerSun className="w-5 h-5" />
                                            Infield Sensors
                                        </CardTitle>
                                        <CardDescription className="text-blue-100">
                                            Field environmental data
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {infieldReading ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[#a1a1aa]">Temperature</span>
                                                    <span className="text-xl font-bold text-blue-600">
                                                        {(infieldReading.readings as InfieldReadings).temperature.toFixed(1)}°C
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[#a1a1aa]">Humidity</span>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={(infieldReading.readings as InfieldReadings).humidity} className="w-20 h-2" />
                                                        <span className="font-medium">{(infieldReading.readings as InfieldReadings).humidity.toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[#a1a1aa]">Soil Moisture</span>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={(infieldReading.readings as InfieldReadings).soil_moisture} className="w-20 h-2" />
                                                        <span className="font-medium">{(infieldReading.readings as InfieldReadings).soil_moisture.toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-[#71717a]">No data available</div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Inland Sensor Card */}
                                <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-[#1e1e1e]/30 border-b border-[#1e1e1e]">
                                        <CardTitle className="flex items-center gap-2">
                                            <Weight className="w-5 h-5" />
                                            Inland Sensors
                                        </CardTitle>
                                        <CardDescription className="text-cyan-100">
                                            Hive monitoring data
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {inlandReading ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[#a1a1aa]">Hive Weight</span>
                                                    <span className="text-xl font-bold text-cyan-600">
                                                        {(inlandReading.readings as InlandReadings).hive_weight.toFixed(1)} kg
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[#a1a1aa]">Internal Temp</span>
                                                    <span className="font-medium">
                                                        {(inlandReading.readings as InlandReadings).internal_temp.toFixed(1)}°C
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[#a1a1aa]">Bee Activity</span>
                                                    <div className="flex items-center gap-2">
                                                        <Progress
                                                            value={(inlandReading.readings as InlandReadings).bee_activity}
                                                            className="w-20 h-2"
                                                        />
                                                        <span className="font-medium">
                                                            {(inlandReading.readings as InlandReadings).bee_activity.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-[#71717a]">No data available</div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Disease Sensor Card */}
                                <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-[#1e1e1e]/30 border-b border-[#1e1e1e]">
                                        <CardTitle className="flex items-center gap-2">
                                            <Bug className="w-5 h-5" />
                                            Disease Monitoring
                                        </CardTitle>
                                        <CardDescription className="text-green-100">
                                            Colony health metrics
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {diseaseReading ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[#a1a1aa]">Health Score</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl font-bold text-green-600">
                                                            {(diseaseReading.readings as DiseaseReadings).colony_health_score.toFixed(0)}%
                                                        </span>
                                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[#a1a1aa]">Pest Detection</span>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                                        {(diseaseReading.readings as DiseaseReadings).pest_detection}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[#a1a1aa]">Treatment</span>
                                                    <Badge variant="outline" className="bg-gray-50">
                                                        {(diseaseReading.readings as DiseaseReadings).treatment_status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-[#71717a]">No data available</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Devices Grid */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Cpu className="w-5 h-5 text-amber-500" />
                                        Connected Devices
                                    </CardTitle>
                                    <CardDescription>Real-time status of IoT sensors</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {devices.map((device) => (
                                            <div
                                                key={device.id}
                                                className="p-4 rounded-xl border bg-[#09090b] border-[#1e1e1e] hover:border-amber-300 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                                        {device.device_type === 'infield' && <ThermometerSun className="w-5 h-5 text-blue-500" />}
                                                        {device.device_type === 'inland' && <Weight className="w-5 h-5 text-cyan-500" />}
                                                        {device.device_type === 'disease' && <Bug className="w-5 h-5 text-green-500" />}
                                                    </div>
                                                    <DeviceStatusBadge device={device} />
                                                </div>
                                                <h4 className="font-medium text-white mb-1">{device.device_name}</h4>
                                                <p className="text-xs text-[#71717a] mb-2">{device.device_code}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <MapPin className="w-3 h-3" />
                                                    {device.location_name || 'Unknown'}
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <Battery className="w-3 h-3 text-green-500" />
                                                        {device.battery_level?.toFixed(0)}%
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Wifi className="w-3 h-3 text-blue-500" />
                                                        {device.firmware_version}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Infield Tab */}
                        <TabsContent value="infield" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ThermometerSun className="w-5 h-5 text-blue-500" />
                                        Infield Sensor Data
                                    </CardTitle>
                                    <CardDescription>
                                        Environmental monitoring: Temperature, Humidity, Soil Moisture
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {readings.filter(r => r.sensor_type === 'infield').slice(0, 10).map((reading, idx) => (
                                            <div key={reading.id} className="bg-[#1e1e1e]/20 p-4 rounded-xl border border-[#1e1e1e] transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-sm text-[#71717a]">
                                                        {new Date(reading.timestamp).toLocaleTimeString()}
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-2">
                                                            <ThermometerSun className="w-4 h-4 text-orange-500" />
                                                            <span className="font-medium">
                                                                {(reading.readings as InfieldReadings).temperature.toFixed(1)}°C
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Droplets className="w-4 h-4 text-blue-500" />
                                                            <span className="font-medium">
                                                                {(reading.readings as InfieldReadings).humidity.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Leaf className="w-4 h-4 text-green-500" />
                                                            <span className="font-medium">
                                                                {(reading.readings as InfieldReadings).soil_moisture.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                                    {reading.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Inland Tab */}
                        <TabsContent value="inland" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Weight className="w-5 h-5 text-cyan-500" />
                                        Inland Sensor Data
                                    </CardTitle>
                                    <CardDescription>
                                        Hive monitoring: Weight, Internal Temperature, Bee Activity
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {readings.filter(r => r.sensor_type === 'inland').slice(0, 10).map((reading, idx) => (
                                            <div key={reading.id} className="bg-[#1e1e1e]/20 p-4 rounded-xl border border-[#1e1e1e] transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-sm text-[#71717a]">
                                                        {new Date(reading.timestamp).toLocaleTimeString()}
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-2">
                                                            <Weight className="w-4 h-4 text-cyan-600" />
                                                            <span className="font-medium">
                                                                {(reading.readings as InlandReadings).hive_weight.toFixed(1)} kg
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <ThermometerSun className="w-4 h-4 text-orange-500" />
                                                            <span className="font-medium">
                                                                {(reading.readings as InlandReadings).internal_temp.toFixed(1)}°C
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Activity className="w-4 h-4 text-green-500" />
                                                            <span className="font-medium">
                                                                {(reading.readings as InlandReadings).bee_activity.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                                    {reading.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Disease Tab */}
                        <TabsContent value="disease" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bug className="w-5 h-5 text-green-500" />
                                        Disease Monitoring Data
                                    </CardTitle>
                                    <CardDescription>
                                        Colony Health: Score, Pest Detection, Treatment Status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {readings.filter(r => r.sensor_type === 'disease').slice(0, 10).map((reading, idx) => (
                                            <div key={reading.id} className="bg-[#1e1e1e]/20 p-4 rounded-xl border border-[#1e1e1e] transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-sm text-[#71717a]">
                                                        {new Date(reading.timestamp).toLocaleTimeString()}
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="w-4 h-4 text-green-600" />
                                                            <span className="font-medium">
                                                                {(reading.readings as DiseaseReadings).colony_health_score.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                (reading.readings as DiseaseReadings).pest_detection === 'none'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                            }
                                                        >
                                                            Pest: {(reading.readings as DiseaseReadings).pest_detection}
                                                        </Badge>
                                                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                                            Treatment: {(reading.readings as DiseaseReadings).treatment_status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* My Hives Tab */}
                        <TabsContent value="hives" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Hexagon className="w-5 h-5 text-amber-500" />
                                        My Pollination Hives
                                    </CardTitle>
                                    <CardDescription>
                                        Your contracted pollination hives and their status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!displayUser ? (
                                        <div className="text-center py-12">
                                            <Hexagon className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-white mb-2">Sign in to view your hives</h3>
                                            <p className="text-[#71717a] mb-4">Create an account or login to manage your pollination contracts</p>
                                            <div className="flex justify-center gap-4">
                                                <Button variant="outline" onClick={() => setShowLoginModal(true)}>
                                                    <LogIn className="w-4 h-4 mr-2" />
                                                    Login
                                                </Button>
                                                <Button
                                                    className="bg-gradient-to-r from-amber-500 to-orange-500"
                                                    onClick={() => setShowSignupModal(true)}
                                                >
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Sign Up
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {clientHives.map((hive) => (
                                                <div
                                                    key={hive.id}
                                                    className="p-4 rounded-xl border border-[#1e1e1e] bg-[#09090b] hover:shadow-md transition-all"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="w-12 h-12 rounded-xl bg-[#1e1e1e]/30 flex items-center justify-center">
                                                            <Hexagon className="w-6 h-6 text-white" />
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                hive.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }
                                                        >
                                                            {hive.status}
                                                        </Badge>
                                                    </div>
                                                    <h4 className="font-semibold text-white mb-1">{hive.hive_name}</h4>
                                                    <p className="text-sm text-[#71717a] mb-2">{hive.hive_code}</p>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex items-center gap-2 text-[#a1a1aa]">
                                                            <Leaf className="w-4 h-4 text-green-500" />
                                                            {hive.crop_type}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[#a1a1aa]">
                                                            <MapPin className="w-4 h-4 text-red-400" />
                                                            {hive.farm_location}
                                                        </div>
                                                    </div>
                                                    {hive.contract_start && hive.contract_end && (
                                                        <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-[#71717a]">
                                                            Contract: {new Date(hive.contract_start).toLocaleDateString()} - {new Date(hive.contract_end).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Footer Links */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#71717a]">
                            <a href="#" className="hover:text-amber-600 flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                Open API
                            </a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 flex items-center gap-1">
                                <Github className="w-4 h-4" />
                                GitHub
                            </a>
                            <a href="/contact" className="hover:text-amber-600 flex items-center gap-1">
                                <ExternalLink className="w-4 h-4" />
                                Partners
                            </a>
                            <span className="text-gray-400">BeeYield IoT v1.0.0</span>
                        </div>
                    </div>
                </div>

                {/* Login Modal */}
                <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                                    <Hexagon className="w-5 h-5 text-white" />
                                </div>
                                Login to BeeYield
                            </DialogTitle>
                            <DialogDescription>
                                Access your pollination dashboard and hive data
                            </DialogDescription>
                        </DialogHeader>
                        <LoginForm
                            onSuccess={() => {
                                setShowLoginModal(false);
                                toast.success('Welcome back!');
                                loadDashboardData();
                            }}
                            onSwitchToRegister={() => {
                                setShowLoginModal(false);
                                setShowSignupModal(true);
                            }}
                        />
                    </DialogContent>
                </Dialog>

                {/* Signup Modal */}
                <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                                    <Hexagon className="w-5 h-5 text-white" />
                                </div>
                                Create Account
                            </DialogTitle>
                            <DialogDescription>
                                Sign up to monitor your pollination hives
                            </DialogDescription>
                        </DialogHeader>
                        <RegisterForm
                            defaultRole="farmer"
                            onSuccess={() => {
                                setShowSignupModal(false);
                                toast.success('Account created! Please check your email to verify.');
                            }}
                            onSwitchToLogin={() => {
                                setShowSignupModal(false);
                                setShowLoginModal(true);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </Tabs>
        </div>
        </DashboardLayout >
    );
};

export default BeeYieldDashboard;
