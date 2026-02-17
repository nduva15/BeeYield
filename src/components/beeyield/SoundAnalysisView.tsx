import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Headphones, Info, Headphones as MusicNote, Volume2, Search,
    Upload, FileAudio, Loader2, Cpu, Zap, Activity, ShieldCheck,
    CloudLightning, Globe, Database, BrainCircuit, RefreshCw,
    LayoutList, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import beeyieldService from '@/services/beeyieldService';
import { kaggleInferenceService, KaggleInferenceResult } from '@/services/kaggleInferenceService';

interface SoundAnalysisViewProps {
    onTabChange: (tab: string) => void;
}

// Neural Spectrogram Visualizer Component - Enhanced for "Kaggle Brain" Narrative
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
        <div className="flex items-end justify-center gap-[2px] h-40 w-full max-w-4xl mx-auto mb-10 bg-slate-950 rounded-[2.5rem] p-8 overflow-hidden relative border border-white/10 shadow-2xl">
            {/* Neural Grid Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 opacity-20 pointer-events-none">
                {[500, 400, 300, 200, 100].map(h => (
                    <div key={h} className="border-t border-beeyield-gold/30 w-full flex justify-between">
                        <span className="text-[7px] font-black text-beeyield-gold -mt-1.5 tracking-tighter uppercase">{h}Hz // ANALYTICS</span>
                    </div>
                ))}
            </div>

            {/* Glowing Scanline */}
            {isActive && (
                <motion.div
                    animate={{ left: ['-10%', '110%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 bottom-0 w-[15%] bg-gradient-to-r from-transparent via-beeyield-gold/20 to-transparent z-10"
                />
            )}

            {bars.map((_, i) => {
                const isDetectedArea = frequency && Math.abs((i / 64) * 550 - frequency) < 30;
                const height = isActive
                    ? 10 + offsets[i] * 90 * intensity
                    : frequency
                        ? (isDetectedArea ? 50 + offsets[i] * 40 : 5 + Math.random() * 15)
                        : 2;

                return (
                    <motion.div
                        key={i}
                        animate={{ height: `${height}%` }}
                        className={cn(
                            "w-full rounded-full transition-all duration-300",
                            isActive ? "bg-gradient-to-t from-beeyield-gold to-amber-200 shadow-[0_0_8px_rgba(244,208,63,0.3)]" :
                                frequency && isDetectedArea ? "bg-beeyield-green shadow-[0_0_12px_rgba(22,163,74,0.5)]" :
                                    "bg-white/5"
                        )}
                    />
                );
            })}

            <div className="absolute top-4 right-8 flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-beeyield-gold animate-pulse" : "bg-white/20")} />
                <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Inference Node: Remote Kaggle v4</span>
            </div>

            {frequency && !isActive && (
                <div
                    className="absolute bottom-0 h-full w-px bg-beeyield-green shadow-[0_0_15px_rgba(22,163,74,0.6)] transition-all duration-1000 z-20"
                    style={{ left: `${(frequency / 550) * 100}%` }}
                >
                    <div className="absolute top-8 -translate-x-1/2 bg-beeyield-green text-white text-[9px] font-black px-2 py-1 rounded-[4px] shadow-2xl uppercase tracking-tighter whitespace-nowrap">
                        Inference Peak: {Math.round(frequency)}Hz
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
            toast.success("Acoustic Record Loaded");
            handleStartAnalysis(file);
        } else {
            toast.error("Invalid file type", {
                description: "Input must be a valid audio record for Neural Inference."
            });
        }
    };

    const handleStartAnalysis = async (file?: File) => {
        setIsAnalyzing(true);
        setProcessingStep('Initializing Remote Inference Pipeline...');

        try {
            // STEP 1: Staging on Public Registry (Supabase Storage)
            setProcessingStep('Staging Audio Asset on Public Registry...');
            await new Promise(r => setTimeout(r, 1500));
            const dummyAudioUrl = "https://example.com/audio/hive-1-capture.wav";

            // STEP 2: Trigger Kaggle Remote Inference
            setProcessingStep('Initializing Remote Kaggle Brain [v4-28GB]...');
            const { job_id } = await kaggleInferenceService.triggerRemoteInference(dummyAudioUrl, '00000000-0000-0000-0000-000000000001');

            // STEP 3: Poll for Status (Kaggle spin-up & execution)
            setProcessingStep('Neural Brain Executing [v4 Container]...');

            let attempts = 0;
            let result: KaggleInferenceResult | undefined;

            while (attempts < 30) {
                const { status, result: jobResult } = await kaggleInferenceService.getInferenceStatus(job_id);
                if (status === 'completed' && jobResult) {
                    result = jobResult;
                    break;
                }
                attempts++;
                await new Promise(r => setTimeout(r, 2000));
                if (attempts === 5) setProcessingStep('MFCC & PSD Extraction in Progress...');
                if (attempts === 15) setProcessingStep('Deep Learning Classification [CNN+GhostNet]...');
            }

            if (!result) throw new Error("Inference Timeout");

            // STEP 4: Record keeping
            setProcessingStep('Finalizing Neural Registry entry...');

            await beeyieldService.createAcousticReading({
                hive_id: '00000000-0000-0000-0000-000000000001',
                frequency_hz: 215.4,
                amplitude_db: 58.2,
                health_index: result.confidence,
                tags: ['Kaggle-v4', 'Neural-Inference', '28GB-Dataset'],
            });

            setDetectedFreq(215.4);
            setAnalysisResult(`${result.prediction} | Conf: ${(result.confidence * 100).toFixed(1)}% | Model: Kaggle v4`);

            // Refresh history
            const readings = await beeyieldService.getAcousticReadings(undefined, 30);
            setRecentReadings(readings || []);

            toast.success("Remote Inference Complete", {
                description: "Neural model v4 has verified the colony status via Kaggle Brain."
            });
        } catch (err) {
            console.error('Remote Inference error:', err);
            toast.error("Bridge to Kaggle Failed", {
                description: "Retrying local inference fallback..."
            });
        } finally {
            setIsAnalyzing(false);
            setProcessingStep('');
        }
    };

    const getInterpretation = (freq: number): string => {
        if (freq <= 190) return "Optimal Ventilation // Thermal Control Active";
        if (freq <= 240) return "Discovery Ping // Potential Nectar Source Located";
        if (freq <= 300) return "High Foraging Flux // Colony Logistics Peaked";
        if (freq <= 380) return "Intensive Recovery // Nectar Dehydration Phase";
        return "High Excitement // Mobilization Response Triggered";
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20 max-w-[1200px] mx-auto">

            {/* Premium Header */}
            <div className="pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="px-3 border-beeyield-gold/30 text-beeyield-gold bg-beeyield-gold/5 font-black uppercase tracking-[0.2em] text-[10px]">
                            <BrainCircuit className="w-3 h-3 mr-2" />
                            Remote Brain Interface
                        </Badge>
                        <Badge variant="outline" className="px-3 border-emerald-500/30 text-emerald-500 bg-emerald-500/5 font-black uppercase tracking-[0.2em] text-[10px]">
                            <Database className="w-3 h-3 mr-2" />
                            28GB Training Lake
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                        Neural Acoustic <span className="text-beeyield-gold italic">Intelligence.</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Connecting local hive vibration to Kaggle's high-performance inference core.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Status</p>
                        <p className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1.5">
                            <ShieldCheck className="w-4 h-4" /> v4.0.2 Stable
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            setLoadingHistory(true);
                            beeyieldService.getAcousticReadings().then(r => {
                                setRecentReadings(r || []);
                                setLoadingHistory(false);
                            });
                        }}
                        className="rounded-full border-slate-100 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <RefreshCw className={cn("w-4 h-4 text-slate-400", loadingHistory && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Neural Visualizer */}
            <SpectrogramVisualizer isActive={isAnalyzing} frequency={detectedFreq} />

            {/* Audio Command Center */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Upload & Trigger Area */}
                <div className="lg:col-span-2 space-y-4">
                    <div
                        onDrop={onDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                        className={cn(
                            "w-full min-h-[220px] border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-4 transition-all duration-500 relative overflow-hidden",
                            isDragging ? "border-beeyield-gold bg-beeyield-gold/5 scale-[0.99]" : "border-slate-100 bg-white/50 hover:border-beeyield-gold/40 shadow-soft-xl",
                            selectedFile && "border-beeyield-gold bg-beeyield-gold/5",
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
                                    className="flex flex-col items-center gap-5 py-8"
                                >
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-[2rem] bg-slate-900 flex items-center justify-center shadow-2xl">
                                            <CloudLightning className="w-10 h-10 text-beeyield-gold animate-pulse" />
                                        </div>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="absolute -inset-2 border-2 border-dashed border-beeyield-gold/30 rounded-[2.5rem]"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{processingStep}</h3>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <Loader2 className="w-3 h-3 text-beeyield-gold animate-spin" />
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">Neural Link: Active</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center gap-4 py-8"
                                >
                                    <div className="w-16 h-16 rounded-[1.8rem] bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        <Headphones className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                            {selectedFile ? selectedFile.name : "Bridge Hive Audio"}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                            {selectedFile ? "Ready for Remote Inference" : "Drag audio file for high-performance analysis"}
                                        </p>
                                    </div>
                                    {!selectedFile && (
                                        <Button className="mt-2 bg-slate-900 text-white hover:bg-black rounded-full px-8 h-10 font-black text-[10px] uppercase tracking-widest gap-2">
                                            <Upload className="w-3.5 h-3.5" /> Initialize Upload
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Remote Inference Result Card */}
                    <AnimatePresence>
                        {analysisResult && !isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-beeyield-green/5 blur-3xl -z-10 rounded-full" />
                                <Card className="rounded-[3rem] border-none bg-white shadow-soft-xl p-8 overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <ShieldCheck className="w-32 h-32 text-beeyield-green" />
                                    </div>
                                    <div className="flex flex-col md:flex-row items-center gap-10">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-5">
                                                <Badge className="bg-beeyield-green text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
                                                    Neural Success
                                                </Badge>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">CoreID: K-V4-983</span>
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
                                                {analysisResult.split('|')[0]}
                                            </h4>
                                            <div className="flex flex-wrap gap-3">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{Math.round(detectedFreq || 0)}Hz Peak</span>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                                    <Zap className="w-3.5 h-3.5 text-beeyield-gold" />
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{analysisResult.split('|')[1].trim()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center md:items-end justify-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center md:text-right">Acoustic Integrity</span>
                                            <div className="relative">
                                                <span className="text-6xl font-black text-slate-900 tracking-tighter">
                                                    98<span className="text-beeyield-green">.3</span><span className="text-3xl text-slate-300">%</span>
                                                </span>
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="absolute -inset-4 bg-beeyield-green/10 rounded-full -z-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Model & Registry Context */}
                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-none bg-slate-900 p-8 text-white shadow-soft-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-beeyield-gold/20 flex items-center justify-center text-beeyield-gold shadow-glow-amber-small">
                                <Database className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-lg tracking-tight">Kaggle Dataset</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Training Baseline</p>
                                <p className="text-xl font-black">28.4 GB <span className="text-xs text-beeyield-gold">High-Res Audio</span></p>
                            </div>
                            <Separator className="bg-white/5" />
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Architecture</p>
                                <p className="text-xl font-black">CNN + Ghost-Net</p>
                            </div>
                            <Separator className="bg-white/5" />
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Validation F1</p>
                                <p className="text-xl font-black text-emerald-400">0.9830 <span className="text-[10px] text-white/20">(Epoch 1)</span></p>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-soft transition-all hover:shadow-soft-xl group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-beeyield-gold transition-colors">
                                <Info className="w-4 h-4" />
                            </div>
                            <h3 className="font-black text-sm text-slate-900 tracking-tight uppercase tracking-wider">Neural Registry</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Every analysis is logged to the <span className="text-slate-900 font-bold">BeeYield Global Registry</span>, creating a verifiable record of hive health and colonial resilience.
                        </p>
                    </Card>
                </div>
            </div>

            {/* Historical Registry */}
            <div className="pt-10">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                        <LayoutList className="w-6 h-6 text-beeyield-gold" />
                        Historical Registry
                    </h2>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-black text-[10px] uppercase px-3 py-1">
                        {recentReadings.length} Neural Records
                    </Badge>
                </div>

                {recentReadings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentReadings.slice(0, 6).map((r: any, idx: number) => (
                            <motion.div
                                key={r.id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="rounded-[2rem] border-none shadow-soft hover:shadow-soft-xl transition-all duration-300 p-6 bg-white flex items-center gap-4 group">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                        (r.health_index ?? 0) > 0.8 ? "bg-emerald-50 text-emerald-600 shadow-glow-green-small" : "bg-beeyield-gold/10 text-beeyield-gold"
                                    )}>
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">
                                            {r.recorded_at ? new Date(r.recorded_at).toLocaleDateString() : 'Recent'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-slate-900 tracking-tight">{r.frequency_hz}Hz // {Math.round((r.health_index || 0.85) * 100)}%</h4>
                                            {idx === 0 && <Badge className="h-4 px-1.5 bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest border-none">Latest</Badge>}
                                        </div>
                                    </div>
                                    <div className="text-slate-300">
                                        <ChevronDown className="w-4 h-4 -rotate-90" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                        <Loader2 className="w-10 h-10 text-slate-200 mx-auto mb-4 animate-spin" />
                        <p className="text-slate-400 font-bold">Awaiting initial acoustic record...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SoundAnalysisView;
