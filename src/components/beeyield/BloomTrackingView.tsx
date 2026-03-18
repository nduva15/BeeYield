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
    Info,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass, PageHeader } from './GlassTheme';
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(glass.page, "p-4 lg:p-6 space-y-6 pb-20")}
        >
            <PageHeader
                icon={Sprout}
                label="Phenological Engine"
                title={<>Bloom <span className="text-[#F4D03F]">Intelligence</span></>}
                subtitle="Pollination curves, floral density, and foraging match protocols system."
                actions={
                    <button
                        onClick={() => setShowLogForm(true)}
                        className={cn(glass.btnPrimary, "h-9 px-4 text-[10px] font-bold flex items-center gap-2")}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Log Bloom Data
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(glass.card, "p-0 overflow-hidden h-full flex flex-col")}
                    >
                        <div className={glass.sectionHeader}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] flex items-center justify-center border border-[#1B9157]/20">
                                     <Sprout className="w-4 h-4 text-[#1B9157]" />
                                 </div>
                                 <h3 className={glass.sectionTitle}>Orchard Status</h3>
                             </div>
                             <span className={glass.microLabel}>Real-time Telemetry</span>
                        </div>
                        <div className="p-4 flex-1">
                            <OrchardStatus />
                        </div>
                    </motion.div>
                </div>
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-5 h-full flex flex-col")}
                    >
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#F4D03F]/20">
                            <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] flex items-center justify-center border border-[#F4D03F]/20">
                                <Activity className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                            <h4 className={glass.sectionTitle}>Hive Metrics</h4>
                        </div>
                        <div className="flex-1 px-1">
                            <HiveMetrics />
                        </div>
                    </motion.div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 relative z-10"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-[#1B9157]/50 pl-4 py-1">
                    <div className="space-y-0.5">
                        <h3 className={glass.sectionTitle}>Pollination Correlation</h3>
                        <p className={glass.microLabel}>Bloom cycles vs. hive activity delta analysis</p>
                    </div>
                    <div className="flex items-center gap-4 bg-[#F9F7F2]/80 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-[#F4D03F]/10">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#1B9157]/10 border border-[#1B9157]/40 shadow-sm" />
                            <span className="text-[10px] font-bold text-gray-500 tracking-tighter">Bloom %</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-1 rounded-full bg-[#1B9157]/60" />
                            <span className="text-[10px] font-bold text-gray-500 tracking-tighter">Activity</span>
                        </div>
                    </div>
                </div>

                <div className={cn(glass.card, "p-6 relative overflow-hidden")}>
                    <BloomCorrelationGraph />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden group py-5")}
            >
                <div className="w-8 h-8 rounded-lg bg-[#F9F7F2] flex items-center justify-center shrink-0 border border-[#F4D03F]/20 relative z-10">
                    <Info className="w-4 h-4 text-[#F4D03F]" />
                </div>
                <div className="flex-1 space-y-1 relative z-10">
                    <h5 className={cn(glass.microLabel, "text-[#1A1A1A]")}>Bloom Accuracy Module</h5>
                    <p className="text-[10px] font-medium text-[#1A1A1A]/60 leading-relaxed pl-3 border-l-2 border-[#F4D03F]/30">
                        Synchronizing deployments with floral peak ensures maximum fruit set. Use <span className="text-[#1A1A1A] font-bold">'Log Bloom Data'</span> to calibrate predictive models.
                    </p>
                </div>
            </motion.div>

            <AnimatePresence>
                {showLogForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-xl mx-auto shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setShowLogForm(false)}
                                className="absolute right-4 top-4 w-9 h-9 flex items-center justify-center bg-white border border-gray-100 hover:bg-gray-50 rounded-xl z-20 shadow-md transition-all active:scale-95"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                            <BloomLogForm onClose={() => setShowLogForm(false)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};


export default BloomTrackingView;
