import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Camera, Info, Trash2, Activity, Bot,
    Search, Clock, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { imageAnalysisService } from '@/services/imageAnalysisService';
import { glass } from './GlassTheme';
import { RefreshCw } from 'lucide-react';
import { BeeYieldCard, BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

interface ImageAnalysisViewProps {
    onTabChange: (tab: string) => void;
}

interface DetectionRecord {
    id: number;
    confidence: number; // 0..1
    health: string;
    label: string;
    bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

const ImageAnalysisView: React.FC<ImageAnalysisViewProps> = ({ onTabChange }) => {
    const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [results, setResults] = React.useState<any>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [confidenceThreshold, setConfidenceThreshold] = React.useState([40]);
    const [overlapThreshold, setOverlapThreshold] = React.useState([50]);
    const [displayMode, setDisplayMode] = React.useState("Label + confidence");
    const [error, setError] = React.useState<string | null>(null);
    const [realtimeCount, setRealtimeCount] = React.useState(0);
    const [recentDetections, setRecentDetections] = React.useState<any[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const history = await imageAnalysisService.listAnalyses({ limit: 5, offset: 0 });
        setRecentDetections(history.items || []);
    };

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
            setResults(null);
            toast.success("Image uploaded successfully");
            handleStartAnalysis(file);
        } else {
            toast.error("Please upload a valid image file");
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setResults(null);
        setError(null);
    };

    const handleStartAnalysis = async (fileOverride?: File) => {
        const targetFile = fileOverride || selectedImage;
        if (!targetFile) return;

        setIsAnalyzing(true);
        setResults(null);
        setError(null);
        setRealtimeCount(0);

        try {
            const formData = new FormData();
            formData.append('image', targetFile);

            const result = await imageAnalysisService.analyzeImage(formData, {
                confidence: confidenceThreshold[0] / 100,
                overlap: overlapThreshold[0] / 100,
                analysis_type: 'full'
            });

            if (result.success) {
                setResults({
                    ...result.results,
                    beesCounted: result.results.bee_count,
                    overallConfidence: Math.round(result.results.confidence * 100),
                    annotatedImageUrl: result.annotated_image_url
                });

                // Show the annotated image if available
                if (result.annotated_image_url) {
                    setPreviewUrl(result.annotated_image_url);
                }

                toast.success("Analysis complete", {
                    description: `${result.results.bee_count} bees identified and status verified.`
                });

                loadHistory();
            } else {
                throw new Error("Analysis failed on server");
            }
        } catch (err) {
            console.error("Analysis Error:", err);
            setError("Analysis Failed");
            const errMsg = err instanceof Error ? err.message : "Could not complete image analysis.";
            toast.error("Analysis Error", {
                description: errMsg,
                duration: 8000
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const instructions = [
        { label: 'Upload a photo', description: 'Use a clear, well-lit image of the hive/frames.' },
        { label: 'Run analysis', description: 'We’ll look for patterns that may indicate pests or stress.' },
        { label: 'Check confidence', description: 'Higher confidence usually means a clearer image.' },
        { label: 'Avoid duplicates', description: 'We try not to count the same thing twice.' },
        { label: 'Review highlights', description: 'Focus on the marked areas in the image.' },
        { label: 'Health check', description: 'This is a guide—not a medical diagnosis.' },
        { label: 'Record results', description: 'Save notes so you can compare over time.' },
        { label: 'Clear history', description: 'Remove old uploads from this session if needed.' },
    ];

    return (
        <BeeYieldPageShell>
            {/* Page Header */}
            <BeeYieldPageHeader
                icon={Camera}
                label="Optical Audit"
                title="Optical Audit"
                subtitle="High-fidelity visual diagnostics and neural specimen mapping."
                actions={
                    <div className={cn(glass.badge, "px-3 py-1.5 border-[#F4D03F]/10 bg-[#F4D03F]/5 text-[#F4D03F]")}>
                        CORE: CV_MODEL_V4
                    </div>
                }
            />

            {/* Instruction Card */}
            <BeeYieldCard className="mb-8">
                <div className="flex items-center gap-3 mb-6 border-b border-[#F4D03F]/10 pb-4">
                    <div className="w-8 h-8 bg-[#F4D03F]/10 rounded-lg flex items-center justify-center border border-[#F4D03F]/20">
                        <Info className="w-4 h-4 text-[#F4D03F]" />
                    </div>
                    <h2 className={glass.sectionTitle}>How it works</h2>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <Activity className="w-3 h-3 text-[#F4D03F]/40" />
                            <span>Guide only — not a medical diagnosis</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6 pt-2">
                        {instructions.map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-1.5 border-l-2 border-[#F4D03F]/20 pl-4 py-1">
                                <h4 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-wider">{item.label}</h4>
                                <p className={cn(glass.microLabel, "text-gray-400")}>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </BeeYieldCard>

            {/* Upload Area */}
            {!previewUrl && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(glass.card, "w-full min-h-[260px] border-dashed border-2 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#F4D03F]/40 transition-all bg-white/5 shadow-inner p-5")}
                >
                    <input
                        id="bee-image-upload"
                        name="bee-image-upload"
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        aria-label="Upload bee image"
                        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                    />
                    <div className="w-16 h-16 rounded-2xl bg-[#F4D03F]/5 flex items-center justify-center border border-[#F4D03F]/10 group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-[#F4D03F]/60" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-widest">Select Asset</h3>
                        <p className={cn(glass.microLabel, "tracking-[0.2em]")}>DROP_FILE_OR_SYNC_DEVICE</p>
                    </div>
                </div>
            )}

            {/* Results Section */}
            {previewUrl && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
                    <div className="lg:col-span-6 space-y-6">
                        <BeeYieldCard className="p-4 relative">
                            <div className="min-h-[300px] flex items-center justify-center bg-white/40 rounded-xl overflow-hidden border border-[#F4D03F]/10">
                                <img src={previewUrl} alt="Analyzed" className="w-full h-full object-contain max-h-[500px]" />
                                {isAnalyzing && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                        {realtimeCount > 0 ? (
                                            <>
                                                <div className="text-6xl font-black text-[#F4D03F] drop-shadow-sm">{realtimeCount}</div>
                                                <div className={cn(glass.badge, "mt-2")}>Detected</div>
                                            </>
                                        ) : (
                                            <RefreshCw className="w-8 h-8 text-[#F4D03F] animate-spin" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </BeeYieldCard>

                        <div className="flex justify-start">
                            <button onClick={clearImage} className={cn(glass.btnSecondary, "h-9 px-6 font-black uppercase tracking-widest text-[10px] rounded-xl")}>
                                Flush Buffer
                            </button>
                        </div>

                        {results && (
                            <BeeYieldCard>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-[#F4D03F]/10">
                                        <div className="w-8 h-8 bg-[#F4D03F]/10 rounded-lg flex items-center justify-center border border-[#F4D03F]/20"><Activity className="w-4 h-4 text-[#F4D03F]" /></div>
                                        <h3 className={glass.sectionTitle}>Signal Confidence</h3>
                                    </div>
                                    <div className="flex items-center justify-between gap-6">
                                        <Label className={glass.microLabel}>Spectral Health Index</Label>
                                        <div className="flex-1 h-2 rounded-full bg-white/40 overflow-hidden border border-white/20">
                                            <div className="h-full bg-gradient-to-r from-[#F4D03F] to-[#1B9157]" style={{ width: `${results.overallConfidence}%` }} />
                                        </div>
                                        <span className="text-[10px] font-black text-[#1A1A1A]">{results.overallConfidence}%</span>
                                    </div>
                                </div>
                            </BeeYieldCard>
                        )}
                    </div>

                    <div className="lg:col-span-6 space-y-6">
                        {isAnalyzing ? (
                            <BeeYieldCard className="h-full flex flex-col justify-center items-center text-center space-y-6 min-h-[400px]">
                                <div className="w-16 h-16 rounded-2xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20">
                                    <Bot className="w-8 h-8 text-[#F4D03F]" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className={glass.sectionTitle}>Processing...</h3>
                                    <p className={glass.microLabel}>
                                        Identifying patterns and detecting health anomalies.
                                    </p>
                                </div>
                                <div className="w-full max-w-[240px] h-1.5 rounded-full bg-white/40 overflow-hidden">
                                    <div className="h-full bg-[#F4D03F] w-1/3 animate-ping" />
                                </div>
                            </BeeYieldCard>
                        ) : error ? (
                            <BeeYieldCard className="h-full flex flex-col justify-center items-center text-center space-y-6 min-h-[400px]">
                                <div className="w-16 h-16 rounded-2xl bg-red-500/5 flex items-center justify-center border border-red-500/10">
                                    <Bot className="w-8 h-8 text-red-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className={cn(glass.sectionTitle, "text-red-500/60")}>Audit Reflected</h3>
                                    <p className={cn(glass.microLabel, "max-w-[200px]")}>
                                        Inconclusive visual data. Obfuscation detected or low-fidelity asset.
                                    </p>
                                </div>
                                <button onClick={clearImage} className={cn(glass.btnSecondary, "h-9 px-8 font-black uppercase text-[10px] rounded-xl border-red-500/20")}>
                                    Retry Sweep
                                </button>
                            </BeeYieldCard>
                        ) : results ? (
                            <BeeYieldCard className="space-y-6">
                                <div className="flex items-center justify-between border-b border-[#F4D03F]/10 pb-4">
                                    <h3 className={glass.sectionTitle}>Detection</h3>
                                    <div className="flex items-center gap-3">
                                        <span className={glass.microLabel}>Total Count</span>
                                        <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/10 text-[#F4D03F] flex items-center justify-center font-bold text-xs border border-[#F4D03F]/20">
                                            {results.beesCounted}
                                        </div>
                                    </div>
                                </div>

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className={glass.microLabel}>Confidence Threshold</Label>
                                                <span className="text-[10px] font-black text-[#1A1A1A] tabular-nums">{confidenceThreshold}%</span>
                                            </div>
                                            <Slider value={confidenceThreshold} onValueChange={setConfidenceThreshold} max={100} step={1} className="py-2" />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className={glass.microLabel}>Overlap Suppression</Label>
                                                <span className="text-[10px] font-black text-[#1A1A1A] tabular-nums">{overlapThreshold}%</span>
                                            </div>
                                            <Slider value={overlapThreshold} onValueChange={setOverlapThreshold} max={100} step={1} className="py-2" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className={glass.microLabel}>Telemetry Labels</Label>
                                            <Select value={displayMode} onValueChange={setDisplayMode}>
                                                <SelectTrigger className={cn(glass.select, "h-9 border-white/40 bg-white/50 text-[10px] font-black")}>
                                                    <SelectValue placeholder="Select Protocol" />
                                                </SelectTrigger>
                                                <SelectContent className={glass.selectContent}>
                                                    <SelectItem value="Label + confidence" className="text-[10px] font-black uppercase">Full Telemetry</SelectItem>
                                                    <SelectItem value="Label only" className="text-[10px] font-black uppercase">Class ID Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                <div className="pt-4 border-t border-[#F4D03F]/10">
                                    <div className="rounded-xl border border-white/40 overflow-hidden bg-white/20 backdrop-blur-sm shadow-sm">
                                        <table className="w-full text-[9px] font-black border-collapse">
                                            <thead>
                                                <tr className="bg-white/40 border-b border-white/40 text-gray-400 uppercase tracking-widest">
                                                    <th className="px-3 py-2.5 text-left font-black">#</th>
                                                    <th className="px-3 py-2.5 text-left font-black">CONF</th>
                                                    <th className="px-3 py-2.5 text-left font-black">CLASS</th>
                                                    <th className="px-3 py-2.5 text-left font-black">XY_MAP</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/20">
                                                {results.detections.slice(0, 6).map((det: DetectionRecord, idx: number) => (
                                                    <tr key={det.id} className="hover:bg-white/60 transition-colors text-[#1A1A1A] uppercase tracking-tighter">
                                                        <td className="px-3 py-2.5 text-gray-300">{(idx + 1).toString().padStart(2, '0')}</td>
                                                        <td className="px-3 py-2.5 tabular-nums">{Math.round((det.confidence || 0) * 100)}%</td>
                                                        <td className="px-3 py-2.5">
                                                            <span className={cn(
                                                                "px-1.5 py-0.5 rounded bg-[#F4D03F]/10 text-[#F4D03F] border border-[#F4D03F]/10",
                                                                det.health && det.health.toLowerCase() !== 'healthy' && "bg-red-500/10 text-red-500 border-red-500/10"
                                                            )}>
                                                                {det.health || det.label || 'Unknown'}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-gray-400 font-mono">[{det.bbox?.x ?? 0},{det.bbox?.y ?? 0}]</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </BeeYieldCard>
                        ) : !isAnalyzing && (
                            <div className="space-y-6">
                                <BeeYieldCard className="p-8 flex flex-col justify-center items-center text-center space-y-6 md:min-h-[250px]">
                                    <div className="w-12 h-12 rounded-2xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20">
                                        <Activity className="w-5 h-5 text-[#F4D03F]" />
                                    </div>
                                    <h3 className={glass.sectionTitle}>Scanner Standby</h3>
                                    <button onClick={() => handleStartAnalysis()} className={cn(glass.btnPrimary, "h-10 px-10 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl w-full max-w-xs")}>
                                        Identify Specimen
                                    </button>
                                </BeeYieldCard>

                                {recentDetections.length > 0 && (
                                    <BeeYieldCard>
                                        <div className="flex items-center justify-between mb-4 border-b border-[#F4D03F]/10 pb-3">
                                            <h3 className={glass.sectionTitle}>
                                                History
                                            </h3>
                                        </div>
                                        <div className="space-y-3">
                                            {recentDetections.slice(0, 3).map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/20 bg-white/40 hover:bg-white/60 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg border border-white/40 bg-white/60 overflow-hidden">
                                                            {item.thumbnail_url ? (
                                                                <img src={item.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-black/5" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase text-[#1A1A1A]">Entry {i + 1}</p>
                                                            <p className={glass.microLabel}>{new Date(item.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold uppercase text-[#F4D03F]">{item.health_score}% SCORE</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </BeeYieldCard>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </BeeYieldPageShell>
    );
};

export default ImageAnalysisView;
