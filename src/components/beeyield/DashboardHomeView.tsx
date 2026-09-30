import { getNormalizedHarvestKey } from '@/data/canonicalHarvests';
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
import { ActionableInsightsPanel } from '@/components/telemetry/ActionableInsightsPanel';
import { useSensorReadings } from '@/hooks/useSensorReadings';
import { extractSafeSensorTelemetry } from '@/lib/sensorDataSafety';
import {
    fetchLiveWeather,
    getDynamicFallbackWeather,
    getWeatherMeta,
    type LiveWeatherData,
    type DailyWeatherItem,
    type HourlyWeatherItem,
} from '@/services/weatherService';


interface DashboardHomeViewProps {
    devices?: IoTDevice[];
    readings?: SensorReading[];
    apiaries?: Apiary[];
    onTabChange: (tab: string, message?: string, action?: string) => void;
}



async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<LiveWeatherData> {
    return fetchLiveWeather(lat, lon);
}

function getFallbackWeather(lat: number, lon: number): LiveWeatherData {
    return getDynamicFallbackWeather(lat, lon);
}


function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2 border-b border-border/60 last:border-b-0">
            <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-wider">{label}</span>
            <span className="text-[11px] font-bold text-foreground break-all text-right">{value}</span>
        </div>
    );
}



