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
    Locate,
    Crosshair,
    Navigation,
    Shield,
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
import { beeyieldService, Apiary, Hive, IoTDevice, SensorReading } from '@/services/beeyieldService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { calculatePollinationMetrics, CalculationInputs } from '@/lib/pollinationCalculations';
import { optimizeHivePlacementLocal, ForageZone } from '@/lib/pollinationOptimizer';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { jsPDF } from 'jspdf';
import { beePollinationData } from '@/data/beePollinationData';
import { useHives } from '@/hooks/useHives';

import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, CircleMarker, useMap } from 'react-leaflet';
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

const POLLINATION_CROP_ORDER = [
    'Maize',
    'Sisal',
    'Mangoes',
    'Beans',
    'Sunflower',
    'Oranges',
    'Vegetables',
    'Tomatoes',
    'Onions'
] as const;

const CROP_NAME_ALIASES: Record<string, typeof POLLINATION_CROP_ORDER[number]> = {
    maize: 'Maize',
    sisal: 'Sisal',
    mango: 'Mangoes',
    mangoes: 'Mangoes',
    beans: 'Beans',
    bean: 'Beans',
    sunflower: 'Sunflower',
    oranges: 'Oranges',
    orange: 'Oranges',
    vegetables: 'Vegetables',
    vegetable: 'Vegetables',
    tomatoes: 'Tomatoes',
    tomato: 'Tomatoes',
    onions: 'Onions',
    onion: 'Onions',
};

