import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Map as MapIcon, Navigation, Activity, Zap, Play, Pause,
    RotateCcw, Crosshair, Loader2, Wind, Droplets, Sun,
    CloudRain, AlertTriangle, Route, Locate
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import { beeyieldService } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { useApiaryWeatherSummary } from '@/hooks/useApiaryWeatherSummary';
import WeatherTelemetryPanel from './WeatherTelemetryPanel';

// Fix Leaflet default icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Heatmap Component for React-Leaflet
const HeatLayer = ({ points, visible }: { points: any[], visible: boolean }) => {
    const map = useMap();
    const heatLayerRef = useRef<any>(null);

    useEffect(() => {
        if (!map || !visible) {
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
                heatLayerRef.current = null;
            }
            return;
        }

        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
        }

        const heatPoints = points.map(p => [p.lat, p.lng, p.intensity || 0.5]);
        // @ts-ignore
        heatLayerRef.current = L.heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
        }).addTo(map);

        return () => {
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
            }
        };
    }, [map, points, visible]);

    return null;
};

const FlightMapView: React.FC = () => {
    const [selectedPlaceId, setSelectedPlaceId] = useState<string>("");
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    
    // Data Hooks
    const { data: apiariesData, isLoading: apiariesLoading } = useApiaries();
    const { data: hivesData, isLoading: hivesLoading } = useHives(selectedPlaceId || undefined);
    
    const [foragePotential, setForagePotential] = useState<any>(null);
    const [effectiveRadius, setEffectiveRadius] = useState(2);
    const [maxRadius, setMaxRadius] = useState(5);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [showUtility, setShowUtility] = useState(false);
    const [route, setRoute] = useState<any[]>([]);
    const [planningRoute, setPlanningRoute] = useState(false);

    const [places, setPlaces] = useState<any[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const selectedApiaryId = selectedPlace?.apiary_id || selectedPlace?.linked_apiary_id || selectedPlaceId || '';
    const { data: weatherSummary, isLoading: weatherLoading } = useApiaryWeatherSummary(selectedApiaryId || undefined);
    const weather = React.useMemo(() => ({
        temperature: weatherSummary?.current?.temperature_c ?? null,
        humidity: weatherSummary?.current?.humidity_pct ?? null,
        solar_pressure: weatherSummary?.current?.uv_index ?? null,
        bee_flight_status: (weatherSummary?.current?.temperature_c || 0) > 12 && (weatherSummary?.current?.humidity_pct || 100) < 85 ? 'Enabled' : 'Limited',
    }), [weatherSummary]);

    // Initial Data Fetch
    useEffect(() => {
        const init = async () => {
            if (!apiariesData) return;
            setIsInitialLoading(true);
            try {
                // Fetch infrastructure registers
                const infrastructure = await beeyieldService.getInfrastructureRegisters();
                
                if (infrastructure && infrastructure.length > 0) {
                    const enriched = infrastructure.map(inf => {
                        const apiary = apiariesData.find(a => a.id === inf.apiary_id);
                        return {
                            ...inf,
                            latitude: inf.latitude || apiary?.latitude || 0,
                            longitude: inf.longitude || apiary?.longitude || 0,
                            name: inf.name || apiary?.name || `Device ${inf.serial_number}`
                        };
                    });
                    setPlaces(enriched);
                    if (!selectedPlaceId) {
                        setSelectedPlaceId(enriched[0].id);
                        setSelectedPlace(enriched[0]);
                    }
                } else if (apiariesData.length > 0) {
                    const mapped = apiariesData.map(a => ({
                        id: a.id,
                        name: a.name,
                        latitude: a.latitude,
                        longitude: a.longitude,
                        effective_radius: 2,
                        max_radius: 5
                    }));
                    setPlaces(mapped);
                    if (!selectedPlaceId) {
                        setSelectedPlaceId(mapped[0].id);
                        setSelectedPlace(mapped[0]);
                    }
                }
            } catch (err) {
                console.error("Initialization failed:", err);
                toast.error("Failed to load map data");
            } finally {
                setIsInitialLoading(false);
            }
        };
        init();
    }, [apiariesData]);

    const hives = hivesData || [];
    const loading = apiariesLoading || hivesLoading || isInitialLoading;

    const loadPlaceData = async (place: any) => {
        setSelectedPlace(place);
        setEffectiveRadius(place.radius_km || 2);
        setMaxRadius(place.max_radius_km || 5);
        setRoute([]);

        try {
            const potentialRes = await beeyieldService.getFlightPotential(place.apiary_id || place.id);
            setForagePotential(potentialRes);
            toast.success(`Tactical scan complete for ${place.name}`);
        } catch (err) {
            console.error("Load place data failed:", err);
        }
    };

    const handlePlaceChange = (id: string) => {
        const place = places.find(p => p.id === id);
        if (place) {
            setSelectedPlaceId(id);
            loadPlaceData(place);
        }
    };

    const handlePlanRoute = async () => {
        if (!selectedPlace) return;
        setPlanningRoute(true);
        try {
            // Filter hives for alerts or critical status
            const targetHives = hives.filter(h => h.status?.toLowerCase().includes('alert') || h.status?.toLowerCase().includes('weak'));
            const hiveIds = targetHives.length > 0 ? targetHives.map(h => h.id) : hives.slice(0, 5).map(h => h.id);

            const startPoint = { lat: selectedPlace.latitude, lng: selectedPlace.longitude };
            const result = await beeyieldService.planRoute(startPoint, hiveIds);

            if (result && result.path && result.path.length > 0) {
                setRoute(result.path);
                toast.success(`Route calculated: ${result.path.length - 1} stops`);
            } else {
                toast.warning("No optimal route found for selected criteria");
            }
        } catch (err) {
            toast.error("Routing engine error");
        } finally {
            setPlanningRoute(false);
        }
    };

    if (loading && places.length === 0) {
        return (
            <div className="h-[600px] w-full flex items-center justify-center bg-[#F9F7F2] rounded-[2.5rem] border border-slate-100">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-[#1B9157] animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-slate-500">Loading map…</p>
                </div>
            </div>
        );
    }

    const mapCenter: [number, number] = selectedPlace ? [selectedPlace.latitude, selectedPlace.longitude] : [0, 0];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* Header Controls */}
            <PageHeader
                icon={MapIcon}
                label="Flight map"
                title={<>Flight <span className="text-[#F4D03F]">Deployment</span></>}
                subtitle="View your hives and plan a route."
                actions={
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="w-56">
                            <Select value={selectedPlaceId} onValueChange={handlePlaceChange}>
                                <SelectTrigger className="bg-white/80 border-gray-100 rounded-xl font-bold h-9 text-xs">
                                    <SelectValue placeholder="Select Location" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                    {places.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="text-xs font-bold">
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handlePlanRoute}
                            disabled={planningRoute}
                            className={cn(glass.btnPrimary, "h-9 px-4 text-sm font-semibold shadow-lg shadow-[#1B9157]/10")}
                        >
                            {planningRoute ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Route className="w-3.5 h-3.5 mr-2" />}
                            Plan Route
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Tactical Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <WeatherTelemetryPanel
                        summary={weatherSummary}
                        isLoading={weatherLoading}
                        title="Flight map weather"
                        compact
                    />

                    {(weatherSummary?.current?.temperature_c != null || weatherSummary?.current?.humidity_pct != null) && (
                        <div className={cn(glass.section, "overflow-hidden border-white/60 bg-white/55 shadow-xl")}>
                            <div className="border-b border-[#F4D03F]/15 px-5 py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Flight readiness</h3>
                                    <p className="text-[10px] font-semibold text-slate-500">Weather-aware deployment status for this apiary.</p>
                                </div>
                                <span className={cn(
                                    "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]",
                                    (weatherSummary?.current?.temperature_c || 0) > 12 && (weatherSummary?.current?.humidity_pct || 100) < 85
                                        ? "border border-[#1B9157]/20 bg-[#1B9157]/10 text-[#1B9157]"
                                        : "border border-[#F4D03F]/20 bg-[#F4D03F]/10 text-[#9A6B00]"
                                )}>
                                    {(weatherSummary?.current?.temperature_c || 0) > 12 && (weatherSummary?.current?.humidity_pct || 100) < 85 ? "Enabled" : "Limited"}
                                </span>
                            </div>
                            <div className="space-y-4 p-5">
                                {weatherSummary?.current?.temperature_c != null && weatherSummary.current.temperature_c < 10 && (
                                    <Alert className="bg-red-50 border-red-100 text-red-700 rounded-2xl">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle className="font-black text-xs">Flight Grounded</AlertTitle>
                                        <AlertDescription className="text-[10px] font-medium opacity-80">
                                            Temperature is below 10°C, so foraging activity is expected to be dormant.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
                                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Potential score</div>
                                        <div className="mt-2 text-3xl font-black tracking-tight text-[#1A1A1A]">{Math.round(foragePotential?.score || 0)}%</div>
                                        <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden bg-[#F4D03F]/10">
                                            <div className="h-full rounded-full bg-[#1B9157]" style={{ width: `${foragePotential?.score || 0}%` }} />
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
                                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Active sources</div>
                                        <div className="mt-2 text-3xl font-black tracking-tight text-[#1A1A1A]">{foragePotential?.active_sources?.length || 0}</div>
                                        <div className="mt-1 text-[10px] font-semibold text-slate-500">Blooming nectar zones near the selected site.</div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#F4D03F]/10 bg-[#FFF9F0] p-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Recommendation</div>
                                    <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">
                                        {foragePotential?.recommendation || "Real-time weather and bloom telemetry will drive your routing recommendation here."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {false && (
                    <div className={cn(glass.card, "p-0 overflow-hidden")}>
                        <div className="bg-[#1A1A1A] p-5 text-white">
                            <h3 className="text-[10px] font-bold text-[#F4D03F] mb-4">Bee-Specific Meteo</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sky-400">
                                        <Wind className="w-4 h-4" />
                                        <span className="text-[10px] font-black">Density</span>
                                    </div>
                                    <p className="text-xl font-bold tabular-nums text-white">{weatherSummary?.current?.humidity_pct != null ? `${Math.round(weatherSummary.current.humidity_pct)}%` : 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-yellow-500">
                                        <Sun className="w-4 h-4" />
                                        <span className="text-[10px] font-black">Solar PSI</span>
                                    </div>
                                    <p className="text-xl font-bold tabular-nums text-white">{weather?.solar_pressure || 840} <span className="text-[10px] opacity-40">W/m²</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {weather && weather.temperature < 10 && (
                                <Alert className="bg-red-50 border-red-100 text-red-700 rounded-2xl">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle className="font-black text-xs">Flight Grounded</AlertTitle>
                                    <AlertDescription className="text-[10px] font-medium opacity-80">
                                        Temp below 10°C. Foraging activity is dormant.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                <span className={glass.microLabel}>Flight Status</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider",
                                        weather?.bee_flight_status === 'Enabled' ? "bg-[#1B9157]/10 text-[#1B9157] border border-[#1B9157]/20" : "bg-[#F4D03F]/10 text-[#F4D03F] border border-[#F4D03F]/20"
                                    )}>
                                        {weather?.bee_flight_status?.toUpperCase() || 'Optimal'}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-[#F4D03F]/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#1B9157] rounded-full" style={{ width: `${foragePotential?.score || 70}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Radius Controls */}
                    <div className={cn(glass.card, "p-5 space-y-5")}>
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={glass.microLabel}>Foraging Range</h3>
                                <span className={cn(glass.badge)}>
                                    {effectiveRadius}KM - {maxRadius}KM
                                </span>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <label className={cn(glass.microLabel, "text-[#1B9157]")}>Effective Radius</label>
                                        <span className="text-[10px] font-bold tabular-nums">{effectiveRadius} KM</span>
                                    </div>
                                    <Slider
                                        value={[effectiveRadius]}
                                        min={0.5}
                                        max={5}
                                        step={0.1}
                                        onValueChange={([v]) => setEffectiveRadius(v)}
                                        className="py-4"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <label className={glass.microLabel}>Max Survival Radius</label>
                                        <span className="text-[10px] font-bold text-[#1A1A1A]/40 tabular-nums">{maxRadius} KM</span>
                                    </div>
                                    <Slider
                                        value={[maxRadius]}
                                        min={effectiveRadius}
                                        max={10}
                                        step={0.5}
                                        onValueChange={([v]) => setMaxRadius(v)}
                                        className="py-4"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 space-y-4">
                            <h4 className={glass.microLabel}>Display Layers</h4>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={showHeatmap ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShowHeatmap(!showHeatmap)}
                                    className={cn("rounded-lg font-bold text-[10px] px-5 h-9", showHeatmap && "bg-[#1A1A1A] text-white")}
                                >
                                    FLIGHT HEATMAP
                                </Button>
                                <Button
                                    variant={showUtility ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShowUtility(!showUtility)}
                                    className={cn("rounded-lg font-bold text-[10px] px-5 h-9", showUtility && "bg-[#F4D03F] text-[#1A1A1A] hover:bg-[#ebd04c]")}
                                >
                                    UTILITY POTENTIAL
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Active Sources */}
                    {foragePotential?.active_sources?.length > 0 && (
                        <div className={cn(glass.card, "p-5")}>
                            <h3 className={cn(glass.microLabel, "mb-4")}>Nectar Engines</h3>
                            <div className="space-y-4">
                                {foragePotential.active_sources.map((source: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 bg-[#F9F7F2] p-3 rounded-lg border border-[#F4D03F]/20 transition-all hover:bg-[#F4D03F]/10">
                                        <div className="w-7 h-7 rounded-lg bg-[#F4D03F]/20 flex items-center justify-center border border-[#F4D03F]/30 font-bold text-[10px] text-[#1A1A1A]">
                                            {source.name[0]}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-xs tracking-tight text-[#1A1A1A]">{source.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="h-1 flex-1 bg-[#F4D03F]/10 rounded-full">
                                                    <div className="h-full bg-[#F4D03F] rounded-full" style={{ width: `${source.potential * 100}%` }} />
                                                </div>
                                                <span className="text-[9px] font-bold tabular-nums text-[#1A1A1A]/60">{(source.potential * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Primary Tactical Map (Leaflet) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className={cn(glass.card, "rounded-xl border-4 border-[#FFF9F0] overflow-hidden relative h-[700px]")}>
                        <MapContainer
                            center={mapCenter}
                            zoom={14}
                            style={{ height: '100%', width: '100%' }}
                            // @ts-ignore
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />

                            {/* Heatmap Layer */}
                            <HeatLayer points={hives.map(h => ({ lat: h.latitude || mapCenter[0], lng: h.longitude || mapCenter[1], intensity: 0.8 }))} visible={showHeatmap} />

                            {/* Center Marker */}
                            <Marker position={mapCenter}>
                                <Popup className="font-bold">
                                    <div className="p-2 space-y-1">
                                        <p className="text-xs font-black text-[#1B9157]">{selectedPlace?.name}</p>
                                        <p className="text-[9px] text-slate-400">COORDS: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</p>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Hive Markers */}
                            {hives.map((hive) => (
                                <Circle
                                    key={hive.id}
                                    center={[hive.latitude || mapCenter[0], hive.longitude || mapCenter[1]]}
                                    radius={20}
                                    pathOptions={{
                                        color: hive.status?.toLowerCase().includes('critical') ? '#ef4444' : '#1B9157',
                                        fillColor: hive.status?.toLowerCase().includes('critical') ? '#ef4444' : '#1B9157',
                                        fillOpacity: 0.8
                                    }}
                                >
                                    <Popup className="rounded-xl border-none shadow-2xl">
                                        <div className="p-4 space-y-3 min-w-[200px]">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400">Hive Unit</p>
                                                    <h4 className="text-lg font-black">{hive.hive_code}</h4>
                                                </div>
                                                <Badge className={cn(
                                                    "font-black text-[8px]",
                                                    hive.status?.toLowerCase().includes('healthy') ? "bg-green-100 text-[#1B9157]" : "bg-red-100 text-red-700"
                                                )}>
                                                    {hive.status || 'Active'}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                                <div>
                                                    <span className="text-[8px] font-black text-slate-300 block mb-1">Health Index</span>
                                                    <span className="text-xs font-bold">92.4%</span>
                                                </div>
                                                <div>
                                                    <span className="text-[8px] font-black text-slate-300 block mb-1">Trip Density</span>
                                                    <span className="text-xs font-bold">4.2/min</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Circle>
                            ))}

                            {/* Foraging Radii */}
                            <Circle
                                center={mapCenter}
                                radius={effectiveRadius * 1000}
                                pathOptions={{
                                    color: '#1B9157',
                                    fillColor: '#1B9157',
                                    fillOpacity: 0.05,
                                    dashArray: '5, 10'
                                }}
                            />
                            <Circle
                                center={mapCenter}
                                radius={maxRadius * 1000}
                                pathOptions={{
                                    color: '#D1D5DB',
                                    fillColor: '#D1D5DB',
                                    fillOpacity: 0.02,
                                    dashArray: '10, 20',
                                    weight: 1
                                }}
                            />

                            {/* Optimal Route Path */}
                            {route.length > 0 && (
                                <Polyline
                                    positions={route.map(p => [p.latitude, p.longitude])}
                                    pathOptions={{
                                        color: '#3b82f6',
                                        weight: 4,
                                        dashArray: '10, 10',
                                        opacity: 0.8
                                    }}
                                />
                            )}

                            {/* Change View On Place Transition */}
                            <MapUpdater center={mapCenter} />
                        </MapContainer>

                        {/* Tactical HUD Overlay on Map */}
                        <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
                            <div className="bg-[#FFF9F0]/90 backdrop-blur-md border border-[#F4D03F]/20 p-3 rounded-xl shadow-lg flex items-center gap-5">
                                <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
                                    <div className="w-8 h-8 rounded-lg bg-[#1B9157]/10 flex items-center justify-center text-[#1B9157]">
                                        <Crosshair className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className={glass.microLabel}>Tracked Hives</p>
                                        <p className="text-lg font-bold tabular-nums text-[#1A1A1A]">{hives.length}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className={glass.microLabel}>Flight Power</p>
                                        <p className="text-lg font-bold tabular-nums text-blue-500">{foragePotential?.score}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route Legend */}
                        {route.length > 0 && (
                            <div className="absolute bottom-8 left-8 z-[1000] animate-in slide-in-from-left-4">
                                <div className="rounded-xl shadow-xl p-5 bg-[#1A1A1A] text-white border border-white/10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Route className="w-5 h-5 text-blue-400" />
                                        <span className="text-[10px] font-bold text-[#F4D03F]">Active route</span>
                                    </div>
                                    <div className="space-y-3">
                                        {route.slice(0, 3).map((stop, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full bg-blue-400 flex items-center justify-center text-[10px] font-bold text-white">
                                                    {i + 1}
                                                </div>
                                                <span className="text-[10px] font-bold opacity-80">{stop.name}</span>
                                            </div>
                                        ))}
                                        {route.length > 3 && <p className="text-[9px] font-bold opacity-40">+{route.length - 3} MORE STOPS</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Educational Logic Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={cn(glass.card, "p-5 border-l-4 border-l-[#1B9157]")}>
                            <h4 className="text-xs font-bold uppercase tracking-tight text-[#1A1A1A] mb-2">Environmental Influence</h4>
                            <p className="text-[10px] text-[#1A1A1A]/50 font-medium leading-relaxed">
                                Current conditions suggests forage efficiency is {foragePotential?.score > 60 ? 'optimal' : 'restricted'}.
                                Solar pressure and humidity impacts nectar thinning. Monitor hives for potential washout.
                            </p>
                        </div>
                        <div className={cn(glass.card, "p-5 border-l-4 border-l-[#F4D03F]")}>
                            <h4 className="text-xs font-bold uppercase tracking-tight text-[#1A1A1A] mb-2">Recommendation</h4>
                            <p className="text-[10px] text-[#1A1A1A]/50 font-medium leading-relaxed">
                                {foragePotential?.recommendation || 'Keep an eye on activity. If it drops, check the alert areas first.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Helper component to handle map movement
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

export default FlightMapView;
