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
                    hiveId: undefined
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
                {/* Waveform Visualization (requires real audio stream) */}
                <div className="h-32 w-full bg-[#064e3b] relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

                    <div className="text-center px-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                            Upload audio to view analysis
                        </p>
                        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1">
                            No simulated waveform
                        </p>
                    </div>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="absolute bottom-4 right-4 w-10 h-10 bg-[#facc15] border-2 border-[#064e3b] flex items-center justify-center hover:bg-white transition-colors"
                        aria-label={isPlaying ? "Stop playback" : "Start playback"}
                        title={isPlaying ? "Stop playback" : "Start playback"}
                    >
                        {isPlaying ? <Square className="w-4 h-4 text-[#064e3b]" /> : <Play className="w-4 h-4 text-[#064e3b] fill-[#064e3b]" />}
                    </button>

                    <div className="absolute top-2 left-4 text-[7px] font-mono text-[#10b981]/60 uppercase">
                        {analysisResult ? `Result: ${analysisResult.classification} (${Math.round((analysisResult.confidence || 0) * 100)}%)` : "No audio uploaded"}
                    </div>

                    <div className="absolute top-2 right-4 flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAudioUpload}
                            className="hidden"
                            accept="audio/*"
                            aria-label="Upload audio for analysis"
                            title="Upload audio for analysis"
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

                {/* Interpretation */}
                <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-[#064e3b]/5 pb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#064e3b]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/60">Brood Cluster Density</span>
                        </div>
                        <span className="text-xs font-black text-[#064e3b]">—</span>
                    </div>

                    <div className="p-4 bg-neutral-50/50 border-2 border-[#064e3b]/5">
                        <h4 className="text-[10px] font-black uppercase text-[#064e3b] mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                            Transformer Insights
                        </h4>
                        <p className="text-[9px] font-bold text-[#064e3b]/60 uppercase leading-relaxed">
                            {analysisResult
                                ? `State: ${analysisResult.classification}. ${analysisResult.alert_triggered ? 'ALERT TRIGGERED' : 'No alert triggered.'}`
                                : 'Upload audio to generate an acoustic assessment.'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AcousticWaveform;
