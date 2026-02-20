import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Calculator,
    ChevronRight,
    MapPin,
    Activity,
    Thermometer,
    Droplets,
    Settings,
    ShieldCheck,
    Cpu,
    Volume2,
    Bot,
    X,
    Target,
    Hexagon,
    Zap,
    TrendingUp,
    AlertTriangle,
    Layers,
    ChevronDown,
    LayoutGrid,
    List,
    AlertCircle,
    FileText,
    Waves,
    Loader2,
    Bug,
    Flower2,
    Radar,
    Wind,
    Navigation2,
    Compass,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { beePollinationData } from '@/data/beePollinationData';
import { cn } from '@/lib/utils';
import { beeyieldService } from '@/services/beeyieldService';
import { toast } from 'sonner';

interface PrecisionPollinationViewProps {
    onTabChange: (tab: string) => void;
}

// --- Individual Hive Data Type ---
interface HiveData {
    id: string;
    name: string;
    location: { lat: number; lng: number };
    x: number;
    y: number;
    status: 'healthy' | 'warning' | 'critical';
    sensors: {
        acoustics: { value: number; trend: 'up' | 'down' | 'stable'; trendValue: string };
        temperature: { value: number; trend: 'up' | 'down' | 'stable'; trendValue: string };
        humidity: { value: number; trend: 'up' | 'down' | 'stable'; trendValue: string };
        flightActivity: { value: number; trend: 'up' | 'down' | 'stable'; trendValue: string };
    };
    framesOfBees: number;
    queenStatus: 'present' | 'absent' | 'unknown';
    lastSync: string;
}

// --- Stat Card: Matching the Premium Tactical Style ---
const StatCard = ({ label, value, icon: Icon, color, trend, trendValue }: {
    label: string, value: number | string, icon: any, color: string, trend?: 'up' | 'down' | 'stable', trendValue?: string
}) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-[#E0E0E0] shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
        <div className={cn("absolute top-0 left-0 w-full h-1", color)} />
        <div className="flex items-center justify-between mb-4">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-50", color.replace('bg-', 'text-'))}>
                <Icon className="w-5 h-5" />
            </div>
            {trend && (
                <Badge className={cn(
                    "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none",
                    trend === 'up' ? "bg-beeyield-forest/10 text-beeyield-forest" : "bg-red-50 text-red-500"
                )}>
                    {trend === 'up' ? 'Increase' : 'Decline'} {trendValue}
                </Badge>
            )}
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-3xl font-black text-beeyield-charcoal mt-1 tracking-tighter">{value}</p>
    </div>
);

// --- IoT Sensor Card: Luxury Integration ---
const SensorCard = ({ label, value, unit, icon: Icon, color, trend, trendValue, onClick }: {
    label: string, value: string, unit: string, icon: any, color: string, trend?: 'up' | 'down' | 'stable', trendValue?: string, onClick?: () => void
}) => (
    <div
        onClick={onClick}
        className={cn(
            "bg-white p-6 rounded-3xl border border-[#E0E0E0] shadow-sm flex items-center justify-between transition-all group",
            onClick && "cursor-pointer hover:shadow-2xl hover:border-beeyield-forest/30"
        )}
    >
        <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 duration-500", color)}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{label}</p>
                <h4 className="text-xl font-black text-beeyield-charcoal">
                    {value}<span className="text-sm ml-1 text-gray-400 font-bold">{unit}</span>
                </h4>
            </div>
        </div>
        {trend && (
            <div className={cn(
                "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                trend === 'up' ? "bg-beeyield-forest/10 text-beeyield-forest" : trend === 'down' ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"
            )}>
                {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '•'} {trendValue}
            </div>
        )}
    </div>
);

