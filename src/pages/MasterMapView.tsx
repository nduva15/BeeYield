import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Map as MapIcon,
    Layers,
    Navigation,
    Locate,
    MousePointer2,
    Hexagon,
    Shield,
    Trash2,
    Save,
    Maximize2,
    Plus,
    Search,
    Compass,
    Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glass } from '@/components/beeyield/GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { fadeInUp } from '@/lib/motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MasterMapView: React.FC = () => {
    const [activeTool, setActiveTool] = React.useState<'select' | 'draw' | 'pallet'>('select');
    const [showGeofences, setShowGeofences] = React.useState(true);
    const [mapCenter, setMapCenter] = React.useState<[number, number]>([-2.42, 37.97]); // Default Start
    const [zoom, setZoom] = React.useState(13);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isSearching, setIsSearching] = React.useState(false);

    const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
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

    return (
        <motion.div
            {...fadeInUp}
            className="h-[calc(100vh-140px)]"
        >
            <BeeYieldPageShell className={cn("flex flex-col h-full relative overflow-hidden")}>
            {/* Background Accents */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#F4D03F]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -left-20 top-1/2 w-64 h-64 bg-[#1B9157]/5 blur-[100px] rounded-full pointer-events-none" />

            <BeeYieldPageHeader
                icon={MapIcon}
                label="Map"
                title={<>Master <span className="text-[#F4D03F]">Map</span></>}
                subtitle="View locations, boundaries, and placements."
                actions={
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-xl border border-gray-100 bg-white/50 text-gray-600 font-bold text-[10px] h-9 px-4 hover:bg-gray-50">
                            <Layers className="w-3.5 h-3.5 mr-2" />
                            Terrain Overlay
                        </Button>
                        <Button className={cn(glass.btnPrimary, "h-9 px-4 text-[10px] font-bold shadow-lg shadow-[#1B9157]/10")}>
                            <Save className="w-3.5 h-3.5 mr-2" />
                            Sync Changes
                        </Button>
                    </div>
                }
            />

            {/* Main GIS Container */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* Left Toolbar */}
                <div className="w-14 flex flex-col gap-3">
                    {[
                        { id: 'select', icon: MousePointer2, label: 'Select' },
                        { id: 'draw', icon: Hexagon, label: 'Bound' },
                        { id: 'pallet', icon: MapIcon, label: 'Pallet' },
                    ].map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as any)}
                            className={cn(
                                "w-full aspect-square flex flex-col items-center justify-center rounded-xl border transition-all group",
                                activeTool === tool.id
                                    ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-md shadow-gray-200"
                                    : "bg-white border-gray-100 text-gray-400 hover:border-[#F4D03F]/40 hover:text-gray-600"
                            )}
                        >
                            <tool.icon className="w-4 h-4" />
                            <span className="text-[6px] font-bold mt-1">{tool.label}</span>
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

                {/* Map Interface */}
                <div className={cn(glass.card, "flex-1 rounded-3xl bg-neutral-900 border-gray-200 shadow-sm relative overflow-hidden group")}>
                    <div className="absolute inset-0 z-0">
                        <MapContainer
                            center={mapCenter}
                            zoom={zoom}
                            style={{ height: '100%', width: '100%' }}
                            // @ts-ignore
                            scrollWheelZoom={false}
                            zoomControl={false}
                            className="z-0"
                            worldCopyJump={true}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
                                attribution='&copy; CARTO'
                            />
                            {/* Hybrid Road/Satellite Layer (Google Style) for tactical visibility */}
                            {zoom >= 8 && (
                                <TileLayer
                                    url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                                    attribution="&copy; Google Maps Hybrid"
                                />
                            )}
                            <MapController center={mapCenter} zoom={zoom} />
                            
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
                                        <p className="text-xs font-black text-[#1B9157]">Editable Site Pivot</p>
                                        <p className="text-[9px] text-gray-400">Drag to Adjust</p>
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>

                    {/* Digital Hud */}
                    <div className="absolute top-6 left-6 space-y-4 pointer-events-none">
                        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm pointer-events-auto">
                            <div className="flex items-center gap-3 mb-3">
                                <Compass className="w-4 h-4 text-gray-500" />
                                <span className="text-[10px] font-bold text-gray-700">Feed</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-mono text-gray-400">LAT: —</p>
                                <p className="text-[9px] font-mono text-gray-400">LON: —</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                    <p className="text-[8px] font-bold text-gray-400">No fix</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Geofence Status */}
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
                                        <span className="text-[10px] font-bold text-[#F4D03F]">Fence Active</span>
                                    </div>
                                    <button
                                        onClick={() => setShowGeofences(false)}
                                        className="text-white/40 hover:text-white"
                                        aria-label="Hide geofences"
                                        title="Hide geofences"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10">
                                        <span className="text-[9px] font-bold tracking-wider">Main Orchard</span>
                                        <Badge className="bg-[#1B9157] text-[8px] font-bold rounded-md h-5">Secure</Badge>
                                    </div>
                                    <p className="text-[8px] font-bold text-white/50 leading-snug tracking-wider">
                                        Tamper alert will trigger if pallet GPS drifts more than 5m outside polygon.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Map Controls */}
                    <div className="absolute bottom-6 right-6 flex gap-3">
                        <Button className="w-10 h-10 rounded-xl bg-white border border-gray-100 p-0 hover:bg-gray-50 transition-colors shadow-sm">
                            <Locate className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button className="w-10 h-10 rounded-xl bg-white border border-gray-100 p-0 hover:bg-gray-50 transition-colors shadow-sm">
                            <Maximize2 className="w-4 h-4 text-gray-600" />
                        </Button>
                    </div>
                </div>

                {/* Properties Panel */}
                <div className="w-80 flex flex-col gap-6">
                    <div className={cn(glass.card, "p-6 space-y-6 bg-white/80 backdrop-blur-md rounded-3xl border-gray-100 shadow-sm")}>
                        <div className="border-b border-gray-100 pb-4">
                            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-tight">Active Selection</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-gray-400 ml-1">Block Name</label>
                                <Input value="—" className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-xs" readOnly />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 ml-1">Acreage</label>
                                    <Input value="—" className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-[10px]" readOnly />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 ml-1">Crop</label>
                                    <Input value="—" className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-[10px]" readOnly />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.card, "flex-1 p-6 space-y-6 bg-[#1A1A1A] text-white rounded-3xl border-white/5 relative overflow-hidden group")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <Search className="w-4 h-4 text-[#F4D03F]" />
                                <h3 className="text-sm font-bold uppercase tracking-tight">Location Search</h3>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#1B9157]/20 border border-[#1B9157]/30 rounded-lg">
                                <Shield className="w-3 h-3 text-[#1B9157]" />
                                <span className="text-[7px] font-black text-[#1B9157] tracking-widest uppercase">Client Secure View</span>
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
                                Use Actual Location
                            </Button>

                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Active Layers</p>
                                {[
                                    { label: 'Satellite View', active: zoom >= 8 },
                                    { label: 'Global Map', active: zoom < 8 },
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
