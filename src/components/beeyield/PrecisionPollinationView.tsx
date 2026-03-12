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
import beeyieldService, { IoTDevice, SensorReading } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { calculatePollinationMetrics, CalculationInputs } from '@/lib/pollinationCalculations';
import { glass, PageHeader } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
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

    // Mock orchard bounding box in Kenya (-1.29, 36.82)
    const mockOrchardPolygon = [
        [-1.29, 36.82],
        [-1.29, 36.83],
        [-1.28, 36.83],
        [-1.28, 36.82]
    ];
    // Converting lat/lng pairs to GeoJSON 
    const mockGeoJSON = {
        type: "FeatureCollection",
        features: [{
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [36.82, -1.29],
                    [36.83, -1.29],
                    [36.83, -1.28],
                    [36.82, -1.28],
                    [36.82, -1.29]
                ]]
            },
            properties: {}
        }]
    };

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
                orchard_geojson: mockGeoJSON,
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Target}
                label="Tactical Kernel"
                title={<>Precision <span className="text-[#1B9157]">Pollination</span></>}
                subtitle="High-fidelity farm mapping and deployment protocols for optimized field density."
                actions={
                    !activeSubPageOverride && (
                        <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200 gap-1 overflow-x-auto custom-scrollbar shadow-sm">
                            {subPageOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setActiveSubPage(opt.id as SubPage)}
                                    className={cn(
                                        "h-8 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2",
                                        activeSubPage === opt.id
                                            ? "bg-white text-[#1A1A1A] shadow-sm"
                                            : "text-gray-500 hover:text-[#1A1A1A] hover:bg-white/50"
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className={cn(glass.card, "lg:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden bg-white")}>
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#1B9157]/5 blur-3xl rounded-full pointer-events-none" />
                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B9157]">Kernel_Status: Active</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Farm Overview</h2>
                                    <p className="text-[11px] font-medium text-gray-500 leading-relaxed max-w-lg border-l-2 border-[#1B9157]/30 pl-3">
                                        Continuous field analysis and real-time fleet synchronization. Monitor colony distribution and bloom saturation vectors in high-fidelity.
                                    </p>
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-8 relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Active Nodes</p>
                                        <p className="text-2xl font-bold">{devices.length}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Saturation</p>
                                        <p className="text-2xl font-bold text-[#1B9157]">98%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className={cn(glass.card, "p-4 bg-[#F9F7F2] border-[#F4D03F]/20 flex items-center justify-between")}>
                                   <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Bloom Index</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-bold tracking-tight text-[#1A1A1A]">72%</p>
                                            <span className="text-[10px] font-medium text-gray-400">ALMOND</span>
                                        </div>
                                   </div>
                                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                        <Zap className="w-5 h-5 text-[#F4D03F]" />
                                   </div>
                                </div>
                                <div className={cn(glass.card, "p-4 bg-emerald-50/50 border-emerald-100 flex items-center justify-between")}>
                                   <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Activity Factor</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-bold tracking-tight text-[#1B9157]">8.4</p>
                                            <span className="text-[10px] font-medium text-gray-400">HIGH</span>
                                        </div>
                                   </div>
                                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                        <Activity className="w-5 h-5 text-[#1B9157]" />
                                   </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {subPageOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setActiveSubPage(opt.id as SubPage)}
                                    className={cn(glass.card, "p-5 flex flex-col items-center justify-center text-center gap-3 group hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer")}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm group-hover:bg-[#1B9157]/10 transition-colors">
                                        <opt.icon className="w-5 h-5 text-gray-400 group-hover:text-[#1B9157] transition-colors" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-[#1A1A1A]">{opt.label}</p>
                                        <p className="text-[10px] font-medium text-gray-500">Access Protocol</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeSubPage === 'grid' && (
                    <motion.div key="grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search nodes..."
                                    className={cn(glass.input, "h-11 pl-11 text-xs font-bold")}
                                />
                            </div>
                            <div className={cn(glass.card, "p-2 h-[400px] overflow-y-auto custom-scrollbar bg-gray-50")}>
                                <div className="space-y-2">
                                    {filteredDevices.map(device => (
                                        <button
                                            key={device.id}
                                            onClick={() => setSelectedDeviceId(device.id)}
                                            className={cn(
                                                "w-full p-3 rounded-xl border flex items-center justify-between transition-all outline-none",
                                                selectedDeviceId === device.id ? "bg-white border-[#1B9157]/30 shadow-sm" : "bg-white/50 border-transparent hover:bg-white hover:border-gray-200"
                                            )}
                                        >
                                            <div className="text-left space-y-0.5">
                                                <p className={cn("text-xs font-bold", selectedDeviceId === device.id ? "text-[#1B9157]" : "text-[#1A1A1A]")}>{device.device_code}</p>
                                                <p className="text-[10px] font-medium text-gray-500 truncate w-32">{device.location_name || 'UNDEFINED'}</p>
                                            </div>
                                            <div className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase", device.status === 'active' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100")}>
                                                {device.status}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-4">
                            <div className={cn(glass.card, "p-0 aspect-video relative overflow-hidden bg-white border-gray-200")}>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent)]" />
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                                {selectedDevice && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="relative">
                                            <div className="absolute inset-0 w-24 h-24 border border-[#1B9157] rounded-full animate-ping opacity-20" />
                                            <div className="w-8 h-8 rounded-full bg-[#1B9157] border-4 border-white shadow-xl relative z-10" />
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap">
                                                <div className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-[#1B9157] shadow-sm" />
                                                    <span className="text-xs font-bold text-[#1A1A1A]">{selectedDevice.device_code}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedDevice && (
                                <div className="grid grid-cols-3 gap-4">
                                   {[
                                       { icon: Thermometer, label: 'Thermex', val: '24.5', unit: '°C' },
                                       { icon: Droplets, label: 'Hydro', val: '62', unit: '%' },
                                       { icon: Signal, label: 'Signal', val: '98', unit: '%' }
                                   ].map((s, idx) => (
                                       <div key={idx} className={cn(glass.card, "p-4 flex flex-col gap-3 bg-white")}>
                                          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-100 bg-gray-50">
                                             <s.icon className="w-4 h-4 text-gray-500" />
                                          </div>
                                          <div className="space-y-0.5">
                                             <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{s.label}</p>
                                             <div className="flex items-baseline gap-1">
                                                <p className="text-xl font-bold text-[#1A1A1A] tracking-tight">{s.val}</p>
                                                <span className="text-[10px] font-medium text-gray-400">{s.unit}</span>
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
                    <motion.div key="calcs" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className={cn(glass.card, "p-0 space-y-0 bg-white overflow-hidden")}>
                                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Parameters</h3>
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                        <Calculator className="w-4 h-4 text-[#F4D03F]" />
                                    </div>
                                </div>
                                <div className="p-5 space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Acres</label>
                                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                                            <button onClick={() => setCalcInputs(p => ({ ...p, totalAcres: Math.max(1, p.totalAcres - 5) }))} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] hover:bg-white rounded-lg transition-colors"><Minus className="w-4 h-4"/></button>
                                            <div className="flex-1 flex items-center justify-center text-lg font-bold text-[#1A1A1A]">{calcInputs.totalAcres}</div>
                                            <button onClick={() => setCalcInputs(p => ({ ...p, totalAcres: p.totalAcres + 5 }))} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] hover:bg-white rounded-lg transition-colors"><Plus className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                            <span className="text-gray-500">Bloom Intensity</span>
                                            <span className="text-[#1B9157]">{Math.round(calcInputs.bloomIntensity * 100)}%</span>
                                        </div>
                                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <input type="range" min="0.1" max="1.0" step="0.1" value={calcInputs.bloomIntensity} onChange={e => setCalcInputs(p => ({ ...p, bloomIntensity: parseFloat(e.target.value) }))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            <div className="absolute top-0 left-0 h-full bg-[#1B9157] rounded-full pointer-events-none" style={{ width: `${calcInputs.bloomIntensity * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                            <span className="text-gray-500">Forage Competition</span>
                                            <span className="text-[#F4D03F]">{Math.round(calcInputs.forageCondition * 100)}%</span>
                                        </div>
                                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <input type="range" min="0.1" max="1.0" step="0.1" value={calcInputs.forageCondition} onChange={e => setCalcInputs(p => ({ ...p, forageCondition: parseFloat(e.target.value) }))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            <div className="absolute top-0 left-0 h-full bg-[#F4D03F] rounded-full pointer-events-none" style={{ width: `${calcInputs.forageCondition * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                   <div className={cn(glass.card, "p-4 bg-white border-l-2 border-l-gray-300 space-y-1")}>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Frames</p>
                                      <p className="text-3xl font-bold tracking-tight text-[#1A1A1A]">{metrics.totalFrames}</p>
                                   </div>
                                   <div className={cn(glass.card, "p-4 bg-[#F9F7F2] border-l-2 border-l-[#F4D03F] space-y-1")}>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Effective Force</p>
                                      <p className="text-3xl font-bold tracking-tight text-[#1A1A1A]">{metrics.effectiveFrames}</p>
                                   </div>
                                </div>
                                <div className={cn(glass.card, "p-4 grid grid-cols-3 gap-4 bg-white")}>
                                   {[
                                       { l: 'FPA', v: metrics.framesPerAcre, c: 'text-[#1A1A1A]' },
                                       { l: 'Eff FPA', v: metrics.effectiveFPA, c: 'text-[#1B9157]' },
                                       { l: 'Efficacy', v: metrics.pollinationEfficacy + '%', c: 'text-[#1A1A1A]' }
                                   ].map((m, i) => (
                                       <div key={i} className="text-center space-y-1">
                                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{m.l}</p>
                                          <p className={cn("text-xl font-bold tracking-tight", m.c)}>{m.v}</p>
                                       </div>
                                   ))}
                                </div>
                                <button onClick={handleSaveDeployment} disabled={isSaving} className={cn(glass.btnPrimary, "w-full h-11 text-xs font-bold shadow-sm")}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Archiving Fleet Data
                                </button>
                            </div>
                        </div>

                        <div className={cn(glass.card, "p-5 bg-white space-y-4")}>
                             <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Colony Inventory</h3>
                                <button onClick={() => setCalcInputs(p => ({ ...p, hives: [...p.hives, { frameCount: 8, isStrong: true, isLarge: false }] }))} className={cn(glass.btnSecondary, "h-8 px-3 rounded-lg text-xs font-bold")}>
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Unit
                                </button>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {calcInputs.hives.map((h, i) => (
                                    <div key={i} className={cn(glass.card, "p-3 space-y-3 bg-gray-50 border border-gray-100 group relative")}>
                                        <button onClick={() => setCalcInputs(p => ({ ...p, hives: p.hives.filter((_, idx) => idx !== i) }))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-md shadow-sm border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 z-10"><Minus className="w-3 h-3"/></button>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Node #{i+1}</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-xl font-bold text-[#1A1A1A] tracking-tight">{h.frameCount}</p>
                                            <span className="text-[10px] font-medium text-gray-400">FR</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { const nh = [...calcInputs.hives]; nh[i].isStrong = !nh[i].isStrong; setCalcInputs(p => ({ ...p, hives: nh })); }} 
                                                className={cn("flex-1 h-7 rounded-md text-[10px] font-bold uppercase transition-all border outline-none", h.isStrong ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50")}>Strong</button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </motion.div>
                )}

                {activeSubPage === 'map' && (
                    <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className={cn(glass.card, "p-4 flex items-center justify-between bg-white/90 backdrop-blur-sm")}>
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#F9F7F2] flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                    <MapIcon className="w-5 h-5 text-[#F4D03F]" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-[#1A1A1A] tracking-tight">Spatial Kernel</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Max FPI Alignment</p>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={handleOptimize} disabled={isOptimizing} className={cn(glass.btnSecondary, "h-9 px-4 text-xs font-bold")}>
                                    {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />} Optimize
                                </button>
                                {optimalPlacements.length > 0 && <button onClick={handleCommitTasks} disabled={isSaving} className={cn(glass.btnPrimary, "h-9 px-4 text-xs font-bold")}>Commit</button>}
                             </div>
                        </div>
                        <div className={cn(glass.card, "h-[500px] p-0 overflow-hidden relative border-gray-200 z-0 bg-gray-50")}>
                            <MapContainer center={[-1.285, 36.825] as any} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} className="z-0">
                                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; ESRI" />
                                <Polygon positions={mockOrchardPolygon as any} pathOptions={{ color: '#1B9157', weight: 2, fillOpacity: 0.1 }} />
                                {optimalPlacements.map((pos, idx) => (
                                    <React.Fragment key={idx}>
                                        <Marker position={[pos.lat, pos.lng] as any}>
                                            <Popup className="custom-popup"><p className="text-xs font-bold text-[#1A1A1A]">Unit #{idx+1}</p></Popup>
                                        </Marker>
                                        <Circle center={[pos.lat, pos.lng] as any} radius={pos.coverage_radius_km * 1000} pathOptions={{ color: '#F4D03F', weight: 1, fillOpacity: 0.1, dashArray: '4, 4' }} />
                                    </React.Fragment>
                                ))}
                            </MapContainer>
                        </div>
                    </motion.div>
                )}

                {activeSubPage === 'reports' && (
                    <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: 'Bloom Saturation', icon: Terminal, color: 'text-[#1B9157]', val: '92.4%', label: 'PEAK' },
                                { title: 'Efficiency Audit', icon: Activity, color: 'text-[#1A1A1A]', val: '45', label: 'NODES' }
                            ].map((r, i) => (
                                <div key={i} className={cn(glass.card, "p-0 overflow-hidden bg-white")}>
                                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                        <h4 className="text-sm font-bold text-[#1A1A1A] tracking-tight">{r.title}</h4>
                                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                                            <r.icon className={cn("w-4 h-4", r.color)} />
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-5">
                                        <div className="flex justify-between items-end border-b border-gray-100 pb-3">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Metric Consensus</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className={cn("text-2xl font-bold tracking-tight", r.color)}>{r.val}</span>
                                                <span className="text-[10px] font-medium text-gray-400 uppercase">{r.label}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleExport(r.title)} className={cn(glass.btnSecondary, "w-full h-10 text-xs font-bold bg-gray-50 border-gray-200")}>
                                            <FileDown className="w-4 h-4 mr-2" /> Export Archive
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={cn(glass.card, "p-0 bg-white")}>
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Deployment Log</h3>
                            </div>
                            <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {deployments.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                                            <Terminal className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Registry Empty</span>
                                    </div>
                                ) : (
                                    deployments.map((d, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-colors">
                                            <span className="text-xs font-bold text-[#1B9157] w-24">{new Date(d.created_at).toLocaleDateString()}</span>
                                            <div className="flex-1 flex items-baseline gap-2">
                                                <span className="text-sm font-bold text-[#1A1A1A]">{d.field_name}</span>
                                                <span className="text-[10px] font-medium text-gray-500">{d.total_acres} AC</span>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
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
    );
};

export default PrecisionPollinationView;
