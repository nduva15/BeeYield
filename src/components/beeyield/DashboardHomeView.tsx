import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, MapPin, Hexagon, Hand, Mail, ShieldCheck, Calendar, Activity, ClipboardList, HelpCircle, FileBarChart, Cpu, Puzzle, Database, ArrowRight, RefreshCw, Binary, Scale, CloudSun, Droplets, Wind, Thermometer, Sunrise } from 'lucide-react';
import { glass, PageHeader, GlassModal } from './GlassTheme';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useApiaries } from '@/hooks/useHives';
import { useHives } from '@/hooks/useHives';
import { useApiaryWeatherSummary } from '@/hooks/useApiaryWeatherSummary';
import { useSelectedApiary } from '@/hooks/useSelectedApiary';
import { useHarvests, useBatches, useUpdateHarvest, useDeleteHarvest } from '@/hooks/useHarvests';
import type { Apiary, BatchView, Hive, Harvest, IoTDevice, SensorReading } from '@/services/beeyieldService';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import WeatherTelemetryPanel from './WeatherTelemetryPanel';
import {
    QUICK_ACCESS_VIEWS,
    WEATHER_READINESS,
    WEATHER_THRESHOLDS,
} from '@/data/dashboardContent';
interface DashboardHomeViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    apiaries: Apiary[];
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const EMPTY_APIARIES: Apiary[] = [];
const EMPTY_HIVES: Hive[] = [];
const EMPTY_HARVESTS: Harvest[] = [];
const EMPTY_BATCHES: BatchView[] = [];

