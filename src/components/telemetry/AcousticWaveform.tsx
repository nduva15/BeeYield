import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Volume2,
    Activity,
    Zap,
    ShieldCheck,
    Mic,
    Play,
    Square,
    Waves as WaveformIcon,
    Upload,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';

const AcousticWaveform: React.FC = () => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [analysisResult, setAnalysisResult] = React.useState<any>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsAnalyzing(true);
            try {
                const result = await beeyieldService.analyzeHiveAudio({
                    file,
                    hiveId: 'HV-001'
                });
                setAnalysisResult(result);
                toast.success("Acoustic analysis complete!");
            } catch (error: any) {
                toast.error("Audio analysis failed", { description: error.message });
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    return (
        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]">
            <CardHeader className="p-6 border-b-4 border-[#064e3b]/5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <WaveformIcon className="w-5 h-5 text-[#064e3b]" />
                    <CardTitle className="text-lg font-black text-[#064e3b] uppercase tracking-tighter">Spectral Health Profile</CardTitle>
                </div>
                <Badge className="bg-[#10b981] text-white rounded-none px-3 py-1 text-[9px] font-black italic">SIGNATURE: OPTIMAL</Badge>
            </CardHeader>
            <CardContent className="p-6">
                {/* Waveform Visualization Mock */}
                <div className="h-32 w-full bg-[#064e3b] relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

                    <div className="flex items-end gap-[2px] h-16">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    height: isPlaying ? [10, 40, 20, 60, 30][i % 5] : 10
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 0.5,
                                    ease: "easeInOut",
                                    delay: i * 0.05
                                }}
                                className="w-1 bg-[#10b981]"
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="absolute bottom-4 right-4 w-10 h-10 bg-[#facc15] border-2 border-[#064e3b] flex items-center justify-center hover:bg-white transition-colors"
                    >
                        {isPlaying ? <Square className="w-4 h-4 text-[#064e3b]" /> : <Play className="w-4 h-4 text-[#064e3b] fill-[#064e3b]" />}
                    </button>

                    <div className="absolute top-2 left-4 text-[7px] font-mono text-[#10b981]/60 uppercase">
                        {analysisResult ? `Result: ${analysisResult.classification} (${Math.round(analysisResult.confidence * 100)}%)` : "Real-time Frequency Analysis: 240Hz - 480Hz Band"}
                    </div>

                    <div className="absolute top-2 right-4 flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAudioUpload}
                            className="hidden"
                            accept="audio/*"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnalyzing}
                            className="w-8 h-8 bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            {isAnalyzing ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Mic className="w-4 h-4 text-white" />}
                        </button>
                    </div>
                </div>

                {/* AI Interpretation */}
                <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-[#064e3b]/5 pb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#064e3b]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/60">Brood Cluster Density</span>
                        </div>
                        <span className="text-xs font-black text-[#064e3b]">92.4%</span>
                    </div>

                    <div className="p-4 bg-neutral-50/50 border-2 border-[#064e3b]/5">
                        <h4 className="text-[10px] font-black uppercase text-[#064e3b] mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                            Transformer Insights
                        </h4>
                        <p className="text-[9px] font-bold text-[#064e3b]/60 uppercase leading-relaxed">
                            {analysisResult
                                ? `State: ${analysisResult.classification}. Spectral energy: ${analysisResult.mel_energy}. ${analysisResult.alert_triggered ? '⚠ ALERT TRIGGERED' : 'Acoustic footprint within nominal range.'}`
                                : 'Acoustic footprint matches "Active Queen Present" state. High-frequency \'shimmer\' detected, indicating healthy forager return rate.'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AcousticWaveform;
