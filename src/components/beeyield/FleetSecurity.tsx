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
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

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
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-20 pb-24")}
        >
            {/* Global Alert Banner */}
            <AnimatePresence>
                {globalAlert && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-[#FF6B00] text-black px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_50px_rgba(255,107,0,0.3)] relative z-50 mb-10 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-black/5 animate-pulse pointer-events-none" />
                        <div className="flex items-center gap-8 relative z-10">
                            <AlertTriangle className="w-12 h-12 animate-pulse" />
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black uppercase tracking-tighter">Critical_Pulse_Detected</h2>
                                <p className="text-sm font-mono font-black uppercase tracking-[0.2em] opacity-80">Pallet_{pallets[1].id}_Movement // Sector_G4 // Alert_Auth_Required</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 relative z-10">
                            <button className="px-10 py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all">Suppress_Alarm</button>
                            <button onClick={() => setGlobalAlert(false)} className="w-16 h-16 flex items-center justify-center border border-black/20 rounded-xl hover:bg-black/10 transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <PageHeader
                icon={ShieldCheck}
                label="Fleet Security Ops"
                title={<>Fleet <span className="text-[#FF6B00]">Security</span></>}
                subtitle="High-fidelity telemetry of pallet movement, geo-fencing, and nodal integrity."
                actions={
                    <div className="flex gap-6">
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-6 py-2">
                            <Lock className="w-5 h-5 text-white/40" />
                            <span className="text-[10px] font-mono font-black text-[#FF6B00] uppercase tracking-widest">ENCRYPTED_UPLINK</span>
                        </div>
                        <button className="h-14 px-8 bg-[#FF6B00] text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-3xl hover:brightness-125 transition-all">LOCK_ALL_PALLETS</button>
                    </div>
                }
            />

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                {/* Asset Registry */}
                <div className="lg:col-span-8 space-y-16">
                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group">
                            <div className="p-10 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-6">
                                    <MapPin className="w-8 h-8 text-[#FF6B00]" />
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Asset_Vector_Map</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 px-4 py-1 bg-white/5 rounded-lg border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-white opacity-40" />
                                        <span className="text-[9px] font-mono font-black text-white/40 uppercase tracking-widest">GEO_SYNCED</span>
                                    </div>
                                    <RefreshCw className="w-5 h-5 text-white/10 hover:text-[#FF6B00] cursor-pointer transition-colors" />
                                </div>
                            </div>
                            
                            <div className="aspect-video relative overflow-hidden bg-black">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.03),transparent)] pointer-events-none" />
                                {/* Simple Grid Overlay */}
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                                
                                {pallets.map((p, i) => (
                                    <motion.div
                                        key={p.id}
                                        className="absolute cursor-pointer group/node"
                                        style={{ left: `${20 + i * 25}%`, top: `${30 + i * 15}%` }}
                                        whileHover={{ scale: 1.2 }}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500",
                                            p.status === 'critical' ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]" : "bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                        )}>
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                p.status === 'critical' ? "bg-white animate-ping" : "bg-black opacity-40"
                                            )} />
                                        </div>
                                        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-lg opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap">
                                            {p.id}__{p.location.toUpperCase().replace(' ', '_')}
                                        </div>
                                    </motion.div>
                                ))}
                                
                                <div className="absolute bottom-6 right-6 flex flex-col gap-4">
                                    <button className="h-10 w-10 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-white hover:bg-[#FF6B00] hover:text-black transition-all">+</button>
                                    <button className="h-10 w-10 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-white hover:bg-[#FF6B00] hover:text-black transition-all">-</button>
                                </div>
                            </div>
                        </div>
                </div>

                {/* Control Panel */}
                <div className="lg:col-span-4 space-y-16">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col gap-10 sticky top-32"
                    >
                        <div className="flex items-center gap-6 border-l-4 border-[#FF6B00] pl-6">
                            <Activity className="w-8 h-8 text-[#FF6B00]" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Unit_Matrix</h3>
                        </div>

                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 thin-scrollbar">
                            {pallets.map((p, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between hover:border-[#FF6B00]/40 transition-all group">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[13px] font-mono font-black text-white group-hover:text-[#FF6B00] transition-colors tracking-widest uppercase">{p.id}</span>
                                        <span className="text-[9px] font-mono font-black text-white/20 uppercase tracking-[0.2em]">{p.vibration.toFixed(2)}v_CORE_ECHO</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
                                            p.status === 'critical' ? "bg-[#FF6B00]/10 text-[#FF6B00]" : "bg-white/10 text-white"
                                        )}>
                                            {p.status.toUpperCase()}
                                        </span>
                                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden mt-1 text-[2px]">
                                            <div
                                                className={cn("h-full", p.status === 'critical' ? "bg-[#FF6B00]" : "bg-white")}
                                                style={{ width: `${Math.min(p.vibration * 200, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-white/10 space-y-6">
                            <button className="w-full h-16 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#FF6B00] transition-all">MANUAL_OVERRIDE</button>
                            <button className="w-full h-16 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:border-[#FF6B00]/40 transition-all">SYSTEM_DIAGNOSTIC</button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.2); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default FleetSecurity;
