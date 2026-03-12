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
            className={cn(glass.page, "space-y-8 pb-32")}
        >
            {/* Header */}
            <PageHeader
                icon={Shield}
                label="BEE MAP · VIRTUAL FENCE · LIVE LOG"
                title={<>Hive <span className="text-[#F4D03F]">Tracking</span></>}
                subtitle="Live geofenced hive placements and security monitoring."
                actions={
                    <button
                        onClick={() => setAddingHive(true)}
                        className={cn(
                            glass.btnPrimary,
                            "h-12 px-6 font-black uppercase text-xs rounded-xl shadow-sm flex items-center gap-3 transition-all",
                            addingHive ? "animate-pulse ring-2 ring-yellow-500" : ""
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        {addingHive ? 'Click Map' : 'Track New Hives'}
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 3D Map Interface */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className={cn(glass.card, "bg-white/50 h-[500px] relative overflow-hidden rounded-3xl shadow-sm border-[#F4D03F]/10")}>
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

                        <div className="absolute bottom-6 left-6 p-4 bg-white/80 backdrop-blur-sm border border-[#F4D03F]/20 rounded-2xl shadow-sm">
                            <h4 className="text-[10px] font-black uppercase text-[#064e3b] mb-3 tracking-widest border-b border-[#064e3b]/10 pb-2">Hive Stats</h4>
                            <div className="flex gap-8">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black uppercase opacity-40">Active</p>
                                    <p className="text-lg font-black">{pallets.length}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black uppercase opacity-40">Coverage</p>
                                    <p className="text-lg font-black text-[#10b981]">84%</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black uppercase opacity-40">Status</p>
                                    <p className="text-lg font-black">Normal</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Audit & Exceptions Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className={cn(glass.card, "p-8 space-y-6 shadow-sm bg-white/50 backdrop-blur-xl rounded-3xl border-[#F4D03F]/10 relative overflow-hidden group")}>
                        <div className="flex items-center justify-between mb-8 border-b-2 border-[#10b981]/10 pb-4">
                            <h3 className="text-xl font-black uppercase tracking-tight leading-none">Live <span className="text-[#10b981]">History</span></h3>
                            <ShieldAlert className="w-5 h-5 text-[#10b981]" />
                        </div>
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {[
                                { status: 'OK', msg: 'Hives placed correctly on map.', time: '14:22' },
                                { status: 'OK', msg: 'All sensors are working normally.', time: '14:15' },
                                { status: 'WAIT', msg: 'Signal check in North area.', time: '13:58' },
                                { status: 'OK', msg: 'GPS tracking updated.', time: '12:40' },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 items-start border-b border-black/5 pb-4 last:border-0">
                                    <span className={cn(
                                        "text-[8px] font-black px-2 py-0.5 rounded-full",
                                        log.status === 'OK' ? "bg-[#10b981] text-white" : "bg-[#F4D03F] text-white"
                                    )}>{log.status}</span>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold opacity-60 uppercase">{log.msg}</p>
                                        <p className="text-[8px] font-black opacity-30 uppercase">{log.time} </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-8 shadow-sm bg-[#064e3b] text-white rounded-3xl group transition-all relative overflow-hidden")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <Crosshair className="w-6 h-6 text-[#F4D03F]" />
                            <h3 className="text-xl font-black uppercase tracking-tight leading-none">Status Summary</h3>
                        </div>
                        <p className="text-[10px] font-bold opacity-70 leading-relaxed uppercase tracking-tight relative z-10 pl-4 border-l-4 border-[#F4D03F]/40">
                            Adding hives will set up an **Automatic Alarm**. Any unexpected movement will send an alert.
                        </p>
                    </div>

                    <div className={cn(glass.card, "p-8 space-y-4 border-red-500/20 bg-red-50/50 rounded-3xl shadow-sm")}>
                        <h4 className="text-red-500 font-black text-xs uppercase tracking-widest mb-2">Health Alerts</h4>
                        <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-red-500/10">
                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 shrink-0">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-red-500 uppercase">Movement Detected</p>
                                <p className="text-[8px] font-bold opacity-60 uppercase">High winds or movement near hives.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HiveLogisticsSecurity;

