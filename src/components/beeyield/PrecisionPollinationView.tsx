import React from 'react';
import {
    Map as MapIcon,
    Layers,
    Search,
    Info,
    Smartphone,
    Signal,
    Activity,
    Thermometer,
    Droplets,
    Wind,
    ArrowRight,
    Target,
    Hexagon,
    Zap,
    Terminal,
    ChevronDown,
    Calculator,
    FileBarChart,
    Navigation,
    Plus,
    Minus,
    AlertTriangle,
    Save,
    FileDown,
    RefreshCw,
    Loader2,
    Calendar,
    ClipboardList,
    AlertCircle,
    User,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import { beeyieldService, Apiary, IoTDevice, SensorReading } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { calculatePollinationMetrics, CalculationInputs } from '@/lib/pollinationCalculations';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { jsPDF } from 'jspdf';

import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const acresToSquarePolygon = (lat: number, lng: number, acres: number) => {
    const areaM2 = Math.max(1, acres) * 4046.8564224;
    const sideM = Math.sqrt(areaM2);
    const half = sideM / 2;
    const dLat = half / 111_320;
    const dLng = half / (111_320 * Math.cos((lat * Math.PI) / 180));
    return [
        [lat - dLat, lng - dLng],
        [lat - dLat, lng + dLng],
        [lat + dLat, lng + dLng],
        [lat + dLat, lng - dLng],
    ];
};

const polygonToGeoJSON = (poly: number[][]) => ({
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [poly[0][1], poly[0][0]],
                    [poly[1][1], poly[1][0]],
                    [poly[2][1], poly[2][0]],
                    [poly[3][1], poly[3][0]],
                    [poly[0][1], poly[0][0]],
                ]]
            },
            properties: {}
        }
    ]
});

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

interface PrecisionPollinationViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    onTabChange: (tab: string, message?: string, action?: string) => void;
    activeSubPageOverride?: SubPage;
}

type SubPage = 'home' | 'grid' | 'calcs' | 'map' | 'reports';

