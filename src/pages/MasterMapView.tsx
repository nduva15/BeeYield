import React from 'react';
import { Circle, MapContainer, Marker, Polygon, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Locate, Map as MapIcon, Save, Shield, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { glass, GlassConfirmModal } from '@/components/beeyield/GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { useApiaries } from '@/hooks/useApiaries';
import { useHivesWithTelemetry } from '@/hooks/useHives';
import { useCreateGeofence, useDeleteGeofence, useGeofences, useUpdateGeofence } from '@/hooks/useGeofences';
import { useCreateMapView, useDeleteMapView, useMapViews, useUpdateMapView } from '@/hooks/useMapViews';
import { Geofence, MapView } from '@/services/beeyieldService';

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
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type GeofenceFormState = {
    name: string;
    center_latitude: string;
    center_longitude: string;
    radius_meters: string;
    notes: string;
};

type MapViewFormState = {
    name: string;
    description: string;
    is_default: boolean;
};

const emptyGeofenceForm = (): GeofenceFormState => ({
    name: '',
    center_latitude: '',
    center_longitude: '',
    radius_meters: '1200',
    notes: '',
});

const emptyMapViewForm = (): MapViewFormState => ({
    name: '',
    description: '',
    is_default: false,
});

function parseNumber(value: string, fallback?: number) {
    if (!value.trim()) return fallback;
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
}

function extractBoundaryPoints(geojson: any): [number, number][] {
    const coordinates = geojson?.coordinates?.[0] || geojson?.geometry?.coordinates?.[0];
    if (!Array.isArray(coordinates)) return [];
    return coordinates
        .map((pair: any) => {
            if (!Array.isArray(pair) || pair.length < 2) return null;
            const lng = Number(pair[0]);
            const lat = Number(pair[1]);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            return [lat, lng] as [number, number];
        })
        .filter(Boolean) as [number, number][];
}

const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
    const map = useMap();
    React.useEffect(() => {
        map.flyTo(center, zoom, { duration: 0.9 });
    }, [center, zoom, map]);
    return null;
};

const ViewportTracker = ({
    onViewportChange,
}: {
    onViewportChange: (viewport: { center: [number, number]; zoom: number }) => void;
}) => {
    useMapEvents({
        moveend(event) {
            const map = event.target;
            const center = map.getCenter();
            onViewportChange({ center: [center.lat, center.lng], zoom: map.getZoom() });
        },
        zoomend(event) {
            const map = event.target;
            const center = map.getCenter();
            onViewportChange({ center: [center.lat, center.lng], zoom: map.getZoom() });
        },
    });
    return null;
};

