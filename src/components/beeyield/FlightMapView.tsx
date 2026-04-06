import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Circle, CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { AlertTriangle, Check, CheckCircle2, CloudSun, Layers3, Loader2, MapPin, Radar, Route } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { GlassStatCard, glass, PageHeader } from './GlassTheme';
import { useApiaries } from '@/hooks/useApiaries';
import { cn } from '@/lib/utils';
import { beeyieldService, PublicFlightMapPayload } from '@/services/beeyieldService';

type HeatPoint = { id: string; name: string; lat: number; lng: number; intensity: number; status: string };
type RoutePoint = { id: string; name: string; latitude: number; longitude: number; type: string; status?: string };

const HeatLayer = ({ points, visible }: { points: HeatPoint[]; visible: boolean }) => {
    const map = useMap();
    const heatRef = useRef<L.Layer | null>(null);

    useEffect(() => {
        if (heatRef.current) {
            map.removeLayer(heatRef.current);
            heatRef.current = null;
        }
        if (!visible || points.length === 0) return;
        const heatPoints = points.map((point) => [point.lat, point.lng, point.intensity] as [number, number, number]);
        // @ts-expect-error leaflet.heat augments L at runtime.
        heatRef.current = L.heatLayer(heatPoints, {
            radius: 28,
            blur: 22,
            maxZoom: 16,
            gradient: { 0.2: '#f7d97b', 0.45: '#f0b23b', 0.7: '#d18216', 1: '#9a5800' },
        }).addTo(map);
        return () => {
            if (heatRef.current) {
                map.removeLayer(heatRef.current);
                heatRef.current = null;
            }
        };
    }, [map, points, visible]);

    return null;
};

const SetView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);
    return null;
};

const FitApiaries = ({ points }: { points: Array<{ latitude: number; longitude: number }> }) => {
    const map = useMap();
    useEffect(() => {
        if (points.length === 0) return;
        const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude] as [number, number]));
        map.fitBounds(bounds.pad(0.2), { animate: false });
    }, [map, points]);
    return null;
};

const pill = (active: boolean) =>
    cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition-colors',
        active ? 'border-[#e3ae41] bg-[#fff1c7] text-[#8a5200]' : 'border-[#ead8bb] bg-white text-[#826f55]'
    );

const statusTone = (status: string) => {
    const lowered = status.toLowerCase();
    if (lowered.includes('critical') || lowered.includes('alert')) return 'bg-[#fde7e4] text-[#c54e3d] border-[#f4c5bd]';
    if (lowered.includes('weak') || lowered.includes('warning')) return 'bg-[#fff4d7] text-[#a46a00] border-[#f0d18d]';
    return 'bg-[#edf8ef] text-[#2f7a3d] border-[#c9e5cd]';
};

const formatMeters = (km: number) => `${Math.round(km * 1000)} m`;

const PUBLIC_ZONE_OFFSETS = [
    { lat: 0.0105, lng: 0.005 },
    { lat: -0.008, lng: -0.0065 },
    { lat: 0.0045, lng: 0.0135 },
    { lat: -0.011, lng: 0.004 },
];

