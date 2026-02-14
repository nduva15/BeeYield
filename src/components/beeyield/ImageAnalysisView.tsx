import React, { useState, useRef, useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import beeyieldService from '@/services/beeyieldService';

interface ImageAnalysisViewProps {
    onTabChange: (tab: string) => void;
}

interface DetectionRecord {
    id: number;
    confidence: number;
    health: string;
    healthConf: number;
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
}

const ImageAnalysisView: React.FC<ImageAnalysisViewProps> = ({ onTabChange }) => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [confidenceThreshold, setConfidenceThreshold] = useState([40]);
    const [overlapThreshold, setOverlapThreshold] = useState([50]);
    const [displayMode, setDisplayMode] = useState("Label + confidence");
    const [error, setError] = useState<string | null>(null);
    const [realtimeCount, setRealtimeCount] = useState(0);
    const [recentDetections, setRecentDetections] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const history = await beeyieldService.getAnalysisHistory({ limit: 5 });
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
            const result = await beeyieldService.analyzeImage({
                image: targetFile,
                confidence_threshold: confidenceThreshold[0] / 100,
                overlap_threshold: overlapThreshold[0] / 100,
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
            console.error("AI Error:", err);
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
        { label: 'Upload an image', description: 'Add a hive or bee photo. Sharp focus and good light improve accuracy.' },
        { label: 'Bee detection', description: 'The model draws boxes around bees and counts them.' },
        { label: 'Confidence Threshold', description: 'Higher values reduce false detections but may miss some bees.' },
        { label: 'Overlap Threshold', description: 'Lower values merge overlapping boxes more aggressively, reducing duplicates.' },
        { label: 'Label Display Mode', description: 'Choose what to show on boxes: label, confidence, both, or none.' },
        { label: 'Disease results', description: 'Summary of health status calculated from individual bees.' },
        { label: 'Per-bee health analysis', description: 'Each detected bee is cropped and classified.' },
        { label: 'Detections table', description: 'List of boxes with confidence, health result, and coordinates.' },
        { label: 'Clear image', description: 'Removes the image and resets the results.' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10 shadow-sm">
                    <Camera className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                    Image analysis
                </h1>
            </div>

            <p className="text-[15px] font-medium text-slate-600 dark:text-slate-400 pl-1">
                Upload a photo of your hive or bees to detect potential health problems like Varroa, Nosema, and more.
            </p>

            {/* Instruction Card (Existing Design) */}
            <Card className="rounded-[2rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#111111] shadow-sm overflow-hidden mb-6">
                <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 dark:border-amber-500/20">
                            <Info className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">How to use the analysis</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <p>Results are AI indications and are not a veterinary diagnosis.</p>
                            <p>Each label is a probability estimate. Lower confidence means less certainty.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 pt-2">
                            {instructions.map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="min-w-[160px]">
                                        <h4 className="text-[13px] font-bold text-[#0F172A] dark:text-white">{item.label}</h4>
                                    </div>
                                    <div>
                                        <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Upload Area */}
            {!previewUrl && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full min-h-[160px] border border-dashed rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer bg-white dark:bg-[#0d0d0d] border-slate-200 dark:border-white/10 hover:border-slate-300"
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
                    <Camera className="w-6 h-6 text-slate-400" />
                    <div className="text-center">
                        <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Select Bee Image</h3>
                        <p className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">Click to browse or drag and drop an image</p>
                    </div>
                </div>
            )}

            {/* Results Section */}
            {previewUrl && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
                    <div className="lg:col-span-6 space-y-6">
                        <Card className="rounded-[1.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#111111] overflow-hidden group relative p-1">
                            <div className="min-h-[300px] flex items-center justify-center bg-slate-50 dark:bg-white/5">
                                <img src={previewUrl} alt="Analyzed" className="w-full h-full object-contain max-h-[500px]" />
                                {isAnalyzing && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-[1.5rem]">
                                        {realtimeCount > 0 ? (
                                            <>
                                                <div className="text-6xl font-black text-[#F4D03F] animate-pulse drop-shadow-lg">{realtimeCount}</div>
                                                <div className="text-white font-bold uppercase tracking-widest text-[10px] mt-2 bg-black/50 px-3 py-1 rounded-full border border-white/10">Bees Detected</div>
                                            </>
                                        ) : (
                                            <Bot className="w-12 h-12 text-white animate-bounce" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>

                        <div className="flex justify-center">
                            <Button variant="outline" size="sm" onClick={clearImage} className="rounded-full px-6 h-9 font-bold border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                                Clear image
                            </Button>
                        </div>

                        {results && (
                            <Card className="rounded-[2.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#111111] px-10 py-8 shadow-sm max-w-sm mx-auto">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"><Search className="w-4 h-4 text-blue-500" /></div>
                                        <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white">Results</h3>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm font-bold text-[#0F172A] dark:text-white">Healthy</span>
                                        <div className="flex-1 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#F4D03F]" style={{ width: `${results.overallConfidence}%` }} />
                                        </div>
                                        <span className="text-sm font-bold text-[#0F172A] dark:text-white">{results.overallConfidence}%</span>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-6 space-y-6">
                        {isAnalyzing ? (
                            <Card className="rounded-[1.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#111111] p-8 h-full flex flex-col justify-center items-center text-center space-y-8 min-h-[400px]">
                                <div className="w-24 h-24 rounded-[2rem] bg-amber-50 dark:bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 dark:border-amber-500/20 shadow-inner">
                                    <Bot className="w-12 h-12 text-[#F4D03F] animate-bounce" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-[#0F172A] dark:text-white uppercase tracking-tight leading-tight">Scanning specimen...</h3>
                                    <p className="text-slate-400 dark:text-slate-500 font-medium leading-relaxed max-w-[280px]">
                                        Our AI Meta-Scanner is isolating biological signatures across the hive structure.
                                    </p>
                                </div>
                                <div className="w-full max-w-[200px] h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "100%" }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        className="h-full bg-amber-500 w-1/3"
                                    />
                                </div>
                            </Card>
                        ) : error ? (
                            <Card className="rounded-[2.5rem] border border-red-100 dark:border-red-500/20 bg-red-50/30 dark:bg-red-500/5 p-8 h-full flex flex-col justify-center items-center text-center space-y-6 min-h-[400px]">
                                <Bot className="w-10 h-10 text-red-600 dark:text-red-400" />
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-red-600 dark:text-red-400 uppercase tracking-tight">Detection Failed</h3>
                                    <p className="text-red-800/60 dark:text-red-400/60 font-medium leading-relaxed max-w-[320px]">
                                        Our AI meta-scanner could not identify any honey bees or hive structures in this image.
                                        Only biological data is permitted.
                                    </p>
                                </div>
                                <Button onClick={clearImage} className="rounded-xl px-8 h-12 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs">
                                    Try Different Photo
                                </Button>
                            </Card>
                        ) : results ? (
                            <Card className="rounded-[1.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#111111] p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">Bee detection</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-slate-500">Bees detected</span>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10 font-bold">
                                            {results.beesCounted}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm font-medium">
                                            <span className="text-slate-500">Confidence Threshold</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{confidenceThreshold}%</span>
                                        </div>
                                        <Slider value={confidenceThreshold} onValueChange={setConfidenceThreshold} max={100} step={1} />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm font-medium">
                                            <span className="text-slate-500">Overlap Threshold</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{overlapThreshold}%</span>
                                        </div>
                                        <Slider value={overlapThreshold} onValueChange={setOverlapThreshold} max={100} step={1} />
                                    </div>

                                    <div className="space-y-3">
                                        <span className="text-sm font-medium text-slate-500 text-[13px]">Label Display Mode</span>
                                        <Select value={displayMode} onValueChange={setDisplayMode}>
                                            <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10">
                                                <SelectValue placeholder="Select display mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Label + confidence">Label + confidence</SelectItem>
                                                <SelectItem value="Label only">Label only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 dark:border-white/5">
                                    <div className="rounded-xl border border-slate-100 dark:border-white/10 overflow-hidden">
                                        <table className="w-full text-[11px] font-medium border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 font-bold text-slate-400 uppercase tracking-widest">
                                                    <th className="px-3 py-2 text-left">#</th>
                                                    <th className="px-3 py-2 text-left">Conf.</th>
                                                    <th className="px-3 py-2 text-left">Health</th>
                                                    <th className="px-3 py-2 text-left">Coords</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.detections.slice(0, 6).map((det: DetectionRecord, idx: number) => (
                                                    <tr key={det.id} className="border-b border-slate-50 dark:border-white/5 last:border-0 text-slate-700 dark:text-slate-300">
                                                        <td className="px-3 py-2">{idx + 1}</td>
                                                        <td className="px-3 py-2">{det.confidence}%</td>
                                                        <td className="px-3 py-2 text-emerald-500 font-bold">{det.health}</td>
                                                        <td className="px-3 py-2 opacity-50">[{det.x},{det.y}]</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Card>
                        ) : !isAnalyzing && (
                            <div className="space-y-6">
                                <Card className="rounded-[1.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#111111] p-8 h-auto flex flex-col justify-center items-center text-center space-y-8 border-dashed min-h-[300px]">
                                    <Bot className="w-12 h-12 text-blue-500 animate-pulse" />
                                    <h3 className="text-xl font-bold text-slate-500">Ready for Processing</h3>
                                    <Button onClick={() => handleStartAnalysis()} className="w-full h-16 rounded-2xl bg-[#F4D03F]/10 text-white font-black text-lg uppercase shadow-xl shadow-orange-500/20">
                                        Process Specimen
                                    </Button>
                                </Card>

                                {recentDetections.length > 0 && (
                                    <Card className="rounded-[1.5rem] border-none bg-white dark:bg-[#111111] shadow-sm p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                Recent Analysis
                                            </h3>
                                        </div>
                                        <div className="space-y-3">
                                            {recentDetections.slice(0, 3).map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden">
                                                            {item.thumbnail_url ? (
                                                                <img src={item.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-[#0F172A] dark:text-white capitalize">Bee Analysis</p>
                                                            <p className="text-[10px] text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-[#1B9157]">{item.health_score}% Health</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageAnalysisView;