const MasterMapView: React.FC = () => {
    const [selectedApiaryId, setSelectedApiaryId] = React.useState('');
    const [selectedGeofenceId, setSelectedGeofenceId] = React.useState('');
    const [selectedMapViewId, setSelectedMapViewId] = React.useState('');
    const [mapCenter, setMapCenter] = React.useState<[number, number]>([-2.42, 37.97]);
    const [zoom, setZoom] = React.useState(13);
    const [showApiaries, setShowApiaries] = React.useState(true);
    const [showHives, setShowHives] = React.useState(true);
    const [showGeofences, setShowGeofences] = React.useState(true);
    const [geofenceForm, setGeofenceForm] = React.useState<GeofenceFormState>(emptyGeofenceForm());
    const [mapViewForm, setMapViewForm] = React.useState<MapViewFormState>(emptyMapViewForm());
    const [geofenceToDelete, setGeofenceToDelete] = React.useState<Geofence | null>(null);
    const [mapViewToDelete, setMapViewToDelete] = React.useState<MapView | null>(null);

    const { data: apiaries = [] } = useApiaries();
    const { hives, isLoading: hivesLoading } = useHivesWithTelemetry(selectedApiaryId || undefined);
    const { data: geofences = [] } = useGeofences(selectedApiaryId || undefined);
    const { data: mapViews = [] } = useMapViews(selectedApiaryId || undefined, 'master');
    const createGeofence = useCreateGeofence(selectedApiaryId || undefined);
    const updateGeofence = useUpdateGeofence(selectedApiaryId || undefined);
    const deleteGeofence = useDeleteGeofence(selectedApiaryId || undefined);
    const createMapView = useCreateMapView(selectedApiaryId || undefined, 'master');
    const updateMapView = useUpdateMapView(selectedApiaryId || undefined, 'master');
    const deleteMapView = useDeleteMapView(selectedApiaryId || undefined, 'master');

    React.useEffect(() => {
        if (!selectedApiaryId && apiaries[0]?.id) {
            setSelectedApiaryId(apiaries[0].id);
        }
    }, [apiaries, selectedApiaryId]);

    React.useEffect(() => {
        const apiary = apiaries.find((entry) => entry.id === selectedApiaryId);
        if (apiary && Number.isFinite(apiary.latitude) && Number.isFinite(apiary.longitude)) {
            setMapCenter([Number(apiary.latitude), Number(apiary.longitude)]);
            setZoom(14);
        }
    }, [apiaries, selectedApiaryId]);

    const selectedGeofence = React.useMemo(
        () => geofences.find((geofence) => geofence.id === selectedGeofenceId) || null,
        [geofences, selectedGeofenceId],
    );
    const applyMapView = React.useCallback((mapView: MapView) => {
        setSelectedMapViewId(mapView.id);
        setMapViewForm({
            name: mapView.name || '',
            description: mapView.description || '',
            is_default: !!mapView.is_default,
        });
        setMapCenter([
            Number(mapView.center_latitude ?? mapCenter[0]),
            Number(mapView.center_longitude ?? mapCenter[1]),
        ]);
        setZoom(Number(mapView.zoom_level ?? zoom));
        const layers = mapView.active_layers || [];
        setShowApiaries(layers.length === 0 ? true : layers.includes('apiaries'));
        setShowHives(layers.length === 0 ? true : layers.includes('hives'));
        setShowGeofences(layers.length === 0 ? true : layers.includes('geofences'));
    }, [mapCenter, zoom]);

    const loadGeofence = React.useCallback((geofence: Geofence) => {
        setSelectedGeofenceId(geofence.id);
        setGeofenceForm({
            name: geofence.name || '',
            center_latitude: geofence.center_latitude?.toString() || '',
            center_longitude: geofence.center_longitude?.toString() || '',
            radius_meters: geofence.radius_meters?.toString() || '1200',
            notes: geofence.notes || '',
        });

        if (Number.isFinite(geofence.center_latitude) && Number.isFinite(geofence.center_longitude)) {
            setMapCenter([Number(geofence.center_latitude), Number(geofence.center_longitude)]);
            setZoom(15);
        }
    }, []);

    const resetGeofenceForm = React.useCallback(() => {
        setSelectedGeofenceId('');
        setGeofenceForm({
            ...emptyGeofenceForm(),
            center_latitude: mapCenter[0].toFixed(5),
            center_longitude: mapCenter[1].toFixed(5),
        });
    }, [mapCenter]);

    React.useEffect(() => {
        if (!selectedGeofenceId) {
            setGeofenceForm((current) => ({
                ...current,
                center_latitude: current.center_latitude || mapCenter[0].toFixed(5),
                center_longitude: current.center_longitude || mapCenter[1].toFixed(5),
            }));
        }
    }, [mapCenter, selectedGeofenceId]);

    const handleSaveGeofence = async () => {
        if (!selectedApiaryId) return;
        if (!geofenceForm.name.trim()) return;

        const payload = {
            apiary_id: selectedApiaryId,
            name: geofenceForm.name.trim(),
            center_latitude: parseNumber(geofenceForm.center_latitude, mapCenter[0]),
            center_longitude: parseNumber(geofenceForm.center_longitude, mapCenter[1]),
            radius_meters: parseNumber(geofenceForm.radius_meters, 1200),
            notes: geofenceForm.notes.trim() || undefined,
        };

        if (selectedGeofenceId) {
            const response = await updateGeofence.mutateAsync({ id: selectedGeofenceId, data: payload });
            if (response.error || !response.data) return;
            loadGeofence(response.data);
            return;
        }

        const response = await createGeofence.mutateAsync(payload);
        if (response.error || !response.data) return;
        loadGeofence(response.data);
    };

    const handleSaveMapView = async () => {
        if (!selectedApiaryId) return;
        if (!mapViewForm.name.trim()) return;

        const activeLayers = [
            showApiaries ? 'apiaries' : null,
            showHives ? 'hives' : null,
            showGeofences ? 'geofences' : null,
        ].filter(Boolean) as string[];

        const payload = {
            apiary_id: selectedApiaryId,
            name: mapViewForm.name.trim(),
            description: mapViewForm.description.trim() || undefined,
            view_type: 'master',
            center_latitude: mapCenter[0],
            center_longitude: mapCenter[1],
            zoom_level: zoom,
            active_layers: activeLayers,
            filters: {
                selected_geofence_id: selectedGeofenceId || null,
            },
            viewport_state: {
                center: { lat: mapCenter[0], lng: mapCenter[1] },
                zoom,
            },
            is_default: mapViewForm.is_default,
        };

        if (selectedMapViewId) {
            const response = await updateMapView.mutateAsync({ id: selectedMapViewId, data: payload });
            if (response.error || !response.data) return;
            applyMapView(response.data);
            return;
        }

        const response = await createMapView.mutateAsync(payload);
        if (response.error || !response.data) return;
        applyMapView(response.data);
    };

    const handleDeleteGeofence = async () => {
        if (!geofenceToDelete) return;
        await deleteGeofence.mutateAsync(geofenceToDelete.id);
        if (selectedGeofenceId === geofenceToDelete.id) {
            resetGeofenceForm();
        }
        setGeofenceToDelete(null);
    };

    const handleDeleteMapView = async () => {
        if (!mapViewToDelete) return;
        await deleteMapView.mutateAsync(mapViewToDelete.id);
        if (selectedMapViewId === mapViewToDelete.id) {
            setSelectedMapViewId('');
            setMapViewForm(emptyMapViewForm());
        }
        setMapViewToDelete(null);
    };

    const selectedApiary = apiaries.find((entry) => entry.id === selectedApiaryId);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-140px)]">
            <BeeYieldPageShell className="flex flex-col h-full relative overflow-hidden">
                <BeeYieldPageHeader
                    icon={MapIcon}
                    label="Maps"
                    title={<>Location <span className="text-[#F4D03F]">Overview</span></>}
                    subtitle="Persist saved map views and geofences for each apiary."
                    actions={
                        <div className="flex gap-3 items-center flex-wrap">
                            <select
                                className="text-[10px] font-bold px-3 py-2 rounded-xl border border-gray-200 bg-white"
                                value={selectedApiaryId}
                                onChange={(event) => {
                                    setSelectedApiaryId(event.target.value);
                                    setSelectedMapViewId('');
                                    setSelectedGeofenceId('');
                                }}
                            >
                                {apiaries.map((apiary) => (
                                    <option key={apiary.id} value={apiary.id}>
                                        {apiary.name || 'Apiary'}
                                    </option>
                                ))}
                            </select>
                            <Button className={glass.btnSecondary} onClick={() => setMapCenter([Number(selectedApiary?.latitude || -2.42), Number(selectedApiary?.longitude || 37.97)])}>
                                <Locate className="w-4 h-4" />
                                Recenter
                            </Button>
                            <Button className={glass.btnPrimary} onClick={() => void handleSaveMapView()}>
                                <Save className="w-4 h-4" />
                                {selectedMapViewId ? 'Update view' : 'Save view'}
                            </Button>
                        </div>
                    }
                />

                <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.45fr_0.95fr] gap-6 min-h-0">
                    <div className={cn(glass.card, 'p-0 rounded-3xl bg-neutral-900 border-gray-200 shadow-sm relative overflow-hidden')}>
                        <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} zoomControl={false}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
                                attribution="&copy; CARTO"
                            />
                            {zoom >= 8 && <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google Maps Hybrid" />}
                            <MapController center={mapCenter} zoom={zoom} />
                            <ViewportTracker
                                onViewportChange={(viewport) => {
                                    setMapCenter(viewport.center);
                                    setZoom(viewport.zoom);
                                }}
                            />

                            {showApiaries &&
                                apiaries.map((apiary) =>
                                    Number.isFinite(apiary.latitude) && Number.isFinite(apiary.longitude) ? (
                                        <Marker key={apiary.id} position={[Number(apiary.latitude), Number(apiary.longitude)]}>
                                            <Popup>{apiary.name || 'Apiary'}</Popup>
                                        </Marker>
                                    ) : null,
                                )}

                            {showHives &&
                                hives.map((hive: any) =>
                                    Number.isFinite(hive.latitude) && Number.isFinite(hive.longitude) ? (
                                        <React.Fragment key={hive.id}>
                                            <Marker position={[Number(hive.latitude), Number(hive.longitude)]}>
                                                <Popup>
                                                    <div className="text-xs font-bold">{hive.hive_code || 'Hive'}</div>
                                                    <div className="text-[10px] text-gray-500">{hive.status || 'Active'}</div>
                                                </Popup>
                                            </Marker>
                                            <Circle center={[Number(hive.latitude), Number(hive.longitude)]} radius={1200} pathOptions={{ color: '#10b981', weight: 1, fillOpacity: 0.08 }} />
                                        </React.Fragment>
                                    ) : null,
                                )}

                            {showGeofences &&
                                geofences.map((geofence) => {
                                    const points = extractBoundaryPoints(geofence.boundary_geojson);
                                    if (points.length >= 3) {
                                        return (
                                            <Polygon
                                                key={geofence.id}
                                                positions={points}
                                                pathOptions={{
                                                    color: geofence.id === selectedGeofenceId ? '#F4D03F' : '#ef4444',
                                                    fillOpacity: geofence.id === selectedGeofenceId ? 0.14 : 0.08,
                                                    weight: geofence.id === selectedGeofenceId ? 2 : 1,
                                                }}
                                            />
                                        );
                                    }

                                    if (Number.isFinite(geofence.center_latitude) && Number.isFinite(geofence.center_longitude)) {
                                        return (
                                            <Circle
                                                key={geofence.id}
                                                center={[Number(geofence.center_latitude), Number(geofence.center_longitude)]}
                                                radius={Number(geofence.radius_meters || 1200)}
                                                pathOptions={{
                                                    color: geofence.id === selectedGeofenceId ? '#F4D03F' : '#ef4444',
                                                    fillOpacity: geofence.id === selectedGeofenceId ? 0.14 : 0.08,
                                                    weight: geofence.id === selectedGeofenceId ? 2 : 1,
                                                }}
                                            />
                                        );
                                    }

                                    return null;
                                })}
                        </MapContainer>

                        <div className="absolute left-4 top-4 z-[1000] space-y-3">
                            <div className="rounded-2xl bg-white/90 border border-gray-100 shadow-sm p-4 min-w-[200px]">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.18em]">Viewport</div>
                                <div className="text-sm font-semibold text-[#1A1A1A]">{mapCenter[0].toFixed(5)}, {mapCenter[1].toFixed(5)}</div>
                                <div className="text-[11px] text-gray-500">Zoom {zoom}</div>
                                <div className="text-[11px] text-gray-500 mt-1">{hivesLoading ? 'Syncing hive telemetry...' : `${hives.length} hives loaded`}</div>
                            </div>
                            <div className="rounded-2xl bg-white/90 border border-gray-100 shadow-sm p-4 space-y-2">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.18em]">Layers</div>
                                <button className={cn('w-full text-left rounded-xl px-3 py-2 text-sm', showApiaries ? 'bg-[#fff4d7] text-[#8a5200]' : 'bg-gray-50 text-gray-500')} onClick={() => setShowApiaries((current) => !current)}>
                                    Apiaries
                                </button>
                                <button className={cn('w-full text-left rounded-xl px-3 py-2 text-sm', showHives ? 'bg-[#edf8ef] text-[#2f7a3d]' : 'bg-gray-50 text-gray-500')} onClick={() => setShowHives((current) => !current)}>
                                    Hives
                                </button>
                                <button className={cn('w-full text-left rounded-xl px-3 py-2 text-sm', showGeofences ? 'bg-[#fde7e4] text-[#c54e3d]' : 'bg-gray-50 text-gray-500')} onClick={() => setShowGeofences((current) => !current)}>
                                    Geofences
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 overflow-y-auto pr-1">
                        <div className={cn(glass.card, 'p-5 space-y-4')}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-[#1A1A1A]">Saved Map Views</h3>
                                    <p className="text-[10px] text-gray-500">Persist layer state, viewport, and apiary context.</p>
                                </div>
                                <span className="text-[10px] text-gray-400">{mapViews.length}</span>
                            </div>

                            <Input
                                value={mapViewForm.name}
                                onChange={(event) => setMapViewForm((current) => ({ ...current, name: event.target.value }))}
                                className={glass.input}
                                placeholder="View name"
                            />
                            <Textarea
                                value={mapViewForm.description}
                                onChange={(event) => setMapViewForm((current) => ({ ...current, description: event.target.value }))}
                                className="min-h-[90px] rounded-xl border border-[#F4D03F]/30 bg-[#FFF9F0] text-sm"
                                placeholder="What this saved map is for"
                            />
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={mapViewForm.is_default}
                                    onChange={(event) => setMapViewForm((current) => ({ ...current, is_default: event.target.checked }))}
                                />
                                Save as default view for this apiary
                            </label>

                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {mapViews.map((mapView) => (
                                    <div key={mapView.id} className={cn('rounded-xl border px-3 py-3 bg-white/70', mapView.id === selectedMapViewId ? 'border-[#F4D03F]/50' : 'border-[#F4D03F]/15')}>
                                        <button type="button" onClick={() => applyMapView(mapView)} className="w-full text-left">
                                            <div className="text-sm font-bold text-[#1A1A1A]">{mapView.name}</div>
                                            <div className="text-[11px] text-gray-500">{mapView.description || mapView.view_type}</div>
                                        </button>
                                        <div className="flex gap-2 mt-3">
                                            <Button className={glass.btnSecondary} onClick={() => applyMapView(mapView)}>
                                                Load
                                            </Button>
                                            <Button className={glass.btnSecondary} onClick={() => setMapViewToDelete(mapView)}>
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {mapViews.length === 0 && <div className="text-sm text-gray-500">No saved map views yet.</div>}
                            </div>
                        </div>

                        <div className={cn(glass.card, 'p-5 space-y-4')}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-[#1A1A1A]">Geofences</h3>
                                    <p className="text-[10px] text-gray-500">Create backend-managed security or service boundaries.</p>
                                </div>
                                <Button className={glass.btnSecondary} onClick={resetGeofenceForm}>
                                    New
                                </Button>
                            </div>

                            <Input
                                value={geofenceForm.name}
                                onChange={(event) => setGeofenceForm((current) => ({ ...current, name: event.target.value }))}
                                className={glass.input}
                                placeholder="Geofence name"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    value={geofenceForm.center_latitude}
                                    onChange={(event) => setGeofenceForm((current) => ({ ...current, center_latitude: event.target.value }))}
                                    className={glass.input}
                                    placeholder="Latitude"
                                />
                                <Input
                                    value={geofenceForm.center_longitude}
                                    onChange={(event) => setGeofenceForm((current) => ({ ...current, center_longitude: event.target.value }))}
                                    className={glass.input}
                                    placeholder="Longitude"
                                />
                            </div>
                            <Input
                                value={geofenceForm.radius_meters}
                                onChange={(event) => setGeofenceForm((current) => ({ ...current, radius_meters: event.target.value }))}
                                className={glass.input}
                                placeholder="Radius in meters"
                            />
                            <Textarea
                                value={geofenceForm.notes}
                                onChange={(event) => setGeofenceForm((current) => ({ ...current, notes: event.target.value }))}
                                className="min-h-[90px] rounded-xl border border-[#F4D03F]/30 bg-[#FFF9F0] text-sm"
                                placeholder="Notes for field teams or alerts"
                            />

                            <div className="flex gap-2">
                                <Button className={glass.btnPrimary} onClick={() => void handleSaveGeofence()}>
                                    <Shield className="w-4 h-4" />
                                    {selectedGeofenceId ? 'Update geofence' : 'Save geofence'}
                                </Button>
                                {selectedGeofence ? (
                                    <Button className={glass.btnSecondary} onClick={() => setGeofenceToDelete(selectedGeofence)}>
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </Button>
                                ) : null}
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {geofences.map((geofence) => (
                                    <button
                                        key={geofence.id}
                                        type="button"
                                        onClick={() => loadGeofence(geofence)}
                                        className={cn('w-full rounded-xl border px-3 py-3 text-left bg-white/70', geofence.id === selectedGeofenceId ? 'border-[#F4D03F]/50' : 'border-[#F4D03F]/15')}
                                    >
                                        <div className="text-sm font-bold text-[#1A1A1A]">{geofence.name}</div>
                                        <div className="text-[11px] text-gray-500">
                                            {(geofence.radius_meters || 0).toLocaleString()} m radius
                                        </div>
                                    </button>
                                ))}
                                {geofences.length === 0 && <div className="text-sm text-gray-500">No geofences saved for this apiary.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </BeeYieldPageShell>

            <GlassConfirmModal
                isOpen={!!geofenceToDelete}
                onClose={() => setGeofenceToDelete(null)}
                onConfirm={() => {
                    void handleDeleteGeofence();
                }}
                title="Delete geofence"
                message="This removes the selected geofence from the backend and map."
                confirmLabel="Delete"
                isLoading={deleteGeofence.isPending}
            />

            <GlassConfirmModal
                isOpen={!!mapViewToDelete}
                onClose={() => setMapViewToDelete(null)}
                onConfirm={() => {
                    void handleDeleteMapView();
                }}
                title="Delete map view"
                message="This removes the saved map view from the backend."
                confirmLabel="Delete"
                isLoading={deleteMapView.isPending}
            />
        </motion.div>
    );
};

export default MasterMapView;
