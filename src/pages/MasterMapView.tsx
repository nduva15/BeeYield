import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Map as MapIcon,
    Layers,
    MousePointer2,
    Hexagon,
    Shield,
    Trash2,
    Save,
    Maximize2,
    Plus,
    Search,
    Compass,
    Locate
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass } from '@/components/beeyield/GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { fadeInUp } from '@/lib/motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApiaries } from '@/hooks/useApiaries';
import { useHivesWithTelemetry } from '@/hooks/useHives';

const EMPTY_APIARIES: any[] = [];

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
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MasterMapView: React.FC = () => {
    const [activeTool, setActiveTool] = React.useState<'select' | 'draw' | 'pallet'>('select');
    const [showGeofences, setShowGeofences] = React.useState(true);
    const [mapCenter, setMapCenter] = React.useState<[number, number]>([-2.42, 37.97]);
    const [zoom, setZoom] = React.useState(13);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isSearching, setIsSearching] = React.useState(false);

    const { data: apiariesData } = useApiaries();
    const apiaries = apiariesData ?? EMPTY_APIARIES;
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('');
    const { hives, isLoading: hivesLoading } = useHivesWithTelemetry(selectedApiaryId || undefined);
    const hiveCoverageRadiusMeters = 1200;

    const selectedApiary = React.useMemo(
        () => apiaries.find((a) => a.id === selectedApiaryId),
        [apiaries, selectedApiaryId]
    );

    const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
        const map = useMap();
        React.useEffect(() => {
            map.flyTo(center, zoom, { duration: 1.5 });
        }, [center, zoom, map]);
        return null;
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setMapCenter([parseFloat(lat), parseFloat(lon)]);
                setZoom(14);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLocate = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            setMapCenter([pos.coords.latitude, pos.coords.longitude]);
            setZoom(15);
        });
    };

    React.useEffect(() => {
        if (!selectedApiaryId && apiaries.length > 0) {
            setSelectedApiaryId(apiaries[0].id);
        }
    }, [apiaries, selectedApiaryId]);

    React.useEffect(() => {
        if (selectedApiary && Number.isFinite(selectedApiary.latitude) && Number.isFinite(selectedApiary.longitude)) {
            setMapCenter([Number(selectedApiary.latitude), Number(selectedApiary.longitude)]);
            setZoom(14);
        }
    }, [selectedApiary]);

    return (
        <motion.div {...fadeInUp} className="h-[calc(100vh-140px)]">
            <BeeYieldPageShell className={cn("flex flex-col h-full relative overflow-hidden")}>
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#F4D03F]/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute -left-20 top-1/2 w-64 h-64 bg-[#1B9157]/5 blur-[100px] rounded-full pointer-events-none" />

                <BeeYieldPageHeader
                    icon={MapIcon}
                    label="Maps"
                    title={<>Location <span className="text-[#F4D03F]">Overview</span></>}
                    subtitle="View your locations, boundaries, and site placements."
                    actions={
                        <div className="flex gap-3 items-center">
                            <select
                                className="text-[10px] font-bold px-3 py-2 rounded-xl border border-gray-200 bg-white"
                                value={selectedApiaryId}
                                onChange={(e) => setSelectedApiaryId(e.target.value)}
                            >
                                {apiaries.map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.name || 'Apiary'}</option>
                                ))}
                            </select>
                            <Button variant="outline" className="rounded-xl border border-gray-100 bg-white/50 text-gray-600 font-bold text-[10px] h-9 px-4 hover:bg-gray-50">
                                <Layers className="w-3.5 h-3.5 mr-2" />
                                Terrain view
                            </Button>
                            <Button className={cn(glass.btnPrimary, "h-9 px-4 text-[10px] font-bold shadow-lg shadow-[#1B9157]/10")}>
                                <Save className="w-3.5 h-3.5 mr-2" />
                                Update map
                            </Button>
                        </div>
                    }
                />

                <div className="flex-1 flex gap-6 min-h-0">
                    <div className="w-14 flex flex-col gap-3">
                        {[
                            { id: 'select', icon: MousePointer2, label: 'Select' },
                            { id: 'draw', icon: Hexagon, label: 'Range' },
                            { id: 'pallet', icon: MapIcon, label: 'Sensors' },
                        ].map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id as 'select' | 'draw' | 'pallet')}
                                className={cn(
                                    "w-full aspect-square flex flex-col items-center justify-center rounded-xl border transition-all group",
                                    activeTool === tool.id
                                        ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-md shadow-gray-200"
                                        : "bg-white border-gray-100 text-gray-400 hover:border-[#F4D03F]/40 hover:text-gray-600"
                                )}
                            >
                                <tool.icon className="w-4 h-4" />
                                <span className="text-[6px] font-bold mt-1 uppercase tracking-tighter">{tool.label}</span>
                            </button>
                        ))}
                        <div className="mt-auto space-y-3">
                            <button
                                className="w-full aspect-square bg-[#F4D03F] rounded-xl border border-[#F4D03F]/20 flex items-center justify-center text-[#1A1A1A] hover:opacity-90 transition-opacity"
                                aria-label="Add new map asset"
                                title="Add new map asset"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className={cn(glass.card, "flex-1 rounded-3xl bg-neutral-900 border-gray-200 shadow-sm relative overflow-hidden group")}>
                        <div className="absolute inset-0 z-0">
                            <MapContainer
                                center={mapCenter}
                                zoom={zoom}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={false}
                                zoomControl={false}
                                className="z-0"
                                worldCopyJump={true}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
                                    attribution="&copy; CARTO"
                                />
                                {zoom >= 8 && (
                                    <TileLayer
                                        url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                                        attribution="&copy; Google Maps Hybrid"
                                    />
                                )}
                                <MapController center={mapCenter} zoom={zoom} />

                                {apiaries.map((a: any) => (
                                    Number.isFinite(a.latitude) && Number.isFinite(a.longitude) ? (
                                        <Marker key={a.id} position={[a.latitude, a.longitude] as any}>
                                            <Popup className="custom-popup">
                                                <div className="text-xs font-bold">{a.name || 'Apiary'}</div>
                                                <p className="text-[10px] text-gray-500">Size: {a.size_acres ?? '--'} ac</p>
                                            </Popup>
                                        </Marker>
                                    ) : null
                                ))}

                                {hives.map((h: any) => (
                                    Number.isFinite(h.latitude) && Number.isFinite(h.longitude) ? (
                                        <React.Fragment key={h.id}>
                                            <Marker position={[h.latitude, h.longitude] as any}>
                                                <Popup className="custom-popup">
                                                    <div className="text-xs font-bold">{h.hive_code || 'Hive'}</div>
                                                    <p className="text-[10px] text-gray-500">Status: {h.status || 'Active'}</p>
                                                </Popup>
                                            </Marker>
                                            <Circle center={[h.latitude, h.longitude] as any} radius={hiveCoverageRadiusMeters} pathOptions={{ color: '#10b981', weight: 1, fillOpacity: 0.08 }} />
                                        </React.Fragment>
                                    ) : null
                                ))}

                                <Marker
                                    position={mapCenter}
                                    draggable={true}
                                    eventHandlers={{
                                        dragend: (e) => {
                                            const marker = e.target;
                                            const position = marker.getLatLng();
                                            setMapCenter([position.lat, position.lng]);
                                        }
                                    }}
                                >
                                    <Popup className="font-bold border-none shadow-xl rounded-xl">
                                        <div className="p-2 text-center">
                                            <p className="text-xs font-black text-[#1B9157]">Center point</p>
                                            <p className="text-[9px] text-gray-400">Drag to adjust</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>

                        <div className="absolute top-6 left-6 space-y-4 pointer-events-none">
                            <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm pointer-events-auto">
                                <div className="flex items-center gap-3 mb-3">
                                    <Compass className="w-4 h-4 text-gray-500" />
                                    <span className="text-[10px] font-bold text-gray-700">Coordinates</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-mono text-gray-600">Lat: {mapCenter[0].toFixed(5)}</p>
                                    <p className="text-[9px] font-mono text-gray-600">Lon: {mapCenter[1].toFixed(5)}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                                        <p className="text-[8px] font-bold text-gray-500">
                                            {hivesLoading ? 'Syncing hive telemetry...' : `${hives.length} hives visible`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm pointer-events-auto max-w-[220px]">
                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-2">Coverage Legend</p>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-7 h-7 flex items-center justify-center">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-white shadow-sm" />
                                        <span className="absolute inset-0 rounded-full border border-[#10b981]/70" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-[#1A1A1A]">Hive + coverage circle</p>
                                        <p className="text-[8px] font-bold text-gray-400">Approx. {(hiveCoverageRadiusMeters / 1000).toFixed(1)} km forage radius</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showGeofences && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="absolute top-6 right-6 w-60 p-5 bg-[#1A1A1A] text-white rounded-2xl shadow-xl border border-white/10"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-3.5 h-3.5 text-[#F4D03F]" />
                                            <span className="text-[10px] font-bold text-[#F4D03F]">Boundary active</span>
                                        </div>
                                        <button
                                            onClick={() => setShowGeofences(false)}
                                            className="text-white/40 hover:text-white"
                                            aria-label="Hide geofences"
                                            title="Hide"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10">
                                            <span className="text-[9px] font-semibold tracking-wider">Main orchard</span>
                                            <Badge className="bg-[#1B9157] text-[8px] font-bold rounded-md h-5">Secure</Badge>
                                        </div>
                                        <p className="text-[8px] font-semibold text-white/50 leading-snug tracking-wider">
                                            Alerts will trigger if the sensor moves outside the defined boundary.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="absolute bottom-6 right-6 flex gap-3">
                            <Button className="w-10 h-10 rounded-xl bg-white border border-gray-100 p-0 hover:bg-gray-50 transition-colors shadow-sm">
                                <Locate className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button className="w-10 h-10 rounded-xl bg-white border border-gray-100 p-0 hover:bg-gray-50 transition-colors shadow-sm">
                                <Maximize2 className="w-4 h-4 text-gray-600" />
                            </Button>
                        </div>
                    </div>

                    <div className="w-80 flex flex-col gap-6">
                        <div className={cn(glass.card, "p-6 space-y-6 bg-white/80 backdrop-blur-md rounded-3xl border-gray-100 shadow-sm")}>
                            <div className="border-b border-gray-100 pb-4">
                                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Site details</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 ml-1">Selection name</label>
                                    <Input value={selectedApiary?.name || '--'} className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-xs" readOnly />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-gray-400 ml-1">Size</label>
                                        <Input value={String(selectedApiary?.size_acres ?? '--')} className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-[10px]" readOnly />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-gray-400 ml-1">Crop</label>
                                        <Input value={String(selectedApiary?.forage_type ?? '--')} className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-[10px]" readOnly />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cn(glass.card, "flex-1 p-6 space-y-6 bg-[#1A1A1A] text-white rounded-3xl border-white/5 relative overflow-hidden group")}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <Search className="w-4 h-4 text-[#F4D03F]" />
                                    <h3 className="text-sm font-bold tracking-tight">Find location</h3>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-[#1B9157]/20 border border-[#1B9157]/30 rounded-lg">
                                    <Shield className="w-3 h-3 text-[#1B9157]" />
                                    <span className="text-[7px] font-bold text-[#1B9157] tracking-widest uppercase">Secure view</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <form onSubmit={handleSearch} className="relative">
                                    <Input
                                        placeholder="Search location..."
                                        className="bg-white/5 border-white/10 text-[10px] h-9 pr-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-[#F4D03F] transition-colors">
                                        <Search className="w-3 h-3 text-gray-400" />
                                    </button>
                                </form>

                                <Button
                                    onClick={handleLocate}
                                    variant="outline"
                                    className="w-full bg-white/5 border-white/10 text-white/70 hover:bg-[#1B9157] hover:text-white text-[9px] font-black h-9 rounded-xl transition-all"
                                >
                                    <Locate className="w-3 h-3 mr-2" />
                                    Use current location
                                </Button>

                                <div className="pt-4 border-t border-white/5 space-y-3">
                                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Map view</p>
                                    {[
                                        { label: 'Satellite view', active: zoom >= 8 },
                                        { label: 'Standard map', active: zoom < 8 },
                                        { label: 'Search running', active: isSearching },
                                    ].map((row, idx) => (
                                        <div key={idx} className="flex items-center justify-between group">
                                            <span className={cn("text-[9px] font-bold transition-colors", row.active ? "text-[#1B9157]" : "text-gray-500")}>{row.label}</span>
                                            {row.active && <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </BeeYieldPageShell>
        </motion.div>
    );
};

export default MasterMapView;
