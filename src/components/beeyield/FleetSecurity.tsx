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
                        initial={{ height: 0, opacity: 0, y: -40, scale: 0.95 }}
                        animate={{ height: 'auto', opacity: 1, y: 0, scale: 1 }}
                        exit={{ height: 0, opacity: 0, y: -40, scale: 0.95 }}
                        className="relative z-50 mb-16"
                    >
                        <div className="bg-destructive/90 dark:bg-red-600/90 backdrop-blur-3xl p-16 rounded-[4rem] border-4 border-white/20 shadow-[0_60px_100px_rgba(239,68,68,0.5)] flex flex-col lg:flex-row items-center justify-between text-white gap-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-white/10 rounded-full blur-[150px] pointer-events-none -mr-40 -mt-40 animate-pulse" />
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent pointer-events-none" />

                            <div className="flex items-center gap-12 relative z-10">
                                <div className="p-8 bg-white/20 rounded-[3rem] backdrop-blur-3xl shadow-4xl animate-pulse border-2 border-white/20">
                                    <AlertTriangle className="w-16 h-16 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className="w-4 h-4 rounded-full bg-white animate-ping" />
                                        <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">Security <span className="text-white/60">Alert</span></h2>
                                    </div>
                                    <p className="text-2xl font-black italic opacity-90 uppercase tracking-widest leading-tight max-w-2xl pl-4 border-l-8 border-white/20">
                                        Someone moved Pallet {pallets[1].id} without permission. Please check your hives immediately.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-6 relative z-10">
                                <button
                                    onClick={() => setGlobalAlert(false)}
                                    className="h-24 px-16 bg-white text-red-600 font-black italic uppercase text-3xl rounded-full shadow-4xl hover:scale-105 active:scale-95 transition-all"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <PageHeader
                icon={Shield}
                label="Theft Protection"
                title={<>Hive <span className="text-honey">Security</span></>}
                subtitle="Protect your hives from theft and see exactly where they are located."
                actions={
                    <div className="flex gap-8">
                        <button className={cn(glass.btnSecondary, "h-20 px-12 font-black italic uppercase text-lg rounded-full border-white/10 hover:bg-white/5")}>
                            Map Settings
                        </button>
                        <button className={cn(glass.btnPrimary, "h-20 px-16 font-black italic uppercase text-2xl shadow-4xl shadow-honey/20 rounded-full flex items-center gap-6")}>
                            <Lock className="w-8 h-8" />
                            Secure All
                        </button>
                    </div>
                }
            />

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                {/* Asset Registry */}
                <div className="lg:col-span-8 space-y-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "p-0 overflow-hidden shadow-4xl relative border-white/5 bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[6rem]")}
                    >
                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-honey/[0.05] rounded-full blur-[150px] pointer-events-none" />

                        <div className="p-16 border-b border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-3xl flex flex-col sm:flex-row items-center justify-between gap-12 relative z-10">
                            <div className="space-y-4">
                                <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Hive <span className="text-honey">Map</span></h2>
                                <p className="text-xl font-black italic opacity-40 uppercase tracking-widest pl-2 border-l-8 border-white/5">Check where your hives are located.</p>
                            </div>
                            <div className="flex items-center gap-6 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2.5rem] px-10 py-4 shadow-4xl backdrop-blur-3xl">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500 blur-md opacity-60 animate-pulse" />
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                                </div>
                                <span className="text-xl font-black italic uppercase text-emerald-500 tracking-widest">Secure Connection</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto relative z-10 pb-12">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-white/40 dark:bg-black/40">
                                        <th className="px-12 py-10 text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Pallet</th>
                                        <th className="px-12 py-10 text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Location</th>
                                        <th className="px-12 py-10 text-center text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Hives</th>
                                        <th className="px-12 py-10 text-center text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Movement</th>
                                        <th className="px-16 py-10 text-right text-[12px] font-black italic uppercase tracking-[0.4em] opacity-40">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y border-t-8 border-black/10">
                                    {pallets.map((p, i) => (
                                        <motion.tr
                                            key={p.id}
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1, duration: 0.8 }}
                                            className={cn(
                                                "group transition-all duration-700",
                                                p.status === 'critical' ? "bg-red-500/10" : (p.status === 'warning' ? "bg-honey/10" : "hover:bg-white/5")
                                            )}
                                        >
                                            <td className="py-12 px-12">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-20 h-20 rounded-[2rem] bg-honey/10 flex items-center justify-center border-2 border-honey/20 shadow-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                                        <Box className="w-10 h-10 text-honey" />
                                                    </div>
                                                    <span className="text-4xl font-black italic uppercase tracking-tighter tabular-nums">{p.id}</span>
                                                </div>
                                            </td>
                                            <td className="py-12 px-12">
                                                <div className="flex items-center gap-4">
                                                    <MapPin className="w-6 h-6 text-honey" />
                                                    <span className="text-2xl font-black italic uppercase tracking-tighter opacity-60">{p.location}</span>
                                                </div>
                                            </td>
                                            <td className="py-12 px-12 text-center">
                                                <div className="inline-block bg-honey/10 text-honey border-2 border-honey/20 px-8 py-3 rounded-full text-xl font-black italic uppercase shadow-4xl">
                                                    {p.hives} Hives
                                                </div>
                                            </td>
                                            <td className="py-12 px-12 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="flex items-center gap-4 bg-black/20 px-6 py-3 rounded-3xl border border-white/5 shadow-inner">
                                                        <Activity className={cn("w-6 h-6 transition-all duration-700", p.vibration > 0.1 ? "text-red-500 animate-pulse scale-125" : "text-emerald-500")} />
                                                        <span className="font-mono text-xl font-black opacity-60 tabular-nums lowercase">{p.vibration.toFixed(2)}v</span>
                                                    </div>
                                                    <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden shadow-inner p-[2px]">
                                                        <motion.div
                                                            className={cn("h-full rounded-full", p.vibration > 0.1 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "bg-emerald-500")}
                                                            animate={{ width: `${Math.min(p.vibration * 100 * 2, 100)}%` }}
                                                            transition={{ type: 'spring', stiffness: 50 }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-12 px-16 text-right">
                                                <div className={cn(
                                                    "inline-flex items-center gap-6 px-10 py-4 rounded-full border-4 shadow-4xl backdrop-blur-3xl transition-all duration-500 hover:scale-105",
                                                    p.status === 'secured' ? 'bg-emerald-500 text-black border-emerald-400' :
                                                        p.status === 'warning' ? 'bg-honey text-black border-honey shadow-[0_0_20px_rgba(251,191,36,0.3)]' :
                                                            'bg-red-500 text-white border-red-400 animate-pulse'
                                                )}>
                                                    <div className={cn("w-4 h-4 rounded-full", p.status === 'secured' ? 'bg-black opacity-40' : p.status === 'warning' ? 'bg-black opacity-40' : 'bg-white')} />
                                                    <span className="text-xl font-black italic uppercase tracking-widest">{p.status === 'secured' ? 'Safe' : p.status.toUpperCase()}</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

                {/* Control Panel */}
                <div className="lg:col-span-4 space-y-16">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={cn(glass.card, "p-16 shadow-4xl bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-[5rem] border-white/5 relative overflow-hidden flex flex-col gap-16")}
                    >
                        <div className="absolute bottom-0 right-0 w-80 h-80 bg-honey/5 rounded-full blur-[150px] pointer-events-none -mr-40 -mb-40" />

                        {/* Alert Settings */}
                        <section className="space-y-12 relative z-10">
                            <div className="flex items-center gap-8 border-honey border-l-8 pl-8">
                                <Radio className="w-10 h-10 text-honey" />
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Alert <span className="text-honey">Settings</span></h3>
                            </div>

                            <div className="space-y-8">
                                {[
                                    { label: 'Text Messages', status: true, icon: Smartphone },
                                    { label: 'Phone Alerts', status: true, icon: Bell },
                                    { label: 'Alarm Sound', status: false, icon: Volume2 }
                                ].map((cfg, i) => (
                                    <div key={i} className="flex items-center justify-between p-10 bg-black/10 dark:bg-black/40 rounded-[3rem] border border-white/5 group/cfg hover:border-honey/40 hover:bg-honey/5 transition-all duration-700 shadow-4xl overflow-hidden relative">
                                        <div className="flex items-center gap-8 relative z-10">
                                            <div className="w-20 h-20 rounded-[2.5rem] bg-honey/10 flex items-center justify-center border-2 border-honey/20 shadow-4xl group-hover/cfg:scale-110 group-hover/cfg:rotate-6 transition-all">
                                                <cfg.icon className="w-10 h-10 text-honey" />
                                            </div>
                                            <span className="text-2xl font-black italic uppercase tracking-widest opacity-60">{cfg.label}</span>
                                        </div>
                                        <div
                                            className={cn(
                                                "w-24 h-12 rounded-full border-4 border-white/10 shadow-inner p-1.5 cursor-pointer transition-all duration-700 relative z-10",
                                                cfg.status ? "bg-honey shadow-[0_0_30px_rgba(251,191,36,0.4)]" : "bg-black/20"
                                            )}
                                        >
                                            <motion.div
                                                className={cn(
                                                    "w-7 h-7 rounded-full shadow-4xl transition-all duration-700 flex items-center justify-center",
                                                    cfg.status ? "bg-white ml-auto" : "bg-white/10"
                                                )}
                                                layout
                                            >
                                                {cfg.status && <div className="w-2 h-2 bg-honey rounded-full" />}
                                            </motion.div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="h-1 bg-white/5 mx-[-64px]" />

                        {/* Actions */}
                        <section className="space-y-12 relative z-10">
                            <div className="flex items-center gap-8 border-red-500 border-l-8 pl-8">
                                <Hammer className="w-10 h-10 text-red-500" />
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Quick <span className="text-red-500">Actions</span></h3>
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                                <button className="w-full h-28 rounded-[3rem] bg-red-600 text-white flex items-center justify-between px-12 group/btn font-black italic text-2xl uppercase tracking-tighter shadow-4xl hover:scale-105 active:scale-95 transition-all">
                                    <div className="flex items-center gap-8">
                                        <Volume2 className="w-10 h-10 group-hover/btn:scale-125 transition-transform" />
                                        <span>Sound Alarm</span>
                                    </div>
                                    <ArrowRight className="w-10 h-10 opacity-40 group-hover/btn:translate-x-4 transition-transform" />
                                </button>
                                <button className="w-full h-28 rounded-[3rem] bg-honey text-black flex items-center justify-between px-12 group/btn font-black italic text-2xl uppercase tracking-tighter shadow-4xl hover:scale-105 active:scale-95 transition-all">
                                    <div className="flex items-center gap-8">
                                        <Lock className="w-10 h-10 group-hover/btn:scale-125 transition-transform" />
                                        <span>Lock Pallets</span>
                                    </div>
                                    <ArrowRight className="w-10 h-10 opacity-40 group-hover/btn:translate-x-4 transition-transform" />
                                </button>
                            </div>
                        </section>

                        {/* Auto-Security Info */}
                        <motion.div
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="p-16 bg-[#0D0D0D] rounded-[4rem] border-4 border-honey/20 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group/info"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-honey/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32 group-hover/info:bg-honey/20 transition-all duration-1000" />

                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-4 h-4 bg-red-500 animate-pulse rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                                    <p className="text-[14px] font-black italic uppercase tracking-[0.4em] text-red-500">Auto-Security</p>
                                </div>
                                <Info className="w-8 h-8 text-honey/40" />
                            </div>

                            <p className="text-2xl font-black italic text-white/50 leading-tight uppercase tracking-widest pl-6 border-l-8 border-honey relative z-10">
                                If a pallet moves more than <span className="text-honey">2 meters</span> without you knowing, the <span className="text-white">alarm will sound</span> to protect your hives.
                            </p>

                            <div className="flex items-center justify-between pt-10 relative z-10">
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="w-2 h-10 bg-honey/10 rounded-full group-hover/info:bg-honey/40 transition-all duration-500" />
                                    ))}
                                </div>
                                <ShieldCheck className="w-12 h-12 text-honey/20 group-hover/info:scale-125 transition-all duration-700" />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 20px; }
            `}</style>
        </motion.div>
    );
};

export default FleetSecurity;
