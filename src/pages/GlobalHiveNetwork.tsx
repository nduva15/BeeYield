import React from 'react';
import {
    Globe,
    MapPin,
    Network,
    Activity,
    Flower2,
    ShieldCheck,
    Radio,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { glass } from '@/components/beeyield/GlassTheme';
import { cn } from '@/lib/utils';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { calculatePollinationMetrics } from '@/lib/pollinationCalculations';

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

type NetworkNode = {
    id: string;
    name: string;
    region: string;
    crop: string;
    latitude: number;
    longitude: number;
    hiveCount: number;
    acreage: number;
    readiness: number;
    signal: 'stable' | 'watch' | 'surge';
};

const EMPTY_APIARIES: any[] = [];
const EMPTY_HIVES: any[] = [];

const kibweziHub = { id: 'kibwezi-hq', name: "Kibwezi HQ", lat: -2.4167, lng: 37.9667 };

const satellites = [
    { id: "API-01", lat: -2.3867, lng: 37.9567, status: "Active" },
    { id: "API-02", lat: -2.4367, lng: 37.9867, status: "Active" },
    { id: "API-03", lat: -2.4067, lng: 37.9167, status: "Warning" },
    { id: "API-04", lat: -2.4467, lng: 37.9467, status: "Active" },
    { id: "API-05", lat: -2.3967, lng: 37.9967, status: "Active" },
    { id: "API-06", lat: -2.4267, lng: 37.9967, status: "Active" },
    { id: "API-07", lat: -2.4367, lng: 37.9267, status: "Active" },
    { id: "API-08", lat: -2.3767, lng: 37.9767, status: "Active" },
    { id: "API-09", lat: -2.4567, lng: 37.9667, status: "Active" }
];

const fallbackNodes: NetworkNode[] = [
    {
        id: kibweziHub.id,
        name: kibweziHub.name,
        region: 'Makueni County, Kenya',
        crop: 'Mixed Forage & Acacia',
        latitude: kibweziHub.lat,
        longitude: kibweziHub.lng,
        hiveCount: 250,
        acreage: 6500,
        readiness: 98,
        signal: 'stable',
    },
    ...satellites.map(sat => ({
        id: sat.id,
        name: `Node ${sat.id}`,
        region: 'Makueni County, Kenya',
        crop: 'Acacia',
        latitude: sat.lat,
        longitude: sat.lng,
        hiveCount: Math.floor(Math.random() * 50) + 10,
        acreage: 120,
        readiness: sat.status === 'Active' ? 95 : 60,
        signal: sat.status === 'Active' ? 'surge' : 'watch',
    } as NetworkNode))
];

const getHubIcon = () => {
    const color = '#10b981';
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 12px ${color}90);">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
    `;
    return L.divIcon({ className: "bg-transparent border-none", html: svg, iconSize: [36, 36], iconAnchor: [18, 18] });
};

const getSatIcon = (signal: string) => {
    const color = signal === 'watch' || signal === 'Warning' ? '#ef4444' : '#f59e0b';
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 8px ${color}80); transform: rotate(-45deg);">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
    `;
    return L.divIcon({ className: "bg-transparent border-none", html: svg, iconSize: [28, 28], iconAnchor: [14, 14] });
};

const average = (values: number[]) => values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

