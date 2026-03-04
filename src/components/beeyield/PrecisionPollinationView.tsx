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
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Professional Header - Tactical Registry style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-[#064e3b] pb-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Pollination
                        </h1>
                        <div className="px-3 py-1 bg-[#facc15] border-2 border-[#064e3b] text-[10px] font-black uppercase">
                            v2.4
                        </div>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em] mt-4">
                        Professional Farm Mapping
                    </p>
                </div>

                {!activeSubPageOverride && (
                    <div className="flex flex-wrap items-center gap-2">
                        {subPageOptions.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setActiveSubPage(opt.id as SubPage)}
                                className={cn(
                                    "flex items-center gap-3 px-6 py-3 border-4 font-black uppercase text-xs tracking-widest transition-none",
                                    activeSubPage === opt.id
                                        ? "bg-[#064e3b] text-white border-[#064e3b] shadow-[0px_4px_0px_0px_#10b981]"
                                        : "bg-white text-[#064e3b] border-[#064e3b] hover:bg-[#facc15]/10"
                                )}
                            >
                                <opt.icon className="w-4 h-4" />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sub-Page Content Area */}
            {activeSubPage === 'home' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 border-4 border-[#064e3b] p-10 bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 bg-[#10b981] animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064e3b]/40">System Status: Active</span>
                                </div>
                                <h2 className="text-7xl font-black text-[#064e3b] tracking-tighter uppercase leading-[0.8]">
                                    Farm <br /> <span className="text-[#10b981]">Overview</span>
                                </h2>
                                <p className="max-w-md text-sm font-bold text-[#064e3b] leading-relaxed">
                                    See your hives, flowering status, and farm data in one place. Monitor your fleet across the yard in real-time.
                                </p>
                            </div>
                            <div className="pt-10 flex items-center gap-10 border-t-2 border-[#064e3b]/10">
                                <div>
                                    <p className="text-[10px] font-black text-[#064e3b]/30 uppercase mb-2">Active Sensors</p>
                                    <p className="text-4xl font-black">{devices.length}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#064e3b]/30 uppercase mb-2">Active Hives</p>
                                    <p className="text-4xl font-black text-[#10b981]">98%</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="border-4 border-[#064e3b] p-6 bg-[#facc15] shadow-[6px_6px_0px_0px_#064e3b]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Zap className="w-5 h-5 text-[#064e3b]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">Flower Coverage</span>
                                </div>
                                <p className="text-5xl font-black text-[#064e3b]">72%</p>
                                <p className="text-[10px] font-black uppercase text-[#064e3b]/60 mt-2">Variety: Nonpareil Almond</p>
                            </div>
                            <div className="border-4 border-[#064e3b] p-6 bg-white shadow-[6px_6px_0px_0px_#064e3b]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Activity className="w-5 h-5 text-[#10b981]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">Activity Index</span>
                                </div>
                                <p className="text-5xl font-black text-[#10b981]">8.4</p>
                                <p className="text-[10px] font-black uppercase text-[#064e3b]/60 mt-2">High Intensity Detected</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { id: 'bloom-tracking', label: 'Status', icon: Zap, desc: 'Field Analysis', color: 'hover:bg-[#10b981]/5', external: true },
                            { id: 'grid', label: 'Map Grid', icon: Layers, desc: 'Sensor Map', color: 'hover:bg-[#facc15]/10', external: false },
                            { id: 'calcs', label: 'Hive Calculator', icon: Calculator, desc: 'Bee Calculator', color: 'hover:bg-[#064e3b]/5', external: false },
                            { id: 'map', label: 'Bee Flight Map', icon: Navigation, desc: 'Flight Paths', color: 'hover:bg-[#10b981]/5', external: false },
                        ].map(module => (
                            <button
                                key={module.id}
                                onClick={() => module.external ? onTabChange(module.id) : setActiveSubPage(module.id as SubPage)}
                                className={cn(
                                    "p-8 border-4 border-[#064e3b] bg-white text-left transition-none space-y-4 group shadow-[4px_4px_0px_0px_rgba(6,78,59,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]",
                                    module.color
                                )}
                            >
                                <div className="w-12 h-12 border-2 border-[#064e3b] flex items-center justify-center group-hover:bg-[#064e3b] group-hover:text-white transition-none">
                                    <module.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black uppercase tracking-tight">{module.label}</h4>
                                    <p className="text-[10px] font-black uppercase text-[#064e3b]/40 tracking-widest">{module.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeSubPage === 'grid' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Hexagon className="w-6 h-6 text-[#10b981]" />
                            <h3 className="text-2xl font-black uppercase tracking-tight">Active Nodes</h3>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#064e3b]/30" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="INPUT ID..."
                                className="w-full h-12 pl-12 pr-4 border-2 border-[#064e3b] bg-white font-black text-xs uppercase focus:bg-[#facc15]/5 outline-none"
                            />
                        </div>
                        <div className="border-4 border-[#064e3b] divide-y-2 divide-[#064e3b]/10 bg-white overflow-y-auto max-h-[600px]">
                            {filteredDevices.map(device => (
                                <button
                                    key={device.id}
                                    onClick={() => setSelectedDeviceId(device.id)}
                                    className={cn(
                                        "w-full p-5 text-left transition-none flex items-center justify-between group",
                                        selectedDeviceId === device.id ? "bg-[#10b981] text-white" : "hover:bg-[#facc15]/10"
                                    )}
                                >
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest">{device.device_code}</p>
                                        <p className={cn("text-[8px] font-bold uppercase", selectedDeviceId === device.id ? "text-white/60" : "text-[#064e3b]/40")}>
                                            {device.location_name || 'N/A'}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-0.5 border text-[8px] font-black uppercase",
                                        device.status === 'active' ? (selectedDeviceId === device.id ? "bg-white text-[#10b981] border-white" : "bg-[#10b981] text-white border-[#064e3b]") : "bg-red-500 text-white border-[#064e3b]"
                                    )}>
                                        {device.status}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-10">
                        <div className="aspect-video border-4 border-[#064e3b] bg-white relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[#facc15]/5 opacity-20" style={{ backgroundImage: 'radial-gradient(#064e3b 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                            <div className="absolute inset-0 flex items-center justify-center grayscale opacity-40 contrast-125">
                                <MapIcon className="w-1/2 h-1/2 text-[#064e3b]" />
                            </div>
                            {selectedDevice && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="relative">
                                        <div className="absolute inset-0 w-20 h-20 border-2 border-[#10b981] animate-ping opacity-20" />
                                        <div className="w-6 h-6 bg-[#10b981] border-4 border-white shadow-[0_0_0_2px_#064e3b]" />
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white border-2 border-[#064e3b] p-3 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] whitespace-nowrap">
                                            <p className="text-[10px] font-black uppercase">{selectedDevice.device_code}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedDevice && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="border-4 border-[#064e3b] p-6 bg-white space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Thermometer className="w-5 h-5 text-[#10b981]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Temperature</span>
                                    </div>
                                    <h4 className="text-4xl font-black leading-none">24.5<span className="text-xl">°C</span></h4>
                                </div>
                                <div className="border-4 border-[#064e3b] p-6 bg-white space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Droplets className="w-5 h-5 text-[#10b981]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Humidity</span>
                                    </div>
                                    <h4 className="text-4xl font-black leading-none">62<span className="text-xl">%</span></h4>
                                </div>
                                <div className="border-4 border-[#064e3b] p-6 bg-white space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-[#facc15] fill-current" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Signal</span>
                                    </div>
                                    <h4 className="text-4xl font-black leading-none">98<span className="text-xl">%</span></h4>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeSubPage === 'calcs' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1 space-y-8">
                            <div className="border-4 border-[#064e3b] p-8 bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                                <div className="flex items-center gap-4 mb-8">
                                    <Calculator className="w-8 h-8 text-[#10b981]" />
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-[#064e3b]">Parameters</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Total Area (Acres)</label>
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => setCalcInputs(prev => ({ ...prev, totalAcres: Math.max(1, prev.totalAcres - 5) }))}
                                                className="w-12 h-12 border-4 border-[#064e3b] bg-white flex items-center justify-center hover:bg-[#facc15]/10"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <div className="flex-1 h-12 border-y-4 border-[#064e3b] flex items-center justify-center font-black text-xl">
                                                {calcInputs.totalAcres}
                                            </div>
                                            <button
                                                onClick={() => setCalcInputs(prev => ({ ...prev, totalAcres: prev.totalAcres + 5 }))}
                                                className="w-12 h-12 border-4 border-[#064e3b] bg-white flex items-center justify-center hover:bg-[#facc15]/10"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Bloom Intensity (0.1 - 1.0)</label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1.0"
                                            step="0.1"
                                            value={calcInputs.bloomIntensity}
                                            onChange={(e) => setCalcInputs(prev => ({ ...prev, bloomIntensity: parseFloat(e.target.value) }))}
                                            className="w-full accent-[#10b981]"
                                        />
                                        <div className="flex justify-between mt-2 font-black text-[10px] uppercase">
                                            <span>Low</span>
                                            <span className="text-[#10b981]">{Math.round(calcInputs.bloomIntensity * 100)}%</span>
                                            <span>Industrial</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Forage Competition</label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1.0"
                                            step="0.1"
                                            value={calcInputs.forageCondition}
                                            onChange={(e) => setCalcInputs(prev => ({ ...prev, forageCondition: parseFloat(e.target.value) }))}
                                            className="w-full accent-[#064e3b]"
                                        />
                                        <div className="flex justify-between mt-2 font-black text-[10px] uppercase">
                                            <span>High Comp</span>
                                            <span className="text-[#064e3b]">{Math.round(calcInputs.forageCondition * 100)}%</span>
                                            <span>Clear Sky</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="border-4 border-[#064e3b] p-8 bg-white space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total Frames Deployed</p>
                                    <h4 className="text-6xl font-black">{metrics.totalFrames}</h4>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-neutral-100 border-2 border-black inline-flex">
                                        <div className="w-2 h-2 bg-black" />
                                        <span className="text-[8px] font-black uppercase">Standard Count</span>
                                    </div>
                                </div>
                                <div className="border-4 border-[#064e3b] p-8 bg-[#facc15] space-y-4 shadow-[8px_8px_0px_0px_#064e3b]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/60">Effective Frames (Bee Math™)</p>
                                    <h4 className="text-6xl font-black">{metrics.effectiveFrames}</h4>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-[#064e3b] inline-flex">
                                        <Zap className="w-3 h-3 text-[#10b981] fill-current" />
                                        <span className="text-[8px] font-black uppercase text-[#064e3b]">Adjusted Force</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveDeployment}
                                    disabled={isSaving}
                                    className="md:col-span-2 border-4 border-[#064e3b] p-6 bg-[#064e3b] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#10b981] transition-all disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Data
                                </button>
                            </div>

                            <div className="border-4 border-[#064e3b] p-10 bg-white grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-4">Frames Per Acre (FPA)</p>
                                    <div className="text-5xl font-black">{metrics.framesPerAcre}</div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-[#10b981]">Effective FPA</p>
                                    <div className="text-5xl font-black text-[#10b981]">{metrics.effectiveFPA}</div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-4">Efficacy Index</p>
                                    <div className="text-5xl font-black">{metrics.pollinationEfficacy}%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b-4 border-black pb-4">
                            <h3 className="text-3xl font-black uppercase tracking-tighter">Colony Inventory & Strength Logic</h3>
                            <button
                                onClick={() => setCalcInputs(prev => ({
                                    ...prev,
                                    hives: [...prev.hives, { frameCount: 8, isStrong: true, isLarge: false }]
                                }))}
                                className="px-6 py-2 border-4 border-black font-black uppercase text-xs hover:bg-black hover:text-white transition-none"
                            >
                                Add Unit
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {calcInputs.hives.map((hive, idx) => (
                                <div key={idx} className="border-4 border-[#064e3b] p-6 bg-white space-y-4 relative group">
                                    <button
                                        onClick={() => setCalcInputs(prev => ({ ...prev, hives: prev.hives.filter((_, i) => i !== idx) }))}
                                        className="absolute top-4 right-4 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-none"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <div className="text-[10px] font-black uppercase opacity-40">Unit #{idx + 1}</div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-2xl">{hive.frameCount} FR</span>
                                        <div className="flex gap-1">
                                            {[...Array(hive.frameCount)].map((_, i) => (
                                                <div key={i} className="w-1.5 h-4 bg-[#10b981]" />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const newHives = [...calcInputs.hives];
                                                newHives[idx].isStrong = !newHives[idx].isStrong;
                                                setCalcInputs(prev => ({ ...prev, hives: newHives }));
                                            }}
                                            className={cn("flex-1 py-1 border-2 text-[8px] font-black uppercase", hive.isStrong ? "bg-[#10b981] text-white border-[#10b981]" : "border-[#064e3b]")}
                                        >
                                            Strong
                                        </button>
                                        <button
                                            onClick={() => {
                                                const newHives = [...calcInputs.hives];
                                                newHives[idx].isLarge = !newHives[idx].isLarge;
                                                setCalcInputs(prev => ({ ...prev, hives: newHives }));
                                            }}
                                            className={cn("flex-1 py-1 border-2 text-[8px] font-black uppercase", hive.isLarge ? "bg-[#064e3b] text-white border-[#064e3b]" : "border-[#064e3b]")}
                                        >
                                            Large
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
            }

            {
                activeSubPage === 'map' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="flex justify-between items-center bg-[#064e3b] p-4 text-white">
                            <div>
                                <h3 className="text-xl font-black uppercase">Spatial Optimizer</h3>
                                <p className="text-xs text-[#10b981] font-bold">Algorithms driving maximum FPI.</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleOptimize}
                                    disabled={isOptimizing}
                                    className="px-6 py-2 bg-[#facc15] text-[#064e3b] font-black uppercase text-xs flex items-center gap-2 hover:bg-white transition-colors"
                                >
                                    {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    Calculate Optimized Placement
                                </button>
                                {optimalPlacements.length > 0 && (
                                    <button
                                        onClick={handleCommitTasks}
                                        disabled={isSaving}
                                        className="px-6 py-2 bg-[#10b981] text-white font-black uppercase text-xs flex items-center gap-2 hover:bg-[#064e3b] transition-colors"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
                                        Commit to Field Tasks
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="border-4 border-[#064e3b] bg-white h-[600px] relative overflow-hidden group">
                            <MapContainer
                                center={[-1.285, 36.825] as any}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                                className="z-0"
                            >
                                <TileLayer
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    attribution='&copy; ESRI'
                                />

                                {/* Target Orchard */}
                                <Polygon
                                    positions={mockOrchardPolygon as any}
                                    pathOptions={{ color: '#10b981', weight: 4, fillOpacity: 0.1 }}
                                />

                                {/* Optimized Placements */}
                                {optimalPlacements.map((pos, idx) => (
                                    <React.Fragment key={idx}>
                                        <Marker position={[pos.lat, pos.lng] as any}>
                                            <Popup>
                                                <div className="text-center font-bold text-[#064e3b]">
                                                    <p>Unit #{pos.metadata?.index || idx + 1}</p>
                                                    <p className="text-xs text-[#10b981]">Score: {pos.score}</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                        <Circle
                                            center={[pos.lat, pos.lng] as any}
                                            radius={pos.coverage_radius_km * 1000} // km to meters
                                            pathOptions={{ color: '#facc15', weight: 1, fillOpacity: 0.1, dashArray: '4' }}
                                        />
                                    </React.Fragment>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                )
            }

            {
                activeSubPage === 'reports' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="border-4 border-[#064e3b] bg-white overflow-hidden group">
                                <div className="bg-[#10b981] p-6 border-b-4 border-[#064e3b] flex justify-between items-center">
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Bloom Saturation Report</h4>
                                    <Terminal className="w-5 h-5 text-white" />
                                </div>
                                <div className="p-10 space-y-8">
                                    <div className="flex justify-between items-end border-b-2 border-neutral-100 pb-4">
                                        <span className="text-[10px] font-black uppercase text-neutral-400">Period Coverage</span>
                                        <span className="font-black text-lg">MAR 14 - MAR 28</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b-2 border-neutral-100 pb-4">
                                        <span className="text-[10px] font-black uppercase text-neutral-400">Peak Saturation</span>
                                        <span className="font-black text-lg text-[#10b981]">92.4%</span>
                                    </div>
                                    <button
                                        onClick={() => handleExport('Bloom')}
                                        className="w-full py-4 bg-[#064e3b] text-white font-black uppercase tracking-widest text-xs hover:bg-[#facc15] hover:text-black transition-none flex items-center justify-center gap-2"
                                    >
                                        <FileDown className="w-4 h-4" />
                                        Export Geodata (.CSV)
                                    </button>
                                </div>
                            </div>

                            <div className="border-4 border-[#064e3b] bg-white overflow-hidden group">
                                <div className="bg-[#facc15] p-6 border-b-4 border-[#064e3b] flex justify-between items-center">
                                    <h4 className="text-xl font-black text-[#064e3b] uppercase tracking-tight">Hive Efficiency Audit</h4>
                                    <Activity className="w-5 h-5 text-[#064e3b]" />
                                </div>
                                <div className="p-10 space-y-8">
                                    <div className="flex justify-between items-end border-b-2 border-neutral-100 pb-4">
                                        <span className="text-[10px] font-black uppercase text-neutral-400">Audit Units</span>
                                        <span className="font-black text-lg">45 Nodes</span>
                                    </div>
                                    <button
                                        onClick={() => handleExport('Diagnostic')}
                                        className="w-full py-4 border-4 border-[#064e3b] text-[#064e3b] font-black uppercase tracking-widest text-xs hover:bg-[#064e3b] hover:text-white transition-none flex items-center justify-center gap-2"
                                    >
                                        <Activity className="w-4 h-4" />
                                        Run Health Check
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-4 border-[#064e3b] p-8 bg-neutral-50 space-y-6">
                            <h3 className="text-xl font-black uppercase tracking-widest border-b-2 border-black pb-4">Recent Audit Logs</h3>
                            <div className="space-y-4 font-mono text-[10px] uppercase">
                                {deployments.length === 0 ? (
                                    <p className="text-neutral-400">No recent deployments logged.</p>
                                ) : (
                                    deployments.map((d, i) => (
                                        <div key={i} className="flex gap-10">
                                            <span className="text-[#10b981] font-black">{new Date(d.created_at).toLocaleString()}</span>
                                            <span className="text-neutral-400">Deployment</span>
                                            <span className="font-bold">{d.field_name} - {d.total_acres} Acres committed.</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div >
                )
            }

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes dash {
                    to { stroke-dashoffset: -100; }
                }
            `}} />
        </div >
    );
};

export default PrecisionPollinationView;
