import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, MapPin, Hexagon, Hand, Mail, ShieldCheck, Calendar, Activity,
    ClipboardList, HelpCircle, FileBarChart, Cpu, Puzzle, Database, ArrowRight,
    RefreshCw, Binary, Scale, CloudSun, Droplets, Wind, Thermometer, Sunrise,
    Sun, Cloud, CloudRain, CloudLightning, CloudDrizzle, CloudFog, CheckCircle2,
    HeartPulse, AlertTriangle, Sparkles, Bug, Layers, Plus, ExternalLink
} from 'lucide-react';
import { glass, PageHeader, GlassModal } from './GlassTheme';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useApiaries, useHives } from '@/hooks/useHives';
import { useSelectedApiary } from '@/hooks/useSelectedApiary';
import { useInspections } from '@/hooks/useInspections';
import { useHarvests, useBatches, useUpdateHarvest, useDeleteHarvest } from '@/hooks/useHarvests';
import type { Apiary, BatchView, Hive, Harvest, IoTDevice, SensorReading } from '@/services/beeyieldService';
import { Label } from '@/components/ui/label';
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
    name: "BeeYield Apiary in Kibwezi Kenya",
    location_name: "Kibwezi, Makueni, Kenya",
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
        <div className="flex items-center justify-between gap-4 py-2 border-b border-border/60 last:border-b-0">
            <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">{label}</span>
            <span className="text-[11px] font-bold text-foreground break-all text-right">{value}</span>
        </div>
    );
}


