import React from 'react';
import { MapPin, ShieldAlert, Hexagon, Trash2, RotateCcw, Crosshair, ClipboardList, Save, Share2, Info, ArrowRight, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface DeploymentPlanningProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

interface Pallet {
    id: string;
    x: number;
    y: number;
    hives: number;
    coverageRadius: number;
}

const GRID_W = 800;
const GRID_H = 400;

const DeploymentPlanning: React.FC<DeploymentPlanningProps> = ({ onTabChange }) => {
    const [pallets, setPallets] = React.useState<Pallet[]>([]);
    const [draggingPallet, setDraggingPallet] = React.useState<string | null>(null);
    const [logs, setLogs] = React.useState([
        { id: 1, type: 'syrup', desc: 'Area 4 Syrup Feeding complete (250 gal)', time: '09:00' },
        { id: 2, type: 'mite', desc: 'Mite check Area 12 - normal', time: '10:15' },
    ]);
    const svgRef = React.useRef<SVGSVGElement>(null);

    const handleSVGClick = (e: React.MouseEvent) => {
        if (draggingPallet) return;
        const rect = svgRef.current!.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);

        if (x < 0 || x > GRID_W || y < 0 || y > GRID_H) return;

        setPallets(prev => [...prev, {
            id: `PAL-${Date.now()}`,
            x, y,
            hives: 4,
            coverageRadius: 60
        }]);
    };

    const handlePalletDrag = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDraggingPallet(id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingPallet) return;
        const rect = svgRef.current!.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);

        setPallets(prev => prev.map(p => p.id === draggingPallet ? { ...p, x, y } : p));
    };

    const handleMouseUp = () => setDraggingPallet(null);

    const totalHives = pallets.reduce((acc, p) => acc + p.hives, 0);
    const avgCoverage = pallets.length > 0 ? 82 : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Crosshair}
                label="Map"
                title={<>Field <span className="text-[#1B9157]">Planner</span></>}
                subtitle="Plan placements on a map."
                actions={
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg shadow-sm">
                            <span className="text-[10px] font-bold text-emerald-600 opacity-60 leading-none mb-1">Coverage</span>
                            <span className="text-sm font-bold text-emerald-700 leading-none">{avgCoverage}%</span>
                        </div>
                        <div className="flex flex-col items-end px-3 py-1 bg-muted/20 border border-amber-100 rounded-lg shadow-sm">
                            <span className="text-[10px] font-bold text-amber-600 opacity-60 leading-none mb-1">Units</span>
                            <span className="text-sm font-bold text-amber-700 leading-none">{totalHives}</span>
                        </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Simulation Area */}
                <div className="lg:col-span-8 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white gap-4 border-gray-200")}
                    >
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 shadow-sm">
                                <Info className="w-5 h-5 text-muted-foreground/70" />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground leading-relaxed uppercase tracking-tighter sm:tracking-normal">
                                Click the grid to add units. <br /> Drag to adjust placement.
                            </p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setPallets([])}
                                className={cn(glass.btnSecondary, "w-10 h-10 p-0 flex items-center justify-center bg-white")}
                                aria-label="Reset"
                                title="Reset"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button className={cn(glass.btnPrimary, "h-10 px-6 font-bold text-xs flex-1 sm:flex-none")}>
                                <Save className="w-4 h-4 mr-2" />
                                Commit Map
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(glass.card, "p-0 h-[480px] relative overflow-hidden bg-gray-50 border-gray-200")}
                    >
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent)]" />
                         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        <svg
                            ref={svgRef}
                            viewBox={`0 0 ${GRID_W} ${GRID_H}`}
                            onClick={handleSVGClick}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            className="w-full h-full cursor-crosshair select-none relative z-10"
                        >
                            <AnimatePresence>
                                {pallets.map(p => (
                                    <motion.circle
                                        key={`shadow-${p.id}`}
                                        initial={{ r: 0, opacity: 0 }}
                                        animate={{ r: p.coverageRadius, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        cx={p.x} cy={p.y}
                                        fill="#F4D03F"
                                        fillOpacity={0.06}
                                        stroke="#F4D03F"
                                        strokeOpacity={0.15}
                                        strokeWidth={1.5}
                                        className="pointer-events-none"
                                    />
                                ))}
                            </AnimatePresence>

                            {pallets.map(p => (
                                <g
                                    key={p.id}
                                    transform={`translate(${p.x},${p.y})`}
                                    onMouseDown={(e) => handlePalletDrag(e, p.id)}
                                    className="cursor-move group/pallet"
                                >
                                    <motion.path
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        d="M 0 -15 L 13 -7.5 L 13 7.5 L 0 15 L -13 7.5 L -13 -7.5 Z"
                                        fill={draggingPallet === p.id ? "#F4D03F" : "white"}
                                        stroke={draggingPallet === p.id ? "#D97706" : "#F4D03F"}
                                        strokeWidth={draggingPallet === p.id ? 2.5 : 1.5}
                                        className="transition-all duration-200 shadow-xl"
                                    />
                                    <text
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize="9"
                                        fontWeight="900"
                                        fill={draggingPallet === p.id ? "white" : "#1A1A1A"}
                                        className="pointer-events-none"
                                    >4</text>
                                </g>
                            ))}
                        </svg>
                    </motion.div>
                </div>

                {/* Operations & Logs */}
                <div className="lg:col-span-4 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-5 bg-white border-red-100 shadow-sm overflow-hidden")}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 text-red-500 shadow-sm">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-red-600 tracking-tight">Incident Registry</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { title: 'Tilt Detected: Sector A4', desc: 'Acoustic spike at sensor 04. Ground check recommended.' },
                                { title: 'GPS Drift: Unit WAT-12', desc: 'Perimeter breach detected. Theft alert sent.' }
                            ].map((alert, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-red-50/50 rounded-xl border border-dotted border-red-200 group">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0 animate-pulse" />
                                    <div>
                                        <p className="text-[10px] font-bold text-red-700 tracking-wider mb-1 leading-none">{alert.title}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">{alert.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-0 overflow-hidden bg-white border-gray-200 shadow-sm")}
                    >
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                <ClipboardList className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-bold text-foreground tracking-tight">Operational Logs</h3>
                        </div>

                        <div className="p-4 space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar">
                            {logs.map((log, idx) => (
                                <div key={log.id} className="group flex flex-col gap-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-1.5 h-1.5 rounded-full", log.type === 'syrup' ? 'bg-[#F4D03F]' : 'bg-[#1B9157]')} />
                                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
                                                {log.type === 'syrup' ? 'System_Feeding' : 'Registry_Audit'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-300 group-hover:text-muted-foreground/70 transition-colors">{log.time}</span>
                                    </div>
                                    <p className="text-[11px] font-medium text-foreground leading-relaxed border-l-2 border-gray-100 pl-3 group-hover:border-[#F4D03F] transition-colors">
                                        {log.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                            <button className={cn(glass.btnSecondary, "w-full h-9 bg-white border-dashed text-xs font-bold")}>
                                + Append Entry
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-5 lg:p-6 bg-white border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 relative overflow-hidden group shadow-sm")}
            >
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-muted/ blur-2xl rounded-full" />
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200 shadow-sm group-hover:bg-[#1B9157]/5 group-hover:border-[#1B9157]/20 transition-colors">
                    <Info className="w-6 h-6 text-muted-foreground/70 group-hover:text-[#1B9157] transition-colors" />
                </div>
                <div className="flex-1 space-y-1 relative z-10">
                    <h5 className="text-sm font-bold text-foreground tracking-tight">Intelligence Sync</h5>
                    <p className="text-[11px] font-medium text-muted-foreground leading-relaxed tracking-tighter sm:tracking-normal border-l-2 border-[#1B9157] pl-4">
                        Current field plan coverage at <span className="text-foreground font-bold">82%</span>. Shift Section A-4 trajectories North-East to close gap.
                        Security flags in Sector 4 require urgent ground verification.
                    </p>
                </div>
            </motion.div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
            `}</style>
        </motion.div>
    );
};

export default DeploymentPlanning;

