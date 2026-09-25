import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Circle, CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import {
    AlertTriangle,
    Check,
    CheckCircle2,
    CloudSun,
    Compass,
    Droplets,
    Flower2,
    Layers,
    Loader2,
    MapPin,
    Maximize2,
    Navigation,
    PieChart,
    RefreshCw,
    Route,
    Sparkles,
    Sun,
    Thermometer,
    Wind,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
            gradient: { 0.2: '#10b981', 0.45: '#f59e0b', 0.7: '#f97316', 1: '#ef4444' },
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

const statusTone = (status: string) => {
    const lowered = status.toLowerCase();
    if (lowered.includes('critical') || lowered.includes('alert')) {
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
    if (lowered.includes('weak') || lowered.includes('warning')) {
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
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

    const { data: publicFlightMap, isLoading: publicMapLoading, refetch: refetchPublic } = useQuery({
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

    const { data: privateFlightArea, isLoading: pageLoading, isFetching, refetch: refetchPrivate } = useQuery({
        queryKey: ['flight-area', selectedApiaryId, selectedLandTypeId || 'default'],
        queryFn: () => beeyieldService.getFlightAreaDashboard(selectedApiaryId, selectedLandTypeId || undefined),
        enabled: hasPrivateApiaries && !!selectedApiaryId,
        staleTime: 60000,
    });

    const flightArea = React.useMemo(
        () => privateFlightArea || buildPublicFlightArea(publicFlightMap || null, selectedLandTypeId),
        [privateFlightArea, publicFlightMap, selectedLandTypeId],
    );

    const flightApiary = flightArea?.apiary;

    useEffect(() => {
        if (!flightApiary) return;
        setEffectiveRadiusKm(Number(flightApiary.effective_radius_km || 2));
        setMaxRadiusKm(Number(flightApiary.max_radius_km || 5));
        setStartPointId((value) => value || String(flightApiary.id));
        setRoutePath([]);
    }, [flightApiary]);

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
    const mapCenter: [number, number] = [Number(flightArea?.map?.center?.lat || -2.4187), Number(flightArea?.map?.center?.lng || 37.9686)];
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
            const isPublicMode = !hasPrivateApiaries || (publicFlightMap && 'site_mode' in publicFlightMap);
            if (isPublicMode && publicFlightMap) {
                const apiaryNode = {
                    id: String(publicFlightMap.apiary.id),
                    name: publicFlightMap.apiary.name,
                    latitude: Number(publicFlightMap.apiary.latitude || 0),
                    longitude: Number(publicFlightMap.apiary.longitude || 0),
                    type: 'origin' as const,
                };

                const selectedHivesData = publicFlightMap.hives
                    .filter((h) => selectedHiveIds.includes(String(h.id)))
                    .map((h) => ({
                        id: String(h.id),
                        name: h.hive_code || 'Kibwezi anchor',
                        latitude: Number(h.latitude || 0),
                        longitude: Number(h.longitude || 0),
                        type: 'stop' as const,
                        status: h.status || 'Active',
                    }));

                setRoutePath([apiaryNode, ...selectedHivesData]);
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

    if (loading) {
        return (
            <div className="flex min-h-[480px] items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                <div className="space-y-4 text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-honey" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Loading Bee Flight Telemetry...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Top Header matching InspectionsPage */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-honey/10 border border-honey/20 flex items-center justify-center text-honey flex-shrink-0">
                        <Navigation className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl font-bold text-foreground">
                            Bee Flight <span className="text-honey">Area</span>
                        </h1>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span>Live forage, map, and route planning for your selected apiary</span>
                            {flightArea?.apiary?.location_name && (
                                <span className="font-mono text-honey">· {flightArea.apiary.location_name}</span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            if (hasPrivateApiaries) refetchPrivate();
                            else refetchPublic();
                        }}
                        disabled={isFetching}
                        className="p-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                        title="Refresh Flight Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-honey' : ''}`} />
                    </button>
                    <button
                        type="button"
                        onClick={handlePlanRoute}
                        disabled={planningRoute || selectedHiveIds.length === 0}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-emerald-500/40 disabled:opacity-50"
                        title="Plan Route"
                    >
                        {planningRoute ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Route className="w-4 h-4 text-white stroke-[2.5]" />}
                        <span className="text-white">Plan Route ({selectedHiveIds.length})</span>
                    </button>
                </div>
            </div>

            {/* Prominent Telemetry Banner matching InspectionsPage */}
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Compass className="w-5 h-5 text-white stroke-[2.5]" />
                    </div>
                    <div>
                        <h3 className="font-display text-sm sm:text-base font-bold text-white">
                            {flightArea?.apiary?.name || 'BeeFlight Telemetry'} · {flightArea?.apiary?.location_name || 'Kibwezi Apiary Zone'}
                        </h3>
                        <p className="text-xs text-emerald-200/90 mt-0.5">
                            Active GPS: {Number(flightArea?.apiary?.latitude || 0).toFixed(4)}, {Number(flightArea?.apiary?.longitude || 0).toFixed(4)} · Hives: {suggestedHives.length} colonies in flight perimeter
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE FORAGE RADAR
                    </span>
                </div>
            </div>

            {/* Stats Grid matching InspectionsPage */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Forage potential</span>
                        <Flower2 className="w-4 h-4 text-honey" />
                    </div>
                    <p className="mt-2 font-display text-3xl font-bold text-honey">
                        ~{Math.round(Number(flightArea?.forage?.potential_pct || 0))}%
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Effective radius</span>
                        <Compass className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="mt-2 font-display text-3xl font-bold text-emerald-400">
                        {formatMeters(effectiveRadiusKm)}
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Maximum radius</span>
                        <Maximize2 className="w-4 h-4 text-orange-400" />
                    </div>
                    <p className="mt-2 font-display text-3xl font-bold text-orange-400">
                        {formatMeters(maxRadiusKm)}
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Est. forage share</span>
                        <PieChart className="w-4 h-4 text-honey" />
                    </div>
                    <p className="mt-2 font-display text-3xl font-bold text-foreground">
                        {Math.round(Number(flightArea?.forage?.estimated_share_pct || 0))}%
                    </p>
                </div>
            </div>

            {/* Map Layer Overlays Quick Filters matching InspectionsPage */}
            <div className="rounded-xl border border-border bg-card p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-honey" />
                    <span className="font-bold text-foreground">Flight Map Overlays:</span>
                    <span className="text-muted-foreground text-[11px]">Toggle telemetry and forage layers</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                    {layerButtons.map(([label, active, setter]) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => setter((v) => !v)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
                                active
                                    ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold shadow-md border border-emerald-500/40'
                                    : 'bg-background border-border text-muted-foreground hover:border-honey/40 hover:text-foreground'
                            }`}
                        >
                            <Check className={`w-3.5 h-3.5 ${active ? 'opacity-100 text-white' : 'opacity-30'}`} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Flight Parameters & Radius Controls Card */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-6">
                <div className="rounded-xl border border-border bg-background/60 p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-honey" />
                        <span>{hasPrivateApiaries ? 'My locations' : 'Live monitoring location'}</span>
                    </div>
                    <Select value={selectedApiaryId} onValueChange={handleApiaryChange}>
                        <SelectTrigger className="h-11 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-honey/40">
                            <SelectValue placeholder="Select an apiary" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-border bg-card text-foreground">
                            {locationOptions.map((location: any) => (
                                <SelectItem key={location.id} value={location.id}>{location.label || location.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* Land Type */}
                    <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Land type & Flora</span>
                            <Flower2 className="w-4 h-4 text-honey" />
                        </div>
                        <Select value={activeLandTypeId} onValueChange={setSelectedLandTypeId}>
                            <SelectTrigger className="h-10 rounded-lg border border-border bg-card text-sm font-medium text-foreground">
                                <SelectValue placeholder="Choose forage type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-border bg-card text-foreground">
                                {landTypes.map((option: any) => (
                                    <SelectItem key={option.id} value={option.id}>
                                        {option.name}
                                    </SelectItem>
                                ))}
                                {landTypes.length === 0 ? (
                                    <div className="px-3 py-2 text-xs text-muted-foreground">
                                        No land types available yet.
                                    </div>
                                ) : null}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-honey" />
                            <span>Estimated forage share: <strong className="text-foreground">{Math.round(Number(flightArea?.forage?.estimated_share_pct || 0))}%</strong></span>
                        </div>
                    </div>

                    {/* Effective Radius */}
                    <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
                        <div className="flex items-end justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Effective radius</span>
                            <span className="font-display text-lg font-bold text-emerald-400">{formatMeters(effectiveRadiusKm)}</span>
                        </div>
                        <Slider
                            value={[effectiveRadiusKm]}
                            min={0.5}
                            max={Math.max(5, maxRadiusKm)}
                            step={0.1}
                            onValueChange={([value]) => setEffectiveRadiusKm(value)}
                            className="py-1"
                        />
                        <div className="text-[11px] text-muted-foreground flex justify-between">
                            <span>Core zone: 500m</span>
                            <span>Limit: {formatMeters(Math.max(5, maxRadiusKm))}</span>
                        </div>
                    </div>

                    {/* Maximum Radius */}
                    <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
                        <div className="flex items-end justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Maximum radius</span>
                            <span className="font-display text-lg font-bold text-orange-400">{formatMeters(maxRadiusKm)}</span>
                        </div>
                        <Slider
                            value={[maxRadiusKm]}
                            min={effectiveRadiusKm}
                            max={10}
                            step={0.1}
                            onValueChange={([value]) => setMaxRadiusKm(value)}
                            className="py-1"
                        />
                        <div className="text-[11px] text-muted-foreground flex justify-between">
                            <span>Min: {formatMeters(effectiveRadiusKm)}</span>
                            <span>Extended: 10,000m</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map and Telemetry Panels */}
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_360px]">
                {/* Map Card */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
                    <div className="px-5 py-3 border-b border-border bg-card/60 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                            <MapPin className="w-4 h-4 text-honey" />
                            <span>{flightArea?.apiary?.name || 'Monitoring Site'}</span>
                            <span className="text-muted-foreground font-normal">· {flightArea?.apiary?.location_name || 'Active Perimeter'}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            GPS LOCKED
                        </span>
                    </div>

                    <div className="h-[520px] w-full relative">
                        <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                            <HeatLayer points={heatmapPoints} visible={showHeatmap} />
                            <SetView center={mapCenter} />
                            {showMaximumRange ? (
                                <Circle
                                    center={mapCenter}
                                    radius={Math.round(maxRadiusKm * 1000)}
                                    pathOptions={{ color: '#f97316', fillColor: '#fb923c', fillOpacity: 0.08, weight: 2 }}
                                />
                            ) : null}
                            {showEffectiveArea ? (
                                <Circle
                                    center={mapCenter}
                                    radius={Math.round(effectiveRadiusKm * 1000)}
                                    pathOptions={{ color: '#10b981', fillColor: '#34d399', fillOpacity: 0.16, weight: 2 }}
                                />
                            ) : null}
                            <CircleMarker
                                center={mapCenter}
                                radius={10}
                                pathOptions={{ color: '#047857', fillColor: '#10b981', fillOpacity: 1, weight: 3 }}
                            >
                                <Popup>
                                    <div className="space-y-1 p-1 text-slate-800">
                                        <div className="text-xs font-bold">{flightArea?.apiary?.name}</div>
                                        <div className="text-[11px] text-slate-600">{flightArea?.apiary?.location_name}</div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                            {heatmapPoints.map((point) => (
                                <CircleMarker
                                    key={point.id}
                                    center={[point.lat, point.lng]}
                                    radius={6}
                                    pathOptions={{
                                        color: '#b45309',
                                        fillColor: point.status.toLowerCase().includes('critical') || point.status.toLowerCase().includes('alert') ? '#ef4444' : '#f59e0b',
                                        fillOpacity: 0.95,
                                        weight: 2,
                                    }}
                                >
                                    <Popup>
                                        <div className="space-y-1 p-1 text-slate-800">
                                            <div className="text-xs font-bold">{point.name}</div>
                                            <div className="text-[11px] text-slate-600">Status: {point.status}</div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                            {showForagePotential
                                ? forageZonePoints.map((zone: any) => (
                                      <Circle
                                          key={zone.id}
                                          center={[zone.lat, zone.lng]}
                                          radius={zone.radius_m}
                                          pathOptions={{
                                              color: '#10b981',
                                              fillColor: '#6ee7b7',
                                              fillOpacity: 0.08 + Math.min(Number(zone.density_score || 0), 1) * 0.08,
                                              weight: 1.5,
                                          }}
                                      >
                                          <Popup>
                                              <div className="space-y-1 p-1 text-slate-800">
                                                  <div className="text-xs font-bold">{zone.name}</div>
                                                  <div className="text-[11px] text-slate-600">{zone.flora_type || 'Forage zone'}</div>
                                              </div>
                                          </Popup>
                                      </Circle>
                                  ))
                                : null}
                            {routePath.length > 1 ? (
                                <Polyline
                                    positions={routePath.map((point) => [point.latitude, point.longitude])}
                                    pathOptions={{ color: '#10b981', weight: 4, opacity: 0.9, dashArray: '8 8' }}
                                />
                            ) : null}
                        </MapContainer>
                    </div>

                    <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3 bg-card/50">
                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold text-muted-foreground">
                            <Compass className="w-3.5 h-3.5 text-honey" />
                            <span>Geographical Coordinates:</span>
                        </div>
                        <div className="flex flex-wrap gap-4 font-mono text-foreground font-medium">
                            <span>Lat: {Number(flightArea?.apiary?.latitude || 0).toFixed(6)}</span>
                            <span>Lng: {Number(flightArea?.apiary?.longitude || 0).toFixed(6)}</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-5">
                    {/* Live Telemetry & Weather */}
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                                <CloudSun className="w-4 h-4 text-honey" />
                                Live Telemetry & Weather
                            </h3>
                            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border', flightArea?.weather?.available ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>
                                {flightArea?.weather?.available ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>

                        <div className={cn('rounded-xl border px-3.5 py-2.5 text-xs', flightArea?.weather?.available ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300')}>
                            {flightArea?.weather?.message || `Weather feed active for ${flightArea?.apiary?.location_name}.`}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-xl border border-border bg-background/60 p-2.5">
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    <Thermometer className="w-3 h-3 text-orange-400" /> Temp
                                </div>
                                <div className="font-display text-lg font-bold text-foreground mt-1">
                                    {weatherCurrent.temperature_c != null ? `${Math.round(Number(weatherCurrent.temperature_c))}°C` : 'N/A'}
                                </div>
                            </div>
                            <div className="rounded-xl border border-border bg-background/60 p-2.5">
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    <Droplets className="w-3 h-3 text-blue-400" /> Humidity
                                </div>
                                <div className="font-display text-lg font-bold text-foreground mt-1">
                                    {weatherCurrent.humidity_pct != null ? `${Math.round(Number(weatherCurrent.humidity_pct))}%` : 'N/A'}
                                </div>
                            </div>
                            <div className="rounded-xl border border-border bg-background/60 p-2.5">
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    <Sun className="w-3 h-3 text-amber-400" /> UV Index
                                </div>
                                <div className="font-display text-lg font-bold text-foreground mt-1">
                                    {weatherCurrent.uv_index != null ? Number(weatherCurrent.uv_index).toFixed(1) : 'N/A'}
                                </div>
                            </div>
                            <div className="rounded-xl border border-border bg-background/60 p-2.5">
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    <Wind className="w-3 h-3 text-emerald-400" /> Condition
                                </div>
                                <div className="font-display text-sm font-bold text-foreground truncate mt-1.5">
                                    {weatherCurrent.condition || 'Clear Sky'}
                                </div>
                            </div>
                        </div>

                        {flightArea?.forage?.recommendation ? (
                            <div className="rounded-xl border border-honey/30 bg-honey/5 p-3 text-xs text-muted-foreground flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-honey shrink-0 mt-0.5" />
                                <span>{flightArea.forage.recommendation}</span>
                            </div>
                        ) : null}
                    </div>

                    {/* Educational Guidance */}
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
                        <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-honey" />
                            Apiculture Radar Guidance
                        </h3>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                            {(flightArea?.education_panel || []).map((tip: string) => (
                                <li key={tip} className="flex items-start gap-2.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-honey mt-1.5 shrink-0" />
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Economic Route Planner Section matching InspectionsPage */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                        <h2 className="font-display text-xl font-bold text-foreground">
                            Economic Route <span className="text-honey">Planner</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {flightArea?.route_planner?.helper_text || 'Configure starting waypoint and inspect hives in optimal sequence.'}
                        </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Selected: <strong className="text-foreground">{selectedHiveIds.length}</strong> of {filteredHives.length} hive(s)
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    {/* Start Point */}
                    <div className="rounded-xl border border-border bg-background/50 p-4 sm:p-5 space-y-4">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-honey" />
                            <span>Dispatch / Start Waypoint</span>
                        </div>
                        <Select value={startPointId || selectedApiaryId} onValueChange={setStartPointId}>
                            <SelectTrigger className="h-11 rounded-xl border border-border bg-card text-sm font-medium text-foreground">
                                <SelectValue placeholder="Select a start point" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-border bg-card text-foreground">
                                {(flightArea?.route_planner?.start_options || locationOptions).map((option: any) => (
                                    <SelectItem key={option.id} value={option.id}>
                                        {option.label || option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2 text-xs text-muted-foreground">
                            <div className="font-bold text-foreground flex items-center gap-1.5">
                                <Route className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Perimeter Flight Optimization</span>
                            </div>
                            <p>
                                Route calculations order colonies based on geodesic proximity and elevation contours to minimize walking distance during field inspections.
                            </p>
                        </div>
                    </div>

                    {/* Hives Checklist */}
                    <div className="rounded-xl border border-border bg-background/50 p-4 sm:p-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Hives to Visit
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {statusOptions.map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                                            statusFilter === status
                                                ? 'bg-emerald-600 text-white border-emerald-500/40 shadow-sm'
                                                : 'bg-card border-border text-muted-foreground hover:border-honey/40 hover:text-foreground'
                                        }`}
                                    >
                                        {status === 'all' ? 'All' : status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                            {filteredHives.map((hive: any) => (
                                <label
                                    key={hive.id}
                                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-card hover:border-honey/40 px-3.5 py-2.5 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Checkbox
                                            checked={selectedHiveIds.includes(hive.id)}
                                            onCheckedChange={(value) => toggleHive(hive.id, Boolean(value))}
                                        />
                                        <div className="min-w-0">
                                            <div className="font-bold text-xs text-foreground truncate">{hive.name}</div>
                                            <div className="text-[10px] text-muted-foreground font-mono">
                                                {Number(hive.latitude).toFixed(4)}, {Number(hive.longitude).toFixed(4)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={cn('rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', statusTone(hive.status))}>
                                        {hive.status}
                                    </span>
                                </label>
                            ))}
                            {filteredHives.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border bg-card/40 p-4 text-center text-xs text-muted-foreground">
                                    No hives match this status filter.
                                </div>
                            ) : null}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-muted-foreground">
                                {selectedHiveIds.length} target colony waypoint(s) selected
                            </span>
                            <button
                                type="button"
                                onClick={handlePlanRoute}
                                disabled={planningRoute || selectedHiveIds.length === 0}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all border border-emerald-500/40 disabled:opacity-50"
                            >
                                {planningRoute ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Route className="w-3.5 h-3.5 text-white" />}
                                <span>Calculate Path</span>
                            </button>
                        </div>

                        {routePath.length > 0 ? (
                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Calculated Route Itinerary ({routePath.length} nodes)</span>
                                </div>
                                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                                    {routePath.map((point, index) => (
                                        <div key={`${point.id}-${index}`} className="flex items-center justify-between rounded-lg bg-card border border-border px-3 py-1.5 text-xs text-foreground">
                                            <span className="font-medium">{index + 1}. {point.name}</span>
                                            <span className="text-[11px] font-mono text-muted-foreground">{point.type === 'origin' ? 'Start Base' : point.status || 'Waypoint'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            {/* All Apiaries Overview Map Section */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                        <h2 className="font-display text-xl font-bold text-foreground">
                            All Apiaries <span className="text-honey">Overview</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Regional geospatial distribution for registered apiary installations.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAllApiaryRadius((v) => !v)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                            showAllApiaryRadius
                                ? 'bg-emerald-600 text-white border-emerald-500/40 shadow-sm'
                                : 'bg-background border-border text-foreground hover:bg-card'
                        }`}
                    >
                        <Compass className="w-3.5 h-3.5" />
                        <span>{showAllApiaryRadius ? 'Hide Regional Radii' : 'Show Regional Radii'}</span>
                    </button>
                </div>

                <div className="h-[340px] rounded-xl overflow-hidden border border-border relative">
                    <MapContainer
                        center={allApiaries.length > 0 ? [Number(allApiaries[0].latitude), Number(allApiaries[0].longitude)] : mapCenter}
                        zoom={6}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                        <FitApiaries points={allApiaries} />
                        {allApiaries.map((apiary: any) => (
                            <React.Fragment key={apiary.id}>
                                <CircleMarker
                                    center={[Number(apiary.latitude), Number(apiary.longitude)]}
                                    radius={8}
                                    pathOptions={{
                                        color: apiary.id === flightArea?.apiary?.id ? '#10b981' : '#0284c7',
                                        fillColor: apiary.id === flightArea?.apiary?.id ? '#34d399' : '#38bdf8',
                                        fillOpacity: 0.95,
                                        weight: 2,
                                    }}
                                >
                                    <Popup>
                                        <div className="space-y-1 p-1 text-slate-800">
                                            <div className="text-xs font-bold">{apiary.name}</div>
                                            <div className="text-[11px] text-slate-600">{apiary.location_name}</div>
                                            <div className="text-[11px] text-slate-600">{apiary.hive_count} hive(s)</div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                                {showAllApiaryRadius ? (
                                    <Circle
                                        center={[Number(apiary.latitude), Number(apiary.longitude)]}
                                        radius={Math.round(Number(apiary.effective_radius_km || 2) * 1000)}
                                        pathOptions={{ color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.12, weight: 1.5 }}
                                    />
                                ) : null}
                            </React.Fragment>
                        ))}
                    </MapContainer>
                </div>
            </section>
        </motion.div>
    );
};

export default FlightMapView;
