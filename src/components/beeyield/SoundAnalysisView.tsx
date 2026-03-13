// Forced reload to clear Label reference error
import React from 'react';
import { cn } from '@/lib/utils';
import {
    Mic2, Upload, RefreshCw, Play, Square, CheckCircle2, AlertCircle, Activity, Database, ShieldCheck, Cpu, ArrowRight, Terminal, Hexagon, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { glass, PageHeader } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { Label as UiLabel } from '@/components/ui/label';

interface SoundAnalysisViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const SoundAnalysisView: React.FC<SoundAnalysisViewProps> = ({ onTabChange }) => {
    const [recording, setRecording] = React.useState(false);
    const [analyzing, setAnalyzing] = React.useState(false);
    const [result, setResult] = React.useState<null | 'Healthy' | 'Warning'>(null);
    const [progress, setProgress] = React.useState(0);

    const handleRecord = () => {
        setRecording(true);
        setTimeout(() => {
            setRecording(false);
            handleAnalyze();
        }, 3000);
    };

    const handleAnalyze = () => {
        setAnalyzing(true);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setResult(Math.random() > 0.3 ? 'Healthy' : 'Warning');
                    setAnalyzing(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    return (
        <div className={glass.page}>
            {/* Header */}
            <PageHeader
                title="Acoustic Audit"
                subtitle="Spectral monitoring protocols and frequency anomaly detection."
                icon={Zap}
                color="text-[#F4D03F]"
                bg="bg-[#F4D03F]/10"
                borderColor="border-[#F4D03F]/20"
                action={
                    <div className={cn(glass.badge, "px-3 py-1.5 border-[#F4D03F]/10 bg-[#F4D03F]/5 text-[#F4D03F]")}>
                        SPECTRUM: 100-800HZ
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Control Panel */}
                <div className="lg:col-span-5 space-y-6 flex flex-col">
                    <div className={cn(glass.card, "p-5 flex flex-col gap-6 bg-white/40 shadow-xl border-white/20")}>
                        <div className="flex items-center gap-3 border-b border-[#F4D03F]/10 pb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20">
                                <Terminal className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                            <h3 className={glass.sectionTitle}>Audio Node</h3>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className={glass.microLabel}>
                                Capture asset acoustics for frequency analysis. Minimum 3.0s sample duration required.
                            </p>
                            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">
                                <Activity className="w-3 h-3 text-[#F4D03F]/40" />
                                <span>SIGNAL_LOCK_ACTIVE</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-[#F4D03F]/10">
                            <button
                                onClick={handleRecord}
                                disabled={recording || analyzing}
                                className={cn(
                                    glass.btnPrimary,
                                    "h-10 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all duration-300",
                                    recording ? "bg-red-500 text-white border-red-600 shadow-red-500/20 scale-[0.98]" : ""
                                )}
                            >
                                {recording ? <Square className="fill-current w-3 h-3" /> : <Mic2 className="w-3 h-3 shrink-0" />}
                                {recording ? "RECORDING..." : "REC START"}
                            </button>
                            <button className={cn(glass.btnSecondary, "h-10 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl")}>
                                <Upload className="w-3.5 h-3.5" /> 
                                <span>UPLOAD_STREAM</span>
                            </button>
                        </div>
                    </div>

                    {/* Progress Monitor */}
                    <AnimatePresence>
                        {analyzing && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                className={cn(glass.card, "p-5 overflow-hidden border-white/40 shadow-sm")}
                            >
                                <div className="flex justify-between items-end mb-3">
                                    <div className="flex flex-col gap-1">
                                        <span className={cn(glass.microLabel, "animate-pulse")}>Processing Signal...</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">PROTOCOL_X4_ACTIVE</span>
                                    </div>
                                    <span className="text-xl tabular-nums font-black leading-none text-[#F4D03F]">{progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/30 rounded-full overflow-hidden border border-white/20">
                                    <motion.div
                                        className="h-full bg-[#F4D03F] rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Results Tray */}
                    <AnimatePresence>
                        {result && !analyzing && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    glass.card, "p-5 flex flex-col gap-4 backdrop-blur-xl relative overflow-hidden",
                                    result === 'Healthy' ? "border-[#1B9157]/20 bg-[#1B9157]/5 shadow-[#1B9157]/10" : "border-red-500/30 bg-red-500/5 shadow-red-500/10"
                                )}
                            >
                                <div className={cn("absolute inset-0 opacity-[0.03] blur-xl", result === 'Healthy' ? "bg-[#1B9157]" : "bg-red-500")} />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm",
                                            result === 'Healthy' ? "bg-[#1B9157]/10 text-[#1B9157]" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {result === 'Healthy' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        </div>
                                        <h4 className={cn(glass.sectionTitle, "text-xl tracking-tight uppercase", result === 'Healthy' ? "text-[#1B9157]" : "text-red-500")}>
                                            {result}
                                        </h4>
                                    </div>
                                    <div className={cn(glass.badge, "border-none bg-white/20", result === 'Healthy' ? "text-[#1B9157]" : "text-red-500")}>
                                        {result === 'Healthy' ? "OPTIMAL" : "CRITICAL"}
                                    </div>
                                </div>
                                <p className={cn(glass.microLabel, "relative z-10 border-t border-[#F4D03F]/10 pt-4 mt-1 text-gray-500")}>
                                    {result === 'Healthy' ? "Acoustic signature optimal. No anomalies detected in signal path." : "Frequency variance detected. Immediate field audit recommended."}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Waveform Visualization */}
                <div className={cn(glass.card, "p-0 overflow-hidden lg:col-span-7 flex flex-col group border-white/40 shadow-sm")}>
                    <div className="flex items-center justify-between p-5 border-b border-[#F4D03F]/10 bg-white/20">
                        <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-[#F4D03F]" />
                            <h3 className={glass.sectionTitle}>Spectral Wave</h3>
                        </div>
                        <div className={cn(glass.badge, "bg-[#F4D03F]/5 text-[#F4D03F] border-[#F4D03F]/10")}>LIVE_FEED</div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center min-h-[350px] p-5 relative">
                        {/* Background Grid */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        <div className="flex items-center justify-center gap-1.5 h-64 w-full max-w-2xl relative z-10">
                            {[...Array(40)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className={cn(
                                        "w-2 rounded-full transition-colors duration-500 border border-black/5 shadow-sm",
                                        recording ? "bg-red-500" : (analyzing ? "bg-[#F4D03F]" : "bg-gray-200/40")
                                    )}
                                    animate={{
                                        height: `${Math.max(8, (recording || analyzing) ? Math.random() * 200 : 20 + Math.sin(i * 0.5) * 40)}px`
                                    }}
                                    transition={{
                                        type: "spring", stiffness: 300, damping: 20, mass: 0.5
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="p-5 border-t border-[#F4D03F]/10 bg-white/30 grid grid-cols-2 gap-5 divide-x divide-[#F4D03F]/10">
                        <div className="space-y-1">
                            <UiLabel className={glass.microLabel}>Amplitude Gain</UiLabel>
                            <p className="text-xl font-black tabular-nums tracking-tighter text-[#1A1A1A]">-14.2 DB</p>
                        </div>
                        <div className="space-y-1 pl-5 text-right">
                            <UiLabel className={glass.microLabel}>Confidence Lock</UiLabel>
                            <p className="text-xl font-black tabular-nums tracking-tighter text-[#1B9157]">94.8%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SoundAnalysisView;
