import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Shield, Crosshair, Hexagon, AlertCircle, Plus, Info, Zap, Trash2, ShieldAlert, Search, Locate, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
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

interface HiveLogisticsSecurityProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

interface Pallet {
    id: string;
    x: number;
    y: number;
    hives: number;
    isSecure: boolean;
}

const HiveLogisticsSecurity: React.FC<HiveLogisticsSecurityProps> = ({ onTabChange }) => {
    const [pallets, setPallets] = React.useState<Pallet[]>([
        { id: 'PAL-001', x: -2.4200, y: 37.9700, hives: 4, isSecure: true },
        { id: 'PAL-002', x: -2.4230, y: 37.9750, hives: 4, isSecure: true },
    ]);
    const [mapCenter, setMapCenter] = React.useState<[number, number]>([-2.42, 37.97]); // Active Hub (Kibwezi)
    const [zoom, setZoom] = React.useState(13);
    const [addingHive, setAddingHive] = React.useState(false);
    const svgRef = React.useRef<SVGSVGElement>(null);

    const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
        const map = useMap();
        React.useEffect(() => {
            map.flyTo(center, zoom, { duration: 1.5 });
        }, [center, zoom, map]);
        return null;
    };

    const handleSearch = async (query: string) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setMapCenter([parseFloat(lat), parseFloat(lon)]);
                setZoom(14);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleLocate = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            setMapCenter([pos.coords.latitude, pos.coords.longitude]);
            setZoom(15);
        });
    };

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                if (!addingHive) return;
                const newPallet: Pallet = {
                    id: `PAL-${Date.now()}`,
                    x: e.latlng.lat,
                    y: e.latlng.lng,
                    hives: 4,
                    isSecure: true
                };
                setPallets(prev => [...prev, newPallet]);
                setAddingHive(false);
            },
        });
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* Header */}
            <PageHeader
                icon={Shield}
                label="Bee_Map_Virtual_Fence_Live_Log"
                title={<>Hive <span className="text-[#F4D03F]">Tracking</span></>}
                subtitle="Live geofenced hive placements and security monitoring."
                actions={
                    <button
                        onClick={() => setAddingHive(true)}
                        className={cn(
                            glass.btnPrimary,
                            addingHive ? "animate-pulse ring-2 ring-[#F4D03F]" : ""
                        )}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {addingHive ? 'Click Map' : 'Track New Hives'}
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 3D Map Interface */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className={cn(glass.card, "bg-white/40 border-white/20 h-[500px] relative overflow-hidden shadow-xl p-0")}>
                        <MapContainer
                            center={mapCenter}
                            zoom={zoom}
                            style={{ height: '100%', width: '100%' }}
                            // @ts-ignore
                            scrollWheelZoom={false}
                            className={cn(addingHive && "cursor-crosshair")}
                            zoomControl={false}
                            worldCopyJump={true}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
                                attribution='&copy; CARTO'
                            />
                            {zoom < 8 && (
                                <TileLayer
                                    url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-boundaries/{z}/{x}/{y}.png"
                                    opacity={0.3}
                                />
                            )}
                            {zoom >= 8 && (
                                <TileLayer
                                    url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                                    attribution="&copy; Google Maps Hybrid"
                                />
                            )}

                            <MapController center={mapCenter} zoom={zoom} />
                            <MapEvents />

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
                                    <div className="p-2">
                                        <p className="text-xs font-black text-[#1B9157]">Editable Pivot</p>
                                    </div>
                                </Popup>
                            </Marker>

                            {pallets.map(p => (
                                <React.Fragment key={p.id}>
                                    <Circle
                                        center={[p.x, p.y]}
                                        radius={200}
                                        pathOptions={{
                                            color: '#10b981',
                                            fillColor: '#10b981',
                                            fillOpacity: 0.1,
                                            weight: 1,
                                            dashArray: '4 4'
                                        }}
                                    />
                                    <Marker position={[p.x, p.y]}>
                                        <Popup className="font-bold border-none shadow-2xl rounded-xl">
                                            <div className="p-3 text-center">
                                                <p className="text-xs font-black text-[#1A1A1A]">{p.id}</p>
                                                <p className="text-[10px] font-bold text-[#10b981]">{p.hives} Hives Installed</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </React.Fragment>
                            ))}
                        </MapContainer>

                        <div className="absolute top-6 left-6 flex flex-col gap-3 p-4 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl z-[1000] w-64">
                            <h4 className="text-[9px] font-black text-[#1A1A1A] border-b border-[#F4D03F]/10 pb-2 uppercase tracking-widest">Location Manager</h4>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                <input 
                                    className="w-full bg-white/50 border border-gray-100 rounded-lg py-1.5 pl-8 pr-3 text-[9px] font-bold focus:outline-none focus:ring-1 focus:ring-[#1B9157]"
                                    placeholder="Search lamu, beijing..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearch(e.currentTarget.value);
                                    }}
                                />
                            </div>
                            <button 
                                onClick={handleLocate}
                                className="flex items-center justify-between px-3 py-1.5 bg-[#F4D03F] text-[#1A1A1A] rounded-lg text-[8px] font-black hover:opacity-90 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-2.5 h-2.5" />
                                    <span>Sync Actual Location</span>
                                </div>
                                <Zap className="w-2.5 h-2.5" />
                            </button>
                        </div>

                        <div className="absolute bottom-6 left-6 p-4 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl">
                            <h4 className="text-[9px] font-black text-[#1A1A1A] mb-3 border-b border-[#F4D03F]/10 pb-2">Hive Stats</h4>
                            <div className="flex gap-8">
                                <div className="space-y-0.5">
                                    <p className="text-[7px] font-black text-gray-400">Active</p>
                                    <p className="text-lg font-black text-[#1A1A1A]">{pallets.length}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[7px] font-black text-gray-400">Coverage</p>
                                    <p className="text-lg font-black text-[#10b981]">84%</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[7px] font-black text-gray-400">Status</p>
                                    <p className="text-lg font-black text-[#1A1A1A]">Normal</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Audit & Exceptions Sidebar */}
                <div className="lg:col-span-4 space-y-5">
                    <div className={cn(glass.card, "p-5 space-y-5 bg-white/40 border-white/20 shadow-xl relative overflow-hidden group")}>
                        <div className="flex items-center justify-between mb-5 border-b border-[#F4D03F]/10 pb-4">
                            <h3 className="text-[10px] font-black text-[#1A1A1A] leading-none">Live History</h3>
                            <ShieldAlert className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {[
                                { status: 'OK', msg: 'Hives placed correctly on map.', time: '14:22' },
                                { status: 'OK', msg: 'All sensors are working normally.', time: '14:15' },
                                { status: 'Wait', msg: 'Signal check in North area.', time: '13:58' },
                                { status: 'OK', msg: 'GPS tracking updated.', time: '12:40' },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-3 items-start border-b border-white/20 pb-3 last:border-0">
                                    <span className={cn(
                                        "text-[8px] font-black px-2 py-0.5 rounded-full",
                                        log.status === 'OK' ? "bg-[#10b981] text-white" : "bg-[#F4D03F] text-white"
                                    )}>{log.status}</span>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black text-[#1A1A1A]/60 tracking-tight">{log.msg}</p>
                                        <p className="text-[7px] font-black text-gray-400">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-5 bg-[#064e3b] text-white group transition-all relative overflow-hidden shadow-xl")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <Crosshair className="w-5 h-5 text-[#F4D03F]" />
                            <h3 className="text-[10px] font-black leading-none">Status Summary</h3>
                        </div>
                        <p className="text-[9px] font-black opacity-60 leading-relaxed tracking-tight relative z-10 pl-3 border-l-4 border-[#F4D03F]/40">
                            Adding hives will set up an **Automatic Alarm**. Any unexpected movement will send an alert.
                        </p>
                    </div>

                    <div className={cn(glass.card, "p-5 space-y-4 border-red-500/10 bg-red-50/30 shadow-xl")}>
                        <h4 className="text-[9px] text-red-500 font-black mb-2">Health_Alerts</h4>
                        <div className="flex items-center gap-4 bg-white/40 p-4 rounded-2xl border border-red-500/10">
                            <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 shrink-0">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-red-500 tracking-tight">Movement_Detected</p>
                                <p className="text-[8px] font-black text-gray-400">High Winds Or Movement</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HiveLogisticsSecurity;