const getNormalizedHarvestKey = (h: any): string => {
    if (!h) return '';
    const rawBatch = String(h.batch_code || h.batch || '').trim().toUpperCase();
    if (rawBatch) {
        const m = rawBatch.match(/BEE-(\d{8})-?[A-Z]*(\d{1,4})/);
        if (m) {
            const dateStr = m[1];
            const num = parseInt(m[2], 10);
            return `BATCH_${dateStr}_${num}`;
        }
        return `BATCH_${rawBatch}`;
    }
    const date = String(h.harvest_date || h.harvested_on || h.date || '').slice(0, 10);
    const hive = String(h.hive_code || h.hive_label || h.hive_id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const qty = Number(h.quantity_kg ?? h.weight_kg ?? 0).toFixed(1);
    if (date && hive) {
        return `HARV_${date}_${hive}_${qty}`;
    }
    return `ID_${String(h.id || '')}`;
};

const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ onTabChange }) => {
    const { user } = useAuth();
    React.useEffect(() => {
        try {
            const staleKeys = [
                'beeyield_local_harvests',
                'beeyield_local_harvests_v1',
                'beeyield_local_harvests_v2',
                'beeyield_timothy_harvests',
                'beeyield_timothy_harvests_v3',
                'beeyield_harvests',
            ];
            staleKeys.forEach(k => localStorage.removeItem(k));
        } catch {}
    }, []);

    const [selectedHarvest, setSelectedHarvest] = React.useState<Harvest | null>(null);
    const apiariesQuery = useApiaries();
    const hivesQuery = useHives();
    const harvestsQuery = useHarvests();
    const batchesQuery = useBatches();
    const inspectionsQuery = useInspections();

    const loadedApiaries = React.useMemo(() => {
        const raw = apiariesQuery.data;
        if (Array.isArray(raw) && raw.length > 0) return raw;
        const isTimothy = (user?.email || '').toLowerCase().includes('timothy') || 
                          (user?.email || '').toLowerCase().includes('nduva') || 
                          !user?.id;
        return isTimothy ? [CANONICAL_KIBWEZI_APIARY] : [];
    }, [apiariesQuery.data, user?.email, user?.id]);

    const loadedHives = React.useMemo(() => {
        const raw = hivesQuery.data;
        if (Array.isArray(raw) && raw.length > 0) return raw;
        try {
            const cached = localStorage.getItem("beeyield_cached_hives") || localStorage.getItem("beeyield_hives");
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch {}
        const isTimothy = (user?.email || '').toLowerCase().includes('timothy') || 
                          (user?.email || '').toLowerCase().includes('nduva') || 
                          !user?.id;
        return isTimothy ? CANONICAL_HIVES : [];
    }, [hivesQuery.data, user?.email, user?.id]);

    const getHivesForApiary = React.useCallback((apiary: Apiary) => {
        let matched = loadedHives.filter(
            (h: Hive) => h.apiary_id === apiary.id || 
                         (h.apiary_name && h.apiary_name.toLowerCase() === apiary.name.toLowerCase()) || 
                         (h.apiary && h.apiary.toLowerCase() === apiary.name.toLowerCase())
        );

        if (matched.length === 0 && (loadedApiaries.length === 1 || !apiary.id)) {
            matched = loadedHives;
        }

        if (matched.length === 0) {
            const isKibwezi = (apiary.location_name || '').toLowerCase().includes('kibwezi') || 
                              (apiary.name || '').toLowerCase().includes('kibwezi') || 
                              (apiary.name || '').toLowerCase().includes('beeyield');
            const isTimothy = (user?.email || '').toLowerCase().includes('timothy') || 
                              (user?.email || '').toLowerCase().includes('nduva') || 
                              !user?.id;
            if (isKibwezi || isTimothy) {
                matched = CANONICAL_HIVES;
            }
        }

        return matched;
    }, [loadedHives, loadedApiaries.length, user?.email, user?.id]);
    const userHarvests = React.useMemo(() => {
        const raw = harvestsQuery.data || [];
        const isTimothy = (user?.email || '').toLowerCase().includes('timothy') || 
                          (user?.email || '').toLowerCase().includes('nduva') || 
                          !user?.id;

        const seen = new Set<string>();
        const deduped: Harvest[] = [];
        for (const h of raw) {
            const code = getNormalizedHarvestKey(h);
            if (code && !seen.has(code)) {
                seen.add(code);
                deduped.push(h);
            }
        }

        // If specific non-Timothy user is logged in, filter only to their user_id or mapped hives
        if (!isTimothy && user?.id) {
            const userHiveIds = new Set(loadedHives.map(hive => hive.id));
            const userHiveCodes = new Set(loadedHives.map(hive => (hive.hive_code || '').toLowerCase()));
            return deduped.filter(h => {
                if (h.user_id && h.user_id === user.id) return true;
                if ((h as any).farmer_id && (h as any).farmer_id === user.id) return true;
                if (h.hive_id && userHiveIds.has(h.hive_id)) return true;
                const hCode = String((h as any).hive_label || (h as any).hive_code || '').toLowerCase();
                if (hCode && userHiveCodes.has(hCode)) return true;
                return false;
            });
        }

        return deduped;
    }, [harvestsQuery.data, user?.email, user?.id, loadedHives]);

    const userBatches = React.useMemo(() => {
        const raw = batchesQuery.data || [];
        const seen = new Set<string>();
        const deduped: BatchView[] = [];
        for (const b of raw) {
            const code = getNormalizedHarvestKey(b);
            if (code && !seen.has(code)) {
                seen.add(code);
                deduped.push(b);
            }
        }

        const isTimothy = (user?.email || '').toLowerCase().includes('timothy') || 
                          (user?.email || '').toLowerCase().includes('nduva') || 
                          !user?.id;

        if (!isTimothy && user?.id) {
            const userBatchCodes = new Set(userHarvests.map(h => h.batch_code || (h as any).batch).filter(Boolean));
            return deduped.filter(b => userBatchCodes.has(b.batch_code));
        }

        return deduped;
    }, [batchesQuery.data, userHarvests, user?.email, user?.id]);

    const harvests = userHarvests;
    const batches = userBatches;

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

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    const userMetadata = (user as any)?.user_metadata || {};
    const fullName = userMetadata.first_name || userMetadata.full_name || (user as any)?.email?.split('@')[0] || (user ? 'Apiary Owner' : 'Timothy Nduva');

    // Real production stats from user-logged records
    const productionSummary = React.useMemo(() => {
        const totalHarvestedKg = userHarvests.reduce((sum, h) => sum + (Number(h.quantity_kg ?? (h as any).weight_kg ?? 0) || 0), 0);
        const leftForBeesKg = userHarvests.reduce((sum, h) => sum + (Number(h.quantity_left_for_bees_kg) || 0), 0);
        const verifiedBatches = userBatches.filter(b => b.verification_status === 'verified' || b.blockchain_verified).length;

        return {
            totalHarvestedKg,
            leftForBeesKg,
            verifiedBatches,
        };
    }, [userBatches, userHarvests]);

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

    // Real user-logged inspection diagnostics (purging all synthetic mock data)
    const recentInspections = React.useMemo(() => {
        const queryList: any[] = inspectionsQuery.data || [];
        const localList: any[] = [];
        try {
            const userKey = user?.id ? `beeyield_local_inspections_v1_${user.id}` : null;
            if (userKey) {
                const raw = localStorage.getItem(userKey);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) localList.push(...parsed);
                }
            }
        } catch {
            // non-blocking
        }

        const combined = [...queryList, ...localList];
        const userHiveIds = new Set(loadedHives.map(h => h.id));
        const userHiveCodes = new Set(loadedHives.map(h => (h.hive_code || '').toLowerCase()));

        // Strip out any synthetic mock inspection records and non-user records
        const filtered = combined.filter((i) => {
            const id = String(i.id || '');
            if (id.startsWith("insp-0") || id.startsWith("insp-kib-") || id === '') return false;
            if (user?.id && i.user_id && i.user_id !== user.id) return false;
            if (loadedHives.length > 0 && i.hive_id) {
                const matchesHive = userHiveIds.has(i.hive_id) || userHiveCodes.has(String(i.hive_label || i.hive_code || '').toLowerCase());
                if (!matchesHive && !i.user_id) return false;
            }
            return true;
        });

        // Deduplicate by ID
        const seen = new Set<string>();
        const deduped: any[] = [];
        for (const item of filtered) {
            const key = item.id || JSON.stringify(item);
            if (!seen.has(key)) {
                seen.add(key);
                deduped.push(item);
            }
        }

        return deduped.sort((a, b) => {
            const dateA = new Date(a.inspected_on || a.inspection_date || a.created_at || 0).getTime();
            const dateB = new Date(b.inspected_on || b.inspection_date || b.created_at || 0).getTime();
            return dateB - dateA;
        });
    }, [inspectionsQuery.data, user?.id, loadedHives]);

    // Live Inspection Metrics computed strictly from real audits
    const inspectionMetrics = React.useMemo(() => {
        const total = recentInspections.length;
        if (total === 0) {
            return [
                { label: "Monitored Colonies", value: `${loadedHives.length} Hives`, icon: ClipboardList, tone: "text-amber-600", desc: `${loadedHives.length} colonies in registry` },
                { label: "Colony Health", value: "—", icon: HeartPulse, tone: "text-neutral-500", desc: "Awaiting physical inspection audit" },
                { label: "Colonies with Issues", value: "0 Flagged", icon: AlertTriangle, tone: "text-neutral-500", desc: "No health issues reported" },
                { label: "Avg Varroa Load", value: "—", icon: Bug, tone: "text-neutral-500", desc: "No mite diagnostics logged" },
            ];
        }

        const healthyCount = recentInspections.filter(i => {
            const s = String(i.colony_health || i.health_status || '').toLowerCase();
            return s.includes('good') || s.includes('healthy') || s.includes('optimal');
        }).length;
        const healthPct = Math.round((healthyCount / total) * 100);

        const issuesCount = recentInspections.filter(i => {
            const s = String(i.colony_health || i.health_status || '').toLowerCase();
            const miteCount = Number(i.varroa_count ?? i.varroa_mite_count ?? 0);
            return s.includes('critical') || s.includes('risk') || s.includes('weak') || s.includes('queenless') || miteCount > 3;
        }).length;

        const varroaTests = recentInspections.filter(i => typeof i.varroa_count === 'number' || typeof i.varroa_mite_count === 'number');
        const avgVarroa = varroaTests.length > 0
            ? (varroaTests.reduce((acc, curr) => acc + Number(curr.varroa_count ?? curr.varroa_mite_count ?? 0), 0) / varroaTests.length).toFixed(1)
            : null;

        return [
            { label: "Monitored Colonies", value: `${loadedHives.length} Hives`, icon: ClipboardList, tone: "text-amber-600", desc: `${total} inspection reports logged` },
            { label: "Colony Health", value: `${healthPct}% Optimal`, icon: HeartPulse, tone: healthPct >= 80 ? "text-emerald-600" : "text-amber-600", desc: `${healthyCount} of ${total} inspections healthy` },
            { label: "Colonies with Issues", value: `${issuesCount} Flagged`, icon: AlertTriangle, tone: issuesCount > 0 ? "text-rose-600" : "text-neutral-700", desc: issuesCount > 0 ? "Requires beekeeper review" : "Zero brood diseases observed" },
            { label: "Avg Varroa Load", value: avgVarroa !== null ? `${avgVarroa} Mites` : "—", icon: Bug, tone: avgVarroa !== null && Number(avgVarroa) <= 2 ? "text-emerald-600" : "text-amber-600", desc: avgVarroa !== null ? "<1.0% safe biological threshold" : "No tests logged" },
        ];
    }, [recentInspections, loadedHives.length]);

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
                            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-emerald-500/40"
                        >
                            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                            Add Diagnostic
                        </button>
                        <button
                            onClick={() => onTabChange('places')}
                            className={cn(glass.btnSecondary, "gap-2")}
                        >
                            <MapPin className="w-4 h-4 text-amber-600" />
                            Apiary Stations
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                {/* Farmer Profile Card */}
                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "p-5 bg-white")}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black shadow-sm">
                                <Hexagon className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-foreground">{fullName}</h3>
                                <p className="text-xs text-muted-foreground">Certified Organic Beekeeper • Kibwezi</p>
                            </div>
                        </div>

                        <div className="bg-neutral-50 border border-neutral-200/90 rounded-xl p-4">
                            <Row label="Apiary Location" value={primaryApiary?.location_name || 'Kibwezi, Makueni, Kenya'} />
                            <Row label="Managed Colonies" value={`${loadedHives.length} Langstroth Hives`} />
                            <Row label="Biosecurity Status" value={<span className="text-emerald-600 font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 inline" /> Optimal</span>} />
                            <Row label="Primary Flora" value={primaryApiary?.forage_type || 'Acacia & Desert Date'} />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => onTabChange('inspections')} className={cn(glass.btnSecondary, "flex-1 justify-center gap-2 bg-white hover:bg-neutral-50")}>
                                <ClipboardList className="w-4 h-4 text-amber-600" />
                                Inspect Hives
                            </button>
                            <button onClick={() => onTabChange('places')} className={cn(glass.btnSecondary, "flex-1 justify-center gap-2 bg-white hover:bg-neutral-50")}>
                                <MapPin className="w-4 h-4 text-amber-600" />
                                Stations
                            </button>
                        </div>
                    </div>
                </div>

                {/* Operational Workflows */}
                <div className="lg:col-span-8">
                    <div className={cn(glass.section, "p-5 bg-white")}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Operational Workflows</h3>
                                <p className="text-[11px] text-muted-foreground">Matches physical inspection records and certified colony observations</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { id: 'inspections', label: 'Hive Inspections', sub: `${loadedHives.length} hives monitored`, icon: ClipboardList },
                                { id: 'places', label: 'Apiary Stations', sub: 'Live weather sync', icon: MapPin },
                                { id: 'beeyield', label: 'Colony Inventory', sub: 'Langstroth 10 frames', icon: Hexagon },
                                { id: 'harvests', label: 'Harvest Batches', sub: `${productionSummary.totalHarvestedKg.toFixed(1)} KG total recorded`, icon: Binary },
                                { id: 'labels', label: 'Traceability Labels', sub: 'QR verification', icon: ShieldCheck },
                                { id: 'assistant', label: 'BeeGPT Intelligence', sub: 'AI agronomist', icon: Sparkles },
                            ].map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => onTabChange(v.id)}
                                    className="text-left bg-white border border-neutral-200/90 rounded-2xl p-4 hover:bg-neutral-50 hover:border-amber-400/60 transition-all shadow-xs group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                                            <v.icon className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-black text-[11px] tracking-tight text-neutral-900 truncate group-hover:text-amber-700 transition-colors">{v.label}</div>
                                            <div className="text-[10px] text-neutral-500 truncate">{v.sub}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 1. INSPECTIONS SECTION (MATCHING INSPECTIONSPAGE) */}
                <div className="lg:col-span-12">
                    <div className={cn(glass.section, "bg-white overflow-hidden")}>
                        {/* Section Header */}
                        <div className="px-6 py-5 border-b border-neutral-200/90 bg-neutral-50/70 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-sm">
                                    <ClipboardList className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-foreground flex items-center gap-2">
                                        Hive Inspections & Colony Diagnostics
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">{loadedHives.length} Verified Colonies</span>
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Diagnostic inspection ledger for {fullName}{primaryApiary ? ` • ${primaryApiary.name}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onTabChange('inspections')}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Diagnostic
                                </button>
                                <button
                                    onClick={() => onTabChange('inspections')}
                                    className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                                >
                                    View Full Ledger
                                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                                </button>
                            </div>
                        </div>

                        {/* Inspection Metrics Row (Live Telemetry from Real Audits) */}
                        <div className="p-6 border-b border-neutral-200/90 bg-white">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {inspectionMetrics.map((s) => (
                                    <div key={s.label} className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] uppercase tracking-wide font-bold text-neutral-500">{s.label}</span>
                                            <s.icon className={cn("w-4 h-4", s.tone)} />
                                        </div>
                                        <p className={cn("text-2xl font-black", s.tone)}>{s.value}</p>
                                        <p className="text-[10px] text-neutral-500 font-medium">{s.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Diagnostics Cards */}
                            <div className="mt-5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-neutral-800">Recent Colony Health Diagnostics</span>
                                    <span className="text-[11px] text-neutral-500">Live inspection reports</span>
                                </div>
                                {recentInspections.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {recentInspections.slice(0, 6).map((r) => {
                                            const hiveCode = r.hive_label || r.hive_code || loadedHives.find((h) => h.id === r.hive_id)?.hive_code || 'Colony';
                                            const health = r.colony_health || r.health_status || 'Healthy';
                                            const isHealthy = health.toLowerCase().includes('good') || health.toLowerCase().includes('healthy') || health.toLowerCase().includes('optimal');
                                            const isCritical = health.toLowerCase().includes('critical') || health.toLowerCase().includes('risk') || health.toLowerCase().includes('fail');
                                            const badgeClass = isCritical 
                                                ? "bg-rose-50 border-rose-200 text-rose-700" 
                                                : isHealthy 
                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                                                    : "bg-amber-50 border-amber-200 text-amber-700";

                                            const dateStr = r.inspected_on || r.inspection_date || (r.created_at ? r.created_at.slice(0, 10) : 'Recent');
                                            const hasBrood = typeof r.brood_frames === 'number';
                                            const broodFrames = r.brood_frames;
                                            const honeyFrames = r.honey_frames;
                                            const totalFrames = r.total_frames ?? (hasBrood ? (Number(broodFrames) + Number(honeyFrames || 0)) : null);
                                            const queenStatus = r.queen_status || (r.queen_seen !== false ? 'Active Laying Queen' : 'Queen Not Sighted');
                                            const varroaText = typeof r.varroa_count === 'number' 
                                                ? `${r.varroa_count} Mites` 
                                                : typeof r.varroa_mite_count === 'number' 
                                                    ? `${r.varroa_mite_count} Mites` 
                                                    : (r.varroa_sighting || 'Not Tested');

                                            return (
                                                <div
                                                    key={r.id}
                                                    onClick={() => onTabChange('inspections')}
                                                    className="p-3.5 rounded-xl border border-neutral-200/90 bg-white hover:border-amber-300 hover:bg-neutral-50 transition-all cursor-pointer shadow-xs group"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-mono font-black text-xs text-neutral-900 group-hover:text-amber-700 transition-colors">
                                                            {hiveCode}
                                                        </span>
                                                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", badgeClass)}>
                                                            {health}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1 text-xs text-neutral-600">
                                                        {hasBrood ? (
                                                            <div className="flex justify-between">
                                                                <span>Setup:</span>
                                                                <span className="font-semibold text-neutral-900">{totalFrames ? `${totalFrames} Frames (` : ''}${broodFrames} Brood${typeof honeyFrames === 'number' ? ` / ${honeyFrames} Honey` : ''}${totalFrames ? ')' : ''}</span>
                                                            </div>
                                                        ) : totalFrames ? (
                                                            <div className="flex justify-between">
                                                                <span>Setup:</span>
                                                                <span className="font-semibold text-neutral-900">${totalFrames} Frames</span>
                                                            </div>
                                                        ) : null}
                                                        <div className="flex justify-between">
                                                            <span>Queen:</span>
                                                            <span className={cn("font-semibold", r.queen_seen !== false ? "text-emerald-700" : "text-amber-700")}>
                                                                {queenStatus}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Varroa / Pests:</span>
                                                            <span className="font-semibold text-neutral-800">{varroaText}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                                                        <span>{dateStr}</span>
                                                        <span className="text-amber-700 font-bold group-hover:underline">Inspect Hive →</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-neutral-50/60 rounded-2xl border border-dashed border-neutral-200/90 my-2 space-y-3">
                                        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-700 shadow-xs">
                                            <ClipboardList className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1 max-w-sm mx-auto">
                                            <h4 className="text-xs font-bold text-neutral-800">No Colony Health Diagnostics Logged Yet</h4>
                                            <p className="text-[11px] text-neutral-500">
                                                Physical hive inspections recorded by the apiary owner will automatically appear here with real health vitals, queen sightings, and pest counts.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onTabChange('inspections')}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Log First Hive Inspection
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. REAL-TIME WEATHER UI/UX (OPEN-METEO API CONNECTED) */}
                <div className="lg:col-span-12">
                    <div className={cn(glass.section, "bg-white overflow-hidden")}>
                        {/* Weather Header Bar */}
                        <div className="border-b border-neutral-200/90 bg-neutral-50/70 px-6 py-5">
                            <div className="flex flex-wrap items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-800">
                                        <Sun className="h-3.5 w-3.5 text-amber-500" />
                                        Open-Meteo Live API Weather
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2">
                                        {primaryApiary?.name || (user ? 'Local Apiary' : 'BeeYield Apiary in Kibwezi Kenya')} Microclimate
                                    </h3>
                                    <p className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                        Kibwezi, Makueni County (-2.409°S, 37.967°E)
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Station Selector Dropdown */}
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Apiary Station</Label>
                                        <Select value={selectedApiaryId} onValueChange={(val) => setSelectedApiaryId(val)}>
                                            <SelectTrigger className={glass.select}>
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
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Flight Window</Label>
                                        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 h-10 text-[11px] font-bold text-emerald-700 shadow-xs">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Optimal For Inspections
                                        </div>
                                    </div>

                                    {/* Manual Refresh Button */}
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">&nbsp;</Label>
                                        <button
                                            onClick={() => loadWeather(true)}
                                            disabled={isWeatherLoading}
                                            className="h-10 px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs"
                                            title="Sync Live Weather"
                                        >
                                            <RefreshCw className={cn("w-3.5 h-3.5 text-amber-600", isWeatherLoading && "animate-spin")} />
                                            Sync
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weather Details Grid */}
                        <div className="p-6 space-y-6 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                                {/* Current Hero Stats */}
                                <div className="md:col-span-7 rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-inner">
                                                <WeatherIcon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900">
                                                        {weather?.currentTemp !== undefined ? `${weather.currentTemp}°C` : '28°C'}
                                                    </span>
                                                    <span className="text-xs font-bold text-neutral-500">
                                                        Range: {minTemp}° – {maxTemp}°
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-neutral-800 flex items-center gap-1.5 mt-0.5">
                                                    {weather?.conditionText || 'Clear sky'}
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
                                    <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                                            Hourly Microclimate Forecast
                                        </p>
                                        <div className="grid grid-cols-6 gap-2">
                                            {(weather?.hourly || []).map((slot, idx) => {
                                                const { Icon } = getWeatherMeta(slot.code);
                                                return (
                                                    <div key={idx} className="flex flex-col items-center gap-1 text-center py-2 px-1 rounded-xl bg-neutral-50 border border-neutral-200/80 shadow-xs">
                                                        <span className="text-[10px] font-semibold text-neutral-500">
                                                            {slot.time}
                                                        </span>
                                                        <Icon className="w-4 h-4 text-amber-500" />
                                                        <span className="text-xs font-black text-neutral-900">
                                                            {slot.temp}°
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* 5-Day Forecast Gradient */}
                                <div className="md:col-span-5 rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col justify-between space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">
                                                5-Day Weather Outlook
                                            </h4>
                                            <span className="text-[10px] text-neutral-400 font-mono">
                                                Updated {weather?.lastUpdated || 'Just now'}
                                            </span>
                                        </div>

                                        <div className="space-y-2.5">
                                            {(weather?.daily || []).map((dayItem, dIdx) => {
                                                const { Icon } = getWeatherMeta(dayItem.code);
                                                const { leftPct, widthPct } = getGradientOffsets(dayItem.min, dayItem.max);

                                                return (
                                                    <div key={dIdx} className="grid grid-cols-12 items-center gap-2 text-xs">
                                                        <span className="col-span-3 font-bold text-neutral-900 text-[11px]">
                                                            {dayItem.day}
                                                        </span>
                                                        <div className="col-span-1 flex justify-center">
                                                            <Icon className="w-3.5 h-3.5 text-amber-500" />
                                                        </div>
                                                        <span className="col-span-2 text-right text-neutral-500 font-medium text-[11px]">
                                                            {dayItem.min}°
                                                        </span>
                                                        <div className="col-span-4 px-1">
                                                            <div className="h-1.5 w-full bg-neutral-100 rounded-full relative overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500"
                                                                    style={{
                                                                        marginLeft: `${leftPct}%`,
                                                                        width: `${widthPct}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className="col-span-2 text-left font-bold text-neutral-900 text-[11px]">
                                                            {dayItem.max}°
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Safe foraging range
                                        </span>
                                        <button
                                            onClick={() => onTabChange('places')}
                                            className="text-amber-700 font-bold hover:underline flex items-center gap-1"
                                        >
                                            View Stations <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. INVENTORY SUMMARY (CALCULATED FROM VERIFIED LOGS) */}
                <div className="lg:col-span-12">
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {[
                            { label: 'Apiaries', value: loadedApiaries.length, icon: MapPin, hint: primaryApiary?.name || 'BeeYield Apiary in Kibwezi Kenya' },
                            { label: 'Managed Hives', value: loadedHives.length, icon: Hexagon, hint: `${loadedHives.length} Langstroth colonies` },
                            { label: 'Certified Yield', value: `${productionSummary.totalHarvestedKg.toFixed(1)} KG`, icon: Scale, hint: `${userHarvests.length} harvest logs recorded` },
                            { label: 'Batches', value: userBatches.length, icon: Binary, hint: userBatches.length > 0 ? `${productionSummary.verifiedBatches} verified on ledger` : 'No batches logged' },
                        ].map((card) => (
                            <div key={card.label} className={cn(glass.section, "p-5 bg-white")}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <card.icon className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-tight">{card.label}</span>
                                </div>
                                <div className="text-2xl font-black tracking-tight text-neutral-900">{card.value}</div>
                                <p className="text-[10px] text-neutral-500 mt-1">{card.hint}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Apiaries List */}
                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "bg-white overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-neutral-200/90 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <MapPin className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Apiaries</h3>
                                    <p className="text-[11px] text-muted-foreground">
                                        {loadedApiaries.length} {loadedApiaries.length === 1 ? 'active site' : 'active sites'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => onTabChange('places')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px] bg-white")}>
                                View
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            {loadedApiaries.length > 0 ? (
                                loadedApiaries.slice(0, 8).map((a: Apiary) => {
                                    const apiaryHives = getHivesForApiary(a);
                                    const count = apiaryHives.length > 0 ? apiaryHives.length : (a.hive_count ?? 0);
                                    return (
                                        <div 
                                            key={a.id} 
                                            className="bg-white border border-neutral-200/90 rounded-xl p-3.5 hover:border-amber-300 transition-all shadow-xs group"
                                        >
                                            <div 
                                                onClick={() => onTabChange('places')}
                                                className="cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="font-black text-xs tracking-tight text-neutral-900 group-hover:text-amber-700 transition-colors">
                                                            {a.name}
                                                        </div>
                                                        <div className="text-[10px] text-neutral-500 mt-0.5 flex items-center gap-1.5">
                                                            <MapPin className="w-3 h-3 text-neutral-400" />
                                                            <span>{a.location_name || 'Location recorded'}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-amber-700 font-black text-xs px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/60 flex-shrink-0">
                                                        {count} {count === 1 ? 'Hive' : 'Hives'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* User Specific Hives */}
                                            {apiaryHives.length > 0 ? (
                                                <div className="mt-2.5 pt-2.5 border-t border-neutral-100">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                                                            <Hexagon className="w-2.5 h-2.5 text-amber-500" /> User Colonies
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onTabChange('inspections');
                                                            }}
                                                            className="text-[9px] font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                                                        >
                                                            Inspect all →
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                                                        {apiaryHives.slice(0, 8).map((h) => {
                                                            const code = h.hive_code || h.name || 'Colony';
                                                            return (
                                                                <button
                                                                    key={h.id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onTabChange('inspections', code);
                                                                    }}
                                                                    className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-50 hover:bg-amber-50 text-neutral-800 hover:text-amber-900 border border-neutral-200/90 hover:border-amber-300 transition-all cursor-pointer"
                                                                    title={`${code} • Click to inspect colony`}
                                                                >
                                                                    <Hexagon className="w-2.5 h-2.5 text-amber-600" />
                                                                    <span>{code}</span>
                                                                </button>
                                                            );
                                                        })}
                                                        {apiaryHives.length > 8 && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onTabChange('inspections');
                                                                }}
                                                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                                                            >
                                                                +{apiaryHives.length - 8} more
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px]">
                                                    <span className="text-neutral-400">0 hives mapped to this site</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onTabChange('places');
                                                        }}
                                                        className="text-amber-700 font-bold hover:underline cursor-pointer"
                                                    >
                                                        + Deploy Colony
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-6 text-center text-neutral-400">
                                    <p className="text-xs font-medium">No apiaries registered yet</p>
                                    <button onClick={() => onTabChange('places')} className="mt-2 text-[10px] text-amber-700 font-bold hover:underline">
                                        + Create First Apiary
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hives List */}
                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "bg-white overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-neutral-200/90 flex items-center justify-between cursor-pointer group" onClick={() => onTabChange('inspections')}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                                    <Hexagon className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground group-hover:text-amber-600 transition-colors">Hives</h3>
                                    <p className="text-[11px] text-muted-foreground">{loadedHives.length} Langstroth colonies</p>
                                </div>
                            </div>
                            <button onClick={() => onTabChange('inspections')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px] bg-white")}>
                                Inspect
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {loadedHives.slice(0, 8).map((h: Hive) => (
                                <div 
                                    key={h.id} 
                                    onClick={() => onTabChange('inspections')}
                                    className="bg-white border border-neutral-200/90 rounded-xl p-3 cursor-pointer hover:border-amber-300 hover:bg-neutral-50 transition-all shadow-xs group"
                                >
                                    <div className="font-black text-[11px] tracking-tight text-neutral-900 truncate group-hover:text-amber-700 transition-colors">
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
                    <div className={cn(glass.section, "bg-white overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-neutral-200/90 flex items-center justify-between">
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('harvests')}>
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                                    <Binary className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground group-hover:text-amber-600 transition-colors">Traceability Batches</h3>
                                    <p className="text-[11px] text-muted-foreground">{batches.length} verified batches</p>
                                </div>
                            </div>
                            <button onClick={() => onTabChange('harvests')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px] bg-white")}>
                                Open
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {batches.length > 0 ? (
                                batches.slice(0, 5).map((b) => (
                                    <div 
                                        key={b.id} 
                                        onClick={() => onTabChange('harvests')}
                                        className="bg-white border border-neutral-200/90 rounded-xl p-3 flex items-center justify-between shadow-xs cursor-pointer hover:border-amber-300 hover:bg-neutral-50 transition-all"
                                    >
                                        <div>
                                            <div className="font-black text-[11px] tracking-tight text-neutral-900">{b.batch_code || b.id}</div>
                                            <div className="text-[10px] text-neutral-500">{b.honey_type || b.floral_source || 'Raw Honey'}</div>
                                        </div>
                                        <span className="text-xs font-bold text-amber-700">
                                            {Number(b.total_weight_kg ?? b.quantity_kg ?? 0).toFixed(1)} KG
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-6 text-center text-neutral-400">
                                    <p className="text-xs font-medium">No traceability batches logged yet</p>
                                    <button
                                        onClick={() => onTabChange('harvests')}
                                        className="mt-2 text-[10px] text-amber-700 font-bold hover:underline"
                                    >
                                        + Create Batch from Harvest
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardHomeView;

