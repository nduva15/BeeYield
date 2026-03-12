import React from 'react';
import { MapPin, Shield, AlertTriangle, CheckCircle2, Zap, Navigation, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';

interface GeospatialSecurityProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

interface HiveMarker {
    id: string;
    name: string;
    x: number; // 0-100 percentage within grid
    y: number;
    status: 'nominal' | 'alert' | 'moved';
    block: string;
    saturation: number; // 0-100
}

const hiveMarkers: HiveMarker[] = [
    { id: 'HV-001', name: 'Hive Alpha', x: 20, y: 25, status: 'nominal', block: 'Block 1C', saturation: 85 },
    { id: 'HV-002', name: 'Hive Bravo', x: 45, y: 20, status: 'nominal', block: 'Block 2D', saturation: 72 },
    { id: 'HV-003', name: 'Hive Charlie', x: 68, y: 35, status: 'moved', block: 'Block 3A', saturation: 30 },
    { id: 'HV-004', name: 'Hive Delta', x: 25, y: 62, status: 'nominal', block: 'Block 4B', saturation: 78 },
    { id: 'HV-005', name: 'Hive Echo', x: 55, y: 70, status: 'nominal', block: 'Block 4B', saturation: 91 },
    { id: 'HV-006', name: 'Hive Foxtrot', x: 78, y: 65, status: 'alert', block: 'Block 3A', saturation: 18 },
];

// Heatmap logic: 8x6 grid
// Blocks mapping:
const blockHives = {
    'Block 1C': { startCol: 0, endCol: 3, startRow: 0, endRow: 2, capacity: 50 },
    'Block 2D': { startCol: 4, endCol: 7, startRow: 0, endRow: 2, capacity: 50 },
    'Block 4B': { startCol: 0, endCol: 3, startRow: 3, endRow: 5, capacity: 50 },
    'Block 3A': { startCol: 4, endCol: 7, startRow: 3, endRow: 5, capacity: 50 },
};

const calculateSaturation = (blockName: string, hives: HiveMarker[]) => {
    const block = blockHives[blockName as keyof typeof blockHives];
    if (!block) return 0;
    const count = hives.filter(h => h.block === blockName).length;
    return Math.round((count / block.capacity) * 100);
};

const getHeatColor = (val: number) => {
    if (val >= 80) return 'rgba(16,185,129,0.60)';
    if (val >= 60) return 'rgba(16,185,129,0.35)';
    if (val >= 40) return 'rgba(250,204,21,0.35)';
    if (val >= 25) return 'rgba(234,88,12,0.30)';
    return 'rgba(239,68,68,0.25)';
};

const statusConfig = {
    nominal: { dot: 'bg-[#10b981]', label: 'OK', ring: 'ring-2 ring-[#10b981]/30' },
    alert: { dot: 'bg-[#facc15] animate-pulse', label: 'Location Alert', ring: 'ring-4 ring-[#facc15]/50 animate-pulse' },
    moved: { dot: 'bg-red-500 animate-pulse', label: 'Hive Moved', ring: 'ring-4 ring-red-500/50 animate-pulse' },
};

const GeospatialSecurity: React.FC<GeospatialSecurityProps> = ({ onTabChange }) => {
    const [selected, setSelected] = React.useState<HiveMarker | null>(null);
    const [showHeatmap, setShowHeatmap] = React.useState(true);
    const [hives, setHives] = React.useState<HiveMarker[]>(hiveMarkers);

    React.useEffect(() => {
        // Subscribe to real-time security alerts
        const gatewaySub = beeyieldService.subscribeToGatewayStatus((payload) => {
            const gatewayId = payload.new.id;
            toast.error(`Security Alert: Gateway ${gatewayId} is OFFLINE!`, {
                description: "Immediate check required in Block 4B.",
                duration: 10000
            });
            // Update local state if we had real mapping
        });

        const weightSub = beeyieldService.subscribeToWeightAlerts((payload) => {
            toast.error("Critical Event: Step-function weight drop detected!", {
                description: "Possible theft or swarming event in progress.",
                duration: 10000
            });
        });

        return () => {
            gatewaySub?.unsubscribe();
            weightSub?.unsubscribe();
        };
    }, []);

    const alerts = hives.filter(h => h.status !== 'nominal');

    return (
        <div className="p-4 md:p-8 space-y-8 md:space-y-12 bg-white min-h-screen text-[#064e3b] antialiased border-x-4 border-[#064e3b]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center">
                            <Shield className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Hive <span className="text-[#10b981]">Map</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Live Hive Map · Hive Tracking · Bee Density
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {alerts.length > 0 && (
                        <div className="flex items-center gap-2 px-5 py-2 bg-red-500 border-2 border-red-700">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-gray-900 font-black text-[10px] uppercase tracking-widest">{alerts.length} Location Alert{alerts.length > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    <button
                        onClick={() => setShowHeatmap(h => !h)}
                        className={cn(
                            "px-5 py-2 border-4 text-[10px] font-black uppercase tracking-widest",
                            showHeatmap ? "bg-[#064e3b] border-[#064e3b] text-gray-900" : "bg-white border-[#064e3b] text-[#064e3b]"
                        )}
                    >
                        {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
                    </button>
                </div>
            </div>

            {/* Alert Banners */}
            {alerts.map(hive => (
                <div
                    key={hive.id}
                    className={cn(
                        "flex items-start gap-4 p-4 border-l-8 border-4",
                        hive.status === 'moved'
                            ? "bg-red-50 border-red-400 border-l-red-500"
                            : "bg-[#facc15]/10 border-[#facc15] border-l-[#facc15]"
                    )}
                >
                    <AlertTriangle className={cn("w-5 h-5 mt-0.5 shrink-0", hive.status === 'moved' ? "text-red-500" : "text-[#b45309]")} />
                    <div>
                        <p className={cn("text-xs font-black uppercase tracking-widest", hive.status === 'moved' ? "text-red-700" : "text-[#b45309]")}>
                            {hive.status === 'moved' ? `⚠ Hive Moved — ${hive.id} (${hive.name})` : `⚠ Location Alert — ${hive.id} (${hive.name})`}
                        </p>
                        <p className="text-[10px] font-bold text-neutral-500 mt-1">
                            {hive.status === 'moved'
                                ? `Hive moved from its spot in ${hive.block}. Marked RED on map.`
                                : `Hive is close to the edge of ${hive.block}. Please check its position.`}
                        </p>
                    </div>
                </div>
            ))}

            {/* Map & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* The Orchard Map */}
                <div className="lg:col-span-8 space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#064e3b]/40">Farm Map</h3>
                    <div className="border-4 border-[#064e3b] bg-[#064e3b]/3 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                        {/* Heatmap layer */}
                        {showHeatmap && (
                            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(6, 1fr)' }}>
                                {Array.from({ length: 48 }).map((_, i) => {
                                    const r = Math.floor(i / 8);
                                    const c = i % 8;
                                    let blockName = '';
                                    if (r < 3 && c < 4) blockName = 'Block 1C';
                                    else if (r < 3 && c >= 4) blockName = 'Block 2D';
                                    else if (r >= 3 && c < 4) blockName = 'Block 4B';
                                    else blockName = 'Block 3A';

                                    const saturation = calculateSaturation(blockName, hives);
                                    // Add some jitter for a more organic feel
                                    const jittered = Math.max(0, Math.min(100, saturation + (Math.sin(i) * 5)));
                                    return <div key={i} style={{ backgroundColor: getHeatColor(jittered) }} />;
                                })}
                            </div>
                        )}

                        {/* Grid Lines (orchard blocks) */}
                        <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 pointer-events-none">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="border border-[#064e3b]/10" />
                            ))}
                        </div>

                        {/* Block Labels */}
                        {[
                            { label: 'Block 1C', x: '2%', y: '2%' },
                            { label: 'Block 2D', x: '27%', y: '2%' },
                            { label: 'Block 3A', x: '52%', y: '2%' },
                            { label: 'Block 4B', x: '2%', y: '52%' },
                        ].map(b => (
                            <span key={b.label} className="absolute text-[8px] font-black uppercase text-[#064e3b]/30 tracking-widest" style={{ left: b.x, top: b.y }}>
                                {b.label}
                            </span>
                        ))}

                        {/* Hive Markers */}
                        {hives.map(h => {
                            const s = statusConfig[h.status];
                            const isSelected = selected?.id === h.id;
                            return (
                                <button
                                    key={h.id}
                                    onClick={() => setSelected(h)}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-none group"
                                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 border-white", s.dot,
                                        isSelected ? "scale-150" : "group-hover:scale-125"
                                    )} />
                                    <span className="absolute left-6 top-0 bg-[#064e3b] text-gray-900 text-[8px] font-black uppercase px-2 py-0.5 tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100">
                                        {h.id}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-6 pt-1">
                        {Object.entries(statusConfig).map(([key, s]) => (
                            <div key={key} className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full", s.dot.split(' ')[0])} />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/40">{s.label}</span>
                            </div>
                        ))}
                        {showHeatmap && (
                            <>
                                {[
                                    { color: 'bg-[#10b981]/60', label: 'High Density' },
                                    { color: 'bg-[#facc15]/40', label: 'Medium' },
                                    { color: 'bg-red-400/30', label: 'Low Density' },
                                ].map(l => (
                                    <div key={l.label} className="flex items-center gap-2">
                                        <div className={cn("w-5 h-3", l.color)} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/40">{l.label}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* Hive Detail Panel */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#064e3b]/40">Hive List</h3>
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                        {hives.map(h => {
                            const s = statusConfig[h.status];
                            const isSelected = selected?.id === h.id;
                            return (
                                <button
                                    key={h.id}
                                    onClick={() => setSelected(h)}
                                    className={cn(
                                        "w-full p-4 border-4 text-left transition-none space-y-3",
                                        isSelected
                                            ? "bg-[#064e3b] border-[#064e3b]"
                                            : h.status !== 'nominal'
                                                ? "border-[#facc15] hover:bg-[#064e3b]/5"
                                                : "border-[#064e3b]/20 hover:border-[#064e3b]"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-2.5 h-2.5 rounded-full", s.dot.split(' ')[0])} />
                                            <span className={cn("text-xs font-black uppercase", isSelected ? "text-gray-900" : "text-[#064e3b]")}>{h.id}</span>
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase px-2 py-0.5",
                                            isSelected ? "bg-white/10 text-gray-900" :
                                                h.status === 'nominal' ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#facc15]/30 text-[#b45309]"
                                        )}>{s.label}</span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className={cn("text-[9px] font-bold uppercase", isSelected ? "text-gray-500" : "text-[#064e3b]/30")}>{h.block}</p>
                                        </div>
                                        {/* Saturation mini bar */}
                                        <div className="w-24 space-y-1">
                                            <p className={cn("text-[8px] font-black uppercase text-right", isSelected ? "text-gray-600" : "text-[#064e3b]/30")}>
                                                Density {h.saturation}%
                                            </p>
                                            <div className="h-1.5 bg-gray-50 w-full">
                                                <div
                                                    className={cn("h-full", h.saturation > 60 ? "bg-[#10b981]" : h.saturation > 30 ? "bg-[#facc15]" : "bg-red-500")}
                                                    style={{ width: `${h.saturation}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeospatialSecurity;