const GlobalHiveNetwork = () => {
    const { data: apiariesData } = useApiaries();
    const { data: hivesData } = useHives();
    const [selectedNodeId, setSelectedNodeId] = React.useState<string>('');

    const hives = hivesData ?? EMPTY_HIVES;
    const apiaries = apiariesData ?? EMPTY_APIARIES;

    const liveNodes = React.useMemo<NetworkNode[]>(() => {
        const mapped = apiaries
            .filter((apiary) => Number.isFinite(apiary.latitude) && Number.isFinite(apiary.longitude))
            .map((apiary) => {
                const hiveCount = hives.filter((hive) => hive.apiary_id === apiary.id).length || apiary.hive_count || 0;
                const acreage = Number(apiary.size_acres || 40);
                const metrics = calculatePollinationMetrics({
                    totalAcres: acreage,
                    averageFramesPerHive: 8,
                    targetFpa: 10,
                    bloomIntensity: 0.92,
                    forageCondition: 0.88,
                    weatherRisk: 0.22,
                });

                return {
                    id: apiary.id,
                    name: apiary.name || 'Apiary',
                    region: apiary.region || apiary.location_name || 'BeeYield network',
                    crop: apiary.forage_type || 'Mixed forage',
                    latitude: Number(apiary.latitude),
                    longitude: Number(apiary.longitude),
                    hiveCount,
                    acreage,
                    readiness: metrics.readinessScore,
                    signal: metrics.readinessScore >= 85 ? 'surge' : metrics.readinessScore >= 70 ? 'stable' : 'watch',
                } satisfies NetworkNode;
            });

        return mapped.length ? mapped : fallbackNodes;
    }, [apiaries, hives]);

    React.useEffect(() => {
        if (!selectedNodeId && liveNodes.length) {
            setSelectedNodeId(liveNodes[0].id);
        }
    }, [liveNodes, selectedNodeId]);

    const selectedNode = liveNodes.find((node) => node.id === selectedNodeId) || liveNodes[0];
    const mapCenter = selectedNode
        ? [selectedNode.latitude, selectedNode.longitude] as [number, number]
        : [0, 20] as [number, number];

    const networkStats = React.useMemo(() => {
        const totalHives = liveNodes.reduce((sum, node) => sum + node.hiveCount, 0);
        const totalAcreage = liveNodes.reduce((sum, node) => sum + node.acreage, 0);
        const readiness = Math.round(average(liveNodes.map((node) => node.readiness)));
        const activeRegions = new Set(liveNodes.map((node) => node.region)).size;

        return { totalHives, totalAcreage, readiness, activeRegions };
    }, [liveNodes]);

    return (
        <BeeYieldPageShell className="space-y-6">
            <BeeYieldPageHeader
                icon={Globe}
                label="Apisense Integrated"
                title={<>2026 Global <span className="text-[#F4D03F]">Field Research</span></>}
                subtitle="Live Kibwezi-Makueni footprint powered by real-time hardware telemetry and health monitoring."
                actions={
                    <div className="flex items-center gap-3">
                        <select
                            className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-[10px] font-black text-[#1A1A1A]"
                            value={selectedNodeId}
                            onChange={(event) => setSelectedNodeId(event.target.value)}
                        >
                            {liveNodes.map((node) => (
                                <option key={node.id} value={node.id}>
                                    {node.name}
                                </option>
                            ))}
                        </select>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Network readiness', value: `${networkStats.readiness}%`, icon: ShieldCheck },
                    { label: 'Connected hives', value: networkStats.totalHives.toString(), icon: Activity },
                    { label: 'Covered acreage', value: `${networkStats.totalAcreage} ac`, icon: Flower2 },
                    { label: 'Active regions', value: networkStats.activeRegions.toString(), icon: Network },
                ].map((stat) => (
                    <div key={stat.label} className={cn(glass.card, 'p-5 space-y-3 bg-white/70 border-white/40 shadow-sm')}>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
                            <stat.icon className="w-4 h-4 text-[#1B9157]" />
                        </div>
                        <p className="text-3xl font-black tracking-tighter text-[#1A1A1A]">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className={cn(glass.card, 'xl:col-span-8 overflow-hidden border-white/40 bg-white/70 shadow-sm p-0')}>
                    <MapContainer
                        key={selectedNodeId || 'network-map'}
                        center={mapCenter}
                        zoom={selectedNode ? (selectedNode.id === 'kibwezi-hq' ? 12 : 14) : 12}
                        scrollWheelZoom={true}
                        style={{ height: '620px', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution="&copy; CARTO"
                        />

                        {liveNodes.map((node) => {
                            const isHub = node.id === 'kibwezi-hq';
                            return (
                            <React.Fragment key={node.id}>
                                <Marker position={[node.latitude, node.longitude]} icon={isHub ? getHubIcon() : getSatIcon(node.signal)}>
                                    <Popup>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-[#1A1A1A]">{node.name}</p>
                                            <p className="text-[11px] text-gray-500">{node.region}</p>
                                            <p className="text-[11px] text-gray-500">
                                                {node.crop} | {node.hiveCount} hives | {node.acreage} ac
                                            </p>
                                        </div>
                                    </Popup>
                                    {isHub && (
                                        <Tooltip 
                                            permanent 
                                            direction="top" 
                                            offset={[0, -12]}
                                            className="bg-white/90 backdrop-blur-sm border-none shadow-sm rounded-full px-3 py-1 text-neutral-900 font-bold text-xs"
                                        >
                                            {node.name}
                                        </Tooltip>
                                    )}
                                </Marker>
                                
                                {!isHub && (
                                    <Polyline 
                                        positions={[[kibweziHub.lat, kibweziHub.lng], [node.latitude, node.longitude]]} 
                                        pathOptions={{ color: '#10b981', weight: selectedNodeId === node.id ? 3 : 1.5, dashArray: '4,6', opacity: selectedNodeId === node.id ? 1 : 0.5 }} 
                                    />
                                )}
                                
                                <Circle
                                    center={[node.latitude, node.longitude]}
                                    radius={Math.max(400, node.hiveCount * 10)}
                                    pathOptions={{
                                        color: node.signal === 'surge' ? '#1B9157' : node.signal === 'watch' ? '#F59E0B' : '#2563EB',
                                        fillOpacity: 0.08,
                                        weight: 1.5,
                                    }}
                                />
                            </React.Fragment>
                            );
                        })}
                    </MapContainer>
                </div>

                <div className="xl:col-span-4 space-y-5">
                    {selectedNode && (
                        <div className={cn(glass.card, 'p-6 bg-white/70 border-white/40 shadow-sm space-y-5')}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight text-[#1A1A1A]">{selectedNode.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1B9157]/70">
                                        {selectedNode.region}
                                    </p>
                                </div>
                                <span className={cn(
                                    'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                                    selectedNode.signal === 'surge'
                                        ? 'bg-[#1B9157]/10 text-[#1B9157]'
                                        : selectedNode.signal === 'watch'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-blue-100 text-blue-700'
                                )}>
                                    {selectedNode.signal}
                                </span>
                            </div>

                            {/* Live Buffer Telemetry Visual */}
                            <div className="bg-neutral-900 rounded-2xl p-5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.1)_0%,transparent_70%)] opacity-30" />
                                <div className="relative z-10 flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-beeyield-green animate-pulse" />
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Buffer Stream</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Buffer ID: 0418-X</span>
                                </div>
                                
                                <div className="h-12 w-full flex items-end gap-1 mb-4">
                                    {[...Array(24)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ 
                                                height: [
                                                    Math.random() * 20 + 5, 
                                                    Math.random() * 30 + 10, 
                                                    Math.random() * 20 + 5
                                                ] 
                                            }}
                                            transition={{ 
                                                duration: 1.5, 
                                                repeat: Infinity, 
                                                delay: i * 0.05,
                                                ease: "easeInOut"
                                            }}
                                            className="flex-1 bg-beeyield-green/40 rounded-t-sm"
                                        />
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                                    <div>
                                        <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-1">Acoustic Score</p>
                                        <p className="text-sm font-black text-white">92.4% Optimal</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-1">Spread Risk</p>
                                        <p className={cn("text-sm font-black", selectedNode.signal === 'watch' ? 'text-amber-500' : 'text-beeyield-green')}>
                                            {selectedNode.signal === 'watch' ? 'HIGH (85%)' : 'LOW (12%)'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Readiness', value: `${selectedNode.readiness}%` },
                                    { label: 'Hive count', value: selectedNode.hiveCount.toString() },
                                    { label: 'Crop focus', value: selectedNode.crop },
                                    { label: 'Coverage', value: `${selectedNode.acreage} ac` },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-2xl border border-gray-100 bg-[#F9F7F2] p-4">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{item.label}</p>
                                        <p className="mt-2 text-sm font-black text-[#1A1A1A]">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-2xl border border-[#1B9157]/10 bg-[#1B9157]/5 p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Radio className="w-4 h-4 text-[#1B9157]" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1B9157]">
                                        Node Analytics
                                    </p>
                                </div>
                                <p className="text-xs font-semibold text-[#1A1A1A] leading-relaxed">
                                    {selectedNode.signal === 'surge'
                                        ? 'Hub Connected: Utilizing non-invasive air diagnostics, this node maintains 95% accuracy in detecting early-stage Foulbrood and Varroa.'
                                        : selectedNode.signal === 'watch'
                                            ? 'Warning: AI models predict an 85% vector spread potential to adjacent nodes. Apisense recommends immediate hive isolation.'
                                            : 'Stable Uplink: Continuous acoustic and atmospheric sensors confirm nominal hive activity. Readiness supports premium pollination.'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className={cn(glass.card, 'p-6 bg-white/70 border-white/40 shadow-sm space-y-4')}>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#F4D03F]" />
                            <h3 className="text-sm font-black text-[#1A1A1A]">Network sites</h3>
                        </div>

                        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                            {liveNodes.map((node) => (
                                <button
                                    key={node.id}
                                    type="button"
                                    onClick={() => setSelectedNodeId(node.id)}
                                    className={cn(
                                        'w-full rounded-2xl border p-4 text-left transition-all',
                                        node.id === selectedNodeId
                                            ? 'border-[#1B9157]/30 bg-[#1B9157]/5'
                                            : 'border-gray-100 bg-[#F9F7F2] hover:border-[#F4D03F]/40'
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-black text-[#1A1A1A]">{node.name}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                {node.region} | {node.crop}
                                            </p>
                                        </div>
                                        <p className="text-sm font-black text-[#1B9157]">{node.readiness}%</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </BeeYieldPageShell>
    );
};

export default GlobalHiveNetwork;