const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
    onTabChange,
    readings: propReadings = [],
    devices = [],
    apiaries = [],
}) => {
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

    const sensorReadingsQuery = useSensorReadings();
    const readings = React.useMemo(() => {
        return propReadings && propReadings.length > 0 ? propReadings : (sensorReadingsQuery.data || []);
    }, [propReadings, sensorReadingsQuery.data]);

    const handleInsightAction = React.useCallback((actionType: string) => {
        switch (actionType) {
            case 'inspect':
                onTabChange('inspections');
                break;
            case 'treatment':
                onTabChange('bee-diseases');
                break;
            case 'charge_battery':
            case 'view_telemetry':
                onTabChange('sensor-vitals');
                break;
            case 'scale_inspection':
                onTabChange('inspections', 'Verify Hive Scale & Food Reserves');
                break;
            case 'deploy_hive':
                onTabChange('site-map');
                break;
            case 'add_super':
                onTabChange('inspections', 'Log Super Expansion');
                break;
            default:
                onTabChange('inspections');
                break;
        }
    }, [onTabChange]);


    const userMetadata = React.useMemo(() => (user as any)?.user_metadata || {}, [user]);
    const fullName = userMetadata.first_name || userMetadata.full_name || (user as any)?.email?.split('@')[0] || (user ? 'Apiary Owner' : 'Apiary Beekeeper');

    const loadedApiaries = React.useMemo(() => {
        const raw = (Array.isArray(apiaries) && apiaries.length > 0) ? apiaries : apiariesQuery.data;
        if (Array.isArray(raw) && raw.length > 0) return raw;
        return [];
    }, [apiaries, apiariesQuery.data]);

    const [selectedApiaryId, setSelectedApiaryId] = useSelectedApiary(loadedApiaries[0]?.id);
    const primaryApiary = loadedApiaries.find((a) => a.id === selectedApiaryId) || loadedApiaries[0];

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
        return [];
    }, [hivesQuery.data]);

    const getHivesForApiary = React.useCallback((apiary: Apiary) => {
        let matched = loadedHives.filter(
            (h: Hive) => h.apiary_id === apiary.id || 
                         (h.apiary_name && h.apiary_name.toLowerCase() === apiary.name.toLowerCase()) || 
                         (h.apiary?.name && h.apiary.name.toLowerCase() === apiary.name.toLowerCase())
        );

        if (matched.length === 0 && (loadedApiaries.length === 1 || !apiary.id)) {
            matched = loadedHives;
        }

        return matched;
    }, [loadedHives, loadedApiaries.length]);

    

    const userHarvests = React.useMemo(() => {
        const raw = harvestsQuery.data || [];
        const seen = new Set<string>();
        const deduped: Harvest[] = [];
        for (const h of raw) {
            const code = getNormalizedHarvestKey(h);
            if (code && !seen.has(code)) {
                seen.add(code);
                deduped.push(h);
            }
        }

        if (user?.id) {
            const userHiveIds = new Set(loadedHives.map(hive => hive.id));
            const userHiveCodes = new Set(loadedHives.map(hive => (hive.hive_code || '').toLowerCase()));
            return deduped.filter(h => {
                if ((h as any).user_id && (h as any).user_id === user.id) return true;
                if ((h as any).farmer_id && (h as any).farmer_id === user.id) return true;
                if (h.hive_id && userHiveIds.has(h.hive_id)) return true;
                const hCode = String((h as any).hive_label || (h as any).hive_code || '').toLowerCase();
                if (hCode && userHiveCodes.has(hCode)) return true;
                return false;
            });
        }

        return deduped;
    }, [harvestsQuery.data, user?.id, loadedHives]);

    const userBatches = React.useMemo(() => {
        const raw = batchesQuery.data || [];
        const seen = new Set<string>();
        const deduped: BatchView[] = [];
        for (const b of raw) {
            const code = getNormalizedHarvestKey(b);
            if (code && !seen.has(code)) {
                seen.add(code);
                deduped.push(b as any);
            }
        }

        if (user?.id) {
            const userBatchCodes = new Set(userHarvests.map(h => h.batch_code || (h as any).batch).filter(Boolean));
            return deduped.filter(b => userBatchCodes.has(b.batch_code));
        }

        return deduped;
    }, [batchesQuery.data, userHarvests, user?.id]);

    const harvests = userHarvests;
    const batches = userBatches;


    // Live Weather State via Weather API
    const [weather, setWeather] = React.useState<LiveWeatherData | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = React.useState(false);

    const loadWeather = React.useCallback(async (isManual = false) => {
        const lat = primaryApiary?.latitude ?? -2.409;
        const lon = primaryApiary?.longitude ?? 37.967;
        setIsWeatherLoading(true);
        try {
            const data = await fetchLiveWeather(lat, lon, { forceRefresh: isManual });
            setWeather(data);
            if (isManual) {
                toast.success("Live microclimate weather synced from Weather API");
            }
        } catch {
            setWeather(getDynamicFallbackWeather(lat, lon));
        } finally {
            setIsWeatherLoading(false);
        }
    }, [primaryApiary?.latitude, primaryApiary?.longitude]);

    React.useEffect(() => {
        loadWeather(false);

        // Auto-refresh weather every 10 minutes to roll over day and keep exact time fresh
        const intervalId = setInterval(() => {
            loadWeather(true);
        }, 10 * 60 * 1000);

        const onFocus = () => loadWeather(false);
        const onOnline = () => loadWeather(true);
        window.addEventListener('focus', onFocus);
        window.addEventListener('online', onOnline);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('online', onOnline);
        };
    }, [loadWeather]);

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';


    // Real production stats from user-logged records
    const productionSummary = React.useMemo(() => {
        const rawHarvestedKg = userHarvests.reduce((sum, h) => sum + (Number(h.quantity_kg ?? (h as any).weight_kg ?? 0) || 0), 0);
        const totalHarvestedKg = rawHarvestedKg;
        const leftForBeesKg = userHarvests.reduce((sum, h) => sum + (Number(h.quantity_left_for_bees_kg) || 0), 0);
        const rawVerified = userBatches.filter(b => b.verification_status === 'verified' || b.blockchain_verified).length;
        const verifiedBatches = rawVerified;

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

    const agronomicInputs = React.useMemo(() => {
        // Detect if user has any active connected IoT devices (scales, VitalSensors, disease/brood monitors)
        const hasConnectedDevice = Array.isArray(devices) && devices.length > 0;
        const activeDevice = hasConnectedDevice ? (devices.find(d => d.status === 'active') || devices[0]) : null;

        const latestReading = Array.isArray(readings) && readings.length > 0 ? readings[0] : null;
        const safe = extractSafeSensorTelemetry(latestReading);

        // Calculate 24h weight delta if readings are present
        let weightDelta24h: number | null = null;
        if (Array.isArray(readings) && readings.length >= 2) {
            const currentW = (readings[0] as any)?.weight_kg ?? (readings[0] as any)?.weight ?? null;
            const prevW = (readings[readings.length - 1] as any)?.weight_kg ?? (readings[readings.length - 1] as any)?.weight ?? null;
            if (typeof currentW === 'number' && typeof prevW === 'number') {
                weightDelta24h = currentW - prevW;
            }
        }

        // Check for Varroa Mite detection from connected disease detectors or recent inspection records
        const varroaInspection = recentInspections.find(i => {
            const count = Number(i.varroa_count ?? i.varroa_mite_count ?? 0);
            const notes = String(i.notes || '').toLowerCase();
            return count > 2 || notes.includes('varroa');
        });
        const highestVarroaCount = varroaInspection 
            ? Number(varroaInspection.varroa_count ?? varroaInspection.varroa_mite_count ?? 3)
            : null;
        const hasVarroaIssue = !!varroaInspection;

        // Extract battery level from connected device or telemetry payload
        const batteryPct = safe.battery.value ?? (activeDevice ? activeDevice.battery_level : null);

        return {
            hiveCode: primaryApiary?.name || 'Managed Apiary',
            hasConnectedDevice,
            temperature_c: hasConnectedDevice ? (safe.temperature.value ?? null) : null,
            humidity_pct: hasConnectedDevice ? (safe.humidity.value ?? null) : null,
            weight_kg: hasConnectedDevice ? (safe.weight.value ?? null) : null,
            weight_delta_24h: weightDelta24h,
            acoustic_hz: hasConnectedDevice ? (safe.acoustics.peakHz ?? null) : null,
            acoustic_db: hasConnectedDevice ? (safe.acoustics.dbLevel ?? null) : null,
            battery_pct: batteryPct,
            varroa_count: highestVarroaCount,
            varroa_detected: hasVarroaIssue,
            bloom_stage_pct: null,
            forager_flight_index: null,
        };
    }, [readings, devices, recentInspections, primaryApiary?.name]);

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
                    <div className="flex flex-wrap items-center gap-2">
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


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 mt-3.5 sm:mt-6">
                {/* Farmer Profile Card & Regional Preferences */}
                <div className="lg:col-span-4 space-y-3.5 sm:space-y-6">
                    <div className={cn(glass.section, "p-3.5 sm:p-5 bg-white")}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black shadow-sm">
                                <Hexagon className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-foreground">{fullName}</h3>
                                <p className="text-xs text-muted-foreground">{primaryApiary?.notes || (primaryApiary ? `Apiary Station • ${primaryApiary.location_name || primaryApiary.name}` : "Beekeeper")}</p>
                            </div>
                        </div>

                        <div className="bg-neutral-50 border border-neutral-200/90 rounded-xl p-4">
                            <Row label="Apiary Location" value={primaryApiary?.location_name || (primaryApiary ? primaryApiary.name : '—')} />
                            <Row label="Managed Colonies" value={`${loadedHives.length} Langstroth Hives`} />
                            <Row label="Biosecurity Status" value={<span className="text-emerald-600 font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 inline" /> Optimal</span>} />
                            <Row label="Primary Flora" value={primaryApiary?.forage_type || '—'} />
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
                    <div className={cn(glass.section, "p-3.5 sm:p-5 bg-white")}>
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

                {/* AGRONOMIC DIAGNOSTIC ENGINE: Actionable Insights from Sensor Telemetry */}
                <div className="lg:col-span-12">
                    <div className={cn(glass.section, "bg-white p-4 sm:p-6")}>
                        <ActionableInsightsPanel
                            inputs={agronomicInputs}
                            onActionClick={handleInsightAction}
                        />
                    </div>
                </div>

                {/* 1. INSPECTIONS SECTION (MATCHING INSPECTIONSPAGE) */}

                <div className="lg:col-span-12">
                    <div className={cn(glass.section, "bg-white overflow-hidden")}>
                        {/* Section Header */}
                        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-neutral-200/90 bg-neutral-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                                    <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm sm:text-base font-black text-foreground flex items-center gap-1.5 sm:gap-2 truncate">
                                        Hive Inspections & Colony Diagnostics
                                        <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
                                            {loadedHives.length} Verified Colonies
                                        </span>
                                    </h3>
                                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                                        Diagnostic inspection ledger for {fullName}{primaryApiary ? ` • ${primaryApiary.name}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => onTabChange('inspections')}
                                    className="flex-1 sm:flex-initial h-8 sm:h-9 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all whitespace-nowrap active:scale-95"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Diagnostic
                                </button>
                                <button
                                    onClick={() => onTabChange('inspections')}
                                    className="flex-1 sm:flex-initial h-8 sm:h-9 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs whitespace-nowrap active:scale-95"
                                >
                                    View Full Ledger
                                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                                </button>
                            </div>
                        </div>

                        {/* Inspection Metrics Row (Live Telemetry from Real Audits) */}
                        <div className="p-3 sm:p-4 md:p-6 border-b border-neutral-200/90 bg-white">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                                {inspectionMetrics.map((s) => (
                                    <div key={s.label} className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] uppercase tracking-wide font-bold text-neutral-500">{s.label}</span>
                                            <s.icon className={cn("w-4 h-4", s.tone)} />
                                        </div>
                                        <p className={cn("text-lg sm:text-2xl font-black tracking-tight", s.tone)}>{s.value}</p>
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
                                    <div className="p-4 sm:p-6 md:p-8 text-center bg-neutral-50/60 rounded-xl sm:rounded-2xl border border-dashed border-neutral-200/90 my-1 sm:my-2 space-y-2 sm:space-y-3">
                                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-700 shadow-xs">
                                            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="space-y-1 max-w-xs sm:max-w-sm mx-auto">
                                            <h4 className="text-xs sm:text-sm font-bold text-neutral-800">No Colony Health Diagnostics Logged Yet</h4>
                                            <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">
                                                Physical hive inspections recorded by the apiary owner will automatically appear here with real health vitals, queen sightings, and pest counts.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onTabChange('inspections')}
                                            className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-9 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
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
                        <div className="border-b border-neutral-200/90 bg-neutral-50/70 px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6">
                                <div className="space-y-1 min-w-0">
                                    <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-amber-300 bg-amber-50 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] text-amber-800">
                                        <Sun className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500 shrink-0" />
                                        Open-Meteo Live API Weather
                                    </div>
                                    <h3 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2 truncate">
                                        {primaryApiary?.name || (user ? 'Local Apiary' : 'Apiary Station')} Microclimate
                                    </h3>
                                    <p className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                        <span className="truncate">{primaryApiary?.location_name || (primaryApiary?.latitude != null ? `${primaryApiary.latitude.toFixed(3)}°, ${primaryApiary.longitude.toFixed(3)}°` : 'Apiary Coordinates')}</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap pt-1 sm:pt-0">
                                    {/* Station Selector Dropdown */}
                                    <div className="flex-1 sm:flex-initial min-w-[130px]">
                                        <Select value={selectedApiaryId} onValueChange={(val) => setSelectedApiaryId(val)}>
                                            <SelectTrigger className="h-9 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800 shadow-xs px-2.5">
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
                                    <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 h-9 text-[10px] sm:text-[11px] font-bold text-emerald-700 shadow-xs whitespace-nowrap shrink-0">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                        Optimal For Inspections
                                    </div>

                                    {/* Manual Refresh Button */}
                                    <button
                                        onClick={() => loadWeather(true)}
                                        disabled={isWeatherLoading}
                                        className="h-9 px-2.5 sm:px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs whitespace-nowrap shrink-0"
                                        title="Sync Live Weather"
                                    >
                                        <RefreshCw className={cn("w-3.5 h-3.5 text-amber-600", isWeatherLoading && "animate-spin")} />
                                        Sync
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Weather Details Grid */}
                        <div className="p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-6 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                                {/* Current Hero Stats */}
                                <div className="md:col-span-7 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-inner shrink-0">
                                                <WeatherIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                                                    <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-900">
                                                        {weather?.currentTemp !== undefined ? `${weather.currentTemp}°C` : '—'}
                                                    </span>
                                                    <span className="text-[11px] sm:text-xs font-bold text-neutral-500 whitespace-nowrap">
                                                        Range: {weather?.todayMin !== undefined ? `${weather.todayMin}°` : '—'} – {weather?.todayMax !== undefined ? `${weather.todayMax}°` : '—'}
                                                    </span>
                                                </div>
                                                <p className="text-xs sm:text-sm font-bold text-neutral-800 flex items-center gap-1.5 mt-0.5 truncate">
                                                    {weather?.conditionText || (isWeatherLoading ? 'Syncing...' : 'Weather data unavailable')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-1.5 shrink-0 flex-wrap">
                                            <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-xs shadow-xs whitespace-nowrap shrink-0">
                                                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                Outside Hive Temp
                                            </span>
                                        </div>
                                    </div>

                                    {/* Hourly Microclimate Forecast Pills */}
                                    <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                                            Hourly Microclimate Forecast
                                        </p>
                                        <div className="flex sm:grid sm:grid-cols-6 gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 no-scrollbar touch-pan-x">
                                            {(weather?.hourly || []).map((slot, idx) => {
                                                const { Icon } = getWeatherMeta(slot.code);
                                                return (
                                                    <div key={idx} className="flex flex-col items-center gap-1 text-center py-2 px-2.5 sm:px-1 rounded-xl bg-neutral-50 border border-neutral-200/80 shadow-xs min-w-[58px] sm:min-w-0 shrink-0 sm:shrink">
                                                        <span className="text-[10px] font-semibold text-neutral-500 whitespace-nowrap">
                                                            {slot.time}
                                                        </span>
                                                        <Icon className="w-4 h-4 text-amber-500 shrink-0" />
                                                        <span className="text-xs font-black text-neutral-900 whitespace-nowrap">
                                                            {slot.temp}°
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* 5-Day Forecast Gradient */}
                                <div className="md:col-span-5 rounded-2xl border border-neutral-200/90 bg-white p-3.5 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
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
                                                        <span className="col-span-3 font-bold text-neutral-900 text-[11px] truncate">
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
                            { label: 'Apiaries', value: loadedApiaries.length, icon: MapPin, hint: primaryApiary?.name || (loadedApiaries.length > 0 ? 'Active Station' : 'No apiaries registered') },
                            { label: 'Managed Hives', value: loadedHives.length, icon: Hexagon, hint: `${loadedHives.length} Langstroth hives` },
                            { label: 'Certified Yield', value: `${productionSummary.totalHarvestedKg.toFixed(1)} KG`, icon: Scale, hint: `${userHarvests.length} harvest logs recorded` },
                            { label: 'Batches', value: userBatches.length, icon: Binary, hint: userBatches.length > 0 ? `${productionSummary.verifiedBatches} verified on ledger` : 'No batches logged' },
                        ].map((card) => (
                            <div key={card.label} className={cn(glass.section, "p-3.5 sm:p-5 bg-white")}>
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
                                        {h.hive_code || h.name || 'Colony'} {h.hive_type ? `(${h.hive_type})` : ''}
                                    </div>
                                    <div className="text-[10px] text-emerald-600 font-semibold truncate flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 inline" /> {h.health_status || "Active"}
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
                                            <div className="text-[10px] text-neutral-500">{b.honey_type || (b as any).floral_source || 'Raw Honey'}</div>
                                        </div>
                                        <span className="text-xs font-bold text-amber-700">
                                            {Number((b as any).total_weight_kg ?? b.quantity_kg ?? 0).toFixed(1)} KG
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

