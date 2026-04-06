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
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
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

const fallbackNodes: NetworkNode[] = [
    {
        id: 'nairobi-demo',
        name: 'Nairobi Bloom Corridor',
        region: 'Kenya',
        crop: 'Avocado',
        latitude: -1.2864,
        longitude: 36.8172,
        hiveCount: 34,
        acreage: 118,
        readiness: 84,
        signal: 'stable',
    },
    {
        id: 'california-demo',
        name: 'Central Valley Almond Grid',
        region: 'United States',
        crop: 'Almond',
        latitude: 36.7783,
        longitude: -119.4179,
        hiveCount: 120,
        acreage: 420,
        readiness: 89,
        signal: 'surge',
    },
    {
        id: 'andalusia-demo',
        name: 'Andalusia Citrus Cluster',
        region: 'Spain',
        crop: 'Citrus',
        latitude: 37.3891,
        longitude: -5.9845,
        hiveCount: 42,
        acreage: 160,
        readiness: 76,
        signal: 'watch',
    },
];

const average = (values: number[]) => values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

const GlobalHiveNetwork = () => {
    const { data: apiariesData } = useApiaries();
    const { data: hivesData } = useHives();
    const [selectedNodeId, setSelectedNodeId] = React.useState<string>('');

    const hives = hivesData || [];
    const apiaries = apiariesData || [];

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
                label="Network"
                title={<>Global <span className="text-[#F4D03F]">Hive Network</span></>}
                subtitle="Frontend-safe network coverage, readiness scoring, and spatial oversight."
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
                        zoom={selectedNode ? 6 : 2}
                        scrollWheelZoom={true}
                        style={{ height: '620px', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                        />

                        {liveNodes.map((node) => (
                            <React.Fragment key={node.id}>
                                <Marker position={[node.latitude, node.longitude]}>
                                    <Popup>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-[#1A1A1A]">{node.name}</p>
                                            <p className="text-[11px] text-gray-500">{node.region}</p>
                                            <p className="text-[11px] text-gray-500">
                                                {node.crop} | {node.hiveCount} hives | {node.acreage} ac
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                                <Circle
                                    center={[node.latitude, node.longitude]}
                                    radius={Math.max(900, node.hiveCount * 35)}
                                    pathOptions={{
                                        color: node.signal === 'surge' ? '#1B9157' : node.signal === 'watch' ? '#F59E0B' : '#2563EB',
                                        fillOpacity: 0.08,
                                        weight: 1.5,
                                    }}
                                />
                            </React.Fragment>
                        ))}
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
                                        Network recommendation
                                    </p>
                                </div>
                                <p className="text-sm font-semibold text-[#1A1A1A] leading-relaxed">
                                    {selectedNode.readiness >= 85
                                        ? 'This site is ready for premium pollination contracts and can absorb additional telemetry hardware.'
                                        : selectedNode.readiness >= 70
                                            ? 'Coverage is stable. Focus on bloom verification and keep logistics tuned to avoid overlap losses.'
                                            : 'Readiness is soft. Add stronger colonies or rebalance nearby hives before the next bloom spike.'}
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
