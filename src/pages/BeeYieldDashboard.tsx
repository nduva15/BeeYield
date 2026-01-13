import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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

const BeeYieldDashboard: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

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
                beeyieldService.getClientHives(user?.id)
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
    }, [user]);

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
                <div className={`w-2 h-2 rounded-full ${isRecent ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <span className="text-xs text-gray-500">
                    {lastPing ? `${Math.floor((Date.now() - lastPing.getTime()) / 60000)}m ago` : 'N/A'}
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-amber-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Hexagon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">BeeYield</h1>
                                <p className="text-xs text-gray-500">IoT Dashboard</p>
                            </div>
                        </div>

                        {/* User Actions */}
                        <div className="flex items-center gap-4">
                            {user ? (
                                <>
                                    <span className="text-sm text-gray-600">
                                        Welcome, <span className="font-medium">{user.email}</span>
                                    </span>
                                    <Button variant="outline" size="sm" onClick={() => signOut()}>
                                        Sign Out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" onClick={() => setShowLoginModal(true)}>
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Login
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                        onClick={() => setShowSignupModal(true)}
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Sign Up
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Quick Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Devices</p>
                                    <p className="text-2xl font-bold">{stats?.totalDevices || 0}</p>
                                </div>
                                <Cpu className="w-8 h-8 text-blue-200" />
                            </div>
                            <p className="text-xs text-blue-100 mt-2">{stats?.activeDevices || 0} active</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm">Temperature</p>
                                    <p className="text-2xl font-bold">{stats?.avgTemperature || '--'}°C</p>
                                </div>
                                <ThermometerSun className="w-8 h-8 text-orange-200" />
                            </div>
                            <p className="text-xs text-orange-100 mt-2">Field avg</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-cyan-100 text-sm">Hive Weight</p>
                                    <p className="text-2xl font-bold">{stats?.avgHiveWeight || '--'} kg</p>
                                </div>
                                <Weight className="w-8 h-8 text-cyan-200" />
                            </div>
                            <p className="text-xs text-cyan-100 mt-2">Avg weight</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Health Score</p>
                                    <p className="text-2xl font-bold">{stats?.healthScore || '--'}%</p>
                                </div>
                                <Shield className="w-8 h-8 text-green-200" />
                            </div>
                            <p className="text-xs text-green-100 mt-2">Colony health</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-white/80 border border-amber-200">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-100">
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="infield" className="data-[state=active]:bg-blue-100">
                                <ThermometerSun className="w-4 h-4 mr-2" />
                                Infield
                            </TabsTrigger>
                            <TabsTrigger value="inland" className="data-[state=active]:bg-cyan-100">
                                <Weight className="w-4 h-4 mr-2" />
                                Inland
                            </TabsTrigger>
                            <TabsTrigger value="disease" className="data-[state=active]:bg-green-100">
                                <Bug className="w-4 h-4 mr-2" />
                                Disease
                            </TabsTrigger>
                            <TabsTrigger value="hives" className="data-[state=active]:bg-orange-100">
                                <Hexagon className="w-4 h-4 mr-2" />
                                My Hives
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            Updated: {lastUpdate.toLocaleTimeString()}
                            <Button variant="ghost" size="sm" onClick={loadDashboardData} disabled={loading}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Infield Sensor Card */}
                            <Card className="overflow-hidden border-blue-200 hover:shadow-lg transition-shadow">
                                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
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
                                                <span className="text-gray-600">Temperature</span>
                                                <span className="text-xl font-bold text-blue-600">
                                                    {(infieldReading.readings as InfieldReadings).temperature.toFixed(1)}°C
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Humidity</span>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={(infieldReading.readings as InfieldReadings).humidity} className="w-20 h-2" />
                                                    <span className="font-medium">{(infieldReading.readings as InfieldReadings).humidity.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Soil Moisture</span>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={(infieldReading.readings as InfieldReadings).soil_moisture} className="w-20 h-2" />
                                                    <span className="font-medium">{(infieldReading.readings as InfieldReadings).soil_moisture.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500">No data available</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Inland Sensor Card */}
                            <Card className="overflow-hidden border-cyan-200 hover:shadow-lg transition-shadow">
                                <CardHeader className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
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
                                                <span className="text-gray-600">Hive Weight</span>
                                                <span className="text-xl font-bold text-cyan-600">
                                                    {(inlandReading.readings as InlandReadings).hive_weight.toFixed(1)} kg
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Internal Temp</span>
                                                <span className="font-medium">
                                                    {(inlandReading.readings as InlandReadings).internal_temp.toFixed(1)}°C
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Bee Activity</span>
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
                                        <div className="text-center py-4 text-gray-500">No data available</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Disease Sensor Card */}
                            <Card className="overflow-hidden border-green-200 hover:shadow-lg transition-shadow">
                                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
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
                                                <span className="text-gray-600">Health Score</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-green-600">
                                                        {(diseaseReading.readings as DiseaseReadings).colony_health_score.toFixed(0)}%
                                                    </span>
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Pest Detection</span>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                                    {(diseaseReading.readings as DiseaseReadings).pest_detection}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Treatment</span>
                                                <Badge variant="outline" className="bg-gray-50">
                                                    {(diseaseReading.readings as DiseaseReadings).treatment_status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-500">No data available</div>
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
                                            className="p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all bg-white"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                                    {device.device_type === 'infield' && <ThermometerSun className="w-5 h-5 text-blue-500" />}
                                                    {device.device_type === 'inland' && <Weight className="w-5 h-5 text-cyan-500" />}
                                                    {device.device_type === 'disease' && <Bug className="w-5 h-5 text-green-500" />}
                                                </div>
                                                <DeviceStatusBadge device={device} />
                                            </div>
                                            <h4 className="font-medium text-gray-900 mb-1">{device.device_name}</h4>
                                            <p className="text-xs text-gray-500 mb-2">{device.device_code}</p>
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
                                        <div key={reading.id} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm text-gray-500">
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
                                        <div key={reading.id} className="flex items-center justify-between p-4 bg-cyan-50/50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm text-gray-500">
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
                                        <div key={reading.id} className="flex items-center justify-between p-4 bg-green-50/50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="text-sm text-gray-500">
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
                                {!user ? (
                                    <div className="text-center py-12">
                                        <Hexagon className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view your hives</h3>
                                        <p className="text-gray-500 mb-4">Create an account or login to manage your pollination contracts</p>
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
                                                className="p-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                                        <Hexagon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            hive.status === 'active' ? 'bg-green-100 text-green-700 border-green-300' :
                                                                hive.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                                                    'bg-gray-100 text-gray-700'
                                                        }
                                                    >
                                                        {hive.status}
                                                    </Badge>
                                                </div>
                                                <h4 className="font-semibold text-gray-900 mb-1">{hive.hive_name}</h4>
                                                <p className="text-sm text-gray-500 mb-2">{hive.hive_code}</p>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Leaf className="w-4 h-4 text-green-500" />
                                                        {hive.crop_type}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <MapPin className="w-4 h-4 text-red-400" />
                                                        {hive.farm_location}
                                                    </div>
                                                </div>
                                                {hive.contract_start && hive.contract_end && (
                                                    <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-gray-500">
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
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
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
                        onSwitchToSignup={() => {
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
        </div>
    );
};

export default BeeYieldDashboard;
