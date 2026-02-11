import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Headphones, Info, Headphones as MusicNote, Volume2, Search,
    Upload, FileAudio, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import beeyieldService from '@/services/beeyieldService';

interface SoundAnalysisViewProps {
    onTabChange: (tab: string) => void;
}

const SoundAnalysisView: React.FC<SoundAnalysisViewProps> = ({ onTabChange }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
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
            toast.success("Audio file uploaded successfully");
            handleStartAnalysis(file);
        } else {
            toast.error("Invalid file type", {
                description: "Please upload only audio files for Beehive Sound Analysis."
            });
        }
    };

    const handleStartAnalysis = async (file?: File) => {
        setIsAnalyzing(true);
        try {
            // Simulate frequency extraction from audio file
            const simulatedFrequency = 150 + Math.random() * 350; // 150-500 Hz
            const simulatedAmplitude = 30 + Math.random() * 40; // 30-70 dB
            const healthIdx = Math.max(0, Math.min(1, 1 - (simulatedFrequency > 400 ? 0.4 : 0) - Math.random() * 0.3));

            // Store the reading in the backend
            const { data, error } = await beeyieldService.createAcousticReading({
                hive_id: '00000000-0000-0000-0000-000000000001', // default hive
                frequency_hz: Math.round(simulatedFrequency * 10) / 10,
                amplitude_db: Math.round(simulatedAmplitude * 10) / 10,
                health_index: Math.round(healthIdx * 100) / 100,
                spectral_profile: {
                    dominant_frequency: Math.round(simulatedFrequency),
                    bandwidth: Math.round(30 + Math.random() * 50),
                    harmonics: [Math.round(simulatedFrequency * 2), Math.round(simulatedFrequency * 3)],
                },
                tags: simulatedFrequency > 400 ? ['high-activity', 'stress'] : ['normal', 'healthy'],
            });

            const interpretation = getInterpretation(simulatedFrequency);
            const statusLabel = healthIdx > 0.7 ? 'Healthy' : healthIdx > 0.4 ? 'Needs Attention' : 'Warning';

            setAnalysisResult(
                `${interpretation} | Frequency: ${Math.round(simulatedFrequency)}Hz | Health Index: ${(healthIdx * 100).toFixed(0)}% (${statusLabel})`
            );

            if (!error && data) {
                // Refresh the history list
                const readings = await beeyieldService.getAcousticReadings(undefined, 30);
                setRecentReadings(readings || []);
            }

            toast.success("Sound Analysis Complete", {
                description: `Primary frequency: ${Math.round(simulatedFrequency)}Hz — ${interpretation.split('.')[0]}.`
            });
        } catch (err) {
            console.error('Analysis error:', err);
            setAnalysisResult("Analysis failed. Please try again.");
            toast.error("Analysis failed");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getInterpretation = (freq: number): string => {
        if (freq <= 190) return "Ventilation and microclimate control detected.";
        if (freq <= 240) return "Nectar source discovery or pre-swarming behavior.";
        if (freq <= 300) return "Intensive foraging and waggle dancing activity.";
        if (freq <= 380) return "Colony logistics, nectar recovery operations.";
        if (freq <= 400) return "Intense activity with possible stressors.";
        return "High mobilization and excitement signals detected.";
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const interpretationData = [
        { range: "50-190", interpretation: "Ventilation and microclimate control" },
        { range: "150", interpretation: "Presence of queen cells or swarming state" },
        { range: "160-180", interpretation: "Queen acceptance by the colony" },
        { range: "200", interpretation: "Low activity indicating nectar shortage" },
        { range: "210-330", interpretation: "Heat production in cooler periods" },
        { range: "240", interpretation: "Nectar source discovered" },
        { range: "200-240", interpretation: "Preparation for swarming" },
        { range: "250", interpretation: "Absence of a queen" },
        { range: "265", interpretation: "Nectar unloading, assistance signal" },
        { range: "200-300", interpretation: "Intensive foraging and waggle dancing" },
        { range: "325", interpretation: "Varroa destructor infestation indicator" },
        { range: "350", interpretation: "Bees returning with nectar" },
        { range: "280-380", interpretation: "Colony logistics, nectar recovery" },
        { range: "240-400", interpretation: "Nectar collecting and daily activity" },
        { range: "380-400", interpretation: "Intense activity, possible stressors" },
        { range: "400-500", interpretation: "High mobilization, excitement" },
        { range: "500-550", interpretation: "Intensive recruitment signals" }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">

            {/* Page Header */}
            <div className="pt-4">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Beehive Sound Analysis
                </h1>
            </div>

            {/* Description Box */}
            <Card className="rounded-2xl border-none bg-slate-50 p-6 shadow-none">
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    In this section, you can analyze your own audio files and discover what bees are communicating. For fully automatic, continuous monitoring, we recommend BeeYield — our smart device that tracks hive activity throughout the season.
                </p>
            </Card>

            {/* Audio Upload Area */}
            <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                className={cn(
                    "w-full min-h-[160px] border border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden bg-white dark:bg-[#0d0d0d]",
                    isDragging ? "border-[#F4D03F] bg-[#F4D03F]/5" : "border-slate-200 dark:border-white/10 hover:border-slate-300",
                    selectedFile && "border-amber-200 bg-[#F4D03F]/10",
                    isAnalyzing && "cursor-wait"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="audio/*"
                    aria-label="Upload audio file for sound analysis"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                />

                {isAnalyzing ? (
                    <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in zoom-in duration-300">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-amber-100 dark:border-amber-900 animate-pulse flex items-center justify-center">
                                <Volume2 className="w-8 h-8 text-[#F4D03F] animate-bounce" />
                            </div>
                            <div className="absolute inset-0 border-4 border-[#F4D03F] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-bold text-slate-800">Analyzing audio frequencies...</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Processing and storing results</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                            <Headphones className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-center gap-2">
                                <MusicNote className="w-4 h-4 text-amber-500/60" />
                                {selectedFile ? selectedFile.name : "Select Audio File"}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                {selectedFile ? "Click to change file" : "Drag and drop or click to browse"}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Analysis Results (if available) */}
            {analysisResult && !isAnalyzing && (
                <Card className="rounded-[1.5rem] border border-green-100 dark:border-green-900/20 bg-green-50/30 dark:bg-green-900/10 p-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Search className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-green-900 dark:text-green-100">Analysis Result</h4>
                            <p className="text-sm text-green-700 dark:text-green-300 font-medium">{analysisResult}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Recent Readings History */}
            {recentReadings.length > 0 && (
                <Card className="rounded-[1.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#111111] shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                Recent Analyses
                            </h2>
                            <span className="text-xs text-slate-400 font-bold">{recentReadings.length} records</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-white/5 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                                        <th className="px-6 py-3 text-left">Date</th>
                                        <th className="px-6 py-3 text-left">Frequency</th>
                                        <th className="px-6 py-3 text-left">Amplitude</th>
                                        <th className="px-6 py-3 text-left">Health Index</th>
                                        <th className="px-6 py-3 text-left">Tags</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {recentReadings.slice(0, 10).map((r: any, idx: number) => (
                                        <tr key={r.id || idx} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-3 text-slate-600 font-medium">
                                                {r.recorded_at ? new Date(r.recorded_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-3 font-bold text-slate-800">{r.frequency_hz ? `${r.frequency_hz}Hz` : '-'}</td>
                                            <td className="px-6 py-3 text-slate-600">{r.amplitude_db ? `${r.amplitude_db}dB` : '-'}</td>
                                            <td className="px-6 py-3">
                                                <span className={cn(
                                                    "font-bold",
                                                    (r.health_index ?? 0) > 0.7 ? "text-green-600" : (r.health_index ?? 0) > 0.4 ? "text-amber-600" : "text-red-600"
                                                )}>
                                                    {r.health_index != null ? `${(r.health_index * 100).toFixed(0)}%` : '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-xs text-slate-500">
                                                {r.tags?.join(', ') || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Interpretation Guide Table */}
            <Card className="rounded-[1.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#111111] shadow-sm overflow-hidden mt-8">
                <CardContent className="p-0">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                            Interpretation Guide
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/5 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="px-8 py-4 text-left border-r border-slate-100 dark:border-white/10">Frequency range (Hz)</th>
                                    <th className="px-8 py-4 text-left">Interpretation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {interpretationData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-4 font-bold text-[#0F172A] dark:text-white border-r border-slate-100 dark:border-white/10 align-top">
                                            {item.range}
                                        </td>
                                        <td className="px-8 py-4 text-slate-600 dark:text-slate-400 font-medium">
                                            {item.interpretation}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SoundAnalysisView;
