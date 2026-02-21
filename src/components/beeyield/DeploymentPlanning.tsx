import React from 'react';
import { MapPin, ShieldAlert, Hexagon, Trash2, RotateCcw, Crosshair, ClipboardList, Save, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    const avgCoverage = pallets.length > 0 ? 82 : 0; // Simulated coverage math

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_#facc15]">
                            <Crosshair className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Field <span className="text-[#10b981]">Planner</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Planning Space · Tray Tracking · Coverage Estimate
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="border-4 border-[#064e3b] px-6 py-2 bg-[#064e3b] text-white flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Expected Coverage</span>
                        <span className="text-xl font-black italic">{avgCoverage}%</span>
                    </div>
                    <div className="border-4 border-[#064e3b] px-6 py-2 bg-white flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/40">Active Hives</span>
                        <span className="text-xl font-black">{totalHives}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Simulation Area */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between border-4 border-[#064e3b]/10 p-4 bg-[#064e3b]/3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">Click to place hive trays · Drag to reposition</span>
                        <div className="flex gap-3">
                            <button onClick={() => setPallets([])} className="p-2 border-2 border-[#064e3b] hover:bg-white transition-none"><RotateCcw className="w-4 h-4" /></button>
                            <button className="px-4 py-2 bg-[#064e3b] text-white font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_#10b981]">Save Field Plan</button>
                        </div>
                    </div>

                    <div className="border-8 border-[#064e3b] bg-white h-[500px] relative overflow-hidden shadow-[15px_15px_0px_0px_rgba(6,78,59,0.05)]">
                        <svg
                            ref={svgRef}
                            width={GRID_W}
                            height={GRID_H}
                            onClick={handleSVGClick}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            className="w-full h-full cursor-crosshair select-none"
                            style={{ backgroundImage: 'radial-gradient(#064e3b10 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                        >
                            {/* Coverage Shadows */}
                            {pallets.map(p => (
                                <circle
                                    key={`shadow-${p.id}`}
                                    cx={p.x} cy={p.y} r={p.coverageRadius}
                                    fill="rgba(16,185,129,0.1)"
                                    className="pointer-events-none"
                                />
                            ))}

                            {/* Pallets */}
                            {pallets.map(p => (
                                <g
                                    key={p.id}
                                    transform={`translate(${p.x},${p.y})`}
                                    onMouseDown={(e) => handlePalletDrag(e, p.id)}
                                    className="cursor-move"
                                >
                                    <polygon
                                        points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8"
                                        fill={draggingPallet === p.id ? "#facc15" : "#064e3b"}
                                        stroke="white"
                                        strokeWidth={2}
                                    />
                                    <text
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize="9"
                                        fontWeight="900"
                                        fill={draggingPallet === p.id ? "#064e3b" : "white"}
                                    >4</text>
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* Operations & Logs */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Management by Exception */}
                    <div className="border-4 border-red-500 p-8 bg-red-50">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert className="w-5 h-5 text-red-600" />
                            <h3 className="text-xl font-black uppercase text-red-600 tracking-tight">Security Alerts</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-white border-2 border-red-500">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-1 animate-ping" />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-red-600">Hive Tipped Over: Area 4</p>
                                    <p className="text-[8px] font-bold text-red-600/50 uppercase mt-1">Movement detected. Likely the wind or animals.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white border-2 border-red-500">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-1 animate-ping" />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-red-600">Hive Moved: Hive WAT-012</p>
                                    <p className="text-[8px] font-bold text-red-600/50 uppercase mt-1">Colony moved 1.2km outside safe area. Possible theft.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Field Logs */}
                    <div className="border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#10b981]">
                        <div className="flex items-center gap-3 mb-8 border-b-2 border-[#064e3b]/10 pb-4">
                            <ClipboardList className="w-5 h-5 text-[#10b981]" />
                            <h3 className="text-xl font-black uppercase text-[#064e3b] tracking-tight">Field Logs</h3>
                        </div>
                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                            {logs.map(log => (
                                <div key={log.id} className="border-b-2 border-[#064e3b]/5 pb-4 last:border-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-black uppercase text-[#064e3b]">{log.type === 'syrup' ? '⚡ Feeding' : '🛡 Mite Check'}</span>
                                        <span className="text-[8px] font-black text-[#064e3b]/30">{log.time}</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-[#064e3b]/60 uppercase">{log.desc}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 bg-[#064e3b]/3 border-2 border-dashed border-[#064e3b]/20 text-[10px] font-black uppercase tracking-widest text-[#064e3b]/40 hover:bg-[#064e3b] hover:text-white transition-all">
                            + Add Field Log Entry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeploymentPlanning;