// --- Main View ---
const PrecisionPollinationView: React.FC<PrecisionPollinationViewProps> = ({ onTabChange }) => {
    const { t } = useLanguage();

    // Configuration
    const [hiveCount, setHiveCount] = useState<number>(184);
    const [selectedCrop, setSelectedCrop] = useState<string>("Sunflower");
    const [acreage, setAcreage] = useState<number>(5);
    const [avgFrames, setAvgFrames] = useState<number>(8);
    const [isLoading, setIsLoading] = useState(true);
    const [usingRealData, setUsingRealData] = useState(false);

    // Hives State
    const [hives, setHives] = useState<HiveData[]>([]);
    const [selectedHiveId, setSelectedHiveId] = useState<string | 'aggregate'>('aggregate');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isHiveSelectorOpen, setIsHiveSelectorOpen] = useState(false);

    // Activity Logs
    const [activityLogs, setActivityLogs] = useState<{ id: number, time: string, action: string, type: 'info' | 'warning' | 'success', hive: string }[]>([]);

    useEffect(() => {
        const fetchRealData = async () => {
            setIsLoading(true);
            try {
                const [contracts, sensorData, logs] = await Promise.all([
                    beeyieldService.getPollinationContracts(),
                    beeyieldService.getHiveSensorData(),
                    beeyieldService.getPollinationActivityLogs()
                ]);

                if (contracts && contracts.length > 0) {
                    const activeContract = contracts.find(c => c.status === 'active') || contracts[0];
                    if (activeContract) {
                        setSelectedCrop(activeContract.crop_type);
                        setAcreage(activeContract.farm_size_acres);
                        setHiveCount(activeContract.hive_count_required);
                    }
                }

                if (logs && logs.length > 0) {
                    const mappedLogs = logs.map(l => ({
                        id: l.id,
                        time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        action: l.activity_description,
                        type: l.severity as 'info' | 'warning' | 'success',
                        hive: l.hive_id || 'N/A'
                    }));
                    setActivityLogs(mappedLogs);
                }

                if (sensorData && sensorData.length > 0) {
                    setUsingRealData(true);
                    const mappedHives: HiveData[] = sensorData.map((h: any, i: number) => {
                        const row = Math.floor(i / 10);
                        const col = i % 10;
                        return {
                            id: h.hive_code,
                            name: h.hive_code,
                            location: {
                                lat: h.location?.lat || (-1.2921 + (row * 0.0005)),
                                lng: h.location?.lng || (36.8219 + (col * 0.0008))
                            },
                            x: 5 + (col * 9) + Math.random() * 3,
                            y: 10 + (row * 15) + Math.random() * 5,
                            status: h.status.toLowerCase(),
                            sensors: {
                                acoustics: { value: h.sensors.acoustics.value, trend: h.sensors.acoustics.trend, trendValue: h.sensors.acoustics.trendValue },
                                temperature: { value: h.sensors.temperature.value, trend: h.sensors.temperature.trend, trendValue: h.sensors.temperature.trendValue },
                                humidity: { value: h.sensors.humidity.value, trend: h.sensors.humidity.trend, trendValue: h.sensors.humidity.trendValue },
                                flightActivity: { value: h.sensors.flight_activity.value, trend: h.sensors.flight_activity.trend, trendValue: h.sensors.flight_activity.trendValue }
                            },
                            framesOfBees: h.frames_of_bees,
                            queenStatus: h.queen_status as any,
                            lastSync: h.last_sync
                        };
                    });
                    setHives(mappedHives);
                    setHiveCount(mappedHives.length);
                } else {
                    const realHives = await beeyieldService.getHives();
                    if (realHives && realHives.length > 0) {
                        setUsingRealData(true);
                        setHiveCount(realHives.length);
                        const mappedHives: HiveData[] = realHives.map((h, i) => {
                            const row = Math.floor(i / 10);
                            const col = i % 10;
                            const temp = h.latest_temp || 0;
                            const humidity = h.latest_humidity || 0;
                            const status = (temp < 10) ? 'critical' : 'healthy';
                            return {
                                id: h.hive_code,
                                name: h.hive_code,
                                location: {
                                    lat: h.apiary?.latitude || (-1.2921 + (row * 0.0005)),
                                    lng: h.apiary?.longitude || (36.8219 + (col * 0.0008))
                                },
                                x: 5 + (col * 9) + Math.random() * 3,
                                y: 10 + (row * 15) + Math.random() * 5,
                                status: status,
                                sensors: {
                                    acoustics: { value: h.latest_acoustics || 0, trend: 'stable', trendValue: 'Stable' },
                                    temperature: { value: temp, trend: 'stable', trendValue: 'Stable' },
                                    humidity: { value: humidity, trend: 'stable', trendValue: 'Stable' },
                                    flightActivity: { value: h.latest_activity || 0, trend: 'stable', trendValue: 'Stable' }
                                },
                                framesOfBees: h.frame_count || 0,
                                queenStatus: 'present',
                                lastSync: 'N/A'
                            };
                        });
                        setHives(mappedHives);
                    } else {
                        setUsingRealData(false);
                        setHives([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching pollination data:", error);
                setHives([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRealData();
    }, []);

    const selectedHive = selectedHiveId === 'aggregate' ? null : hives.find(h => h.id === selectedHiveId);

    const aggregateSensors = useMemo(() => {
        if (hives.length === 0) return { acoustics: 0, temperature: 0, humidity: 0, flightActivity: 0 };
        const avgAcoustics = Math.round(hives.reduce((sum, h) => sum + h.sensors.acoustics.value, 0) / hives.length);
        const avgTemp = parseFloat((hives.reduce((sum, h) => sum + h.sensors.temperature.value, 0) / hives.length).toFixed(1));
        const avgHumidity = Math.round(hives.reduce((sum, h) => sum + h.sensors.humidity.value, 0) / hives.length);
        const avgVPM = parseFloat((hives.reduce((sum, h) => sum + h.sensors.flightActivity.value, 0) / hives.length).toFixed(1));
        return { acoustics: avgAcoustics, temperature: avgTemp, humidity: avgHumidity, flightActivity: avgVPM };
    }, [hives]);

    useEffect(() => {
        const events = [
            { action: t('pollen_flow'), type: 'success' },
            { action: t('queen_signal'), type: 'info' },
            { action: "Entry rate +15%", type: 'success' },
            { action: t('cold_spot_alert'), type: 'warning' },
            { action: "Acoustic sync complete", type: 'info' }
        ];

        const interval = setInterval(() => {
            if (hives.length === 0) return;
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const event = events[Math.floor(Math.random() * events.length)];
            const hive = hives[Math.floor(Math.random() * hives.length)];
            if (!hive) return;
            setActivityLogs(prev => [
                { id: Date.now(), time: timeStr, action: event.action, type: event.type as any, hive: hive.id },
                ...prev.slice(0, 7)
            ]);
        }, 6000);
        return () => clearInterval(interval);
    }, [hives, t]);

    const results = useMemo(() => {
        const cropData = beePollinationData[selectedCrop] || beePollinationData["Sunflower"];
        const targetFPA = cropData.targetFPA;
        const strengthMultiplier = Math.pow(avgFrames / 8, 1.35);
        const effectiveFOB = avgFrames * strengthMultiplier;
        const weatherPenalty = 0.92;
        const totalFPARequired = targetFPA * acreage;
        const adjustedFOB = effectiveFOB * weatherPenalty;
        const hivesNeeded = Math.ceil(totalFPARequired / adjustedFOB);
        const actualFPA = (hives.length * avgFrames * weatherPenalty) / acreage;
        const coverageHealth = Math.min(100, Math.round((actualFPA / targetFPA) * 100));
        const foragingEfficiency = hives.length > 0 ? Math.min(98, Math.round(75 + (avgFrames - 6) * 3.2)) : 0;
        const healthyHives = hives.filter(h => h.status === 'healthy').length;
        const warningHives = hives.filter(h => h.status === 'warning').length;
        const criticalHives = hives.filter(h => h.status === 'critical').length;

        return {
            targetFPA, hivesNeeded, actualFPA: actualFPA.toFixed(1), coverageHealth, foragingEfficiency,
            totalFPARequired: Math.round(totalFPARequired),
            strengthCategory: avgFrames >= 11 ? 'ELITE' : avgFrames >= 9 ? 'OPTIMAL' : avgFrames >= 7 ? 'STANDARD' : 'MINIMUM',
            forageRange: avgFrames >= 10 ? '1.8 km' : avgFrames >= 8 ? '1.5 km' : '1.2 km',
            healthyHives, warningHives, criticalHives
        };
    }, [selectedCrop, acreage, avgFrames, hives]);

    const getStatusColor = (status: HiveData['status']) => {
        switch (status) {
            case 'healthy': return 'bg-beeyield-forest';
            case 'warning': return 'bg-beeyield-sand';
            case 'critical': return 'bg-red-500 animate-pulse';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-12 pb-32 max-w-[1500px] mx-auto"
        >
            {/* Cinematic Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div>
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-8">
                        <Radar className="w-4 h-4 text-beeyield-forest" />
                        <span className="text-[11px] font-black text-beeyield-forest uppercase tracking-[0.2em]">Geospatial Intelligence Unit</span>
                    </div>
                    <h1 className="text-6xl font-black text-beeyield-charcoal tracking-tighter leading-none">
                        Precision <span className="text-beeyield-forest">Ecosystem.</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-6 text-xl max-w-2xl leading-relaxed">
                        Quantifying the symbiotic interaction between colony kinetics and crop phenology through tactical telemetry.
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 bg-white rounded-[2rem] border-2 border-beeyield-sand p-4 shadow-sm group hover:border-beeyield-forest transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-beeyield-forest/5 flex items-center justify-center text-beeyield-forest">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                            <p className="text-sm font-black text-beeyield-charcoal">Satellite Synced</p>
                        </div>
                    </div>
                    <Badge className="h-14 px-8 rounded-[2rem] bg-beeyield-charcoal text-white font-black text-xs uppercase tracking-[0.2em] border-none shadow-xl">
                        Live Data Matrix
                    </Badge>
                </div>
            </div>

            {/* Tactical Intelligence Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <StatCard label="Target Kinetic" value={results.targetFPA} icon={Target} color="bg-beeyield-sand" trend="up" trendValue="12%" />
                <StatCard label="Active Nodes" value={hives.length} icon={Cpu} color="bg-beeyield-forest" />
                <StatCard label="Integrity Warnings" value={results.warningHives} icon={AlertTriangle} color="bg-beeyield-sand" />
                <StatCard label="System Critical" value={results.criticalHives} icon={AlertCircle} color="bg-red-500" />
                <StatCard
                    label="Ecosystem Coverage"
                    value={`${results.coverageHealth}%`}
                    icon={Activity}
                    color={results.coverageHealth >= 90 ? "bg-beeyield-forest" : results.coverageHealth >= 70 ? "bg-beeyield-sand" : "bg-red-500"}
                />
            </div>

            {/* Strategic Workflow Paths */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Workflow: GIS Pollination */}
                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="relative bg-white rounded-[3.5rem] border border-[#E0E0E0] shadow-sm p-10 overflow-hidden cursor-pointer group transition-all duration-700 hover:shadow-2xl hover:shadow-beeyield-forest/10"
                    onClick={() => onTabChange('pollination')}
                >
                    <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-beeyield-forest to-beeyield-sand" />
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 rounded-[2rem] bg-beeyield-forest/10 flex items-center justify-center group-hover:bg-beeyield-forest group-hover:text-white transition-all duration-500 text-beeyield-forest">
                            <Flower2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-beeyield-charcoal">GIS Pollination</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Sovereign Territory Mapping</p>
                        </div>
                    </div>
                    <div className="space-y-4 mb-10">
                        {[
                            { label: "Colony dispersal dynamics", icon: Wind },
                            { label: "Phenological target metrics", icon: Target },
                            { label: "Topographical deployment", icon: Compass },
                            { label: "Atmospheric index overlays", icon: Waves }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <item.icon className="w-4 h-4 text-beeyield-forest/40" />
                                <span className="text-sm font-bold text-gray-500 group-hover:text-beeyield-charcoal transition-colors">{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-beeyield-sand/40">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full", results.foragingEfficiency >= 85 ? "bg-beeyield-forest" : "bg-beeyield-sand")} />
                            <span className="text-[10px] font-black text-beeyield-charcoal uppercase tracking-[0.2em]">{results.foragingEfficiency}% Efficiency</span>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-beeyield-forest group-hover:translate-x-2 transition-all" />
                    </div>
                </motion.div>

                {/* Workflow: Node Bio-Metrics */}
                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="relative bg-white rounded-[3.5rem] border border-[#E0E0E0] shadow-sm p-10 overflow-hidden cursor-pointer group transition-all duration-700 hover:shadow-2xl hover:shadow-beeyield-sand/20"
                    onClick={() => onTabChange('measurement')}
                >
                    <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-beeyield-sand to-beeyield-forest/40" />
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 rounded-[2rem] bg-beeyield-sand/20 flex items-center justify-center group-hover:bg-beeyield-sand group-hover:text-beeyield-forest transition-all duration-500 text-beeyield-forest">
                            <Hexagon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-beeyield-charcoal">Node Bio-Metrics</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Colony Integrity Scan</p>
                        </div>
                    </div>
                    <div className="space-y-4 mb-10">
                        {[
                            { label: "Thermodynamic envelopes", icon: Thermometer },
                            { label: "Acoustic frequency digests", icon: Volume2 },
                            { label: "Reproductive status (Queen)", icon: Sparkles },
                            { label: "Kinetic mass accumulation", icon: Weight }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <item.icon className="w-4 h-4 text-beeyield-sand" />
                                <span className="text-sm font-bold text-gray-500 group-hover:text-beeyield-charcoal transition-colors">{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-beeyield-sand/40">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full", results.healthyHives > results.warningHives ? "bg-beeyield-forest" : "bg-beeyield-sand")} />
                            <span className="text-[10px] font-black text-beeyield-charcoal uppercase tracking-[0.2em]">{results.healthyHives} Nodes Optimal</span>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-beeyield-sand group-hover:translate-x-2 transition-all" />
                    </div>
                </motion.div>

                {/* Workflow: Pathogen Perimeter */}
                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="relative bg-white rounded-[3.5rem] border border-[#E0E0E0] shadow-sm p-10 overflow-hidden cursor-pointer group transition-all duration-700 hover:shadow-2xl hover:shadow-red-500/10"
                    onClick={() => onTabChange('assistant')}
                >
                    <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-red-500 to-red-300" />
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 rounded-[2rem] bg-red-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all duration-500 text-red-500">
                            <Bug className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-beeyield-charcoal">Pathogen Perimeter</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Ecosystem Breach Alert</p>
                        </div>
                    </div>
                    <div className="space-y-4 mb-10">
                        {[
                            { label: "Pest pressure heatmaps", icon: Radar },
                            { label: "Chemical volatility index", icon: Zap },
                            { label: "Early-onset disease detection", icon: Activity },
                            { label: "Smart immunity signaling", icon: ShieldCheck }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <item.icon className="w-4 h-4 text-red-300" />
                                <span className="text-sm font-bold text-gray-500 group-hover:text-beeyield-charcoal transition-colors">{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-beeyield-sand/40">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-beeyield-forest shadow-lg shadow-beeyield-forest/40" />
                            <span className="text-[10px] font-black text-beeyield-charcoal uppercase tracking-[0.2em]">Zero Active Threats</span>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-red-500 group-hover:translate-x-2 transition-all" />
                    </div>
                </motion.div>
            </div>

            {/* Strategic Command Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12 items-start">

                {/* Left: Configuration & Registry */}
                <div className="lg:col-span-4 space-y-10">
                    <Card className="rounded-[4rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-beeyield-forest/5 flex items-center justify-center text-beeyield-forest border border-beeyield-forest/10">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-beeyield-charcoal tracking-tighter uppercase tracking-widest leading-none">Yield Tool</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="relative group">
                                <Label className="absolute left-6 top-4 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">{t('crop_select')}</Label>
                                <Select name="crop_type" value={selectedCrop} onValueChange={setSelectedCrop}>
                                    <SelectTrigger className="h-20 pt-8 pb-3 px-6 rounded-3xl border-2 border-beeyield-sand bg-white font-black text-beeyield-charcoal shadow-none focus:ring-0 focus:border-beeyield-forest transition-all">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-3xl border-beeyield-sand shadow-2xl p-2">
                                        {Object.keys(beePollinationData).map(c => (
                                            <SelectItem key={c} value={c} className="rounded-2xl font-bold py-4">{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="relative group">
                                <Label className="absolute left-6 top-4 text-[9px] font-black text-gray-400 uppercase tracking-widest z-10">{t('acreage')}</Label>
                                <Input
                                    type="number"
                                    value={acreage}
                                    onChange={(e) => setAcreage(Number(e.target.value))}
                                    className="h-20 pt-8 pb-3 px-6 rounded-3xl border-2 border-beeyield-sand bg-white font-black text-beeyield-charcoal shadow-none focus:ring-0 focus:border-beeyield-forest transition-all text-xl"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-beeyield-forest/30 text-xs">ACRES</div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex justify-between items-center bg-beeyield-sand/20 p-6 rounded-3xl border border-beeyield-sand">
                                    <div>
                                        <span className="text-xs font-black text-beeyield-charcoal uppercase tracking-[0.2em] flex items-center gap-3">
                                            <Hexagon className="w-5 h-5 text-beeyield-forest" /> Hive Strength
                                        </span>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">{results.strengthCategory} RATING</p>
                                    </div>
                                    <div className="bg-white border-2 border-beeyield-sand text-beeyield-charcoal px-4 py-2 rounded-2xl font-black text-sm shadow-sm transition-all group-hover:scale-105">
                                        {avgFrames} Frames
                                    </div>
                                </div>
                                <div className="px-4">
                                    <input
                                        type="range" min="6" max="12" step="1" value={avgFrames}
                                        onChange={(e) => setAvgFrames(Number(e.target.value))}
                                        className="w-full h-2 bg-beeyield-sand rounded-lg appearance-none cursor-pointer accent-beeyield-forest"
                                    />
                                    <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest pt-3">
                                        <span>Standard</span>
                                        <span>Optimal</span>
                                        <span>Elite</span>
                                    </div>
                                </div>
                            </div>

                            {/* BeeYield AI Strategic Advisory */}
                            <div className="p-8 rounded-[2.5rem] bg-beeyield-charcoal text-white border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-beeyield-forest/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-beeyield-forest/20 transition-all duration-700" />
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-beeyield-sand border border-white/10">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest border-b border-beeyield-sand/30 pb-1">Tactical Advisor</h4>
                                </div>
                                <p className="text-sm font-medium text-white/70 leading-relaxed italic">
                                    "Kinetic analysis suggests optimizing <span className="text-beeyield-sand font-black underline decoration-beeyield-sand/30 underline-offset-4">Hive 4 position</span> centrally to elevate coverage delta by 12%."
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={() => onTabChange('assistant')}
                                    className="flex-1 h-16 rounded-[2rem] bg-beeyield-charcoal text-white hover:bg-beeyield-forest hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-xl"
                                >
                                    <Bot className="w-4 h-4 mr-2" /> Advisor
                                </Button>
                                <Button
                                    onClick={async () => {
                                        try {
                                            const now = new Date();
                                            const nextMonth = new Date();
                                            nextMonth.setMonth(now.getMonth() + 1);
                                            const contractData = {
                                                crop_type: selectedCrop,
                                                farm_location: "Kibwezi Main Apiary Area",
                                                farm_size_acres: acreage,
                                                contract_start_date: now.toISOString().split('T')[0],
                                                contract_end_date: nextMonth.toISOString().split('T')[0],
                                                hive_count_required: results.hivesNeeded,
                                                target_fpa: results.targetFPA,
                                                notes: `Requested via Pollination Calculator. Colony strength: ${avgFrames} frames.`
                                            };
                                            const res = await beeyieldService.createPollinationContract(contractData);
                                            if (res && !res.error) toast.success("Request Manifest Distributed");
                                            else toast.error("Transmission Interrupted");
                                        } catch (err) {
                                            toast.error("Manifest Breach");
                                        }
                                    }}
                                    className="flex-[2] h-16 rounded-[2rem] bg-beeyield-forest text-white hover:bg-beeyield-charcoal transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-beeyield-forest/20"
                                >
                                    <FileText className="w-4 h-4 mr-2" /> Deploy Force
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Node Registry */}
                    <Card className="rounded-[4rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden flex flex-col p-10 h-[500px]">
                        <div className="flex items-center justify-between mb-8 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-beeyield-sand/20 flex items-center justify-center text-beeyield-forest">
                                    <Hexagon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-beeyield-charcoal tracking-tighter uppercase tracking-widest">Node Fleet</h3>
                            </div>
                            <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className={cn("h-10 w-10 rounded-xl", viewMode === 'grid' && "bg-white text-beeyield-charcoal shadow-sm border border-gray-100")} onClick={() => setViewMode('grid')}>
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className={cn("h-10 w-10 rounded-xl", viewMode === 'list' && "bg-white text-beeyield-charcoal shadow-sm border border-gray-100")} onClick={() => setViewMode('list')}>
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-6 gap-3">
                                    {hives.map(hive => (
                                        <motion.button
                                            key={hive.id}
                                            whileHover={{ scale: 1.1 }}
                                            onClick={() => setSelectedHiveId(hive.id)}
                                            className={cn(
                                                "aspect-square rounded-2xl flex items-center justify-center text-[10px] font-black text-white transition-all shadow-sm border-2",
                                                getStatusColor(hive.status),
                                                selectedHiveId === hive.id ? "border-beeyield-charcoal/40 ring-4 ring-beeyield-sand/50" : "border-transparent"
                                            )}
                                        >
                                            {hive.id.split('-')[1]}
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {hives.map(hive => (
                                        <button
                                            key={hive.id}
                                            onClick={() => setSelectedHiveId(hive.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all border-2",
                                                selectedHiveId === hive.id ? "bg-beeyield-sand/10 border-beeyield-sand" : "hover:bg-gray-50 border-transparent"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-3 h-3 rounded-full shadow-lg", getStatusColor(hive.status))} />
                                                <span className="text-sm font-black text-beeyield-charcoal">{hive.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{hive.sensors.flightActivity.value} FL/M</span>
                                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right: Tactical Map & Telemetry Dashboard */}
                <div className="lg:col-span-8 space-y-10">
                    <Card className="rounded-[4rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden p-10">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-[1.5rem] bg-beeyield-forest/5 flex items-center justify-center text-beeyield-forest">
                                    <Cpu className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-beeyield-charcoal tracking-tighter uppercase tracking-widest leading-none mb-1">Telemetry Focus</h3>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                        {selectedHive ? `${selectedHive.name} • SECURED LINK` : `Fleet Aggregate • SECURE`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <button
                                        onClick={() => setIsHiveSelectorOpen(!isHiveSelectorOpen)}
                                        className="flex items-center gap-3 h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-xs font-black text-beeyield-charcoal uppercase tracking-widest hover:bg-gray-100 transition-all"
                                    >
                                        <Hexagon className="w-4 h-4 text-beeyield-forest" />
                                        {selectedHive ? selectedHive.id : 'Active Fleet'}
                                        <ChevronDown className={cn("w-4 h-4 transition-transform ml-2", isHiveSelectorOpen && "rotate-180")} />
                                    </button>
                                    <AnimatePresence>
                                        {isHiveSelectorOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsHiveSelectorOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute right-0 top-16 w-64 bg-white rounded-3xl border border-gray-100 shadow-2xl z-50 p-3 max-h-96 overflow-y-auto"
                                                >
                                                    <button
                                                        onClick={() => { setSelectedHiveId('aggregate'); setIsHiveSelectorOpen(false); }}
                                                        className={cn(
                                                            "w-full text-left px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all mb-2",
                                                            selectedHiveId === 'aggregate' ? "bg-beeyield-forest text-white" : "hover:bg-gray-50 text-gray-400"
                                                        )}
                                                    >
                                                        📊 Global Registry ({hives.length})
                                                    </button>
                                                    <Separator className="my-2 opacity-50" />
                                                    {hives.map(hive => (
                                                        <button
                                                            key={hive.id}
                                                            onClick={() => { setSelectedHiveId(hive.id); setIsHiveSelectorOpen(false); }}
                                                            className={cn(
                                                                "w-full flex items-center justify-between px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all mb-1",
                                                                selectedHiveId === hive.id ? "bg-beeyield-sand text-beeyield-forest" : "hover:bg-gray-50 text-gray-400"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn("w-2 h-2 rounded-full", getStatusColor(hive.status))} />
                                                                <span>{hive.name}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => onTabChange('measurement')}
                                    className="text-[10px] font-black text-beeyield-forest uppercase tracking-[0.2em] hover:bg-beeyield-forest/5 rounded-2xl h-14 px-6 border-2 border-transparent hover:border-beeyield-forest/10"
                                >
                                    Detailed Digest <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <SensorCard
                                label="Node Acoustics"
                                value={String(selectedHive ? selectedHive.sensors.acoustics.value : aggregateSensors.acoustics)}
                                unit="Hz"
                                icon={Volume2}
                                color="bg-beeyield-charcoal"
                                trend="up"
                                trendValue="4.2"
                            />
                            <SensorCard
                                label="Thermodynamic"
                                value={String(selectedHive ? selectedHive.sensors.temperature.value : aggregateSensors.temperature)}
                                unit="°C"
                                icon={Thermometer}
                                color="bg-orange-500"
                                trend="stable"
                                trendValue="Nominal"
                            />
                            <SensorCard
                                label="Atmospheric Index"
                                value={String(selectedHive ? selectedHive.sensors.humidity.value : aggregateSensors.humidity)}
                                unit="%"
                                icon={Droplets}
                                color="bg-cyan-500"
                                trend="down"
                                trendValue="1.5"
                            />
                            <SensorCard
                                label="Flight Momentum"
                                value={String(selectedHive ? selectedHive.sensors.flightActivity.value : aggregateSensors.flightActivity)}
                                unit="V/M"
                                icon={Waves}
                                color="bg-beeyield-forest"
                                trend="up"
                                trendValue="18%"
                            />
                        </div>

                        {/* Interactive Geographic Logic (Mock Overlay) */}
                        <div className="mt-10 relative h-[500px] w-full bg-slate-100 rounded-[3.5rem] overflow-hidden border-2 border-beeyield-sand group">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=2600')] bg-cover bg-center grayscale contrast-125 opacity-20 transform group-hover:scale-105 transition-transform duration-10000" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-beeyield-forest/20 via-transparent to-beeyield-sand/10 blur-3xl opacity-50" />

                            {/* Map Legend */}
                            <div className="absolute top-10 left-10 z-20 space-y-4">
                                <div className="p-6 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl max-w-[280px]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-xl bg-beeyield-charcoal flex items-center justify-center text-beeyield-sand animate-pulse">
                                            <Navigation2 className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-beeyield-charcoal">GIS Overlay Alpha</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            <span>Current Resolution</span>
                                            <span className="text-beeyield-forest">0.5m GSD</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            <span>Scan Frequency</span>
                                            <span className="text-beeyield-forest">Dynamic</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-beeyield-sand/30 rounded-full mt-2 overflow-hidden">
                                            <motion.div animate={{ x: [-200, 300] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="h-full w-1/3 bg-beeyield-forest blur-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hive Pins with Tactical Popups */}
                            {hives.slice(0, 15).map((hive, i) => (
                                <motion.div
                                    key={hive.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{ left: `${hive.x}%`, top: `${hive.y}%` }}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-30"
                                    onClick={() => setSelectedHiveId(hive.id)}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-full border-2 border-white shadow-xl transition-all duration-300 group-hover:scale-150 relative",
                                        getStatusColor(hive.status)
                                    )}>
                                        <div className={cn("absolute inset-0 rounded-full animate-ping opacity-30", getStatusColor(hive.status))} />
                                    </div>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-40">
                                        <div className="bg-beeyield-charcoal text-white rounded-2xl px-5 py-3 shadow-2xl border border-white/10">
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-beeyield-sand">{hive.name}</p>
                                            <p className="text-[9px] font-medium text-white/60">INTEGRITY: NORMAL</p>
                                        </div>
                                        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-beeyield-charcoal mx-auto" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>

                    {/* Operational Journal */}
                    <Card className="rounded-[4rem] border-[#E0E0E0] bg-beeyield-charcoal text-white shadow-2xl overflow-hidden p-10">
                        <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-beeyield-forest border border-white/10">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black tracking-tighter uppercase tracking-widest">Digital Sequence</h3>
                            </div>
                            <Badge className="bg-beeyield-forest text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none">Node Audit Active</Badge>
                        </div>
                        <div className="space-y-4">
                            {activityLogs.map((log) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={log.id}
                                    className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.07] group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="text-[11px] font-black text-white/30 truncate w-14 font-mono">{log.time}</div>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            log.type === 'success' ? "bg-beeyield-forest shadow-lg shadow-beeyield-forest/40" :
                                                log.type === 'warning' ? "bg-beeyield-sand shadow-lg shadow-beeyield-sand/40" : "bg-blue-400"
                                        )} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black tracking-tight group-hover:text-beeyield-sand transition-colors">{log.action}</span>
                                            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Target: Node {log.hive}</span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white hover:bg-white/10 rounded-xl">
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default PrecisionPollinationView;
