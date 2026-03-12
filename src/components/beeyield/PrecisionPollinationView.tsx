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
import { glass } from './GlassTheme';
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
            toast.success(`Successfully committed ${optimalPlacements.length} deployment tasks to field teams.`);
            setActiveSubPage('reports'); // Redirect to reports or something to see the log
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
            toast.success(`Generated ${results.length} optimal hive placements.`);
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

    const latestReading = deviceReadings[0];

    const subPageOptions = [
        { id: 'grid', label: 'Map Grid', icon: Layers },
        { id: 'calcs', label: 'Hive Calculator', icon: Calculator },
        { id: 'map', label: 'Bee Flight Map', icon: Navigation },
        { id: 'reports', label: 'Farm Reports', icon: FileBarChart }
    ];

    return (
        <div className={cn(glass.page, "p-8 -m-8 min-h-screen")}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20')}>
                        <Target className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-[0.1em]">Precision Deployment</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                            Precision <span className="text-honey">Pollination</span>
                        </h1>
                    </div>
                    <p className={cn(glass.microLabel, 'opacity-70 normal-case italic font-bold')}>
                        Professional Farm Mapping & Execution
                    </p>
                </div>

                {!activeSubPageOverride && (
                    <div className={cn(glass.filterBar, "p-1.5 bg-muted/40 shadow-inner overflow-hidden mb-2")}>
                        {subPageOptions.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setActiveSubPage(opt.id as SubPage)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                    activeSubPage === opt.id
                                        ? "bg-white text-foreground shadow-sm scale-100"
                                        : "text-muted-foreground hover:bg-gray-50:bg-white/5 scale-95 hover:scale-100"
                                )}
                            >
                                <opt.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sub-Page Content Area */}
            <AnimatePresence mode="wait">
                {activeSubPage === 'home' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className={cn(glass.card, "lg:col-span-2 p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden")}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center gap-4 text-emerald-500">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        <span className={cn(glass.microLabel, "text-emerald-600 font-bold")}>System Status: Active</span>
                                    </div>
                                    <h2 className={cn(glass.sectionTitle, "text-5xl leading-[1.1]")}>
                                        Farm <br /> <span className="text-emerald-500">Overview</span>
                                    </h2>
                                    <p className={cn(glass.microLabel, "normal-case text-muted-foreground opacity-90 max-w-lg leading-relaxed text-sm")}>
                                        See your hives, flowering status, and farm data in one place. Monitor your fleet across the yard in real-time.
                                    </p>
                                </div>
                                <div className="pt-8 mt-8 flex flex-wrap items-center gap-12 border-t border-border/50 relative z-10">
                                    <div>
                                        <p className={cn(glass.microLabel, "opacity-60 mb-2 font-bold")}>Active Sensors</p>
                                        <p className={cn(glass.sectionTitle, "text-4xl tabular-nums")}>{devices.length}</p>
                                    </div>
                                    <div>
                                        <p className={cn(glass.microLabel, "opacity-60 mb-2 font-bold")}>Active Hives</p>
                                        <p className={cn(glass.sectionTitle, "text-4xl tabular-nums text-emerald-500")}>98%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className={cn(glass.card, "p-8 shadow-lg relative overflow-hidden bg-honey/10 border-honey/20")}>
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-honey/10 to-transparent pointer-events-none" />
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <Zap className="w-5 h-5 text-amber-500" />
                                        <span className={cn(glass.microLabel, "text-amber-700 font-bold")}>Flower Coverage</span>
                                    </div>
                                    <p className={cn(glass.sectionTitle, "text-5xl tabular-nums mb-2 relative z-10")}>72%</p>
                                    <p className={cn(glass.microLabel, "opacity-60 normal-case italic font-semibold relative z-10")}>Variety: Nonpareil Almond</p>
                                </div>

                                <div className={cn(glass.card, "p-8 shadow-lg relative overflow-hidden bg-emerald-500/5 border-emerald-500/20")}>
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <Activity className="w-5 h-5 text-emerald-500" />
                                        <span className={cn(glass.microLabel, "text-emerald-700 font-bold")}>Activity Index</span>
                                    </div>
                                    <p className={cn(glass.sectionTitle, "text-5xl tabular-nums mb-2 text-emerald-600 relative z-10")}>8.4</p>
                                    <p className={cn(glass.microLabel, "opacity-60 normal-case italic font-semibold relative z-10")}>High Intensity Detected</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { id: 'bloom-tracking', label: 'Status', icon: Zap, desc: 'Field Analysis', external: true },
                                { id: 'grid', label: 'Map Grid', icon: Layers, desc: 'Sensor Map', external: false },
                                { id: 'calcs', label: 'Calculators', icon: Calculator, desc: 'Bee Math', external: false },
                                { id: 'map', label: 'Flight Map', icon: Navigation, desc: 'Flight Paths', external: false },
                            ].map(module => (
                                <button
                                    key={module.id}
                                    onClick={() => module.external ? onTabChange(module.id) : setActiveSubPage(module.id as SubPage)}
                                    className={cn(glass.card, "p-8 text-left transition-all duration-300 space-y-4 group hover:shadow-xl hover:-translate-y-1 hover:border-honey/40")}
                                >
                                    <div className="w-12 h-12 rounded-[1.5rem] bg-muted/50 flex items-center justify-center border border-border group-hover:bg-honey group-hover:text-white transition-colors duration-300 shadow-sm">
                                        <module.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className={cn(glass.sectionTitle, "text-xl normal-case")}>{module.label}</h4>
                                        <p className={cn(glass.microLabel, "opacity-60 normal-case italic mt-1")}>{module.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeSubPage === 'grid' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Hexagon className="w-6 h-6 text-emerald-500" />
                                <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Active Nodes</h3>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search nodes..."
                                    className={cn("w-full h-12 rounded-xl pl-12 pr-4 bg-white/40 border border-border focus:ring-2 focus:ring-honey/50 outline-none transition-all shadow-inner", glass.microLabel, "normal-case font-semibold")}
                                />
                            </div>
                            <div className={cn(glass.card, "p-2 overflow-hidden h-[600px] flex flex-col")}>
                                <div className="overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2">
                                    <div className="space-y-2 pb-2">
                                        {filteredDevices.map(device => (
                                            <button
                                                key={device.id}
                                                onClick={() => setSelectedDeviceId(device.id)}
                                                className={cn(
                                                    "w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center justify-between group border",
                                                    selectedDeviceId === device.id
                                                        ? "bg-emerald-500/10 border-emerald-500/30 shadow-sm"
                                                        : "bg-white/40 border-transparent hover:bg-muted/50 hover:border-border/50"
                                                )}
                                            >
                                                <div className="space-y-1">
                                                    <p className={cn(glass.microLabel, "font-bold", selectedDeviceId === device.id ? "text-emerald-700" : "")}>
                                                        {device.device_code}
                                                    </p>
                                                    <p className={cn(glass.microLabel, "normal-case text-[10px] opacity-60")}>
                                                        {device.location_name || 'N/A'}
                                                    </p>
                                                </div>
                                                <div className={cn(
                                                    glass.badge, "px-3 py-1 font-bold border-transparent shadow-none",
                                                    device.status === 'active'
                                                        ? (selectedDeviceId === device.id ? "bg-emerald-500 text-white" : "bg-emerald-500/20 text-emerald-700")
                                                        : "bg-red-500/20 text-red-700"
                                                )}>
                                                    {device.status}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <div className={cn(glass.card, "p-0 aspect-video relative overflow-hidden flex-1 min-h-[400px]")}>
                                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                    <MapIcon className="w-1/3 h-1/3" />
                                </div>
                                {selectedDevice && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="relative">
                                            <div className="absolute inset-0 w-24 h-24 border border-emerald-500 rounded-full animate-ping opacity-30" />
                                            <div className="absolute inset-0 w-32 h-32 border border-emerald-500 rounded-full animate-ping opacity-10" style={{ animationDelay: '500ms' }} />

                                            <div className="w-8 h-8 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] border-4 border-white flex items-center justify-center relative z-10" />

                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap z-20">
                                                <div className={cn(glass.card, "py-2 px-4 shadow-xl border-emerald-500/30 flex items-center gap-2")}>
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <p className={cn(glass.microLabel, "font-bold text-emerald-700")}>{selectedDevice.device_code}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedDevice && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className={cn(glass.card, "p-6 flex flex-col items-start gap-4")}>
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Thermometer className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <span className={cn(glass.microLabel, "opacity-70 normal-case mb-1 block")}>Temperature</span>
                                            <h4 className={cn(glass.sectionTitle, "text-3xl tracking-tight")}>24.5<span className="text-xl text-muted-foreground ml-1">°C</span></h4>
                                        </div>
                                    </div>
                                    <div className={cn(glass.card, "p-6 flex flex-col items-start gap-4")}>
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Droplets className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <span className={cn(glass.microLabel, "opacity-70 normal-case mb-1 block")}>Humidity</span>
                                            <h4 className={cn(glass.sectionTitle, "text-3xl tracking-tight")}>62<span className="text-xl text-muted-foreground ml-1">%</span></h4>
                                        </div>
                                    </div>
                                    <div className={cn(glass.card, "p-6 flex flex-col items-start gap-4")}>
                                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                            <Signal className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <span className={cn(glass.microLabel, "opacity-70 normal-case mb-1 block")}>Signal Strength</span>
                                            <h4 className={cn(glass.sectionTitle, "text-3xl tracking-tight")}>98<span className="text-xl text-muted-foreground ml-1">%</span></h4>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeSubPage === 'calcs' && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <div className={cn(glass.card, "p-8 space-y-8 shadow-xl")}>
                                    <div className="flex items-center gap-4 mb-2">
                                        <Calculator className="w-6 h-6 text-honey" />
                                        <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Parameters</h3>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className={cn(glass.microLabel, "font-bold opacity-80 block")}>Total Area (Acres)</label>
                                            <div className="flex items-center bg-white/40 rounded-2xl border border-border p-1">
                                                <button
                                                    onClick={() => setCalcInputs(prev => ({ ...prev, totalAcres: Math.max(1, prev.totalAcres - 5) }))}
                                                    className={cn(glass.btnSecondary, "w-12 h-12 rounded-xl p-0 shrink-0 border-transparent shadow-none hover:bg-muted/80")}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <div className={cn(glass.sectionTitle, "flex-1 text-center text-3xl tabular-nums")}>
                                                    {calcInputs.totalAcres}
                                                </div>
                                                <button
                                                    onClick={() => setCalcInputs(prev => ({ ...prev, totalAcres: prev.totalAcres + 5 }))}
                                                    className={cn(glass.btnSecondary, "w-12 h-12 rounded-xl p-0 shrink-0 border-transparent shadow-none hover:bg-muted/80")}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className={cn(glass.microLabel, "font-bold opacity-80 block")}>Bloom Intensity (0.1 - 1.0)</label>
                                            <div className="relative pt-2 pb-6">
                                                <input
                                                    type="range"
                                                    min="0.1"
                                                    max="1.0"
                                                    step="0.1"
                                                    value={calcInputs.bloomIntensity}
                                                    onChange={(e) => setCalcInputs(prev => ({ ...prev, bloomIntensity: parseFloat(e.target.value) }))}
                                                    className="w-full appearance-none h-2 bg-muted rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-lg cursor-pointer transition-all"
                                                />
                                                <div className="absolute bottom-0 inset-x-0 flex justify-between font-bold text-[10px] uppercase opacity-60">
                                                    <span>Low</span>
                                                    <span className="text-emerald-500 opacity-100">{Math.round(calcInputs.bloomIntensity * 100)}%</span>
                                                    <span>Peak</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className={cn(glass.microLabel, "font-bold opacity-80 block")}>Forage Competition</label>
                                            <div className="relative pt-2 pb-6">
                                                <input
                                                    type="range"
                                                    min="0.1"
                                                    max="1.0"
                                                    step="0.1"
                                                    value={calcInputs.forageCondition}
                                                    onChange={(e) => setCalcInputs(prev => ({ ...prev, forageCondition: parseFloat(e.target.value) }))}
                                                    className="w-full appearance-none h-2 bg-muted rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-honey [&::-webkit-slider-thumb]:shadow-lg cursor-pointer transition-all"
                                                />
                                                <div className="absolute bottom-0 inset-x-0 flex justify-between font-bold text-[10px] uppercase opacity-60">
                                                    <span>High Comp</span>
                                                    <span className="text-honey opacity-100">{Math.round(calcInputs.forageCondition * 100)}%</span>
                                                    <span>Clear Sky</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 flex flex-col gap-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={cn(glass.card, "p-8 space-y-4 shadow-md bg-white/60")}>
                                        <p className={cn(glass.microLabel, "opacity-70 font-bold")}>Total Frames Deployed</p>
                                        <h4 className={cn(glass.sectionTitle, "text-5xl lg:text-6xl tabular-nums tracking-tight")}>{metrics.totalFrames}</h4>
                                        <div className={cn(glass.badge, "border-transparent bg-muted/50 px-3 py-1")}>
                                            <div className="w-2 h-2 rounded-full bg-foreground/30 mr-2" />
                                            Standard Count
                                        </div>
                                    </div>
                                    <div className={cn(glass.card, "p-8 space-y-4 shadow-lg border-honey/30 bg-honey/5 overflow-hidden relative")}>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                                        <p className={cn(glass.microLabel, "text-amber-700 font-bold relative z-10")}>Effective Frames <span className="opacity-60 font-semibold italic">(Bee Math™)</span></p>
                                        <h4 className={cn(glass.sectionTitle, "text-5xl lg:text-6xl tabular-nums tracking-tight relative z-10")}>{metrics.effectiveFrames}</h4>
                                        <div className={cn(glass.badge, "border-amber-500/30 bg-white/50 backdrop-blur-md px-3 py-1 relative z-10")}>
                                            <Zap className="w-3.5 h-3.5 text-amber-500 mr-2 fill-amber-500/20" />
                                            <span className="text-amber-700 font-bold">Adjusted Force</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={cn(glass.card, "p-8 grid grid-cols-1 sm:grid-cols-3 gap-8 shadow-xl")}>
                                    <div className="space-y-2">
                                        <p className={cn(glass.microLabel, "font-bold opacity-60")}>Frames Per Acre (FPA)</p>
                                        <div className={cn(glass.sectionTitle, "text-4xl tabular-nums")}>{metrics.framesPerAcre}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className={cn(glass.microLabel, "font-bold text-emerald-500/80")}>Effective FPA</p>
                                        <div className={cn(glass.sectionTitle, "text-4xl tabular-nums text-emerald-500")}>{metrics.effectiveFPA}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className={cn(glass.microLabel, "font-bold opacity-60")}>Efficacy Index</p>
                                        <div className={cn(glass.sectionTitle, "text-4xl tabular-nums")}>{metrics.pollinationEfficacy}<span className="text-2xl text-muted-foreground ml-1">%</span></div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveDeployment}
                                    disabled={isSaving}
                                    className={cn(glass.btnPrimary, "w-full h-16 text-sm uppercase tracking-widest mt-auto")}
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                                    Save Fleet Data
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                                <h3 className={cn(glass.sectionTitle, "text-3xl normal-case")}>Colony Inventory <span className="opacity-40 italic font-semibold text-2xl normal-case">&</span> Logic</h3>
                                <button
                                    onClick={() => setCalcInputs(prev => ({
                                        ...prev,
                                        hives: [...prev.hives, { frameCount: 8, isStrong: true, isLarge: false }]
                                    }))}
                                    className={cn(glass.btnSecondary, "h-10 px-6 rounded-xl")}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Unit
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <AnimatePresence>
                                    {calcInputs.hives.map((hive, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            key={idx}
                                            className={cn(glass.card, "p-6 space-y-5 relative group hover:border-border/80 transition-all")}
                                        >
                                            <button
                                                onClick={() => setCalcInputs(prev => ({ ...prev, hives: prev.hives.filter((_, i) => i !== idx) }))}
                                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-gray-900"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>

                                            <div className={cn(glass.microLabel, "normal-case italic font-semibold opacity-60")}>Unit #{idx + 1}</div>

                                            <div className="flex items-center justify-between">
                                                <span className={cn(glass.sectionTitle, "text-3xl")}>{hive.frameCount} <span className="text-sm text-muted-foreground ml-1">FR</span></span>
                                                <div className="flex gap-1.5 opacity-80">
                                                    {[...Array(hive.frameCount > 10 ? 10 : hive.frameCount)].map((_, i) => (
                                                        <div key={i} className={cn("w-1.5 h-6 rounded-sm", hive.isStrong ? "bg-emerald-500" : "bg-honey")} />
                                                    ))}
                                                    {hive.frameCount > 10 && <div className="text-[10px] font-black self-end">+</div>}
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={() => {
                                                        const newHives = [...calcInputs.hives];
                                                        newHives[idx].isStrong = !newHives[idx].isStrong;
                                                        setCalcInputs(prev => ({ ...prev, hives: newHives }));
                                                    }}
                                                    className={cn(
                                                        "flex-1 py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                                                        hive.isStrong ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "bg-white/40 text-muted-foreground border-border hover:bg-muted"
                                                    )}
                                                >
                                                    Strong
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newHives = [...calcInputs.hives];
                                                        newHives[idx].isLarge = !newHives[idx].isLarge;
                                                        setCalcInputs(prev => ({ ...prev, hives: newHives }));
                                                    }}
                                                    className={cn(
                                                        "flex-1 py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                                                        hive.isLarge ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-white/40 text-muted-foreground border-border hover:bg-muted"
                                                    )}
                                                >
                                                    Large
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}

                {
                    activeSubPage === 'map' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className={cn(glass.card, "p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 shadow-sm")}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-honey/10 flex items-center justify-center border border-honey/20">
                                        <MapIcon className="w-5 h-5 text-honey" />
                                    </div>
                                    <div>
                                        <h3 className={cn(glass.sectionTitle, "text-xl normal-case placeholder-transparent")}>Spatial Optimizer</h3>
                                        <p className={cn(glass.microLabel, "text-emerald-600 font-bold")}>Algorithms driving maximum FPI.</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={handleOptimize}
                                        disabled={isOptimizing}
                                        className={cn(glass.btnSecondary, "flex-1 sm:flex-none border-honey/20 hover:border-honey hover:text-honey bg-white/50")}
                                    >
                                        {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                        Run Optimizer
                                    </button>
                                    {optimalPlacements.length > 0 && (
                                        <button
                                            onClick={handleCommitTasks}
                                            disabled={isSaving}
                                            className={cn(glass.btnPrimary, "flex-1 sm:flex-none bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600")}
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ClipboardList className="w-4 h-4 mr-2" />}
                                            Commit Tasks
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className={cn(glass.card, "p-2 h-[600px] overflow-hidden relative shadow-xl")}>
                                <div className="absolute inset-2 rounded-3xl overflow-hidden z-0">
                                    <MapContainer
                                        center={[-1.285, 36.825] as any}
                                        zoom={15}
                                        style={{ height: '100%', width: '100%' }}
                                        className="z-0 outline-none"
                                        zoomControl={false}
                                    >
                                        <TileLayer
                                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                            attribution='&copy; ESRI'
                                        />

                                        {/* Target Orchard */}
                                        <Polygon
                                            positions={mockOrchardPolygon as any}
                                            pathOptions={{ color: '#10b981', weight: 3, fillOpacity: 0.15, interactive: false }}
                                        />

                                        {/* Optimized Placements */}
                                        {optimalPlacements.map((pos, idx) => (
                                            <React.Fragment key={idx}>
                                                <Marker position={[pos.lat, pos.lng] as any}>
                                                    <Popup className="custom-popup">
                                                        <div className="text-center p-1">
                                                            <p className={cn(glass.sectionTitle, "text-lg normal-case mb-1")}>Unit #{pos.metadata?.index || idx + 1}</p>
                                                            <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
                                                                <p className="text-xs font-bold text-emerald-600">Score: {pos.score}</p>
                                                            </div>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                                <Circle
                                                    center={[pos.lat, pos.lng] as any}
                                                    radius={pos.coverage_radius_km * 1000} // km to meters
                                                    pathOptions={{ color: '#f59e0b', weight: 1, fillOpacity: 0.08, dashArray: '4, 6' }}
                                                />
                                            </React.Fragment>
                                        ))}
                                    </MapContainer>
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {
                    activeSubPage === 'reports' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className={cn(glass.card, "p-0 overflow-hidden shadow-lg group hover:shadow-xl transition-all duration-300 border-emerald-500/20")}>
                                    <div className="bg-emerald-500/10 p-6 border-b border-border flex justify-between items-center backdrop-blur-sm">
                                        <h4 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Bloom Saturation Report</h4>
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                            <Terminal className="w-5 h-5 text-emerald-600" />
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-8 bg-white/20">
                                        <div className="flex justify-between items-end border-b border-border pb-4">
                                            <span className={cn(glass.microLabel, "font-bold opacity-60")}>Period Coverage</span>
                                            <span className={cn(glass.sectionTitle, "text-xl normal-case")}>MAR 14 - MAR 28</span>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-border pb-4">
                                            <span className={cn(glass.microLabel, "font-bold opacity-60")}>Peak Saturation</span>
                                            <span className={cn(glass.sectionTitle, "text-2xl tabular-nums tracking-tight text-emerald-500")}>92.4%</span>
                                        </div>
                                        <button
                                            onClick={() => handleExport('Bloom')}
                                            className={cn(glass.btnSecondary, "w-full border-transparent bg-white/50 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]")}
                                        >
                                            <FileDown className="w-4 h-4 mr-2" />
                                            Export Geodata (.CSV)
                                        </button>
                                    </div>
                                </div>

                                <div className={cn(glass.card, "p-0 overflow-hidden shadow-lg group hover:shadow-xl transition-all duration-300 border-honey/20")}>
                                    <div className="bg-honey/10 p-6 border-b border-border flex justify-between items-center backdrop-blur-sm">
                                        <h4 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Hive Efficiency Audit</h4>
                                        <div className="w-10 h-10 rounded-full bg-honey/20 flex items-center justify-center border border-honey/30">
                                            <Activity className="w-5 h-5 text-amber-600" />
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-8 bg-white/20">
                                        <div className="flex justify-between items-end border-b border-border pb-4">
                                            <span className={cn(glass.microLabel, "font-bold opacity-60")}>Audit Units</span>
                                            <span className={cn(glass.sectionTitle, "text-xl normal-case")}>45 Nodes</span>
                                        </div>
                                        <button
                                            onClick={() => handleExport('Diagnostic')}
                                            className={cn(glass.btnSecondary, "w-full border-transparent mt-[4.5rem] bg-white/50 hover:bg-honey hover:text-white hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]")}
                                        >
                                            <Activity className="w-4 h-4 mr-2" />
                                            Run Health Check
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={cn(glass.card, "p-8 space-y-6 shadow-sm")}>
                                <div className="flex items-center gap-4 border-b border-border pb-4">
                                    <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Recent Audit Logs</h3>
                                </div>
                                <div className="space-y-4">
                                    {deployments.length === 0 ? (
                                        <div className={glass.emptyState}>
                                            <Clock className="w-8 h-8 text-muted-foreground/30 mb-4" />
                                            <p className={glass.microLabel}>No recent deployments logged.</p>
                                        </div>
                                    ) : (
                                        deployments.map((d, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 p-4 rounded-xl bg-white/40 border border-border hover:bg-muted/50 transition-colors">
                                                <span className={cn(glass.microLabel, "font-bold text-emerald-600 shrink-0 w-32")}>
                                                    {new Date(d.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className={cn(glass.badge, "border-transparent bg-muted/60 self-start sm:self-auto shrink-0")}>Deployment</span>
                                                <span className="text-sm font-medium opacity-90 truncate">{d.field_name} - <span className="font-bold opacity-100">{d.total_acres} Acres</span> committed.</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div >
                    )
                }
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    border-radius: 1rem;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .dark .leaflet-popup-content-wrapper {
                    background: rgba(10, 10, 10, 0.9);
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .leaflet-popup-tip {
                    background: rgba(255, 255, 255, 0.9);
                }
                .dark .leaflet-popup-tip {
                    background: rgba(10, 10, 10, 0.9);
                }
            `}} />
        </div >
    );
};

export default PrecisionPollinationView;
