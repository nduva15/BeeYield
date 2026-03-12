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
            className={cn(glass.page, "max-w-7xl mx-auto space-y-6 pb-24")}
        >
            <PageHeader
                icon={Crosshair}
                label="Geospatial Node"
                title={<>Field <span className="text-[#F4D03F]">Planner</span></>}
                subtitle="Interactive geospatial deployment protocols for precision apiary logistics."
                actions={
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end px-4 py-1.5 bg-[#1B9157]/5 border border-[#1B9157]/10 rounded-xl">
                            <span className="text-[7px] font-black uppercase text-[#1B9157] opacity-60 italic leading-none">Expected Coverage</span>
                            <span className="text-[13px] font-black text-[#1B9157] italic mt-1">{avgCoverage}%</span>
                        </div>
                        <div className="flex flex-col items-end px-4 py-1.5 bg-[#F4D03F]/5 border border-[#F4D03F]/10 rounded-xl">
                            <span className="text-[7px] font-black uppercase text-[#F4D03F] opacity-60 italic leading-none">Active Units</span>
                            <span className="text-[13px] font-black text-[#F4D03F] italic mt-1">{totalHives}</span>
                        </div>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Simulation Area */}
                <div className="lg:col-span-8 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.section, "flex items-center justify-between p-4 bg-white/40")}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/10">
                                <Info className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                            <p className="text-[10px] font-black uppercase italic opacity-40 leading-tight">
                                Click grid to initialize units. <br /> Drag units to optimize geospatial flow.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPallets([])}
                                className={cn(glass.btnSecondary, "w-10 h-10 p-0 flex items-center justify-center")}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button className={cn(glass.btnPrimary, "h-10 px-6 italic")}>
                                <Save className="w-3.5 h-3.5 mr-2" />
                                Commit Map
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(glass.section, "p-0 h-[480px] relative overflow-hidden bg-[#1A1A1A]/5")}
                    >
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
                                        fillOpacity={0.08}
                                        stroke="#F4D03F"
                                        strokeOpacity={0.1}
                                        strokeWidth={1}
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
                                        stroke="#F4D03F"
                                        strokeWidth={draggingPallet === p.id ? 3 : 1.5}
                                        className="transition-all duration-200 shadow-xl"
                                    />
                                    <text
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize="9"
                                        fontWeight="900"
                                        fill={draggingPallet === p.id ? "white" : "#F4D03F"}
                                        className="pointer-events-none italic"
                                    >4</text>
                                </g>
                            ))}
                        </svg>
                    </motion.div>
                </div>

                {/* Operations & Logs */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-5 bg-red-500/5 border-red-500/10 border-l-4 border-l-red-500 shadow-sm")}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center border border-red-100 text-red-500">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <h3 className="text-[12px] font-black uppercase italic tracking-tight text-red-600">Incident Registry</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { title: 'Tilt Detected: Sector A4', desc: 'Acoustic spike at node 04. Ground verification required.' },
                                { title: 'GPS Drift: Unit WAT-12', desc: 'Perimeter breach detected. Theft protocol initialized.' }
                            ].map((alert, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-white/40 rounded-xl border border-red-500/5 group">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0 animate-pulse" />
                                    <div>
                                        <p className="text-[10px] font-black text-red-600 uppercase italic leading-none">{alert.title}</p>
                                        <p className="text-[9px] font-medium opacity-60 uppercase italic mt-1 leading-tight">{alert.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.section, "p-5 bg-white/40")}
                    >
                        <div className="flex items-center gap-3 border-b border-[#F4D03F]/10 pb-4 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-[#1B9157]/10 flex items-center justify-center border border-[#1B9157]/10">
                                <ClipboardList className="w-4 h-4 text-[#1B9157]" />
                            </div>
                            <h3 className="text-[11px] font-black uppercase italic tracking-widest text-[#1A1A1A]">Operational Logs</h3>
                        </div>

                        <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar">
                            {logs.map((log, idx) => (
                                <div key={log.id} className="group">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-1 h-1 rounded-full", log.type === 'syrup' ? 'bg-[#F4D03F]' : 'bg-blue-500')} />
                                            <span className="text-[9px] font-black uppercase italic text-gray-400 group-hover:text-gray-600">
                                                {log.type === 'syrup' ? 'System_Feeding' : 'Registry_Audit'}
                                            </span>
                                        </div>
                                        <span className="text-[8px] font-black opacity-20 italic">{log.time}</span>
                                    </div>
                                    <p className="text-[10px] font-medium opacity-70 uppercase italic leading-tight pl-3">
                                        {log.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <button className={cn(glass.btnSecondary, "w-full h-10 mt-6 border-dashed text-[9px] italic")}>
                            + Append Entry
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* AI Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-6 bg-[#F4D03F]/5 border-[#F4D03F]/10 flex items-center gap-6 relative overflow-hidden group")}
            >
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#F4D03F]/10 blur-3xl rounded-full" />
                <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shrink-0 border border-[#F4D03F] shadow-sm">
                    <Info className="w-6 h-6 text-[#F4D03F]" />
                </div>
                <div className="flex-1 space-y-1 relative z-10">
                    <h5 className="text-[13px] font-black uppercase italic tracking-tight text-[#1A1A1A]">Intelligence <span className="text-[#F4D03F]">Sync</span></h5>
                    <p className="text-[10px] font-medium opacity-60 leading-relaxed uppercase italic tracking-tight border-l-2 border-[#F4D03F] pl-4">
                        Current field plan coverage at <span className="text-black font-black">82%</span>. Shift Section A-4 trajectories North-East to close gap.
                        Security flags in Sector 4 require urgent ground verification.
                    </p>
                </div>
            </motion.div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(244, 208, 63, 0.2); border-radius: 10px; }
            `}</style>
        </motion.div>
    );
};

export default DeploymentPlanning;
