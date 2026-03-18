import React from 'react';
import {
    Shield,
    Bell,
    MapPin,
    Move,
    AlertTriangle,
    Box,
    CheckCircle2,
    Lock as LockIcon,
    Unlock,
    Activity,
    Smartphone,
    Signal,
    MoreHorizontal,
    Search,
    ChevronRight,
    Zap,
    Cpu,
    ShieldCheck,
    Navigation,
    Volume2,
    Eye,
    Hammer,
    Grip,
    ArrowRight,
    SearchCode,
    Info,
    RefreshCw,
    X,
    Radio,
    Loader2
} from "lucide-react";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { glass, PageHeader } from './GlassTheme';
import beeyieldService from '@/services/beeyieldService';

interface Pallet {
    id: string;
    hives: number;
    location: string;
    lastMoved: string;
    status: 'secured' | 'warning' | 'critical';
    vibration: number;
}

const FleetSecurity: React.FC = () => {
    const [pallets, setPallets] = React.useState<Pallet[]>([
        { id: 'PAL-001', hives: 12, location: 'North Block', lastMoved: '2h ago', status: 'secured', vibration: 0.02 },
        { id: 'PAL-002', hives: 12, location: 'East Corridor', lastMoved: '10m ago', status: 'warning', vibration: 0.15 },
        { id: 'PAL-003', hives: 8, location: 'Hillside Apiary', lastMoved: '5d ago', status: 'secured', vibration: 0.01 },
    ]);

    const [globalAlert, setGlobalAlert] = React.useState(false);

    React.useEffect(() => {
        let mounted = true;

        const refresh = async () => {
            try {
                const alerts = await beeyieldService.getSensorAlerts(false, 25);
                if (!mounted) return;
                const hasCritical = (alerts || []).some((a: any) => String(a?.severity || '').toLowerCase() === 'critical');
                setGlobalAlert(hasCritical);
                setPallets((prev) =>
                    prev.map((p) => {
                        if (p.id !== 'PAL-002') return p;
                        return {
                            ...p,
                            vibration: hasCritical ? Math.max(p.vibration, 0.35) : Math.min(p.vibration, 0.08),
                            status: hasCritical ? 'critical' : p.status === 'critical' ? 'warning' : p.status,
                            lastMoved: hasCritical ? 'Just now' : p.lastMoved,
                        };
                    })
                );
            } catch {
                // ignore polling failures
            }
        };

        refresh();
        const interval = setInterval(refresh, 15_000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* Global Alert Banner */}
            <AnimatePresence>
                {globalAlert && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-amber-100/60 backdrop-blur-xl border border-amber-200/40 text-[#1A1A1A] px-4 py-2.5 flex items-center justify-between gap-4 rounded-2xl shadow-sm relative z-50 overflow-hidden"
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-[10px] font-black text-[#1A1A1A]">Movement_Detected</h3>
                                <p className="text-[8px] font-black text-gray-500">PALLET_{pallets[1].id}_SECTOR_G4</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 relative z-10">
                            <button className="h-7 px-3 bg-white text-[#1A1A1A] border border-amber-200/40 shadow-sm rounded-lg font-black text-[9px] hover:bg-amber-50 transition-all">Suppress</button>
                            <button
                                onClick={() => setGlobalAlert(false)}
                                className="w-8 h-8 flex items-center justify-center bg-transparent rounded-lg hover:bg-amber-200 transition-all text-gray-500 hover:text-[#1A1A1A]"
                                aria-label="Dismiss alert"
                                title="Dismiss alert"
                                type="button"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <PageHeader
                icon={ShieldCheck}
                label="Security_Operations_Protocol"
                title={<>Fleet <span className="text-[#1B9157]">Security</span></>}
                subtitle="High-fidelity telemetry of pallet movement, geo-fencing, and nodal integrity protocols."
                actions={
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2.5 bg-white/60 px-3 h-8 rounded-xl border border-white/40 shadow-sm backdrop-blur-sm">
                            <LockIcon className="w-3 h-3 text-[#1B9157]" />
                            <button className={glass.btnPrimary}>Secure UI</button>
                        </div>
                    </div>
                }
            />

            {/* Asset Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* Vector Map */}
                <div className="lg:col-span-8 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "p-0 shadow-xl bg-white/40 border-white/20")}
                    >
                        <div className="p-4 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                    <MapPin className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <h3 className="text-[10px] font-black text-[#1A1A1A]">Asset_Vector_Map</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-xl border border-white/40 shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] shadow-sm shadow-[#1B9157]/50 animate-pulse" />
                                    <span className="text-[8px] font-black text-gray-400">Geo Synced</span>
                                </div>
                                <RefreshCw className="w-4 h-4 text-gray-400 hover:text-[#1A1A1A] cursor-pointer transition-colors" />
                            </div>
                        </div>
                        
                        <div className="aspect-[16/9] relative overflow-hidden bg-gray-50/50">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent)]" />
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                            
                            {pallets.map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    className="absolute cursor-pointer group/node"
                                    style={{ left: `${20 + i * 25}%`, top: `${30 + i * 15}%` }}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 relative z-10",
                                        p.status === 'critical' ? "bg-red-50 text-red-500 border border-red-200 shadow-[0_0_12px_rgba(239,68,68,0.4)]" : "bg-white border text-[#1B9157] border-gray-200 shadow-sm"
                                    )}>
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            p.status === 'critical' ? "bg-red-500 animate-ping" : "bg-[#1B9157]"
                                        )} />
                                    </div>
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-sm flex items-center px-2 py-1 rounded-md opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        <span className="text-[10px] font-bold text-[#1A1A1A]">{p.id}</span>
                                    </div>
                                </motion.div>
                            ))}
                            
                            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                                <button className="h-8 w-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-50 transition-all shadow-sm font-bold text-lg leading-none">+</button>
                                <button className="h-8 w-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-50 transition-all shadow-sm font-bold text-lg leading-none">-</button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Unit Matrix */}
                <div className="lg:col-span-4 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-0 shadow-xl bg-white/40 border-white/20")}
                    >
                       <div className="p-4 border-b border-[#F4D03F]/10 bg-[#F4D03F]/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                    <Activity className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <h3 className="text-[10px] font-black text-[#1A1A1A]">Unit_Matrix</h3>
                            </div>
                            <span className="text-[8px] font-black text-gray-400">{pallets.length}_ASSETS</span>
                        </div>

                        <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                            {pallets.map((p, i) => (
                                <div key={i} className="bg-white/60 border border-white/40 p-3 rounded-2xl flex items-center justify-between hover:border-[#F4D03F]/40 transition-all group shadow-sm">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] font-black text-[#1A1A1A] tracking-tight">{p.id}</span>
                                        <span className="text-[8px] font-black text-gray-400">{p.vibration.toFixed(2)}V_ECHO</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1.5 w-24">
                                        <span className={cn(
                                            "text-[8px] font-black px-2 py-0.5 rounded-lg",
                                            p.status === 'critical' ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-[#1B9157]/10 text-[#1B9157] border border-[#1B9157]/20"
                                        )}>
                                            {p.status}
                                        </span>
                                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-500 rounded-full", p.status === 'critical' ? "bg-red-500" : "bg-[#1B9157]")}
                                                style={{ width: `${Math.min(p.vibration * 300, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-[#F4D03F]/10 bg-white/20 flex flex-col gap-2">
                            <button className={cn(glass.btnSecondary, "w-full bg-white/60 border-white/40")}>Manual Override</button>
                            <button className="w-full h-8 bg-transparent text-gray-400 font-bold text-xs tracking-wider rounded-lg hover:text-[#1A1A1A] transition-all">Diagnostics</button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
            `}</style>
        </motion.div>
    );
};

export default FleetSecurity;
