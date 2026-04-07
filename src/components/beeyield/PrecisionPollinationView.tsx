import React from 'react';
import {
    Activity,
    AlertCircle,
    Calculator,
    CheckCircle2,
    ClipboardList,
    Clock,
    Crosshair,
    Droplets,
    FileBarChart,
    FileDown,
    Hexagon,
    Layers,
    Loader2,
    Locate,
    Map as MapIcon,
    MapPin,
    Navigation,
    RefreshCw,
    Save,
    Search,
    Signal,
    Smartphone,
    Target,
    Thermometer,
    Wind,
    Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';

import {
    CropPollinationRequirement,
    Hive,
    IoTDevice,
    SensorReading,
    beeyieldService,
} from '@/services/beeyieldService';
import { useApiaries, useHives } from '@/hooks/useHives';
import {
    BeeYieldBadge,
    BeeYieldEmptyState,
    BeeYieldLoading,
    BeeYieldPageHeader,
    BeeYieldPageShell,
} from '@/components/beeyield/BeeYieldUI';
import { CalculationInputs, calculatePollinationMetrics } from '@/lib/pollinationCalculations';
import { ForageZone, optimizeHivePlacementLocal } from '@/lib/pollinationOptimizer';
import {
    extractReadingActivity,
    extractReadingBattery,
    extractReadingHumidity,
    extractReadingTemperature,
    extractReadingTimestamp,
    filterDevicesByApiary,
    filterReadingsByApiary,
    resolveTargetFpa,
} from '@/lib/pollinationInsights';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

type SubPage = 'home' | 'grid' | 'calcs' | 'map' | 'reports';

interface PrecisionPollinationViewProps {
    devices: IoTDevice[];
    readings: SensorReading[];
    onTabChange: (tab: string, message?: string, action?: string) => void;
    activeSubPageOverride?: SubPage;
}

type DeploymentRecord = {
    id?: string;
    apiary_id?: string;
    created_at?: string;
    crop_type?: string;
    field_name?: string;
    hive_count_deployed?: number;
    metrics_json?: Record<string, any>;
    status?: string;
    total_acres?: number;
};

type Placement = {
    lat: number;
    lng: number;
    coverage_radius_km: number;
    score: number;
    source: 'api' | 'local';
};

const ACTIVE_HIVE_STATUSES = new Set(['active', 'healthy', 'ok']);
const normalizeText = (value?: string | null) =>
    String(value || '')
        .trim()
        .toLowerCase();

const average = (values: number[]) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

const hasNumber = (value: number | null | undefined): value is number =>
    typeof value === 'number' && Number.isFinite(value);

const formatDateTime = (value?: string | null) => {
    if (!value) return 'No timestamp';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'No timestamp';
    return parsed.toLocaleString();
};

const getSignalValue = (reading?: SensorReading | null) => {
    if (!reading) return null;
    const signal = reading.signal_strength ?? reading.signal_dbm;
    return Number.isFinite(Number(signal)) ? Number(signal) : null;
};

const getStatusVariant = (status?: string | null): 'default' | 'success' | 'warning' | 'error' => {
    const normalized = normalizeText(status);
    if (normalized === 'active' || normalized === 'completed' || normalized === 'healthy') return 'success';
    if (normalized === 'planned' || normalized === 'pending') return 'warning';
    if (normalized === 'critical' || normalized === 'inactive' || normalized === 'offline') return 'error';
    return 'default';
};

const mapHiveToUnit = (hive: Hive) => {
    const frames = Math.max(1, Number(hive.frame_count) || 8);
    const status = normalizeText(hive.status);

    return {
        frameCount: frames,
        isStrong: frames >= 9 || ACTIVE_HIVE_STATUSES.has(status),
        isLarge: frames >= 10,
    };
};

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

const polygonToGeoJSON = (polygon: number[][]) => ({
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [polygon[0][1], polygon[0][0]],
                    [polygon[1][1], polygon[1][0]],
                    [polygon[2][1], polygon[2][0]],
                    [polygon[3][1], polygon[3][0]],
                    [polygon[0][1], polygon[0][0]],
                ]],
            },
            properties: {},
        },
    ],
});

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

const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
    const map = useMap();

    React.useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.2 });
    }, [center, map, zoom]);

    return null;
};

