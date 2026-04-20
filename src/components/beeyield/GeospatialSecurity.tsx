import React from 'react';
import { MapPin, Shield, AlertTriangle, CheckCircle2, Zap, Navigation, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import { glass, PageHeader } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

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

const hiveMarkers: HiveMarker[] = [];

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
        const gatewaySub = beeyieldService.subscribeToGatewayStatus("*", (payload) => {
            const gatewayId = payload.new.id;
            toast.error(`Security Alert: Gateway ${gatewayId} is OFFLINE!`, {
                description: "Immediate check required in Block 4B.",
                duration: 10000
            });
            // Update local state if we had real mapping
        });

        const weightSub = beeyieldService.subscribeToWeightAlerts("*", (payload) => {
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* Header */}
            <PageHeader
                icon={Shield}
                label="Security"
                title={<>Hive <span className="text-[#F4D03F]">Security</span></>}
                subtitle="Live Hive Map · Asset Tracking · Environmental Density"
                actions={
                    <div className="flex items-center gap-3">
                        {alerts.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-red-500 font-bold text-[9px]">{alerts.length} ALERT{alerts.length > 1 ? 'S' : ''}</span>
                            </div>
                        )}
                        <button
                            onClick={() => setShowHeatmap(h => !h)}
                            className={cn(
                                glass.btnSecondary,
                                showHeatmap ? "bg-[#1A1A1A] text-white border-transparent" : "bg-muted/ border-border/"
                            )}
                        >
                            {showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
                        </button>
                    </div>
                }
            />

            {/* Alert Banners */}
            <AnimatePresence>
                {alerts.map(hive => (
                    <motion.div
                        key={hive.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            "flex items-start gap-4 p-4 border rounded-2xl",
                            hive.status === 'moved'
                                ? "bg-red-50 border-red-100"
                                : "bg-amber-50 border-amber-100"
                        )}
                    >
                        <AlertTriangle className={cn("w-4 h-4 mt-0.5 shrink-0", hive.status === 'moved' ? "text-red-500" : "text-amber-500")} />
                        <div>
                            <p className={cn("text-[10px] font-bold", hive.status === 'moved' ? "text-red-600" : "text-amber-600")}>
                                {hive.status === 'moved' ? `Security protocols breached — ${hive.id}` : `Location variance alert — ${hive.id}`}
                            </p>
                            <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                                {hive.status === 'moved'
                                    ? `Hive confirmed outside authorized perimeter in ${hive.block}.`
                                    : `Unexpected location drift detected in ${hive.block}. Please verify.`}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Map & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* The Orchard Map */}
                <div className="lg:col-span-8 space-y-4">
                    <div className={cn(glass.card, "bg-neutral-900 shadow-xl relative overflow-hidden group border-border/")} style={{ aspectRatio: '16/10' }}>
                        {hives.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center p-10">
                                <div className="text-center space-y-2">
                                    <MapPin className="w-8 h-8 text-white/30 mx-auto" />
                                    <p className="text-sm font-bold text-white/80">No hive location data yet</p>
                                    <p className="text-xs font-medium text-white/40 max-w-md">
                                        This map requires GPS/location telemetry from gateways or trackers. Connect devices to enable live security mapping.
                                    </p>
                                </div>
                            </div>
                        )}
                        {/* Heatmap layer */}
                        {showHeatmap && hives.length > 0 && (
                            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(6, 1fr)' }}>
                                {Array.from({ length: 48 }).map((_, i) => {
                                    const r = Math.floor(i / 8);
                                    const c = i % 8;
                                    const blockName =
                                        r < 3 && c < 4 ? 'Block 1C'
                                            : r < 3 && c >= 4 ? 'Block 2D'
                                                : r >= 3 && c < 4 ? 'Block 4B'
                                                    : 'Block 3A';

                                    const saturation = calculateSaturation(blockName, hives);
                                    const jittered = Math.max(0, Math.min(100, saturation + (Math.sin(i) * 5)));
                                    return <div key={i} style={{ backgroundColor: getHeatColor(jittered) }} />;
                                })}
                            </div>
                        )}

                        {/* Grid Lines */}
                        <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 pointer-events-none opacity-20">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="border border-border/" />
                            ))}
                        </div>

                        {/* Hive Markers */}
                        {hives.map(h => {
                            const s = statusConfig[h.status];
                            const isSelected = selected?.id === h.id;
                            return (
                                <button
                                    key={h.id}
                                    onClick={() => setSelected(h)}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-none group z-10"
                                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                                    aria-label={`Select hive ${h.id}`}
                                    title={`Select hive ${h.id}`}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-full border-2 border-border/ transition-all", s.dot,
                                        isSelected ? "scale-150 shadow-lg ring-4 ring-white/20" : "group-hover:scale-125 shadow-sm"
                                    )} />
                                </button>
                            );
                        })}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-6 pt-1">
                        {Object.entries(statusConfig).map(([key, s]) => (
                            <div key={key} className="flex items-center gap-2">
                                <div className={cn("w-2.5 h-2.5 rounded-full", s.dot.split(' ')[0])} />
                                <span className="text-[8px] font-black text-muted-foreground/70">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <div className={cn(glass.card, "p-5 bg-muted/ backdrop-blur-xl border-border/ shadow-xl space-y-4")}>
                        <div className="border-b border-border/ pb-3">
                            <h3 className="text-[10px] font-black text-foreground">Node_Integrity</h3>
                        </div>
                        <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
                            {hives.map(h => {
                                const s = statusConfig[h.status];
                                const isSelected = selected?.id === h.id;
                                return (
                                    <button
                                        key={h.id}
                                        onClick={() => setSelected(h)}
                                        className={cn(
                                            "w-full p-3 border rounded-2xl text-left transition-all",
                                            isSelected
                                                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-xl"
                                                : h.status !== 'nominal'
                                                    ? "border-amber-200/40 bg-amber-50/20"
                                                    : "border-border/ bg-muted/ hover:border-border/"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn("w-2 h-2 rounded-full", s.dot.split(' ')[0])} />
                                                <span className="text-[10px] font-black tracking-tight">{h.id}</span>
                                            </div>
                                            <span className={cn(
                                                "text-[8px] font-black px-2 py-0.5 rounded-lg",
                                                isSelected ? "bg-muted/ text-white" :
                                                    h.status === 'nominal' ? "bg-emerald-50 text-emerald-600" : "bg-amber-100 text-amber-600"
                                            )}>{s.label}</span>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <span className={cn("text-[8px] font-black", isSelected ? "text-white/40" : "text-muted-foreground/70")}>{h.block}</span>
                                            <div className="text-right">
                                                <p className={cn("text-[7px] font-black mb-1", isSelected ? "text-white/40" : "text-muted-foreground/70")}>DENSITY_{h.saturation}%</p>
                                                <div className={cn("h-1 w-16 rounded-full overflow-hidden", isSelected ? "bg-muted/" : "bg-gray-100")}>
                                                    <div
                                                        className={cn("h-full", h.saturation > 60 ? "bg-[#1B9157]" : h.saturation > 30 ? "bg-[#F4D03F]" : "bg-red-500")}
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
        </motion.div>
    );
};

export default GeospatialSecurity;

