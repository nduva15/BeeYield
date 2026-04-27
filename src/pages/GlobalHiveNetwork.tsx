import React from 'react';
import {
    Globe,
    MapPin,
    Network,
    Activity,
    Flower2,
    ShieldCheck,
    Radio,
    Zap,
    Download,
    ArrowRight,
    Loader2,
    Signal
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { useApiaries, useHives } from '@/hooks/useApiaries';
import { calculatePollinationMetrics } from '@/lib/pollinationCalculations';
import SEO from "@/components/SEO";

import LOGO from "@/assets/Logo.png";
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

import {
    KIBWEZI_HUB,
    SATELLITES,
    FALLBACK_NODES,
    type NetworkNode,
} from '@/data/networkContent';

const EMPTY_APIARIES: any[] = [];
const EMPTY_HIVES: any[] = [];

const getHubIcon = () => {
    const color = '#10b981';
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 12px ${color}90);">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
    `;
    return L.divIcon({ className: "bg-transparent border-none", html: svg, iconSize: [40, 40], iconAnchor: [20, 20] });
};

const getSatIcon = (signal: string) => {
    const color = signal === 'watch' || signal === 'Warning' ? '#ef4444' : '#f59e0b';
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 8px ${color}80); transform: rotate(-45deg);">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
    `;
    return L.divIcon({ className: "bg-transparent border-none", html: svg, iconSize: [30, 30], iconAnchor: [15, 15] });
};

const average = (values: number[]) => values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

