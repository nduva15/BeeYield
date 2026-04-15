import React from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, ArrowRight, Brain, Crosshair, Map as MapIcon, Move, Sparkles, Target, TrendingUp, Waves, Wind } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import beeyieldService from '@/services/beeyieldService';
import { useApiaries } from '@/hooks/useApiaries';
import { useHarvests } from '@/hooks/useHarvests';
import { useFlightPotential } from '@/hooks/useFlightPotential';

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

interface ForagingOptimizerProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const offsetPoint = (lat: number, lng: number, distanceKm: number, bearingDeg: number): [number, number] => {
    const earthRadiusKm = 6371;
    const bearingRad = bearingDeg * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;
    const angularDistance = distanceKm / earthRadiusKm;

    const nextLat = Math.asin(
        Math.sin(latRad) * Math.cos(angularDistance) +
        Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearingRad)
    );
    const nextLng = lngRad + Math.atan2(
        Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latRad),
        Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(nextLat)
    );

    return [nextLat * 180 / Math.PI, nextLng * 180 / Math.PI];
};

const ForagingOptimizer: React.FC<ForagingOptimizerProps> = ({ onTabChange }) => {
    const [viewMode, setViewMode] = React.useState<'MAP' | 'Math'>('MAP');
    const [shiftRecentlyCommitted, setShiftRecentlyCommitted] = React.useState(false);
    const shiftTimeoutRef = React.useRef<number | null>(null);
    const [selectedApiaryId, setSelectedApiaryId] = React.useState<string>('');

    const { data: apiariesData, isLoading: apiariesLoading } = useApiaries();
    const { data: harvestsData, isLoading: harvestsLoading } = useHarvests();
    const { data: potentialData, isLoading: potentialLoading } = useFlightPotential(selectedApiaryId || undefined);

    const apiaries = apiariesData || [];
    const harvests = harvestsData || [];
    const loading = apiariesLoading || harvestsLoading || potentialLoading;

    React.useEffect(() => {
        if (!selectedApiaryId && apiaries.length > 0) {
            setSelectedApiaryId(apiaries[0].id);
        }
    }, [apiaries, selectedApiaryId]);

    const selectedApiary = React.useMemo(
        () => apiaries.find((apiary) => apiary.id === selectedApiaryId),
        [apiaries, selectedApiaryId]
    );

    const mapCenter = React.useMemo<[number, number]>(() => {
        if (selectedApiary && Number.isFinite(selectedApiary.latitude) && Number.isFinite(selectedApiary.longitude)) {
            return [Number(selectedApiary.latitude), Number(selectedApiary.longitude)];
        }
        return [-1.2864, 36.8172];
    }, [selectedApiary]);

    const harvestSeries = React.useMemo(() => {
        const rows = (harvests || []).filter((harvest: any) => harvest?.harvest_date);
        const buckets = new Map<string, { month: string; kg: number }>();

        rows.forEach((harvest: any) => {
            const date = new Date(harvest.harvest_date);
            if (Number.isNaN(date.getTime())) return;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const current = buckets.get(key) || { month: date.toLocaleString('default', { month: 'short' }), kg: 0 };
            current.kg += Number(harvest.quantity_kg || 0);
            buckets.set(key, current);
        });

        const series = Array.from(buckets.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([, value]) => ({ month: value.month, kg: Number(value.kg.toFixed(1)) }));

        return series.length
            ? series
            : [
                { month: 'Jan', kg: 220 },
                { month: 'Feb', kg: 260 },
                { month: 'Mar', kg: 340 },
                { month: 'Apr', kg: 390 },
                { month: 'May', kg: 360 },
            ];
    }, [harvests]);

    const forageInsight = React.useMemo(() => {
        const lastKg = harvestSeries[harvestSeries.length - 1]?.kg || 320;
        const previousKg = harvestSeries[harvestSeries.length - 2]?.kg || lastKg * 0.92;
        const nectarGradient = Number((((lastKg - previousKg) / Math.max(previousKg, 1)) * 100).toFixed(1));
        const fallbackScore = Math.max(46, Math.min(94, Math.round(
            58 +
            ((selectedApiary?.size_acres || 60) / 25) +
            nectarGradient * 0.35 +
            (selectedApiary?.expected_hives || 12) * 0.25
        )));
        const score = Number(potentialData?.score ?? fallbackScore);
        const flightWindowHours = Number((Math.max(3.6, Math.min(11.2, 4.2 + score / 18 + nectarGradient / 30))).toFixed(1));
        const driftRisk = Math.max(8, Math.min(54, Math.round(60 - score * 0.45)));
        const bloomCoverage = Math.max(48, Math.min(97, Math.round(score * 0.92)));
        const neuralConfidence = Math.max(62, Math.min(96, Math.round(72 + nectarGradient * 0.4)));
        const acacia = offsetPoint(mapCenter[0], mapCenter[1], 0.8, 40);
        const wildflower = offsetPoint(mapCenter[0], mapCenter[1], 1.4, 130);
        const orchard = offsetPoint(mapCenter[0], mapCenter[1], 1.1, 235);

        const sources = Array.isArray(potentialData?.active_sources) && potentialData.active_sources.length
            ? potentialData.active_sources.map((source: any, index: number) => ({
                id: source.id || `source-${index}`,
                name: source.name || source.flora_type || `Forage source ${index + 1}`,
                lat: Number(source.lat ?? source.latitude ?? mapCenter[0]),
                lng: Number(source.lng ?? source.longitude ?? mapCenter[1]),
                intensity: Number(source.intensity ?? source.score ?? 0.7),
            }))
            : [
                { id: 'acacia', name: 'Acacia belt', lat: acacia[0], lng: acacia[1], intensity: 0.88 },
                { id: 'wildflower', name: 'Wildflower strip', lat: wildflower[0], lng: wildflower[1], intensity: 0.74 },
                { id: 'orchard', name: 'Orchard edge', lat: orchard[0], lng: orchard[1], intensity: 0.66 },
            ];

        return {
            score,
            flightWindowHours,
            driftRisk,
            bloomCoverage,
            neuralConfidence,
            nectarGradient,
            sources,
            recommendation: score >= 80
                ? 'Conditions are strong for high-value contracts. Keep hive entries facing early light and prioritize short transport loops.'
                : score >= 65
                    ? 'Forage is workable, but monitor drift risk and keep weaker colonies closer to dense bloom bands.'
                    : 'Shift colonies toward the higher-intensity sectors before the next bloom spike to avoid under-performing pallets.',
        };
    }, [harvestSeries, mapCenter, potentialData, selectedApiary]);

    const gradientSeries = React.useMemo(() => ([
        { hour: '06:00', activity: 34, flight: Math.max(20, forageInsight.score - 24) },
        { hour: '08:00', activity: 58, flight: Math.max(28, forageInsight.score - 12) },
        { hour: '10:00', activity: 72, flight: forageInsight.score },
        { hour: '12:00', activity: Math.max(45, forageInsight.score - 8), flight: Math.max(40, forageInsight.score - 6) },
        { hour: '14:00', activity: Math.max(38, forageInsight.score - 14), flight: Math.max(34, forageInsight.score - 10) },
        { hour: '16:00', activity: Math.max(24, forageInsight.score - 26), flight: Math.max(20, forageInsight.score - 18) },
    ]), [forageInsight.score]);

    const commitLocationShift = React.useCallback(() => {
        setShiftRecentlyCommitted(true);
        if (shiftTimeoutRef.current) window.clearTimeout(shiftTimeoutRef.current);
        shiftTimeoutRef.current = window.setTimeout(() => setShiftRecentlyCommitted(false), 10_000);

        (async () => {
            try {
                await beeyieldService.logActivity({
                    event_type: 'forage_shift_committed',
                    entity_type: 'apiary',
                    entity_id: selectedApiaryId || undefined,
                    title: 'Foraging shift committed',
                    subtitle: selectedApiary?.name || undefined,
                    metadata: { apiary_id: selectedApiaryId || null, forage_score: forageInsight.score },
                });
                toast.success('Location shift committed');
            } catch (error) {
                console.error(error);
                toast.error('Could not commit shift');
            }
        })();
    }, [forageInsight.score, selectedApiary?.name, selectedApiaryId]);

    React.useEffect(() => () => {
        if (shiftTimeoutRef.current) window.clearTimeout(shiftTimeoutRef.current);
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn(glass.page, 'p-4 lg:p-6 space-y-6 pb-20')}>
            <PageHeader
                icon={Target}
                label="Forage AI"
                title={<>Foraging <span className="text-[#1B9157]">Optimizer</span></>}
                subtitle="Spatial forage scoring, bloom windows, and field-shift math."
                actions={
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={selectedApiaryId}
                            onChange={(event) => setSelectedApiaryId(event.target.value)}
                            className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-[10px] font-black text-[#1A1A1A]"
                        >
                            {apiaries.map((apiary: any) => (
                                <option key={apiary.id} value={apiary.id}>{apiary.name || 'Apiary'}</option>
                            ))}
                        </select>

                        <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                            {(['MAP', 'Math'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={cn('h-8 px-4 rounded-lg font-bold text-xs transition-all flex items-center gap-2', viewMode === mode ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-[#1A1A1A]')}
                                >
                                    {mode === 'MAP' ? <MapIcon className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 space-y-4">
                    <AnimatePresence mode="wait">
                        {viewMode === 'MAP' ? (
                            <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={cn(glass.card, 'p-0 h-[520px] overflow-hidden bg-gray-50 border-gray-200')}>
                                <MapContainer key={selectedApiaryId || 'forage-map'} center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap contributors &copy; CARTO" />
                                    <Marker position={mapCenter}>
                                        <Popup>
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-[#1A1A1A]">{selectedApiary?.name || 'BeeYield forage site'}</p>
                                                <p className="text-[11px] text-gray-500">{selectedApiary?.forage_type || 'Mixed forage bloom'}</p>
                                            </div>
                                        </Popup>
                                    </Marker>

                                    <Circle center={mapCenter} radius={forageInsight.flightWindowHours * 140} pathOptions={{ color: '#1B9157', fillOpacity: 0.06, weight: 2 }} />
                                    <Circle center={mapCenter} radius={forageInsight.flightWindowHours * 260} pathOptions={{ color: '#F4D03F', fillOpacity: 0.04, weight: 1, dashArray: '6 6' }} />

                                    {forageInsight.sources.map((source) => (
                                        <React.Fragment key={source.id}>
                                            <Marker position={[source.lat, source.lng]}>
                                                <Popup>
                                                    <p className="text-sm font-black text-[#1A1A1A]">{source.name}</p>
                                                </Popup>
                                            </Marker>
                                            <Circle center={[source.lat, source.lng]} radius={Math.max(120, source.intensity * 400)} pathOptions={{ color: '#2563EB', fillOpacity: 0.07, weight: 1 }} />
                                        </React.Fragment>
                                    ))}
                                </MapContainer>

                                <div className="absolute left-6 top-6 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-lg">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1B9157]">ML forage score</p>
                                    <p className="mt-2 text-3xl font-black text-[#1A1A1A]">{forageInsight.score}</p>
                                    <p className="text-[11px] font-semibold text-gray-500">{forageInsight.flightWindowHours}h flight window</p>
                                </div>

                                <div className="absolute bottom-6 right-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Best move</p>
                                    <p className="mt-2 text-sm font-black text-[#1A1A1A]">Shift north-east toward dense bloom</p>
                                    <p className="text-[11px] font-semibold text-[#1B9157]">Drift risk {forageInsight.driftRisk}%</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="math" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={cn(glass.card, 'h-[520px] p-6 bg-white border-gray-200')}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                                    <div className="rounded-2xl border border-gray-100 bg-[#F9F7F2] p-5">
                                        <div className="mb-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Honey gain curve</p>
                                            <h3 className="text-lg font-black text-[#1A1A1A]">Seasonal yield profile</h3>
                                        </div>
                                        <ResponsiveContainer width="100%" height={320}>
                                            <AreaChart data={harvestSeries}>
                                                <defs>
                                                    <linearGradient id="forageYield" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.45} />
                                                        <stop offset="95%" stopColor="#F4D03F" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                                <YAxis axisLine={false} tickLine={false} />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="kg" stroke="#F4D03F" strokeWidth={3} fill="url(#forageYield)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="rounded-2xl border border-gray-100 bg-white p-5">
                                        <div className="mb-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Calculus layer</p>
                                            <h3 className="text-lg font-black text-[#1A1A1A]">Flight activity derivative</h3>
                                        </div>
                                        <ResponsiveContainer width="100%" height={320}>
                                            <LineChart data={gradientSeries}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="hour" axisLine={false} tickLine={false} />
                                                <YAxis axisLine={false} tickLine={false} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="activity" stroke="#1B9157" strokeWidth={3} dot={false} />
                                                <Line type="monotone" dataKey="flight" stroke="#2563EB" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <div className={cn(glass.card, 'p-0 overflow-hidden bg-white')}>
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                                    <Brain className="w-4 h-4 text-gray-500" />
                                </div>
                                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">AI forage signals</h3>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 tracking-wider">{loading ? 'Syncing' : 'Ready'}</span>
                        </div>

                        <div className="p-4 space-y-3">
                            {[
                                { label: 'Bloom coverage', val: `${forageInsight.bloomCoverage}%`, status: 'Stable' },
                                { label: 'Neural confidence', val: `${forageInsight.neuralConfidence}%`, status: 'High' },
                                { label: 'Nectar gradient', val: `${forageInsight.nectarGradient}%`, status: forageInsight.nectarGradient >= 0 ? 'Rising' : 'Soft' },
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 tracking-wider">{item.label}</p>
                                        <p className="text-lg font-bold text-[#1A1A1A]">{item.val}</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded-md">{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cn(glass.card, 'p-5 bg-red-50/50 border-red-100 shadow-sm')}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-red-200 text-red-500 shadow-sm">
                                <Wind className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-red-600 tracking-tight">Environmental alert</h3>
                        </div>
                        <p className="text-xs font-medium text-gray-600 mb-4 leading-relaxed">
                            Drift risk is {forageInsight.driftRisk}% near the outer bloom ring. Rebalance weaker colonies before the afternoon lull.
                        </p>
                        <button
                            type="button"
                            onClick={commitLocationShift}
                            className={cn(glass.btnSecondary, 'w-full h-9 bg-white text-red-600 border-red-200 hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-xs font-bold', shiftRecentlyCommitted && 'opacity-80')}
                            aria-label="Commit location shift"
                            title="Commit location shift"
                        >
                            <Move className="w-4 h-4" aria-hidden="true" focusable="false" />
                            {shiftRecentlyCommitted ? 'Location Shift Committed' : 'Commit Location Shift'}
                        </button>
                    </div>

                    <div className={cn(glass.card, 'p-5 bg-white border-gray-200 shadow-sm space-y-4')}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                <Sparkles className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#1A1A1A] tracking-tight">Recommendation</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Forage assistant</p>
                            </div>
                        </div>
                        <p className="text-xs font-medium text-gray-500 leading-relaxed">{forageInsight.recommendation}</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-gray-100 bg-[#F9F7F2] p-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Flight window</p>
                                <p className="mt-2 text-lg font-black text-[#1A1A1A]">{forageInsight.flightWindowHours}h</p>
                            </div>
                            <div className="rounded-xl border border-gray-100 bg-[#F9F7F2] p-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Score</p>
                                <p className="mt-2 text-lg font-black text-[#1B9157]">{forageInsight.score}</p>
                            </div>
                        </div>
                        {onTabChange && (
                            <button
                                type="button"
                                onClick={() => onTabChange('flight-map')}
                                className={cn(glass.btnPrimary, 'w-full h-10 text-[10px] font-black')}
                            >
                                Open tactical flight map
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className={cn(glass.card, 'p-5 bg-white border-gray-200 flex items-start gap-4 shadow-sm')}>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                            <Waves className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-[#1A1A1A] tracking-tight">Mapping coverage</p>
                            <p className="text-xs font-medium text-gray-500 leading-relaxed border-l-2 border-[#1B9157]/30 pl-3">
                                {forageInsight.sources.length} mapped forage sources are available for route and bloom balancing.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ForagingOptimizer;
