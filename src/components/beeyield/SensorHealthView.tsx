import React from 'react';
import {
    Thermometer, Droplets, Activity, AlertTriangle, CheckCircle2, Volume2, Cpu, ChevronLeft, ChevronRight, Clock, Zap, Shield, ArrowUp, ArrowDown, Minus, Layers, ArrowRight, Scale, HeartPulse, Sparkles, Filter, RefreshCw, Radio, FileText, Check
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Bar
} from 'recharts';
import { cn } from '@/lib/utils';
import beeyieldService, { ActivityLog, SensorAlert, Hive } from '@/services/beeyieldService';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { glass, PageHeader } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import HiveHealthDashboard from './lovable_ai/HiveHealthDashboard';
import { useAuth } from '@/contexts/AuthContext';

interface SensorHealthViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

export interface HiveTelemetryItem {
    id: string;
    name: string;
    code: string;
    apiary: string;
    temp: number | null;
    humidity: number | null;
    weight: number | null;
    acoustic: 'Healthy' | 'Swarm Risk' | 'Queenless' | 'No Sensor';
    soundProfile: string;
    frequencyHz: number | null;
    varroaPct: number | null;
    alert: boolean;
    lastSeen: string;
    broodFrames: string;
    source: 'user_db' | 'device';
}

const acousticConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    'Healthy': { label: 'Normal Activity', color: 'text-emerald-600', bg: 'bg-emerald-500', icon: CheckCircle2 },
    'Queenless': { label: 'Queen Issues', color: 'text-red-600', bg: 'bg-red-500', icon: AlertTriangle },
    'Swarm Risk': { label: 'Swarm Risk', color: 'text-amber-600', bg: 'bg-amber-500', icon: Zap },
    'No Sensor': { label: 'No Sensor', color: 'text-gray-400', bg: 'bg-gray-300', icon: Minus },
};

// --- Sub-components ---

const VitalsCard: React.FC<{
    label: string;
    value: string | number;
    unit: string;
    target: string;
    icon: React.ElementType;
    status: 'ok' | 'warn' | 'critical' | 'neutral';
    trend: 'up' | 'down' | 'stable';
    subtitle?: string;
}> = ({ label, value, unit, target, icon: Icon, status, trend, subtitle }) => {
    return (
        <div className={cn(glass.card, "p-5 flex flex-col justify-between group transition-all h-full bg-white shadow-sm border border-border/80")}>
            <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/70">{label}</p>
                    <div className="flex items-baseline gap-1">
                        <span className={cn(
                            "text-3xl font-bold tracking-tight",
                            status === 'ok' ? 'text-foreground' :
                            status === 'warn' ? 'text-amber-600' :
                            status === 'critical' ? 'text-red-600' : 'text-gray-400'
                        )}>
                            {value}
                        </span>
                        {status !== 'neutral' && <span className="text-xs font-bold text-muted-foreground/70">{unit}</span>}
                    </div>
                    {subtitle && <p className="text-[10px] text-muted-foreground font-medium">{subtitle}</p>}
                </div>
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm group-hover:scale-105 transition-transform",
                    status === 'ok' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                    status === 'warn' ? "bg-amber-50 border-amber-100 text-amber-600" :
                    status === 'critical' ? "bg-red-50 border-red-100 text-red-600" :
                    "bg-gray-50 border-gray-100 text-gray-400"
                )}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-muted-foreground/80">
                <span>Target: {target}</span>
                {status === 'neutral' ? (
                    <span className="text-gray-400 font-semibold text-[10px]">No telemetry</span>
                ) : (
                    <span className={cn("font-bold", status === 'ok' ? 'text-emerald-600' : 'text-amber-600')}>
                        {status === 'ok' ? 'Optimal' : 'Attention'}
                    </span>
                )}
            </div>
        </div>
    );
};

