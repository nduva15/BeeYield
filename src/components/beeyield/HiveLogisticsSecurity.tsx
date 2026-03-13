import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Shield, Crosshair, Hexagon, AlertCircle, Plus, Info, Zap, Trash2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';

interface HiveLogisticsSecurityProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

interface Pallet {
    id: string;
    x: number;
    y: number;
    hives: number;
    isSecure: boolean;
}

const HiveLogisticsSecurity: React.FC<HiveLogisticsSecurityProps> = ({ onTabChange }) => {
    const [pallets, setPallets] = React.useState<Pallet[]>([
        { id: 'PAL-001', x: 200, y: 150, hives: 4, isSecure: true },
        { id: 'PAL-002', x: 450, y: 300, hives: 4, isSecure: true },
    ]);
    const [addingHive, setAddingHive] = React.useState(false);
    const svgRef = React.useRef<SVGSVGElement>(null);

    const handleSVGClick = (e: React.MouseEvent) => {
        if (!addingHive) return;
        const rect = svgRef.current!.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);

        const newPallet: Pallet = {
            id: `PAL-${Date.now()}`,
            x, y,
            hives: 4,
            isSecure: true
        };

        setPallets(prev => [...prev, newPallet]);
        setAddingHive(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* Header */}
            <PageHeader
                icon={Shield}
                label="Bee_Map_Virtual_Fence_Live_Log"
                title={<>Hive <span className="text-[#F4D03F]">Tracking</span></>}
                subtitle="Live geofenced hive placements and security monitoring."
                actions={
                    <button
                        onClick={() => setAddingHive(true)}
                        className={cn(
                            glass.btnPrimary,
                            addingHive ? "animate-pulse ring-2 ring-[#F4D03F]" : ""
                        )}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {addingHive ? 'Click_Map' : 'Track_New_Hives'}
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 3D Map Interface */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className={cn(glass.card, "bg-white/40 border-white/20 h-[500px] relative overflow-hidden shadow-xl p-0")}>
                        {/* Satellite-style underlying grid effect */}
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#064e3b 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                        <svg
                            ref={svgRef}
                            className="absolute inset-0 w-full h-full cursor-crosshair"
                            onClick={handleSVGClick}
                        >
                            {/* Security Geofence Rings */}
                            {pallets.map(p => (
                                <circle
                                    key={`fence-${p.id}`}
                                    cx={p.x} cy={p.y} r="60"
                                    fill="rgba(16,185,129,0.03)"
                                    stroke="rgba(16,185,129,0.15)"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                            ))}

                            {/* Isometric Pallet Icons */}
                            {pallets.map(p => (
                                <g key={p.id} transform={`translate(${p.x},${p.y})`} className="cursor-pointer group">
                                    <ellipse cx="0" cy="8" rx="10" ry="4" fill="rgba(0,0,0,0.05)" />
                                    <path
                                        d="M -10,-6 L 0,-11 L 10,-6 L 10,3 L 0,8 L -10,3 Z"
                                        fill="#064e3b"
                                        stroke="white"
                                        strokeWidth="1.5"
                                    />
                                    <text
                                        y="-1"
                                        textAnchor="middle"
                                        fontSize="6"
                                        fontWeight="900"
                                        fill="white"
                                    >{p.hives}</text>

                                    {p.isSecure && (
                                        <circle cx="8" cy="-8" r="3" fill="#10b981" className="animate-pulse" />
                                    )}
                                </g>
                            ))}
                        </svg>

                        <div className="absolute bottom-6 left-6 p-4 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl">
                            <h4 className="text-[9px] font-black uppercase text-[#1A1A1A] mb-3 tracking-[0.3em] border-b border-[#F4D03F]/10 pb-2">Hive_Stats</h4>
                            <div className="flex gap-8">
                                <div className="space-y-0.5">
                                    <p className="text-[7px] font-black uppercase tracking-widest text-gray-400">ACTIVE</p>
                                    <p className="text-lg font-black text-[#1A1A1A]">{pallets.length}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[7px] font-black uppercase tracking-widest text-gray-400">COVERAGE</p>
                                    <p className="text-lg font-black text-[#10b981]">84%</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[7px] font-black uppercase tracking-widest text-gray-400">STATUS</p>
                                    <p className="text-lg font-black text-[#1A1A1A]">Normal</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Audit & Exceptions Sidebar */}
                <div className="lg:col-span-4 space-y-5">
                    <div className={cn(glass.card, "p-5 space-y-5 bg-white/40 border-white/20 shadow-xl relative overflow-hidden group")}>
                        <div className="flex items-center justify-between mb-5 border-b border-[#F4D03F]/10 pb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A] leading-none">Live_History</h3>
                            <ShieldAlert className="w-4 h-4 text-[#F4D03F]" />
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {[
                                { status: 'OK', msg: 'Hives placed correctly on map.', time: '14:22' },
                                { status: 'OK', msg: 'All sensors are working normally.', time: '14:15' },
                                { status: 'WAIT', msg: 'Signal check in North area.', time: '13:58' },
                                { status: 'OK', msg: 'GPS tracking updated.', time: '12:40' },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-3 items-start border-b border-white/20 pb-3 last:border-0">
                                    <span className={cn(
                                        "text-[8px] font-black px-2 py-0.5 rounded-full",
                                        log.status === 'OK' ? "bg-[#10b981] text-white" : "bg-[#F4D03F] text-white"
                                    )}>{log.status}</span>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black text-[#1A1A1A]/60 uppercase tracking-tight">{log.msg}</p>
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-5 bg-[#064e3b] text-white group transition-all relative overflow-hidden shadow-xl")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <Crosshair className="w-5 h-5 text-[#F4D03F]" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">Status_Summary</h3>
                        </div>
                        <p className="text-[9px] font-black opacity-60 leading-relaxed uppercase tracking-tight relative z-10 pl-3 border-l-4 border-[#F4D03F]/40">
                            Adding hives will set up an **Automatic Alarm**. Any unexpected movement will send an alert.
                        </p>
                    </div>

                    <div className={cn(glass.card, "p-5 space-y-4 border-red-500/10 bg-red-50/30 shadow-xl")}>
                        <h4 className="text-[9px] text-red-500 font-black uppercase tracking-[0.3em] mb-2">Health_Alerts</h4>
                        <div className="flex items-center gap-4 bg-white/40 p-4 rounded-2xl border border-red-500/10">
                            <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 shrink-0">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-red-500 uppercase tracking-tight">Movement_Detected</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">HIGH_WINDS_OR_MOVEMENT</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HiveLogisticsSecurity;

