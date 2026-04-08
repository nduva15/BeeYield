import React from 'react';
import { Activity, Calculator, Info, Layers, Locate, MapPin, MousePointer2, Search, Shield, Trash2 } from 'lucide-react';
import { MapContainer, Marker, Polygon, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { useApiaries } from '@/hooks/useApiaries';
import { useCreateOrchard, useDeleteOrchard, useOrchards, useUpdateOrchard } from '@/hooks/useOrchards';
import { Orchard } from '@/services/beeyieldService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GlassConfirmModal, glass, PageHeader } from './GlassTheme';

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

interface OrchardMapperProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

type OrchardFormState = {
    name: string;
    crop_type: string;
    location_name: string;
    notes: string;
};

const emptyForm = (): OrchardFormState => ({
    name: '',
    crop_type: '',
    location_name: '',
    notes: '',
});

function extractPolygonPoints(geojson: any): [number, number][] {
    const coordinates = geojson?.geometry?.coordinates?.[0];
    if (!Array.isArray(coordinates)) return [];

    const points = coordinates
        .map((pair: any) => {
            if (!Array.isArray(pair) || pair.length < 2) return null;
            const lng = Number(pair[0]);
            const lat = Number(pair[1]);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            return [lat, lng] as [number, number];
        })
        .filter(Boolean) as [number, number][];

    if (points.length > 1) {
        const first = points[0];
        const last = points[points.length - 1];
        if (first[0] === last[0] && first[1] === last[1]) {
            points.pop();
        }
    }

    return points;
}

function buildBoundaryGeojson(points: [number, number][], acreage: number) {
    return {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [[...points.map((point) => [point[1], point[0]]), [points[0][1], points[0][0]]]],
        },
        properties: {
            source: 'orchard-mapper',
            acreage: Number(acreage.toFixed(2)),
        },
    };
}

const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
    const map = useMap();

    React.useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.2 });
    }, [center, zoom, map]);

    return null;
};

