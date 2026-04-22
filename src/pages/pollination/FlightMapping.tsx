import React from 'react';
import {
    Activity,
    Loader2,
    Map as MapIcon,
    MapPin,
    Navigation,
    RadioTower,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from '@/components/beeyield/GlassTheme';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import WeatherTelemetryPanel from '@/components/beeyield/WeatherTelemetryPanel';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { useApiaryWeatherSummary } from '@/hooks/useApiaryWeatherSummary';
import { useSelectedApiary } from '@/hooks/useSelectedApiary';
import beeyieldService, { PublicFlightMapPayload } from '@/services/beeyieldService';

const EMPTY_HIVES: any[] = [];

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function toRadians(value: number) {
    return (value * Math.PI) / 180;
}

function distanceInMeters(a: [number, number], b: [number, number]) {
    const earthRadius = 6371000;
    const dLat = toRadians(b[0] - a[0]);
    const dLon = toRadians(b[1] - a[1]);
    const lat1 = toRadians(a[0]);
    const lat2 = toRadians(b[0]);
    const q =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    return 2 * earthRadius * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}

const FlightMapping: React.FC = () => {
    const { data: apiaries = [], isLoading: apiariesLoading } = useApiaries();
    const [selectedApiaryId, setSelectedApiaryId] = useSelectedApiary(apiaries[0]?.id);
    const [flightPotential, setFlightPotential] = React.useState<any>(null);
    const [isPotentialLoading, setIsPotentialLoading] = React.useState(false);
    const [publicFlightMap, setPublicFlightMap] = React.useState<PublicFlightMapPayload | null>(null);
    const [isPublicMapLoading, setIsPublicMapLoading] = React.useState(false);

    const privateSelectedApiary = React.useMemo(
        () => apiaries.find((apiary) => apiary.id === selectedApiaryId) || apiaries[0] || null,
        [apiaries, selectedApiaryId],
    );

    const { data: hives = [], isLoading: hivesLoading } = useHives(privateSelectedApiary?.id);
    const { data: weatherSummary, isLoading: weatherLoading } = useApiaryWeatherSummary(privateSelectedApiary?.id);

    React.useEffect(() => {
        let cancelled = false;

        async function loadPublicFlightMap() {
            if (apiariesLoading || apiaries.length > 0 || publicFlightMap) return;

            setIsPublicMapLoading(true);
            try {
                const data = await beeyieldService.getPublicLiveFlightMap('kibwezi-kenya');
                if (!cancelled) {
                    setPublicFlightMap(data);
                }
            } finally {
                if (!cancelled) {
                    setIsPublicMapLoading(false);
                }
            }
        }

        loadPublicFlightMap();
        return () => {
            cancelled = true;
        };
    }, [apiaries, apiariesLoading, publicFlightMap]);

    React.useEffect(() => {
        let cancelled = false;

        async function loadFlightPotential() {
            if (!privateSelectedApiary?.id) {
                setFlightPotential(publicFlightMap?.flight_potential || null);
                setIsPotentialLoading(false);
                return;
            }

            setIsPotentialLoading(true);
            try {
                const data = await beeyieldService.getFlightPotential(privateSelectedApiary.id);
                if (!cancelled) {
                    setFlightPotential(data);
                }
            } finally {
                if (!cancelled) {
                    setIsPotentialLoading(false);
                }
            }
        }

        loadFlightPotential();
        return () => {
            cancelled = true;
        };
    }, [privateSelectedApiary?.id, publicFlightMap]);

    const selectedApiary = privateSelectedApiary || publicFlightMap?.apiary || null;
    const isUsingPublicMap = !privateSelectedApiary && !!publicFlightMap;
    const resolvedHives = React.useMemo(
        () => (isUsingPublicMap ? (publicFlightMap?.hives ?? EMPTY_HIVES) : hives),
        [hives, isUsingPublicMap, publicFlightMap],
    );
    const resolvedWeatherSummary = React.useMemo(
        () => (isUsingPublicMap ? (publicFlightMap?.weather_summary ?? null) : weatherSummary),
        [isUsingPublicMap, publicFlightMap, weatherSummary],
    );
    const locationOptions = privateSelectedApiary ? apiaries : selectedApiary ? [selectedApiary] : [];

    const mapCenter = React.useMemo<[number, number]>(() => {
        if (typeof selectedApiary?.latitude === 'number' && typeof selectedApiary?.longitude === 'number') {
            return [selectedApiary.latitude, selectedApiary.longitude];
        }
        return [-2.42, 37.97];
    }, [selectedApiary?.latitude, selectedApiary?.longitude]);

    const positionedHives = React.useMemo(
        () =>
            resolvedHives.filter(
                (hive) => typeof hive.latitude === 'number' && typeof hive.longitude === 'number',
            ),
        [resolvedHives],
    );

    const routePoints = React.useMemo<[number, number][]>(() => {
        if (isUsingPublicMap && publicFlightMap?.route_points?.length) {
            return publicFlightMap.route_points.map((point) => [point.lat, point.lng]);
        }
        const points: [number, number][] = [mapCenter];
        positionedHives.slice(0, 5).forEach((hive) => {
            points.push([hive.latitude as number, hive.longitude as number]);
        });
        return points;
    }, [isUsingPublicMap, mapCenter, positionedHives, publicFlightMap]);

    const coverageRadiusM = React.useMemo(() => {
        if (isUsingPublicMap && publicFlightMap?.coverage_radius_m) {
            return publicFlightMap.coverage_radius_m;
        }
        if (positionedHives.length === 0) return null;
        const farthest = positionedHives.reduce((maxDistance, hive) => {
            const distance = distanceInMeters(mapCenter, [hive.latitude as number, hive.longitude as number]);
            return Math.max(maxDistance, distance);
        }, 0);
        return Math.round(farthest + 100);
    }, [isUsingPublicMap, mapCenter, positionedHives, publicFlightMap]);

    const readiness = React.useMemo(() => {
        const current = resolvedWeatherSummary?.current;
        const score = typeof flightPotential?.score === 'number' ? flightPotential.score : 0;
        const temperature = current?.temperature_c;
        const humidity = current?.humidity_pct;

        if (typeof temperature === 'number' && temperature < 10) {
            return {
                label: 'Grounded',
                tone: 'text-red-600 bg-red-500/10 border-red-500/20',
                detail: 'Temperature is below safe bee flight threshold.',
            };
        }

        if (typeof humidity === 'number' && humidity > 88) {
            return {
                label: 'Limited',
                tone: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
                detail: 'Humidity is high enough to reduce foraging confidence.',
            };
        }

        if (score >= 70) {
            return {
                label: 'Optimal',
                tone: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
                detail: 'Conditions support active foraging and strong route confidence.',
            };
        }

        if (score >= 40) {
            return {
                label: 'Watch',
                tone: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
                detail: 'Conditions are usable, but routes should be checked before dispatch.',
            };
        }

        return {
            label: 'Pending',
            tone: 'text-muted-foreground bg-muted/20 border-border',
            detail: 'Waiting for stronger telemetry and weather alignment.',
        };
    }, [flightPotential?.score, resolvedWeatherSummary]);

    const activeSources = flightPotential?.active_sources || [];
    const linkedDevices = resolvedWeatherSummary?.linked_device_meta || [];
    const telemetryCount = isUsingPublicMap ? 1 : linkedDevices.length;
    const telemetryReportingCount = isUsingPublicMap ? 1 : linkedDevices.filter((device) => !!device.last_observed_at).length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            <PageHeader
                icon={MapIcon}
                label="Flight mapping"
                title={<>Flight <span className="text-primary">Mapping</span></>}
                subtitle={isUsingPublicMap
                    ? 'Public live map centered on Kibwezi, Kenya with backend weather enrichment'
                    : 'Real apiary telemetry, forecast enrichment, and route visibility'}
                actions={
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedApiary?.id || ''}
                            onChange={(event) => setSelectedApiaryId(event.target.value)}
                            disabled={!privateSelectedApiary}
                            className={cn(glass.select, "min-w-[200px]")}
                        >
                            {locationOptions.map((apiary) => (
                                <option key={apiary.id} value={apiary.id}>
                                    {apiary.name}
                                    {apiary.location_name ? ` | ${apiary.location_name}` : ''}
                                </option>
                            ))}
                        </select>
                        <div className={cn(glass.badge, "py-1.5",
                            apiariesLoading || isPublicMapLoading
                                ? "bg-muted/20 text-muted-foreground border-border"
                                : isUsingPublicMap
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        )}>
                            <MapIcon className="w-3.5 h-3.5 mr-1.5" />
                            {apiariesLoading || isPublicMapLoading ? 'Syncing' : isUsingPublicMap ? 'Public live' : 'Live'}
                        </div>
                    </div>
                }
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                {[
                    {
                        label: 'Active apiary',
                        value: selectedApiary?.name || 'Loading',
                        sub: selectedApiary?.location_name || 'Location pending',
                        icon: MapPin,
                    },
                    {
                        label: 'Tracked hives',
                        value: hivesLoading && !isUsingPublicMap ? '...' : resolvedHives.length,
                        sub: isUsingPublicMap ? `${positionedHives.length} live corridors mapped` : `${positionedHives.length} mapped with coordinates`,
                        icon: Navigation,
                    },
                    {
                        label: 'Linked telemetry',
                        value: weatherLoading && !isUsingPublicMap ? '...' : telemetryCount,
                        sub: isUsingPublicMap ? 'Provider weather feed active for Kibwezi' : `${telemetryReportingCount} reporting recently`,
                        icon: RadioTower,
                    },
                ].map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className={cn(glass.section, "p-5")}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-border flex items-center justify-center">
                                <card.icon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-tight">{card.label}</span>
                        </div>
                        <h4 className="text-xl font-bold text-foreground tracking-tight">{card.value}</h4>
                        <p className="text-[11px] text-muted-foreground mt-1">{card.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Map + Sidebar */}
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)] relative z-10">
                {/* Map */}
                <div className={cn(glass.section, "overflow-hidden flex flex-col")}>
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-border flex items-center justify-center">
                                <MapIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Apiary flight map</h3>
                                <p className="text-[10px] text-muted-foreground">Live route canvas</p>
                            </div>
                        </div>
                        <div className={cn(glass.badge, "py-1.5",
                            apiariesLoading || isPublicMapLoading
                                ? "bg-muted/20 text-muted-foreground border-border"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        )}>
                            <MapIcon className="w-3 h-3 mr-1.5" />
                            {apiariesLoading || isPublicMapLoading ? 'Syncing' : isUsingPublicMap ? 'Public live' : 'Live'}
                        </div>
                    </div>

                    <div className="relative h-[620px] bg-card">
                        <MapContainer
                            key={selectedApiary?.id || 'default-map'}
                            center={mapCenter}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                attribution="&copy; ESRI Satellite"
                            />

                            <Marker position={mapCenter}>
                                <Popup>
                                    <div className="space-y-1 p-1">
                                        <p className="text-xs font-bold">{selectedApiary?.name || 'Apiary'}</p>
                                        <p className="text-[11px] text-gray-500">
                                            {selectedApiary?.location_name || 'Primary apiary anchor'}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>

                            {positionedHives.map((hive) => (
                                <Marker key={hive.id} position={[hive.latitude as number, hive.longitude as number]}>
                                    <Popup>
                                        <div className="space-y-1 p-1">
                                            <p className="text-xs font-bold">{hive.hive_code || 'Hive'}</p>
                                            <p className="text-[11px] text-gray-500">
                                                {hive.status || 'Status pending'}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {routePoints.length > 1 && (
                                <Polyline
                                    positions={routePoints}
                                    pathOptions={{
                                        color: '#10b981',
                                        weight: 4,
                                        dashArray: '10 10',
                                        opacity: 0.85,
                                    }}
                                />
                            )}

                            {coverageRadiusM ? (
                                <Circle
                                    center={mapCenter}
                                    radius={coverageRadiusM}
                                    pathOptions={{
                                        color: '#F4D03F',
                                        fillColor: '#F4D03F',
                                        fillOpacity: 0.06,
                                        weight: 2,
                                        dashArray: '5 5',
                                    }}
                                />
                            ) : null}
                        </MapContainer>

                        {/* Legend */}
                        <div className="absolute bottom-6 right-6 z-[1000] space-y-2.5 rounded-xl border border-border bg-card/95 backdrop-blur-sm p-4 shadow-lg">
                            <h5 className="border-b border-border pb-2 text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest">
                                Flight analysis
                            </h5>
                            <div className="flex items-center gap-3">
                                <div className="h-0.5 w-5 border-b-2 border-dashed border-emerald-500" />
                                <span className="text-[10px] font-semibold text-muted-foreground">
                                    Suggested route
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rotate-45 border border-primary/40 bg-primary/30 rounded-[2px]" />
                                <span className="text-[10px] font-semibold text-muted-foreground">
                                    Coverage zone
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-foreground/60" />
                                <span className="text-[10px] font-semibold text-muted-foreground">
                                    Apiary and hive anchors
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    <WeatherTelemetryPanel
                        summary={resolvedWeatherSummary}
                        isLoading={isUsingPublicMap ? isPublicMapLoading : weatherLoading}
                        title="Flight map weather"
                        compact
                    />

                    {/* Flight readiness */}
                    <div className={cn(glass.section, "p-5")}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className={glass.microLabel}>Flight readiness</p>
                                <h3 className="mt-2 text-2xl font-bold text-foreground">{readiness.label}</h3>
                            </div>
                            <span className={cn("rounded-lg border px-2.5 py-1 text-[10px] font-bold", readiness.tone)}>
                                {isPotentialLoading ? 'Refreshing' : readiness.label}
                            </span>
                        </div>

                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{readiness.detail}</p>

                        {/* Potential score */}
                        <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
                            <div className="flex items-center justify-between">
                                <span className={glass.microLabel}>Potential score</span>
                                <span className="text-sm font-bold text-foreground">
                                    {isPotentialLoading ? '...' : `${Math.round(flightPotential?.score || 0)}%`}
                                </span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-muted/30 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(4, Math.min(100, Math.round(flightPotential?.score || 0)))}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-primary via-emerald-500 to-emerald-600"
                                />
                            </div>
                            <p className="mt-3 text-[11px] text-muted-foreground">
                                {flightPotential?.recommendation || 'Waiting for telemetry-backed routing guidance.'}
                            </p>
                        </div>

                        {/* Two sub-cards */}
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border border-border bg-muted/20 p-4">
                                <div className="flex items-center gap-2">
                                    <Navigation className="h-4 w-4 text-primary" />
                                    <span className={glass.microLabel}>Active forage sources</span>
                                </div>
                                <p className="mt-3 text-2xl font-bold text-foreground">
                                    {isPotentialLoading ? '...' : activeSources.length}
                                </p>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Top nectar zones contributing to this route window
                                </p>
                            </div>

                            <div className="rounded-xl border border-border bg-muted/20 p-4">
                                <div className="flex items-center gap-2">
                                    <RadioTower className="h-4 w-4 text-primary" />
                                    <span className={glass.microLabel}>Reporting devices</span>
                                </div>
                                <p className="mt-3 text-2xl font-bold text-foreground">{telemetryCount}</p>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    {isUsingPublicMap ? 'Public live weather feed powering this map' : 'Devices linked to the selected apiary telemetry stream'}
                                </p>
                            </div>
                        </div>

                        {/* Route notes */}
                        <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                <span className={glass.microLabel}>Route notes</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {activeSources.length > 0 ? (
                                    activeSources.slice(0, 4).map((source: any, index: number) => (
                                        <span
                                            key={`${source.name || 'source'}-${index}`}
                                            className={cn(glass.badge, "py-1")}
                                        >
                                            {source.name || 'Local forage'}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[11px] text-muted-foreground">
                                        No active forage sources were returned for this apiary yet.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading state */}
            {(apiariesLoading || isPublicMapLoading || (privateSelectedApiary && isPotentialLoading && !resolvedWeatherSummary)) && (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm font-medium text-muted-foreground relative z-10">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Syncing flight map telemetry and weather summary
                </div>
            )}

            {/* Empty state */}
            {!selectedApiary && !apiariesLoading && !isPublicMapLoading && (
                <div className={glass.emptyState}>
                    <MapPin className="h-8 w-8 text-primary/40" />
                    <h3 className="text-lg font-bold text-foreground">Add an apiary to unlock live flight mapping</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        This view now reads directly from your apiary coordinates, linked devices, and backend weather summary.
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default FlightMapping;
