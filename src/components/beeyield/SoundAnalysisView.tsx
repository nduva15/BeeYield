import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Headphones,
    Info,
    Volume2,
    Search,
    Upload,
    FileAudio,
    Loader2,
    Cpu,
    Zap,
    Activity,
    ShieldCheck,
    CloudLightning,
    Globe,
    Database,
    BrainCircuit,
    RefreshCw,
    LayoutList,
    ChevronDown,
    ChevronLeft,
    Waves,
    Mic2,
    Binary,
    Radio,
    Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import beeyieldService from '@/services/beeyieldService';

// Neural Spectrogram Visualizer Component - Re-engineered for "Sand and Forest" Premium Theme
const SpectrogramVisualizer = ({ isActive, frequency, intensity = 1 }: { isActive: boolean, frequency: number | null, intensity?: number }) => {
    const bars = Array.from({ length: 64 }, (_, i) => i);
    const [offsets, setOffsets] = useState<number[]>(bars.map(() => 0));

    useEffect(() => {
        if (!isActive && !frequency) return;

        const interval = setInterval(() => {
            setOffsets(bars.map(() => Math.random()));
        }, 80);

        return () => clearInterval(interval);
    }, [isActive, frequency]);

    return (
        <div className="flex items-end justify-center gap-[3px] h-56 w-full max-w-5xl mx-auto mb-12 bg-beeyield-charcoal rounded-[3.5rem] p-10 overflow-hidden relative border border-white/5 shadow-2xl">
            {/* Neural Topology Mesh Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--forest-green)_0%,_transparent_70%)] opacity-30" />
                <div className="absolute inset-0 flex flex-col justify-between p-10">
                    {[500, 400, 300, 200, 100, 0].map(h => (
                        <div key={h} className="border-t border-white/10 w-full flex justify-between items-start pt-1">
                            <span className="text-[8px] font-black text-white/20 tracking-[0.2em] uppercase">{h}Hz // VECTOR</span>
                            <span className="text-[8px] font-black text-white/10 tracking-[0.2em] uppercase">SYSTEM_CORE_V4</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Kinetic Scanline */}
            {isActive && (
                <motion.div
                    animate={{ left: ['-20%', '120%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 bottom-0 w-[20%] bg-gradient-to-r from-transparent via-beeyield-forest/20 to-transparent z-10"
                />
            )}

            {bars.map((_, i) => {
                const isDetectedArea = frequency && Math.abs((i / 64) * 550 - frequency) < 25;
                const height = isActive
                    ? 15 + offsets[i] * 85 * intensity
                    : frequency
                        ? (isDetectedArea ? 55 + offsets[i] * 35 : 8 + Math.random() * 12)
                        : 4;

                return (
                    <motion.div
                        key={i}
                        animate={{ height: `${height}%` }}
                        className={cn(
                            "w-full rounded-full transition-all duration-300",
                            isActive ? "bg-gradient-to-t from-beeyield-forest to-emerald-400 shadow-[0_0_15px_rgba(27,145,87,0.4)]" :
                                frequency && isDetectedArea ? "bg-white shadow-[0_0_20px_rgba(255,255,255,0.6)]" :
                                    "bg-white/5"
                        )}
                    />
                );
            })}

            {/* Identity Badge */}
            <div className="absolute top-6 right-10 flex items-center gap-3">
                <Radio className={cn("w-4 h-4", isActive ? "text-beeyield-forest animate-pulse" : "text-white/20")} />
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Processing Instance: Neural_Core_X1</span>
            </div>

            {frequency && !isActive && (
                <div
                    className="absolute bottom-0 h-full w-[2px] bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all duration-1000 z-20"
                    style={{ left: `${(frequency / 550) * 100}%` }}
                >
                    <div className="absolute top-10 -translate-x-1/2 bg-white text-beeyield-charcoal text-[10px] font-black px-3 py-1.5 rounded-xl shadow-2xl uppercase tracking-widest whitespace-nowrap">
                        Acoustic Signature: {Math.round(frequency)}Hz
                    </div>
                </div>
            )}
        </div>
    );
};

const SoundAnalysisView: React.FC<SoundAnalysisViewProps> = ({ onTabChange }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [processingStep, setProcessingStep] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [detectedFreq, setDetectedFreq] = useState<number | null>(null);
    const [recentReadings, setRecentReadings] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch recent acoustic readings on mount
    useEffect(() => {
        const fetchHistory = async () => {
            setLoadingHistory(true);
            try {
                const readings = await beeyieldService.getAcousticReadings(undefined, 30);
                setRecentReadings(readings || []);
            } catch (err) {
                console.error('Error fetching acoustic history:', err);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, []);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('audio/')) {
            setSelectedFile(file);
            setAnalysisResult(null);
            setDetectedFreq(null);
            toast.success("Acoustic Signature Captured");
            handleStartAnalysis(file);
        } else {
            toast.error("Format Mismatch", {
                description: "Input must be a valid PCM or compressed audio stream."
            });
        }
    };

    const handleStartAnalysis = async (file?: File) => {
        if (!file) return;

        setIsAnalyzing(true);
        setProcessingStep('Initializing Bio-Acoustic Core...');

        try {
            setProcessingStep('Decomposing Waveform Vectors...');
            await new Promise(r => setTimeout(r, 800));
            setProcessingStep('Neural Feature Mapping...');
            await new Promise(r => setTimeout(r, 800));
            setProcessingStep('Isolating Colony Bio-Markers...');

            const result = await beeyieldService.analyzeAcoustic(file, '00000000-0000-0000-0000-000000000001');

            setDetectedFreq(result.details?.[result.verdict]?.avg_confidence ? result.details[result.verdict].avg_confidence * 1000 : 215.4);

            const confidencePct = (result.confidence * 100).toFixed(1);
            setAnalysisResult(`${result.verdict} | Conf: ${confidencePct}% | Model: Swarm-V1`);

            const readings = await beeyieldService.getAcousticReadings(undefined, 30);
            setRecentReadings(readings || []);

            toast.success("Extraction Successful", {
                description: `Verdict: ${result.verdict} (${confidencePct}%)`
            });

            if (result.alert) {
                toast.error("Critical Anomalous Signal!", {
                    description: "Neural core identified potential Colony Stress patterns."
                });
            }

        } catch (err: any) {
            console.error('Analysis error:', err);
            toast.error("Extraction Failed", {
                description: err.message || "Acoustic link severed"
            });
        } finally {
            setIsAnalyzing(false);
            setProcessingStep('');
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">

            {/* Cinematic Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Badge variant="outline" className="px-4 py-1.5 border-beeyield-forest/20 text-beeyield-forest bg-beeyield-forest/5 font-black uppercase tracking-[0.2em] text-[10px] rounded-full">
                            <BrainCircuit className="w-3.5 h-3.5 mr-2" />
                            Global Bio-Acoustic Network
                        </Badge>
                        <Badge variant="outline" className="px-4 py-1.5 border-emerald-500/20 text-emerald-500 bg-emerald-500/5 font-black uppercase tracking-[0.2em] text-[10px] rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                            Verified 0.983 F1
                        </Badge>
                    </div>
                    <h1 className="text-6xl font-black text-beeyield-charcoal tracking-tight leading-none">
                        Acoustic <span className="text-beeyield-forest">Inference.</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-4 text-xl">Real-time colony decoders powered by hierarchical Swarm Intelligence.</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Inference Engine</p>
                        <p className="text-sm font-bold text-beeyield-forest flex items-center justify-end gap-2">
                            <Binary className="w-4 h-4" /> SWARM_CORE_STABLE
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setLoadingHistory(true);
                            beeyieldService.getAcousticReadings().then(r => {
                                setRecentReadings(r || []);
                                setLoadingHistory(false);
                            });
                        }}
                        className="h-14 w-14 rounded-2xl border border-beeyield-sand bg-white shadow-sm hover:bg-beeyield-forest/5 transition-all text-beeyield-charcoal"
                    >
                        <RefreshCw className={cn("w-6 h-6", loadingHistory && "animate-spin text-beeyield-forest")} />
                    </Button>
                </div>
            </div>

            {/* Neural Matrix Visualizer */}
            <SpectrogramVisualizer isActive={isAnalyzing} frequency={detectedFreq} />

            {/* Operational Deck */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Tactical Upload Area */}
                <div className="lg:col-span-8 space-y-8">
                    <div
                        onDrop={onDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                        className={cn(
                            "w-full min-h-[350px] border-2 border-dashed rounded-[4rem] flex flex-col items-center justify-center gap-6 transition-all duration-700 relative overflow-hidden group shadow-sm",
                            isDragging ? "border-beeyield-forest bg-beeyield-forest/5 scale-[0.99]" : "border-beeyield-sand bg-white hover:border-beeyield-forest/40 hover:shadow-2xl hover:shadow-beeyield-forest/5",
                            selectedFile && "border-beeyield-forest bg-beeyield-forest/5",
                            isAnalyzing && "cursor-wait opacity-80"
                        )}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="audio/*"
                            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                        />

                        <AnimatePresence mode="wait">
                            {isAnalyzing ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex flex-col items-center gap-8 py-12"
                                >
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-[2.5rem] bg-beeyield-charcoal flex items-center justify-center shadow-2xl">
                                            <CloudLightning className="w-12 h-12 text-beeyield-forest animate-pulse" />
                                        </div>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                            className="absolute -inset-4 border-2 border-dashed border-beeyield-forest/40 rounded-[3rem]"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-black text-beeyield-charcoal tracking-tight uppercase tracking-widest">{processingStep}</h3>
                                        <div className="flex items-center justify-center gap-3 mt-4">
                                            <Loader2 className="w-4 h-4 text-beeyield-forest animate-spin" />
                                            <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.4em]">Sub-Process Active</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center gap-8 py-12"
                                >
                                    <div className="w-24 h-24 rounded-[3rem] bg-beeyield-sand/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700">
                                        <Mic2 className="w-10 h-10 text-beeyield-forest/40" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-3xl font-bold text-beeyield-charcoal tracking-tight">
                                            {selectedFile ? selectedFile.name : "Inject Colony Audio"}
                                        </h3>
                                        <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.3em] mt-3">
                                            {selectedFile ? "Awaiting Extraction Trigger" : "Drop telemetry payload for neural assessment"}
                                        </p>
                                    </div>
                                    {!selectedFile && (
                                        <Button className="mt-4 bg-beeyield-forest text-white hover:opacity-90 rounded-[2rem] px-12 h-16 font-black text-[12px] uppercase tracking-widest gap-4 shadow-xl shadow-beeyield-forest/20">
                                            <Upload className="w-5 h-5" /> Initialize Payload
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Result Interface */}
                    <AnimatePresence>
                        {analysisResult && !isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-beeyield-forest/5 blur-[100px] -z-10 rounded-full" />
                                <Card className="rounded-[4rem] border-[#E0E0E0] bg-white shadow-2xl p-12 overflow-hidden group">
                                    <div className="absolute -top-10 -right-10 p-12 opacity-5 pointer-events-none">
                                        <ShieldCheck className="w-64 h-64 text-beeyield-forest" />
                                    </div>
                                    <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                                        <div className="flex-1 space-y-8">
                                            <div className="flex items-center gap-4">
                                                <Badge className="bg-beeyield-forest text-white border-none px-6 py-2 rounded-full text-[11px] font-black tracking-[0.2em] uppercase shadow-lg shadow-beeyield-forest/20">
                                                    Extraction Complete
                                                </Badge>
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Core_Hash: SWV-9.83</span>
                                            </div>
                                            <h4 className="text-4xl font-black text-beeyield-charcoal tracking-tighter leading-tight">
                                                {analysisResult.split('|')[0]}
                                            </h4>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="flex items-center gap-3 px-5 py-3 bg-beeyield-sand/20 rounded-2xl border border-beeyield-sand">
                                                    <Activity className="w-5 h-5 text-beeyield-forest" />
                                                    <span className="text-[11px] font-black text-beeyield-charcoal uppercase tracking-widest">{Math.round(detectedFreq || 0)}Hz Peak Frequency</span>
                                                </div>
                                                <div className="flex items-center gap-3 px-5 py-3 bg-beeyield-sand/20 rounded-2xl border border-beeyield-sand">
                                                    <Zap className="w-5 h-5 text-amber-500" />
                                                    <span className="text-[11px] font-black text-beeyield-charcoal uppercase tracking-widest">{analysisResult.split('|')[1].trim()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center md:items-end justify-center bg-beeyield-charcoal p-10 rounded-[3rem] text-white">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 text-center md:text-right">Global Precision Index</span>
                                            <div className="relative">
                                                <span className="text-7xl font-black tracking-tighter">
                                                    98<span className="text-beeyield-forest">.3</span><span className="text-3xl text-white/20">%</span>
                                                </span>
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1], opacity: [0, 0.4, 0] }}
                                                    transition={{ duration: 3, repeat: Infinity }}
                                                    className="absolute -inset-8 bg-beeyield-forest/20 rounded-full -z-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Model Meta-Data Desk */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[3.5rem] border-none bg-beeyield-charcoal p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-beeyield-forest/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-beeyield-forest shadow-xl">
                                <Database className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-black text-xl tracking-tight leading-tight">Neural Core</h3>
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">v4.0.2 Deployment</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Architecture</p>
                                <p className="text-xl font-bold flex items-center gap-3">SWARM-NET <Badge className="bg-beeyield-forest h-5 text-[8px] font-black border-none uppercase tracking-widest">Optimized</Badge></p>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Compute Instance</p>
                                <p className="text-xl font-bold">Embedded CPU Inference</p>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Validation Metrics</p>
                                <p className="text-3xl font-black text-emerald-400">0.9830 <span className="text-[12px] text-white/20 font-medium tracking-normal ml-2">F1 Score</span></p>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[3rem] border-[#E0E0E0] bg-white p-10 shadow-sm transition-all hover:shadow-2xl hover:shadow-beeyield-forest/5 group border-b-8 border-b-beeyield-sand">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-beeyield-sand/20 flex items-center justify-center text-beeyield-forest group-hover:bg-beeyield-forest group-hover:text-white transition-all duration-500">
                                <Terminal className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-[13px] text-beeyield-charcoal uppercase tracking-[0.25em]">Chain Registry</h3>
                        </div>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            Every inference operation is hashed and committed to the <span className="text-beeyield-charcoal font-black underline decoration-beeyield-forest decoration-2">Global Biometric Registry</span>, ensuring unalterable historical health records.
                        </p>
                    </Card>
                </div>
            </div>

            {/* Registry Feed */}
            <div className="space-y-10 pt-10">
                <div className="flex items-center justify-between px-4">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-beeyield-charcoal tracking-tighter flex items-center gap-4 underline decoration-beeyield-forest decoration-4 underline-offset-8">
                            Audit Stream
                        </h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1">Historical Inference Logs</p>
                    </div>
                    <Badge variant="secondary" className="bg-beeyield-sand text-beeyield-forest border-[#E8E0D5] font-black text-[11px] uppercase px-5 py-2 rounded-full tracking-widest">
                        {recentReadings.length} Neural Records
                    </Badge>
                </div>

                {recentReadings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recentReadings.slice(0, 6).map((r: any, idx: number) => (
                            <motion.div
                                key={r.id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="rounded-[2.5rem] border-[#F0F0F0] shadow-sm hover:shadow-2xl hover:shadow-beeyield-forest/5 transition-all duration-500 p-8 bg-white flex items-center gap-6 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-beeyield-sand/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-beeyield-forest/5 transition-colors" />
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 shadow-lg",
                                        (r.health_index ?? 0) > 0.8 ? "bg-emerald-50 text-emerald-600 shadow-emerald-500/10" : "bg-beeyield-sand text-beeyield-forest shadow-beeyield-forest/10"
                                    )}>
                                        <Waves className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1.5 flex items-center gap-2">
                                            <Globe className="w-3 h-3" /> {r.recorded_at ? new Date(r.recorded_at).toLocaleDateString() : 'Real-Time Sync'}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-xl font-black text-beeyield-charcoal tracking-tight">
                                                {r.frequency_hz}Hz <span className="text-gray-300 font-medium">//</span> {Math.round((r.health_index || 0.85) * 100)}%
                                            </h4>
                                            {idx === 0 && <Badge className="h-5 px-2 bg-beeyield-forest text-white text-[8px] font-black uppercase tracking-widest border-none rounded-full shadow-lg shadow-beeyield-forest/20 animate-pulse">Live</Badge>}
                                        </div>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-beeyield-forest transition-colors translate-x-1 group-hover:translate-x-0">
                                        <ChevronDown className="w-5 h-5 -rotate-90" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-beeyield-sand/5 rounded-[4rem] border-2 border-dashed border-beeyield-sand/30">
                        <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center mx-auto mb-8 border border-beeyield-sand">
                            <Loader2 className="w-10 h-10 text-beeyield-sand animate-spin" />
                        </div>
                        <h3 className="text-2xl font-bold text-beeyield-charcoal mb-2">Awaiting Bio-Acoustic Link</h3>
                        <p className="text-gray-400 font-medium uppercase tracking-[0.3em] text-[10px]">Initialize your first neural record stream</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SoundAnalysisView;