const OrchardMapper: React.FC<OrchardMapperProps> = () => {
    const [points, setPoints] = React.useState<[number, number][]>([]);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [mapCenter, setMapCenter] = React.useState<[number, number]>([-2.42, 37.97]);
    const [zoom, setZoom] = React.useState(13);
    const [selectedApiaryId, setSelectedApiaryId] = React.useState('');
    const [selectedOrchardId, setSelectedOrchardId] = React.useState('');
    const [orchardToDelete, setOrchardToDelete] = React.useState<Orchard | null>(null);
    const [form, setForm] = React.useState<OrchardFormState>(emptyForm());

    const { data: apiaries = [] } = useApiaries();
    const { data: orchards = [], isLoading: orchardsLoading } = useOrchards(selectedApiaryId || undefined);
    const createOrchard = useCreateOrchard(selectedApiaryId || undefined);
    const updateOrchard = useUpdateOrchard(selectedApiaryId || undefined);
    const deleteOrchard = useDeleteOrchard(selectedApiaryId || undefined);

    React.useEffect(() => {
        if (!selectedApiaryId && apiaries[0]?.id) {
            setSelectedApiaryId(apiaries[0].id);
        }
    }, [apiaries, selectedApiaryId]);

    React.useEffect(() => {
        const currentApiary = apiaries.find((apiary) => apiary.id === selectedApiaryId);
        if (currentApiary && Number.isFinite(currentApiary.latitude) && Number.isFinite(currentApiary.longitude)) {
            setMapCenter([Number(currentApiary.latitude), Number(currentApiary.longitude)]);
            setZoom(14);
        }
    }, [apiaries, selectedApiaryId]);

    const selectedOrchard = React.useMemo(
        () => orchards.find((orchard) => orchard.id === selectedOrchardId) || null,
        [orchards, selectedOrchardId],
    );

    const acreage = React.useMemo(() => {
        if (points.length < 3) return 0;

        let area = 0;
        for (let i = 0; i < points.length; i += 1) {
            const j = (i + 1) % points.length;
            const x1 = points[i][1] * 111320 * Math.cos((points[i][0] * Math.PI) / 180);
            const y1 = points[i][0] * 111320;
            const x2 = points[j][1] * 111320 * Math.cos((points[j][0] * Math.PI) / 180);
            const y2 = points[j][0] * 111320;
            area += x1 * y2;
            area -= x2 * y1;
        }

        return Math.abs(area / 2) / 4046.86;
    }, [points]);

    const suggestedHives = Math.max(1, Math.ceil(acreage * 2.5));

    const handleSearch = async (query: string) => {
        if (!query.trim()) return;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (Array.isArray(data) && data[0]) {
                setMapCenter([Number(data[0].lat), Number(data[0].lon)]);
                setZoom(14);
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Location search failed');
        }
    };

    const handleLocate = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((position) => {
            setMapCenter([position.coords.latitude, position.coords.longitude]);
            setZoom(15);
        });
    };

    const resetEditor = React.useCallback(() => {
        setSelectedOrchardId('');
        setPoints([]);
        setForm(emptyForm());
        setIsDrawing(false);
    }, []);

    const loadOrchard = React.useCallback((orchard: Orchard) => {
        setSelectedOrchardId(orchard.id);
        setForm({
            name: orchard.name || '',
            crop_type: orchard.crop_type || '',
            location_name: orchard.location_name || '',
            notes: orchard.notes || '',
        });

        const orchardPoints = extractPolygonPoints(orchard.boundary_geojson);
        setPoints(orchardPoints);
        if (orchardPoints[0]) {
            setMapCenter(orchardPoints[0]);
            setZoom(15);
        }
    }, []);

    const handleSave = async () => {
        if (!selectedApiaryId) {
            toast.error('Select an apiary first.');
            return;
        }
        if (!form.name.trim()) {
            toast.error('Name is required.');
            return;
        }
        if (points.length < 3) {
            toast.error('Draw the boundary before saving.');
            return;
        }

        const payload = {
            name: form.name.trim(),
            apiary_id: selectedApiaryId,
            location_name: form.location_name.trim() || undefined,
            crop_type: form.crop_type.trim() || undefined,
            notes: form.notes.trim() || undefined,
            acreage: Number(acreage.toFixed(2)),
            boundary_geojson: buildBoundaryGeojson(points, acreage),
        };

        if (selectedOrchardId) {
            const response = await updateOrchard.mutateAsync({ id: selectedOrchardId, data: payload });
            if (response.error) return;
            if (response.data) loadOrchard(response.data);
            return;
        }

        const response = await createOrchard.mutateAsync(payload);
        if (response.error || !response.data) return;
        loadOrchard(response.data);
    };

    const handleDelete = async () => {
        if (!orchardToDelete) return;
        await deleteOrchard.mutateAsync(orchardToDelete.id);
        if (selectedOrchardId === orchardToDelete.id) {
            resetEditor();
        }
        setOrchardToDelete(null);
    };

    const MapEvents = () => {
        useMapEvents({
            click(event) {
                if (!isDrawing) return;
                setPoints((current) => [...current, [event.latlng.lat, event.latlng.lng]]);
            },
        });
        return null;
    };

    const currentApiary = apiaries.find((apiary) => apiary.id === selectedApiaryId);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(glass.page, 'p-4 lg:p-6 space-y-6 pb-20')}>
            <PageHeader
                icon={Layers}
                label="Map"
                title={<>Farm <span className="text-[#F4D03F]">Setup</span></>}
                subtitle="Create and maintain orchard boundary records backed by the forage API."
                actions={
                    <div className="flex gap-2 flex-wrap items-center">
                        <select
                            className="text-[10px] font-bold px-3 py-2 rounded-xl border border-gray-200 bg-white"
                            value={selectedApiaryId}
                            onChange={(event) => {
                                setSelectedApiaryId(event.target.value);
                                resetEditor();
                            }}
                        >
                            {apiaries.map((apiary) => (
                                <option key={apiary.id} value={apiary.id}>
                                    {apiary.name || 'Apiary'}
                                </option>
                            ))}
                        </select>
                        <Button
                            onClick={() => setIsDrawing((current) => !current)}
                            className={cn(isDrawing ? glass.btnPrimary : glass.btnSecondary, 'h-8 px-4 text-[10px] font-bold')}
                        >
                            <MousePointer2 className="w-3 h-3" />
                            {isDrawing ? 'Pause drawing' : 'Draw boundary'}
                        </Button>
                        <Button className={glass.btnSecondary} onClick={resetEditor}>
                            Reset
                        </Button>
                        <Button
                            onClick={() => {
                                void handleSave();
                            }}
                            disabled={createOrchard.isPending || updateOrchard.isPending}
                            className={glass.btnPrimary}
                        >
                            <Shield className="w-3 h-3" />
                            {selectedOrchardId ? 'Update orchard' : 'Save orchard'}
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <div className={cn(glass.card, 'h-[460px] p-0 relative overflow-hidden bg-white border-gray-200')}>
                        <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} zoomControl={false}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
                                attribution="&copy; CARTO"
                            />
                            {zoom >= 8 && <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google Maps Hybrid" />}
                            <MapController center={mapCenter} zoom={zoom} />
                            <MapEvents />

                            {currentApiary && Number.isFinite(currentApiary.latitude) && Number.isFinite(currentApiary.longitude) ? (
                                <Marker position={[Number(currentApiary.latitude), Number(currentApiary.longitude)]}>
                                    <Popup>{currentApiary.name}</Popup>
                                </Marker>
                            ) : null}

                            {orchards
                                .filter((orchard) => orchard.id !== selectedOrchardId)
                                .map((orchard) => {
                                    const orchardPoints = extractPolygonPoints(orchard.boundary_geojson);
                                    if (orchardPoints.length < 3) return null;
                                    return (
                                        <Polygon
                                            key={orchard.id}
                                            positions={orchardPoints}
                                            pathOptions={{ color: '#d8aa3a', fillColor: '#f4d03f', fillOpacity: 0.08, weight: 1 }}
                                        />
                                    );
                                })}

                            {points.length > 0 && (
                                <Polygon positions={points} pathOptions={{ color: '#1B9157', fillColor: '#1B9157', fillOpacity: 0.18, weight: 2, dashArray: '6 4' }} />
                            )}

                            {points.map((point, index) => (
                                <Marker key={`${point[0]}-${point[1]}-${index}`} position={point} />
                            ))}
                        </MapContainer>

                        <div className="absolute top-4 right-4 z-[1000] w-64 bg-white/80 backdrop-blur-xl p-4 border border-white/40 rounded-2xl shadow-xl space-y-3">
                            <p className="text-[10px] font-black text-[#1A1A1A] border-b border-[#F4D03F]/20 pb-1">Location Search</p>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                <input
                                    className="w-full bg-white/50 border border-gray-100 rounded-lg py-1.5 pl-8 pr-3 text-[9px] font-bold focus:outline-none focus:ring-1 focus:ring-[#1B9157]"
                                    placeholder="Search a place"
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') handleSearch(event.currentTarget.value);
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleLocate}
                                className="flex items-center justify-between px-3 py-1.5 bg-[#F4D03F] text-[#1A1A1A] rounded-lg text-[8px] font-black hover:opacity-90 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-2.5 h-2.5" />
                                    <span>Use my position</span>
                                </div>
                                <Locate className="w-2.5 h-2.5" />
                            </button>
                            <div className="text-[10px] text-gray-500">
                                {points.length} boundary points captured.
                            </div>
                        </div>

                        {isDrawing && (
                            <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#F9F7F2] border border-[#F4D03F]/30 rounded-lg flex items-center gap-2 z-[1000] shadow-sm">
                                <Activity className="w-3.5 h-3.5 animate-pulse text-[#1B9157]" />
                                <span className="text-xs font-bold text-[#1A1A1A]">Drawing enabled</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className={cn(glass.card, 'p-5 bg-white space-y-4')}>
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <Calculator className="w-4 h-4 text-[#1B9157]" />
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Boundary Stats</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-[#F4D03F]/10 bg-white/70 p-3">
                                <div className="text-[10px] font-bold text-gray-400">Area</div>
                                <div className="text-lg font-semibold text-[#1A1A1A]">{acreage.toFixed(1)} acres</div>
                            </div>
                            <div className="rounded-xl border border-[#F4D03F]/10 bg-white/70 p-3">
                                <div className="text-[10px] font-bold text-gray-400">Suggested hives</div>
                                <div className="text-lg font-semibold text-[#1A1A1A]">{suggestedHives}</div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-[#F4D03F]/10 bg-[#F9F7F2] p-4 text-[11px] text-gray-600">
                            Orchard records are now stored as first-class backend entities rather than ad hoc map notes.
                        </div>
                    </div>

                    <div className={cn(glass.card, 'p-5 bg-white space-y-3')}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Saved Orchards</h3>
                            <span className="text-[10px] text-gray-400">{orchards.length}</span>
                        </div>
                        {orchardsLoading ? (
                            <div className="text-sm text-gray-500">Loading orchards...</div>
                        ) : orchards.length === 0 ? (
                            <div className="text-sm text-gray-500">No orchard boundaries saved for this apiary.</div>
                        ) : (
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {orchards.map((orchard) => (
                                    <button
                                        key={orchard.id}
                                        type="button"
                                        onClick={() => loadOrchard(orchard)}
                                        className={cn(
                                            'w-full rounded-xl border px-3 py-3 text-left transition-all bg-white/70',
                                            orchard.id === selectedOrchardId ? 'border-[#F4D03F]/50 shadow-sm' : 'border-[#F4D03F]/15',
                                        )}
                                    >
                                        <div className="text-sm font-bold text-[#1A1A1A]">{orchard.name}</div>
                                        <div className="text-[11px] text-gray-500">
                                            {orchard.crop_type || 'Crop type not set'}{orchard.acreage ? ` / ${orchard.acreage} acres` : ''}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={cn(glass.card, 'p-5 bg-white space-y-4')}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-[#1A1A1A]">{selectedOrchardId ? 'Update Orchard' : 'Create Orchard'}</h3>
                                <p className="text-[10px] text-gray-500">Persist map geometry and field metadata together.</p>
                            </div>
                            {selectedOrchard ? (
                                <Button className={glass.btnSecondary} onClick={() => setOrchardToDelete(selectedOrchard)}>
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </Button>
                            ) : null}
                        </div>

                        <div className="space-y-3">
                            <Input
                                value={form.name}
                                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                className={glass.input}
                                placeholder="Orchard name"
                            />
                            <Input
                                value={form.crop_type}
                                onChange={(event) => setForm((current) => ({ ...current, crop_type: event.target.value }))}
                                className={glass.input}
                                placeholder="Crop type"
                            />
                            <Input
                                value={form.location_name}
                                onChange={(event) => setForm((current) => ({ ...current, location_name: event.target.value }))}
                                className={glass.input}
                                placeholder="Location label"
                            />
                            <Textarea
                                value={form.notes}
                                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                                className="min-h-[110px] rounded-xl border border-[#F4D03F]/30 bg-[#FFF9F0] text-sm"
                                placeholder="Notes about bloom timing, access, or spray windows"
                            />
                        </div>

                        <div className="rounded-xl border border-[#F4D03F]/10 bg-white/70 p-4 space-y-1">
                            <div className="text-[10px] font-bold text-gray-400">Current center</div>
                            <div className="text-sm text-gray-700">
                                {mapCenter[0].toFixed(5)}, {mapCenter[1].toFixed(5)}
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#F4D03F]/10 bg-[#F9F7F2] p-4 flex gap-3">
                            <Info className="w-4 h-4 text-[#F4D03F] mt-0.5" />
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                                Draw at least three points, then save. Re-open any orchard from the list to edit or replace its boundary.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <GlassConfirmModal
                isOpen={!!orchardToDelete}
                onClose={() => setOrchardToDelete(null)}
                onConfirm={() => {
                    void handleDelete();
                }}
                title="Delete orchard"
                message="This removes the orchard record and its saved boundary from the backend."
                confirmLabel="Delete"
                isLoading={deleteOrchard.isPending}
            />
        </motion.div>
    );
};

export default OrchardMapper;
