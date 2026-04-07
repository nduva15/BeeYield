import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { format, parseISO, subDays } from 'date-fns';
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Circle, CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

import { useApiaries } from '@/hooks/useApiaries';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import beeyieldService from '@/services/beeyieldService';

interface PredictiveSuccessEngineProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

type ManualPoint = {
    lat: number;
    lng: number;
};

const PRIMARY_BUTTON =
    'inline-flex h-11 items-center justify-center rounded-2xl bg-[#2f7a45] px-5 text-sm font-semibold text-white transition hover:bg-[#256339] disabled:cursor-not-allowed disabled:opacity-60';
const SECONDARY_CHIP =
    'rounded-full border border-[#d8dfef] bg-white px-4 py-2 text-sm font-medium text-[#51607f] transition hover:border-[#9db3ea] hover:text-[#1b2b4b]';

const DEFAULT_CENTER: [number, number] = [-2.4187, 37.9686];
const VEGETATION_OPTIONS = ['NDVI', 'EVI', 'SAVI'];
const CROP_OPTIONS = [
    { value: 'general', label: 'General' },
    { value: 'acacia', label: 'Acacia' },
    { value: 'avocado', label: 'Avocado' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'citrus', label: 'Citrus' },
    { value: 'macadamia', label: 'Macadamia' },
    { value: 'sunflower', label: 'Sunflower' },
    { value: 'wildflower', label: 'Wildflower' },
];

function formatNumber(value: number | null | undefined, digits = 1) {
    if (value === null || value === undefined || Number.isNaN(value)) return '--';
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits > 0 ? Math.min(digits, 1) : 0,
    }).format(value);
}

function clampCoordinate(value: string, min: number, max: number) {
    const normalized = value.replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed)) return null;
    if (parsed < min || parsed > max) return null;
    return parsed;
}

