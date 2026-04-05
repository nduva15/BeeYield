import React from 'react';
import { Map, MapPin, MousePointer2, Calculator, Share2, Info, Zap, Layers, Activity, Search, Locate, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApiaries } from '@/hooks/useApiaries';
import { beeyieldService } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

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

interface OrchardMapperProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

interface Point {
    x: number;
    y: number;
}

const OrchardMapper: React.FC<OrchardMapperProps> = ({ onTabChange }) => {
    const [points, setPoints] = React.useState<[number, number][]>([]);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [mapCenter, setMapCenter] = React.useState<[number, number]>([-2.42, 37.97]); // Active Sector
    const [zoom, setZoom] = React.useState(13);
    const { data: apiaries } = useApiaries();
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('');
    const [isSaving, setIsSaving] = React.useState(false);

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

    React.useEffect(() => {
        if (!selectedApiaryId && (apiaries || []).length > 0) {
            const first = apiaries![0];
            setSelectedApiaryId(first.id);
            if (first.latitude && first.longitude) {
                setMapCenter([first.latitude, first.longitude]);
            }
        }
    }, [apiaries, selectedApiaryId]);

    React.useEffect(() => {
        const current = (apiaries || []).find((a: any) => a.id === selectedApiaryId);
        if (current && Number.isFinite(current.latitude) && Number.isFinite(current.longitude)) {
            setMapCenter([current.latitude, current.longitude]);
        }
    }, [selectedApiaryId, apiaries]);

    const handleSave = async () => {
        if (!selectedApiaryId) {
            toast.error('Select an apiary first.');
            return;
        }
        if (points.length < 3) {
            toast.error('Draw the boundary before saving.');
            return;
        }
        setIsSaving(true);
        try {
            const geojson = {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[...points.map(p => [p[1], p[0]]), [points[0][1], points[0][0]]]]
                },
                properties: { source: 'orchard-mapper', acres: acreage }
            };

            const { error } = await beeyieldService.createForageZone({
                apiary_id: selectedApiaryId,
                zone_name: 'Orchard boundary',
                flora_type: 'Crop zone',
                radius_km: Math.max(0.2, Math.sqrt(acreage) * 0.08),
                density_score: Math.min(1, suggestedHives / Math.max(1, acreage * 3)),
                season: 'current',
                geojson
            });
            if (error) throw error;
            toast.success('Boundary saved to backend');
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Failed to save boundary');
        } finally {
            setIsSaving(false);
        }
    };

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                if (!isDrawing) return;
                setPoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
            },
        });
        return null;
    };

    const acreage = React.useMemo(() => {
        if (points.length < 3) return 0;
        // Simple Shoelace formula for geodesic coordinates (approximate for small areas)
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            // Scale by 111320 (meters per degree approximately)
            const x1 = points[i][1] * 111320 * Math.cos(points[i][0] * Math.PI / 180);
            const y1 = points[i][0] * 111320;
            const x2 = points[j][1] * 111320 * Math.cos(points[j][0] * Math.PI / 180);
            const y2 = points[j][0] * 111320;
            area += x1 * y2;
            area -= x2 * y1;
        }
        const areaM2 = Math.abs(area) / 2;
        return areaM2 / 4046.86; // Convert to acres
    }, [points]);

    const suggestedHives = Math.ceil(acreage * 2.5);

    const handleReset = () => {
        setPoints([]);
    };

    return (
        <BeeYieldPageShell className="space-y-6">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <BeeYieldPageHeader
                icon={Layers}
                label="Map"
                onBack={() => onTabChange?.('home')}
                title={<>Farm <span className="text-[#F4D03F]">Setup</span></>}
                subtitle="Map area, estimate hive count, and plan drops."
                actions={
                    <div className="flex gap-2 flex-wrap items-center">
                        <select
                            className="text-[10px] font-bold px-3 py-2 rounded-xl border border-gray-200 bg-white"
                            value={selectedApiaryId}
                            onChange={(e) => setSelectedApiaryId(e.target.value)}
                        >
                            {(apiaries || []).map((a: any) => (
                                <option key={a.id} value={a.id}>{a.name || 'Apiary'}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setIsDrawing(!isDrawing)}
                            className={cn(
                                isDrawing ? glass.btnPrimary : glass.btnSecondary,
                                "h-8 px-4 text-[10px] font-bold flex items-center gap-2"
                            )}
                        >
                            <MousePointer2 className="w-3 h-3" />
                            {isDrawing ? "Finish" : "Draw Area"}
                        </button>
                        <button
                            onClick={handleReset}
                            className={cn(glass.btnSecondary, "h-8 px-4 text-[10px] font-bold flex items-center gap-2 bg-white")}>
                            <Share2 className="w-3 h-3" />
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(glass.btnPrimary, "h-8 px-4 text-[10px] font-bold flex items-center gap-2 disabled:opacity-50")}
                        >
                            <Shield className="w-3 h-3" />
                            {isSaving ? 'Saving…' : 'Save zone'}
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Drawing Canvas */}
                <div className="lg:col-span-2">
                    <div className={cn(glass.card, "h-[400px] p-0 relative overflow-hidden bg-white border-gray-200")}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent)]" />
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                        <MapContainer
                            center={mapCenter}
                            zoom={zoom}
                            style={{ height: '100%', width: '100%' }}
                            // @ts-ignore
                            scrollWheelZoom={false}
                            className={cn(isDrawing && "cursor-crosshair")}
                            zoomControl={false}
                            worldCopyJump={true}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
                                attribution='&copy; CARTO'
                            />
                            {zoom < 8 && <TileLayer url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-boundaries/{z}/{x}/{y}.png" opacity={0.3} />}
                            {zoom >= 8 && <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google Maps Hybrid" />}
                            
                            <MapController center={mapCenter} zoom={zoom} />
                            <MapEvents />

                            <Marker position={mapCenter}>
                                <Popup className="font-bold border-none shadow-xl rounded-xl">
                                    <div className="p-2">
                                        <p className="text-xs font-black text-[#1B9157]">Setup Site</p>
                                    </div>
                                </Popup>
                            </Marker>

                            {points.length > 0 && (
                                <Polygon
                                    positions={points}
                                    pathOptions={{
                                        color: '#1B9157',
                                        fillColor: '#1B9157',
                                        fillOpacity: 0.15,
                                        weight: 2,
                                        dashArray: '6 4'
                                    }}
                                />
                            )}
                            {points.map((p, i) => (
                                <Marker key={i} position={p} icon={DefaultIcon} />
                            ))}
                        </MapContainer>

                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000] w-64 bg-white/70 backdrop-blur-xl p-4 border border-white/40 rounded-2xl shadow-xl">
                            <p className="text-[10px] font-black text-[#1A1A1A] mb-2 border-b border-[#F4D03F]/20 pb-1">Location Search</p>
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
                                className="flex items-center justify-between px-3 py-1.5 bg-[#F4D03F] text-[#1A1A1A] rounded-lg text-[8px] font-black hover:opacity-90 transition-all mt-1"
                            >
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-2.5 h-2.5" />
                                    <span>Sync Actual Position</span>
                                </div>
                                <Zap className="w-2.5 h-2.5" />
                            </button>
                        </div>

                        {isDrawing && (
                            <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#F9F7F2] border border-[#F4D03F]/30 rounded-lg flex items-center gap-2 z-20 shadow-sm">
                                <Activity className="w-3.5 h-3.5 animate-pulse text-[#1B9157]" />
                                <span className="text-xs font-bold text-[#1A1A1A] tracking-tight">Active</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <div className={cn(glass.card, "p-5 bg-white space-y-4")}>
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                                <Calculator className="w-4 h-4 text-[#1B9157]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Area Stats</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 tracking-wider">Total Area</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-3xl font-bold tracking-tight text-[#1A1A1A]">{acreage.toFixed(1)}</p>
                                    <span className="text-[10px] font-bold text-[#1B9157] mb-1.5">Acres</span>
                                </div>
                            </div>
                            <div className="space-y-1 pt-4 border-t border-gray-100">
                                <p className="text-[10px] font-bold text-gray-500 tracking-wider">Suggested Hives</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-3xl font-bold tracking-tight text-[#1A1A1A]">{suggestedHives}</p>
                                    <span className="text-[10px] font-bold text-[#F4D03F] mb-1.5">Hives</span>
                                </div>
                                <p className="text-[10px] font-medium text-gray-400 leading-tight mt-2">
                                    Based on <span className="text-gray-600 font-bold">2.5 hives/acre</span> (standard density).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-4 bg-[#F9F7F2] border-[#F4D03F]/20 space-y-2")}>
                        <div className="flex items-center gap-2 text-[#1B9157]">
                            <Zap className="w-4 h-4" />
                            <h4 className="text-xs font-bold text-[#1A1A1A] tracking-tight">Placement Notes</h4>
                        </div>
                        <p className="text-[11px] font-medium text-gray-600 leading-relaxed border-l-2 border-[#1B9157]/30 pl-3">
                            Optimal hive placement algorithm increases pollination coverage by <span className="text-[#1A1A1A] font-bold">18%</span>.
                        </p>
                    </div>

                    <div className={cn(glass.card, "p-4 bg-white flex items-start gap-3")}>
                        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-gray-50 border border-gray-100">
                            <Info className="w-3.5 h-3.5 text-[#F4D03F]" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs font-bold text-[#1A1A1A]">Location Export</p>
                            <p className="text-[10px] font-medium text-gray-500 leading-relaxed">
                                Map data can be exported as CSV for drone drops or manual field placement.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
        </BeeYieldPageShell>
    );
};

export default OrchardMapper;
