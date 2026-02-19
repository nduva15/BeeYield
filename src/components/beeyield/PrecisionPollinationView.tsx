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
    Flower2
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



// --- Stat Card matching MyDevicesView style exactly ---
const StatCard = ({ label, value, colorClass }: { label: string, value: number | string, colorClass: string }) => (
    <div className="bg-white dark:bg-[#111111] p-4 rounded-sm border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden h-24 flex flex-col justify-between">
        <div className={cn("absolute top-0 left-0 w-full h-[3px]", colorClass)} />
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
    </div>
);

// --- IoT Sensor Card with Brand Colors ---
const SensorCard = ({ label, value, unit, icon: Icon, color, trend, trendValue, onClick }: {
    label: string, value: string, unit: string, icon: any, color: string, trend?: 'up' | 'down' | 'stable', trendValue?: string, onClick?: () => void
}) => (
    <div
        onClick={onClick}
        className={cn(
            "bg-white dark:bg-[#111111] p-4 rounded-lg border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between transition-all",
            onClick && "cursor-pointer hover:shadow-md hover:border-[#F4D03F]/30"
        )}
    >
        <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-lg", color)}>
                <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-none mb-1">{label}</p>
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {value}<span className="text-sm ml-0.5 opacity-50">{unit}</span>
                </h4>
            </div>
        </div>
        {trend && (
            <div className={cn(
                "px-2 py-1 rounded text-xs font-bold uppercase",
                trend === 'up' ? "bg-[#1B9157]/10 text-[#1B9157]" : trend === 'down' ? "bg-red-500/10 text-red-500" : "bg-gray-100 text-gray-500 dark:bg-white/5"
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
    const [hiveCount, setHiveCount] = useState<number>(184); // Will be updated by real data count
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
                // Fetch contracts, sensor data and logs in parallel
                const [contracts, sensorData, logs] = await Promise.all([
                    beeyieldService.getPollinationContracts(),
                    beeyieldService.getHiveSensorData(),
                    beeyieldService.getPollinationActivityLogs()
                ]);

                // 1. Setup Contracts Data
                if (contracts && contracts.length > 0) {
                    const activeContract = contracts.find(c => c.status === 'active') || contracts[0];
                    if (activeContract) {
                        setSelectedCrop(activeContract.crop_type);
                        setAcreage(activeContract.farm_size_acres);
                        setHiveCount(activeContract.hive_count_required);
                    }
                }

                // 2. Setup Activity Logs
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

                // 3. Setup Hive/Sensor Data
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
                                acoustics: {
                                    value: h.sensors.acoustics.value,
                                    trend: h.sensors.acoustics.trend,
                                    trendValue: h.sensors.acoustics.trendValue
                                },
                                temperature: {
                                    value: h.sensors.temperature.value,
                                    trend: h.sensors.temperature.trend,
                                    trendValue: h.sensors.temperature.trendValue
                                },
                                humidity: {
                                    value: h.sensors.humidity.value,
                                    trend: h.sensors.humidity.trend,
                                    trendValue: h.sensors.humidity.trendValue
                                },
                                flightActivity: {
                                    value: h.sensors.flight_activity.value,
                                    trend: h.sensors.flight_activity.trend,
                                    trendValue: h.sensors.flight_activity.trendValue
                                }
                            },
                            framesOfBees: h.frames_of_bees,
                            queenStatus: h.queen_status as any,
                            lastSync: h.last_sync
                        };
                    });

                    setHives(mappedHives);
                    setHiveCount(mappedHives.length);
                } else {
                    // Fallback to legacy getHives if table missing but hives exist
                    const realHives = await beeyieldService.getHives();
                    if (realHives && realHives.length > 0) {
                        setUsingRealData(true);
                        setHiveCount(realHives.length);
                        const mappedHives: HiveData[] = realHives.map((h, i) => {
                            const row = Math.floor(i / 10);
                            const col = i % 10;
                            const temp = h.latest_temp || 0;
                            const humidity = h.latest_humidity || 0;
                            const status = (temp < 10) ? 'critical' : 'healthy'; // Placeholder logic for real but empty data

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
                        console.log("No pollination data found.");
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
            case 'healthy': return 'bg-[#1B9157]';
            case 'warning': return 'bg-[#F4D03F]';
            case 'critical': return 'bg-red-500 animate-pulse';
        }
    };

    return (
        <div className="space-y-6 pb-20 -mt-2">
            {/* Header matches MyDevicesView exactly */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-2 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Pollination Summary
                    </h1>
                    <p className="text-base font-semibold text-slate-400 dark:text-slate-500 mt-1">
                        Tracking bee activity and health across your farm.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-[#111111] rounded-lg border border-gray-100 dark:border-white/5 px-3 py-2">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contract:</span>
                        <Select name="hive_count_required" value={String(hiveCount)} onValueChange={(v) => setHiveCount(Number(v))}>
                            <SelectTrigger id="pollination-hives" className="h-6 w-16 rounded border-none bg-slate-50 dark:bg-white/5 font-bold text-sm p-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                {[12, 24, 36, 48, 60, 100].map(n => (
                                    <SelectItem key={n} value={String(n)} className="font-bold">{n}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-sm font-bold text-gray-400 uppercase">Hives</span>
                    </div>
                    <Badge className="h-9 px-4 rounded-full bg-[#1B9157]/10 text-[#1B9157] font-bold text-xs uppercase tracking-wider border-none">
                        <ShieldCheck className="w-3 h-3 mr-1.5" /> Live
                    </Badge>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard label="Target Activity" value={results.targetFPA} colorClass="bg-[#F4D03F]" />
                <StatCard label="Active Hives" value={hives.length} colorClass="bg-[#1B9157]" />
                <StatCard label="Warnings" value={results.warningHives} colorClass="bg-[#F4D03F]" />
                <StatCard label="Critical" value={results.criticalHives} colorClass="bg-red-500" />
                <StatCard label="Coverage" value={`${results.coverageHealth}%`} colorClass={results.coverageHealth >= 90 ? "bg-[#1B9157]" : results.coverageHealth >= 70 ? "bg-[#F4D03F]" : "bg-red-500"} />
            </div>

            {/* Three Paths to Pollination */}
            <div className="mt-2">
                <div className="flex items-center gap-3 mb-4 px-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#F4D03F]/30 to-transparent" />
                    <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        Our Pollination Steps
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#F4D03F]/30 to-transparent" />
                </div>
                <p className="text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 -mt-2 mb-5">
                    Helping you manage everything: Farm pollination, Hive health, and Alerts.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Path 1: Inland Pollination */}
                    <motion.div
                        whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(27, 145, 87, 0.15)' }}
                        className="relative bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 overflow-hidden cursor-pointer group transition-all"
                        onClick={() => onTabChange('pollination')}
                    >
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#1B9157] to-[#1B9157]/40" />
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#1B9157]/5 group-hover:bg-[#1B9157]/10 transition-colors" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-xl bg-[#1B9157]/10 flex items-center justify-center group-hover:bg-[#1B9157]/20 transition-colors">
                                <Flower2 className="w-5 h-5 text-[#1B9157]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Farm Pollination</h3>
                                <p className="text-[10px] font-semibold text-gray-400">Coverage & Results</p>
                            </div>
                        </div>
                        <div className="space-y-2.5 mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#1B9157]" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Bee range & flight maps</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#1B9157]" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Crop activity goals</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#1B9157]" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Best hive placement</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#1B9157]" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Weather-checked results</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div className={cn("w-2 h-2 rounded-full", results.foragingEfficiency >= 85 ? "bg-[#1B9157]" : "bg-[#F4D03F]")} />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{results.foragingEfficiency}% Efficiency</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1B9157] transition-colors" />
                        </div>
                    </motion.div>

                    {/* Path 2: In-Hive Pollination */}
                    <motion.div
                        whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(244, 208, 63, 0.15)' }}
                        className="relative bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 overflow-hidden cursor-pointer group transition-all"
                        onClick={() => onTabChange('measurement')}
                    >
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#F4D03F] to-[#F4D03F]/40" />
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#F4D03F]/5 group-hover:bg-[#F4D03F]/10 transition-colors" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center group-hover:bg-[#F4D03F]/20 transition-colors">
                                <Hexagon className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Inside the Hive</h3>
                                <p className="text-[10px] font-semibold text-gray-400">Health checks</p>
                            </div>
                        </div>
                        <div className="space-y-2.5 mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#F4D03F]" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Temperature & humidity checks</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#F4D03F]" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Sound-based health checks</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#F4D03F]" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Queen status</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#F4D03F]" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Hive strength tracking</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div className={cn("w-2 h-2 rounded-full", results.healthyHives > results.warningHives ? "bg-[#1B9157]" : "bg-[#F4D03F]")} />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{results.healthyHives} Hives Optimal</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F4D03F] transition-colors" />
                        </div>
                    </motion.div>

                    {/* Path 3: Diseases */}
                    <motion.div
                        whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(239, 68, 68, 0.1)' }}
                        className="relative bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 overflow-hidden cursor-pointer group transition-all"
                        onClick={() => onTabChange('assistant')}
                    >
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 to-red-500/40" />
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                <Bug className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Health alerts</h3>
                                <p className="text-[10px] font-semibold text-gray-400">Stay safe</p>
                            </div>
                        </div>
                        <div className="space-y-2.5 mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-red-500" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Pest pressure tracking</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-red-500" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Chemical alerts</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-red-500" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Disease early detection</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-red-500" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Smart health checks</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-[#1B9157]" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">No Threats Detected</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 transition-colors" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Area - Refactored for better alignment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2 items-start">

                {/* Left Column - Fixed Widths */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                    {/* Pollination Calculator */}
                    <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 flex-none">
                        <div className="flex items-center gap-2 mb-6">
                            <Calculator className="w-4 h-4 text-[#1B9157]" />
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Tool</h3>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('crop_select')}</Label>
                                <Select name="crop_type" value={selectedCrop} onValueChange={setSelectedCrop}>
                                    <SelectTrigger id="pollination-crop" className="h-10 rounded-lg bg-slate-50 dark:bg-white/5 border-gray-200 dark:border-white/10 font-bold text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        {Object.keys(beePollinationData).map(c => (
                                            <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('acreage')}</Label>
                                <Input
                                    id="pollination-acreage"
                                    name="acreage"
                                    type="number"
                                    value={acreage}
                                    onChange={(e) => setAcreage(Number(e.target.value))}
                                    className="h-10 rounded-lg bg-slate-50 dark:bg-white/5 border-gray-200 dark:border-white/10 font-bold text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hive strength</Label>
                                    <span className="text-sm font-bold text-[#1B9157]">{avgFrames} Frames</span>
                                </div>
                                <div className="relative h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="absolute h-full bg-[#1B9157]"
                                        animate={{ width: `${(avgFrames / 12) * 100}%` }}
                                    />
                                    <input
                                        id="pollination-frames"
                                        name="avg_frames"
                                        type="range" min="6" max="12" step="1" value={avgFrames}
                                        onChange={(e) => setAvgFrames(Number(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        title="Adjust colony strength in frames of bees"
                                    />
                                </div>
                                <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase">
                                    <span>Min (6)</span>
                                    <span>Standard (8)</span>
                                    <span>Elite (12)</span>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-5 bg-gray-100 dark:bg-white/5" />

                        {/* BeeYield AI - Integrated into Calculator Card */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Bot className="w-4 h-4 text-[#F4D03F]" />
                                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">BeeYield Assistant</h4>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B9157] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B9157]"></span>
                                    </div>
                                    <span className="text-[9px] font-bold text-[#1B9157] uppercase tracking-wider">Connected</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                                    <span className="font-bold text-[#1B9157]">Smart Suggestion:</span> Moving Hive 4 closer to the center could help your crops more by <span className="font-bold text-slate-800 dark:text-white">~12%</span>.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => onTabChange('assistant')}
                            className="w-full h-10 mt-5 rounded-lg bg-[#F4D03F] hover:bg-[#e0be36] text-black font-bold uppercase tracking-wider text-xs shadow-md shadow-[#F4D03F]/20"
                        >
                            <Bot className="w-4 h-4 mr-2" /> Ask BeeYield
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
                                    if (res && !res.error) {
                                        toast.success("Pollination request submitted successfully!");
                                    } else {
                                        toast.error("Failed to create contract. " + (res?.error || ""));
                                    }
                                } catch (err) {
                                    toast.error("Error submitting request.");
                                }
                            }}
                            className="w-full h-10 mt-2 rounded-lg bg-[#1B9157] hover:bg-[#157a48] text-white font-bold uppercase tracking-wider text-xs shadow-md shadow-[#1B9157]/20"
                        >
                            <FileText className="w-4 h-4 mr-2" /> Request Pollination
                        </Button>
                    </div>

                    {/* Hive Fleet - Fills remaining height */}
                    <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[250px]">
                        <div className="p-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <Hexagon className="w-4 h-4 text-[#F4D03F]" />
                                <h3 className="text-xs font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">Your hives</h3>
                            </div>
                            <div className="flex gap-1">
                                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-6 w-6 p-0" onClick={() => setViewMode('grid')}>
                                    <LayoutGrid className="w-3 h-3" />
                                </Button>
                                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="h-6 w-6 p-0" onClick={() => setViewMode('list')}>
                                    <List className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-6 gap-1.5">
                                    {hives.map(hive => (
                                        <button
                                            key={hive.id}
                                            onClick={() => setSelectedHiveId(hive.id)}
                                            className={cn(
                                                "aspect-square rounded flex items-center justify-center text-[8px] font-bold text-white transition-all hover:scale-110",
                                                getStatusColor(hive.status),
                                                selectedHiveId === hive.id && "ring-2 ring-offset-1 ring-[#F4D03F]"
                                            )}
                                            title={`${hive.name} - ${hive.status}`}
                                        >
                                            {hive.id.split('-')[1]}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {hives.slice(0, 10).map(hive => (
                                        <button
                                            key={hive.id}
                                            onClick={() => setSelectedHiveId(hive.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-2 rounded-lg text-left transition-all",
                                                selectedHiveId === hive.id ? "bg-[#F4D03F]/10" : "hover:bg-slate-50 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", getStatusColor(hive.status))} />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{hive.name}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400">{hive.sensors.flightActivity.value} Flights/min</span>
                                        </button>
                                    ))}
                                    {hives.length > 10 && (
                                        <p className="text-center text-[10px] font-bold text-gray-400 py-2">+{hives.length - 10} more</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-full">
                    {/* IoT Sensory Hub */}
                    <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 flex-none">
                        <div className="flex justify-between items-center mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center">
                                    <Cpu className="w-5 h-5 text-[#F4D03F]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">Hive sensors</h3>
                                    <p className="text-[10px] text-gray-400 font-semibold">
                                        {selectedHive ? `${selectedHive.name} • ${selectedHive.lastSync}` : `Average of ${hives.length} hives`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <button
                                        onClick={() => setIsHiveSelectorOpen(!isHiveSelectorOpen)}
                                        className="flex items-center gap-2 h-8 px-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold"
                                    >
                                        <Hexagon className="w-3 h-3 text-[#F4D03F]" />
                                        {selectedHive ? selectedHive.id : 'All Hives'}
                                        <ChevronDown className={cn("w-3 h-3 transition-transform", isHiveSelectorOpen && "rotate-180")} />
                                    </button>
                                    <AnimatePresence>
                                        {isHiveSelectorOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsHiveSelectorOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="absolute right-0 top-10 w-48 bg-white dark:bg-[#111] rounded-lg border border-gray-100 dark:border-white/5 shadow-xl z-50 p-1.5 max-h-64 overflow-y-auto"
                                                >
                                                    <button
                                                        onClick={() => { setSelectedHiveId('aggregate'); setIsHiveSelectorOpen(false); }}
                                                        className={cn(
                                                            "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all",
                                                            selectedHiveId === 'aggregate' ? "bg-[#F4D03F]/10 text-[#9a7f1e]" : "hover:bg-slate-50 dark:hover:bg-white/5"
                                                        )}
                                                    >
                                                        📊 All Hives ({hives.length})
                                                    </button>
                                                    <Separator className="my-1.5" />
                                                    {hives.map(hive => (
                                                        <button
                                                            key={hive.id}
                                                            onClick={() => { setSelectedHiveId(hive.id); setIsHiveSelectorOpen(false); }}
                                                            className={cn(
                                                                "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                                selectedHiveId === hive.id ? "bg-[#F4D03F]/10" : "hover:bg-slate-50 dark:hover:bg-white/5"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(hive.status))} />
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
                                    className="text-[10px] font-bold text-[#1B9157] uppercase tracking-wider hover:bg-[#1B9157]/5 rounded-lg h-8 px-3"
                                >
                                    {t('view_detailed_analytics')} <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <SensorCard
                                label="Colony Acoustics"
                                value={String(selectedHive ? selectedHive.sensors.acoustics.value : aggregateSensors.acoustics)}
                                unit="Hz"
                                icon={Volume2}
                                color="bg-[#F4D03F]"
                                trend={selectedHive ? selectedHive.sensors.acoustics.trend : 'up'}
                                trendValue={selectedHive ? selectedHive.sensors.acoustics.trendValue : '+2.4%'}
                                onClick={() => onTabChange('measurement')}
                            />
                            <SensorCard
                                label="Brood Temperature"
                                value={String(selectedHive ? selectedHive.sensors.temperature.value : aggregateSensors.temperature)}
                                unit="°C"
                                icon={Thermometer}
                                color="bg-[#F4D03F]"
                                trend={selectedHive ? selectedHive.sensors.temperature.trend : 'stable'}
                                trendValue={selectedHive ? selectedHive.sensors.temperature.trendValue : 'Stable'}
                                onClick={() => onTabChange('measurement')}
                            />
                            <SensorCard
                                label="Nest Humidity"
                                value={String(selectedHive ? selectedHive.sensors.humidity.value : aggregateSensors.humidity)}
                                unit="%"
                                icon={Droplets}
                                color="bg-[#1B9157]"
                                trend={selectedHive ? selectedHive.sensors.humidity.trend : 'down'}
                                trendValue={selectedHive ? selectedHive.sensors.humidity.trendValue : '-1.2%'}
                                onClick={() => onTabChange('measurement')}
                            />
                            <SensorCard
                                label="Flight Activity"
                                value={String(selectedHive ? selectedHive.sensors.flightActivity.value : aggregateSensors.flightActivity)}
                                unit="VPM"
                                icon={Activity}
                                color="bg-[#1B9157]"
                                trend={selectedHive ? selectedHive.sensors.flightActivity.trend : 'up'}
                                trendValue={selectedHive ? selectedHive.sensors.flightActivity.trendValue : '+12%'}
                                onClick={() => onTabChange('measurement')}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mt-3">
                            <SensorCard
                                label="Vibration Index"
                                value="2.4"
                                unit="m/s²"
                                icon={Zap}
                                color="bg-[#F4D03F]"
                                trend="stable"
                                trendValue="Optimal"
                            />
                            <SensorCard
                                label="Queen Pheromone"
                                value="High"
                                unit=""
                                icon={ShieldCheck}
                                color="bg-[#1B9157]"
                                trend="up"
                                trendValue="Strong"
                            />
                        </div>

                        {selectedHive && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2.5 h-2.5 rounded-full", getStatusColor(selectedHive.status))} />
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedHive.name}</h4>
                                        <Badge variant="outline" className="text-[9px] font-bold uppercase h-5">
                                            {selectedHive.queenStatus === 'present' ? '👑 Queen' : selectedHive.queenStatus === 'absent' ? '⚠️ No Queen' : '❓ Unknown'}
                                        </Badge>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedHiveId('aggregate')} className="h-6 w-6 p-0">
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <div className="text-center p-2 rounded-lg bg-white dark:bg-black/20">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">FOB</p>
                                        <p className="text-sm font-bold text-[#1B9157]">{selectedHive.framesOfBees}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-white dark:bg-black/20">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Lat</p>
                                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{selectedHive.location.lat.toFixed(4)}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-white dark:bg-black/20">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Lng</p>
                                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{selectedHive.location.lng.toFixed(4)}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-white dark:bg-black/20">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Sync</p>
                                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{selectedHive.lastSync}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Hive Map - Flex to fill available space */}
                    <div className="space-y-2 flex-1 flex flex-col">
                        <div className="flex items-center justify-between px-1 flex-none">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#1B9157]" />
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('hive_placement_title')}</h4>
                            </div>
                            <div className="flex gap-2">
                                <Badge className="bg-[#1B9157]/10 text-[#1B9157] text-xs font-bold py-0.5 border-none">{results.healthyHives} Healthy</Badge>
                                <Badge className="bg-[#F4D03F]/10 text-[#9a7f1e] text-xs font-bold py-0.5 border-none">{results.warningHives} Warning</Badge>
                                <Badge className="bg-red-500/10 text-red-500 text-xs font-bold py-0.5 border-none">{results.criticalHives} Critical</Badge>
                            </div>
                        </div>

                        <div className="relative flex-1 min-h-[300px] rounded-2xl bg-slate-900 overflow-hidden border border-gray-200 dark:border-white/5 shadow-lg">
                            <div className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(circle, #F4D03F 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1B9157]/10 via-transparent to-[#F4D03F]/5" />

                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-20">
                                    <Loader2 className="w-8 h-8 text-[#F4D03F] animate-spin" />
                                    <span className="ml-2 text-white font-bold text-xs uppercase">Loading Hives...</span>
                                </div>
                            ) : (
                                hives.map((hive) => (
                                    <motion.div
                                        key={hive.id}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute cursor-pointer group/node z-10"
                                        style={{ left: `${hive.x}%`, top: `${hive.y}%` }}
                                        onClick={() => setSelectedHiveId(hive.id)}
                                    >
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full border border-white shadow-lg transition-transform hover:scale-150",
                                            getStatusColor(hive.status),
                                            selectedHiveId === hive.id && "ring-2 ring-[#F4D03F] ring-offset-1 ring-offset-slate-900 scale-125"
                                        )} />
                                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white rounded border border-white/10 opacity-0 group-hover/node:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                                            <div className="text-[9px] font-bold">{hive.id} • {hive.sensors.flightActivity.value.toFixed(1)} VPM</div>
                                        </div>
                                    </motion.div>
                                ))
                            )}

                            <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] text-white/50 font-bold">
                                <Layers className="w-3 h-3" />
                                <span>{hives.length} hives</span>
                            </div>

                            <div className="absolute top-3 right-3 flex gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157]" />
                                    <span className="text-[8px] font-bold text-white/70 uppercase">OK</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F]" />
                                    <span className="text-[8px] font-bold text-white/70 uppercase">Warn</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    <span className="text-[8px] font-bold text-white/70 uppercase">Crit</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed - Fixed height to balance */}
                    <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm h-[200px] flex flex-col flex-none">
                        <div className="p-4 border-b border-gray-50 dark:border-white/5 shrink-0">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#F4D03F]" />
                                <h3 className="text-xs font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">Live Feed</h3>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            <div className="divide-y dark:divide-white/5">
                                <AnimatePresence initial={false}>
                                    {activityLogs.map((log) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-mono font-bold text-gray-400 w-10">{log.time}</span>
                                                <div>
                                                    <p className={cn(
                                                        "text-xs font-bold leading-tight",
                                                        log.type === 'warning' ? "text-red-500" : log.type === 'success' ? "text-[#1B9157]" : "text-slate-700 dark:text-slate-300"
                                                    )}>
                                                        {log.action}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase">{log.hive}</p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                log.type === 'warning' ? "bg-red-500" : log.type === 'success' ? "bg-[#1B9157]" : "bg-[#F4D03F]"
                                            )} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-6 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 p-4 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pesticide Detection</p>
                                <p className="text-sm font-bold text-green-600">NONE DETECTED</p>
                            </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-600 border-none text-[8px] font-black uppercase">SAFE ZONE</Badge>
                    </div>

                    <div className="flex bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 p-4 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Colony Varroa Pressure</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{hives.length > 0 ? "LOW (1.2%)" : "0.0%"}</p>
                            </div>
                        </div>
                        <Badge className="bg-[#F4D03F]/20 text-[#9a7f1e] border-none text-[8px] font-black uppercase">MONITORING</Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1B9157]/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-[#1B9157]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Foraging Efficiency</p>
                            <p className="text-xl font-bold text-[#1B9157]">{results.foragingEfficiency}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-[#F4D03F]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Yield Projection</p>
                            <p className="text-xl font-bold text-[#9a7f1e]">+{Math.round(results.coverageHealth * 0.26)}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1B9157]/10 flex items-center justify-center">
                            <Hexagon className="w-5 h-5 text-[#1B9157]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Hives</p>
                            <p className="text-xl font-bold text-[#1B9157]">{hives.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-1 px-3 bg-slate-900 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors w-full">
                            <FileText className="w-4 h-4 text-[#F4D03F]" />
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-white/50 uppercase tracking-widest">Full Report</span>
                                <span className="text-sm font-bold text-[#F4D03F]">DOWNLOAD PDF</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrecisionPollinationView;