function ViewportSync({ center }: { center: [number, number] }) {
    const map = useMap();

    React.useEffect(() => {
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);

    return null;
}

function MapClickCapture({ onPick }: { onPick: (point: ManualPoint) => void }) {
    useMapEvents({
        click(event) {
            onPick({
                lat: Number(event.latlng.lat.toFixed(6)),
                lng: Number(event.latlng.lng.toFixed(6)),
            });
        },
    });

    return null;
}

function StepPanel({
    step,
    title,
    subtitle,
    active,
    children,
}: {
    step: number;
    title: string;
    subtitle: string;
    active: boolean;
    children: React.ReactNode;
}) {
    return (
        <section
            className={cn(
                'rounded-[28px] border bg-white p-5 shadow-[0_20px_60px_rgba(38,64,111,0.08)] transition',
                active ? 'border-[#a8c2ff]' : 'border-[#edf1f8]'
            )}
        >
            <div className="mb-5 flex items-start gap-4">
                <div
                    className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold',
                        active ? 'bg-[#eaf1ff] text-[#4f72d8]' : 'bg-[#f2f5fb] text-[#a3afc6]'
                    )}
                >
                    {step}
                </div>
                <div className="space-y-1">
                    <h2 className={cn('text-[1.15rem] font-semibold', active ? 'text-[#16274b]' : 'text-[#75839d]')}>{title}</h2>
                    <p className={cn('text-sm', active ? 'text-[#54627f]' : 'text-[#b1bacb]')}>{subtitle}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

function MetricCard({
    label,
    value,
    detail,
}: {
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <div className="rounded-3xl border border-[#ebeff7] bg-white p-4 shadow-[0_10px_30px_rgba(31,51,89,0.05)]">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#93a0b8]">{label}</div>
            <div className="mt-2 text-2xl font-semibold text-[#132240]">{value}</div>
            <div className="mt-1 text-sm text-[#63718b]">{detail}</div>
        </div>
    );
}

const PredictiveSuccessEngine: React.FC<PredictiveSuccessEngineProps> = () => {
    const { data: apiaries = [], isLoading: apiariesLoading } = useApiaries();
    const today = React.useMemo(() => new Date(), []);
    const todayIso = React.useMemo(() => format(today, 'yyyy-MM-dd'), [today]);
    const defaultDateFrom = React.useMemo(() => format(subDays(today, 90), 'yyyy-MM-dd'), [today]);

    const [search, setSearch] = React.useState('');
    const [locationMode, setLocationMode] = React.useState<'manual' | 'apiary'>('manual');
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('');
    const [manualLat, setManualLat] = React.useState('');
    const [manualLng, setManualLng] = React.useState('');
    const [appliedLocation, setAppliedLocation] = React.useState<{
        apiaryId?: string;
        label: string;
        lat: number;
        lng: number;
    } | null>(null);

    const [dateFrom, setDateFrom] = React.useState(defaultDateFrom);
    const [dateTo, setDateTo] = React.useState(todayIso);
    const [radiusM, setRadiusM] = React.useState('2000');
    const [vegetationIndex, setVegetationIndex] = React.useState('NDVI');
    const [cropProfile, setCropProfile] = React.useState('general');
    const [beeActivity, setBeeActivity] = React.useState('');

    const filteredApiaries = React.useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return apiaries;
        return apiaries.filter((apiary) =>
            [
                apiary.name,
                apiary.location_name,
                apiary.region,
                apiary.county,
                apiary.forage_type,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))
        );
    }, [apiaries, search]);

    const selectedApiary = React.useMemo(
        () => apiaries.find((apiary) => apiary.id === selectedApiaryId) || null,
        [apiaries, selectedApiaryId]
    );

    React.useEffect(() => {
        if (!selectedApiary || locationMode !== 'apiary') return;
        if (selectedApiary.latitude !== null && selectedApiary.latitude !== undefined) {
            setManualLat(String(selectedApiary.latitude));
        }
        if (selectedApiary.longitude !== null && selectedApiary.longitude !== undefined) {
            setManualLng(String(selectedApiary.longitude));
        }
    }, [locationMode, selectedApiary]);

    const mapCenter = React.useMemo<[number, number]>(() => {
        if (appliedLocation) return [appliedLocation.lat, appliedLocation.lng];
        if (
            selectedApiary?.latitude !== null &&
            selectedApiary?.latitude !== undefined &&
            selectedApiary?.longitude !== null &&
            selectedApiary?.longitude !== undefined
        ) {
            return [Number(selectedApiary.latitude), Number(selectedApiary.longitude)];
        }
        const manualLatitude = clampCoordinate(manualLat, -90, 90);
        const manualLongitude = clampCoordinate(manualLng, -180, 180);
        if (manualLatitude !== null && manualLongitude !== null) {
            return [manualLatitude, manualLongitude];
        }
        return DEFAULT_CENTER;
    }, [appliedLocation, manualLat, manualLng, selectedApiary]);

    const forecastMutation = useMutation({
        mutationFn: async () => {
            if (!appliedLocation) throw new Error('Apply a location first.');
            const parsedRadius = Number.parseInt(radiusM, 10);
            if (!Number.isFinite(parsedRadius) || parsedRadius < 250) {
                throw new Error('Radius must be at least 250 meters.');
            }
            if (dateFrom > dateTo) {
                throw new Error('Date from must be before date to.');
            }

            const beeActivityPct = beeActivity.trim() === '' ? undefined : Number.parseFloat(beeActivity.replace(',', '.'));
            if (beeActivityPct !== undefined && (!Number.isFinite(beeActivityPct) || beeActivityPct < 0 || beeActivityPct > 100)) {
                throw new Error('Bee activity must be between 0 and 100.');
            }

            return beeyieldService.runYieldForecast({
                apiary_id: appliedLocation.apiaryId,
                latitude: appliedLocation.lat,
                longitude: appliedLocation.lng,
                date_from: dateFrom,
                date_to: dateTo,
                radius_m: parsedRadius,
                vegetation_index: vegetationIndex,
                crop_profile: cropProfile,
                bee_activity_pct: beeActivityPct,
            });
        },
        onError(error: unknown) {
            const message = error instanceof Error ? error.message : 'Unable to run yield forecast.';
            toast.error(message);
        },
    });

    const handleApplyLocation = React.useCallback(() => {
        if (locationMode === 'apiary') {
            if (!selectedApiary) {
                toast.error('Select an apiary first.');
                return;
            }
            if (
                selectedApiary.latitude === null ||
                selectedApiary.latitude === undefined ||
                selectedApiary.longitude === null ||
                selectedApiary.longitude === undefined
            ) {
                toast.error('This apiary is missing coordinates.');
                return;
            }
            setAppliedLocation({
                apiaryId: selectedApiary.id,
                label: selectedApiary.location_name ? `${selectedApiary.name} - ${selectedApiary.location_name}` : selectedApiary.name,
                lat: Number(selectedApiary.latitude),
                lng: Number(selectedApiary.longitude),
            });
            return;
        }

        const latitude = clampCoordinate(manualLat, -90, 90);
        const longitude = clampCoordinate(manualLng, -180, 180);
        if (latitude === null || longitude === null) {
            toast.error('Enter valid coordinates before applying the location.');
            return;
        }

        setAppliedLocation({
            label: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            lat: latitude,
            lng: longitude,
        });
    }, [locationMode, manualLat, manualLng, selectedApiary]);

    const handleMapPick = React.useCallback((point: ManualPoint) => {
        setLocationMode('manual');
        setSelectedApiaryId('');
        setManualLat(String(point.lat));
        setManualLng(String(point.lng));
    }, []);

    const applyPreset = React.useCallback(
        (preset: '30' | '90' | 'season') => {
            if (preset === '30') {
                setDateFrom(format(subDays(today, 30), 'yyyy-MM-dd'));
                setDateTo(todayIso);
                return;
            }
            if (preset === '90') {
                setDateFrom(format(subDays(today, 90), 'yyyy-MM-dd'));
                setDateTo(todayIso);
                return;
            }

            const seasonStart = new Date(today.getFullYear(), 2, 1);
            const seasonEnd = new Date(today.getFullYear(), 9, 31);
            const boundedEnd = seasonEnd > today ? today : seasonEnd;
            setDateFrom(format(seasonStart, 'yyyy-MM-dd'));
            setDateTo(format(boundedEnd, 'yyyy-MM-dd'));
        },
        [today, todayIso]
    );

    const result = forecastMutation.data;
    const chartData = React.useMemo(() => {
        if (!result) return [];
        return result.timeline.map((point) => ({
            ...point,
            label: format(parseISO(point.date), 'MMM d'),
        }));
    }, [result]);

    const radiusValue = Number.parseInt(radiusM, 10);

    return (
        <div className="min-h-screen -m-4 bg-[#f6f8fc] px-5 py-6 text-[#18284a] md:-m-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-[1380px]">
                <header className="space-y-2">
                    <h1 className="text-[2.35rem] font-semibold tracking-[-0.04em] text-[#112247]">Yield Forecast</h1>
                    <p className="max-w-3xl text-lg text-[#54627f]">Copernicus vegetation, ERA5 weather, and bee activity signals</p>
                </header>

                <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex max-w-[560px] items-center gap-3 rounded-full border border-[#dde4f1] bg-white px-5 py-4 shadow-[0_18px_45px_rgba(31,51,89,0.06)]">
                        <Search className="h-5 w-5 text-[#7f8ba4]" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search apiaries, beehives"
                            className="w-full bg-transparent text-base text-[#223458] outline-none placeholder:text-[#98a5bb]"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#63718b]">
                        <span className="rounded-full border border-[#dde4f1] bg-white px-4 py-3 font-medium shadow-[0_10px_28px_rgba(31,51,89,0.05)]">
                            {appliedLocation ? appliedLocation.label : 'Select a location'}
                        </span>
                        <span className="rounded-full border border-[#dde4f1] bg-white px-4 py-3 font-medium shadow-[0_10px_28px_rgba(31,51,89,0.05)]">
                            {result ? `${formatNumber(result.forecast.expected_yield_kg, 1)} kg expected` : 'Run analysis'}
                        </span>
                    </div>
                </div>

                <div className="mt-7 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <StepPanel step={1} title="Step 1: Location" subtitle="Pick an apiary or set coordinates on the map." active>
                        <div className="space-y-5">
                            <div>
                                <p className="mb-4 text-lg text-[#334669]">Choose an apiary or enter coordinates before analysis.</p>
                                <Select
                                    value={locationMode === 'manual' ? 'manual' : `apiary:${selectedApiaryId}`}
                                    onValueChange={(value) => {
                                        if (value === 'manual') {
                                            setLocationMode('manual');
                                            setSelectedApiaryId('');
                                            return;
                                        }
                                        setLocationMode('apiary');
                                        setSelectedApiaryId(value.replace('apiary:', ''));
                                    }}
                                >
                                    <SelectTrigger className="h-14 rounded-2xl border-[#cdd7e8] bg-white text-left text-lg text-[#15274c] shadow-none">
                                        <SelectValue placeholder={apiariesLoading ? 'Loading apiaries...' : 'Manual coordinates'} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-[#d8e0ef] bg-white">
                                        <SelectItem value="manual">Manual coordinates</SelectItem>
                                        {filteredApiaries.map((apiary) => (
                                            <SelectItem key={apiary.id} value={`apiary:${apiary.id}`}>
                                                {apiary.location_name ? `${apiary.name} - ${apiary.location_name}` : apiary.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#6b7690]">Latitude</label>
                                    <Input
                                        value={manualLat}
                                        onChange={(event) => setManualLat(event.target.value)}
                                        className="h-14 rounded-2xl border-[#cdd7e8] bg-white text-xl text-[#172950] shadow-none"
                                        placeholder="-2.418700"
                                        inputMode="decimal"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#6b7690]">Longitude</label>
                                    <Input
                                        value={manualLng}
                                        onChange={(event) => setManualLng(event.target.value)}
                                        className="h-14 rounded-2xl border-[#cdd7e8] bg-white text-xl text-[#172950] shadow-none"
                                        placeholder="37.968600"
                                        inputMode="decimal"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button type="button" onClick={handleApplyLocation} className={cn(PRIMARY_BUTTON, 'w-full min-w-[176px] rounded-2xl px-6')}>
                                        Apply location
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-[#6b7690]">You can use comma or dot as a decimal separator.</p>

                            <div className="grid gap-4 md:grid-cols-[180px_1fr] md:items-start">
                                <div>
                                    <div className="text-base font-medium text-[#2f426b]">Pick on map</div>
                                    <p className="mt-2 text-sm text-[#6b7690]">Click on the map to set coordinates and then apply the location.</p>
                                </div>
                                <div className="overflow-hidden rounded-[26px] border border-[#d8dfed] bg-white shadow-[0_18px_48px_rgba(31,51,89,0.06)]">
                                    <MapContainer center={mapCenter} zoom={12} scrollWheelZoom className="h-[320px] w-full">
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <ViewportSync center={mapCenter} />
                                        <MapClickCapture onPick={handleMapPick} />
                                        {appliedLocation && (
                                            <>
                                                <CircleMarker center={[appliedLocation.lat, appliedLocation.lng]} radius={9} pathOptions={{ color: '#3256d7', fillColor: '#3256d7', fillOpacity: 0.9 }} />
                                                <Circle center={[appliedLocation.lat, appliedLocation.lng]} radius={Number.isFinite(radiusValue) ? radiusValue : 2000} pathOptions={{ color: '#3256d7', fillColor: '#3256d7', fillOpacity: 0.08, weight: 2 }} />
                                            </>
                                        )}
                                    </MapContainer>
                                </div>
                            </div>
                        </div>
                    </StepPanel>

                    <StepPanel
                        step={2}
                        title="Step 2: Analysis settings"
                        subtitle="Set date range and radius, then run the analysis."
                        active={Boolean(appliedLocation)}
                    >
                        <div className={cn('space-y-5', !appliedLocation && 'pointer-events-none opacity-55')}>
                            <p className="text-lg text-[#334669]">Adjust the time window and radius before running the analysis.</p>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#6b7690]">Date from</label>
                                    <Input type="date" max={todayIso} value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="h-14 rounded-2xl border-[#cdd7e8] bg-white text-lg text-[#172950] shadow-none" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#6b7690]">Date to</label>
                                    <Input type="date" max={todayIso} value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="h-14 rounded-2xl border-[#cdd7e8] bg-white text-lg text-[#172950] shadow-none" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#6b7690]">Radius (m)</label>
                                    <Input type="number" min={250} max={20000} value={radiusM} onChange={(event) => setRadiusM(event.target.value)} className="h-14 rounded-2xl border-[#cdd7e8] bg-white text-lg text-[#172950] shadow-none" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#6b7690]">Vegetation index</label>
                                    <Select value={vegetationIndex} onValueChange={setVegetationIndex}>
                                        <SelectTrigger className="h-14 rounded-2xl border-[#cdd7e8] bg-white text-lg text-[#172950] shadow-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-[#d8e0ef] bg-white">
                                            {VEGETATION_OPTIONS.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#6b7690]">Crop profile</label>
                                    <Select value={cropProfile} onValueChange={setCropProfile}>
                                        <SelectTrigger className="h-14 rounded-2xl border-[#cdd7e8] bg-white text-lg text-[#172950] shadow-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-[#d8e0ef] bg-white">
                                            {CROP_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#6b7690]">Bee activity (%)</label>
                                    <Input type="number" min={0} max={100} value={beeActivity} onChange={(event) => setBeeActivity(event.target.value)} className="h-14 rounded-2xl border-[#cdd7e8] bg-white text-lg text-[#172950] shadow-none" placeholder="Optional" />
                                </div>
                            </div>

                            <button type="button" onClick={() => forecastMutation.mutate()} disabled={!appliedLocation || forecastMutation.isPending} className={cn(PRIMARY_BUTTON, 'w-full rounded-2xl text-lg')}>
                                {forecastMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Applying settings
                                    </>
                                ) : (
                                    'Apply settings'
                                )}
                            </button>

                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-medium text-[#7c88a0]">Quick presets</span>
                                <button type="button" onClick={() => applyPreset('30')} className={SECONDARY_CHIP}>Last 30 days</button>
                                <button type="button" onClick={() => applyPreset('90')} className={SECONDARY_CHIP}>Last 90 days</button>
                                <button type="button" onClick={() => applyPreset('season')} className={SECONDARY_CHIP}>Season (Mar-Oct)</button>
                            </div>

                            <div className="space-y-1 text-sm text-[#7c88a0]">
                                <p>Use past dates only.</p>
                                <p>Optional. Enter 0-100 if you have BeeHUB activity data.</p>
                                <p>Select a location to unlock analysis settings.</p>
                            </div>
                        </div>
                    </StepPanel>
                </div>

                <section className="mt-8 rounded-[30px] border border-dashed border-[#d6deed] bg-white px-6 py-6 shadow-[0_16px_50px_rgba(31,51,89,0.05)] md:px-8">
                    {!result && !forecastMutation.isPending && (
                        <div>
                            <h3 className="text-[1.85rem] font-semibold tracking-[-0.04em] text-[#112247]">Select a location to start</h3>
                            <p className="mt-2 text-lg text-[#5a6782]">Pick an apiary from My Places or enter coordinates to run the analysis.</p>
                        </div>
                    )}

                    {forecastMutation.isPending && (
                        <div className="flex min-h-[180px] items-center justify-center gap-3 text-lg font-medium text-[#30446d]">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Running backend yield forecast...
                        </div>
                    )}

                    {result && !forecastMutation.isPending && (
                        <div className="space-y-8">
                            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8e9bb2]">Forecast ready</p>
                                    <h3 className="mt-2 text-[2.1rem] font-semibold tracking-[-0.045em] text-[#102247]">{result.location.label}</h3>
                                    <p className="mt-2 max-w-3xl text-base text-[#5c6a84]">
                                        {result.analysis_window.vegetation_index} vegetation, live weather, harvest history, and bee activity were combined on the backend for this forecast window.
                                    </p>
                                </div>
                                <div className="rounded-full border border-[#d8dfed] bg-[#f8fbff] px-5 py-3 text-sm font-medium text-[#46648c]">
                                    {result.analysis_window.days} day window • {formatNumber(result.analysis_window.radius_m, 0)} m radius
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <MetricCard label="Expected yield" value={`${formatNumber(result.forecast.expected_yield_kg, 1)} kg`} detail={`${formatNumber(result.forecast.low_kg, 1)} to ${formatNumber(result.forecast.high_kg, 1)} kg range`} />
                                <MetricCard label="Confidence" value={`${formatNumber(result.forecast.confidence_pct, 0)}%`} detail={`Forecast score ${formatNumber(result.forecast.forecast_score, 0)}/100`} />
                                <MetricCard label="Yield per hive" value={`${formatNumber(result.forecast.yield_per_hive_kg, 2)} kg`} detail={`${result.comparisons.active_hives} active hives in context`} />
                                <MetricCard
                                    label="Period change"
                                    value={
                                        result.comparisons.delta_pct === null || result.comparisons.delta_pct === undefined
                                            ? 'No baseline'
                                            : `${result.comparisons.delta_pct >= 0 ? '+' : ''}${formatNumber(result.comparisons.delta_pct, 1)}%`
                                    }
                                    detail={
                                        result.comparisons.last_period_yield_kg === null || result.comparisons.last_period_yield_kg === undefined
                                            ? 'No comparable previous window'
                                            : `Previous window ${formatNumber(result.comparisons.last_period_yield_kg, 1)} kg`
                                    }
                                />
                            </div>

                            <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
                                <div className="rounded-[28px] border border-[#e8edf6] bg-[#fbfcff] p-5">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                                        <div>
                                            <h4 className="text-lg font-semibold text-[#14264a]">Forecast curve</h4>
                                            <p className="text-sm text-[#65738d]">Expected yield by time slice, with the activity signal overlaid.</p>
                                        </div>
                                        <div className="text-sm text-[#62708b]">
                                            {result.forecast.yield_per_acre_kg !== null && result.forecast.yield_per_acre_kg !== undefined
                                                ? `${formatNumber(result.forecast.yield_per_acre_kg, 2)} kg per acre`
                                                : 'Apiary acreage not available'}
                                        </div>
                                    </div>
                                    <div className="mt-5 h-[340px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#4f72d8" stopOpacity={0.28} />
                                                        <stop offset="100%" stopColor="#4f72d8" stopOpacity={0.02} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} stroke="#e5ebf6" strokeDasharray="3 3" />
                                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#76839c', fontSize: 11, fontWeight: 600 }} />
                                                <YAxis yAxisId="yield" axisLine={false} tickLine={false} tick={{ fill: '#76839c', fontSize: 11, fontWeight: 600 }} tickFormatter={(value) => `${value} kg`} />
                                                <YAxis yAxisId="activity" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#97a5bd', fontSize: 11, fontWeight: 600 }} tickFormatter={(value) => `${value}%`} />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: 18,
                                                        border: '1px solid #dce4f1',
                                                        backgroundColor: '#ffffff',
                                                        boxShadow: '0 24px 50px rgba(31, 51, 89, 0.12)',
                                                    }}
                                                    formatter={(value: number, key) => {
                                                        if (key === 'activity_index') return [`${formatNumber(value, 1)}%`, 'Activity'];
                                                        return [`${formatNumber(value, 2)} kg`, key === 'yield_kg' ? 'Expected yield' : 'Range'];
                                                    }}
                                                />
                                                <Area yAxisId="yield" type="monotone" dataKey="yield_kg" stroke="#4f72d8" fill="url(#yieldGradient)" strokeWidth={3} />
                                                <Line yAxisId="activity" type="monotone" dataKey="activity_index" stroke="#2f7a45" strokeWidth={2.5} dot={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="rounded-[28px] border border-[#e8edf6] bg-white p-5">
                                        <h4 className="text-lg font-semibold text-[#14264a]">Signal stack</h4>
                                        <div className="mt-4 grid gap-3">
                                            <MetricCard label="Vegetation" value={`${formatNumber(result.signals.vegetation_score, 0)}/100`} detail={result.signals.source_statuses[0]?.detail || '—'} />
                                            <MetricCard label="Weather" value={`${formatNumber(result.signals.weather_score, 0)}/100`} detail={result.weather.status} />
                                            <MetricCard label="Activity" value={`${formatNumber(result.signals.activity_score, 0)}%`} detail={result.signals.source_statuses[2]?.detail || '—'} />
                                        </div>
                                    </div>

                                    <div className="rounded-[28px] border border-[#e8edf6] bg-white p-5">
                                        <h4 className="text-lg font-semibold text-[#14264a]">Backend sources</h4>
                                        <div className="mt-4 space-y-3">
                                            {result.signals.source_statuses.map((source) => (
                                                <div key={source.key} className="rounded-2xl border border-[#edf1f7] bg-[#fafcff] px-4 py-3">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="font-medium text-[#20345d]">{source.label}</div>
                                                        <div
                                                            className={cn(
                                                                'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                                                                source.status === 'available'
                                                                    ? 'bg-[#e9f7ee] text-[#2f7a45]'
                                                                    : source.status === 'baseline'
                                                                        ? 'bg-[#eef3fb] text-[#58739b]'
                                                                        : 'bg-[#fff0ea] text-[#bc5d43]'
                                                            )}
                                                        >
                                                            {source.status}
                                                        </div>
                                                    </div>
                                                    <p className="mt-2 text-sm text-[#62708b]">{source.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                                <div className="rounded-[28px] border border-[#e8edf6] bg-white p-5">
                                    <h4 className="text-lg font-semibold text-[#14264a]">Primary drivers</h4>
                                    <div className="mt-4 space-y-3">
                                        {result.drivers.map((driver) => (
                                            <div key={driver.label} className="rounded-2xl border border-[#eef2f8] px-4 py-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn('h-2.5 w-2.5 rounded-full', driver.impact === 'positive' ? 'bg-[#2f7a45]' : driver.impact === 'neutral' ? 'bg-[#5f83d9]' : 'bg-[#d86d4f]')} />
                                                        <span className="font-medium text-[#20345d]">{driver.label}</span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-[#486487]">{driver.value}</span>
                                                </div>
                                                <p className="mt-2 text-sm text-[#64718c]">{driver.detail}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-[#e8edf6] bg-white p-5">
                                    <h4 className="text-lg font-semibold text-[#14264a]">Recommended actions</h4>
                                    <div className="mt-4 space-y-3">
                                        {result.recommendations.map((recommendation, index) => (
                                            <div key={`${recommendation}-${index}`} className="rounded-2xl border border-[#eef2f8] bg-[#fbfcff] px-4 py-3 text-sm text-[#61708b]">
                                                {recommendation}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default PredictiveSuccessEngine;