const PrecisionPollinationView: React.FC<PrecisionPollinationViewProps> = ({
    devices,
    readings,
    onTabChange,
    activeSubPageOverride
}) => {
    const [internalSubPage, setInternalSubPage] = React.useState<SubPage>('home');
    const activeSubPage = activeSubPageOverride || internalSubPage;

    const setActiveSubPage = (page: SubPage) => {
        if (activeSubPageOverride) {
            const tabMap: Record<SubPage, string> = {
                'home': 'precision-pollination',
                'grid': 'precision-pollination-grid',
                'calcs': 'pollination-calcs',
                'map': 'flight-mapping-tactical',
                'reports': 'site-reports-tactical'
            };
            onTabChange(tabMap[page]);
        } else {
            setInternalSubPage(page);
        }
    };

    const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');

    // Calc Engine State
    const [calcInputs, setCalcInputs] = React.useState<CalculationInputs>({
        totalAcres: 50,
        hives: Array(10).fill(null).map((_, i) => ({
            frameCount: 8,
            isStrong: i % 3 !== 0,
            isLarge: i % 2 === 0
        })),
        forageCondition: 0.8,
        bloomIntensity: 0.9
    });

    const metrics = React.useMemo(() => calculatePollinationMetrics(calcInputs), [calcInputs]);

    const [deployments, setDeployments] = React.useState<any[]>([]);
    const [isSaving, setIsSaving] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    const [optimalPlacements, setOptimalPlacements] = React.useState<any[]>([]);
    const [isOptimizing, setIsOptimizing] = React.useState(false);
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('');

    const selectedApiary = React.useMemo(
        () => apiaries.find((a) => a.id === selectedApiaryId),
        [apiaries, selectedApiaryId]
    );

    const orchardPolygon = React.useMemo(() => {
        const lat = selectedApiary?.latitude ?? -1.285;
        const lng = selectedApiary?.longitude ?? 36.825;
        const acres = selectedApiary?.size_acres ?? calcInputs.totalAcres ?? 25;
        return acresToSquarePolygon(lat, lng, acres);
    }, [selectedApiary, calcInputs.totalAcres]);

    const orchardGeoJSON = React.useMemo(() => polygonToGeoJSON(orchardPolygon), [orchardPolygon]);

    const fetchDeployments = async () => {
        setLoading(true);
        const data = await beeyieldService.getPollinationDeployments();
        setDeployments(data);
        setLoading(false);
    };

    const handleCommitTasks = async () => {
        if (optimalPlacements.length === 0) {
            toast.error('No optimized placements to commit.');
            return;
        }

        setIsSaving(true);
        try {
            const dueDate = new Date().toISOString().split('T')[0];
            const taskPromises = optimalPlacements.map((pos, idx) => {
                return beeyieldService.createTask({
                    title: `Tactical Deployment: Unit #${idx + 1}`,
                    description: `Deploy hive to coordinates: ${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}. Coverage Score: ${Math.round(pos.score * 100)}%. Map Marker Ref: #${idx + 1}`,
                    category: 'Pollination',
                    priority: 'high',
                    due_date: dueDate,
                    status: 'pending'
                });
            });

            await Promise.all(taskPromises);
            toast.success(`Successfully committed ${optimalPlacements.length} deployment tasks.`);
            setActiveSubPage('reports');
        } catch (error) {
            console.error('Commit tasks error:', error);
            toast.error('Failed to commit deployment tasks.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleOptimize = async () => {
        setIsOptimizing(true);
        try {
            const results = await beeyieldService.optimizePollinationPlacement({
                orchard_geojson: orchardGeoJSON,
                hive_count: calcInputs.hives.length,
                target_crop: 'Almond',
                bee_flight_radius_km: 1.5,
                ahp_weights: { bloom: 0.8, roads: 0.2, water: 0.1 }
            });
            setOptimalPlacements(results);
            toast.success(`Generated ${results.length} optimal placements.`);
        } catch (error) {
            toast.error('Failed to calculate optimal placement');
        } finally {
            setIsOptimizing(false);
        }
    };

    React.useEffect(() => {
        fetchDeployments();
    }, []);

    React.useEffect(() => {
        let mounted = true;
        const loadApiaries = async () => {
            try {
                const data = await beeyieldService.getApiaries();
                if (!mounted) return;
                setApiaries(data || []);
                if (!selectedApiaryId && (data || []).length > 0) setSelectedApiaryId(data[0].id);
            } catch {
                // ignore
            }
        };
        loadApiaries();
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSaveDeployment = async () => {
        setIsSaving(true);
        const result = await beeyieldService.savePollinationDeployment({
            field_name: `Tactical Deployment ${new Date().toLocaleDateString()}`,
            crop_type: 'Almond',
            total_acres: calcInputs.totalAcres,
            bloom_intensity: calcInputs.bloomIntensity,
            forage_condition: calcInputs.forageCondition,
            status: 'active',
            metrics_json: metrics
        });
        if (!result.error) {
            fetchDeployments();
        }
        setIsSaving(false);
    };

    const handleExport = async (type: string) => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: `Generating ${type} export...`,
                success: `${type} ready for download.`,
                error: 'Export failed'
            }
        );

        await beeyieldService.logExport({
            export_type: 'CSV',
            entity_scope: 'Pollination',
            file_name: `BeeYield_Pollination_${type}_${new Date().toISOString().slice(0, 10)}.csv`,
            record_count: deployments.length || 10
        });
    };

    const filteredDevices = React.useMemo(() => {
        return devices.filter(d =>
            d.device_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.location_name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [devices, searchTerm]);

    React.useEffect(() => {
        if (filteredDevices.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(filteredDevices[0].id);
        }
    }, [filteredDevices, selectedDeviceId]);

    const selectedDevice = React.useMemo(() =>
        devices.find(d => d.id === selectedDeviceId),
        [devices, selectedDeviceId]
    );

    const deviceReadings = React.useMemo(() =>
        readings.filter(r => r.device_id === selectedDeviceId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        [readings, selectedDeviceId]
    );

    const subPageOptions = [
        { id: 'grid', label: 'Nodes', icon: Layers },
        { id: 'calcs', label: 'Calculator', icon: Calculator },
        { id: 'map', label: 'Flight Map', icon: Navigation },
        { id: 'reports', label: 'Reports', icon: FileBarChart }
    ];

    return (
        <BeeYieldPageShell className="relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#1B9157]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -left-20 top-1/2 w-64 h-64 bg-[#F4D03F]/5 blur-[100px] rounded-full pointer-events-none" />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative z-10">
            <BeeYieldPageHeader
                icon={Target}
                label="Field tools"
                title="Precision Pollination"
                subtitle="Plan placement and estimate coverage."
                actions={
                    !activeSubPageOverride && (
                        <div className="flex bg-[#1B9157]/[0.05] p-1 rounded-xl border border-[#1B9157]/10 gap-1 overflow-x-auto custom-scrollbar shadow-sm">
                            {subPageOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setActiveSubPage(opt.id as SubPage)}
                                    className={cn(
                                        "h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-2",
                                        activeSubPage === opt.id
                                            ? "bg-[#1B9157] text-white shadow-lg shadow-[#1B9157]/20"
                                            : "text-gray-400 hover:text-[#1A1A1A] hover:bg-white/50"
                                    )}
                                >
                                    <opt.icon className="w-3.5 h-3.5" />
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )
                }
            />

            <AnimatePresence mode="wait">
                {activeSubPage === 'home' && (
                    <motion.div
                        key="home"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className={cn(glass.card, "lg:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden border-white/40 shadow-sm")}>
                                <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#1B9157]/5 blur-[120px] rounded-full pointer-events-none" />
                                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1B9157 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                                
                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] shadow-sm shadow-[#1B9157]/50 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#1B9157]">LIVE UPDATES</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none">Fleet <span className="text-[#1B9157]">Optimizer</span></h2>
                                    <p className="text-[10px] font-black text-gray-500 leading-relaxed max-w-xl border-l-2 border-[#1B9157]/10 pl-4 uppercase tracking-tighter">
                                        Continuous spatial analysis and real-time fleet orchestration. 
                                        Monitoring colony distribution and bloom saturation vectors.
                                    </p>
                                </div>
                                <div className="mt-10 pt-6 border-t border-[#1B9157]/10 flex gap-12 relative z-10">
                                    <div className="space-y-1">
                                        <p className={glass.microLabel}>TACTICAL_NODES</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-2xl font-black tabular-nums tracking-tighter">{devices.length}</p>
                                            <span className="text-[8px] font-black text-[#1B9157] uppercase">SYNCED</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className={glass.microLabel}>SATURATION_INDEX</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-2xl font-black text-[#1B9157] tabular-nums tracking-tighter">98<span className="text-[14px]">%</span></p>
                                            <span className="text-[8px] font-black text-[#1B9157] uppercase">OPTIMAL</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: 'Bloom Intensity', val: '72%', sub: 'BLOOM_FLUX', icon: Zap, color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]/5', border: 'border-[#F4D03F]/20' },
                                    { label: 'Activity Factor', val: '8.4', sub: 'HIGH_CAPACITY', icon: Activity, color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/5', border: 'border-[#1B9157]/20' }
                                ].map((stat, i) => (
                                    <div key={i} className={cn(glass.card, "p-4 flex items-center justify-between border-white/40 shadow-sm", stat.bg, stat.border)}>
                                       <div className="space-y-1">
                                            <p className={glass.microLabel}>{stat.label}</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className={cn("text-xl font-black tracking-tighter tabular-nums", stat.color)}>{stat.val}</p>
                                                <span className={cn("text-[8px] font-black uppercase tracking-widest", stat.color)}>{stat.sub}</span>
                                            </div>
                                       </div>
                                       <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                            <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                                       </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {subPageOptions.map((opt, idx) => (
                                <motion.button
                                    key={opt.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setActiveSubPage(opt.id as SubPage)}
                                    className="bg-white/40 border border-[#1B9157]/10 p-6 rounded-2xl flex flex-col items-center text-center gap-4 hover:border-[#1B9157]/40 hover:bg-white/60 transition-all group shadow-sm"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#1B9157]/10 flex items-center justify-center group-hover:bg-[#1B9157] group-hover:text-white transition-all shadow-sm">
                                        <opt.icon className="w-5 h-5 text-[#1B9157] group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">{opt.label}</p>
                                        <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#1B9157]/40">ACCESS_PROTOCOL</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeSubPage === 'grid' && (
                    <motion.div key="grid" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="lg:col-span-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1B9157]/40" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="SEARCH_NODES..."
                                    className={cn(glass.input, "h-11 pl-11 text-[10px] font-black uppercase tracking-[0.2em] bg-white/40")}
                                />
                            </div>
                            <div className={cn(glass.card, "p-2 h-[500px] overflow-y-auto thin-scrollbar bg-white/20 border-[#1B9157]/5")}>
                                <div className="space-y-2">
                                    {filteredDevices.map(device => (
                                        <button
                                            key={device.id}
                                            onClick={() => setSelectedDeviceId(device.id)}
                                            className={cn(
                                                "w-full p-4 rounded-2xl border transition-all outline-none flex items-center justify-between group/row relative overflow-hidden",
                                                selectedDeviceId === device.id 
                                                    ? "bg-white border-[#1B9157]/20 shadow-lg" 
                                                    : "bg-white/30 border-transparent hover:bg-white/50"
                                            )}
                                        >
                                            {selectedDeviceId === device.id && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1B9157]" />
                                            )}
                                            <div className="text-left space-y-1">
                                                <p className={cn("text-[11px] font-black uppercase tracking-tight", selectedDeviceId === device.id ? "text-[#1B9157]" : "text-[#1A1A1A]")}>{device.device_code}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate w-32">{device.location_name || 'UNDEFINED_SECTOR'}</p>
                                            </div>
                                            <div className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest", device.status === 'active' ? "bg-[#1B9157]/10 text-[#1B9157] border border-[#1B9157]/20" : "bg-red-50 text-red-600 border border-red-100")}>
                                                {device.status === 'active' ? 'ONLINE' : 'OFFLINE'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-5">
                            <div className={cn(glass.card, "p-0 aspect-video relative overflow-hidden bg-white/40 border-[#1B9157]/10 shadow-xl")}>
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1B9157]/[0.02] to-transparent" />
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1B9157 1px, transparent 1px), linear-gradient(to bottom, #1B9157 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                                {selectedDevice && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="relative">
                                            <motion.div 
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 w-32 h-32 -translate-x-1/4 -translate-y-1/4 border-2 border-[#1B9157] rounded-full" 
                                            />
                                            <div className="w-12 h-12 rounded-2xl bg-[#1B9157] border-4 border-white shadow-2xl relative z-10 flex items-center justify-center">
                                                <Smartphone className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-5 whitespace-nowrap">
                                                <div className="px-4 py-2 bg-white/90 rounded-xl border border-[#1B9157]/20 shadow-2xl flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-[#1B9157] shadow-sm shadow-[#1B9157]/50 animate-pulse" />
                                                    <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">{selectedDevice.device_code}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                             {selectedDevice && (
                                <div className="grid grid-cols-3 gap-4">
                                   {[
                                       { icon: Thermometer, label: 'ThermexScale', val: '24.5', unit: '°C', color: 'text-amber-500' },
                                       { icon: Droplets, label: 'HydroScale', val: '62', unit: '%', color: 'text-blue-500' },
                                       { icon: Signal, label: 'PulseLink', val: '98', unit: '%', color: 'text-[#1B9157]' }
                                   ].map((s, idx) => (
                                       <div key={idx} className={cn(glass.card, "p-4 flex flex-col gap-3 border-white/40 shadow-sm")}>
                                          <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-100 bg-white shadow-sm">
                                             <s.icon className={cn("w-4 h-4", s.color)} />
                                          </div>
                                          <div className="space-y-0.5">
                                             <p className={glass.microLabel}>{s.label}</p>
                                             <div className="flex items-baseline gap-1">
                                                <p className="text-xl font-black text-[#1A1A1A] tracking-tighter tabular-nums">{s.val}</p>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{s.unit}</span>
                                             </div>
                                          </div>
                                       </div>
                                   ))}
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}

                {activeSubPage === 'calcs' && (
                    <motion.div key="calcs" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className={cn(glass.card, "p-0 space-y-0 bg-white/40 border-[#F4D03F]/10 overflow-hidden shadow-xl")}>
                                <div className="flex items-center justify-between p-4 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.05]">
                                    <div className="flex items-center gap-2">
                                        <Calculator className="w-4 h-4 text-[#F4D03F]" />
                                        <h3 className="text-[10px] font-black text-[#1A1A1A] tracking-[0.2em] uppercase">Tactical_Parameters</h3>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F] shadow-sm shadow-[#F4D03F]/50 animate-pulse" />
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-[#1A1A1A]/40 uppercase tracking-[0.3em] ml-1">Total_Deployment_Area (AC)</label>
                                        <div className="flex bg-white/40 p-1.5 rounded-xl border border-[#F4D03F]/10 shadow-sm">
                                            <button
                                                onClick={() => setCalcInputs(p => ({ ...p, totalAcres: Math.max(1, p.totalAcres - 5) }))}
                                                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#F4D03F] hover:bg-white rounded-lg transition-all"
                                                aria-label="Decrease total deployment area"
                                                title="Decrease total deployment area"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <div className="flex-1 flex items-center justify-center text-sm font-black text-[#1A1A1A] tabular-nums tracking-tighter">{calcInputs.totalAcres}</div>
                                            <button
                                                onClick={() => setCalcInputs(p => ({ ...p, totalAcres: p.totalAcres + 5 }))}
                                                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#F4D03F] hover:bg-white rounded-lg transition-all"
                                                aria-label="Increase total deployment area"
                                                title="Increase total deployment area"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] ml-1">
                                            <span className="text-[#1A1A1A]/40">Bloom_Saturation</span>
                                            <span className="text-[#1B9157]">{Math.round(calcInputs.bloomIntensity * 100)}%</span>
                                        </div>
                                        <div className="relative h-2 bg-white/40 rounded-full overflow-hidden border border-[#1B9157]/10">
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="1.0"
                                                step="0.1"
                                                value={calcInputs.bloomIntensity}
                                                onChange={e => setCalcInputs(p => ({ ...p, bloomIntensity: parseFloat(e.target.value) }))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                aria-label="Bloom saturation"
                                                title="Bloom saturation"
                                            />
                                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1B9157]/40 to-[#1B9157] rounded-full pointer-events-none transition-all duration-300" style={{ width: `${calcInputs.bloomIntensity * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] ml-1">
                                            <span className="text-[#1A1A1A]/40">Competitor_Density</span>
                                            <span className="text-[#F4D03F]">{Math.round(calcInputs.forageCondition * 100)}%</span>
                                        </div>
                                        <div className="relative h-2 bg-white/40 rounded-full overflow-hidden border border-[#F4D03F]/10">
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="1.0"
                                                step="0.1"
                                                value={calcInputs.forageCondition}
                                                onChange={e => setCalcInputs(p => ({ ...p, forageCondition: parseFloat(e.target.value) }))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                aria-label="Competitor density"
                                                title="Competitor density"
                                            />
                                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F4D03F]/40 to-[#F4D03F] rounded-full pointer-events-none transition-all duration-300" style={{ width: `${calcInputs.forageCondition * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <div className="lg:col-span-2 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                   <div className={cn(glass.card, "p-5 border-l-4 border-l-[#1A1A1A] space-y-2 shadow-sm border-white/40")}>
                                      <p className={glass.microLabel}>Absolute_Capacity</p>
                                      <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-black tracking-tighter text-[#1A1A1A] tabular-nums">{metrics.totalFrames}</p>
                                        <span className="text-[10px] font-black uppercase text-[#1A1A1A]/30 tracking-widest">FRAMES</span>
                                      </div>
                                   </div>
                                   <div className={cn(glass.card, "p-5 border-l-4 border-l-[#1B9157] space-y-2 shadow-sm border-white/40 bg-[#1B9157]/5")}>
                                      <p className={glass.microLabel}>Target_Logic_Yield</p>
                                      <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-black tracking-tighter text-[#1B9157] tabular-nums">{metrics.effectiveFrames}</p>
                                        <span className="text-[10px] font-black uppercase text-[#1B9157]/40 tracking-widest">E_FRAMES</span>
                                      </div>
                                   </div>
                                </div>
                                <div className={cn(glass.card, "p-5 grid grid-cols-3 gap-6 shadow-sm border-white/40")}>
                                   {[
                                       { l: 'FPA_RATIO', v: metrics.framesPerAcre, c: 'text-[#1A1A1A]' },
                                       { l: 'EFF_FPA', v: metrics.effectiveFPA, c: 'text-[#1B9157]' },
                                       { l: 'EFFICACY', v: metrics.pollinationEfficacy + '%', c: 'text-[#1B9157]' }
                                   ].map((m, i) => (
                                       <div key={i} className="text-center space-y-1">
                                          <p className={glass.microLabel}>{m.l}</p>
                                          <p className={cn("text-xl font-black tracking-tighter tabular-nums", m.c)}>{m.v}</p>
                                       </div>
                                   ))}
                                </div>
                                <button onClick={handleSaveDeployment} disabled={isSaving} className={cn(glass.btnPrimary, "w-full h-11 text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl group transition-all duration-500 shadow-xl shadow-[#1B9157]/10")}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                                    <span>COMMIT_SYNC_MATRIX</span>
                                </button>
                            </div>

                        </div>

                        <div className={cn(glass.card, "p-6 bg-white/40 border-white/20 shadow-xl space-y-6")}>
                             <div className="flex items-center justify-between border-b border-[#1B9157]/5 pb-6">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-[#1A1A1A] tracking-tighter uppercase">Deployment_Inventory</h3>
                                    <p className="text-[9px] font-black text-[#1B9157]/40 uppercase tracking-[0.2em]">Hardware allocation</p>
                                </div>
                                <button onClick={() => setCalcInputs(p => ({ ...p, hives: [...p.hives, { frameCount: 8, isStrong: true, isLarge: false }] }))} className={cn(glass.btnSecondary, "h-9 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border-[#1B9157]/10")}>
                                    <Plus className="w-3.5 h-3.5" /> Initialize_Unit
                                </button>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {calcInputs.hives.map((h, i) => (
                                    <div key={i} className={cn(glass.card, "p-4 space-y-4 bg-white/60 border-white/40 group relative rounded-2xl shadow-sm hover:shadow-md transition-all")}>
                                        <button
                                            onClick={() => setCalcInputs(p => ({ ...p, hives: p.hives.filter((_, idx) => idx !== i) }))}
                                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-white rounded-lg shadow-lg border border-red-100 text-red-500 hover:bg-red-500 hover:text-white z-10"
                                            aria-label={`Remove unit ${i + 1}`}
                                            title={`Remove unit ${i + 1}`}
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <p className="text-[8px] font-black text-[#1A1A1A]/20 uppercase tracking-[0.2em]">UNIT_TRONIX_#{i+1}</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-2xl font-black text-[#1A1A1A] tracking-tighter tabular-nums">{h.frameCount}</p>
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">FR_CAP</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { const nh = [...calcInputs.hives]; nh[i].isStrong = !nh[i].isStrong; setCalcInputs(p => ({ ...p, hives: nh })); }} 
                                                className={cn("flex-1 h-7 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border outline-none", h.isStrong ? "bg-[#1B9157] border-[#1B9157] text-white shadow-sm" : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50")}>Nominal</button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </motion.div>
                )}

                {activeSubPage === 'map' && (
                    <motion.div key="map" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
                        <div className={cn(glass.card, "p-4 flex items-center justify-between border-white/40 shadow-sm")}>
                             <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-100 bg-white shadow-sm">
                                    <MapIcon className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className={glass.sectionTitle}>SPATIAL_TELEMETRY</h3>
                                    <p className={glass.microLabel}>Sector_Alignment: Alpha_01</p>
                                </div>
                             </div>
                             <div className="flex gap-3">
                                <button onClick={handleOptimize} disabled={isOptimizing} className={cn(glass.btnSecondary, "h-9 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all")}>
                                    {isOptimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} 
                                    <span>SYNC_MATRIX</span>
                                </button>
                                {optimalPlacements.length > 0 && (
                                    <button onClick={handleCommitTasks} disabled={isSaving} className={cn(glass.btnPrimary, "h-9 px-5 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl flex items-center gap-2 shadow-xl shadow-[#1B9157]/10")}>
                                        DEPLOY_FLEET
                                    </button>
                                )}
                             </div>
                        </div>
                        <div className={cn(glass.card, "h-[600px] p-0 overflow-hidden relative border-white/40 shadow-2xl rounded-[3rem] z-0 bg-gray-50")}>
                            <MapContainer center={[-1.285, 36.825] as any} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} className="z-0">
                                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; ESRI" />
                                <Polygon positions={mockOrchardPolygon as any} pathOptions={{ color: '#1B9157', weight: 4, fillOpacity: 0.1, dashArray: '10, 10' }} stroke={false} />
                                {optimalPlacements.map((pos, idx) => (
                                    <React.Fragment key={idx}>
                                        <Marker position={[pos.lat, pos.lng] as any}>
                                            <Popup className="custom-popup"><p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">TACTICAL_NODE_#{idx+1}</p></Popup>
                                        </Marker>
                                        <Circle center={[pos.lat, pos.lng] as any} radius={pos.coverage_radius_km * 1000} pathOptions={{ color: '#F4D03F', weight: 1, fillOpacity: 0.1, dashArray: '5, 5' }} />
                                    </React.Fragment>
                                ))}
                            </MapContainer>
                        </div>
                    </motion.div>
                )}

                {activeSubPage === 'reports' && (
                    <motion.div key="reports" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {[
                                { title: 'Bloom_Saturation_Flux', icon: Terminal, color: 'text-[#1B9157]', val: '92.4%', label: 'PEAK_INDEX' },
                                { title: 'Fleet_Efficiency_Audit', icon: Activity, color: 'text-[#1A1A1A]', val: '45', label: 'NODES_DEPLOYED' }
                            ].map((r, i) => (
                                <div key={i} className={cn(glass.card, "p-0 overflow-hidden border-white/40 shadow-sm")}>
                                    <div className="p-4 border-b border-[#1B9157]/5 flex justify-between items-center bg-white/50">
                                        <h4 className={glass.sectionTitle}>{r.title}</h4>
                                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                                            <r.icon className={cn("w-3.5 h-3.5", r.color)} />
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-8">
                                        <div className="flex justify-between items-end border-b border-[#1B9157]/5 pb-4">
                                            <span className={glass.microLabel}>Protocol_Consensus</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className={cn("text-3xl font-black tracking-tighter", r.color)}>{r.val}</span>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{r.label}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleExport(r.title)} className={cn(glass.btnSecondary, "w-full h-10 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-2 group")}>
                                            <FileDown className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" /> 
                                            <span>SYNC_LOG</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={cn(glass.card, "p-0 bg-white/40 border-[#1B9157]/10 overflow-hidden shadow-xl")}>
                            <div className="p-5 border-b border-[#1B9157]/10 bg-[#1B9157]/[0.02] flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-[#1A1A1A] tracking-[0.3em] uppercase">Deployment_History_Chain</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#1B9157] shadow-sm shadow-[#1B9157]/50 animate-pulse" />
                                    <span className="text-[9px] font-black text-[#1B9157] uppercase tracking-widest">{deployments.length} BYTES_LOGGED</span>
                                </div>
                            </div>
                            <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto thin-scrollbar">
                                {deployments.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20">
                                        <div className="w-14 h-14 rounded-3xl bg-gray-100 flex items-center justify-center">
                                            <Terminal className="w-7 h-7" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">REGISTRY_NULL</span>
                                    </div>
                                ) : (
                                    deployments.map((d, i) => (
                                        <div key={i} className="flex items-center gap-6 p-4 rounded-2xl border border-[#1B9157]/10 bg-white/40 hover:bg-white hover:border-[#1B9157]/30 transition-all group cursor-default">
                                            <span className="text-[10px] font-black text-[#1B9157] w-24 tabular-nums tracking-tighter">{new Date(d.created_at).toLocaleDateString()}</span>
                                            <div className="flex-1 flex items-baseline gap-3">
                                                <span className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-tight group-hover:text-[#1B9157] transition-colors">{d.field_name}</span>
                                                <span className="text-[9px] font-bold text-gray-400 tabular-nums uppercase tracking-widest">{d.total_acres} AC_NET</span>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-[#1B9157]/10 group-hover:bg-[#1B9157] group-hover:shadow-sm group-hover:shadow-[#1B9157]/50 transition-all" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-popup .leaflet-popup-content-wrapper { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); border-radius: 8px; border: 1px solid #E5E7EB; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
                .custom-popup .leaflet-popup-tip { background: rgba(255, 255, 255, 0.95); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
            `}</style>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default PrecisionPollinationView;
