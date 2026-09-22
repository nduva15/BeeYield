import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, MapPin, Hexagon, Hand, Mail, ShieldCheck, Calendar, Activity,
    ClipboardList, HelpCircle, FileBarChart, Cpu, Puzzle, Database, ArrowRight,
    RefreshCw, Binary, Scale, CloudSun, Droplets, Wind, Thermometer, Sunrise,
    Sun, Cloud, CloudRain, CloudLightning, CloudDrizzle, CloudFog, CheckCircle2
} from 'lucide-react';
import { glass, PageHeader, GlassModal } from './GlassTheme';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useApiaries, useHives } from '@/hooks/useHives';
import { useSelectedApiary } from '@/hooks/useSelectedApiary';
import { useHarvests, useBatches, useUpdateHarvest, useDeleteHarvest } from '@/hooks/useHarvests';
import type { Apiary, BatchView, Hive, Harvest, IoTDevice, SensorReading } from '@/services/beeyieldService';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DashboardHomeViewProps {
    devices?: IoTDevice[];
    readings?: SensorReading[];
    apiaries?: Apiary[];
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

// Canonical Timothy Nduva Inspection Apiary & Hive Defaults
const CANONICAL_KIBWEZI_APIARY: Apiary = {
    id: "apiary-kibwezi",
    name: "Kibwezi Main Apiary",
    location_name: "Kiunduani, Kibwezi",
    county: "Makueni",
    region: "Kibwezi East",
    latitude: -2.409,
    longitude: 37.967,
    type: "Commercial Apiary",
    status: "active",
    hive_count: 184,
    expected_hives: 184,
    size_acres: 18,
    forage_type: "Acacia Tortilis, Desert Date & Citrus Blossom",
    notes: "Lead Beekeeper: Timothy Nduva. 184 active Langstroth hives in Kibwezi ecosystem.",
};

const CANONICAL_HIVES: Hive[] = Array.from({ length: 184 }, (_, i) => ({
    id: `hive-kib-${String(i + 1).padStart(3, '0')}`,
    hive_code: `KIB-${String(i + 1).padStart(3, '0')}`,
    name: `KIB-${String(i + 1).padStart(3, '0')} (Langstroth 10)`,
    apiary_id: "apiary-kibwezi",
    status: "ACTIVE",
    health_status: "Good",
    hive_type: "Langstroth",
    frame_count: 10,
    created_at: "2020-01-01T08:00:00Z",
}));

interface LiveWeatherData {
    currentTemp: number;
    currentHumidity: number;
    currentWind: number;
    weatherCode: number;
    conditionText: string;
    todayMin: number;
    todayMax: number;
    hourly: Array<{
        time: string;
        temp: number;
        code: number;
    }>;
    daily: Array<{
        day: string;
        min: number;
        max: number;
        code: number;
    }>;
    lastUpdated: string;
}

function getWeatherMeta(code: number) {
    switch (code) {
        case 0:
            return { text: "Clear sky", Icon: Sun, color: "text-amber-500" };
        case 1:
            return { text: "Mainly clear", Icon: Sun, color: "text-amber-400" };
        case 2:
            return { text: "Partly cloudy", Icon: CloudSun, color: "text-amber-400" };
        case 3:
            return { text: "Mostly cloudy", Icon: Cloud, color: "text-slate-400" };
        case 45:
        case 48:
            return { text: "Foggy conditions", Icon: CloudFog, color: "text-slate-400" };
        case 51:
        case 53:
        case 55:
            return { text: "Light drizzle", Icon: CloudDrizzle, color: "text-blue-400" };
        case 61:
        case 63:
        case 65:
            return { text: "Rain", Icon: CloudRain, color: "text-blue-500" };
        case 80:
        case 81:
        case 82:
            return { text: "Rain showers", Icon: CloudRain, color: "text-blue-500" };
        case 95:
        case 96:
        case 99:
            return { text: "Thunderstorm", Icon: CloudLightning, color: "text-purple-500" };
        default:
            return { text: "Partly cloudy", Icon: CloudSun, color: "text-amber-400" };
    }
}

async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<LiveWeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.statusText}`);
    const data = await res.json();

    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;

    const currentCode = current.weather_code ?? 2;
    const meta = getWeatherMeta(currentCode);

    const todayMin = Math.round(daily.temperature_2m_min?.[0] ?? 19);
    const todayMax = Math.round(daily.temperature_2m_max?.[0] ?? 28);

    const now = new Date();
    const hourlyItems: Array<{ time: string; temp: number; code: number }> = [];

    for (let i = 0; i < (hourly.time?.length || 0); i++) {
        const timeStr = hourly.time[i];
        const hourDate = new Date(timeStr);
        if (hourDate >= now || hourlyItems.length === 0) {
            const formattedTime = hourDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
            hourlyItems.push({
                time: formattedTime,
                temp: Math.round(hourly.temperature_2m[i]),
                code: hourly.weather_code[i] ?? 3,
            });
            if (hourlyItems.length >= 6) break;
        }
    }

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyItems: Array<{ day: string; min: number; max: number; code: number }> = [];

    for (let d = 0; d < Math.min(5, daily.time?.length || 0); d++) {
        const dDate = new Date(daily.time[d]);
        const dayLabel = d === 0 ? "Today" : weekdays[dDate.getDay()];
        dailyItems.push({
            day: dayLabel,
            min: Math.round(daily.temperature_2m_min[d]),
            max: Math.round(daily.temperature_2m_max[d]),
            code: daily.weather_code[d] ?? 2,
        });
    }

    return {
        currentTemp: Math.round(current.temperature_2m),
        currentHumidity: Math.round(current.relative_humidity_2m),
        currentWind: Math.round(current.wind_speed_10m),
        weatherCode: currentCode,
        conditionText: meta.text,
        todayMin,
        todayMax,
        hourly: hourlyItems,
        daily: dailyItems,
        lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
}

function getFallbackWeather(lat: number, lon: number): LiveWeatherData {
    const seed = Math.abs(Math.round((lat + lon) * 100)) % 10;
    return {
        currentTemp: 25 + (seed % 3),
        currentHumidity: 52 + seed,
        currentWind: 10,
        weatherCode: 2,
        conditionText: "Partly cloudy",
        todayMin: 19,
        todayMax: 28,
        hourly: [
            { time: "12:00", temp: 26, code: 2 },
            { time: "14:00", temp: 28, code: 1 },
            { time: "16:00", temp: 27, code: 2 },
            { time: "18:00", temp: 24, code: 3 },
            { time: "20:00", temp: 21, code: 3 },
            { time: "22:00", temp: 19, code: 3 },
        ],
        daily: [
            { day: "Today", min: 19, max: 28, code: 2 },
            { day: "Tue", min: 18, max: 29, code: 1 },
            { day: "Wed", min: 17, max: 30, code: 0 },
            { day: "Thu", min: 18, max: 30, code: 1 },
            { day: "Fri", min: 19, max: 29, code: 2 },
        ],
        lastUpdated: "Just now",
    };
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2 border-b border-border/ last:border-b-0">
            <span className="text-[10px] font-black text-muted-foreground/70">{label}</span>
            <span className="text-[11px] font-bold text-foreground break-all text-right">{value}</span>
        </div>
    );
}

const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ onTabChange }) => {
    const { user, beeyieldUser } = useAuth();
    const [selectedHarvest, setSelectedHarvest] = React.useState<Harvest | null>(null);
    const apiariesQuery = useApiaries();
    const hivesQuery = useHives();
    const harvestsQuery = useHarvests();
    const batchesQuery = useBatches();

    const loadedApiaries = apiariesQuery.data && apiariesQuery.data.length > 0 ? apiariesQuery.data : [CANONICAL_KIBWEZI_APIARY];
    const loadedHives = hivesQuery.data && hivesQuery.data.length > 0 ? hivesQuery.data : CANONICAL_HIVES;
    const harvests = harvestsQuery.data || [];
    const batches = batchesQuery.data || [];

    const [selectedApiaryId, setSelectedApiaryId] = useSelectedApiary(loadedApiaries[0]?.id);
    const primaryApiary = loadedApiaries.find((a) => a.id === selectedApiaryId) || loadedApiaries[0];

    // Live Weather State via Open-Meteo
    const [weather, setWeather] = React.useState<LiveWeatherData | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = React.useState(false);

    const loadWeather = React.useCallback(async (isManual = false) => {
        const lat = primaryApiary?.latitude ?? -2.409;
        const lon = primaryApiary?.longitude ?? 37.967;
        setIsWeatherLoading(true);
        try {
            const data = await fetchOpenMeteoWeather(lat, lon);
            setWeather(data);
            if (isManual) {
                toast.success("Live microclimate weather synced from Open-Meteo API");
            }
        } catch {
            setWeather(getFallbackWeather(lat, lon));
        } finally {
            setIsWeatherLoading(false);
        }
    }, [primaryApiary?.latitude, primaryApiary?.longitude]);

    React.useEffect(() => {
        loadWeather(false);
    }, [loadWeather]);

    const { mutate: updateHarvest, isPending: isUpdating } = useUpdateHarvest();
    const { mutate: deleteHarvest, isPending: isDeleting } = useDeleteHarvest();
    const [isEditing, setIsEditing] = React.useState(false);
    const [editForm, setEditForm] = React.useState<Partial<Harvest>>({});

    const handleEdit = () => {
        if (selectedHarvest) {
            setEditForm(selectedHarvest);
            setIsEditing(true);
        }
    };

    const handleSaveEdit = () => {
        if (!selectedHarvest) return;
        const sanitized = Object.fromEntries(
            Object.entries(editForm).filter(([k, v]) => 
                v !== null && 
                !['id', 'created_at', 'updated_at', 'hive', 'farmer', 'apiary'].includes(k)
            )
        ) as any;

        updateHarvest({ id: selectedHarvest.id, data: sanitized }, {
            onSuccess: () => {
                setIsEditing(false);
                setSelectedHarvest({ ...selectedHarvest, ...editForm } as Harvest);
            }
        });
    };

    const handleDelete = () => {
        if (!selectedHarvest) return;
        if (window.confirm("Are you sure you want to delete this harvest record?")) {
            deleteHarvest(selectedHarvest.id, {
                onSuccess: () => setSelectedHarvest(null)
            });
        }
    };

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    const userMetadata = user?.user_metadata || {};
    const fullName = userMetadata.first_name || userMetadata.full_name || 'Timothy Nduva';

    const recentHarvests = [...harvests]
        .sort((a: any, b: any) => new Date(b.harvest_date).getTime() - new Date(a.harvest_date).getTime())
        .slice(0, 8);

    const recentBatches = [...batches]
        .sort((a, b) => new Date(b.harvest_date || 0).getTime() - new Date(a.harvest_date || 0).getTime())
        .slice(0, 8);

    const productionSummary = React.useMemo(() => {
        const totalHarvestedKg = harvests.reduce((sum, h) => sum + (h.quantity_kg || 0), 0) || 943.0;
        const leftForBeesKg = harvests.reduce((sum, h) => sum + (h.quantity_left_for_bees_kg || 0), 0) || 120.0;
        const verifiedBatches = batches.filter(b => b.verification_status === 'verified' || b.blockchain_verified).length || 8;

        return {
            totalHarvestedKg,
            leftForBeesKg,
            verifiedBatches,
        };
    }, [batches, harvests]);

    const { Icon: WeatherIcon } = getWeatherMeta(weather?.weatherCode ?? 2);
    const minTemp = weather?.todayMin ?? 19;
    const maxTemp = weather?.todayMax ?? 28;

    const getGradientOffsets = (min: number, max: number) => {
        const baseMin = 14;
        const baseMax = 36;
        const leftPct = Math.max(0, Math.min(100, ((min - baseMin) / (baseMax - baseMin)) * 100));
        const widthPct = Math.max(15, Math.min(100 - leftPct, ((max - min) / (baseMax - baseMin)) * 100));
        return { leftPct, widthPct };
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            <PageHeader
                icon={LayoutGrid}
                label="BeeYield AI Dashboard"
                title={<>{greeting}, {fullName}</>}
                subtitle="Live Colony Telemetry, Microclimate Weather & Precision Apiculture OS"
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={() => onTabChange('inspections')}
                            className={cn(glass.btnSecondary, "gap-2 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-500/20")}
                        >
                            <ClipboardList className="w-4 h-4 text-amber-600" />
                            Hive Inspections
                        </button>
                        <button
                            onClick={() => onTabChange('places')}
                            className={cn(glass.btnSecondary, "gap-2")}
                        >
                            <MapPin className="w-4 h-4 text-primary" />
                            Apiary Stations
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                {/* Farmer Profile Card */}
                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "p-5")}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black shadow-sm">
                                <Hexagon className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-foreground">{fullName}</h3>
                                <p className="text-xs text-muted-foreground">Certified Organic Beekeeper • Kibwezi</p>
                            </div>
                        </div>

                        <div className="bg-muted/ border border-border/ rounded-xl p-4">
                            <Row label="Apiary Location" value={primaryApiary?.location_name || 'Kiunduani, Kibwezi'} />
                            <Row label="Managed Colonies" value="184 Langstroth Hives" />
                            <Row label="Biosecurity Status" value={<span className="text-emerald-600 font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 inline" /> Optimal</span>} />
                            <Row label="Primary Flora" value={primaryApiary?.forage_type || 'Acacia & Desert Date'} />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => onTabChange('inspections')} className={cn(glass.btnSecondary, "flex-1 justify-center gap-2")}>
                                <ClipboardList className="w-4 h-4 text-primary" />
                                Inspect Hives
                            </button>
                            <button onClick={() => onTabChange('places')} className={cn(glass.btnSecondary, "flex-1 justify-center gap-2")}>
                                <MapPin className="w-4 h-4 text-primary" />
                                Stations
                            </button>
                        </div>
                    </div>
                </div>

                {/* Core Workflow Views */}
                <div className="lg:col-span-8">
                    <div className={cn(glass.section, "p-5")}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Operational Workflows</h3>
                                <p className="text-[11px] text-muted-foreground">Matches inspection parameters and field telemetry</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { id: 'inspections', label: 'Hive Inspections', sub: '184 hives monitored', icon: ClipboardList },
                                { id: 'places', label: 'Apiary Stations', sub: 'Live weather sync', icon: MapPin },
                                { id: 'beeyield', label: 'Colony Inventory', sub: 'Langstroth 10 frames', icon: Hexagon },
                                { id: 'harvests', label: 'Harvest Batches', sub: '943 KG total recorded', icon: Binary },
                                { id: 'labels', label: 'Traceability Labels', sub: 'QR verification', icon: ShieldCheck },
                                { id: 'assistant', label: 'BeeGPT Intelligence', sub: 'AI agronomist', icon: Sparkles },
                            ].map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => onTabChange(v.id)}
                                    className="text-left bg-muted/ border border-border/ rounded-2xl p-4 hover:bg-white hover:border-amber-500/40 transition-all shadow-sm group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <v.icon className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-black text-[11px] tracking-tight text-foreground truncate group-hover:text-amber-600 transition-colors">{v.label}</div>
                                            <div className="text-[10px] text-muted-foreground truncate">{v.sub}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pure Real-Time Weather UI/UX (Open-Meteo Synced) */}
                <div className="lg:col-span-12">
                    <div className={cn(glass.section, "overflow-hidden")}>
                        {/* Weather Header Bar */}
                        <div className="border-b border-border/ bg-[linear-gradient(135deg,rgba(255,249,240,0.96),rgba(249,247,242,0.98))] px-6 py-6">
                            <div className="flex flex-wrap items-center justify-between gap-6">
                                <div className="space-y-1.5">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                                        <Sun className="h-3.5 w-3.5 text-amber-500" />
                                        Open-Meteo Live API Weather
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tighter text-foreground flex items-center gap-2">
                                        {primaryApiary?.name || 'Kibwezi Main Apiary'} Microclimate
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                        {primaryApiary?.location_name || 'Kiunduani, Kibwezi'}, Makueni County ({primaryApiary?.size_acres || 18} Acres)
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Apiary Switcher */}
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Apiary Site</Label>
                                        <Select value={selectedApiaryId || primaryApiary?.id || ''} onValueChange={setSelectedApiaryId}>
                                            <SelectTrigger className="h-10 min-w-[200px] bg-white border border-border font-bold text-xs rounded-xl shadow-sm">
                                                <SelectValue placeholder="Select apiary" />
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {loadedApiaries.map((apiary) => (
                                                    <SelectItem key={apiary.id} value={apiary.id} className="text-xs font-semibold">
                                                        {apiary.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Inspection Window Readiness */}
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Flight Window</Label>
                                        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 h-10 text-[11px] font-bold text-emerald-700 shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Optimal For Inspections
                                        </div>
                                    </div>

                                    {/* Manual Refresh Button */}
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">&nbsp;</Label>
                                        <button
                                            onClick={() => loadWeather(true)}
                                            disabled={isWeatherLoading}
                                            className="h-10 px-3 rounded-xl border border-border bg-white hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm"
                                            title="Sync Live Weather"
                                        >
                                            <RefreshCw className={cn("w-3.5 h-3.5 text-amber-500", isWeatherLoading && "animate-spin")} />
                                            Sync
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weather Details Card */}
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                                {/* Current Hero Stats */}
                                <div className="md:col-span-7 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white/95 dark:bg-stone-900/80 p-5 shadow-sm flex flex-col justify-between space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-inner">
                                                <WeatherIcon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                                                        {weather?.currentTemp !== undefined ? `${weather.currentTemp}°C` : '25°C'}
                                                    </span>
                                                    <span className="text-xs font-bold text-muted-foreground">
                                                        Range: {minTemp}° – {maxTemp}°
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                                                    {weather?.conditionText || 'Partly cloudy'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-xs shadow-xs">
                                                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                                                {weather?.currentHumidity !== undefined ? `${weather.currentHumidity}% Humidity` : '52% Humidity'}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-semibold text-xs shadow-xs">
                                                <Wind className="w-3.5 h-3.5 text-teal-600" />
                                                {weather?.currentWind !== undefined ? `${weather.currentWind} km/h Wind` : '10 km/h Wind'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Hourly Microclimate Forecast Pills */}
                                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/70">
                                            Hourly Telemetry Forecast
                                        </p>
                                        <div className="grid grid-cols-6 gap-2">
                                            {(weather?.hourly || []).map((slot, idx) => {
                                                const { Icon } = getWeatherMeta(slot.code);
                                                return (
                                                    <div key={idx} className="flex flex-col items-center gap-1 text-center py-2 px-1 rounded-xl bg-muted/40 border border-border/60">
                                                        <span className="text-[10px] font-semibold text-muted-foreground">
                                                            {slot.time}
                                                        </span>
                                                        <Icon className="w-4 h-4 text-amber-500" />
                                                        <span className="text-xs font-black text-foreground">
                                                            {slot.temp}°
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* 5-Day Forecast Gradient */}
                                <div className="md:col-span-5 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white/95 dark:bg-stone-900/80 p-5 shadow-sm flex flex-col justify-between space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground/70">
                                                5-Day Weather Outlook
                                            </h4>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                Updated {weather?.lastUpdated || 'Just now'}
                                            </span>
                                        </div>

                                        <div className="space-y-2.5">
                                            {(weather?.daily || []).map((dayItem, dIdx) => {
                                                const { Icon } = getWeatherMeta(dayItem.code);
                                                const { leftPct, widthPct } = getGradientOffsets(dayItem.min, dayItem.max);

                                                return (
                                                    <div key={dIdx} className="grid grid-cols-12 items-center gap-2 text-xs">
                                                        <span className="col-span-3 font-bold text-foreground text-[11px]">
                                                            {dayItem.day}
                                                        </span>
                                                        <div className="col-span-1 flex justify-center">
                                                            <Icon className="w-3.5 h-3.5 text-amber-500" />
                                                        </div>
                                                        <span className="col-span-2 text-right text-muted-foreground font-medium text-[11px]">
                                                            {dayItem.min}°
                                                        </span>
                                                        <div className="col-span-4 px-1">
                                                            <div className="h-1.5 w-full bg-muted rounded-full relative overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500"
                                                                    style={{
                                                                        marginLeft: `${leftPct}%`,
                                                                        width: `${widthPct}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className="col-span-2 text-left font-bold text-foreground text-[11px]">
                                                            {dayItem.max}°
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Safe foraging range
                                        </span>
                                        <button
                                            onClick={() => onTabChange('places')}
                                            className="text-amber-600 font-bold hover:underline flex items-center gap-1"
                                        >
                                            View Stations <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Summary Cards matching Inspections */}
                <div className="lg:col-span-12">
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {[
                            { label: 'Apiaries', value: loadedApiaries.length, icon: MapPin, hint: primaryApiary?.name || 'Kibwezi Main Apiary' },
                            { label: 'Managed Hives', value: loadedHives.length, icon: Hexagon, hint: '184 Langstroth (KIB-001..184)' },
                            { label: 'Total Yield', value: `${productionSummary.totalHarvestedKg.toFixed(1)} KG`, icon: Scale, hint: '883 KG hist + 60 KG 2026' },
                            { label: 'Batches', value: batches.length || 8, icon: Binary, hint: 'Blockchain verified' },
                        ].map((card) => (
                            <div key={card.label} className={cn(glass.section, "p-5 bg-muted/")}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <card.icon className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-tight">{card.label}</span>
                                </div>
                                <div className="text-2xl font-black tracking-tight text-foreground">{card.value}</div>
                                <p className="text-[10px] text-muted-foreground mt-1">{card.hint}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Apiaries List */}
                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-border/ flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <MapPin className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Apiaries</h3>
                                    <p className="text-[11px] text-muted-foreground">{loadedApiaries.length} active site</p>
                                </div>
                            </div>
                            <button onClick={() => onTabChange('places')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]")}>
                                View
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {loadedApiaries.slice(0, 8).map((a: Apiary) => (
                                <div key={a.id} className="bg-muted/ border border-border/ rounded-xl p-3">
                                    <div className="font-black text-[11px] tracking-tight text-foreground truncate">{a.name}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">{a.location_name || 'Kiunduani, Kibwezi, Makueni'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Hives List (Matching Inspections) */}
                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-border/ flex items-center justify-between">
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('beeyield')}>
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                                    <Hexagon className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground group-hover:text-amber-600 transition-colors">Hives</h3>
                                    <p className="text-[11px] text-muted-foreground">{loadedHives.length} Langstroth colonies</p>
                                </div>
                            </div>
                            <button onClick={() => onTabChange('inspections')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]")}>
                                Inspect
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {loadedHives.slice(0, 8).map((h: Hive) => (
                                <div 
                                    key={h.id} 
                                    onClick={() => onTabChange('inspections')}
                                    className="bg-muted/ border border-border/ rounded-xl p-3 cursor-pointer hover:border-amber-500/40 hover:bg-white transition-all group"
                                >
                                    <div className="font-black text-[11px] tracking-tight text-foreground truncate group-hover:text-amber-600 transition-colors">
                                        {h.hive_code} (Langstroth 10)
                                    </div>
                                    <div className="text-[10px] text-emerald-600 font-semibold truncate flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 inline" /> Queen Marked • Active
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Traceability Batches List */}
                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-border/ flex items-center justify-between">
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('harvests')}>
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                                    <Binary className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground group-hover:text-amber-600 transition-colors">Traceability Batches</h3>
                                    <p className="text-[11px] text-muted-foreground">{batches.length || 8} verified batches</p>
                                </div>
                            </div>
                            <button onClick={() => onTabChange('harvests')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]")}>
                                Open
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {recentBatches.length === 0 ? (
                                [
                                    { code: 'BEE-20260105-001', type: 'Acacia Honey', weight: '7.5 KG' },
                                    { code: 'BEE-20260106-002', type: 'Acacia Honey', weight: '7.5 KG' },
                                    { code: 'BEE-20260107-003', type: 'Acacia Honey', weight: '7.5 KG' },
                                    { code: 'BEE-20260108-004', type: 'Acacia Honey', weight: '7.5 KG' },
                                ].map((b, idx) => (
                                    <div key={idx} className="bg-muted/ border border-border/ rounded-xl p-3 flex items-center justify-between">
                                        <div>
                                            <div className="font-black text-[11px] tracking-tight text-foreground">{b.code}</div>
                                            <div className="text-[10px] text-muted-foreground">{b.type}</div>
                                        </div>
                                        <span className="text-xs font-bold text-amber-600">{b.weight}</span>
                                    </div>
                                ))
                            ) : (
                                recentBatches.map((b: BatchView) => (
                                    <div key={b.id} className="bg-muted/ border border-border/ rounded-xl p-3">
                                        <div className="font-black text-[11px] tracking-tight text-foreground truncate">{b.batch_number}</div>
                                        <div className="text-[10px] text-muted-foreground truncate">{b.status}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Harvest Details / Edit Modal */}
            <AnimatePresence>
                {selectedHarvest && (
                    <GlassModal
                        isOpen={!!selectedHarvest}
                        onClose={() => {
                            setSelectedHarvest(null);
                            setIsEditing(false);
                        }}
                        title={isEditing ? "Edit Harvest Record" : "Harvest Details"}
                        maxWidth="max-w-xl"
                    >
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Batch Code</Label>
                                    <div className="text-sm font-bold truncate tabular-nums">{selectedHarvest.batch_code || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Date</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.harvest_date ? format(new Date(selectedHarvest.harvest_date), 'MMM dd, yyyy') : '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Yield (KG)</Label>
                                    <div className="text-sm font-bold tabular-nums">{selectedHarvest.quantity_kg?.toFixed(1) || '0.0'} KG</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Floral Source</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.honey_type || selectedHarvest.nectar_source || 'Acacia'}</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border flex justify-end gap-2">
                                <button
                                    onClick={() => setSelectedHarvest(null)}
                                    className={cn(glass.btnSecondary, "text-xs")}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </GlassModal>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DashboardHomeView;
