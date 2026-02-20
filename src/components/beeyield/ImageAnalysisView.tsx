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
            <div className="flex items-center gap-4 border-b-4 border-black pb-6">
                <div className="w-12 h-12 bg-black flex items-center justify-center border-2 border-black">
                    <Camera className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-5xl font-black text-black uppercase tracking-tighter">
                    Analysis
                </h1>
            </div>

            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">
                Upload photos to check for disease or pests.
            </p>

            {/* Instruction Card */}
            <div className="border-4 border-black bg-white p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-10">
                <div className="flex items-center gap-3 mb-8 border-b-2 border-black pb-4">
                    <div className="w-8 h-8 bg-black flex items-center justify-center border-2 border-black">
                        <Info className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight">Instructions</h2>
                </div>

                <div className="space-y-6">
                    <div className="space-y-1 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                        <p>Results are indicators and not a medical diagnosis.</p>
                        <p>Confidence levels indicate certainty.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-2">
                        {instructions.map((item, idx) => (
                            <div key={idx} className="flex gap-4 border-l-2 border-black pl-4">
                                <div className="min-w-[140px]">
                                    <h4 className="text-[11px] font-black text-black uppercase tracking-widest">{item.label}</h4>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-tight">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            {!previewUrl && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full min-h-[200px] border-4 border-dashed border-black flex flex-col items-center justify-center gap-3 transition-none cursor-pointer bg-white hover:bg-neutral-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
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
                    <Camera className="w-8 h-8 text-black" />
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-black text-black uppercase tracking-widest">Select Image</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">Click to browse or drop file</p>
                    </div>
                </div>
            )}

            {/* Results Section */}
            {previewUrl && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
                    <div className="lg:col-span-6 space-y-6">
                        <div className="border-4 border-black bg-white p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                            <div className="min-h-[300px] flex items-center justify-center bg-neutral-100 border-2 border-black">
                                <img src={previewUrl} alt="Analyzed" className="w-full h-full object-contain max-h-[500px]" />
                                {isAnalyzing && (
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
                                        {realtimeCount > 0 ? (
                                            <>
                                                <div className="text-8xl font-black text-[#FF4F00] drop-shadow-lg">{realtimeCount}</div>
                                                <div className="text-white font-black uppercase tracking-widest text-[10px] mt-2 bg-black px-4 py-2 border-2 border-white">Detected</div>
                                            </>
                                        ) : (
                                            <div className="w-16 h-16 border-4 border-t-[#FF4F00] border-white rounded-none animate-spin" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-start">
                            <button onClick={clearImage} className="h-10 px-8 border-2 border-black bg-white font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-100 transition-none">
                                Clear
                            </button>
                        </div>

                        {results && (
                            <div className="border-4 border-black bg-white p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b-2 border-black">
                                        <div className="w-8 h-8 bg-black flex items-center justify-center"><Search className="w-4 h-4 text-white" /></div>
                                        <h3 className="text-3xl font-black text-black uppercase tracking-tighter">Results</h3>
                                    </div>
                                    <div className="flex items-center justify-between gap-6">
                                        <span className="text-xs font-black uppercase tracking-widest">Health Score</span>
                                        <div className="flex-1 h-4 border-2 border-black bg-neutral-100 overflow-hidden">
                                            <div className="h-full bg-[#FF4F00]" style={{ width: `${results.overallConfidence}%` }} />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">{results.overallConfidence}%</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-6 space-y-6">
                        {isAnalyzing ? (
                            <div className="border-4 border-black bg-white p-12 h-full flex flex-col justify-center items-center text-center space-y-10 min-h-[400px] shadow-[8px_8px_0px_0px_rgba(255,79,0,1)]">
                                <div className="w-20 h-20 bg-black flex items-center justify-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,79,0,1)]">
                                    <Bot className="w-10 h-10 text-white" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black text-black uppercase tracking-tighter leading-tight">Processing...</h3>
                                    <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed max-w-[280px]">
                                        Identifying patterns and detecting health anomalies.
                                    </p>
                                </div>
                                <div className="w-full max-w-[240px] h-3 border-2 border-black bg-neutral-100 overflow-hidden">
                                    <div className="h-full bg-black w-1/3 animate-ping" />
                                </div>
                            </div>
                        ) : error ? (
                            <div className="border-4 border-black bg-white p-12 h-full flex flex-col justify-center items-center text-center space-y-10 min-h-[400px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <Bot className="w-12 h-12 text-black" />
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black text-black uppercase tracking-tighter">Failed</h3>
                                    <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed max-w-[320px]">
                                        Could not identify hive structures or bees. Please try a clearer photo.
                                    </p>
                                </div>
                                <button onClick={clearImage} className="h-14 px-10 border-4 border-black bg-black text-white font-black uppercase tracking-widest text-[10px] hover:bg-[#FF4F00] transition-none">
                                    Try Again
                                </button>
                            </div>
                        ) : results ? (
                            <div className="border-4 border-black bg-white p-10 space-y-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-center justify-between border-b-2 border-black pb-4">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Detection</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Total Count</span>
                                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-black font-black">
                                            {results.beesCounted}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span>Confidence</span>
                                            <span className="text-black">{confidenceThreshold}%</span>
                                        </div>
                                        <Slider value={confidenceThreshold} onValueChange={setConfidenceThreshold} max={100} step={1} />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span>Overlap</span>
                                            <span className="text-black">{overlapThreshold}%</span>
                                        </div>
                                        <Slider value={overlapThreshold} onValueChange={setOverlapThreshold} max={100} step={1} />
                                    </div>

                                    <div className="space-y-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Label Mode</span>
                                        <Select value={displayMode} onValueChange={setDisplayMode}>
                                            <SelectTrigger className="w-full h-12 rounded-none bg-white border-2 border-black text-[11px] font-bold uppercase transition-none focus:ring-0">
                                                <SelectValue placeholder="Select Mode" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none border-2 border-black">
                                                <SelectItem value="Label + confidence" className="text-[11px] font-bold uppercase">All</SelectItem>
                                                <SelectItem value="Label only" className="text-[11px] font-bold uppercase">Labels</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="pt-6 border-t-2 border-black">
                                    <div className="border-4 border-black overflow-hidden">
                                        <table className="w-full text-[10px] font-bold border-collapse">
                                            <thead>
                                                <tr className="bg-black border-b-4 border-black text-white uppercase tracking-widest text-[9px]">
                                                    <th className="px-3 py-3 text-left font-black">#</th>
                                                    <th className="px-3 py-3 text-left font-black">Conf.</th>
                                                    <th className="px-3 py-3 text-left font-black">Health</th>
                                                    <th className="px-3 py-3 text-left font-black">Coords</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y-2 divide-black">
                                                {results.detections.slice(0, 6).map((det: DetectionRecord, idx: number) => (
                                                    <tr key={det.id} className="hover:bg-neutral-50 transition-none text-black">
                                                        <td className="px-3 py-3">{idx + 1}</td>
                                                        <td className="px-3 py-3">{det.confidence}%</td>
                                                        <td className="px-3 py-3 font-black text-[#FF4F00]">{det.health}</td>
                                                        <td className="px-3 py-3 text-neutral-400">[{det.x},{det.y}]</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : !isAnalyzing && (
                            <div className="space-y-10">
                                <div className="border-4 border-black border-dashed bg-white p-12 h-auto flex flex-col justify-center items-center text-center space-y-10 min-h-[300px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="w-16 h-16 bg-black flex items-center justify-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,79,0,1)]">
                                        <Activity className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter">Ready</h3>
                                    <button onClick={() => handleStartAnalysis()} className="w-full h-20 border-4 border-black bg-black text-white font-black text-xl uppercase tracking-widest hover:bg-[#FF4F00] transition-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                                        Identify Specimen
                                    </button>
                                </div>

                                {recentDetections.length > 0 && (
                                    <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-black" />
                                                History
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            {recentDetections.slice(0, 3).map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 border-2 border-black bg-neutral-50 hover:bg-neutral-100 transition-none">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 border-2 border-black bg-neutral-200 overflow-hidden">
                                                            {item.thumbnail_url ? (
                                                                <img src={item.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-neutral-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black uppercase tracking-widest">Entry {i + 1}</p>
                                                            <p className="text-[9px] font-bold text-neutral-400 uppercase">{new Date(item.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[11px] font-black uppercase text-[#FF4F00]">{item.health_score}% SCORE</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
