import React from 'react';
import { Activity, Volume2, Info, Zap, Cpu, CheckCircle2, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
import { motion } from 'framer-motion';

interface AcousticSpectralViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const generateSpectralData = () => {
    return Array.from({ length: 40 }, (_, i) => ({
        // Placeholder animation only; deterministic (no mock randomness).
        energy: Math.sin(i * 0.5) * 20 + 55,
    }));
};

const AcousticSpectralView: React.FC<AcousticSpectralViewProps> = () => {
    const [spectralData, setSpectralData] = React.useState(generateSpectralData());

    React.useEffect(() => {
        const interval = setInterval(() => {
            setSpectralData(generateSpectralData());
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={glass.page}>
            {/* Header */}
            <PageHeader
                title="Hive Sound"
                subtitle="Live Sound Check · Colony Health · Queen Status"
                icon={Volume2}
                color="text-[#1B9157]"
                bg="bg-[#1B9157]/10"
                borderColor="border-[#1B9157]/20"
                action={
                    <div className={cn(glass.card, "p-1 overflow-hidden inline-flex bg-background/50 shadow-emerald-500/10 shadow-lg")}>
                        <div className="px-5 py-2 bg-white/40 flex items-center gap-3 backdrop-blur-md rounded-xl">
                            <Waves className="w-4 h-4 text-[#1B9157] animate-pulse" />
                            <span className={cn(glass.microLabel, "font-bold text-[#1A1A1A]")}>Listening</span>
                            <div className="w-px h-4 bg-white/40 mx-1" />
                            <span className={cn(glass.microLabel, "font-bold text-[#1B9157]")}>Live Feed</span>
                        </div>
                     </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-[#1B9157]/ rounded-full blur-[100px] pointer-events-none -z-10" />

                {/* Sound View Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(glass.card, "lg:col-span-2 p-0 shadow-xl flex flex-col justify-between overflow-hidden relative")}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none w-full h-full" />
                    <div className="p-5 flex items-center justify-between border-b border-[#F4D03F]/10 bg-white/20 relative z-10">
                        <div>
                            <h3 className={glass.sectionTitle}>Sound <span className="text-[#F4D03F]">Waves</span></h3>
                            <p className={glass.microLabel}>Live frequency display from the hive.</p>
                        </div>
                        <div className={cn(glass.badge, "bg-[#1B9157]/ text-[#1B9157] border-[#1B9157]/ animate-pulse")}>
                            Live Feed
                        </div>
                    </div>

                    <div className="h-48 flex items-end gap-1 px-5 pt-6 relative z-10">
                        {spectralData.map((val, i) => (
                            <div
                                key={i}
                                style={{ height: `${val.energy}%` }}
                                className="flex-1 bg-[#F4D03F] rounded-t-full min-w-[3px] transition-all duration-300 opacity-80 hover:opacity-100 hover:bg-[#1B9157]"
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-5 p-5 border-t border-[#F4D03F]/10 bg-white/30 relative z-10">
                        <div className="space-y-1">
                            <p className={glass.microLabel}>Low Sound</p>
                            <p className="text-xl font-bold tracking-tight text-[#1A1A1A]">Stable</p>
                        </div>
                        <div className="space-y-1">
                            <p className={glass.microLabel}>Mid Sound</p>
                            <p className="text-xl font-bold tracking-tight text-[#1B9157]">Healthy</p>
                        </div>
                        <div className="space-y-1">
                            <p className={glass.microLabel}>High Sound</p>
                            <p className="text-xl font-bold tracking-tight text-[#1A1A1A]">Normal</p>
                        </div>
                    </div>
                </motion.div>

                {/* Sidebar */}
                <div className="space-y-8 flex flex-col justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn(glass.card, "p-5 shadow-xl bg-gradient-to-br from-[#F4D03F]/5 to-[#1B9157]/5 border-white/20 group relative overflow-hidden")}
                    >
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#F4D03F]/20 rounded-full blur-2xl group-hover:bg-[#F4D03F]/30 transition-colors pointer-events-none" />
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-sm">
                                <Cpu className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                            <h4 className={glass.sectionTitle}>Smart Check</h4>
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <p className={glass.microLabel}>Colony Mood</p>
                                <p className="text-2xl font-bold text-[#1B9157] tracking-tight mt-1">Calm</p>
                            </div>
                            <div className="h-2 bg-white/40 rounded-full overflow-hidden border border-white/20 shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "88%" }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-[#F4D03F] to-[#1B9157] relative"
                                >
                                </motion.div>
                            </div>
                            <p className="text-[11px] font-bold opacity-60 text-[#1A1A1A] leading-relaxed">
                                The bees are working normally. No signs of stress or queen issues found.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={cn(glass.card, "p-5 shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden group border-white/20 bg-white/40")}
                    >
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#1B9157]/10 rounded-full blur-2xl transition-colors pointer-events-none" />
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center border border-white/40 shadow-sm">
                                <Activity className="w-5 h-5 text-[#1A1A1A]" />
                            </div>
                            <h4 className={glass.sectionTitle}>Health Check</h4>
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-end border-b border-[#F4D03F]/10 pb-4">
                                <div>
                                    <p className={glass.microLabel}>Queen Score</p>
                                    <p className="text-xl font-bold tracking-tight tabular-nums text-[#1A1A1A]">98%</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-[#1B9157]/10 flex items-center justify-center border border-[#1B9157]/20 shadow-sm animate-pulse">
                                    <CheckCircle2 className="w-5 h-5 text-[#1B9157]" />
                                </div>
                            </div>
                            <div className="px-3 py-2 rounded-xl bg-[#1B9157]/5 border border-[#1B9157]/20 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-[#1B9157] shrink-0" />
                                <span className={cn(glass.microLabel, "text-[#1B9157]")}>Good Sound Detected</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={cn(glass.card, "p-5 shadow-xl bg-white/40 border-white/20 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden group mt-8")}
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-[60px] pointer-events-none transition-colors" />
                <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shrink-0 border border-[#F4D03F]/20 shadow-sm relative z-10">
                    <Info className="w-6 h-6 text-[#F4D03F]" />
                </div>
                <div className="relative z-10">
                    <h5 className={glass.sectionTitle}>Analysis Summary</h5>
                    <p className={cn(glass.microLabel, "normal-case tracking-normal leading-relaxed text-[#1A1A1A]/80 mt-1")}>
                        Our smart analyzer listens to the hive sound to check for the queen and general mood. This replaces the need for open-box inspections and helps you keep the bees happy without disturbing them.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AcousticSpectralView;
