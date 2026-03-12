import React from 'react';
import { Activity, Volume2, Info, Zap, Cpu, CheckCircle2, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion } from 'framer-motion';

interface AcousticSpectralViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const generateSpectralData = () => {
    return Array.from({ length: 40 }, (_, i) => ({
        energy: Math.sin(i * 0.5) * 20 + 50 + Math.random() * 10,
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
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={cn(glass.page, "p-8 -m-8 space-y-12 pb-12 min-h-screen")}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 mb-2')}>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Acoustic Neural Interface
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Hive <span className="text-honey">Sound</span>
                    </h1>
                    <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70")}>
                        Live Sound Check · Colony Health · Queen Status
                    </p>
                </div>

                <div className={cn(glass.card, "p-1 overflow-hidden inline-flex bg-background/50 border-emerald-500/20 shadow-emerald-500/10 shadow-lg")}>
                    <div className="px-6 py-2 bg-white/40 flex items-center gap-3 backdrop-blur-md rounded-[1.8rem]">
                        <Waves className="w-5 h-5 text-emerald-500 animate-pulse" />
                        <span className={cn(glass.microLabel, "font-bold text-foreground")}>Status: Listening</span>
                        <div className="w-px h-6 bg-border mx-2" />
                        <span className={cn(glass.microLabel, "font-bold text-emerald-500")}>Real-time Stream</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

                {/* Sound View Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(glass.card, "lg:col-span-2 p-0 shadow-2xl flex flex-col justify-between overflow-hidden relative")}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none w-full h-full" />
                    <div className="p-8 pb-4 flex items-center justify-between border-b border-border bg-white/40 relative z-10">
                        <div>
                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Sound <span className="text-honey">Waves</span></h3>
                            <p className={cn(glass.microLabel, "normal-case italic opacity-60 mt-1")}>Live frequency display from the hive.</p>
                        </div>
                        <div className={cn(glass.badge, "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 animate-pulse")}>
                            Live Feed
                        </div>
                    </div>

                    <div className="h-64 flex items-end gap-1 px-8 pt-6 relative z-10">
                        {spectralData.map((val, i) => (
                            <div
                                key={i}
                                style={{ height: `${val.energy}%` }}
                                className="flex-1 bg-honey rounded-t-full min-w-[3px] transition-all duration-300 opacity-80 hover:opacity-100 hover:bg-emerald-500"
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-8 p-8 border-t border-border bg-white/20 relative z-10">
                        <div className="space-y-1">
                            <p className={cn(glass.microLabel, "opacity-60")}>Low Sound</p>
                            <p className={cn(glass.sectionTitle, "text-2xl normal-case")}>Stable</p>
                        </div>
                        <div className="space-y-1">
                            <p className={cn(glass.microLabel, "opacity-60")}>Mid Sound</p>
                            <p className={cn(glass.sectionTitle, "text-2xl normal-case text-emerald-500")}>Healthy</p>
                        </div>
                        <div className="space-y-1">
                            <p className={cn(glass.microLabel, "opacity-60")}>High Sound</p>
                            <p className={cn(glass.sectionTitle, "text-2xl normal-case")}>Normal</p>
                        </div>
                    </div>
                </motion.div>

                {/* Sidebar */}
                <div className="space-y-8 flex flex-col justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn(glass.card, "p-8 shadow-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 group relative overflow-hidden")}
                    >
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-colors" />
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-sm">
                                <Cpu className="w-6 h-6 text-amber-500" />
                            </div>
                            <h4 className={cn(glass.sectionTitle, "text-xl normal-case text-foreground")}>Smart Check</h4>
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <p className={cn(glass.microLabel, "opacity-60 mb-2")}>Colony Mood</p>
                                <p className={cn(glass.sectionTitle, "text-4xl text-emerald-500 tracking-tight")}>CALM</p>
                            </div>
                            <div className="h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "88%" }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-emerald-500 relative"
                                >
                                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                </motion.div>
                            </div>
                            <p className="text-sm italic font-medium opacity-70 text-foreground leading-relaxed">
                                The bees are working normally. No signs of stress or queen issues found.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={cn(glass.card, "p-8 shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden group")}
                    >
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center border border-border shadow-sm">
                                <Activity className="w-6 h-6 text-foreground" />
                            </div>
                            <h4 className={cn(glass.sectionTitle, "text-xl normal-case")}>Health Check</h4>
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className={cn(glass.microLabel, "opacity-60 mb-1")}>Queen Score</p>
                                    <p className={cn(glass.sectionTitle, "text-4xl tabular-nums")}>98%</p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm animate-pulse">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                                <Zap className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className={cn(glass.microLabel, "normal-case font-bold text-emerald-600 mt-0.5")}>Good Sound Detected</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* AI Summary Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={cn(glass.card, "p-8 shadow-xl bg-honey/5 border-honey/20 flex flex-col md:flex-row items-start md:items-center gap-8 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-honey/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-honey/15 transition-colors" />
                <div className="w-16 h-16 rounded-3xl bg-white/60 flex items-center justify-center shrink-0 border border-honey shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10">
                    <Info className="w-8 h-8 text-honey" />
                </div>
                <div className="relative z-10">
                    <h5 className={cn(glass.sectionTitle, "text-2xl normal-case mb-2")}>Analysis Summary</h5>
                    <p className="text-sm italic font-medium opacity-80 leading-relaxed max-w-4xl text-foreground">
                        Our smart analyzer listens to the hive sound to check for the queen and general mood. This replaces the need for open-box inspections and helps you keep the bees happy without disturbing them.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AcousticSpectralView;