const getCanonicalCropName = (raw: unknown) => {
    const key = String(raw || '').trim().toLowerCase();
    return CROP_NAME_ALIASES[key];
};

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
        targetFpa: 12,
        averageFramesPerHive: 8,
        bloomIntensity: 1,
        forageCondition: 1,
        hives: Array.from({ length: 6 }).map((_, i) => ({
            frameCount: 8 + (i % 2),
            isStrong: i % 3 !== 0,
            isLarge: i % 4 === 0
        }))
    });

    const [deployments, setDeployments] = React.useState<any[]>([]);
    const [forageZones, setForageZones] = React.useState<ForageZone[]>([]);
    const [zonesLoading, setZonesLoading] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [mapCenter, setMapCenter] = React.useState<[number, number]>([-2.42, 37.97]); // Active Sector
    const [zoom, setZoom] = React.useState(13);

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

    const [optimalPlacements, setOptimalPlacements] = React.useState<any[]>([]);
    const [isOptimizing, setIsOptimizing] = React.useState(false);
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('');
    const [crops, setCrops] = React.useState<any[]>([]);
    const [selectedCrop, setSelectedCrop] = React.useState<string>('');
    const [pollinationDashboard, setPollinationDashboard] = React.useState<any | null>(null);
    const [dashboardLoading, setDashboardLoading] = React.useState(false);

    React.useEffect(() => {
        if (selectedCrop && crops.length > 0) {
            const cropData = crops.find((c: any) => String(c?.crop_name || c?.cropName || '').trim() === selectedCrop);
            if (cropData && cropData.target_fpa) {
                setCalcInputs(prev => ({ ...prev, targetFpa: Number(cropData.target_fpa) }));
            }
        }
    }, [selectedCrop, crops]);

    const selectedApiary = React.useMemo(
        () => apiaries.find((a) => a.id === selectedApiaryId),
        [apiaries, selectedApiaryId]
    );

    React.useEffect(() => {
        if (selectedApiary) {
            const acres = selectedApiary.size_acres ?? 25;
            setCalcInputs(prev => ({ ...prev, totalAcres: Number(acres) }));
            if (Number.isFinite(selectedApiary.latitude) && Number.isFinite(selectedApiary.longitude)) {
                setMapCenter([Number(selectedApiary.latitude), Number(selectedApiary.longitude)]);
                setZoom(14);
            }
        }
    }, [selectedApiary]);

    React.useEffect(() => {
        if (!selectedApiary || crops.length === 0) return;
        const forageType = String(selectedApiary.forage_type || '').trim();
        const cropNames = crops.map((c: any) => String(c?.crop_name || c?.cropName || '').trim()).filter(Boolean);
        if (forageType && cropNames.includes(forageType)) {
            setSelectedCrop(forageType);
        }
    }, [crops, selectedApiary]);

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

    const fetchDashboard = async () => {
        setDashboardLoading(true);
        try {
            const data = await beeyieldService.getPollinationDashboard();
            setPollinationDashboard(data);
        } catch (error) {
            console.error('getPollinationDashboard:', error);
            setPollinationDashboard(null);
        } finally {
            setDashboardLoading(false);
        }
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
        if (!orchardGeoJSON) {
            toast.error('Select an apiary with coordinates first.');
            return;
        }

        const bloomIntensity = calcInputs.bloomIntensity ?? 1;
        const forageCondition = calcInputs.forageCondition ?? 1;
        const adaptiveFlightRadiusKm = Number(Math.min(
            2.4,
            Math.max(0.8, 1.15 + ((forageCondition - 0.75) * 0.7) + ((bloomIntensity - 1) * 0.35))
        ).toFixed(2));
        const bloomWeight = Number(Math.min(0.75, Math.max(0.35, 0.5 + ((bloomIntensity - 1) * 0.32))).toFixed(2));
        const waterWeight = Number(Math.min(0.35, Math.max(0.12, 0.18 + ((1 - forageCondition) * 0.16))).toFixed(2));
        const roadsWeight = Number(Math.max(0.08, Number((1 - bloomWeight - waterWeight).toFixed(2))));

        setIsOptimizing(true);
        try {
            const results = await beeyieldService.optimizePollinationPlacement2({
                orchard_geojson: orchardGeoJSON,
                hive_count: Math.max(
                    1,
                    metrics.hivesRequired || Math.ceil((calcInputs.totalAcres || 1) * (calcInputs.targetFpa || 12) / Math.max(1, calcInputs.averageFramesPerHive || 8))
                ),
                target_crop: selectedCrop || (selectedApiary?.forage_type as any) || 'Unknown',
                bee_flight_radius_km: adaptiveFlightRadiusKm,
                ahp_weights: { bloom: bloomWeight, roads: roadsWeight, water: waterWeight },
                bloom_intensity: bloomIntensity,
                forage_condition: forageCondition
            });
            const normalized = Array.isArray(results) ? results.map((r: any) => ({
                lat: Number(r.lat ?? r.latitude ?? r.center?.lat ?? r.y ?? 0),
                lng: Number(r.lng ?? r.longitude ?? r.center?.lng ?? r.x ?? 0),
                coverage_radius_km: Number(r.coverage_radius_km ?? r.radius_km ?? adaptiveFlightRadiusKm),
                score: Number(r.score ?? r.weight ?? 0.5),
                source: 'api'
            })).filter((r: any) => Number.isFinite(r.lat) && Number.isFinite(r.lng)) : [];

            if (normalized.length) {
                setOptimalPlacements(normalized);
                toast.success(`Generated ${normalized.length} optimal placements (cloud).`);
                setIsOptimizing(false);
                return;
            }
        } catch (error) {
            console.error('optimizePollinationPlacement2 failed, falling back to local solver', error);
        }

        const fallback = optimizeHivePlacementLocal({
            orchardPolygon: orchardPolygon as any,
            hiveCount: Math.max(
                1,
                metrics.hivesRequired || Math.ceil((calcInputs.totalAcres || 1) * (calcInputs.targetFpa || 12) / Math.max(1, calcInputs.averageFramesPerHive || 8))
            ),
            flightRadiusKm: adaptiveFlightRadiusKm,
            zones: forageZones,
            windDirectionDeg: 90,
            calcInputs
        });

        setOptimalPlacements(fallback);
        toast.success(`Generated ${fallback.length} optimal placements (edge AI).`);
        setIsOptimizing(false);
    };

    React.useEffect(() => {
        fetchDeployments();
        fetchDashboard();
    }, []);

    React.useEffect(() => {
        let mounted = true;
        const loadCrops = async () => {
            try {
                const data = await beeyieldService.getCropRequirements();
                if (!mounted) return;
                const incoming = Array.isArray(data) ? data : [];
                const indexed = new Map<string, any>();
                incoming.forEach((c: any) => {
                    const canonical = getCanonicalCropName(c?.crop_name || c?.cropName);
                    if (canonical && !indexed.has(canonical)) {
                        indexed.set(canonical, { ...c, crop_name: canonical });
                    }
                });

                const normalized = POLLINATION_CROP_ORDER.map((name) => {
                    const match = indexed.get(name);
                    if (match) return match;
                    const fallback = beePollinationData[name] as any;
                    return {
                        crop_name: name,
                        target_fpa: fallback?.targetFPA ?? undefined,
                        min_fpa: fallback?.targetFPA ? Math.max(1, fallback.targetFPA - 2) : undefined,
                        optimal_fpa: fallback?.targetFPA ? fallback.targetFPA + 2 : undefined,
                    };
                });

                setCrops(normalized);
                const names = normalized.map((c: any) => String(c?.crop_name || c?.cropName || '').trim()).filter(Boolean);
                setSelectedCrop((prev) => {
                    if (prev && names.includes(prev)) return prev;
                    if (selectedApiary?.forage_type && names.includes(String(selectedApiary.forage_type))) return String(selectedApiary.forage_type);
                    return names[0] || '';
                });
            } catch {
                if (!mounted) return;
                const fallback = POLLINATION_CROP_ORDER.map((name) => {
                    const data = beePollinationData[name] as any;
                    return {
                        crop_name: name,
                        target_fpa: data?.targetFPA ?? undefined,
                        min_fpa: data?.targetFPA ? Math.max(1, data.targetFPA - 2) : undefined,
                        optimal_fpa: data?.targetFPA ? data.targetFPA + 2 : undefined,
                    };
                });
                setCrops(fallback);
                setSelectedCrop((prev) => prev || POLLINATION_CROP_ORDER[0]);
            }
        };
        loadCrops();
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    React.useEffect(() => {
        let mounted = true;
        const loadZones = async () => {
            if (!selectedApiaryId) {
                setForageZones([]);
                return;
            }
            setZonesLoading(true);
            try {
                const data = await beeyieldService.getForageZones(selectedApiaryId);
                if (!mounted) return;
                const normalized: ForageZone[] = (data || []).map((z: any) => ({
                    lat: Number(z.latitude ?? z.lat ?? z.latitud) || 0,
                    lng: Number(z.longitude ?? z.lng ?? z.long) || 0,
                    ndvi: typeof z.ndvi === 'number' ? z.ndvi : (typeof z.density_score === 'number' ? z.density_score : undefined),
                    soil_moisture: typeof z.soil_moisture === 'number' ? z.soil_moisture : undefined
                })).filter((z: ForageZone) => Number.isFinite(z.lat) && Number.isFinite(z.lng));
                setForageZones(normalized);
            } catch {
                if (mounted) setForageZones([]);
            } finally {
                if (mounted) setZonesLoading(false);
            }
        };
        loadZones();
        return () => { mounted = false; };
    }, [selectedApiaryId]);

    const handleSaveDeployment = async () => {
        if (!Number.isFinite(calcInputs.totalAcres) || calcInputs.totalAcres <= 0) {
            toast.error('Enter a valid acreage first.');
            return;
        }
        setIsSaving(true);
        const tid = toast.loading('Saving deployment…');
        try {
            const result = await beeyieldService.savePollinationDeployment({
                field_name: `Tactical Deployment ${new Date().toLocaleDateString()}`,
                crop_type: selectedCrop || (selectedApiary?.forage_type as any) || 'Unknown',
                total_acres: calcInputs.totalAcres,
                bloom_intensity: calcInputs.bloomIntensity ?? 1,
                forage_condition: calcInputs.forageCondition ?? 1,
                status: 'active',
                metrics_json: {
                    ...metrics,
                    apiary_id: selectedApiaryId || null,
                    apiary_name: selectedApiary?.name || null,
                    crop_name: selectedCrop || null,
                    optimizer: {
                        forage_zone_count: forageZones.length,
                        placements_generated: optimalPlacements.length,
                    }
                }
            });
            if (result.error) throw result.error;
            await fetchDeployments();
            await fetchDashboard();
            toast.success('Deployment saved', { id: tid });
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Could not save deployment', { id: tid });
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async (type: string) => {
        const tid = toast.loading(`Generating ${type} export…`);
        try {
            if (!selectedApiaryId) {
                toast.error('Select an apiary first.', { id: tid });
                return;
            }
            const today = new Date().toISOString().slice(0, 10);
            const safeType = String(type).replace(/\W+/g, '_');

            const rows = (deployments || []).map((d) => ({
                created_at: d.created_at || '',
                field_name: d.field_name || '',
                crop_type: d.crop_type || '',
                total_acres: d.total_acres ?? '',
                status: d.status || '',
            }));

            const escapeCsv = (v: unknown) => {
                const s = String(v ?? '');
                return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
            };
            const header = rows.length ? Object.keys(rows[0]).join(',') : 'created_at,field_name,crop_type,total_acres,status';
            const body = rows.length ? rows.map((r) => Object.values(r).map(escapeCsv).join(',')).join('\n') : '';
            const csv = `${header}\n${body}\n`;

            const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const csvUrl = URL.createObjectURL(csvBlob);
            const a = document.createElement('a');
            a.href = csvUrl;
            const csvName = `BeeYield_Pollination_${safeType}_${today}.csv`;
            a.download = csvName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(csvUrl);

            const doc = new jsPDF();
            doc.setFontSize(14);
            doc.text(`BeeYield Pollination Export: ${type}`, 14, 18);
            doc.setFontSize(10);
            doc.text(`Date: ${today}`, 14, 26);
            doc.text(`Apiary: ${selectedApiary?.name || '—'}`, 14, 32);
            doc.text(`Acres: ${selectedApiary?.size_acres ?? calcInputs.totalAcres}`, 14, 38);
            doc.text(`Deployments: ${rows.length}`, 14, 44);
            doc.save(`BeeYield_Pollination_${safeType}_${today}.pdf`);

            await beeyieldService.logExport({
                export_type: 'CSV',
                entity_scope: 'Pollination',
                file_name: csvName,
                record_count: rows.length
            });

            toast.success('Export ready', { id: tid });
        } catch (e) {
            console.error(e);
            toast.error('Export failed', { id: tid });
        }
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

    const metrics = React.useMemo(() => calculatePollinationMetrics(calcInputs), [calcInputs]);
    const deployedFrames = React.useMemo(
        () => deployments.reduce((sum, deployment) => sum + ((deployment.hive_count_deployed || 0) * (calcInputs.averageFramesPerHive || 8)), 0),
        [deployments, calcInputs.averageFramesPerHive]
    );
    const reportAnalytics = pollinationDashboard?.analytics;
    const recentActivities = pollinationDashboard?.recent_activities || [];
    const backendHiveSensors = pollinationDashboard?.hive_sensor_data || [];
    const activeContracts = pollinationDashboard?.contracts || [];

    const reportCards = React.useMemo(() => [
        {
            title: 'Bloom Saturation Flux',
            icon: Terminal,
            color: 'text-[#1B9157]',
            val: `${Math.round(reportAnalytics?.coverage_health_percent ?? metrics.pollinationEfficacy)}%`,
            label: dashboardLoading ? 'Syncing backend' : 'Coverage health'
        },
        {
            title: 'Fleet Efficiency Audit',
            icon: Activity,
            color: 'text-[#1A1A1A]',
            val: String(backendHiveSensors.length || filteredDevices.length),
            label: activeContracts.length ? `${activeContracts.length} active contracts` : 'Linked nodes'
        }
    ], [activeContracts.length, backendHiveSensors.length, dashboardLoading, filteredDevices.length, metrics.pollinationEfficacy, reportAnalytics?.coverage_health_percent]);

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
                label="BeeYield AI Field Ops"
                title={<>Precision <span className="text-[#1B9157]">Pollination</span> Engine</>}
                subtitle="Strategic spatial optimization and hive placement logistics."
                actions={
                    !activeSubPageOverride && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className={cn("flex items-center gap-2 px-3 h-9 rounded-xl bg-white/40 border border-[#1B9157]/10 shadow-sm")}>
                                <span className="text-[9px] font-black text-gray-500 whitespace-nowrap">
                                    Apiary
                                </span>
                                <select
                                    id="precision-pollination-apiary"
                                    name="apiary"
                                    autoComplete="off"
                                    value={selectedApiaryId}
                                    onChange={(e) => setSelectedApiaryId(e.target.value)}
                                    className={cn(
                                        "h-7 bg-transparent text-[10px] font-black text-[#1A1A1A] outline-none",
                                        "min-w-[180px]"
                                    )}
                                    aria-label="Select apiary"
                                    title="Select apiary"
                                >
                                    <option value="" disabled>
                                        Select…
                                    </option>
                                    {apiaries.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {(a.name || a.id).toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={cn("flex items-center gap-2 px-3 h-9 rounded-xl bg-white/40 border border-[#1B9157]/10 shadow-sm")}>
                                <span className="text-[9px] font-black text-gray-500 whitespace-nowrap">
                                    Crop
                                </span>
                                <select
                                    id="precision-pollination-crop"
                                    name="crop"
                                    autoComplete="off"
                                    value={selectedCrop}
                                    onChange={(e) => setSelectedCrop(e.target.value)}
                                    className={cn(
                                        "h-7 bg-transparent text-[10px] font-black text-[#1A1A1A] outline-none",
                                        "min-w-[160px]"
                                    )}
                                    aria-label="Select crop"
                                    title="Select crop"
                                    disabled={(crops || []).length === 0}
                                >
                                    <option value="" disabled>
                                        {(crops || []).length === 0 ? 'Loading…' : 'Select…'}
                                    </option>
                                    {crops.map((c: any) => {
                                        const name = String(c?.crop_name || c?.cropName || '').trim();
                                        if (!name) return null;
                                        return (
                                            <option key={name} value={name}>
                                                {name.toUpperCase()}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="flex bg-[#1B9157][0.05] p-1 rounded-xl border border-[#1B9157]/10 gap-1 overflow-x-auto custom-scrollbar shadow-sm">
                                {subPageOptions.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setActiveSubPage(opt.id as SubPage)}
                                        className={cn(
                                            "h-8 px-4 rounded-lg text-[9px] font-black transition-all whitespace-nowrap flex items-center gap-2",
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
                        </div>
                    )
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1.15fr_0.9fr] gap-4">
                <div className={cn(glass.card, "p-4 bg-white/50 border-[#1B9157]/10 shadow-sm")}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-[#1A1A1A]/50 uppercase tracking-widest">Bloom intensity</span>
                        <span className="text-[10px] font-black text-[#1B9157]">{Math.round((calcInputs.bloomIntensity ?? 1) * 100)}%</span>
                    </div>
                    <div className="relative h-2 bg-white/60 rounded-full overflow-hidden border border-[#1B9157]/10">
                        <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.05"
                            value={calcInputs.bloomIntensity ?? 1}
                            onChange={e => setCalcInputs(p => ({ ...p, bloomIntensity: parseFloat(e.target.value) }))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            aria-label="Adjust bloom intensity"
                            title="Adjust bloom intensity"
                        />
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1B9157]/30 to-[#1B9157] rounded-full transition-all" style={{ width: `${(((calcInputs.bloomIntensity ?? 1) - 0.5) / 1) * 100}%` }} />
                    </div>
                </div>

                <div className={cn(glass.card, "p-4 bg-white/50 border-[#F4D03F]/10 shadow-sm")}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-[#1A1A1A]/50 uppercase tracking-widest">Forage modifier</span>
                        <span className="text-[10px] font-black text-[#F4D03F]">{Math.round((calcInputs.forageCondition ?? 1) * 100)}%</span>
                    </div>
                    <div className="relative h-2 bg-white/60 rounded-full overflow-hidden border border-[#F4D03F]/10">
                        <input
                            type="range"
                            min="0.4"
                            max="1.2"
                            step="0.05"
                            value={calcInputs.forageCondition ?? 1}
                            onChange={e => setCalcInputs(p => ({ ...p, forageCondition: parseFloat(e.target.value) }))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            aria-label="Adjust forage modifier"
                            title="Adjust forage modifier"
                        />
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F4D03F]/30 to-[#F4D03F] rounded-full transition-all" style={{ width: `${(((calcInputs.forageCondition ?? 1) - 0.4) / 0.8) * 100}%` }} />
                    </div>
                </div>

                <div className={cn(glass.card, "p-4 bg-[#1A1A1A] text-white border-white/5 shadow-sm")}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/50">Model status</p>
                            <p className="text-sm font-black tracking-tight">{dashboardLoading ? 'Syncing pollination backend...' : metrics.recommendation}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Efficacy</p>
                            <p className="text-xl font-black text-[#F4D03F]">{metrics.pollinationEfficacy}%</p>
                        </div>
                    </div>
                </div>
            </div>

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
                                        <span className="text-[8px] font-black text-[#1B9157]">Live Updates</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tighter leading-none">Fleet <span className="text-[#1B9157]">Optimizer</span></h2>
                                    <p className="text-[10px] font-black text-gray-500 leading-relaxed max-w-xl border-l-2 border-[#1B9157]/10 pl-4 tracking-tighter uppercase">
                                        Continuous spatial analysis and real-time fleet management. 
                                        Monitoring colony distribution and bloom health patterns.
                                    </p>
                                </div>
                                <div className="mt-10 pt-6 border-t border-[#1B9157]/10 flex gap-12 relative z-10">
                                    <div className="space-y-1">
                                        <p className={glass.microLabel}>Tactical Nodes</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-2xl font-black tabular-nums tracking-tighter">{devices.length}</p>
                                            <span className="text-[8px] font-black text-[#1B9157]">Synced</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 flex-1 max-w-[200px]">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <p className={glass.microLabel}>Saturation Progress</p>
                                            <span className="text-[9px] font-black text-[#1B9157]">
                                                {metrics.totalFramesRequired > 0 ? Math.min(100, Math.round((deployedFrames / metrics.totalFramesRequired) * 100)) : 0}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-[#1B9157]/10 rounded-full overflow-hidden mb-2">
                                            <div 
                                                className="h-full bg-[#1B9157] transition-all duration-500" 
                                                style={{ width: `${Math.min(100, metrics.totalFramesRequired > 0 ? (deployedFrames / metrics.totalFramesRequired) * 100 : 0)}%` }}
                                            />
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-xl font-black text-[#1B9157] tabular-nums tracking-tighter">{metrics.totalFramesRequired}</p>
                                            <span className="text-[8px] font-black text-[#1A1A1A]/40">Target Frames</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: 'Deployed Strength', val: deployedFrames.toString(), sub: 'Frames', icon: Zap, color: 'text-[#F4D03F]', bg: 'bg-[#F4D03F]/5', border: 'border-[#F4D03F]/20' },
                                    { label: 'Calculated Demand', val: metrics.totalFramesRequired.toString(), sub: 'Frames', icon: Activity, color: 'text-[#1B9157]', bg: 'bg-[#1B9157]/5', border: 'border-[#1B9157]/20' }
                                ].map((stat, i) => (
                                    <div key={i} className={cn(glass.card, "p-4 flex items-center justify-between border-white/40 shadow-sm", stat.bg, stat.border)}>
                                       <div className="space-y-1">
                                            <p className={glass.microLabel}>{stat.label}</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className={cn("text-xl font-black tracking-tighter tabular-nums", stat.color)}>{stat.val}</p>
                                                <span className={cn("text-[8px] font-black", stat.color)}>{stat.sub}</span>
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
                                        <p className="text-[10px] font-black text-[#1A1A1A]">{opt.label}</p>
                                        <p className="text-[8px] font-bold text-[#1B9157]/40">Access Protocol</p>
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
                                    id="precision-pollination-search"
                                    name="search_nodes"
                                    autoComplete="off"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search nodes..."
                                    className={cn(glass.input, "h-11 pl-11 text-[10px] font-black bg-white/40")}
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
                                                <p className={cn("text-[11px] font-black tracking-tight", selectedDeviceId === device.id ? "text-[#1B9157]" : "text-[#1A1A1A]")}>{device.device_code}</p>
                                                <p className="text-[9px] font-bold text-gray-400 truncate w-32">{device.location_name || 'Undefined Sector'}</p>
                                            </div>
                                            <div className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black", device.status === 'active' ? "bg-[#1B9157]/10 text-[#1B9157] border border-[#1B9157]/20" : "bg-red-50 text-red-600 border border-red-100")}>
                                                {device.status === 'active' ? 'Online' : 'Offline'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-5">
                            <div className={cn(glass.card, "p-0 aspect-video relative overflow-hidden bg-white/40 border-[#1B9157]/10 shadow-xl")}>
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1B9157][0.02] to-transparent" />
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
                                                    <span className="text-[10px] font-black text-[#1A1A1A]">{selectedDevice.device_code}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                             {selectedDevice && (
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                       { icon: Thermometer, label: 'Temperature', val: deviceReadings[0]?.temperature?.toFixed(1) || '—', unit: '°C', color: 'text-amber-500' },
                                       { icon: Droplets, label: 'Humidity', val: deviceReadings[0]?.humidity?.toFixed(0) || '—', unit: '%', color: 'text-blue-500' },
                                       { icon: Signal, label: 'Signal', val: deviceReadings[0]?.signal_strength || '—', unit: 'dBm', color: 'text-[#1B9157]' }
                                   ].map((s, idx) => (
                                       <div key={idx} className={cn(glass.card, "p-4 flex flex-col gap-3 border-white/40 shadow-sm")}>
                                          <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-100 bg-white shadow-sm">
                                             <s.icon className={cn("w-4 h-4", s.color)} />
                                          </div>
                                          <div className="space-y-0.5">
                                             <p className={glass.microLabel}>{s.label}</p>
                                             <div className="flex items-baseline gap-1">
                                                <p className="text-xl font-black text-[#1A1A1A] tracking-tighter tabular-nums">{s.val}</p>
                                                <span className="text-[10px] font-black text-gray-400 leading-none">{s.unit}</span>
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
                                <div className="flex items-center justify-between p-4 border-b border-[#F4D03F]/10 bg-[#F4D03F][0.05]">
                                    <div className="flex items-center gap-2">
                                        <Calculator className="w-4 h-4 text-[#F4D03F]" />
                                        <h3 className="text-[10px] font-black text-[#1A1A1A]">Strategy settings</h3>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F] shadow-sm shadow-[#F4D03F]/50 animate-pulse" />
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-3">
                                        <label htmlFor="precision-pollination-total-acres" className="text-[9px] font-black text-[#1A1A1A]/40 ml-1">Total deployment area (Acres)</label>
                                        <div className="flex bg-white/40 p-1.5 rounded-xl border border-[#F4D03F]/10 shadow-sm">
                                            <button
                                                onClick={() => setCalcInputs(p => ({ ...p, totalAcres: Math.max(1, p.totalAcres - 5) }))}
                                                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#F4D03F] hover:bg-white rounded-lg transition-all"
                                                aria-label="Decrease total deployment area"
                                                title="Decrease total deployment area"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <input
                                                id="precision-pollination-total-acres"
                                                name="total_acres"
                                                autoComplete="off"
                                                inputMode="numeric"
                                                value={calcInputs.totalAcres}
                                                readOnly
                                                className="flex-1 flex items-center justify-center text-sm font-black text-[#1A1A1A] tabular-nums tracking-tighter bg-transparent text-center outline-none"
                                                aria-label="Total deployment area in acres"
                                                title="Total deployment area in acres"
                                            />
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
                                        <div className="flex justify-between items-center text-[9px] font-black ml-1">
                                            <span className="text-[#1A1A1A]/40">Target Frames Per Acre (FPA)</span>
                                            <span className="text-[#1B9157]">{calcInputs.targetFpa} FPA</span>
                                        </div>
                                        <div className="relative h-2 bg-white/40 rounded-full overflow-hidden border border-[#1B9157]/10">
                                            <input
                                                id="precision-pollination-fpa"
                                                name="target_fpa"
                                                autoComplete="off"
                                                type="range"
                                                min="4"
                                                max="24"
                                                step="0.5"
                                                value={calcInputs.targetFpa}
                                                onChange={e => setCalcInputs(p => ({ ...p, targetFpa: parseFloat(e.target.value) }))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                aria-label="Target Frames Per Acre"
                                                title="Target Frames Per Acre"
                                            />
                                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1B9157]/40 to-[#1B9157] rounded-full pointer-events-none transition-all duration-300" style={{ width: `${(calcInputs.targetFpa / 24) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[9px] font-black ml-1">
                                            <span className="text-[#1A1A1A]/40">Supplier Average Frames/Hive</span>
                                            <span className="text-[#F4D03F]">{calcInputs.averageFramesPerHive} Frames</span>
                                        </div>
                                        <div className="relative h-2 bg-white/40 rounded-full overflow-hidden border border-[#F4D03F]/10">
                                            <input
                                                id="precision-pollination-frames-per-hive"
                                                name="frames_per_hive"
                                                autoComplete="off"
                                                type="range"
                                                min="4"
                                                max="12"
                                                step="1"
                                                value={calcInputs.averageFramesPerHive}
                                                onChange={e => setCalcInputs(p => ({ ...p, averageFramesPerHive: parseFloat(e.target.value) }))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                aria-label="Average frames per hive"
                                                title="Average frames per hive"
                                            />
                                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F4D03F]/40 to-[#F4D03F] rounded-full pointer-events-none transition-all duration-300" style={{ width: `${(calcInputs.averageFramesPerHive / 12) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[9px] font-black ml-1">
                                            <span className="text-[#1A1A1A]/40">Bloom intensity multiplier</span>
                                            <span className="text-[#1B9157]">{Math.round((calcInputs.bloomIntensity || 1) * 100)}%</span>
                                        </div>
                                        <div className="relative h-2 bg-white/40 rounded-full overflow-hidden border border-[#1B9157]/10">
                                            <input
                                                id="precision-pollination-bloom-intensity"
                                                name="bloom_intensity"
                                                autoComplete="off"
                                                type="range"
                                                min="0.5"
                                                max="1.5"
                                                step="0.05"
                                                value={calcInputs.bloomIntensity || 1}
                                                onChange={e => setCalcInputs(p => ({ ...p, bloomIntensity: parseFloat(e.target.value) }))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                aria-label="Bloom intensity multiplier"
                                                title="Bloom intensity multiplier"
                                            />
                                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1B9157]/30 to-[#1B9157] rounded-full pointer-events-none transition-all duration-300" style={{ width: `${(((calcInputs.bloomIntensity || 1) - 0.5) / 1) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[9px] font-black ml-1">
                                            <span className="text-[#1A1A1A]/40">Forage condition score</span>
                                            <span className="text-[#F4D03F]">{Math.round((calcInputs.forageCondition || 1) * 100)}%</span>
                                        </div>
                                        <div className="relative h-2 bg-white/40 rounded-full overflow-hidden border border-[#F4D03F]/10">
                                            <input
                                                id="precision-pollination-forage-condition"
                                                name="forage_condition"
                                                autoComplete="off"
                                                type="range"
                                                min="0.4"
                                                max="1.2"
                                                step="0.05"
                                                value={calcInputs.forageCondition || 1}
                                                onChange={e => setCalcInputs(p => ({ ...p, forageCondition: parseFloat(e.target.value) }))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                aria-label="Forage condition score"
                                                title="Forage condition score"
                                            />
                                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F4D03F]/30 to-[#F4D03F] rounded-full pointer-events-none transition-all duration-300" style={{ width: `${(((calcInputs.forageCondition || 1) - 0.4) / 0.8) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <div className="lg:col-span-2 space-y-5">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                   <div className={cn(glass.card, "p-5 border-l-4 border-l-[#1A1A1A] space-y-2 shadow-sm border-white/40")}>
                                      <p className={glass.microLabel}>Guaranteed Strength</p>
                                      <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-black tracking-tighter text-[#1A1A1A] tabular-nums">{metrics.totalFramesRequired}</p>
                                        <span className="text-[10px] font-black text-[#1A1A1A]/30">Total Frames</span>
                                      </div>
                                   </div>
                                   <div className={cn(glass.card, "p-5 border-l-4 border-l-[#1B9157] space-y-2 shadow-sm border-white/40 bg-[#1B9157]/5")}>
                                      <p className={glass.microLabel}>Deployment Scale</p>
                                      <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-black tracking-tighter text-[#1B9157] tabular-nums">{metrics.hivesRequired}</p>
                                        <span className="text-[10px] font-black text-[#1B9157]/40">Boxes Required</span>
                                      </div>
                                   </div>
                                   <div className={cn(glass.card, "p-5 border-l-4 border-l-[#F4D03F] space-y-2 shadow-sm border-white/40")}>
                                      <p className={glass.microLabel}>Effective Force</p>
                                      <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-black tracking-tighter text-[#F4D03F] tabular-nums">{metrics.effectiveFrames}</p>
                                        <span className="text-[10px] font-black text-[#F4D03F]/60">Adj. Frames</span>
                                      </div>
                                   </div>
                                   <div className={cn(glass.card, "p-5 border-l-4 border-l-[#10b981] space-y-2 shadow-sm border-white/40 bg-[#10b981]/5")}>
                                      <p className={glass.microLabel}>Pollination Efficacy</p>
                                      <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-black tracking-tighter text-[#10b981] tabular-nums">{metrics.pollinationEfficacy}</p>
                                        <span className="text-[10px] font-black text-[#10b981]/60">%</span>
                                      </div>
                                   </div>
                                </div>
                                <div className={cn(glass.card, "p-5 grid grid-cols-3 gap-6 shadow-sm border-white/40")}>
                                   {[
                                       { l: 'FPA Matrix', v: calcInputs.targetFpa, c: 'text-[#1A1A1A]' },
                                       { l: 'Eff. FPA', v: metrics.effectiveFPA, c: 'text-[#F4D03F]' },
                                       { l: 'Orchard Size', v: calcInputs.totalAcres + ' ac', c: 'text-[#1B9157]' }
                                   ].map((m, i) => (
                                       <div key={i} className="text-center space-y-1">
                                          <p className={glass.microLabel}>{m.l}</p>
                                          <p className={cn("text-xl font-black tracking-tighter tabular-nums", m.c)}>{m.v}</p>
                                       </div>
                                   ))}
                                </div>
                                <button onClick={handleSaveDeployment} disabled={isSaving} className={cn(glass.btnPrimary, "w-full h-11 text-[10px] font-black rounded-2xl group transition-all duration-500 shadow-xl shadow-[#1B9157]/10")}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                                    <span>Commit Sync Matrix</span>
                                </button>
                            </div>

                        </div>

                        <div className={cn(glass.card, "p-6 bg-white/40 border-white/20 shadow-xl space-y-6")}>
                             <div className="flex items-center justify-between border-b border-[#1B9157]/5 pb-6">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-[#1A1A1A] tracking-tighter">Equipment Inventory</h3>
                                    <p className="text-[9px] font-black text-[#1B9157]/40">Hardware allocation</p>
                                </div>
                                <button onClick={() => setCalcInputs(p => ({ ...p, hives: [...p.hives, { frameCount: 8, isStrong: true, isLarge: false }] }))} className={cn(glass.btnSecondary, "h-9 px-5 rounded-xl text-[9px] font-black flex items-center gap-2 border-[#1B9157]/10")}>
                                    <Plus className="w-3.5 h-3.5" /> Add New Hive
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
                                        <p className="text-xs font-semibold text-[#1A1A1A]/40">Hive #{i + 1}</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-2xl font-black text-[#1A1A1A] tracking-tighter tabular-nums">{h.frameCount}</p>
                                            <span className="text-xs font-semibold text-gray-500">frames</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { const nh = [...calcInputs.hives]; nh[i].isStrong = !nh[i].isStrong; setCalcInputs(p => ({ ...p, hives: nh })); }} 
                                                className={cn("flex-1 h-8 rounded-lg text-sm font-semibold transition-all border outline-none", h.isStrong ? "bg-[#1B9157] border-[#1B9157] text-white shadow-sm" : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50")}>Strong</button>
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
                                    <h3 className={glass.sectionTitle}>Spatial Telemetry</h3>
                                    <p className={glass.microLabel}>Sector Alignment: Alpha 01</p>
                                </div>
                             </div>
                             <div className="flex gap-3">
                                <div className="hidden md:flex items-center px-3 rounded-xl border border-[#1B9157]/10 bg-white text-[8px] font-black text-[#1B9157]">
                                    {zonesLoading ? 'Syncing forage zones...' : `${forageZones.length} forage zones`}
                                </div>
                                <button onClick={handleOptimize} disabled={isOptimizing} className={cn(glass.btnSecondary, "h-9 px-4 text-[9px] font-black rounded-xl flex items-center gap-2 transition-all")}>
                                    {isOptimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} 
                                    <span>Sync Matrix</span>
                                </button>
                                {optimalPlacements.length > 0 && (
                                    <button onClick={handleCommitTasks} disabled={isSaving} className={cn(glass.btnPrimary, "h-9 px-5 text-[9px] font-black rounded-xl flex items-center gap-2 shadow-xl shadow-[#1B9157]/10")}>
                                        Deploy Fleet
                                    </button>
                                )}
                             </div>
                        </div>
                        <div className={cn(glass.card, "h-[600px] p-0 overflow-hidden relative border-white/40 shadow-2xl rounded-[3rem] z-0 bg-gray-50")}>
                            <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }} zoomControl={false} className="z-0" worldCopyJump={true}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
                                {zoom < 8 && <TileLayer url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-boundaries/{z}/{x}/{y}.png" opacity={0.3} />}
                                {zoom >= 8 && <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google Maps Hybrid" />}
                                
                                <MapController center={mapCenter} zoom={zoom} />
                                
                                {zoom > 10 && <Polygon positions={orchardPolygon as any} pathOptions={{ color: '#1B9157', weight: 4, fillOpacity: 0.1, dashArray: '10, 10' }} stroke={false} />}
                                
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
                                    <Popup className="custom-popup"><p className="text-[10px] font-black text-[#1B9157]">Editable Site Pivot</p></Popup>
                                </Marker>

                                {optimalPlacements.map((pos, idx) => (
                                    <React.Fragment key={idx}>
                                        <Marker position={[pos.lat, pos.lng] as any}>
                                            <Popup className="custom-popup"><p className="text-[10px] font-black text-[#1A1A1A]">Node #{idx+1}</p></Popup>
                                        </Marker>
                                        <Circle center={[pos.lat, pos.lng] as any} radius={pos.coverage_radius_km * 1000} pathOptions={{ color: '#F4D03F', weight: 1, fillOpacity: 0.1, dashArray: '5, 5' }} />
                                    </React.Fragment>
                                ))}
                            </MapContainer>

                            {/* Location Manager UI Overlay */}
                            <div className="absolute top-8 right-8 flex flex-col gap-3 p-5 bg-white/70 backdrop-blur-3xl border border-white/40 rounded-[2rem] shadow-2xl z-[1000] w-72">
                                <div className="flex items-center justify-between border-b border-[#F4D03F]/20 pb-2 mb-1">
                                    <h4 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest text-[#1B9157]">Client Secure View</h4>
                                    <Shield className="w-3 h-3 text-[#1B9157]" />
                                </div>
                                <div className="flex items-center justify-between border-b border-[#F4D03F]/20 pb-2 mb-1">
                                    <h4 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">Vector Manager</h4>
                                    <Crosshair className="w-3 h-3 text-[#1B9157]" />
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input 
                                        className="w-full bg-white/50 border border-gray-100 rounded-2xl py-2 pl-10 pr-4 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-[#1B9157]/20 transition-all"
                                        placeholder="Search locations..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSearch(e.currentTarget.value);
                                        }}
                                    />
                                </div>
                                <button 
                                    onClick={handleLocate}
                                    className="flex items-center justify-between px-4 py-2 bg-[#1B9157] text-white rounded-2xl text-[9px] font-black hover:opacity-90 shadow-lg shadow-[#1B9157]/20 transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <Locate className="w-3.5 h-3.5" />
                                        <span>Sync Actual Position</span>
                                    </div>
                                    <Zap className="w-3 h-3 text-[#F4D03F]" />
                                </button>
                                <div className="pt-2 flex items-center justify-center gap-4 text-[8px] font-black text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                                        <span>Active Client Data Only</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSubPage === 'reports' && (
                    <motion.div key="reports" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {reportCards.map((r, i) => (
                                <div key={`report-${i}`} className={cn(glass.card, "p-0 overflow-hidden border-white/40 shadow-sm")}>
                                    <div className="p-4 border-b border-[#1B9157]/5 flex justify-between items-center bg-white/50">
                                        <h4 className={glass.sectionTitle}>{r.title}</h4>
                                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                                            <r.icon className={cn("w-3.5 h-3.5", r.color)} />
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-8">
                                        <div className="flex justify-between items-end border-b border-[#1B9157]/5 pb-4">
                                            <span className={glass.microLabel}>Protocol Status</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className={cn("text-3xl font-black tracking-tighter", r.color)}>{r.val}</span>
                                                <span className="text-[9px] font-black text-gray-400">{r.label}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleExport(r.title)} className={cn(glass.btnSecondary, "w-full h-10 text-[9px] font-black rounded-xl flex items-center justify-center gap-2 group")}>
                                            <FileDown className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                                            <span>Sync Log</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-5">
                            <div className={cn(glass.card, "p-0 bg-white/40 border-[#1B9157]/10 overflow-hidden shadow-xl")}>
                                <div className="p-5 border-b border-[#1B9157]/10 bg-[#1B9157][0.02] flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-[#1A1A1A]">Deployment History</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#1B9157] shadow-sm shadow-[#1B9157]/50 animate-pulse" />
                                        <span className="text-[9px] font-black text-[#1B9157]">{deployments.length} Records logged</span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto thin-scrollbar">
                                    {deployments.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                                            <div className="w-14 h-14 rounded-3xl bg-gray-100 flex items-center justify-center">
                                                <Terminal className="w-7 h-7" />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-[10px] font-black text-[#1A1A1A]">No deployment history yet</span>
                                                <span className="block text-[10px] font-bold text-gray-400">Save a pollination plan to start the registry.</span>
                                            </div>
                                        </div>
                                    ) : (
                                        deployments.map((d, i) => (
                                            <div key={i} className="flex items-center gap-6 p-4 rounded-2xl border border-[#1B9157]/10 bg-white/40 hover:bg-white hover:border-[#1B9157]/30 transition-all group cursor-default">
                                                <span className="text-[10px] font-black text-[#1B9157] w-24 tabular-nums tracking-tighter">{new Date(d.created_at).toLocaleDateString()}</span>
                                                <div className="flex-1 flex items-baseline gap-3">
                                                    <span className="text-[11px] font-black text-[#1A1A1A] tracking-tight group-hover:text-[#1B9157] transition-colors">{d.field_name}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 tabular-nums">{d.total_acres} Acres</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{Math.round((d.bloom_intensity ?? 1) * 100)}% bloom</span>
                                                    <div className="w-2 h-2 rounded-full bg-[#1B9157]/10 group-hover:bg-[#1B9157] group-hover:shadow-sm group-hover:shadow-[#1B9157]/50 transition-all" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className={cn(glass.card, "p-0 bg-[#1A1A1A] text-white border-white/5 overflow-hidden shadow-xl")}>
                                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/70">Backend Activity</h3>
                                    <span className="text-[9px] font-black text-[#F4D03F]">{activeContracts.length} active contracts</span>
                                </div>
                                <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto thin-scrollbar">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Coverage</p>
                                            <p className="text-2xl font-black text-[#F4D03F]">{Math.round(reportAnalytics?.coverage_health_percent ?? metrics.pollinationEfficacy)}%</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Sensor-linked hives</p>
                                            <p className="text-2xl font-black text-[#1B9157]">{backendHiveSensors.length}</p>
                                        </div>
                                    </div>
                                    {recentActivities.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-white/10 p-5 text-[10px] font-black text-white/40">
                                            No pollination activity logs returned yet.
                                        </div>
                                    ) : (
                                        recentActivities.slice(0, 6).map((activity: any, index: number) => (
                                            <div key={`${activity.id || activity.timestamp || index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#F4D03F]">{activity.activity_type || 'activity'}</span>
                                                    <span className="text-[8px] font-black text-white/40">{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Pending sync'}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-white/80">{activity.activity_description || 'Pollination registry updated.'}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
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
