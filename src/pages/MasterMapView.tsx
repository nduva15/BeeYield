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
import { glass, PageHeader } from '@/components/beeyield/GlassTheme';
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(glass.page, "flex flex-col h-[calc(100vh-140px)]")}>
            <PageHeader
                icon={MapIcon}
                label="Maps"
                title={<>Location <span className="text-primary">Overview</span></>}
                subtitle="View your locations, boundaries, and site placements."
                actions={
                    <div className="flex gap-3 items-center">
                        <select
                            className={cn(glass.input, "h-9 w-40")}
                            value={selectedApiaryId}
                            onChange={(e) => setSelectedApiaryId(e.target.value)}
                        >
                            {apiaries.map((a: any) => (
                                <option key={a.id} value={a.id}>{a.name || 'Apiary'}</option>
                            ))}
                        </select>
                        <Button variant="outline" className={cn(glass.btnSecondary, "h-9 px-4")}>
                            <Layers className="w-3.5 h-3.5 mr-2" />
                            Terrain view
                        </Button>
                        <Button className={cn(glass.btnPrimary, "h-9 px-4")}>
                            <Save className="w-3.5 h-3.5 mr-2" />
                            Update map
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 flex gap-6 min-h-0 relative z-10 pb-10">
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
                                "w-full aspect-square flex flex-col items-center justify-center rounded-xl border transition-all",
                                activeTool === tool.id
                                    ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20"
                                    : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            )}
                        >
                            <tool.icon className="w-4 h-4" />
                            <span className="text-[6px] font-bold mt-1 uppercase tracking-widest">{tool.label}</span>
                        </button>
                    ))}
                    <div className="mt-auto">
                        <button
                            className="w-full aspect-square bg-honey rounded-xl flex items-center justify-center text-honey-foreground hover:opacity-90 transition-opacity"
                            aria-label="Add new map asset"
                            title="Add new map asset"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className={cn(glass.section, "flex-1 relative overflow-hidden group shadow-lg")}>
                    <div className="absolute inset-0 z-0">
                        <MapContainer
                            center={mapCenter}
                            zoom={zoom}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                            zoomControl={false}
                            className="z-0 h-full w-full"
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
                                        <p className="text-xs font-black text-primary">Center point</p>
                                        <p className="text-[9px] text-muted-foreground">Drag to adjust</p>
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>

                    <div className="absolute top-6 left-6 space-y-4 pointer-events-none z-[1000]">
                        <div className="p-4 bg-background/90 backdrop-blur-md rounded-2xl border border-border shadow-md pointer-events-auto">
                            <div className="flex items-center gap-3 mb-3">
                                <Compass className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Coordinates</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-mono text-muted-foreground">Lat: {mapCenter[0].toFixed(5)}</p>
                                <p className="text-[9px] font-mono text-muted-foreground">Lon: {mapCenter[1].toFixed(5)}</p>
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", hivesLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]")} />
                                    <p className="text-[9px] font-bold text-foreground">
                                        {hivesLoading ? 'Syncing telemetry...' : `${hives.length} hives visible`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-background/90 backdrop-blur-md rounded-2xl border border-border shadow-md pointer-events-auto">
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-3">Coverage Legend</p>
                            <div className="flex items-center gap-3">
                                <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                                    <span className="absolute inset-0 rounded-full border border-emerald-500/30" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-foreground">Hive + coverage circle</p>
                                    <p className="text-[8px] font-medium text-muted-foreground">Target {(hiveCoverageRadiusMeters / 1000).toFixed(1)} km radius</p>
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
                                className="absolute top-6 right-6 w-64 p-5 bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-xl z-[1000]"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5 text-honey" />
                                        <span className="text-[10px] font-bold text-honey uppercase tracking-widest">Boundary active</span>
                                    </div>
                                    <button
                                        onClick={() => setShowGeofences(false)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label="Hide geofences"
                                        title="Hide"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-muted/50 p-2.5 rounded-xl border border-border/50">
                                        <span className="text-[10px] font-bold text-foreground">Main orchard</span>
                                        <span className={cn(glass.badge, "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px]")}>Secure</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Alerts will trigger if the sensor moves outside the defined boundary.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="absolute bottom-6 right-6 flex gap-3 z-[1000]">
                        <Button className="w-10 h-10 rounded-xl bg-background border border-border p-0 hover:bg-muted transition-colors shadow-md">
                            <Locate className="w-4 h-4 text-foreground" />
                        </Button>
                        <Button className="w-10 h-10 rounded-xl bg-background border border-border p-0 hover:bg-muted transition-colors shadow-md">
                            <Maximize2 className="w-4 h-4 text-foreground" />
                        </Button>
                    </div>
                </div>

                <div className="w-80 flex flex-col gap-6">
                    <div className={cn(glass.card, "p-5")}>
                        <div className="border-b border-border pb-3 mb-4">
                            <h3 className="text-sm font-bold text-foreground tracking-tight">Site details</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className={glass.microLabel}>Selection name</label>
                                <Input value={selectedApiary?.name || '--'} className={glass.input} readOnly />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className={glass.microLabel}>Size</label>
                                    <Input value={selectedApiary ? `${selectedApiary.size_acres} ac` : '--'} className={glass.input} readOnly />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={glass.microLabel}>Crop</label>
                                    <Input value={String(selectedApiary?.forage_type ?? '--')} className={glass.input} readOnly />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.card, "flex-1 p-5 relative overflow-hidden group")}>
                        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-bold tracking-tight text-foreground">Find location</h3>
                            </div>
                            <span className={cn(glass.badge, "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")}>
                                <Shield className="w-2.5 h-2.5 mr-1 inline-block" />
                                Secure
                            </span>
                        </div>
                        <div className="space-y-5">
                            <form onSubmit={handleSearch} className="relative">
                                <Input
                                    placeholder="Search global map..."
                                    className={cn(glass.input, "pr-8")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary transition-colors">
                                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                            </form>

                            <Button
                                onClick={handleLocate}
                                variant="outline"
                                className={cn(glass.btnSecondary, "w-full justify-center")}
                            >
                                <Locate className="w-3.5 h-3.5 mr-2" />
                                Use current location
                            </Button>

                            <div className="pt-4 border-t border-border space-y-3">
                                <p className={glass.microLabel}>Map layer</p>
                                {[
                                    { label: 'Satellite Hybrid', active: zoom >= 8 },
                                    { label: 'Standard Terrain', active: zoom < 8 },
                                ].map((row, idx) => (
                                    <div key={idx} className="flex items-center justify-between hover:bg-muted/10 p-2 rounded-lg cursor-pointer transition-colors" onClick={() => setZoom(row.active ? zoom : (idx === 0 ? 10 : 6))}>
                                        <span className={cn("text-xs font-semibold transition-colors", row.active ? "text-primary" : "text-muted-foreground")}>{row.label}</span>
                                        {row.active && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(var(--primary),0.6)]" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MasterMapView;
