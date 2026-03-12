import React from 'react';
import { MapPin, ShieldAlert, Hexagon, Trash2, RotateCcw, Crosshair, ClipboardList, Save, Share2, Info, ArrowRight, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
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
const GRID_H = 500;

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

        // Limit placement within SVG bounds visually
        if (x < 0 || x > GRID_W || y < 0 || y > GRID_H) return;

        setPallets(prev => [...prev, {
            id: `PAL-${Date.now()}`,
            x, y,
            hives: 4,
            coverageRadius: 80
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-12 pb-20 min-h-screen")}
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-border/50 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 mb-2')}>
                        <Crosshair className="w-4 h-4 mr-2" />
                        Geospatial Deployment Planner v4.1
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Field <span className="text-honey">Planner</span>
                    </h1>
                    <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70")}>
                        Interactive Simulation · Coverage Optimization · Logistical Tracking
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className={cn(glass.card, "px-8 py-3 bg-white/40 flex flex-col items-center justify-center border-border/50 shadow-sm")}>
                        <span className={cn(glass.microLabel, "opacity-40 italic font-bold mb-1")}>EXPECTED_COVERAGE</span>
                        <span className={cn(glass.sectionTitle, "text-2xl text-honey italic")}>{avgCoverage}%</span>
                    </div>
                    <div className={cn(glass.card, "px-8 py-3 bg-white/40 flex flex-col items-center justify-center border-border/50 shadow-sm")}>
                        <span className={cn(glass.microLabel, "opacity-40 italic font-bold mb-1")}>ACTIVE_HIVES</span>
                        <span className={cn(glass.sectionTitle, "text-2xl")}>{totalHives}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Simulation Area */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "flex flex-col sm:flex-row items-center justify-between p-6 bg-white/40 border-border shadow-md gap-6")}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-honey/10 flex items-center justify-center border border-honey/20">
                                <Info className="w-5 h-5 text-honey" />
                            </div>
                            <span className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70 leading-tight")}>
                                Click on the grid to place hive trays. <br className="hidden sm:block" /> Drag existing trays to optimize spatial coverage.
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPallets([])}
                                className={cn(glass.btnSecondary, "w-12 h-12 p-0 flex items-center justify-center group")}
                                title="Reset Grid"
                            >
                                <RotateCcw className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform" />
                            </button>
                            <button className={cn(glass.btnPrimary, "h-12 px-8 font-bold shadow-lg shadow-honey/20")}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Field Plan
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className={cn(glass.card, "p-0 h-[550px] relative overflow-hidden shadow-2xl border-honey/10 group")}
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-honey/5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20 group-hover:bg-honey/10 transition-colors" />

                        <svg
                            ref={svgRef}
                            viewBox={`0 0 ${GRID_W} ${GRID_H}`}
                            onClick={handleSVGClick}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            className="w-full h-full cursor-crosshair select-none relative z-10"
                            style={{
                                backgroundImage: `radial-gradient(hsl(var(--honey) / 0.15) 1.5px, transparent 1.5px)`,
                                backgroundSize: '40px 40px'
                            }}
                        >
                            {/* Coverage Shadows */}
                            <AnimatePresence>
                                {pallets.map(p => (
                                    <motion.circle
                                        key={`shadow-${p.id}`}
                                        initial={{ r: 0, opacity: 0 }}
                                        animate={{ r: p.coverageRadius, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        cx={p.x} cy={p.y}
                                        fill="hsl(var(--honey) / 0.08)"
                                        className="pointer-events-none"
                                        style={{ stroke: 'hsl(var(--honey) / 0.1)', strokeWidth: 1 }}
                                    />
                                ))}
                            </AnimatePresence>

                            {/* Pallets */}
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
                                        d="M 0 -20 L 17 -10 L 17 10 L 0 20 L -17 10 L -17 -10 Z"
                                        fill={draggingPallet === p.id ? "hsl(var(--honey))" : "white"}
                                        stroke="hsl(var(--honey))"
                                        strokeWidth={draggingPallet === p.id ? 4 : 2}
                                        className="transition-all duration-300 drop-shadow-lg"
                                    />
                                    <text
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize="10"
                                        fontWeight="900"
                                        fill={draggingPallet === p.id ? "white" : "hsl(var(--honey))"}
                                        className="pointer-events-none"
                                    >4</text>

                                    {/* Hover delete button hint could go here with a small x icon */}
                                </g>
                            ))}
                        </svg>
                    </motion.div>
                </div>

                {/* Operations & Logs */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Management by Exception - Alert View */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn(glass.card, "p-8 space-y-8 bg-destructive/5 border-destructive/20 shadow-xl relative overflow-hidden group")}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-2xl pointer-events-none group-hover:bg-destructive/15 transition-colors" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center border border-destructive shadow-sm">
                                <ShieldAlert className="w-6 h-6 text-destructive" />
                            </div>
                            <h3 className={cn(glass.sectionTitle, "text-xl normal-case italic text-destructive")}>Security Alerts</h3>
                        </div>
                        <div className="space-y-4 relative z-10">
                            {[
                                { title: 'Hive Tipped Over: Area 4', desc: 'Acoustic spike detected. Probable external disturbance.' },
                                { title: 'Hive Moved: WAT-012', desc: 'GPS offset detected beyond threshold. High theft risk.' }
                            ].map((alert, i) => (
                                <div key={i} className="flex items-start gap-4 p-5 bg-white/40 rounded-2xl border border-destructive/20 group/alert hover:bg-destructive/10 transition-colors shadow-sm">
                                    <div className="w-2.5 h-2.5 rounded-full bg-destructive mt-1.5 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                    <div>
                                        <p className={cn(glass.microLabel, "text-sm font-bold text-destructive leading-none")}>{alert.title}</p>
                                        <p className={cn(glass.microLabel, "opacity-60 italic mt-2 normal-case leading-snug")}>{alert.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Field Logs */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={cn(glass.card, "p-8 space-y-8 shadow-xl border-border/50 relative overflow-hidden")}
                    >
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                        <div className="flex items-center gap-4 border-b border-border/20 pb-6 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center border border-emerald-500/30 shadow-sm">
                                <ClipboardList className="w-5 h-5 text-emerald-500" />
                            </div>
                            <h3 className={cn(glass.sectionTitle, "text-xl normal-case italic")}>Field Activity Logs</h3>
                        </div>

                        <div className="space-y-6 max-h-[320px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                            {logs.map((log, idx) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (idx * 0.1) }}
                                    className="group hover:bg-white/40:bg-gray-100 rounded-xl p-3 -m-3 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-1.5 h-1.5 rounded-full", log.type === 'syrup' ? 'bg-honey' : 'bg-indigo-500')} />
                                            <span className={cn(glass.microLabel, "text-xs font-bold font-sans opacity-70 group-hover:opacity-100 transition-opacity uppercase tracking-widest")}>
                                                {log.type === 'syrup' ? '⚡ Feeding' : '🛡 Mite Check'}
                                            </span>
                                        </div>
                                        <span className={cn(glass.microLabel, "opacity-30 tabular-nums font-bold")}>{log.time}</span>
                                    </div>
                                    <p className="text-sm italic font-medium opacity-80 leading-relaxed text-foreground/80 group-hover:text-foreground group-hover:opacity-100 transition-all">
                                        {log.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <button className={cn(glass.btnSecondary, "w-full h-14 justify-center border-dashed font-bold mt-2 hover:bg-honey/5 hover:border-honey/40 transition-colors uppercase tracking-[0.2em] relative z-10")}>
                            + Add Entry
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* AI Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={cn(glass.card, "p-8 shadow-xl bg-honey/5 border-honey/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-honey/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-honey/15 transition-colors" />
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/60 flex items-center justify-center shrink-0 border border-honey shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Info className="w-8 h-8 text-honey" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h5 className={cn(glass.sectionTitle, "text-2xl normal-case mb-2")}>Planner Optimization Insight</h5>
                    <p className="text-sm italic font-medium opacity-80 leading-relaxed max-w-4xl text-foreground">
                        Your current field plan covers approximately 82% of the targeted orchard geometry. Drag the trays in Section A-4 further north-east to close the pollination gap.
                        Security alerts in Area 4 require urgent ground-truth verification due to recursive acoustic tipping signals.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DeploymentPlanning;