function buildPublicFlightArea(publicFlightMap: PublicFlightMapPayload | null, selectedLandTypeId: string) {
    if (!publicFlightMap) return null;

    const apiary = publicFlightMap.apiary;
    const apiaryLat = Number(apiary.latitude || -2.4187);
    const apiaryLng = Number(apiary.longitude || 37.9686);
    const effectiveRadiusKm = Number((apiary as any).effective_radius_km || 2.4);
    const maxRadiusKm = Number((apiary as any).max_radius_km || 4.8);
    const landTypes = (publicFlightMap.land_types || []).map((item) => ({
        ...item,
        share_pct: Number(item.share_pct || 0),
        nectar_score: Number(item.nectar_score || 0),
    }));
    const selectedLandType = landTypes.find((item) => item.id === selectedLandTypeId) || landTypes[0] || null;
    const statusSummary = publicFlightMap.hives.reduce((acc: Record<string, number>, hive) => {
        const status = String(hive.status || 'Active');
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return {
        apiary: {
            ...apiary,
            effective_radius_km: effectiveRadiusKm,
            max_radius_km: maxRadiusKm,
        },
        controls: {
            locations: [
                {
                    id: String(apiary.id),
                    name: apiary.name,
                    label: `${apiary.name} - ${apiary.location_name || 'Kibwezi, Kenya'}`,
                    latitude: apiaryLat,
                    longitude: apiaryLng,
                    hive_count: publicFlightMap.hives.length,
                    effective_radius_km: effectiveRadiusKm,
                    max_radius_km: maxRadiusKm,
                },
            ],
            land_types: landTypes,
            selected_land_type: selectedLandType?.name || '',
            selected_land_type_id: selectedLandType?.id || '',
        },
        forage: {
            potential_pct: Number(publicFlightMap.flight_potential.score || 0),
            estimated_share_pct: Number(selectedLandType?.share_pct || 0),
            recommendation: publicFlightMap.flight_potential.recommendation,
        },
        weather: {
            available: true,
            message: 'Live Kibwezi weather feed is active.',
            current: publicFlightMap.weather_summary.current,
        },
        education_panel: [
            'Kibwezi live view is anchored to the public monitoring site.',
            'Use the land type dropdown to compare nearby forage zones.',
            `Core flight window is strongest inside ${Math.round(effectiveRadiusKm)} km.`,
        ],
        route_planner: {
            start_options: [
                {
                    id: String(apiary.id),
                    name: apiary.name,
                    label: `${apiary.name} - ${apiary.location_name || 'Kibwezi, Kenya'}`,
                    latitude: apiaryLat,
                    longitude: apiaryLng,
                },
            ],
            suggested_hives: publicFlightMap.hives.map((hive) => ({
                id: String(hive.id),
                name: hive.hive_code || 'Kibwezi anchor',
                status: hive.status || 'Active',
                latitude: Number(hive.latitude || apiaryLat),
                longitude: Number(hive.longitude || apiaryLng),
            })),
            status_summary: statusSummary,
            helper_text: 'Public routing preview for Kibwezi, Kenya.',
        },
        map: {
            center: { lat: apiaryLat, lng: apiaryLng },
            heatmap_points: publicFlightMap.hives.map((hive) => ({
                id: String(hive.id),
                name: hive.hive_code || 'Kibwezi anchor',
                lat: Number(hive.latitude || apiaryLat),
                lng: Number(hive.longitude || apiaryLng),
                intensity: String(hive.status || '').toLowerCase().includes('limited') ? 0.55 : 0.82,
                status: hive.status || 'Active',
            })),
            forage_zone_points: landTypes.map((type, index) => ({
                id: type.id,
                name: type.name,
                flora_type: type.name,
                lat: apiaryLat + (PUBLIC_ZONE_OFFSETS[index]?.lat || 0),
                lng: apiaryLng + (PUBLIC_ZONE_OFFSETS[index]?.lng || 0),
                radius_m: Math.round((1.2 + index * 0.35) * 1000),
                density_score: Math.min(1, Number(type.nectar_score || 0) / 100),
            })),
            all_apiaries: [
                {
                    id: String(apiary.id),
                    name: apiary.name,
                    location_name: apiary.location_name || 'Kibwezi, Kenya',
                    latitude: apiaryLat,
                    longitude: apiaryLng,
                    hive_count: publicFlightMap.hives.length,
                    effective_radius_km: effectiveRadiusKm,
                },
            ],
        },
    };
}

const FlightMapView: React.FC = () => {
    const { data: apiaries = [], isLoading: apiariesLoading } = useApiaries();
    const [selectedApiaryId, setSelectedApiaryId] = useState('');
    const [selectedLandTypeId, setSelectedLandTypeId] = useState('');
    const [startPointId, setStartPointId] = useState('');
    const [effectiveRadiusKm, setEffectiveRadiusKm] = useState(2);
    const [maxRadiusKm, setMaxRadiusKm] = useState(5);
    const [showEffectiveArea, setShowEffectiveArea] = useState(true);
    const [showMaximumRange, setShowMaximumRange] = useState(true);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [showForagePotential, setShowForagePotential] = useState(true);
    const [showAllApiaryRadius, setShowAllApiaryRadius] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedHiveIds, setSelectedHiveIds] = useState<string[]>([]);
    const [routePath, setRoutePath] = useState<RoutePoint[]>([]);
    const [planningRoute, setPlanningRoute] = useState(false);
    const hasPrivateApiaries = apiaries.length > 0;

    useEffect(() => {
        if (!selectedApiaryId && apiaries.length > 0) setSelectedApiaryId(String(apiaries[0].id));
    }, [apiaries, selectedApiaryId]);

    const { data: publicFlightMap, isLoading: publicMapLoading } = useQuery({
        queryKey: ['public-flight-map', 'kibwezi-kenya'],
        queryFn: () => beeyieldService.getPublicLiveFlightMap('kibwezi-kenya'),
        enabled: !apiariesLoading && !hasPrivateApiaries,
        staleTime: 60000,
    });

    useEffect(() => {
        if (!selectedApiaryId && publicFlightMap?.apiary?.id) {
            setSelectedApiaryId(String(publicFlightMap.apiary.id));
        }
    }, [publicFlightMap?.apiary?.id, selectedApiaryId]);

    const { data: privateFlightArea, isLoading: pageLoading, isFetching } = useQuery({
        queryKey: ['flight-area', selectedApiaryId, selectedLandTypeId || 'default'],
        queryFn: () => beeyieldService.getFlightAreaDashboard(selectedApiaryId, selectedLandTypeId || undefined),
        enabled: hasPrivateApiaries && !!selectedApiaryId,
        staleTime: 60000,
    });

    const flightArea = React.useMemo(
        () => privateFlightArea || buildPublicFlightArea(publicFlightMap || null, selectedLandTypeId),
        [privateFlightArea, publicFlightMap, selectedLandTypeId],
    );

    useEffect(() => {
        if (!flightArea?.apiary) return;
        setEffectiveRadiusKm(Number(flightArea.apiary.effective_radius_km || 2));
        setMaxRadiusKm(Number(flightArea.apiary.max_radius_km || 5));
        setStartPointId((value) => value || String(flightArea.apiary.id));
        setRoutePath([]);
    }, [flightArea?.apiary?.id]);

    useEffect(() => {
        const suggestions = flightArea?.route_planner?.suggested_hives || [];
        if (suggestions.length === 0) {
            setSelectedHiveIds([]);
            return;
        }
        setSelectedHiveIds((current) => {
            if (current.length > 0) return current.filter((id) => suggestions.some((hive: any) => hive.id === id));
            return suggestions.slice(0, 4).map((hive: any) => hive.id);
        });
    }, [flightArea?.route_planner?.suggested_hives]);

    const loading = apiariesLoading || publicMapLoading || (hasPrivateApiaries && !!selectedApiaryId && pageLoading && !flightArea);
    const locationOptions = flightArea?.controls?.locations || apiaries.map((apiary) => ({
        id: String(apiary.id),
        name: apiary.name,
        label: `${apiary.name}${apiary.location_name ? ` - ${apiary.location_name}` : ''}`,
        latitude: Number(apiary.latitude || 0),
        longitude: Number(apiary.longitude || 0),
        hive_count: Number(apiary.hive_count || 0),
    }));
    const landTypes = flightArea?.controls?.land_types || [];
    const activeLandTypeId = selectedLandTypeId || flightArea?.controls?.selected_land_type_id || '';
    const mapCenter: [number, number] = [Number(flightArea?.map?.center?.lat || 0), Number(flightArea?.map?.center?.lng || 0)];
    const heatmapPoints: HeatPoint[] = flightArea?.map?.heatmap_points || [];
    const forageZonePoints = flightArea?.map?.forage_zone_points || [];
    const allApiaries = flightArea?.map?.all_apiaries || [];
    const weatherCurrent = flightArea?.weather?.current || {};
    const suggestedHives = flightArea?.route_planner?.suggested_hives || [];
    const statusOptions = ['all', ...Object.keys(flightArea?.route_planner?.status_summary || {})];
    const filteredHives = statusFilter === 'all' ? suggestedHives : suggestedHives.filter((hive: any) => hive.status === statusFilter);
    const startPoint =
        flightArea?.route_planner?.start_options?.find((option: any) => option.id === startPointId) ||
        locationOptions.find((option: any) => option.id === startPointId) ||
        flightArea?.apiary;

    const toggleHive = (hiveId: string, checked: boolean) => {
        setSelectedHiveIds((current) => {
            if (checked) return current.includes(hiveId) ? current : [...current, hiveId];
            return current.filter((id) => id !== hiveId);
        });
    };

    const handleApiaryChange = (apiaryId: string) => {
        setSelectedApiaryId(apiaryId);
        setSelectedLandTypeId('');
        setStartPointId(apiaryId);
        setSelectedHiveIds([]);
        setRoutePath([]);
    };

    const handlePlanRoute = async () => {
        if (!startPoint) return toast.error('Choose a start point first.');
        if (selectedHiveIds.length === 0) return toast.error('Select at least one hive to build a route.');
        setPlanningRoute(true);
        try {
            if (!hasPrivateApiaries && publicFlightMap?.route_points?.length) {
                setRoutePath([
                    {
                        id: String(publicFlightMap.apiary.id),
                        name: publicFlightMap.apiary.name,
                        latitude: Number(publicFlightMap.apiary.latitude || 0),
                        longitude: Number(publicFlightMap.apiary.longitude || 0),
                        type: 'origin',
                    },
                    ...publicFlightMap.hives
                        .filter((hive) => selectedHiveIds.includes(String(hive.id)))
                        .map((hive) => ({
                            id: String(hive.id),
                            name: hive.hive_code || 'Kibwezi anchor',
                            latitude: Number(hive.latitude || 0),
                            longitude: Number(hive.longitude || 0),
                            type: 'stop',
                            status: hive.status || 'Active',
                        })),
                ]);
                toast.success('Kibwezi route preview ready.');
                return;
            }

            const result = await beeyieldService.planRoute(
                { lat: Number(startPoint.latitude || 0), lng: Number(startPoint.longitude || 0) },
                selectedHiveIds
            );
            if (result?.path?.length) {
                setRoutePath(result.path);
                toast.success(`Route plan ready with ${Math.max(result.path.length - 1, 0)} stop(s).`);
            } else {
                toast.error('No route could be generated for the selected hives.');
            }
        } catch (error) {
            console.error('Flight route planning failed:', error);
            toast.error('Failed to calculate the route.');
        } finally {
            setPlanningRoute(false);
        }
    };

    const layerButtons = [
        ['Effective area', showEffectiveArea, setShowEffectiveArea],
        ['Maximum range', showMaximumRange, setShowMaximumRange],
        ['Flight heatmap', showHeatmap, setShowHeatmap],
        ['Forage potential', showForagePotential, setShowForagePotential],
    ] as const;
    const activeLayerCount = layerButtons.filter(([, active]) => active).length;
    const primaryLocationLabel = String(flightArea?.apiary?.location_name || 'Kibwezi, Kenya');
    const topStats = [
        {
            label: 'Forage potential',
            value: `~${Math.round(Number(flightArea?.forage?.potential_pct || 0))}%`,
            detail: `Share ${Math.round(Number(flightArea?.forage?.estimated_share_pct || 0))}%`,
            icon: Radar,
            color: 'text-[#1B9157]',
        },
        {
            label: 'Effective radius',
            value: formatMeters(effectiveRadiusKm),
            detail: 'High-confidence flight zone',
            icon: MapPin,
            color: 'text-[#F4D03F]',
        },
        {
            label: 'Maximum radius',
            value: formatMeters(maxRadiusKm),
            detail: 'Outer operating envelope',
            icon: Route,
            color: 'text-[#2563eb]',
        },
        {
            label: 'Live layers',
            value: activeLayerCount,
            detail: showHeatmap ? 'Heatmap active' : 'Map overlays trimmed',
            icon: Layers3,
            color: 'text-[#a16207]',
        },
    ];

    if (loading) {
        return (
            <div className={cn(glass.section, 'flex min-h-[620px] items-center justify-center')}>
                <div className="space-y-4 text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#F4D03F]" />
                    <p className="text-sm font-medium text-[#1A1A1A]/70">Loading bee flight area...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cn(glass.page, 'space-y-5 font-sans md:space-y-6')}>
            <PageHeader
                icon={Route}
                label="Flight intelligence"
                title="Bee Flight Area"
                subtitle={hasPrivateApiaries ? 'Live forage, map, and route planning for your selected apiary.' : 'Live Kibwezi, Kenya map with backend weather and forage coverage.'}
                actions={
                    <div className="flex items-center gap-2">
                        <div className={cn(glass.badge, 'border-[#1B9157]/20 bg-[#1B9157]/10 text-[#166534]')}>
                            {primaryLocationLabel}
                        </div>
                        {isFetching ? <Loader2 className="h-4 w-4 animate-spin text-[#F4D03F]" /> : null}
                    </div>
                }
            />

            <section className={cn(glass.section, 'overflow-hidden')}>
                <div className="border-b border-[#F4D03F]/20 bg-[linear-gradient(135deg,rgba(255,249,240,0.98),rgba(249,247,242,0.98))] px-4 py-4 md:px-6 md:py-5">
                    <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] xl:gap-5">
                        <div className="space-y-3 md:space-y-4">
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1A1A1A]/45">{hasPrivateApiaries ? 'My locations' : 'Live location'}</p>
                                <Select value={selectedApiaryId} onValueChange={handleApiaryChange}>
                                    <SelectTrigger className="h-12 rounded-xl border-[#F4D03F]/30 bg-[#FFF9F0] text-sm font-semibold text-[#1A1A1A] shadow-sm">
                                        <SelectValue placeholder="Select an apiary" />
                                    </SelectTrigger>
                                    <SelectContent className={cn(glass.selectContent, 'rounded-xl')}>
                                        {locationOptions.map((location: any) => (
                                            <SelectItem key={location.id} value={location.id} className="rounded-lg text-sm font-semibold text-[#1A1A1A]">
                                                {location.label || location.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="rounded-[22px] border border-[#c7781a] bg-[#fff8f2] p-4 shadow-[0_10px_25px_rgba(170,96,14,0.08)]">
                                <div className="mb-3 text-sm font-medium text-[#b45f0b]">Land type</div>
                                <Select value={activeLandTypeId} onValueChange={setSelectedLandTypeId}>
                                    <SelectTrigger className="h-[70px] rounded-[18px] border-2 border-[#b56a13] bg-[#fffdf9] px-5 text-lg font-medium text-[#3f3426] shadow-none focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder="Choose forage type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[24px] border-[#c7781a] bg-[#fdf0e7] p-0 shadow-[0_24px_40px_rgba(126,62,0,0.16)]">
                                        {landTypes.map((option: any) => (
                                            <SelectItem
                                                key={option.id}
                                                value={option.id}
                                                className="min-h-[68px] rounded-none border-b border-[#efd9cf] pl-5 pr-12 text-[1.05rem] font-medium text-[#2f2416] focus:bg-[#f8cfb8] focus:text-[#2f2416] data-[state=checked]:bg-[#f8cfb8] data-[state=checked]:text-[#2f2416] [&>span]:left-auto [&>span]:right-4"
                                            >
                                                {option.name}
                                            </SelectItem>
                                        ))}
                                        {landTypes.length === 0 ? (
                                            <div className="px-5 py-4 text-sm font-medium text-[#8b6f57]">No land types available yet.</div>
                                        ) : null}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {layerButtons.map(([label, active, setter]) => (
                                    <button key={label} className={pill(active)} onClick={() => setter((value: boolean) => !value)} type="button">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#a96600] bg-white text-[#a96600]"><Check className="h-4 w-4" /></span>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {topStats.map((stat, index) => (
                                <div key={stat.label} className="min-w-0">
                                    <GlassStatCard
                                        label={stat.label}
                                        value={stat.value}
                                        icon={stat.icon}
                                        index={index}
                                        color={stat.color}
                                    />
                                    <p className="mt-2 px-1 text-xs font-semibold text-[#1A1A1A]/55">{stat.detail}</p>
                                </div>
                            ))}
                            <div className={cn(glass.section, 'bg-white/60 p-4 sm:col-span-2 xl:col-span-4')}>
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="text-sm font-semibold text-[#1A1A1A]">Flight radius tuning</div>
                                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1A1A]/45">Live controls</div>
                                </div>
                                <div className="grid gap-4 xl:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="flex items-end justify-between">
                                            <div className="text-sm font-semibold text-[#1A1A1A]/75">Effective radius</div>
                                            <div className="text-lg font-bold text-[#1A1A1A]">{formatMeters(effectiveRadiusKm)}</div>
                                        </div>
                                        <Slider value={[effectiveRadiusKm]} min={0.5} max={Math.max(5, maxRadiusKm)} step={0.1} onValueChange={([value]) => setEffectiveRadiusKm(value)} className="py-2" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-end justify-between">
                                            <div className="text-sm font-semibold text-[#1A1A1A]/75">Maximum radius</div>
                                            <div className="text-lg font-bold text-[#1A1A1A]">{formatMeters(maxRadiusKm)}</div>
                                        </div>
                                        <Slider value={[maxRadiusKm]} min={effectiveRadiusKm} max={10} step={0.1} onValueChange={([value]) => setMaxRadiusKm(value)} className="py-2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_340px] xl:gap-6">
                <div className={cn(glass.section, 'overflow-hidden')}>
                    <div className="flex items-center justify-between border-b border-[#F4D03F]/20 bg-[#F9F7F2] px-5 py-4">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1A1A1A]/45">Live route canvas</p>
                            <h2 className="mt-1 text-lg font-bold tracking-tight text-[#1A1A1A]">Primary flight map</h2>
                        </div>
                        <div className={cn(glass.badge, 'border-[#F4D03F]/30 bg-[#F4D03F]/10 text-[#1A1A1A]')}>
                            {primaryLocationLabel}
                        </div>
                    </div>
                    <div className="h-[340px] overflow-hidden sm:h-[420px] lg:h-[520px]">
                        <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap contributors &copy; CARTO' />
                            <HeatLayer points={heatmapPoints} visible={showHeatmap} />
                            <SetView center={mapCenter} />
                            {showMaximumRange ? <Circle center={mapCenter} radius={Math.round(maxRadiusKm * 1000)} pathOptions={{ color: '#d8931c', fillColor: '#f6c65b', fillOpacity: 0.08, weight: 2 }} /> : null}
                            {showEffectiveArea ? <Circle center={mapCenter} radius={Math.round(effectiveRadiusKm * 1000)} pathOptions={{ color: '#f2a900', fillColor: '#f4c042', fillOpacity: 0.18, weight: 2 }} /> : null}
                            <CircleMarker center={mapCenter} radius={12} pathOptions={{ color: '#8a4b00', fillColor: '#f2a900', fillOpacity: 1, weight: 3 }}>
                                <Popup><div className="space-y-1"><div className="text-sm font-semibold">{flightArea?.apiary?.name}</div><div className="text-xs text-slate-500">{flightArea?.apiary?.location_name}</div></div></Popup>
                            </CircleMarker>
                            {heatmapPoints.map((point) => (
                                <CircleMarker key={point.id} center={[point.lat, point.lng]} radius={7} pathOptions={{ color: '#7a4d08', fillColor: point.status.toLowerCase().includes('critical') || point.status.toLowerCase().includes('alert') ? '#d95d39' : '#cc8a12', fillOpacity: 0.95, weight: 2 }}>
                                    <Popup><div className="space-y-1"><div className="text-sm font-semibold">{point.name}</div><div className="text-xs text-slate-500">{point.status}</div></div></Popup>
                                </CircleMarker>
                            ))}
                            {showForagePotential ? forageZonePoints.map((zone: any) => (
                                <Circle key={zone.id} center={[zone.lat, zone.lng]} radius={zone.radius_m} pathOptions={{ color: '#6da84d', fillColor: '#92c86a', fillOpacity: 0.08 + Math.min(Number(zone.density_score || 0), 1) * 0.08, weight: 1.5 }}>
                                    <Popup><div className="space-y-1"><div className="text-sm font-semibold">{zone.name}</div><div className="text-xs text-slate-500">{zone.flora_type || 'Forage zone'}</div></div></Popup>
                                </Circle>
                            )) : null}
                            {routePath.length > 1 ? <Polyline positions={routePath.map((point) => [point.latitude, point.longitude])} pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.9, dashArray: '10 10' }} /> : null}
                        </MapContainer>
                    </div>
                    <div className="border-t border-[#F4D03F]/20 bg-[#FFF9F0] px-5 py-4 text-sm text-[#1A1A1A]/70">
                        <div className="mb-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#1A1A1A]/45">Geographical position</div>
                        <div className="flex flex-wrap gap-5">
                            <span>Longitude: {Number(flightArea?.apiary?.longitude || 0).toFixed(6)}</span>
                            <span>Latitude: {Number(flightArea?.apiary?.latitude || 0).toFixed(6)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 md:space-y-5">
                    <div className={cn(glass.section, 'p-5')}>
                        <div className={cn('rounded-xl border px-4 py-3 text-sm font-semibold', flightArea?.weather?.available ? 'border-[#cfe9d4] bg-[#edf8ef] text-[#2f7a3d]' : 'border-[#f1c9c6] bg-[#fff0ef] text-[#c54e3d]')}>
                            {flightArea?.weather?.message || `Weather feed active for ${flightArea?.apiary?.location_name}.`}
                        </div>
                        <div className="mt-5 space-y-4">
                            <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Education panel</h2>
                            <ul className="space-y-3 text-sm leading-7 text-[#1A1A1A]/80">
                                {(flightArea?.education_panel || []).map((tip: string) => (
                                    <li key={tip} className="flex gap-3"><span className="mt-3 h-2.5 w-2.5 rounded-full bg-[#2a5b9a]" /><span>{tip}</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className={cn(glass.section, 'p-5')}>
                        <div className="flex items-start gap-3">
                            <div className="rounded-2xl bg-[#eef5ff] p-3 text-[#2a5b9a]">{flightArea?.weather?.available ? <CloudSun className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}</div>
                            <div className="grid flex-1 grid-cols-2 gap-4 text-sm text-[#1A1A1A]/70">
                                <div><div className="text-[11px] font-black uppercase tracking-wide text-[#1A1A1A]/45">Temp</div><div className="text-lg font-semibold text-[#1A1A1A]">{weatherCurrent.temperature_c != null ? `${Math.round(Number(weatherCurrent.temperature_c))} C` : 'N/A'}</div></div>
                                <div><div className="text-[11px] font-black uppercase tracking-wide text-[#1A1A1A]/45">Humidity</div><div className="text-lg font-semibold text-[#1A1A1A]">{weatherCurrent.humidity_pct != null ? `${Math.round(Number(weatherCurrent.humidity_pct))}%` : 'N/A'}</div></div>
                                <div><div className="text-[11px] font-black uppercase tracking-wide text-[#1A1A1A]/45">UV Index</div><div className="text-lg font-semibold text-[#1A1A1A]">{weatherCurrent.uv_index != null ? Number(weatherCurrent.uv_index).toFixed(1) : 'N/A'}</div></div>
                                <div><div className="text-[11px] font-black uppercase tracking-wide text-[#1A1A1A]/45">Condition</div><div className="text-lg font-semibold text-[#1A1A1A]">{weatherCurrent.condition || 'Unavailable'}</div></div>
                            </div>
                        </div>
                        <div className="mt-4 rounded-xl border border-[#F4D03F]/20 bg-white px-4 py-3 text-sm font-semibold text-[#1A1A1A]/70">{flightArea?.forage?.recommendation}</div>
                    </div>
                </div>
            </section>

            <section className={cn(glass.section, 'p-4 md:p-6')}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Economic route planner</h2>
                    <p className="max-w-md text-right text-sm text-[#1A1A1A]/55">{flightArea?.route_planner?.helper_text || 'Choose a start point and hive status to build a simple visit order.'}</p>
                </div>
                <div className="mt-5 grid gap-4 xl:grid-cols-2 xl:gap-5">
                    <div className="rounded-xl border border-[#F4D03F]/20 bg-[#F9F7F2] p-5">
                        <div className="text-lg font-semibold text-[#1A1A1A]">Start point</div>
                        <div className="mt-5">
                            <Select value={startPointId || selectedApiaryId} onValueChange={setStartPointId}>
                                <SelectTrigger className="h-12 rounded-xl border-[#F4D03F]/30 bg-white text-sm font-semibold text-[#1A1A1A]">
                                    <SelectValue placeholder="Select a start point" />
                                </SelectTrigger>
                                <SelectContent className={cn(glass.selectContent, 'rounded-xl')}>
                                    {(flightArea?.route_planner?.start_options || locationOptions).map((option: any) => (
                                        <SelectItem key={option.id} value={option.id} className="rounded-lg text-sm font-semibold text-[#1A1A1A]">{option.label || option.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#F4D03F]/20 bg-[#F9F7F2] p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="text-lg font-semibold text-[#1A1A1A]">Which hives to visit?</div>
                            <div className="flex flex-wrap gap-2">
                                {statusOptions.map((status) => (
                                    <button key={status} type="button" onClick={() => setStatusFilter(status)} className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors', statusFilter === status ? 'border-[#F4D03F] bg-[#F4D03F]/15 text-[#1A1A1A]' : 'border-[#F4D03F]/20 bg-white text-[#1A1A1A]/60')}>
                                        {status === 'all' ? 'All hives' : status}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 max-h-[240px] space-y-3 overflow-auto pr-1">
                            {filteredHives.map((hive: any) => (
                                <label key={hive.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#F4D03F]/20 bg-white px-4 py-3">
                                    <Checkbox checked={selectedHiveIds.includes(hive.id)} onCheckedChange={(value) => toggleHive(hive.id, Boolean(value))} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="font-semibold text-[#1A1A1A]">{hive.name}</div>
                                            <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold', statusTone(hive.status))}>{hive.status}</span>
                                        </div>
                                        <div className="mt-1 text-sm text-[#1A1A1A]/55">{Number(hive.latitude).toFixed(4)}, {Number(hive.longitude).toFixed(4)}</div>
                                    </div>
                                </label>
                            ))}
                            {filteredHives.length === 0 ? <div className="rounded-xl border border-dashed border-[#F4D03F]/30 bg-white/70 px-4 py-6 text-sm text-[#1A1A1A]/55">No hives match this status filter.</div> : null}
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <Button onClick={handlePlanRoute} disabled={planningRoute} className={cn(glass.btnPrimary, 'h-11 rounded-xl px-5')}>
                                {planningRoute ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Route className="mr-2 h-4 w-4" />}Route plan
                            </Button>
                            <div className="text-sm text-[#1A1A1A]/55">{selectedHiveIds.length} hive(s) selected</div>
                        </div>
                        {routePath.length > 0 ? (
                            <div className="mt-5 rounded-xl border border-[#dfe6f3] bg-[#f8fbff] p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#5577ac]"><CheckCircle2 className="h-4 w-4" />Route summary</div>
                                <div className="space-y-2">
                                    {routePath.map((point, index) => (
                                        <div key={`${point.id}-${index}`} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-[#20304d]">
                                            <span>{index + 1}. {point.name}</span>
                                            <span className="text-[#7a879d]">{point.type === 'origin' ? 'Start' : point.status || 'Stop'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className={cn(glass.section, 'p-4 md:p-6')}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-[#1A1A1A]">All apiaries map</h2>
                    <p className="text-sm text-[#1A1A1A]/55">All locations from &quot;My locations&quot;</p>
                </div>
                <div className="mt-5 overflow-hidden rounded-xl border border-[#d9e5f4]">
                    <div className="h-[260px] sm:h-[320px] md:h-[360px]">
                        <MapContainer center={allApiaries.length > 0 ? [Number(allApiaries[0].latitude), Number(allApiaries[0].longitude)] : mapCenter} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap contributors &copy; CARTO' />
                            <FitApiaries points={allApiaries} />
                            {allApiaries.map((apiary: any) => (
                                <React.Fragment key={apiary.id}>
                                    <CircleMarker center={[Number(apiary.latitude), Number(apiary.longitude)]} radius={8} pathOptions={{ color: apiary.id === flightArea?.apiary?.id ? '#0f5dbb' : '#6f87b6', fillColor: apiary.id === flightArea?.apiary?.id ? '#0f5dbb' : '#aac4ea', fillOpacity: 0.95, weight: 2 }}>
                                        <Popup><div className="space-y-1"><div className="text-sm font-semibold">{apiary.name}</div><div className="text-xs text-slate-500">{apiary.location_name}</div><div className="text-xs text-slate-500">{apiary.hive_count} hive(s)</div></div></Popup>
                                    </CircleMarker>
                                    {showAllApiaryRadius ? <Circle center={[Number(apiary.latitude), Number(apiary.longitude)]} radius={Math.round(Number(apiary.effective_radius_km || 2) * 1000)} pathOptions={{ color: '#91b5e8', fillColor: '#cfe2fb', fillOpacity: 0.14, weight: 1.5 }} /> : null}
                                </React.Fragment>
                            ))}
                        </MapContainer>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <Button variant="outline" onClick={() => setShowAllApiaryRadius((value) => !value)} className={cn(glass.btnSecondary, 'h-11 rounded-xl px-5')}>Draw effective flight radius for all apiaries</Button>
                    <div className="text-sm text-[#1A1A1A]/55">If you do not see any apiary on the map, make sure &quot;My locations&quot; has a location assigned.</div>
                </div>
            </section>
        </motion.div>
    );
};

export default FlightMapView;
