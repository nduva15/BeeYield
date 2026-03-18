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
    const [mapCenter, setMapCenter] = React.useState<[number, number]>([-2.42, 37.97]); // Default to Kibwezi Hub
    const [zoom, setZoom] = React.useState(13);

    const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
        const map = useMap();
        React.useEffect(() => {
            map.flyTo(center, zoom, { duration: 1.5 });
        }, [center, zoom, map]);
        return null;
    };

    const regions = [
        { name: 'Kibwezi Sanctuary (Active)', coords: [-2.42, 37.97] as [number, number], zoom: 14 },
        { name: 'Makueni Sector', coords: [-2.3, 37.8] as [number, number], zoom: 9 },
        { name: 'Lamu Hub (Client Area)', coords: [-2.27, 40.90] as [number, number], zoom: 12 },
        { name: 'Beijing Hub (Client Area)', coords: [39.9, 116.4] as [number, number], zoom: 11 },
        { name: 'Global Situation', coords: [20, 0] as [number, number], zoom: 2 },
        { name: 'Africa Overview', coords: [0, 20] as [number, number], zoom: 3 },
        { name: 'Asia Overview', coords: [30, 100] as [number, number], zoom: 3 },
    ];

    const handleJump = (coords: [number, number], z: number) => {
        setMapCenter(coords);
        setZoom(z);
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
                title={<>Master <span className="text-[#F4D03F]">GIS Map</span></>}
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
                                url="https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=ebbb30c6c06a4b16a445cb48dfc47683"
                                attribution='&copy; Thunderforest &copy; OpenStreetMap'
                            />
                            {/* Overlay boundaries when zoomed out for better "World Map" look */}
                            {zoom < 8 && (
                                <TileLayer
                                    url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-boundaries/{z}/{x}/{y}.png"
                                    opacity={0.3}
                                />
                            )}
                            {/* Satellite Layer for closer zoom levels */}
                            {zoom >= 8 && (
                                <TileLayer
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    attribution='&copy; ESRI Satellite'
                                />
                            )}
                            <MapController center={mapCenter} zoom={zoom} />
                            
                            {/* Major Global Hubs */}
                            {zoom > 2 && zoom < 8 && regions.slice(1, 5).map((r, i) => (
                                <Marker key={i} position={r.coords} />
                            ))}

                            {/* Representative Markers for tactical hubs in Kenya if zoomed in */}
                            {zoom >= 8 && regions.slice(5).map((r, i) => (
                                <Marker key={i} position={r.coords} />
                            ))}
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
                                <Input value="Honey Block Alpha" className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-xs" readOnly />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 ml-1">Acreage</label>
                                    <Input value="14.2 AC" className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-[10px]" readOnly />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-gray-400 ml-1">Crop</label>
                                    <Input value="Macadamia" className="h-9 rounded-xl border-gray-100 bg-gray-50 font-bold text-[10px]" readOnly />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.card, "flex-1 p-6 space-y-6 bg-[#1A1A1A] text-white rounded-3xl border-white/5 relative overflow-hidden group")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <Compass className="w-4 h-4 text-[#F4D03F]" />
                            <h3 className="text-sm font-bold uppercase tracking-tight">Regional Drill-down</h3>
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto thin-scrollbar pr-2">
                            {regions.map((r, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleJump(r.coords, r.zoom)}
                                    className="w-full flex items-center justify-between p-3 border border-white/5 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="text-[10px] font-black text-white/80 group-hover:text-white transition-colors">{r.name}</span>
                                        <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">{r.coords.join(', ')}</span>
                                    </div>
                                    <Navigation className="w-3 h-3 text-[#F4D03F] opacity-40 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </BeeYieldPageShell>
        </motion.div>
    );
};

export default MasterMapView;
