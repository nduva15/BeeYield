
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Camera, Info, Trash2, Activity, Bot,
    Search, AlertTriangle, CheckCircle, AlertOctagon
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
import { imageAnalysisService, ImageAnalysisResponse, AnalysisResults, BeeDetection } from '@/services/imageAnalysisService';

interface ImageAnalysisViewProps {
    onTabChange: (tab: string) => void;
}

const ImageAnalysisView: React.FC<ImageAnalysisViewProps> = ({ onTabChange }) => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<AnalysisResults | null>(null);
    const [annotatedImageUrl, setAnnotatedImageUrl] = useState<string | null>(null);
    const [confidenceThreshold, setConfidenceThreshold] = useState([40]);
    const [overlapThreshold, setOverlapThreshold] = useState([50]);
    const [displayMode, setDisplayMode] = useState("Label + confidence");
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
            setResults(null);
            setAnnotatedImageUrl(null);
            toast.success("Image uploaded successfully");
            // Auto-start analysis on upload? Or wait for user?
            // Existing behavior was auto-start. Let's keep it.
            handleStartAnalysis(file);
        } else {
            toast.error("Please upload a valid image file");
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setResults(null);
        setAnnotatedImageUrl(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleStartAnalysis = async (fileOverride?: File) => {
        const targetFile = fileOverride || selectedImage;
        if (!targetFile) return;

        setIsAnalyzing(true);
        setResults(null);
        setError(null);
        setAnnotatedImageUrl(null);

        try {
            const formData = new FormData();
            formData.append('image', targetFile);

            const response = await imageAnalysisService.analyzeImage(formData, {
                confidence: confidenceThreshold[0] / 100,
                overlap: overlapThreshold[0] / 100,
                analysis_type: 'full'
            });

            if (response.success) {
                setResults(response.results);
                if (response.annotated_image_url) {
                    setAnnotatedImageUrl(response.annotated_image_url);
                }

                toast.success("Analysis complete", {
                    description: `${response.results.bee_count} bees identified. Status: ${response.results.health_status}`
                });
            } else {
                throw new Error("Analysis failed");
            }
        } catch (err: any) {
            console.error("AI Error:", err);
            setError(err.message || "Analysis Offline");
            toast.error("System Error", {
                description: err.message || "Could not analyze the image. Please try again."
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Healthy': return 'text-emerald-500';
            case 'Warning': return 'text-amber-500';
            case 'Critical': return 'text-red-500';
            default: return 'text-slate-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Healthy': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'Warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'Critical': return <AlertOctagon className="w-5 h-5 text-red-500" />;
            default: return <Activity className="w-5 h-5 text-slate-500" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10 shadow-sm">
                    <Camera className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                    Image Analysis
                </h1>
            </div>

            <p className="text-sm font-medium text-slate-500 pl-1">
                Upload a photo of your hive or bees to detect potential health issues and colony status.
            </p>

            {/* Instruction Card */}
            <Card className="rounded-[2rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#111111] shadow-sm overflow-hidden mb-6">
                <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-200">
                            <Info className="w-4 h-4 text-amber-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">How it works</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 pt-2">
                        {instructions.map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="min-w-[160px]">
                                    <h4 className="text-xs font-bold text-slate-800">{item.label}</h4>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Upload Area */}
            {!previewUrl && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full min-h-[160px] border border-dashed rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer bg-white dark:bg-[#0d0d0d] border-slate-200 dark:border-white/10 hover:border-slate-300"
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
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
                            <div className="min-h-[300px] flex items-center justify-center bg-slate-50 dark:bg-white/5 relative">
                                <img
                                    src={annotatedImageUrl || previewUrl}
                                    alt="Analyzed"
                                    className="w-full h-auto object-contain max-h-[500px]"
                                />
                                {isAnalyzing && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-2xl">
                                        <Bot className="w-10 h-10 text-white animate-bounce" />
                                        <div className="text-white font-bold mt-4">Analyzing...</div>
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
                            <Card className="rounded-3xl border border-slate-100 bg-white px-10 py-8 shadow-sm max-w-sm mx-auto">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><Search className="w-4 h-4 text-blue-500" /></div>
                                        <h3 className="text-xl font-bold text-slate-800">Results</h3>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs font-bold text-slate-800">Health Score</span>
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full",
                                                    results.health_score > 80 ? "bg-emerald-500" :
                                                        results.health_score > 50 ? "bg-amber-500" : "bg-red-500"
                                                )}
                                                style={{ width: `${results.health_score}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-slate-800">{results.health_score}/100</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs font-bold text-slate-800">Confidence</span>
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${results.confidence * 100}%` }} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-800">{Math.round(results.confidence * 100)}%</span>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-6 space-y-6">
                        {isAnalyzing ? (
                            <Card className="rounded-2xl border border-slate-100 bg-white p-8 h-full flex flex-col justify-center items-center text-center space-y-8 min-h-[400px]">
                                <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 shadow-inner">
                                    <Bot className="w-10 h-10 text-amber-500 animate-bounce" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight italic">Analyzing Hive...</h3>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed max-w-[280px]">
                                        Detecting bees and analyzing health indicators.
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
                            <Card className="rounded-3xl border border-red-100 bg-red-50/10 p-8 h-full flex flex-col justify-center items-center text-center space-y-6 min-h-[400px]">
                                <Bot className="w-8 h-8 text-red-600" />
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold text-red-600 uppercase tracking-tight">Analysis Failed</h3>
                                    <p className="text-red-700/60 font-medium text-xs leading-relaxed max-w-[320px]">
                                        {error}
                                    </p>
                                </div>
                                <Button onClick={clearImage} className="rounded-xl px-8 h-12 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs">
                                    Try Different Photo
                                </Button>
                            </Card>
                        ) : results ? (
                            <Card className="rounded-[1.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#111111] p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">Analysis Report</h3>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
                                        {getStatusIcon(results.health_status)}
                                        <span className={cn("text-sm font-bold", getStatusColor(results.health_status))}>
                                            {results.health_status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                        <div className="text-2xl font-bold text-slate-800">{results.bee_count}</div>
                                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bees Counted</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                        <div className="text-2xl font-bold text-slate-800">{results.disease_indicators.length}</div>
                                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Risks Found</div>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                {results.recommendations.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-slate-800">Recommendations</h4>
                                        <ul className="space-y-2">
                                            {results.recommendations.map((rec, idx) => (
                                                <li key={idx} className="flex gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Controls */}
                                <div className="space-y-6 pt-4 border-t border-slate-100">
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
                                </div>

                                <div className="pt-4 border-t border-slate-50 dark:border-white/5">
                                    <h4 className="text-sm font-bold text-slate-800 mb-3">Detections</h4>
                                    <div className="rounded-xl border border-slate-100 dark:border-white/10 overflow-hidden max-h-[300px] overflow-y-auto">
                                        <table className="w-full text-[11px] font-medium border-collapse">
                                            <thead className="sticky top-0 bg-slate-50 dark:bg-[#111] z-10">
                                                <tr className="border-b border-slate-100 dark:border-white/10 font-bold text-slate-400 uppercase tracking-widest">
                                                    <th className="px-3 py-2 text-left">#</th>
                                                    <th className="px-3 py-2 text-left">Conf.</th>
                                                    <th className="px-3 py-2 text-left">Health</th>
                                                    <th className="px-3 py-2 text-left">Coords</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.detections.map((det: BeeDetection, idx: number) => (
                                                    <tr key={det.id} className="border-b border-slate-50 dark:border-white/5 last:border-0 text-slate-700 dark:text-slate-300">
                                                        <td className="px-3 py-2">{idx + 1}</td>
                                                        <td className="px-3 py-2">{Math.round(det.confidence * 100)}%</td>
                                                        <td className={cn("px-3 py-2 font-bold", getStatusColor(det.health || 'Unknown'))}>
                                                            {det.health || 'Unknown'}
                                                        </td>
                                                        <td className="px-3 py-2 opacity-50">[{det.bbox.x},{det.bbox.y}]</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Card>
                        ) : !isAnalyzing && (
                            <Card className="rounded-2xl border border-slate-100 bg-white p-8 h-full flex flex-col justify-center items-center text-center space-y-8 border-dashed min-h-[400px]">
                                <Bot className="w-10 h-10 text-blue-500 animate-pulse" />
                                <h3 className="text-lg font-bold text-slate-400 uppercase tracking-wider">Ready for Analysis</h3>
                                <Button onClick={() => handleStartAnalysis()} className="w-full h-14 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm uppercase shadow-lg shadow-amber-500/20">
                                    Start Process
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageAnalysisView;
