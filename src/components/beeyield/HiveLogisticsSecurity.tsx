import React, { useState, useRef } from 'react';
import { MapPin, Shield, Crosshair, Hexagon, AlertCircle, Plus, Info, Zap, Trash2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    const [pallets, setPallets] = useState<Pallet[]>([
        { id: 'PAL-001', x: 200, y: 150, hives: 4, isSecure: true },
        { id: 'PAL-002', x: 450, y: 300, hives: 4, isSecure: true },
    ]);
    const [addingHive, setAddingHive] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

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
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_#facc15]">
                            <Shield className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Hive <span className="text-[#10b981]">Tracking</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Bee Map · Virtual Fence · Live Log
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setAddingHive(true)}
                        className={cn(
                            "flex items-center gap-3 px-8 py-4 border-4 font-black text-xs uppercase tracking-widest transition-all",
                            addingHive ? "bg-[#facc15] text-[#064e3b] border-[#064e3b] animate-pulse" : "bg-[#064e3b] text-white border-[#064e3b] shadow-[8px_8px_0px_0px_#10b981]"
                        )}
                    >
                        <Plus className="w-5 h-5" />
                        {addingHive ? 'Click Map to Place Hives' : 'Track New Hives'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* 3D Map Interface */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="border-8 border-[#064e3b] bg-[#f0f2f0] h-[600px] relative overflow-hidden shadow-[15px_15px_0px_0px_rgba(6,78,59,1)]">
                        {/* Satellite-style underlying grid effect */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#064e3b 2px, transparent 2px)', backgroundSize: '40px 40px' }} />

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
                                    fill="rgba(16,185,129,0.05)"
                                    stroke="rgba(16,185,129,0.2)"
                                    strokeWidth="2"
                                    strokeDasharray="5 5"
                                />
                            ))}

                            {/* Isometric Pallet Icons */}
                            {pallets.map(p => (
                                <g key={p.id} transform={`translate(${p.x},${p.y})`} className="cursor-pointer group">
                                    <ellipse cx="0" cy="12" rx="14" ry="6" fill="rgba(0,0,0,0.1)" />
                                    <path
                                        d="M -12,-8 L 0,-14 L 12,-8 L 12,4 L 0,10 L -12,4 Z"
                                        fill="#064e3b"
                                        stroke="white"
                                        strokeWidth="2"
                                    />
                                    <text
                                        y="-2"
                                        textAnchor="middle"
                                        fontSize="8"
                                        fontWeight="900"
                                        fill="white"
                                    >{p.hives}</text>

                                    {p.isSecure && (
                                        <circle cx="12" cy="-12" r="4" fill="#10b981" className="animate-pulse" />
                                    )}
                                </g>
                            ))}
                        </svg>

                        <div className="absolute bottom-6 left-6 p-4 bg-white/90 backdrop-blur-sm border-4 border-[#064e3b] shadow-xl">
                            <h4 className="text-[10px] font-black uppercase text-[#064e3b] mb-2 tracking-widest border-b-2 border-[#064e3b]/10 pb-2">Hive Stats</h4>
                            <div className="flex gap-10">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-[#064e3b]/40">Active Spots</p>
                                    <p className="text-xl font-black text-[#064e3b]">{pallets.length}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-[#064e3b]/40">Coverage</p>
                                    <p className="text-xl font-black text-[#10b981]">84%</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-[#064e3b]/40">Status</p>
                                    <p className="text-xl font-black text-[#064e3b]">Normal</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Audit & Exceptions Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#064e3b]">
                        <div className="flex items-center gap-3 mb-8 border-b-2 border-[#064e3b]/10 pb-4">
                            <ShieldAlert className="w-5 h-5 text-[#10b981]" />
                            <h3 className="text-xl font-black uppercase text-[#064e3b] tracking-tight">Live History</h3>
                        </div>
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                            {[
                                { status: 'OK', msg: 'Hives placed correctly on map.', time: '14:22' },
                                { status: 'OK', msg: 'All sensors are working normally.', time: '14:15' },
                                { status: 'WAIT', msg: 'Signal check in North area.', time: '13:58' },
                                { status: 'OK', msg: 'GPS tracking updated.', time: '12:40' },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 items-start border-b border-[#064e3b]/5 pb-4 last:border-0">
                                    <span className={cn(
                                        "text-[8px] font-black px-1.5 py-0.5 border leading-none",
                                        log.status === 'OK' ? "bg-[#10b981] text-white border-[#10b981]" : "bg-[#facc15] text-[#064e3b] border-[#facc15]"
                                    )}>{log.status}</span>
                                    <div>
                                        <p className="text-[9px] font-bold text-[#064e3b]/70 uppercase">{log.msg}</p>
                                        <p className="text-[8px] font-black text-[#064e3b]/30 uppercase mt-1">{log.time} </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#064e3b] border-4 border-[#064e3b] p-8 text-white shadow-[10px_10px_0px_0px_#10b981]">
                        <div className="flex items-center gap-3 mb-6">
                            <Crosshair className="w-6 h-6 text-[#facc15]" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Status Summary</h3>
                        </div>
                        <p className="text-[10px] font-bold text-white/60 leading-relaxed uppercase mb-6">
                            Adding hives will set up an **Automatic Alarm**. Any unexpected movement will send an alert to your phone.
                        </p>
                        <div className="flex items-center gap-3 text-[#10b981]">
                            <Info className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Queen Protected</span>
                        </div>
                    </div>

                    <div className="border-4 border-red-500 p-8 bg-red-50">
                        <h4 className="text-red-600 font-black text-xs uppercase tracking-widest mb-4">Health Alerts</h4>
                        <div className="p-4 bg-white border-2 border-red-500 flex items-center gap-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                            <div>
                                <p className="text-[10px] font-black text-red-600 uppercase">Movement Detected</p>
                                <p className="text-[8px] font-bold text-red-500/60 uppercase">High winds or movement detected near your hives.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HiveLogisticsSecurity;