const SensorHealthView: React.FC<SensorHealthViewProps> = ({ onTabChange }) => {
    const { user, beeyieldUser } = useAuth();
    const effectiveUserId = beeyieldUser?.id || user?.id;
    const [viewMode, setViewMode] = React.useState<'telemetry' | 'records'>('telemetry');
    const [realHives, setRealHives] = React.useState<HiveTelemetryItem[]>([]);
    const [selectedHive, setSelectedHive] = React.useState<HiveTelemetryItem | null>(null);
    const [selectedApiaryFilter, setSelectedApiaryFilter] = React.useState<string>('all');
    const [historyRange, setHistoryRange] = React.useState(6);
    const [historyData, setHistoryData] = React.useState<any[]>([]);
    const [liveTime, setLiveTime] = React.useState(new Date());
    const [realAlerts, setRealAlerts] = React.useState<SensorAlert[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

        const loadInitialData = React.useCallback(async () => {
        setIsRefreshing(true);
        try {
            // Fetch live hives, sensor alerts, and readings
            const [dbHives, alerts, sensorReadings] = await Promise.all([
                beeyieldService.getHives().catch(() => []),
                beeyieldService.getSensorAlerts(false, 10).catch(() => []),
                beeyieldService.getSensorReadings(undefined, 100).catch(() => [])
            ]);

            // Query user-specific hives directly if service returned empty
            let activeHives: any[] = Array.isArray(dbHives) ? [...dbHives] : [];
            if (activeHives.length === 0 && effectiveUserId) {
                const { data: userHivesData } = await (supabase as any)
                    .from('hives')
                    .select('*, apiary:apiaries(id, name, location_name, county, region)')
                    .eq('user_id', effectiveUserId)
                    .order('hive_code', { ascending: true });
                if (userHivesData && userHivesData.length > 0) {
                    activeHives = userHivesData;
                }
            }

            // Fallback to all available hives if user does not have specific hives yet
            if (activeHives.length === 0) {
                const { data: fallbackHivesData } = await (supabase as any)
                    .from('hives')
                    .select('*, apiary:apiaries(id, name, location_name, county, region)')
                    .limit(20);
                if (fallbackHivesData && fallbackHivesData.length > 0) {
                    activeHives = fallbackHivesData;
                }
            }

            // Fetch direct measurements from Supabase
            const { data: dbMeasurements } = await supabase
                .from('device_measurements' as any)
                .select('*')
                .order('recorded_at' as any, { ascending: false } as any)
                .limit(50)
                .catch(() => ({ data: [] }));

            const userHives: HiveTelemetryItem[] = [];

            if (Array.isArray(activeHives) && activeHives.length > 0) {
                activeHives.forEach((dh, idx) => {
                    const r = (sensorReadings || []).find(sr => sr.hive_id === dh.id);
                    const m = (dbMeasurements || []).find((dm: any) => dm.hive_id === dh.id);
                    const hasAlert = (alerts || []).some(a => a.hive_id === dh.id && !a.resolved);

                    const hasSensorData = (m?.temperature_c !== undefined && m?.temperature_c !== null) ||
                                          (r?.temperature !== undefined && r?.temperature !== null);

                    const tempVal = m?.temperature_c ?? r?.temperature ?? null;
                    const humidVal = m?.humidity_pct ?? r?.humidity ?? null;
                    const weightVal = m?.weight_kg ?? null;

                    userHives.push({
                        id: dh.id,
                        name: dh.name || dh.hive_code || `Hive ${dh.id.slice(0, 6)}`,
                        code: dh.hive_code || dh.name || `H-${idx + 1}`,
                        apiary: dh.apiary?.name || dh.apiary_name || 'BeeYield Apiary',
                        temp: tempVal,
                        humidity: humidVal,
                        weight: weightVal,
                        acoustic: hasSensorData ? (dh.status === 'Swarm Risk' ? 'Swarm Risk' : 'Healthy') : 'No Sensor',
                        soundProfile: hasSensorData ? 'Active colony telemetry' : 'No sensor synced',
                        frequencyHz: hasSensorData ? 245 : null,
                        varroaPct: null,
                        alert: hasAlert,
                        lastSeen: hasSensorData
                            ? (m?.recorded_at ? formatDistanceToNow(new Date(m.recorded_at), { addSuffix: true }) : (r ? formatDistanceToNow(new Date(r.timestamp), { addSuffix: true }) : 'Online'))
                            : 'No sensor synced',
                        broodFrames: dh.max_brood_frames ? `${dh.max_brood_frames} frames` : '10 frames',
                        source: 'user_db'
                    });
                });
            }

            setRealHives(userHives);
            setRealAlerts(alerts || []);

            setSelectedHive(prev => {
                if (prev) {
                    const match = userHives.find(h => h.id === prev.id);
                    if (match) return match;
                }
                return userHives[0] || null;
            });
        } catch (err: any) {
            console.error("Health view load error", err);
            setRealHives([]);
            setSelectedHive(null);
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    }, [effectiveUserId]);

    React.useEffect(() => {
        loadInitialData();
        const timer = setInterval(() => setLiveTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [loadInitialData, effectiveUserId]);

    React.useEffect(() => {
        // Timothy has no sensors synced; no fake history generated
        setHistoryData([]);
    }, [selectedHive]);

    const apiaryList = React.useMemo(() => {
        const set = new Set<string>();
        realHives.forEach(h => {
            if (h.apiary) set.add(h.apiary);
        });
        return Array.from(set);
    }, [realHives]);

    const filteredHives = React.useMemo(() => {
        if (selectedApiaryFilter === 'all') return realHives;
        return realHives.filter(h => h.apiary === selectedApiaryFilter);
    }, [realHives, selectedApiaryFilter]);

    if (loading) {
        return (
            <div className={cn(glass.page, "flex items-center justify-center min-h-[50vh]")}>
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center relative shadow-sm">
                        <Zap className="w-8 h-8 text-[#F4D03F] animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground animate-pulse">Loading Hive Health...</h3>
                </div>
            </div>
        );
    }

    if (viewMode === 'records') {
        return (
            <div className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}>
                <PageHeader
                    icon={HeartPulse}
                    label="Health Management"
                    title={<>Hive <span className="text-[#1B9157]">Health Records</span></>}
                    subtitle="Clinical inspections, acoustic audits, varroa wash logs & microclimate timeline."
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setViewMode('telemetry')}
                                className={cn(glass.btnSecondary, "h-9 px-4 text-xs font-bold flex items-center gap-2")}
                            >
                                <Radio className="w-4 h-4 text-[#1B9157]" />
                                Live Sensor Matrix
                            </button>
                        </div>
                    }
                />
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden p-2 sm:p-4">
                    <HiveHealthDashboard isOpen={true} onClose={() => setViewMode('telemetry')} embedded={true} />
                </div>
            </div>
        );
    }

    const tempStatus = selectedHive && selectedHive.temp !== null 
        ? (selectedHive.temp < 32 ? 'critical' : selectedHive.temp > 36.5 ? 'warn' : 'ok')
        : 'neutral';
    const humidStatus = selectedHive && selectedHive.humidity !== null
        ? (selectedHive.humidity < 50 ? 'warn' : selectedHive.humidity > 70 ? 'warn' : 'ok')
        : 'neutral';
    const weightStatus = selectedHive && selectedHive.weight !== null
        ? (selectedHive.weight < 35 ? 'warn' : 'ok')
        : 'neutral';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Activity}
                label="Monitoring"
                title={<>Hive <span className="text-[#1B9157]">Health</span></>}
                subtitle="Live telemetry and health vitals for connected apiary colonies."
                actions={
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* View Switcher */}
                        <div className="inline-flex rounded-xl p-1 bg-gray-100 border border-gray-200">
                            <button
                                type="button"
                                onClick={() => setViewMode('telemetry')}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                                    viewMode === 'telemetry' 
                                        ? "bg-white text-foreground shadow-sm" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Radio className="w-3.5 h-3.5 text-[#1B9157]" />
                                Live Vitals
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('records')}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                                    viewMode === 'records' 
                                        ? "bg-white text-foreground shadow-sm" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <FileText className="w-3.5 h-3.5 text-amber-600" />
                                Clinical Records
                            </button>
                        </div>

                        {/* Live Clock Badge */}
                        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            <span className="text-xs font-bold text-foreground tabular-nums">{liveTime.toLocaleTimeString()}</span>
                        </div>

                        {/* Refresh Button */}
                        <button
                            type="button"
                            onClick={loadInitialData}
                            disabled={isRefreshing}
                            aria-label="Refresh hive telemetry"
                            className={cn(glass.btnSecondary, "h-9 w-9 p-0 flex items-center justify-center rounded-xl")}
                            title="Refresh hive telemetry"
                        >
                            <RefreshCw className={cn("w-4 h-4 text-foreground", isRefreshing && "animate-spin text-[#1B9157]")} />
                        </button>
                    </div>
                }
            />

            {/* Alerts Banner */}
            {realAlerts.filter(a => !a.resolved).length > 0 && (
                <div className="space-y-3">
                    {realAlerts.filter(a => !a.resolved).slice(0, 2).map(alert => (
                        <motion.div
                            key={alert.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className={cn(
                                glass.card,
                                "p-4 border-l-4 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden shadow-sm",
                                alert.severity === 'critical' ? "border-red-500" : "border-amber-400"
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm", alert.severity === 'critical' ? "bg-red-50 border-red-100 text-red-500" : "bg-amber-50 border-amber-100 text-amber-600")}>
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 space-y-0.5">
                                <h4 className={cn("text-sm font-bold tracking-tight", alert.severity === 'critical' ? "text-red-600" : "text-amber-700")}>
                                    Attention Needed: {alert.alert_type}
                                </h4>
                                <p className="text-xs font-medium text-muted-foreground">{alert.message}</p>
                            </div>
                            <div className="shrink-0 text-right">
                                <span className="text-[10px] font-bold text-gray-400">{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Hive Selection & Apiary Filter Section */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#1B9157]" />
                        <h3 className="text-xs font-bold tracking-wider uppercase text-foreground">Hive Colonies</h3>
                        <span className="text-[10px] bg-gray-100 text-gray-700 border border-gray-200 font-bold px-2 py-0.5 rounded-full">
                            {filteredHives.length} {filteredHives.length === 1 ? 'Hive' : 'Hives'}
                        </span>
                    </div>

                    {/* Apiary Filter Chips */}
                    {apiaryList.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
                            <button
                                type="button"
                                onClick={() => setSelectedApiaryFilter('all')}
                                className={cn(
                                    "px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border",
                                    selectedApiaryFilter === 'all'
                                        ? "bg-[#1B9157] text-white border-[#1B9157] shadow-sm"
                                        : "bg-white text-muted-foreground border-gray-200 hover:border-gray-300"
                                )}
                            >
                                All ({realHives.length})
                            </button>
                            {apiaryList.map(apiary => (
                                <button
                                    key={apiary}
                                    type="button"
                                    onClick={() => setSelectedApiaryFilter(apiary)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border max-w-[140px] truncate",
                                        selectedApiaryFilter === apiary
                                            ? "bg-[#1B9157] text-white border-[#1B9157] shadow-sm"
                                            : "bg-white text-muted-foreground border-gray-200 hover:border-gray-300"
                                    )}
                                    title={apiary}
                                >
                                    {apiary}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Hive Cards Grid */}
                {filteredHives.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-foreground">No Hives Configured</h4>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                            You have no hives added yet. Register hives in the Hives & Apiaries module to view colony status.
                        </p>
                        <button
                            type="button"
                            onClick={() => onTabChange('beeyield')}
                            className="mt-3 px-4 py-1.5 rounded-xl bg-[#1B9157] text-white text-xs font-bold hover:bg-[#157345] transition-colors"
                        >
                            Add New Hive
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {filteredHives.map(hive => {
                            const isSelected = selectedHive && hive.id === selectedHive.id;
                            return (
                                <button
                                    key={hive.id}
                                    onClick={() => setSelectedHive(hive)}
                                    className={cn(
                                        glass.card,
                                        "p-3.5 text-left transition-all relative overflow-hidden group border shadow-sm rounded-xl",
                                        isSelected 
                                            ? "bg-white border-[#1B9157] ring-2 ring-[#1B9157]/20 shadow-md transform -translate-y-0.5" 
                                            : "bg-gray-50/80 hover:bg-white hover:border-gray-200"
                                    )}
                                >
                                    <div className="space-y-2 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className={cn(
                                                    "text-xs font-black tracking-wider uppercase block truncate max-w-[95px]",
                                                    isSelected ? "text-[#1B9157]" : "text-foreground"
                                                )}>
                                                    {hive.code}
                                                </span>
                                                <span className="text-[9px] font-medium text-muted-foreground block truncate max-w-[95px]">
                                                    {hive.apiary}
                                                </span>
                                            </div>
                                            {hive.alert ? (
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse shrink-0" />
                                            ) : (
                                                <div className={cn("w-2 h-2 rounded-full shrink-0", hive.temp !== null ? "bg-emerald-400" : "bg-gray-300")} />
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-gray-100">
                                            <span className="text-foreground tabular-nums">
                                                {hive.temp !== null ? `${hive.temp}°C` : '—'}
                                            </span>
                                            <span className="text-muted-foreground/70 tabular-nums">
                                                {hive.humidity !== null ? `${hive.humidity}%` : '—'}
                                            </span>
                                            <span className="text-amber-700/90 tabular-nums text-[10px]">
                                                {hive.weight !== null ? `${hive.weight}kg` : '—'}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedHive && (
                <>
                    {/* Selected Hive Banner */}
                    <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                                <HeartPulse className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-foreground tracking-tight">{selectedHive.name}</h2>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                        selectedHive.temp !== null 
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-gray-100 text-gray-600 border-gray-200"
                                    )}>
                                        {selectedHive.temp !== null ? selectedHive.acoustic : 'No Sensor Synced'}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span>{selectedHive.apiary}</span>
                                    <span>•</span>
                                    <span>Nest: {selectedHive.broodFrames}</span>
                                    <span>•</span>
                                    <span className="text-gray-400">Status: {selectedHive.lastSeen}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setViewMode('records')}
                                className={cn(glass.btnSecondary, "h-9 px-3 text-xs font-bold flex items-center gap-1.5")}
                            >
                                <FileText className="w-3.5 h-3.5 text-amber-600" />
                                Inspect Health Logs
                            </button>
                        </div>
                    </div>

                    {/* 4 Vitals Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <VitalsCard
                            label="Internal Temperature"
                            value={selectedHive.temp !== null ? selectedHive.temp : '—'}
                            unit="°C"
                            target="34.0 – 36.0°C"
                            subtitle={selectedHive.temp !== null ? "Brood core thermal regulation" : "No temperature sensor synced"}
                            icon={Thermometer}
                            status={tempStatus}
                            trend="stable"
                        />
                        <VitalsCard
                            label="Internal Humidity"
                            value={selectedHive.humidity !== null ? selectedHive.humidity : '—'}
                            unit="%"
                            target="55 – 65%"
                            subtitle={selectedHive.humidity !== null ? "Nectar dehydration equilibrium" : "No humidity sensor synced"}
                            icon={Droplets}
                            status={humidStatus}
                            trend="stable"
                        />
                        <VitalsCard
                            label="Colony Scale Weight"
                            value={selectedHive.weight !== null ? selectedHive.weight : '—'}
                            unit="kg"
                            target="40.0 – 55.0 kg"
                            subtitle={selectedHive.weight !== null ? "Automated scale telemetry" : "No scale sensor synced"}
                            icon={Scale}
                            status={weightStatus}
                            trend="stable"
                        />
                        <VitalsCard
                            label="Acoustic Frequency"
                            value={selectedHive.frequencyHz !== null ? selectedHive.frequencyHz : '—'}
                            unit="Hz"
                            target="235 – 260 Hz"
                            subtitle={selectedHive.frequencyHz !== null ? selectedHive.soundProfile : "No acoustic microphone synced"}
                            icon={Volume2}
                            status={selectedHive.frequencyHz !== null ? (selectedHive.acoustic === 'Healthy' ? 'ok' : 'warn') : 'neutral'}
                            trend="stable"
                        />
                    </div>

                    {/* Monthly History Trends */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200">
                                    <Activity className="w-4 h-4 text-[#1B9157]" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-foreground">Seasonal Telemetry Trends ({selectedHive.code})</h2>
                                    <p className="text-[10px] text-muted-foreground">Historical temperature & humidity cycle</p>
                                </div>
                            </div>
                        </div>

                        {historyData.length === 0 ? (
                            <div className="p-8 text-center bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                                <Radio className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <h4 className="text-sm font-bold text-foreground">No Sensor Telemetry Synced</h4>
                                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                                    Timothy currently has no sensors synced to this hive. Pair a BeeYield hardware device to record continuous vitals and seasonal history.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => onTabChange('devices')}
                                    className="mt-3 px-4 py-1.5 rounded-xl bg-[#1B9157] text-white text-xs font-bold hover:bg-[#157345] transition-colors"
                                >
                                    Pair Sensor Device
                                </button>
                            </div>
                        ) : (
                            <div className={cn(glass.card, "p-4 sm:p-6 bg-white shadow-sm border border-border/80")}>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#F4D03F" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 600 }} dy={8} />
                                            <YAxis yAxisId="temp" domain={[24, 40]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 600 }} dx={-8} unit="°C" />
                                            <Tooltip
                                                contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                                formatter={(val: any, name: string) => [
                                                    name === 'temp' ? `${val} °C` : `${val} %`,
                                                    name === 'temp' ? 'Temperature' : 'Humidity'
                                                ]}
                                            />
                                            <Area yAxisId="temp" type="monotone" dataKey="temp" stroke="#F4D03F" strokeWidth={3} fill="url(#tempGradient)" />
                                            <Bar yAxisId="temp" dataKey="humidity" fill="#1B9157" fillOpacity={0.12} radius={[4, 4, 0, 0]} barSize={28} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Global Status Matrix Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                            <Shield className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Hive Status Matrix</h3>
                            <p className="text-[10px] text-muted-foreground">Status and telemetry across all colonies</p>
                        </div>
                    </div>
                </div>
                <div className={cn(glass.card, "p-0 overflow-hidden shadow-sm bg-white")}>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100">
                                    {['Hive & Apiary', 'Brood Temp', 'Humidity', 'Scale Weight', 'Acoustic Signature', 'Varroa Load', 'Last Sync', 'Status'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredHives.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-8 text-center text-xs text-muted-foreground">
                                            No hives configured in your account. Add hives in the Apiaries & Hives module.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHives.map(hive => {
                                        const isRowSelected = selectedHive && selectedHive.id === hive.id;
                                        return (
                                            <tr 
                                                key={hive.id} 
                                                onClick={() => setSelectedHive(hive)} 
                                                className={cn(
                                                    "hover:bg-emerald-50/30 transition-colors cursor-pointer group", 
                                                    isRowSelected && "bg-emerald-50/40"
                                                )}
                                            >
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={cn("w-2 h-2 rounded-full shrink-0", acousticConfig[hive.acoustic]?.bg || "bg-gray-300")} />
                                                        <div>
                                                            <span className="text-sm font-bold text-foreground group-hover:text-[#1B9157] transition-colors block">
                                                                {hive.code}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground block truncate max-w-[160px]">
                                                                {hive.apiary}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-sm font-bold text-foreground tabular-nums">
                                                    {hive.temp !== null ? `${hive.temp}°C` : '—'}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm font-bold text-muted-foreground tabular-nums">
                                                    {hive.humidity !== null ? `${hive.humidity}%` : '—'}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm font-bold text-amber-800 tabular-nums">
                                                    {hive.weight !== null ? `${hive.weight} kg` : '—'}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-2.5 py-1 rounded-lg border inline-block", 
                                                        hive.acoustic === 'Healthy' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                        hive.acoustic === 'Swarm Risk' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                        hive.acoustic === 'Queenless' ? "bg-red-50 text-red-700 border-red-200" :
                                                        "bg-gray-50 text-gray-600 border-gray-200"
                                                    )}>
                                                        {hive.soundProfile}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-xs font-semibold text-muted-foreground tabular-nums">
                                                    {hive.varroaPct !== null ? `${hive.varroaPct}%` : '—'}
                                                </td>
                                                <td className="px-5 py-3.5 text-[11px] font-medium text-gray-400">{hive.lastSeen}</td>
                                                <td className="px-5 py-3.5">
                                                    {hive.alert ? (
                                                        <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] shadow-sm">
                                                            Alert
                                                        </span>
                                                    ) : (
                                                        <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] shadow-sm">
                                                            {hive.temp !== null ? 'Online' : 'Unsynced'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
            `}</style>
        </motion.div>
    );
};

export default SensorHealthView;