const PrecisionPollinationView: React.FC<PrecisionPollinationViewProps> = ({
    devices,
    readings,
    onTabChange,
    activeSubPageOverride,
}) => {
    const [internalSubPage, setInternalSubPage] = React.useState<SubPage>('home');
    const activeSubPage = activeSubPageOverride || internalSubPage;

    const [selectedApiaryId, setSelectedApiaryId] = React.useState('');
    const [selectedCrop, setSelectedCrop] = React.useState('');
    const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');

    const [cropRequirements, setCropRequirements] = React.useState<CropPollinationRequirement[]>([]);
    const [deployments, setDeployments] = React.useState<DeploymentRecord[]>([]);
    const [deploymentsLoading, setDeploymentsLoading] = React.useState(true);
    const [forageZones, setForageZones] = React.useState<ForageZone[]>([]);
    const [zonesLoading, setZonesLoading] = React.useState(false);
    const [optimalPlacements, setOptimalPlacements] = React.useState<Placement[]>([]);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isOptimizing, setIsOptimizing] = React.useState(false);
    const [mapCenter, setMapCenter] = React.useState<[number, number]>([-1.285, 36.825]);
    const [zoom, setZoom] = React.useState(13);

    const [calcInputs, setCalcInputs] = React.useState<CalculationInputs>({
        totalAcres: 1,
        targetFpa: 12,
        averageFramesPerHive: 8,
        bloomIntensity: 1,
        forageCondition: 1,
        weatherRisk: 0.2,
        hives: [],
    });

    const apiariesQuery = useApiaries();
    const apiaries = apiariesQuery.data || [];
    const selectedApiary = React.useMemo(
        () => apiaries.find((apiary) => apiary.id === selectedApiaryId) || null,
        [apiaries, selectedApiaryId],
    );

    const hivesQuery = useHives(selectedApiaryId || undefined);
    const apiaryHives = hivesQuery.data || [];

    const setActiveSubPage = React.useCallback(
        (page: SubPage) => {
            if (activeSubPageOverride) {
                const tabMap: Record<SubPage, string> = {
                    home: 'precision-pollination-home',
                    grid: 'precision-pollination-grid',
                    calcs: 'pollination-calcs',
                    map: 'flight-mapping-tactical',
                    reports: 'site-reports-tactical',
                };
                onTabChange(tabMap[page]);
                return;
            }

            setInternalSubPage(page);
        },
        [activeSubPageOverride, onTabChange],
    );

    const loadCropRequirements = React.useCallback(async () => {
        try {
            const data = await beeyieldService.getCropRequirements();
            setCropRequirements(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setCropRequirements([]);
        }
    }, []);

    const loadDeployments = React.useCallback(async () => {
        setDeploymentsLoading(true);
        try {
            const data = await beeyieldService.getPollinationDeployments();
            setDeployments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setDeployments([]);
        } finally {
            setDeploymentsLoading(false);
        }
    }, []);

    const loadForageZones = React.useCallback(async (apiaryId?: string) => {
        if (!apiaryId) {
            setForageZones([]);
            return;
        }

        setZonesLoading(true);
        try {
            const data = await beeyieldService.getForageZones(apiaryId);
            const normalized = (Array.isArray(data) ? data : [])
                .map((zone) => ({
                    lat: Number((zone as any).latitude ?? (zone as any).lat ?? 0),
                    lng: Number((zone as any).longitude ?? (zone as any).lng ?? 0),
                    ndvi: typeof zone.ndvi === 'number'
                        ? zone.ndvi
                        : typeof (zone as any).density_score === 'number'
                            ? (zone as any).density_score
                            : undefined,
                    soil_moisture: typeof zone.soil_moisture === 'number'
                        ? zone.soil_moisture
                        : typeof (zone as any).moisture === 'number'
                            ? (zone as any).moisture
                            : undefined,
                }))
                .filter((zone) => Number.isFinite(zone.lat) && Number.isFinite(zone.lng));

            setForageZones(normalized);
        } catch (error) {
            console.error(error);
            setForageZones([]);
        } finally {
            setZonesLoading(false);
        }
    }, []);

    React.useEffect(() => {
        void loadCropRequirements();
        void loadDeployments();
    }, [loadCropRequirements, loadDeployments]);

    React.useEffect(() => {
        if (!selectedApiaryId && apiaries.length > 0) {
            setSelectedApiaryId(apiaries[0].id);
        }
    }, [apiaries, selectedApiaryId]);

    React.useEffect(() => {
        void loadForageZones(selectedApiaryId || undefined);
    }, [loadForageZones, selectedApiaryId]);

    React.useEffect(() => {
        if (!selectedApiary) return;

        const cropNames = cropRequirements.map((crop) => crop.crop_name);
        const forageType = String(selectedApiary.forage_type || '').trim();

        setSelectedCrop((current) => {
            if (current && cropNames.some((name) => normalizeText(name) === normalizeText(current))) {
                return current;
            }

            if (forageType && cropNames.some((name) => normalizeText(name) === normalizeText(forageType))) {
                return forageType;
            }

            return cropRequirements[0]?.crop_name || forageType || '';
        });
    }, [cropRequirements, selectedApiary]);

    React.useEffect(() => {
        if (
            selectedApiary &&
            typeof selectedApiary.latitude === 'number' &&
            Number.isFinite(selectedApiary.latitude) &&
            typeof selectedApiary.longitude === 'number' &&
            Number.isFinite(selectedApiary.longitude)
        ) {
            setMapCenter([selectedApiary.latitude, selectedApiary.longitude]);
            setZoom(14);
        }
    }, [selectedApiary]);

    const selectedRequirement = React.useMemo(() => {
        const normalizedCrop = normalizeText(selectedCrop);
        return cropRequirements.find((crop) => normalizeText(crop.crop_name) === normalizedCrop) || null;
    }, [cropRequirements, selectedCrop]);

    const targetFpa = React.useMemo(
        () => resolveTargetFpa(selectedCrop || selectedApiary?.forage_type, cropRequirements),
        [cropRequirements, selectedApiary?.forage_type, selectedCrop],
    );

    React.useEffect(() => {
        const acreage = Math.max(1, Number(selectedApiary?.size_acres || 0) || 1);
        const plannerHives = apiaryHives.map(mapHiveToUnit);
        const averageFramesPerHive = plannerHives.length
            ? plannerHives.reduce((sum, hive) => sum + hive.frameCount, 0) / plannerHives.length
            : Number(selectedRequirement?.target_frames_per_hive || 8);

        setCalcInputs((current) => ({
            ...current,
            totalAcres: acreage,
            targetFpa,
            averageFramesPerHive: Number(averageFramesPerHive.toFixed(1)),
            hives: plannerHives,
            bloomIntensity: current.bloomIntensity ?? 1,
            forageCondition: current.forageCondition ?? 1,
            weatherRisk: current.weatherRisk ?? 0.2,
        }));
    }, [apiaryHives, selectedApiary, selectedRequirement?.target_frames_per_hive, targetFpa]);

    const apiaryDevices = React.useMemo(
        () => filterDevicesByApiary(devices, selectedApiaryId, apiaryHives),
        [apiaryHives, devices, selectedApiaryId],
    );

    const apiaryReadings = React.useMemo(
        () => filterReadingsByApiary(readings, apiaryHives, apiaryDevices),
        [apiaryDevices, apiaryHives, readings],
    );

    const filteredDevices = React.useMemo(() => {
        const normalizedSearch = normalizeText(searchTerm);
        if (!normalizedSearch) return apiaryDevices;

        return apiaryDevices.filter((device) => {
            return (
                normalizeText(device.device_code).includes(normalizedSearch) ||
                normalizeText(device.device_name).includes(normalizedSearch) ||
                normalizeText(device.location_name).includes(normalizedSearch)
            );
        });
    }, [apiaryDevices, searchTerm]);

    React.useEffect(() => {
        if (!filteredDevices.length) {
            setSelectedDeviceId(null);
            return;
        }

        if (!selectedDeviceId || !filteredDevices.some((device) => device.id === selectedDeviceId)) {
            setSelectedDeviceId(filteredDevices[0].id);
        }
    }, [filteredDevices, selectedDeviceId]);

    const selectedDevice = React.useMemo(
        () => apiaryDevices.find((device) => device.id === selectedDeviceId) || null,
        [apiaryDevices, selectedDeviceId],
    );

    const selectedDeviceReadings = React.useMemo(() => {
        return apiaryReadings
            .filter((reading) => reading.device_id === selectedDeviceId)
            .sort((left, right) => {
                const leftTime = extractReadingTimestamp(left)?.getTime() || 0;
                const rightTime = extractReadingTimestamp(right)?.getTime() || 0;
                return rightTime - leftTime;
            });
    }, [apiaryReadings, selectedDeviceId]);

    const latestDeviceReading = selectedDeviceReadings[0] || null;

    const latestApiaryReading = React.useMemo(() => {
        return [...apiaryReadings].sort((left, right) => {
            const leftTime = extractReadingTimestamp(left)?.getTime() || 0;
            const rightTime = extractReadingTimestamp(right)?.getTime() || 0;
            return rightTime - leftTime;
        })[0] || null;
    }, [apiaryReadings]);

    const averageTemperature = React.useMemo(
        () => average(apiaryReadings.map(extractReadingTemperature).filter(hasNumber)),
        [apiaryReadings],
    );

    const averageHumidity = React.useMemo(
        () => average(apiaryReadings.map(extractReadingHumidity).filter(hasNumber)),
        [apiaryReadings],
    );

    const averageBattery = React.useMemo(
        () => average(apiaryReadings.map(extractReadingBattery).filter(hasNumber)),
        [apiaryReadings],
    );

    const averageActivity = React.useMemo(
        () => average(apiaryReadings.map(extractReadingActivity).filter(hasNumber)),
        [apiaryReadings],
    );

    const metrics = React.useMemo(
        () =>
            calculatePollinationMetrics({
                ...calcInputs,
                targetFpa,
                averageFramesPerHive: calcInputs.averageFramesPerHive || selectedRequirement?.target_frames_per_hive || 8,
            }),
        [calcInputs, selectedRequirement?.target_frames_per_hive, targetFpa],
    );

    const activeHiveCount = React.useMemo(
        () => apiaryHives.filter((hive) => ACTIVE_HIVE_STATUSES.has(normalizeText(hive.status))).length,
        [apiaryHives],
    );

    const liveInventoryFrames = React.useMemo(
        () => apiaryHives.reduce((sum, hive) => sum + (Number(hive.frame_count) || 8), 0),
        [apiaryHives],
    );

    const progressPercent = metrics.totalFramesRequired
        ? Math.min(100, Math.round((metrics.effectiveFrames / metrics.totalFramesRequired) * 100))
        : 0;

    const selectedDeployments = React.useMemo(() => {
        return [...deployments]
            .filter((deployment) => {
                const apiaryName = normalizeText(selectedApiary?.name);
                const deploymentApiary = normalizeText(
                    deployment.apiary_id ||
                    deployment.metrics_json?.apiary_id ||
                    deployment.metrics_json?.apiary_name ||
                    deployment.field_name,
                );

                const apiaryMatch =
                    !selectedApiaryId ||
                    deployment.apiary_id === selectedApiaryId ||
                    deployment.metrics_json?.apiary_id === selectedApiaryId ||
                    (apiaryName ? deploymentApiary.includes(apiaryName) : false);

                const cropMatch =
                    !selectedCrop || normalizeText(deployment.crop_type) === normalizeText(selectedCrop);

                return apiaryMatch && cropMatch;
            })
            .sort((left, right) => {
                const leftTime = new Date(left.created_at || 0).getTime();
                const rightTime = new Date(right.created_at || 0).getTime();
                return rightTime - leftTime;
            });
    }, [deployments, selectedApiary, selectedApiaryId, selectedCrop]);

    const hasCoordinates =
        typeof selectedApiary?.latitude === 'number' &&
        Number.isFinite(selectedApiary.latitude) &&
        typeof selectedApiary?.longitude === 'number' &&
        Number.isFinite(selectedApiary.longitude);

    const orchardPolygon = React.useMemo(() => {
        const latitude = hasCoordinates ? Number(selectedApiary?.latitude) : mapCenter[0];
        const longitude = hasCoordinates ? Number(selectedApiary?.longitude) : mapCenter[1];
        return acresToSquarePolygon(latitude, longitude, calcInputs.totalAcres || 1);
    }, [calcInputs.totalAcres, hasCoordinates, mapCenter, selectedApiary?.latitude, selectedApiary?.longitude]);

    const orchardGeoJSON = React.useMemo(() => polygonToGeoJSON(orchardPolygon), [orchardPolygon]);

    const reportCards = React.useMemo(
        () => [
            {
                title: 'Coverage Efficacy',
                value: `${metrics.pollinationEfficacy}%`,
                label: 'Modeled effective coverage',
                icon: Activity,
                color: 'text-[#1B9157]',
            },
            {
                title: 'Recommended Hives',
                value: metrics.hivesRequired.toString(),
                label: 'Needed for current crop target',
                icon: Hexagon,
                color: metrics.hivesRequired > apiaryHives.length ? 'text-[#F59E0B]' : 'text-[#1B9157]',
            },
            {
                title: 'Linked Nodes',
                value: apiaryDevices.length.toString(),
                label: 'Devices connected to this apiary',
                icon: Smartphone,
                color: 'text-[#1A1A1A]',
            },
            {
                title: 'Deployment Records',
                value: selectedDeployments.length.toString(),
                label: 'Saved plans for this view',
                icon: FileBarChart,
                color: 'text-[#1A1A1A]',
            },
        ],
        [apiaryDevices.length, apiaryHives.length, metrics.hivesRequired, metrics.pollinationEfficacy, selectedDeployments.length],
    );

    const subPageOptions = [
        { id: 'grid' as const, label: 'Nodes', description: 'Telemetry devices and live readings', icon: Layers },
        { id: 'calcs' as const, label: 'Calculator', description: 'Live inventory and coverage math', icon: Calculator },
        { id: 'map' as const, label: 'Flight Map', description: 'Apiary footprint and placements', icon: Navigation },
        { id: 'reports' as const, label: 'Reports', description: 'Exports and deployment history', icon: FileBarChart },
    ];

    const handleRefresh = React.useCallback(() => {
        void apiariesQuery.refetch();
        void hivesQuery.refetch();
        void loadCropRequirements();
        void loadDeployments();
        void loadForageZones(selectedApiaryId || undefined);
    }, [apiariesQuery, hivesQuery, loadCropRequirements, loadDeployments, loadForageZones, selectedApiaryId]);

    const handleSearch = React.useCallback(async (query: string) => {
        if (!query.trim()) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
            );
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                setMapCenter([Number(data[0].lat), Number(data[0].lon)]);
                setZoom(14);
                return;
            }

            toast.error('No matching location found.');
        } catch (error) {
            console.error(error);
            toast.error('Could not search that location.');
        }
    }, []);

    const handleLocate = React.useCallback(() => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not available in this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setMapCenter([position.coords.latitude, position.coords.longitude]);
                setZoom(15);
            },
            () => toast.error('Could not access your current location.'),
        );
    }, []);

    const handleOptimize = React.useCallback(async () => {
        if (!selectedApiary || !hasCoordinates) {
            toast.error('Select an apiary with coordinates before optimizing placement.');
            return;
        }

        setIsOptimizing(true);
        try {
            const requestedHives = Math.max(
                1,
                metrics.hivesRequired || Math.ceil((calcInputs.totalAcres || 1) * targetFpa / Math.max(1, calcInputs.averageFramesPerHive || 8)),
            );

            const result = await beeyieldService.optimizePollinationPlacement2({
                orchard_geojson: orchardGeoJSON,
                hive_count: requestedHives,
                target_crop: selectedCrop || selectedApiary.forage_type || 'Unknown',
                bee_flight_radius_km: 1.5,
                ahp_weights: { bloom: 0.8, roads: 0.2, water: 0.1 },
            });

            const normalized = (Array.isArray(result) ? result : [])
                .map((placement: any) => ({
                    lat: Number(placement.lat ?? placement.latitude ?? placement.center?.lat ?? 0),
                    lng: Number(placement.lng ?? placement.longitude ?? placement.center?.lng ?? 0),
                    coverage_radius_km: Number(placement.coverage_radius_km ?? placement.radius_km ?? 1.5),
                    score: Number(placement.score ?? placement.weight ?? 0.5),
                    source: 'api' as const,
                }))
                .filter((placement) => Number.isFinite(placement.lat) && Number.isFinite(placement.lng));

            if (normalized.length > 0) {
                setOptimalPlacements(normalized);
                toast.success(`Generated ${normalized.length} placement recommendations.`);
                return;
            }
        } catch (error) {
            console.error('Cloud optimization failed, falling back to local solver.', error);
        } finally {
            setIsOptimizing(false);
        }

        const fallback = optimizeHivePlacementLocal({
            orchardPolygon: orchardPolygon as any,
            hiveCount: Math.max(1, metrics.hivesRequired),
            flightRadiusKm: 1.5,
            zones: forageZones,
            windDirectionDeg: 90,
            calcInputs,
        }).map((placement) => ({ ...placement, source: 'local' as const }));

        setOptimalPlacements(fallback);
        toast.success(`Generated ${fallback.length} placement recommendations from local solver.`);
    }, [calcInputs, forageZones, hasCoordinates, metrics.hivesRequired, orchardGeoJSON, orchardPolygon, selectedApiary, selectedCrop, targetFpa]);

    const handleCommitTasks = React.useCallback(async () => {
        if (!optimalPlacements.length) {
            toast.error('Generate placements before creating deployment tasks.');
            return;
        }

        const dueDate = new Date().toISOString().slice(0, 10);
        setIsSaving(true);

        try {
            await Promise.all(
                optimalPlacements.map((placement, index) =>
                    beeyieldService.createTask({
                        title: `${selectedApiary?.name || 'Apiary'} placement ${index + 1}`,
                        description: `Deploy hive at ${placement.lat.toFixed(6)}, ${placement.lng.toFixed(6)} with ${(placement.score * 100).toFixed(0)}% placement score.`,
                        category: 'Pollination',
                        priority: 'high',
                        due_date: dueDate,
                        status: 'pending',
                    }),
                ),
            );

            toast.success(`Created ${optimalPlacements.length} deployment tasks.`);
            setActiveSubPage('reports');
        } catch (error) {
            console.error(error);
            toast.error('Could not create deployment tasks.');
        } finally {
            setIsSaving(false);
        }
    }, [optimalPlacements, selectedApiary?.name, setActiveSubPage]);

    const handleSaveDeployment = React.useCallback(async () => {
        if (!selectedApiary) {
            toast.error('Select an apiary first.');
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading('Saving deployment...');

        try {
            const result = await beeyieldService.savePollinationDeployment({
                field_name: selectedApiary.name,
                crop_type: selectedCrop || selectedApiary.forage_type || 'Unknown',
                total_acres: calcInputs.totalAcres,
                target_fpa: targetFpa,
                actual_fpa: metrics.effectiveFPA,
                bloom_intensity: calcInputs.bloomIntensity ?? 1,
                forage_condition: calcInputs.forageCondition ?? 1,
                status: 'planned',
                metrics_json: {
                    apiary_id: selectedApiaryId,
                    apiary_name: selectedApiary.name,
                    crop_name: selectedCrop || selectedApiary.forage_type || 'Unknown',
                    device_count: apiaryDevices.length,
                    hive_count: apiaryHives.length,
                    metrics,
                },
            });

            if (result.error) throw result.error;

            await loadDeployments();
            toast.success('Pollination deployment saved.', { id: toastId });
            setActiveSubPage('reports');
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Could not save deployment.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    }, [
        apiaryDevices.length,
        apiaryHives.length,
        calcInputs.bloomIntensity,
        calcInputs.forageCondition,
        calcInputs.totalAcres,
        loadDeployments,
        metrics,
        selectedApiary,
        selectedApiaryId,
        selectedCrop,
        setActiveSubPage,
        targetFpa,
    ]);

    const handleExport = React.useCallback(
        async (scopeLabel: string) => {
            const toastId = toast.loading('Generating export...');

            try {
                const rows = selectedDeployments.map((deployment) => ({
                    created_at: deployment.created_at || '',
                    field_name: deployment.field_name || '',
                    crop_type: deployment.crop_type || '',
                    total_acres: deployment.total_acres ?? '',
                    status: deployment.status || '',
                }));

                const escapeCsv = (value: unknown) => {
                    const stringValue = String(value ?? '');
                    return /[",\n]/.test(stringValue)
                        ? `"${stringValue.replace(/"/g, '""')}"`
                        : stringValue;
                };

                const header = rows.length
                    ? Object.keys(rows[0]).join(',')
                    : 'created_at,field_name,crop_type,total_acres,status';
                const body = rows.length
                    ? rows.map((row) => Object.values(row).map(escapeCsv).join(',')).join('\n')
                    : '';
                const csv = `${header}\n${body}\n`;

                const today = new Date().toISOString().slice(0, 10);
                const fileStem = `BeeYield_Pollination_${scopeLabel.replace(/\W+/g, '_')}_${today}`;

                const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                const csvUrl = URL.createObjectURL(csvBlob);
                const csvAnchor = document.createElement('a');
                csvAnchor.href = csvUrl;
                csvAnchor.download = `${fileStem}.csv`;
                document.body.appendChild(csvAnchor);
                csvAnchor.click();
                csvAnchor.remove();
                URL.revokeObjectURL(csvUrl);

                const documentPdf = new jsPDF();
                documentPdf.setFontSize(14);
                documentPdf.text(`BeeYield Pollination Export: ${scopeLabel}`, 14, 18);
                documentPdf.setFontSize(10);
                documentPdf.text(`Apiary: ${selectedApiary?.name || 'Not selected'}`, 14, 28);
                documentPdf.text(`Crop: ${selectedCrop || selectedApiary?.forage_type || 'Not selected'}`, 14, 34);
                documentPdf.text(`Deployments: ${selectedDeployments.length}`, 14, 40);
                documentPdf.text(`Coverage efficacy: ${metrics.pollinationEfficacy}%`, 14, 46);
                documentPdf.save(`${fileStem}.pdf`);

                await beeyieldService.logExport({
                    export_type: 'CSV',
                    entity_scope: 'Pollination',
                    file_name: `${fileStem}.csv`,
                    record_count: rows.length,
                });

                toast.success('Export ready.', { id: toastId });
            } catch (error) {
                console.error(error);
                toast.error('Export failed.', { id: toastId });
            }
        },
        [metrics.pollinationEfficacy, selectedApiary, selectedCrop, selectedDeployments],
    );

    const renderHome = () => {
        if (apiariesQuery.isLoading && !apiaries.length) {
            return <BeeYieldLoading label="Loading pollination overview..." />;
        }

        if (!selectedApiary) {
            return (
                <BeeYieldEmptyState
                    icon={MapPin}
                    title="No apiary available"
                    description="Create or select an apiary to view pollination coverage, telemetry, and deployment history."
                />
            );
        }

        return (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-7">
                    <div className={cn(glass.section, 'p-6 md:p-8')}>
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-3">
                                <BeeYieldBadge variant={progressPercent >= 100 ? 'success' : progressPercent >= 75 ? 'warning' : 'error'}>
                                    {progressPercent}% effective coverage
                                </BeeYieldBadge>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tight text-[#1A1A1A]">
                                        {selectedApiary.name}
                                    </h2>
                                    <p className="text-sm leading-relaxed text-gray-500">
                                        {selectedApiary.location_name || selectedApiary.county || selectedApiary.region || 'Location not set'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <BeeYieldBadge>{selectedCrop || selectedApiary.forage_type || 'Crop not set'}</BeeYieldBadge>
                                <BeeYieldBadge variant="success">{calcInputs.totalAcres} acres</BeeYieldBadge>
                                <BeeYieldBadge variant={apiaryDevices.length ? 'success' : 'warning'}>
                                    {apiaryDevices.length} live nodes
                                </BeeYieldBadge>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Active hives', value: activeHiveCount.toString(), hint: `${apiaryHives.length} total`, accent: 'text-[#1B9157]' },
                                { label: 'Avg frames / hive', value: (calcInputs.averageFramesPerHive || 0).toFixed(1), hint: 'Live inventory average', accent: 'text-[#1A1A1A]' },
                                { label: 'Effective FPA', value: metrics.effectiveFPA.toFixed(1), hint: `${targetFpa.toFixed(1)} target`, accent: 'text-[#F59E0B]' },
                                { label: 'Saved plans', value: selectedDeployments.length.toString(), hint: 'Deployment history', accent: 'text-[#1A1A1A]' },
                            ].map((metricCard) => (
                                <div key={metricCard.label} className="rounded-2xl border border-[#F4D03F]/15 bg-white/70 p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                        {metricCard.label}
                                    </p>
                                    <p className={cn('mt-3 text-3xl font-black tracking-tight', metricCard.accent)}>
                                        {metricCard.value}
                                    </p>
                                    <p className="mt-2 text-xs text-gray-500">{metricCard.hint}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 rounded-2xl border border-[#F4D03F]/15 bg-[#1A1A1A] p-5 text-white">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-[#F4D03F]" />
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#F4D03F]">
                                    Planning note
                                </p>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-white/85">{metrics.recommendation}</p>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-5 space-y-6">
                    <div className={cn(glass.card, 'p-6')}>
                        <div className="flex items-center justify-between border-b border-[#F4D03F]/10 pb-4">
                            <div>
                                <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Telemetry Snapshot</h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                    {latestApiaryReading ? `Last reading ${formatDateTime(latestApiaryReading.timestamp)}` : 'No readings yet'}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1B9157]/20 bg-[#1B9157]/10">
                                <Activity className="h-5 w-5 text-[#1B9157]" />
                            </div>
                        </div>

                        {apiaryReadings.length === 0 ? (
                            <div className="py-8">
                                <BeeYieldEmptyState
                                    icon={Smartphone}
                                    title="No telemetry readings"
                                    description="Connect a device or wait for the next sync to populate live temperature, humidity, and activity."
                                />
                            </div>
                        ) : (
                            <div className="mt-5 grid grid-cols-2 gap-4">
                                {[
                                    {
                                        label: 'Temperature',
                                        value: averageTemperature !== null ? `${averageTemperature.toFixed(1)} C` : 'No data',
                                        icon: Thermometer,
                                        color: 'text-orange-500',
                                    },
                                    {
                                        label: 'Humidity',
                                        value: averageHumidity !== null ? `${averageHumidity.toFixed(0)}%` : 'No data',
                                        icon: Droplets,
                                        color: 'text-blue-500',
                                    },
                                    {
                                        label: 'Battery',
                                        value: averageBattery !== null ? `${averageBattery.toFixed(0)}%` : 'No data',
                                        icon: Zap,
                                        color: 'text-[#1B9157]',
                                    },
                                    {
                                        label: 'Activity',
                                        value: averageActivity !== null ? `${averageActivity.toFixed(0)}%` : 'No data',
                                        icon: Wind,
                                        color: 'text-[#F59E0B]',
                                    },
                                ].map((card) => (
                                    <div key={card.label} className="rounded-2xl border border-[#F4D03F]/10 bg-white/70 p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                                {card.label}
                                            </p>
                                            <card.icon className={cn('h-4 w-4', card.color)} />
                                        </div>
                                        <p className="mt-4 text-2xl font-black tracking-tight text-[#1A1A1A]">{card.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={cn(glass.card, 'p-6')}>
                        <div className="flex items-center justify-between border-b border-[#F4D03F]/10 pb-4">
                            <div>
                                <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Explore Views</h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                    Pollination tools for this apiary
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F4D03F]/20 bg-[#F4D03F]/10">
                                <Target className="h-5 w-5 text-[#1A1A1A]" />
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                            {subPageOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setActiveSubPage(option.id)}
                                    className="rounded-2xl border border-[#F4D03F]/15 bg-white/70 p-4 text-left transition-all hover:border-[#1B9157]/30 hover:bg-white"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1B9157]/15 bg-[#1B9157]/10">
                                        <option.icon className="h-5 w-5 text-[#1B9157]" />
                                    </div>
                                    <p className="mt-4 text-sm font-black tracking-tight text-[#1A1A1A]">{option.label}</p>
                                    <p className="mt-2 text-xs text-gray-500">{option.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderGrid = () => {
        if (!selectedApiary) {
            return (
                <BeeYieldEmptyState
                    icon={Layers}
                    title="No apiary selected"
                    description="Choose an apiary to inspect its linked devices and live telemetry."
                />
            );
        }

        if (hivesQuery.isLoading && !apiaryDevices.length) {
            return <BeeYieldLoading label="Loading pollination nodes..." />;
        }

        if (!apiaryDevices.length) {
            return (
                <BeeYieldEmptyState
                    icon={Smartphone}
                    title="No devices linked"
                    description="This apiary does not have any linked telemetry devices yet."
                />
            );
        }

        return (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search device code or location"
                            className={cn(glass.input, 'h-11 w-full bg-white/80 pl-11')}
                        />
                    </div>

                    <div className={cn(glass.card, 'max-h-[620px] space-y-2 overflow-y-auto p-2')}>
                        {filteredDevices.map((device) => (
                            <button
                                key={device.id}
                                type="button"
                                onClick={() => setSelectedDeviceId(device.id)}
                                className={cn(
                                    'w-full rounded-2xl border p-4 text-left transition-all',
                                    selectedDeviceId === device.id
                                        ? 'border-[#1B9157]/30 bg-white shadow-sm'
                                        : 'border-transparent bg-white/60 hover:border-[#F4D03F]/20 hover:bg-white',
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black tracking-tight text-[#1A1A1A]">
                                            {device.device_code}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {device.location_name || device.device_name || 'Location not set'}
                                        </p>
                                    </div>

                                    <BeeYieldBadge variant={device.status === 'active' ? 'success' : 'error'}>
                                        {device.status === 'active' ? 'Online' : 'Offline'}
                                    </BeeYieldBadge>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="xl:col-span-8 space-y-6">
                    {selectedDevice ? (
                        <>
                            <div className={cn(glass.section, 'p-6')}>
                                <div className="flex flex-col gap-4 border-b border-[#F4D03F]/10 pb-5 md:flex-row md:items-center md:justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="h-4 w-4 text-[#1B9157]" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                                Selected node
                                            </p>
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight text-[#1A1A1A]">
                                            {selectedDevice.device_code}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedDevice.location_name || selectedDevice.device_name || 'Location not set'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <BeeYieldBadge variant={selectedDevice.status === 'active' ? 'success' : 'error'}>
                                            {selectedDevice.status === 'active' ? 'Online' : 'Offline'}
                                        </BeeYieldBadge>
                                        <BeeYieldBadge>
                                            {selectedDevice.battery_level !== undefined && selectedDevice.battery_level !== null
                                                ? `Battery ${Math.round(selectedDevice.battery_level)}%`
                                                : extractReadingBattery(latestDeviceReading) !== null
                                                    ? `Battery ${Math.round(extractReadingBattery(latestDeviceReading) || 0)}%`
                                                    : 'Battery unavailable'}
                                        </BeeYieldBadge>
                                        <BeeYieldBadge>
                                            Last ping {formatDateTime(selectedDevice.last_ping)}
                                        </BeeYieldBadge>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        {
                                            label: 'Temperature',
                                            value: extractReadingTemperature(latestDeviceReading),
                                            render: (value: number | null) => (value !== null ? `${value.toFixed(1)} C` : 'No data'),
                                            icon: Thermometer,
                                            color: 'text-orange-500',
                                        },
                                        {
                                            label: 'Humidity',
                                            value: extractReadingHumidity(latestDeviceReading),
                                            render: (value: number | null) => (value !== null ? `${value.toFixed(0)}%` : 'No data'),
                                            icon: Droplets,
                                            color: 'text-blue-500',
                                        },
                                        {
                                            label: 'Signal',
                                            value: getSignalValue(latestDeviceReading),
                                            render: (value: number | null) => (value !== null ? `${value} dBm` : 'No data'),
                                            icon: Signal,
                                            color: 'text-[#1B9157]',
                                        },
                                        {
                                            label: 'Activity',
                                            value: extractReadingActivity(latestDeviceReading),
                                            render: (value: number | null) => (value !== null ? `${value.toFixed(0)}%` : 'No data'),
                                            icon: Wind,
                                            color: 'text-[#F59E0B]',
                                        },
                                    ].map((card) => (
                                        <div key={card.label} className="rounded-2xl border border-[#F4D03F]/10 bg-white/70 p-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                                    {card.label}
                                                </p>
                                                <card.icon className={cn('h-4 w-4', card.color)} />
                                            </div>
                                            <p className="mt-4 text-2xl font-black tracking-tight text-[#1A1A1A]">
                                                {card.render(card.value)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={cn(glass.card, 'p-6')}>
                                <div className="flex items-center justify-between border-b border-[#F4D03F]/10 pb-4">
                                    <div>
                                        <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Recent Readings</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                            Latest telemetry packets for this node
                                        </p>
                                    </div>
                                    <BeeYieldBadge>{selectedDeviceReadings.length} readings</BeeYieldBadge>
                                </div>

                                {selectedDeviceReadings.length === 0 ? (
                                    <div className="py-8">
                                        <BeeYieldEmptyState
                                            icon={Signal}
                                            title="No readings for this device"
                                            description="The selected node has not reported any telemetry yet."
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {selectedDeviceReadings.slice(0, 6).map((reading) => (
                                            <div
                                                key={reading.id}
                                                className="flex flex-col gap-3 rounded-2xl border border-[#F4D03F]/10 bg-white/70 p-4 md:flex-row md:items-center md:justify-between"
                                            >
                                                <div>
                                                    <p className="text-sm font-black tracking-tight text-[#1A1A1A]">
                                                        {formatDateTime(reading.timestamp)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{reading.status || 'Status unavailable'}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 md:flex md:items-center">
                                                    <span className="text-xs font-bold text-gray-500">
                                                        Temp: {extractReadingTemperature(reading) !== null ? `${extractReadingTemperature(reading)?.toFixed(1)} C` : 'No data'}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-500">
                                                        Humidity: {extractReadingHumidity(reading) !== null ? `${extractReadingHumidity(reading)?.toFixed(0)}%` : 'No data'}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-500">
                                                        Signal: {getSignalValue(reading) !== null ? `${getSignalValue(reading)} dBm` : 'No data'}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-500">
                                                        Battery: {extractReadingBattery(reading) !== null ? `${extractReadingBattery(reading)?.toFixed(0)}%` : 'No data'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <BeeYieldEmptyState
                            icon={Layers}
                            title="No device selected"
                            description="Pick a linked node from the left to inspect its live telemetry."
                        />
                    )}
                </div>
            </div>
        );
    };

    const renderCalculator = () => {
        if (!selectedApiary) {
            return (
                <BeeYieldEmptyState
                    icon={Calculator}
                    title="No apiary selected"
                    description="Choose an apiary to calculate pollination coverage with its real hive inventory."
                />
            );
        }

        return (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-4 space-y-6">
                    <div className={cn(glass.section, 'p-6 space-y-6')}>
                        <div className="border-b border-[#F4D03F]/10 pb-4">
                            <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Scenario Controls</h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                Defaults come from the selected apiary and crop profile
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                    Total acres
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={calcInputs.totalAcres}
                                    onChange={(event) =>
                                        setCalcInputs((current) => ({
                                            ...current,
                                            totalAcres: Math.max(1, Number(event.target.value) || 1),
                                        }))
                                    }
                                    className={cn(glass.input, 'h-11 w-full bg-white')}
                                />
                            </div>

                            {[
                                {
                                    label: 'Target FPA',
                                    value: calcInputs.targetFpa ?? targetFpa,
                                    min: 4,
                                    max: 24,
                                    step: 0.5,
                                    accent: 'accent-[#1B9157]',
                                    onChange: (value: number) =>
                                        setCalcInputs((current) => ({ ...current, targetFpa: value })),
                                    display: `${(calcInputs.targetFpa ?? targetFpa).toFixed(1)} frames / acre`,
                                },
                                {
                                    label: 'Bloom intensity',
                                    value: calcInputs.bloomIntensity ?? 1,
                                    min: 0.5,
                                    max: 1.5,
                                    step: 0.05,
                                    accent: 'accent-[#F59E0B]',
                                    onChange: (value: number) =>
                                        setCalcInputs((current) => ({ ...current, bloomIntensity: value })),
                                    display: `${Math.round((calcInputs.bloomIntensity ?? 1) * 100)}%`,
                                },
                                {
                                    label: 'Forage condition',
                                    value: calcInputs.forageCondition ?? 1,
                                    min: 0.4,
                                    max: 1.2,
                                    step: 0.05,
                                    accent: 'accent-[#1A1A1A]',
                                    onChange: (value: number) =>
                                        setCalcInputs((current) => ({ ...current, forageCondition: value })),
                                    display: `${Math.round((calcInputs.forageCondition ?? 1) * 100)}%`,
                                },
                            ].map((control) => (
                                <div key={control.label} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                            {control.label}
                                        </label>
                                        <span className="text-sm font-black text-[#1A1A1A]">{control.display}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={control.min}
                                        max={control.max}
                                        step={control.step}
                                        value={control.value}
                                        onChange={(event) => control.onChange(Number(event.target.value))}
                                        className={cn('h-2 w-full cursor-pointer rounded-full', control.accent)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cn(glass.card, 'p-6')}>
                        <div className="border-b border-[#F4D03F]/10 pb-4">
                            <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Live Hive Inventory</h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                Calculator input is based on real hive records only
                            </p>
                        </div>

                        {apiaryHives.length === 0 ? (
                            <div className="py-8">
                                <BeeYieldEmptyState
                                    icon={Hexagon}
                                    title="No hives in this apiary"
                                    description="Add hives to this apiary to replace fallback coverage estimates with live inventory."
                                />
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {apiaryHives.map((hive) => (
                                    <div
                                        key={hive.id}
                                        className="rounded-2xl border border-[#F4D03F]/10 bg-white/70 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-black tracking-tight text-[#1A1A1A]">
                                                    {hive.hive_code}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {hive.frame_count || 8} frames
                                                    {hive.has_sensors ? ' • Sensors linked' : ''}
                                                </p>
                                            </div>
                                            <BeeYieldBadge variant={ACTIVE_HIVE_STATUSES.has(normalizeText(hive.status)) ? 'success' : 'warning'}>
                                                {hive.status || 'Status unavailable'}
                                            </BeeYieldBadge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="xl:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'Total Frames',
                                value: metrics.totalFrames.toString(),
                                hint: `${liveInventoryFrames} physical frames on record`,
                                icon: ClipboardList,
                                accent: 'text-[#1A1A1A]',
                            },
                            {
                                label: 'Effective Frames',
                                value: metrics.effectiveFrames.toString(),
                                hint: 'Adjusted for bloom and forage',
                                icon: Activity,
                                accent: 'text-[#1B9157]',
                            },
                            {
                                label: 'Required Hives',
                                value: metrics.hivesRequired.toString(),
                                hint: `${apiaryHives.length} currently available`,
                                icon: Hexagon,
                                accent: metrics.hivesRequired > apiaryHives.length ? 'text-[#F59E0B]' : 'text-[#1B9157]',
                            },
                            {
                                label: 'Coverage Efficacy',
                                value: `${metrics.pollinationEfficacy}%`,
                                hint: `${metrics.effectiveFPA.toFixed(1)} effective FPA`,
                                icon: Target,
                                accent: 'text-[#1B9157]',
                            },
                        ].map((card) => (
                            <div key={card.label} className={cn(glass.card, 'p-6')}>
                                <div className="flex items-center justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F4D03F]/15 bg-white/70">
                                        <card.icon className={cn('h-5 w-5', card.accent)} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                        {card.label}
                                    </p>
                                </div>
                                <p className={cn('mt-5 text-4xl font-black tracking-tight', card.accent)}>{card.value}</p>
                                <p className="mt-2 text-xs text-gray-500">{card.hint}</p>
                            </div>
                        ))}
                    </div>

                    <div className={cn(glass.section, 'p-6')}>
                        <div className="flex flex-col gap-4 border-b border-[#F4D03F]/10 pb-5 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-[#1A1A1A]">
                                    Pollination Calculator Summary
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    {selectedCrop || selectedApiary.forage_type || 'Crop not selected'} on {calcInputs.totalAcres} acres with {apiaryHives.length} live hives.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <BeeYieldBadge>{targetFpa.toFixed(1)} target FPA</BeeYieldBadge>
                                <BeeYieldBadge variant="success">
                                    {selectedRequirement?.target_frames_per_hive || calcInputs.averageFramesPerHive?.toFixed(1)} target frames / hive
                                </BeeYieldBadge>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-[#F4D03F]/15 bg-white/70 p-5">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-[#1B9157]" />
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                    Recommendation
                                </p>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-gray-600">{metrics.recommendation}</p>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleSaveDeployment}
                                disabled={isSaving}
                                className={cn(glass.btnPrimary, 'h-11 rounded-2xl px-5')}
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                <span>Save deployment</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleExport('calculator_summary')}
                                className={cn(glass.btnSecondary, 'h-11 rounded-2xl px-5')}
                            >
                                <FileDown className="h-4 w-4" />
                                <span>Export summary</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMap = () => {
        if (!selectedApiary) {
            return (
                <BeeYieldEmptyState
                    icon={MapIcon}
                    title="No apiary selected"
                    description="Choose an apiary to render its flight map and placement recommendations."
                />
            );
        }

        if (!hasCoordinates) {
            return (
                <BeeYieldEmptyState
                    icon={MapPin}
                    title="No coordinates on this apiary"
                    description="Add latitude and longitude to this apiary before running coverage placement."
                />
            );
        }

        return (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8">
                    <div className={cn(glass.section, 'overflow-hidden')}>
                        <div className="flex flex-col gap-4 border-b border-[#F4D03F]/10 bg-white/60 px-5 py-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                                <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Flight Map</h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                    {selectedApiary.name} • {selectedCrop || selectedApiary.forage_type || 'Crop not set'}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <BeeYieldBadge>{forageZones.length} forage zones</BeeYieldBadge>
                                <button
                                    type="button"
                                    onClick={handleOptimize}
                                    disabled={isOptimizing}
                                    className={cn(glass.btnSecondary, 'h-10 rounded-xl px-4')}
                                >
                                    {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                    <span>Optimize placement</span>
                                </button>
                                {optimalPlacements.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleCommitTasks}
                                        disabled={isSaving}
                                        className={cn(glass.btnPrimary, 'h-10 rounded-xl px-4')}
                                    >
                                        <ClipboardList className="h-4 w-4" />
                                        <span>Create tasks</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="h-[620px] overflow-hidden bg-gray-50">
                            <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                    attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                                />
                                <MapController center={mapCenter} zoom={zoom} />

                                <Polygon
                                    positions={orchardPolygon as any}
                                    pathOptions={{
                                        color: '#1B9157',
                                        weight: 3,
                                        fillOpacity: 0.08,
                                        dashArray: '8 8',
                                    }}
                                />

                                <Marker position={mapCenter}>
                                    <Popup>{selectedApiary.name}</Popup>
                                </Marker>

                                {forageZones.map((zone, index) => (
                                    <Circle
                                        key={`zone-${index}`}
                                        center={[zone.lat, zone.lng] as any}
                                        radius={120}
                                        pathOptions={{
                                            color: zone.ndvi && zone.ndvi > 0.6 ? '#1B9157' : '#F4D03F',
                                            fillOpacity: 0.12,
                                            weight: 1.5,
                                        }}
                                    />
                                ))}

                                {optimalPlacements.map((placement, index) => (
                                    <React.Fragment key={`placement-${index}`}>
                                        <Marker position={[placement.lat, placement.lng] as any}>
                                            <Popup>
                                                Placement {index + 1}
                                                <br />
                                                Score {(placement.score * 100).toFixed(0)}%
                                            </Popup>
                                        </Marker>
                                        <Circle
                                            center={[placement.lat, placement.lng] as any}
                                            radius={placement.coverage_radius_km * 1000}
                                            pathOptions={{
                                                color: '#F59E0B',
                                                weight: 1,
                                                fillOpacity: 0.08,
                                                dashArray: '6 6',
                                            }}
                                        />
                                    </React.Fragment>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-6">
                    <div className={cn(glass.card, 'p-6')}>
                        <div className="border-b border-[#F4D03F]/10 pb-4">
                            <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Location Controls</h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                Search another view or use your current position
                            </p>
                        </div>

                        <div className="mt-5 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search location"
                                    className={cn(glass.input, 'h-11 w-full bg-white/80 pl-10')}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            void handleSearch(event.currentTarget.value);
                                        }
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleLocate}
                                className={cn(glass.btnSecondary, 'h-11 w-full rounded-2xl')}
                            >
                                <Locate className="h-4 w-4" />
                                <span>Use current location</span>
                            </button>
                        </div>
                    </div>

                    <div className={cn(glass.card, 'p-6')}>
                        <div className="border-b border-[#F4D03F]/10 pb-4">
                            <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Placement Summary</h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                Live inputs from forage zones and calculator targets
                            </p>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Required hives</span>
                                <span className="text-sm font-black text-[#1A1A1A]">{metrics.hivesRequired}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Forage zones</span>
                                <span className="text-sm font-black text-[#1A1A1A]">
                                    {zonesLoading ? 'Syncing...' : forageZones.length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Placement candidates</span>
                                <span className="text-sm font-black text-[#1A1A1A]">{optimalPlacements.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">Best score</span>
                                <span className="text-sm font-black text-[#1B9157]">
                                    {optimalPlacements.length
                                        ? `${Math.max(...optimalPlacements.map((placement) => placement.score * 100)).toFixed(0)}%`
                                        : 'No placements'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-[#F4D03F]/15 bg-white/70 p-4">
                            <div className="flex items-center gap-2">
                                <Crosshair className="h-4 w-4 text-[#1B9157]" />
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                    Placement note
                                </p>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                {optimalPlacements.length
                                    ? 'Use the generated circles to validate spacing before creating deployment tasks.'
                                    : 'Run placement optimization to calculate recommended hive positions for this apiary.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderReports = () => {
        if (!selectedApiary) {
            return (
                <BeeYieldEmptyState
                    icon={FileBarChart}
                    title="No apiary selected"
                    description="Select an apiary to review its reports, exports, and deployment history."
                />
            );
        }

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {reportCards.map((card) => (
                        <div key={card.title} className={cn(glass.card, 'p-6')}>
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F4D03F]/15 bg-white/70">
                                    <card.icon className={cn('h-5 w-5', card.color)} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                    {card.title}
                                </p>
                            </div>
                            <p className={cn('mt-5 text-4xl font-black tracking-tight', card.color)}>{card.value}</p>
                            <p className="mt-2 text-xs text-gray-500">{card.label}</p>
                        </div>
                    ))}
                </div>

                <div className={cn(glass.section, 'p-6')}>
                    <div className="flex flex-col gap-4 border-b border-[#F4D03F]/10 pb-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Exports</h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                Current apiary summary and deployment logs
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => handleExport('pollination_summary')}
                                className={cn(glass.btnSecondary, 'h-10 rounded-xl px-4')}
                            >
                                <FileDown className="h-4 w-4" />
                                <span>Export summary</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleExport('deployment_history')}
                                className={cn(glass.btnSecondary, 'h-10 rounded-xl px-4')}
                            >
                                <FileDown className="h-4 w-4" />
                                <span>Export history</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                        Reports are filtered to {selectedApiary.name} and the currently selected crop profile.
                    </p>
                </div>

                <div className={cn(glass.card, 'overflow-hidden p-0')}>
                    <div className="flex items-center justify-between border-b border-[#F4D03F]/10 px-5 py-4 bg-white/60">
                        <div>
                            <h3 className="text-sm font-black tracking-tight text-[#1A1A1A]">Deployment History</h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                Saved pollination plans and coverage snapshots
                            </p>
                        </div>
                        <BeeYieldBadge>{selectedDeployments.length} records</BeeYieldBadge>
                    </div>

                    <div className="p-5">
                        {deploymentsLoading ? (
                            <BeeYieldLoading label="Loading deployment history..." />
                        ) : selectedDeployments.length === 0 ? (
                            <BeeYieldEmptyState
                                icon={Clock}
                                title="No deployment history"
                                description="Save a deployment from the calculator to populate this report view."
                            />
                        ) : (
                            <div className="space-y-3">
                                {selectedDeployments.map((deployment, index) => (
                                    <div
                                        key={`${deployment.id || deployment.created_at || 'deployment'}-${index}`}
                                        className="rounded-2xl border border-[#F4D03F]/10 bg-white/70 p-4"
                                    >
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p className="text-sm font-black tracking-tight text-[#1A1A1A]">
                                                    {deployment.field_name || selectedApiary.name}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {deployment.crop_type || selectedCrop || selectedApiary.forage_type || 'Crop not set'}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <BeeYieldBadge variant={getStatusVariant(deployment.status)}>
                                                    {deployment.status || 'Status unavailable'}
                                                </BeeYieldBadge>
                                                <BeeYieldBadge>{deployment.total_acres ?? calcInputs.totalAcres} acres</BeeYieldBadge>
                                                <BeeYieldBadge>
                                                    {formatDateTime(deployment.created_at)}
                                                </BeeYieldBadge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <BeeYieldPageShell>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
                <BeeYieldPageHeader
                    icon={Target}
                    label="Pollination Overview"
                    title={
                        <>
                            Precision <span className="text-[#1B9157]">Pollination</span>
                        </>
                    }
                    subtitle="Unified field coverage, telemetry, placement planning, and reports for the selected apiary."
                    onRefresh={handleRefresh}
                    actions={
                        <div className="flex flex-col gap-2 lg:items-end">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <select
                                    value={selectedApiaryId}
                                    onChange={(event) => setSelectedApiaryId(event.target.value)}
                                    className={cn(glass.input, 'h-10 min-w-[220px] bg-white/80')}
                                    aria-label="Select apiary"
                                    title="Select apiary"
                                >
                                    {apiaries.map((apiary) => (
                                        <option key={apiary.id} value={apiary.id}>
                                            {apiary.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedCrop}
                                    onChange={(event) => setSelectedCrop(event.target.value)}
                                    className={cn(glass.input, 'h-10 min-w-[200px] bg-white/80')}
                                    aria-label="Select crop"
                                    title="Select crop"
                                    disabled={cropRequirements.length === 0}
                                >
                                    {cropRequirements.length === 0 ? (
                                        <option value="">Loading crops...</option>
                                    ) : (
                                        cropRequirements.map((crop) => (
                                            <option key={crop.id} value={crop.crop_name}>
                                                {crop.crop_name}
                                            </option>
                                        ))
                                    )}
                                </select>

                                <BeeYieldBadge variant={apiaryHives.length ? 'success' : 'warning'}>
                                    {apiaryHives.length} live hives
                                </BeeYieldBadge>
                            </div>

                            {!activeSubPageOverride && (
                                <div className="flex flex-wrap gap-2 rounded-2xl border border-[#F4D03F]/15 bg-white/70 p-1">
                                    {subPageOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setActiveSubPage(option.id)}
                                            className={cn(
                                                'rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all',
                                                activeSubPage === option.id
                                                    ? 'bg-[#1A1A1A] text-white'
                                                    : 'text-gray-500 hover:bg-[#F4D03F]/10',
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    }
                />

                <AnimatePresence mode="wait">
                    {activeSubPage === 'home' && (
                        <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {renderHome()}
                        </motion.div>
                    )}

                    {activeSubPage === 'grid' && (
                        <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {renderGrid()}
                        </motion.div>
                    )}

                    {activeSubPage === 'calcs' && (
                        <motion.div key="calcs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {renderCalculator()}
                        </motion.div>
                    )}

                    {activeSubPage === 'map' && (
                        <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {renderMap()}
                        </motion.div>
                    )}

                    {activeSubPage === 'reports' && (
                        <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {renderReports()}
                        </motion.div>
                    )}
                </AnimatePresence>

                <style>{`
                    .leaflet-container {
                        z-index: 0;
                    }

                    .leaflet-popup-content-wrapper {
                        border-radius: 12px;
                    }
                `}</style>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default PrecisionPollinationView;
