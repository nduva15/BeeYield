import React from 'react';
import { cn } from '@/lib/utils';
import {
    Mic2, Upload, RefreshCw, Play, Square, CheckCircle2, AlertCircle, Activity, Database, ShieldCheck, Cpu, ArrowRight, Terminal, Hexagon, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { glass } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className={cn(glass.page, "p-8 -m-8 min-h-screen")}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20')}>
                        <Zap className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-[0.1em]">Frequency Variance & Anomaly Detection</span>
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-6xl')}>
                        Acoustic <span className="text-honey">Audit</span>
                    </h1>
                    <p className={cn(glass.microLabel, 'opacity-70 normal-case italic font-bold')}>
                        Spectral monitoring protocols
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={cn(glass.badge, "px-6 py-3 border-emerald-500/20 bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/5")}>
                        SPECTRUM: 100-800HZ
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Control Panel */}
                <div className="lg:col-span-5 space-y-8 flex flex-col">
                    <div className={cn(glass.card, "p-8 flex flex-col gap-8")}>
                        <div className="flex items-center gap-4 border-b border-border pb-6">
                            <div className="w-12 h-12 rounded-[1.5rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-inner">
                                <Terminal className="w-6 h-6 text-honey" />
                            </div>
                            <h3 className={cn(glass.sectionTitle, "text-3xl normal-case")}>Audio Node</h3>
                        </div>

                        <p className={cn(glass.microLabel, "text-muted-foreground leading-relaxed italic border-l-2 border-honey/50 pl-4")}>
                            Capture asset acoustics for frequency analysis. Minimum 3.0s sample duration required.
                        </p>

                        <div className="flex flex-col gap-4 mt-auto">
                            <button
                                onClick={handleRecord}
                                disabled={recording || analyzing}
                                className={cn(
                                    glass.btnPrimary,
                                    "w-full h-20 text-sm gap-4 transition-all duration-300",
                                    recording ? "bg-destructive text-gray-900 border-destructive hover:bg-destructive shadow-destructive/20 scale-[0.98] ring-4 ring-destructive/20" : "hover:border-honey hover:shadow-xl hover:shadow-honey/10"
                                )}
                            >
                                {recording ? <Square className="fill-current w-5 h-5 drop-shadow-md" /> : <Mic2 className="w-6 h-6 shrink-0" />}
                                {recording ? "RECORDING..." : "REC_START"}
                            </button>
                            <button className={cn(glass.btnSecondary, "h-14 w-full text-xs")}>
                                <Upload className="w-4 h-4 ml-[-4px]" /> Upload Data Stream
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
                                className={cn(glass.card, "p-8 overflow-hidden")}
                            >
                                <div className="flex justify-between items-end mb-4">
                                    <span className={cn(glass.microLabel, "text-muted-foreground animate-pulse")}>Processing Signal...</span>
                                    <span className={cn(glass.sectionTitle, "text-3xl tabular-nums leading-none text-honey")}>{progress}%</span>
                                </div>
                                <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden border border-border">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-honey to-amber-500 rounded-full"
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
                                    glass.card, "p-8 flex flex-col gap-6 backdrop-blur-xl relative overflow-hidden",
                                    result === 'Healthy' ? "border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/10" : "border-red-500/30 bg-red-500/5 shadow-red-500/10"
                                )}
                            >
                                <div className={cn("absolute inset-0 opacity-10 blur-3xl", result === 'Healthy' ? "bg-emerald-500" : "bg-red-500")} />
                                <div className="relative z-10 flex items-center gap-5">
                                    <div className={cn(
                                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg",
                                        result === 'Healthy' ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                                    )}>
                                        {result === 'Healthy' ? <ShieldCheck className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                                    </div>
                                    <h4 className={cn(glass.sectionTitle, "text-4xl normal-case tracking-tight", result === 'Healthy' ? "text-emerald-500" : "text-red-500")}>
                                        {result}
                                    </h4>
                                </div>
                                <p className={cn(glass.microLabel, "relative z-10 normal-case italic font-semibold text-muted-foreground/80 leading-relaxed border-t border-border/50 pt-6 mt-2")}>
                                    {result === 'Healthy' ? "Acoustic signature optimal. No anomalies detected in signal." : "Frequency variance detected. Immediate field audit recommended."}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Waveform Visualization */}
                <div className={cn(glass.card, "p-0 overflow-hidden lg:col-span-7 flex flex-col group")}>
                    <div className="flex items-center justify-between p-8 border-b border-border bg-white/30">
                        <div className="flex items-center gap-4">
                            <Activity className="w-6 h-6 text-honey" />
                            <h3 className={cn(glass.sectionTitle, "text-3xl normal-case")}>Spectral Wave</h3>
                        </div>
                        <div className={cn(glass.badge, "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10")}>LIVE_FEED</div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 relative">
                        {/* Background Grid */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        <div className="flex items-center justify-center gap-2 h-64 w-full max-w-2xl relative z-10">
                            {[...Array(40)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className={cn(
                                        "w-3 rounded-t-full transition-colors duration-500 border-x border-t border-black/5",
                                        recording ? "bg-destructive/80" : (analyzing ? "bg-honey/80" : "bg-muted-foreground/20")
                                    )}
                                    animate={{
                                        height: `${Math.max(10, (recording || analyzing) ? Math.random() * 200 : 20 + Math.sin(i * 0.5) * 40)}px`
                                    }}
                                    transition={{
                                        type: "spring", stiffness: 300, damping: 20, mass: 0.5
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="p-8 border-t border-border bg-muted/20 grid grid-cols-2 gap-8 divide-x divide-border">
                        <div className="space-y-3">
                            <p className={cn(glass.microLabel, "text-muted-foreground")}>Amplitude</p>
                            <p className={cn(glass.sectionTitle, "text-4xl tabular-nums tracking-tight")}>-14.2 DB</p>
                        </div>
                        <div className="space-y-3 pl-8 text-right">
                            <p className={cn(glass.microLabel, "text-muted-foreground")}>Confidence</p>
                            <p className={cn(glass.sectionTitle, "text-4xl tabular-nums tracking-tight text-emerald-500")}>94.8%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SoundAnalysisView;
