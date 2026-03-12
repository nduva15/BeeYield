import React from 'react';
import {
    Shield,
    Bell,
    MapPin,
    Move,
    AlertTriangle,
    Box,
    CheckCircle2,
    Lock,
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { glass, PageHeader } from './GlassTheme';

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

    // Simulate real-time alerts
    React.useEffect(() => {
        const interval = setInterval(() => {
            setPallets(prev => prev.map(p => {
                if (p.id === 'PAL-002') {
                    const newVib = Math.random() * 0.4;
                    const newStatus = newVib > 0.3 ? 'critical' : (newVib > 0.1 ? 'warning' : 'secured');
                    if (newStatus === 'critical') setGlobalAlert(true);
                    return { ...p, vibration: newVib, status: newStatus };
                }
                return p;
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            {/* Global Alert Banner */}
            <AnimatePresence>
                {globalAlert && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-amber-100/80 backdrop-blur-sm border border-amber-200 text-[#1A1A1A] px-4 py-3 flex items-center justify-between gap-4 rounded-xl shadow-sm relative z-50 overflow-hidden"
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-bold tracking-tight text-[#1A1A1A]">Movement Detected</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pallet {pallets[1].id} • Sector G4 • Auth Alert</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 relative z-10">
                            <button className="h-8 px-4 bg-white text-[#1A1A1A] border border-amber-200 shadow-sm rounded-lg font-bold text-xs hover:bg-amber-50 transition-all">Suppress</button>
                            <button onClick={() => setGlobalAlert(false)} className="w-8 h-8 flex items-center justify-center bg-transparent rounded-lg hover:bg-amber-200 transition-all text-gray-500 hover:text-[#1A1A1A]">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <PageHeader
                icon={ShieldCheck}
                label="Security Ops"
                title={<>Fleet <span className="text-[#1B9157]">Security</span></>}
                subtitle="High-fidelity telemetry of pallet movement, geo-fencing, and nodal integrity protocols."
                actions={
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                            <Lock className="w-3.5 h-3.5 text-[#1B9157]" />
                            <span className="text-xs font-bold text-[#1A1A1A] tracking-tight">Encrypted Uplink</span>
                        </div>
                        <button className={cn(glass.btnPrimary, "h-9 px-4 text-xs font-bold")}>Lock All Units</button>
                    </div>
                }
            />

            {/* Asset Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Vector Map */}
                <div className="lg:col-span-8 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "p-0 overflow-hidden bg-white border-gray-200")}
                    >
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                </div>
                                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Asset Vector Map</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-[#1B9157] shadow-[0_0_8px_rgba(27,145,87,0.4)] animate-pulse" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">GeoSynced</span>
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
                        className={cn(glass.card, "p-0 overflow-hidden bg-white")}
                    >
                       <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                    <Activity className="w-4 h-4 text-gray-500" />
                                </div>
                                <h3 className="text-sm font-bold text-[#1A1A1A] tracking-tight">Unit Matrix</h3>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{pallets.length} Assets</span>
                        </div>

                        <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                            {pallets.map((p, i) => (
                                <div key={i} className="bg-white border border-gray-100 p-3 rounded-xl flex items-center justify-between hover:border-gray-300 transition-all group shadow-sm">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-bold text-[#1A1A1A]">{p.id}</span>
                                        <span className="text-[10px] font-medium text-gray-500">{p.vibration.toFixed(2)}v Echo</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1.5 w-24">
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                                            p.status === 'critical' ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
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

                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-2">
                            <button className={cn(glass.btnSecondary, "w-full h-9 text-xs font-bold bg-white")}>Manual Override</button>
                            <button className="w-full h-9 bg-transparent text-gray-500 font-bold text-xs rounded-lg hover:text-[#1A1A1A] transition-all">Diagnostics</button>
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