const DEG = '\u00B0';

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
    const batchesQuery = useBatches({ limit: 50 });

    const apiaries = apiariesQuery.data ?? EMPTY_APIARIES;
    const hives = hivesQuery.data ?? EMPTY_HIVES;
    const harvests = harvestsQuery.data ?? EMPTY_HARVESTS;
    const batches = batchesQuery.data ?? EMPTY_BATCHES;
    const [selectedApiaryId, setSelectedApiaryId] = useSelectedApiary(apiaries[0]?.id);
    const primaryApiary = apiaries.find((apiary) => apiary.id === selectedApiaryId) || apiaries[0] || null;
    const { data: weatherSummary, isLoading: isWeatherLoading } = useApiaryWeatherSummary(primaryApiary?.id);
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
        updateHarvest({ id: selectedHarvest.id, data: editForm }, {
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
    const fullName = userMetadata.first_name || userMetadata.full_name || user?.email?.split('@')[0] || 'User';
    const avatarUrl = userMetadata.avatar_url;

    const recentHarvests = [...harvests]
        .sort((a: any, b: any) => new Date(b.harvest_date).getTime() - new Date(a.harvest_date).getTime())
        .slice(0, 8);

    const recentBatches = [...batches]
        .sort((a, b) => new Date(b.harvest_date || 0).getTime() - new Date(a.harvest_date || 0).getTime())
        .slice(0, 8);

    const productionSummary = React.useMemo(() => {
        const totalHarvestedKg = harvests.reduce((sum, harvest) => sum + (harvest.quantity_kg || 0), 0);
        const leftForBeesKg = harvests.reduce((sum, harvest) => sum + (harvest.quantity_left_for_bees_kg || 0), 0);
        const verifiedBatches = batches.filter(batch => batch.verification_status === 'verified' || batch.blockchain_verified).length;

        return {
            totalHarvestedKg,
            leftForBeesKg,
            verifiedBatches,
        };
    }, [batches, harvests]);

    const weatherCurrent = weatherSummary?.current;
    const weatherDaily = weatherSummary?.daily_summary;
    const linkedWeatherDevices = weatherSummary?.linked_device_meta?.length || 0;

    const weatherReadiness = React.useMemo(() => {
        const temperature = weatherCurrent?.temperature_c;
        const wind = weatherCurrent?.wind_speed_kmh;
        const humidity = weatherCurrent?.humidity_pct;

        if (typeof temperature === 'number' && temperature < WEATHER_THRESHOLDS.coldTemperatureC) {
            return WEATHER_READINESS.hold;
        }

        if (
            (typeof wind === 'number' && wind > WEATHER_THRESHOLDS.highWindKmh) ||
            (typeof humidity === 'number' && humidity > WEATHER_THRESHOLDS.highHumidityPct)
        ) {
            return WEATHER_READINESS.watch;
        }

        return WEATHER_READINESS.ready;
    }, [weatherCurrent?.humidity_pct, weatherCurrent?.temperature_c, weatherCurrent?.wind_speed_kmh]);

    const weatherHighlights = [
        {
            label: 'Humidity',
            value: typeof weatherCurrent?.humidity_pct === 'number' ? `${Math.round(weatherCurrent.humidity_pct)}%` : '--',
            icon: Droplets,
            accent: 'text-sky-600 bg-sky-50 border-sky-100',
            detail: 'Relative moisture',
        },
        {
            label: 'Wind',
            value: typeof weatherCurrent?.wind_speed_kmh === 'number' ? `${weatherCurrent.wind_speed_kmh.toFixed(1)} km/h` : '--',
            icon: Wind,
            accent: 'text-teal-700 bg-teal-50 border-teal-100',
            detail: weatherCurrent?.wind_direction || 'Direction pending',
        },
        {
            label: 'Feels like',
            value: typeof weatherCurrent?.feels_like_c === 'number' ? `${Math.round(weatherCurrent.feels_like_c)}${DEG}` : '--',
            icon: Thermometer,
            accent: 'text-orange-600 bg-orange-50 border-orange-100',
            detail: 'Ambient perception',
        },
        {
            label: 'Sunrise',
            value: weatherCurrent?.sunrise_at
                ? new Date(weatherCurrent.sunrise_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '--',
            icon: Sunrise,
            accent: 'text-amber-600 bg-amber-50 border-amber-100',
            detail: weatherDaily?.condition || 'Daily outlook',
        },
    ];

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
                subtitle="Your expert-level operational OS."
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={() => onTabChange('assistant')}
                            className={cn(glass.btnSecondary, "gap-2")}
                        >
                            <Hexagon className="w-4 h-4 text-primary" />
                            BeeYield AI
                        </button>
                        <button
                            onClick={() => onTabChange('harvests')}
                            className={cn(glass.btnPrimary)}
                        >
                            <Hand className="w-4 h-4" />
                            Harvests
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "p-5")}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-border/ flex items-center justify-center overflow-hidden shadow-sm">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted/20 text-primary font-bold text-sm">
                                        {fullName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">{fullName}</h3>
                                <p className="text-[11px] text-muted-foreground">Your signed-in details</p>
                            </div>
                        </div>
                        <div className="bg-muted/ border border-border/ rounded-xl p-4">
                            <Row label="Email" value={user?.email || '—'} />
                            <Row label="User ID" value={user?.id || '—'} />
                            <Row label="Profile" value={beeyieldUser ? 'Active' : '—'} />
                            <Row label="Last login" value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '—'} />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => onTabChange('settings')} className={cn(glass.btnSecondary, "flex-1 justify-center gap-2")}>
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                Settings
                            </button>
                            <button onClick={() => onTabChange('support')} className={cn(glass.btnSecondary, "flex-1 justify-center gap-2")}>
                                <Mail className="w-4 h-4 text-primary" />
                                Support
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className={cn(glass.section, "p-5")}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Important views</h3>
                                <p className="text-[11px] text-muted-foreground">Quick access to core workflows</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {QUICK_ACCESS_VIEWS.map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => onTabChange(v.id)}
                                    className={cn(
                                        "text-left bg-muted/ border border-border/ rounded-2xl p-4 hover:bg-muted/ hover:border-border/ transition-all",
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-border/ flex items-center justify-center">
                                            <v.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-black text-[11px] tracking-tight text-foreground truncate">{v.label}</div>
                                            <div className="text-[10px] text-muted-foreground truncate">{v.sub}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-12">
                    <div className={cn(glass.section, "overflow-hidden")}>
                        <div className="border-b border-border/ bg-[linear-gradient(135deg,rgba(255,249,240,0.96),rgba(249,247,242,0.98))] px-5 py-5 md:px-6">
                            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                                <div className="space-y-5">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="inline-flex items-center gap-2 rounded-full border border-border/ bg-muted/ px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8a6a00]">
                                                <CloudSun className="h-3.5 w-3.5 text-primary" />
                                                Home weather
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black tracking-tight text-foreground">
                                                    {primaryApiary ? `${primaryApiary.name} forecast window` : 'Apiary weather overview'}
                                                </h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Keep the home dashboard focused on what the bees can do right now.
                                                </p>
                                            </div>
                                        </div>

                                        <div className={cn("rounded-2xl border px-3 py-2 text-xs font-black uppercase tracking-[0.18em]", weatherReadiness.tone)}>
                                            {weatherReadiness.label}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.1fr)]">
                                        <div className="rounded-[24px] border border-border/ bg-muted/ p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Current field conditions</p>
                                                    <div className="mt-3 flex items-end gap-3">
                                                        <p className="text-5xl font-black tracking-tight text-foreground">
                                                            {typeof weatherCurrent?.temperature_c === 'number' ? `${Math.round(weatherCurrent.temperature_c)}${DEG}` : `--${DEG}`}
                                                        </p>
                                                        <div className="pb-1">
                                                            <p className="text-sm font-black text-foreground">
                                                                {weatherCurrent?.condition || 'Condition pending'}
                                                            </p>
                                                            <p className="text-xs font-semibold text-muted-foreground">
                                                                {primaryApiary?.location_name || 'Location not set'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl border border-border/ bg-primary/10 p-3 text-[#8a6a00]">
                                                    <CloudSun className="h-5 w-5" />
                                                </div>
                                            </div>
                                            <p className="mt-4 text-sm font-semibold text-muted-foreground/90">
                                                {weatherReadiness.detail}
                                            </p>
                                        </div>

                                        <div className="rounded-[24px] border border-border/ bg-muted/ p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Active apiary</p>
                                                    <p className="mt-1 text-sm font-bold text-foreground">
                                                        {primaryApiary?.name || 'Select an apiary'}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => onTabChange('flight-map')}
                                                    className={cn(glass.btnSecondary, "h-9 px-3 text-[10px]")}
                                                >
                                                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                                                    Flight map
                                                </button>
                                            </div>

                                            <div className="mt-4">
                                                <Select value={selectedApiaryId || primaryApiary?.id || ''} onValueChange={setSelectedApiaryId}>
                                                    <SelectTrigger className={cn(glass.select, "h-11 bg-white")}>
                                                        <SelectValue placeholder="Select apiary" />
                                                    </SelectTrigger>
                                                    <SelectContent className={glass.selectContent}>
                                                        {apiaries.map((apiary) => (
                                                            <SelectItem key={apiary.id} value={apiary.id} className="text-xs font-semibold">
                                                                {apiary.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <div className="rounded-2xl border border-border/ bg-card p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Linked devices</p>
                                                    <p className="mt-2 text-lg font-black text-foreground">{linkedWeatherDevices}</p>
                                                </div>
                                                <div className="rounded-2xl border border-border/ bg-card p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Observed</p>
                                                    <p className="mt-2 text-lg font-black text-foreground">
                                                        {weatherCurrent?.last_observed_at
                                                            ? new Date(weatherCurrent.last_observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : '--'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                                    {weatherHighlights.map((item) => (
                                        <div key={item.label} className="rounded-[24px] border border-border/ bg-muted/ p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">{item.label}</p>
                                                    <p className="mt-2 text-2xl font-black tracking-tight text-foreground">{item.value}</p>
                                                    <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{item.detail}</p>
                                                </div>
                                                <div className={cn("rounded-2xl border p-3", item.accent)}>
                                                    <item.icon className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 md:p-6">
                            <WeatherTelemetryPanel
                                summary={weatherSummary}
                                isLoading={isWeatherLoading}
                                compact
                                title={primaryApiary ? `${primaryApiary.name} weather telemetry` : 'Apiary weather telemetry'}
                                className="border-0 bg-transparent p-0 shadow-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-12">
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {[
                            { label: 'Apiaries', value: apiaries.length, icon: MapPin, hint: 'Linked locations' },
                            { label: 'Hives', value: hives.length, icon: Hexagon, hint: 'Active inventory' },
                            { label: 'Harvested', value: `${productionSummary.totalHarvestedKg.toFixed(1)} KG`, icon: Scale, hint: `${productionSummary.leftForBeesKg.toFixed(1)} KG left for bees` },
                            { label: 'Batches', value: batches.length, icon: Binary, hint: `${productionSummary.verifiedBatches} blockchain-verified` },
                        ].map((card) => (
                            <div key={card.label} className={cn(glass.section, "p-5 bg-muted/")}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-border/ flex items-center justify-center">
                                        <card.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-tight">{card.label}</span>
                                </div>
                                <div className="text-2xl font-black tracking-tight text-foreground">{card.value}</div>
                                <p className="text-[10px] text-muted-foreground mt-1">{card.hint}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-border/ flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-border/">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Apiaries</h3>
                                    <p className="text-[11px] text-muted-foreground">{apiaries.length} records</p>
                                </div>
                            </div>
                            <button onClick={() => onTabChange('places')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]")}>
                                Open
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {apiariesQuery.isLoading ? (
                                <div className="text-[11px] text-muted-foreground">Loading…</div>
                            ) : apiaries.length === 0 ? (
                                <div className="text-[11px] text-muted-foreground">No apiaries yet.</div>
                            ) : (
                                apiaries.slice(0, 8).map((a: Apiary) => (
                                    <div key={a.id} className="bg-muted/ border border-border/ rounded-xl p-3">
                                        <div className="font-black text-[11px] tracking-tight text-foreground truncate">{a.name}</div>
                                        <div className="text-[10px] text-muted-foreground truncate">{a.location_name || 'Unknown location'}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-border/ flex items-center justify-between">
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('beeyield')}>
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-border/ group-hover:bg-primary/20 transition-all">
                                    <Hexagon className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Hives</h3>
                                    <p className="text-[11px] text-muted-foreground">{hives.length} records</p>
                                </div>
                            </div>
                            <button onClick={() => onTabChange('beeyield')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]")}>
                                Open
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {hivesQuery.isLoading ? (
                                <div className="text-[11px] text-muted-foreground">Loading…</div>
                            ) : hives.length === 0 ? (
                                <div className="text-[11px] text-muted-foreground">No hives yet.</div>
                            ) : (
                                hives.slice(0, 8).map((h: Hive) => (
                                    <div 
                                        key={h.id} 
                                        onClick={() => onTabChange('beeyield')}
                                        className="bg-muted/ border border-border/ rounded-xl p-3 cursor-pointer hover:border-border/ hover:bg-white transition-all group"
                                    >
                                        <div className="font-black text-[11px] tracking-tight text-foreground truncate group-hover:text-primary transition-colors">{h.hive_code}</div>
                                        <div className="text-[10px] text-muted-foreground truncate">{h.status || 'Active'}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className={cn(glass.section, "overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-border/ flex items-center justify-between">
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('harvests')}>
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-border/ group-hover:bg-primary/20 transition-all">
                                    <Binary className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Traceability Batches</h3>
                                    <p className="text-[11px] text-muted-foreground">{batches.length} records</p>
                                </div>
                            </div>
                            <button onClick={() => onTabChange('harvests')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]")}>
                                Open
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {batchesQuery.isLoading ? (
                                <div className="text-[11px] text-muted-foreground">Loading…</div>
                            ) : recentBatches.length === 0 ? (
                                <div className="text-[11px] text-muted-foreground">No batches yet.</div>
                            ) : (
                                recentBatches.map((batch: BatchView) => (
                                    <button
                                        key={batch.id}
                                        onClick={() => onTabChange('harvests')}
                                        className="w-full text-left bg-muted/ border border-border/ rounded-xl p-3 flex items-center justify-between gap-4 hover:bg-primary/5 transition-all active:scale-[0.98] group"
                                    >
                                        <div className="min-w-0">
                                            <div className="font-black text-[11px] tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                                                {batch.batch_code}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground truncate">
                                                {batch.apiary_name || batch.apiary?.name || batch.hive?.hive_code || 'Traceability record'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <div className="text-[10px] font-black tabular-nums text-foreground">
                                                {(batch.quantity_kg ?? 0).toFixed(1)} kg
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {batch.verification_status || batch.completeness?.status || 'pending review'}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={cn(glass.section, "overflow-hidden mt-6")}>
                <div className="px-5 py-4 border-b border-border/ flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-border/">
                            <Hand className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Harvests</h3>
                            <p className="text-[11px] text-muted-foreground">{harvests.length} records</p>
                        </div>
                    </div>
                    <button onClick={() => onTabChange('harvests')} className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]")}>
                        Open
                    </button>
                </div>
                <div className="p-4 space-y-2">
                    {harvestsQuery.isLoading ? (
                        <div className="text-[11px] text-muted-foreground">Loading…</div>
                    ) : recentHarvests.length === 0 ? (
                        <div className="text-[11px] text-muted-foreground">No harvests yet.</div>
                    ) : (
                        recentHarvests.map((h: Harvest) => (
                            <button 
                                key={h.id} 
                                onClick={() => setSelectedHarvest(h)}
                                className="w-full text-left bg-muted/ border border-border/ rounded-xl p-3 flex items-center justify-between gap-4 hover:bg-primary/5 transition-all active:scale-[0.98] group"
                            >
                                <div className="min-w-0">
                                    <div className="font-black text-[11px] tracking-tight text-foreground truncate group-hover:text-primary transition-colors">{h.batch_code || `BAT-${h.id.slice(-6).toUpperCase()}`}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">{h.honey_type || '—'}</div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-[10px] font-black tabular-nums text-foreground">{(h.quantity_kg ?? 0).toFixed(1)} kg</div>
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3 opacity-60" />
                                        {h.harvest_date ? new Date(h.harvest_date).toLocaleDateString() : '—'}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            <GlassModal
                isOpen={!!selectedHarvest}
                onClose={() => { setSelectedHarvest(null); setIsEditing(false); }}
                title={isEditing ? "Edit Harvest" : "Harvest Details"}
                subtitle={isEditing ? "Update batch information" : `Traceability record for ${selectedHarvest?.batch_code || 'this batch'}`}
            >
                {selectedHarvest && (
                    <div className="space-y-6">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Batch Code</Label>
                                        <Input
                                            value={editForm.batch_code || ''}
                                            onChange={e => setEditForm({ ...editForm, batch_code: e.target.value })}
                                            className={cn(glass.input, "h-10")}
                                            placeholder="Auto-generated"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Date</Label>
                                        <Input
                                            type="date"
                                            value={editForm.harvest_date?.split('T')[0] || ''}
                                            onChange={e => setEditForm({ ...editForm, harvest_date: e.target.value })}
                                            className={cn(glass.input, "h-10")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Yield (KG)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={editForm.quantity_kg || ''}
                                            onChange={e => setEditForm({ ...editForm, quantity_kg: parseFloat(e.target.value) })}
                                            className={cn(glass.input, "h-10")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Left for Bees (KG)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={editForm.quantity_left_for_bees_kg || ''}
                                            onChange={e => setEditForm({ ...editForm, quantity_left_for_bees_kg: parseFloat(e.target.value) })}
                                            className={cn(glass.input, "h-10")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Honey Type</Label>
                                        <Select
                                            value={editForm.honey_type}
                                            onValueChange={(val) => setEditForm({ ...editForm, honey_type: val })}
                                        >
                                            <SelectTrigger className={cn(glass.select, "h-10")}>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {['Acacia', 'Multifloral', 'Sunflower', 'Forest', 'Rapeseed', 'Wildflower'].map(v => (
                                                    <SelectItem key={v} value={v} className="text-xs font-semibold">{v}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Color Grade</Label>
                                        <Select
                                            value={editForm.color_grade}
                                            onValueChange={(val) => setEditForm({ ...editForm, color_grade: val })}
                                        >
                                            <SelectTrigger className={cn(glass.select, "h-10")}>
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                            <SelectContent className={glass.selectContent}>
                                                {['Extra Light Amber', 'Light Amber', 'Amber', 'Dark Amber'].map(g => (
                                                    <SelectItem key={g} value={g} className="text-xs font-semibold">{g}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Moisture (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={editForm.moisture_content_percent || ''}
                                            onChange={e => setEditForm({ ...editForm, moisture_content_percent: parseFloat(e.target.value) })}
                                            className={cn(glass.input, "h-10")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={glass.microLabel}>Weather</Label>
                                        <Input
                                            value={editForm.weather_conditions || ''}
                                            onChange={e => setEditForm({ ...editForm, weather_conditions: e.target.value })}
                                            className={cn(glass.input, "h-10")}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className={glass.microLabel}>Notes</Label>
                                    <Input
                                        value={editForm.notes || ''}
                                        onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                                        className={cn(glass.input, "h-10")}
                                        placeholder="Observations..."
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="dash-edit-verified"
                                        checked={editForm.is_verified || false}
                                        onChange={e => setEditForm({ ...editForm, is_verified: e.target.checked })}
                                        className="rounded bg-black/40 border-border/ text-primary focus:ring-[#F4D03F]/50 w-4 h-4"
                                    />
                                    <Label htmlFor="dash-edit-verified" className="text-xs font-black text-muted-foreground/70 cursor-pointer">
                                        Verified Record
                                    </Label>
                                </div>
                            </div>
                        ) : (
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
                                    <div className="text-sm font-bold text-beeyield-green">{selectedHarvest.quantity_kg?.toFixed(1)} KG</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Honey Type</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.honey_type || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Florage</Label>
                                    <div className="text-sm font-bold">{(selectedHarvest as any).florage_type || (selectedHarvest as any).nectar_source || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Hive</Label>
                                    <div className="text-sm font-bold">{(selectedHarvest as any).hive_code || (selectedHarvest as any).hive?.hive_code || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Apiary</Label>
                                    <div className="text-sm font-bold">{(selectedHarvest as any).apiary?.name || (selectedHarvest as any).apiary?.location_name || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Farmer</Label>
                                    <div className="text-sm font-bold">{(selectedHarvest as any).farmer?.name || (selectedHarvest as any).farmer?.full_name || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Color Grade</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.color_grade || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className={glass.microLabel}>Moisture</Label>
                                    <div className="text-sm font-bold">{selectedHarvest.moisture_content_percent != null ? `${selectedHarvest.moisture_content_percent}%` : '—'}</div>
                                </div>
                                {selectedHarvest.notes && (
                                    <div className="col-span-2 space-y-1 pt-2 border-t border-border/">
                                        <Label className={glass.microLabel}>Notes</Label>
                                        <p className="text-xs font-medium text-muted-foreground/90 leading-relaxed">{selectedHarvest.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t border-border/ flex gap-3">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className={cn(glass.btnSecondary, "flex-1 h-10")}>
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveEdit} disabled={isUpdating} className={cn(glass.btnPrimary, "flex-1 h-10")}>
                                        {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleDelete} disabled={isDeleting} className="px-4 h-10 rounded-xl text-[11px] font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button onClick={handleEdit} className={cn(glass.btnSecondary, "flex-1 h-10")}>
                                        Edit
                                    </button>
                                    <button onClick={() => setSelectedHarvest(null)} className={cn(glass.btnPrimary, "flex-1 h-10")}>
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </GlassModal>
        </motion.div>
    );
};

export default DashboardHomeView;

