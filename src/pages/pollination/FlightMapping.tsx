import React from 'react';
import {
    Activity,
    ArrowLeft,
    Loader2,
    Map as MapIcon,
    MapPin,
    Navigation,
    RadioTower,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
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
    const mapModeDescription = isUsingPublicMap
        ? 'Public live map centered on Kibwezi, Kenya with backend weather enrichment'
        : 'Real apiary telemetry, forecast enrichment, and route visibility';

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
                tone: 'text-[#b91c1c] bg-[#fee2e2] border-[#fecaca]',
                detail: 'Temperature is below safe bee flight threshold.',
            };
        }

        if (typeof humidity === 'number' && humidity > 88) {
            return {
                label: 'Limited',
                tone: 'text-[#b45309] bg-[#fef3c7] border-[#fde68a]',
                detail: 'Humidity is high enough to reduce foraging confidence.',
            };
        }

        if (score >= 70) {
            return {
                label: 'Optimal',
                tone: 'text-[#047857] bg-[#d1fae5] border-[#a7f3d0]',
                detail: 'Conditions support active foraging and strong route confidence.',
            };
        }

        if (score >= 40) {
            return {
                label: 'Watch',
                tone: 'text-[#92400e] bg-[#fef3c7] border-[#fde68a]',
                detail: 'Conditions are usable, but routes should be checked before dispatch.',
            };
        }

        return {
            label: 'Pending',
            tone: 'text-[#475569] bg-[#e2e8f0] border-[#cbd5e1]',
            detail: 'Waiting for stronger telemetry and weather alignment.',
        };
    }, [flightPotential?.score, resolvedWeatherSummary]);


    const activeSources = flightPotential?.active_sources || [];
    const linkedDevices = resolvedWeatherSummary?.linked_device_meta || [];
    const telemetryCount = isUsingPublicMap ? 1 : linkedDevices.length;
    const telemetryReportingCount = isUsingPublicMap ? 1 : linkedDevices.filter((device) => !!device.last_observed_at).length;

    return (
        <div className="space-y-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col gap-5 border-b-4 border-[#064e3b] pb-8 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter leading-none md:text-6xl">
                            Flight <span className="text-[#10b981]">Mapping</span>
                        </h1>
                        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#064e3b]/45">
                            {mapModeDescription}
                        </p>
                    </div>

                    <div className="rounded-[28px] border-4 border-[#064e3b] bg-[#F7F1E4] p-4 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#064e3b]/55">
                            Selected location
                        </label>
                        <select
                            value={selectedApiary?.id || ''}
                            onChange={(event) => setSelectedApiaryId(event.target.value)}
                            disabled={!privateSelectedApiary}
                            className="mt-2 min-w-[280px] rounded-2xl border-2 border-[#064e3b]/20 bg-white px-4 py-3 text-sm font-bold text-[#064e3b] outline-none"
                        >
                            {locationOptions.map((apiary) => (
                                <option key={apiary.id} value={apiary.id}>
                                    {apiary.name}
                                    {apiary.location_name ? ` | ${apiary.location_name}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="border-4 border-[#064e3b] bg-[#FFF9F0] p-6 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#064e3b]/45">Active apiary</p>
                        <h4 className="mt-2 text-2xl font-black">{selectedApiary?.name || 'Loading'}</h4>
                        <p className="mt-2 text-sm font-semibold text-[#064e3b]/60">
                            {selectedApiary?.location_name || 'Location pending'}
                        </p>
                    </div>
                    <div className="border-4 border-[#064e3b] bg-[#FFF9F0] p-6 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#064e3b]/45">Tracked hives</p>
                        <h4 className="mt-2 text-2xl font-black">{hivesLoading && !isUsingPublicMap ? '...' : resolvedHives.length}</h4>
                        <p className="mt-2 text-sm font-semibold text-[#064e3b]/60">
                            {isUsingPublicMap ? `${positionedHives.length} live corridors mapped` : `${positionedHives.length} mapped with coordinates`}
                        </p>
                    </div>
                    <div className="border-4 border-[#064e3b] bg-[#FFF9F0] p-6 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#064e3b]/45">Linked telemetry</p>
                        <h4 className="mt-2 text-2xl font-black">{weatherLoading && !isUsingPublicMap ? '...' : telemetryCount}</h4>
                        <p className="mt-2 text-sm font-semibold text-[#064e3b]/60">
                            {isUsingPublicMap ? 'Provider weather feed active for Kibwezi' : `${telemetryReportingCount} reporting recently`}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
                    <div className="relative overflow-hidden border-4 border-[#064e3b] bg-[#FFF9F0] shadow-[12px_12px_0px_0px_rgba(6,78,59,1)]">
                        <div className="flex items-center justify-between border-b-4 border-[#064e3b] px-5 py-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#064e3b]/45">Live route canvas</p>
                                <h3 className="mt-1 text-2xl font-black">Apiary flight map</h3>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#064e3b]/15 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#064e3b]/55">
                                <MapIcon className="h-4 w-4" />
                                {apiariesLoading || isPublicMapLoading ? 'Syncing' : isUsingPublicMap ? 'Public live' : 'Live'}
                            </div>
                        </div>

                        <div className="relative h-[620px]">
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
                                            <p className="text-xs font-black text-[#064e3b]">{selectedApiary?.name || 'Apiary'}</p>
                                            <p className="text-[11px] font-semibold text-[#064e3b]/65">
                                                {selectedApiary?.location_name || 'Primary apiary anchor'}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>

                                {positionedHives.map((hive) => (
                                    <Marker key={hive.id} position={[hive.latitude as number, hive.longitude as number]}>
                                        <Popup>
                                            <div className="space-y-1 p-1">
                                                <p className="text-xs font-black text-[#064e3b]">{hive.hive_code || 'Hive'}</p>
                                                <p className="text-[11px] font-semibold text-[#064e3b]/65">
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
                                            color: '#facc15',
                                            fillColor: '#facc15',
                                            fillOpacity: 0.06,
                                            weight: 2,
                                            dashArray: '5 5',
                                        }}
                                    />
                                ) : null}
                            </MapContainer>

                            <div className="absolute bottom-6 right-6 z-[1000] space-y-3 rounded-[28px] border-4 border-[#064e3b] bg-[#FFF9F0] p-5 shadow-[6px_6px_0px_0px_#064e3b]">
                                <h5 className="border-b-2 border-[#064e3b] pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#064e3b]/65">
                                    Flight analysis
                                </h5>
                                <div className="flex items-center gap-3">
                                    <div className="h-1 w-6 border-b-2 border-dashed border-[#10b981]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#064e3b]/60">
                                        Suggested route
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rotate-45 border-2 border-[#064e3b] bg-[#facc15]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#064e3b]/60">
                                        Coverage zone
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-[#064e3b]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#064e3b]/60">
                                        Apiary and hive anchors
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <WeatherTelemetryPanel
                            summary={resolvedWeatherSummary}
                            isLoading={isUsingPublicMap ? isPublicMapLoading : weatherLoading}
                            title="Flight map weather"
                            compact
                        />

                        <div className="rounded-[32px] border-4 border-[#064e3b] bg-[#FFF9F0] p-6 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#064e3b]/45">
                                        Flight readiness
                                    </p>
                                    <h3 className="mt-2 text-3xl font-black text-[#064e3b]">{readiness.label}</h3>
                                </div>
                                <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${readiness.tone}`}>
                                    {isPotentialLoading ? 'Refreshing' : readiness.label}
                                </span>
                            </div>

                            <p className="mt-3 text-sm font-semibold leading-6 text-[#064e3b]/65">{readiness.detail}</p>

                            <div className="mt-6 rounded-[24px] border border-[#064e3b]/10 bg-[#F7F1E4] p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#064e3b]/45">
                                        Potential score
                                    </span>
                                    <span className="text-sm font-black text-[#064e3b]">
                                        {isPotentialLoading ? '...' : `${Math.round(flightPotential?.score || 0)}%`}
                                    </span>
                                </div>
                                <div className="mt-3 h-3 rounded-full bg-white/80">
                                    <div
                                        className="h-3 rounded-full bg-gradient-to-r from-[#facc15] via-[#10b981] to-[#064e3b] transition-all duration-500"
                                        style={{ width: `${Math.max(4, Math.min(100, Math.round(flightPotential?.score || 0)))}%` }}
                                    />
                                </div>
                                <p className="mt-3 text-sm font-semibold text-[#064e3b]/60">
                                    {flightPotential?.recommendation || 'Waiting for telemetry-backed routing guidance.'}
                                </p>
                            </div>

                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                                <div className="rounded-[24px] border border-[#064e3b]/10 bg-[#F7F1E4] p-4">
                                    <div className="flex items-center gap-2 text-[#064e3b]">
                                        <Navigation className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#064e3b]/45">
                                            Active forage sources
                                        </span>
                                    </div>
                                    <p className="mt-3 text-3xl font-black text-[#064e3b]">
                                        {isPotentialLoading ? '...' : activeSources.length}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-[#064e3b]/60">
                                        Top nectar zones contributing to this route window
                                    </p>
                                </div>

                                <div className="rounded-[24px] border border-[#064e3b]/10 bg-[#F7F1E4] p-4">
                                    <div className="flex items-center gap-2 text-[#064e3b]">
                                        <RadioTower className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#064e3b]/45">
                                            Reporting devices
                                        </span>
                                    </div>
                                    <p className="mt-3 text-3xl font-black text-[#064e3b]">{telemetryCount}</p>
                                    <p className="mt-1 text-sm font-semibold text-[#064e3b]/60">
                                        {isUsingPublicMap ? 'Public live weather feed powering this map' : 'Devices linked to the selected apiary telemetry stream'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 rounded-[24px] border border-[#064e3b]/10 bg-[#F7F1E4] p-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-[#064e3b]" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#064e3b]/45">
                                        Route notes
                                    </p>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {activeSources.length > 0 ? (
                                        activeSources.slice(0, 4).map((source: any, index: number) => (
                                            <span
                                                key={`${source.name || 'source'}-${index}`}
                                                className="inline-flex rounded-full border border-[#064e3b]/10 bg-white/75 px-3 py-1.5 text-xs font-bold text-[#064e3b]"
                                            >
                                                {source.name || 'Local forage'}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm font-semibold text-[#064e3b]/60">
                                            No active forage sources were returned for this apiary yet.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {(apiariesLoading || isPublicMapLoading || (privateSelectedApiary && isPotentialLoading && !resolvedWeatherSummary)) && (
                    <div className="flex items-center gap-3 rounded-[24px] border border-[#064e3b]/10 bg-[#F7F1E4] px-4 py-3 text-sm font-bold text-[#064e3b]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Syncing flight map telemetry and weather summary
                    </div>
                )}

                {!selectedApiary && !apiariesLoading && !isPublicMapLoading && (
                    <div className="rounded-[28px] border-4 border-dashed border-[#064e3b]/20 bg-[#F7F1E4] p-8 text-center">
                        <MapPin className="mx-auto h-8 w-8 text-[#064e3b]/45" />
                        <h3 className="mt-3 text-2xl font-black text-[#064e3b]">Add an apiary to unlock live flight mapping</h3>
                        <p className="mt-2 text-sm font-semibold text-[#064e3b]/60">
                            This view now reads directly from your apiary coordinates, linked devices, and backend weather summary.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlightMapping;