const BUFFER_BARS = Array.from({ length: 32 }, (_, index) => ({
    id: index,
    heights: [
        12 + (index % 5) * 4,
        24 + (index % 7) * 3,
        15 + (index % 4) * 6,
    ],
}));

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

        return mapped.length ? mapped : FALLBACK_NODES;
    }, [apiaries, hives]);

    React.useEffect(() => {
        if (!selectedNodeId && liveNodes.length) {
            setSelectedNodeId(liveNodes[0].id);
        }
    }, [liveNodes, selectedNodeId]);

    const selectedNode = liveNodes.find((node) => node.id === selectedNodeId) || liveNodes[0];
    const mapCenter = selectedNode
        ? [selectedNode.latitude, selectedNode.longitude] as [number, number]
        : [KIBWEZI_HUB.lat, KIBWEZI_HUB.lng] as [number, number];

    const networkStats = React.useMemo(() => {
        const totalHives = liveNodes.reduce((sum, node) => sum + node.hiveCount, 0);
        const totalAcreage = liveNodes.reduce((sum, node) => sum + node.acreage, 0);
        const readiness = Math.round(average(liveNodes.map((node) => node.readiness)));
        const activeRegions = new Set(liveNodes.map((node) => node.region)).size;

        return { totalHives, totalAcreage, readiness, activeRegions };
    }, [liveNodes]);

    return (
        <BeeYieldPageShell className="bg-background text-foreground">
            <SEO 
                title="Global Hive Network | BeeYield"
                description="Live footprint of the BeeYield precision pollination network, powered by real-time hardware telemetry."
                url="/global-network"
            />

            {/* ═══════════════════════════════════════════════════════════════
                 HERO SECTION — Sync with Diseases Hero
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden border-b border-neutral-100">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-beeyield-green/5 to-transparent pointer-events-none" />
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto flex flex-col items-center">
                        <motion.img
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            src={LOGO}
                            alt="BeeYield Logo"
                            className="h-24 md:h-36 w-auto mb-12 drop-shadow-2xl"
                        />
                        <Badge className="mb-6 bg-beeyield-green/10 text-beeyield-green border-beeyield-green/20 px-5 py-2 font-semibold text-[10px] rounded-full backdrop-blur-sm">
                            Apisense Integrated
                        </Badge>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-neutral-900 leading-tight"
                        >
                            Global Hive <br /> <span className="text-beeyield-green">Network Footprint</span>
                        </motion.h1>
                        <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl font-medium">
                            Live Kibwezi-Makueni footprint powered by real-time hardware telemetry, acoustic diagnostics, and health monitoring.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-12 bg-white/50 border-b border-neutral-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {[
                            { label: 'Network readiness', value: `${networkStats.readiness}%`, icon: ShieldCheck },
                            { label: 'Connected hives', value: networkStats.totalHives.toLocaleString(), icon: Activity },
                            { label: 'Covered acreage', value: `${networkStats.totalAcreage.toLocaleString()} ac`, icon: Flower2 },
                            { label: 'Active regions', value: networkStats.activeRegions.toString(), icon: Network },
                        ].map((stat, i) => (
                            <motion.div 
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm text-center md:text-left"
                            >
                                <div className="flex items-center justify-center md:justify-between mb-4">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{stat.label}</span>
                                    <stat.icon className="w-4 h-4 text-beeyield-green hidden md:block" />
                                </div>
                                <p className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tighter">{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Network Interface */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
                        
                        {/* Map Section */}
                        <div className="xl:col-span-8">
                            <Card className="border border-neutral-200/60 rounded-[3rem] shadow-sm overflow-hidden bg-neutral-50 p-2">
                                <div className="h-[750px] w-full rounded-[2.8rem] overflow-hidden relative border border-white/50">
                                    <MapContainer
                                        key={selectedNodeId || 'network-map'}
                                        center={mapCenter}
                                        zoom={selectedNode ? (selectedNode.id === 'kibwezi-hq' ? 12 : 14) : 11}
                                        scrollWheelZoom={true}
                                        style={{ height: '100%', width: '100%' }}
                                        className="grayscale-[0.2]"
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
                                                    <Popup className="premium-popup">
                                                        <div className="p-2 min-w-[180px]">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge className={isHub ? "bg-beeyield-green" : "bg-neutral-900"}>{isHub ? "HQ" : "NODE"}</Badge>
                                                                <p className="text-sm font-black text-neutral-900">{node.name}</p>
                                                            </div>
                                                            <div className="space-y-1 text-[11px] font-bold text-neutral-500 uppercase tracking-tight">
                                                                <div className="flex justify-between"><span>Region</span><span className="text-neutral-900">{node.region}</span></div>
                                                                <div className="flex justify-between"><span>Hives</span><span className="text-neutral-900">{node.hiveCount}</span></div>
                                                                <div className="flex justify-between"><span>Readiness</span><span className="text-beeyield-green">{node.readiness}%</span></div>
                                                            </div>
                                                        </div>
                                                    </Popup>
                                                    {isHub && (
                                                        <Tooltip 
                                                            permanent 
                                                            direction="top" 
                                                            offset={[0, -15]}
                                                            className="bg-neutral-900 text-white border-none shadow-xl rounded-full px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest"
                                                        >
                                                            {node.name}
                                                        </Tooltip>
                                                    )}
                                                </Marker>
                                                
                                                {!isHub && (
                                                    <Polyline 
                                                        positions={[[KIBWEZI_HUB.lat, KIBWEZI_HUB.lng], [node.latitude, node.longitude]]} 
                                                        pathOptions={{ 
                                                            color: '#10b981', 
                                                            weight: selectedNodeId === node.id ? 4 : 2, 
                                                            dashArray: '8,12', 
                                                            opacity: selectedNodeId === node.id ? 1 : 0.4,
                                                            lineCap: 'round'
                                                        }} 
                                                    />
                                                )}
                                                
                                                <Circle
                                                    center={[node.latitude, node.longitude]}
                                                    radius={Math.max(500, node.hiveCount * 12)}
                                                    pathOptions={{
                                                        color: node.signal === 'surge' ? '#1B9157' : node.signal === 'watch' ? '#F59E0B' : '#2563EB',
                                                        fillOpacity: 0.05,
                                                        weight: selectedNodeId === node.id ? 2 : 1,
                                                        dashArray: '10,10'
                                                    }}
                                                />
                                            </React.Fragment>
                                            );
                                        })}
                                    </MapContainer>

                                    {/* Map HUD Overlay */}
                                    <div className="absolute top-6 left-6 z-[1000] space-y-4">
                                        <div className="bg-neutral-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl min-w-[240px]">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-10 w-10 bg-beeyield-green/10 rounded-xl flex items-center justify-center text-beeyield-green">
                                                    <Signal size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Network Status</p>
                                                    <h3 className="text-sm font-bold text-white">All Nodes Online</h3>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                                                    <span className="text-white/40">Active Links</span>
                                                    <span className="text-beeyield-green">{liveNodes.length - 1} Satellites</span>
                                                </div>
                                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: "88%" }}
                                                        className="h-full bg-beeyield-green"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Control & Details Panel */}
                        <div className="xl:col-span-4 space-y-8">
                            
                            {/* Selected Node Details */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedNode?.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Card className="border border-neutral-200/60 rounded-[3rem] shadow-premium bg-white overflow-hidden">
                                        <CardContent className="p-10 space-y-8">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <Badge className="bg-beeyield-green/10 text-beeyield-green border-none mb-3 px-4 py-1 text-[9px] font-bold uppercase tracking-widest">
                                                        {selectedNode?.region}
                                                    </Badge>
                                                    <h3 className="text-3xl font-bold tracking-tight text-neutral-900">{selectedNode?.name}</h3>
                                                </div>
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                                    selectedNode?.signal === 'surge' ? "bg-beeyield-green/10 text-beeyield-green" : "bg-amber-500/10 text-amber-500"
                                                )}>
                                                    <Zap size={24} />
                                                </div>
                                            </div>

                                            {/* Telemetry Visual */}
                                            <div className="bg-neutral-950 rounded-[2.5rem] p-8 border border-neutral-800 relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.15)_0%,transparent_70%)] opacity-40" />
                                                <div className="relative z-10 flex items-center justify-between mb-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-beeyield-green shadow-[0_0_12px_rgba(74,222,128,0.8)] animate-pulse" />
                                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Apisense Feed</span>
                                                    </div>
                                                    <span className="text-[9px] font-mono text-neutral-500">ID://NODE-{selectedNode?.id.slice(-4)}</span>
                                                </div>
                                                
                                                <div className="h-20 w-full flex items-end gap-1.5 mb-8">
                                                    {BUFFER_BARS.map((bar) => (
                                                        <motion.div
                                                            key={bar.id}
                                                            animate={{ height: bar.heights }}
                                                            transition={{ 
                                                                duration: 1.2, 
                                                                repeat: Infinity, 
                                                                delay: bar.id * 0.04,
                                                                ease: "easeInOut"
                                                            }}
                                                            className="flex-1 bg-beeyield-green/40 min-h-[4px] rounded-t-sm"
                                                        />
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                                                    <div>
                                                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Acoustic Logic</p>
                                                        <p className="text-xl font-bold text-white">{selectedNode?.readiness}%<span className="text-[10px] ml-1 text-beeyield-green font-normal">Optimal</span></p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Transmission</p>
                                                        <p className="text-xl font-bold text-white">4.8ms<span className="text-[10px] ml-1 text-beeyield-green font-normal">Fast</span></p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { label: "Hive Capacity", value: selectedNode?.hiveCount, icon: Activity },
                                                    { label: "Crop Focus", value: selectedNode?.crop, icon: Flower2 },
                                                    { label: "Coverage", value: `${selectedNode?.acreage} Ac`, icon: MapPin },
                                                    { label: "Signal Status", value: selectedNode?.signal === 'surge' ? 'Excellent' : 'Nominal', icon: Radio },
                                                ].map((item, i) => (
                                                    <div key={i} className="bg-neutral-50 p-6 rounded-[2rem] border border-neutral-100 group hover:border-beeyield-green/20 transition-all">
                                                        <item.icon size={16} className="text-neutral-400 mb-3 group-hover:text-beeyield-green transition-colors" />
                                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{item.label}</p>
                                                        <p className="text-sm font-bold text-neutral-900">{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="text-sm text-neutral-500 font-medium leading-relaxed italic border-l-4 border-beeyield-green pl-6 py-1">
                                                {selectedNode?.signal === 'surge'
                                                    ? 'High-fidelity acoustic diagnostics indicate optimal colony resonance. Pollination load readiness is maximal.'
                                                    : 'Baseline sensors indicate nominal activity. Diagnostic routine 04-X executing for predictive health maintenance.'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </AnimatePresence>

                            {/* Node Directory */}
                            <Card className="border border-neutral-200/60 rounded-[3rem] shadow-sm bg-neutral-50 overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-neutral-900 shadow-sm">
                                            <Globe size={18} />
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900">Network Directory</h3>
                                    </div>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {liveNodes.map((node) => (
                                            <button
                                                key={node.id}
                                                onClick={() => setSelectedNodeId(node.id)}
                                                className={cn(
                                                    "w-full p-6 rounded-[2rem] text-left transition-all duration-300 border",
                                                    selectedNodeId === node.id 
                                                        ? "bg-white border-beeyield-green shadow-md translate-x-1" 
                                                        : "bg-white/40 border-transparent hover:bg-white hover:border-neutral-200"
                                                )}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-neutral-900">{node.name}</h4>
                                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{node.region}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-beeyield-green">{node.readiness}%</p>
                                                        <p className="text-[9px] font-bold text-neutral-400">Readiness</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

             {/* Final CTA — Match Diseases CTA */}
             <section className="bg-neutral-900 py-32 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5" />
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.9 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       viewport={{ once: true }}
                       className="max-w-4xl mx-auto"
                    >
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-10">
                            <Signal className="w-10 h-10 text-beeyield-green animate-pulse" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                            Expand the <span className="text-beeyield-green">Global Network</span>
                        </h2>
                        <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Interested in deploying Apisense technology in your apiary? Join our 2026 expansion and become a high-fidelity data node.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button asChild className="h-14 px-12 bg-beeyield-green text-neutral-900 rounded-2xl font-bold hover:bg-beeyield-green/90 transition-all shadow-xl">
                                <a href="/contact">Partner With Us <ArrowRight size={18} className="ml-2" /></a>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </BeeYieldPageShell>
    );
};

export default GlobalHiveNetwork;
