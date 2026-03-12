import React from 'react';
import {
    Sprout,
    Calendar,
    Zap,
    Activity,
    TrendingUp,
    Plus,
    History,
    FileText,
    ArrowRight,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import OrchardStatus from '../pollination/OrchardStatus';
import BloomCorrelationGraph from '../pollination/BloomCorrelationGraph';
import HiveMetrics from '../pollination/HiveMetrics';
import BloomLogForm from '../pollination/BloomLogForm';

interface BloomTrackingViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const BloomTrackingView: React.FC<BloomTrackingViewProps> = ({ onTabChange }) => {
    const [showLogForm, setShowLogForm] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-12 pb-12 min-h-screen")}
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-border/50 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 mb-2')}>
                        <Sprout className="w-4 h-4 mr-2" />
                        Phenological Analysis Engine
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Bloom <span className="text-honey">Intelligence</span>
                    </h1>
                    <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70")}>
                        Pollination Curves · Floral Density · Foraging Match
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowLogForm(true)}
                        className={cn(glass.btnPrimary, "h-14 px-10 font-bold shadow-lg shadow-honey/20")}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Log Bloom Data
                    </button>
                </div>
            </div>

            {/* Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={cn(glass.card, "p-0 overflow-hidden shadow-2xl")}
                    >
                        <div className="p-8 border-b border-border bg-white/40">
                            <h3 className={cn(glass.sectionTitle, "text-2xl normal-case")}>Orchard <span className="text-honey">Status</span></h3>
                        </div>
                        <div className="p-8">
                            <OrchardStatus />
                        </div>
                    </motion.div>
                </div>
                <div className="lg:col-span-4">
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn(glass.card, "p-8 h-full shadow-xl bg-gradient-to-br from-honey/5 to-transparent border-honey/20")}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center border border-border shadow-sm">
                                <Activity className="w-6 h-6 text-honey" />
                            </div>
                            <h4 className={cn(glass.sectionTitle, "text-xl normal-case")}>Hive Metrics</h4>
                        </div>
                        <HiveMetrics />
                    </motion.div>
                </div>
            </div>

            {/* Technical Analysis Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/50 pb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className={cn(glass.sectionTitle, "text-3xl normal-case leading-none")}>Pollination Correlation</h3>
                            <p className={cn(glass.microLabel, "normal-case italic opacity-60 mt-1")}>Visualizing the delta between bloom cycles and hive activity.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 bg-white/40 p-2 px-4 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500" />
                            <span className={cn(glass.microLabel, "font-bold normal-case opacity-70")}>Bloom %</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-1 rounded-full bg-emerald-500" />
                            <span className={cn(glass.microLabel, "font-bold normal-case opacity-70")}>Bee Activity</span>
                        </div>
                    </div>
                </div>

                <div className={cn(glass.card, "p-8 lg:p-12 shadow-2xl relative overflow-hidden")}>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                    <BloomCorrelationGraph />
                </div>
            </motion.div>

            {/* Information Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={cn(glass.card, "p-8 shadow-xl bg-honey/5 border-honey/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-64 h-64 bg-honey/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-honey/15 transition-colors" />
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/60 flex items-center justify-center shrink-0 border border-honey shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Info className="w-8 h-8 text-honey" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h5 className={cn(glass.sectionTitle, "text-2xl normal-case mb-2")}>Bloom Tracking Accuracy</h5>
                    <p className="text-sm italic font-medium opacity-80 leading-relaxed max-w-4xl text-foreground">
                        Synchronizing hive deployments with floral peak ensures maximum fruit set and honey yield. Use the 'Log Bloom Data' tool to provide ground-truth observations that calibrate our predictive neural models.
                    </p>
                </div>
            </motion.div>

            {/* Bloom Logger Modal/Overlay */}
            <AnimatePresence>
                {showLogForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-2xl"
                        >
                            <BloomLogForm onClose={() => setShowLogForm(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BloomTrackingView;
